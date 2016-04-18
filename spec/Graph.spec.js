/*globals describe, it, expect, jasmine, beforeEach*/
/*jslint node: true, nomen: true*/
'use strict';

var Graph = require('../src/Graph');
var Node = require('../src/Node');

describe('A graph', function () {
	var graph, node;

	beforeEach(function () {
		graph = new Graph();
	});

	it('should serialize an object', function () {
		graph = new Graph({
			object: {
				_: {
					'#': 'nested'
				},
				value: 'success'
			}
		});
		expect(graph.nodes.nested.raw.value).toBe('success');
	});

	it('should use the soul as the field name', function () {
		node = new Node(null, 'fieldName');
		graph.add(node);
		expect(graph.nodes.fieldName).toBe(node);
	});

	it('should turn each flat object into a Node', function () {
		graph = new Graph({
			_: { '#': 'nodify' }
		});
		expect(graph.nodes.nodify).toEqual(jasmine.any(Node));
	});

	it('should emit "add" when a new node is added', function (done) {
		node = new Node();
		graph.on('add', done).add(node);
	});
});
