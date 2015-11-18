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

  // Backfill support for %-based dimensions in players. Includes copy/
  // pasted code from the `updateStyleEl_` method in video.js 5 because
  // that hard-codes px. :-/
  Player.prototype.dimension = function(dimension, value) {
    var aspectRatio, ratioParts, ratioMultiplier, width, height;

    var isPct = function (v) {
      return v && typeof v === 'string' && v.indexOf('%') !== 1;
    };

    // When the value is set as a %, bypass the usual handling.
    if (isPct(v)) {
      this[dimension + '_'] = value;

      // The aspect ratio is either used directly or to calculate width and height.
      if (this.aspectRatio_ !== undefined && this.aspectRatio_ !== 'auto') {
        // Use any aspectRatio that's been specifically set
        aspectRatio = this.aspectRatio_;
      } else if (this.videoWidth()) {
        // Otherwise try to get the aspect ratio from the video metadata
        aspectRatio = this.videoWidth() + ':' + this.videoHeight();
      } else {
        // Or use a default. The video element's is 2:1, but 16:9 is more common.
        aspectRatio = '16:9';
      }

      // Get the ratio as a decimal we can use to calculate dimensions
      let ratioParts = aspectRatio.split(':');
      let ratioMultiplier = ratioParts[1] / ratioParts[0];

      if (this.width_ !== undefined) {
        // Use any width that's been specifically set
        width = this.width_;
      } else if (this.height_ !== undefined) {
        // Or calulate the width from the aspect ratio if a height has been set
        width = this.height_ / ratioMultiplier;
      } else {
        // Or use the video's metadata, or use the video el's default of 300
        width = this.videoWidth() || 300;
      }

      if (this.height_ !== undefined) {
        // Use any height that's been specifically set
        height = this.height_;
      } else {
        // Otherwise calculate the height from the ratio and the width
        height = width  * ratioMultiplier;
      }

      let idClass = this.id()+'-dimensions';

      // Ensure the right class is still on the player for the style element
      this.addClass(idClass);

      stylesheet.setTextContent(this.styleEl_, [
        '.', idClass, '{',
          'width:', width, (isPct(width) ? ';' : 'px;'),
          'height:', height, (isPct(height) ? ';' : 'px;'),
        '}',
        '.', idClass, '.vjs-fluid {',
          'padding-top:', ratioMultiplier * 100, '%;',
        '}'
      ].join(''));

      return this;
    }

    // In all other cases, use the video.js 5.x handling.
    return originals.Player.dimension.call(this, dimension, value);
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
