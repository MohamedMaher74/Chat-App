const path = require('path');
const { createServer } = require('node:http');
const express = require('express');
const { Server } = require('socket.io');
// const { join } = require('node:path');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/isRealString');
const publicPath = path.join(__dirname, '/../public');
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('A new user just connected');

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      callback('Name and room are required');
    }

    socket.join(params.room);

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
    console.log('createMessage', message);
    io.emit('newMessage', generateMessage(message.from, message.text));
    callback('This is the server:');
  });

  socket.on('createLocationMessage', (coords) => {
    io.emit(
      'newLocationMessage',
      generateLocationMessage('Admin', coords.lat, coords.lng)
    );
  });

  socket.on('disconnect', () => {
    console.log('User was disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});
