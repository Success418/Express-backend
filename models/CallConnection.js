var mongoose = require('mongoose');

var CallConnectionSchema = new mongoose.Schema({
	requesterRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"] },
  responderRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"] },
  status: { type: String, enum: ['requesting', 'calling', 'closed', 'cancelled', 'refused'], default: 'requesting'},
  callingType: { type: String },
  sessionId: { type: String }
}, {
	timestamps: true
});

mongoose.model('CallConnection', CallConnectionSchema);
