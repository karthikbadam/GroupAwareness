//movie dataset
var gross = "Worldwide_Gross";
var ratings = "IMDB_Rating";
var budget = "Production_Budget";
var date = "Release_Date";
var director = "Director";
var genre = "Major_Genre";
var sales = "US_DVD_Sales";
var runningTime = "Running_Time_min";
var tomatoRating = "Rotten_Tomatoes_Rating";
var imdbvotes = "IMDB_Votes";

//polychrome
var polychrome;

var startTime = Date.now();

function randomString(len, charSet) {
    len = len || 10;
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
}

var device = "AWARENESS";

var deviceId = randomString();

var queryStacks = {};

//crime dataset
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

//var baryVertices = [gross, budget, tomatoRating, imdbvotes, sales];
var baryVertices = ["District", "Description", "Weapon", "Post"];

var width = 0;
var height = 0;
var tabHeight = 30;

var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var colorscale = d3.scale.category10();

// awareness visualization
var awarenessViz;
var awarenessType = 2;
//  1 for parallel coordinates,  2 for ScatterPlot, 3 for Barycentric, 4 for radar plot, 5 for user-centered barymap with features
var parallelAwarenessViz = null;
var scatterplotAwarenessViz = null;

// user interactions
var interactions = [{
    query: [{
        index: crimeMeta["description"],
        value: ['ROBBERY - CARJACKING'],
        operator: "in",
        logic: "CLEAN"
    }, {
        index: crimeMeta["weapon"],
        value: ["KNIFE"],
        operator: "in",
        logic: "AND"
    }]
}, {
    query: [{
        index: crimeMeta["neighborhood"],
        value: ["Walbrook"],
        operator: "in",
        logic: "CLEAN"
    }]
}];

function clearQuery(queryStack, query) {

    if (queryStack.length == 0)
        return;

    //    if (queryStack.length == 1) {
    //        queryStack.pop();
    //        getDatafromQuery("empty");
    //        return;
    //    }

    var index = -1;

    for (var i = 0; i < queryStack.length; i++) {

        var q = queryStack[i];

        if (q.index == query.index && q.operator == query.operator &&
            JSON.stringify(q.value) == JSON.stringify(query.value)) {

            index = i;

        }

    }

    if (index >= 0) {

        queryStack.splice(index, 1);

        if (index <= queryStack.length - 1) {

            var nextQuery = queryStack[index];

            if (nextQuery.logic != "CLEAN") {

                nextQuery.logic = "CLEAN";

                queryStack[index] = nextQuery;
            }

        }

    }

    query.logic == "UNDO";
}


$(document).ready(function () {

    //creating the layout
    width = $("body").width();
    height = $("body").height() - tabHeight;

    var query = {
        index1: budget,
        operator1: "all",
        value: "",
        logic: "CLEAN",
        index2: gross,
        operator2: "all",
        value: "",
    };

    getDataFromQuery("empty");

    var options = {};

    options.callback = function (query, time, hostDevice, deviceId) {

        if (deviceId in queryStacks) {

        } else {

            queryStacks[deviceId] = [];

        }

        if (query.logic == "UNDO") {

            if (query.value == "") {

                queryStacks[deviceId].pop();

            } else {

                clearQuery(queryStacks[deviceId], query);

            }

        } else {

            queryStacks[deviceId].push(query);

        }

        if (queryStacks[deviceId].length > 0) {
            createUserfromQueryList(queryStacks[deviceId], deviceId);
        } else {
            createUserfromQueryList("empty", deviceId);
        }

    };

    polychrome = new Sync(options);

    $(".tabs_pane").click(function () {

        switch ($(this).html()) {
        case "Parallel Coordinates":

            if (parallelAwarenessViz == null) {

                parallelAwarenessViz = new ParallelCoord({
                    data: data,
                    cols: baryVertices
                });

                parallelAwarenessViz.createViz(awarenessViz.defaultClusters, awarenessViz.defaultdata);

            }

            awarenessViz = parallelAwarenessViz;

            break;

        case "ScatterPlot":

            if (scatterplotAwarenessViz == null) {

                scatterplotAwarenessViz = new ScatterPlot({
                    data: data,
                    cols: baryVertices
                });

                scatterplotAwarenessViz.createViz(awarenessViz.defaultClusters, awarenessViz.defaultdata);

            }

            awarenessViz = scatterplotAwarenessViz;

            break;

        case "BaryMap":

            break;

        case "Radar Plot":

            break;

        case "BaryMap User":

            break;

        default:

            break;

        }

        console.log("tab clicked #" + $(this).html());

    });

    //Settings 

    var dialog = document.querySelector('#dimensionsDialog');
    var showDialogButton = document.querySelector('#settings');

    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }

    showDialogButton.addEventListener('click', function () {
        dialog.showModal();
    });

    dialog.querySelector('.close').addEventListener('click', function () {
        dialog.close();
    });

    dialog.querySelector('#dimensionsChanged').addEventListener('click', function () {

        dialog.close();
    });

    //creating the checkboxes
    var dKeys = Object.keys(crimeMeta);
    for (var i = 0; i < dKeys.length; i++) {

        var key = dKeys[i];

        if (key == "id") {
            continue;
        }

        var variable = crimeMeta[key];

        var label = d3.select("#dimensionsDialogContent")
            .append("label")
            .attr("class", "mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect")
            .attr("for", "checkbox-" + variable);

        label.append("input")
            .attr("type", "checkbox")
            .attr("id", "checkbox-" + variable)
            .attr("class", "mdl-checkbox__input");

        label.append("span")
            .attr("class", "mdl-checkbox__label")
            .text(variable);

    }
});

function getDataFromQuery(queryList) {

    $.ajax({

        type: "GET",
        url: "/getCrimeClustered",
        data: {
            data: queryList
        }

    }).done(function (tempData) {

        clusteredData = JSON.parse(tempData);

        data = clusteredData["data"];
        clusters = clusteredData["clusters"];

        console.log(data);
        console.log(clusters);

        switch (awarenessType) {
        case 1:

            parallelAwarenessViz = new ParallelCoord({
                data: data,
                cols: baryVertices
            });

            awarenessViz = parallelAwarenessViz;

            break;

        case 2:
            scatterplotAwarenessViz = new ScatterPlot({
                data: data,
                cols: baryVertices
            });

            awarenessViz = scatterplotAwarenessViz;

            break;

        case 3:

            awarenessViz = new BaryMap({
                data: data,
                cols: baryVertices
            });
            break;

        case 4:
            awarenessViz = new RadarPlot({
                data: data,
                cols: baryVertices
            });
            break;


        case 5:
            awarenessViz = new PathViewer({
                data: data,
                cols: baryVertices
            });
            break;

        case 6:
            awarenessViz = new UserMap({
                data: data,
                cols: baryVertices
            });
            break;

        default:
            awarenessViz = new PathViewer({
                data: data,
                cols: baryVertices
            });
            break;

        }

        awarenessViz.createViz(clusters, data);


        //        interactions.forEach(function (d, i) {
        //            createUserfromQueryList(d.query, 1);
        //        });

    });

}

function createUserfromQueryList(queryList, user) {

    $.ajax({

        type: "GET",
        url: "/getCrimeClustered",
        data: {
            data: queryList
        }

    }).done(function (tempData) {

        clusteredData = JSON.parse(tempData);

        data = clusteredData["data"];
        clusters = clusteredData["clusters"];

        console.log(data);
        console.log(clusters);

        awarenessViz.createUser(data, user, clusters);

    });

}