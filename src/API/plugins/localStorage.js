/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('../');

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
	localStorage.setItem('gun_' + soul, node);
}

Gun.events.on('opt', function (gun, opt) {
	var prefix, storage = opt.localStorage;
	prefix = (storage || {}).prefix || 'gun_';
	if (storage === false || typeof localStorage === 'undefined') {
		return;
	}
	gun.__.graph.on('put', function (graph, cb, opt) {
		graph.each(save);
		cb(null);
	});

	gun.__.graph.on('get', function (lex, cb, opt) {
		var node, soul = prefix + lex['#'];
		if (opt.localStorage === false) {
			return;
		}
		node = localStorage.getItem(soul);
		cb(null, node && JSON.parse(node));
	});
});
