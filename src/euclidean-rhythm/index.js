// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

import '../style.css';

import { Element } from '../utils/dom.js';
import { fetchSample, playSample } from '../utils/audio.js';
import {
  euclideanRhythm,
  distanceSequence,
  subsets,
} from './euclidean-rhythm.js';

const samples = [];

[
  require('./158957__carlmartin__djembe-hit-13-hi-rim.wav'),
  require('./158958__carlmartin__djembe-hit-2-hi-rim.wav'),
].forEach((urls, i) => fetchSample(urls).then(sample => (samples[i] = sample)));

const $k = document.getElementsByName('k')[0];
$k.addEventListener('change', event => {
  currentRhythm = euclideanRhythm(+$k.value, +$n.value);
  create(currentRhythm);
});
const $n = document.getElementsByName('n')[0];
$n.addEventListener('change', event => {
  $k.setAttribute('max', +$n.value);
  $k.value = Math.min(+$k.value, +$n.value);
  currentRhythm = euclideanRhythm(+$k.value, +$n.value);
  create(currentRhythm);
});
const $bpm = document.getElementsByName('bpm')[0];
const $button = document.getElementsByTagName('button')[0];
let playInterval = null;
$button.addEventListener('click', event => {
  if (playInterval) {
    $button.textContent = 'Play';
    clearInterval(playInterval);
    playInterval = null;
    $circles.forEach(c => c.attr('class', ''));
  } else {
    $button.textContent = 'Stop';
    let current = currentRhythm.length - 1;

    function loop() {
      $circles[current].attr('class', '');
      current = (current + 1) % currentRhythm.length;
      $circles[current].attr('class', 'active');
      playSample(currentRhythm[current] ? samples[1] : samples[0]);
    }

    playInterval = setInterval(loop, 60000 / +$bpm.value);
    loop();
  }
});

const svg = new Element(document.getElementsByTagName('svg')[0]);

const width = 200;
const height = 200;
const centerX = width / 2;
const centerY = height / 2;
const radius = 80;
const textRadius = 90;

let $circles = [];

function create(rhythm) {
  svg.clear();
  $circles = new Array(rhythm.length);

  const phases = Array.from(
    { length: rhythm.length },
    (x, i) => Math.PI - (i * 2 * Math.PI) / rhythm.length
  );

  svg
    .append('path')
    .attr(
      'd',
      'M ' +
        phases
          .map(
            p =>
              centerX +
              radius * Math.sin(p) +
              ' ' +
              (centerY + radius * Math.cos(p))
          )
          .join(' L ') +
        ' Z'
    )
    .attr('fill', 'none')
    .attr('stroke', 'black');

  for (let i = 0; i < rhythm.length; i++) {
    $circles[i] = svg
      .append('circle')
      .attr('cx', centerX + radius * Math.sin(phases[i]))
      .attr('cy', centerY + radius * Math.cos(phases[i]))
      .attr('r', 4)
      .attr('fill', rhythm[i] ? 'black' : 'white')
      .attr('stroke', 'black');
    svg
      .append('text')
      .attr('x', centerX + textRadius * Math.sin(phases[i]))
      .attr('y', centerY + textRadius * Math.cos(phases[i]) + 5)
      .attr('font-size', '10')
      .attr('text-anchor', 'middle')
      .text(i);
  }
}

$k.setAttribute('max', +$n.value);
$k.value = Math.min(+$k.value, +$n.value);
let currentRhythm = euclideanRhythm(+$k.value, +$n.value);
console.log('(' + distanceSequence(currentRhythm).join() + ')');
console.log('{' + subsets(currentRhythm).join() + '}_' + currentRhythm.length);
create(currentRhythm);
