function Bar(options) {

    var _self = this;

    _self.parentId = options.parentId;

    _self.cols = options.cols;

    _self.link = options.link;

    _self.text = options.text;

    _self.margin = {
        top: 5,
        right: 30,
        bottom: 30,
        left: 70
    };


    _self.width = options.width - _self.margin.left - _self.margin.right;

    _self.actualheight = options.height - _self.margin.top - _self.margin.bottom;
    
    _self.myFormat = d3.format(',');
}

Bar.prototype.updateVisualization = function (data) {

    var _self = this;
    
    _self.targetData = data;
    
    d3.select("#" + _self.parentId).style("overflow", "hidden");

    if (!_self.svg || _self.svg.select("rect").empty()) {

        _self.height = 10000;

        d3.select("#" + _self.parentId).select("header")
            .style("padding-left", "5px")
            .text(_self.text)
            .style("font-size", "12px");

        _self.svg = d3.select("#" + _self.parentId).append("div")
            .style("overflow", "scroll")
            .style("width", _self.width + _self.margin.left + _self.margin.right)
            .style("height", _self.actualheight + _self.margin.top + _self.margin.bottom - 15)
            .append("svg")
            .attr("id", _self.target + "bar")
            .attr("width", _self.width + _self.margin.left + _self.margin.right - 5)
            .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (_self.margin.left) + "," +
                _self.margin.top + ")");

        _self.x = d3.scale.linear()
            .domain([0, d3.max(_self.targetData, function (d) {
                if (d[_self.cols[0]] != "")
                    return d[_self.cols[1]];
                
                return 0;
            })])
            .range([0, _self.width]);

        _self.y = d3.scale.ordinal()
            .domain(_self.targetData.map(function (d) {
                if (d[_self.cols[0]] != "")
                    return d[_self.cols[0]];
            
                return 0;
            }))
            .rangeBands([0, _self.height]);

        //_self.barH = _self.height / _self.targetData.length;
        _self.barH = 27;

        _self.bars = _self.svg.selectAll("g")
            .data(_self.targetData)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + _self.margin.left + "," + i * _self.barH + ")";
            });

        _self.bars.append("rect")
            .attr("width", function (d) {
                return _self.x(Math.pow(d[_self.cols[1]], 1));
            })
            .attr("height", _self.barH - 5)
            .attr("fill", "#9ecae1");

        _self.bars.append("text")
            .attr("x", function (d) {
                return 5;
            })
            .attr("y", _self.barH / 3)
            .attr("fill", "#222")
            .attr("text-anchor", "start")
            .attr("dy", ".35em")
            .text(function (d) {
                return _self.myFormat(Math.round(d[_self.cols[1]]));
            })
            .style("pointer-events", "none");

        _self.svg.selectAll("text.name")
            .data(_self.targetData)
            .enter().append("text")
            .attr("x", _self.margin.left - 5)
            .attr("y", function (d, i) {
                return i * _self.barH + _self.barH / 2;
            })
            .attr("fill", "#222")
            .attr("text-anchor", "end")
            .attr('class', 'name')
            .text(function (d) {
                return d[_self.cols[0]];
            });

    } else {

        var allBars = _self.svg.selectAll("g").data(_self.targetData);

        allBars.exit().remove();

        _self.x = d3.scale.linear()
            .domain([0, d3.max(_self.targetData, function (d) {
                return Math.pow(d[_self.cols[1]], 1);
            })])
            .range([0, _self.width]);
        
         _self.y = d3.scale.ordinal()
            .domain(_self.targetData.map(function (d) {
                return d[_self.cols[0]];
            }))
            .rangeBands([0, _self.height]);

        var rects = allBars.enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + _self.margin.left + "," + i * _self.barH + ")";
            });

        rects.append("rect")
            .attr("width", function (d) {
                return _self.x(Math.pow(d[_self.cols[1]], 1));
            })
            .attr("height", _self.barH - 5)
            .attr("fill", "#9ecae1");
            
        rects.append("text")
            .attr("x", function (d) {
                return 5;
            })
            .attr("y", _self.barH / 3)
            .attr("fill", "#222")
            .attr("text-anchor", "start")
            .attr("dy", ".35em")
            .text(function (d) {
                return  _self.myFormat(Math.round(d[_self.cols[1]]));
            })
            .style("pointer-events", "none");

        allBars.select("rect").attr("width", function (d) {
                return _self.x(Math.pow(d[_self.cols[1]], 1));
            })
            .attr("height", _self.barH - 5)
            .attr("fill", "#9ecae1");

        allBars.select("text")
            .attr("x", function (d) {
                return 5;
            })
            .attr("y", _self.barH / 3)
            .attr("fill", "#222")
            .attr("text-anchor", "start")
            .attr("dy", ".35em")
            .text(function (d) {
                return _self.myFormat(Math.round(d[_self.cols[1]]));
            });


        var allText = _self.svg.selectAll("text.name").data(_self.targetData);

        allText.exit().remove();

        allText.enter().append("text")
            .attr("x", _self.margin.left - 5)
            .attr("y", function (d, i) {
                return i * _self.barH + _self.barH / 2;
            })
            .attr("fill", "#222")
            .attr("text-anchor", "end")
            .text(function (d) {
                return d[_self.cols[0]];
            });

        allText.attr("x", _self.margin.left - 5)
            .attr("y", function (d, i) {
                return i * _self.barH + _self.barH / 2;
            })
            .attr("fill", "#222")
            .attr("text-anchor", "end")
            .attr('class', 'name')
            .text(function (d) {
                return d[_self.cols[0]];
            });

    }

}