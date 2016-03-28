/*jslint node: true, nomen: true*/
var path = require('path');

module.exports = {
	context: path.join(__dirname, 'src'),
	entry: './index.js',
	output: {
		path: __dirname,
		filename: 'gun.js'
	},
	module: {
		loaders: [{
			test: /\.json$/,
			loader: 'json'
		}]
	}
};
