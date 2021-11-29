module.exports = function() {

    var express = require('express');
    var router = express.Router();

    function getPublishers(res, mysql, context, complete){
        mysql.pool.query("SELECT publisherID as publisherID, publisherName FROM Publishers", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.employer  = results;
            complete();
        });
    }

    function getPlayers(res, mysql, context, complete) {
        mysql.pool.query("SELECT Players.playerID as playerID, email, firstName, lastName, gamerTag, Publishers.publisherName AS employer FROM Players " +
            "LEFT JOIN Publishers ON employer = Publishers.publisherID", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.send();
            }
            context.players = results;
            complete();
        })
    }

    function getPlayer(res, mysql, context, playerID, complete){
        var sql = "SELECT playerID as playerID, email, firstName, lastName, gamerTag, employer FROM Players WHERE playerID = ?";
        var inserts = [playerID];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.player = results[0];
            complete();
        });
    }    
    
    function getPlayerByGamertag(req, res, mysql, context, complete) {
        //sanitize the input as well as include the % character
        var query = "SELECT Players.playerID as playerID, email, firstName, lastName, gamerTag, Publishers.publisherName AS employer FROM Players " +
        "LEFT JOIN Publishers ON employer = Publishers.publisherID WHERE Players.gamerTag LIKE " + mysql.pool.escape(req.params.s + '%');
        console.log(query)

        mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.players = results;
            complete();
        });
    }
    
    //displays all players
    router.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteplayer.js","searchPlayer.js"];
        var mysql = req.app.get('mysql');
        getPlayers(res, mysql, context, complete);
        getPublishers(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('players', context);
            }
        }
    });
    
    //adds a new player
    router.post('/', function(req, res){
        console.log(req.body)
        var employer;
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Players (email, firstName, lastName, gamerTag, employer) VALUES (?,?,?,?,?)";

        if(req.body.employer === '') {
            employer = null;
        } else {
            employer = req.body.employer;
        }

        var inserts = [req.body.email, req.body.firstName, req.body.lastName, req.body.gamerTag, employer];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/players');
            }
        });
    });
    
    //search player by gamertag
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteplayer.js","searchPlayer.js"];
        var mysql = req.app.get('mysql');
        getPlayerByGamertag(req, res, mysql, context, complete);
        getPublishers(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('players', context);
            }
        }
    });
    
    //route for update player page
    router.get('/:playerID', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateplayer.js","deleteplayer.js","searchPlayer.js"];
        var mysql = req.app.get('mysql');
        getPlayer(res, mysql, context, req.params.playerID, complete);
        getPublishers(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-player', context);
            }

        }
    });

    //updates player entry
    router.put('/:playerID', function(req, res){
        var employer;
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE Players SET email=?, firstName=?, lastName=?, gamerTag=?, employer=? WHERE playerID=?";
        
        if(req.body.employer === '') {
            employer = null;
        } else {
            employer = req.body.employer;
        }
        
        var inserts = [req.body.email, req.body.firstName, req.body.lastName, req.body.gamerTag, employer, req.params.playerID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });

    //delets player from table
    router.delete('/:playerID', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Players WHERE playerID = ?";
        var inserts = [req.params.playerID];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })    
    
    return router;
    
}();


