define(["Tone/core/Tone", "Tone/instrument/Instrument", "Tone/core/Buffers", "Tone/source/BufferSource"],
	function (Tone) {

	/**
	 * @class Automatically interpolates between a set of pitched samples. Pass in an object which maps the note's pitch or midi value to the url, then you can trigger the attack and release of that note like other instruments. By automatically repitching the samples, it is possible to play pitches which were not explicitly included which can save loading time.
	 *        For sample or buffer playback where repitching is not necessary, use [Tone.Player](https://tonejs.github.io/docs/Player).
	 * @param {Object} samples An object of samples mapping either Midi
	 *                         Note Numbers or Scientific Pitch Notation
	 *                         to the url of that sample.
	 * @example
	 * var sampler = new Tone.SamplerExt({
	 * 	"C3" : "path/to/C3.mp3",
	 * 	"D#3" : "path/to/Dsharp3.mp3",
	 * 	"F#3" : "path/to/Fsharp3.mp3",
	 * 	"A3" : "path/to/A3.mp3",
	 * }, function(){
	 * 	//sampler will repitch the closest sample
	 * 	sampler.triggerAttack("D3")
	 * })
	 * @extends {Tone.Instrument}
	 */
	Tone.SamplerExt = function(urls){

		// shift arguments over one. Those are the remainder of the options
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		var options = Tone.defaults(args, ["onload", "baseUrl"], Tone.SamplerExt);
		Tone.Instrument.call(this, options);

		var urlMap = {};
		for (var note in urls){
			if (Tone.isNote(note)){
				//convert the note name to MIDI
				var mid = Tone.Frequency(note).toMidi();
				urlMap[mid] = urls[note];
			} else if (!isNaN(parseFloat(note))){
				//otherwise if it's numbers assume it's midi
				urlMap[note] = urls[note];
			} else {
				throw new Error("Tone.SamplerExt: url keys must be the note's pitch");
			}
		}

		/**
		 * The stored and loaded buffers
		 * @type {Tone.Buffers}
		 * @private
		 */
		this._buffers = new Tone.Buffers(urlMap, options.onload, options.baseUrl);

		/**
		 * The object of all currently playing BufferSources
		 * @type {Object}
		 * @private
		 */
		this._activeSources = {};

		/**
		 * The envelope applied to the beginning of the sample.
		 * @type {Time}
		 */
		this.attack = options.attack;

		/**
		 * The envelope applied to the end of the envelope.
		 * @type {Time}
		 */
		this.release = options.release;
	};

	Tone.extend(Tone.SamplerExt, Tone.Instrument);

	/**
	 * The defaults
	 * @const
	 * @type {Object}
	 */
	Tone.SamplerExt.defaults = {
		attack : 0,
		release : 0.1,
		onload : Tone.noOp,
		baseUrl : ""
	};

	/**
	 * Returns the difference in steps between the given midi note at the closets sample.
	 * @param  {Midi} midi
	 * @return {Interval}
	 * @private
	 */
	Tone.SamplerExt.prototype._findClosest = function(midi){
		var MAX_INTERVAL = 24;
		var interval = 0;
		while(interval < MAX_INTERVAL){
			// check above and below
			if (this._buffers.has(midi + interval)){
				return -interval;
			} else if (this._buffers.has(midi - interval)){
				return interval;
			}
			interval++;
		}
		return null;
	};

	/**
	 * @param  {Frequency} note     The note to play
	 * @param  {Time=} time     When to play the note
	 * @param  {NormalRange=} velocity The velocity to play the sample back.
	 * @return {Tone.SamplerExt}          this
	 */
	Tone.SamplerExt.prototype.triggerAttack = function(note, time, velocity){
		var midi = Tone.Frequency(note).toMidi();
		// find the closest note pitch
		var difference = this._findClosest(midi);
		if (difference !== null){
			var closestNote = midi - difference;
			var buffer = this._buffers.get(closestNote);
			// play that note
			var source = new Tone.BufferSource({
				"buffer" : buffer,
				"playbackRate" : Tone.intervalToFrequencyRatio(difference),
				"fadeIn" : this.attack,
				"fadeOut" : this.release,
				"curve" : "exponential",
			}).connect(this.output);
			source.start(time, 0, buffer.duration, velocity);
			// add it to the active sources
			if (!Tone.isArray(this._activeSources[midi])){
				this._activeSources[midi] = [];
			}
			this._activeSources[midi].push({
				note : midi,
				source : source
			});
		}
		return this;
	};

	/**
	 * @param  {Frequency} note     The note to release.
	 * @param  {Time=} time     	When to release the note.
	 * @return {Tone.SamplerExt}	this
	 */
	Tone.SamplerExt.prototype.triggerRelease = function(note, time){
		var midi = Tone.Frequency(note).toMidi();
		// find the note
		if (this._activeSources[midi] && this._activeSources[midi].length){
			var source = this._activeSources[midi].shift().source;
			time = this.toSeconds(time);
			source.stop(time + this.release, this.release);
		}
	};

	/**
	 * Invoke the attack phase, then after the duration, invoke the release.
	 * @param  {Frequency} note     The note to play
	 * @param  {Time} duration The time the note should be held
	 * @param  {Time=} time     When to start the attack
	 * @param  {NormalRange} [velocity=1] The velocity of the attack
	 * @return {Tone.SamplerExt}          this
	 */
	Tone.SamplerExt.prototype.triggerAttackRelease = function(note, duration, time, velocity){
		time = this.toSeconds(time);
		duration = this.toSeconds(duration);
		this.triggerAttack(note, time, velocity);
		this.triggerRelease(note, time + duration);
		return this;
	};

	/**
	 *  Add a note to the sampler.
	 *  @param  {Note|Midi}   note      The buffer's pitch.
	 *  @param  {String|Tone.Buffer|Audiobuffer}  url  Either the url of the bufer,
	 *                                                 or a buffer which will be added
	 *                                                 with the given name.
	 *  @param  {Function=}  callback  The callback to invoke
	 *                                 when the url is loaded.
	 */
	Tone.SamplerExt.prototype.add = function(note, url, callback){
		if (Tone.isNote(note)){
			//convert the note name to MIDI
			var mid = Tone.Frequency(note).toMidi();
			this._buffers.add(mid, url, callback);
		} else if (!isNaN(parseFloat(note))){
			//otherwise if it's numbers assume it's midi
			this._buffers.add(note, url, callback);
		} else {
			throw new Error("Tone.SamplerExt: note must be the note's pitch. Instead got "+note);
		}
	};

	/**
	 * If the buffers are loaded or not
	 * @memberOf Tone.SamplerExt#
	 * @type {Boolean}
	 * @name loaded
	 * @readOnly
	 */
	Object.defineProperty(Tone.SamplerExt.prototype, "loaded", {
		get : function(){
			return this._buffers.loaded;
		}
	});

	/**
	 * Clean up
	 * @return {Tone.SamplerExt} this
	 */
	Tone.SamplerExt.prototype.dispose = function(){
		Tone.Instrument.prototype.dispose.call(this);
		this._buffers.dispose();
		this._buffers = null;
		for (var midi in this._activeSources){
			this._activeSources[midi].forEach(function(event){
				event.source.dispose();
			});
		}
		this._activeSources = null;
		return this;
	};

	return Tone.SamplerExt;
});