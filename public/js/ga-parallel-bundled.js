function ParallelCoord(options) {

    var _self = this;

    _self.data = options.data;

    _self.cols = options.cols;

    _self.margin = {
        top: 30,
        right: 10,
        bottom: 10,
        left: 10
    };

    _self.width = width - _self.margin.left - _self.margin.right;

    _self.height = height - _self.margin.top - _self.margin.bottom;

    _self.isNumeric = {};

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


ParallelCoord.prototype.createUser = function (data, user) {

    var _self = this;

    _self.svg.selectAll(".foreground" + user).remove();

    // Add blue foreground lines for focus.
    _self.foreground[user] = _self.svg.append("g")
        .attr("class", "foreground" + user)
        .selectAll(".path" + user)
        .data(data)
        .enter().append("path")
        .attr("style", "path" + user)
        .attr("d", _self.path)
        .style("fill", "none")
        .style("stroke", colorscale(user))
        .style("stroke-width", "3px")
        .style("stroke-opacity", 1 / Math.pow(data.length + 1, 0.5));

}

ParallelCoord.prototype.createViz = function () {

    var _self = this;

    _self.defaultdata = new Array(_self.data.length);

    _self.data.forEach(function (d, i) {

        _self.defaultdata[i] = d["_id"];

    });

    pc = d3.parcoords()("#content")
        .alpha(0.03)
        .mode("queue")
        .data(_self.defaultdata)
        .bundlingStrength(1) // set bundling strength
        .smoothness(0.2)
        .bundleDimension(_self.cols[0])
        .dimensions(function () {
            var dimensions = {};
            _self.cols.forEach(function (d, i) {
                dimensions[d] = {};
                dimensions[d]["type"] = _self.isNumeric[d] ? "number": "string";
            });

            return dimensions;
                
        }())
        .render()
        .brushMode("1D-axes")
        .reorderable()
        .interactive();

}