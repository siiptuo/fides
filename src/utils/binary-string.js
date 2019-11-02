// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

class BinaryString {
  static fromArray(array) {
    const string = new BinaryString();
    string.data = array;
    return string;
  }

  static fromInteger(x) {
    return BinaryString.fromArray(
      x
        .toString(2)
        .split('')
        .map(s => +s)
    );
  }

  static fromString(x) {
    return BinaryString.fromArray(x.split('').map(s => +s));
  }

  static withLength(n) {
    return BinaryString.fromArray(new Array(n).fill(0));
  }

  at(i) {
    return this.data[i];
  }

  concat(other) {
    return BinaryString.fromArray([...this.data, ...other.data]);
  }

  prepend(bit) {
    return BinaryString.fromArray([bit, ...this.data]);
  }

  append(bit) {
    return BinaryString.fromArray([...this.data, bit]);
  }

  slice(a, b) {
    return BinaryString.fromArray(this.data.slice(a, b));
  }

  split(i) {
    return [this.slice(0, i), this.slice(i)];
  }

  length() {
    return this.data.length;
  }

  toString() {
    return this.data.join('');
  }

  toInteger() {
    return parseInt(this.toString(), 2);
  }
}

module.exports = { BinaryString };
