# videojs-4to5

This provides two tools to ease the transition from video.js 4.x to 5.x.

## The `videojs-4to5` Binary

When installed globally, this package creates a binary which can be used to automatically refactor code written for video.js 4.x to work with 5.x.

```bash
npm install -g videojs-4to5
```

Run the script in a shell, pass it directories and/or files:

```bash
videojs-4to5 my-project some-file.js
```

All JavaScript files will be edited in place (unless you do a `--dry-run`).

### Options

For all options, see: `videojs-4to5 -h`.

## The Plugin

We recommend using the binary to update your code, but this package also includes a plugin which can be included in your web page(s) to shim in video.js 4.x APIs to a 5.x environment. This shimming is not meant to provide perfect 1:1 compatibility, but it should address virtually all use-cases.

### Getting the Plugin

If you have installed via __npm__ _(strongly preferred)_, the plugin will be available in both its original state and minified in `dist/plugin.(min.)js`. You'll probably want to install it locally within your project for this use-case (i.e. not `-g`).

If you have installed via __Bower__, the plugin will only be available in its original state in `src/plugin.js`. Supporting Bower with a minified version would mean checking `dist/` into the repository which is not desirable. We may reevaluate that choice in the future.
