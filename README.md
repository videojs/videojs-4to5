# videojs-4to5

This is a small shell script to help with bringing video.js 4.x code up to speed with changes in video.js 5.0.

## How do?

Run the script in a shell, pass it directories or files:

```bash
./videojs-4to5.sh my-project some-file.js
```

All JavaScript and CSS files will be edited in place to reflect changes for video.js 5.0.

### Options

#### Dry Run, `-d`

This won't change anything, but will print the files to be edited to STDOUT, so they can be piped, etc.
