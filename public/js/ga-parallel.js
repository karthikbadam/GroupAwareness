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

}


ParallelCoord.prototype.transform = function (data) {

    var _self = this;

    return data;
}

ParallelCoord.prototype.createUser = function (data, user) {

    var _self = this;

}

ParallelCoord.prototype.createViz = function () {

    var _self = this;

    var x = _self.x = d3.scale.ordinal().rangePoints([0, _self.width], 1);
    var y = _self.y = {};

    var line = _self.line = d3.svg.line();
    var axis = _self.axis = d3.svg.axis().orient("left");
    var background = _self.background = null;
    var foreground = _self.foreground = null;
    
     // Returns the path for a given data point.
    _self.path = function (d) {
        return _self.line(_self.cols.map(function (p) {
            return [_self.x(p), _self.y[p](d["_id"][p])];
        }));
    }

    // Handles a brush event, toggling the display of foreground lines.
    _self.brush = function() {
        var actives = _self.cols.filter(function (p) {
                return !_self.y[p].brush.empty();
            }),
            extents = actives.map(function (p) {
                return _self.y[p].brush.extent();
            });
        _self.foreground.style("display", function (d) {
            return actives.every(function (p, i) {
                return extents[i][0] <= d["_id"][p] && d["_id"][p] <= extents[i][1];
            }) ? null : "none";
        });
    }

    var svg = _self.svg = d3.select("#content").append("svg")
        .attr("width", _self.width + _self.margin.left + _self.margin.right)
        .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + _self.margin.left + "," + _self.margin.top + ")");

    // Extract the list of dimensions and create a scale for each.
    _self.x.domain(_self.cols.filter(function (d) {
        return (_self.y[d] = d3.scale.linear()
            .domain(d3.extent(_self.data, function (p) {
                return +p["_id"][d];
            }))
            .range([_self.height, 0]));
    }));

    // Add grey background lines for context.
    _self.background = _self.svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(_self.data)
        .enter().append("path")
        .attr("d", _self.path)
        .style("fill", "none")
        .style("stroke", "#ddd")
        .style("stroke-width", "1px")
        .style("stroke-opacity", 0.2);

    // Add blue foreground lines for focus.
    _self.foreground = _self.svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(_self.data)
        .enter().append("path")
        .attr("d", _self.path)
        .style("fill", "none")
        .style("stroke", "#4292c6")
        .style("stroke-width", "1px")
        .style("stroke-opacity", 0.4);

    // Add a group element for each dimension.
    var g = _self.g = _self.svg.selectAll(".dimension")
        .data(_self.cols)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function (d) {
            return "translate(" + _self.x(d) + ")";
        });

    // Add an axis and title.
    _self.g.append("g")
        .attr("class", "axis")
        .each(function (d) {
            d3.select(this).call(_self.axis.scale(_self.y[d]));
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) {
            return d.replace(/_/g, " ");
        });

    // Add and store a brush for each axis.
    _self.g.append("g")
        .attr("class", "brush")
        .each(function (d) {
            d3.select(this).call(_self.y[d].brush = d3.svg.brush().y(_self.y[d]).on("brushend", _self.brush));
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);


}