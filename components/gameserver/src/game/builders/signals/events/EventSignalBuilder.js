EventSignalBuilder = module.exports = function()
{
}

EventSignalBuilder.prototype.buildDispatchSocketEventSignal = function(event, dispatcherId)
{
	return {type: "DISPATCH_EVENT", event: event, dispatcherId: dispatcherId};
}