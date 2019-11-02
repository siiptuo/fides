// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  unaryEncode,
  unaryDecode,
  eliasGammaEncode,
  eliasGammaDecode,
  eliasDeltaEncode,
  eliasDeltaDecode,
  eliasOmegaEncode,
  eliasOmegaDecode,
  encodeSequence,
  decodeSequence
} from "./integer-codes.js";
import { BinaryString } from "../utils/binary-string.js";
import "../style.css";

const $numbers = document.getElementsByName("numbers")[0];
const $bits = document.getElementsByName("bits")[0];
const $coding = document.getElementsByName("coding")[0];
const $output = document.getElementsByTagName("output")[0];

const encodeFn = {
  unary: unaryEncode,
  "elias-gamma": eliasGammaEncode,
  "elias-delta": eliasDeltaEncode,
  "elias-omega": eliasOmegaEncode
};

const decodeFn = {
  unary: unaryDecode,
  "elias-gamma": eliasGammaDecode,
  "elias-delta": eliasDeltaDecode,
  "elias-omega": eliasOmegaDecode
};

function updateNumbers() {
  const numbers = $numbers.value
    .split(",")
    .map(s => parseInt(s))
    .filter(x => !isNaN(x));
  const encode = encodeFn[$coding.value];
  const codes = numbers.map(encode);
  $bits.value = codes.join("");
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
      <div${integer === null ? ' class="error"' : ""}>
        <div class="code">${code}</div>
        <div class="integer">${integer || ""}</div>
      </div>`,
    ""
  );
}

$numbers.addEventListener("input", updateNumbers);
$coding.addEventListener("change", updateNumbers);
$bits.addEventListener("input", updateBits);
updateNumbers();
