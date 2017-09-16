const request = require('request-promise-native');

//map format:
// { id: 1, text: 'text' }
function getSentiment(map) {

    let documents = Object.keys(map)
        .map(id => {return {id, language: 'en', text: map[id]}})

    var options = {
        url: 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment',
        headers : {
            'Ocp-Apim-Subscription-Key' : '1771a25b81b74777a6fe40f4ad39882f',
        },
        body: {documents},
        json: true // Automatically stringifies the body to JSON
    };

    return request
        .post(options)
        .then(parsedBody => {
            return new Promise((resolve, reject) => {
                let res = parsedBody.documents.map(doc => {
                    return {
                        text: map[doc.id],
                        score: doc.score,
                    }
                });
                resolve(res);
            });
        })
}

module.exports = {
    getSentiment,
};

