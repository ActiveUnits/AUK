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

var instanceAPI = {
	start : function(cb){
		http.connect();
		if(instance.master != null)
			instance.master.log('child started http server at 8001');
		if(cb != undefined)
			cb("blah DNode is really cool");
	},
	stop : function() {
		http.disconnect();
		if(instance.master != null)
			instance.master.log('child stopped http server at 8001');
	},
	log : function(value) {
		sys.log(value);
	}
};

var instance = context.createComponent("./components/ActiveUnitInstance", options);
instance.start(instanceAPI);

if(typeof options.masterInstance === "undefined") {
	//initialize channels
	http = context.createChannel('./communication/oneway/simplehttp').connect();
	
	http.on("request",function(event){
		if(event.request.url == "/startChilds") {
			instance.invokeAtChilds('start',[
                    function(value){
						sys.log("callback active:"+value);
					}
			]);
			
			event.response.writeHead(200, {'Content-Type': 'text/html'});
			event.response.end("started");
			return true;
		}
		if(event.request.url == "/stopChilds") {
			instance.invokeAtChilds('stop');
			event.response.writeHead(200, {'Content-Type': 'text/html'});
			event.response.end("stopped");
			return true;
		}
	});
} else
	http = context.createComponent('./communication/oneway/simplehttp',{port: 8001});
