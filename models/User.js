var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  name: String,
  photo: String,
  relatives: [{ 
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relationship: { type: String }
  }],
  hash: String,
  salt: String,
  confirmCode: String
}, {
	timestamps: true,
	usePushEach: true
});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

UserSchema.methods.toAuthJSON = function(){
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT()
  };
};

UserSchema.methods.hasRelationship = function(id) {
	for(var i in this.relatives) {
		if (this.relatives[i].userRef == id) return true;
	}
	return false;
}

UserSchema.methods.linkToRelative = async function(id, relationship){
  if(!this.hasRelationship(id)){
		this.relatives = this.relatives.concat([{ userRef: id, relationship }]);
  }

  return await this.save();
};

UserSchema.methods.unlinkToRelative = function(id){
  for(var i in this.relatives) {
    if (this.relatives[i].userRef == id) 
      this.relatives.pull({ _id: this.relatives[i]._id});
	}
  return this.save();
};

mongoose.model('User', UserSchema);
