//Require mongoose
let mongoose = require('mongoose');

//Photo schema
let UserSchema = mongoose.Schema({
user_name:{type:String,reruired:true},
user_email:{type:String,reruired:true},
user_password:{type:String,reruired:true},
user_token:{type:String,reruired:true},
user_followers:{type:Array,reruired:true},
user_following:{type:Array,reruired:true},
user_photo:{type:String,reruired:true},
});

const User = module.exports = mongoose.model('User', UserSchema);
