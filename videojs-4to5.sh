#!/bin/sh

# Takes a single filename argument and processes it depending on its type.
process_file(){
    if [ -f "$1" ]
    then
        FNAME=$(basename "$1")
        EXT="${FNAME##*.}"
        if [ $EXT == "js" ]
        then
            echo "js:     $1"
        elif [ $EXT == "css" ]
        then
            echo "css:    $1"
        fi
    fi
}

# Loop over arguments and find all JS and CSS files not in node_modules
# and process each of them individually.
for X in "$@"
do
    if [ -d "$X" ]
    then
        for FILE in $(find "$X" -not -path "*node_modules*" -name "*.js" -or -not -path "*node_modules*" -name "*.css"); do
            process_file "$FILE"
        done
    else
        process_file "$X"
    fi
done
