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
		Graph: window.Graph = __webpack_require__(1),
		Node: window.Node = __webpack_require__(3)
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/
	'use strict';

	var Emitter = __webpack_require__(2);
	var Node = __webpack_require__(3);
	var map = __webpack_require__(7);

	function Graph(graph) {
		var soul, self = this;
		if (graph && typeof graph === 'object') {
			this.put(graph);
		}
	}

	Graph.prototype = Emitter.prototype;
	var API = Graph.prototype;

	API.constructor = Graph;

	API.get = function (query, cb, opt) {
		var self, matching, soul = query['#'];
		matching = this[soul];
		self = this;
		if (matching) {
			cb(matching, query);
			return this;
		}
		this.emit('request', query, function (err, node) {
			if (!node) {
				return;
			}
			if (!(node instanceof Node)) {
				node = new Node(node);
			}
			var graph = {};
			graph[node.getSoul()] = node;
			self.update(graph);
			cb(err, node);
		}, opt || {});
		return this;
	};

	API.put = function (graph) {
		var self = this;
		map(graph, function (node, soul) {
			if (!node || typeof node !== 'object' || soul === '_events') {
				return;
			}
			if (!(node instanceof Node)) {
				node = new Node(node, soul);
			}
			var ID = node.getSoul();
			if (self[ID]) {
				return self[ID].merge(node);
			}
			self[ID] = node;
			// notify addition
			self.emit('update', node, soul);

			// Listen for changes
			node.on('change', function (value, field) {
				self.emit('update', node, soul);
			});
		});
		return this;
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
	var terms = __webpack_require__(5);
	var time = window.time = __webpack_require__(6);

	function Node(obj, ID) {
		var key, soul, now = time();
		this._ = {};
		this._['>'] = {};
		
		if (obj && typeof obj === 'object') {
			obj._ = obj._ || {};
			obj._[terms.HAM] = obj._[terms.HAM] || {};
			soul = obj._['#'];
		}
		this._[terms.soul] = ID || soul || UID();

		for (key in obj) {
			if (obj.hasOwnProperty(key) && key !== terms.meta) {
				this[key] = obj[key];
				this._[terms.HAM][key] = obj._[terms.HAM][key] || now;
			}
		}
	}

	Node.prototype = Emitter.prototype;

	var API = Node.prototype;

	API.constructor = Node;

	API.getSoul = function () {
		return this._[terms.soul];
	};

	API.state = function (prop) {
		return this._[terms.HAM][prop] || null;
	};

	API.each = function (cb) {
		var key;
		for (key in this) {
			if (this.hasOwnProperty(key) && key !== terms.meta && key !== '_events') {
				console.log(key);
				cb(this[key], key, this);
			}
		}
		return this;
	};

	API.update = function (field, value, state) {
		this[field] = value;
		this._[terms.HAM][field] = state;
		this.emit('change', value, field);
		return this;
	};

	API.merge = function (node) {
		var self = this;
		if (!(node instanceof Node)) {
			node = new Node(node);
		}
		node.each(function (value, name) {
			var incoming, present, successor;
			present = self.state(name);
			incoming = node.state(name);
			if (present > incoming) {
				return self.emit('historical', node, name);
			}
			if (present < incoming) {
				return self.update(name, value, incoming);
			}
			if (present === incoming) {
				if (String(self[name]) === String(value)) {
					return 'Equal state and value';
				}
				successor = (String(self[name]) > String(value)) ? self[name] : value;
				self.update(name, successor, incoming);
			}
		});
		return self;
	};

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

	module.exports = {
		"soul": "#",
		"HAM": ">",
		"meta": "_"
	};

/***/ },
/* 6 */
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

	module.exports = time;


/***/ },
/* 7 */
/***/ function(module, exports) {

	/*jslint node: true*/
	'use strict';

	module.exports = function (obj, cb) {
		var key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				cb(obj[key], key, obj);
			}
		}
	};


/***/ }
/******/ ]);