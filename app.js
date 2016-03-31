var express = require('express');
var stylus = require('express-stylus');
var cors = require('cors');
var nib = require('nib');
var join = require('path').join;
var publicDir = join(__dirname, '/public');
var fs = require('fs');

var app = express();


app.use(stylus({
  src: publicDir,
  use: [nib()],
  import: ['nib']
}));
app.use(express.static(publicDir));
app.use(cors());
app.disable('x-powered-by');
app.set('view engine', 'jade');


app.get('/jade/:id' , function( req, res, next){
  var url   = req.protocol + '://' + req.get('host');
  var fin = ( req.query || { title: 'Hey', message: 'Hello there!'});
  fin['url'] = url;
  res.render( req.params.id , fin );
})

app.get('/', function (req, res) {
  res.send(app.get('trust proxy'));
});

app.listen(10000, function () {
  console.log('Example app listening on port 3000!');
});
