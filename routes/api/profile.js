var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../../utils/auth');
const upload = require('../../utils/upload');
const Resize = require('../../utils/resize');
const path = require('path');

router.get('/info', auth.required, function(req, res, next){
  User.findById(req.payload.id).populate('relatives.userRef').then(async function(user){
		if(!user){ return res.sendStatus(401); }
		
    return res.json({user});
  }).catch(next);
});

router.get('/relation', auth.required, function(req, res, next){
  User.findById(req.query.id).select({ "relatives": 1, "_id": 0}).populate('relatives.userRef').then(async function(user){
		if(!user){ return res.sendStatus(401); }
		
    return res.json({user});
  }).catch(next);
});

router.put('/update', auth.required, function(req, res, next){	
	if(!req.body.user.name){
    return res.status(422).json({errors: {name: "can't be blank"}});
	}
	
	if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
	}	

  User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		user.name = req.body.user.name;
		user.email = req.body.user.email;

    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
	}).catch(next);
});

router.put('/change-password', auth.required, function(req, res, next) {
	if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
	}

	if(!req.body.user.newPassword){
    return res.status(422).json({errors: {newPassword: "can't be blank"}});
	}

	User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		if (!user.validPassword(req.body.user.password)){
			return res.status(422).json({ errors: {password: 'incorrect password'} });
		}

		user.setPassword(req.body.user.newPassword);

		return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
	}).catch(next);
})

router.post('/upload-photo', auth.required, upload.single('image'), async function(req, res) {
	const imagePath = path.join(__dirname, '../../public/images');
  const fileUpload = new Resize(imagePath);
  if (!req.file) {
    res.status(401).json({ errors: { image: 'Please provide an image' } });
  }
	const filename = await fileUpload.save(req.file.buffer);
	
	User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		user.photo = 'http://'+req.headers.host + '/images/' + filename;

		return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
	}).catch(next);
})

module.exports = router;

router.post('/upload-photo2', auth.required, upload.single('image'), async function(req, res) {
	const imagePath = path.join(__dirname, '../../public/images');
  const fileUpload = new Resize(imagePath);
  // if (!req.file) {
  //   res.status(401).json({ errors: { image: 'Please provide an image' } });
  // }
	const filename = await fileUpload.save(req.file.buffer);
	
	User.findById(req.body.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		user.photo = 'http://'+req.headers.host + '/images/' + filename;
		user.username = req.body.username;
    user.email = req.body.email;
	
		return user.save().then(function(){
      return res.json({user: user});
    });
	}).catch(next);
})

module.exports = router;
