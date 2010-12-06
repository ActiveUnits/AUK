AccountsManagerEvent = module.exports = function(type)
{
	this.type = type;
	this.sessionId = null;
	this.data = null;
}

AccountsManagerEvent.REGISTRATION_COMPLETE = "REGISTRATION_COMPLETE";
AccountsManagerEvent.REGISTRATION_EXIST = "REGISTRATION_EXIST";

AccountsManagerEvent.LOGIN_COMPLETE = "LOGIN_COMPLETE";
AccountsManagerEvent.LOGIN_ERROR = "LOGIN_ERROR";

AccountsManagerEvent.LOGOUT_COMPLETE = "LOGOUT_COMPLETE";

AccountsManagerEvent.LIST_RESULT = "LIST_RESULT";