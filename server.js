var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost/tevotedDB';
var timerData = [];
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
     var cursor = db.collection('timerData').find();
     cursor.each(function(err, doc){
	if(doc !== null){
	  timerData.push(doc);
console.log(timerData);
console.log(timerData.length);
	}
     });
    db.close();
  }
});

console.log(timerData);
