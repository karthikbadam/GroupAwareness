function ScatterPlot(options) {

    var _self = this;

    _self.data = options.data;

    _self.cols = options.cols;

    _self.margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 100
    };

    _self.width = width - _self.margin.left - _self.margin.right;

    _self.height = height - _self.margin.top - _self.margin.bottom;

    _self.isNumeric = {};


    /* Finding if a variable is String or a number */
    /* Future changes: Check if the number is Integer or Float */
    for (var i = 0; i < _self.data.length; i++) {

        for (var j = 0; j < _self.cols.length; j++) {

            var key = _self.cols[j];

            var value = _self.data[i]["_id"][key];

            if (value == "" || value == "NaN" || value == "undefined") {

                continue;

            } else {

                _self.isNumeric[key] = $.isNumeric(value);

            }
        }
    }

}

ScatterPlot.prototype.clusterAxis = function (data) {

    var _self = this;

    _self.aggregatedData = {};

    _self.cols.forEach(function (d) {

        //get data domain

        for (var i = 0; i < _self.data.length; i++) {

            var datumValue = _self.data[i]["_id"][d];


        }

    });


}


ScatterPlot.prototype.createUser = function (data, user, clusters) {

    var _self = this;

//    _self.svg.selectAll(".foreground" + user).remove();
//
//    var newClusters = [];
//
//    clusters.forEach(function (cluster) {
//
//        var newCluster = [];
//
//        var min = cluster.min;
//        var max = cluster.max;
//
//        var keys = _self.cols;
//
//        keys.forEach(function (key) {
//
//            var temp = {};
//            temp["key"] = key;
//            temp["min"] = min[key];
//            temp["max"] = max[key];
//
//            newCluster.push(temp);
//        });
//
//        newClusters.push(newCluster);
//
//    });
//
//    console.log(newClusters);
//
//    // Add colored foreground lines for context.
//
//    var opacityScale = d3.scale.linear().domain([0, _self.defaultData.length]).range([0, 1]);
//
//    _self.foreground = _self.svg.append("g")
//        .attr("class", "foreground" + user)
//        .selectAll("path")
//        .data(newClusters)
//        .enter().append("path")
//        .attr("d", function (d) {
//            return _self.area(d);
//        })
//        .style("fill", colorscale(user))
//        .style("fill-opacity", function (d, i) {
//            return 0.1;
//            return clusters[i].length;
//        })
//        .style("stroke", colorscale(user))
//        .style("stroke-width", "1px")
//        .style("stroke-opacity", 0.1);

    // Add blue foreground lines for focus.
    //    _self.foreground[user] = _self.svg.append("g")
    //        .attr("class", "foreground" + user)
    //        .selectAll(".path" + user)
    //        .data(data)
    //        .enter().append("path")
    //        .attr("style", "path" + user)
    //        .attr("d", _self.path)
    //        .style("fill", "none")
    //        .style("stroke", colorscale(user))
    //        .style("stroke-width", "1px")
    //        .style("stroke-opacity", 1 / Math.pow(data.length + 1, 0.5));

}

function processData(data, col1, col2) {

    var newData = {};

    data.forEach(function (d) {

        var key = d["_id"][col1];

        // if has dates
        if (col1.indexOf("Date") > -1) {
            var cdate = new Date(d["_id"][col1]);
            var cyear = cdate.getFullYear();
            var cmonth = month_names_short[cdate.getMonth()];

            key = cmonth + "/" + cyear;
        }

        if (col2) {
            tempkey = key;
            key = {};
            key[col1] = tempkey;
            key[col2] = d["_id"][col2];
            key = JSON.stringify(key);
        }

        if (key in newData) {

            //count -- can be automated!!!
            newData[key] ++;

        } else {

            newData[key] = 1;
        }
    });

    var returnData = [];

    Object.keys(newData).forEach(function (k) {

        var datum = {};
        if (col2) {
            datum["key"] = JSON.parse(k);
        } else {
            datum[col1] = k;
        }
        datum["value"] = newData[k];
        returnData.push(datum);

    });


    returnData.sort(function (a, b) {
        if (a["value"] <
            b["value"]) return 1;
        return -1;
    });

    console.log(returnData);


    return returnData;
}

