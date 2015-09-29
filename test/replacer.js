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
});
