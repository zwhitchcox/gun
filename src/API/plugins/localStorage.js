/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('../');
var Node = require('../../Node');

Gun.events.on('opt', function (gun, opt) {
	var prefix, storage = opt.localStorage;
	prefix = (storage || {}).prefix || 'gun_';
	if (storage === false || typeof localStorage === 'undefined') {
		return;
	}

	gun.__.graph.watch(function (value, field, node) {
		var val, soul = node.getSoul();
		val = localStorage.getItem(prefix + soul);
		if (typeof val === 'string') {
			node = new Node(JSON.parse(val));
		}
		localStorage.setItem(prefix + soul, node);
	});

	gun.__.graph.on('get', function (lex, cb, opt) {
		var node, name = prefix + lex['#'];
		if (opt.localStorage !== false) {
			node = localStorage.getItem(name);
			cb(null, node && JSON.parse(node));
		}
	});
});
