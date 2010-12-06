Pubsub = function() {
	this.subscribers = [];
	
	this.init = function(context, options) {
		this.context = context;
		this.options = options;
	};
	
	this.addSubscriber = function(channel, subscriber, eventName) {
		this.subscribers.push({channel: channel, subscriber: subscriber, eventName: eventName});
	};
	
	this.removeSubscriber = function(channel, subscriber, eventName) {
		for(var i in this.subscribers)
			if(this.subscribers[i].channel == channel &&
				this.subscribers[i].subscriber == subscriber &&
				this.subscribers[i].eventName == eventName)
			{
				// XXX ATTENTION bellow is not tested at all.
				this.subscribers[i].splice(i,1);
				i -=1;
			}
	};
	
	this.listenAtSimpleXmpp = function(xmpp) {
		xmpp.on('message', function(event){
			// XXX should be improved. currently handles only simple raw messages of action|event, where action is subscribe or unsubscribe
			var parts = event.body.split('|');
			
			if(parts[0] == "subscribe")
				_self.addSubscriber(xmpp,event.from,parts[1]);
			if(parts[0] == "unsubscribe")
				_self.removeSubscriber(xmpp,event.from,parts[1]);
			
			return false;
		});
	};
	
	this.listenAtSimpleHttp = function(http) {
		http.on('request',function(event){
			var url = require('url');
			var query = url.parse(event.request.url);
			if(query.pathname == '/subscribe') {
				_self.addSubscriber('http',query.params.callback,query.params.eventName);
				event.response.writeHead(200);
				event.response.end('subscribed');
				return false;
			}
			
			if(query.pathname == '/unsubscribe') {
				_self.removeSubscriber('http', query.params.callback,query.params.eventName);
				event.response.writeHead(200);
				event.response.end('unsubscribed');
				return false;
			}
		});
	};
	
	this.publish = function(eventName, eventData) {
		for(var i in this.subscribers) {
			if(this.subscribers[i].eventName == eventName) {
				if(this.subscribers[i].channel == 'http')
					this.sendHttpNotification(this.subscribers[i].subscriber, eventData);
				if(typeof this.subscribers[i].channel == 'object' && typeof this.subscribers[i].channel.send != 'undefined')
					this.subscribers[i].channel.send(this.subscribers[i].subscriber, eventData);
			}
		}
	};
	
	this.sendHttpNotification = function(url,data) {
		// TODO implement
	};
};

module.exports = new Pubsub();