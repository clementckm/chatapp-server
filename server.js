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

// Public Chat
var publicChat = [];
function addPublicMessage (data){
  publicChat.push(data)
}
// Private Chat
var privateChat = [];
function addPrivateMessage (data){
  privateChat.push(data)
}

var sortPrivateChat = [];
function sortChat(){
  var len
  var p = privateChat.slice()
  for(var i = 0, len = privateChat.length; i < len; i++ ) {
       if( (p[i].receiver === '0x7f4f06c8962ca1fce3abb6ee63f5c9d7e50b8506' && p[i].sender === '0xbe71777c4f0c44c5d4f3c9d482ae1733095a1640') || (p[i].sender === '0x7f4f06c8962ca1fce3abb6ee63f5c9d7e50b8506' && p[i].receiver === '0xbe71777c4f0c44c5d4f3c9d482ae1733095a1640')){
           sortPrivateChat.push(p[i])
       }
   }
}

function removeChat() {
  sortPrivateChat = [];
}

// Friends
var friends = [];

function addFriend (data) {
  friends.push(data)
}


var sortFriends = [];
function sortFriend (data) {
  var len
  var f = friends.slice()
  for(var i = 0, len = friends.length; i < len; i++ ) {
       if( f[i].userAddress === data ){
           sortFriends.push(f[i].friend)
       }
   }
}
function removeFriend () {
  sortFriends = [];
}


io.on('connection', (socket) => {
  // Public Message
    socket.on('SEND_MESSAGE', function(data){
      addPublicMessage(data)
        io.emit('RECEIVE_MESSAGE', publicChat);
    })
  // User
    socket.on('ONLINE', function(data){
        onlineUser.push(data.userAddress);
        io.emit('ONLINE_USER', onlineUser);
    })
    socket.on('OFFLINE', function(data){
        removeUser(data);
        io.emit('OFFLINE_USER', onlineUser);
    })
  // Private Channel
    socket.on('JOIN', function(room) {
      console.log('room hash:', room)
      socket.join(room);
      console.log('join privateChat')
    });
    socket.on('PRIVATE_MESSAGE', function(data) {
      console.log(data)
      // io.sockets.to(data.roomSender).emit('PRIVATE_MESSAGE', data);
      addPrivateMessage(data)
      // sortChat()
      // console.log('sortPrivateChat', sortPrivateChat)
      io.sockets.to(data.roomReceiver).emit('PRIVATE_MESSAGE', privateChat);
      socket.leave(data.roomReceiver)
    });
  // Friend List
    socket.on('JOIN_SELF', function(room) {
      socket.join(room);
    });
    socket.on('FRIENDS', function(data){
        addFriend(data);
        sortFriend(data.userAddress)
        io.sockets.to(data.userAddress).emit('FRIENDS_LIST', sortFriends);
        removeFriend();
        socket.leave(data.userAddress);
    })
});
