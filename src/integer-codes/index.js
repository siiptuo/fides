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
const $output = document.getElementsByTagName('output')[0];
const $settingsError = document.getElementsByClassName('settings-error')[0];

const codingNames = {
  'unary': 'Unary coding',
  'fixed-length-binary': 'Fixed-length binary',
  'variable-length-quantity': 'Variable-length quantity',
  'elias-gamma': 'Elias γ coding',
  'elias-delta': 'Elias δ coding',
  'elias-omega': 'Elias ω coding',
  'golomb-rice': 'Golomb–Rice coding',
};

function parseCoding(path) {
  const match = path.match(/^\/integer-codes\/(.+)/);
  if (match && match[1] && match[1] in codingNames) return match[1];
  return null;
}

function createTitle(coding) {
  return codingNames[currentCoding] + ' - Integer codes - Fides';
}

let currentCoding = parseCoding(location.pathname) || 'unary';
history.replaceState(null, '', '/integer-codes/' + currentCoding);
document.title = createTitle(currentCoding);

let $currentCoding = document.querySelector(
  'ul.codings a[href="/integer-codes/' + currentCoding + '"]'
);
$currentCoding.className = 'current';

document.querySelector('ul.codings').addEventListener('click', event => {
  if (event.target.tagName !== 'A') return;
  event.preventDefault();
  history.replaceState(null, '', event.target.href);
  currentCoding = parseCoding(location.pathname) || 'unary';
  document.title = createTitle(currentCoding);
  updateCoding();
  $currentCoding.className = '';
  $currentCoding = event.target;
  $currentCoding.className = 'current';
});

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
        if (!$param.checkValidity()) return;
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
  'fixed-length-binary': binaryEncode.bind(
    null,
    currentSettings['fixed-length-binary']
  ),
  'variable-length-quantity': vlqEncode.bind(
    null,
    currentSettings['variable-length-quantity']
  ),
  'elias-gamma': eliasGammaEncode.bind(null, currentSettings['elias-gamma']),
  'elias-delta': eliasDeltaEncode.bind(null, currentSettings['elias-delta']),
  'elias-omega': eliasOmegaEncode.bind(null, currentSettings['elias-omega']),
  'golomb-rice': golombRiceEncode.bind(null, currentSettings['golomb-rice']),
};

const decodeFn = {
  'unary': unaryDecode.bind(null, currentSettings['unary']),
  'fixed-length-binary': binaryDecode.bind(
    null,
    currentSettings['fixed-length-binary']
  ),
  'variable-length-quantity': vlqDecode.bind(
    null,
    currentSettings['variable-length-quatity']
  ),
  'elias-gamma': eliasGammaDecode.bind(null, currentSettings['elias-gamma']),
  'elias-delta': eliasDeltaDecode.bind(null, currentSettings['elias-delta']),
  'elias-omega': eliasOmegaDecode.bind(null, currentSettings['elias-omega']),
  'golomb-rice': golombRiceDecode.bind(null, currentSettings['golomb-rice']),
};

function updateCoding() {
  for (const $container of document.getElementsByClassName('settings')) {
    const coding = $container.className.slice(18);
    $container.style.display = currentCoding === coding ? 'block' : 'none';
  }
  for (const $article of document.getElementsByTagName('article')) {
    $article.style.display =
      currentCoding === $article.className ? 'block' : 'none';
  }
  updateNumbers();
}

function updateNumbers() {
  if (!$numbers.checkValidity()) return;
  const numbers = $numbers.value
    .split(',')
    .map(s => parseInt(s))
    .filter(x => !isNaN(x));
  const encode = encodeFn[currentCoding];
  try {
    const codes = numbers.map(encode);
    $bits.value = codes.join('');
    updateDisplay(codes.map((code, i) => ({ integer: numbers[i], code })));
    $settingsError.style.display = 'none';
  } catch (e) {
    $settingsError.textContent = e.message;
    $settingsError.style.display = 'block';
  }
}

function updateBits() {
  if (!$bits.checkValidity()) return;
  const bits = BinaryString.fromString($bits.value);
  const decode = decodeFn[currentCoding];
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
        <div class="integer">${integer !== null ? integer : ''}</div>
      </div>`,
    ''
  );
}

$numbers.addEventListener('input', updateNumbers);
$bits.addEventListener('input', updateBits);
updateCoding();
