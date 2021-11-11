// Course: CS340 - Databases
// Student Name: Dave Huston
// Assignment: Project
// Description:
//require express, express-handlebars, and body-parser

var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');

//allow app to be able to accept request bodies formatted as BOTH URL encoded query strings or JSON data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))

//set port
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 6955);
app.set('mysql', mysql);

app.use('/players', require('./players.js'));

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

