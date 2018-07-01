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

const fretboardContainer = document.getElementsByTagName('main')[0].appendChild(document.createElement('div'));
fretboardContainer.className = 'fretboard-container';

const fretboard = fretboardContainer.appendChild(document.createElement('div'));
fretboard.className = 'fretboard';

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
    localStorage.setItem('frets', count);
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
    const frets = Array.from(document.getElementsByClassName('fretboard-fret-text'));

    if (key !== lastKey && lastScale && equalArray(lastScale, scale)) {
        let diff = key - lastKey;
        if (diff > 6) {
            diff -= 12;
        } else if (diff < -6) {
            diff += 12;
        }
        const newFretFretMap = [];
        const newNoteFretMap = Array(12);
        for (let i = 0; i < 12; i++) {
            newNoteFretMap[i] = [];
        }
        const fretsToRemove = [];
        setTimeout(function () {
            for (let fret of fretsToRemove) {
                fretboard.removeChild(fret);
            }
        }, 1000);

        for (let i = 0; i < fretFretMap.length; i++) {
            newFretFretMap[i + diff] = [];
            for (let fret of fretFretMap[i]) {
                let sum = 0;
                if (i + diff < 0) {
                    sum = 5 * (i + diff);
                    fretsToRemove.push(fret);
                    fret.classList.remove('selected');
                } else if (i + diff > fretWidths.length - 2) {
                    sum = 100 + 5 * (i + diff - fretWidths.length);
                    fretsToRemove.push(fret);
                    fret.classList.remove('selected');
                } else {
                    for (let j = 0; j < i + diff; j++) {
                        sum += fretWidths[j];
                    }
                    sum += fretWidths[i + diff] / 2;
                    newFretFretMap[i + diff].push(fret);

                    const currentNote = notes.indexOf(fret.textContent);
                    const newNote = mod(currentNote + diff, 12);
                    newNoteFretMap[newNote].push(fret);
                    fret.textContent = notes[newNote];
                }
                const translates = fret.style.transform.split(' ');
                translates[0] = `translateX(${sum * 9.6}px)`;
                fret.style.transform = translates.join(' ');
            }
        }

        function createFrets(from, to, startX) {
            let sum = 0;
            for (let i = 0; i < from; i++) {
                sum += fretWidths[i];
            }
            for (let i = from; i < to; i++) {
                newFretFretMap[i] = [];
                for (let j = 0; j < tuning.length; j++) {
                    const noteIndex = (tuning[tuning.length - 1 - j] + i) % 12;
                    const note = notes[noteIndex];

                    const fret = fretboard.appendChild(document.createElement('div'));
                    fret.className = 'fretboard-fret-text';
                    const y = 0.25 + 2 * j + 'em';
                    let x = 0;
                    if (startX === 0) {
                        x = 5 * (i - to);
                    } else {
                        x = 100 + 5 * (i - from);
                    }
                    fret.style.transform = `translate(${x * 9.6}px, ${y}) translateX(-50%)`;
                    fret.textContent = note;

                    newFretFretMap[i].push(fret);
                    newNoteFretMap[noteIndex].push(fret);

                    window.getComputedStyle(fret).transform;

                    const noteInScale = mod(noteIndex - key, 12);
                    if (noteIndex === key || scale.includes(noteInScale)) {
                        fret.classList.add('selected');
                    }
                    fret.style.transform = `translateX(${(sum + fretWidths[i] / 2) * 9.6}px) translateY(${y}) translateX(-50%)`;
                }
                sum += fretWidths[i];
            }
        }

        if (diff < 0) {
            createFrets(fretWidths.length + diff - 1, fretWidths.length - 1, 100);
        } else if (diff > 0) {
            createFrets(0, diff, 0);
        }

        noteFretMap = newNoteFretMap;
        fretFretMap = newFretFretMap;
    } else {
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
    }

    localStorage.setItem('scale', scale.join(','));
    localStorage.setItem('key', key);
    scaleSelect.value = scale.join(',');
    keySelect.value = key;

    lastScale = scale;
    lastKey = key;
}

