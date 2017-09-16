const request = require('request-promise-native');

const textAnalyzeApiUrl = 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';
const textAnalyzeToken = '1771a25b81b74777a6fe40f4ad39882';

/**
 * @param {[id]: [text]} map 
 */
function getSentiment(map) {

    let documents = Object.keys(map)
        .map(id => {
            return { id, language: 'en', text: map[id] };
        });

    var options = {
        url: textAnalyzeApiUrl,
        headers: {
            'Ocp-Apim-Subscription-Key': textAnalyzeToken,
        },
        body: { documents },
        json: true
    };

    return request
        .post(options)
        .then(parsedBody => {
            return new Promise((resolve) => {
                let pretty = parsedBody.documents.map(doc => {
                    return {
                        text: map[doc.id],
                        score: doc.score,
                    }
                });
                resolve(pretty);
            });
        })
}

module.exports = {
    getSentiment,
};

