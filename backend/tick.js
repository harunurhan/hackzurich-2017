const { getChannelItems, getTaggings, channelIds } = require('./reuters');
const { getSentiment } = require('./textanalyze');

function promiseAllSync(array, fn) {
  var results = [];
  return array.reduce(function(p, item) {
      return p.then(function() {
          return fn(item).then(function(data) {
              results.push(data);
              return results;
          });
      });
  }, Promise.resolve());
}

function tick(interval) {
  return Promise.all(
    channelIds
      .map(channelId => getChannelItems(channelId, interval))
  ).then(channels => {
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
      promiseAllSync(allItems, (item) => {
        let lang = item.language;
        if (lang === 'en' || lang === 'es' || lang === 'fr') {
          return getTaggings(item.detail);
        } else {
          return Promise.resolve();
        }
      }).then(taggings => {
        resolve(allItems.map((item, index) => {
          item.tags = taggings[index];
          return item;
        }));
      }).catch(err => {
        reject(err);
      });
    });
  });
}

module.exports = tick;