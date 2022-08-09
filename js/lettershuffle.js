"use strict";

$(function() {
    getHighScore();
    var timer;

    function getHighScore() {
        if (window.localStorage.highScoreInfo) {
            var retrievedScore = window.localStorage.getItem("highScoreInfo");
            $("#highscoreinfo").html(retrievedScore);
        }
    }

    //get the New Game button and set up a click handler
    $("#newgame").click(function () {
        //get a six-letter word and find all permutations of its letters
        getWord(anagramIt);
        //remove previous event handler from submit button
        $("form").off("submit");
        //remove previous word list
        $("#correctwordlist").html("My Words:<br />");
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
            //when time is zero, stop the timer
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
            } else {
            // if not, alert the user that the game is over
            alert("Game Over!");
            }
        }
    }

    //get the JSON list of six-letter words and choose a word at random
    function getWord (callback) {
        $.ajax({
        url:"wordlists/6-letter-words.json",
        dataType: "JSON",
        success: function(data) {
            var sixLetterWordList = data;
            //choose a six-letter word at random from the word object
            var randomWord = sixLetterWordList[parseInt(Math.random() * sixLetterWordList.length)].word;
            callback(randomWord);
            }
        });
    }

    //find all the permutations of the letters in that word
    function anagramIt(randomWord) {

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
                    //if not, add to the string array
                    anagramArray.push(letterString);
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

        //function that we used earlier to avoid duplicates in the anagram array
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
                    //if it is, check if the word is a Scrabble word
                    $.ajax({
                        url:"wordlists/" + word.length + "-letter-words.json",
                        dataType: "JSON",
                        success: function(data) {
                            if (data.some(matchWordList)) {
                                //if so, check if it's already been submitted
                                if(correctWordArray.some(match)) {
                                    //if so, return an error
                                    $("#alreadyused").show();
                                } else {
                                    //if not, add to array
                                    correctWordArray.push(word);
                                    // and output to a list on the page
                                    $("#correctwordlist").html($("#correctwordlist").html() + word + ", ");
                                    //and update the score based on the length of the word
                                    $("#currentscorenumber").html(parseInt($("#currentscorenumber").html()) + Math.pow(word.length, 2));
                                }
                            //if not a Scrabble word, return an error
                            } else {
                            $("#notaword").show();
                            }
                        }
                    });
                    //if not in the anagram array, return an error
                } else {
                    $("#invalid").show();
                }

            }

        });

    }

});
