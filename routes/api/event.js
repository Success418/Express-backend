var mongoose = require('mongoose');
var router = require('express').Router();
var User = mongoose.model('User');
var Event  = mongoose.model('Event');
var auth = require('../../utils/auth');
var moment = require('moment');

router.post('/create', auth.required, async function(req, res, next) {
	
	var userId =	req.payload.id;
	
	// var myUser = await User.findById(userId).then(function(user) {
	// var myUser = await User.findById(req.body.id).then(function(user) {
	// 	if(!user){ return res.sendStatus(401); }

	// 	return user;
	// }).catch(next);
	
	var event = new Event();
	event.creatorRef = req.body.id;
	event.relationship = req.body.relationship;
	event.relativeRef = req.body.relativeRef;
	event.name = req.body.name;
	event.category = req.body.category;
	event.startDate = req.body.startdate;
	event.endDate = req.body.enddate;
	event.startTime = req.body.starttime;
	event.endTime = req.body.endtime;
	event.repeat = req.body.repeat;
	event.notes = req.body.notes;
	event.isAllDay = req.body.isAllDay;
	event.repeat = req.body.repeat;

	event.save().then(function() {
		return res.json({ "event": "success" });
	}).catch(next);
})

router.get('/grouped-by-dates/year/:year/month/:month', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var eventsGroupedByDate = [];
	var startDate = moment([req.params.year, req.params.month-1]);
	var endDate = moment(startDate).endOf('month');

	for (var date = startDate; date.isBefore(endDate); date.add(1, 'days')) {
		date_ = date.format('YYYY-MM-DD');
		await Event.find({ 
			"creatorRef": myUser.id,
			"startDate": { $lte: date_ },
			"endDate": { $gte: date_ }
		}).populate('creatorRef').populate('relativeRef').then(events => {
			eventsGroupedByDate.push({
				date: date_,
				
			});
		});
	}

	return res.json({
		eventsGroupedByDate
	})
	
})

router.get('/list-by-date/date/:date', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	Event.find({ 
		"creatorRef": myUser.id,
		"startDate": { $lte: req.params.date },
		"endDate": { $gte: req.params.date }
	}).populate('creatorRef').populate('relativeRef').then(events => {
		return res.json({
			events
		})
	});
})

router.get('/list-between/from-date/:fromDate/to-date/:toDate', auth.required, async function(req, res, next) {
	
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	Event.find({ 
		"creatorRef": myUser.id,
		"startDate": { $lte: req.params.toDate },
		"endDate": { $gte: req.params.fromDate }
	}).populate('creatorRef').populate('relativeRef').then(events => {
		return res.json({
			events
		})
	});
})

router.get('/lists', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.query.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	Event.find({ 
		"creatorRef": myUser.id,
	}).populate('creatorRef').populate('relativeRef').then(events => {
		return res.json({
			events
		})
	});
})

router.put('/update', auth.required, function(req, res, next){
	return res.json({Event: req.body});	
	if(!req.body.name){
    return res.status(422).json({errors: {name: "can't be blank"}});
	}
	
	if(!req.body.notes){
    return res.status(422).json({errors: {note: "can't be blank"}});
	}	

	if(!req.body.category){
    return res.status(422).json({errors: {category: "can't be blank"}});
	}	
	
  Event.findById(req.body.id).then(function(user) {
		if(!Event){ return res.sendStatus(401); }

		Event.name = req.body.name;
		Event.note = req.body.notes;
		Event.isAllDay = req.body.isAllDay;
		Event.repeat = req.body.repeat;
		Event.starttime = req.body.starttime;
		Event.endtime = req.body.endtime;
		Event.startdate = req.body.startdate;
		Event.enddate = req.body.enddate;
		Event.relativeRef = req.body.relativeRef;
		Event.relationship = req.body.relationship;
		Event.createRef = req.body.createRef;
		Event.category = req.body.category;

    return Event.save().then(function(){
      return res.json({Event: Event.toAuthJSON()});
    });
	}).catch(next);
});

module.exports = router;
