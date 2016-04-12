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
		Gun: __webpack_require__(1),
		Chain: __webpack_require__(7),
		Node: __webpack_require__(4),
		Graph: __webpack_require__(2),
		time: __webpack_require__(6)
	};

	Object.assign(window, module.exports);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Graph = __webpack_require__(2);
	var Node = __webpack_require__(4);
	var Emitter = __webpack_require__(3);
	var Chain = __webpack_require__(7);

	var emitter = new Emitter();

	function Gun(opt) {
		if (!(this instanceof Gun)) {
			return new Gun(opt);
		}
		this.back = this;
		this.__ = {
			opt: opt || {},
			graph: new Graph()
		};
		this._ = {};
		this._.chain = new Chain(this);
		emitter.emit('opt', this, this.__.opt);
	}
	Gun.events = emitter;

	Gun.Graph = Graph;
	Gun.Node = Node;

	module.exports = Gun;

	__webpack_require__(8);
	__webpack_require__(9);
	__webpack_require__(11);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true, forin: true*/
	'use strict';

	var Emitter = __webpack_require__(3);
	var Node = __webpack_require__(4);

	function flatten(obj, graph) {
		var key, tmp, node, soul;
		for (key in obj) {
			if (obj.hasOwnProperty(key) && key !== '_events' && key !== '_' && (tmp = obj[key]) instanceof Object) {
				delete obj[key];
				tmp = flatten(tmp, graph);
				node = new Node(tmp);
				soul = node.getSoul();
				graph[soul] = node;
				obj[key] = { '#': soul };
			}
		}
		return obj;
	}

	function Graph(obj) {
		this._events = {};

		if (obj instanceof Object) {
			flatten(obj, this);
			var node = new Node(obj);
			this[node.getSoul()] = node;
		}
	}

	var API = Graph.prototype = new Emitter();

	API.constructor = Graph;

	API.add = function (node, soul) {
		if (!(node instanceof Node)) {
			node = new Node(node, soul);
		}
		soul = node.getSoul();
		if (this[soul]) {
			this[soul].merge(node);
			return this;
		}
		this[soul] = node;
		this.emit('add', node, soul, this);
		return this;
	};

	API.merge = function (graph) {
		var soul;
		for (soul in graph) {
			if (graph.hasOwnProperty(soul) && soul !== '_events') {
				this.add(graph[soul], soul);
			}
		}
		return this;
	};

	API.each = function (cb) {
		var soul;
		for (soul in this) {
			if (this.hasOwnProperty(soul) && soul !== '_events') {
				cb(this[soul], soul, this);
			}
		}
		return this;
	};

	API.get = function (lex, cb, opt) {
		var graph, soul = lex['#'];
		graph = this;
		if (!this[soul] && Node.universe[soul]) {
			this[soul] = Node.universe[soul];
		}
		if (this[soul]) {
			cb(null, this[soul]);
			return this;
		}
		graph.emit('get', lex, function (err, val) {
			if (!err && val && !(val instanceof Node)) {
				val = new Node(val);
			}
			if (!err && val) {
				graph.add(val);
			}
			cb(err, val);
		}, opt || {});

		return this;
	};

	API.watch = function (cb) {
		function watch(node) {
			node.on('change', cb);
		}
		return this.each(watch).on('add', watch);
	};

	module.exports = Graph;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var has = Object.prototype.hasOwnProperty;

	//
	// We store our EE objects in a plain object whose properties are event names.
	// If `Object.create(null)` is not supported we prefix the event names with a
	// `~` to make sure that the built-in object properties are not overridden or
	// used as an attack vector.
	// We also assume that `Object.create(null)` is available when the event name
	// is an ES6 Symbol.
	//
	var prefix = typeof Object.create !== 'function' ? '~' : false;

	/**
	 * Representation of a single EventEmitter function.
	 *
	 * @param {Function} fn Event handler to be called.
	 * @param {Mixed} context Context for function execution.
	 * @param {Boolean} [once=false] Only emit once
	 * @api private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}

	/**
	 * Minimal EventEmitter interface that is molded against the Node.js
	 * EventEmitter interface.
	 *
	 * @constructor
	 * @api public
	 */
	function EventEmitter() { /* Nothing to set */ }

	/**
	 * Hold the assigned EventEmitters by name.
	 *
	 * @type {Object}
	 * @private
	 */
	EventEmitter.prototype._events = undefined;

	/**
	 * Return an array listing the events for which the emitter has registered
	 * listeners.
	 *
	 * @returns {Array}
	 * @api public
	 */
	EventEmitter.prototype.eventNames = function eventNames() {
	  var events = this._events
	    , names = []
	    , name;

	  if (!events) return names;

	  for (name in events) {
	    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
	  }

	  if (Object.getOwnPropertySymbols) {
	    return names.concat(Object.getOwnPropertySymbols(events));
	  }

	  return names;
	};

	/**
	 * Return a list of assigned event listeners.
	 *
	 * @param {String} event The events that should be listed.
	 * @param {Boolean} exists We only need to know if there are listeners.
	 * @returns {Array|Boolean}
	 * @api public
	 */
	EventEmitter.prototype.listeners = function listeners(event, exists) {
	  var evt = prefix ? prefix + event : event
	    , available = this._events && this._events[evt];

	  if (exists) return !!available;
	  if (!available) return [];
	  if (available.fn) return [available.fn];

	  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
	    ee[i] = available[i].fn;
	  }

	  return ee;
	};

	/**
	 * Emit an event to all registered event listeners.
	 *
	 * @param {String} event The name of the event.
	 * @returns {Boolean} Indication if we've emitted an event.
	 * @api public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events || !this._events[evt]) return false;

	  var listeners = this._events[evt]
	    , len = arguments.length
	    , args
	    , i;

	  if ('function' === typeof listeners.fn) {
	    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }

	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }

	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;

	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        default:
	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments[j];
	          }

	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }

	  return true;
	};

	/**
	 * Register a new EventListener for the given event.
	 *
	 * @param {String} event Name of the event.
	 * @param {Function} fn Callback function.
	 * @param {Mixed} [context=this] The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  var listener = new EE(fn, context || this)
	    , evt = prefix ? prefix + event : event;

	  if (!this._events) this._events = prefix ? {} : Object.create(null);
	  if (!this._events[evt]) this._events[evt] = listener;
	  else {
	    if (!this._events[evt].fn) this._events[evt].push(listener);
	    else this._events[evt] = [
	      this._events[evt], listener
	    ];
	  }

	  return this;
	};

	/**
	 * Add an EventListener that's only called once.
	 *
	 * @param {String} event Name of the event.
	 * @param {Function} fn Callback function.
	 * @param {Mixed} [context=this] The context of the function.
	 * @api public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  var listener = new EE(fn, context || this, true)
	    , evt = prefix ? prefix + event : event;

	  if (!this._events) this._events = prefix ? {} : Object.create(null);
	  if (!this._events[evt]) this._events[evt] = listener;
	  else {
	    if (!this._events[evt].fn) this._events[evt].push(listener);
	    else this._events[evt] = [
	      this._events[evt], listener
	    ];
	  }

	  return this;
	};

	/**
	 * Remove event listeners.
	 *
	 * @param {String} event The event we want to remove.
	 * @param {Function} fn The listener that we need to find.
	 * @param {Mixed} context Only remove listeners matching this context.
	 * @param {Boolean} once Only remove once listeners.
	 * @api public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events || !this._events[evt]) return this;

	  var listeners = this._events[evt]
	    , events = [];

	  if (fn) {
	    if (listeners.fn) {
	      if (
	           listeners.fn !== fn
	        || (once && !listeners.once)
	        || (context && listeners.context !== context)
	      ) {
	        events.push(listeners);
	      }
	    } else {
	      for (var i = 0, length = listeners.length; i < length; i++) {
	        if (
	             listeners[i].fn !== fn
	          || (once && !listeners[i].once)
	          || (context && listeners[i].context !== context)
	        ) {
	          events.push(listeners[i]);
	        }
	      }
	    }
	  }

	  //
	  // Reset the array, or remove it completely if we have no more listeners.
	  //
	  if (events.length) {
	    this._events[evt] = events.length === 1 ? events[0] : events;
	  } else {
	    delete this._events[evt];
	  }

	  return this;
	};

	/**
	 * Remove all listeners or only the listeners for the specified event.
	 *
	 * @param {String} event The event want to remove all listeners for.
	 * @api public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  if (!this._events) return this;

	  if (event) delete this._events[prefix ? prefix + event : event];
	  else this._events = prefix ? {} : Object.create(null);

	  return this;
	};

	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;

	//
	// This function doesn't apply anymore.
	//
	EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
	  return this;
	};

	//
	// Expose the prefix.
	//
	EventEmitter.prefixed = prefix;

	//
	// Expose the module.
	//
	if (true) {
	  module.exports = EventEmitter;
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var UID = __webpack_require__(5);
	var Emitter = __webpack_require__(3);
	var time = __webpack_require__(6);

	var universe = {};

	function Node(obj, soul) {
		var copy, node, key, from, to, now = time();
		soul = soul || (obj && obj._ && obj._['#']) || UID();
		if (universe[soul]) {
			node = universe[soul];
			return obj instanceof Object ? node.merge(obj) : node;
		}
		universe[soul] = this;
		this._events = {};
		this.raw = {
			_: {
				'#': soul,
				'>': to = {}
			}
		};
		copy = this.copy = {};
		if (obj instanceof Node) {
			obj = obj.raw;
		}

		if (obj instanceof Object) {
			from = (obj._ || {})['>'] || {};
			for (key in obj) {
				if (obj.hasOwnProperty(key) && key !== '_') {
					this.raw[key] = obj[key];
					to[key] = from[key] || now;
				}
			}
		}
		this.each(function (val, key) {
			copy[key] = val;
		});
		copy._ = {
			'#': soul
		};
	}

	Node.universe = universe;

	var API = Node.prototype = new Emitter();

	API.constructor = Node;

	API.getSoul = function () {
		return this.raw._['#'];
	};

	API.getRel = function () {
		return {
			'#': this.getSoul()
		};
	};

	API.state = function (prop) {
		return this.raw._['>'][prop] || -Infinity;
	};

	API.each = function (cb) {
		var key, raw = this.raw;
		for (key in raw) {
			if (raw.hasOwnProperty(key) && key !== '_') {
				cb(raw[key], key, this);
			}
		}
		return this;
	};

	API.update = function (field, value, state) {
		var type, raw = this.raw;
		type = raw.hasOwnProperty(field) ? 'update' : 'add';
		raw[field] = value;
		raw._['>'][field] = state;
		this.copy[field] = value;
		this.emit('change', value, field, this);
		this.emit(type, value, field, this);
		return this;
	};

	API.merge = function (node) {
		if (this === node || !(node instanceof Object)) {
			return this;
		}
		var state, now, self = this;
		now = time();

		if (!(node instanceof Node)) {
			node = {
				raw: node
			};
		}

		state = (node.raw._ && node.raw._['>']);

		this.each.call(node, function (value, name) {
			var incoming, present, fromStr, toStr;
			present = self.state(name);
			incoming = (state && state[name]) || now;

			if (present > incoming) {
				return self.emit('historical', node, name);
			}
			if (incoming > now) {
				setTimeout(function () {
					self.merge(node);
				}, incoming - now);
				return self.emit('deferred', node, name);
			}
			if (incoming > present) {
				return self.update(name, value, incoming);
			}
			if (incoming === present) {
				toStr = self[name] + '';
				fromStr = value + '';
				if (toStr === fromStr) {
					return 'Equal state and value';
				}
				self.update(name, (toStr > fromStr ? self[name] : value), incoming);
			}
		});

		return self;
	};

	API.toJSON = function () {
		return this.raw;
	};

	API.toString = function () {
		return JSON.stringify(this);
	};

	module.exports = Node;


/***/ },
/* 5 */
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
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Emitter = __webpack_require__(3);
	var Gun = __webpack_require__(1);

	function scan(gun, cb) {
		var length = 1;
		cb(gun);
		while (gun !== gun.back) {
			if (cb(gun = gun.back) === true) {
				break;
			}
			length += 1;
		}
		return length;
	}

	function Chain(gun) {
		var chain = this;

		this.graph = gun.__.graph;
		this.split = false;

		scan(gun, function (instance) {
			if (instance._.split) {
				return (chain.split = true);
			}
			return instance._.root;
		});

		this.resolved = (this.split) ? [] : null;
	}

	var API = Chain.prototype = new Emitter();

	API.listen = function (cb) {

		function handle(result) {
			cb(result.value, result.field, result.node);
		}

		if (this.split) {
			this.resolved.forEach(handle);
			this.on('add', handle);
		} else if (this.resolved) {
			handle(this.resolved);
		} else {
			this.once('add', handle);
		}

		return this;
	};

	API.add = function (value, field, node) {
		var result = {
			value: value,
			field: field,
			node: node
		};

		if (this.split) {
			this.resolved.push(result);
		} else {
			this.resolved = result;
		}
		this.emit('add', result);

		return this;
	};

	module.exports = Chain;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/
	'use strict';

	var Gun = __webpack_require__(1);

	Gun.production = false;
	Gun.log = function (str) {
		if (!Gun.production) {
			var history = Gun.log.history;
			history[str] = history[str] || [];
			history[str].push(new Date().getTime());
			console.log.apply(console, arguments);
		}
	};
	Gun.log.once = function (str) {
		if (!Gun.log.history[str]) {
			Gun.log(str);
		}
	};
	Gun.log.history = {};

	module.exports = Gun;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Gun = __webpack_require__(1);
	var Graph = __webpack_require__(2);
	var Node = __webpack_require__(4);
	var Emitter = __webpack_require__(3);
	var map = __webpack_require__(10);
	var Chain = __webpack_require__(7);
	var time = __webpack_require__(6);

	Gun.Node = Node;
	Gun.Graph = Graph;
	Gun.Chain = Chain;

	Gun.prototype = {
		constructor: Gun,

		chain: function (split) {
			var gun, last = this;
			gun = new this.constructor(last.__.opt);
			gun.back = last;
			gun.__ = last.__;
			gun._ = {};
			gun._.split = split || false;
			gun._.chain = new Chain(gun);
			return gun;
		},

		/* Done! */
		get: function (lex, cb) {
			var res, gun = this.chain();
			lex = lex instanceof Object ? lex : {
				'#': lex
			};

			gun.__.graph.get(lex, function (err, node) {
				res = cb && cb(err, node);
				if (!err && node) {
					gun._.chain.add(node.copy, node.getSoul(), node);
				}
			});

			return gun;
		},

		put: function (val) {
			var graph, gun = this;
			if (val instanceof Object) {
				graph = new Graph(val);
			}
			this._.chain.listen(function (v, f, node) {
				if (val instanceof Object) {
					node.merge(val);
					gun.__.graph.merge(graph);
				} else {
					node.update(f, val, time());
				}
			});
			return this;
		},

		path: function (str, cb) {
			var add, gun = this;
			str = (str instanceof Array) ? str : str.split('.');
			if (str.length > 1) {
				str.forEach(function (path) {
					gun = gun.path(path);
				});
				return gun;
			}
			str = str[0];
			gun = gun.chain();
			add = gun._.chain.add.bind(gun._.chain);

			this._.chain.listen(function (val, field, node) {

				var lex = (val && (val[str] instanceof Object) && val[str]);
				if (!lex) {
					return add(val[str], str, node);
				}
				gun.get(lex, cb).val(add);
			});

			return gun;
		},

		map: function (cb) {
			var add, gun, root = this;
			gun = this.chain(true);
			add = gun._.chain.add.bind(gun._.chain);

			this._.chain.listen(function (value, field, node) {
				if (value instanceof Node) {
					value.each(function (val, field) {
						root.path(field).val(add);
					}).on('add', function (val, field) {
						root.path(field).val(add);
					});
				}
			});

			if (cb instanceof Function) {
				gun._.chain.listen(cb);
			}
			return gun;
		},

		on: function (cb) {
			function handle(value, field, node) {
				cb(node, node.getSoul(), node);
			}
			this._.chain.listen(function (value, field, node) {
				handle(value, field, node);
				node.on('change', handle);
			});

			return this;
		},

		val: function (cb) {
			this._.chain.listen(cb || function (node, field) {
				Gun.log(field + ':', node);
			});

			return this;
		}
	};

	module.exports = Gun;


