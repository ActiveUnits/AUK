var sys = require('sys');
var context = require('./auk-context');

var options = {};
if(process.argv[2] != undefined)
	options.instancePort = parseInt(process.argv[2]);
if(process.argv[3] != undefined)
	options.masterInstance = process.argv[3];
if(process.argv[4] != undefined)
	options.masterPort = parseInt(process.argv[4]);

var http = null;
var instance = context.createComponent("./components/ActiveUnitInstance", options);

var instanceAPI = {
	start : function(cb){
		http.connect();
		if(instance.master != null)
			instance.master.log('child started http server at 8081');
		if(cb != undefined)
			cb("blah DNode is really cool");
	},
	stop : function() {
		http.disconnect();
		if(instance.master != null)
			instance.master.log('child stopped http server at 8081');
	},
	log : function(value) {
		sys.log(value);
	}
};

instance.start(instanceAPI);

if(typeof options.masterInstance === "undefined")  {
	http = context.createChannel('./communication/oneway/simplehttp');
	http.connect();
}
else
	http = context.createChannel('./communication/oneway/simplehttp',{port: 8081});

http.on("request",function(event){
	if(event.request.url == "/start") {
		instance.broadcast('start',[
                function(value){
					sys.log("callback active:"+value);
				}
		]);
		
		event.response.writeHead(200, {'Content-Type': 'text/html'});
		event.response.end("started");
		return true;
	}
	if(event.request.url == "/stop") {
		instance.broadcast('stop');
		event.response.writeHead(200, {'Content-Type': 'text/html'});
		event.response.end("stopped");
		return true;
	}
});
