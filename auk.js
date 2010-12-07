var sys = require('sys');
var context = require('./auk-context');

// initialize channels
var http = context.createChannel('./communication/oneway/simplehttp').connect();

var xmpp = context.createChannel('./communication/twoway/simplexmpp', {
						host:'host', 
						jid:'test@test.host', 
						pass:'something'
					}).connect();

var socketio = context.createChannel('./communication/twoway/socket.io', {
						http: http.server
					}).connect();

//initialize components
var pubsub = context.createComponent('./components/pubsub')
						.listenAtSimpleHttp(http)
						.listenAtSimpleXmpp(xmpp);

var gameserver = context.createComponent('./components/gameserver/server', {
						id:'gameserver', 
						io:socketio.server
					});

// custom test logic 
gameserver.on('openedconnection', function(event){
	pubsub.publish('openedconnection', event.client.sessionId);
});

gameserver.on('closedconnection', function(event){
	pubsub.publish('closedconnection', event.client.sessionId); 
});

gameserver.start();