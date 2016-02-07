var gross = "Worldwide_Gross";
var ratings = "IMDB_Rating";
var budget = "Production_Budget";
var date = "Release_Date";
var director = "Director";
var genre = "Major_Genre";
var sales = "US_DVD_Sales";
var runningTime = "Running_Time_min";
var tomatoRating = "Rotten_Tomatoes_Rating";
var imdbvotes = "IMDB_Votes";

var baryVertices = [gross, budget, tomatoRating, imdbvotes, runningTime, sales];

var width = 0;

var height = 0;

var parseDate = d3.time.format("%d-%b-%y").parse;

var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var colorscale = d3.scale.category10();

// awareness visualization
var baryMap;

// user interactions
var interactions = [{
    query: [{
        index: gross,
        value: [0, 300000000],
        operator: "range",
        logic: "NOT"
    }]
}, {
    query: [{
        index: tomatoRating,
        value: [95, 100],
        operator: "range",
        logic: "CLEAN"
    }]
}];


$(document).ready(function () {

    //creating the layout
    width = $("#content").width();
    height = $("#content").height();

    var query = {
        index1: budget,
        operator1: "all",
        value: "",
        logic: "CLEAN",
        index2: gross,
        operator2: "all",
        value: "",
    };

    createVisualizationfromQueryList([query]);


});

function createVisualizationfromQueryList(queryList) {

    $.ajax({

        type: "GET",
        url: "/getMovies",
        data: {
            data: queryList
        }

    }).done(function (data) {

        data = JSON.parse(data);

        console.log(data);

        baryMap = new BaryMap({
            data: data,
            cols: baryVertices
        });


        baryMap.createMap();

        createUserfromQueryList(interactions[0].query, 1);

        createUserfromQueryList(interactions[1].query, 2);


    });

}

function createUserfromQueryList(queryList, user) {

    $.ajax({

        type: "GET",
        url: "/getMovies",
        data: {
            data: queryList
        }

    }).done(function (data) {

        data = JSON.parse(data);

        console.log(data);

        baryMap.createUser(data, user);

    });

}

function BaryMap(options) {

    var _self = this;

    _self.data = options.data;

    _self.cols = options.cols;

    _self.dataMin = {};

    _self.dataMax = {};

    for (var i = 0; i < _self.data.length; i++) {

        for (var j = 0; j < _self.cols.length; j++) {

            var key = _self.cols[j];

            if (key in _self.dataMin) {
                if (_self.dataMin[key] > _self.data[i]["_id"][key] && _self.data[i]["_id"][key] != null) {
                    _self.dataMin[key] = _self.data[i]["_id"][key];
                }
            } else {
                _self.dataMin[key] = _self.data[i]["_id"][key] ? _self.data[i]["_id"][key] : Infinity;
            }

            if (key in _self.dataMax) {
                if (_self.dataMax[key] < _self.data[i]["_id"][key]) {
                    _self.dataMax[key] = _self.data[i]["_id"][key];
                }
            } else {
                _self.dataMax[key] = _self.data[i]["_id"][key] ? _self.data[i]["_id"][key] : -Infinity;
            }

        }
    }

    _self.dataTrans = new Array(_self.data.length);

    for (var i = 0; i < _self.data.length; i++) {

        var sum = 0;

        _self.dataTrans[i] = {};

        for (var j = 0; j < _self.cols.length; j++) {

            var key = _self.cols[j];

            if (_self.data[i]["_id"][key] == null)
                _self.data[i]["_id"][key] = _self.dataMin[key];

            _self.dataTrans[i][key] = (_self.data[i]["_id"][key] - _self.dataMin[key]) / (_self.dataMax[key] - _self.dataMin[key]);

            sum += _self.dataTrans[i][key];

        }

        for (var j = 0; j < _self.cols.length; j++) {

            var key = _self.cols[j];

            _self.dataTrans[i][key] = _self.dataTrans[i][key] / sum;

        }

    }

    console.log(_self.dataTrans);
}


BaryMap.prototype.transform = function (data) {

    var _self = this;

    var dataTrans = new Array(data.length);

    for (var i = 0; i < data.length; i++) {

        var sum = 0;

        dataTrans[i] = {};

        for (var j = 0; j < _self.cols.length; j++) {

            var key = _self.cols[j];

            if (data[i]["_id"][key] == null)
                data[i]["_id"][key] = _self.dataMin[key];

            dataTrans[i][key] = (data[i]["_id"][key] - _self.dataMin[key]) / (_self.dataMax[key] - _self.dataMin[key]);

            sum += dataTrans[i][key];

        }

        for (var j = 0; j < _self.cols.length; j++) {

            var key = _self.cols[j];

            dataTrans[i][key] = dataTrans[i][key] / sum;

        }

    }

    console.log(dataTrans);

    return dataTrans;
}

