/*jslint node: true*/
'use strict';

var last;

function time() {
	var now = new Date().getTime();
	if (now <= last) {
		return (last += 0.001);
	}
	return (last = now);
}

module.exports = time;
