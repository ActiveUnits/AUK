ConnectionsManagerEvent = module.exports = function(type, client, message)
{
	this.type = type;
	this.client = client;
	this.message = message;
}

ConnectionsManagerEvent.CLIENT_CONNECTED = "clientConnected";
ConnectionsManagerEvent.CLIENT_DISCONNECTED = "clientDisconnected";
ConnectionsManagerEvent.CLIENT_MESSAGE = "clientMessage";