(function(window, videojs) {
  var version;

  try {
    version = Number(videojs.VERSION.match(/\d+/)[0]);
  } catch (x) {
    version = null;
  }

  // Do not shim older versions or globals that have already been shimmed.
  if (version < 5 || videojs.has4to5_) {
    return;
  }

  // Add the shim flag.
  videojs.has4to5_ = true;

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
      dimension: Player.prototype.dimension,
      loadTech_: Player.prototype.loadTech_,
      unloadTech_: Player.prototype.unloadTech_
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
    Player.prototype[methodName] = function(){};
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

  // Polyfill the tech function with properties for the current tech. This is
  // a mostly-complete implementation of the old tech behavior.
  Player.prototype.loadTech_ = function() {
    var player = this;

    originals.Player.loadTech_.apply(player, arguments);

    var tech = this.tech_;
    var ownKeys = Object.keys(tech);
    var proto = tech.constructor.prototype;

    // Get the prototype keys filtering out those keys that are own
    // properties of the tech.
    var protoKeys = Object.keys(proto).filter(function(key) {
      return !tech.hasOwnProperty(key);
    });

    this.polyfilledTechKeys_ = ownKeys.concat(protoKeys);

    // Map tech.prototype and own tech properties onto the tech function as
    // own properties. Methods are bound to the tech object.
    this.polyfilledTechKeys_.forEach(function(key) {
      var value = tech.hasOwnProperty(key) ? tech[key] : proto[key];

      if (typeof value === 'function') {
        player.tech[key] = videojs.bind(tech, value);
      } else {
        player.tech[key] = value;
      }
    });
  };

  // Remove the polyfill on the tech function
  Player.prototype.unloadTech_ = function() {
    var player = this;

    originals.Player.unloadTech_.apply(player, arguments);

    if (player.polyfilledTechKeys_) {
      player.polyfilledTechKeys_.forEach(function(key) {
        delete player.tech[key];
      });
      delete player.polyfilledTechKeys_;
    }
  };

})(window, window.videojs);
