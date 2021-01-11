var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
	creatorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"]},
	relativeRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"]},
	relationship: { type: String, required: [true, "can't be blank"] },
	name: { type: String, required: [true, "can't be blank"] },
	category: { type: String, required: [true, "can't be blank"] },
	startDate: { type: String, required: [true, "can't be blank"]},
	endDate: { type: String, required: [true, "can't be blank"] },
	startTime: { type: String, required: [true, "can't be blank"] },
	endTime: { type: String, required: [true, "can't be blank"] },
	repeat: { type: String, required: [true, "can't be blank"] },
	notes: { type: String, required: [true, "can't be blank"] },
	isAllDay: {type: Boolean, required: [true, "can't be blank"]}
}, {
	timestamps: true
});

mongoose.model('Event', EventSchema);
