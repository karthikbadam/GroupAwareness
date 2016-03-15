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

    var allKeys = Object.keys(crimeMeta);
    for (var i = 0; i < _self.data.length; i++) {

        for (var j = 0; j < allKeys.length; j++) {

            var key = crimeMeta[allKeys[j]];

            var value = _self.data[i]["_id"][key];

            if (value == "" || value == "NaN" || value == "undefined") {

                continue;

            } else {

                _self.isNumeric[key] = $.isNumeric(value);

            }
        }
    }

    _self.userData = {};
    _self.userClusters = {};

    _self.parseTime = d3.time.format("%H:%M:%S").parse;

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

    _self.tempData = _self.userData[user] = data;
    _self.userClusters[user] = clusters;

    _self.svg.selectAll(".hull" + user).remove();


    clusters.forEach(function (cluster) {
        _self.currentClusterData = cluster["data"];

        for (var i = 0; i < _self.currentClusterData.length; i++) {

            var xValue = _self.currentClusterData[i][_self.cols[0]];

            if (_self.cols[0].toLowerCase().indexOf("date") > 0) {
                xValue = new Date(xValue);
            }

            if (_self.cols[0].toLowerCase().indexOf("time") > 0) {
                xValue = _self.parseTime(xValue);
            }

            var yValue = _self.currentClusterData[i][_self.cols[1]];

            if (_self.cols[1].toLowerCase().indexOf("date") > 0) {
                yValue = new Date(yValue);
            }

            if (_self.cols[1].toLowerCase().indexOf("time") > 0) {
                yValue = _self.parseTime(yValue);
            }

            _self.currentClusterData[i].x = _self.x(xValue);
            _self.currentClusterData[i].y = _self.y(yValue);

        }

        var customHull = d3.geom.hull();
        customHull.x(function (d) {
            return d.x;
        });
        customHull.y(function (d) {
            return d.y;
        });

        var hull = _self.hull = _self.svg.append("path").attr("class", "hull" + user);

        _self.hull.datum(customHull(_self.currentClusterData))
            .attr("d", function (d) {
                console.log(d);

                if (d.length == 0) {
                    _self.svg.append("rect")
                        .attr("class", "hull" + user)
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr("x", _self.currentClusterData[0].x - 5)
                        .attr("y", _self.currentClusterData[0].y - 5)
                        .attr("fill", colorscale(user))
                        .style("fill-opacity", 0.2)
                        .style("stroke-width", "1px")
                        .style("stroke-opacity", 0.2)
                        .style("stroke-linejoin", "round")
                        .style("stroke-alignment", "outer")
                        .style("stroke", colorscale(user));
                }

                if (d.length == 2) {
                    if (d[0].x == d[1].x && d[0].y == d[1].y) {

                        _self.svg.append("rect")
                            .attr("class", "hull" + user)
                            .attr("width", 10)
                            .attr("height", 10)
                            .attr("x", d[0].x - 5)
                            .attr("y", d[0].y - 5)
                            .style("fill", colorscale(user))
                            .style("fill-opacity", 0.2)
                            .style("stroke-width", "1px")
                            .style("stroke-opacity", 0.2)
                            .style("stroke-linejoin", "round")
                            .style("stroke-alignment", "outer")
                            .style("stroke", colorscale(user));

                    } else {

                        var newD = [];
                        newD.push({
                            x: d[0].x + 5,
                            y: d[0].y + 5
                        });
                        newD.push({
                            x: d[0].x - 5,
                            y: d[0].y + 5
                        });

                        newD.push({
                            x: d[0].x - 5,
                            y: d[0].y - 5
                        });
                        newD.push({
                            x: d[0].x + 5,
                            y: d[0].y - 5
                        });

                        return "M" + newD.map(function (n, i) {
                            return [n.x, n.y];
                        }).join("L") + "Z";
                    }

                }

                return "M" + d.map(function (n) {
                    return [n.x, n.y]
                }).join("L") + "Z";

            })
            .style("fill", colorscale(user))
            .style("fill-opacity", 0.2)
            .style("stroke-width", "1px")
            .style("stroke-opacity", 0.2)
            .style("stroke-linejoin", "round")
            .style("stroke-alignment", "outer")
            .style("stroke", colorscale(user));

    });

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

