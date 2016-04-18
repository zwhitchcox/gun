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
		Chain: __webpack_require__(8),
		Node: __webpack_require__(4),
		Graph: __webpack_require__(2),
		time: __webpack_require__(6),
		Lex: __webpack_require__(7),
		UID: __webpack_require__(5)
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
	var Chain = __webpack_require__(8);
	var Lex = __webpack_require__(7);
	var count = localStorage.getItem('project plea');

	var emitter = new Emitter();

	function noop() {}

	function Gun(opt, split) {
		if (!(this instanceof Gun)) {
			return new Gun(opt);
		}
		if (opt instanceof Gun) {
			this.back = opt;
			this.__ = opt.__;
			this._ = {};
			this._.split = split === undefined ? opt._.split : split;
		} else {
			this.back = this;
			this.__ = new Emitter();
			this.__.opt = opt || {};
			this.__.graph = new Graph();
			this._ = {
				split: false,
				chain: new Chain()
			};
			emitter.emit('opt', this, this.__.opt);
		}
	}
	Gun.events = emitter;

	Gun.get = function (scope) {
		if (!(scope.lex instanceof Lex)) {
			scope.lex = new Lex(scope.lex || {});
		}
		var node, soul = scope.lex['#'];
		node = scope.gun.__.graph[soul] || Node.universe[soul];
		if (node) {
			scope.result = node;
			scope.gun.__.emit('incoming', scope);
			scope.cb(null, scope);
			return true;
		}
		scope.opt = scope.opt || {};
		scope.gun.__.emit('get', scope);
		return false;
	};

	Gun.put = function (scope) {
		scope.gun.__.graph.merge(scope.graph);
		if (!(scope.cb instanceof Function)) {
			scope.cb = noop;
		}
		if (!scope.gun.__.opt.peers) {
			scope.cb(null, true);
		}
		return scope.gun.__.emit('put', scope);
	};

	Gun.Graph = Graph;
	Gun.Chain = Chain;
	Gun.Node = Node;
	Gun.Lex = Lex;

	module.exports = Gun;

	__webpack_require__(9);
	__webpack_require__(10);
	__webpack_require__(15);


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
			if (obj.hasOwnProperty(key) && key !== '_' && (tmp = obj[key]) instanceof Object) {
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
		this.nodes = {};

		if (obj instanceof Object) {
			flatten(obj, this.nodes);
			var node = new Node(obj);
			this.nodes[node.getSoul()] = node;
		}
	}

	var API = Graph.prototype = new Emitter();

	API.constructor = Graph;

	API.add = function (node, soul) {
		var nodes = this.nodes;
		if (!(node instanceof Node)) {
			node = new Node(node, soul);
		}
		soul = node.getSoul();
		if (nodes[soul]) {
			nodes[soul].merge(node);
			return this;
		}
		nodes[soul] = node;
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
		var soul, nodes = this.nodes;
		for (soul in nodes) {
			if (nodes.hasOwnProperty(soul)) {
				cb(nodes[soul], soul, nodes);
			}
		}
		return this;
	};

	API.toJSON = function () {
		return this.nodes;
	};

	API.toString = function () {
		return JSON.stringify(this);
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
	var Lex;

	var universe = {};

	function Node(obj, soul) {
		if (soul === undefined) {
			soul = (obj && obj._ && obj._['#']) || UID();
		}
		var node = universe[soul];
		if (node) {
			return obj instanceof Object ? node.merge(obj) : node;
		}
		universe[soul] = this;
		this.cp = null;
		this._events = {};
		this.raw = {
			_: {
				'#': soul,
				'>': {}
			}
		};

		if (obj instanceof Object) {
			this.merge(obj);
		}
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

	API.copy = function () {
		if (!this.cp) {
			var node = this;
			node.cp = {
				_: node.getRel()
			};
			node.each(function (val, field) {
				node.cp[field] = val;
			});
		}
		return this.cp;
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
		if (value instanceof Object) {
			value = new Lex(value);
		}
		raw[field] = value;
		raw._['>'][field] = state;
		this.cp = null;
		this.emit('change', value, field, this);
		this.emit(type, value, field, this);
		this.emit(field, value, field, this);
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
			var incoming, present, fromStr, val, toStr;
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
				val = self[name];
				toStr = val ? val.toString() : String(val);
				fromStr = value ? value.toString() : String(value);
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

	API.valueOf = function () {
		var node, num = -Infinity;
		node = this;
		this.each(function (val, field) {
			num = Math.max(num, node.state(field));
		});
		return num;
	};

	module.exports = Node;
	Lex = __webpack_require__(7);


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

	/*jslint node: true*/
	'use strict';

	var Node, API, str = JSON.stringify;
	var mapping = {
		soul: '#',
		field: '.',
		value: '=',
		state: '>',
		'#': '#',
		'.': '.',
		'=': '=',
		'>': '>'
	};

	function Lex(lex) {
		var type = typeof lex;
		if (type === 'undefined') {
			return this;
		}
		if (type === 'string') {
			return new Lex.Partial('#', lex);
		}
		if (lex instanceof Node) {
			return new Lex.Partial('#', lex.getSoul());
		}
		this['#'] = lex['#'] || lex.soul;
		this['.'] = lex['.'] || lex.field;
		this['='] = lex['='] || lex.value;
		this['>'] = lex['>'] || lex.state;

		this.ID = null;
	}

	Lex.prototype = {
		constructor: Lex,

		toString: function () {
			if (!this.ID) {
				var soul, field, value, state;
				soul = '#' + (this['#'] || '');
				field = '.' + (this['.'] || '');
				value = '=' + (this['='] || '');
				state = '>' + (this['>'] || '');
				this.ID = soul + field + value + state;
			}
			return this.ID;
		},

		toJSON: function () {
			return {
				'#': this['#'],
				'.': this['.'],
				'=': this['='],
				'>': this['>']
			};
		},

		set: function (field, value) {
			field = mapping[field];
			if (this[field] === value) {
				return this;
			}
			this.ID = null;
			this[field] = value instanceof Object ? str(value) : value;
			return this;
		}
	};

	Lex.Partial = function (type, value) {
		if (value instanceof Lex) {
			return value;
		}
		this[type] = value;
		this.ID = null;
		this.type = type;
	};

	API = Lex.Partial.prototype = new Lex();
	API.toString = function () {
		if (!this.ID) {
			var type, value = this[this.type];
			type = typeof value;
			this.ID = this.type + (type === 'string' ? value : str(value));
		}
		return this.ID;
	};

	module.exports = Lex;
	Node = __webpack_require__(4);


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Emitter = __webpack_require__(3);

	function Chain(scope) {

		if (!scope) {
			this.children = {};
			this.parent = this;
			this.root = true;
			this.value = this;
			return this;
		}

		this.ID = scope.ID;
		var parent, key, str = scope.ID.toString();
		parent = this.parent = scope.parent;

		parent.children[str] = this;

		parent.watch({
			cb: scope.cbs.resolve
		});
		this._events = {};
		this.value = scope.value;
		this.vars = scope.vars || {};
		this.cbs = scope.cbs;
		this.split = scope.split || false;
		this.children = {};

		this.resolved = (this.split) ? [] : null;
	}

	var API = Chain.prototype = new Emitter();

	API.has = function (ID) {
		return this.children[ID.toString()] || false;
	};

	API.each = function (cb) {
		var ID, children = this.children;
		for (ID in children) {
			if (children.hasOwnProperty(ID)) {
				cb(children[ID], ID, this);
			}
		}
		return this;
	};

	API.walk = function (cb) {
		var chain = this;
		do {
			if (cb(chain = chain.parent) === true) {
				break;
			}
		} while (!chain.root);
		return this;
	};

	API.send = function (data) {
		if (this.split) {
			this.resolved.push(data);
		} else {
			this.resolved = data;
		}
		this.emit('resolved', data);
		return this;
	};

	API.watch = function (scope) {
		var chain, res, cb = scope.cb;
		chain = this;
		function handle(res) {
			cb(chain, res);
		}

		if (!this.split && this.resolved) {
			cb(chain, this.resolved);
		} else if (this.split) {
			this.on('resolved', handle).resolved.forEach(handle);
		} else {
			this.once('resolved', handle);
		}

		return this;
	};

	API.resolve = function (arg) {
		this.cbs.resolve(this, arg);
		return this;
	};



	module.exports = Chain;


/***/ },
/* 9 */
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Gun = __webpack_require__(1);
	var Graph = __webpack_require__(2);
	var time = __webpack_require__(6);
	var Chain = __webpack_require__(8);

	function log(val, field) {
		Gun.log(field + ':', val);
	}

	Gun.prototype = {
		constructor: Gun,

		chain: function (scope) {
			var gun, chain, Gun, parent = this._.chain;
			chain = parent.has(scope.ID);
			Gun = this.constructor;

			if (!chain) {
				scope.parent = scope.parent || parent;
				gun = scope.value = new Gun(this, scope.split);
				chain = gun._.chain = new Chain(scope);
			}

			return chain.value;
		},

		put: function (val, cb) {
			var graph, gun = this;
			if (val instanceof Object) {
				graph = new Graph(val);
			}
			this._.chain.watch({
				cb: function (v, f, node) {
					var graph = new Graph().add(node);
					if (val instanceof Object) {
						node.merge(val);
					} else {
						node.update(f, val, time());
					}
					Gun.put({
						gun: gun,
						cb: cb,
						graph: graph
					});
				}
			});
			return this;
		},

		map: function (cb) {
			var root, gun = this.chain(true);
			root = this;

			function add(val, prop, node) {
				gun._.chain.set({
					value: val,
					field: prop,
					node: node
				});
			}

			function find(val, prop) {
				root.path(prop).val(add);
			}

			this._.chain.watch({
				cb: function handle(value, field, node) {
					node.each(find).on('add', find);
				}
			});

			if (cb instanceof Function) {
				gun._.chain.watch(cb);
			}
			return gun;
		},

		on: function (cb) {
			function handle(value, field, node) {
				cb(node, node.getSoul(), node);
			}
			this._.chain.watch({
				cb: function (value, field, node) {
					handle(value, field, node);
					node.on('change', handle);
				}
			});

			return this;
		}
	};

	module.exports = Gun;
	__webpack_require__(11);


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/
	module.exports = {
		val: __webpack_require__(12),
		get: __webpack_require__(13),
		path: __webpack_require__(14)
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Gun = __webpack_require__(1);

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


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Gun = __webpack_require__(1);
	var Lex = __webpack_require__(7);

	function add(chain, scope) {
		var node = scope.result;
		chain.set({
			value: node.copy(),
			field: node.getSoul(),
			node: node
		});
	}

	function resolve(chain, lex) {
		Gun.get({
			chain: chain,
			any: chain.vars.cb,
			cb: add
		});
	}

	module.exports = Gun.prototype.get = function get(lex, cb) {
		if (!(lex instanceof Lex)) {
			lex = new Lex(lex);
		}
		return this.chain({
			ID: lex,
			resolve: resolve,
			parent: this.__.root,

			vars: {
				cb: cb
			}
		});
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Gun = __webpack_require__(1);
	var Lex = __webpack_require__(7);

	function resolve(chain) {
		var node, field, value, gun;
		gun = chain.value;
		node = chain.data.node;
		field = chain.ID['.'];

		value = node.raw[field];
		if (value instanceof Lex) {
			gun.get(value).val(function (value, field, node) {
				chain.set({
					value: value,
					field: field,
					node: node
				});
			});
		} else {
			chain.set({
				value: value,
				field: field,
				node: node
			});
		}
	}

	module.exports = Gun.prototype.path = function (arr, cb) {
		var gun = this;

		// <validation>
		if (typeof arr === 'string') {
			arr = arr.split('.');
		}
		if (!(arr instanceof Array)) {
			arr = [arr];
		}
		if (arr.length > 1) {
			arr.forEach(function (path) {
				gun = gun.path(path);
			});
			return gun;
		}
		// </validation>

		return this.chain({
			name: new Lex.Partial('.', arr[0]),

			resolve: resolve,
			raw: {
				cb: cb,
				cached: true
			}
		});
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true*/

	module.exports = {
		'localStorage': __webpack_require__(16)
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/*jslint node: true, nomen: true*/
	'use strict';

	var Gun = __webpack_require__(1);
	var read = {};

	function put(scope) {
		var val, prefix;
		prefix = scope.gun.__.opt.prefix || scope.opt.prefix || 'gun/';
		scope.graph.each(function (node, soul) {
			if (!read[soul]) {
				val = localStorage.getItem(prefix + soul);
				if (val) {
					node.merge(val);
				}
				read[soul] = true;
			}
			localStorage.setItem(prefix + soul, node);
		});
	}

	function get(scope) {
		var val, prefix;
		prefix = scope.gun.__.opt.prefix || scope.opt.prefix || 'gun/';
		val = localStorage.getItem(scope.lex['#']);
		scope.cb(null, val);
	}

	if (typeof localStorage !== 'undefined') {
		Gun.events.on('opt', function (gun, opt) {
			if (opt.localStorage !== false) {
				gun.__.on('put', put);
				gun.__.on('get', get);
			}
		});
	}


/***/ }
/******/ ]);
