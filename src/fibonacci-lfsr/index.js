// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

import '../style.css';
import { Element } from '../utils/dom.js';

const main = new Element(document.body.getElementsByTagName('main')[0]);

const svg = main.append('svg');

const div = main.append('div');

const $sizeLabel = div.append('label').text('State bits: ');

const $size = $sizeLabel
  .append('input')
  .attr('type', 'number')
  .attr('value', '16')
  .attr('min', '1')
  .on('change', event => {
    initialize(+event.target.value);
  });

const $next = div
  .append('button')
  .text('Next state')
  .on('click', event => {
    state = [
      state.filter((b, i) => taps[i]).reduce((a, b) => a ^ b, 0),
      ...state.slice(0, -1),
    ];
    updateState();
  });

const $output = main.append('p');
let $state = [];
let state = null;
let taps = null;

function updateState() {
  let output = '<var>x</var><sup>' + taps.length + '</sup>';
  for (let i = taps.length - 2; i >= 1; i--) {
    if (taps[i]) {
      output += '+<var>x</var><sup>' + (i + 1) + '</sup>';
    }
  }
  if (taps[0]) {
    output += '+<var>x</var>';
  }
  output += '+1';
  $output.html(
    '<strong>Taps</strong> <span class="taps">' +
      output +
      '</span>' +
      '<table>' +
      '<thead>' +
      '<tr><th colspan="2">State</th></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><th>Binary</th><td>' +
      state.join('') +
      '</td></tr>' +
      '<tr><th>Hexadecimal</th><td>' +
      parseInt(state.join(''), 2)
        .toString(16)
        .toUpperCase()
        .padStart(Math.ceil(state.length / 4), '0') +
      '</td></tr>' +
      '<tr><th>Decimal</th><td>' +
      parseInt(state.join(''), 2) +
      '</td></tr>' +
      '</tbody></table>'
  );
  for (let i = 0; i < state.length; i++) {
    $state[i].text(state[i]);
  }
}

function initialize(bits) {
  svg.clear();
  const defs = svg.append('defs').html(`
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    `);

  state = new Array(bits).fill(0);
  taps = new Array(bits).fill(0);
  taps[bits - 1] = 1;
  $state = new Array(state.length);

  svg.attr('width', 20 * state.length + 40).attr('height', 20 + 20 + 20);

  for (let i = 0; i < state.length; i++) {
    const x = 20 + 20 * i;
    const y = 25;
    const w = 20;
    const h = 20;

    const g = svg
      .append('g')
      .attr('class', 'bit')
      .on('click', event => {
        state[i] ^= 1;
        updateState();
      });

    g.append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', w)
      .attr('height', h)
      .attr('fill', 'white')
      .attr('stroke-width', 2)
      .attr('stroke', 'black');

    $state[i] = g
      .append('text')
      .attr('x', x + w / 2)
      .attr('y', y + h / 1.5)
      .attr('font-family', 'monospace')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle');
  }

  svg
    .append('path')
    .attr(
      'd',
      [
        'M',
        20 + 20 * state.length,
        25 + 20 / 2,
        'h',
        10,
        'v',
        -25,
        'H',
        10,
        'v',
        25,
        'h',
        7,
      ].join(' ')
    )
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrow)');

  const circleRadius = 6;
  const crossWidth = 2;
  const crossMargin = 2;

  for (let i = 0; i < state.length - 1; i++) {
    let g = svg
      .append('g')
      .attr('class', 'tap')
      .attr('opacity', taps[i])
      .on('click', event => {
        taps[i] ^= 1;
        g.attr('opacity', taps[i]);
        updateState();
      });

    g.append('rect')
      .attr('x', 20 + 20 * i)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 25)
      .attr('opacity', 0);

    g.append('line')
      .attr('x1', 20 + i * 20 + 20 / 2)
      .attr('y1', 25)
      .attr('x2', 20 + i * 20 + 20 / 2)
      .attr('y2', 10 + 3 + circleRadius)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    g.append('line')
      .attr('x1', 20 + 20 / 2 + 3 + circleRadius + i * 20 + 1)
      .attr('y1', 10)
      .attr('x2', 20 + 20 / 2 + 3 + circleRadius + i * 20)
      .attr('y2', 10)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    const circleX = 20 + i * 20 + 20 / 2;
    const circleY = 10;

    g.append('circle')
      .attr('cx', circleX)
      .attr('cy', circleY)
      .attr('r', circleRadius)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    g.append('line')
      .attr('x1', circleX - circleRadius + crossMargin)
      .attr('y1', circleY)
      .attr('x2', circleX + circleRadius - crossMargin)
      .attr('y2', circleY)
      .attr('stroke', 'black')
      .attr('stroke-width', crossWidth);

    g.append('line')
      .attr('x1', circleX)
      .attr('y1', circleY - circleRadius + crossMargin)
      .attr('x2', circleX)
      .attr('y2', circleY + circleRadius - crossMargin)
      .attr('stroke', 'black')
      .attr('stroke-width', crossWidth);
  }

  updateState();
}

initialize(+$size.element.value);
