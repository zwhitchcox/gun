/*jslint node: true*/
'use strict';

var Gun = require('./');

Gun.production = false;
Gun.log = function (str) {
	if (!Gun.production) {
		var history = Gun.log.history;
		history[str] = history[str] || [];
		history[str].push(new Date().getTime());
		console.log.apply(console, arguments);
	}
};
Gun.log.once = function (str) {
	if (!Gun.log.history[str]) {
		Gun.log(str);
	}
};
Gun.log.history = {};

module.exports = Gun;
