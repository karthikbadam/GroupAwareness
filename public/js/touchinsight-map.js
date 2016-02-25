function Map(options) {

    var _self = this;

    //center lat: 39.2854197594374, lng: -76.61109924316406, zoom = 12
    _self.parentId = options.parentId;

    _self.cols = options.cols;

    _self.margin = {
        top: 20,
        right: 0,
        bottom: 30,
        left: 30
    };

    _self.width = options.width - _self.margin.left - _self.margin.right;

    _self.height = options.height - _self.margin.top - _self.margin.bottom;

    var map = _self.map =
        new L.Map(_self.parentId, {
            center: [39.2854197594374, -76.61109924316406],
            zoom: 11
        })
        .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));

    var handler = function (e) {

        _self.updateVisualization(_self.data, true);
    }

    _self.zoom = 11;

    _self.map.on('zoomstart', handler);
    _self.map.on('zoomend', handler);
    _self.map.on('viewreset', handler);
    _self.map.on('autopanstart', handler);


}

function computeZoom(ne, sw, pixelWidth) {
    var GLOBE_WIDTH = 256; // a constant in Google's map projection
    var west = sw.lng;
    var east = ne.lng;
    var angle = east - west;
    if (angle < 0) {
        angle += 360;
    }
    var zoom = Math.round(Math.log(pixelWidth * 360 / angle / GLOBE_WIDTH) / Math.LN2);

    return zoom;
}


Map.prototype.updateVisualization = function (data, flag) {

    var _self = this;

    _self.data = data;

    var opacity = (_self.map.getZoom() + 2 - 11) / 10;

    _self.right = d3.max(data, function (d) {
        return d["key"][_self.cols[0]];
    });
    _self.left = d3.min(data, function (d) {
        return d["key"][_self.cols[0]];
    });
    _self.top = d3.max(data, function (d) {
        return d["key"][_self.cols[1]];
    });
    _self.bottom = d3.min(data, function (d) {
        return d["key"][_self.cols[1]];
    });

    _self.bottomRight = _self.map.latLngToLayerPoint(new L.LatLng(_self.left, _self.top));
    _self.topLeft = _self.map.latLngToLayerPoint(new L.LatLng(_self.right, _self.bottom));

    _self.marginLeft = _self.topLeft.x - 5;
    _self.marginTop = _self.topLeft.y - 5;
    
    if (flag == true) {
    
    } else {
        _self.map.fitBounds(new L.LatLngBounds(new L.LatLng(_self.left, _self.top), new L.LatLng(_self.right, _self.bottom)));

    }

    if (!_self.svg || _self.svg.select("circle").empty()) {

        d3.select(".leaflet-tile-pane").style("opacity", 0.7);

        var svg = _self.svg = d3.select(_self.map.getPanes().overlayPane).append("svg")
            .attr("width", _self.bottomRight.x - _self.topLeft.x + 10)
            .attr("height", _self.bottomRight.y - _self.topLeft.y + 10)
            .style("margin-left", _self.marginLeft + "px")
            .style("margin-top", _self.marginTop + "px")
            .style("background", "transparent");

        //append circle
        _self.svg
            .selectAll(".spot")
            .data(data)
            .enter().append("circle")
            .attr("class", "spot")
            .style("pointer-events", "none")
            .attr("cx", function (d, i) {
                var loc = d;

                if (loc && loc["key"][_self.cols[0]]) {
                    var point = _self.map.latLngToLayerPoint(new L.LatLng(loc["key"][_self.cols[0]], loc["key"][_self.cols[1]]));
                    return point.x - _self.marginLeft;
                }

                return -10;
            }).attr("cy", function (d, i) {

                var loc = d;


                if (loc && loc["key"][_self.cols[1]]) {
                    var point = _self.map.latLngToLayerPoint(new L.LatLng(loc["key"][_self.cols[0]], loc["key"][_self.cols[1]]));
                    return point.y - _self.marginTop;
                }

                return -10;
            })
            .attr("fill", function (d) {
                return "#4292c6";
            })
            .attr("fill-opacity", 0.5)
            .attr("stroke", function (d) {
                return "transparent";
            })
            .attr("stroke-opacity", 0.1)
            .attr("stroke-width", "1px")
            .attr("r", function (d) {
                return (2 + Math.pow(d[_self.cols[2]], 0.5)) + "px";
            });

    } else {

        _self.svg.attr("width", _self.bottomRight.x - _self.topLeft.x + 10)
            .attr("height", _self.bottomRight.y - _self.topLeft.y + 10)
            .style("margin-left", _self.marginLeft + "px")
            .style("margin-top", _self.marginTop + "px")

        var crimeSpots = _self.svg
            .selectAll(".spot")
            .data(data);

        crimeSpots.exit().attr("r", "0.1px").transition().delay(1000);

        crimeSpots.enter().append("circle")
            .transition().delay(1000)
            .attr("class", "spot")
            .style("pointer-events", "none")
            .attr("cx", function (d, i) {
                var loc = d;

                if (loc && loc["key"][_self.cols[0]]) {
                    var point = _self.map.latLngToLayerPoint(new L.LatLng(loc["key"][_self.cols[0]], loc["key"][_self.cols[1]]));
                    return point.x - _self.marginLeft;
                }

                return -10;
            }).attr("cy", function (d, i) {

                var loc = d;


                if (loc && loc["key"][_self.cols[1]]) {
                    var point = _self.map.latLngToLayerPoint(new L.LatLng(loc["key"][_self.cols[0]], loc["key"][_self.cols[1]]));
                    return point.y - _self.marginTop;
                }

                return -10;
            })
            .attr("fill", function (d) {
                return "#4292c6";
            })
            .attr("fill-opacity", 0.5)
            .attr("stroke", function (d) {
                return "transparent";
            })
            .attr("stroke-opacity", 0.1)
            .attr("stroke-width", "1px")
            .attr("r", function (d) {
                return (2 + Math.pow(d[_self.cols[2]], 0.5)) + "px";
            });

        crimeSpots.attr("cx", function (d, i) {
                var loc = d;

                if (loc && loc["key"][_self.cols[0]]) {
                    var point = _self.map.latLngToLayerPoint(new L.LatLng(loc["key"][_self.cols[0]], loc["key"][_self.cols[1]]));
                    return point.x - _self.marginLeft;
                }

                return -10;
            }).attr("cy", function (d, i) {

                var loc = d;


                if (loc && loc["key"][_self.cols[1]]) {
                    var point = _self.map.latLngToLayerPoint(new L.LatLng(loc["key"][_self.cols[0]], loc["key"][_self.cols[1]]));
                    return point.y - _self.marginTop;
                }

                return -10;
            })
            .attr("fill", function (d) {
                return "#4292c6";
            })
            .attr("fill-opacity", 0.5)
            .attr("stroke", function (d) {
                return "transparent";
            })
            .attr("stroke-opacity", 0.1)
            .attr("stroke-width", "1px")
            .attr("r", function (d) {
                return (2 + Math.pow(d[_self.cols[2]], 0.5)) + "px";
            });

    }


}