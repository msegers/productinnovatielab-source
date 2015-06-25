//serial port init
var serialport = require('serialport'),// include the library
   SerialPort = serialport.SerialPort, // make a local instance of it
   // get port name from the command line:
   portName = process.argv[2];

//servi init for web access
var servi = require('servi');
var gameStatus = 0;
var myPort = new SerialPort(portName, {
   baudRate: 9600,
   // look for return and newline at the end of each data packet:
   parser: serialport.parsers.readline("\r\n")
 });

var currentQuestion = 0;
var questions = [];

var Player = function(name) {
    var o = {
    answers: [],
    score: 0,
    name: name}
    return o;
}

var players = [Player("Player 1"), Player("Player 2")]

myPort.on('open', showPortOpen);
myPort.on('data', saveLatestData);
myPort.on('close', showPortClose);
myPort.on('error', showError);

function showPortOpen() {
	console.log("opening port at Baud rate: " + myPort.options.baudRate);
}

function saveLatestData(data) {
	console.log("receiving " + data);
    if (data.length == 3 && data[0] == "t") {
        var player = players[parseInt(data[1]-1)];
        if (player.answers[currentQuestion] != undefined) {
            return;
        }
        var answer = data[2];
        if (answer == "a") {
            player.answers[currentQuestion] = 0;
        } else if (answer == "b") {
            player.answers[currentQuestion] = 1;
        } else if (answer == "c") {
            player.answers[currentQuestion] = 2;
        }
        
    }
    console.log(players);
    var allDidFinish = true;
    for (var i = 0; i < players.length; i++) {
        player = players[i];
        if (player.answers[currentQuestion] == undefined) {
            allDidFinish = false;
        }
    }
    
    if (allDidFinish) {
        if (currentQuestion < (questions.length - 1)) {
            for (var i = 0; i < players.length; i++) {
                player = players[i];
                if (player.answers[currentQuestion] == questions[currentQuestion].answer) {
                    player.score += 100 / questions.length 
                }
            }
            currentQuestion++;
        } else {
            gameStatus = 2;
        }
    }
}

function showPortClose() {
	console.log("end of session");
}

function showError(error) {
	console.log("Something went wrong:" + error);
}

var app = new servi(false);
app.port(8080);
app.serveFiles("public");
app.route("/update", mainAppRoute);
app.route("/reset", resetGame);
app.route("/settings", doSettings);
app.start();

function doSettings(request) {
    for (var key in request.fields) {
        var j = JSON.parse(key);
        questions = j.questions;
        players = j.players;
        players = j.players;
        request.respond("");
        gameStatus = 1;
    }
}

function resetGame(request) {
    gameStatus = 0;
    currentQuestion = 0
    
    for (var i = 0; i < players.length; i++) {
        players[i].answers = [];
    }
    
    if (request) {
        request.respond("");
    }
}

resetGame();

function mainAppRoute(request) {
    request.header("application/json");
    //request.respond(JSON.stringify(data));
    //request.setHeader('Content-Type', 'application/json');
    request.respond(JSON.stringify(
        {
            question:questions[currentQuestion],
            questions:questions,
            players:players,
            status:gameStatus,
            currentQuestion:currentQuestion
        }
    ));
}