ScatterPlot.prototype.updateDimensions = function (cols) {

    var _self = this;

    _self.cols = cols;

    var data = _self.defaultData;

    for (var i = 0; i < 2; i++) {

        var d = _self.cols[i];

        if (i == 0) {

            if (_self.isNumeric[d]) {

                _self.x = d3.scale.linear()
                    .domain(d3.extent(_self.defaultData, function (p) {
                        return p["_id"][d];
                    }))
                    .range([0, _self.width]);

            } else if (d.toLowerCase().indexOf("date") > 0) {

                _self.x = d3.time.scale()
                    .domain(d3.extent(_self.data, function (p) {
                        return new Date(p["_id"][d]);
                    }))
                    .range([0, _self.width]);

            } else if (d.toLowerCase().indexOf("time") > 0) {

                _self.x = d3.time.scale()
                    .domain(d3.extent(_self.data, function (p) {
                        return _self.parseTime(p["_id"][d]);
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

            } else if (d.toLowerCase().indexOf("date") > 0) {

                _self.y = d3.time.scale()
                    .domain(d3.extent(_self.data, function (p) {
                        return new Date(p["_id"][d]);
                    }))
                    .range([_self.height, 0]);

            } else if (d.toLowerCase().indexOf("time") > 0) {

                _self.y = d3.time.scale()
                    .domain(d3.extent(_self.data, function (p) {
                        return _self.parseTime(p["_id"][d]);
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

    _self.xAxis = d3.svg.axis()
        .scale(_self.x)
        .orient("top");

    _self.yAxis = d3.svg.axis()
        .scale(_self.y)
        .orient("left");

    var FONTWIDTH = 6;

    if (_self.x.domain().length > _self.height / FONTWIDTH) {

        var skip = Math.round(1 / (_self.height / (FONTWIDTH * _self.x.domain().length)));

        _self.xAxis.tickValues(_self.x.domain()
            .filter(function (d, i) {
                return !(i % skip);
            }));

    }

    if (_self.y.domain().length > _self.height / FONTWIDTH) {

        var skip = Math.round(1 / (_self.height / (FONTWIDTH * _self.y.domain().length)));

        _self.yAxis.tickValues(_self.y.domain()
            .filter(function (d, i) {
                return !(i % skip);
            }));

    }

    _self.svg.select(".x.axis")
        .attr("transform", "translate(0,0)")
        .call(_self.xAxis)
        .select(".label")
        .attr("x", _self.width)
        .attr("y", 15)
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .text(_self.cols[0]);

    _self.svg.select(".y.axis")
        .call(_self.yAxis)
        .select(".label")
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
        .range([2, 10]);

    var dots = _self.svg.selectAll(".dot")
        .data(data);

    dots.enter().append("circle")
        .attr("id", "scatter")
        .attr("class", "dot")
        .attr("r", function (d) {
            return _self.radius(d["value"]);
        })
        .attr("cx", function (d) {
            if (_self.cols[0].toLowerCase().indexOf("date") > 0) {
                return _self.x(new Date(d["key"][_self.cols[0]]));
            }

            if (_self.cols[0].toLowerCase().indexOf("time") > 0) {
                return _self.x(_self.parseTime(d["key"][_self.cols[0]]));
            }
            return _self.x(d["key"][_self.cols[0]]);
        })
        .attr("cy", function (d) {
            if (_self.cols[1].toLowerCase().indexOf("date") > 0) {
                return _self.y(new Date(d["key"][_self.cols[1]]));
            }

            if (_self.cols[1].toLowerCase().indexOf("time") > 0) {
                return _self.y(_self.parseTime(d["key"][_self.cols[1]]));
            }
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
            return 0.1;
        });

    dots.exit().remove();

    dots.attr("r", function (d) {
            return _self.radius(d["value"]);
        })
        .attr("cx", function (d) {
            if (_self.cols[0].toLowerCase().indexOf("date") > 0) {
                return _self.x(new Date(d["key"][_self.cols[0]]));
            }

            if (_self.cols[0].toLowerCase().indexOf("time") > 0) {
                return _self.x(_self.parseTime(d["key"][_self.cols[0]]));
            }
            return _self.x(d["key"][_self.cols[0]]);
        })
        .attr("cy", function (d) {
            if (_self.cols[1].toLowerCase().indexOf("date") > 0) {
                return _self.y(new Date(d["key"][_self.cols[1]]));
            }

            if (_self.cols[1].toLowerCase().indexOf("time") > 0) {
                return _self.y(_self.parseTime(d["key"][_self.cols[1]]));
            }
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
            return 0.1;
        });

    var users = Object.keys(_self.userData);

    if (users) {

        users.forEach(function (user) {

            _self.createUser(_self.userData[user], user, _self.userClusters[user]);

        });

    }

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

            } else if (d.toLowerCase().indexOf("date") > 0) {

                _self.x = d3.time.scale()
                    .domain(d3.extent(_self.data, function (p) {
                        return new Date(p["_id"][d]);
                    }))
                    .range([0, _self.width]);

            } else if (d.toLowerCase().indexOf("time") > 0) {

                _self.x = d3.time.scale()
                    .domain(d3.extent(_self.data, function (p) {
                        return _self.parseTime(p["_id"][d]);
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

            } else if (d.toLowerCase().indexOf("date") > 0) {

                _self.y = d3.time.scale()
                    .domain(d3.extent(_self.data, function (p) {
                        return new Date(p["_id"][d]);
                    }))
                    .range([_self.height, 0]);

            } else if (d.toLowerCase().indexOf("time") > 0) {

                _self.y = d3.time.scale()
                    .domain(d3.extent(_self.data, function (p) {
                        return _self.parseTime(p["_id"][d]);
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
        .orient("top");

    _self.yAxis = d3.svg.axis()
        .scale(_self.y)
        .orient("left");

    var FONTWIDTH = 6;

    if (_self.x.domain().length > _self.height / FONTWIDTH) {

        var skip = Math.round(1 / (_self.height / (FONTWIDTH * _self.x.domain().length)));

        _self.xAxis.tickValues(_self.x.domain()
            .filter(function (d, i) {
                return !(i % skip);
            }));

    }

    if (_self.y.domain().length > _self.height / FONTWIDTH) {

        var skip = Math.round(1 / (_self.height / (FONTWIDTH * _self.y.domain().length)));

        _self.yAxis.tickValues(_self.y.domain()
            .filter(function (d, i) {
                return !(i % skip);
            }));

    }

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
        .range([2, 10]);

    var dots = _self.svg.selectAll(".dot")
        .data(data);

    dots.enter().append("circle")
        .attr("id", "scatter")
        .attr("class", "dot")
        .attr("r", function (d) {
            return _self.radius(d["value"]);
        })
        .attr("cx", function (d) {
            if (_self.cols[0].toLowerCase().indexOf("date") > 0) {
                return _self.x(new Date(d["key"][_self.cols[0]]));
            }

            if (_self.cols[0].toLowerCase().indexOf("time") > 0) {
                return _self.x(_self.parseTime(d["key"][_self.cols[0]]));
            }
            return _self.x(d["key"][_self.cols[0]]);
        })
        .attr("cy", function (d) {
            if (_self.cols[1].toLowerCase().indexOf("date") > 0) {
                return _self.y(new Date(d["key"][_self.cols[1]]));
            }

            if (_self.cols[1].toLowerCase().indexOf("time") > 0) {
                return _self.y(_self.parseTime(d["key"][_self.cols[1]]));
            }
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
            return 0.1;
        });
}