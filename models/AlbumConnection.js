var mongoose = require('mongoose');

var AlbumConnectionSchema = new mongoose.Schema({
	sender: String,
  receiver: String,
  photo: String,
}, {
	timestamps: true
});

mongoose.model('AlbumConnection', AlbumConnectionSchema);