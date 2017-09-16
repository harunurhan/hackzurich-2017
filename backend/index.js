var express = require('express');
var app = express();


app.use(express.static('../frontend/public'));

app.listen(8080, () => {

});


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



