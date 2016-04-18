/*jslint node: true*/
'use strict';
var space = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';

module.exports = function (length) {
	if (length < 0) {
		return '';
	}
	length = length || 24;
	var val = '';
	while (length) {
		val += space[Math.floor(Math.random() * space.length)];
		length -= 1;
	}
	return val;
};
