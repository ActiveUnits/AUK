var SocketDataManager = require('../base/SocketDataManager');

var ClientData = require('../../data/client/ClientData');

var AccountsManagerEvent = require('./events/AccountsManagerEvent');

var sys = require('sys');

AccountsManager = module.exports = function(context)
{
	this.context = context;
	
	this.registredClientsByUsername = new Array();
	
	this.onlineClientsBySessionId = new Array();
	this.onlineClientsByUsername = new Array();
}

AccountsManager.prototype = new SocketDataManager();
AccountsManager.prototype.$process = SocketDataManager.prototype.process;

AccountsManager.prototype.process = function(client, message)
{
	if (typeof(message) != "undefined" && typeof(message['target']) != "undefined" && typeof(message['data']) != "undefined")
	{
		switch (message['target'])
		{
			case AccountsManager.ACCOUNTS_MANAGER:
				this.$process(client, message);
			break;
			case AccountsManager.ACCOUNTS_MANAGER_EVENT:
				this.context.socketEventsManager.process(client, message);
			break;
		}
	}
}

AccountsManager.prototype.execute = function(client, data)
{
	sys.log("#--- execute! ---#: " + data.type);
	
	switch (data.type)
	{
		case AccountsManager.LOGIN:
			this.executeLogin(client, data);
		break;
		case AccountsManager.LOGOUT:
			this.executeLogout(client, data);
		break;
		case AccountsManager.REGISTER:
			this.executeRegister(client, data);
		break;
		case AccountsManager.LIST:
			this.executeList(client, data);
		break;
	}
}

AccountsManager.prototype.executeLogin = function(client, data)
{
	var clientData = this.registredClientsByUsername[data.username];
	var onlineClientData = this.onlineClientsByUsername[data.username];
	
	//sys.log("#--- executeLogin ---#: " + client.sessionId + " - " + clientData + " - " + onlineClientData);

	if (clientData && !onlineClientData && clientData.password == data.password)
	{
		clientData.client = client;
		
		this.onlineClientsBySessionId[client.sessionId] = clientData;
		this.onlineClientsByUsername[data.username] = clientData;
		
		var socketEvent = new AccountsManagerEvent(AccountsManagerEvent.LOGIN_COMPLETE);
		socketEvent.sessionId = client.sessionId;
		socketEvent.data = {username: data.username};
		
		this.context.socketEventsManager.dispatchEvent(socketEvent);
		this.context.socketEventsManager.dispatchEvent(socketEvent, client, data.dispatcherId)
	}
	else
	{
		var socketEvent = new AccountsManagerEvent(AccountsManagerEvent.LOGIN_ERROR);
		this.context.socketEventsManager.dispatchEvent(socketEvent, client, data.dispatcherId);
	}
}

AccountsManager.prototype.executeLogout = function(client, data)
{
	var clientData = this.onlineClientsBySessionId[client.sessionId];
	
	//sys.log("#--- executeLogout ---#: " + client.sessionId + " - " + clientData);
	
	if (clientData)
	{
		clientData.client = null;
		
		var username = this.onlineClientsBySessionId[client.sessionId].username;
		var sessionId = client.sessionId;
		
		delete(this.onlineClientsBySessionId[sessionId]);
		delete(this.onlineClientsByUsername[username]);
		
		var socketEvent = new AccountsManagerEvent(AccountsManagerEvent.LOGOUT_COMPLETE);
		socketEvent.sessionId = client.sessionId;
		
		this.context.socketEventsManager.dispatchEvent(socketEvent);
	}
}

AccountsManager.prototype.executeRegister = function(client, data)
{
	var clientData = this.registredClientsByUsername[data.username];

	//sys.log("#--- executeRegister ---#: " + client.sessionId + " - " + clientData);

	if (!clientData)
	{
		clientData = new ClientData();
		clientData.username = data.username;
		clientData.password = data.password;
		
		this.registredClientsByUsername[data.username] = clientData;
		
		var socketEvent = new AccountsManagerEvent(AccountsManagerEvent.REGISTRATION_COMPLETE);
		
		this.context.socketEventsManager.dispatchEvent(socketEvent, client, data.dispatcherId)
	}
	else
	{
		var socketEvent = new AccountsManagerEvent(AccountsManagerEvent.REGISTRATION_EXIST);
		
		this.context.socketEventsManager.dispatchEvent(socketEvent, client, data.dispatcherId);
	}
}

AccountsManager.prototype.executeList = function(client, data)
{
	var list = new Array();
	var clientData;
	
	for (var s in this.onlineClientsBySessionId)
	{
		clientData = this.onlineClientsBySessionId[s];
		
		list.push({username:  clientData.username, 
				   sessionId: clientData.client.sessionId});
	}
	
	var socketEvent = new AccountsManagerEvent(AccountsManagerEvent.LIST_RESULT);
	socketEvent.data = list;
	
	this.context.socketEventsManager.dispatchEvent(socketEvent, client, data.dispatcherId);
}

AccountsManager.prototype.clientDisconected = function(client)
{
	this.executeLogout(client);
	
	sys.log("#--- clientDisconected[executeLogout] ---#: " + client.sessionId);
}

AccountsManager.ACCOUNTS_MANAGER = "ACCOUNTS_MANAGER";
AccountsManager.ACCOUNTS_MANAGER_EVENT = "ACCOUNTS_MANAGER_EVENT";

AccountsManager.LOGIN = "LOGIN";
AccountsManager.LOGOUT = "LOGOUT";
AccountsManager.REGISTER = "REGISTER";
AccountsManager.LIST = "LIST";