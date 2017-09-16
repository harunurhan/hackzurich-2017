var wordcloudChart = dc.wordcloudChart('#cloudChart');

// format for parsing the date
var format = d3.time.format("%Y-%m-%dT%XZ"); //2017-09-16T16:14:31Z

(function(){
    'use strict'

    function drawWordcloudChart(facts){
        var wordDim = facts.dimension(function(d){
            return d.tags['entities'][0].value;
        });
        console.log(wordDim);

        var wordGroup = wordDim.group().reduceSum(function(d){
            return d.tags['entities'][0].relevance;
        });
        //console.log(wordGroup);

        wordcloudChart.options({
            height: 200,
            width: 200,
            //minY: -20,
            //minX: -40,
            relativeSize: 40,
            dimension: wordDim,
            group: wordGroup,
            valueAccessor: function(d) {
                //console.log(d);
                return d.key[0].relevance*10},
            title: function (d) {
                console.log(d.key);
                return [d.key, 'Relevance: '+d.value].join('\n')
            },
        });

        wordcloudChart.render();
    }

    d3.json(data, function (error, mydata) {
        if (error) throw error;

        mydata.forEach(function(d) {
            d.date = format.parse(d.date);
            d.headline = d.headline;
            d.geography = d.geography;
            //d.country = d.country;
            d.detail =  d.detail;
            d.score = parseFloat(d.score);
            d.tags =  d.tags;
        });
        console.log(mydata);

        var data2 = mydata.map(function(d) {
            return {
                date: d.date,
                headline: d.headline,
                geography: d.geography,
                //country: d.country,
                detail: d.detail,
                score: d.score,
                tags:  d.tags,
                entities: d.tags['entities']
            };
        });
        //console.log(data2);

        var ndx = crossfilter(data2);

        drawWordcloudChart(ndx);

    })

})();