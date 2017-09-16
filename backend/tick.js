const { getChannelItems, getTaggings, channelIds } = require('./reuters');
const { getSentiment } = require('./textanalyze');

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
      const taggingPromises = allItems
        .map((item, index) => {
          const lang = item.language;
          if (lang === 'en' || lang === 'es' || lang === 'fr') {
            return new Promise((resolve) => {
              setTimeout(() => resolve(getTaggings(item.detail)), 1500 * index);
            })
          } else {
            return new Promise(resolve => resolve(undefined));
          }
        });
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