/*jslint node: true, nomen: true*/
'use strict';

var UID = require('./util/random');
var Emitter = require('eventemitter3');
var time = require('./util/time');

var universe = {};

function Node(obj, soul) {
	var copy, node, key, from, to, now = time();
	soul = soul || (obj && obj._ && obj._['#']) || UID();
	if (universe[soul]) {
		node = universe[soul];
		return obj instanceof Object ? node.merge(obj) : node;
	}
	universe[soul] = this;
	this._events = {};
	this.raw = {
		_: {
			'#': soul,
			'>': to = {}
		}
	};
	copy = this.copy = {};
	if (obj instanceof Node) {
		obj = obj.raw;
	}

	if (obj instanceof Object) {
		from = (obj._ || {})['>'] || {};
		for (key in obj) {
			if (obj.hasOwnProperty(key) && key !== '_') {
				this.raw[key] = obj[key];
				to[key] = from[key] || now;
			}
		}
	}
	this.each(function (val, key) {
		copy[key] = val;
	});
	copy._ = {
		'#': soul
	};
}

Node.universe = universe;

var API = Node.prototype = new Emitter();

API.constructor = Node;

API.getSoul = function () {
	return this.raw._['#'];
};

API.getRel = function () {
	return {
		'#': this.getSoul()
	};
};

API.state = function (prop) {
	return this.raw._['>'][prop] || -Infinity;
};

API.each = function (cb) {
	var key, raw = this.raw;
	for (key in raw) {
		if (raw.hasOwnProperty(key) && key !== '_') {
			cb(raw[key], key, this);
		}
	}
	return this;
};

API.update = function (field, value, state) {
	var type, raw = this.raw;
	type = raw.hasOwnProperty(field) ? 'update' : 'add';
	raw[field] = value;
	raw._['>'][field] = state;
	this.copy[field] = value;
	this.emit('change', value, field, this);
	this.emit(type, value, field, this);
	return this;
};

API.merge = function (node) {
	if (this === node || !(node instanceof Object)) {
		return this;
	}
	var state, now, self = this;
	now = time();

	if (!(node instanceof Node)) {
		node = {
			raw: node
		};
	}

	state = (node.raw._ && node.raw._['>']);

	this.each.call(node, function (value, name) {
		var incoming, present, fromStr, toStr;
		present = self.state(name);
		incoming = (state && state[name]) || now;

		if (present > incoming) {
			return self.emit('historical', node, name);
		}
		if (incoming > now) {
			setTimeout(function () {
				self.merge(node);
			}, incoming - now);
			return self.emit('deferred', node, name);
		}
		if (incoming > present) {
			return self.update(name, value, incoming);
		}
		if (incoming === present) {
			toStr = self[name] + '';
			fromStr = value + '';
			if (toStr === fromStr) {
				return 'Equal state and value';
			}
			self.update(name, (toStr > fromStr ? self[name] : value), incoming);
		}
	});

	return self;
};

API.toJSON = function () {
	return this.raw;
};

API.toString = function () {
	return JSON.stringify(this);
};

module.exports = Node;
