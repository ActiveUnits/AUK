SecurityManagerEvent = module.exports = function(type)
{
	this.type = type;
	this.sessionId = null;
	this.client = null;
	this.message = null;
	this.clientData = null;
	this.players = new Array();
}

SecurityManagerEvent.VALID_CLIENT_MESSAGE = "VALID_CLIENT_MESSAGE";
SecurityManagerEvent.INVALID_CLIENT_MESSAGE = "INVALID_CLIENT_MESSAGE";


SecurityManagerEvent.CLIENT_REGISTRATION_COMPLETE = "CLIENT_REGISTRATION_COMPLETE";
SecurityManagerEvent.CLIENT_REGISTRATION_EXIST = "CLIENT_REGISTRATION_EXIST";

SecurityManagerEvent.CLIENT_LOGIN_COMPLETE = "CLIENT_LOGIN_COMPLETE";
SecurityManagerEvent.CLIENT_LOGIN_ERROR = "CLIENT_LOGIN_ERROR";

SecurityManagerEvent.CLIENT_LOGOUT_COMPLETE = "CLIENT_LOGOUT_COMPLETE";