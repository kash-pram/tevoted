var express = require('express');
var app = express();
var Promise = require('bluebird');
//var MongoClient = Promise.promisifyAll(require('mongodb')).MongoClient;
var port = 80 ;

var Server = require("mongo-sync").Server;
var uri = "mongodb://localhost/";
var server = new Server(uri);

//var url = 'mongodb://localhost/tevotedDB';
var timerData = [];

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    next();
});

app.get("/",function(req,res){
    var result = server.db("tevotedDB").getCollection("timerData").find().toArray();
    timerData.push(result);
    res.send(timerData);
    //res.send(result);
    //res.send(JSON.stringify(result));
    //res.send(JSON.stringify(timerData));


    // server.close(); TO CLOSE IS MUST


    /*MongoClient.connectAsync(url)
        .then(function(db){
            return db.collection('timerData').findAsync({})
        })
        .then(function(cursor){
            return cursor.toArrayAsync();
        })
        .then(function(content){
            res.status(200).json(content);
        })
        .catch(function(err) {
            throw err;
        })
        .finally(){
            db.close();
        }*/

});

app.listen(port);

