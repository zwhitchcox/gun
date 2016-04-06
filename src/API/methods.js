/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('./');
var Graph = require('../Graph');
var Node = require('../Node');
var Emitter = require('eventemitter3');
var map = require('../util/map');
var Chain = require('../Chain');
var time = require('../util/time');

Gun.Node = Node;
Gun.Graph = Graph;
Gun.Chain = Chain;

Gun.prototype = {
	constructor: Gun,

	chain: function (split) {
		var gun, last = this;
		gun = new this.constructor(last.__.opt);
		gun.back = last;
		gun.__ = last.__;
		gun._ = {};
		gun._.split = split || false;
		gun._.chain = new Chain(gun);
		return gun;
	},

	/* Done! */
	get: function (lex, cb) {
		var res, gun = this.chain();
		lex = lex instanceof Object ? lex : {
			'#': lex
		};

		gun.__.graph.get(lex, function (err, node) {
			res = cb && cb(err, node);
			gun._.chain.add(node, node.getSoul(), node);
		});

		return gun;
	},

	/* Done! */
	put: function (val) {
		var graph, gun = this;
		if (val instanceof Object) {
			graph = new Graph(val);
		}
		this._.chain.listen(function (v, f, node) {
			if (val instanceof Object) {
				node.merge(val);
				gun.__.graph.merge(graph);
			} else {
				node.update(f, val, time());
			}
		});
		return this;
	},

	path: function (str, cb) {
		var gun = this;


		if (!(str instanceof Array)) {
			str = str.split('.');
		}
		if (str.length > 1) {
			str.forEach(function (path) {
				gun = gun.path(path);
			});
			return gun;
		}
		str = str[0];
		gun = gun.chain();

		this._.chain.listen(function (val, field, node) {

			var lex = (val && val[str] instanceof Object && val[str]);
			if (!lex) {
				return gun._.chain.add(val[str], str, node);
			}
			gun.__.graph.get(lex, function (err, node) {
				var tmp = cb && cb(err, node);
				if (!err && node) {
					gun._.chain.add(node, node.getSoul(), node);
				}
			});
		});

		return gun;
	},

	map: function (cb) {
		var add, gun, root = this;
		gun = this.chain(true);
		add = gun._.chain.add.bind(gun._.chain);

		this._.chain.listen(function (value, field, node) {
			if (!(value instanceof Node)) {
				return;
			}

			value.each(function (val, field) {
				root.path(field).val(add);
			});
		});

		if (cb instanceof Function) {
			gun._.chain.listen(cb);
		}
		return gun;
	},

	on: function (cb) {
		this._.chain.listen(function (value, field, node) {
			node.each(cb).on('change', cb);
		});

		return this;
	},

	val: function (cb) {
		this._.chain.listen(cb || function (node, field) {
			console.log(field + ':', node);
		});

		return this;
	}
};

module.exports = Gun;
