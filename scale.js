
function Scale () {
	var self = this;
	var MAJOR_SCALE = [0,2,4,5,7,9,11]; //number of half steps each degree is from tonic

	this.scale_intervals = MAJOR_SCALE;

	this.get_interval = function (degree) {
		/*degree of the major scale to get
		returns the number of half steps the note is above the root of the scale
		ex. 2 returns the second in the scale*/
		return self.scale_intervals[degree-1];
	};

	this.get_degree = function (deg){
		/*given an integer meaning music interval above the root (ex. fifth = 5)
		return the degree in the scale (with appropriate modulo etc)*/
		var scale_size = self.scale_intervals.length;
		return (deg - 1) % scale_size + 1; //degrees come in 1-indexed and should leave 1-indexed
	}

	this.set_scale = function (scale) {
		this.scale_intervals = scale;
	}


}