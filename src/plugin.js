(function(window, videojs) {
  var
    Component = videojs.getComponent('Component'),
    keys = Object.keys(videojs.browser),
    components = Object.keys(Component.components_),
    i, key, component,

    // Some classes changed between video.js 4 and 5. This back-fills those
    // to restore the old classes for styling or scripting purposes.
    backfillClasses = {
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

  window.vjs = videojs;

  videojs.JSON = JSON;
  videojs.USER_AGENT = window.navigator.userAgent;
  videojs.EventEmitter = videojs.EventTarget;

  videojs.util = {
    mergeOptions: function() {
      videojs.log.warn('videojs.util.mergeOptions is deprecated. ' +
        'Use videojs.mergeOptions instead.');
      return videojs.mergeOptions.apply(null, arguments);
    }
  };

  for (i = 0; i < keys.length; i++) {
    key = keys[i];
    videojs[key] = videojs.browser[key];
  }

  Component.oldExtend_ = Component.extend;
  Component.extend = function(proto) {
    if (proto.remainingTime && !proto.scrubbing) {
      proto.scrubbing = function() {};
    }
    return this.oldExtend_(proto);
  };

  for (i = 0; i < components.length; i++) {
    component = components[i];
    videojs[component] = videojs.getComponent(component);
    if (!videojs[component].extend) {
      videojs[component].oldExtend_ = Component.oldExtend_;
      videojs[component].extend = Component.extend;
    }
  }

  Object.keys(backfillClasses).forEach(function(className) {
    backfillClasses[className].forEach(function(name) {
      var Component = videojs.getComponent(name);
      var createEl = Component.prototype.createEl;

      Component.prototype.createEl = function() {
        var el = createEl.apply(this, arguments);
        this.addClass(className);
        return el;
      };
    });
  });

  videojs.round = function(x, y) {
    videojs.log.warn('videojs.round(x, y) is deprecated. ' +
      'Use Number(x.toFixed(y)) instead.');
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
