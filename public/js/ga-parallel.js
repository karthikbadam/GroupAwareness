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

    _self.width = width - margin.left - margin.right;

    _self.height = height - margin.top - margin.bottom;

}


ParallelCoord.prototype.transform = function (data) {

    var _self = this;

    return data;
}

ParallelCoord.prototype.createUser = function (data, user) {

    var _self = this;

}

BaryMap.prototype.createViz = function () {

    var _self = this;

    var x = _self.x = d3.scale.ordinal().rangePoints([0, width], 1);
    var y = _self.y = {};

    var line = _self.line = d3.svg.line();
    var axis = _self.axis = d3.svg.axis().orient("left");
    var background = _self.background = null;
    var foreground = _self.foreground = null;

    var svg = _self.svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("cars.csv", function (error, cars) {

        // Extract the list of dimensions and create a scale for each.
        x.domain(dimensions = d3.keys(cars[0]).filter(function (d) {
            return d != "name" && (y[d] = d3.scale.linear()
                .domain(d3.extent(cars, function (p) {
                    return +p[d];
                }))
                .range([height, 0]));
        }));

        // Add grey background lines for context.
        background = svg.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(cars)
            .enter().append("path")
            .attr("d", path);

        // Add blue foreground lines for focus.
        foreground = svg.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(cars)
            .enter().append("path")
            .attr("d", path);

        // Add a group element for each dimension.
        var g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function (d) {
                return "translate(" + x(d) + ")";
            });

        // Add an axis and title.
        g.append("g")
            .attr("class", "axis")
            .each(function (d) {
                d3.select(this).call(axis.scale(y[d]));
            })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function (d) {
                return d;
            });

        // Add and store a brush for each axis.
        g.append("g")
            .attr("class", "brush")
            .each(function (d) {
                d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush));
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    });

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function (p) {
            return [x(p), y[p](d[p])];
        }));
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        var actives = dimensions.filter(function (p) {
                return !y[p].brush.empty();
            }),
            extents = actives.map(function (p) {
                return y[p].brush.extent();
            });
        foreground.style("display", function (d) {
            return actives.every(function (p, i) {
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            }) ? null : "none";
        });
    }


}