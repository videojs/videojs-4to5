var _ = require('lodash');
var find = require('find');
var fs = require('fs');
var path = require('path');

var config = require('./lib/config');
var replacer = require('./lib/replacer');

var methods = {

  /**
   * Used for inspecting the type of run we're performing. If no argument is
   * given, returns the type. Otherwise, tests if the argument is equal to
   * the type.
   *
   * @param  {String} [t]
   * @return {String|Boolean}
   */
  type: function (t) {
    if (typeof t === 'undefined') {
      return this.options.type;
    }
    return t === this.options.type;
  },

  /**
   * Processes a JavaScript file depending on the type of run being performed.
   *
   * @param {String} file
   */
  process: function (file) {
    var prefix = this.options.dryRunPrefix;
    var target = this.type('dry-run') ?
      path.join(path.dirname(file), prefix + path.basename(file)) :
      file;

    if (this.type('list')) {
      console.log(file);
    } else {
      fs.readFile(file, function (err, data) {
        fs.writeFile(target, this.replacer(data.toString()));
      }.bind(this));
    }
  },

  /**
   * Executes the library's conversion logic.
   *
   */
  run: function () {
    this.targets.forEach(function (target) {
      fs.stat(target, function (err, stats) {
        if (err) {
          throw err;
        }
        if (stats.isFile() && this.validate(target)) {
          this.process(target);
        } else {
          find.file(/\.js$/, target, function (files) {
            files.filter(this.validate.bind(this))
              .forEach(this.process.bind(this));
          }.bind(this));
        }
      }.bind(this));
    }.bind(this));
  },

  /**
   * Validates that a file is able to be processed.
   *
   * @param  {String} file
   * @return {Boolean}
   */
  validate: function (file) {
    return !this.options.ignored.test(file) &&
      path.extname(file) === '.js' &&
      !_.startsWith(path.basename(file), this.options.dryRunPrefix);
  }
};

/**
 * The exported factory function creates objects which can update a set of
 * target file(s) for video.js 5.0 compatibility.
 *
 * @param  {Array} targets
 * @param  {Object} [options]
 * @return {Object}
 */
module.exports = function (targets, options) {
  options = config(options);

  return Object.create(methods, {
    options: {
      enumerable: true,
      value: options
    },
    replacer: {
      enumerable: true,
      value: replacer(options.quote)
    },
    targets: {
      enumerable: true,
      value: targets
    }
  });
}
