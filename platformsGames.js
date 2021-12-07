module.exports = function() {

    var express = require('express');
    var router = express.Router();

    function getPlatforms(res, mysql, context, complete){
        mysql.pool.query("SELECT platformID, systemName FROM Platforms", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.platforms  = results;
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

    function getPlatformsGames(res, mysql, context, complete) {
        mysql.pool.query("SELECT platformID, gameID FROM GamesPlatforms ", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.send();
            }
            context.platformsAndGames = results;
            complete();
        })
    }

    router.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getPlatforms(res, mysql, context, complete);
        getTitles(res, mysql, context, complete);
        getPlatformsGames(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 3) {
                res.render('platformsGames', context);
            }
        }
    });

    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO GamesPlatforms (platformID, gameID) VALUES (?,?)";
        var inserts = [req.body.gamerTag, req.body.titles];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/platformsGames');
            }
        });
    });

    return router;

}();


