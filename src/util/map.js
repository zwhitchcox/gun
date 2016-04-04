/*jslint node: true*/
'use strict';

Object.keys = Object.keys || function (obj) {
	var key, arr = [];
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			arr.push(key);
		}
	}
	return arr;
};



function map(obj, cb) {
	var i, key, keys = Object.keys(obj);
	i = keys.length;
	while (i--) {
		key = keys[i];
		cb(obj[key], key, obj);
	}
}

module.exports = map;
