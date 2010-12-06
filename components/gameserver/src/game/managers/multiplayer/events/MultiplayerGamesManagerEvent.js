MultiplayerGamesManagerEvent = module.exports = function(type, sessionId, data)
{
	this.type = type;
	this.sessionId = sessionId;
	this.data = data;
}

MultiplayerGamesManagerEvent.CREATE_RESULT = "CREATE_RESULT";
MultiplayerGamesManagerEvent.GAME_CREATED = "GAME_CREATED";
MultiplayerGamesManagerEvent.LIST_RESULT = "LIST_RESULT";
