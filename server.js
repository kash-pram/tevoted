var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
var fs = require('fs');
var options = {
  key: fs.readFileSync('./privatekey.pem'),
  cert: fs.readFileSync('./crtserver.crt')
};
var mongojs = require('mongojs');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost/tevotedDB';
var db = mongojs(url);
var mycollection = db.collection('timerData');
var timerData = [];
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', 'https://tevoted.github.io');
    res.header('Access-Control-Allow-Methods', 'GET,PUT');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    next();
});

app.get("/",function(req,res){
    mycollection.find(function (err, docs) {
        res.send(docs);
    });

});

app.put("/", function(req,res){
    var mongoDoc = req.body;


    if(mongoDoc.method === "update"){
        var tmpObj = {};
        var docID = mongoDoc['_id'];
        var docName = mongoDoc.timerName;
        var docTime = mongoDoc.startTime;
        var docData = mongoDoc.pastData;
console.log('inside update');
        if(docID.length === 0){
            tmpObj = {
                timerName: docName,
                startTime: docTime,
                pastData: docData
            };
console.log('inside no ID');
        } else {
console.log('inside with ID');
            tmpObj = {
                _id: ObjectId(docID),
                timerName: docName,
                startTime: docTime,
                pastData: docData
            };
        }
    } else {
console.log('inside delte');
        var mongoDate = "pastData."+ mongoDoc.timerDate;
        var mongoName = mongoDoc.timerName;
        var _unset = {};
        _unset[mongoDate] = "";
        console.log('before update');
        mycollection.update( { timerName: mongoName }, { $unset: _unset }, function(){
            console.log('inside update');
            mycollection.find(function (err, docs) {
                console.log('inside send');
                res.send(docs);
            });
        });
        console.log('after update');
    }

    if(tmpObj != undefined){ // change condition to check object is empty
console.log('inside not undefined');
        mycollection.save(tmpObj, function(){
                mycollection.find(function (err, docs) {
                    res.send(docs);
                });
        });
    }
});


var server = https.createServer(options,app);
var httpserver = http.createServer(app);
httpserver.listen(80);
server.listen(443);
