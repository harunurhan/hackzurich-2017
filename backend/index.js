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

const { getChannelItems, getTaggings } = require('./reuters');
const { getSentiment } = require('./textanalyze');

socket.attach(3000, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

Promise.all([
  getChannelItems('BEQ259'),
  getChannelItems('STK567')
]).then(channels => {
  const allItems = channels
    .reduce((pre, cur) => pre.concat(cur), [])
  const allDetails = allItems
    .map(item => item.detail);
  return new Promise((resolve, reject) => {
    getSentiment(allDetails)
      .then(sentiment => {
        sentiment.forEach((s) => {
          allItems[s.index].score = s.score;
        });
        resolve(allItems);
      }).catch(err => {
        reject(err);
      });
  });
}).then(allItems => {
  return new Promise((resolve, reject) => {
    const taggingPromises = allItems
      .map((item, index) => new Promise((resolve) => {
        setTimeout(() => resolve(getTaggings(item.detail)), 1000 * index);
      }))
    return Promise.all(taggingPromises)
      .then(taggings => {
        resolve(allItems.map((item, index) => {
          item.tags = taggings[index];
          return item;
        }));
      }).catch(err => {
        reject(err);
      });
  });
}).then(items => {
  console.log(JSON.stringify(items, null, 2));
}).catch(err => {
  console.error(err);
})


setInterval(() => {
  // shit
  socket.send()
}, 10000)



