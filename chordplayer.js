
//various variables relating to period (in milliseconds) at which chords are played
var DEFAULT_PERIOD = 2000;
var MIN_PERIOD = 1000;
var MAX_PERIOD = 3000;
var PERIOD_INCR = 300;

//various variables relating to delay (in milliseconds), time after which chord name is announced
var DEFAULT_DELAY = 1000;
var MIN_DELAY = 0; 
//no max delay because the delay is not allwed to be longer than the period
var DELAY_INCR = 300;
var DELAY_POST_PERIOD = 600; /*approximately the amount of time it takes to name a chord, 
buffer period so that a chord is not still being named when a new chord starts playing
DON'T change this to be larger than the minimum period*/

function ChordPlayer () {
	var self = this;
	this.period = DEFAULT_PERIOD; //time between chord play in milliseconds
	this.delay = DEFAULT_DELAY; //time after chord that name is played
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

	this.get_max_delay = function () {
		//do not allow the delay to be longer than the period
		return self.period - DELAY_POST_PERIOD; //enough time for the chord to be named
	}

	this.update_delay = function (period) {
		/*update the delay slider and the actual delay based on the period*/ 
		var max_delay = self.get_max_delay();
		$("#delay_slider").slider('option', 'max', max_delay);
		//do not allow the delay to be larger than the new max
		self.delay = self.delay > max_delay ? max_delay : self.delay;
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
		self.update_delay(); 

		//if currently playing, reset play_chord to be called on the new period 
		if(self.is_playing()){
			clearInterval(self.intervalId);
			self.intervalId = setInterval(self.play_chord, self.period);
		}
	});

	$("#delay_slider").slider({
		min: MIN_DELAY,
		max: self.get_max_delay(), 
		step: DELAY_INCR,
		value: self.delay
	});

	$("#delay_slider").bind('slidechange', function(event, ui) {
		self.delay = ui.value;
	});

}


$( document ).ready(function() {
	new ChordPlayer().load();
});

//start a local webserver python -m SimpleHTTPServer 8000


