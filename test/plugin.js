/* global describe, expect, it, videojs, vjs */
/* jshint expr:true */

describe('compatibility script', function() {

  it('maps browser properties onto videojs', function() {
    Object.keys(videojs.browser).forEach(function(key) {
      expect(videojs[key]).to.equal(videojs.browser[key]);
    });
  });

  it('maps components onto videojs and makes sure they can be extended', function() {
    Object.keys(videojs.getComponent('Component').components_).forEach(function(key) {
      expect(videojs[key]).to.equal(videojs.getComponent(key));
      expect(videojs[key].extend).to.be.a('function');
    });
  });

  it('restores missing/previously deprecated functions and objects', function() {
    expect(window.vjs).to.equal(videojs);
    expect(videojs.JSON).to.equal(window.JSON);
    expect(videojs.USER_AGENT).to.equal(window.navigator.userAgent);
    expect(videojs.EventEmitter).to.equal(videojs.EventTarget);
    expect(videojs.obj.isArray).to.equal(Array.isArray);

    expect(videojs.util.mergeOptions).to.be.a('function');
    expect(videojs.round).to.be.a('function');
    expect(videojs.trim).to.be.a('function');
  });

  describe('HTML class backfills', function() {
    var backfills = {
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

    var Player = videojs.getComponent('Player');
    var video = document.createElement('video');
    var player = new Player(video);

    Object.keys(backfills).forEach(function(className) {
      backfills[className].forEach(function(compName) {
        var Component = videojs.getComponent(compName);

        it('restores "' + className + '" on "' + compName + '"', function() {
          var component = new Component(player, {});

          expect(component.hasClass(className)).to.be.true;
        });
      });
    });
  });
});
