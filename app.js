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

//var citiesToLoc = require('./maps.js').citiesToLoc;

//var routes = require('./routes/index');
//var users = require('./routes/users');

// connecting to Mongodb database running instance
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var FIRST_TIME_EXECUTED = false;

// connect to the flights database in mongodb
var mongourlMovies = 'mongodb://127.0.0.1:27017/movies';
var mongourlCrime = 'mongodb://127.0.0.1:27017/crime';

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
app.get('/', function (req, res, next) {
    res.render('crime.html', {});
});

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

// Movies
var moviesMeta = {};
moviesMeta["gross"] = "Worldwide_Gross";
moviesMeta["ratings"] = "IMDB_Rating";
moviesMeta["budget"] = "Production_Budget";
moviesMeta["date"] = "Release_Date";
moviesMeta["director"] = "Director";
moviesMeta["genre"] = "Major_Genre";
moviesMeta["sales"] = "US_DVD_Sales";
moviesMeta["runningTime"] = "Running_Time_min";
moviesMeta["tomatoRating"] = "Rotten_Tomatoes_Rating";
moviesMeta["imdbvotes"] = "IMDB_Votes";

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

var crimeStream = fs.createReadStream("public/data/crime.csv");

function initializeCrime(db, callback) {
    
    var END = false;
    if (FIRST_TIME_EXECUTED) {
        var parseDate = d3.time.format("%m/%d/%y").parse;
        var parseYear = d3.time.format("%Y").parse;

        var i = 1;
        var tempi = 1;
        var csvStream = csv
            .fromStream(crimeStream, {
                headers: true
            })
            .on("data", function (d) {

                var temp = {};
                temp[crimeMeta["id"]] = i;
                temp[crimeMeta["date"]] = "" + parseDate(d[crimeMeta["date"]]);
                temp[crimeMeta["code"]] = d[crimeMeta["code"]];
                temp[crimeMeta["time"]] = d[crimeMeta["time"]];
                temp[crimeMeta["location"]] = d[crimeMeta["location"]];
                temp[crimeMeta["description"]] = d[crimeMeta["description"]];
                temp[crimeMeta["weapon"]] = d[crimeMeta["weapon"]];
                temp[crimeMeta["post"]] = d[crimeMeta["post"]];
                temp[crimeMeta["district"]] = d[crimeMeta["district"]];
                temp[crimeMeta["neighborhood"]] = d[crimeMeta["neighborhood"]];
                temp[crimeMeta["lat"]] = parseFloat(d[crimeMeta["lat"]]);
                temp[crimeMeta["lon"]] = parseFloat(d[crimeMeta["lon"]]);
                i = i+1;
                
                console.log(temp);

                db.collection('crime')
                    .insertOne(temp,
                        function (err, result) {
                            assert.equal(err, null);
                            console.log("Inserted a document");
                            tempi++;
                    
                            if (tempi == i) {
                                console.log("CREATED THE DATABASE");
                                callback();   
                            }
                            
                        });
            })
            .on("end", function () {
                
            });
    }
}

function initializeMovies(db, callback) {
    if (FIRST_TIME_EXECUTED) {
        var parseDate = d3.time.format("%d-%b-%y").parse;
        var parseYear = d3.time.format("%Y").parse;

        var obj;
        fs.readFile("public/data/movies.json", 'utf8', function (err, data) {
            if (err) throw err;
            obj = JSON.parse(data);

            for (var i = 0; i < obj.length; i++) {
                var d = obj[i];

                var temp = {};
                temp[moviesMeta["gross"]] = +d[moviesMeta["gross"]];
                temp[moviesMeta["ratings"]] = +d[moviesMeta["ratings"]];
                temp[moviesMeta["budget"]] = +d[moviesMeta["budget"]];
                if (("" + d[moviesMeta["date"]]).split("-").length == 3) {
                    temp[moviesMeta["date"]] = "" + parseDate(d[moviesMeta["date"]]);
                } else {
                    temp[moviesMeta["date"]] = "" + parseYear(("" + d[moviesMeta["date"]]));
                }
                temp[moviesMeta["director"]] = d[moviesMeta["director"]];
                temp[moviesMeta["genre"]] = d[moviesMeta["genre"]];
                temp[moviesMeta["sales"]] = d[moviesMeta["sales"]];
                temp[moviesMeta["runningTime"]] = d[moviesMeta["runningTime"]];
                temp[moviesMeta["tomatoRating"]] = d[moviesMeta["tomatoRating"]];
                temp[moviesMeta["imdbvotes"]] = d[moviesMeta["imdbvotes"]];

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

function queryCrime(db, query, callback) {

    var groupID = {};

    var keys = Object.keys(crimeMeta);

    for (var i = 0; i < keys.length; i++) {

        var key = keys[i];

        groupID[crimeMeta[key]] = "$" + crimeMeta[key];
    }

    if (query != 0) {

        var data = db.collection("crime")
            .aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        "_id": groupID
                    }
                }
            ]);

    } else {
        
        console.log(groupID);

        var data = db.collection("crime")
            .aggregate([
                {
                    $group: {
                        "_id": groupID
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

    MongoClient.connect(mongourlMovies, function (err, db) {
        assert.equal(null, err);

        queryMovies(db, query,
            function (data) {
                db.close();
                res.write(JSON.stringify(data));
                res.end();
            });
    });

});

app.get('/getCrime', function (req, res, next) {

    var params = url.parse(req.url, true).query;

    var query = parseQueryString(params);

    MongoClient.connect(mongourlCrime, function (err, db) {
        assert.equal(null, err);

        queryCrime(db, query,
            function (data) {
                db.close();
                res.write(JSON.stringify(data));
                res.end();
            });
    });

});


MongoClient.connect(mongourlMovies, function (err, db) {
    assert.equal(null, err);
    initializeMovies(db, function () {
        db.close();
    });
});

MongoClient.connect(mongourlCrime, function (err, db) {
    assert.equal(null, err);
    initializeCrime(db, function () {
        db.close();
    });
});

// parse query string
function parseQueryString(params) {

    var data = qs.parse(params).data;

    if (data == "empty") {
        console.log(data);
        return 0;
    }

    var query = {};

    for (var i = 0; i < data.length; i++) {

        var q = {};

        var d = data[i];

        switch (d.operator) {

        case "range":
            if (d.index == "Date" || d.index == "crimeDate") {
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
                if (!isNaN(parseFloat(d.value[i])))
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