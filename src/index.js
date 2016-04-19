/*jslint node: true*/

var Gun = require('./API');
var globals = {
	Gun: Gun,
	Chain: require('./Chain'),
	Node: require('./Node'),
	Graph: require('./Graph'),
	time: require('./util/time'),
	Lex: require('./Lex'),
	UID: require('./util/random')
};

if (typeof window !== 'undefined' && window) {
	Object.assign(window, globals);
}

module.exports = Gun;
