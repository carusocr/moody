var alexa = require('alexa-app');
var mysql = require('mysql');
var iniparser = require('iniparser')
var config = iniparser.parseSync('apps/moody/db.ini')
var env = process.env.NODE_ENV || 'dev'; //startup nodejs with e.g:  NODE_ENV= node server.js

connection = mysql.createConnection({
    host        : config[env]['host'],
    user        : config[env]['user'],
    password    : config[env]['pwd'],
    database    : config[env]['dbname']
}),

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

// Define an alexa-app
var app = new alexa.app('moodchecker');

app.launch(function(req,res) {
	var number = Math.floor(Math.random()*99)+1;
	res.session('number',number);
	res.session('guesses',0);
	var prompt = "Guess a number between 1 and 100!";
	res.say(prompt).reprompt(prompt).shouldEndSession(false);
});
app.intent('guess',{
		"slots":{"guess":"NUMBER"}
		,"utterances":["{1-100|guess}"]
	},
	function(req,res) {
		var guesses = (+req.session('guesses'))+1;
		var guess = req.slot('guess');
		var number = +req.session('number');
		if (!guess) {
			res.say("Sorry, I didn't hear a number. The number was "+number);
		}
		else if (guess==number) {
			res.say("Congratulations, you guessed the number in " + guesses + (guesses==1?" try":" tries"));
		}
		else {
			if (guess > number) {
				res.say("Guess lower");
			}
			else if (guess < number) {
				res.say("Guess higher");
			}
			res.reprompt("Sorry, I didn't hear a number. Try again.");
			res.session('guesses',guesses);
			res.shouldEndSession(false);
		}
	}
);
module.exports = app;
