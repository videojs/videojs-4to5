var _ = require('lodash');
var grasp = require('grasp');
var util = require('util');

/**
 * Replaces all "%s" tokens in a given string with the given quote character.
 *
 * @param  {String} quote
 * @param  {String} str
 * @return {String}
 */
var quotify = function (quote, str) {
  return util.format.apply(
    null,
    [str].concat(_.repeat(quote, str.match(/%s/g).length).split(''))
  );
};

/**
 * Creates functions for performing multiple grasp-based replacements.
 *
 * @param  {String} [quote="'"] A quote character to use for generated code.
 * @return {Function}
 */
module.exports = function (quote) {
  var q = _.partial(quotify, quote || '\'');

  return _.flow.apply(_, _.union(
    [

      // Each array should be composed of elements matching:
      //   [0]: "s" or "e" representing "selector query" or "example query"
      //   [1]: search string
      //   [2]: replace string
      ['s', 'ident[name=vjs]:not(member[prop=vjs])', 'videojs'],
      ['e', 'videojs.util.mergeOptions', 'videojs.mergeOptions'],
      ['e', 'videojs.JSON', 'JSON'],
      ['e', 'videojs.TOUCH_ENABLED', 'videojs.browser.TOUCH_ENABLED'],
      ['e', 'videojs.round($x, $y)', 'Number({{x}}.toFixed({{y}}))'],
      ['e', 'videojs.trim($x)', '{{x}}.trim()'],
      [
        'e',
        'videojs.$className.extend($proto)',
        q('videojs.extend(videojs.getComponent(%s{{className}}%s), {{proto}})')
      ],
      ['e', 'videojs.EventEmitter', 'videojs.EventTarget'],
    ],

    // Create rules for renamed player methods.
    //
    //    myPlayer.options() -> myPlayer.options_
    //
    _.map({
      options: 'options_',
      cancelFullScreen: 'cancelFullscreen',
      isFullScreen: 'isFullscreen',
      requestFullScreen: 'requestFullscreen',
      getTagSettings: 'constructor.getTagSettings',
      onDurationChange: 'handleTechDurationChange',
      onEnded: 'handleTechEnded',
      onError: 'handleTechError',
      onFirstPlay: 'handleTechFirstPlay',
      onFullscreenChange: 'handleTechFullscreenChange',
      onLoadStart: 'handleTechLoadStart',
      onLoadedAllData: 'handleLoadedAllData',
      onLoadedMetaData: 'handleTechLoadedMetaData',
      onLoadedData: 'handleTechLoadedData',
      onPause: 'handleTechPause',
      onPlay: 'handleTechPlay',
      onProgress: 'handleTechProgress',
      onSeeked: 'handleTechSeeked',
      onSeeking: 'handleTechSeeking',
      onTimeUpdate: 'handleTechTimeUpdate',
      onVolumeChange: 'handleTechVolumeChange',
      onWaiting: 'handleTechWaiting',
    }, function (v, k) {
      return ['e', '$obj.' + k, '{{obj}}.' + v];
    }),

    // Create rules for each pre-existing component class name to replace
    // them with the `getComponent` version. e.g.:
    //
    //    videojs.MuteToggle -> videojs.getComponent('MuteToggle')
    //
    _.map([
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
    ], function (className) {
      return [
        'e',
        'videojs.' + className,
        q('videojs.getComponent(%s' + className + '%s)')
      ];
    })
  ).map(function (r) {
    r[0] += 'query';
    return grasp.replace.apply(grasp, r);
  }));
}
