var SocketDataManager = require('../base/SocketDataManager');

var MessageDataBuilder = require('../../builders/messages/MessageDataBuilder');
var EventSignalBuilder = require('../../builders/signals/events/EventSignalBuilder');
var sys = require('sys');

SocketEventsManager = module.exports = function() 
{
	this.listenersByType = new Array();

	this.messageBuilder = new MessageDataBuilder();
	this.signalBuilder = new EventSignalBuilder();
}

SocketEventsManager.prototype = new SocketDataManager();
SocketEventsManager.prototype.execute = function(client, data)
{
	switch (data.type)
	{
		case "ADD_EVENT_LISTENER":
			this.addEventListener(data['event'].type, client, data.dispatcherId);
		break;
		case "REMOVE_EVENT_LISTENER":
			this.removeEventListener(data['event'].type, client, data.dispatcherId);
		break;
		case "REMOVE_ALL_EVENT_LISTENERS":
			this.removeAllEventListener(client, data.dispatcherId);
		break;
	}
}

SocketEventsManager.prototype.dispatchEvent = function(event, client, dispatcherId) 
{
	if(!event.type)
		throw new Error("Event type is not defined! " + event.type);
	
	if (this.listenersByType[event.type])
	{
		if (client)
		{
			var clientId = "C" + client.sessionId;
			
			if (this.listenersByType[event.type][clientId])
			{
				var signal = this.signalBuilder.buildDispatchSocketEventSignal(event, dispatcherId);
				var message = this.messageBuilder.buildSocketEventsManagerMessage();
				message.push(signal);
				
				client.send(message);
			}
			
			sys.log("$SocketEventsManager$ 1. dispatchEvent["+event.type+"]: " + clientId + " : " + dispatcherId); 
		}
		else
		{
			var signal = this.signalBuilder.buildDispatchSocketEventSignal(event);
			var message = this.messageBuilder.buildSocketEventsManagerMessage();
			message.push(signal);
			
			var clients = this.listenersByType[event.type];
			
			for (var s in clients)
				clients[s].client.send(message);
				
			sys.log("$SocketEventsManager$ 2. dispatchEvent["+event.type+"] *****<>****" ); 
		}
	}
}

SocketEventsManager.prototype.addEventListener = function(type, client, dispatcherId) 
{
	var clientId = "C" + client.sessionId;

	if (type)
	{
		if (!this.listenersByType[type])
			this.listenersByType[type] = new Array();
		
		if (!this.listenersByType[type][clientId])
			this.listenersByType[type][clientId] = {client: client, current: 0, total: 0, dispatchersById: new Array()};
		
		if (dispatcherId)
		{
			if (!this.listenersByType[type][clientId].dispatchersById[dispatcherId])
				this.listenersByType[type][clientId].dispatchersById[dispatcherId] = {total: 1};
			else
				this.listenersByType[type][clientId].dispatchersById[dispatcherId].total ++;
		}
		else
			this.listenersByType[type][clientId].current ++;
		
		this.listenersByType[type][clientId].total ++;
		
		sys.log("$SocketEventsManager$ addEventListener["+type+"]:" + clientId  + " : " + this.listenersByType[type][clientId].current  + " : " + this.listenersByType[type][clientId].total);
	}
}

SocketEventsManager.prototype.removeEventListener = function(type, client, dispatcherId) 
{
	var clientId = "C" + client.sessionId;
	
	if (type && this.listenersByType[type] && this.listenersByType[type][clientId])
	{
		if (dispatcherId && this.listenersByType[type][clientId].dispatchersById[dispatcherId])
		{
			if (this.listenersByType[type][clientId].dispatchersById[dispatcherId].total > 1)
				this.listenersByType[type][clientId].dispatchersById[dispatcherId].total --;
			else
				delete(this.listenersByType[type][clientId].dispatchersById[dispatcherId]);
				
			this.listenersByType[type][clientId].total --;
		}
		else
		if (!dispatcherId && this.listenersByType[type][clientId].current > 0)
			this.listenersByType[type][clientId].current --;
		
		if (this.listenersByType[type][clientId].current == 0 && this.listenersByType[type][clientId].total == 0)
			delete(this.listenersByType[type][clientId]);
		
		if (this.listenersByType[type][clientId])
			sys.log("$SocketEventsManager$ 1. removeEventListener["+type+"]:" + clientId  + " : " + this.listenersByType[type][clientId].current + ":" + this.listenersByType[type][clientId].total);
		else
			sys.log("$SocketEventsManager$ 2. removeEventListener["+type+"]:" + clientId);
	}
}

SocketEventsManager.prototype.removeAllEventListeners = function(client, dispatcherId) 
{
	var clientId = "C" + client.sessionId;
	
	for (var s in this.listenersByType)
		if (this.listenersByType[s][clientId])
		{
			if (dispatcherId && this.listenersByType[s][clientId][dispatcherId])
				delete(this.listenersByType[s][clientId][dispatcherId]);
			else
			if (!dispatcherId)
				delete(this.listenersByType[s][clientId]);
		}
	
	sys.log("$-2-SocketEventsManager$ removeAllEventListeners:" + clientId);
}

SocketEventsManager.prototype.removeAll = function() 
{
	this.listenersByType = new Array();
}