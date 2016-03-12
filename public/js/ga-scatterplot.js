function ScatterPlot(options) {

    var _self = this;

    _self.data = options.data;

    _self.cols = options.cols;

    _self.margin = {
        top: 30,
        right: 5,
        bottom: 10,
        left: 40
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

    var opacityScale = d3.scale.linear().domain([0, _self.defaultData.length]).range([0, 1]);

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
            return 0.1;
            return clusters[i].length;
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

ScatterPlot.prototype.createViz = function (clusters) {

    var _self = this;

    _self.defaultClusters = clusters;

    _self.defaultData = data;


    var svg = _self.svg = d3.select("#content-parallel")
        .attr("width", _self.width + _self.margin.left + _self.margin.right)
        .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
        .append("svg")
        .attr("width", _self.width + _self.margin.left + _self.margin.right)
        .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + _self.margin.left + "," + _self.margin.top + ")");

    
    _self.cols

    if (_self.isNumeric[d]) {

        return (_self.y[d] = d3.scale.linear()
            .domain(d3.extent(_self.data, function (p) {
                return p["_id"][d];
            }))
            .range([_self.height, 0]));

    } else {

        return (_self.y[d] = d3.scale.ordinal()
            .domain(_self.data.map(function (p) {
                return p["_id"][d];
            }).sort())
            .rangePoints([_self.height, 0]));
    }


    _self.x = d3.scale.linear()
        .range([0, _self.width]);

    _self.y = d3.scale.linear()
        .range([_self.height, 0]);

    _self.color = d3.scale.category10();

    _self.xAxis = d3.svg.axis()
        .scale(_self.x)
        .orient("bottom")
        .tickFormat(function (d) {
            return _self.formatValue(d * d)
        });

    _self.yAxis = d3.svg.axis()
        .scale(_self.y)
        .orient("left")
        .tickFormat(function (d) {
            return _self.formatValue(d * d)
        });

    _self.svg = d3.select("#" + _self.parentId).append("svg")
        .attr("width", _self.width + _self.margin.left + _self.margin.right)
        .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + _self.margin.left + "," + _self.margin.top + ")");

    _self.x.domain(d3.extent(_self.targetData, function (d) {
        return Math.pow(d["_id"][_self.cols[0]], 0.5);

        return d["_id"][_self.cols[0]];

        return Math.log(d["_id"][_self.cols[0]]) > 0 ? Math.log(d["_id"][_self.cols[0]]) : 0;

    })).nice();

    _self.y.domain(d3.extent(_self.targetData, function (d) {
        return Math.pow(d["_id"][_self.cols[1]], 0.5);
        return d["_id"][_self.cols[1]];
        return Math.log(d["_id"][_self.cols[1]]) > 0 ? Math.log(d["_id"][_self.cols[1]]) : 0;
    })).nice();

    _self.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + _self.height + ")")
        .call(_self.xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", _self.width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .text("Budget ($)");

    _self.svg.append("g")
        .attr("class", "y axis")
        .call(_self.yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .text("Gross ($)");

    _self.svg.selectAll(".dot")
        .data(_self.targetData)
        .enter().append("circle")
        .attr("id", "scatter")
        .attr("class", "dot")
        .attr("r", 2.5)
        .attr("cx", function (d) {
            return _self.x(Math.pow(d["_id"][_self.cols[0]], 0.5));
            return _self.x(d["_id"][_self.cols[0]]);
            return _self.x(Math.log(d["_id"][_self.cols[0]]) > 0 ? Math.log(d["_id"][_self.cols[0]]) : 0);
        })
        .attr("cy", function (d) {
            return _self.y(Math.pow(d["_id"][_self.cols[1]], 0.5));
            return _self.y(d["_id"][_self.cols[1]]);
            return _self.y(Math.log(d["_id"][_self.cols[1]]) > 0 ? Math.log(d["_id"][_self.cols[1]]) : 0);
        })
        .style("fill", function (d) {
            //return "#4292c6";
            return _self.color(Math.ceil(d["_id"][ratings]));
        })
        .style("fill-opacity", function (d) {
            return d['_id'][ratings] / 20;
        });

    _self.legend = _self.svg.selectAll(".legend")
        .data(_self.color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(45," + i * 20 + ")";
        });

    _self.legend.append("rect")
        .attr("x", _self.width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", _self.color);

    _self.legend.append("text")
        .attr("x", _self.width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return d;
        });









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