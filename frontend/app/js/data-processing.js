// format for parsing the date
var format = d3.time.format("%Y-%m-%dT%XZ"); //2017-09-16T16:14:31Z

/**********************************
 * Step0: Load data from json file *
 **********************************/

// load data from a json file
d3.json("json/input.json", function (error, mydata) {
    if (error) throw error;

    function print_filter(filter) {
        var f=eval(filter);
        if (typeof(f.length) != "undefined") {}else{}
        if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
        if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
        console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
    }

    mydata.forEach(function(d) {
        d.date = format.parse(d.date);
        d.headline = d.headline;
        d.geography = d.geography;
        //d.country = d.country;
        d.detail =  d.detail;
        d.score =  parseFloat(d.score);
        d.tags =  d.tags;
        d.entities =  d.tags.entities;
    });

    var data2 = mydata.map(function(d) {
        return {
            date: d.date,
            headline: d.headline,
            geography: d.geography,
            //country: d.country,
            detail: d.detail,
            score:  d.score,
            tags:  d.tags,
            entities: d.entities
        };
    });
    console.log(data2);

    /******************************************************
     * Step1: Create the dc.js chart objects & ling to div *
     ******************************************************/

        // define charts
    var worldChart = dc.geoChoroplethChart("#map");

    /****************************************
     * 	Run the data through crossfilter    *
     ****************************************/

    var facts = crossfilter(data2);  // Gets our 'facts' into crossfilter
    //print_filter('facts');

    var dateDimension = facts.dimension(function(d) { return d.date; });

    var currentTime = new Date();
    //var minDate = dateDimension.bottom(1)[0].date;
    //var maxDate = dateDimension.top(1)[0].date;
    //console.log(currentTime, sixHoursAgo, minDate, maxDate);

    /******************************************************
     * Create the Dimensions                               *
     * A dimension is something to group or filter by.     *
     * Crossfilter can filter by exact value, or by range. *
     ******************************************************/

    var countries = facts.dimension(function(d){ return d.geography; });

    // Volumes by Time Dimension
    var volumeByDay = facts.dimension(function(d) {
        return d3.time.day(d.date);
    });
    var volumeByDayGroup = volumeByDay.group().reduceSum(function(d) { return d.score; });
    print_filter('volumeByDayGroup');

    var volumeByLastSixHours = facts.dimension(function(d) {
        return d3.time.hour.offset(currentTime, -6);
    });
    var volumeByLastSixHoursGroup = volumeByLastSixHours.group().reduceSum(function(d) { return d.score; });
    print_filter('volumeByLastSixHoursGroup');

    var volumeByLastHour = facts.dimension(function(d) {
        return d3.time.hour(d.date);
    });
    var volumeByLastHourGroup = volumeByLastHour.group().reduceSum(function(d) { return d.score; });
    print_filter('volumeByLastHourGroup');


    /***************************************
     * 	Step4: Create the Visualisations   *
     ***************************************/

    // create visualization
    // TO DO

    d3.json("json/world-countries.json",function(error2,countriesJson){
        //var centre = d3.geo.centroid(statesJson);
        var projection = d3.geo.mercator().scale(500).translate([200,100]);

        worldChart
            .width(1360)
            .height(800)
            .dimension(countries)
            .projection(projection)
            .group(volumeByDayGroup)
            .colors(d3.scale.quantize().range(["#E2F2FF","#C4E4FF","#9ED2FF","#81C5FF","#6BBAFF","#51AEFF","#36A2FF","#1E96FF","#0089FF","#0061B5"]))
            .colorDomain([0,200])
            .colors(function(d){ return d ? worldChart.colors()(d) : '#ccc'; })
            .overlayGeoJson(countriesJson.features,"state",function(d){
                return d.properties.name;
            });

        /****************************
         * Step6: Render the Charts  *
         ****************************/

        dc.renderAll();

    })

});

