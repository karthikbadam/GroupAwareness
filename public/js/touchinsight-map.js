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
        //e.preventDefault();
        //e.stopPropagation();
        _self.updateVisualization(_self.data);
    }

    _self.map.on('movestart', handler);
    _self.map.on('moveend', handler);
    _self.map.on('dragstart', handler);
    _self.map.on('dragend', handler);
    _self.map.on('zoomstart', handler);
    _self.map.on('zoomend', handler);
    //_self.map.on('viewreset', handler);
    //_self.map.on('autopanstart', handler);


}

Map.prototype.updateVisualization = function (data) {

    var _self = this;

    _self.data = data;
    
    var opacity = (_self.map.getZoom() + 2 - 11)/10;

    if (!_self.svg || _self.svg.select("circle").empty()) {
        
        d3.select(".leaflet-tile-pane").style("opacity", 0.7);

        var svg = _self.svg = d3.select(_self.map.getPanes().overlayPane).append("svg")
            .attr("width", _self.width + _self.margin.left + _self.margin.right)
            .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
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
                    return point.x;
                }

                return -10;
            }).attr("cy", function (d, i) {

                var loc = d;


                if (loc && loc["key"][_self.cols[1]]) {
                    var point = _self.map.latLngToLayerPoint(new L.LatLng(loc["key"][_self.cols[0]], loc["key"][_self.cols[1]]));
                    return point.y;
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
                    return point.x;
                }

                return -10;
            }).attr("cy", function (d, i) {

                var loc = d;


                if (loc && loc["key"][_self.cols[1]]) {
                    var point = _self.map.latLngToLayerPoint(new L.LatLng(loc["key"][_self.cols[0]], loc["key"][_self.cols[1]]));
                    return point.y;
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
                    return point.x;
                }

                return -10;
            }).attr("cy", function (d, i) {

                var loc = d;


                if (loc && loc["key"][_self.cols[1]]) {
                    var point = _self.map.latLngToLayerPoint(new L.LatLng(loc["key"][_self.cols[0]], loc["key"][_self.cols[1]]));
                    return point.y;
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