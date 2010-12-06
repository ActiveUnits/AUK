var EventDispatcher = require('../../utils/events/EventDispatcher');

SocketDataManager = module.exports = function() 
{
}

SocketDataManager.prototype = new EventDispatcher();
SocketDataManager.prototype.process = function(client, message)
{
	var data = message['data'];
	
	for (var s in data)
		if (typeof(data[s].type) == "string")
		{
			data[s].dispatcherId = data[s].dispatcherId ? data[s].dispatcherId : message.dispatcherId;
			this.execute(client, data[s]);
		}
}

SocketDataManager.prototype.execute = function(client, data)
{
}