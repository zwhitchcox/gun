/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('../');

function handle(scope) {
	var result = scope.result;
	if (scope.raw) {
		scope.raw(result.value, result.field, result.node);
	} else {
		Gun.log(result.field + ':', result.value);
	}
}

module.exports = Gun.prototype.val = function val(cb) {
	this._.chain.watch({
		cb: handle,
		raw: cb
	});
	return this;
};
