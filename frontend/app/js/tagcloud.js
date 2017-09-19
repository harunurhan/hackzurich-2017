var persons_wordcloudChart = dc.wordcloudChart('#persons-cloudChart');
var organizations_wordcloudChart = dc.wordcloudChart('#organizations-cloudChart');

// format for parsing the date
var format = d3.time.format("%Y-%m-%dT%XZ"); //2017-09-16T16:14:31Z

(function(){
    'use strict'

    function drawWordcloudChart(facts){
        var persons_wordDim = facts.dimension(function(d){
            return d.tags['entities'][0].value;
        });
        console.log(persons_wordDim);

        var persons_wordGroup = persons_wordDim.group().reduceSum(function(d){
            return d.tags['entities'][0].relevance;
        });
        //console.log(wordGroup);

        var organizations_wordDim = facts.dimension(function(d){
            return d.tags['entities'][1].value;
        });
        console.log(organizations_wordDim);

        var organizations_wordGroup = organizations_wordDim.group().reduceSum(function(d){
            return d.tags['entities'][1].relevance;
        });
        //console.log(wordGroup);

        persons_wordcloudChart.options({
            height: 200,
            width: 200,
            //minY: -20,
            //minX: -40,
            relativeSize: 40,
            dimension: persons_wordDim,
            group: persons_wordGroup,
            valueAccessor: function(d) {
                //console.log(d);
                return d.key[0].relevance*10},
            title: function (d) {
                console.log(d.key);
                return [d.key, 'Relevance: '+d.value].join('\n')
            },
        });

        organizations_wordcloudChart.options({
            height: 200,
            width: 200,
            //minY: -20,
            //minX: -40,
            relativeSize: 40,
            dimension: organizations_wordDim,
            group: organizations_wordGroup,
            valueAccessor: function(d) {
                //console.log(d);
                return d.key[0].relevance*10},
            title: function (d) {
                console.log(d.key);
                return [d.key, 'Relevance: '+d.value].join('\n')
            },
        });

        dc.renderAll();
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