const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');

  //? Boradcasting
  //? to execute below 2 events, you must emit ('createMessage') message from client side.
  socket.on('createMessage', (message) => {
    console.log('createMessage', message);
    //* 1) In this case if user send message to server, so server resend this msg to all connected user including (sender)
    io.emit('newMessage', {
      from: message.from,
      text: message.text,
      createdAt: new Date().getTime(),
    });

    //* 2) In this case if user send message to server, so server resend this msg to all connected user excluding (sender)
    socket.broadcast.emit('newMessage', {
      from: message.from,
      text: message.text,
      createdAt: new Date().getTime(),
    });
  });

  //? Send Message from admin to new entered user.
  //* 1)
  socket.emit('newMessage', {
    from: 'Admin',
    text: 'Welcome to the chat app',
    createdAt: new Date().getTime(),
  });

  //? Send All other users that a new user joined.
  socket.broadcast.emit('newMessage', {
    from: 'Admin',
    text: 'New User Joined!',
    createdAt: new Date().getTime(),
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});
