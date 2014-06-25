
function Progression () {
	var self = this;
	this.tonic; //specified as a midi_octave number
	this.scale;

	this.get_triad_degrees = function (chord_degree) {
		//defines a chord as a triad separated by thirds
		return [chord_degree, self.scale.get_degree(chord_degree+2), self.scale.get_degree(chord_degree+4)];
	};

	this.get_triad_intervals = function (triad_degrees) {
		/*triad_degrees - degree in the scale of each note in the triad (ex. 2nd, 4th, 6th)*/
		//return the interval (number of half steps) above the root each degree is
		var chord = new Chord({"degrees": triad_degrees, "scale": self.scale});
		var intervals = chord.voice(); //create a random voicing of this chord
		return intervals;
	};

	this.get_midi_octave_notes = function(intervals) {
		/*intervals - number of half steps each note is above the root of the scale*/
		//return a set of midi notes for this chord, with the root of the chord being in the midi_octave
		var midi_chord = intervals.map(function(interval) {
			return self.tonic + interval;
		});

		return midi_chord;
	}

	this.get_chord = function (chord_degree){
		var degrees = this.get_triad_degrees(chord_degree);
		var intervals = this.get_triad_intervals(degrees);
		var midi_notes = this.get_midi_octave_notes(intervals);

		return midi_notes;
	}
	

}