// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  unaryEncode,
  unaryDecode,
  binaryEncode,
  binaryDecode,
  vlqEncode,
  vlqDecode,
  eliasGammaEncode,
  eliasGammaDecode,
  eliasDeltaEncode,
  eliasDeltaDecode,
  eliasOmegaEncode,
  eliasOmegaDecode,
  golombRiceEncode,
  golombRiceDecode,
  encodeSequence,
  decodeSequence,
} from './integer-codes.js';
import { BinaryString } from '../utils/binary-string.js';
import '../style.css';

const $numbers = document.getElementsByName('numbers')[0];
const $bits = document.getElementsByName('bits')[0];
const $coding = document.getElementsByName('coding')[0];
const $output = document.getElementsByTagName('output')[0];

const currentSettings = {};

for (const $container of document.getElementsByClassName('settings')) {
  const coding = $container.className.slice(18);
  const settings = {};
  for (const $param of $container.querySelectorAll('[name]')) {
    if ($param.type === 'checkbox') {
      $param.addEventListener('change', event => {
        settings[$param.name] = $param.checked;
        updateNumbers();
      });
      settings[$param.name] = $param.checked;
    } else {
      $param.addEventListener('change', event => {
        settings[$param.name] = +$param.value;
        updateNumbers();
      });
      settings[$param.name] = +$param.value;
    }
  }
  currentSettings[coding] = settings;
}

const encodeFn = {
  'unary': unaryEncode.bind(null, currentSettings['unary']),
  'binary': binaryEncode.bind(null, currentSettings['binary']),
  'vlq': vlqEncode.bind(null, currentSettings['vlq']),
  'elias-gamma': eliasGammaEncode.bind(null, currentSettings['elias-gamma']),
  'elias-delta': eliasDeltaEncode.bind(null, currentSettings['elias-delta']),
  'elias-omega': eliasOmegaEncode.bind(null, currentSettings['elias-omega']),
  'golomb-rice': golombRiceEncode.bind(null, currentSettings['golomb-rice']),
};

const decodeFn = {
  'unary': unaryDecode.bind(null, currentSettings['unary']),
  'binary': binaryDecode.bind(null, currentSettings['binary']),
  'vlq': vlqDecode.bind(null, currentSettings['vlq']),
  'elias-gamma': eliasGammaDecode.bind(null, currentSettings['elias-gamma']),
  'elias-delta': eliasDeltaDecode.bind(null, currentSettings['elias-delta']),
  'elias-omega': eliasOmegaDecode.bind(null, currentSettings['elias-omega']),
  'golomb-rice': golombRiceDecode.bind(null, currentSettings['golomb-rice']),
};

function updateCoding() {
  for (const $container of document.getElementsByClassName('settings')) {
    const coding = $container.className.slice(18);
    $container.style.display = $coding.value === coding ? 'block' : 'none';
  }
  updateNumbers();
}

function updateNumbers() {
  if (!$numbers.checkValidity()) return;
  const numbers = $numbers.value
    .split(',')
    .map(s => parseInt(s))
    .filter(x => !isNaN(x));
  const encode = encodeFn[$coding.value];
  const codes = numbers.map(encode);
  $bits.value = codes.join('');
  updateDisplay(codes.map((code, i) => ({ integer: numbers[i], code })));
}

function updateBits() {
  if (!$bits.checkValidity()) return;
  const bits = BinaryString.fromString($bits.value);
  const decode = decodeFn[$coding.value];
  const codes = decodeSequence(decode, bits);
  $numbers.value = codes.map(x => x.integer);
  updateDisplay(codes);
}

function updateDisplay(codes) {
  $output.innerHTML = codes.reduce(
    (result, { integer, code }, i) =>
      `${result}
      <div${integer === null ? ' class="error"' : ''}>
        <div class="code">${code}</div>
        <div class="integer">${integer || ''}</div>
      </div>`,
    ''
  );
}

$numbers.addEventListener('input', updateNumbers);
$coding.addEventListener('change', updateCoding);
$bits.addEventListener('input', updateBits);
updateCoding();
