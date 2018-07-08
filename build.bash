#/usr/bin/env bash
mkdir -p public
cp -r sounds fretboard.png style.css index.html chords.html public
./node_modules/.bin/babel *.js --out-dir public
./node_modules/.bin/minify public/*.js --out-dir public
