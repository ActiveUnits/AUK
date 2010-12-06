Simplehttp = function() {
	
	var http = require('http');
	
	this.port = 8080;
	
	var _self = this;
	this.requestHandler = function(req,res) {
		if(_self.dispatch('request',{request: req, response: res}) === undefined) {
			res.writeHead(200, {'Content-Type': 'text/html'});
		    res.write('<h1>welcome to simplehttp server</h1>');
		    res.end();
		}
	};
	
	this.init = function(context, options) {
		this.context = context;
		this.options = options;
		
		if(typeof this.options.port != 'undefined')
			this.port = this.options.port;
		
		if(typeof this.options.requestHandler != 'undefined')
			this.requestHandler = this.options.requestHandler;
		
		this.server = http.createServer(this.requestHandler);
	};
	
	this.connect = function() {
		this.server.listen(this.port);
	};
};
module.exports = new Simplehttp();