const express = require('express');
const tick = require('./tick');
const Socket = require('socket.io');
const callLuis = require('./luis');
var bodyParser = require('body-parser');


// serve frontend app
var app = express();
app.use(express.static('../frontend'));

// endpoint to latest news example: /news?last=10m
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/news', (req, res) => {
  tick(req.query.last)
    .then(result => res.json(result));
});
app.post('/luis', (req, res) => {
    callLuis(req.body.text)
        .then(result => res.json(result));
})

app.listen(8080, () => {
  console.log('Serving static files at port 8080');
});

// serve socket
const socket = Socket({
  path: '',
  serveClient: false,
});
socket.attach(3000, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
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
  socket.emit('feed', {data: "hello"});
}, 10000)



