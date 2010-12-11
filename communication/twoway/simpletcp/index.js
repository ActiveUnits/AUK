var SimpleTcp = function() {
	var net = require('net');
	var sys = require("sys");
	
	this.incomingMessageHandler = function (socket) {
		  socket.write("Echo server\r\n");
		  socket.on("data", function (data) {
		    socket.write(data);
		  });
	};
	
	this.init = function(context, options) {
		this.context = context;
		this.options = options;
		
		this.port = 8124;
		this.ip = "127.0.0.1";
		this.type = "client";
		
		if(typeof this.options == "undefined")
			this.options = {};
		
		if(typeof this.options.type != "undefined")
			this.type = this.options.type;
		
		if(typeof this.options.port != "undefined")
			this.port = this.options.port;
		
		if(typeof this.options.ip != "undefined")
			this.ip = this.options.ip;
		
		var _self = this;
		if(this.type == "server") {
			this.server = net.createServer(function (clientStream) {
				clientStream.setEncoding('utf8');
				
				clientStream.on('connect', function (clientStream) {
					sys.log("simpletcp: client connected");
				    _self.emit('connect', clientStream);
				    clientStream.on('data', function (data) {
				    	_self.emit('data', {stream:clientStream, data:data});
					});
				    clientStream.on('end', function () {
				    	sys.log("simpletcp: client disconnected");
					    _self.emit('end', clientStream);
					});
				});
			});
		} else if(this.type == "client") {
			this.stream = new net.Stream();
			this.context.forwardEvents(this.stream, this, ['connect', 'secure', 'data', 'end', 'timeout', 'drain', 'error', 'close']);
			
		} else {
			throw new Error("provided type "+this.type+" is not supported");
		}
		
		return this;
	};
	
	this.connect = function() {
		if(this.type == "server") {
			this.server.listen(this.port, this.ip, function(){
				sys.log("simpletcp listening at "+this.ip+":"+this.port);
			});
		} else {
			sys.log("simpletcp connecting at "+this.ip+":"+this.port);
			this.stream.createConnection(this.port, this.ip);
		}
		
		return this;
	};
};

exports = new SimpleTcp();