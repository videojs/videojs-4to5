(function(window, videojs) {
  var Component = videojs.getComponent('Component');
  var Player = videojs.getComponent('Player');

  // Cache new video.js 5.x methods that we will override for better
  // backward compatibility.
  var originals = {
    Component: {
      extend: Component.extend,
      options: Component.prototype.options
    },
    Player: {
      createEl: Player.prototype.createEl,
      dimension: Player.prototype.dimension
    }
  };

  // Some classes changed between video.js 4 and 5. This back-fills those
  // to restore the old classes for styling or scripting purposes.
  var backfillClasses = {
    'vjs-time-controls': [
      'TimeDivider',
      'RemainingTimeDisplay',
      'DurationDisplay',
      'CurrentTimeDisplay'
    ],
    'vjs-live-controls': [
      'LiveDisplay'
    ]
  };

  var isPct = function(v) {
    return v && typeof v === 'string' && v.indexOf('%') === (v.length - 1);
  };

  // The `children` property of `options_` used to be an object, but it is
  // now an array. This restores the old behavior of that property (while
  // retaining array behavior).
  Component.prototype.options = function() {
    var options = originals.Component.options.apply(this, arguments);
    if (Array.isArray(options.children)) {
      options.children.forEach(function(childName) {
        options.children[childName] = this.getChild(childName).options_;
      }, this);
    }
    return options;
  };

  // Replace the static `extend` method of components with one that works
  // with the assumptions of video.js 4.x, while retaining the new behavior
  // in `originals.Component.extend`.
  Component.extend = function(proto) {
    if (proto.remainingTime && !proto.scrubbing) {
      proto.scrubbing = function() {};
    }
    return originals.Component.extend.call(this, proto);
  };

  Object.keys(Component.components_).forEach(function(compName) {

    // Map each component onto `videojs` itself.
    videojs[compName] = videojs.getComponent(compName);

    // If the component does not have a static `extend` method, copy over
    // the `Component.extend` static method because it is not otherwise
    // inherited.
    if (!videojs[compName].extend) {
      videojs[compName].extend = Component.extend;
    }
  });

  // Backfill any changed HTML classes onto the relevant components.
  Object.keys(backfillClasses).forEach(function(className) {
    backfillClasses[className].forEach(function(compName) {
      var SpecificComponent = videojs.getComponent(compName);
      var createEl = SpecificComponent.prototype.createEl;

      SpecificComponent.prototype.createEl = function() {
        var el = createEl.apply(this, arguments);
        el.className += ' ' + className;
        return el;
      };
    });
  });

  // We want 4.x-style sizing; so, new methods that are related, but are
  // not used by 4.x-style resizing are rendered no-op.
  ['aspectRatio', 'fluid', 'updateStyleEl_'].forEach(function(methodName) {
    originals.Player[methodName] = Player.prototype[methodName];
    Player.prototype[methodName] = Function.prototype;
  });

  // We want to un-create the styleEl_ because for 4.x-style dimensions, we
  // don't need the style element confusing the issue.
  Player.prototype.createEl = function() {
    var el = originals.Player.createEl.apply(this, arguments);
    if (this.styleEl_) {
      this.styleEl_.parentNode.removeChild(this.styleEl_);
    }
    return el;
  };

  // Roll back player dimension behavior to 4.x compatibility.
  Player.prototype.dimension = function(dimension, num, skipListeners) {
    var val, pxIndex;

    if (num !== undefined) {

      // num !== num is a NaN check pulled from video.js 4.x.
      if (!this.el_ || num === null || num !== num) {
        num = 0;
      }

      // Check if using css width/height (% or px) and adjust
      if ((''+num).indexOf('%') !== -1 || (''+num).indexOf('px') !== -1) {
        this.el_.style[dimension] = num;
      } else if (num === 'auto') {
        this.el_.style[dimension] = '';
      } else {
        this.el_.style[dimension] = num+'px';
      }

      // skipListeners allows us to avoid triggering the resize event when setting both width and height
      if (!skipListeners) { this.trigger('resize'); }

      // Return component
      return this;
    }

    // Make sure element exists
    if (!this.el_) return 0;

    // Get dimension value from style
    val = this.el_.style[dimension];
    pxIndex = val.indexOf('px');

    if (pxIndex !== -1) {
      // Return the pixel value with no 'px'
      return parseInt(val.slice(0,pxIndex), 10);

    // No px so using % or no style was set, so falling back to offsetWidth/height
    // If component has display:none, offset will return 0
    // TODO: handle display:none and no dimension style using px
    } else {

      return parseInt(this.el_['offset'+(dimension.charAt(0).toUpperCase() + dimension.slice(1))], 10);
    }
  };

  // Map properties of `videojs.browser` onto `videojs`.
  Object.keys(videojs.browser).forEach(function(key) {
    videojs[key] = videojs.browser[key];
  });

  // Restore missing/previously deprecated objects and methods.
  window.vjs = videojs;
  videojs.JSON = JSON;
  videojs.USER_AGENT = window.navigator.userAgent;
  videojs.EventEmitter = videojs.EventTarget;

  videojs.util = {
    mergeOptions: function() {
      videojs.log.warn([
        'videojs.util.mergeOptions is deprecated.',
        'Use videojs.mergeOptions instead.'
      ].join(' '));
      return videojs.mergeOptions.apply(videojs, arguments);
    }
  };

  videojs.round = function(x, y) {
    videojs.log.warn([
      'videojs.round(x, y) is deprecated.',
      'Use Number(x.toFixed(y)) instead.'
    ].join(' '));
    return Number(x.toFixed(y));
  };

  videojs.trim = function(x) {
    videojs.log.warn('videojs.trim(x) is deprecated. Use x.trim() instead.');
    return x.trim();
  };

  videojs.obj = {
    isArray: Array.isArray
  };

})(window, window.videojs);
