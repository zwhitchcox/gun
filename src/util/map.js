/*jslint node: true*/
'use strict';

module.exports = function (obj, cb) {
	var key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			cb(obj[key], key, obj);
		}
	}
};
