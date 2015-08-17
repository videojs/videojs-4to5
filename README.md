# videojs-4to5

This is a small NodeJS script to help with bringing video.js 4.x code up to speed with changes in video.js 5.0.

## How do?

Install the module globally:

```bash
npm install -g git+ssh://git@bithub.brightcove.com:videocloud/videojs-4to5
```

Run the script in a shell, pass it directories and/or files:

```bash
videojs-4to5 my-project some-file.js
```

All JavaScript files will be edited in place (unless you do a `--dry-run`) to make changes for video.js 5.0 compatibility.

### Options

For all options, see: `videojs-4to5 -h`.
