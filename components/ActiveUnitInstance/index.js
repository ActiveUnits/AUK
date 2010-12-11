var AUI = function() {
	var sys = require('sys');
	var DNode = require('./lib/dnode');
	
	this.instancePort = 9000;
	
	this.masterInstance = null;
	this.masterPort = 9000;
	
	this.childs = [];
	this.master = null;
	
	this.init = function(context, options) {
		this.context = context;
		this.options = options;
		
		
		if(this.options == undefined)
			this.options = {};
		
		if(typeof this.options.port != "undefined")
			this.masterPort = this.instancePort = this.options.port;

		if(typeof this.options.instancePort != "undefined")
			this.instancePort = this.options.instancePort;
		
		if(typeof this.options.masterPort != "undefined")
			this.masterPort = this.options.masterPort;
		
		if(typeof this.options.masterInstance != "undefined")
			this.masterInstance = this.options.masterInstance;
		
	};
	
	this.removeChild = function(child) {
		for(var i in this.childs)
			if(this.childs[i] === child) {
				this.childs.splice(i,1);
				return
			}
	};
	
	this.invokeAtChilds = function(methodName,arguments) {
		for(var i in this.childs)
			if(typeof this.childs[i][methodName] == "undefined")
				sys.log(methodName+" not found at child "+i);
			else
				this.childs[i][methodName].apply(this.childs[i], arguments);
	};
	
	this.start = function(unitAPI) {
		var _self = this;
		
		this.localDNode = DNode(function(client, conn) {
			_self.childs.push(client);
			
			sys.log("child instance connected");
			conn.on("end",function(){
				_self.removeChild(client);
				sys.log("child instance disconnected");
			});
			
			for(var i in unitAPI)
				this[i] = unitAPI[i];
			
			_self.emit("child", {client: client});
			
		}).listen(this.instancePort);
		
		this.localDNode.on('ready',function(){
			sys.log("AUI started at localhost:"+_self.instancePort);
		});
		this.localDNode.on('localError',function(e){
			sys.log('found local error '+e);
		});
		this.localDNode.on('remoteError',function(e){
			sys.log('found remote error '+e);
		});
		
		if(this.masterInstance != null){
			
			this.masterDNode = DNode(unitAPI).connect(this.masterInstance, this.masterPort, function(remote, conn) {
				_self.master = remote;
				
				sys.log("AUI connected to master "+_self.masterInstance+":"+_self.masterPort);
				conn.on('end', function(e){
					sys.log("AUI disconnected from master "+_self.masterInstance+":"+_self.masterPort);
				});
			});
			this.masterDNode.on('localError',function(e){
				sys.log('found local error '+e);
			});
			this.masterDNode.on('remoteError',function(e){
				sys.log('found remote error '+e);
			});
		}
		
		return this;
	};
	
	this.stop = function() {
		// ?
		return this;
	};
};

module.exports = new AUI();