var express = require('express');
var https = require('https');
var http = require('http');
var mongojs = require('mongojs');
var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');

var fs = require('fs');
 var options = {
   key: fs.readFileSync('./privatekey.pem'),
   cert: fs.readFileSync('./crtserver.crt')
};

var app = express();
var url = 'mongodb://localhost/tevotedDB';
var db = mongojs(url);
var mycollection = db.collection('timerData');
var timerData = [];

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
        // TO UPDATE UPON STOP CLICK
        var tmpObj = {};
        var docID = mongoDoc['_id'];
        var docName = mongoDoc.timerName;
        var docTime = mongoDoc.startTime;
        var docData = mongoDoc.pastData;

        if(docID.length === 0){
            tmpObj = {
                timerName: docName,
                startTime: docTime,
                pastData: docData
            };
        } else {
            tmpObj = {
                _id: ObjectId(docID),
                timerName: docName,
                startTime: docTime,
                pastData: docData
            };
        }

        mycollection.save(tmpObj, function(){
            mycollection.find(function (err, docs) {
                res.send(docs);
            });
        });
    } else {
        // TO DELETE A TIMER PASTDATA ENTRY
        var mongoDate = "pastData."+ mongoDoc.timerDate;
        var mongoName = mongoDoc.timerName;
        var _unset = {};
        _unset[mongoDate] = "";
        mycollection.update( { timerName: mongoName }, { $unset: _unset }, function(){
            console.log(mycollection.find( {$and: [{ pastData: {}}, {startTime: ""} ] } ));
            mycollection.remove( {$and: [{ pastData: {}}, {startTime: ""} ] } );
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
