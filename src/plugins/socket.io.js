/*jslint node: true, nomen: true*/
'use strict';

var io = require('socket.io-client');
var Gun = require('../API');
var map = require('../util/map');

var peers = {};

Gun.events.on('create', function (gun, opt) {
	if (!opt.peers) {
		return;
	}
	map(opt.peers, function (config, url) {
		peers[url] = peers[url] || io.connect(url);
	});
	
	gun.__.graph.on('update', function (graph, cb, opt) {
		if (opt.peers === false) {
			return;
		}
		map(opt.peers, function (config, url) {
			peers[url].emit(graph, opt);
		});
	});
});
