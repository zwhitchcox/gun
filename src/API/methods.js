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
		if (val instanceof Object) {
			var tmp = new Graph(val);
		}
		this._.chain.listen(function (v, f, node) {
			if (val instanceof Object) {
				node.merge(val);
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
				gun._.chain.add(node, node.getSoul(), node);
			});
		});

		return gun;
	},

	map: function (cb) {
		var gun = this.chain(true);

		function add(val, field, node) {
			gun._.chain.add({
				value: val,
				field: field,
				node: node
			});
		}
		this._.chain.listen(function (value, field, node) {
			if (value instanceof Node) {
				value.each(add).on('add', add);
			} else if (value instanceof Object) {
				gun._.chain.resolve(value);
			} else {
				add(value, field, node);
			}
		});
		if (cb instanceof Function) {
			gun._.chain.listen(cb);
		}
		return gun;
	},

	val: function (cb) {
		this._.chain.listen(cb || function (node, field) {
			console.log(field + ':', node);
		});

		return this;
	}
};

module.exports = Gun;
