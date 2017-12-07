var express = require('express');
var socket = require('socket.io');

var app = express();

const port = process.env.PORT || 5000;

server = app.listen(port, function(){
    console.log('server is running on port 5000')
});

io = socket(server);

io.on('connection', (socket) => {
    socket.on('SEND_MESSAGE', function(data){
        io.emit('RECEIVE_MESSAGE', data);
    })
    socket.on('ONLINE', function(data){
        io.sockets.emit('ONLINE_USER', data);
    })
    socket.on('OFFLINE', function(data){
        io.emit('OFFLINE_USER', data);
    })
});
