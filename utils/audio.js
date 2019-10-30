// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

// Support prefixed AudioContext used in Safari and old Chrome versions.
const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

// Polyfill for old callback-based syntax used in Safari.
if (context.decodeAudioData.length !== 1) {
  const originalDecodeAudioData = context.decodeAudioData.bind(context);
  context.decodeAudioData = buffer =>
    new Promise((resolve, reject) =>
      originalDecodeAudioData(buffer, resolve, reject)
    );
}

const extension = (() => {
  const $audio = document.createElement("audio");
  const item = [
    { mime: "audio/webm; codecs=vorbis", extension: "webm" },
    { mime: "audio/mp4; codecs=mp4a.40.5", extension: "m4a" },
    { mime: "audio/wav; codecs=1", extension: "wav" }
  ].find(type => $audio.canPlayType(type.mime) === "probably");
  return item && item.extension;
})();

function midiToHertz(note) {
  return 2 ** ((note - 69) / 12) * 440;
}

export function fetchSample(urls, note) {
  return fetch(urls[extension])
    .then(res => res.arrayBuffer())
    .then(buffer => context.decodeAudioData(buffer))
    .then(buffer => ({ buffer, note }));
}

export function playSample(sample, note) {
  const source = context.createBufferSource();
  source.buffer = sample.buffer;
  if (sample.note && note) {
    source.playbackRate.value = midiToHertz(note) / midiToHertz(sample.note);
  }
  source.connect(context.destination);
  source.start(0);
}
