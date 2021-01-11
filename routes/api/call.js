var router = require('express').Router();
var auth = require('../../utils/auth');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var CallConnection = mongoose.model('CallConnection');
var OpenTok = require('opentok');
var apiKey = '46455422';
var secretKey = '763ded07bdc564e72067e135cf0cb09e63fc81f3';
var opentok = new OpenTok(apiKey, secretKey);

router.post('/request-connect/:callingType/:responderRef', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);
	
	var requesterRef = myUser._id;

	await CallConnection.find({
		requesterRef: requesterRef, 
		status: { $in: ['requesting', 'calling'] }
	}).then(async function(connections) {
		for (connection of connections) {
			connection.status = 'cancelled';
			return await connection.save();
		}
		// res.status(422).json({errros: ['You already calling now.']});
	});

	await CallConnection.find({
		responderRef: requesterRef,
		status: { $in: ['requesting', 'calling'] }
	}).then(function(connections) {
		if (connections.length)
			return res.status(422).json({errors: ['You are already be calling now.']});
	});

	var connection = new CallConnection();
	connection.requesterRef = requesterRef;
	connection.responderRef = req.params.responderRef;
	connection.callingType = req.params.callingType;
	connection.status = 'requesting';
	connection.save();
	return res.json({});
})

router.post('/check-coming-request', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);
	
	var checkerRef = myUser._id;
	await CallConnection.findOne({
		responderRef: checkerRef,
		status: 'requesting'
	}).populate('requesterRef').then(function(connection) {
		if (connection) {
			var requesterRef = connection.requesterRef;
			var relationship = '';
			for (relative of myUser.relatives) {
				if (relative.userRef.equals(requesterRef._id)) {
					relationship = relative.relationship;
				}
			}
			var callingType = connection.callingType;
			return res.json({ exists: true, requesterRef: requesterRef, relationship, callingType });
		} else
			return res.json({ exists: false });
	})
})

router.post('/receive-connect/:requesterRef', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var responderRef = myUser._id;
	var requesterRef = req.params.requesterRef;

	await CallConnection.findOne({ requesterRef, responderRef, status: 'requesting' }).then(function(connection){
		if (!connection) {
			return res.sendStatus(422);
		}
		connection.status = 'calling';
		opentok.createSession({mediaMode:"relayed"}, function(err, session) {
			if (err) {
				console.log(err);
				res.status(500).json({error: 'createSession error:', err});
				return;
			}
	
			var sessionId = session.sessionId;
			token = opentok.generateToken(sessionId);
			connection.sessionId = sessionId;
			connection.save().then(function() {
				return res.json({ apiKey, sessionId, token });
			})
		});		
	})

})

router.post('/check-receiving-request', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var requesterRef = myUser._id;

	await CallConnection.findOne({ 
		requesterRef, status: 'calling' 
	}).then(async function(connection){
		var status = "waiting";
		if (!connection) {
			return await CallConnection.findOne({ 
				requesterRef, status: 'requesting' 
			}).then(function(connection2){
				if (!connection2) {
					return res.status(422).json({ errors: ['Maybe responder refused your call.'] });
				}
				return res.json({ status });
			})
		}

		status = "call-started";
		var responderRef = connection.responderRef;
		var sessionId = connection.sessionId;
		token = opentok.generateToken(sessionId);
		var callingType = connection.callingType;
		return res.json({ status, apiKey, sessionId, token, callingType });
	})

})

router.post('/close-connect', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var requesterRef = myUser._id;
	await CallConnection.findOne({ 
		requesterRef, status: 'calling' 
	}).then(function(connection){
		if (connection) {
			connection.status = 'closed';
			connection.save();
		}
	});

	var responderRef = myUser._id;
	await CallConnection.findOne({ 
		responderRef, status: 'calling' 
	}).then(function(connection){
		if (connection) {
			connection.status = 'closed';
			connection.save();
		}
	});

	return res.json({ });
})

router.post('/cancel-requesting', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var requesterRef = myUser._id;
	await CallConnection.findOne({ 
		requesterRef, status: 'requesting' 
	}).then(function(connection){
		if (connection) {
			connection.status = 'cancelled';
			connection.save();
			return res.json({ });
		}
	});
})

router.post('/refuse-calling', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var responderRef = myUser._id;
	await CallConnection.findOne({ 
		responderRef, status: 'requesting' 
	}).then(function(connection){
		if (connection) {
			connection.status = 'refused';
			connection.save();
			return res.json({ });
		}
	});
})


module.exports = router;
