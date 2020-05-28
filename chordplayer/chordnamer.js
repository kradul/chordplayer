
function ChordNamer () {
	var path = "./chordnames/";
	var vol = 0.3; //volume to play at, TODO make a user-editable parameter

	this.name_chord = function (degree) {
		file = path + degree + ".mp3";
		var a = new Audio(file);
		a.volume = vol;
		a.play();
	}

}