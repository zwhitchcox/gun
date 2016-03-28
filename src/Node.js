/*jslint node: true, nomen: true*/
'use strict';

var UID = require('./util/random');
var Emitter = require('events');
var terms = require('./terms');
var time = require('./util/time');

function Node(obj, ID) {
	var key, soul, now = time();
	this._ = {};
	this._['>'] = {};
	
	if (obj && typeof obj === 'object') {
		obj._ = obj._ || {};
		obj._[terms.HAM] = obj._[terms.HAM] || {};
		soul = obj._['#'];
	}
	this._[terms.soul] = ID || soul || UID();

	for (key in obj) {
		if (obj.hasOwnProperty(key) && key !== terms.meta) {
			this[key] = obj[key];
			this._[terms.HAM][key] = obj._[terms.HAM][key] || now;
		}
	}
}

Node.prototype = Emitter.prototype;

var API = Node.prototype;

API.constructor = Node;

API.getSoul = function () {
	return this._[terms.soul];
};

API.state = function (prop) {
	return this._[terms.HAM][prop] || null;
};

API.each = function (cb) {
	var key;
	for (key in this) {
		if (this.hasOwnProperty(key) && key !== terms.meta && key !== '_events') {
			cb(this[key], key, this);
		}
	}
	return this;
};

API.update = function (field, value, state) {
	var added = !this.hasOwnProperty(field);
	this[field] = value;
	this._[terms.HAM][field] = state;
	this.emit('change', value, field, this);
	if (added) {
		this.emit('add', value, field, this);
	}
	return this;
};

API.merge = function (node) {
	if (!(node instanceof Node)) {
		node = new Node(node, this.getSoul());
	}
	var now, self = this;
	now = time();

	node.each(function (value, name) {
		var incoming, present, successor;
		present = self.state(name);
		incoming = node.state(name);
		if (present > incoming) {
			return self.emit('historical', node, name);
		}
		if (incoming > now) {
			console.log('Present:', now, 'Incoming:', incoming);
			return self.emit('deferred', node, name);
		}
		if (present < incoming) {
			return self.update(name, value, incoming);
		}
		if (present === incoming) {
			if (String(self[name]) === String(value)) {
				return 'Equal state and value';
			}
			successor = (String(self[name]) > String(value)) ? self[name] : value;
			self.update(name, successor, incoming);
		}
	});
	return self;
};

API.primitive = function () {
	var obj = {};
	this.each(function (value, field) {
		obj[field] = value;
	});
	obj._ = this._;
	return obj;
};

API.toJSON = API.primitive;

module.exports = Node;
