/*jslint node: true, nomen: true, forin: true*/
'use strict';

var Emitter = require('eventemitter3');
var Node = require('./Node');

function flatten(obj, graph) {
	var key, tmp, node, soul;
	for (key in obj) {
		if (obj.hasOwnProperty(key) && key !== '_events' && key !== '_' && (tmp = obj[key]) instanceof Object) {
			delete obj[key];
			tmp = flatten(tmp, graph);
			node = new Node(tmp);
			soul = node.getSoul();
			graph[soul] = node;
			obj[key] = { '#': soul };
		}
	}
	return obj;
}

function Graph(obj) {
	this._events = {};
	this.nodes = {};

	if (obj instanceof Object) {
		flatten(obj, this.nodes);
		var node = new Node(obj);
		this.nodes[node.getSoul()] = node;
	}
}

var API = Graph.prototype = new Emitter();

API.constructor = Graph;

API.add = function (node, soul) {
	var nodes = this.nodes;
	if (!(node instanceof Node)) {
		node = new Node(node, soul);
	}
	soul = node.getSoul();
	if (nodes[soul]) {
		nodes[soul].merge(node);
		return this;
	}
	nodes[soul] = node;
	this.emit('add', node, soul, this);
	return this;
};

API.merge = function (graph) {
	var soul;
	for (soul in graph) {
		if (graph.hasOwnProperty(soul) && soul !== '_events') {
			this.add(graph[soul], soul);
		}
	}
	return this;
};

API.each = function (cb) {
	var soul, nodes = this.nodes;
	for (soul in nodes) {
		if (nodes.hasOwnProperty(soul)) {
			cb(nodes[soul], soul, nodes);
		}
	}
	return this;
};

API.get = function (lex, cb, opt) {
	var graph, node, soul = lex['#'];
	node = Node.universe[soul];
	graph = this;
	if (node) {
		if (!graph[soul]) {
			graph[soul] = node;
		}
		cb(null, node);
		return this;
	}
	graph.emit('get', lex, function (err, val) {
		if (!err && val && !(val instanceof Node)) {
			val = new Node(val);
		}
		if (!err && val) {
			graph.add(val);
		}
		cb(err, val);
	}, opt || {});

	return this;
};

API.watch = function (cb) {
	function watch(node) {
		node.on('change', cb);
	}
	return this.each(watch).on('add', watch);
};

module.exports = Graph;
