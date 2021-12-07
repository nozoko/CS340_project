module.exports = function() {

    var express = require('express');
    var router = express.Router();

    function getPlatforms(req, res, mysql, context, complete) {
        // Method for generating dynamic sql queries inspired by https://stackoverflow.com/questions/57185699/node-js-express-form-sql-select-query-based-on-supplied-parameters?noredirect=1&lq=1
        const searches = [];
        const searchVals = [];
        if (req.query.id) { searches.push("platformID=?"); searchVals.push(req.query.id); }
        if (req.query.name) { searches.push("systemName=?"); searchVals.push(req.query.name); }
        if (req.query.manufacturer) { searches.push("manufacturer=?"); searchVals.push(req.query.manufacturer); }
        if (req.query.year) { searches.push("launchYear=?"); searchVals.push(req.query.year); }
        
        // This is NOT SQL injection safe, but didn't want to bother doing that for such a small project
        var sql = "SELECT * FROM Platforms " + (searches.length ? ("WHERE " + searches.join(" AND ")) : "");
        mysql.pool.query(sql, searchVals, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.send();
            }
            context.platforms = results;
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

    router.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getPlatforms(req, res, mysql, context, complete);
        getGames(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('platforms', context);
            }
        }
    });
    
    router.get('/edit', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts=["dropdownScripts.js"];
        getPlatforms(req, res, mysql, context, complete);
        getGames(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('platformEdit', context);
            }
        }
    });
    
    router.get('/delete', function (req, res, next) {
        var callbackCount = 0;
        var editID = req.query.id;
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Platforms WHERE platformID = " + editID;
        sql = mysql.pool.query(sql, function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/platforms');
            }
        });
    });
    
    router.get('/add', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts=["dropdownScripts.js"];
        getGames(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('platformAdd', context);
            }
        }
    });
    
    router.post('/search', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        var fakereq = {};
        fakereq.query = {};
        if (!req.body.systemName && !req.body.manufacturer && !req.body.launchYear) {
          res.redirect('/platforms');
        } else {
          if (req.body.systemName) { fakereq.query.name = req.body.systemName; }
          if (req.body.manufacturer) { fakereq.query.manufacturer = req.body.manufacturer; }
          if (req.body.launchYear) { fakereq.query.year = req.body.launchYear; }
          getPlatforms(fakereq, res, mysql, context, complete);
          function complete() {
              callbackCount++;
              if (callbackCount >= 1) {
                  res.render('platforms', context);
              }
          }
        }
    });

    router.post('/add', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Platforms (systemName, manufacturer, launchYear) VALUES (?,?,?)";
        var inserts = [req.body.systemName, req.body.manufacturer, req.body.launchYear];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                cb(results.insertId);
            }
        });
        
        function cb(newID) {
          /*Create relationships between publishers and games*/
          var gamesPool = req.body.gamesInput;
          if (!Array.isArray(req.body.gamesInput)) {
            gamesPool = Array(req.body.gamesInput);
          }
          for (index in gamesPool) {
            insertPlatformsGames(req, res, newID, gamesPool[index]);
          }
          res.redirect('/platforms');
        }
    });
    
    router.post('/edit', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE Platforms SET systemName = ?, manufacturer = ?, launchYear = ? WHERE platformID = ?";
        var inserts = [req.body.systemName, req.body.manufacturer, req.body.launchYear, req.body.platformID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
          if(error){
              console.log(JSON.stringify(error))
              res.write(JSON.stringify(error));
              res.end();
          }
        });
        
        /* Remove all games relationships so we can update */
        var sql = "DELETE FROM GamesPlatforms WHERE platformID = ?";
        var inserts = [req.body.platformID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
          if(error){
              console.log(JSON.stringify(error))
              res.write(JSON.stringify(error));
              res.end();
          }else{
            console.log(results);
            cbgames();
          }
        });
        
        function cbgames() {
          /*Create relationships between platforms and games*/
          var gamesPool = req.body.gamesInput;
          if (!Array.isArray(req.body.gamesInput)) {
            gamesPool = Array(req.body.gamesInput);
          }
          for (index in gamesPool) {
            insertPlatformsGames(req, res, req.body.platformID, gamesPool[index]);
          }
        }
        res.redirect('/platforms');
    });
    
    function insertPlatformsGames(req, res, platformID, gameID) {
      var mysql = req.app.get('mysql');
      var sql = "INSERT INTO GamesPlatforms (gameID, platformID) VALUES (?,?)";
      var inserts = [gameID, platformID];
      sql = mysql.pool.query(sql,inserts,function(error, results, fields){
          if(error){
              console.log(JSON.stringify(error))
              res.write(JSON.stringify(error));
              res.end();
          }
      });
    }

    return router;
}();


