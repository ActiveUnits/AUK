var ConnectionsManager      = require('./game/managers/connections/ConnectionsManager');
var ConnectionsManagerEvent = require('./game/managers/connections/events/ConnectionsManagerEvent');

var SecurityManager      = require('./game/managers/security/SecurityManager');
var SecurityManagerEvent = require('./game/managers/security/events/SecurityManagerEvent');

var AccountsManager = require('./game/managers/accounts/AccountsManager');

var CommunicationManager = 		require('./game/managers/communication/CommunicationManager');
var CommunicationManagerEvent = require('./game/managers/communication/events/CommunicationManagerEvent');

var SocketEventsManager = require('./game/managers/events/SocketEventsManager');

var MultiplayerGamesManager = require('./game/managers/multiplayer/MultiplayerGamesManager');

var sys = require('sys');

GameServer = module.exports = function(context)
{
	this.context = context;
}

GameServer.prototype.start = function()
{
	// ********* ConnectionsManager *********
	
	this.connectionsManager = new ConnectionsManager(this.context);
	this.connectionsManager.addEventListener(ConnectionsManagerEvent.CLIENT_MESSAGE, this.onClientMessage, this);
	this.connectionsManager.addEventListener(ConnectionsManagerEvent.CLIENT_DISCONNECTED, this.onClientDisconected, this);
	
	this.context.connectionsManager = this.connectionsManager;
	
	// ********* SecurityManager *********
	
	this.securityManager = new SecurityManager();
	this.securityManager.addEventListener(SecurityManagerEvent.VALID_CLIENT_MESSAGE, this.onValidClientMessage, this);
	this.securityManager.addEventListener(SecurityManagerEvent.INVALID_CLIENT_MESSAGE, this.onInvalidClientMessage, this);
	
	this.context.securityManager = this.securityManager;
	
	// ********* AccountsManager *********
	
	this.accountsManager = new AccountsManager(this.context);
	
	this.context.accountsManager = this.accountsManager;
	
	// ********* CommunicationManager *********
	
	this.communicationManager = new CommunicationManager();
	this.communicationManager.addEventListener(CommunicationManagerEvent.SOCKET_EVENTS_MANAGER, this.onSocketEventsManager, this);
	this.communicationManager.addEventListener(CommunicationManagerEvent.ACCOUNTS_MANAGER, this.onAccountsManager, this);
	this.communicationManager.addEventListener(CommunicationManagerEvent.ACCOUNTS_MANAGER_EVENT, this.onAccountsManagerEvent, this);
	this.communicationManager.addEventListener(CommunicationManagerEvent.MULTIPLAYER_GAMES_MANAGER, this.onMultiplayerGamesManager, this);
	
	this.context.communicationManager = this.communicationManager;
	
	// ********* SocketEventsManager *********
	
	this.socketEventsManager = new SocketEventsManager();
	
	this.context.socketEventsManager = this.socketEventsManager;
	
	// ********* MultiplayerGamesManager *********
	
	this.multiplayerGamesManager = new MultiplayerGamesManager(this.context);
	
	this.context.multiplayerGamesManager = this.multiplayerGamesManager;
}

GameServer.prototype.onClientMessage = function(e)
{
	//sys.log("## onMessage ##:" + e.message.target);
	
	this.securityManager.validate(e.client, e.message);
}

GameServer.prototype.onClientDisconected = function(e)
{
	this.accountsManager.clientDisconected(e.client);
	this.socketEventsManager.removeAllEventListeners(e.client);
}

GameServer.prototype.onValidClientMessage = function(e)
{
	this.communicationManager.process(e.client, e.message);
}

GameServer.prototype.onInvalidClientMessage = function(e)
{
	this.accountsManager.process(e.client, e.message);
}

// **********************************************************************************
// *************************** CommunicationManagerEvents ***************************
// **********************************************************************************

GameServer.prototype.onSocketEventsManager = function(e)
{
	this.socketEventsManager.process(e.client, e.message);
}

GameServer.prototype.onAccountsManager = function(e)
{
	this.accountsManager.process(e.client, e.message);
}

GameServer.prototype.onAccountsManagerEvent = function(e)
{
	this.accountsManager.process(e.client, e.message);
}

GameServer.prototype.onMultiplayerGamesManager = function(e)
{
	this.multiplayerGamesManager.process(e.client, e.message);
}