'use strict';

const scales = {
    'ionian': [0, 2, 4, 5, 7, 9, 11],
    'dorian': [0, 2, 3, 5, 7, 9, 10],
    'phrygian': [0, 1, 3, 5, 7, 8, 10],
    'lydian': [0, 2, 4, 6, 7, 9, 11],
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'aeolian': [0, 2, 3, 5, 7, 8, 10],
    'locrian': [0, 1, 3, 5, 6, 8, 10]
};
const notes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const notes2 = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function parseTuning(input) {
    return input.split('').map(i => notes2.indexOf(i));
}

const fretboard = document.body.appendChild(document.createElement('div'));
fretboard.className = 'fretboard';

const noteFretMap = new Array(12);

function generateFretWidths(count) {
    const frets = new Array(count + 1);
    frets[0] = 50;
    let max = frets[0];
    for (let i = 1; i <= count; i++) {
        frets[i] = 100 * Math.pow(0.95, i);
        max += frets[i];
    }
    max /= 100;
    for (let i = 0; i <= count; i++) {
        frets[i] /= max;
    }
    return frets;
}

function changeScale(scale, key) {
    const frets = Array.from(document.getElementsByClassName('fretboard-fret2'));
    for (var fret of frets) {
        fret.classList.remove('selected');
    }
    for (let i = 0; i < scale.length; i++) {
        for (let fret of noteFretMap[(key + scale[i]) % 12]) {
            fret.classList.add('selected');
        }
    }
}

function changeTuning(tuning, fretWidths) {
    fretboard.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        noteFretMap[i] = [];
    }

    for (let i = 0; i < fretWidths.length; i++) {
        const fret = fretboard.appendChild(document.createElement('div'));
        fret.className = 'fretboard-fret';
        fret.style.width = fretWidths[i] + '%';

        for (let j = tuning.length - 1; j >= 0; j--) {
            const fret2 = fret.appendChild(document.createElement('div'));
            const noteIndex = (tuning[j] + i) % 12;
            const note = notes[noteIndex];
            fret2.className = 'fretboard-fret2';

            const text = fret2.appendChild(document.createElement('span'));
            text.className = 'fretboard-fret-text';
            text.textContent = note;
            noteFretMap[noteIndex].push(fret2);
        }

        const number = fret.appendChild(document.createElement('div'));
        number.textContent = i;
    }
}

const keySelect = document.getElementsByName('key')[0];
keySelect.addEventListener('change', event => {
    changeScale(scales[scaleSelect.value], +keySelect.value);
});

const scaleSelect = document.getElementsByName('scale')[0];
scaleSelect.addEventListener('change', event => {
    changeScale(scales[scaleSelect.value], +keySelect.value);
});

const fretsInput = document.getElementsByName('frets')[0];
fretsInput.addEventListener('change', event => {
    changeTuning(parseTuning(tuningSelect.value), generateFretWidths(+fretsInput.value));
    changeScale(scales[scaleSelect.value], +keySelect.value);
});

const tuningSelect = document.getElementsByName('tuning')[0];
tuningSelect.addEventListener('change', event => {
    changeTuning(parseTuning(tuningSelect.value), generateFretWidths(+fretsInput.value));
    changeScale(scales[scaleSelect.value], +keySelect.value);
});

changeTuning(parseTuning(tuningSelect.value), generateFretWidths(+fretsInput.value));
changeScale(scales[scaleSelect.value], +keySelect.value);
