/*jslint node: true, nomen: true*/
'use strict';

var Emitter = require('eventemitter3');
var Gun = require('./API');

function scan(gun, cb) {
	var length = 1;
	cb(gun);
	while (gun !== gun.back) {
		if (cb(gun = gun.back) === true) {
			break;
		}
		length += 1;
	}
	return length;
}

function Chain(gun) {
	var chain = this;

	this.graph = gun.__.graph;
	this.split = false;

	scan(gun, function (instance) {
		if (instance._.split) {
			return (chain.split = true);
		}
		return instance._.root;
	});

	this.resolved = (this.split) ? [] : null;
}

Chain.prototype = new Emitter();
var API = Chain.prototype;

API.listen = function (cb) {

	function handle(result) {
		cb(result.value, result.field, result.node);
	}

	if (this.split) {
		this.resolved.forEach(handle);
		this.on('add', handle);
	} else if (this.resolved) {
		handle(this.resolved);
	} else {
		this.once('add', handle);
	}

	return this;
};

API.add = function (value, field, node) {
	var result = {
		value: value,
		field: field,
		node: node
	};

	if (this.split) {
		this.resolved.push(result);
	} else {
		this.resolved = result;
	}
	this.emit('add', result);

	return this;
};

module.exports = Chain;
