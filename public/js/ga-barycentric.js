function BaryMap(options) {

    var _self = this;

    _self.data = options.data;

    _self.cols = options.cols;

    _self.dataMin = {};

    _self.dataMax = {};

    _self.isNumeric = {};
    
    _self.trueCols = [];
    
    _self.colMapping = {};

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
        
    for (var j = 0; j < _self.cols.length; j++) {
                        
        var key = _self.cols[j];
        
        if (_self.isNumeric[key]) {
            
            _self.trueCols.push(key);
            continue;
        }
        
        //get top three dimensions in this
        var processed = processData(_self.data, key);
        var temp = processed.slice(0, 3); 
        
        temp.forEach(function (d) {
            
            _self.trueCols.push(key + ": " + d[key]);
            _self.isNumeric[d[key]] = false;
            
            _self.colMapping[key + ": " + d[key]] = key; 
            
        });
    }


    for (var i = 0; i < _self.data.length; i++) {

        for (var j = 0; j < _self.cols.length; j++) {

            var key = _self.cols[j];
            
            if (!_self.isNumeric[key]) {
                continue;
            }

            //check if col is numerical
            var value = _self.data[i]["_id"][key];

            if (key in _self.dataMin) {
                if (_self.dataMin[key] > _self.data[i]["_id"][key] && _self.data[i]["_id"][key] != null) {
                    _self.dataMin[key] = _self.data[i]["_id"][key];
                }
            } else {
                _self.dataMin[key] = _self.data[i]["_id"][key] ? _self.data[i]["_id"][key] : Infinity;
            }

            if (key in _self.dataMax) {
                if (_self.dataMax[key] < _self.data[i]["_id"][key]) {
                    _self.dataMax[key] = _self.data[i]["_id"][key];
                }
            } else {
                _self.dataMax[key] = _self.data[i]["_id"][key] ? _self.data[i]["_id"][key] : -Infinity;
            }

        }
    }

    _self.dataTrans = new Array(_self.data.length);

    for (var i = 0; i < _self.data.length; i++) {

        var sum = 0;

        _self.dataTrans[i] = {};

        for (var j = 0; j < _self.trueCols.length; j++) {

            var key = _self.trueCols[j];
            
            if (_self.isNumeric[key]) {

                if (_self.data[i]["_id"][key] == null)
                    _self.data[i]["_id"][key] = _self.dataMin[key];

                _self.dataTrans[i][key] = (_self.data[i]["_id"][key] - _self.dataMin[key]) / (_self.dataMax[key] - _self.dataMin[key]);

                sum += _self.dataTrans[i][key];

            } else {
             
                if (_self.colMapping[key] + ": " + _self.data[i]["_id"][_self.colMapping[key]] == key) {
                    _self.dataTrans[i][key] = 1;
                } else {
                    _self.dataTrans[i][key] = 0;
                }
                
                sum += _self.dataTrans[i][key];
            }
        }

        for (var j = 0; j < _self.trueCols.length; j++) {

            var key = _self.trueCols[j];

            if (sum != 0) {
                
                _self.dataTrans[i][key] = _self.dataTrans[i][key] / sum;
                
            } else {
                
                _self.dataTrans[i][key] = 1 / _self.trueCols.length;
            }

        }

    }

    console.log(_self.dataTrans);
}

