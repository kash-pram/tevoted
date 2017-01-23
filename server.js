var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
var fs = require('fs');
var options = {
  key: fs.readFileSync('./privatekey.pem'),
  cert: fs.readFileSync('./server.crt')
};
var mongojs = require('mongojs');

var url = 'mongodb://localhost/tevotedDB';
var db = mongojs(url);
var mycollection = db.collection('timerData');
var timerData = [];

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    next();
});

app.get("/",function(req,res){
    mycollection.find(function (err, docs) {
        res.send(docs);
    });

});

var server = https.createServer(options,app);
var httpserver = http.createServer(app);
httpserver.listen(80);
server.listen(443);

