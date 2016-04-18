/*jslint node: true, nomen: true*/
'use strict';

var Graph = require('../Graph');
var Node = require('../Node');
var Emitter = require('eventemitter3');
var Chain = require('../Chain');
var Lex = require('../Lex');
var count = localStorage.getItem('project plea');

var emitter = new Emitter();

function noop() {}

function Gun(opt, split) {
	if (!(this instanceof Gun)) {
		return new Gun(opt);
	}
	if (opt instanceof Gun) {
		this.back = opt;
		this.__ = opt.__;
		this._ = {};
		this._.split = split === undefined ? opt._.split : split;
	} else {
		this.back = this;
		this.__ = new Emitter();
		this.__.opt = opt || {};
		this.__.graph = new Graph();
		this._ = {
			split: false,
			chain: new Chain()
		};
		emitter.emit('opt', this, this.__.opt);
	}
}
Gun.events = emitter;

Gun.get = function (scope) {
	if (!(scope.lex instanceof Lex)) {
		scope.lex = new Lex(scope.lex || {});
	}
	var node, soul = scope.lex['#'];
	node = scope.gun.__.graph[soul] || Node.universe[soul];
	if (node) {
		scope.result = node;
		scope.gun.__.emit('incoming', scope);
		scope.cb(null, scope);
		return true;
	}
	scope.opt = scope.opt || {};
	scope.gun.__.emit('get', scope);
	return false;
};

Gun.put = function (scope) {
	scope.gun.__.graph.merge(scope.graph);
	if (!(scope.cb instanceof Function)) {
		scope.cb = noop;
	}
	if (!scope.gun.__.opt.peers) {
		scope.cb(null, true);
	}
	return scope.gun.__.emit('put', scope);
};

Gun.Graph = Graph;
Gun.Chain = Chain;
Gun.Node = Node;
Gun.Lex = Lex;

module.exports = Gun;

require('./log');
require('./methods.js');
require('./plugins/');
