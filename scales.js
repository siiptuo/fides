"use strict";

const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const notes2 = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
];
const alphabet = ["C", "D", "E", "F", "G", "A", "B"];
const notes3 = [
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

function* combinations(scale, offset, string) {
  if (scale.length == 0) {
    yield string;
  } else {
    for (const note of notes3[(scale[0] + offset) % 12]) {
      yield* combinations(scale.slice(1), offset, [...string, note]);
    }
  }
}

function argMax(it, fn) {
  it = it[Symbol.iterator]();
  const first = it.next().value;
  let max = fn(first);
  let values = [first];
  for (const x of it) {
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

function argMin(it, fn) {
  return argMax(it, x => -fn(x));
}

function uniqueLetters(N) {
  let sum = 0;
  for (let i = 0; i < N.length - 1; i++) {
    for (let j = i + 1; j < N.length; j++) {
      if (N[i][0] === N[j][0]) {
        sum++;
      }
    }
  }
  return N.length - sum;
}

function augmentedDimished(N) {
  let sum = 0;
  for (let i = 0; i < N.length - 1; i++) {
    for (let j = i + 1; j < N.length; j++) {
      const ci = alphabet.indexOf(N[i][0]);
      const cj = alphabet.indexOf(N[j][0]);
      const dc = ci >= cj ? ci - cj : ci - cj + alphabet.length;
      const si = notes3.findIndex(n => n.includes(N[i]));
      const sj = notes3.findIndex(n => n.includes(N[j]));
      const ds = si >= sj ? si - sj : si - sj + notes3.length;
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

function naturals(N) {
  return N.filter(n => n.length == 1).length;
}

function doubles(N) {
  return N.filter(n => n.length == 3).length;
}

function between(N) {
  let sum = 0;
  for (let i = 0; i < N.length; i++) {
    if (
      N[i].length === 1 &&
      N[(i + 2) % N.length].length === 1 &&
      alphabet.indexOf(N[(i + 2) % N.length][0]) - alphabet.indexOf(N[i][0]) ===
        1 &&
      N[(i + 1) % N.length].length == 2 &&
      N[(i + 1) % N.length][1] === "♯"
    ) {
      sum++;
    }
  }
  return sum;
}

function spell(scale, offset, root) {
  let candidates = combinations(scale, offset, [root]);

  // phase 1
  candidates = argMax(candidates, uniqueLetters);
  if (candidates.length === 1) return candidates[0];

  // phase 2
  candidates = argMin(candidates, augmentedDimished);
  if (candidates.length === 1) return candidates[0];

  // phase 3
  candidates = argMax(candidates, naturals);
  if (candidates.length === 1) return candidates[0];

  // phase 4
  candidates = argMin(candidates, doubles);
  if (candidates.length === 1) return candidates[0];

  // phase 5
  candidates = argMax(candidates, between);
  return candidates[0];
}

function parseTuning(input) {
  return input.split("").map(i => notes2.indexOf(i));
}

function tuningToString(tuning) {
  return tuning.map(x => notes2[x]).join("");
}

function parseScale(str) {
  return str.split(",").map(x => +x);
}

const fretboardContainer = document
  .getElementsByTagName("main")[0]
  .appendChild(document.createElement("div"));
fretboardContainer.className = "fretboard-container";

const fretboard = fretboardContainer.appendChild(document.createElement("div"));
fretboard.className = "fretboard";

let noteFretMap = new Array(12);
let fretFretMap;

function generateFretWidths(count) {
  const frets = new Array(count + 2);
  frets[0] = 50;
  let max = frets[0];
  for (let i = 1; i <= count; i++) {
    frets[i] = 100 * Math.pow(0.95, i);
    max += frets[i];
  }
  frets[count + 1] = 20;
  max += frets[count + 1];
  max /= 100;
  for (let i = 0; i < count + 2; i++) {
    frets[i] /= max;
  }
  localStorage.setItem("frets", count);
  fretsInput.value = count;
  return frets;
}

function equalArray(a1, a2) {
  return a1.length === a2.length && a1.every((v, i) => v === a2[i]);
}

function mod(a, n) {
  return ((a % n) + n) % n;
}

let lastScale;
let lastKey;

function changeScale(scale, key, fretWidths, tuning) {
  const frets = Array.from(
    document.getElementsByClassName("fretboard-fret-text")
  );

  for (var fret of frets) {
    fret.classList.remove("selected");
  }
  for (let fret of noteFretMap[key]) {
    fret.classList.add("selected");
  }
  for (let i = 0; i < scale.length; i++) {
    for (let fret of noteFretMap[(key + scale[i]) % 12]) {
      fret.classList.add("selected");
    }
  }
  for (const note of spell(scale, key, notes[key])) {
    const i = notes3.findIndex(n => n.includes(note));
    for (const fret of noteFretMap[i]) {
      fret.textContent = note;
    }
  }

  localStorage.setItem("scale", scale.join(","));
  localStorage.setItem("key", key);
  scaleSelect.value = scale.join(",");
  keySelect.value = key;

  lastScale = scale;
  lastKey = key;
}

function changeTuning(tuning, fretWidths) {
  fretboard.innerHTML = "";
  fretboard.style.height = 2 * tuning.length + "em";

  for (let i = 0; i < 12; i++) {
    noteFretMap[i] = [];
  }

  fretFretMap = new Array(fretWidths.length);
  for (let i = 0; i < fretWidths.length; i++) {
    fretFretMap[i] = [];
  }

  for (let i = 0; i < tuning.length; i++) {
    const string = fretboard.appendChild(document.createElement("div"));
    string.className = "fretboard-string";
    if (i >= Math.floor(tuning.length / 2)) {
      string.className += " fretboard-string-wound";
    }
    string.style.height = 1 + i + "px";
    string.style.top = 1 + 2 * i + "em";
  }

  for (let i = 0; i < fretWidths.length; i++) {
    const fret = fretboard.appendChild(document.createElement("div"));
    fret.className = "fretboard-fret";
    fret.style.width = fretWidths[i] + "%";

    if (i !== 0 && i !== fretWidths.length - 1) {
      if (i % 12 === 3 || i % 12 === 5 || i % 12 === 7 || i % 12 === 9) {
        fret.className += " fretboard-fret-single-inlay";
      } else if (i % 12 === 0) {
        fret.className += " fretboard-fret-double-inlays";
      }
    }

    if (i !== fretWidths.length - 1) {
      const actualFret = fret.appendChild(document.createElement("div"));
      actualFret.className =
        i === 0 ? "fretboard-nut" : "fretboard-actual-fret";

      const number = fret.appendChild(document.createElement("div"));
      number.className = "fretboard-fret-number";
      number.textContent = i;
    }
  }

  let fretWidthSum = 0;

  for (let i = 0; i < fretWidths.length - 1; i++) {
    for (let j = 0; j < tuning.length; j++) {
      const noteIndex = (tuning[tuning.length - j - 1] + i) % 12;
      const note = notes[noteIndex];

      const fret = fretboard.appendChild(document.createElement("div"));
      fret.className = "fretboard-fret-text";
      const x = (fretWidthSum + fretWidths[i] / 2) * 9.6 + "px";
      const y = 0.25 + 2 * j + "em";
      fret.style.transform = `translateX(${x}) translateY(${y}) translateX(-50%)`;
      fret.textContent = note;

      fretFretMap[i].push(fret);
      noteFretMap[noteIndex].push(fret);
    }

    fretWidthSum += fretWidths[i];
  }
  localStorage.setItem("tuning", tuningToString(tuning));
  tuningSelect.value = tuningToString(tuning);
}

const keySelect = document.getElementsByName("key")[0];
keySelect.addEventListener("change", event => {
  changeScale(
    parseScale(scaleSelect.value),
    +keySelect.value,
    generateFretWidths(+fretsInput.value),
    parseTuning(tuningSelect.value)
  );
});

const scaleSelect = document.getElementsByName("scale")[0];
scaleSelect.addEventListener("change", event => {
  changeScale(
    parseScale(scaleSelect.value),
    +keySelect.value,
    generateFretWidths(+fretsInput.value),
    parseTuning(tuningSelect.value)
  );
});

const fretsInput = document.getElementsByName("frets")[0];
fretsInput.addEventListener("change", event => {
  changeTuning(
    parseTuning(tuningSelect.value),
    generateFretWidths(+fretsInput.value)
  );
  changeScale(
    parseScale(scaleSelect.value),
    +keySelect.value,
    generateFretWidths(+fretsInput.value),
    parseTuning(tuningSelect.value)
  );
});

const tuningSelect = document.getElementsByName("tuning")[0];
tuningSelect.addEventListener("change", event => {
  changeTuning(
    parseTuning(tuningSelect.value),
    generateFretWidths(+fretsInput.value)
  );
  changeScale(
    parseScale(scaleSelect.value),
    +keySelect.value,
    generateFretWidths(+fretsInput.value),
    parseTuning(tuningSelect.value)
  );
});

changeTuning(
  parseTuning(localStorage.getItem("tuning") || tuningSelect.value || "EADGBE"),
  generateFretWidths(
    parseInt(localStorage.getItem("frets") || fretsInput.value || "22")
  )
);
changeScale(
  parseScale(
    localStorage.getItem("scale") || scaleSelect.value || "2,4,5,7,9,11"
  ),
  parseInt(localStorage.getItem("key") || keySelect.value || "0"),
  generateFretWidths(
    parseInt(localStorage.getItem("frets") || fretsInput.value || "22")
  ),
  parseTuning(localStorage.getItem("tuning") || tuningSelect.value || "EADGBE")
);
