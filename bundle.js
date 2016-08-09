'use strict';

const notes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const notes2 = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function parseTuning(input) {
    return input.split('').map(i => notes2.indexOf(i));
}

function tuningToString(tuning) {
    return tuning.map(x => notes2[x]).join('');
}

function parseScale(str) {
    return str.split(',').map(x => +x);
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
    localStorage.setItem('frets', count);
    fretsInput.value = count;
    return frets;
}

function changeScale(scale, key) {
    const frets = Array.from(document.getElementsByClassName('fretboard-fret-text'));
    for (var fret of frets) {
        fret.classList.remove('selected');
    }
    for (let fret of noteFretMap[key]) {
        fret.classList.add('selected');
    }
    for (let i = 0; i < scale.length; i++) {
        for (let fret of noteFretMap[(key + scale[i]) % 12]) {
            fret.classList.add('selected');
        }
    }
    localStorage.setItem('scale', scale.join(','));
    localStorage.setItem('key', key);
    scaleSelect.value = scale.join(',');
    keySelect.value = key;
}

function changeTuning(tuning, fretWidths) {
    fretboard.innerHTML = '';
    fretboard.style.height = 2 * tuning.length + 'em';

    for (let i = 0; i < 12; i++) {
        noteFretMap[i] = [];
    }

    for (let j = tuning.length - 1; j >= 0; j--) {
        const string = fretboard.appendChild(document.createElement('div'));
        string.className = 'fretboard-string';
        if (j >= Math.floor(tuning.length / 2)) {
            string.className += ' fretboard-string-wound';
        }
        string.style.height = 1 + j + 'px';
        string.style.top = 1 + (2) * j + 'em';
    }

    for (let i = 0; i < fretWidths.length; i++) {
        const fret = fretboard.appendChild(document.createElement('div'));
        fret.className = 'fretboard-fret';
        fret.style.width = fretWidths[i] + '%';

        const actualFret = fret.appendChild(document.createElement('div'));
        actualFret.className = i === 0 ? 'fretboard-nut' : 'fretboard-actual-fret';

        const number = fret.appendChild(document.createElement('div'));
        number.className = 'fretboard-fret-number';
        number.textContent = i;
    }

    let fretWidthSum = 0;

    for (let i = 0; i < fretWidths.length; i++) {
        for (let j = tuning.length - 1; j >= 0; j--) {
            const noteIndex = (tuning[j] + i) % 12;
            const note = notes[noteIndex];

            const fret = fretboard.appendChild(document.createElement('div'));
            fret.className = 'fretboard-fret-text';
            fret.style.top = 0.25 + 2 * j + 'em';
            fret.style.left = fretWidthSum + fretWidths[i] / 2 + '%';
            fret.textContent = note;

            noteFretMap[noteIndex].push(fret);
        }

        fretWidthSum += fretWidths[i];
    }
    localStorage.setItem('tuning', tuningToString(tuning));
    tuningSelect.value = tuningToString(tuning);
}

const keySelect = document.getElementsByName('key')[0];
keySelect.addEventListener('change', event => {
    changeScale(parseScale(scaleSelect.value), +keySelect.value);
});

const scaleSelect = document.getElementsByName('scale')[0];
scaleSelect.addEventListener('change', event => {
    changeScale(parseScale(scaleSelect.value), +keySelect.value);
});

const fretsInput = document.getElementsByName('frets')[0];
fretsInput.addEventListener('change', event => {
    changeTuning(parseTuning(tuningSelect.value), generateFretWidths(+fretsInput.value));
    changeScale(parseScale(scaleSelect.value), +keySelect.value);
});

const tuningSelect = document.getElementsByName('tuning')[0];
tuningSelect.addEventListener('change', event => {
    changeTuning(parseTuning(tuningSelect.value), generateFretWidths(+fretsInput.value));
    changeScale(parseScale(scaleSelect.value), +keySelect.value);
});

changeTuning(
    parseTuning(localStorage.getItem('tuning') || tuningSelect.value || 'EADGBE'),
    generateFretWidths(parseInt(localStorage.getItem('frets') || fretsInput.value || '22'))
);
changeScale(
    parseScale(localStorage.getItem('scale') || scaleSelect.value || '2,4,5,7,9,11'),
    parseInt(localStorage.getItem('key') || keySelect.value || '0')
);
