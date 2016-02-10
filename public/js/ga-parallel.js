function ParallelCoord(options) {

    var _self = this;

    _self.data = options.data;

    _self.cols = options.cols;
    
    _self.margin = {top: 30, right: 10, bottom: 10, left: 10};
    
    _self.width = width - margin.left - margin.right;
    
    _self.height = height - margin.top - margin.bottom;

}


ParallelCoord.prototype.transform = function (data) {

    var _self = this;

    return data;
}

ParallelCoord.prototype.createUser = function (data, user) {

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

BaryMap.prototype.createViz = function () {

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