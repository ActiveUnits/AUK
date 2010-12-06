Collection = module.exports = function()
{
	this.items = [];
	this.itemsByName = [];
	this.namesByItem = [];
	
	this.$id = Collection.$id ++;
}

Collection.prototype.addItem = function(item, name)
{
	return this.addItemAt(item, this.items.length, name);
}

Collection.prototype.addItemAt = function(item, index, name)
{
	var n = !name ? "item" + this.$id : name;
	
	this.items.splice(index, 0, item);
	
	this.itemsByName[n] = item;
	this.namesByItem[item] = n;
	
	this.$id ++;
	
	return item;
}

Collection.prototype.getItemByName = function(name)
{
	return this.itemsByName[name];
}

Collection.prototype.getNameByItem = function(item)
{
	return this.namesByItem[item];
}

Collection.prototype.getItemIndex = function(item)
{
	return this.items.indexOf(item);
}

Collection.prototype.getItemAt = function(index)
{
	return this.items[index];
}

Collection.prototype.removeByName = function(name)
{
	var index = this.getItemIndex(this.itemsByName[name]);
	return this.removeItemAt(index);
}

Collection.prototype.removeByItem = function(item)
{
	var index = this.getItemIndex(item);
	return this.removeItemAt(index);
}

Collection.prototype.removeItemAt = function(index)
{
	var item = this.items.splice(index, 1);
	
	this.itemsByName[this.namesByItem[item]] = undefined;
	this.namesByItem[item] = undefined;
	
	return item;
}

Collection.prototype.removeAll = function(name)
{
	this.items = [];
	this.itemsByName = [];
	this.namesByItem = [];
}

Collection.prototype.length = function()
{
	return this.items.length;
}

Collection.$id = 0;