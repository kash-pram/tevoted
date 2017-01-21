var express        = require('express');  
var morgan         = require('morgan');  
var bodyParser     = require('body-parser');  
var methodOverride = require('method-override');  
var app            = express();  
var router         = express.Router();

app.set('port', process.env.PORT || 3000);
app.route('/')  
    .get(function (req, res) {
      res.send('hello');
    });
app.listen(app.get('port'), function () {  
  console.log('Express up and listening on port ' + app.get('port'));
});
