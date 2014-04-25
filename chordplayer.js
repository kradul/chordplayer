
$( document ).ready(function() {
	MIDI.loadPlugin({
			soundfontUrl: "./midi/soundfont/",
			instrument: "acoustic_grand_piano",
			callback: function(){
				//TODO make this set some variable indicating loading is done
			}
		});

	var generate_chord = function (progression){
		var degree = Math.floor((Math.random()*progression.scale.size())+1); //random number between 1 and scale size
		var chord = progression.get_chord(degree);

		MIDI.chordOn(0, chord, 127, 0);
		MIDI.chordOff(0, chord, 127, 1.75);
	}

	$("#play").click(function () {
		var p = new Progression();
		p.scale = new Scale();
		p.tonic = midi_octave_notes[0]; //tonic = middle c


		var delay = 0; // play one note every quarter second
		var note = p.tonic; // the MIDI note
		var velocity = 127; // how hard the note hits
		// play the note
		MIDI.setVolume(0, 127);
		MIDI.noteOn(0, note, velocity, delay);
		MIDI.noteOff(0, note, delay + 0.75);

		/*
		var subdom = p.get_chord(5);

		MIDI.chordOn(0, subdom, velocity, delay + 1);
		MIDI.chordOff(0, subdom, delay + 1.75);
		*/

		setInterval(generate_chord(p),1000);
	});

	$("#pause").click(function () {
		clearInterval();
	});

});

//start a local webserver python -m SimpleHTTPServer 8000



	// teoria.note.getNoteMIDI  = function (note) {
		
	// 		var midiValue = (note.noteOctave + 1) * 12;
		
	// 		switch (note.noteId) {
				
	// 			case 0:
	// 				midiValue += note.noteAccidental;
	// 				break;
	// 			case 1:
	// 				midiValue += note.noteAccidental + 2;
	// 				break;
	// 			case 2:
	// 				midiValue += note.noteAccidental + 4;
	// 				break;
	// 			case 3:
	// 				midiValue += note.noteAccidental + 5;
	// 				break;
	// 			case 4:
	// 				midiValue += note.noteAccidental + 7;
	// 				break;
	// 			case 5:
	// 				midiValue += note.noteAccidental + 9;
	// 				break;
	// 			case 6:
	// 				midiValue += note.noteAccidental + 11;
	// 				break;
	// 		}
			
	// 		return midiValue;	
	// 	};

