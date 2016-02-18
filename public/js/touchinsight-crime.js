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

var numViews = 9;

var visuals = [
    ['Description'],
    ['Weapon'],
    ['Neighborhood'],
    ['District'],
    ['Post'],
    ['CrimeCode'],
];

var index = 0;

var device = 0;

var width = 0;

var height = 0;

var PADDING = 5;

var device = "DESKTOP";

var parseDate = d3.time.format("%d-%b-%y").parse;

var queryStack = [];

var historyQueryStack = [];

var touchSync;

var top, left, right, bottom, main;

var gross_time, genre_gross, gross_budget, genre_budget, budget_time;

var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


$(document).ready(function () {

    //creating the layout
    width = $("#content").width();
    height = $("#content").height();


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
        gridster.add_widget('<div id = "viz' + i + '" ' + 'class="panel"><header></header></div>', 1, 1);
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
                var visualization = new Bar({
                    parentId: "viz"+i,
                    cols: [d[0], "count"],
                    width: $("#viz"+i).width(),
                    height: $("#viz"+i).height(),
                    text: "Count by " + d[0]
                });

                
                visualization.updateVisualization(processed);

            } else {

            }
        });

    });

}

function processData(data, col1, col2) {

    var newData = {};

    data.forEach(function (d) {

        if (d["_id"][col1] in newData) {
            var key = d["_id"][col1];
            //count -- can be automated!!!
            newData[key]++;
            
        } else {

            var key = d["_id"][col1];
            newData[key] = 1;
        }
    });

    var returnData = [];

    Object.keys(newData).forEach(function (k) {

        var datum = {};
        datum[col1] = k;
        datum["count"] = newData[k];
        returnData.push(datum);

    });


    console.log(returnData);
    return returnData;
}



function average(arr) {
    return arr.reduce(function (memo, num) {
        return memo + num;
    }, 0) / arr.length;
}
