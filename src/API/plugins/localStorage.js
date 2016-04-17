/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('../');
var read = {};

function put(scope) {
	var val, prefix;
	prefix = scope.gun.__.opt.prefix || scope.opt.prefix || 'gun/';
	scope.graph.each(function (node, soul) {
		if (!read[soul]) {
			val = localStorage.getItem(prefix + soul);
			if (val) {
				node.merge(val);
			}
			read[soul] = true;
		}
		localStorage.setItem(prefix + soul, node);
	});
}

function get(scope) {
	var val, prefix;
	prefix = scope.gun.__.opt.prefix || scope.opt.prefix || 'gun/';
	val = localStorage.getItem(scope.lex['#']);
	scope.cb(null, val);
}

if (typeof localStorage !== 'undefined') {
	Gun.events.on('opt', function (gun, opt) {
		if (opt.localStorage !== false) {
			gun.__.on('put', put);
			gun.__.on('get', get);
		}
	});
}
