//init
var http = require('http');
var port = 8080 ;
var now  = new Date();
// create server
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Hello World - this is node.js\n');
  res.write('Date on server: ' + now.toGMTString());
  res.end('\nbye!');
}).listen(port, "");
console.log('Server running at port: ' + port);
