
//various variables relating to period (in milliseconds) at which chords are played
var DEFAULT_PERIOD = 2000;
var MIN_PERIOD = 1000;
var MAX_PERIOD = 3000;
var PERIOD_INCR = 300;

function ChordPlayer () {
	var self = this;
	this.period = DEFAULT_PERIOD; //time between chord play in milliseconds
	this.delay = 1000; //time after chord that name is played
	this.chordNamer = new ChordNamer();
	this.progression = new Progression();
	this.progression.scale = new Scale();
	this.progression.tonic = midi_octave_notes[0]; //tonic = middle c
	

	this.loaded = false; //whether loading MIDI stuff has finished
	this.intervalId; //storing the id of the pending call of the chord playing function (for setTimeout)

	this.load = function () {
		MIDI.loadPlugin({
			soundfontUrl: "./midi/soundfont/",
			instrument: "acoustic_grand_piano",
			callback: function(){
				self.loaded = true;
				//TODO make this set some variable indicating loading is done
				$("#play").removeAttr("disabled");
			}
		});
	};

	this.play_chord = function (){
		var degree = Math.floor((Math.random()*self.progression.scale.size())+1); //random number between 1 and scale size
		var chord = self.progression.get_chord(degree);

		MIDI.chordOn(0, chord, 127, 0);
		MIDI.chordOff(0, chord, 127, 1.75);
		setTimeout(function() { self.chordNamer.name_chord(degree); }, self.delay);
	};

	
	this.is_playing = function () {
		return self.loaded & Boolean($("#play").attr("disabled"));
	};

	this.enable_play = function () {
		$("#play").removeAttr("disabled");
	}

	this.disable_play = function () {
		$("#play").attr("disabled", "disabled");
	}

	/*
	Binding buttons
	*/

	$("#play").click(function () {
		var delay = 0; 
		var note = self.progression.tonic; // the MIDI note
		var velocity = 127; // how hard the note hits
		// play the note
		MIDI.setVolume(0, 127);
		MIDI.noteOn(0, note, velocity, delay);
		MIDI.noteOff(0, note, delay + 0.75);

		self.intervalId = setInterval(self.play_chord, self.period);
		self.disable_play();
	});

	$("#pause").click(function () {
		clearInterval(self.intervalId);
		self.enable_play();
	});

	$("#period_slider").slider({
		min: MIN_PERIOD,
		max: MAX_PERIOD,
		step: PERIOD_INCR,
		value: self.period
	});

	$("#period_slider").bind('slidechange', function(event, ui) {
		self.period = ui.value;

		//if currently playing, reset play_chord to be called on the new period 
		if(self.is_playing()){
			clearInterval(self.intervalId);
			self.intervalId = setInterval(self.play_chord, self.period);
		}
	});

}


$( document ).ready(function() {
	new ChordPlayer().load();
});

//start a local webserver python -m SimpleHTTPServer 8000


