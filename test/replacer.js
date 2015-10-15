/* global describe, before, it */

var _ = require('lodash');
var assert = require('assert');
var replacer = require('../src/lib/replacer');

function check(ctx, obj) {
  _.each(obj, function (v, k) {
    assert.strictEqual(ctx.replacer(k), v);
  });
}

describe('replacer', function () {

  before(function () {
    this.replacer = replacer();
  });

  it('sanity check', function () {
    assert.ok(_.isFunction(replacer), '`replacer` is a function');
    assert.ok(_.isFunction(this.replacer), '`replacer` returns a function');
    assert.equal(this.replacer('foo'), 'foo', 'generated replacers perform no replacement if not necessary');
  });

  it('`vjs` global removed', function () {
    check(this, {
      'vjs.foo = 123': 'videojs.foo = 123'
    });
  });

  it('`util` object removed', function () {
    check(this, {
      'videojs.util.mergeOptions({}, foo, bar)': 'videojs.mergeOptions({}, foo, bar)'
    });
  });

  it('`JSON` object removed', function () {
    check(this, {
      'videojs.JSON.stringify({a: 1})': 'JSON.stringify({a: 1})'
    });
  });

  it('`TOUCH_ENABLED` moved to `browser` object', function () {
    check(this, {
      'if (videojs.TOUCH_ENABLED) foo': 'if (videojs.browser.TOUCH_ENABLED) foo'
    });
  });

  it('`round()` method removed', function () {
    check(this, {
      'videojs.round(1.34567, 2)': 'Number(1.34567.toFixed(2))'
    });
  });

  it('`trim()` method removed', function () {
    check(this, {
      'videojs.trim(str)': 'str.trim()'
    });
  });

  it('component sub-classing moved to `videojs.extend()`', function () {
    check(this, {
      'videojs.Component.extend({a: 1})': 'videojs.extend(videojs.getComponent(\'Component\'), {a: 1})'
    });

    var double = replacer('"');
    assert.equal(
      double('videojs.Component.extend({a: 1})'),
      'videojs.extend(videojs.getComponent("Component"), {a: 1})',
      'also supports creating a replacer with optional custom quote characters'
    );
  });

  it('`EventEmitter` moved to `EventTarget`', function () {
    check(this, {
      'new videojs.EventEmitter()': 'new videojs.EventTarget()'
    });
  });

  it('fixes references to pre-existing components (e.g. `BigPlayButton` to `videojs.getComponent("BigPlayButton")`)', function () {
    check(this, _.zipObject([
      'BigPlayButton',
      'Button',
      'CaptionSettingsMenuItem',
      'CaptionsButton',
      'CaptionsTrack',
      'ChaptersButton',
      'ChaptersTrack',
      'ChaptersTrackMenuItem',
      'Component',
      'ControlBar',
      'CoreObject',
      'CurrentTimeDisplay',
      'DurationDisplay',
      'ErrorDisplay',
      'Flash',
      'FullscreenToggle',
      'Html5',
      'LiveDisplay',
      'LoadProgressBar',
      'LoadingSpinner',
      'MediaLoader',
      'MediaTechController',
      'Menu',
      'MenuButton',
      'MenuItem',
      'MuteToggle',
      'OffTextTrackMenuItem',
      'PlayProgressBar',
      'PlayToggle',
      'PlaybackRateMenuButton',
      'Player',
      'PosterImage',
      'ProgressControl',
      'RemainingTimeDisplay',
      'SeekBar',
      'SeekHandle',
      'Slider',
      'SubtitlesButton',
      'SubtitlesTrack',
      'Tech',
      'TextTrackButton',
      'TextTrackCueList',
      'TextTrackDisplay',
      'TextTrackList',
      'TextTrackMenuItem',
      'TextTrackSettings',
      'TimeDivider',
      'VolumeBar',
      'VolumeControl',
      'VolumeHandle',
      'VolumeLevel',
      'VolumeMenuButton'
    ].map(function (name) {
      return ['videojs.' + name, 'videojs.getComponent(\'' + name + '\')'];
    })));
  });

  describe('player methods', function () {

    it('`options()` replaced by `options_`', function () {
      check(this, {
        'player.options()': 'player.options_',

        // Make sure non-function-calls are not altered.
        'foo.options = {}': 'foo.options = {}'
      });
    });

    it('`getTagSettings` is now a static method', function () {
      check(this, {
        'player.getTagSettings()': 'player.constructor.getTagSettings()'
      });
    });

    it('`*FullScreen` replaced by `*Fullscreen`', function () {
      check(this, {
        'player.cancelFullScreen': 'player.cancelFullscreen',
        'player.isFullScreen': 'player.isFullscreen',
        'player.requestFullScreen': 'player.requestFullscreen',

        // Make sure they must be properties of an object!
        'cancelFullScreen': 'cancelFullScreen',
        'isFullScreen': 'isFullScreen',
        'requestFullScreen': 'requestFullScreen',
      });
    });

    it('`on*` methods replaced by `handle*` methods', function () {
      check(this, {
        'player.onDurationChange': 'player.handleTechDurationChange',
        'player.onEnded': 'player.handleTechEnded',
        'player.onError': 'player.handleTechError',
        'player.onFirstPlay': 'player.handleTechFirstPlay',
        'player.onFullscreenChange': 'player.handleTechFullscreenChange',
        'player.onLoadStart': 'player.handleTechLoadStart',
        'player.onLoadedAllData': 'player.handleLoadedAllData',
        'player.onLoadedMetaData': 'player.handleTechLoadedMetaData',
        'player.onLoadedData': 'player.handleTechLoadedData',
        'player.onPause': 'player.handleTechPause',
        'player.onPlay': 'player.handleTechPlay',
        'player.onProgress': 'player.handleTechProgress',
        'player.onSeeked': 'player.handleTechSeeked',
        'player.onSeeking': 'player.handleTechSeeking',
        'player.onTimeUpdate': 'player.handleTechTimeUpdate',
        'player.onVolumeChange': 'player.handleTechVolumeChange',
        'player.onWaiting': 'player.handleTechWaiting',

        // Make sure they must be properties of an object!
        'onDurationChange': 'onDurationChange',
        'onEnded': 'onEnded',
        'onError': 'onError',
        'onFirstPlay': 'onFirstPlay',
        'onFullscreenChange': 'onFullscreenChange',
        'onLoadStart': 'onLoadStart',
        'onLoadedAllData': 'onLoadedAllData',
        'onLoadedMetaData': 'onLoadedMetaData',
        'onLoadedData': 'onLoadedData',
        'onPause': 'onPause',
        'onPlay': 'onPlay',
        'onProgress': 'onProgress',
        'onSeeked': 'onSeeked',
        'onSeeking': 'onSeeking',
        'onTimeUpdate': 'onTimeUpdate',
        'onVolumeChange': 'onVolumeChange',
        'onWaiting': 'onWaiting',
      });
    });
  });
});