/***/ },
/* 10 */
/***/ function(module, exports) {

	/*jslint node: true*/
	'use strict';

	Object.keys = Object.keys || function (obj) {
		var key, arr = [];
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				arr.push(key);
			}
		}
		return arr;
	};



	function map(obj, cb) {
		var i, key, keys = Object.keys(obj);
		i = keys.length;
		while (i--) {
			key = keys[i];
			cb(obj[key], key, obj);
		}
	}

	module.exports = map;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/

	module.exports = {
		'localStorage': __webpack_require__(12),
		'socket.io': __webpack_require__(13)
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Gun = __webpack_require__(1);
	var Node = __webpack_require__(4);
	var read = {};

	Gun.events.on('opt', function (gun, opt) {
		var prefix, storage = opt.localStorage;
		prefix = (storage || {}).prefix || 'gun_';
		if (storage === false || typeof localStorage === 'undefined') {
			return;
		}

		gun.__.graph.watch(function (value, field, node) {
			var val, soul = node.getSoul();
			if (!read[soul]) {
				val = localStorage.getItem(prefix + soul);
				if (typeof val === 'string') {
					node = new Node(JSON.parse(val));
				}
			}
			read[soul] = true;
			localStorage.setItem(prefix + soul, node);
		});

		gun.__.graph.on('get', function (lex, cb, opt) {
			var node, name = prefix + lex['#'];
			if (opt.localStorage !== false) {
				node = localStorage.getItem(name);
				cb(null, node && JSON.parse(node));
			}
		});
	});


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	//var io = require('socket.io-client');
	var Gun = __webpack_require__(1);
	var map = __webpack_require__(10);

	var peers = {};

	Gun.events.on('create', function (gun, opt) {
		if (!opt.peers) {
			return;
		}
		map(opt.peers, function (config, url) {
			peers[url] = peers[url] || io.connect(url);
		});

		gun.__.graph.on('update', function (graph, cb, opt) {
			if (opt.peers === false) {
				return;
			}
			map(opt.peers, function (config, url) {
				peers[url].emit(graph, opt);
			});
		});
	});


/***/ }
/******/ ]);