ScatterPlot.prototype.createViz = function (clusters, data) {

    var _self = this;

    _self.defaultClusters = clusters;

    _self.defaultData = data;

    var svg = _self.svg = d3.select("#content-scatterplot")
        .attr("width", _self.width + _self.margin.left + _self.margin.right)
        .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
        .append("svg")
        .attr("width", _self.width + _self.margin.left + _self.margin.right)
        .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
        .style("font-size", "0.6em")
        .append("g")
        .attr("transform", "translate(" + _self.margin.left + "," + _self.margin.top + ")");


    for (var i = 0; i < 2; i++) {

        var d = _self.cols[i];

        if (i == 0) {

            if (_self.isNumeric[d]) {

                _self.x = d3.scale.linear()
                    .domain(d3.extent(_self.defaultData, function (p) {
                        return p["_id"][d];
                    }))
                    .range([0, _self.width]);

            } else {

                _self.x = d3.scale.ordinal()
                    .domain(_self.defaultData.map(function (p) {
                        return p["_id"][d];
                    }).sort())
                    .rangePoints([0, _self.width]);
            }

        } else {


            if (_self.isNumeric[d]) {

                _self.y = d3.scale.linear()
                    .domain(d3.extent(_self.defaultData, function (p) {
                        return p["_id"][d];
                    }))
                    .range([_self.height, 0]);

            } else {

                _self.y = d3.scale.ordinal()
                    .domain(_self.defaultData.map(function (p) {
                        return p["_id"][d];
                    }).sort())
                    .rangePoints([_self.height, 7]);
            }
        }
    }

    _self.color = d3.scale.category10();

    _self.xAxis = d3.svg.axis()
        .scale(_self.x)
        .orient("top")
        .tickFormat(function (d) {
            return d;
        });

    _self.yAxis = d3.svg.axis()
        .scale(_self.y)
        .orient("left")
        .tickFormat(function (d) {
            return d;
        });

    _self.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,0)")
        .call(_self.xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", _self.width)
        .attr("y", 15)
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .text(_self.cols[0]);

    _self.svg.append("g")
        .attr("class", "y axis")
        .call(_self.yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x", -6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .text(_self.cols[1]);

    data = processData(data, _self.cols[0], _self.cols[1]);

    _self.radius = d3.scale.linear()
        .domain(d3.extent(data, function (p) {
            return p["value"];
        }))
        .range([5, 10]);

    _self.svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("id", "scatter")
        .attr("class", "dot")
        .attr("r", function (d) {
            return _self.radius(d["value"]);
        })
        .attr("cx", function (d) {
            return _self.x(d["key"][_self.cols[0]]);
        })
        .attr("cy", function (d) {
            return _self.y(d["key"][_self.cols[1]]);
        })
        .style("fill", function (d) {
            //return "#4292c6";
            return "#AAA";
            if (_self.cols.length > 2) {
                return _self.color(d[_self.cols[2]]);
            }
        })
        .style("fill-opacity", function (d) {
            return 0.5;
        });

    //    _self.legend = _self.svg.selectAll(".legend")
    //        .data(_self.color.domain())
    //        .enter().append("g")
    //        .attr("class", "legend")
    //        .attr("transform", function (d, i) {
    //            return "translate(45," + i * 20 + ")";
    //        });

    //    _self.legend.append("rect")
    //        .attr("x", _self.width - 18)
    //        .attr("width", 18)
    //        .attr("height", 18)
    //        .style("fill", _self.color);
    //
    //    _self.legend.append("text")
    //        .attr("x", _self.width - 24)
    //        .attr("y", 9)
    //        .attr("dy", ".35em")
    //        .style("text-anchor", "end")
    //        .text(function (d) {
    //            return d;
    //        });

    //    var newClusters = [];
    //
    //    clusters.forEach(function (cluster) {
    //
    //        var newCluster = [];
    //
    //        var min = cluster.min;
    //        var max = cluster.max;
    //
    //        var keys = _self.cols;
    //
    //        keys.forEach(function (key) {
    //
    //            var temp = {};
    //            temp["key"] = key;
    //            temp["min"] = min[key];
    //            temp["max"] = max[key];
    //
    //            newCluster.push(temp);
    //        });
    //
    //        newClusters.push(newCluster);
    //
    //    });
    //
    //    console.log(newClusters);
    //
    //    // Add grey background lines for context.
    //
    //    _self.background = _self.svg.append("g")
    //        .attr("class", "background")
    //        .selectAll("path")
    //        .data(newClusters)
    //        .enter().append("path")
    //        .attr("d", function (d) {
    //            return _self.area(d);
    //        })
    //        .style("fill", "#AAA")
    //        .style("fill-opacity", 0.05);
    //
    //    // Add a group element for each dimension.
    //    var g = _self.g = _self.svg.selectAll(".dimension")
    //        .data(_self.cols)
    //        .enter().append("g")
    //        .attr("class", "dimension")
    //        .attr("transform", function (d) {
    //            return "translate(" + _self.x(d) + ")";
    //        })
    //        .style("fill", "#222");
    //
    //    // Add an axis and title.
    //    _self.g.append("g")
    //        .attr("class", "axis")
    //        .style("fill", "#aaa")
    //        .each(function (d) {
    //            d3.select(this).call(_self.axis.scale(_self.y[d])).style("fill", "#222").style("stroke", "none");
    //        })
    //        .append("text")
    //        .style("text-anchor", "middle")
    //        .attr("y", -9)
    //        .text(function (d) {
    //            return d.replace(/_/g, " ");
    //        });



}