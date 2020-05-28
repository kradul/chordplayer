
ScaleConstants = {}

ScaleConstants.MAJOR_SCALE = [0,2,4,5,7,9,11]; //number of half steps each degree is from tonic
ScaleConstants.HARMONIC_MINOR_SCALE = [0,2,3,5,7,8,11];
ScaleConstants.NATURAL_MINOR_SCALE = [0,2,3,5,7,8,10];
ScaleConstants.MELODIC_MINOR_SCALE = [0,2,3,5,7,9,11];

function Scale (scale_intervals) {
	var self = this;

	this.scale_intervals = scale_intervals;

	/*degree of the major scale to get
	returns the number of half steps the note is above the root of the scale
	ex. 2 returns the second in the scale

	num_octaves: number of octaves (pos or negative) to transpose by
	*/
	this.get_interval = function (degree, num_octaves) {
		num_octaves = num_octaves || 0;
		return self.scale_intervals[degree-1] + num_octaves*self.octave_interval();
	};

	this.get_degree = function (degree){
		/*given an integer meaning music interval above the root (ex. fifth = 5)
		return the degree in the scale (with appropriate modulo etc)*/
		return (degree - 1) % self.size() + 1; //degrees come in 1-indexed and should leave 1-indexed
	}

	this.size = function () {
		return self.scale_intervals.length;
	}

	this.octave_interval = function () {
		//returns number of half steps one tonic is from the next tonic
		return 12;
	}

	this.set_scale = function (scale) {
		this.scale_intervals = scale;
	}


}