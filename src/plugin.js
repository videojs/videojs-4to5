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

  // Retore the video.js 4.x SliderHandle component. This is NOT used in the
  // video.js 5.x Slider component, but is provided for users who were
  // previously sub-classing this component!
  videojs.registerComponent('SliderHandle', videojs.extend(Component, {
    defaultValue: 0,

    createEl: function(type, props) {
      props = props || {};

      // Add the slider element class to all sub classes
      props.className = (props.className || '') + ' vjs-slider-handle';

      if (!props.innerHTML) {
        props.innerHTML = '<span class="vjs-control-text">' + this.defaultValue + '</span>';
      }

      return Component.prototype.createEl.call(this, 'div', props);
    }
  }));

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
  Player.prototype.dimension = Component.prototype.dimension;

  // Map properties of `videojs.browser` onto `videojs`.
  Object.keys(videojs.browser).forEach(function(key) {
    videojs[key] = videojs.browser[key];
  });

  // Restore missing/previously deprecated objects and methods.
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
    isArray: Array.isArray,
    each: function(obj, fn, context) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(context || this, key, obj[key]);
        }
      }
    }
  };

  videojs.createEl = function(tagName, properties) {
    var el;

    tagName = tagName || 'div';
    properties = properties || {};

    el = document.createElement(tagName);

    videojs.obj.each(properties, function(propName, val) {
      // Not remembering why we were checking for dash
      // but using setAttribute means you have to use getAttribute

      // The check for dash checks for the aria-* attributes, like aria-label, aria-valuemin.
      // The additional check for "role" is because the default method for adding attributes does not
      // add the attribute "role". My guess is because it's not a valid attribute in some namespaces, although
      // browsers handle the attribute just fine. The W3C allows for aria-* attributes to be used in pre-HTML5 docs.
      // http://www.w3.org/TR/wai-aria-primer/#ariahtml. Using setAttribute gets around this problem.
      if (propName.indexOf('aria-') !== -1 || propName === 'role') {
        el.setAttribute(propName, val);
      } else {
        el[propName] = val;
      }
    });

    return el;
  };

  window.vjs = videojs;
})(window, window.videojs);
