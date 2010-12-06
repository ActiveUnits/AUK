var SocketDataManager = require('../base/SocketDataManager');

var sys = require('sys');

MultiplayerGame = module.exports = function(context)
{
	this.name = null;
	this.sessionId = null;
	
	this.context = context;
	this.gamesBySessionId = new Array();
}

MultiplayerGame.prototype = new SocketDataManager();
MultiplayerGame.prototype.execute = function(client, data)
{
	sys.log("#--- execute! ---#: " + data.type);
	
	switch (data.type)
	{
		case MultiplayerGame.JOIN:
			this.executeJoin(client, data);
		break;
		case MultiplayerGame.LEAVE:
			this.executeLeave(client, data);
		break;
	}
}

MultiplayerGame.prototype.executeJoin = function(client, data)
{
}

MultiplayerGame.prototype.executeLeave = function(client, data)
{
}

MultiplayerGame.JOIN = "JOIN";
MultiplayerGame.LEAVE = "LEAVE";