/*global describe, it, beforeEach*/
/*jslint node: true, nomen: true*/
'use strict';

var Node = require('../src/Node');
var expect = require('./expect');

describe('A node instance', function () {
	var node;

	beforeEach(function () {
		node = new Node({
			success: true
		});
	});

	it('should have a soul', function () {
		expect(node.getSoul()).to.be.a('string');
	});

	it('should merge if passed an object', function () {
		node = new Node({
			merged: true,
			success: true
		});
		expect(node.raw.merged).to.be(true);
		expect(node.raw.success).to.be(true);
	});

	it('should assign state to each new property', function () {
		expect(node.state('success')).to.be.a('number');
	});

	it('should return -Infinity for undefined state', function () {
		expect(node.state('nothing here')).to.be(-Infinity);
	});

	it('should emit historical on stale updates', function (done) {
		var update = new Node({
			success: 'yep'
		}).on('historical', function () {
			done();
		}).merge(node);
	}, 50);

	it('should emit deferred on future updates', function (done) {
		var incoming = new Node();
		incoming.update('success', false, new Date().getTime() + 10000);
		node.on('deferred', function () {
			done();
		}).merge(incoming);
	}, 50);

	it('should reschedule deferred updates', function (done) {
		var incoming = new Node();
		incoming.update('success', 'yep', new Date().getTime() + 50);
		node.merge(incoming);
		expect(node.raw.success).not.to.be('yep');
		setTimeout(function () {
			expect(node.raw.success).to.be('yep');
			done();
		}, 60);
	}, 100);

	it('should immediately merge operating state changes', function () {
		var incoming = new Node({
			success: 'yep'
		});
		expect(node.merge(incoming).raw.success).to.be('yep');
	});

	it('should emit "change" on any mutation', function (done) {
		this.timeout(50);
		var incoming = new Node({
			newData: true
		});
		node.on('change', function () {
			done();
		}).merge(incoming);
	});

	it('should emit "add" on new properties', function (done) {
		var incoming = new Node({
			newProp: true
		});
		node.on('add', function () {
			done();
		}).merge(incoming);
	}, 50);

	it('should emit "update" existing property updates', function (done) {
		var incoming = new Node({
			success: 'yep'
		});
		node.on('update', function () {
			done();
		}).merge(incoming);
	}, 50);

	it('should return the same object when souls match', function () {
		var node1, node2;
		node1 = new Node(null, 'matching soul');
		node2 = new Node(null, 'matching soul');
		expect(node1).to.be(node2);
	});

	it('should merge duplicate souls', function () {
		node = new Node({
			prop1: true
		}, 'same');
		node = new Node({
			prop2: true
		}, 'same');
		expect(node.raw.prop1).to.be(true);
		expect(node.raw.prop2).to.be(true);
	});

	it('should respect the _["#"] field', function () {
		node = new Node({
			_: {
				'#': 'existingSoul'
			}
		});
		expect(node.getSoul()).to.be('existingSoul');
	});
});
