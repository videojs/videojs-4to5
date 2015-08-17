var _ = require('lodash');
var grasp = require('grasp');
var util = require('util');

/**
 * Creates functions for performing multiple grasp-based replacements.
 *
 * @param  {String} quote A quote character to use for generated code.
 * @return {Function}
 */
module.exports = function (quote) {
  return _.flow.apply(_, [

    // Each array should be composed of elements matching:
    //   [0]: "s" or "e" representing "selector query" or "example query"
    //   [1]: search string
    //   [2]: replace string
    ['s', '#vjs', 'videojs'],
    ['s', 'member[obj=#videojs][prop=#util]', 'videojs'],
    ['e', 'videojs.JSON', 'JSON'],
    ['e', 'videojs.TOUCH_ENABLED', 'videojs.browser.TOUCH_ENABLED'],
    ['e', 'videojs.round($x, $y)', 'Number({{x}}.toFixed({{y}}))'],
    ['e', 'videojs.trim($x)', '{{x}}.trim()'],
    [
      'e',
      'videojs.$className.extend($proto)',
      util.format(
        'videojs.extends(videojs.getComponent(%s{{className}}%s), {{proto}})',
        quote,
        quote
      )
    ],
  ].map(function (r) {
    r[0] += 'query';
    return grasp.replace.apply(grasp, r);
  }));
}
