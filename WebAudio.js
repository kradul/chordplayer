function MKWebAudio() {
	
	this.listener;
	this.sounds;
	this.soundsBuffers;
	this.audioExtension;
	this.audioFolder;
	this.soundsCount=0;
	this.totalSounds=0;
	this.lowMIDI = 0;
	this.hiMIDI = 0;
	this.tempo = 60;
	this.volumen = 0.9;
	this.unidad = 1680;		// negra
	this.context;
	this.legato = 1.5;
}

MKWebAudio.prototype = {
	
	constructor : MKWebAudio,
	
	// chequea si webAudio se puede usar
	
	isSupported : function() {

			var contextClass = ( window.AudioContext ||
														window.webkitAudioContext ||
														window.mozAudioContext ||
														window.oAudioContext ||
														window.msAudioContext);
	
  		try { this.context = new contextClass(); }
	
  		catch(e) { return false; }
		
		this.setAudioType();
		return true;
	},
	
	// carga sonidos MP3 / OGG
	
	loadMIDISounds : function(path, fromMIDI, toMIDI, listener) {
	
		this.sounds = new Array();
		this.listener = listener;			// recibe aviso de que los sonidos están cargados
		this.lowMIDI = fromMIDI;
		this.hiMIDI = toMIDI;
		this.totalSounds = toMIDI - fromMIDI + 1;
		
		// cargamos cada sonido
		
		for (var i=fromMIDI; i <= toMIDI; i++) { this.loadSound(path + 'audio/piano/' + i + this.audioExtension, i-fromMIDI); }
	},
	
	// esta funcion es la que carga cada sonido
	
	loadSound : function (soundUrl, soundIndex) {

		var me = this;		// necesitamos la referencia en la función onload y decode audio

		var request=new XMLHttpRequest();
		request.open("GET", soundUrl, true);
		request.responseType="arraybuffer";
		request.onload = onLoad;
		request.send();
		
		// aquí vamos a recibir y procesar el sonido
		
		function onLoad(event) { me.context.decodeAudioData(event.target.response, decodeAudio, onError);	}
		
		// lo guardamos
		
		function decodeAudio(theBuffer) { 
			
			me.sounds[soundIndex] = theBuffer;
			
			if (++me.soundsCount==me.totalSounds) {	me.listener('WA_done', me.soundsCount); }	// avisamos cuando están todos
			else me.listener('WA_working', me.soundsCount);
		}

		function onError() { console.log ('decode audio error'); }
	},
	
	playing : function () {
		
		if (this.soundsBuffers != null && this.soundsBuffers.length) {										// ya tenemos buffers?
		
			if (this.soundsBuffers[this.soundsBuffers.length-1].playbackState != 3) {			// está tocando?
				
				return true;
			}
		}
		
		return false;
	},

	playSequence : function (midiValues, startTimes, durations) {
		
		if (this.playing() ) this.stopMIDISounds();			// paramos los sonidos
		
		this.soundsBuffers = new Array();			// creamos nuevos buffers
		
		if (!this.context) 	this.isSupported();
		
		if (this.context) {
			
			var cuando = this.context.currentTime;
			
			for (var i = 0; i < midiValues.length; i++) {
	
				if ( midiValues[i] >= this.lowMIDI && midiValues[i] <= this.hiMIDI )  {
	
					// creamos sonido y gainNode para apagar				
					var source = this.context.createBufferSource();
					
					//console.log(this.sounds.length, midiValues[i], this.lowMIDI);
					source.buffer = this.sounds[midiValues[i]-this.lowMIDI];
					this.soundsBuffers.push(source);	// lo guardamos para poder apagar
					
					var gainNode;
					if (this.context.createGainNode)
						gainNode = this.context.createGainNode();
					else
						gainNode = this.context.createGain();
						
					//conectamos source > gainNode > destination
					source.connect(gainNode);
					gainNode.connect(this.context.destination);
					
					//tocamos
					var secs = this.noteDurationToSeconds(startTimes[i]);
					gainNode.gain.linearRampToValueAtTime(this.volumen, cuando + secs);
					if (source.start)
						source.start( cuando + secs );
					else
						source.noteOn( cuando + secs );
					
					//apagamos

					gainNode.gain.linearRampToValueAtTime(0.0, cuando + secs + this.noteDurationToSeconds (durations[i]) * this.legato);
				}
			}
		}
	},

	playNote : function (note, duration) {
		
		var midiValues = new Array();
		var startTimes = new Array();
		var durations = new Array();
		
		midiValues.push(note.getNoteMIDI());
		startTimes.push(0);
		durations.push(duration);

		this.playSequence(midiValues, startTimes, durations);
	},
	
	playBeats : function (midi, beats, duration) {
		
		var midiValues = new Array();
		var startTimes = new Array();
		var durations = new Array();
		var start = 0;
		
		for (var i = 0; i < beats; i++) {
			
			midiValues.push(midi);
			startTimes.push(start);
			durations.push(duration);
			start += parseInt(duration);
		}

		this.playSequence(midiValues, startTimes, durations);
	},
	
	playChord : function (chord, duration) {
		
		var midiValues = new Array();
		var startTimes = new Array();
		var durations = new Array();
		
		for (var i = 0; i < chord.colNotes.length; i++) {
			
			midiValues.push(chord.getNoteInChord(i).getNoteMIDI());
			startTimes.push(0);
			durations.push(duration);
		}
		
		this.playSequence(midiValues, startTimes, durations);
	},

	playMelodicInterval : function (interval, duration1, duration2) {
		
		var midiValues = new Array();
		var startTimes = new Array();
		var durations = new Array();
		
		midiValues.push(interval.getFirstNote().getNoteMIDI());
		startTimes.push(0);
		durations.push(duration1);

		midiValues.push(interval.getSecondNote().getNoteMIDI());
		startTimes.push(duration1);
		durations.push(duration2);
	
		this.playSequence(midiValues, startTimes, durations);
	},

	playHarmonicInterval : function (interval, duration) {
		
		var midiValues = new Array();
		var startTimes = new Array();
		var durations = new Array();
		
		midiValues.push(interval.getFirstNote().getNoteMIDI());
		startTimes.push(0);
		durations.push(duration);

		midiValues.push(interval.getSecondNote().getNoteMIDI());
		startTimes.push(0);
		durations.push(duration);
	
		this.playSequence(midiValues, startTimes, durations);
	},
	
	playMelodicHarmonicInterval : function (interval, harDuration, melTempo, melDuration) {
		
		var midiValues = new Array();
		var startTimes = new Array();
		var durations = new Array();
		
		midiValues.push(interval.getFirstNote().getNoteMIDI());
		startTimes.push(0);
		durations.push(harDuration);

		midiValues.push(interval.getSecondNote().getNoteMIDI());
		startTimes.push(0);
		durations.push(harDuration);
		
		midiValues.push(interval.getFirstNote().getNoteMIDI());
		startTimes.push(harDuration);
		durations.push(melTempo);

		midiValues.push(interval.getSecondNote().getNoteMIDI());
		startTimes.push(parseInt(harDuration) + parseInt(melTempo) );
		durations.push(melDuration);

		this.playSequence(midiValues, startTimes, durations);
	},
	
	playScale : function (scale, tempo, duration) {
		
		var midiValues = new Array();
		var startTimes = new Array();
		var durations = new Array();
		var start = 0;
		
		for (var i = 0; i < scale.noteCount()-1; i++) {
			
			midiValues.push(scale.getNoteInScale(i).getNoteMIDI());
			startTimes.push(start);
			durations.push(tempo);
			start += tempo;
		}

		midiValues.push(scale.getNoteInScale(scale.noteCount() - 1).getNoteMIDI());
		startTimes.push(start);
		durations.push(duration);
		
		this.playSequence(midiValues, startTimes, durations);
	
	},
	
	stopMIDISounds : function () {
		
		if (this.soundsBuffers != null) {
			for (var i=0; i < this.soundsBuffers.length; i++) {
				
				if (this.soundsBuffers[i].stop)
					this.soundsBuffers[i].stop(0);
				else
					this.soundsBuffers[i].noteOff(0);
			}
		}
	},
	
	setAudioType : function() {
		
		if ( new Audio().canPlayType("audio/ogg; codecs=vorbis")) {  this.audioExtension = '.ogg'; }
		else { this.audioExtension = '.mp3'; }
	},

	noteDurationToSeconds : function (noteValue) { return 60 / this.unidad * noteValue / this.tempo; }	// formula = 60 / unidad de tiempo * figura / tempo
}