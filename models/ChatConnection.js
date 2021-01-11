var mongoose = require('mongoose');

var ChatConnectionSchema = new mongoose.Schema({
	creatorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"] },
  responderRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"] },
  logs: { type: Array, default: [] }
}, {
	timestamps: true
});

mongoose.model('ChatConnection', ChatConnectionSchema);
