var Player = function(name) {
    var o = {
    answers: [],
    score: 0,
    name: name}
    return o;
}

var Quiz = {
    currentStatus: 0, //0 = start, 1 = working, 2 = between questions, 3 = finished (score overview)
    settingsStep: 0, //0 player amount, 1 player names, 2 questions
    players: [],
    questions: [],
    totalPlayers: 0,
    interval:null,
    init: function () {
        this.renderSettings();
    },
    
    refresh: function () {
        $.ajax("update/", {
                complete: this.didRefresh
                
        });
    },
    didRefresh: function (data) {
                    var response = data.responseJSON;
                    if (response.status) {
                        Quiz.questions = response.questions;
                        Quiz.currentStatus = response.status;
                        Quiz.currentQuestion = response.currentQuestion;
                        Quiz.players = response.players;
                        switch (response.status) {
//                            case: 0;
//                                this.renderSettings();
//                                break;
                            case 1:
                                Quiz.renderQuestion();
                                break;
                            case 2:
//                                this.renderScore();
//                                break;
                            case 3:
                                Quiz.renderWinner();
                                break;
                        }
                    }
    },
    renderSettings: function () {
        var html = "";
        html += "<h1>Welcome to Pub Quiz</h1>";
        
        switch (this.settingsStep) {
            case 0:
                html+= "<h2>Select the amount of players</h2>";
                html+= "<select name='players' id='settings_players'>";
                html+= "    <option>select amount of players</option>";
                html+= "    <option value='1'>1</option>";
                html+= "    <option value='2'>2</option>";
                html+= "    <option value='3'>3</option>";
                html+= "    <option value='4'>4</option>";
                html+= "    <option value='5'>5</option>";
                html+= "    <option value='6'>6</option>";
                html+= "    <option value='7'>7</option>";
                html+= "    <option value='8'>8</option>";
                html+= "    <option value='9'>9</option>";
                html+= "</select>";
                
                html+= "<a href='javascript:void(0);' onclick='Quiz.didSelectPlayers()'>Next -&gt;</a>";
                break;
            case 1:
                html+= "<h2>Name the players</h2>";
                for(var i = 0; i< this.totalPlayers; i ++) {
                    html += "<div>";
                    html += "   Player #" + (i+1) + "<input type='text' id='player_" + i + "'>";
                    html += "</div>";
                }
                
                html+= "<a href='javascript:void(0);' onclick='Quiz.didEnterPlayerNames();'>Next -&gt;</a>";
                
                break;
            case 2:
                html+= "<h2>Add questions for this quiz (current total: "+(this.questions.length)+" )</h2>";
                html+= "<div>Question Description: <input type='text' id='question' /></div>";
                html+= "<table>";
                html+= "<tr>";
                html+= "    <td>Answer</td>"
                html+= "    <td>correct answer</td>"
                html+= "</tr>";
                html+= "<tr><td>Answer A: <input type='text' maxlength='40' id='answer_a' /></td><td> <input type='radio' name='question_answer' value='0' /></td></tr>";
                html+= "<tr><td>Answer B: <input type='text' maxlength='40' id='answer_b' /></td><td> <input type='radio' name='question_answer' value='1' /></td></tr>";
                html+= "<tr><td>Answer C: <input type='text' maxlength='40' id='answer_c' /></td><td> <input type='radio' name='question_answer' value='2' /></td></tr>";
                
                html+= "</table>";
                
                html+= "<a href='javascript:void(0);' onclick='Quiz.didEnterQuestion();'>Add to list -&gt; </a>";
                
                if (this.questions.length > 0) {
                    html+= "<a href='javascript:void(0);' onclick='Quiz.didFinishQuestions();'>Start (Don't add) -&gt;</a>";
                }
                break;
            case 3:
                html+= "<h2>Done, with config</h2>";
                html+= "<a href='javascript:void(0);' onclick='Quiz.startWithSettings();'>Start Quiz -&gt;</a>";
                html+= "<a href='javascript:void(0);' onclick='Quiz.resetSettings();'>&lt;- Restart settings</a>";
                break;
        }
        
        $("main").html(html);
    },
    renderQuestion: function() {
        html = "<h1>" + this.questions[this.currentQuestion].desc + "</h1>";
                        
        var abc = ["A", "B", "C"];
        var ansStr = "<ul>";
        for(var i = 0; i < this.questions[this.currentQuestion].options.length; i++) {
            ansStr += "<li>" + abc[i] + ": "+this.questions[this.currentQuestion].options[i]+"</li>"
        }
        ansStr += "</ul>"
        html += ansStr;
        
        html += this.getInfo();
        
        $("main").html(html);
    },
    getInfo: function () {
        var infoStr = "<h3>Info</h3>";
        infoStr += "<ul>";

        infoStr += "<li>Question "+ (this.currentQuestion + 1) +" / "+ this.questions.length +"</li>";

        if (this.currentStatus == 1) {
            infoStr += "<li>Waiting for: ";
            for (var i = 0; i< this.players.length; i++) {
                if (this.players[i].answers[this.currentQuestion] == undefined) {
                    if (i > 0) {
                        infoStr += ", ";
                    }
                    infoStr += "<b>" + this.players[i].name + "</b>";
                }
            }
            infoStr += "</li>"
        }
        if (this.status > 1) {
            infoStr += "<li><a href='javascript:void(0);' onClick='reset()' class='reset'>New Round</a></li>";
        }

        infoStr += "</ul>";
        return infoStr;
    },
    renderScore: function() {
        
    },
    renderWinner: function() {
        var html = "<h1>Score count</h1>";
        this.players.sort(function(a,b){return a.score - b.score});
        this.players.reverse()
        var str = "<ul>";
        var firstScoreCount = 0;
        for (var i = 0; i< this.players.length; i++) {
            str += "<li><b>" + this.players[i].name + "</b>: " + Math.round(this.players[i].score) + "%</li>"
            if (this.players[i].score == this.players[0].score) {
                firstScoreCount ++;
            }
        }
        str += "</ul>";
        str += "<b>";
        for (var i = 0; i < firstScoreCount ; i++) {
            if (i > 0) {
                str+= "</b> and <b>"
            }
            str += this.players[i].name
        }

        var wintext = firstScoreCount > 1 ? "win" : "wins";

        str += "</b> "+wintext+" this round!";
        $("main").html(html + str);
    },
    didSelectPlayers: function() {
        var playersVal = parseInt($("#settings_players").val());
        if (playersVal > 0 && playersVal < 10) {
            this.totalPlayers = playersVal;
            this.settingsStep = 1;
            this.renderSettings();
        } else {
            alert("Please select the amount of players (1-9)");
        }
    },
    didEnterPlayerNames: function() {
        var errorStr = "";
        this.players = [];//reset when people retry
        for(var i = 0; i< this.totalPlayers; i ++) {
            this.players[i] = Player($("#player_"+i).val());
            if (this.players[i] == "") {
                errorStr += "Please enter a name for player number " + (i+1);
            }
        }
        if (errorStr == "") {
            this.settingsStep = 2;
            this.renderSettings();
        } else {
            alert(errorStr);
        }
    },
    didEnterQuestion: function() {
        var strError = "";
        
        var questionDescription = $("#question").val();
        var answerA = $("#answer_a").val()
        var answerB = $("#answer_b").val()
        var answerC = $("#answer_c").val()
        var correctAnswer = $("input[name='question_answer']:checked").val();
        
        if (questionDescription == "") {
            strError += "Please add the question description \n";
        }
        
        if (answerA == "") {
            strError += "Please add an answer for the A option";
        }
        if (answerB == "") {
            strError += "Please add an answer for the B option";
        }
        if (answerC == "") {
            strError += "Please add an answer for the C option";
        }
        if (correctAnswer == undefined) {
            strError += "Please provide the correct answer";
        }
        
        if (strError == "") {
            this.questions.push({desc:questionDescription, options: [answerA, answerB, answerC], answer: parseInt(correctAnswer)});
            this.renderSettings();
        } else {
            alert(strError);
        }
        
    },
    didFinishQuestions: function() {
        this.settingsStep++;
        this.renderSettings();
    },
    startWithSettings: function() {
        var q = this;
        $.ajax({
            type: "POST",
            url: "settings/",
            dataType: 'json',
            data: JSON.stringify({players: this.players, questions: this.questions}), 
            complete:this.start
        });
    },
    start: function() {
            if (this.interval != undefined) {
                clearInterval(interval);
            }
            this.interval = setInterval("Quiz.refresh()", 500);
    }
};

