(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _voice = require('./voice');

var _voice2 = _interopRequireDefault(_voice);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ElectricKeyboard = (function () {
  function ElectricKeyboard(context) {
    _classCallCheck(this, ElectricKeyboard);

    this.notes = new Map();
    this.context = context;
    this.output = this.context.createGain();
  }

  _createClass(ElectricKeyboard, [{
    key: 'noteOn',
    value: function noteOn(when, data) {
      var voice = new _voice2.default(this.context, data);
      voice.start(when);
      voice.connect(this.output);
      this.notes.set(data.note.toUpperCase(), voice);
    }
  }, {
    key: 'noteOff',
    value: function noteOff(when, data) {
      var voice = this.notes.get(data.note.toUpperCase());
      voice.release(when);
      //this.notes.delete(data.note.toUpperCase());
    }
  }, {
    key: 'connect',
    value: function connect(target) {
      this.output.connect(target);
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.output.disconnect();
    }
  }]);

  return ElectricKeyboard;
})();

;

exports.default = ElectricKeyboard;

},{"./voice":7}],2:[function(require,module,exports){
'use strict';

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _friendlyMidi = require('friendly-midi');

var _friendlyMidi2 = _interopRequireDefault(_friendlyMidi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var width = $(".container").width();
var height = width / 4;

var keyboard = new QwertyHancock({
  id: 'keyboard',
  width: width,
  height: height,
  octaves: 2,
  startNote: 'c4',
  whiteNotesColour: 'white',
  blackNotesColour: 'black',
  hoverColour: '#f3e939'
});

var context = new AudioContext();

var eKeyboard = new _index2.default(context);

eKeyboard.connect(context.destination);

keyboard.keyDown = function (note, frequency) {
  console.log('keyDown', note, frequency);
  eKeyboard.noteOn(context.currentTime, {
    note: note,
    frequency: frequency,
    velocity: 100
  });
};
keyboard.keyUp = function (note, frequency) {
  console.log('keyUp', note, frequency);
  eKeyboard.noteOff(context.currentTime, {
    note: note,
    frequency: frequency
  });
};

var midi = new _friendlyMidi2.default();

midi.on('noteOn', function (data) {
  eKeyboard.noteOn(context.currentTime, {
    note: data.note,
    frequency: data.frequency,
    velocity: data.velocity
  });
});

midi.on('noteOff', function (data) {
  eKeyboard.noteOff(context.currentTime, {
    note: data.note,
    frequency: data.frequency
  });
});

midi.on('pitchBend', function (value) {});

midi.on('modulation', function (value) {
  console.log(data);
});

},{"./index":1,"friendly-midi":5}],3:[function(require,module,exports){
module.exports = ADSR

function ADSR(audioContext){
  var node = audioContext.createGain()

  var voltage = node._voltage = getVoltage(audioContext)
  var value = scale(voltage)
  var startValue = scale(voltage)
  var endValue = scale(voltage)

  node._startAmount = scale(startValue)
  node._endAmount = scale(endValue)

  node._multiplier = scale(value)
  node._multiplier.connect(node)
  node._startAmount.connect(node)
  node._endAmount.connect(node)

  node.value = value.gain
  node.startValue = startValue.gain
  node.endValue = endValue.gain

  node.startValue.value = 0
  node.endValue.value = 0

  Object.defineProperties(node, props)
  return node
}

var props = {

  attack: { value: 0, writable: true },
  decay: { value: 0, writable: true },
  sustain: { value: 1, writable: true },
  release: {value: 0, writable: true },

  getReleaseDuration: {
    value: function(){
      return this.release
    }
  },

  start: {
    value: function(at){
      var target = this._multiplier.gain
      var startAmount = this._startAmount.gain
      var endAmount = this._endAmount.gain

      this._voltage.start(at)
      this._decayFrom = this._decayFrom = at+this.attack
      this._startedAt = at

      var sustain = this.sustain

      target.cancelScheduledValues(at)
      startAmount.cancelScheduledValues(at)
      endAmount.cancelScheduledValues(at)

      endAmount.setValueAtTime(0, at)

      if (this.attack){
        target.setValueAtTime(0, at)
        target.linearRampToValueAtTime(1, at + this.attack)

        startAmount.setValueAtTime(1, at)
        startAmount.linearRampToValueAtTime(0, at + this.attack)
      } else {
        target.setValueAtTime(1, at)
        startAmount.setValueAtTime(0, at)
      }

      if (this.decay){
        target.setTargetAtTime(sustain, this._decayFrom, getTimeConstant(this.decay))
      }
    }
  },

  stop: {
    value: function(at, isTarget){
      if (isTarget){
        at = at - this.release
      }

      var endTime = at + this.release
      if (this.release){

        var target = this._multiplier.gain
        var startAmount = this._startAmount.gain
        var endAmount = this._endAmount.gain

        target.cancelScheduledValues(at)
        startAmount.cancelScheduledValues(at)
        endAmount.cancelScheduledValues(at)

        var expFalloff = getTimeConstant(this.release)

        // truncate attack (required as linearRamp is removed by cancelScheduledValues)
        if (this.attack && at < this._decayFrom){
          var valueAtTime = getValue(0, 1, this._startedAt, this._decayFrom, at)
          target.linearRampToValueAtTime(valueAtTime, at)
          startAmount.linearRampToValueAtTime(1-valueAtTime, at)
          startAmount.setTargetAtTime(0, at, expFalloff)
        }

        endAmount.setTargetAtTime(1, at, expFalloff)
        target.setTargetAtTime(0, at, expFalloff)
      }

      this._voltage.stop(endTime)
      return endTime
    }
  },

  onended: {
    get: function(){
      return this._voltage.onended
    },
    set: function(value){
      this._voltage.onended = value
    }
  }

}

var flat = new Float32Array([1,1])
function getVoltage(context){
  var voltage = context.createBufferSource()
  var buffer = context.createBuffer(1, 2, context.sampleRate)
  buffer.getChannelData(0).set(flat)
  voltage.buffer = buffer
  voltage.loop = true
  return voltage
}

function scale(node){
  var gain = node.context.createGain()
  node.connect(gain)
  return gain
}

function getTimeConstant(time){
  return Math.log(time+1)/Math.log(100)
}

function getValue(start, end, fromTime, toTime, at){
  var difference = end - start
  var time = toTime - fromTime
  var truncateTime = at - fromTime
  var phase = truncateTime / time
  return start + phase * difference
}
},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _midiutils = require('midiutils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FriendlyMIDI = (function (_EventEmitter) {
  _inherits(FriendlyMIDI, _EventEmitter);

  function FriendlyMIDI() {
    _classCallCheck(this, FriendlyMIDI);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FriendlyMIDI).call(this));

    navigator.requestMIDIAccess().then(function (access) {
      _this.access = access;
      access.onstatechange = _this.handleAccessStateChange.bind(_this);
      _this.applyListenersToMIDIInputs();
      _this.emit('ready');
    }, function (error) {
      _this.emit('error', error);
    });
    return _this;
  }

  _createClass(FriendlyMIDI, [{
    key: 'midiMessageHandler',
    value: function midiMessageHandler(event) {
      this.emit(event.type, event.data, event);
      var data = event.data;
      var status = data[0];

      if (this.statusIsNoteOn(status)) {
        this.emit('noteOn', {
          note: (0, _midiutils.noteNumberToName)(data[1]),
          frequency: (0, _midiutils.noteNumberToFrequency)(data[1]),
          noteNumber: data[1],
          velocity: data[2]
        });
      } else if (this.statusIsNoteOff(status)) {
        this.emit('noteOff', {
          note: (0, _midiutils.noteNumberToName)(data[1]),
          frequency: (0, _midiutils.noteNumberToFrequency)(data[1]),
          noteNumber: data[1],
          velocity: data[2]
        });
      } else if (this.statusIsPitchBend(status)) {
        this.emit('pitchBend', data[2]);
      } else if (this.statusIsControlChange(status)) {
        if (this.controlChangeIsModulation(data[1])) {
          this.emit('modulation', data[2]);
        }
      }
    }
  }, {
    key: 'statusIsNoteOn',
    value: function statusIsNoteOn(status) {
      return status >= 144 && status <= 159;
    }
  }, {
    key: 'statusIsNoteOff',
    value: function statusIsNoteOff(status) {
      return status >= 128 && status <= 143;
    }
  }, {
    key: 'statusIsPitchBend',
    value: function statusIsPitchBend(status) {
      return status >= 224 && status <= 239;
    }
  }, {
    key: 'statusIsControlChange',
    value: function statusIsControlChange(status) {
      return status >= 176 && status <= 191;
    }
  }, {
    key: 'controlChangeIsModulation',
    value: function controlChangeIsModulation(value) {
      return value === 1;
    }
  }, {
    key: 'applyListenersToMIDIInputs',
    value: function applyListenersToMIDIInputs() {
      this.access.inputs.forEach(this.applyListenerToMIDIInput.bind(this));
    }
  }, {
    key: 'applyListenerToMIDIInput',
    value: function applyListenerToMIDIInput(input) {
      input.onmidimessage = this.midiMessageHandler.bind(this);
    }
  }, {
    key: 'handleAccessStateChange',
    value: function handleAccessStateChange(e) {
      this.emit('statechange', e);
      this.applyListenersToMIDIInputs(this.access);
    }
  }]);

  return FriendlyMIDI;
})(_events.EventEmitter);

