var Collection = require('../../data/collections/Collection');

var EventDispatcher = require('../../utils/events/EventDispatcher');
var SecurityManagerEvent = require('./events/SecurityManagerEvent');

var sys = require('sys');

SecurityManager = module.exports = function()
{
}

SecurityManager.prototype = new EventDispatcher();
SecurityManager.prototype.validate = function(client, message)
{
	if (message.sessionId && client.sessionId == message.sessionId)
	{
		var event = new SecurityManagerEvent(SecurityManagerEvent.VALID_CLIENT_MESSAGE);
		event.client = client;
		event.message = message;
		
		this.dispatchEvent(event);
	}
	else
	{
		var event = new SecurityManagerEvent(SecurityManagerEvent.INVALID_CLIENT_MESSAGE);
		event.client = client;
		event.message = message;
		
		this.dispatchEvent(event);
	}
}