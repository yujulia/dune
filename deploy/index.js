(function (factory) {
	typeof define === 'function' && define.amd ? define('index', factory) :
	factory();
}((function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var rellax = createCommonjsModule(function (module) {
	// ------------------------------------------
	// Rellax.js
	// Buttery smooth parallax library
	// Copyright (c) 2016 Moe Amaya (@moeamaya)
	// MIT license
	//
	// Thanks to Paraxify.js and Jaime Cabllero
	// for parallax concepts
	// ------------------------------------------
	(function (root, factory) {
	  if ( module.exports) {
	    // Node. Does not work with strict CommonJS, but
	    // only CommonJS-like environments that support module.exports,
	    // like Node.
	    module.exports = factory();
	  } else {
	    // Browser globals (root is window)
	    root.Rellax = factory();
	  }
	})(typeof window !== "undefined" ? window : commonjsGlobal, function () {
	  var Rellax = function (el, options) {

	    var self = Object.create(Rellax.prototype);
	    var posY = 0;
	    var screenY = 0;
	    var posX = 0;
	    var screenX = 0;
	    var blocks = [];
	    var pause = true; // check what requestAnimationFrame to use, and if
	    // it's not supported, use the onscroll event

	    var loop = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (callback) {
	      return setTimeout(callback, 1000 / 60);
	    }; // store the id for later use


	    var loopId = null; // Test via a getter in the options object to see if the passive property is accessed

	    var supportsPassive = false;

	    try {
	      var opts = Object.defineProperty({}, 'passive', {
	        get: function () {
	          supportsPassive = true;
	        }
	      });
	      window.addEventListener("testPassive", null, opts);
	      window.removeEventListener("testPassive", null, opts);
	    } catch (e) {} // check what cancelAnimation method to use


	    var clearLoop = window.cancelAnimationFrame || window.mozCancelAnimationFrame || clearTimeout; // check which transform property to use

	    var transformProp = window.transformProp || function () {
	      var testEl = document.createElement('div');

	      if (testEl.style.transform === null) {
	        var vendors = ['Webkit', 'Moz', 'ms'];

	        for (var vendor in vendors) {
	          if (testEl.style[vendors[vendor] + 'Transform'] !== undefined) {
	            return vendors[vendor] + 'Transform';
	          }
	        }
	      }

	      return 'transform';
	    }(); // Default Settings


	    self.options = {
	      speed: -2,
	      verticalSpeed: null,
	      horizontalSpeed: null,
	      breakpoints: [576, 768, 1201],
	      center: false,
	      wrapper: null,
	      relativeToWrapper: false,
	      round: true,
	      vertical: true,
	      horizontal: false,
	      verticalScrollAxis: "y",
	      horizontalScrollAxis: "x",
	      callback: function () {}
	    }; // User defined options (might have more in the future)

	    if (options) {
	      Object.keys(options).forEach(function (key) {
	        self.options[key] = options[key];
	      });
	    }

	    function validateCustomBreakpoints() {
	      if (self.options.breakpoints.length === 3 && Array.isArray(self.options.breakpoints)) {
	        var isAscending = true;
	        var isNumerical = true;
	        var lastVal;
	        self.options.breakpoints.forEach(function (i) {
	          if (typeof i !== 'number') isNumerical = false;

	          if (lastVal !== null) {
	            if (i < lastVal) isAscending = false;
	          }

	          lastVal = i;
	        });
	        if (isAscending && isNumerical) return;
	      } // revert defaults if set incorrectly


	      self.options.breakpoints = [576, 768, 1201];
	      console.warn("Rellax: You must pass an array of 3 numbers in ascending order to the breakpoints option. Defaults reverted");
	    }

	    if (options && options.breakpoints) {
	      validateCustomBreakpoints();
	    } // By default, rellax class


	    if (!el) {
	      el = '.rellax';
	    } // check if el is a className or a node


	    var elements = typeof el === 'string' ? document.querySelectorAll(el) : [el]; // Now query selector

	    if (elements.length > 0) {
	      self.elems = elements;
	    } // The elements don't exist
	    else {
	      console.warn("Rellax: The elements you're trying to select don't exist.");
	      return;
	    } // Has a wrapper and it exists


	    if (self.options.wrapper) {
	      if (!self.options.wrapper.nodeType) {
	        var wrapper = document.querySelector(self.options.wrapper);

	        if (wrapper) {
	          self.options.wrapper = wrapper;
	        } else {
	          console.warn("Rellax: The wrapper you're trying to use doesn't exist.");
	          return;
	        }
	      }
	    } // set a placeholder for the current breakpoint


	    var currentBreakpoint; // helper to determine current breakpoint

	    var getCurrentBreakpoint = function (w) {
	      var bp = self.options.breakpoints;
	      if (w < bp[0]) return 'xs';
	      if (w >= bp[0] && w < bp[1]) return 'sm';
	      if (w >= bp[1] && w < bp[2]) return 'md';
	      return 'lg';
	    }; // Get and cache initial position of all elements


	    var cacheBlocks = function () {
	      for (var i = 0; i < self.elems.length; i++) {
	        var block = createBlock(self.elems[i]);
	        blocks.push(block);
	      }
	    }; // Let's kick this script off
	    // Build array for cached element values


	    var init = function () {
	      for (var i = 0; i < blocks.length; i++) {
	        self.elems[i].style.cssText = blocks[i].style;
	      }

	      blocks = [];
	      screenY = window.innerHeight;
	      screenX = window.innerWidth;
	      currentBreakpoint = getCurrentBreakpoint(screenX);
	      setPosition();
	      cacheBlocks();
	      animate(); // If paused, unpause and set listener for window resizing events

	      if (pause) {
	        window.addEventListener('resize', init);
	        pause = false; // Start the loop

	        update();
	      }
	    }; // We want to cache the parallax blocks'
	    // values: base, top, height, speed
	    // el: is dom object, return: el cache values


	    var createBlock = function (el) {
	      var dataPercentage = el.getAttribute('data-rellax-percentage');
	      var dataSpeed = el.getAttribute('data-rellax-speed');
	      var dataXsSpeed = el.getAttribute('data-rellax-xs-speed');
	      var dataMobileSpeed = el.getAttribute('data-rellax-mobile-speed');
	      var dataTabletSpeed = el.getAttribute('data-rellax-tablet-speed');
	      var dataDesktopSpeed = el.getAttribute('data-rellax-desktop-speed');
	      var dataVerticalSpeed = el.getAttribute('data-rellax-vertical-speed');
	      var dataHorizontalSpeed = el.getAttribute('data-rellax-horizontal-speed');
	      var dataVericalScrollAxis = el.getAttribute('data-rellax-vertical-scroll-axis');
	      var dataHorizontalScrollAxis = el.getAttribute('data-rellax-horizontal-scroll-axis');
	      var dataZindex = el.getAttribute('data-rellax-zindex') || 0;
	      var dataMin = el.getAttribute('data-rellax-min');
	      var dataMax = el.getAttribute('data-rellax-max');
	      var dataMinX = el.getAttribute('data-rellax-min-x');
	      var dataMaxX = el.getAttribute('data-rellax-max-x');
	      var dataMinY = el.getAttribute('data-rellax-min-y');
	      var dataMaxY = el.getAttribute('data-rellax-max-y');
	      var mapBreakpoints;
	      var breakpoints = true;

	      if (!dataXsSpeed && !dataMobileSpeed && !dataTabletSpeed && !dataDesktopSpeed) {
	        breakpoints = false;
	      } else {
	        mapBreakpoints = {
	          'xs': dataXsSpeed,
	          'sm': dataMobileSpeed,
	          'md': dataTabletSpeed,
	          'lg': dataDesktopSpeed
	        };
	      } // initializing at scrollY = 0 (top of browser), scrollX = 0 (left of browser)
	      // ensures elements are positioned based on HTML layout.
	      //
	      // If the element has the percentage attribute, the posY and posX needs to be
	      // the current scroll position's value, so that the elements are still positioned based on HTML layout


	      var wrapperPosY = self.options.wrapper ? self.options.wrapper.scrollTop : window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop; // If the option relativeToWrapper is true, use the wrappers offset to top, subtracted from the current page scroll.

	      if (self.options.relativeToWrapper) {
	        var scrollPosY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
	        wrapperPosY = scrollPosY - self.options.wrapper.offsetTop;
	      }

	      var posY = self.options.vertical ? dataPercentage || self.options.center ? wrapperPosY : 0 : 0;
	      var posX = self.options.horizontal ? dataPercentage || self.options.center ? self.options.wrapper ? self.options.wrapper.scrollLeft : window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft : 0 : 0;
	      var blockTop = posY + el.getBoundingClientRect().top;
	      var blockHeight = el.clientHeight || el.offsetHeight || el.scrollHeight;
	      var blockLeft = posX + el.getBoundingClientRect().left;
	      var blockWidth = el.clientWidth || el.offsetWidth || el.scrollWidth; // apparently parallax equation everyone uses

	      var percentageY = dataPercentage ? dataPercentage : (posY - blockTop + screenY) / (blockHeight + screenY);
	      var percentageX = dataPercentage ? dataPercentage : (posX - blockLeft + screenX) / (blockWidth + screenX);

	      if (self.options.center) {
	        percentageX = 0.5;
	        percentageY = 0.5;
	      } // Optional individual block speed as data attr, otherwise global speed


	      var speed = breakpoints && mapBreakpoints[currentBreakpoint] !== null ? Number(mapBreakpoints[currentBreakpoint]) : dataSpeed ? dataSpeed : self.options.speed;
	      var verticalSpeed = dataVerticalSpeed ? dataVerticalSpeed : self.options.verticalSpeed;
	      var horizontalSpeed = dataHorizontalSpeed ? dataHorizontalSpeed : self.options.horizontalSpeed; // Optional individual block movement axis direction as data attr, otherwise gobal movement direction

	      var verticalScrollAxis = dataVericalScrollAxis ? dataVericalScrollAxis : self.options.verticalScrollAxis;
	      var horizontalScrollAxis = dataHorizontalScrollAxis ? dataHorizontalScrollAxis : self.options.horizontalScrollAxis;
	      var bases = updatePosition(percentageX, percentageY, speed, verticalSpeed, horizontalSpeed); // ~~Store non-translate3d transforms~~
	      // Store inline styles and extract transforms

	      var style = el.style.cssText;
	      var transform = ''; // Check if there's an inline styled transform

	      var searchResult = /transform\s*:/i.exec(style);

	      if (searchResult) {
	        // Get the index of the transform
	        var index = searchResult.index; // Trim the style to the transform point and get the following semi-colon index

	        var trimmedStyle = style.slice(index);
	        var delimiter = trimmedStyle.indexOf(';'); // Remove "transform" string and save the attribute

	        if (delimiter) {
	          transform = " " + trimmedStyle.slice(11, delimiter).replace(/\s/g, '');
	        } else {
	          transform = " " + trimmedStyle.slice(11).replace(/\s/g, '');
	        }
	      }

	      return {
	        baseX: bases.x,
	        baseY: bases.y,
	        top: blockTop,
	        left: blockLeft,
	        height: blockHeight,
	        width: blockWidth,
	        speed: speed,
	        verticalSpeed: verticalSpeed,
	        horizontalSpeed: horizontalSpeed,
	        verticalScrollAxis: verticalScrollAxis,
	        horizontalScrollAxis: horizontalScrollAxis,
	        style: style,
	        transform: transform,
	        zindex: dataZindex,
	        min: dataMin,
	        max: dataMax,
	        minX: dataMinX,
	        maxX: dataMaxX,
	        minY: dataMinY,
	        maxY: dataMaxY
	      };
	    }; // set scroll position (posY, posX)
	    // side effect method is not ideal, but okay for now
	    // returns true if the scroll changed, false if nothing happened


	    var setPosition = function () {
	      var oldY = posY;
	      var oldX = posX;
	      posY = self.options.wrapper ? self.options.wrapper.scrollTop : (document.documentElement || document.body.parentNode || document.body).scrollTop || window.pageYOffset;
	      posX = self.options.wrapper ? self.options.wrapper.scrollLeft : (document.documentElement || document.body.parentNode || document.body).scrollLeft || window.pageXOffset; // If option relativeToWrapper is true, use relative wrapper value instead.

	      if (self.options.relativeToWrapper) {
	        var scrollPosY = (document.documentElement || document.body.parentNode || document.body).scrollTop || window.pageYOffset;
	        posY = scrollPosY - self.options.wrapper.offsetTop;
	      }

	      if (oldY != posY && self.options.vertical) {
	        // scroll changed, return true
	        return true;
	      }

	      if (oldX != posX && self.options.horizontal) {
	        // scroll changed, return true
	        return true;
	      } // scroll did not change


	      return false;
	    }; // Ahh a pure function, gets new transform value
	    // based on scrollPosition and speed
	    // Allow for decimal pixel values


	    var updatePosition = function (percentageX, percentageY, speed, verticalSpeed, horizontalSpeed) {
	      var result = {};
	      var valueX = (horizontalSpeed ? horizontalSpeed : speed) * (100 * (1 - percentageX));
	      var valueY = (verticalSpeed ? verticalSpeed : speed) * (100 * (1 - percentageY));
	      result.x = self.options.round ? Math.round(valueX) : Math.round(valueX * 100) / 100;
	      result.y = self.options.round ? Math.round(valueY) : Math.round(valueY * 100) / 100;
	      return result;
	    }; // Remove event listeners and loop again


	    var deferredUpdate = function () {
	      window.removeEventListener('resize', deferredUpdate);
	      window.removeEventListener('orientationchange', deferredUpdate);
	      (self.options.wrapper ? self.options.wrapper : window).removeEventListener('scroll', deferredUpdate);
	      (self.options.wrapper ? self.options.wrapper : document).removeEventListener('touchmove', deferredUpdate); // loop again

	      loopId = loop(update);
	    }; // Loop


	    var update = function () {
	      if (setPosition() && pause === false) {
	        animate(); // loop again

	        loopId = loop(update);
	      } else {
	        loopId = null; // Don't animate until we get a position updating event

	        window.addEventListener('resize', deferredUpdate);
	        window.addEventListener('orientationchange', deferredUpdate);
	        (self.options.wrapper ? self.options.wrapper : window).addEventListener('scroll', deferredUpdate, supportsPassive ? {
	          passive: true
	        } : false);
	        (self.options.wrapper ? self.options.wrapper : document).addEventListener('touchmove', deferredUpdate, supportsPassive ? {
	          passive: true
	        } : false);
	      }
	    }; // Transform3d on parallax element


	    var animate = function () {
	      var positions;

	      for (var i = 0; i < self.elems.length; i++) {
	        // Determine relevant movement directions
	        var verticalScrollAxis = blocks[i].verticalScrollAxis.toLowerCase();
	        var horizontalScrollAxis = blocks[i].horizontalScrollAxis.toLowerCase();
	        var verticalScrollX = verticalScrollAxis.indexOf("x") != -1 ? posY : 0;
	        var verticalScrollY = verticalScrollAxis.indexOf("y") != -1 ? posY : 0;
	        var horizontalScrollX = horizontalScrollAxis.indexOf("x") != -1 ? posX : 0;
	        var horizontalScrollY = horizontalScrollAxis.indexOf("y") != -1 ? posX : 0;
	        var percentageY = (verticalScrollY + horizontalScrollY - blocks[i].top + screenY) / (blocks[i].height + screenY);
	        var percentageX = (verticalScrollX + horizontalScrollX - blocks[i].left + screenX) / (blocks[i].width + screenX); // Subtracting initialize value, so element stays in same spot as HTML

	        positions = updatePosition(percentageX, percentageY, blocks[i].speed, blocks[i].verticalSpeed, blocks[i].horizontalSpeed);
	        var positionY = positions.y - blocks[i].baseY;
	        var positionX = positions.x - blocks[i].baseX; // The next two "if" blocks go like this:
	        // Check if a limit is defined (first "min", then "max");
	        // Check if we need to change the Y or the X
	        // (Currently working only if just one of the axes is enabled)
	        // Then, check if the new position is inside the allowed limit
	        // If so, use new position. If not, set position to limit.
	        // Check if a min limit is defined

	        if (blocks[i].min !== null) {
	          if (self.options.vertical && !self.options.horizontal) {
	            positionY = positionY <= blocks[i].min ? blocks[i].min : positionY;
	          }

	          if (self.options.horizontal && !self.options.vertical) {
	            positionX = positionX <= blocks[i].min ? blocks[i].min : positionX;
	          }
	        } // Check if directional min limits are defined


	        if (blocks[i].minY != null) {
	          positionY = positionY <= blocks[i].minY ? blocks[i].minY : positionY;
	        }

	        if (blocks[i].minX != null) {
	          positionX = positionX <= blocks[i].minX ? blocks[i].minX : positionX;
	        } // Check if a max limit is defined


	        if (blocks[i].max !== null) {
	          if (self.options.vertical && !self.options.horizontal) {
	            positionY = positionY >= blocks[i].max ? blocks[i].max : positionY;
	          }

	          if (self.options.horizontal && !self.options.vertical) {
	            positionX = positionX >= blocks[i].max ? blocks[i].max : positionX;
	          }
	        } // Check if directional max limits are defined


	        if (blocks[i].maxY != null) {
	          positionY = positionY >= blocks[i].maxY ? blocks[i].maxY : positionY;
	        }

	        if (blocks[i].maxX != null) {
	          positionX = positionX >= blocks[i].maxX ? blocks[i].maxX : positionX;
	        }

	        var zindex = blocks[i].zindex; // Move that element
	        // (Set the new translation and append initial inline transforms.)

	        var translate = 'translate3d(' + (self.options.horizontal ? positionX : '0') + 'px,' + (self.options.vertical ? positionY : '0') + 'px,' + zindex + 'px) ' + blocks[i].transform;
	        self.elems[i].style[transformProp] = translate;
	      }

	      self.options.callback(positions);
	    };

	    self.destroy = function () {
	      for (var i = 0; i < self.elems.length; i++) {
	        self.elems[i].style.cssText = blocks[i].style;
	      } // Remove resize event listener if not pause, and pause


	      if (!pause) {
	        window.removeEventListener('resize', init);
	        pause = true;
	      } // Clear the animation loop to prevent possible memory leak


	      clearLoop(loopId);
	      loopId = null;
	    }; // Init


	    init(); // Allow to recalculate the initial values whenever we want

	    self.refresh = init;
	    return self;
	  };

	  return Rellax;
	});
	});

	var prefetchImage = createCommonjsModule(function (module, exports) {
	(function webpackUniversalModuleDefinition(root, factory) {
	  module.exports = factory();
	})(commonjsGlobal, function () {
	  return (
	    /******/
	    function (modules) {
	      // webpackBootstrap

	      /******/
	      // The module cache

	      /******/
	      var installedModules = {};
	      /******/

	      /******/
	      // The require function

	      /******/

	      function __webpack_require__(moduleId) {
	        /******/

	        /******/
	        // Check if module is in cache

	        /******/
	        if (installedModules[moduleId]) {
	          /******/
	          return installedModules[moduleId].exports;
	          /******/
	        }
	        /******/
	        // Create a new module (and put it into the cache)

	        /******/


	        var module = installedModules[moduleId] = {
	          /******/
	          i: moduleId,

	          /******/
	          l: false,

	          /******/
	          exports: {}
	          /******/

	        };
	        /******/

	        /******/
	        // Execute the module function

	        /******/

	        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	        /******/

	        /******/
	        // Flag the module as loaded

	        /******/

	        module.l = true;
	        /******/

	        /******/
	        // Return the exports of the module

	        /******/

	        return module.exports;
	        /******/
	      }
	      /******/

	      /******/

	      /******/
	      // expose the modules object (__webpack_modules__)

	      /******/


	      __webpack_require__.m = modules;
	      /******/

	      /******/
	      // expose the module cache

	      /******/

	      __webpack_require__.c = installedModules;
	      /******/

	      /******/
	      // identity function for calling harmony imports with the correct context

	      /******/

	      __webpack_require__.i = function (value) {
	        return value;
	      };
	      /******/

	      /******/
	      // define getter function for harmony exports

	      /******/


	      __webpack_require__.d = function (exports, name, getter) {
	        /******/
	        if (!__webpack_require__.o(exports, name)) {
	          /******/
	          Object.defineProperty(exports, name, {
	            /******/
	            configurable: false,

	            /******/
	            enumerable: true,

	            /******/
	            get: getter
	            /******/

	          });
	          /******/
	        }
	        /******/

	      };
	      /******/

	      /******/
	      // getDefaultExport function for compatibility with non-harmony modules

	      /******/


	      __webpack_require__.n = function (module) {
	        /******/
	        var getter = module && module.__esModule ?
	        /******/
	        function getDefault() {
	          return module['default'];
	        } :
	        /******/
	        function getModuleExports() {
	          return module;
	        };
	        /******/

	        __webpack_require__.d(getter, 'a', getter);
	        /******/


	        return getter;
	        /******/
	      };
	      /******/

	      /******/
	      // Object.prototype.hasOwnProperty.call

	      /******/


	      __webpack_require__.o = function (object, property) {
	        return Object.prototype.hasOwnProperty.call(object, property);
	      };
	      /******/

	      /******/
	      // __webpack_public_path__

	      /******/


	      __webpack_require__.p = "";
	      /******/

	      /******/
	      // Load entry module and return exports

	      /******/

	      return __webpack_require__(__webpack_require__.s = 1);
	      /******/
	    }([
	      /* 0 */

	      /***/

	      /* 1 */

	      /***/

	      /******/
	    function (module, exports, __webpack_require__) {

	      var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;

	      var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	        return typeof obj;
	      } : function (obj) {
	        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	      };

	      (function (name, context, definition) {
	        if (typeof module !== 'undefined' && module.exports) module.exports = definition();else !(__WEBPACK_AMD_DEFINE_FACTORY__ = definition, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? __WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	      })('urljoin', undefined, function () {
	        function startsWith(str, searchString) {
	          return str.substr(0, searchString.length) === searchString;
	        }

	        function normalize(str, options) {
	          if (startsWith(str, 'file://')) {
	            // make sure file protocol has max three slashes
	            str = str.replace(/(\/{0,3})\/*/g, '$1');
	          } else {
	            // make sure protocol is followed by two slashes
	            str = str.replace(/:\//g, '://'); // remove consecutive slashes

	            str = str.replace(/([^:\s%3A])\/+/g, '$1/');
	          } // remove trailing slash before parameters or hash


	          str = str.replace(/\/(\?|&|#[^!])/g, '$1'); // replace ? in parameters with &

	          str = str.replace(/(\?.+)\?/g, '$1&');
	          return str;
	        }

	        return function () {
	          var input = arguments;

	          if (_typeof(arguments[0]) === 'object') {
	            // new syntax with array and options
	            input = arguments[0];
	          }

	          var joined = [].slice.call(input, 0).join('/');
	          return normalize(joined);
	        };
	      });
	      /***/

	    }, function (module, exports, __webpack_require__) {
	      /*!
	       * @license MIT
	       * Prefetch all images for your web app, especially for mobile/h5 promotion pages.
	       * https://github.com/JasonBoy/prefetch-image
	       */

	      Object.defineProperty(exports, "__esModule", {
	        value: true
	      });

	      var _urlJoin = __webpack_require__(0);

	      var _urlJoin2 = _interopRequireDefault(_urlJoin);

	      function _interopRequireDefault(obj) {
	        return obj && obj.__esModule ? obj : {
	          default: obj
	        };
	      }
	      /**
	       * Preload all images
	       * @param {Array|object} images, use object if your images are on different domains
	       * object:
	       * {
	       *   "http://domain1.com": ['/image1.png', '/image2.png'],
	       *   "http://domain2.com": ['/image3.png', '/image4.png'],
	       * }
	       * @param {object=} options
	       * @return {Promise}
	       */


	      function prefetchImages(images) {
	        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	        if (!images) {
	          console.error('[prefetch-image]: images not provided, pls pass images in Array or object!');
	          return Promise.reject({});
	        }

	        var isArray = Array.isArray(images);

	        if (isArray) {
	          return prefetchImageEachDomain(images, options);
	        }

	        var domainPromises = [];
	        var domainKeys = Object.keys(images);
	        var i = 0;

	        for (; i < domainKeys.length; i++) {
	          var domain = domainKeys[i];
	          domainPromises.push(prefetchImageEachDomain(joinUrls(domain, images[domain]), options, domain));
	        }

	        return Promise.all(domainPromises).then(function (results) {
	          options.debug && console.info('[prefetch-image]: Images loaded for all domains!');
	          return Promise.resolve(results);
	        }).catch(function (err) {
	          console.error('[prefetch-image]: ', err);
	          return Promise.reject(null);
	        });
	      }
	      /**
	       * Preload all images in the same domain
	       * @param {Array} images all image urls in the same domain
	       * @param {object=} options
	       * @param {string=} domain current domain
	       * @return {Promise}
	       */


	      function prefetchImageEachDomain(images, options, domain) {
	        var concurrency = options.concurrency || 6;
	        var imageLoadingInfo = {
	          start: 0,
	          end: 0,
	          //how many images for each iteration
	          //e.g. 15 images total, 6 images max each time, result: 6, 6, 3, iterateCount will be 3
	          concurrency: concurrency,
	          iterations: Math.ceil(images.length / concurrency),
	          imagesContainer: []
	        };
	        var bulkImagePromises = []; //length equals to "iterations"

	        var i = 0;

	        for (; i < imageLoadingInfo.iterations; i++) {
	          bulkImagePromises.push(loadImages(images, imageLoadingInfo));
	        } // console.log('bulkImagePromisesLength: %d', bulkImagePromises.length);


	        return Promise.all(bulkImagePromises).then(function () {
	          addAllImagesToDOM(imageLoadingInfo.imagesContainer);
	          options.debug && console.info('[prefetch-image]: Images loaded for domain [' + (domain || location.origin) + '], length [' + images.length + ']');
	          return Promise.resolve(imageLoadingInfo.imagesContainer);
	        }).catch(function (err) {
	          console.error('[prefetch-image]: ', err);
	          return Promise.reject(imageLoadingInfo.imagesContainer);
	        });
	      }
	      /**
	       * Load images on an array
	       * @param {Array} images
	       * @param {object} imageLoadingInfo info about this phase of loading
	       * @return {Promise}
	       */


	      function loadImages(images, imageLoadingInfo) {
	        var imagePromises = [];
	        var allImageLength = images.length;
	        var info = imageLoadingInfo;

	        if (info.start >= allImageLength) {
	          return Promise.resolve([]);
	        }

	        var start = info.start;
	        var end = start + info.concurrency; // console.log(`${start} - ${end}`);

	        var i = start;

	        for (; i < end; i++) {
	          var src = images[i];
	          if (!src) continue;
	          imagePromises.push(loadImage(src, info.imagesContainer));
	        }

	        info.start = end;
	        info.end = end + info.concurrency; // console.log('imagePromises: ', imagePromises.length);

	        return Promise.all(imagePromises);
	      }
	      /**
	       * Start loading every single image
	       * @param {string} src image src
	       * @param {array} container new Image instance will be added to this container
	       * @return {Promise}
	       */


	      function loadImage(src, container) {
	        // console.log('--> start loading img: %s', src);
	        return new Promise(function (resolve) {
	          var img = new Image();

	          img.onload = function () {
	            // console.log(`src: ${src}`);
	            resolve(src);
	          };

	          img.onerror = function () {
	            console.error('[prefetch-image]: "' + src + '" failed'); //still resolve even if some image failed loading

	            resolve(src);
	          };

	          img.src = src;
	          container.push(img);
	        });
	      }
	      /**
	       * Add all images loaded to dom to ensure cache
	       * @param {Array} imageElements Image objects in an array
	       */


	      function addAllImagesToDOM(imageElements) {
	        var body = document.querySelector('body');
	        var imagesWrapper = document.createElement('div');
	        imagesWrapper.setAttribute('class', 'prefetch-image-wrapper_' + Math.random());
	        imagesWrapper.style.width = 0;
	        imagesWrapper.style.height = 0;
	        imagesWrapper.style.overflow = 'hidden'; // imagesWrapper.style.opacity = 0;

	        imagesWrapper.style.display = 'none';
	        imageElements.forEach(function (img) {
	          imagesWrapper.appendChild(img);
	        });
	        body.appendChild(imagesWrapper);
	      }
	      /**
	       * Join domain for urls
	       * @param {string} domain
	       * @param {array} urls url paths
	       * @return {Array}
	       */


	      function joinUrls(domain, urls) {
	        var newUrls = [];
	        urls.forEach(function (url) {
	          newUrls.push((0, _urlJoin2.default)(domain, url));
	        });
	        return newUrls;
	      }

	      exports.default = prefetchImages;
	      /***/
	    }])
	  );
	});
	});

	var prefetchImages = unwrapExports(prefetchImage);

	const imagePath = "img/";
	let skySource = imagePath + "sky.png";
	let singles = ['baron-dark', 'baron', 'bubble-bottom', 'bubble-top', 'goldenpath', 'moon', 'title', 'title-black'].map(function (e) {
	  return imagePath + e + ".png";
	});
	let pairs = ['arrakis', 'dune', 'fedaykin', 'fireplace', 'gomjabbar', 'keep', 'muaddib', 'sardaukar', 'shaihulud', 'twomoons', 'water', 'witch'].flatMap(e => [imagePath + "fore-" + e + ".png", imagePath + "back-" + e + ".png"]);
	let rooms = Array.from({
	  length: 8
	}, (_, index) => imagePath + "room-" + index + ".png");
	let roomsMobile1 = [1, 2, 3, 4, 5, 6, 7].map(function (e) {
	  return imagePath + "room-" + e + "-0.png";
	});
	let roomsMobile2 = [1, 2, 3, 4, 7].map(function (e) {
	  return imagePath + "room-" + e + "-1.png";
	});
	let roomsMobile3 = ["fore-arrakis-0", "fore-arrakis-1", "back-arrakis-0", "back-arrakis-1"].map(function (e) {
	  return imagePath + e + ".png";
	}); // ---------------------------------- start parallax plugin

	function initializeParallax() {
	  var rellax$1 = new rellax('.rellax', {
	    center: true,
	    breakpoints: [576, 768, 1201]
	  });
	} // ---------------------------------- preload 


	function preload() {
	  var images = [].concat(singles, pairs, rooms, roomsMobile1, roomsMobile2, roomsMobile3);
	  prefetchImages(images).then(() => {
	    document.body.classList.add("loaded");
	    document.getElementById("preloader").remove();
	    document.getElementById("sky").remove();
	    initializeParallax();
	  });
	}

	function loadSky() {
	  prefetchImages([skySource]).then(() => {
	    document.body.classList.add("skyLoaded");
	    preload();
	  });
	} // ---------------------------------- on load


	function onLoad() {
	  loadSky();
	}

	document.addEventListener("DOMContentLoaded", onLoad);

})));
