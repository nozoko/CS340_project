module.exports = function() {

    var express = require('express');
    var router = express.Router();

    function getplayersGames(res, mysql, context, complete) {
        mysql.pool.query("SELECT playerID, gameID FROM playersGames ", function (error, results, fields) {
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
        getplayersGames(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('playersGames', context);
            }
        }
    });

    return router;
}();


