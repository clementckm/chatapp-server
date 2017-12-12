var express = require('express');
var socket = require('socket.io');

var app = express();

const port = process.env.PORT || 5000;

server = app.listen(port, function(){
    console.log('server is running on port 5000')
});

io = socket(server);

// User
var onlineUser = [];
function removeUser (data) {
    var len
    var u = onlineUser.slice()
    for(var i = 0, len = onlineUser.length; i < len; i++ ) {
         if( u[i] === data ){
             u.splice(i,1);
         }
     }
     onlineUser = u;
}

io.on('connection', (socket) => {
    socket.on('SEND_MESSAGE', function(data){
        io.emit('RECEIVE_MESSAGE', data);
    })
    socket.on('ONLINE', function(data){
        onlineUser.push(data.userAddress);
        console.log(onlineUser)
        io.emit('ONLINE_USER', onlineUser);
    })
    socket.on('OFFLINE', function(data){
        removeUser(data);
        console.log(onlineUser)
        io.emit('OFFLINE_USER', onlineUser);
    })
    socket.on('JOIN', function(room) {
      console.log('room hash:', room)
      socket.join(room);
      console.log('join room')
    });
    socket.on('PRIVATE_MESSAGE', function(data) {
      // io.sockets.to(data.roomSender).emit('PRIVATE_MESSAGE', data);
      io.sockets.to(data.roomReceiver).emit('PRIVATE_MESSAGE', data);
      console.log(data.room, data.payload)
    });
});
