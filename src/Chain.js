/*jslint node: true, nomen: true*/
'use strict';

var Emitter = require('eventemitter3');

function Chain(scope) {

	if (!scope) {
		this.children = {};
		this.parent = this;
		this.root = true;
		this.value = this;
		return this;
	}

	this.ID = scope.ID;
	var parent, key, str = scope.ID.toString();
	parent = this.parent = scope.parent;

	parent.children[str] = this;

	parent.watch({
		cb: scope.cbs.resolve
	});
	this._events = {};
	this.value = scope.value;
	this.vars = scope.vars || {};
	this.cbs = scope.cbs;
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

API.walk = function (cb) {
	var chain = this;
	do {
		if (cb(chain = chain.parent) === true) {
			break;
		}
	} while (!chain.root);
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
	var chain, res, cb = scope.cb;
	chain = this;
	function handle(res) {
		cb(chain, res);
	}

	if (!this.split && this.resolved) {
		cb(chain, this.resolved);
	} else if (this.split) {
		this.on('resolved', handle).resolved.forEach(handle);
	} else {
		this.once('resolved', handle);
	}

	return this;
};

API.resolve = function (arg) {
	this.cbs.resolve(this, arg);
	return this;
};



module.exports = Chain;
