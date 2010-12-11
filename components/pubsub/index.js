Pubsub = function() {
	
	var rest = require("./lib/restler/restler");
	var sys = require('sys');
	
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
		var _self = this;
		xmpp.on('message', function(event){
			// XXX should be improved. currently handles only simple raw messages of action|event, where action is subscribe or unsubscribe
			var parts = event.body.split('|');
			
			if(parts[0] == "subscribe") {
				_self.addSubscriber(xmpp,event.from,parts[1]);
				event.sendResponse("subscribed");
			}
			if(parts[0] == "unsubscribe") {
				_self.removeSubscriber(xmpp,event.from,parts[1]);
				event.sendResponse("unsubscribed");
			}
			
			return false;
		});
		
		sys.log("pubsub listening at simplexmpp "+xmpp.jid+"@"+xmpp.host);
		
		return this;
	};
	
	this.listenAtSimpleHttp = function(http) {
		
		var _self = this;
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
		
		sys.log("pubsub listening at simplehttp "+http.port);
		return this;
	};
	
	this.stop = function() {
		// ?
	};
	
	this.publish = function(eventName, eventData) {
		var data = JSON.stringify(eventData);
		for(var i in this.subscribers) {
			if(this.subscribers[i].eventName == eventName) {
				sys.log('publishing to subscriber '+this.subscribers[i].subscriber+" data:"+data);
				
				if(this.subscribers[i].channel == 'http')
					this.sendHttpNotification(this.subscribers[i].subscriber, data);
				if(typeof this.subscribers[i].channel == 'object' && typeof this.subscribers[i].channel.send != 'undefined')
					this.subscribers[i].channel.send(this.subscribers[i].subscriber, data);
			}
		}
	};
	
	this.sendHttpNotification = function(url,data) {
		rest.post(url, {
			  multipart: true,
			  data: data
			}).addListener('complete', function(data) {
			  // what to do with the response? 
			});
	};
};

module.exports = new Pubsub();