/*jslint node: true*/
'use strict';

var Emitter = require('events');
var NODE = require('./Node');
var map = require('./util/map');

function Graph(graph) {
	var soul, self = this;
	this.setMaxListeners(Infinity);
	if (graph && typeof graph === 'object') {
		this.put(graph);
	}
}

Graph.prototype = Emitter.prototype;
var API = Graph.prototype;

API.constructor = Graph;

API.get = function (query, target) {
	var matching, soul = query['#'];
	matching = NODE.universe[soul];
	if (matching) {
		(target || this).add(matching, soul);
	}
	return this;
};

API.add = function (node, soul) {
	if (!(node instanceof NODE)) {
		node = NODE(node, soul);
	}
	soul = node.getSoul();
	if (this[soul]) {
		return this[soul].merge(node);
	}
	this[soul] = node;
	this.emit('add', node, soul, this);
	return this;
};

API.put = function (graph) {
	var soul;
	for (soul in graph) {
		if (graph.hasOwnProperty(soul) && soul !== '_events' && soul !== '_maxListeners') {
			this.add(graph[soul], soul);
		}
	}
	return this;
};

API.every = function (cb) {
	var soul;
	for (soul in this) {
		if (this.hasOwnProperty(soul) && soul !== '_events' && soul !== '_maxListeners') {
			cb(this[soul], soul, this);
		}
	}
	return this.on('add', cb);
};



module.exports = Graph;
