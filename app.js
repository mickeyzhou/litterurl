var express = require('express');
var mongodb = require('mongodb');
var path = require("path");

var MongoClient = mongodb.MongoClient;
var dbUrl = 'mongodb://mickey:123456@ds145380.mlab.com:45380/freecode';
var idIndex = 2;
var app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', function(req, res){
    res.render('index');
});
app.get('/new', function(req, res){
    res.render('index');    
});

app.get('/new/*', function(req, res){
    var url = req.params[0];
    var urlExp = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
    if(url && urlExp.test(url)){
        MongoClient.connect(dbUrl, function(err,db){
           if(err) throw err;
           var urls = db.collection('urls');
           urls.insert({
               id: ++idIndex,
               url: url
           },function(err, doc){
             if(err) throw err; 
             console.log(doc);
             res.send({
                'original_url': url,
                'short_url': "http://"+req.hostname+"/"+doc.ops[0].id
             });  
           });
        });         
    }else{
        res.send('error,you url format not right');
    }
});

app.get('/:id', function(req, res){
    var id = req.params.id;
    console.log(id);
    if(/\d+/.test(id)){
         MongoClient.connect(dbUrl, function(err, db){
            if (err) throw err;
              db.collection('urls').find({
                  id: +id
              }).toArray(function(err,data){
                if(err) throw err;
                if(data[0] && data[0].url){
                    res.redirect(data[0].url);   
                }
            });
        });    
    }
});

app.listen(process.env.PORT || 8080);