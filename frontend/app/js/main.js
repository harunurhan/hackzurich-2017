var width = window.innerWidth ;//960, //1280 
height = window.innerHeight;//800;
var scale = 300;
var feature;

var projection = d3.geo.azimuthal()
    .scale(scale)
    .origin([-71.03,42.37])
    .mode("orthographic")
    .translate([400, 350]);

var circle = d3.geo.greatCircle()
    .origin(projection.origin());

// TODO fix d3.geo.azimuthal to be consistent with scale
var scale = {
    orthographic: scale,
    stereographic: scale,
    gnomonic: scale,
    equidistant: scale / Math.PI * 2,
    equalarea: scale / Math.SQRT2
};

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#body").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "atlas")
    .on("mousedown", mousedown);



//	var d3json = function() {

d3.json("json/world-countries.json", function (collection) {
    feature = svg.selectAll("path")
        .data(collection.features)
        .enter()
        .append("svg:path")
        .attr('class', 'states')
        .attr("id", stateId)
        .attr("d", clip)
        .on('mouseover', function (d) {
            var name = d.properties.name;
            return document.getElementById('name').innerHTML = name;
        });


    feature.append("svg:title")
        .text(function (d) {
            return d.properties.name;
        });

    d3.json("json/input.json", function (newscollection) {
        console.log(news);
        $.each(newscollection, function () {
            var feature = $('#state-' + this.geography);
            if (this.score < 0.4) {
                feature.attr('class', 'states negative');
            } else if (this.score >= 0.4 && this.score < 0.6) {
                feature.attr('class', 'states neutral');
            } else if (this.score >= 0.6) {
                feature.attr('class', 'states positive');
            }
        });
    });

});


d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

d3.select("select").on("change", function() {
    projection.mode(this.value).scale(scale[this.value]);
    refresh(750);
});

var m0,
    o0;

function mousedown() {
    m0 = [d3.event.pageX, d3.event.pageY];
    o0 = projection.origin();
    d3.event.preventDefault();
}

function mousemove() {
    if (m0) {
        var m1 = [d3.event.pageX, d3.event.pageY],
            o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8];
        projection.origin(o1);
        circle.origin(o1)
        refresh();
    }
}

function mouseup() {
    if (m0) {
        mousemove();
        m0 = null;
    }
}

function refresh(duration) {
    (duration ? feature.transition().duration(duration) : feature).attr("d", clip);
}

function clip(d) {
    return path(circle.clip(d));
}
function stateId(d) {
    return "state-"+d.id;
}

var news = [];

(function () {
    const socket = io('localhost:8080');
    socket.on('feed', data => {
        news = data;
    });

})();

setInterval(function(){
    $.each(news, function () {
        $.each(this, function(){

            var feature = $('#state-' + this.geography);

            if (this.score < 0.4) {
                feature.attr('class', 'states negative');
            } else if (this.score >= 0.4 && this.score < 0.6) {
                feature.attr('class', 'states neutral');
            } else if (this.score >= 0.6) {
                feature.attr('class', 'states positive');
            }
        });

    });
}, 1500);