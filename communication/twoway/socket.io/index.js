Socketio = function() {
	var _self = this;
	
	this.port = 8080;
	
	this.createHttpServer = function(options) {
		
		if(typeof options.port != 'undefined')
			this.port = options.port;
		
		var http = require('http');
		var sever = http.createServer(function(req, res){
			res.writeHead(200, {'Content-Type': 'text/html'});
		    res.write('<h1>welcome to socket.io server</h1>');
		    res.end();
		});
		
		sever.listen(this.port);
		return sever;
	};
	
	this.init = function(context, options) {
		this.context = context;
		this.options = options;
		
		if(typeof options.http == 'undefined') {
			if(typeof options.createHttpServer == 'undefined')
				this.http = this.createHttpServer(options);
			else
				this.http = options.createHttpServer();
		} else {
			this.http = options.http;
			this.port = undefined;
		}
		
		this.io = require('./lib/socket.io');
		if(typeof options.connectHandler == 'undefined') {
			if(typeof options.messageHandler != 'undefined')
				this.clientMessageHandler = options.messageHandler;
			if(typeof options.disconnectHandler != 'undefined')
				this.clientDisconnectHandler = options.disconnectHandler;
		} else
			this.clientConnectHandler = options.connectHandler;
	};
	
	this.connect = function() {
		this.server = this.io.listen(this.http);
		this.server.on('connection', this.clientConnectHandler); 
	};
	
	this.clientConnectHandler = function(client) {
		client.on('message', _self.getClientMessageHandler(client)); 
		client.on('disconnect', _self.getClientDisconnectHandler(client));
	};
	
	this.clientMessageHandler = function(client,message) {
		_self.dispatch('message',{client: client, message:message});
	};
	
	this.clientDisconnectHandler = function(client) {
		_self.dispatch('disconnect',{client: client});
	};
	
	this.getClientMessageHandler = function(client) {
		return function(message) {
			_self.clientConnectHandler(client,message);
		};
	};
	
	this.getClientDisconnectHandler = function(client) {
		return function(){
			_self.clientDisconnectHandler(client);
		};
	};
};

module.exports = new Socketio();