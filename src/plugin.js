(function(window, videojs) {
  var Component = videojs.getComponent('Component');

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

  // Map properties of `videojs.browser` onto `videojs`.
  Object.keys(videojs.browser).forEach(function(key) {
    videojs[key] = videojs.browser[key];
  });

  // Replace the static `extend` method of components with one that works
  // with the assumptions of video.js 4.x, while retaining the new behavior
  // in `extend5_`.
  Component.extend5_ = Component.extend;
  Component.extend = function(proto) {
    if (proto.remainingTime && !proto.scrubbing) {
      proto.scrubbing = function() {};
    }
    return this.extend5_(proto);
  };

  Object.keys(Component.components_).forEach(function(compName) {

    // Map each component onto `videojs` itself.
    videojs[compName] = videojs.getComponent(compName);

    // If the component does not have a static `extend` method, copy over
    // the `Component.extend` static method handling.
    if (!videojs[compName].extend) {
      videojs[compName].extend5_ = Component.extend5_;
      videojs[compName].extend = Component.extend;
    }
  });

  // Backfill any changed HTML classes onto the relevant components.
  Object.keys(backfillClasses).forEach(function(className) {
    backfillClasses[className].forEach(function(compName) {
      var Component = videojs.getComponent(compName);
      var createEl = Component.prototype.createEl;

      Component.prototype.createEl = function() {
        var el = createEl.apply(this, arguments);
        el.className += ' ' + className;
        return el;
      };
    });
  });

  // The `children` property of `options_` used to be an object, but it is
  // now an array. This restores the old behavior of that property (while
  // retaining array behavior).
  Component.prototype.options5_ = Component.prototype.options;
  Component.prototype.options = function() {
    var options = Component.prototype.options5_.apply(this, arguments);
    if (Array.isArray(options.children)) {
      options.children.forEach(function(childName) {
        options.children[childName] = this.getChild(childName).options_;
      });
    }
    return options;
  };

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
