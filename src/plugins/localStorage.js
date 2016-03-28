/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('../API');

function save(node, soul, opt) {
	opt = opt || {};
	if (opt.localStorage === false) {
		return;
	}
	var old, string = localStorage.getItem(soul);
	if (string) {
		old = JSON.parse(string);
		node.merge(old);
	}
	localStorage.setItem(soul, node);
}

Gun.events.on('create', function (gun, opt) {
	var storage = opt.localStorage;
	if (!storage || typeof localStorage === 'undefined') {
		return;
	}
	gun.__.graph.on('update', function (graph, cb, opt) {
		graph.each(save);
		cb(null);
	});
	
	gun.__.graph.on('request', function (lex, cb, opt) {
		var node, soul = lex['#'];
		if (opt.localStorage === false) {
			return;
		}
		node = localStorage.getItem(soul);
		if (node) {
			return cb(null, JSON.parse(node));
		}
		cb(null, null);
	});
});
