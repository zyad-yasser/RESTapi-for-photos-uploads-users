//Require mongoose
let mongoose = require('mongoose');

//Photo schema
let PhotoSchema = mongoose.Schema({
photo_uri:{type:String,reruired:true},
photo_caption:{type:String,reruired:true},
photo_user:{type:String,reruired:true},
photo_perma:{type:String,reruired:true},
photo_likes:{type:Array,reruired:true}
});

const Photo = module.exports = mongoose.model('Photo', PhotoSchema);
