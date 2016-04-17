/*jslint node: true*/
'use strict';

var Node, API, str = JSON.stringify;

function Lex(lex) {
	var type = typeof lex;
	if (type === 'undefined') {
		return this;
	}
	if (type === 'string') {
		return new Lex.Partial('#', lex);
	}
	if (lex instanceof Node) {
		return new Lex.Partial('#', lex.getSoul());
	}
	this['#'] = lex['#'] || lex.soul;
	this['.'] = lex['.'] || lex.field;
	this['='] = lex['='] || lex.value;
	this['>'] = lex['>'] || lex.state;

	this.ID = null;
}

Lex.prototype = {
	constructor: Lex,

	toString: function () {
		if (!this.ID) {
			var soul, field, value, state;
			soul = '#' + (this['#'] || '');
			field = '.' + (this['.'] || '');
			value = '=' + (this['='] || '');
			state = '>' + (this['>'] || '');
			this.ID = soul + field + value + state;
		}
		return this.ID;
	},

	toJSON: function () {
		return {
			'#': this['#'],
			'.': this['.'],
			'=': this['='],
			'>': this['>']
		};
	}
};

Lex.Partial = function (type, value) {
	if (value instanceof Lex) {
		return value;
	}
	this[type] = value;
	this.ID = null;
	this.type = type;
};

API = Lex.Partial.prototype = new Lex();
API.toString = function () {
	if (!this.ID) {
		var type, value = this[this.type];
		type = typeof value;
		this.ID = this.type + (type === 'string' ? value : str(value));
	}
	return this.ID;
};

module.exports = Lex;
Node = require('./Node');
