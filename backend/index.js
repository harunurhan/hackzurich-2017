const express = require('express');
const tick = require('./tick');
const Socket = require('socket.io');

// serve frontend app
var app = express();
app.use(express.static('../frontend/public'));
app.listen(8080, () => {
  console.log('Serving static files at port 8080');
});

// serve socket
const socket = Socket({
  path: '/feed',
  serveClient: false,
});
socket.attach(3000, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

tick('10m')
  .then(results => {
    console.log(results);
  }).catch(err => {
    console.error(err);
  });

setInterval(() => {
  /*
  tick('10m')
    .then(results => {
      console.log(results);
    }).catch(err => {
      console.error(err);
    });
  */
}, 10000)



