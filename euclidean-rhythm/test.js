// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

const assert = require("assert");
const {
  euclideanRhythm,
  distanceSequence,
  subsets
} = require("./euclidean-rhythm");

describe("Euclidean rhythm", () => {
  describe("Edge cases", () => {
    it("E(2, 1) fails", () =>
      assert.throws(() => euclideanRhythm(2, 1), {
        message: "k must be less than or equal to n"
      }));
    it("E(1, 0) fails", () =>
      assert.throws(() => euclideanRhythm(1, 0), {
        message: "n must be positive"
      }));
    it("E(0, 0) fails", () =>
      assert.throws(() => euclideanRhythm(0, 0), {
        message: "n must be positive"
      }));
    it("E(-1, 5) fails", () =>
      assert.throws(() => euclideanRhythm(-1, 5), {
        message: "k must not be negative"
      }));
    it("E(1, -5) fails", () =>
      assert.throws(() => euclideanRhythm(1, -5), {
        message: "n must be positive"
      }));
    it("E(0, 5) works", () =>
      assert.strictEqual(euclideanRhythm(0, 5).join(""), "00000"));
    it("E(5, 5) works", () =>
      assert.strictEqual(euclideanRhythm(5, 5).join(""), "11111"));
  });

  describe("Property-based tests", () => {
    for (let i = 0; i < 20; i++) {
      const n = 1 + Math.floor(100 * Math.random());
      const k = Math.floor((n + 1) * Math.random());
      const m = n - k;
      it(`E(${k}, ${n}) works`, () => {
        const result = euclideanRhythm(k, n);
        assert.strictEqual(result.length, n);
        assert.strictEqual(k, result.filter(b => b === 1).length);
        assert.strictEqual(m, result.filter(b => b === 0).length);
      });
    }
  });

  // Examples taken from "The Euclidean Algorithm Generates Traditional
  // Musical Rhythms" by Godfried Toussaint
  // http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf
  describe("Toussaint's examples", () => {
    [
      [1, 2, "10"],
      [1, 3, "100"],
      [1, 4, "1000"],
      [4, 12, "100100100100"],
      [1, 3, "100"],
      [4, 12, "100100100100"],
      [2, 3, "101"],
      [2, 5, "10100"],
      [3, 4, "1011"],
      [3, 5, "10101"],
      [3, 7, "1010100"],
      [3, 8, "10010010"],
      [4, 7, "1010101"],
      [4, 9, "101010100"],
      [4, 11, "10010010010"],
      [5, 6, "101111"],
      [5, 7, "1011011"],
      [5, 8, "10110110"],
      [5, 9, "101010101"],
      [5, 11, "10101010100"],
      [5, 12, "100101001010"],
      [5, 13, "1001010010100"],
      // Mistake in print, extra dot
      [5, 16, "1001001001001000"],
      [7, 8, "10111111"],
      [7, 12, "101101011010"],
      [7, 16, "1001010100101010"],
      [9, 16, "1011010101101010"],
      [11, 24, "100101010101001010101010"],
      [13, 24, "101101010101011010101010"]
    ].forEach(([k, n, expected]) =>
      it(`E(${k}, ${n}) works`, () => {
        assert.strictEqual(euclideanRhythm(k, n).join(""), expected);
      })
    );
  });
});

describe("Distance sequence notation", () => {
  it("works", () =>
    assert.deepStrictEqual(
      distanceSequence([1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0]),
      [3, 3, 4, 2, 4]
    ));
});

describe("Subset notation", () => {
  it("works", () =>
    assert.deepStrictEqual(
      subsets([1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0]),
      [0, 3, 6, 10, 12]
    ));
});
