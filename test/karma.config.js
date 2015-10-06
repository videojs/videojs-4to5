module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],

    reporters: ['mocha'],

    singleRun: true,

    loggers: [],

    browsers: !process.env.TRAVIS ? [
      'Chrome',
      'Firefox'
    ] : process.env.BROWSER_STACK_USERNAME ? [
      'chrome_bs',
      'firefox_bs',
      'safari_bs',
      'ie11_bs',
      'ie10_bs',
      'ie9_bs',
      'ie8_bs',
      'android_bs',
      'ios_bs'
    ] : [
      'Firefox'
    ],

    files: [
      '../node_modules/video.js/dist/ie8/videojs-ie8.min.js',
      '../node_modules/video.js/dist/video.js',
      '../src/plugin.js',
      'plugin.js'
    ],

    captureTimeout: 300000,
    browserNoActivityTimeout: 300000,

    browserStack: {
      name: process.env.TRAVIS_BUILD_NUMBER + process.env.TRAVIS_BRANCH,
      pollingTimeout: 30000
    },

    customLaunchers: {
      chrome_bs: {
        base: 'BrowserStack',
        browser: 'chrome',
        os: 'Windows',
        os_version: '8.1'
      },

      firefox_bs: {
        base: 'BrowserStack',
        browser: 'firefox',
        os: 'Windows',
        os_version: '8.1'
      },

      safari_bs: {
        base: 'BrowserStack',
        browser: 'safari',
        os: 'OS X',
        os_version: 'Yosemite'
      },

      ie11_bs: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11',
        os: 'Windows',
        os_version: '8.1'
      },

      ie10_bs: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '10',
        os: 'Windows',
        os_version: '7'
      },

      ie9_bs: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '9',
        os: 'Windows',
        os_version: '7'
      },

      ie8_bs: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '8',
        os: 'Windows',
        os_version: '7'
      },

      android_bs: {
        base: 'BrowserStack',
        os: 'android',
        os_version: '4.4'
      },

      ios_bs: {
        base: 'BrowserStack',
        os: 'ios',
        os_version: '8.3'
      }
    }
  });
};
