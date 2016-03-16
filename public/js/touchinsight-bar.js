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
        left: 50
    };


    _self.width = options.width - _self.margin.left - _self.margin.right;

    _self.actualheight = options.height - _self.margin.top - _self.margin.bottom;

    _self.optionsWidth = options.width;

    _self.optionsHeight = options.height;

    _self.myFormat = d3.format(',');

    _self.defaultData = null;

    _self.parseTime = d3.time.format("%H:%M:%S").parse;

    // add a button to parent to open a new dialogue box with more dimensions
    d3.select("#" + _self.parentId).select("header").append("button")
        .attr("class", "mdl-button mdl-button--fab headerButton")
        .on("click", function () {
            //open dialog
            console.log("dialog" + _self.parentId);

            _self.dialog.showModal();

        })
        .append("i").attr("class", "material-icons").text("add");


    d3.select("#" + _self.parentId).select("header").append("button")
        .attr("class", "mdl-button mdl-button--fab headerButton")
        .on("click", function () {
            //open dialog
            console.log("dialog" + _self.parentId);
            if (_self.cols.length > 1)
                _self.draw1D();

        })
        .append("i").attr("class", "material-icons").text("remove");



    $("#" + _self.parentId).append('<dialog class="mdl-dialog" id="' + _self.parentId + 'DimensionsDialog"><div class="mdl-dialog__content" id="' + _self.parentId + 'dimensionsDialogContent"></div><div class="mdl-dialog__actions"><button type="button" class="mdl-button" id="' + _self.parentId + 'dimensionsChanged">Done</button><button type="button" class="mdl-button close">Cancel</button></div></dialog>');

    var dialog = _self.dialog = document.querySelector("#" + _self.parentId + "DimensionsDialog");

    if (!_self.dialog.showModal) {
        dialogPolyfill.registerDialog(_self.dialog);
    }

    _self.dialog.querySelector('.close').addEventListener('click', function () {
        _self.dialog.close();
    });

    _self.dialog.querySelector("#" + _self.parentId + 'DimensionsChanged')
        .addEventListener('click', function () {

            dimArray = [];

            // Done button
            d3.select("#" + _self.parentId + "DimensionsDialogContent")
                .selectAll('.checkbox-input')[0].forEach(function (e) {

                    var dim = e.id.replace("checkbox-", "");

                    if (e.checked) {

                        dimArray.push(dim);
                    }

                });

            if (dimArray.length == 0) {

                _self.draw1D();
                _self.dialog.close();

                return;

            }

            var newDimension = dimArray[0];

            if (_self.cols.indexOf(newDimension) < 0) {
                if (_self.cols.length == 1) {
                    _self.cols.push(newDimension);
                    _self.draw2D();

                } else if (_self.cols.length > 1) {
                    _self.cols[1] = newDimension;
                    _self.draw2D();

                }

            }

            _self.dialog.close();
        });

    //creating the checkboxes
    var dKeys = Object.keys(crimeMeta);
    for (var i = 0; i < dKeys.length; i++) {

        var key = dKeys[i];

        if (key == "id" || crimeMeta[key] == _self.cols[0]) {
            continue;
        }

        var variable = crimeMeta[key];

        var label = d3.select("#" + _self.parentId + "DimensionsDialogContent")
            .append("span")
            .attr("id", "checkboxlabel-" + variable)
            .style("padding-left", "30px")
            .style("padding-right", "30px")
            .text(variable + ": ");

        label.append("input")
            .attr("type", "checkbox")
            .attr("id", "checkbox-" + variable)
            .attr("class", "checkbox-input");

        //label.append("br");

    }
}