BaryMap.prototype.transform = function (data) {

    var _self = this;

    var dataTrans = new Array(data.length);
    
    for (var i = 0; i < data.length; i++) {

        var sum = 0;

        dataTrans[i] = {};

        for (var j = 0; j < _self.trueCols.length; j++) {

            var key = _self.trueCols[j];
            
            if (_self.isNumeric[key]) {

                if (data[i]["_id"][key] == null)
                    data[i]["_id"][key] = _self.dataMin[key];

                dataTrans[i][key] = (data[i]["_id"][key] - _self.dataMin[key]) / (_self.dataMax[key] - _self.dataMin[key]);

                sum += dataTrans[i][key];

            } else {
             
                if (_self.colMapping[key] + ": " + _self.data[i]["_id"][_self.colMapping[key]] == key) {
                    dataTrans[i][key] = 1;
                } else {
                    dataTrans[i][key] = 0;
                }
                
                sum += dataTrans[i][key];

            }
        }

        for (var j = 0; j < _self.trueCols.length; j++) {

            var key = _self.trueCols[j];

            if (sum != 0) {
                
                dataTrans[i][key] = dataTrans[i][key] / sum;
                
            } else {
                
                dataTrans[i][key] = 1 / _self.trueCols.length;
            }

        }

    }

    console.log(dataTrans);

    return dataTrans;
}

BaryMap.prototype.createUser = function (data, user) {

    var _self = this;

    _self.tempData = _self.transform(data);

    for (var i = 0; i < _self.tempData.length; i++) {

        _self.tempData[i].x = 0;
        _self.tempData[i].y = 0;

        for (var j = 0; j < _self.trueCols.length; j++) {

            var key = _self.trueCols[j];
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
    
    
//    _self.tempData.forEach(function (d, i) {
//        _self.container.append('circle')
//            .attr('r', 3+user)
//            .attr('cx', d.x)
//            .attr('cy', d.y)
//            .attr('fill', 'transparent')
//            .attr('fill-opacity', 0.3)
//            .attr("stroke", function (d) {
//                return colorscale(user);
//            })
//            .attr("stroke-opacity", 0.7)
//            .attr("stroke-width", "1px");
//    });
    
    

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

    var sides = _self.trueCols.length; // polygon vertices number
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

        for (var j = 0; j < _self.trueCols.length; j++) {

            var key = _self.trueCols[j];
            _self.dataTrans[i].x += _self.dataTrans[i][key] * _self.vertices[j][0];
            _self.dataTrans[i].y += _self.dataTrans[i][key] * _self.vertices[j][1];

        }

    }

    for (var i = 0; i < _self.vertices.length; i++) {

        _self.container.append('line')
            .attr('x1', _self.vertices[i][0])
            .attr('y1', _self.vertices[i][1])
            .attr('x2', _self.vertices[(i + 1) % _self.trueCols.length][0])
            .attr('y2', _self.vertices[(i + 1) % _self.trueCols.length][1])
            .attr('stroke', '#222')
            .attr('stroke-width', "2px")
            .attr('stroke-opacity', 0.7);

    }

    for (var i = 0; i < _self.vertices.length; i++) {

//        _self.container.append('circle')
//            .attr('r', 8)
//            .attr('cx', _self.vertices[i][0])
//            .attr('cy', _self.vertices[i][1])
//            .attr('fill', '#4292c6');

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
            .text(_self.trueCols[i].replace(/_/g, " "));

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

function processData(data, col1, col2) {

    var newData = {};

    data.forEach(function (d) {

        var key = d["_id"][col1];

        // if has dates
        if (col1.indexOf("Date") > -1) {
            var cdate = new Date(d["_id"][col1]);
            var cyear = cdate.getFullYear();
            var cmonth = month_names_short[cdate.getMonth()];

            key = cmonth + "/" + cyear;
        }

        if (col2) {
            tempkey = key;
            key = {};
            key[col1] = tempkey;
            key[col2] = d["_id"][col2];
            key = JSON.stringify(key);
        }

        if (key in newData) {

            //count -- can be automated!!!
            newData[key] ++;

        } else {

            newData[key] = 1;
        }
    });

    var returnData = [];

    Object.keys(newData).forEach(function (k) {

        var datum = {};
        if (col2) {
            datum["key"] = JSON.parse(k);
        } else {
            datum[col1] = k;
        }
        datum["value"] = newData[k];
        returnData.push(datum);

    });


    returnData.sort(function (a, b) {
            if (a["value"] <
                b["value"]) return 1;
            return -1;
        });
    
    console.log(returnData);
    
    
    return returnData;
}
