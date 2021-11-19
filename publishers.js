module.exports = function() {

    var express = require('express');
    var router = express.Router();

    function getPublishers(req, res, mysql, context, complete) {
        // Method for generating dynamic sql queries inspired by https://stackoverflow.com/questions/57185699/node-js-express-form-sql-select-query-based-on-supplied-parameters?noredirect=1&lq=1
        const searches = [];
        const searchVals = [];
        if (req.query.id) { searches.push("publisherID=?"); searchVals.push(req.query.id); }
        if (req.query.name) { searches.push("publisherName=?"); searchVals.push(req.query.name); }
        if (req.query.headquarters) { searches.push("headquarters=?"); searchVals.push(req.query.headquarters); }
        
        var sql = "SELECT * FROM Publishers " + (searches.length ? ("WHERE " + searches.join(" AND ")) : "");
        mysql.pool.query(sql, searchVals, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.send();
            }
            context.publishers = results;
            complete();
        })
    }
    
    function getGames(res, mysql, context, complete) {
        mysql.pool.query("SELECT gameID, title FROM Games", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.send();
            }
            context.games = results;
            complete();
        })
    }

    function getPlayers(res, mysql, context, complete) {
        mysql.pool.query("SELECT playerID, firstName, lastName FROM Players", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.send();
            }
            context.players = results;
            complete();
        })
    }

    router.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getPublishers(req, res, mysql, context, complete);
        getGames(res, mysql, context, complete);
        getPlayers(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 3) {
                res.render('publishers', context);
            }
        }
    });
    
    router.get('/edit', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var editID = req.query.publisher;
        var mysql = req.app.get('mysql');
        res.render('publisherEdit', context);
        getPublishers(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('publisherEdit', context);
            }
        }
    });
    
    router.get('/delete', function (req, res, next) {
        var callbackCount = 0;
        var editID = req.query.publisher;
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Publishers WHERE publisherID = " + editID;
        sql = mysql.pool.query(sql, function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/publishers');
            }
        });
    });
    
    router.get('/add', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getGames(res, mysql, context, complete);
        getPlayers(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('publisherAdd', context);
            }
        }
    });

    router.post('/add', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Publishers (publisherName, headquarters) VALUES (?,?)";
        var inserts = [req.body.publisherName, req.body.headquarters];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/publishers');
            }
        });
    });

    return router;
}();


