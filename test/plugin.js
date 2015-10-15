/* global describe, expect, it, videojs, vjs */
/* jshint expr:true */

describe('compatibility script', function() {
  it('Functions are restored', function() {
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
      i;

    for (i = 0; i < constants.length; i++) {
      expect(videojs).ownProperty(constants[i]);
    }

    expect(vjs).to.exist;
    expect(videojs.util.mergeOptions).to.exist;
    expect(videojs.JSON).to.exist;
    expect(videojs.USER_AGENT).to.exist;
    expect(videojs.EventEmitter).to.exist;

    expect(videojs.Button.extend).to.exist;

    expect(videojs.round).to.exist;
    expect(videojs.trim).to.exist;
  });
});
