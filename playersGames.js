module.exports = function() {

    var express = require('express');
    var router = express.Router();

    function getGamerTags(res, mysql, context, complete){
        mysql.pool.query("SELECT playerID, gamerTag FROM Players", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.gamerTags  = results;
            complete();
        });
    }

    function getTitles(res, mysql, context, complete){
        mysql.pool.query("SELECT gameID, title FROM Games", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.titles  = results;
            complete();
        });
    }

    function getplayersGames(res, mysql, context, complete) {
        mysql.pool.query("SELECT playerID, gameID FROM PlayersGames ", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.send();
            }
            context.playersAndGames = results;
            complete();
        })
    }

    router.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getGamerTags(res, mysql, context, complete);
        getTitles(res, mysql, context, complete);
        getplayersGames(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 3) {
                res.render('playersGames', context);
            }
        }
    });

    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO PlayersGames (playerID, gameID) VALUES (?,?)";
        var inserts = [req.body.playerID, req.body.gameID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/playersGames');
            }
        });
    });

    return router;

}();


