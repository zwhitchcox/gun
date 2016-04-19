/*jslint node: true, nomen: true*/
var path = require('path');

module.exports = {
	context: path.join(__dirname),
	entry: './src/index.js',
	output: {
		filename: 'gun.js'
	}
};
