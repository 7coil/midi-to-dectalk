const midiconvert = require('midiconvert');
const fs = require('fs');
const { parse } = require('note-parser');

const file = process.argv.find(arg => arg.endsWith('.mid') || arg.endsWith('.midi'));
if (!file) {
	console.log('Please provide a MIDI file');
	process.exit(1);
}

const midi = midiconvert.parse(fs.readFileSync(file, 'binary'));
const length = Math.floor(midi.duration * 1000);

midi.tracks.forEach((track, trackid) => {
	let i;
	let dectalk = '[:phone on]';
	let silence = 0;
	for (i = 0; i < length; i += 1) {
		// Find the first note that could fit in this part of the track
		const part = track.notes.find(note => Math.floor(note.time * 1000) === i); // eslint-disable-line

		if (part) {
			// If there was silence before it, add the silence on
			if (silence) {
				dectalk += `[_<${silence},1>]`;
				silence = 0;
			}

			// Add the note
			const freq = Math.floor(parse(part.name).freq);
			const duration = Math.floor(part.duration * 1000);
			dectalk += `[:tone ${freq},${duration}]\n`;
			i += duration;
		} else {
			// Note not found - Check the next note, and add a millisecond of silence
			silence += 1;
		}
	}
	fs.writeFileSync(`${trackid}.txt`, dectalk);
});
