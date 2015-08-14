#!/bin/sh

# Takes a file, an squery selector, and a replacement string and performs
# grasp-based replacement on that string.
replace_js(){
    ./node_modules/.bin/grasp -s "$2" -R "$3" -i "$1"
}

# Takes a single JavaScript filename and processes it.
process_js(){
    if [ $DRY = true ]; then
        echo "$1"
    else
        replace_js $1 '#vjs' 'videojs'
        replace_js $1 'member[obj=#videojs][prop=#util]' 'videojs'
    fi
}

# Takes a single CSS filename and processes it.
process_css(){
    if [ $DRY = true ]; then
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
        if [ "$EXT" == "js" ]; then
            process_js "$1"
        elif [ "$EXT" == "css" ]; then
            process_css "$1"
        fi
    fi
}

# Parse options.
DRY="false"

while getopts "d" FLAG; do
    case "${FLAG}" in
        d) DRY="true" ;;
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
