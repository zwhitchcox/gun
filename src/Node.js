/*jslint node: true, nomen: true*/
'use strict';

var UID = require('./util/random');
var Emitter = require('events');
var time = require('./util/time');

var universe = {};

function Node(obj, soul) {
	var node, key, from, to, now = time();
	soul = soul || (obj && obj._ && obj._['#']);
	if (!(this instanceof Node)) {
		if (universe[soul]) {
			node = universe[soul];
			if (obj && typeof obj === 'object') {
				node.merge(obj);
			}
			return node;
		}
		node = new Node(obj, soul);
		return (universe[node._['#']] = node);
	}
	this._ = {
		'>': {},
		'#': soul || UID()
	};

	if (obj && typeof obj === 'object') {
		obj._ = obj._ || {};
		obj._['#'] = this._['#'];
		obj._['>'] = obj._['>'] || {};
		from = obj._['>'];
		to = this._['>'];
		for (key in obj) {
			if (obj.hasOwnProperty(key) && key !== '_') {
				this[key] = obj[key];
				from[key] = to[key] = from[key] || now;
			}
		}
	}
}

Node.universe = universe;

Node.prototype = Emitter.prototype;

var API = Node.prototype;

API.constructor = Node;

API.getSoul = function () {
	return this._['#'];
};

API.state = function (prop) {
	return this._['>'][prop] || null;
};

API.each = function (cb) {
	var key;
	for (key in this) {
		if (this.hasOwnProperty(key) && key !== '_' && key !== '_events' && key !== '_maxListeners') {
			cb(this[key], key, this);
		}
	}
	return this;
};

API.update = function (field, value, state) {
	var added = !this.hasOwnProperty(field);
	this[field] = value;
	this._['>'][field] = state;
	this.emit('change', value, field, this);
	if (added) {
		this.emit('add', value, field, this);
	}
	return this;
};

API.merge = function (node) {
	if (!(node instanceof Node)) {
		node = new Node(node, null);
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
		if (incoming > present) {
			return self.update(name, value, incoming);
		}
		if (incoming === present) {
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
