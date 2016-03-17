function ParallelCoord(options) {

    var _self = this;

    _self.type = 1;
    
    _self.data = options.data;

    _self.cols = options.cols;

    _self.margin = {
        top: 15,
        right: 5,
        bottom: 20,
        left: 40
    };

    _self.width = width - _self.margin.left - _self.margin.right;

    _self.height = height - _self.margin.top - _self.margin.bottom;

    _self.isNumeric = {};

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


ParallelCoord.prototype.clusterAxis = function (data) {

    var _self = this;

    _self.aggregatedData = {};

    _self.cols.forEach(function (d) {

        //get data domain

        for (var i = 0; i < _self.data.length; i++) {

            var datumValue = _self.data[i]["_id"][d];

        }
    });
}

ParallelCoord.prototype.empty = function (user) {
    
    var _self = this;

    _self.userData[user] = [];
    _self.userClusters[user] = [];
    
    _self.svg.selectAll(".foreground" + user).remove();
}

ParallelCoord.prototype.createUser = function (data, user, clusters) {

    var _self = this;

    _self.userData[user] = data;
    _self.userClusters[user] = clusters;


    _self.svg.selectAll(".foreground" + user).remove();

    var newClusters = [];

    clusters.forEach(function (cluster) {

        var newCluster = [];

        var min = cluster.min;
        var max = cluster.max;

        var keys = _self.cols;

        keys.forEach(function (key) {

            var temp = {};
            temp["key"] = key;
            temp["min"] = min[key];
            temp["max"] = max[key];

            newCluster.push(temp);
        });

        newClusters.push(newCluster);

    });

    console.log(newClusters);

    // Add colored foreground lines for context.

    //    var opacityScale = d3.scale.linear().domain([0, _self.defaultData.length]).range([0, 1]);

    _self.foreground = _self.svg.append("g")
        .attr("class", "foreground" + user)
        .selectAll("path")
        .data(newClusters)
        .enter().append("path")
        .attr("d", function (d) {
            return _self.area(d);
        })
        .style("fill", colorscale(user))
        .style("fill-opacity", function (d, i) {
            return clusters[i]["opacity"];
        })
        .style("stroke", colorscale(user))
        .style("stroke-width", "1px")
        .style("stroke-opacity", 0.1);

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

ParallelCoord.prototype.updateDimensions = function (cols) {

    var _self = this;

    _self.cols = cols;

    var clusters = _self.defaultClusters;

    var data = _self.defaultData;

    // Extract the list of dimensions and create a scale for each.
    _self.x.domain(_self.cols.filter(function (d) {

        if (_self.isNumeric[d]) {

            return (_self.y[d] = d3.scale.linear()
                .domain(d3.extent(_self.data, function (p) {
                    return p["_id"][d];
                }))
                .range([_self.height, 0]));

        } else if (d.toLowerCase().indexOf("date") > 0) {

            return (_self.y[d] = d3.time.scale()
                .domain(d3.extent(_self.data, function (p) {
                    return new Date(p["_id"][d]);
                }))
                .range([_self.height, 0]));


        } else if (d.toLowerCase().indexOf("time") > 0) {

            return (_self.y[d] = d3.time.scale()
                .domain(d3.extent(_self.data, function (p) {
                    return _self.parseTime(p["_id"][d]);
                }))
                .range([_self.height, 0]));


        } else {

            return (_self.y[d] = d3.scale.ordinal()
                .domain(_self.data.map(function (p) {
                    return p["_id"][d];
                }).sort())
                .rangePoints([_self.height, 0]));
        }
    }));

    var newClusters = [];

    clusters.forEach(function (cluster) {

        var newCluster = [];

        var min = cluster.min;
        var max = cluster.max;

        var keys = _self.cols;

        keys.forEach(function (key) {

            var temp = {};
            temp["key"] = key;
            temp["min"] = min[key];
            temp["max"] = max[key];

            newCluster.push(temp);
        });

        newClusters.push(newCluster);

    });

    // Add grey background lines for context.
    var paths = _self.svg
        .select(".background")
        .selectAll("path")
        .data(newClusters);

    paths.enter().append("path")
        .attr("d", function (d) {
            return _self.area(d);
        })
        .style("fill", "#AAA")
        .style("fill-opacity", 0.05);

    paths.exit().remove();

    paths.attr("d", function (d) {
            return _self.area(d);
        })
        .style("fill", "#AAA")
        .style("fill-opacity", 0.05);

    _self.svg.selectAll(".dimension").remove();

    // Add a group element for each dimension.
    var g = _self.g = _self.svg.selectAll(".dimension")
        .data(_self.cols)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function (d) {
            return "translate(" + _self.x(d) + ")";
        })
        .style("fill", "#222");

    // Add an axis and title.
    _self.g.append("g")
        .attr("class", "axis")
        .style("fill", "#aaa")
        .each(function (d) {
            _self.axis[d] = d3.svg.axis().orient("left").scale(_self.y[d]);

            var FONTWIDTH = 6;

            if (_self.y[d].domain().length > _self.height / FONTWIDTH) {

                var skip = Math.round(1 / (_self.height / (FONTWIDTH * _self.y[d].domain().length)));

                _self.axis[d].tickValues(_self.y[d].domain()
                    .filter(function (d, i) {
                        return !(i % skip);
                    }));

            }

            d3.select(this).call(_self.axis[d])
                .style("fill", "#222").style("stroke", "none");
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) {
            return d.replace(/_/g, " ");
        });

    var users = Object.keys(_self.userData);

    if (users) {

        users.forEach(function (user) {

            _self.createUser(_self.userData[user], user, _self.userClusters[user]);

        });

    }

}

ParallelCoord.prototype.createViz = function (clusters, data) {

    var _self = this;

    _self.defaultClusters = clusters;

    _self.defaultData = data;

    var x = _self.x = d3.scale.ordinal()
        .rangePoints([0, _self.width], 1);

    var y = _self.y = {};

    var line = _self.line = d3.svg.line();
    var axis = _self.axis = {};
    var background = _self.background = null;
    var foreground = _self.foreground = new Array(10);

    // Returns the path for a given data point.
    _self.path = function (d) {
        return _self.line(_self.cols.map(function (p) {
            return [_self.x(p), _self.y[p](d["_id"][p])];
        }));
    }

    var svg = _self.svg = d3.select("#content-parallel")
        .attr("width", _self.width + _self.margin.left + _self.margin.right)
        .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
        .append("svg")
        .attr("width", _self.width + _self.margin.left + _self.margin.right)
        .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
        .style("font-size", "0.6em")
        .append("g")
        .attr("transform", "translate(" + _self.margin.left + "," + _self.margin.top + ")");

    // Extract the list of dimensions and create a scale for each.
    _self.x.domain(_self.cols.filter(function (d) {

        if (_self.isNumeric[d]) {

            return (_self.y[d] = d3.scale.linear()
                .domain(d3.extent(_self.data, function (p) {
                    return p["_id"][d];
                }))
                .range([_self.height, 0]));

        } else if (d.toLowerCase().indexOf("date") > 0) {

            return (_self.y[d] = d3.time.scale()
                .domain(d3.extent(_self.data, function (p) {
                    return new Date(p["_id"][d]);
                }))
                .range([_self.height, 0]));

        } else if (d.toLowerCase().indexOf("time") > 0) {

            return (_self.y[d] = d3.time.scale()
                .domain(d3.extent(_self.data, function (p) {
                    return _self.parseTime(p["_id"][d]);
                }))
                .range([_self.height, 0]));


        } else {

            return (_self.y[d] = d3.scale.ordinal()
                .domain(_self.data.map(function (p) {
                    return p["_id"][d];
                }).sort())
                .rangePoints([_self.height, 0]));
        }
    }));


    // drawing area
    var area = _self.area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) {
            return _self.x(d["key"]);
        })
        .y0(function (d) {
            if (d["key"].toLowerCase().indexOf("date") > 0) {
                return _self.y[d["key"]](new Date(d["min"]));
            }

            if (d["key"].toLowerCase().indexOf("time") > 0) {
                return _self.y[d["key"]](_self.parseTime(d["min"]));
            }

            return _self.y[d["key"]](d["min"]);
        })
        .y1(function (d) {
            if (d["key"].toLowerCase().indexOf("date") > 0) {
                return _self.y[d["key"]](new Date(d["max"]));
            }

            if (d["key"].toLowerCase().indexOf("time") > 0) {
                return _self.y[d["key"]](_self.parseTime(d["max"]));
            }

            return _self.y[d["key"]](d["max"]);
        });

    var newClusters = [];

    clusters.forEach(function (cluster) {

        var newCluster = [];

        var min = cluster.min;
        var max = cluster.max;

        var keys = _self.cols;

        keys.forEach(function (key) {

            var temp = {};
            temp["key"] = key;
            temp["min"] = min[key];
            temp["max"] = max[key];

            newCluster.push(temp);
        });

        newClusters.push(newCluster);

    });

    console.log(newClusters);

    // Add grey background lines for context.

    _self.background = _self.svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(newClusters)
        .enter().append("path")
        .attr("d", function (d) {
            return _self.area(d);
        })
        .style("fill", "#AAA")
        .style("fill-opacity", 0.05);

    //    _self.background = _self.svg.append("g")
    //            .attr("class", "background")
    //            .selectAll("path")
    //            .data(_self.data)
    //            .enter().append("path")
    //            .attr("d", _self.path)
    //        .style("fill", "none")
    //        .style("stroke", "#ddd")
    //        .style("stroke-width", "1px")
    //        .style("stroke-opacity", 0.05);

    // Add a group element for each dimension.
    var g = _self.g = _self.svg.selectAll(".dimension")
        .data(_self.cols)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function (d) {
            return "translate(" + _self.x(d) + ")";
        })
        .style("fill", "#222");

    // Add an axis and title.
    _self.g.append("g")
        .attr("class", "axis")
        .style("fill", "#aaa")
        .each(function (d) {
            
            _self.axis[d] = d3.svg.axis().orient("left").scale(_self.y[d]);

            var FONTWIDTH = 6;

            if (_self.y[d].domain().length > _self.height / FONTWIDTH) {

                var skip = Math.round(1 / (_self.height / (FONTWIDTH * _self.y[d].domain().length)));

                _self.axis[d].tickValues(_self.y[d].domain()
                    .filter(function (d, i) {
                        return !(i % skip);
                    }));

            }

            d3.select(this).call(_self.axis[d])
                .style("fill", "#222").style("stroke", "none");
            
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) {
            return d.replace(/_/g, " ");
        });
}