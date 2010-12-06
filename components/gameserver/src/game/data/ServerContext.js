var Collection = require('./collections/Collection');

ServerContext = module.exports = function()
{
	this.io = null;
	
	this.connectionsManager = null;
	this.securityManager = null;
	this.accountsManager = null;
	this.communicationManager = null;
	this.socketEventsManager = null;
	this.multiplayerGamesManager = null;
}
