const { getChannelItems, getTaggings } = require('./reuters');
const { getSentiment } = require('./textanalyze');


function tick(interval) {
  return Promise.all([
    getChannelItems('BEQ259', interval),
    getChannelItems('STK567', interval)
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
  });
};

module.exports = tick;