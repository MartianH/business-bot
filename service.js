var github = require('octonode');
var promise = require('promise');

var client = github.client({
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_PASSWORD
},{
  hostname: 'api.github.com'
});


var args = process.argv.slice(2);
require('cld').detect(args[0], function(err, result) {
  if (err) {
  	console.log(err);
  }
  else {
  	console.log(result.languages[0].name);
  }
});



exports.detectLanguage = function (phrase) {
	var lang;
	require('cld').detect(phrase, function(err, result) {
	  if (err) {
	  	console.log(err);
	  }
	  else {
	  	lang = result.languages[0].name;
	  }
	});

	return lang;
};

exports.getEmail = function () {
	return new Promise (function (resolve, reject) {
		var ghme = client.me();

		ghme.emails(function (err, result) {
			if (err) {
				reject(err);
			} else {
				resolve(result[0].email);
			}
		})
	});
};

exports.getPhoneNumber = function () {
	return new Promise (function (resolve, reject) {
		var ghme = client.me();

		ghme.info(function (err, result) {
			if (err) {
				reject(err);
			} else {
				resolve(result.blog);
			}
		})
	});
};

exports.makeCase = function (title) {
	return new Promise (function (resolve, reject) {
		var ghrepo = client.repo('BusinessNDecision/business-bot');;
		ghrepo.issue({
		  "title": title,
		}, function(err, response) {
			if (!err) {
				reject(err);
			}
			else {
				resolve(response);
			}
		});
	})
}