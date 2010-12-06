MessageData = module.exports = function(target)
{
	this.target = target;
	this.data = new Array();
}

MessageData.prototype.push = function (d)
{
	this.data.push(d);
}

MessageData.prototype.send = function (player)
{
	player.send({target: this.target,
				 data: this.data});
}