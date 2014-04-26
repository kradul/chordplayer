
function ChordNamer () {
	var path = "./chordnames/";
	new Audio('./Interlude2.mp3').play();

	this.name_chord = function (degree) {
		file = path + degree + ".mp3";
		new Audio(file).play();
	}

}