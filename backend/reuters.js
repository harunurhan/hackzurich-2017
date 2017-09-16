const request = require('request-promise-native');
const xml2js = require('xml2js');

const reutersToken = '0Uar2fCpykWmqCu0MhrDn2n6/ssLT91S81kIX5wuiTI=';
const reutersApiUrl = 'http://rmb.reuters.com/rmd/rest/xml';
const taggingToken = 'S9lrS8NnxMV8L9KjArzSKCWfeVIFwPS5';
const taggingApiUrl = 'https://api.thomsonreuters.com/permid/calais';

const parser = new xml2js.Parser();


function getChannelList() {
    return request
        .get(`${reutersApiUrl}/channels?token=${reutersToken}`)
        .then((xml) => {
            return new Promise((resolve, reject) => {
                parser.parseString(xml, (err, body) => {
                   if(err) reject(err);
                   resolve(body.availableChannels);
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
function getChannelItems(channelId, maxAge = '1h') {
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
      const prettyResultPromises = results
        .map(result => {
          return new Promise((resolve, reject) => {
            const pretty = {};
            pretty.headline = result.headline[0];
            if (result.geography) {
              pretty.geography = result.geography[0];
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
  getTaggings
};