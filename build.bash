#!/usr/bin/env bash
set -e
export PATH=$PATH:node_modules/.bin

ffmpeg() {
    if hash avconv 2>/dev/null; then
        avconv "$@"
    else
        command ffmpeg "$@"
    fi
}

mkdir -p public/images
cp index.html chords.html public

# Minify CSS
cleancss -o public/style.css style.css

# Compile and minify JavaScript
babel ./*.js --out-dir public
minify public/*.js --out-dir public

# Optimize images
convert -quality 100 images/fretboard.png public/images/fretboard.jpeg
jpegoptim -m50 public/images/fretboard.jpeg
sed -i -- 's/fretboard\.png/fretboard\.jpeg/g' public/*.css

svgo --input=images/logo.svg --output=public/images/logo.svg

# Optimize sounds
mkdir -p public/sounds
for sound in sounds/*; do
  ffmpeg -y -loglevel warning -i "$sound" -ac 1 -c libvorbis "public/${sound/wav/webm}"
done
sed -i -- 's/\.wav/\.webm/g' public/*.js
