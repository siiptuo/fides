// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

const assert = require("assert");
const {
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
} = require("./integer-codes.js");
const { BinaryString } = require("../utils/binary-string.js");

function generateTestSuite(title, encode, decode, examples, examples2) {
  describe(title, () => {
    describe("Encoding examples", () => {
      examples.forEach(([integer, binary]) => {
        it(`Encoding ${integer} works`, () => {
          assert.strictEqual(encode(integer).toString(), binary);
        });
      });
    });

    describe("Decoding examples", () => {
      examples.forEach(([integer, code]) => {
        it(`Decoding ${code} works`, () => {
          code = BinaryString.fromString(code);
          assert.deepStrictEqual(decode(code), { integer, code });
        });
      });
    });

    describe("Error handling", () => {
      examples2.forEach(([sequence, codes]) => {
        it(`Decoding ${sequence} fails`, () => {
          const decoded = decodeSequence(
            decode,
            BinaryString.fromString(sequence)
          ).map(x => [x.integer, x.code.toString()]);
          assert.deepStrictEqual(decoded, codes);
        });
      });
    });

    describe("Encoding random sequences", () => {
      for (let i = 0; i < 20; i++) {
        const numbers = Array.from(
          { length: 10 },
          x => 1 + Math.floor(100 * Math.random())
        );
        it(`Encoding and decoding sequence ${numbers} works`, () => {
          const encoded = encodeSequence(encode, numbers);
          const decoded = decodeSequence(decode, encoded);
          assert.deepStrictEqual(numbers, decoded.map(d => d.integer));
        });
      }
    });

    describe("Decoding random sequences", () => {
      for (let i = 0; i < 20; i++) {
        const code = BinaryString.fromArray(
          Array.from({ length: 1 + Math.floor(20 * Math.random()) }, x =>
            Math.round(Math.random())
          )
        );
        it(`Decoding ${code} works`, () => {
          const result = decode(code);
          assert(
            result === null ||
              (typeof result.integer === "number" &&
                result.code.length() <= code.length())
          );
        });
      }
    });
  });
}

generateTestSuite(
  "Unary coding",
  unaryEncode,
  unaryDecode,
  [
    [0, "1"],
    [1, "01"],
    [2, "001"],
    [3, "0001"],
    [4, "00001"],
    [5, "000001"],
    [6, "0000001"],
    [7, "00000001"],
    [8, "000000001"],
    [9, "0000000001"]
  ],
  [["01001000", [[1, "01"], [2, "001"], [null, "000"]]]]
);

generateTestSuite(
  "Elias gamma coding",
  eliasGammaEncode,
  eliasGammaDecode,
  [
    [1, "1"],
    [2, "010"],
    [3, "011"],
    [4, "00100"],
    [5, "00101"],
    [6, "00110"],
    [7, "00111"],
    [8, "0001000"],
    [9, "0001001"],
    [10, "0001010"],
    [11, "0001011"],
    [12, "0001100"],
    [13, "0001101"],
    [14, "0001110"],
    [15, "0001111"],
    [16, "000010000"],
    [17, "000010001"]
  ],
  [["101001", [[1, "1"], [2, "010"], [null, "01"]]]]
);

generateTestSuite(
  "Elias delta coding",
  eliasDeltaEncode,
  eliasDeltaDecode,
  [
    [1, "1"],
    [2, "0100"],
    [3, "0101"],
    [4, "01100"],
    [5, "01101"],
    [6, "01110"],
    [7, "01111"],
    [8, "00100000"],
    [9, "00100001"],
    [10, "00100010"],
    [11, "00100011"],
    [12, "00100100"],
    [13, "00100101"],
    [14, "00100110"],
    [15, "00100111"],
    [16, "001010000"],
    [17, "001010001"]
  ],
  [["10100010", [[1, "1"], [2, "0100"], [null, "010"]]]]
);

generateTestSuite(
  "Elias omega coding",
  eliasOmegaEncode,
  eliasOmegaDecode,
  [
    [1, "0"],
    [2, "100"],
    [3, "110"],
    [4, "101000"],
    [5, "101010"],
    [6, "101100"],
    [7, "101110"],
    [8, "1110000"],
    [9, "1110010"],
    [10, "1110100"],
    [11, "1110110"],
    [12, "1111000"],
    [13, "1111010"],
    [14, "1111100"],
    [15, "1111110"],
    [16, "10100100000"],
    [17, "10100100010"],
    [100, "1011011001000"],
    [1000, "11100111111010000"],
    [10000, "111101100111000100000"],
    [100000, "1010010000110000110101000000"],
    [1000000, "1010010011111101000010010000000"]
  ],
  [["010011", [[1, "0"], [2, "100"], [null, "11"]]]]
);
