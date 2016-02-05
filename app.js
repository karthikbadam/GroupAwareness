var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var csv = require('fast-csv');
var fs = require('fs');
var d3 = require('d3');
var url = require('url');
var qs = require('qs');

var parseDate = d3.time.format("%d-%b-%y").parse;
var parseYear = d3.time.format("%Y").parse;

//var citiesToLoc = require('./maps.js').citiesToLoc;

//var routes = require('./routes/index');
//var users = require('./routes/users');

// connecting to Mongodb database running instance
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var FIRST_TIME_EXECUTED = false;

// connect to the flights database in mongodb
//var mongourl = 'mongodb://127.0.0.1:27017/flights';
var mongourl = 'mongodb://127.0.0.1:27017/movies';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Change from Default: html rendering engine 
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Change from Default:  Instead of routes and users 
app.get('/visualization', function (req, res, next) {
    res.render('largedisplay.html', {});
});

app.get('/awareness', function (req, res, next) {
    res.render('awareness.html', {});
});

app.get('/mobile2', function (req, res, next) {
    res.render('mobile2.html', {});
});

app.get('/mobile3', function (req, res, next) {
    res.render('mobile3.html', {});
});

app.get('/study', function (req, res, next) {
    res.render('data.html', {});
});

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

function initialize(db, callback) {
    if (FIRST_TIME_EXECUTED) {

        var obj;
        fs.readFile("public/data/movies.json", 'utf8', function (err, data) {
            if (err) throw err;
            obj = JSON.parse(data);

            for (var i = 0; i < obj.length; i++) {
                var d = obj[i];

                var temp = {};
                temp[gross] = +d[gross];
                temp[ratings] = +d[ratings];
                temp[budget] = +d[budget];
                if (("" + d[date]).split("-").length == 3) {
                    temp[date] = "" + parseDate(d[date]);
                } else {
                    temp[date] = "" + parseYear(("" + d[date]));
                }
                temp[director] = d[director];
                temp[genre] = d[genre];
                temp[sales] = d[sales];
                temp[runningTime] = d[runningTime];
                temp[tomatoRating] = d[tomatoRating];
                temp[imdbvotes] = d[imdbvotes];
                
                console.log(temp);

                //add to database
                db.collection('movies')
                    .insertOne(temp,
                        function (err, result) {
                            assert.equal(err, null);
                        });
            }
        });

    }
}


// get all data based on a query of specific dimensions
function queryMovies(db, query, callback) {

    if (query != 0) {

        var data = db.collection("movies")
            .aggregate([
                {
                    $match: query
        },
                {
                    $group: {
                        "_id": {
                            Worldwide_Gross: "$Worldwide_Gross",
                            IMDB_Rating: "$IMDB_Rating",
                            Production_Budget: "$Production_Budget",
                            Release_Date: "$Release_Date",
                            Director: "$Director",
                            Major_Genre: "$Major_Genre",
                            US_DVD_Sales: "$US_DVD_Sales",
                            Running_Time_min: "$Running_Time_min", 
                            IMDB_Votes: "$IMDB_Votes",
                            Rotten_Tomatoes_Rating: "$Rotten_Tomatoes_Rating"
                        },
                        "IMDB_Rating": {
                            $sum: "$IMDB_Rating"
                        }
                    }
        }, {
                    $sort: {
                        "IMDB_Rating": -1
                    }
        }
            ]);

    } else {


        var data = db.collection("movies")
            .aggregate([
                {
                    $group: {
                        "_id": {
                            Worldwide_Gross: "$Worldwide_Gross",
                            IMDB_Rating: "$IMDB_Rating",
                            Production_Budget: "$Production_Budget",
                            Release_Date: "$Release_Date",
                            Director: "$Director",
                            Major_Genre: "$Major_Genre",
                            US_DVD_Sales: "$US_DVD_Sales",
                            Running_Time_min: "$Running_Time_min", 
                            IMDB_Votes: "$IMDB_Votes",
                            Rotten_Tomatoes_Rating: "$Rotten_Tomatoes_Rating"
                        },
                        "IMDB_Rating": {
                            $sum: "$IMDB_Rating"
                        }
                    }
                }, {
                    $sort: {
                        "IMDB_Rating": -1
                    }
                }
            ]);
    }



    data.toArray(function (err, docs) {
        console.log(docs.length);
        callback(docs);
    });

}

app.get('/getMovies', function (req, res, next) {

    var params = url.parse(req.url, true).query;

    var query = parseQueryString(params);

    MongoClient.connect(mongourl, function (err, db) {
        assert.equal(null, err);

        queryMovies(db, query,
            function (data) {
                db.close();
                res.write(JSON.stringify(data));
                res.end();
            });
    });

});


MongoClient.connect(mongourl, function (err, db) {
    assert.equal(null, err);
    initialize(db, function () {
        db.close();
    });
});

// parse query string
function parseQueryString(params) {

    var data = qs.parse(params).data;

    console.log(JSON.stringify(data));

    if (data == "empty") {
        return 0;
    }

    var query = {};

    for (var i = 0; i < data.length; i++) {

        var q = {};

        var d = data[i];

        switch (d.operator) {

        case "range":
            if (d.index == "Date") {
                q[d.index] = {
                    "$gte": d.value[0],
                    "$lte": d.value[1]
                };
            } else {
                q[d.index] = {
                    "$gte": parseFloat(d.value[0]),
                    "$lte": parseFloat(d.value[1])
                };
            }
            break;

        case "equal":
            q[d.index] = d.value;
            break;

        case "in":
            for (var i = 0; i < d.value.length; i++) {
                d.value[i] = parseFloat(d.value[i]);   
            }
            q[d.index] = {
                "$in": d.value
            };
            break;

        default:
            console.log("Sorry, we are out of " + d.operator + ".");
        }


        switch (d.logic) {

        case "AND":
            query[d.index] = q[d.index];
            break;

        case "OR":
            if (!query["$or"]) {
                query["$or"] = [];
            }
            query["$or"].push(q);
            break;

        case "NOT":
            query[d.index] = {
                "$not": q[d.index]
            };
            break;

        case "CLEAN":
            query = {};
            query[d.index] = q[d.index];
            break;

        default:
            console.log("Sorry, we are out of " + d.logic + ".");
        }

    }
    console.log(query);

    return query;

}



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;