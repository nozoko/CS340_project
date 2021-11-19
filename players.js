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

    router.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["searchPlayer.js"];
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

    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Players (email, firstName, lastName, gamerTag, employer) VALUES (?,?,?,?,?)";
        var inserts = [req.body.email, req.body.firstName, req.body.lastName, req.body.gamerTag, req.body.employer]];
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

    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["searchPlayer.js"];
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

    return router;
}();


