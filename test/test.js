test('Functions are restored', function() {
  var constants = [
      'IS_IPHONE',
      'IS_IPAD',
      'IS_IPOD',
      'IS_IOS',
      'IOS_VERSION',
      'IS_ANDROID',
      'ANDROID_VERSION',
      'IS_OLD_ANDROID',
      'IS_NATIVE_ANDROID',
      'IS_FIREFOX',
      'IS_CHROME',
      'IS_IE8',
      'TOUCH_ENABLED',
      'BACKGROUND_SIZE_SUPPORTED'
    ],
    i, constant;

  for (i = 0; i < constants.length; i++) {
    constant = constants[i];
    ok(videojs.hasOwnProperty(constants[i]), 'videojs.' + constant + ' exists');
  }

  ok(vjs, 'vjs exists');
  ok(videojs.util.mergeOptions, 'videojs.util.mergeOptions exists');
  ok(videojs.JSON, 'videojs.JSON exists');
  ok(videojs.USER_AGENT, 'videojs.USER_AGENT exists');
  ok(videojs.EventEmitter, 'videojs.EventEmitter exists');

  ok(videojs.Button.extend, 'videojs.Button.extend exists');

  ok(videojs.round, 'videojs.round exists');
  ok(videojs.trim, 'videojs.trim exists');
});
