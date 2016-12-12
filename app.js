/*

LUIS DEMO

 vraaag: hoe kan ik jullie communiceren? of variatie hiervan
 enige medium is momenteel enkel 'telefoon, gsm, telephone'
 de rest wordt later geimplementeerd. dit is slechts een demo.

*/

require('dotenv-extended').load();

var restify = require('restify');
var builder = require('botbuilder');


var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);


const LuisUrl = process.env.LUIS_MODEL_URL;
var recognizer = new builder.LuisRecognizer(LuisUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });


intents.matches('contact', [
	function (session, args, next) {
		var medium = builder.EntityRecognizer.findEntity(args.entities, 'medium')
		if (!medium) {
			builder.Prompts.text(session, "Via welk communicatie kanaal?");
		} else {
			next({ response : medium.entity });
		}
	},
	function (session, results) {
		if (results.response == "telefoon" || results.response == "gsm" || results.response == "telephone") {
			session.send('U kunt ons bereiken met het nummer 02 343 434 09');
		} else {
			session.send('Momenteel enker bereikbaar via telefoon, onze excuses.');
		}
	}
])
.onDefault((session, args) => {
	console.log(args);
	session.send('Sorry, I did not get that.');
});

bot.dialog('/', intents);

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());
