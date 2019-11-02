// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

const { BinaryString } = require("../utils/binary-string.js");

function unaryEncode(x) {
  return BinaryString.withLength(x).append(1);
}

function unaryDecode(x) {
  for (let i = 0; i < x.length(); i++) {
    if (x.at(i)) {
      return { integer: i, code: x.slice(0, i + 1) };
    }
  }
  return null;
}

function eliasGammaEncode(x) {
  const b = BinaryString.fromInteger(x);
  const n = BinaryString.withLength(b.length() - 1);
  return n.concat(b);
}

function eliasGammaDecode(x) {
  for (let i = 0; i < x.length(); i++) {
    if (x.at(i)) {
      if (i + i >= x.length()) break;
      return {
        integer: x.slice(i, i + i + 1).toInteger(),
        code: x.slice(0, i + i + 1)
      };
    }
  }
  return null;
}

function eliasDeltaEncode(x) {
  const b = BinaryString.fromInteger(x);
  const n = eliasGammaEncode(b.length());
  return n.concat(b.slice(1));
}

function eliasDeltaDecode(x) {
  const result = eliasGammaDecode(x);
  if (!result || result.code.length() + result.integer - 1 > x.length())
    return null;
  return {
    integer: x
      .slice(result.code.length(), result.code.length() + result.integer - 1)
      .prepend(1)
      .toInteger(),
    code: x.slice(0, result.code.length() + result.integer - 1)
  };
}

function eliasOmegaEncode(x) {
  let code = BinaryString.fromArray([0]);
  while (x !== 1) {
    const n = BinaryString.fromInteger(x);
    code = n.concat(code);
    x = n.length() - 1;
  }
  return code;
}

function eliasOmegaDecode(x) {
  let integer = 1;
  let length = 1;
  let y = x;
  while (y.at(0)) {
    if (length + integer >= x.length()) return null;
    const [a, b] = y.split(integer + 1);
    integer = a.toInteger();
    length += a.length();
    y = b;
  }
  return { integer, code: x.slice(0, length) };
}

function encodeSequence(encoder, numbers) {
  return numbers.reduce(
    (output, x) => output.concat(encoder(x)),
    BinaryString.withLength(0)
  );
}

function decodeSequence(decoder, string) {
  const output = [];
  while (string.length()) {
    const result = decoder(string);
    if (!result) {
      output.push({ integer: null, code: string });
      break;
    }
    output.push(result);
    string = string.slice(result.code.length());
  }
  return output;
}

module.exports = {
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
};
