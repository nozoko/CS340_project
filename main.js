// Course: CS340 - Databases
// Student Name: Dave Huston
// Assignment: Project
// Description:
//require express, express-handlebars, and body-parser

var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', 7069);
app.set('mysql', mysql);
app.use('/players', require('./players.js'));
app.use('/games', require('./games.js'));
app.use('/playersGames', require('./playersGames.js'));
app.use('/platformsGames', require('./platformsGames.js'));
app.use('/platforms', require('./platforms.js'));
app.use('/publishers', require('./publishers.js'));
app.use('/', express.static('public'));

app.get('/',function(req,res){
    res.render('homepage.handlebars');
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

