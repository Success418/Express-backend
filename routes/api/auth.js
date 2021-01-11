var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../../utils/auth');

router.post('/login', function(req, res, next){

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/signup', function(req, res, next){
  var user = new User();

  user.name = req.body.user.name;
  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);
  user.photo = '';

  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

router.post('/forgot-password', function(req, res, next) {  
  User.findOne({email: req.body.email}).then(function(user) {
    if (!user) { 
      return res.status(404).json({ errors: { email: 'email does not exist.' } }); 
    }

    user.confirmCode = Math.floor(1000 + Math.random() * 9000);
    user.save();
    return res.json({ confirmCode: user.confirmCode });
  })
})

router.post('/check-confirm-code', function(req, res, next) {  
  User.findOne({email: req.body.email}).then(function(user) {
    if (!user) { 
      return res.status(404).json({ errors: { email: 'email does not exist.' } }); 
		}
		
		if (user.confirmCode != req.body.confirmCode) {
			return res.status(422).json({ errors: { confirmCode: 'confirm code is incorrect.'}});
		}

		return res.json({ user: user.toAuthJSON() });
	})
})

router.post('/reset-password', function(req, res, next) {
	User.findOne({email: req.body.email}).then(function(user) {
    if (!user) { 
      return res.status(404).json({ errors: { email: 'email does not exist.' } }); 
		}

		user.setPassword(req.body.password);

		user.save().then(function(){
			return res.json({user: user.toAuthJSON()});
		}).catch(next);
	});
})

module.exports = router;
