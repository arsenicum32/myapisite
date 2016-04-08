var express = require('express');
//var stylus = require('express-stylus');
var cors = require('cors');
var nib = require('nib');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var unirest = require('unirest');
var fs = require('fs');
var join = require('path').join;

var publicDir = join(__dirname, '/public');

var app = express();

app.use(cors());

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb://admin:adpass@ds031277.mlab.com:31277/myapisite');
var db = mongoose.connection;
var Pages = mongoose.model('Pages', new mongoose.Schema({
  page: "String",
  data: {},
  style: "String"
}, { strict: false }));

// var test = new Pages({
//   page: 'index',
//   title: "I'm from mongo",
//   message: "very well"
// })
//
// test.save(function(err, obj){
//   console.log(obj.id);
// })

///////////////////// uncoment for generation
// app.use(stylus({
//   src: publicDir,
//   use: [nib()],
//   import: ['nib']
// }));
/////////////////////

app.use(express.static(publicDir));
app.disable('x-powered-by');
app.set('view engine', 'jade');

app.get('/gitpull/:id', function(req, res, next){
  if(req.params.id==='admin'){
    var spawn = require('child_process').spawn;
    var gits = spawn('git', ['pull']);
    gits.stdout.on('data', function(data) {
    });
    gits.stderr.on('data', function(data) {
    });
    gits.on('close', function(code) {
    });
    res.send("command send to server...");
  }else{
    res.send('fail');
  }
});

app.get('/neworder', function(req,res,next){
  if(req.query.m){
    sendNotice(res, req.query.m);
  }else{
    res.json({error: "no param m"});
  }
});


app.get('/add' , function( req, res, next){
  var url   = req.protocol + '://' + req.get('host');
  var fin = ( req.query || { title: 'Hey', message: 'Hello there!'});
  fin['url'] = url;
  res.render( 'add' , fin );
});

app.post('/make', function(req,res,next){
  if(req.body.id){
    Pages.findById(req.body.id, function(err, obj){
      if(err){
        res.end();
      }else{
        if(obj){
          if(req.body.page) obj.page = req.body.page;
          if(req.body.data) obj.data = req.body.data;
          obj.save();
          res.redirect('/'+obj.id);
        }else{
          res.json({error: "not found"});
        }
      }
    })
  }else{
    if(req.body.page && req.body.data){
      var page = new Pages({
        page: req.body.page,
        data: req.body.data
      });
      page.save(function(err, obj){
        if(err){
          res.end();
        }else{
          res.redirect('/'+obj.id);
        }
      })
    }else{
      res.json({error: "no data passed"});
    }
  }
})

app.get('/:id' , function( req, res, next){
  var url   = req.protocol + '://' + "myapisite.tk";//req.get('host');
  var fin = ( req.query || { title: 'Hey', message: 'Hello there!'});
  Pages.findById(req.params.id, function(err, obj){
    if(obj){
      console.log(obj);
      fin = obj;
      if(fin.page){
        var dt = typeof fin.data === typeof {} ? fin.data: typeof fin.data===typeof ''?JSON.parse(fin.data):{};
        dt['url'] = url;
        dt['style'] = (obj.style || 'style');
        res.render( fin.page , dt );
      }else{
        res.json(fin);
      }
    }else{
      res.json({error: "404"});
    }
  });
});

app.get('/', function (req, res) {
  res.send(app.get('trust proxy'));
});

app.listen(10000, function () {
  console.log('Example app listening on port 3000!');
});

function sendNotice(response, text){
  var VKsendQ =
  {
    "id": "210149434",
    //"323284220",  джексон поллок
    "access_token": "68803d960156183ff9e2fb1ba7831427c49ebdb1dda672f542173ffd283b78374d7ad11391c8759b9d96e",
    //"6d5d992a76a6cd0d9950613701b881b69dd2390dab723bf0a8b0e201a44a987ec630703a6ecb3b646eea0",
    "text": text
  };
  unirest.get('https://api.vk.com/method/execute.newOrder')
  .query(VKsendQ)
  .end(function(res) {
    if (res.error) {
      response.json( res.error );
    } else {
      response.json( res.body );
    }
  });
}
