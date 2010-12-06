var EventDispatcher = require('../../utils/events/EventDispatcher');
var CommunicationManagerEvent = require('./events/CommunicationManagerEvent');

var ConnectionsManagerEvent = require('../connections/events/ConnectionsManagerEvent');

var SecurityManager =      require('../security/SecurityManager');
var SecurityManagerEvent = require('../security/events/SecurityManagerEvent');

var SocketEventsManager = require('../events/SocketEventsManager');

var sys = require('sys');

CommunicationManager = module.exports = function()
{
}

CommunicationManager.prototype = new EventDispatcher();

CommunicationManager.prototype.process = function(client, message)
{
	if (typeof(message) != "undefined" && typeof(message['target']) != "undefined" && typeof(message['data']) != "undefined")
		this.dispatchEvent(new CommunicationManagerEvent(message.target, client, message));
}