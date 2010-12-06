var EventDispatcher = require('../../utils/events/EventDispatcher');
var ConnectionsManagerEvent = require('./events/ConnectionsManagerEvent');

var Collection = require('../../data/collections/Collection');

ConnectionsManager = module.exports = function(context)
{
	var _self = this;
	
	this.context = context;
	this.connections = new Collection();
	
	this.context.io.on('connection', function(client){ // XXX 'on' changed to 'addListner' due nodejs v0.1.100
		_self.onConnection(client);
		client.on('message', function(message){ _self.onMessage(client, message) }); 
		client.on('disconnect', function(){ _self.onDisconnect(client) });
	});
}

ConnectionsManager.prototype = new EventDispatcher();
ConnectionsManager.prototype.onConnection = function(client)
{
	this.connections.addItem(client);
	this.dispatchEvent(new ConnectionsManagerEvent(ConnectionsManagerEvent.CLIENT_CONNECTED, client));
}

ConnectionsManager.prototype.onDisconnect = function(client)
{
	this.connections.removeByItem(client);
	this.dispatchEvent(new ConnectionsManagerEvent(ConnectionsManagerEvent.CLIENT_DISCONNECTED, client));
}

ConnectionsManager.prototype.onMessage = function(client, message)
{
	this.dispatchEvent(new ConnectionsManagerEvent(ConnectionsManagerEvent.CLIENT_MESSAGE, client, message));
}