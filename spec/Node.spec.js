/*global describe, it, expect, jasmine, beforeEach*/
/*jslint node: true, nomen: true*/
'use strict';

var Node = require('../src/Node');

describe('A node instance', function () {
	var node;

	beforeEach(function () {
		node = new Node({
			success: true
		});
	});

	it('should have a soul', function () {
		expect(node.getSoul()).toEqual(jasmine.any(String));
	});

	it('should merge if passed an object', function () {
		node = new Node({
			merged: true,
			success: true
		});
		expect(node.merged).toBe(true);
		expect(node.success).toBe(true);
	});

	it('should assign state to each new property', function () {
		expect(node.state('success')).toEqual(jasmine.any(Number));
	});

	it('should emit historical on stale updates', function (done) {
		var update = new Node({
			success: 'yep'
		}).on('historical', done);
		// node's "success" property is older
		update.merge(node);
	});

	it('should emit deferred on future updates', function (done) {
		var incoming = new Node();
		incoming.update('success', false, new Date().getTime() + 10000);
		node.on('deferred', done).merge(incoming);
	});

	it('should reschedule deferred updates', function (done) {
		var incoming = new Node();
		incoming.update('success', 'yep', new Date().getTime() + 50);
		node.merge(incoming);
		expect(node.success).not.toBe('yep');
		setTimeout(function () {
			expect(node.success).toBe('yep');
			done();
		}, 60);
	});

	it('should immediately merge operating state changes', function () {
		var incoming = new Node({
			success: 'yep'
		});
		expect(node.merge(incoming).success).toBe('yep');
	});

	it('should emit "change" on any mutation', function (done) {
		var incoming = new Node({
			success: 'yep',
			newData: true
		});
		node.on('change', done);
		node.merge(incoming);
	});

	it('should emit "add" on new properties', function (done) {
		var incoming = new Node({
			newProp: true
		});
		node.on('add', done);
		node.merge(incoming);
	});

	it('should emit "update" existing property updates', function (done) {
		var incoming = new Node({
			success: 'yep'
		});
		node.on('update', done);
		node.merge(incoming);
	});

	it('should return the same object when souls match', function () {
		var node1, node2;
		node1 = new Node(null, 'matching soul');
		node2 = new Node(null, 'matching soul');
		expect(node1).toBe(node2);
	});

	it('should merge duplicate souls', function () {
		node = new Node({
			prop1: true
		}, 'same');
		node = new Node({
			prop2: true
		}, 'same');
		expect(node.prop1).toBe(true);
		expect(node.prop2).toBe(true);
	});

	it('should respect the _["#"] field', function () {
		node = new Node({
			_: {
				'#': 'existingSoul'
			}
		});
		expect(node.getSoul()).toBe('existingSoul');
	});
});
