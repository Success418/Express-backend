module.exports = function(app) {
  
  var server = require('http').createServer(app);
  var io = require('socket.io')(server);
  server.listen(3030, function() {
    console.log('socket server is running on '+server.address().port)
  })

  io.on('connection', function(socket) {    
    socket.on('new message', function(myRef, partnerRef) {
      console.log('Message from %s to %s', myRef, partnerRef);

      io.emit('new message', myRef, partnerRef);
    })
  })

  
}
