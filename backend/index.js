// packages
const socket = require('socket.io')({
  path: '/feed',
  serveClient: false,
});

const { getChannelItems, getItemDetail } = require('./reuters');

socket.attach(3000, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});



