//Test 
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
	return "bnd@bnd.benelux.be"
};

exports.getPhoneNumber = function () {
	return "+322 343 434 09"
};

exports.makeCase = function (title, body) {

}