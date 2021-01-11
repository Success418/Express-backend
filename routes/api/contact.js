var mongoose = require('mongoose');
var router = require('express').Router();
var User = mongoose.model('User');
var auth = require('../../utils/auth');

router.get('/get-contacts', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).populate('relatives.userRef').then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var relatives = [];
	for(var i  in myUser.relatives) {
		var relative = myUser.relatives[i];
		relative._doc['isContacted'] = relative.userRef.hasRelationship(req.payload.id);
		relatives.push(relative);
	}

	res.json({ contacts: relatives });

})

router.get('/search/username/:username', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var tUser = await User.findOne({ username: req.params.username }).then(function(user) {
		if(!user){ return res.status(422).json({ errors: {username: 'does not exist.'} }); }

		if (user.id == myUser.id) {
			return res.status(422).json({ errors: {username: 'it\'s yourself.'} });
		}

		if (myUser.hasRelationship(user.id)) {
			return res.status(422).json({ errors: {username: 'already linked' } })
		}

		return user;
	}).catch(next);

	res.json({ user: tUser })

})

router.post('/send-contact-request', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	await myUser.linkToRelative(req.body.userId, req.body.relationship);

	return res.json({  });
})

router.delete('/remove/:user_id', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	await myUser.unlinkToRelative(req.params.user_id);

	return res.json({  });
})

module.exports = router;
