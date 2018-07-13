#!/usr/bin/env bash
set -e

ffmpeg() {
    if hash avconv 2>/dev/null; then
        avconv "$@"
    else
        command ffmpeg "$@"
    fi
}

mkdir -p public
cp -r logo.svg fretboard.png style.css index.html chords.html public

mkdir -p public/sounds
for sound in sounds/*; do
  ffmpeg -y -loglevel warning -i "$sound" -ac 1 -c pcm_s16le "public/$sound"
done

./node_modules/.bin/babel ./*.js --out-dir public
./node_modules/.bin/minify public/*.js --out-dir public
