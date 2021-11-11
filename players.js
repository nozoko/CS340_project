module.exports = function(){

    var express = require('express');
    var router = express.Router();
/*
    app.get('/reset-table', (req, res, next) => {
        mysql.pool.query("DROP TABLE IF EXISTS Players", function(err){
            if(err) {
                next(err);
                return;
            }
            var createString = "CREATE TABLE Players("+
                "playerID int NOT NULL AUTO_INCREMENT,"+
                "name VARCHAR(255) NOT NULL,"+
                "reps INT,"+
                "weight INT,"+
                "date DATE,"+
                "lbs BOOLEAN)";
            mysql.pool.query(createString, function(err){
                if(err) {
                    next(err);
                    return;
                }
                mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
                    if(err){
                        next(err);
                        return;
                    }
                    res.send(rows);
                });
            });
        });
    });
*/
    function getPlayers(res, mysql, context, complete){
        mysql.pool.query("SELECT * FROM Players", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.send();
            }
            context.players = results;
            complete();
        })
    }

    router.get('/',function(req,res,next){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getPlayers(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >=2){
                res.render('players',context);
            }
        }
    });


    app.use(function(req,res){
        res.status(404);
        res.render('404');
    });

    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.type('plain/text');
        res.status(500);
        res.render('500');
    });

    app.listen(app.get('port'), function(){
        console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
    });

}


