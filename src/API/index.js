/*jslint node: true, nomen: true*/
'use strict';

var Graph = require('../Graph');
var Node = require('../Node');
var Emitter = require('events');
var map = require('../util/map');

function Gun(opt) {
	if (!(this instanceof Gun)) {
		return new Gun(opt);
	}
	var graph = new Graph();
	this.__ = {
		opt: opt || {},
		graph: graph
	};
	this._ = {
		lex: {},
		graph: graph
	};
	Gun.events.emit('opt', this, opt);
	this.back = this;
}

Gun.events = new Emitter();

Gun.Node = Node;
Gun.Graph = Graph;

Gun.each = function (gun, cb) {
	var length = 1;
	cb(gun);
	while (gun !== gun.back) {
		if (cb(gun = gun.back) === true) {
			break;
		}
		length += 1;
	}
	return length;
};

var API = Gun.prototype;

API.chain = function (back) {
	var gun, last = this;
	gun = new this.constructor(this.__.opt);
	gun.__ = last.__;
	gun.back = back || last;
	return gun;
};

API.get = function (lex, cb) {
	var gun = this.chain();
	lex = typeof lex === 'object' ? lex : {
		'#': lex
	};
	this._.root = true;
	gun._.lex = lex;
	this.__.graph.get(lex, gun._.graph);
	return gun;
};

function log(node, field) {
	var args = [node];
	if (typeof field === 'string') {
		args.unshift(field);
	}
	console.log.apply(console, args);
}

API.val = function (cb) {

	cb = cb || log;
	var gun = this;
	gun._.graph.every(function (node, soul) {
		cb(node.primitive(), soul, gun);
	});

	return this;
};

API.on = function (cb) {
	var gun = this;
	gun._.graph.every(function (node, soul) {
		cb.call(gun, node.primitive(), soul, gun);
		node.on('change', function (val, field) {
			cb.call(gun, node.primitive(), field, gun);
		});
	});
	return this;
};

API.put = function (obj) {
	// Flatten
	var node = Gun.Node(obj, this._.lex['#']);
	this._.graph.add(node);
	return this;
};

API.map = function (cb) {
	var gun = this;

	function each(value, field, node) {
		cb.call(gun, value, field, node);
	}

	gun._.graph.every(function (node, soul) {
		node.each(each).on('change', each);
	});

	return this;
};

API.path = function (path) {
	var gun = this;
	if (typeof path === 'string') {
		path = path.split('.');
	}
	map(path, function (prop) {
		gun = gun.chain();
		gun._.lex['.'] = prop;
	});

	return this;
};

module.exports = Gun;
