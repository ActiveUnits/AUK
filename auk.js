var sys = require('sys');
var context = require('./auk-context');

// register communication channels available at runtime
// TODO make bellow automatic via probing...
context.registerChannels({
	simplehttp : './communication/oneway/simplehttp',
	simplexmpp : './communication/twoway/simplexmpp',
	socketio : './communication/twoway/socket.io'
});

//register components available at runtime
//TODO make bellow automatic via probing...
context.registerComponents({
	gameserver : './components/gameserver/server',
	pubsub : './components/pubsub'
});

// initialize http channel
var http = context.createChannel('simplehttp', {id:'simplehttp'});
http.connect();

//initialize xmpp channel
var xmpp = context.createChannel('simplexmpp', {id:'simplexmpp', 
												host:'xmpp.hookie.east.fi', 
												jid:'test@test.xmpp.hookie.east.fi', 
												pass:'hookie'
												});
xmpp.on('connected', function(event) {
	sys.log("XMPP CONNECTED at "+event.jid+"@"+event.host);
});
xmpp.on('statuschanged', function(event){
	if(event.status == 6)
		sys.log("XMPP DISCONNECTED");
});
xmpp.connect();

// initialize socketio channel
var socketio = context.createChannel('socketio', {id:'socketio', port: 8081});
socketio.connect();

//initialize pubsub component listening at http and xmpp channels
var pubsub = context.createComponent('pubsub');
pubsub.listenAtSimpleHttp(http);
pubsub.listenAtSimpleXmpp(xmpp);

// initialize game server component listening at socketio channel
var gameserver = context.createComponent('gameserver', {id:'gameserver', io:socketio.server});
gameserver.start();

// TODO implement bellow events dispatching... 
 gameserver.on('openedconnection', function(event){
	pubsub.publish('openedconnection',event.client.ip); // check client.ip accessible(?)
});

gameserver.on('closedconnection', function(event){
	pubsub.publish('closedconnection',event.client.ip); // check client.ip accessible(?)
});