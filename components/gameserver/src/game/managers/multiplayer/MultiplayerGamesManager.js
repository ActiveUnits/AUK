var SocketDataManager = require('../base/SocketDataManager');

var MultiplayerGame = require('./MultiplayerGame');
var MultiplayerGamesManagerEvent = require('./events/MultiplayerGamesManagerEvent');

var sys = require('sys');

MultiplayerGamesManager = module.exports = function(context)
{
	this.context = context;
	this.gamesBySessionId = new Array();
}

MultiplayerGamesManager.prototype = new SocketDataManager();
MultiplayerGamesManager.prototype.execute = function(client, data)
{
	sys.log("#--- execute! ---#: " + data.type);
	
	switch (data.type)
	{
		case MultiplayerGamesManager.CREATE:
			this.executeCreate(client, data);
		break;
		case MultiplayerGamesManager.LIST:
			this.executeList(client, data);
		break;
	}
}

MultiplayerGamesManager.prototype.executeCreate = function(client, data)
{
	MultiplayerGamesManager.$id ++
	
	var name = data.name ? data.name : "Multiplayer game " + MultiplayerGamesManager.$id;
	var sessionId = "MG" + MultiplayerGamesManager.$id;
	
	var multiplayerGame = new MultiplayerGame();
	multiplayerGame.name = name;
	multiplayerGame.sessionId = sessionId;
	
	this.gamesBySessionId[sessionId] = multiplayerGame;
	
	// Client event
	
	var socketEvent2 = new MultiplayerGamesManagerEvent(MultiplayerGamesManagerEvent.CREATE_RESULT);
	socketEvent2.sessionId = sessionId;
	socketEvent2.data = {name: name};
	
	this.context.socketEventsManager.dispatchEvent(socketEvent2, client, data.dispatcherId);
	
	// Global event
	
	var socketEvent1 = new MultiplayerGamesManagerEvent(MultiplayerGamesManagerEvent.GAME_CREATED);
	socketEvent1.sessionId = sessionId;
	socketEvent1.data = {name: name};
	
	this.context.socketEventsManager.dispatchEvent(socketEvent1);
}

MultiplayerGamesManager.prototype.executeList = function(client, data)
{
	var list = new Array();
	var multiplayerGame;
	
	for (var s in this.gamesBySessionId)
	{
		multiplayerGame = this.gamesBySessionId[s];
		
		list.push({name:  multiplayerGame.name, 
				   sessionId: multiplayerGame.sessionId});
	}
	
	var socketEvent = new MultiplayerGamesManagerEvent(MultiplayerGamesManagerEvent.LIST_RESULT);
	socketEvent.data = list;
	
	this.context.socketEventsManager.dispatchEvent(socketEvent, client, data.dispatcherId);
}

MultiplayerGamesManager.$id = 0;

MultiplayerGamesManager.CREATE = "CREATE";
MultiplayerGamesManager.LIST = "LIST";