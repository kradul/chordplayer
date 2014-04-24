
function Scale () {
	var MAJOR_SCALE = [0,2,4,5,7,9,11]; //number of half steps each degree is from tonic

	this.scale = MAJOR_SCALE;

	this.get_interval = function (degree) {
		/*degree of the major scale to get
		returns the number of half steps the note is above the root of the scale
		ex. 2 returns the second in the scale*/
		return this.scale[degree-1];
	};

	this.set_scale = function (scale) {
		this.scale = scale;
	}


}