const request = require('request-promise-native');
const xml2js = require('xml2js');

const reutersToken = '0Uar2fCpykWmqCu0MhrDn2n6/ssLT91S81kIX5wuiTI=';
const reutersApiUrl = 'http://rmb.reuters.com/rmd/rest/xml';

const parser = new xml2js.Parser();

function getChannelItems(channelId) {
  return request
    .get(`${reutersApiUrl}/items?channel=${channelId}&token=${reutersToken}`)
    .then((xml) => {
      return new Promise((resolve, reject) => {
        parser.parseString(xml, (err, body) => {
          if (err) reject(err);
          resolve(body.results.result);
        });
      });
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
          return paragraphs.join();
        });
      });
    });
}

module.exports = {
  getChannelItems,
  getItemDetail
};