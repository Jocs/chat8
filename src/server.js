var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sockets = require('./server/socket.js')(io);

app.use(express.static(__dirname + '/client'));
server.listen(18080, function(){
	console.log('app listen at port: 18080');
});
