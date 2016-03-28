/*jslint node: true*/
'use strict';

function map(obj, cb) {
	var key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			cb(obj[key], key, obj);
		}
	}
}

module.exports = map;
