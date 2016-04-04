/*jslint node: true, nomen: true*/
'use strict';

var UID = require('./util/random');
var Emitter = require('eventemitter3');
var time = require('./util/time');

var universe = {};

function Node(obj, soul) {
	var node, key, from, to, now = time();
	soul = soul || (obj && obj._ && obj._['#']) || UID();
	if (universe[soul]) {
		node = universe[soul];
		return obj instanceof Object ? node.merge(obj) : node;
	}
	universe[soul] = this;
	this._events = {};
	this._ = {
		'>': {},
		'#': soul
	};

	if (obj && typeof obj === 'object') {
		obj._ = obj._ || {};
		obj._['#'] = this._['#'];
		obj._['>'] = obj._['>'] || {};
		from = obj._['>'];
		to = this._['>'];
		for (key in obj) {
			if (obj.hasOwnProperty(key) && key !== '_' && key !== '_events') {
				this[key] = obj[key];
				from[key] = to[key] = from[key] || now;
			}
		}
	}
}

Node.universe = universe;

Node.prototype = new Emitter();

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
		if (this.hasOwnProperty(key) && key !== '_' && key !== '_events') {
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
	if (this === node || !node) {
		return this;
	}
	var primitive, now, self = this;
	now = time();
	primitive = !(node instanceof Node);

	this.each.call(node, function (value, name) {
		var incoming, present, successor;
		present = self.state(name);
		incoming = primitive ? now : node.state(name);
		if (present > incoming) {
			return self.emit('historical', node, name);
		}
		if (incoming > now) {
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
	return (obj);
};

API.match = function (lex) {
	var state, value, field, arr = [];
	field = lex['.'];
	value = lex['='];
	state = lex['>'];
};

API.toJSON = function () {
	return JSON.stringify(this.primitive());
};
API.toString = API.toJSON;

module.exports = Node;
