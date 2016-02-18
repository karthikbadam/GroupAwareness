function Map (options) {
 
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
        new L.Map(_self.parentId, {center: [39.2854197594374, -76.61109924316406], zoom: 12})
    .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
    
    
}

Map.prototype.updateVisualization = function (data) {
 
    var _self = this; 
    
    var svg = _self.svg = d3.select(_self.map.getPanes().overlayPane).append("svg")
                .attr("width", _self.width + _self.margin.left + _self.margin.right)
                .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
                .style("background", "rgba(100, 100, 100, 0.2)");
    
    _self.g = _self.svg.append("g").attr("class", "leaflet-zoom-hide");
    
    
}