Bar.prototype.handler = function (value) {

    var _self = this;

    var query = new Query({
        index: _self.cols[0],
        value: value,
        operator: "equal",
        logic: "AND"
    });



    setGlobalQuery(query, 1);

    d3.select("#" + _self.parentId).select("header").select(".userQuery").remove();

    var q = d3.select("#" + _self.parentId).select("header")
        .append("div")
        .attr("id", query.index)
        .attr("class", "userQuery")
        .style("display", "inline-block")
        .style("padding-left", "5px");

    q.append("div")
        .style("width", "auto")
        .style("padding-left", "2px")
        .style("padding-right", "2px")
        .text("X")
        .style("font-size", "12px")
        .style("display", "inline-block")
        .style("background-color", "#222")
        .style("color", "#FFF")
        .on("click", function () {

            d3.select("#" + _self.parentId).select("header")
                .select(".userQuery").remove();

            clearQuery(query);
        });

    q.append("div")
        .style("width", "auto")
        .style("padding-right", "5px")
        .text(value)
        .style("font-size", "12px")
        .style("display", "inline-block")
        .style("background-color", "#AAA");
}

Bar.prototype.updateVisualization = function (data, rawData) {

    var _self = this;

    _self.targetData = data;

    _self.rawData = rawData;

    if (_self.defaultData != null) {
        _self.defaultData = data;
    }

    _self.margin = {
        top: 5,
        right: 30,
        bottom: 30,
        left: 50
    }

    _self.width = _self.optionsWidth - _self.margin.left - _self.margin.right;

    _self.actualheight = _self.optionsHeight - _self.margin.top - _self.margin.bottom;

    d3.select("#" + _self.parentId).style("overflow", "hidden");

    if (!d3.select("#" + _self.parentId + "scatter").empty()) {
        _self.draw2D();
        return;
    }

    if (!_self.svg || _self.svg.select("rect").empty()) {

        _self.cols = [_self.cols[0]];

        d3.select("#" + _self.parentId).selectAll("#" + _self.parentId + "div").remove();
        d3.select("#" + _self.parentId).selectAll("#title").remove();

        _self.height = 10000;

        d3.select("#" + _self.parentId).select("header")
            .style("display", "block")
            .append("div")
            .attr("id", "title")
            .style("width", "auto")
            .style("padding-left", "5px")
            .text(_self.text)
            .style("font-size", "12px")
            .style("display", "inline-block");

        _self.svg = d3.select("#" + _self.parentId).append("div")
            .attr("id", _self.parentId + "div")
            .style("overflow", "scroll")
            .style("width", _self.width + _self.margin.left + _self.margin.right)
            .style("height", _self.actualheight + _self.margin.top + _self.margin.bottom - 15)
            .append("svg")
            .attr("id", _self.parentId + "bar")
            .attr("width", _self.width + _self.margin.left + _self.margin.right - 5)
            .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (_self.margin.left) + "," +
                _self.margin.top + ")");

        _self.x = d3.scale.linear()
            .domain([0, d3.max(_self.targetData, function (d) {
                if (d[_self.cols[0]] != "")
                    return d["value"];

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
        _self.barH = 24;

        _self.bars = _self.svg.selectAll("g")
            .data(_self.targetData)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + _self.margin.left + "," + i * _self.barH + ")";
            });

        _self.bars.append("rect")
            .attr("width", function (d) {
                return _self.x(Math.pow(d["value"], 1));
            })
            .attr("height", _self.barH - 5)
            .attr("fill", "#9ecae1")
            .style("cursor", "pointer")
            .on("click", function () {

                _self.handler(d3.select(this)[0][0].__data__[_self.cols[0]]);

            });

        _self.bars.append("text")
            .attr("x", function (d) {
                return 5;
            })
            .attr("y", _self.barH / 3)
            .attr("fill", "#222")
            .attr("text-anchor", "start")
            .attr("dy", ".35em")
            .text(function (d) {
                return _self.myFormat(Math.round(d["value"]));
            })
            .style("pointer-events", "none");

        _self.svg.selectAll("text.name")
            .data(_self.targetData)
            .enter().append("text")
            .style("width", _self.margin.left)
            .attr("x", _self.margin.left - 5)
            .attr("y", function (d, i) {
                return i * _self.barH + _self.barH / 2;
            })
            .attr("fill", "#222")
            .attr("text-anchor", "end")
            .attr('class', 'name')
            .style('text-overflow', 'ellipsis')
            .style("cursor", "pointer")
            .text(function (d) {
                if (d[_self.cols[0]].length * 3 > _self.margin.left) {
                    return d[_self.cols[0]].substr(0, 12) + "...";
                }

                return d[_self.cols[0]];
            })
            .on("click", function () {

                _self.handler(d3.select(this)[0][0].__data__[_self.cols[0]]);

            });

    } else {

        var allBars = _self.svg.selectAll("g").data(_self.targetData);

        allBars.exit().remove();

        _self.x = d3.scale.linear()
            .domain([0, d3.max(_self.targetData, function (d) {
                if (d[_self.cols[0]] != "")
                    return d["value"];

                return 0;
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
                return _self.x(Math.pow(d["value"], 1));
            })
            .attr("height", _self.barH - 5)
            .attr("fill", "#9ecae1")
            .style("cursor", "pointer")
            .on("click", function () {

                _self.handler(d3.select(this)[0][0].__data__[_self.cols[0]]);

            });

        rects.append("text")
            .attr("x", function (d) {
                return 5;
            })
            .attr("y", _self.barH / 3)
            .attr("fill", "#222")
            .attr("text-anchor", "start")
            .attr("dy", ".35em")
            .text(function (d) {
                return _self.myFormat(Math.round(d["value"]));
            })
            .style("pointer-events", "none");

        allBars.select("rect").attr("width", function (d) {
                return _self.x(Math.pow(d["value"], 1));
            })
            .attr("height", _self.barH - 5)
            .attr("fill", "#9ecae1")
            .style("cursor", "pointer")
            .on("click", function () {

                _self.handler(d3.select(this)[0][0].__data__[_self.cols[0]]);

            });

        allBars.select("text")
            .attr("x", function (d) {
                return 5;
            })
            .attr("y", _self.barH / 3)
            .attr("fill", "#222")
            .attr("text-anchor", "start")
            .attr("dy", ".35em")
            .text(function (d) {
                return _self.myFormat(Math.round(d["value"]));
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
            .style("cursor", "pointer")
            .text(function (d) {
                if (d[_self.cols[0]].length * 3 > _self.margin.left) {
                    return d[_self.cols[0]].substr(0, 12) + "...";
                }

                return d[_self.cols[0]];
            })
            .on("click", function () {

                _self.handler(d3.select(this)[0][0].__data__[_self.cols[0]]);

            });

        allText.attr("x", _self.margin.left - 5)
            .attr("y", function (d, i) {
                return i * _self.barH + _self.barH / 2;
            })
            .attr("fill", "#222")
            .attr("text-anchor", "end")
            .attr('class', 'name')
            .style("cursor", "pointer")
            .text(function (d) {
                if (d[_self.cols[0]].length * 3 > _self.margin.left) {
                    return d[_self.cols[0]].substr(0, 12) + "...";
                }

                return d[_self.cols[0]];
            })
            .on("click", function () {

                _self.handler(d3.select(this)[0][0].__data__[_self.cols[0]]);

            });

    }

}

Bar.prototype.draw1D = function () {

    var _self = this;

    _self.cols = [_self.cols[0]];

    d3.select("#" + _self.parentId).selectAll("#" + _self.parentId + "div").remove();

    _self.updateVisualization(_self.targetData, _self.rawData);

}

Bar.prototype.draw2D = function () {

    var _self = this;

    var data = processData(_self.rawData, _self.cols[0], _self.cols[1]);

    _self.margin = {
        top: 70,
        right: 10,
        bottom: 30,
        left: 100
    };

    _self.width = _self.optionsWidth - _self.margin.left - _self.margin.right;

    _self.actualheight = _self.optionsHeight - _self.margin.top - _self.margin.bottom;

    _self.height = _self.actualheight;

    if (d3.select("#" + _self.parentId + "scatter").empty()) {

        d3.select("#" + _self.parentId).selectAll("#" + _self.parentId + "div").remove();

        d3.select("#" + _self.parentId).selectAll("#title").remove();

        d3.select("#" + _self.parentId).select("header")
            .style("display", "block")
            .append("div")
            .attr("id", "title")
            .style("width", "auto")
            .style("padding-left", "5px")
            .text(_self.cols[0] + " by " + _self.cols[1])
            .style("font-size", "12px")
            .style("display", "inline-block");

        for (var i = 0; i < 2; i++) {

            var d = _self.cols[i];

            if (i == 0) {

                _self.y = d3.scale.ordinal()
                    .domain(data.map(function (p) {
                        return p["key"][d];
                    }).sort())
                    .rangePoints([_self.height, 0]);


            } else {


                if (isNumeric[d]) {

                    _self.x = d3.scale.linear()
                        .domain(d3.extent(data, function (p) {
                            return p["key"][d];
                        }))
                        .range([0, _self.width]);


                } else if (d.toLowerCase().indexOf("date") > 0) {

                    _self.x = d3.time.scale()
                        .domain(d3.extent(data, function (p) {
                            return new Date(p["key"][d]);
                        }))
                        .range([0, _self.width]);

                } else if (d.toLowerCase().indexOf("time") > 0) {

                    _self.x = d3.time.scale()
                        .domain(d3.extent(data, function (p) {
                            return _self.parseTime(p["key"][d]);
                        }))
                        .range([0, _self.width]);


                } else {

                    _self.x = d3.scale.ordinal()
                        .domain(data.map(function (p) {
                            return p["key"][d];
                        }).sort())
                        .rangePoints([0, _self.width]);
                }
            }
        }

        _self.color = d3.scale.category10();

        

        if (_self.y.domain().length * 10 > _self.actualheight) {
            
            _self.height = _self.y.domain().length * 10 + _self.margin.top + _self.margin.bottom;
            
        }
        
        _self.svg = d3.select("#" + _self.parentId).append("div")
            .style("overflow", "scroll")
            .attr("id", _self.parentId + "div")
            .style("width", _self.width + _self.margin.left + _self.margin.right)
            .style("height", _self.actualheight + _self.margin.top + _self.margin.bottom)
            .append("svg")
            .attr("id", _self.parentId + "scatter")
            .attr("width", _self.width + _self.margin.left + _self.margin.right)
            .attr("height",  _self.height + _self.margin.top + _self.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + _self.margin.left + "," +
                _self.margin.top + ")");

        _self.y.rangePoints([_self.height, 0]);
        
        _self.xAxis = d3.svg.axis()
            .scale(_self.x)
            .orient("top");

        _self.yAxis = d3.svg.axis()
            .scale(_self.y)
            .orient("left");
        
        var FONTWIDTH = 10;

        if (_self.x.domain().length > _self.width / FONTWIDTH) {

            var skip = Math.round(1 / (_self.width / (FONTWIDTH * _self.x.domain().length)));

            _self.xAxis.tickValues(_self.x.domain()
                .filter(function (d, i) {
                    return !(i % skip);
                }));

        }
//
//        if (_self.y.domain().length > _self.height / FONTWIDTH) {
//
//            var skip = Math.round(1 / (_self.height / (FONTWIDTH * _self.y.domain().length)));
//
//            _self.yAxis.tickValues(_self.y.domain()
//                .filter(function (d, i) {
//                    return !(i % skip);
//                }));
//        }
        
        _self.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0,0)")
            .call(_self.xAxis);

        _self.svg.append("g")
            .attr("class", "y axis")
            .call(_self.yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("x", -6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("font-size", "14px")
            .text(_self.cols[0]);

        _self.svg.select(".x.axis")
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "start");

        _self.svg.select(".x.axis")
            .append("text")
            .attr("class", "label")
            .attr("x", _self.width)
            .attr("y", 15)
            .style("text-anchor", "end")
            .style("font-size", "14px")
            .text(_self.cols[1]);

        _self.radius = d3.scale.linear()
            .domain(d3.extent(data, function (p) {
                return p["value"];
            }))
            .range([2, 10]);

        var dots = _self.svg.selectAll(".dot")
            .data(data);

        dots.enter().append("circle")
            .attr("class", "dot")
            .attr("r", function (d) {
                return _self.radius(d["value"]);
            })
            .attr("cx", function (d) {
                if (_self.cols[1].toLowerCase().indexOf("date") > 0) {
                    return _self.x(new Date(d["key"][_self.cols[1]]));
                }

                if (_self.cols[1].toLowerCase().indexOf("time") > 0) {
                    return _self.x(_self.parseTime(d["key"][_self.cols[1]]));
                }
                return _self.x(d["key"][_self.cols[1]]);
            })
            .attr("cy", function (d) {
                if (_self.cols[0].toLowerCase().indexOf("date") > 0) {
                    return _self.y(new Date(d["key"][_self.cols[0]]));
                }

                if (_self.cols[0].toLowerCase().indexOf("time") > 0) {
                    return _self.y(_self.parseTime(d["key"][_self.cols[0]]));
                }
                return _self.y(d["key"][_self.cols[0]]);
            })
            .style("fill", function (d) {
                return "#4292c6";
            })
            .style("fill-opacity", function (d) {
                return 0.3;
            });

    } else {

        _self.radius = d3.scale.linear()
            .domain(d3.extent(data, function (p) {
                return p["value"];
            }))
            .range([2, 10]);

        var dots = _self.svg.selectAll(".dot")
            .data(data);

        dots.exit().remove();

        dots.enter().append("circle")
            .attr("class", "dot")
            .attr("r", function (d) {
                return _self.radius(d["value"]);
            })
            .attr("cx", function (d) {
                if (_self.cols[1].toLowerCase().indexOf("date") > 0) {
                    return _self.x(new Date(d["key"][_self.cols[1]]));
                }

                if (_self.cols[1].toLowerCase().indexOf("time") > 0) {
                    return _self.x(_self.parseTime(d["key"][_self.cols[1]]));
                }
                return _self.x(d["key"][_self.cols[1]]);
            })
            .attr("cy", function (d) {
                if (_self.cols[0].toLowerCase().indexOf("date") > 0) {
                    return _self.y(new Date(d["key"][_self.cols[0]]));
                }

                if (_self.cols[0].toLowerCase().indexOf("time") > 0) {
                    return _self.y(_self.parseTime(d["key"][_self.cols[0]]));
                }
                return _self.y(d["key"][_self.cols[0]]);
            })
            .style("fill", function (d) {
                return "#4292c6";
            })
            .style("fill-opacity", function (d) {
                return 0.3;
            });

        dots.attr("r", function (d) {
                return _self.radius(d["value"]);
            })
            .attr("cx", function (d) {
                if (_self.cols[1].toLowerCase().indexOf("date") > 0) {
                    return _self.x(new Date(d["key"][_self.cols[1]]));
                }

                if (_self.cols[1].toLowerCase().indexOf("time") > 0) {
                    return _self.x(_self.parseTime(d["key"][_self.cols[1]]));
                }
                return _self.x(d["key"][_self.cols[1]]);
            })
            .attr("cy", function (d) {
                if (_self.cols[0].toLowerCase().indexOf("date") > 0) {
                    return _self.y(new Date(d["key"][_self.cols[0]]));
                }

                if (_self.cols[0].toLowerCase().indexOf("time") > 0) {
                    return _self.y(_self.parseTime(d["key"][_self.cols[0]]));
                }
                return _self.y(d["key"][_self.cols[0]]);
            })
            .style("fill", function (d) {
                return "#4292c6";
            })
            .style("fill-opacity", function (d) {
                return 0.3;
            });

    }

}