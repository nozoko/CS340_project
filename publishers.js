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
        var mysql = req.app.get('mysql');
        context.jsscripts=["dropdownScripts.js"];
        getPublishers(req, res, mysql, context, complete);
        getGames(res, mysql, context, complete);
        getPlayers(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 3) {
                res.render('publisherEdit', context);
            }
        }
    });
    
    router.get('/delete', function (req, res, next) {
        var callbackCount = 0;
        var editID = req.query.id;
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
        context.jsscripts=["dropdownScripts.js"];
        getGames(res, mysql, context, complete);
        getPlayers(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('publisherAdd', context);
            }
        }
    });
    
    router.post('/search', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        var fakereq = {};
        fakereq.query = {};
        if (!req.body.publisherName && !req.body.headquarters) {
          res.redirect('/publishers');
        } else {
          if (req.body.publisherName) { fakereq.query.name = req.body.publisherName; }
          if (req.body.headquarters) { fakereq.query.headquarters = req.body.headquarters; }
          getPublishers(fakereq, res, mysql, context, complete);
          function complete() {
              callbackCount++;
              if (callbackCount >= 1) {
                  res.render('publishers', context);
              }
          }
        }
    });

    router.post('/add', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body);
        var sql = "INSERT INTO Publishers (publisherName, headquarters) VALUES (?,?)";
        var inserts = [req.body.publisherName, req.body.headquarters];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
              console.log(results);
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
            insertPublishersGames(req, res, newID, gamesPool[index]);
          }
          /*Create relationships between publishers and people*/
          var employeesPool = req.body.employeesInput;
          if (!Array.isArray(req.body.employeesInput)) {
            employeesPool = Array(req.body.employeesInput);
          }
          for (index in employeesPool) {
            insertPublishersPlayers(req, res, newID, employeesPool[index]);
          }
          res.redirect('/publishers');
        }
    });
    
    router.post('/edit', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE Publishers SET publisherName = ?, headquarters = ? WHERE publisherID = ?";
        var inserts = [req.body.publisherName, req.body.headquarters, req.body.publisherID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
          if(error){
              console.log(JSON.stringify(error))
              res.write(JSON.stringify(error));
              res.end();
          }else{
            console.log(results);
          }
        });
        
        /* Old code which removed all games relationships, does not work because publishers is not nullable
        /* Remove all games relationships so we can update
        var sql = "UPDATE Games SET publishers = ? WHERE gameID IN (SELECT gameID FROM Games WHERE publishers = ?)";
        var inserts = [null, req.body.publisherID];
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
        */
        
        /*Create relationships between publishers and games*/
        var gamesPool = req.body.gamesInput;
        if (!Array.isArray(req.body.gamesInput)) {
          gamesPool = Array(req.body.gamesInput);
        }
        for (index in gamesPool) {
          insertPublishersGames(req, res, req.body.publisherID, gamesPool[index]);
        }
        
        /*} End bracket for cbgames (removed)*/
        
        
        /* Remove all people relationships so we can update */
        var sql = "UPDATE Players SET employer = ? WHERE playerID IN (SELECT playerID FROM Players WHERE employer = ?)";
        var inserts = [null, req.body.publisherID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
          if(error){
              console.log(JSON.stringify(error))
              res.write(JSON.stringify(error));
              res.end();
          }else{
            console.log(results);
            cbplayers();
          }
        });
        
        function cbplayers() {
          /*Create relationships between publishers and people*/
          var employeesPool = req.body.employeesInput;
          if (!Array.isArray(req.body.employeesInput)) {
            employeesPool = Array(req.body.employeesInput);
          }
          for (index in employeesPool) {
            insertPublishersPlayers(req, res, req.body.publisherID, employeesPool[index]);
          }
        }
        res.redirect('/publishers');
    });
    
    function insertPublishersGames(req, res, publisherID, gameID) {
      var mysql = req.app.get('mysql');
      var sql = "UPDATE Games SET publishers=? WHERE gameID=?";
      var inserts = [publisherID, gameID];
      sql = mysql.pool.query(sql,inserts,function(error, results, fields){
          if(error){
              console.log(JSON.stringify(error))
              res.write(JSON.stringify(error));
              res.end();
          }
      });
    }
    
    function insertPublishersPlayers(req, res, publisherID, playerID) {
      var mysql = req.app.get('mysql');
      var sql = "UPDATE Players SET employer=? WHERE playerID=?";
      var inserts = [publisherID, playerID];
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


