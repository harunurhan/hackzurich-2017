const request = require('request-promise-native');
const { textAnalyzeToken } = require('./api-tokens');

const textAnalyzeApiUrl = 'https://westeurope.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';

function getSentiment(array) {

    let documents = array
        .map((text, id) => {
            return { id, language: 'en', text };
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
                        index: doc.id,
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
