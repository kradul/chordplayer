
function ChordPlayer () {
	var self = this;
	this.chordNamer = new ChordNamer();
	this.progression = new Progression();
	this.progression.scale = new Scale();
	this.progression.tonic = midi_octave_notes[0]; //tonic = middle c

	this.load = function () {
		MIDI.loadPlugin({
			soundfontUrl: "./midi/soundfont/",
			instrument: "acoustic_grand_piano",
			callback: function(){
				//TODO make this set some variable indicating loading is done
				$("#play").removeAttr("disabled");
			}
		});
	};

	this.play_chord = function (){
		var degree = Math.floor((Math.random()*self.progression.scale.size())+1); //random number between 1 and scale size
		var chord = self.progression.get_chord(degree);

		MIDI.chordOn(0, chord, 127, 0);
		self.chordNamer.name_chord(degree);
		MIDI.chordOff(0, chord, 127, 1.75);
	};

	//for the timeout
	var intervalId;

	$("#play").click(function () {
		var delay = 0; // play one note every quarter second
		var note = self.progression.tonic; // the MIDI note
		var velocity = 127; // how hard the note hits
		// play the note
		MIDI.setVolume(0, 127);
		MIDI.noteOn(0, note, velocity, delay);
		MIDI.noteOff(0, note, delay + 0.75);

		intervalId = setInterval(self.play_chord, 1000);
	});

	$("#pause").click(function () {
		clearInterval(intervalId);
	});

}


$( document ).ready(function() {
	new ChordPlayer().load();
});

//start a local webserver python -m SimpleHTTPServer 8000


