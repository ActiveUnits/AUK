GameServer = function(){
	var ServerContext = require('./src/game/data/ServerContext');
	var GameServer = require('./src/GameServer');
	
	this.init = function(context, options) {
		this.context = context;
		this.options = options;
		
		
		if(typeof options.io != 'undefined')
			this.io = options.io;
		else
			throw new Error('options should contain "io" param with instance of socketio server');
	};
	
	this.start = function() {
		var context = new ServerContext();
		context.io = this.io;
		
		var gameServer = new GameServer(context);
		gameServer.start();
	};
};

module.exports = new GameServer();