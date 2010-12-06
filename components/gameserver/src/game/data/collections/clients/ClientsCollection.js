var Collection = require('../Collection');

ClientsCollection = module.exports = function()
{
	this.clients = [];
	this.clientsBySessionId = [];
	
	this.collection = new Collection();
}

ClientsCollection.prototype.addClient = function(client)
{
	this.collection.addItem(client, client.sessionId);
}

ClientsCollection.prototype.removeClientAt = function(index)
{
	this.collection.removeItemAt(index);
}

ClientsCollection.prototype.removeClient = function(client)
{
	this.collection.removeByItem(client);
}

ClientsCollection.prototype.getClientBySessionId = function(sessionId)
{
	return this.collection.getItemByName(sessionId);
}

ClientsCollection.prototype.getClients = function()
{
	return this.collection.items;
}

ClientsCollection.prototype.length = function()
{
	return this.collection.items.length;
}