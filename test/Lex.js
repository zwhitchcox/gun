/*globals describe, it, afterEach*/
/*jslint node: true*/
'use strict';

var Lex = require('../src/Lex');
var expect = require('./expect');

describe('A lex', function () {
	var lex;

	afterEach(function () {
		lex = undefined;
	});

	it('should have spec-compliant fields', function () {
		lex = new Lex({
			soul: 'users',
			field: 'bob'
		});
		expect(lex['#']).to.be('users');
		expect(lex['.']).to.be('bob');
	});

	it('should accept compliant lexes', function () {
		lex = new Lex({
			'#': 'users',
			'.': 'bob'
		});
		expect(lex['#']).to.be('users');
		expect(lex['.']).to.be('bob');
	});

	it('should accept mixed compliant lexes', function () {
		lex = new Lex({
			'#': 'users',
			field: 'bob',
			'=': 'value',
			state: 10
		});
		expect(lex['#']).to.be('users');
		expect(lex['.']).to.be('bob');
		expect(lex['=']).to.be('value');
		expect(lex['>']).to.be(10);
	});

	it('should treat a single string as a soul', function () {
		lex = new Lex('users');
		expect(lex['#']).to.be('users');
	});

	it('should lazily eval toStrings', function () {
		lex = new Lex({
			soul: 'users'
		});
		expect(lex.ID).not.to.be.a('string');
		lex.toString();
		expect(lex.ID).to.be.a('string');
	});

	it('should reset the ID if changed', function () {
		lex = new Lex('users');
		lex.toString();
		expect(lex.ID).to.be.a('string');
		lex.set('#', 'new value');
		expect(lex.ID).to.be(null);
	});

	it('should use json when toStringing objects', function () {
		lex = new Lex({
			soul: {
				'?': 'potato'
			}
		});
		var string = lex.toString();
		expect(string).not.to.contain('[object Object]');
	});
});








