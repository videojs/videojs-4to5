#!/bin/sh

# Takes a single JavaScript filename and processes it.
process_js(){
    if [ $DRY == true ]; then
        echo "$1"
    else

        # Replace uses of the global identifier "vjs" with "videojs"
        ./node_modules/.bin/grasp \
            -s "#vjs" \
            -R "videojs" \
            -i "$1"

        # Replace uses of the "videojs.util" object.
        ./node_modules/.bin/grasp \
            -s "member[obj=#videojs][prop=#util]" \
            -R "videojs" \
            -i "$1"

        # Replace uses of the "videojs.JSON" object.
        ./node_modules/.bin/grasp \
            -e "videojs.JSON" \
            -R "JSON" \
            -i "$1"

        # Replace uses of the "videojs.TOUCH_ENABLED" object.
        ./node_modules/.bin/grasp \
            -e "videojs.TOUCH_ENABLED" \
            -R "videojs.browser.TOUCH_ENABLED" \
            -i "$1"

        # Replace calls to "videojs.*.extend()" with calls to "videojs.extends()".
        ./node_modules/.bin/grasp \
            -e "videojs.\$className.extend(\$proto)" \
            -R "videojs.extends(videojs.getComponent('{{className}}'), {{proto}})" \
            -i "$1"
    fi
}

# Takes a single CSS filename and processes it.
process_css(){
    if [ $DRY == true ]; then
        echo "$1"
    else
        if [ -f "$1-tmp" ]; then
            rm "$1-tmp"
        fi
        cat "$1" |
            sed "s/\.vjs-live-controls/\.vjs-live-control/g" |
            cat > "$1-tmp" &&
            rm "$1" &&
            mv "$1-tmp" "$1"
    fi
}

# Takes a single filename argument and processes it depending on its type.
process_file(){
    if [ -f "$1" ]; then
        FNAME=$(basename "$1")
        EXT="${FNAME##*.}"
        if [ "$EXT" == "js" ] && [ $JS == true ]; then
            process_js "$1"
        elif [ "$EXT" == "css" ] && [ $CSS == true ]; then
            process_css "$1"
        fi
    fi
}

# Parse options.
DRY="false"
CSS="true"
JS="true"

while getopts "cdj" FLAG; do
    case "${FLAG}" in
        c) JS="false" ;;
        d) DRY="true" ;;
        j) CSS="false" ;;
    esac
done

if [ ! -L "node_modules/.bin/grasp" ]; then
    echo "Please install Node dependencies (npm install)!"
    exit 1
fi

# Loop over arguments and find all JS and CSS files not in node_modules
# and process each of them individually.
for X in "$@"; do
    if [ -d "$X" ]; then
        for FILE in $(find "$X" -not -path "*node_modules*" -name "*.js" -or -not -path "*node_modules*" -name "*.css"); do
            process_file "$FILE"
        done
    else
        process_file "$X"
    fi
done
