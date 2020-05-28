
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
	this.progression.scale = new Scale(ScaleConstants.MAJOR_SCALE);
	this.progression.tonic = midi_octave_notes[0]; //tonic = middle c

	this.loaded = false; //whether loading MIDI stuff has finished
	this.intervalId; //storing the id of the pending call of the chord playing function (for setTimeout)

	this.load = function () {
    this.available_degrees = this.get_available_chords();
		MIDI.loadPlugin({
			soundfontUrl: "./midi/soundfont/",
			instrument: "acoustic_grand_piano",
			callback: function(){
				MIDI.setVolume(0, 127);

				self.loaded = true;
				//TODO make this set some variable indicating loading is done
				$("#play").removeAttr("disabled");
			}
		});
	};

	this.play_chord = function (){
		var degree = Utils.random_element(self.available_degrees);
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

	this.play_tonic = function () {
		var note = self.progression.tonic; // the MIDI note
		var velocity = 127; // how hard the note hits
		// play the note
		MIDI.noteOn(0, note, velocity, 0);
		MIDI.noteOff(0, note, 0.75);
	}

	this.play = function () {
		self.intervalId = setInterval(self.play_chord, self.period);
	}

	this.stop_play = function () {
		clearInterval(self.intervalId);
	}

  this.get_available_chords = function () {
    return $.map($(".chord-checkbox:checked"), function(element) {
      return parseInt(element.value);
    });
  }

	/*
	Binding buttons
	*/

	$("#play").click(function () {
		self.play_tonic();
		self.play();
		self.disable_play();
	});

	$("#change-key").click(function () {
		//pick a random new midi_ocatve_note
		self.progression.tonic = Utils.random_element(midi_octave_notes);
		self.stop_play();

		//wait for playing to actually end before starting new stuff
		setTimeout(function() {
			self.play_tonic();
			self.play();
			self.disable_play();
		}, 
		DELAY_POST_PERIOD);
	});

	$("#pause").click(function(){ 
		self.stop_play();
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

	$(".increment-button").click(function(){
		var slider_sel = $(this).attr('slider');
		var slider_node = $("#" + slider_sel);
		var dir = parseInt($(this).attr('dir'), 10);

		var curr_val = slider_node.slider( "option", "value" );
		var new_val = curr_val + dir * slider_node.slider( "option", "step" );

		/*check to not exceed max and min*/
		var max = slider_node.slider( "option", "max");
		new_val = new_val > max ? max : new_val;
		var min = slider_node.slider( "option", "min");
		new_val = new_val < min ? min : new_val;

		//update the val
		slider_node.slider( "option", "value", new_val );
	});

	$("#root-only-checkbox").change(function () {
		var root_only = $(this).is(":checked");
		self.progression.root_only = root_only;
	});

  $(".chord-checkbox").change(function () {
    self.available_degrees = self.get_available_chords();
  });

  $(".key_radio").change(function () {
    var key_name = $('input[name="key_radio"]:checked').val();
    switch(key_name) {
      case "major":
        self.progression.scale = new Scale(ScaleConstants.MAJOR_SCALE);
        break;
      case "harmonic_minor":
        self.progression.scale = new Scale(ScaleConstants.HARMONIC_MINOR_SCALE);
        break;
      case "natural_minor":
        self.progression.scale = new Scale(ScaleConstants.NATURAL_MINOR_SCALE);
        break;
      case "melodic_minor":
        self.progression.scale = new Scale(ScaleConstants.NATURAL_MINOR_SCALE);
        break;
      default:
        break;
    }
  });
}


$( document ).ready(function() {
	new ChordPlayer().load();
});

//start a local webserver python -m SimpleHTTPServer 8000


