require('dotenv-extended').load();

var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//var connector = new builder.ChatConnector().listen();
//var bot = new builder.UniversalBot(connector);

const LuisUrl = 'https://api.projectoxford.ai/luis/v2.0/apps/99cf89b3-5a8f-4eba-bbfd-67d9221de617?subscription-key=f86540e4f0894384916ef5e7d7146047&q=';
var recognizer = new builder.LuisRecognizer(LuisUrl);
var intent = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intent)
	.matches('contact', [
		function (session, args, next) {
			var task = builder.EntityRecognizer.findEntity(args.entities, 'medium')
			if (!task) {
				session.Prompts.text(session, "Via welk communicatie kanaal?");
			} else {
				next({ response : task.entity });
			}
		},
		function (session, results) {
			if (results.response) {
				session.send('response is %s', results.response);
			} else {
				session.send('good on first try');
			}
		}
	]);

//intent.onDefault(builder.DialogAction.send("Heb ik niet begrepen. Kunt u het opnieuw vragen?"));
