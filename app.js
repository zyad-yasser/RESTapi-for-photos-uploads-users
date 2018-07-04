// Main requirements
let express = require('express');

let mongoose = require('mongoose');
// database engine

let bodyParser = require('body-parser');
// Parse incoming request bodies in a middleware before your handlers, available under the req.body property

let cors = require('cors');
// for accepting requests from other apis

let path = require('path');

let crypto = require('crypto');
// Crypto is for generating names for files

let app = express();

var formidable = require('formidable');

//Adding middleware CORS
app.use(cors());

//Adding bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'))

// Schemas and external functions
const Photo = require('./photo');
const User = require('./user');
const MD5 = require('./md5');
const makeToken = require('./token');

//connect to mongodb
const mongoURI = "mongodb://zkr:zaq1xsw2@ds139970.mlab.com:39970/photocorner";
const connect = mongoose.connect(mongoURI);

mongoose.connection.on('connected',()=>{
  console.log('Connected to database');
});
mongoose.connection.on('error',(err)=>{
  console.log('Error in connection to database : '+err);
});
//Assign our port
const port = 80;
//Running server
app.listen(port);

//---------------------------------------------------------------

// images section

//Get one image
app.get('/api/:file', (req,res)=>{
let fs = require('fs');
fs.readFile( __dirname + '/uploads/' + req.params.file , function (err, content) {
if (err) {
res.writeHead(400, {'Content-type':'text/html'})
console.log(err);
res.end("No such image"+err);
} else {
res.writeHead(200,{'Content-type':'image/jpg'});
res.end(content);
};
});
});

//Get one image
app.get('/api/user.png', (req,res)=>{
let fs = require('fs');
fs.readFile( __dirname + '/uploads/user.png', function (err, content) {
if (err) {
res.writeHead(400, {'Content-type':'text/html'})
console.log(err);
res.end("No such image"+err);
} else {
res.writeHead(200,{'Content-type':'image/jpg'});
res.end(content);
};
});
});

// Upload profile photo
app.post('/uploadpp', function (req, res){
    var form = new formidable.IncomingForm();
    let genName = makeToken(80);
    form.parse(req, function(err, fields, files) {
    let fileExt = files.file.name.split('.').pop();
    });
    // function to make sure of file type
    form.onPart = function (part) {
    // Only accepted image file
    if(!part.filename || part.filename.match(/\.(jpg|jpeg|png)$/i)) {
        this.handlePart(part);
    }
    else {
         res.json({msg:"fail"});
    }
}

form.on('fileBegin', function (name, file){
    let fileExt = file.name.split('.').pop();
    file.path = (__dirname + '/uploads/' + genName + "." + fileExt);

// Make sure that file has uploaded
// form.on('file', function (name, file){ });

// Send rest of data to database ( On Photo schema )

//res.render('index');
res.json({token:(genName + "." + fileExt)})

});
});

// Set photo as profile
app.post('/uploadMiscpp', function (req, res){
  setTimeout(function(){
      User.findOneAndUpdate({user_token:req.body.userToken}, {user_photo:req.body.photo}, {upsert:true}, function(err, doc){
          if (err) return res.send(500, { error: err });
          return res.send("succesfully saved");
      });
},1000)
});

// Upload images
app.post('/upload', function (req, res){
    var form = new formidable.IncomingForm();
    let genName = makeToken(80);
    form.parse(req, function(err, fields, files) {
    let fileExt = files.file.name.split('.').pop();
    });
    // function to make sure of file type
    form.onPart = function (part) {
    // Only accepted image file
    if(!part.filename || part.filename.match(/\.(jpg|jpeg|png)$/i)) {
        this.handlePart(part);
    }
    else {
         res.json({msg:"fail"});
    }
}

form.on('fileBegin', function (name, file){
    let fileExt = file.name.split('.').pop();
    file.path = (__dirname + '/uploads/' + genName + "." + fileExt);

// Make sure that file has uploaded
// form.on('file', function (name, file){ });

// Send rest of data to database ( On Photo schema )

//res.render('index');
res.json({token:(genName + "." + fileExt)})

});
});

