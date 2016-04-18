/*jslint node: true*/
module.exports = {
	Gun: require('./API'),
	Chain: require('./Chain'),
	Node: require('./Node'),
	Graph: require('./Graph'),
	time: require('./util/time'),
	Lex: require('./Lex'),
	UID: require('./util/random')
};

Object.assign(window, module.exports);
