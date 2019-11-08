// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

const assert = require('assert');
const {
  binaryEncode,
  binaryDecode,
  unaryEncode,
  unaryDecode,
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
} = require('./integer-codes.js');
const { BinaryString } = require('../utils/binary-string.js');

function generateTestSuite(
  title,
  encode,
  decode,
  examplesOk,
  examplesFail,
  generateSettings
) {
  describe(title, () => {
    describe('Encoding examples', () => {
      examplesOk.forEach(([settings, examples]) => {
        examples.forEach(([integer, binary]) => {
          it(`Encoding ${integer} works`, () => {
            assert.strictEqual(encode(settings, integer).toString(), binary);
          });
        });
      });
    });

    describe('Decoding examples', () => {
      examplesOk.forEach(([settings, examples]) => {
        examples.forEach(([integer, code]) => {
          it(`Decoding ${code} works`, () => {
            code = BinaryString.fromString(code);
            assert.deepStrictEqual(decode(settings, code), { integer, code });
          });
        });
      });
    });

    describe('Error handling', () => {
      examplesFail.forEach(([settings, sequence, codes]) => {
        it(`Decoding ${sequence} fails`, () => {
          const decoded = decodeSequence(
            decode.bind(null, settings),
            BinaryString.fromString(sequence)
          ).map(x => [x.integer, x.code.toString()]);
          assert.deepStrictEqual(decoded, codes);
        });
      });
    });

    describe('Encoding random sequences', () => {
      for (let i = 0; i < 20; i++) {
        const numbers = Array.from(
          { length: 10 },
          x => 1 + Math.floor(100 * Math.random())
        );
        const settings = generateSettings();
        it(`Encoding and decoding sequence ${numbers} with settings ${JSON.stringify(
          settings
        )} works`, () => {
          const encoded = encodeSequence(encode.bind(null, settings), numbers);
          const decoded = decodeSequence(decode.bind(null, settings), encoded);
          assert.deepStrictEqual(numbers, decoded.map(d => d.integer));
        });
      }
    });

    describe('Decoding random binary string', () => {
      for (let i = 0; i < 20; i++) {
        const code = BinaryString.fromArray(
          Array.from({ length: 1 + Math.floor(20 * Math.random()) }, x =>
            Math.round(Math.random())
          )
        );
        const settings = generateSettings();
        it(`Decoding ${code} with settings ${JSON.stringify(
          settings
        )} works`, () => {
          try {
            const result = decode(settings, code);
            assert(
              typeof result.integer === 'number' &&
                result.code.length() <= code.length()
            );
          } catch (e) {}
        });
      }
    });
  });
}

generateTestSuite(
  'Unary coding',
  unaryEncode,
  unaryDecode,
  [
    [
      { alternative: false },
      [
        [0, '0'],
        [1, '10'],
        [2, '110'],
        [3, '1110'],
        [4, '11110'],
        [5, '111110'],
        [6, '1111110'],
        [7, '11111110'],
        [8, '111111110'],
        [9, '1111111110'],
      ],
    ],
    [
      { alternative: true },
      [
        [0, '1'],
        [1, '01'],
        [2, '001'],
        [3, '0001'],
        [4, '00001'],
        [5, '000001'],
        [6, '0000001'],
        [7, '00000001'],
        [8, '000000001'],
        [9, '0000000001'],
      ],
    ],
  ],
  [[{ alternative: true }, '01001000', [[1, '01'], [2, '001'], [null, '000']]]],
  () => ({ alternative: Math.random() < 0.5 })
);

generateTestSuite(
  'Fixed-length binary',
  binaryEncode,
  binaryDecode,
  [
    [
      { chunkSize: 8 },
      [
        [0, '00000000'],
        [1, '00000001'],
        [2, '00000010'],
        [3, '00000011'],
        [4, '00000100'],
        [5, '00000101'],
        [6, '00000110'],
        [7, '00000111'],
        [8, '00001000'],
        [9, '00001001'],
      ],
    ],
  ],
  [
    [
      { chunkSize: 8 },
      '0000000100000010000',
      [[1, '00000001'], [2, '00000010'], [null, '000']],
    ],
  ],
  () => ({ chunkSize: 8 + Math.floor(58 * Math.random()) })
);

generateTestSuite(
  'Variable-length quantity',
  vlqEncode,
  vlqDecode,
  [
    [
      { chunkSize: 8 },
      [
        [0, '00000000'],
        [127, '01111111'],
        [128, '1000000100000000'],
        [8192, '1100000000000000'],
        [16383, '1111111101111111'],
        [16384, '100000011000000000000000'],
        [2097151, '111111111111111101111111'],
        [2097152, '10000001100000001000000000000000'],
        [134217728, '11000000100000001000000000000000'],
        [268435455, '11111111111111111111111101111111'],
      ],
    ],
    [
      { chunkSize: 2 },
      [
        [0, '00'],
        [1, '01'],
        [2, '1100'],
        [3, '1101'],
        [4, '111000'],
        [5, '111001'],
        [6, '111100'],
        [7, '111101'],
        [8, '11101000'],
        [9, '11101001'],
      ],
    ],
  ],
  [
    [
      { chunkSize: 8 },
      '011111111000000',
      [[127, '01111111'], [null, '1000000']],
    ],
    [
      { chunkSize: 8 },
      '01111111100000000000000',
      [[127, '01111111'], [null, '100000000000000']],
    ],
    [
      { chunkSize: 8 },
      '011111111000000010000000',
      [[127, '01111111'], [null, '1000000010000000']],
    ],
  ],
  () => ({ chunkSize: 2 + Math.floor(62 * Math.random()) })
);

