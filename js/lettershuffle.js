"use strict";

$(function() {
    getHighScore();
    var timer;


    // get the high score and display it
    function getHighScore() {
        if (window.localStorage.highScoreInfo) {
            var retrievedScore = window.localStorage.getItem("highScoreInfo");
            $("#highscoreinfo").html(retrievedScore);
        }
    }

    //get the New Game button and set up a click handler
    $("#newgame").click(function () {
        //get word lists, choose a six-letter word and find all permutations of its letters
        getWordLists.then(
            function(value) {anagramIt(value);}
        );
        //remove previous event handler from submit button
        $("form").off("submit");
        //remove previous word list
        $("#correctwordlist").show().html('You\'ve found <span id="foundwords">0</span> word<span id="plural">s</span>:<br />');
        //clear previous score
        $("#currentscorenumber").html("0");
        //hide any previous errors
        $(".error").hide();
        //enable the text entry field, the shuffle button, and the submit button
        $("#shuffle").prop("disabled", false);
        $("#submit").prop("disabled", false);
        $("#words").prop("disabled", false);
        //make timer appear and start countdown
        clearInterval(timer);
        $("#min").show().html("3");
        $("#sec").show().html("00");
        timer = setInterval(countdown, 1000);
    });

    //timer to count down from 3 minutes
    function countdown() {
        //if there are more than zero seconds, subtract one
        if (parseInt($("#sec").html()) !== 0) {
            $("#sec").html(parseInt($("#sec").html() - 1));
            //if there are less than ten seconds, put a leading zero on
            if (parseInt($("#sec").html()) < 10) {
                $("#sec").html("0" + $("#sec").html());
            }
        //if seconds are zero but minutes are not, subtract one from the minutes and make seconds 59
        } else if (parseInt($("#min").html()) !== 0) {
            $("#min").html(parseInt($("#min").html() - 1));
            $("#sec").html(59);
        } else {
            //when time is zero, end the game
            alert("Game Over!");
            endGame();
            }
    }

    // stuff to do at the end of the game
    function endGame () {
        //stop the timer
        clearInterval(timer);
        //and disable the text entry field, the shuffle button, and the submit button
        $("#words").prop("disabled", true);
        $("#shuffle").prop("disabled", true);
        $("#submit").prop("disabled", true);
        //if the current score is greater than the high score
        if(parseInt($("#currentscorenumber").html()) > parseInt($("#highscore").html())) {
            //let the user know they have a high score and ask for their name
            var userName = prompt("You got a new high score! Please enter your name.");
            //output score, name, and date to the page
            $("#highscore").html($("#currentscorenumber").html());
            $("#nameanddate").html(" by " + userName + " on " + new Date().toLocaleDateString());
            //store them in the browser
            window.localStorage.setItem("highScoreInfo", $("#highscoreinfo").html());
        }
    }

    //get the word lists and assign them to variables
    let getWordLists = new Promise (function(resolve) {
        var wordLists = [];
        for (var x = 2; x <7; x++) {
            (function (x) {
                 $.ajax({
                    url:"wordlists/" + x + "-letter-words.json",
                    dataType: "JSON",
                    success: function(data) {
                         //assign the word list to a variable
                         wordLists[x] = data;
                    }
                });
            })(x);
        }
        resolve(wordLists);
    });

    //find all the permutations of the letters in a random 6-letter word
    function anagramIt(wordLists) {

        //choose a six-letter word at random
        var randomWord = wordLists[6][parseInt(Math.random() * wordLists[6].length)].word;

        //put each letter of that word into a letter array
        var letterArray = randomWord.split("");

        //for each item in the letter array
        var letterString = "";
        var anagramArray = [];
        letterArray.forEach(anagram);
        function anagram (value, index, arr) {

            //add to string
            letterString += value;

            //if the string length is at least 2
            if (letterString.length >= 2) {

                //check if it's in the string array
                if (anagramArray.some(matchString) === false) {
                    //if not, check if it's a word

                    if (wordLists[letterString.length].some(matchAnagramToWord) === true) {
                        //if it is, add it to the array
                        anagramArray.push(letterString);
                    }
                }
            }
            //make a new array without the item that we just added
            arr = arr.filter(function (v, i) {
                return i != index;
            });

            //iterate over the remaining letters
            arr.forEach(anagram);

            //at the end of each loop, remove the last letter from the string
            letterString = letterString.substring(0, letterString.length-1);
        }

        //output the total number of words to the page
        $("#totalwords").html("Find all " + anagramArray.length + " words to win!");

        //function to find real words
        function matchAnagramToWord (value) {
            return value.word == letterString;
        }

        //function to avoid duplicates in the anagram array
        function matchString (value) {
            return value == letterString;
        }

        //shuffle the letters of the word and output it to the page
        function shuffle (letterArray) {
            var shuffledArray = [];
            function getNewIndex(i) {
                var newIndex = parseInt(Math.random() * 100);
                if (shuffledArray[newIndex] === undefined) {
                    shuffledArray[newIndex] = letterArray[i];
                } else {
                    getNewIndex(i);
                }
            }
            for (var i=0; i<letterArray.length; i++) {
                getNewIndex(i);
            }
            shuffledArray = shuffledArray.filter(function (v) {
                return v;
            });
            $("#letter0").html(shuffledArray[0]);
            $("#letter1").html(shuffledArray[1]);
            $("#letter2").html(shuffledArray[2]);
            $("#letter3").html(shuffledArray[3]);
            $("#letter4").html(shuffledArray[4]);
            $("#letter5").html(shuffledArray[5]);
        }

        shuffle(letterArray);

        //get the Shuffle button and attach a click handler to shuffle when clicked
        $("#shuffle").click(function() {
            shuffle(letterArray);
            //return focus to text entry field
            $("#words").focus();
        });

        var correctWordArray = [];
        //get the text entry field from the page and when the user clicks submit
        $("#form").submit(function(event) {
            //don't actually submit the form
            event.preventDefault();
            //assign the entered word to a variable
            var enteredWord = $("#words").val();
            //make sure it's lowercase, since the word lists are
            enteredWord = enteredWord.toLowerCase();
            //hide any previous errors
            $(".error").hide();
            //validate the entered word
            isFairWord(enteredWord, anagramArray);
            //clear text entry field
            $("#words").val("");
            //return focus to text entry field
            $("#words").focus();

            function match(value) {
                return value === enteredWord;
            }
            function matchWordList(value) {
                return 	value.word === enteredWord;
            }

            function isFairWord(word, array) {
                //check if the word is in the anagram array
                if (array.some(match)) {
                    //check if it's already been submitted
                    if(correctWordArray.some(match)) {
                        //if so, return an error
                        $("#alreadyused").show();
                    } else {
                        //if not, add to array
                        correctWordArray.push(word);
                        // and output to a list on the page
                        $("#correctwordlist").html($("#correctwordlist").html() + word + ", ");
                        //update the found word count on the page
                        $("#foundwords").html(correctWordArray.length);
                        if (correctWordArray.length === 1) {
                            $("#plural").hide();
                        } else {
                            $("#plural").show();
                        }
                        //and update the score based on the length of the word
                        $("#currentscorenumber").html(parseInt($("#currentscorenumber").html()) + Math.pow(word.length, 2));
                        // if all words have been found, stop the timer and end the game
                        if (correctWordArray.length === anagramArray.length) {
                            alert("Congratulations, you won!");
                            endGame();
                        }
                    }
                //if not a word, return an error
                } else {
                    $("#notaword").show();
                }
            }


        });

    }

});
