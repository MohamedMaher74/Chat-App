const path = require('path');
const { createServer } = require('node:http');
const express = require('express');
const { Server } = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/isRealString');
const { Users } = require('./utils/users');

const publicPath = path.join(__dirname, '/../public');
const app = express();
const server = createServer(app);
const io = new Server(server);
let users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('A new user just connected');
  // console.log(socket.id);

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room are required');
    }

    socket.join(params.room);

    // If user in another rooms, logout first from them.
    users.removeUser(socket.id);

    users.addUser(socket.id, params.name, params.room);

    // Show all active users in room.
    io.to(params.room).emit('updateUsersList', users.getUserList(params.room));

    socket.emit(
      'newMessage',
      generateMessage('Admin', `Welocome to ${params.room}!`)
    );

    socket.broadcast
      .to(params.room)
      .emit('newMessage', generateMessage('Admin', 'New User Joined!'));

    callback();
  });

  socket.on('createMessage', (message, callback) => {
    let user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit(
        'newMessage',
        generateMessage(user.name, message.text)
      );
    }

    callback('This is the server:');
  });

  socket.on('createLocationMessage', (coords) => {
    let user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'newLocationMessage',
        generateLocationMessage(user.name, coords.lat, coords.lng)
      );
    }
  });

  socket.on('disconnect', () => {
    let user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUsersList', users.getUserList(user.room));

      io.to(user.room).emit(
        'newMessage',
        generateMessage(
          'Admin',
          `${user.name} has left ${user.room} chat room.`
        )
      );
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});
