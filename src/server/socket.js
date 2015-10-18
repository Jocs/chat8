var users = [];
module.exports = function(io){
	io.on('connection', function (socket) {
	  socket.emit('init', true);
	  socket.on('checkName', function(data){
	  	if(users.length === 0) return this.emit('isUserExsist', false);
	  	var isUserExsist = users.some(function(user){
	  		if(user.name === data) return true;
	  	});
	  	this.emit('isUserExsist', isUserExsist? true: false);
	  });
	  // login ---------------------
	  socket.on('login', function(data){
	  	users.push(data);
	  	socket.emit('users', users);
	  	socket.broadcast.emit('login', data);
	  });
	  // handle message event --------------
	  socket.on('message', function(data, fn){
	  	fn();
	  	if(data.receiver.name !== '聊天室'){
	  		socket.broadcast.to(data.receiver.socketId).emit('message', data);
	  	} else {
	  		socket.broadcast.emit('message', data);
	  	}
	  });
	  // handle disconnect -----------------
	  socket.on('disconnect', function(){
		for(var i = 0; i < users.length; i ++){
			if(users[i].socketId === this.id) {
				io.sockets.emit('logout', users[i]);
				users.splice(i, 1);
			}
		}
		
	  });

	});


}
