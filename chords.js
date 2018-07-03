const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function parseChord(input) {
    const match = input.match(/^([A-G][b#]?)(.*)$/i);
    const root = notes.indexOf(match[1]);
    const modifier = match[2];
    if (modifier === '') {
        return [root, (root + 4) % 12, (root + 7) % 12];
    } else if (modifier === 'm') {
        return [root, (root + 3) % 12, (root + 7) % 12];
    }
}

function generateChord(tuning, frets, notes, usedNotes, fingering) {
    if (fingering.length === tuning.length) {
        return Object.keys(usedNotes).length === notes.length ? [fingering] : [];
    }

    const string = fingering.length;

    const reach = 4;
    const min = Math.max(0, Math.max(...fingering) - (reach - 1));
    const max = Math.min(Math.min(...fingering.filter(x => x > 0)) + (reach - 1), frets);

    let fingerings = [];

    // Open string
    if (min > 0 && notes.includes(tuning[string])) {
        fingerings = [...fingerings, ...generateChord(tuning, frets, notes, {...usedNotes, [tuning[string]]: true}, [...fingering, 0])];
    }

    // Muted string
    fingerings = [...fingerings, ...generateChord(tuning, frets, notes, usedNotes, [...fingering, -1])];

    // Fretted note
    for (let fret = min; fret <= max; fret++) {
        const note = (tuning[string] + fret) % 12;
        if (notes.includes(note)) {
            fingerings = [...fingerings, ...generateChord(tuning, frets, notes, {...usedNotes, [note]: true}, [...fingering, fret])];
        }
    }

    return fingerings;
}

function generateChords(tuning, frets, notes) {
    const rootNote = notes[0];

    let chords = [];
    for (let string = 0; string < tuning.length - notes.length; string++) {
        for (let fret = 0; fret < frets; fret++) {
            const note = (tuning[string] + fret) % 12;
            if (note === rootNote) {
                chords = [...chords, ...generateChord(tuning, frets, notes, {[note]: true}, [...Array(string).fill(-1), fret])];
            }
        }
    }

    console.log(JSON.stringify(chords));
    return chords;
}

function render(strings) {
    const endFret = Math.max(...strings.filter(s => s > 0));
    const startFret = endFret <= 4 ? 0 : Math.min(...strings.filter(s => s > 0));
    console.log(strings, startFret);
    const fretWidth = 10;
    const fretHeight = 18;
    const frets = 4;
    const radius = 4;
    const fontSize = 8;
    let output = '<svg width="' + ((fretWidth + 3) * strings.length) + '" height="' + ((frets + 1.5) * fretHeight) + '">';
    if (startFret !== 0) {
        output += '<text x="' + (1.5 * fretWidth - 6) + '" y="' + (fretHeight + fontSize) + '" font-size="' + fontSize + '" text-anchor="end">' + startFret + '</text>';
    }
    output += '<g transform="translate(' + (fretWidth) + ')">';
    for (let x = 0; x < strings.length; x++) {
        for (let y = 0; y < frets + 1; y++) {
            output += '<line x1="' + radius + '" y1="' + ((y + 1) * fretHeight) + '" x2="' + ((strings.length - 1) * fretWidth + radius) + '" y2="' + ((y + 1) * fretHeight) + '" stroke-width="1" stroke="black" stroke-linecap="round" />'
        }
        output += '<line x1="' + (x * fretWidth + radius) + '" y1="' + fretHeight + '" x2="' + (x * fretWidth + radius) + '" y2="' + (fretHeight * (frets + 1)) + '" stroke-width="1" stroke="black" stroke-linecap="round" />';

        if (strings[x] == -1) {
            const cx = x * fretWidth + radius;
            const cy = fretHeight / 2
            const r = 2.83;
            output += '<line x1="' + (cx - r) + '" y1="' + (cy - r) + '" x2="' + (cx + r) +'" y2="' + (cy + r)+ '" stroke-width="1" stroke="black" stroke-linecap="round" />';
            output += '<line x1="' + (cx - r) + '" y1="' + (cy + r) + '" x2="' + (cx + r) +'" y2="' + (cy - r)+ '" stroke-width="1" stroke="black" />';
        } else if (strings[x] == 0) {
            output += '<circle cx="' + (x * fretWidth + radius) + '" cy="' + (fretHeight / 2) + '" r="' + (radius - 0.5) + '" stroke="black" stroke-width="1" fill="none" stroke-linecap="round" />';
        } else {
            const displayFret = strings[x] - startFret + (startFret ? 1 : 0);
            output += '<circle cx="' + (x * fretWidth + radius) + '" cy="' + (fretHeight / 2 + displayFret * fretHeight) + '" r="' + radius + '" />';
        }
    }
    output += '</g>';
    output += '</svg>';
    return output;
}

const tuning = [4, 9, 2, 7, 11, 4];
const frets = 22;

const $chord = document.getElementsByName('chord')[0];
const $output = document.getElementsByTagName('output')[0];

document.forms[0].addEventListener('submit', event => {
    event.preventDefault();
    const chord = parseChord($chord.value);
    const chords = generateChords(tuning, frets, chord);
    $output.innerHTML = chords.map(render).join('');
});