exports.default = FriendlyMIDI;
},{"events":4,"midiutils":6}],6:[function(require,module,exports){
(function() {

	var noteMap = {};
	var noteNumberMap = [];
	var notes = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];


	for(var i = 0; i < 127; i++) {

		var index = i,
			key = notes[index % 12],
			octave = ((index / 12) | 0) - 1; // MIDI scale starts at octave = -1

		if(key.length === 1) {
			key = key + '-';
		}

		key += octave;

		noteMap[key] = i;
		noteNumberMap[i] = key;

	}


	function getBaseLog(value, base) {
		return Math.log(value) / Math.log(base);
	}


	var MIDIUtils = {

		noteNameToNoteNumber: function(name) {
			return noteMap[name];
		},

		noteNumberToFrequency: function(note) {
			return 440.0 * Math.pow(2, (note - 69.0) / 12.0);
		},

		noteNumberToName: function(note) {
			return noteNumberMap[note];
		},

		frequencyToNoteNumber: function(f) {
			return Math.round(12.0 * getBaseLog(f / 440.0, 2) + 69);
		}

	};


	// Make it compatible for require.js/AMD loader(s)
	if(typeof define === 'function' && define.amd) {
		define(function() { return MIDIUtils; });
	} else if(typeof module !== 'undefined' && module.exports) {
		// And for npm/node.js
		module.exports = MIDIUtils;
	} else {
		this.MIDIUtils = MIDIUtils;
	}


}).call(this);


},{}],7:[function(require,module,exports){
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _adsr = require('adsr');

var _adsr2 = _interopRequireDefault(_adsr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var smallNumber = 0.00001;

var Voice = (function () {
  function Voice(context, data) {
    _classCallCheck(this, Voice);

    this.context = context;
    this.output = this.context.createGain();

    var op1 = context.createOscillator();
    var op2 = context.createOscillator();
    var op2Gain = context.createGain();
    var env1 = this.env1 = context.createGain();
    var env2 = this.env2 = context.createGain();

    op1.frequency.value = 1 * data.frequency;
    op1.detune.value = 3;
    op2.frequency.value = 14 * data.frequency;
    op2Gain.gain.value = 1 * op1.frequency.value;

    this.env1.gain.value = smallNumber;
    this.env2.gain.value = smallNumber;

    op2.connect(op2Gain);
    op2Gain.connect(env2);
    env2.connect(op1.frequency);
    op1.connect(env1);
    env1.connect(this.output);

    var op3 = context.createOscillator();
    var op4 = context.createOscillator();
    var op4Gain = context.createGain();
    var env3 = this.env3 = context.createGain();
    var env4 = this.env4 = context.createGain();

    this.env3.gain.value = smallNumber;
    this.env4.gain.value = smallNumber;

    op3.frequency.value = 1 * data.frequency;
    op4.frequency.value = 1 * data.frequency;
    op4Gain.gain.value = 1 * op3.frequency.value;

    op4.connect(op4Gain);
    op4Gain.connect(env4);
    env4.connect(op3.frequency);
    op3.connect(env3);
    env3.connect(this.output);

    var op5 = context.createOscillator();
    var op6 = context.createOscillator();
    var op6Gain = context.createGain();
    var env5 = this.env5 = context.createGain();
    var env6 = this.env6 = context.createGain();

    this.env5.gain.value = smallNumber;
    this.env6.gain.value = smallNumber;

    op5.frequency.value = 1 * data.frequency;
    op5.detune.value = -7;
    op6.frequency.value = 1 * data.frequency;
    op6.detune.value = 7;
    op6Gain.gain.value = 4 * op5.frequency.value;

    op6.connect(op6Gain);
    op6Gain.connect(env6);
    env6.connect(op5.frequency);
    op5.connect(env5);
    env5.connect(this.output);

    this.ops = [op1, op2, op3, op4, op5, op6];

    this.output.gain.value = data.velocity / 100 * 1 / 6;
  }

  _createClass(Voice, [{
    key: 'start',
    value: function start(when) {

      this.env1.gain.exponentialRampToValueAtTime(1, when + 0.01);
      this.env1.gain.exponentialRampToValueAtTime(smallNumber, when + 1);

      this.env2.gain.exponentialRampToValueAtTime(1, when + 0.01);
      this.env2.gain.exponentialRampToValueAtTime(smallNumber, when + 0.5);

      this.env3.gain.exponentialRampToValueAtTime(1, when + 0.01);
      this.env3.gain.exponentialRampToValueAtTime(smallNumber, when + 30);

      this.env4.gain.exponentialRampToValueAtTime(1, when + 0.01);
      this.env4.gain.exponentialRampToValueAtTime(smallNumber, when + 30);

      this.env5.gain.exponentialRampToValueAtTime(1, when + 0.01);
      this.env5.gain.exponentialRampToValueAtTime(smallNumber, when + 30);

      this.env6.gain.exponentialRampToValueAtTime(1, when + 0.01);
      this.env6.gain.exponentialRampToValueAtTime(smallNumber, when + 30);

      this.ops.forEach(function (op) {
        op.start(when);
      });
    }
  }, {
    key: 'release',
    value: function release(when) {
      var _ops = _slicedToArray(this.ops, 6);

      var op1 = _ops[0];
      var op2 = _ops[1];
      var op3 = _ops[2];
      var op4 = _ops[3];
      var op5 = _ops[4];
      var op6 = _ops[5];

      this.env1.gain.cancelScheduledValues(when);
      this.env1.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

      this.env2.gain.cancelScheduledValues(when);
      this.env2.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

      this.env3.gain.cancelScheduledValues(when);
      this.env3.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

      this.env4.gain.cancelScheduledValues(when);
      this.env4.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

      this.env5.gain.cancelScheduledValues(when + 0.1);
      this.env5.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

      this.env6.gain.cancelScheduledValues(when);
      this.env6.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

      op1.stop(when + 0.6);
      op2.stop(when + 0.6);
      op3.stop(when + 0.6);
      op4.stop(when + 0.6);
      op5.stop(when + 0.6);
      op6.stop(when + 0.6);
    }
  }, {
    key: 'connect',
    value: function connect(target) {
      this.output.connect(target);
    }
  }, {
    key: 'disconnect',
    value: function disconnect(target) {
      this.output.disconnect(target);
    }
  }]);

  return Voice;
})();

exports.default = Voice;

},{"adsr":3}]},{},[2]);
