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

var baryVertices = [gross, tomatoRating, imdbvotes, runningTime];

var width = 0;


var height = 0;

var parseDate = d3.time.format("%d-%b-%y").parse;

var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var colorscale = d3.scale.category10();

// awareness visualization
var baryMap;

// user interactions
var interactions = [{
    query: [{
        index: gross,
        value: [2000000000, 3000000000],
        operator: "range",
        logic: "NOT"
    }]
}, {
    query: [{
        index: tomatoRating,
        value: [95, 100],
        operator: "range",
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

    createVisualizationfromQueryList([query]);


});

function createVisualizationfromQueryList(queryList) {

    $.ajax({

        type: "GET",
        url: "/getMovies",
        data: {
            data: queryList
        }

    }).done(function (data) {

        data = JSON.parse(data);

        console.log(data);

        baryMap = new BaryMap({
            data: data,
            cols: baryVertices
        });


        baryMap.createMap();

        createUserfromQueryList(interactions[0].query, 1);

        createUserfromQueryList(interactions[1].query, 2);


    });

}

function createUserfromQueryList(queryList, user) {

    $.ajax({

        type: "GET",
        url: "/getMovies",
        data: {
            data: queryList
        }

    }).done(function (data) {

        data = JSON.parse(data);

        console.log(data);

        baryMap.createUser(data, user);

    });

}
