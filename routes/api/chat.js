var mongoose = require('mongoose');
var router = require('express').Router();
var auth = require('../../utils/auth');
var User = mongoose.model('User');
var ChatConnection = mongoose.model('ChatConnection');
var moment  = require('moment');

router.get('/get-contacts-for-conversation', auth.required, async function(req, res, next) {
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

router.get('/chat-history/with/:partnerRef', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).populate('relatives.userRef').then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var myRef = myUser._id;
	var partnerRef = req.params.partnerRef;

	return await ChatConnection.findOne({ creatorRef: myRef, responderRef: partnerRef })
	.then(function (chat) {
		if (chat) {
			var logsGrouped = [];
			var today     = moment(new Date()).format('YYYY-MM-DD');
			var yesterday = moment(new Date()).add(-1, 'days').format('YYYY-MM-DD');
			for (var log of chat.logs) {
				var isPushed = false;
				for (var logGrouped of logsGrouped) {
					if (log.date == logGrouped.date) {
						isPushed = true;
						logGrouped['logs'].push(log);
					}
				}
				if (!isPushed) {
					var logGrouped = {
						date: log.date,
						dateExpression: '',
						logs: []
					};

					if (log['date'] == today) {
						logGrouped['dateExpression'] = 'today';
					} else if (log['date'] == yesterday) {
						logGrouped['dateExpression'] = 'yesterday';
					} else {
						logGrouped['dateExpression'] = moment(log.date, 'YYYY-MM-DD').format('MMM D, YYYY');
					}
					logGrouped['logs'].push(log);
					logsGrouped.push(logGrouped);
				}
			}
				
			return res.json({ myRef, partnerRef, logsGrouped });
		} else {
			ChatConnection.findOne({ creatorRef: partnerRef, responderRef: myRef })
			.then(function (chat) {
				if (chat) {
					var logsGrouped = [];
					var today     = moment(new Date()).format('YYYY-MM-DD');
					var yesterday = moment(new Date()).add(-1, 'days').format('YYYY-MM-DD');
					for (var log of chat.logs) {
						var isPushed = false;
						for (var logGrouped of logsGrouped) {
							if (log.date == logGrouped.date) {
								isPushed = true;
								logGrouped['logs'].push(log);
							}
						}
						if (!isPushed) {
							var logGrouped = {
								date: log.date,
								dateExpression: '',
								logs: []
							};

							if (log['date'] == today) {
								logGrouped['dateExpression'] = 'today';
							} else if (log['date'] == yesterday) {
								logGrouped['dateExpression'] = 'yesterday';
							} else {
								logGrouped['dateExpression'] = moment(log.date, 'YYYY-MM-DD').format('MMM D, YYYY');
							}
							logGrouped['logs'].push(log);
							logsGrouped.push(logGrouped);
						}
					}
						
					return res.json({ myRef, partnerRef, logsGrouped });
				} else {
					var chat = { myRef, partnerRef, logsGrouped: [] };
					return res.json( chat );
				}
			})
		}
	})
})

router.post('/send-message/to/:partnerRef', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var partnerRef = req.params.partnerRef;
	var myRef = myUser._id;
	var log = {
		date: moment(new Date()).format('YYYY-MM-DD'),
		time: moment(new Date()).format('hh:mm A'),
		senderRef: myUser._id,
		type: 'message',
		messageText: req.body.messageText
	}

	ChatConnection.findOne({ creatorRef: partnerRef, responderRef: myRef })
	.then(function (chat) {
		if (chat) {
			var logs = chat.logs;
			logs.push(log);
			chat.logs = logs;
			chat.save();
			return res.json({});
		} else {
			ChatConnection.findOne({ creatorRef: myRef, responderRef: partnerRef })
			.then(function (chat) {
				if (chat) {
					var logs = chat.logs;
					logs.push(log);
					chat.logs = logs;
					chat.save();
					return res.json({});
				} else {
					chat = new ChatConnection();
					chat.creatorRef = myRef;
					chat.responderRef = partnerRef;
					chat.logs = [
						log
					];
					chat.save();
					return res.json({});
				}
			})
		}
	})
});

router.get('/get-conversations', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).populate('relatives.userRef').then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var today = moment(new Date()).format('YYYY-MM-DD');
	var yesterday = moment(new Date()).add(-1, 'days').format('YYYY-MM-DD');

	var conversations = [];
	for(var i  in myUser.relatives) {
		var relative = myUser.relatives[i];
		var conversation = {};
		var myRef = myUser._id;
		var partnerRef = relative.userRef;

		var chat = await ChatConnection.findOne({ creatorRef: partnerRef, responderRef: myRef }).then(chat => chat);
		if (!chat) {
			var chat = await ChatConnection.findOne({ creatorRef: myRef, responderRef: partnerRef }).then(chat => chat);
		}

		if (chat) {
			relationship = relative.relationship;
			relative = await User.findById(partnerRef).then(user=>user);
			relative._doc['relationship'] = relationship;
			var messageText = '', when = '';
			for (var log of chat.logs) {
				if (log.type=='message') {
					messageText = log.messageText;
					if (log.date==today) {
						when = log.time;
					} else if (log.date==yesterday) {
						when = 'Yesterday';
					} else {
						when = log.date;
					}
				}
			}
			message = { messageText, when };
			conversations.push({ message, relative });
		}
		
	}
	return res.json({ conversations });
})

module.exports = router;
