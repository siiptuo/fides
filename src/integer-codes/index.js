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
const $M = document.getElementsByName('M')[0];

const encodeFn = {
  'unary': unaryEncode,
  'binary': binaryEncode,
  'vlq': vlqEncode,
  'elias-gamma': eliasGammaEncode,
  'elias-delta': eliasDeltaEncode,
  'elias-omega': eliasOmegaEncode,
};

const decodeFn = {
  'unary': unaryDecode,
  'binary': binaryDecode,
  'vlq': vlqDecode,
  'elias-gamma': eliasGammaDecode,
  'elias-delta': eliasDeltaDecode,
  'elias-omega': eliasOmegaDecode,
};

function updateSettings() {
  encodeFn['golomb-rice'] = golombRiceEncode.bind(null, $M.value);
  decodeFn['golomb-rice'] = golombRiceDecode.bind(null, $M.value);
  updateNumbers();
}

function updateCoding() {
  $M.parentNode.style.display =
    $coding.value === 'golomb-rice' ? 'block' : 'none';
  updateNumbers();
}

function updateNumbers() {
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
$M.addEventListener('input', updateSettings);
updateSettings();
updateCoding();