generateTestSuite(
  'Elias gamma coding',
  eliasGammaEncode,
  eliasGammaDecode,
  [
    [
      { alternative: false },
      [
        [1, '1'],
        [2, '010'],
        [3, '011'],
        [4, '00100'],
        [5, '00101'],
        [6, '00110'],
        [7, '00111'],
        [8, '0001000'],
        [9, '0001001'],
        [10, '0001010'],
        [11, '0001011'],
        [12, '0001100'],
        [13, '0001101'],
        [14, '0001110'],
        [15, '0001111'],
        [16, '000010000'],
        [17, '000010001'],
      ],
    ],
    [
      { alternative: true },
      [
        [1, '0'],
        [2, '100'],
        [3, '101'],
        [4, '11000'],
        [5, '11001'],
        [6, '11010'],
        [7, '11011'],
        [8, '1110000'],
        [9, '1110001'],
        [10, '1110010'],
        [11, '1110011'],
        [12, '1110100'],
        [13, '1110101'],
        [14, '1110110'],
        [15, '1110111'],
        [16, '111100000'],
        [17, '111100001'],
      ],
    ],
  ],
  [[{ alternative: false }, '101001', [[1, '1'], [2, '010'], [null, '01']]]],
  () => ({ alternative: Math.random() < 0.5 })
);

generateTestSuite(
  'Elias delta coding',
  eliasDeltaEncode,
  eliasDeltaDecode,
  [
    [
      { alternative: false },
      [
        [1, '1'],
        [2, '0100'],
        [3, '0101'],
        [4, '01100'],
        [5, '01101'],
        [6, '01110'],
        [7, '01111'],
        [8, '00100000'],
        [9, '00100001'],
        [10, '00100010'],
        [11, '00100011'],
        [12, '00100100'],
        [13, '00100101'],
        [14, '00100110'],
        [15, '00100111'],
        [16, '001010000'],
        [17, '001010001'],
      ],
    ],
    [
      { alternative: true },
      [
        [1, '0'],
        [2, '1000'],
        [3, '1001'],
        [4, '10100'],
        [5, '10101'],
        [6, '10110'],
        [7, '10111'],
        [8, '11000000'],
        [9, '11000001'],
        [10, '11000010'],
        [11, '11000011'],
        [12, '11000100'],
        [13, '11000101'],
        [14, '11000110'],
        [15, '11000111'],
        [16, '110010000'],
        [17, '110010001'],
      ],
    ],
  ],
  [
    [
      { alternative: false },
      '10100010',
      [[1, '1'], [2, '0100'], [null, '010']],
    ],
  ],
  () => ({ alternative: Math.random() < 0.5 })
);

generateTestSuite(
  'Elias omega coding',
  eliasOmegaEncode,
  eliasOmegaDecode,
  [
    [
      {},
      [
        [1, '0'],
        [2, '100'],
        [3, '110'],
        [4, '101000'],
        [5, '101010'],
        [6, '101100'],
        [7, '101110'],
        [8, '1110000'],
        [9, '1110010'],
        [10, '1110100'],
        [11, '1110110'],
        [12, '1111000'],
        [13, '1111010'],
        [14, '1111100'],
        [15, '1111110'],
        [16, '10100100000'],
        [17, '10100100010'],
        [100, '1011011001000'],
        [1000, '11100111111010000'],
        [10000, '111101100111000100000'],
        [100000, '1010010000110000110101000000'],
        [1000000, '1010010011111101000010010000000'],
      ],
    ],
  ],
  [[{}, '010011', [[1, '0'], [2, '100'], [null, '11']]]],
  () => ({})
);

generateTestSuite(
  'Golomb-Rice coding',
  golombRiceEncode,
  golombRiceDecode,
  [
    [
      { M: 10 },
      [
        [40, '11110000'],
        [41, '11110001'],
        [42, '11110010'],
        [43, '11110011'],
        [44, '11110100'],
        [45, '11110101'],
        [46, '111101100'],
        [47, '111101101'],
        [48, '111101110'],
        [49, '111101111'],
        [50, '111110000'],
      ],
    ],
    [
      { M: 1 },
      [
        [0, '0'],
        [1, '10'],
        [2, '110'],
        [3, '1110'],
        [4, '11110'],
        [5, '111110'],
        [6, '1111110'],
        [7, '11111110'],
        [8, '111111110'],
        [9, '1111111110'],
      ],
    ],
  ],
  [
    [{ M: 10 }, '111100101111', [[42, '11110010'], [null, '1111']]],
    [{ M: 10 }, '1111001011110', [[42, '11110010'], [null, '11110']]],
    [{ M: 10 }, '111100101111001', [[42, '11110010'], [null, '1111001']]],
    [{ M: 10 }, '1111001011110110', [[42, '11110010'], [null, '11110110']]],
  ],
  () => ({ M: Math.ceil(100 * Math.random()) })
);
