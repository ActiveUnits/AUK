CommunicationManagerEvent = module.exports = function(type, client, message)
{
	this.type = type;
	this.client = client;
	this.message = message;
}

CommunicationManagerEvent.SOCKET_EVENTS_MANAGER = "SOCKET_EVENTS_MANAGER";
CommunicationManagerEvent.ACCOUNTS_MANAGER = "ACCOUNTS_MANAGER";
CommunicationManagerEvent.ACCOUNTS_MANAGER_EVENT = "ACCOUNTS_MANAGER_EVENT";

CommunicationManagerEvent.MULTIPLAYER_GAMES_MANAGER = "MULTIPLAYER_GAMES_MANAGER";