BaryMap.prototype.createUser = function (data, user) {

    var _self = this;

    _self.tempData = _self.transform(data);

    for (var i = 0; i < _self.tempData.length; i++) {

        _self.tempData[i].x = 0;
        _self.tempData[i].y = 0;

        for (var j = 0; j < _self.cols.length; j++) {

            var key = _self.cols[j];
            _self.tempData[i].x += _self.tempData[i][key] * _self.vertices[j][0];
            _self.tempData[i].y += _self.tempData[i][key] * _self.vertices[j][1];

        }

    }

    var customHull = d3.geom.hull();
    customHull.x(function (d) {
        return d.x;
    });
    customHull.y(function (d) {
        return d.y;
    });

    var hull = _self.hull = _self.container.append("path").attr("class", "hull");

    _self.hull.datum(customHull(_self.tempData)).attr("d", function (d) {
        console.log(d);
        return "M" + d.map(function (n) {
            return [n.x, n.y]
        }).join("L") + "Z";
    }).style("fill", colorscale(user)).style("fill-opacity", 0.25);

}

BaryMap.prototype.createMap = function () {

    var _self = this;

    var sides = _self.cols.length; // polygon vertices number
    var radius = width / 4 - 50; // polygon radius

    var svg = _self.svg = d3.select('#content')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [-width / 2, -height / 2, width, height].join(' '));

    _self.container = svg.append('g');

    _self.vertices = polygon(0, 0, radius, sides);

    //transform data into x, y

    for (var i = 0; i < _self.dataTrans.length; i++) {

        _self.dataTrans[i].x = 0;
        _self.dataTrans[i].y = 0;

        for (var j = 0; j < _self.cols.length; j++) {

            var key = _self.cols[j];
            _self.dataTrans[i].x += _self.dataTrans[i][key] * _self.vertices[j][0];
            _self.dataTrans[i].y += _self.dataTrans[i][key] * _self.vertices[j][1];

        }

    }

    for (var i = 0; i < _self.vertices.length; i++) {

        _self.container.append('line')
            .attr('x1', _self.vertices[i][0])
            .attr('y1', _self.vertices[i][1])
            .attr('x2', _self.vertices[(i + 1) % _self.cols.length][0])
            .attr('y2', _self.vertices[(i + 1) % _self.cols.length][1])
            .attr('stroke', '#222')
            .attr('stroke-width', "2px")
            .attr('stroke-opacity', 0.7);

    }

    for (var i = 0; i < _self.vertices.length; i++) {

        _self.container.append('circle')
            .attr('r', 8)
            .attr('cx', _self.vertices[i][0])
            .attr('cy', _self.vertices[i][1])
            .attr('fill', '#4292c6');

        _self.container.append('text')
            .attr('x', function () {
                if (i >= _self.vertices.length / 2) {
                    return _self.vertices[i][0] - 10;
                } else {
                    return _self.vertices[i][0] + 10;
                }
            })
            .attr('y', _self.vertices[i][1])
            .style('text-anchor', function () {
                if (i >= _self.vertices.length / 2) {
                    return "end";
                } else {
                    return "start";
                }
            })
            .attr('fill', '#222')
            .style('font-size', "14px")
            .text(_self.cols[i].replace(/_/g, " "));
 
    }

    for (var i = 0; i < _self.dataTrans.length; i++) {

        _self.container.append('circle')
            .attr('r', 3)
            .attr('cx', _self.dataTrans[i].x)
            .attr('cy', _self.dataTrans[i].y)
            .attr('fill', '#666')
            .attr('fill-opacity', 0.3);
    }

    /* GIVEN x and y, the radius and the number of polygon sides RETURNS AN ARRAY OF VERTICE COORDINATES */
    function polygon(x, y, radius, sides) {
        var crd = [];

        /* 1 SIDE CASE */
        if (sides == 1)
            return [[x, y]];

        /* > 1 SIDE CASEs */
        for (var i = 0; i < sides; i++) {
            crd.push([(x + (Math.sin(2 * Math.PI * i / sides) * radius)), (y - (Math.cos(2 * Math.PI * i / sides) * radius))]);
        }
        return crd;
    }

}