const request = require('request-promise-native');
const xml2js = require('xml2js');
const { taggingToken, reutersToken } = require('./api-tokens');

const reutersApiUrl = 'http://rmb.reuters.com/rmd/rest/xml';
const taggingApiUrl = 'https://api.thomsonreuters.com/permid/calais';

const parser = new xml2js.Parser();


const channelIds = [
  'BEQ259',
  'CLE548',
  'Efm208',
  'FES376',
  'Iwu647',
  'LFL980',
  'QTZ240',
  'STK567',
  'VEi502',
  'Wbz248',
  'bcd525',
  'gFT847',
  'mUo350',
  'shl347',
  'uNx795',
  'wbq437'
];

function getChannelIds() {
  return request
    .get(`${reutersApiUrl}/channels?token=${reutersToken}`)
    .then((xml) => {
      return new Promise((resolve, reject) => {
        parser.parseString(xml, (err, body) => {
          if (err) reject(err);
          const channelIds = body.availableChannels
            .channelInformation
            .map(channelInfo => channelInfo.alias[0]);
          resolve(channelIds);
        });
      });
    }).then(results => {
      return results;
    })
}

/**
 * Returns a promise that resolves to:
 *   [
 *      {headline: <string>, geography: <string>, detail: <string>},
 *      ...
 *   ]
 * for a given channel
 */
function getChannelItems(channelId, maxAge = '15m') {
  return request
    .get(`${reutersApiUrl}/items?channel=${channelId}&mediaType=T&maxAge=${maxAge}&token=${reutersToken}`)
    .then((xml) => {
      return new Promise((resolve, reject) => {
        parser.parseString(xml, (err, body) => {
          if (err) reject(err);
          resolve(body.results.result);
        });
      });
    }).then(results => {
      results = results || [];
      const prettyResultPromises = results
        .map(result => {
          return new Promise((resolve, reject) => {
            const pretty = {};
            pretty.headline = result.headline[0];
            pretty.date = result.dateCreated[0];
            if (result.geography) {
              pretty.geography = result.geography[0];
            }
            if (result.language) {
              pretty.language = result.language[0];
            }
            getItemDetail(result.id[0])
              .then((detail) => {
                pretty.detail = detail;
                resolve(pretty);
              }).catch(err => {
                reject(err)
              });
          });
        })
      return Promise.all(prettyResultPromises);
    });
}

function getItemDetail(itemId) {
  return request
    .get(`${reutersApiUrl}/item?id=${itemId}&token=${reutersToken}`)
    .then((xml) => {
      return new Promise((resolve, reject) => {
        parser.parseString(xml, (err, body) => {
          if (err) reject(err);
          const paragraphs = body
            .newsMessage
            .itemSet[0]
            .newsItem[0]
            .contentSet[0]
            .inlineXML[0]
            .html[0]
            .body[0]
            .p
          resolve(paragraphs.join());
        });
      });
    });
}

function getTaggings(content) {
  return request.post({
    url: taggingApiUrl,
    headers: {
      'x-ag-access-token': taggingToken,
      'Accept': 'application/json',
      'outputFormat': 'application/json',
      'Content-Type': 'text/raw'
    },
    json: true,
    body: content,
  }).then(json => {
    return new Promise((resolve) => {
      pretty = {
        socialTags: [],
        entities: [],
      };
      Object.keys(json)
        .forEach(key => {
          const value = json[key];
          if (value._typeGroup === 'socialTag') {
            pretty.socialTags.push(value.originalValue);
          } else if (value._typeGroup === 'entities') {
            pretty.entities.push({
              entityType: value._type,
              value: value.name,
              relevance: value.relevance
            })
          }
        });
      resolve(pretty);
    });
  });
};

module.exports = {
  getChannelItems,
  getTaggings,
  channelIds,
};