// Upload misc info of photo
app.post('/uploadMisc', function (req, res){
  setTimeout(function(){
let newPhoto = new Photo({
          photo_uri:(req.body.photoToken),
          photo_caption:req.body.photoCap,
          photo_user:req.body.photoUser,
          photo_perma:req.body.photoPerm,
          photo_likes:[]
});
newPhoto.save((err, uploads)=>{
  if(err){ res.json({msg:"fail"}); }
  else{ res.json({msg:'SUCCESS'}); }
});
},1000)
});

// Get all images for home user
app.get('/home/:user',(req,res)=>{
  Photo.find({photo_user:req.params.user},(err,result)=>{
    if(err){res.json({msg:"fail"})} else {
    res.json(result)
  }
})
})

// Get specific image
app.get('/image/:img',(req,res)=>{
  Photo.find({photo_uri:req.params.img},(err,result)=>{
    if(err){res.json({msg:"fail"})} else {
    res.json(result)
  }
})
})


//Like image
app.post('/liker',(req,res)=>{
  Photo.findOneAndUpdate({photo_uri:req.body.photo}, {photo_likes:req.body.likes}, {upsert:false}, function(err, doc){
      if (err) return res.send(500, { error: err });
      return res.send("succesfully saved");
  });
})

// Get all images for home user
app.get('/uploads',(req,res)=>{
  Photo.find((err,uploads)=>{
    if(err){res.json(err)}
    res.json(uploads)
  })
})

//---------------------------------------------------------------

// Users section

//Add user
app.post('/user',(req,res,next)=>{
  setTimeout(function(){
  console.log("User register request !");
  let genToken = makeToken(40);
  let newUser = new User({
    user_name: req.body.regName,
    user_email: req.body.regEmail,
    user_password: MD5(req.body.regPass),
    user_token: genToken,
    user_followers:[],
    user_following:[],
    user_photo:''
  });
  var ck_email = ( /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ )
  if (req.body.regName === '' || req.body.regEmail ==='' || req.body.regPass ===''){
    res.json({msg:"Empty feilds !!"})
  }else {
  if (!ck_email.test(req.body.regEmail)) {
      res.json({msg:"Not a valid email"})
    }else {
  newUser.save((err, users)=>{
    if(err){res.json({msg:err});}
    else{res.json({msg:'SUCCESS'});}
  });
};
};
},2000);
});

//login process
app.post('/login',(req,res)=>{
  setTimeout(function(){
  console.log("User login request !");
  User.findOne({user_password:MD5(req.body.regPass),user_email:req.body.loginEmail},(err,result)=>{
    if(err){res.json(err)} else {
    res.json(result)
  }
}).select({'user_name':"",'user_token':"", 'user_followers':"", 'user_following':"", 'user_photo':""})
},1000);
})

//get user
app.get('/user/:user',(req,res)=>{
  User.findOne({user_token: req.params.user},(err,uploads)=>{
    if(err){res.json(err)}
    res.json(uploads)
  }).select({'user_name':"",'user_token':"", 'user_followers':"", 'user_following':""})
})

//get all user
app.get('/users',(req,res)=>{
  User.find((err,uploads)=>{
    if(err){res.json(err)}
    res.json(uploads)
  })
})

// Follow request
//Like image
app.post('/follow',(req,res)=>{
  console.log(req.body.toFollow)
  User.findOne({user_token:req.body.toFollow},(err,data)=>{
    if(err){res.json({"msg":"fail"})}else {
    res.json(data)}
  }).select({'user_followers':"", 'user_following':""})
})

app.post('/followmisc',(req,res)=>{
  User.findOneAndUpdate({user_token:req.body.toFollow}, {user_followers:req.body.followersNew}, {upsert:false}, function(err, doc){
      if (err) return res.send(500, { error: err });
      return res.send("succesfully saved");
  });
})
