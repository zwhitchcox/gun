/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('../');
var Lex = require('../../Lex');

function add(chain, scope) {
	var node = scope.result;
	chain.set({
		value: node.copy(),
		field: node.getSoul(),
		node: node
	});
}

function resolve(chain, lex) {
	Gun.get({
		chain: chain,
		any: chain.vars.cb,
		cb: add
	});
}

module.exports = Gun.prototype.get = function get(lex, cb) {
	if (!(lex instanceof Lex)) {
		lex = new Lex(lex);
	}
	return this.chain({
		ID: lex,
		resolve: resolve,
		parent: this.__.root,

		vars: {
			cb: cb
		}
	});
};
