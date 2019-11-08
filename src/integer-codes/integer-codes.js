// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

const { BinaryString } = require('../utils/binary-string.js');

function unaryEncode({ alternative }, x) {
  const [a, b] = alternative ? [0, 1] : [1, 0];
  return BinaryString.withLength(x, a).append(b);
}

function unaryDecode({ alternative }, x) {
  const b = alternative ? 1 : 0;
  for (let i = 0; i < x.length(); i++) {
    if (x.at(i) == b) {
      return { integer: i, code: x.slice(0, i + 1) };
    }
  }
  throw new Error('Decode failure');
}

function binaryEncode({ chunkSize }, x) {
  const b = BinaryString.fromInteger(x);
  if (b.length() > chunkSize)
    throw new Error(
      `Encoding integer ${x} requires at least ${b.length()} bits`
    );
  return b.padStart(chunkSize);
}

function binaryDecode({ chunkSize }, x) {
  const code = x.slice(0, chunkSize);
  return { integer: code.toInteger(), code };
}

function vlqEncode({ chunkSize }, x) {
  let binary = BinaryString.fromInteger(x);
  const bits = (chunkSize - 1) * Math.ceil(binary.length() / (chunkSize - 1));
  binary = binary.padStart(bits);
  let output = BinaryString.withLength(0);
  for (let i = 0; i < binary.length() - (chunkSize - 1); i += chunkSize - 1) {
    output = output.append(1).concat(binary.slice(i, i + chunkSize - 1));
  }
  output = output.append(0).concat(binary.slice(-(chunkSize - 1)));
  return output;
}

function vlqDecode({ chunkSize }, x) {
  let binary = BinaryString.withLength(0);
  let i = 0;
  while (x.at(i)) {
    binary = binary.concat(x.slice(i + 1, i + chunkSize));
    i += chunkSize;
  }
  binary = binary.concat(x.slice(i + 1, i + chunkSize));
  return { integer: binary.toInteger(), code: x.slice(0, i + chunkSize) };
}

function eliasGammaEncode({ alternative }, x) {
  if (x === 0) throw new Error('Encoding 0 is not supported');
  const b = BinaryString.fromInteger(x).slice(1);
  const n = unaryEncode({ alternative: !alternative }, b.length());
  return n.concat(b);
}

function eliasGammaDecode({ alternative }, x) {
  const { integer: length, code } = unaryDecode(
    { alternative: !alternative },
    x
  );
  return {
    integer: x
      .slice(length + 1, length + 1 + length)
      .prepend(1)
      .toInteger(),
    code: x.slice(0, length + 1 + length),
  };
}

function eliasDeltaEncode({ alternative }, x) {
  if (x === 0) throw new Error('Encoding 0 is not supported');
  const b = BinaryString.fromInteger(x);
  const n = eliasGammaEncode({ alternative }, b.length());
  return n.concat(b.slice(1));
}

function eliasDeltaDecode({ alternative }, x) {
  const result = eliasGammaDecode({ alternative }, x);
  return {
    integer: x
      .slice(result.code.length(), result.code.length() + result.integer - 1)
      .prepend(1)
      .toInteger(),
    code: x.slice(0, result.code.length() + result.integer - 1),
  };
}

function eliasOmegaEncode(params, x) {
  if (x === 0) throw new Error('Encoding 0 is not supported');
  let code = BinaryString.fromArray([0]);
  while (x !== 1) {
    const n = BinaryString.fromInteger(x);
    code = n.concat(code);
    x = n.length() - 1;
  }
  return code;
}

function eliasOmegaDecode(params, x) {
  let integer = 1;
  let length = 1;
  let y = x;
  while (y.at(0)) {
    const [a, b] = y.split(integer + 1);
    integer = a.toInteger();
    length += a.length();
    y = b;
  }
  return { integer, code: x.slice(0, length) };
}

function golombRiceEncode({ M }, N) {
  const q = Math.floor(N / M);
  const Q = unaryEncode({ alternative: false }, q);
  if (M == 1) return Q;

  const r = N % M;
  const b = Math.ceil(Math.log2(M));
  const cutoff = 2 ** b - M;
  const R =
    r < cutoff
      ? BinaryString.fromInteger(r).padStart(b - 1)
      : BinaryString.fromInteger(r + cutoff).padStart(b);

  return Q.concat(R);
}

function golombRiceDecode({ M }, x) {
  const b = Math.ceil(Math.log2(M));
  const cutoff = 2 ** b - M;

  for (let i = 0; i < x.length(); i++) {
    if (!x.at(i)) {
      const r = x.slice(i, i + b).toInteger();
      if (r < cutoff) {
        return {
          integer: i * M + r,
          code: x.slice(0, i + b),
        };
      } else {
        return {
          integer: i * M + x.slice(i, i + b + 1).toInteger() - cutoff,
          code: x.slice(0, i + b + 1),
        };
      }
    }
  }

  throw new Error('Decode failure');
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
    try {
      const result = decoder(string);
      output.push(result);
      string = string.slice(result.code.length());
    } catch (e) {
      output.push({ integer: null, code: string });
      break;
    }
  }
  return output;
}

module.exports = {
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
};