function changeTuning(tuning, fretWidths) {
    fretboard.innerHTML = '';
    fretboard.style.height = 2 * tuning.length + 'em';

    for (let i = 0; i < 12; i++) {
        noteFretMap[i] = [];
    }

    fretFretMap = new Array(fretWidths.length);
    for (let i = 0; i < fretWidths.length; i++) {
        fretFretMap[i] = [];
    }

    for (let i = 0; i < tuning.length; i++) {
        const string = fretboard.appendChild(document.createElement('div'));
        string.className = 'fretboard-string';
        if (i >= Math.floor(tuning.length / 2)) {
            string.className += ' fretboard-string-wound';
        }
        string.style.height = 1 + i + 'px';
        string.style.top = 1 + 2 * i + 'em';
    }

    for (let i = 0; i < fretWidths.length; i++) {
        const fret = fretboard.appendChild(document.createElement('div'));
        fret.className = 'fretboard-fret';
        fret.style.width = fretWidths[i] + '%';

        if (i !== 0 && i !== fretWidths.length - 1) {
            if (i % 12 === 3 || i % 12 === 5 || i % 12 === 7 || i % 12 === 9) {
                fret.className += ' fretboard-fret-single-inlay';
            } else if (i % 12 === 0) {
                fret.className += ' fretboard-fret-double-inlays';
            }
        }

        if (i !== fretWidths.length - 1) {
            const actualFret = fret.appendChild(document.createElement('div'));
            actualFret.className = i === 0 ? 'fretboard-nut' : 'fretboard-actual-fret';

            const number = fret.appendChild(document.createElement('div'));
            number.className = 'fretboard-fret-number';
            number.textContent = i;
        }
    }

    let fretWidthSum = 0;

    for (let i = 0; i < fretWidths.length - 1; i++) {
        for (let j = 0; j < tuning.length; j++) {
            const noteIndex = (tuning[tuning.length - j - 1] + i) % 12;
            const note = notes[noteIndex];

            const fret = fretboard.appendChild(document.createElement('div'));
            fret.className = 'fretboard-fret-text';
            const x = (fretWidthSum + fretWidths[i] / 2) * 9.6 + 'px';
            const y = 0.25 + 2 * j + 'em';
            fret.style.transform = `translateX(${x}) translateY(${y}) translateX(-50%)`;
            fret.textContent = note;

            fretFretMap[i].push(fret);
            noteFretMap[noteIndex].push(fret);
        }

        fretWidthSum += fretWidths[i];
    }
    localStorage.setItem('tuning', tuningToString(tuning));
    tuningSelect.value = tuningToString(tuning);
}

const keySelect = document.getElementsByName('key')[0];
keySelect.addEventListener('change', event => {
    changeScale(parseScale(scaleSelect.value), +keySelect.value, generateFretWidths(+fretsInput.value), parseTuning(tuningSelect.value));
});

const scaleSelect = document.getElementsByName('scale')[0];
scaleSelect.addEventListener('change', event => {
    changeScale(parseScale(scaleSelect.value), +keySelect.value, generateFretWidths(+fretsInput.value), parseTuning(tuningSelect.value));
});

const fretsInput = document.getElementsByName('frets')[0];
fretsInput.addEventListener('change', event => {
    changeTuning(parseTuning(tuningSelect.value), generateFretWidths(+fretsInput.value));
    changeScale(parseScale(scaleSelect.value), +keySelect.value, generateFretWidths(+fretsInput.value), parseTuning(tuningSelect.value));
});

const tuningSelect = document.getElementsByName('tuning')[0];
tuningSelect.addEventListener('change', event => {
    changeTuning(parseTuning(tuningSelect.value), generateFretWidths(+fretsInput.value));
    changeScale(parseScale(scaleSelect.value), +keySelect.value, generateFretWidths(+fretsInput.value), parseTuning(tuningSelect.value));
});

changeTuning(
    parseTuning(localStorage.getItem('tuning') || tuningSelect.value || 'EADGBE'),
    generateFretWidths(parseInt(localStorage.getItem('frets') || fretsInput.value || '22'))
);
changeScale(
    parseScale(localStorage.getItem('scale') || scaleSelect.value || '2,4,5,7,9,11'),
    parseInt(localStorage.getItem('key') || keySelect.value || '0'),
    generateFretWidths(parseInt(localStorage.getItem('frets') || fretsInput.value || '22')),
    parseTuning(localStorage.getItem('tuning') || tuningSelect.value || 'EADGBE')
);
