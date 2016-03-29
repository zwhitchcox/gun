/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/
	module.exports = {
		Graph: __webpack_require__(1),
		Node: __webpack_require__(3),
		Gun: window.Gun = __webpack_require__(7)
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/
	'use strict';

	var Emitter = __webpack_require__(2);
	var NODE = __webpack_require__(3);
	var map = __webpack_require__(6);

	function Graph(graph) {
		var soul, self = this;
		this.setMaxListeners(Infinity);
		if (graph && typeof graph === 'object') {
			this.put(graph);
		}
	}

	Graph.prototype = Emitter.prototype;
	var API = Graph.prototype;

	API.constructor = Graph;

	API.get = function (query, target) {
		var matching, soul = query['#'];
		matching = NODE.universe[soul];
		if (matching) {
			(target || this).add(matching, soul);
		}
		return this;
	};

	API.add = function (node, soul) {
		if (!(node instanceof NODE)) {
			node = NODE(node, soul);
		}
		soul = node.getSoul();
		if (this[soul]) {
			return this[soul].merge(node);
		}
		this[soul] = node;
		this.emit('add', node, soul, this);
		return this;
	};

	API.put = function (graph) {
		var soul;
		for (soul in graph) {
			if (graph.hasOwnProperty(soul) && soul !== '_events' && soul !== '_maxListeners') {
				this.add(graph[soul], soul);
			}
		}
		return this;
	};

	API.every = function (cb) {
		var soul;
		for (soul in this) {
			if (this.hasOwnProperty(soul) && soul !== '_events' && soul !== '_maxListeners') {
				cb(this[soul], soul, this);
			}
		}
		return this.on('add', cb);
	};



	module.exports = Graph;


/***/ },
/* 2 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var UID = __webpack_require__(4);
	var Emitter = __webpack_require__(2);
	var time = __webpack_require__(5);

	var universe = {};

	function Node(obj, soul) {
		var node, key, from, to, now = time();
		soul = soul || (obj && obj._ && obj._['#']);
		if (!(this instanceof Node)) {
			if (universe[soul]) {
				node = universe[soul];
				if (obj && typeof obj === 'object') {
					node.merge(obj);
				}
				return node;
			}
			node = new Node(obj, soul);
			return (universe[node._['#']] = node);
		}
		this._ = {
			'>': {},
			'#': soul || UID()
		};

		if (obj && typeof obj === 'object') {
			obj._ = obj._ || {};
			obj._['#'] = this._['#'];
			obj._['>'] = obj._['>'] || {};
			from = obj._['>'];
			to = this._['>'];
			for (key in obj) {
				if (obj.hasOwnProperty(key) && key !== '_') {
					this[key] = obj[key];
					from[key] = to[key] = from[key] || now;
				}
			}
		}
	}

	Node.universe = universe;

	Node.prototype = Emitter.prototype;

	var API = Node.prototype;

	API.constructor = Node;

	API.getSoul = function () {
		return this._['#'];
	};

	API.state = function (prop) {
		return this._['>'][prop] || null;
	};

	API.each = function (cb) {
		var key;
		for (key in this) {
			if (this.hasOwnProperty(key) && key !== '_' && key !== '_events' && key !== '_maxListeners') {
				cb(this[key], key, this);
			}
		}
		return this;
	};

	API.update = function (field, value, state) {
		var added = !this.hasOwnProperty(field);
		this[field] = value;
		this._['>'][field] = state;
		this.emit('change', value, field, this);
		if (added) {
			this.emit('add', value, field, this);
		}
		return this;
	};

	API.merge = function (node) {
		if (!(node instanceof Node)) {
			node = new Node(node, null);
		}
		var now, self = this;
		now = time();

		node.each(function (value, name) {
			var incoming, present, successor;
			present = self.state(name);
			incoming = node.state(name);
			if (present > incoming) {
				return self.emit('historical', node, name);
			}
			if (incoming > now) {
				console.log('Present:', now, 'Incoming:', incoming);
				return self.emit('deferred', node, name);
			}
			if (incoming > present) {
				return self.update(name, value, incoming);
			}
			if (incoming === present) {
				if (String(self[name]) === String(value)) {
					return 'Equal state and value';
				}
				successor = (String(self[name]) > String(value)) ? self[name] : value;
				self.update(name, successor, incoming);
			}
		});
		return self;
	};

	API.primitive = function () {
		var obj = {};
		this.each(function (value, field) {
			obj[field] = value;
		});
		obj._ = this._;
		return obj;
	};

	API.toJSON = API.primitive;

	module.exports = Node;


/***/ },
/* 4 */
/***/ function(module, exports) {

	/*jslint node: true*/
	'use strict';
	var space = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';

	module.exports = function (length) {
		if (length < 0) {
			return '';
		}
		length = length || 24;
		var val = '';
		while (length) {
			val += space[Math.floor(Math.random() * space.length)];
			length -= 1;
		}
		return val;
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	/*jslint node: true*/
	'use strict';

	var last;

	function time() {
		var now = new Date().getTime();
		if (now <= last) {
			return (last += 0.001);
		}
		return (last = now);
	}

	module.exports = window.time = time;


/***/ },
/* 6 */
/***/ function(module, exports) {

	/*jslint node: true*/
	'use strict';

	function map(obj, cb) {
		var key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				cb(obj[key], key, obj);
			}
		}
	}

	module.exports = map;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Graph = __webpack_require__(1);
	var Node = __webpack_require__(3);
	var Emitter = __webpack_require__(2);
	var map = __webpack_require__(6);

	function Gun(opt) {
		if (!(this instanceof Gun)) {
			return new Gun(opt);
		}
		var graph = new Graph();
		this.__ = {
			opt: opt || {},
			graph: graph
		};
		this._ = {
			lex: {},
			graph: graph
		};
		Gun.events.emit('opt', this, opt);
		this.back = this;
	}

	Gun.events = new Emitter();

	Gun.Node = Node;
	Gun.Graph = Graph;

	Gun.each = function (gun, cb) {
		var length = 1;
		cb(gun);
		while (gun !== gun.back) {
			if (cb(gun = gun.back) === true) {
				break;
			}
			length += 1;
		}
		return length;
	};

	var API = Gun.prototype;

	API.chain = function (back) {
		var gun, last = this;
		gun = new this.constructor(this.__.opt);
		gun.__ = last.__;
		gun.back = back || last;
		return gun;
	};

	API.get = function (lex, cb) {
		var gun = this.chain();
		lex = typeof lex === 'object' ? lex : {
			'#': lex
		};
		this._.root = true;
		gun._.lex = lex;
		this.__.graph.get(lex, gun._.graph);
		return gun;
	};

	function log(node, field) {
		var args = [node];
		if (typeof field === 'string') {
			args.unshift(field);
		}
		console.log.apply(console, args);
	}

	API.val = function (cb) {

		cb = cb || log;
		var gun = this;
		gun._.graph.every(function (node, soul) {
			cb(node.primitive(), soul, gun);
		});

		return this;
	};

	API.on = function (cb) {
		var gun = this;
		gun._.graph.every(function (node, soul) {
			cb.call(gun, node.primitive(), soul, gun);
			node.on('change', function (val, field) {
				cb.call(gun, node.primitive(), field, gun);
			});
		});
		return this;
	};

	API.put = function (obj) {
		// Flatten
		var node = Gun.Node(obj, this._.lex['#']);
		this._.graph.add(node);
		return this;
	};

	API.map = function (cb) {
		var gun = this;

		function each(value, field, node) {
			cb.call(gun, value, field, node);
		}

		gun._.graph.every(function (node, soul) {
			node.each(each).on('change', each);
		});

		return this;
	};

	API.path = function (path) {
		var gun = this;
		if (typeof path === 'string') {
			path = path.split('.');
		}
		map(path, function (prop) {
			gun = gun.chain();
			gun._.lex['.'] = prop;
		});

		return this;
	};

	module.exports = Gun;


/***/ }
/******/ ]);
