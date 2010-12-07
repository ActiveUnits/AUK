Context = function() {
	
	var _self = this;
	
	/*******************************************************************************
	 * EventDispatching implementation
	 *******************************************************************************/
	this.listeners = [];

	this.on = function(eventSource, eventName, eventHandler) {
		this.listeners.push({'eventName': eventName, 'eventHandler': eventHandler, 'eventSource': eventSource});
	};
	
	this.remove = function(eventSource, eventName, eventHandler) {
		for(var i in this.listeners)
			if((this.listeners[i].eventSource == eventSource || this.listeners[i].eventSource == null)  
				 && this.listeners[i].eventName == eventName
				 && this.listeners[i].eventHandler == eventHandler) {
				
				// XXX ATTENTION bellow is not tested at all.
				this.listeners[i].splice(i,1);
				i -= 1;
			}
	};
	
	this.dispatch = function(eventSource, eventName, event) {
		for(var i in this.listeners)
			if((this.listeners[i].eventSource == eventSource || this.listeners[i].eventSource == null)  
				 && this.listeners[i].eventName == eventName)
			{
				var result = this.listeners[i].eventHandler(event, eventSource);
				if(typeof result != 'undefined')
					return result;
			}
	};
	
	this.augmentAsEventDispatcher = function(instance) {
		if(typeof instance.dispatch != 'undefined')
			throw new Error(instance+" has method dispatch already, can not augment it");
		instance.dispatch = function(eventName, event) {
			_self.dispatch(this, eventName, event);
		};
		
		if(typeof instance.on != 'undefined')
			throw new Error(instance+" has method on already, can not augment it");
		instance.on = function(eventName, eventHandler) {
			_self.on(this, eventName, eventHandler);
		};
		
		if(typeof instance.remove != 'undefined')
			throw new Error(instance+" has method remove already, can not augment it");
		instance.remove = function(eventName, eventHandler) {
			_self.remove(this, eventName, eventHandler);
		};
	};
	
	this.forwardEvents = function(from,by) {
		from.dispatch = function(eventName, event) {
			_self.dispatch(by, eventName, event);
		};
	};
	
	/*******************************************************************************
	 * AUK Context implementation
	 *******************************************************************************/
	this.channels = {
		instances : [],
		get : function(id) {
			return instances[id];
		}
	};
	
	this.components = {
		instances : [],
		get : function(id) {
			return instances[id];
		}
	};
	
	this.createInstance = function(name, options) {
		var instance = require(name);
		this.augmentAsEventDispatcher(instance);
		
		if(typeof instance.init != 'undefined')
			instance.init(_self, options);
		return instance;
	};
	
	this.createChannel = function(name, options) {
		var instance = this.createInstance(name, options);
		
		if(typeof options != 'undefined' && typeof options.id != 'undefined')
			this.channels.instances[options.id] = instance;
		
		return instance;
	};
	
	this.getChannel = function(id) {
		return this.channels.get(id);
	};
	
	this.createComponent = function(name, options) {
		var instance = this.createInstance(name, options);

		if(typeof options != 'undefined' && typeof options.id != 'undefined')
			this.components.instances[options.id] = instance;
		
		return instance;
	};
	
	this.getComponent = function(id) {
		return this.components.get(id);
	};
};

module.exports = new Context();