function reset() {
            $.ajax("reset/",{});
        }
        
//        function refresh() {
//            $.ajax("update/",{
//                complete: function(data) {
//                    var response = data.responseJSON
//                    if (response.status != 1) {
//                        $("#question").text(data.responseJSON.question.desc);
//                        
//                        var abc = ["A", "B", "C"];
//                        var ansStr = "<ul>";
//                        for(var i = 0; i < data.responseJSON.question.options.length; i++) {
//                            ansStr += "<li>" + abc[i] + ": "+data.responseJSON.question.options[i]+"</li>"
//                        }
//                        ansStr += "</ul>"
//                        $("#answers").html(ansStr);
//                    } else {
//                        
//                    }
//                    
//                    var infoStr = "<h3>Info</h3>";
//                    infoStr += "<ul>";
//                    
//                    infoStr += "<li>Question "+ (response.currentQuestion + 1) +" / "+ response.questions.length +"</li>";
//                       
//                    if (response.status == 0) {
//                        infoStr += "<li>Waiting for: ";
//                        for (var i = 0; i< response.players.length; i++) {
//                            if (response.players[i].answers[response.currentQuestion] == undefined) {
//                                if (i > 0) {
//                                    infoStr += ", ";
//                                }
//                                infoStr += "<b>" + response.players[i].name + "</b>";
//                            }
//                        }
//                        infoStr += "</li>"
//                    }
//                    if (response.status == 1) {
//                        infoStr += "<li><a href='javascript:void(0);' onClick='reset()' class='reset'>New Round</a></li>";
//                    }
//                    
//                    infoStr += "</ul>";
//                    
//                    
//                    $("#info").html(infoStr);
//                }
//            });
//        }
        
//        $(document).ready(function(){
//            setInterval(refresh, 500);
//        })