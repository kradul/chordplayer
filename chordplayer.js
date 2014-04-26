
$( document ).ready(function() {
	MIDI.loadPlugin({
			soundfontUrl: "./midi/soundfont/",
			instrument: "acoustic_grand_piano",
			callback: function(){
				//TODO make this set some variable indicating loading is done
				$("#play").removeAttr("disabled");
			}
		});

	var generate_chord = function (progression){
		var degree = Math.floor((Math.random()*progression.scale.size())+1); //random number between 1 and scale size
		var chord = progression.get_chord(degree);

		MIDI.chordOn(0, chord, 127, 0);
		MIDI.chordOff(0, chord, 127, 1.75);
	}

	//for the timeout
	var intervalId;

	$("#play").click(function () {
		new Audio('./Interlude2.mp3').play();

		/*
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

		intervalId = setInterval(function() { generate_chord(p); }, 1000);
		*/
	});

	$("#pause").click(function () {
		clearInterval(intervalId);
	});

});

//start a local webserver python -m SimpleHTTPServer 8000


