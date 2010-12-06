Context = new( function() {
	
	var _self = this;
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
				var result = this.listeners[i].eventHandler(event,eventSource);
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
	
	this.communicationPrototypes = {
		instances : [],
		create : function(name, options) {
			var instance = require(this[name]);
			_self.augmentAsEventDispatcher(instance);
			
			if(typeof instance.init != 'undefined')
				instance.init(_self, options);
			
			if(typeof options != 'undefined' && typeof options.id != 'undefined')
				this.instances[options.id] = instance;
			return instance;
		},
		get : function(id) {
			return instances[id];
		}
	};
	
	this.componentPrototypes = {
		instances : [],
		create : function(name,options) {
			var instance = require(this[name]);
			_self.augmentAsEventDispatcher(instance);
			
			if(typeof instance.init != 'undefined')
				instance.init(_self, options);

			if(typeof options != 'undefined' && typeof options.id != 'undefined')
				this.instances[options.id] = instance;
			return instance;
		},
		get : function(id) {
			return instances[id];
		}
	};
	
	this.registerChannels = function(protocols) {
		for(var i in protocols)
			this.communicationPrototypes[i] = protocols[i];
	};
	
	this.createChannel = function(name, options) {
		return this.communicationPrototypes.create(name, options);
	};
	
	this.getChannel = function(id) {
		return this.communicationPrototypes.get(id);
	};
	
	this.registerComponents = function(components) {
		for(var i in components)
			this.componentPrototypes[i] = components[i];
	};
	
	this.createComponent = function(name, options) {
		return this.componentPrototypes.create(name, options);
	};
	
	this.getComponent = function(id) {
		return this.componentPrototypes.get(id);
	};
} );

for(var i in Context)
	exports[i] = Context[i];