var _ = require('lodash');
var util = require('util');

var alwaysIgnored = [
  'bower_components',
  'node_modules',
];

/**
 * Creates a configuration/options object.
 *
 * @param  {Object} options An options object coming from the CLI.
 * @return {Object}
 */
module.exports = function (options) {
  var config;

  options = options || {};

  config = {
    dryRunPrefix: 'videojs-4to5.',
    ignored: new RegExp(util.format(
      '[\/\\\\]?(%s)[\/\\\\]',
      _.filter(_.union(alwaysIgnored, options['ignore-dir'])).join('|')
    )),
    quote: options['double-quotes'] ? '"' : '\'',
    type: 'run'
  };

  if (options['dry-run']) {
    config.type = 'dry-run';
  } else if (options.list) {
    config.type = 'list';
  }

  return config;
};
