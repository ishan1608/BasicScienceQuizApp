var dataBank = [];
var questions_asked = [];
var NUM_QUESTIONS = 30;
var questionNumber;
var currentQuestion = 0;
var numberOfQuestions = 0;
var MAX_QUESTIONS = 5;
var TIME_PER_QUESTION;
var VIBRATION_TIME = 250;

var i = 0;
var start_button;
var answer;
var correctAnswers = 0;
var wrongAnswers = 0;
var opted = false;

var selectQuestion = function () {
    // console.log("initializing selectQuestion");
    var unique = true;
    while (unique) {
        questionNumber = Math.floor(Math.random() * NUM_QUESTIONS) + 1;
        for (i = 0; i < questions_asked.length; i++) {
            if (questionNumber === questions_asked[i]) {
                unique = false;
                break;
            }
        }
        if (unique) {
            questions_asked.push(questionNumber);
            break;
        }
    }
    return questionNumber;
};

var initialize_question = function (number) {
    // For the timer
    opted = false;
    
    var questionSet = dataBank.data[number - 1];
    document.getElementById("question_no").innerText = "Question : " + numberOfQuestions;
    document.getElementById("question_text").innerText = questionSet[1];
    document.getElementById("option_1_text").innerText = "A : " + questionSet[2];
    document.getElementById("option_2_text").innerText = "B : " + questionSet[3];
    document.getElementById("option_3_text").innerText = "C : " + questionSet[4];
    document.getElementById("option_4_text").innerText = "D : " + questionSet[5];
    
    // Timer to be used
    var seconds_left = TIME_PER_QUESTION;
    document.getElementById("timer").innerText = "00:" + seconds_left;
    var interval = setInterval(function() {
        seconds_left = seconds_left - 1;
        if((currentQuestion == number) && (!opted)) {
            document.getElementById("timer").innerText = "00:" + seconds_left;
        }

        if (seconds_left <= 1)
        {
            clearInterval(interval);
        }
    }, 1000);
    
    // Call the next question if not answered
    // WIP
    setTimeout(function () {
        // alert('curr : '+currentQuestion + '\nnum : '+ number);
        if((currentQuestion === number) && (!opted)) {
            // Just to be on the safe side
            optionsEnabler(false);
            
            wrongAnswers = wrongAnswers + 1;
            document.getElementById("timer").innerText = "Time Expired";
            
            // Displaying the correct answer
            // W.I.P.
            setTimeout(function () {
                answer = dataBank.data[currentQuestion - 1][6];
                document.getElementById("option_" + answer).style.color = "green";
                // Vibrate
                navigator.vibrate(VIBRATION_TIME);
            },500);
        }
    }, (TIME_PER_QUESTION) * 1000);
    
    setTimeout(function () {
        // alert('curr : '+currentQuestion + '\nnum : '+ number);
        if(currentQuestion === number) {
            // waitAndNext(false);
            nextWithoutWait(false);
        }
    }, (TIME_PER_QUESTION + 2.5) * 1000);
};

var initialize = function () {
    // Reads the csv file and initializes the question after reading the csv file
    // console.log("initializing csv");
    $.get("data/BasicScience.csv", function (data) {
        var results = Papa.parse(data, {
            dynamicTyping: true
        });
        dataBank = results;
        console.log(dataBank);
        
        // Initializing first question
        currentQuestion = selectQuestion();
        initialize_question(currentQuestion);
    });
};

// Reset option colors to black
var resetOptions = function () {
    for (i = 1; i < 5; i++) {
        document.getElementById("option_" + i).style.color = "black";
    }
};

var initialize_display = function () {
    // console.log("initializing display");
    // Displaying main content
    var main_element = document.getElementsByClassName("main");
    main_element = main_element[0];
    main_element.style.display = 'block';
    
    // Hiding Start Buttons
    $('.start_buttons')[0].style.display = 'none';
    $('.start_buttons')[1].style.display = 'none';
    
    resetOptions();
};

var optionsEnabler = function (what) {
    // Options    
    if (what) {
        $( "body" ).on( "click", "#option_1", function () {
            selection(1);
        } );
        $( "body" ).on( "click", "#option_2", function () {
            selection(2);
        } );
        $( "body" ).on( "click", "#option_3", function () {
            selection(3);
        } );
        $( "body" ).on( "click", "#option_4", function () {
            selection(4);
        } );
    } else {
        $( "body" ).off( "click", "#option_1" );
        $( "body" ).off( "click", "#option_2" );
        $( "body" ).off( "click", "#option_3" );
        $( "body" ).off( "click", "#option_4" );
    }
};

var nextQuestion = function () {
    console.log("nextQuestion");
    // Incrementing the number of questions
    numberOfQuestions = numberOfQuestions + 1;
    // Reseting options
    resetOptions();
    // Ask next question
    currentQuestion = selectQuestion();
    initialize_question(currentQuestion);
    
    // window.setTimeout(nextQuestion, 5000);
    
    console.log("Enabling options");
    // Enabling options to be selected
    optionsEnabler(true);
};

var waitAndNext = function (what) {
    
    // Disabling the further selection of options
    optionsEnabler(false);
    
    if (what) {
        // Audio
        var audio = new Audio('data/test_cbr.mp3');
        audio.play();
    } else {
        // Vibrate
        navigator.vibrate(VIBRATION_TIME);
    }
    
    // Waiting and calling next question
    setTimeout(function () {
        if (numberOfQuestions === MAX_QUESTIONS) {
            finishGame();
            return;
        } else {
            nextQuestion();
        }
    }, 2500);
};

var nextWithoutWait = function (what) {
    // Disabling the further selection of options
    optionsEnabler(false);
    
    // Calling next question
    if (numberOfQuestions === MAX_QUESTIONS) {
        finishGame();
        return;
    } else {
        nextQuestion();
    }
};

var selection = function (option) {
    // This is for the timer
    opted = true;
    
    var questionSet = dataBank.data[currentQuestion - 1];
    answer = questionSet[6];
    if (option === answer) {
        // Counting correct answers
        correctAnswers = correctAnswers + 1;
        // The correct answer is chosen
        document.getElementById("option_" + option).style.color = "green";
        
        // wait and going to next question for right answer
        waitAndNext(true);
        return;
    } else {
        // Not Correct answer
        // Count wrong Answers
        wrongAnswers = wrongAnswers + 1;
        document.getElementById("option_" + option).style.color = "red";
        // Displaying the correct answer
        document.getElementById("option_" + answer).style.color = "green";
        
        // wait and going to next question for wrong answer
        waitAndNext(false);
        return;
    }
};

// Start of the game
var start = function (time) {
    initialize();
    numberOfQuestions = 1;
    initialize_display();
    TIME_PER_QUESTION = time;
    // I am leaving it for future
    // If not chosen an option go to next
    // window.setTimeout(nextQuestion, 10000);
};

// Start Buttons
document.getElementById("start_button").onclick = function() {
    start(5);
};
document.getElementById("start_button1").onclick = function() {
    start(10);
};

var finishGame = function () {
    // Increasing the currentQuestion so that it doesn't times out
    currentQuestion = currentQuestion + 1;
    // Finish the game
    document.write("<h1>Game End</h1><br/>Correct : " + correctAnswers + "<br/>Wrong : " + wrongAnswers);
};

// Enabling the options for the first execution of the game
optionsEnabler(true);