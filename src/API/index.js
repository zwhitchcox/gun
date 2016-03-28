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
	this._ = new Emitter();
	this.__ = {
		opt: opt || {},
		graph: new Graph()
	};
	this.back = this;
}

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
	this.__.graph.get(lex, function (err, node) {
		gun._.node = node;
		gun._.emit('chain', node);
		if (cb) {
			cb(err, node);
		}
	});
	return gun;
};

API.put = function (obj, cb) {
	// flatten... pipline.deploy(obj) ?
	var node, graph, soul, self = this;
	soul = this._.lex['#'];
	if (soul) {
		graph = {};
		node = new Node(obj, soul);
		graph[soul] = node;
		this.__.graph.put(graph, cb);
		this._.node = node;
	} else {
		this._.on('chain', function () {
			self.put(obj, cb);
		});
	}
	return this;
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
	var node = this._.node;

	if (node) {
		cb(node.primitive());
	} else {
		this._.once('chain', function (node) {
			cb(node.primitive());
		});
	}

	return this;
};

API._resolve = function () {
	var graph, chain, lex = {};
	chain = [];
	graph = this.__.graph;
	Gun.each(this, function (gun) {
		var built = gun._.lex;
		lex['#'] = lex['#'] || built['#'];
		lex['.'] = lex['.'] || built['.'];
		chain.push(gun);
		return gun._.root;
	});
	chain = chain.reverse();
	// this isn't responsive
	function resolve(gun) {
		graph.get(lex, function (node) {
			gun._.emit('chain', node);
		});
	}
	map(chain, function (gun) {
		graph.get(lex, function (node) {
			gun._.emit('chain', node);
		});
	});
};

API.on = function (cb) {
	var node, gun = this;
	node = gun._.node;
	if (node) {
		cb.call(this, node.primitive(), null);
		node.on('change', function () {
			cb.call(this, node.primitive(), null);
		});
		return this;
	}
	this._.on('chain', function (node) {
		cb(node.primitive());
		node.on('change', cb);
	});
	return this;
};

API.map = function (cb) {
	var gun, node = this._.node;
	gun = this;
	function each(value, field) {
		cb.call(gun, value, field, node);
	}
	if (node) {
		node.each(each).on('add', each);
		return this;
	}
	this._.once('chain', function (node) {
		node.each(each).on('add', each);
	});
	return this;
};

module.exports = Gun;
