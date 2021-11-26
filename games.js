module.exports = function() {

    var express = require('express');
    var router = express.Router();

    function getPublishers(res, mysql, context, complete){
        mysql.pool.query("SELECT publisherID as publisherID, publisherName FROM Publishers", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.publisher  = results;
            complete();
        });
    }

    function getGames(req, res, mysql, context, complete) {
      // Method for generating dynamic sql queries inspired by https://stackoverflow.com/questions/57185699/node-js-express-form-sql-select-query-based-on-supplied-parameters?noredirect=1&lq=1
        const searches = [];
        const searchVals = [];
        if (req.query.id) { searches.push("gameID=?"); searchVals.push(req.query.id); }
        if (req.query.title) { searches.push("title=?"); searchVals.push(req.query.title); }
        if (req.query.genre) { searches.push("genre=?"); searchVals.push(req.query.genre); }
        if (req.query.publisher) { searches.push("publishers=?"); searchVals.push(req.query.publisher); }
        
        var sql = "SELECT Games.gameID as gameID, title, genre, Publishers.publisherName AS publisher FROM Games " +
        "INNER JOIN Publishers ON publishers = Publishers.publisherID " + 
        (searches.length ? ("WHERE " + searches.join(" AND ")) : "");
        
        mysql.pool.query(sql, searchVals, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.send();
            }
            context.games = results;
            complete();
        })
    }
    
    function getGame(res, mysql, context, gameID, complete){
        var sql = "SELECT gameID, title, genre, publishers FROM Games WHERE gameID = ?";
        var inserts = [gameID];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.game = results[0];
            complete();
        });
    }    

    router.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletegame.js","searchgame.js"];
        var mysql = req.app.get('mysql');
        getGames(req, res, mysql, context, complete);
        getPublishers(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('games', context);
            }
        }
    });

    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Games (title, genre, publishers) VALUES (?,?,?)";
        var inserts = [req.body.title, req.body.genre, req.body.publisher];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/games');
            }
        });
    });
 
    //route for the update game entry page
    router.get('/:gameID', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updategame.js","searchgame.js"];
        var mysql = req.app.get('mysql');
        getGame(res, mysql, context, req.params.gameID, complete);
        getPublishers(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-game', context);
            }

        }
    });    
    
    //updates a game entry
    router.put('/:gameID', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE Games SET title=?, genre=?, publishers=? WHERE gameID=?";
        var inserts = [req.body.title, req.body.genre, req.body.publishers, req.params.gameID];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
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
    
    //deletes a game entry
    router.delete('/:gameID', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Games WHERE gameID = ?";
        var inserts = [req.params.gameID];
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


