// Crime
var crimeMeta = {};
crimeMeta["id"] = "id";
crimeMeta["date"] = "CrimeDate";
crimeMeta["code"] = "CrimeCode";
crimeMeta["time"] = "CrimeTime";
crimeMeta["location"] = "Location";
crimeMeta["description"] = "Description";
crimeMeta["weapon"] = "Weapon";
crimeMeta["post"] = "Post";
crimeMeta["district"] = "District";
crimeMeta["neighborhood"] = "Neighborhood";
crimeMeta["lat"] = "Latitude";
crimeMeta["lon"] = "Longitude";

var queryStack = [];

var historyQueryStack = [];

var numViews = 8;

var visuals = [
    ['Description'],
    ['Neighborhood'],
    ['Weapon'],
    ['District'],
    ['Latitude', 'Longitude'],
    ['CrimeCode'],
    ['Post'],
    ['CrimeDate']
];

var visualizations = new Array(visuals.length);

var index = 0;

var device = 0;

var width = 0;

var height = 0;

var PADDING = 5;

var device = "DESKTOP";

var queryStack = [];

var historyQueryStack = [];

var touchSync;

var top, left, right, bottom, main;

var gross_time, genre_gross, gross_budget, genre_budget, budget_time;

var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


function setGlobalQuery(query, propagate) {

    var currQuery = query;

    var prevQuery = queryStack[queryStack.length - 1];

    queryStack.push(query.getQueryString());

    for (var i = queryStack.length - 1; i >= 0; i--) {

        var q = queryStack[i];

        if (q.logic == "CLEAN") {

            queryStack = queryStack.slice(i);
            break;
        }
    }

    //touchSync.push(currQuery);
    
    d3.selectAll(".extent").attr("width", 0).attr("x", 0);

    historyQueryStack.push(query);

    // update all other visualizations
    if (propagate) {
        getDatafromQuery(queryStack);
    }

}


function clearRecentQuery() {
    if (queryStack.length == 0)
        return;

    if (queryStack.length == 1) 
        getDatafromQuery("empty");
    
    queryStack.pop();
    historyQueryStack.pop();
    getDatafromQuery(queryStack);

    // context switched
    //var content = {};
    //content.action = "UNDO";
    //content.mainview = mainView;
    //touchSync.push(content);

    // update all other visualizations
    

}

$(document).keypress("u",function(e) {

    clearRecentQuery();
    //if(e.ctrlKey)
    
});

$(document).ready(function () {

    //creating the layout
    width = $("#content").width();
    height = $("#content").height();
    
    visuals.forEach(function (d, i) {
        visualizations[i] = null;
    });

    var gridster = $(".gridster").gridster({
        widget_margins: [5, 5],
        min_cols: 3,
        autogrow_cols: true,
        resize: {
            enabled: true
        },
        draggable: {
            handle: 'header'
        },
        widget_base_dimensions: [width / 3 - 10, height / 3 - 10],
        autogenerate_stylesheet: true
    }).data('gridster');

    for (var i = 0; i < numViews; i++) {
        if (i == Math.floor(numViews / 2)) {
            gridster.add_widget('<div id = "viz' + i + '" ' + 'class="panel"><header></header></div>', 1, 2);
        } else {
            gridster.add_widget('<div id = "viz' + i + '" ' + 'class="panel"><header></header></div>', 1, 1);
        }
    }

    var query = {
        index1: crimeMeta["date"],
        operator1: "all",
        value: "",
        logic: "CLEAN",
        index2: crimeMeta["description"],
        operator2: "all",
        value: "",
    };

    getDatafromQuery("empty");

});


function createDelay(index) {
    var delay = 2000; //1 seconds

    setTimeout(function () {
        createVisualizationfromQueryList(interactions[index].query);
        if (index < interactions.length - 1) {
            //createDelay(index + 1);
        }

    }, delay);

}

function getDatafromQuery(queryList) {

    $.ajax({

        type: "GET",
        url: "/getCrime",
        data: {
            data: queryList
        }

    }).done(function (data) {

        data = JSON.parse(data);

        console.log(data);

        visuals.forEach(function (d, i) {

            if (d.length == 1) {

                var processed = processData(data, d[0]);

                if (visualizations[i] == null) {

                    if (d[0].indexOf("Date") > -1) {

                        visualizations[i] = new TimeChart({
                            parentId: "viz" + i,
                            cols: [d[0], "value"],
                            width: $("#viz" + i).width(),
                            height: $("#viz" + i).height(),
                            text: "Crime Count by " + d[0],
                            month: true
                        });

                        visualizations[i].updateVisualization(processed);

                    } else {

                        visualizations[i] = new Bar({
                            parentId: "viz" + i,
                            cols: [d[0], "value"],
                            width: $("#viz" + i).width(),
                            height: $("#viz" + i).height(),
                            text: "Crime Count by " + d[0]
                        });

                        visualizations[i].updateVisualization(processed);

                    }

                } else {

                    visualizations[i].updateVisualization(processed);

                }


            } else {

                var processed = processData(data, d[0], d[1]);

                if (visualizations[i] == null) {


                    if (d[0].indexOf("Latitude") > -1) {

                        visualizations[i] = new Map({
                            parentId: "viz" + i,
                            cols: [d[0], d[1], "value"],
                            width: $("#viz" + i).width(),
                            height: $("#viz" + i).height(),
                            text: "Crime Count by " + d[0],
                            month: true
                        });

                        visualizations[i].updateVisualization(processed);

                    }

                } else {

                    visualizations[i].updateVisualization(processed);

                }

            }
        });

    });

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



function average(arr) {
    return arr.reduce(function (memo, num) {
        return memo + num;
    }, 0) / arr.length;
}