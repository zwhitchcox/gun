/*jslint node: true*/
'use strict';

function sort(lex) {
	var keys = Object.keys(lex).sort().map(function (key) {
		return [key, lex[key] instanceof Object ? sort(lex[key]) : lex[key]];
	});
	return keys;
}

module.exports = function (lex) {
	return JSON.stringify(sort(lex));
};
