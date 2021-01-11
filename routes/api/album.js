var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var Album = mongoose.model('AlbumConnection');
var auth = require('../../utils/auth');
const upload = require('../../utils/upload');
const Resize = require('../../utils/resize');
const path = require('path');

router.post('/upload-album', auth.required, upload.single('image'), async function(req, res) {
	const imagePath = path.join(__dirname, '../../public/sharedalbum');
  const fileUpload = new Resize(imagePath);
  if (!req.file) {
    res.status(401).json({ errors: { image: 'Please provide an image' } });
  }
  const filename = await fileUpload.save(req.file.buffer);

  var album = new Album();

  album.sender = req.body.sender;
  album.receiver = req.body.receiver;
  album.photo = filename;
  
  album.save().then(function(){
    return res.json({"image_path": filename, "sender": req.body.sender, "receiver": req.body.receiver});
  }).catch(next);
})

router.get('/album-list', auth.required, function(req, res, next){
  
  Album.find({ sender: req.query.sender }).then(function(album){
    return res.json({'album-list': album});
  }).catch(next);
});

router.post('/share-album', auth.required, async function(req, res) {
	var album = new Album();

  album.sender = req.body.sender;
  album.receiver = req.body.receiver;
  album.photo = req.body.image;
  
  album.save().then(function(){
    return res.json({"image_path":  album.photo , "sender": req.body.sender, "receiver": req.body.receiver});
  }).catch(next);
})



  module.exports = router;
