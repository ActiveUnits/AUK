var sys = require('sys');

EventDispatcher = module.exports = function() 
{
	this.listeners = new Array();
}

EventDispatcher.prototype.dispatchEvent = function(event) 
{
	if(!event.type)
		throw new Error("Event type is not defined!");
	
	if (this.listeners[event.type])
		for(var i = 0;i < this.listeners[event.type].length;i ++)
			if (this.listeners[event.type][i].scope)
				this.listeners[event.type][i].handler.call(this.listeners[event.type][i].scope, event);
			else
				this.listeners[event.type][i].handler(event);
}

EventDispatcher.prototype.addEventListener = function(type, handler, scope) 
{
	var listeners = {handler: handler,
					 scope: scope};

	if (!this.listeners[type])
		this.listeners[type] = new Array();
	
	this.listeners[type].push(listeners);
}

EventDispatcher.prototype.removeEventListener = function(type, handler) 
{
	if (this.listeners[type])
		for (var i = 0;i < this.listeners[type].length;i ++)
			if(this.listeners[type][i].handler == handler)
			{
				this.listeners[type].splice(i, 1);
				break;
			}
}