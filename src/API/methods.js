/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('./');
var Graph = require('../Graph');
var time = require('../util/time');
var Chain = require('../Chain');

function log(val, field) {
	Gun.log(field + ':', val);
}

Gun.prototype = {
	constructor: Gun,

	chain: function (scope) {
		var gun, cached, chain = this._.chain;
		cached = chain.has(scope.ID);
		if (cached) {
			return cached.value;
		}
		scope.parent = chain;
		scope.value = gun = new this.constructor(this, scope.split);
		gun._.chain = new Chain(scope);
		return gun;
	},

	put: function (val, cb) {
		var graph, gun = this;
		if (val instanceof Object) {
			graph = new Graph(val);
		}
		this._.chain.watch({
			cb: function (v, f, node) {
				var graph = new Graph().add(node);
				if (val instanceof Object) {
					node.merge(val);
				} else {
					node.update(f, val, time());
				}
				Gun.put({
					gun: gun,
					cb: cb,
					graph: graph
				});
			}
		});
		return this;
	},

	map: function (cb) {
		var root, gun = this.chain(true);
		root = this;

		function add(val, prop, node) {
			gun._.chain.set({
				value: val,
				field: prop,
				node: node
			});
		}

		function find(val, prop) {
			root.path(prop).val(add);
		}

		this._.chain.watch({
			cb: function handle(value, field, node) {
				node.each(find).on('add', find);
			}
		});

		if (cb instanceof Function) {
			gun._.chain.watch(cb);
		}
		return gun;
	},

	on: function (cb) {
		function handle(value, field, node) {
			cb(node, node.getSoul(), node);
		}
		this._.chain.watch({
			cb: function (value, field, node) {
				handle(value, field, node);
				node.on('change', handle);
			}
		});

		return this;
	}
};

module.exports = Gun;
require('./methods/');
