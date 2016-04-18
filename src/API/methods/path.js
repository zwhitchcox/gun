/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('../');
var Lex = require('../../Lex');

function resolve(chain) {
	var node, field, value, gun;
	gun = chain.value;
	node = chain.data.node;
	field = chain.ID['.'];

	value = node.raw[field];
	if (value instanceof Lex) {
		gun.get(value).val(function (value, field, node) {
			chain.set({
				value: value,
				field: field,
				node: node
			});
		});
	} else {
		chain.set({
			value: value,
			field: field,
			node: node
		});
	}
}

module.exports = Gun.prototype.path = function (arr, cb) {
	var gun = this;

	// <validation>
	if (typeof arr === 'string') {
		arr = arr.split('.');
	}
	if (!(arr instanceof Array)) {
		arr = [arr];
	}
	if (arr.length > 1) {
		arr.forEach(function (path) {
			gun = gun.path(path);
		});
		return gun;
	}
	// </validation>

	return this.chain({
		name: new Lex.Partial('.', arr[0]),

		resolve: resolve,
		raw: {
			cb: cb,
			cached: true
		}
	});
};
