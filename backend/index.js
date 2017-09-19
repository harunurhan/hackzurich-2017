const express = require('express');
const tick = require('./tick');
const Socket = require('socket.io');
const callLuis = require('./luis');
var bodyParser = require('body-parser');


// serve frontend app
var app = express();



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

app.listen(8083, function () {
    console.log('Example app listening on port 8083!')
})

// serve socket
const socket = Socket({
  path: '',
  serveClient: false,
});
socket.attach(8080, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

setInterval(() => {
  tick('420m')
    .then(results => {
      console.log(results);
        socket.emit('feed', {news: results});
    }).catch(err => {
      console.error(err);
    });
  //socket.emit('feed', {data: "asdf"});
}, 15000)



