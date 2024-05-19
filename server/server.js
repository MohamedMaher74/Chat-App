const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const { generateMessage } = require('./utils/message');
const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.emit(
    'newMessage',
    generateMessage('Admin', 'Welocome to the chat app!')
  );

  socket.broadcast.emit(
    'newMessage',
    generateMessage('Admin', 'New User Joined!')
  );

  socket.on('createMessage', (message, callback) => {
    console.log('createMessage', message);

    io.emit('newMessage', generateMessage(message.from, message.text));

    callback('This is the server:');
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});
