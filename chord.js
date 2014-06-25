
//TODO this class probably won't be useful until there are options for more complex voicing

function Chord (args) {
	var self = this;
	this.degrees = args.degrees;
	this.scale = args.scale;

	//create a random voicing of this chord
	this.voice = function () {
		var octave = Utils.random_element([-1, 0, 1]);
		var inversion = Utils.random_index(self.degrees);

		console.log("degrees: " + self.degrees);
		console.log("octave: " + octave);
		console.log("inversion: " + inversion);

		var interval_functions = [
			function () {
				console.log("in_octave");
				return self.in_octave(octave);
			},
			function () {
				console.log("inversion");
				return self.inversion(octave, inversion);
			},
			function () {
				console.log("inversion_bass");
				return self.inversion_bass(octave, inversion);
			}
		];

		var intervals = Utils.random_element(interval_functions)();

		console.log("intervals: ", intervals);

		//add double note
		var double_index = Utils.random_index(self.degrees);
		var double_octave =  Utils.random_element([-1, 0, 1]);
		intervals = self.double_note(double_octave, double_index, intervals);

		console.log("final intervals: ", intervals);

		return intervals;
	};

	//all notes within a single octave (produces inversions for all chords bigger than III)
	//octave represented as number of octaves from original octave (defined in note)
	this.in_octave = function (octave) {
		octave = octave || 0;
		return self.degrees.map(function(degree) {
			self.scale.get_interval(degree, octave);
		});
	};

	//classic method of inversion (ex. second inversion will have: 2nd, 3rd, 1st scale degrees)
	this.inversion = function (octave, inversion) {
		octave = octave || 0;
		inversion = inversion || 0;

		if (inversion > self.degrees.length-1) {
			return;
		}

		//the index at which to start inverting degrees
		//(ex 1st inversion means putting the last note in the bass, so invert_index = 2 for a triad)
		var invert_index = self.degrees.length-1 - inversion; //length-1 because zero-index
		var intervals = [];
		$.each(self.degrees, function(i, degree){
			var transpose = degree > self.degrees[i-1] ? 0 : 1; //if the next degree is smaller than the one before it, 
				//must add an octave to create a root position chord
			transpose += i > invert_index ? -1 : 0; //degrees larger than the invert_index get transposed an octave down
			transpose += octave; //transpose everything by the octaves argument
			
			var interval = self.scale.get_interval(degree, transpose);
			intervals.push(interval);
		});
		return intervals;
	};

	this.root_position = function (octave) {
		return self.inversion(octave, 0);
	};

	//another method of inversion, just add the correct degree to the bass
	this.inversion_bass = function (octave, inversion) {
		if (inversion > self.degrees.length-1) {
			return;
		}
		//index of the bass note:
		var invert_index = self.degrees.length-1 - inversion;
		var bass = self.degrees[invert_index];
		var bass_interval = self.scale.get_interval(bass, octave-1);

		var intervals = self.in_octave(octave);
		intervals.push(bass_interval);
		return intervals;
	}

	//add another copy of the chord degree in the given octave
	//can apply this to any set of intervals 
	this.double_note = function (octave, index, intervals) {
		if (index > self.degrees.length){
			return;
		}

		intervals = intervals || self.in_octave();

		var degree = self.degrees[index];
		var double_interval = self.scale.get_interval(degree, octave);

		if ($.inArray(double_interval, intervals) === -1) {
	        intervals.push(double_interval);
	    }

	    return intervals;
	}
}