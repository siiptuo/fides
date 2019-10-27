// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

const alphabet = ["C", "D", "E", "F", "G", "A", "B"];
const alphabetPitches = [0, 2, 4, 5, 7, 9, 11];
const notes = [
  ["B♯", "C", "D♭♭"],
  ["B♯♯", "C♯", "D♭"],
  ["C♯♯", "D", "E♭♭"],
  ["D♯", "E♭", "F♭♭"],
  ["D♯♯", "E", "F♭"],
  ["E♯", "F", "G♭♭"],
  ["E♯♯", "F♯", "G♭"],
  ["F♯♯", "G", "A♭♭"],
  ["G♯", "A♭"],
  ["G♯♯", "A", "B♭♭"],
  ["A♯", "B♭", "C♭♭"],
  ["A♯♯", "B", "C♭"]
];

export class Pitch {
  static listPitchClass(pitchClass) {
    return notes[pitchClass].map(n => new Pitch(n));
  }

  constructor(name) {
    this.letter = alphabet.indexOf(name[0]);
    if (name.length === 1) {
      this.modifier = 0;
    } else if (name.length === 2) {
      if (name[1] === "♯") {
        this.modifier = 1;
      } else if (name[1] === "♭") {
        this.modifier = -1;
      }
    } else if (name.length == 3) {
      if (name[1] === "♯" && name[2] === "♯") {
        this.modifier = 2;
      } else if (name[1] === "♭" && name[2] === "♭") {
        this.modifier = -2;
      }
    }
  }

  isDoubleFlat() {
    return this.modifier === -2;
  }

  isFlat() {
    return this.modifier === -1;
  }

  isNatural() {
    return this.modifier === 0;
  }

  isSharp() {
    return this.modifier === 1;
  }

  isDoubleSharp() {
    return this.modifier === 2;
  }

  getLetter() {
    return this.letter;
  }

  getPitchClass() {
    return (alphabetPitches[this.letter] + this.modifier) % 12;
  }

  toString() {
    if (this.isDoubleFlat()) {
      return alphabet[this.letter] + "♭♭";
    }
    if (this.isFlat()) {
      return alphabet[this.letter] + "♭";
    }
    if (this.isNatural()) {
      return alphabet[this.letter];
    }
    if (this.isSharp()) {
      return alphabet[this.letter] + "♯";
    }
    if (this.isDoubleSharp()) {
      return alphabet[this.letter] + "♯♯";
    }
  }
}
