/*jslint node: true, nomen: true*/
'use strict';

var Emitter = require('eventemitter3');

function Chain(scope) {

	if (!scope) {
		this.children = {};
		this.parent = this;
		this.root = true;
		return this;
	}

	var parent, duplicate, str;
	str = (this.ID = scope.ID).toString();
	parent = this.parent = scope.parent || null;

	duplicate = parent.children[str];
	if (duplicate) {
		return duplicate;
	} else {
		parent.children[str] = this;
	}

	this.value = scope.value;
	this.split = scope.split || false;
	this.children = {};

	this.resolved = (this.split) ? [] : null;
}

var API = Chain.prototype = new Emitter();

API.has = function (ID) {
	return this.children[ID.toString()] || false;
};

API.each = function (cb) {
	var ID, children = this.children;
	for (ID in children) {
		if (children.hasOwnProperty(ID)) {
			cb(children[ID], ID, this);
		}
	}
	return this;
};

API.send = function (data) {
	if (this.split) {
		this.resolved.push(data);
	} else {
		this.resolved = data;
	}
	this.emit('resolved', data);
	return this;
};

API.watch = function (scope) {
	var cb = scope.cb;
	function handle(res) {
		scope.result = res;
		cb(scope);
	}

	if (!this.split && this.resolved) {
		scope.result = this.resolved;
		cb(scope);
	} else if (this.split) {
		this.on('add', handle).resolved.forEach(handle);
	} else {
		this.once('add', handle);
	}

	return this;
};

module.exports = Chain;
