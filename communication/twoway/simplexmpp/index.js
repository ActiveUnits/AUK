Simplexmpp = function() {
	var xmpp = require("./libs/xmpp");
	
	this.xmppCallbacks = [];
	this.host = undefined;
	this.jid = undefined;
	this.password = undefined;
	this.port = 5275;
	this.serverPingTimeout = 30*1000;
	
	this.init = function(context, options) {
		if(typeof options == 'undefined' ||
		   typeof options.host == 'undefined')
				throw new Error('options must have host param. empty jid or password would mean anonymous authentication. default port is 5275');
		
		this.context = context;
		this.options = options;
		
		if(typeof options.jid != 'undefined')
			this.jid = options.jid;
		if(typeof options.pass != 'undefined')
			this.password = options.pass;
		if(typeof options.port != 'undefined')
			this.port = options.port;
		
		this.host = options.host;
		this.xmppConnection = new xmpp.Connection(this.host, this.port);
	};
	
	this.connect = function() {
		var _self = this;
		this.xmppConnection.connect(this.jid, this.password,
				function (status, condition) {
					if(status == xmpp.Status.CONNECTED) {
						_self.xmppConnection.addHandler(_self.handleIncomingMessage, null, 'message', null, null, null);

						// sever ping 
						setInterval(function() { _self.xmppConnection.sendIQ(xmpp.iq()); }, _self.serverPingTimeout);
						
						_self.dispatch('connected',{host: _self.host, 
													port: _self.port, 
													jid: _self.jid,
													status: status});
					}
					else {
						_self.dispatch('statuschanged',{host: _self.host, 
													 port: _self.port, 
													 jid: _self.jid,
													 status: status});
					}
				}
		);
	};
	
	this.handleIncomingMessage = function(message) {
		if(message.getChild('thread')) {
		
			var threadId = message.getChild('thread').toString();
			threadId = threadId.replace("<thread>", "").replace("</thread>", "");
			
			if(this.xmppCallbacks[threadId]) {
			
				var body = this.getMessageBody(message);
				var from = message.attr.from;
				
				this.xmppCallbacks[threadId].onResponse(from, body, message);
				
				if(this.xmppCallbacks[threadId].timeoutId != null)
					clearTimeout(this.xmppCallbacks[threadId].timeoutId);
				this.xmppCallbacks[threadId] = undefined;
			}
			else
				this.dispatch("message",{body: this.getMessageBody(message), from: message.attr.from});
		}
		else
			this.dispatch("message",{body: this.getMessageBody(message), from: message.attr.from});
	};
	
	
	this.getMessageBody = function(message) {
		var body = message.getChild("body").toString();
		body = body.replace(/&lt;/g,"<").replace(/&gt;/g, ">").
						replace("<body>", "").replace("</body>", "");
		return body;
	};

	this.sendResponse = function(message, body) {
		
		var threadId = message.getChild("thread").toString();
		threadId = threadId.replace("<thread>", "").replace("</thread>", "");
		
		this.send(message.getAttribute("from"), body, null, null, null,
			threadId);
	};
	
	this.send = function(to, body, onResponse, onTimeout, timeoutTime, threadId) {
		if(!threadId)
			threadId = this.xmppConnection.getUniqueId();
		if(!timeoutTime)
			timeoutTime = 1000;
		
		var message = xmpp.message({
						to: to,
						from: this.jid,
						type: "chat"})
						.c("body").t(body).up()
						.c("thread").t(threadId);
						
		this.xmppConnection.send(message);
				 
		if(onResponse != null || onTimeout != null) {
			var timeoutId = null;
			if(onTimeout != null) {
				timeoutId = setTimeout(function() { onTimeout(message); }, timeoutTime);
			}
			
			this.xmppCallbacks[threadId] = {onResponse: onResponse, timeoutId: timeoutId};
		}
	};
};
module.exports = new Simplexmpp();