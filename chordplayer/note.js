
//all integers [24,108] representing all the notes on a keyboard from C1 to C8
var all_midi_notes = Array.apply(null, Array(85)).map(function (_, i) {return i + 24;});

//integers [60,71] representing middle C octave in midi numbers
var midi_octave_notes = Array.apply(null, Array(12)).map(function (_, i) {return i + 60;});

//integers [1,12] representing all the half steps in an octave, abstractly
var octave_notes = Array.apply(null, Array(12)).map(function (_, i) {return i + 1;});

