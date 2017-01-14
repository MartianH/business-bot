require('dotenv-extended').load();

var restify = require('restify');
var builder = require('botbuilder');
var service = require('./service');
var fs = require('fs');
var util = require('util');
var text = JSON.parse(fs.readFileSync('lang.json', 'utf-8'))


var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);


const LuisUrl = process.env.LUIS_MODEL_URL;
var recognizer = new builder.LuisRecognizer(LuisUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
var language;


intents.matches('contact', [
	function (session, args, next) {
		if (typeof(language) != 'undefined') {
			var echoMessage = session.message.text;
			language = service.detectLanguage(echoMessage)
			console.log('\n-DETECTED LANGUAGE-\n' + language);
			var phoneMedium = builder.EntityRecognizer.findEntity(args.entities, 'medium::phone');
			var emailMedium = builder.EntityRecognizer.findEntity(args.entities, 'medium::email');

			if (phoneMedium) {
				service
					.getPhoneNumber()
					.then( function(number){
						session.send(util.format('%s %s', text[language].contactNummer, number));
						builder.Prompts.choice(session, text[language].satisfaction, [text[language].yes,  text[language].no]);
					});
			}
			else if (emailMedium) {
				service
					.getEmail()
					.then( function(email){
						session.send(util.format('%s %s', text[language].contactEmail, email));
						builder.Prompts.choice(session, text[language].satisfaction, [text[language].yes,  text[language].no]);
					});
			} else {
				builder.Prompts.choice(session, text[language].whichChannel, [text[language].phone, text[language].email]);
			}
		} else {
			session.send('Taal werd niet begrepen, enkel frans, engels, nederlands. Probeer een langere zin?');
		}
	},
	function (session, results, next) {
		if (results.response.entity == text[language].phone) {
			service
				.getPhoneNumber()
				.then( function(number){
					session.send(util.format('%s %s', text[language].contactNummer, number));
					builder.Prompts.choice(session, text[language].satisfaction, [text[language].yes,  text[language].no]);
				});
		}
		else if (results.response.entity == text[language].email) {
			service
				.getEmail()
				.then( function(email){
					session.send(util.format('%s %s', text[language].contactEmail, email));
					builder.Prompts.choice(session, text[language].satisfaction, [text[language].yes,  text[language].no]);
			});
		}
		else {
			next({response:results.response});
		}
	},
	function (session, results, next) {
		if (results.response.entity == text[language].no) {
			console.log(results.response.entity);
			builder.Prompts.text(session, text[language].problem);
		}
		else if(results.response.entity == text[language].yes) {
			console.log(results.response.entity);
			session.send(text[language].good);
			session.endConversation();
		}
	},
	function (session, results) {
         service.makeCase(results.response);
         session.send(text[language].caseConfirm);
         session.endConversation();
	}
])
.onDefault((session, args) => {
	var echoMessage = session.message.text;
	language = service.detectLanguage(echoMessage);
	if (typeof(language) != 'undefined') {
		console.log('\n-DETECTED LANGUAGE-\n' + language);
		session.send(text[language].didNotUnderstand);
	}
	else {
		session.send('Taal werd niet begrepen, enkel frans, engels, nederlands. Probeer een langere zin?');
	}
});

bot.dialog('/', intents);

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());
