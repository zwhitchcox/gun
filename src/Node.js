/*jslint node: true, nomen: true*/
'use strict';

var UID = require('./util/random');
var Emitter = require('eventemitter3');
var time = require('./util/time');
var Lex;

var universe = {};

function Node(obj, soul) {
	if (soul === undefined) {
		soul = (obj && obj._ && obj._['#']) || UID();
	}
	var node = universe[soul];
	if (node) {
		return obj instanceof Object ? node.merge(obj) : node;
	}
	universe[soul] = this;
	this.cp = null;
	this._events = {};
	this.raw = {
		_: {
			'#': soul,
			'>': {}
		}
	};

	if (obj instanceof Object) {
		this.merge(obj);
	}
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

API.copy = function () {
	if (!this.cp) {
		var node = this;
		node.cp = {
			_: node.getRel()
		};
		node.each(function (val, field) {
			node.cp[field] = val;
		});
	}
	return this.cp;
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
	if (value instanceof Object) {
		value = new Lex(value);
	}
	raw[field] = value;
	raw._['>'][field] = state;
	this.cp = null;
	this.emit('change', value, field, this);
	this.emit(type, value, field, this);
	this.emit(field, value, field, this);
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
		var incoming, present, fromStr, val, toStr;
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
			val = self[name];
			toStr = val ? val.toString() : String(val);
			fromStr = value ? value.toString() : String(value);
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

API.valueOf = function () {
	var node, num = -Infinity;
	node = this;
	this.each(function (val, field) {
		num = Math.max(num, node.state(field));
	});
	return num;
};

module.exports = Node;
Lex = require('./Lex');
