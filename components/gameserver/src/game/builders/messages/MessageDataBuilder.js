var MessageData = require('../../data/message/MessageData');

MessageDataBuilder = module.exports = function()
{
}

MessageDataBuilder.prototype.buildSocketEventsManagerMessage = function ()
{
	return new MessageData("SOCKET_EVENTS_MANAGER");
}