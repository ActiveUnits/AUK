PlayersCollectionSignalBuilder = module.exports = function()
{
}

PlayersCollectionSignalBuilder.prototype.buildAddPlayers = function(event, dispatcherId)
{
	return {type: "ADD_PLAYERS", event: event, dispatcherId: dispatcherId};
}

PlayersCollectionSignalBuilder.prototype.buildRemovePlayers = function(event, dispatcherId)
{
	return {type: "REMOVE_PLAYERS", event: event, dispatcherId: dispatcherId};
}