// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

// Scale spelling algorithm is based on Bora, Uzay & Tezel, Barış & Vahaplar,
// Alper.  (2018). An Algorithm for Spelling the Pitches of Any Musical Scale.
// Information Sciences. 10.1016/j.ins.2018.09.015.  Preprint of the paper is
// available at https://www.researchgate.net/publication/327567188_An_Algorithm_for_Spelling_the_Pitches_of_Any_Musical_Scale.
//
// The basic idea of the algorithm is generating all possible spellings and
// then filtering them using five different criteria until there's one
// remaining (or more in special cases). The algorithm favors diatonicism over
// chromaticism (using as many unique letters as possible) and thus certain
// scales, such as the blues scale, may be considered incorrectly spelled.

import { Pitch } from './pitch.js';

// Return elements from `iterable` for which `fn` returns the maximum value.
function argMax(iterable, fn) {
  const iterator = iterable[Symbol.iterator]();
  const first = iterator.next().value;
  let max = fn(first);
  let values = [first];
  for (const x of iterator) {
    const m = fn(x);
    if (m == max) {
      values.push(x);
    } else if (m > max) {
      max = m;
      values = [x];
    }
  }
  return values;
}

// Return elements from `iterable` for which `fn` returns the minimum value.
function argMin(iterable, fn) {
  return argMax(iterable, x => -fn(x));
}

// Generate all possible spellings for `pitches`.
function* combinations(pitches, initial) {
  if (pitches.length == 0) {
    yield initial;
  } else {
    for (const pitch of Pitch.listPitchClass(pitches[0])) {
      yield* combinations(pitches.slice(1), [...initial, pitch]);
    }
  }
}

// Measure unique letters in pitch sequence.
function uniqueLetters(N) {
  let sum = 0;
  for (let i = 0; i < N.length - 1; i++) {
    for (let j = i + 1; j < N.length; j++) {
      if (N[i].getLetter() === N[j].getLetter()) {
        sum++;
      }
    }
  }
  return N.length - sum;
}

// Minimize the augmented and diminished intervals.
function augmentedDiminished(N) {
  let sum = 0;
  for (let i = 0; i < N.length - 1; i++) {
    for (let j = i + 1; j < N.length; j++) {
      const ci = N[i].getLetter();
      const cj = N[j].getLetter();
      const dc = ci >= cj ? ci - cj : ci - cj + 7;
      const si = N[i].getPitchClass();
      const sj = N[j].getPitchClass();
      const ds = si >= sj ? si - sj : si - sj + 12;
      if (dc == 0) {
        sum += 1;
      } else if ((dc == 1 || dc == 2) && ds > 2 * dc) {
        sum += ds - 2 * dc;
      } else if (
        (dc == 1 || dc == 2 || dc == 3 || dc == 4) &&
        ds < 2 * dc - 1
      ) {
        sum += 2 * dc - 1 - ds;
      } else if (
        (dc == 3 || dc == 4 || dc == 5 || dc == 6) &&
        ds > 2 * dc - 1
      ) {
        sum += ds - 2 * dc + 1;
      } else if ((dc == 5 || dc == 6) && ds < 2 * dc - 2) {
        sum += 2 * dc - 2 - ds;
      }
    }
  }
  return sum;
}

// Count naturals.
function naturals(N) {
  return N.filter(n => n.isNatural()).length;
}

// Count double flats and sharps.
function doubles(N) {
  return N.filter(n => n.isDoubleFlat() || n.isDoubleSharp()).length;
}

// Prefer sharps between naturals.
function between(N) {
  let sum = 0;
  for (let i = 0; i < N.length; i++) {
    if (
      N[i].isNatural() &&
      N[(i + 2) % N.length].isNatural() &&
      N[(i + 2) % N.length].getLetter() - N[i].getLetter() === 1 &&
      N[(i + 1) % N.length].isSharp()
    ) {
      sum++;
    }
  }
  return sum;
}

// Spell scale.
export function spellScale(scale, root) {
  let candidates = combinations(
    scale.map(pitchClass => (root.getPitchClass() + pitchClass) % 12),
    [root]
  );

  // phase 1
  candidates = argMax(candidates, uniqueLetters);
  if (candidates.length === 1) {
    return candidates[0];
  }

  // phase 2
  candidates = argMin(candidates, augmentedDiminished);
  if (candidates.length === 1) {
    return candidates[0];
  }

  // phase 3
  candidates = argMax(candidates, naturals);
  if (candidates.length === 1) {
    return candidates[0];
  }

  // phase 4
  candidates = argMin(candidates, doubles);
  if (candidates.length === 1) {
    return candidates[0];
  }

  // phase 5
  candidates = argMax(candidates, between);
  return candidates[0];
}
