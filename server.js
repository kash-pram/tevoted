var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost/tevotedDB';

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
     var cursor = db.collection('timerData').find();
     cursor.each(function(err, doc){
        console.log(doc);
     });
    db.close();
  }
});
