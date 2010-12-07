# AUK #
email list: http://activeunits.org/forum/ 

Implementation of active unit skeleton containing the following features:

  * listen/write to several communication channels (http, xmpp, socketio)
  * component(middleware) based development
  * cross instances event dispatching
  * not a framework

## event system ##
Every instance can dispatch events when it is augmented with the appropiate methods:

  * instance.on(eventName, eventHandler) 
  * instance.dispatch(eventName, eventData)
  * instance.remove(eventName, eventHandler)

example:
    var myHandler = function(eventData,eventSource) {
      // do something with eventData
    }
  
    instance.on('myEventName', myHandler);

important to be known: 
    var myHandler0 = function(eventData) {
      // this will get invoked, but because it does not returns value next handler on the stack is invoked...
    }
  
    var myHandler = function(eventData,eventSource) {
      // eventSource == instance
      return 'something'; // this will prevent further event dispatching
    }
  
    var myHandler2 = function(eventData) {
      // this will never get invoked due the above return 'something'
    }
  
    instance.on('myEventName', myHandler);
    instance.on('myEventName', myHandler2);
  
    var result = instance.dispatch('myEventName', myData);
    // result == 'something'

## channels ##
Channel is a communication medium through which data is send or received.

### simplehttp ###
options:

  * port - default 8080, port on which http server will listen
  * requestHandler(req,res) - default renders "welcome to simplehttp server", method for handling requests

events:

  * name:"request", eventData: {request, response} - event fired on incoming request.

### simplexmpp ###
options:

  * host - host to which xmpp client should connect
  * port - default 5275, port used for connection
  * jid - jid used for authentication
  * pass - password used for authentication
  * serverPingTimeout - default 30sec, ping interval to keep the xmpp connectino alive (useful for xmpp components)

events:

  * name:"connected", eventData: {host, port, jid, status} - dispatched after xmpp client is connected
  * name:"statuschanged", eventData: {host, port, jid, status} - dispatched after xmpp connection status is changed. if status == 6 then connection is closed.
  * name:"message", eventData: {body, from, sendResponse} - dispatched on incoming message, sendResponse(body) sends body as response to the incoming message.

### socket.io ###
options:

  * port - default 8080
  * http - used to give reference for http server
  * createHttpServer - method which will be invoked to return http server instance

events:

  * name: connect, eventData: {client} - dispatched on client connect
  * name: message, eventData: {client, message} - dispatched on incoming message
  * name: disconnect, eventData: {client} - dispatched on client disconnect

## components ##
### gameserver ###
Component used to provide realtime game server (multiplayer games, player accounts & etc.)
### pubsub ###
Component used to provide simple publisher-subscribe functionality. 
methods:

  * listenAtSimpleHttp(httpServer) - hooks pubsub component to simpleHttp channel listening for http requests:
    * /subscribe?callback=http://url&eventName=name
    * /unsubscribe?callback=http://url&eventName=name
  * listenAtSimpleXmpp(xmppClient) - hooks pubsub component to simpleXmpp channel listening for xmpp messages:
    * subscribe|eventName
    * unsubscribe|eventName
  * publish(eventName, eventData) - sends JSON encoded eventData to all subscribers to the given event.

Note that for http subscribers pubsub sends POST to the given callback with body containing the eventData as JSON encoded string
Note that for xmpp subscribers pubsub sends xmpp message stanza with body containing the eventData as JSON encoded string
