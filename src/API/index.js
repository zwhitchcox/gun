/*jslint node: true, nomen: true*/
'use strict';

var Graph = require('../Graph');
var Node = require('../Node');
var Emitter = require('eventemitter3');
var Chain = require('../Chain');

var emitter = new Emitter();

function Gun(opt) {
	if (!(this instanceof Gun)) {
		return new Gun(opt);
	}
	this.back = this;
	this.__ = {
		opt: opt || {},
		graph: new Graph()
	};
	this._ = {};
	this._.chain = new Chain(this);
	emitter.emit('opt', this, this.__.opt);
}
Gun.events = emitter;

Gun.Graph = Graph;
Gun.Node = Node;

module.exports = Gun;

require('./log');
require('./methods.js');
require('./plugins/');
