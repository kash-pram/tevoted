var express = require('express');
var app = express();
var MongoClient = require('bluebird').promisifyAll(require('mongodb')).MongoClient;
//var cors = require('cors');
//var http = require('http').createServer(app);
var port = 80 ;

//app.use(cors);

var url = 'mongodb://localhost/tevotedDB';
var timerData = [];

/*function getData(){
MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        var cursor = db.collection('timerData').find();
        cursor.each(function(err, doc){
          if(doc !== null){
              timerData.push(doc);
          }
        });

        db.close();
    }
});
}
*/
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    next();
});

app.get("/",function(req,res){
MongoClient.connectAsync(url)
 .then(function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
	db.collection('timerData').findAsync({})
	.then(function(cursor){
		return  cursor.toArrayAsync();
	})
	.then(function(recordsArray){
		res.send(recordsArray);
	});
        db.close();
   }
 }); // then MongoClient
}); // app.get
app.listen(port);

