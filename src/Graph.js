/*jslint node: true*/
'use strict';

var Emitter = require('events');
var Node = require('./Node');
var map = require('./util/map');

function Graph(graph) {
	var soul, self = this;
	if (graph && typeof graph === 'object') {
		this.put(graph);
	}
}

Graph.prototype = Emitter.prototype;
var API = Graph.prototype;

API.constructor = Graph;

API.get = function (query, cb, opt) {
	var self, matching, soul = query['#'];
	matching = this[soul];
	self = this;
	if (matching) {
		cb(null, matching);
		return this;
	}
	this.emit('get', query, function (err, node) {
		if (!node) {
			return;
		}
		if (!(node instanceof Node)) {
			node = new Node(node);
		}
		var graph = {};
		graph[node.getSoul()] = node;
		self.update(graph);
		cb(err, node);
	}, opt || {});
	return this;
};

API.put = function (graph) {
	var self = this;
	map(graph, function (node, soul) {
		if (!node || typeof node !== 'object' || soul === '_events') {
			return;
		}
		if (!(node instanceof Node)) {
			node = new Node(node, soul);
		}
		var ID = node.getSoul();
		if (self[ID]) {
			return self[ID].merge(node);
		}
		self[ID] = node;
		// notify addition
		self.emit('update', node, soul);

		// Listen for changes
		node.on('change', function (value, field) {
			self.emit('update', node, soul);
		});
	});
	return this;
};

module.exports = Graph;
