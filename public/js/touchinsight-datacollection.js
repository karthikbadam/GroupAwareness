var sequence = ["Thumbnail", "Micro Viz", "Large Display"];

var participantID = "P10";

var NUMBER_OF_QUESTIONS = 7;

var questionsFile = "data/statements.csv";

var distribution = [3, 2, 2];

var id = "ID";
var level = "level"
var question = "question";
var type = "type";
var answer = "answer";
var points = "points";

var buttons = ["PREVIOUS", "REFRESH", "NEXT", "DOWNLOAD"];

var allQuestions = {};

var counter = 1;

var currentObject = {};

var log = [];

var time1 = Date.now();

var device = "DATA_COLLECTOR";

var touchSync;

function blink(selector) {
    $(selector).fadeOut('fast', function () {
        $(this).fadeIn('fast', function () {
        });
    });
}

$(document).ready(function () {

    var options = {};

    options.callback = function (query, time, hostDevice) {

        console.log("Got new data");

    }

    touchSync = new Sync(options);

    // creating the four buttons
    for (var i = 0; i < buttons.length; i++) {

        d3.select("#buttonpanel-data").append("div")
            .attr("id", buttons[i])
            .attr("class", "operator")
            .style("width", (100 / buttons.length) + "%")
            .style("text-align", "center")
            .style("vertical-align", "middle")
            .style("cursor", "pointer")
            .text(buttons[i])
            .on("mousedown", function () {

                currentLogic = this.textContent;

                if (currentLogic == "NEXT") {

                    var answer = (""+$("input[name=ans]:checked").val() == "true")? 1: 0;
                    
                    currentObject.isCorrect = (answer == +currentObject.answer ? 1 : 0);
                    
                    currentObject.givenAns = answer;

                    currentObject.time = Date.now() - time1;

                    //currentObject.switches = $("#switch-textbox").val();
                    
                    blink('#question');

                    log.push(currentObject);

                    //pushing the current log object
                    touchSync.push(currentObject);

                    next(counter++);

                    //start timer
                    time1 = Date.now();
                    
                    $('#cfalse').prop('checked', true);
                    
                    blink('#answer');
                }
            
                if (currentLogic == "REFRESH") {
                     
                    //start timer
                    time1 = Date.now();
                }

                if (currentLogic == "DOWNLOAD") {

                    var data = new Blob([JSON.stringify({
                        data: log
                    })], {
                        type: 'text/plain'
                    });

                    window.open(window.URL.createObjectURL(data), "data.txt", '');

                }

                if (currentLogic == "PREVIOUS") {

                    if (counter > 1) {

                        next(counter--);
                        
                        time1 = Date.now();
                        
                        blink('#question');

                    } else {
                        
                        alert("Beginning!")
                    }   
                }

            });
    }
    
    d3.select("#divTrue").on('click', function () {
        $('#ctrue').prop('checked', true);    
    });
    
    d3.select("#divFalse").on('click', function () {
        $('#cfalse').prop('checked', true);    
    });

    d3.csv(questionsFile, function (data) {

        data.forEach(function (d) {

            if (!allQuestions[d.level])
                allQuestions[d.level] = [];

            allQuestions[d.level].push(d);

        });

        next(0);

        time1 = Date.now();

    });

});

function next(counter) {

    var seqIndex = Math.floor(counter / NUMBER_OF_QUESTIONS);

    if (counter >= sequence.length * NUMBER_OF_QUESTIONS) {

        d3.select("#title").text("Finished!")
            .style("font-size", "30px")
            .style("color", "white")
            .style("margin", "50px");

        d3.select("#question").text("");

        var data = new Blob([JSON.stringify({
            data: log
        })], {
            type: 'text/plain'
        });

        window.open(window.URL.createObjectURL(data), "data.txt", '');

        return;
    }

    var questionIndex = counter % NUMBER_OF_QUESTIONS;
    
     d3.select("#title").text(sequence[seqIndex] + " (" + participantID + "): " + (questionIndex + 1) + "/"+NUMBER_OF_QUESTIONS)
        .style("font-size", "30px")
        .style("color", "white")
        .style("margin", "50px");

    var sum = 0;

    var levelIndex = "1";
    var qIndex = 0;

    for (var i = 0; i < distribution.length - 1; i++) {

        sum += distribution[i];

        if (questionIndex >= sum && questionIndex < sum + distribution[i + 1]) {

            levelIndex = "" + (i + 2);
            qIndex = questionIndex - sum;
            break;
        }

        levelIndex = "1";
        qIndex = questionIndex;

    }

    console.log(questionIndex + ", " + levelIndex + ", " + (qIndex * sequence.length + seqIndex));

    var qObject = allQuestions[levelIndex][qIndex * sequence.length + seqIndex];

    currentObject = qObject;
    
    currentObject.answer = +currentObject.answer;

    currentObject.condition = sequence[seqIndex];

    currentObject.pID = participantID;

    d3.select("#question").select("div")
        .attr("id", "q" + questionIndex)
        .text(qObject.question)
        .style("color", "white")
        .style("margin", "50px")
        .style("font-size", "40px");

    d3.select("#answer").style("color", "white")
        .style("margin-left", "100px")
        .style("font-size", "20px");

    //    d3.select("#switches").style("color", "white")
    //        .style("margin-left", "100px")
    //        .style("margin-top", "30px")
    //        .style("font-size", "20px")
}