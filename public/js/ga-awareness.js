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

var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var colorscale = d3.scale.category10();

// awareness visualization
var awarenessViz;
var awarenessType = 2;
// 1 for Barycentric, 2 for parallel coordinates, 3 for radar plot, 4 for user-centered barymap with features

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


$(document).ready(function () {

    //creating the layout
    width = $("#content").width();
    height = $("#content").height();

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

            queryStacks[deviceId].pop();
            
        } else {
            
            queryStacks[deviceId].push(query);
            
        }
        
        if (queryStacks[deviceId].length > 0)
            createUserfromQueryList(queryStacks[deviceId], deviceId);

    };

    polychrome = new Sync(options);

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
            awarenessViz = new BaryMap({
                data: data,
                cols: baryVertices
            });
            break;


        case 2:
            awarenessViz = new ParallelCoord({
                data: data,
                cols: baryVertices
            });
            break;


        case 3:
            awarenessViz = new RadarPlot({
                data: data,
                cols: baryVertices
            });
            break;


        case 4:
            awarenessViz = new PathViewer({
                data: data,
                cols: baryVertices
            });
            break;

        case 5:
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

        awarenessViz.createViz(clusters);

        
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