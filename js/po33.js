//CONSTANTS
const CHANNELS = 16;
const PATTERNS = 16;
const BEATS = 16;
const BTNLEDS = 16;

//VARIABLES
//IS THE SONG PLAYING?
var play = false;

//CURRENT SONG BEAT
var beatCount = 0;

//CURRENTLY SELECTED CHANNEL
var selectedChannel = 0;

//CURRENTLY SELECTED PITCH USED FOR ADDING NOTES IN EDIT
var selectedPitch = 5;

//CURRENT TEMPO
var tempo = 120;

//KEEP TRACK TO CYCLE PRESET BPMS
var tempoState = 0;

//CURRENT SWING
var swing = 0;

//CURRENT VOLUME
var volume = 8;

//CURRENT VOLULME AS A DECIMAL
var mainVolume = 0.5;

//CURRENTLY SELECTED PATTERN FOR EDITING
var currentPattern = 0;

//CURRENTLY PLAYING PATTERN IN PATTERN COUNT
var patternCount=0;

//CURRENT SONG MADE FROM PATTERNS
var patternChain = [0];

//CURRENT FX MODE FOR DIALS AND DISPLAY
var fxMode = 0;//tone, filter, trim

//CURRENT VIEW
var mode = 0;
var view = 0;

//CURRENT STATE i.e SOUND/PATTERN/BPM
var state = 0;

//STATES
/*
0 = PERFORMANCE
1 = EDIT
2 = SOUND
3 = PATTERN
33 = COPY PATERN
34 = PASTE PATTERN
4 = METRO
5 = MIC
6 = TRIM
7 = FILTER
8 = TONE
*/

//MODES
/*
0 = PERFORMANCE
1 = EDIT
11 = LIVE RECORD
*/

//VIEWS
/*
0 = play
1 = SOUND SELECT
*/


//USED FOR NOTE PITCH PLAYBACK SPEED CONVERSION
/*var hzArr =
[
392,415.3,466.16,493.9,
261.63,293.66,311.13,349.23,
196,207.65,233.08,246.93,
130.815,146.83,155.56,174.61
]*/

//CONVERT HZ TO PLAYBACK RATIO
/*var pitchArr = [];
for(i=0;i<16;i++){
	pitchArr[i]=(hzArr[i]/261.63);
}*/


//BUILD LED OBJECT ARRAY FOR QUICK ACCESS
var ledArr = [];
for (i=0;i<16;i++){
	var x = i+1;
	var led =  $("#btn"+x+" > .buttonBG > .led");
	ledArr.push(led);
}

var btnPlayLed = $("#btnPlay > .buttonBG > .led");



//AN ARRAY TO HOLD ALL OF THE AUDIO OBJECT
// EVERY CHANNEL HAS TWO AUDIO OBJECTS PER NOTE/SAMPLE

/*
//SET UP AUDIO
var newAudioArr = new Array (CHANNELS);
for (var i = 0; i <CHANNELS;i++ ){
	newAudioArr[i] = new Array(PATTERNS);
	for (var j = 0; j<PATTERNS;j++){
		newAudioArr[i][j] = new Array(2);
		for (var k = 0; k<BEATS;k++){

			newAudioArr[i][j][k] = document.createElement("audio");
			newAudioArr[i][j][k].autoPlay = false;
			newAudioArr[i][j][k].preLoad = true;
			newAudioArr[i][j][k].controls = false;
			newAudioArr[i][j][k].mozPreservesPitch = false;
			newAudioArr[i][j][k].isFadeOut = false;
		}
	}
}

//LOAD SAMPLES
for (var i = 0; i <CHANNELS;i++ ){
	//SKIP 5-8 and 13-16
	if(i==4)i=8;
	if(i==12)break;
	for (var j = 0; j<PATTERNS;j++){
		for (var k = 0; k<BEATS;k++){

			var x= i+1;
			var z= j+1;

			if(i>=8){
				newAudioArr[i][j][k].src = "wav/sound-"+x+"-"+z+".wav";
			}else{
				newAudioArr[i][j][k].src = "wav/sound-"+x+".wav";
			}
		}
	}
}
*/
/*
var playerArr = new Array (CHANNELS);
for (var i = 0; i <CHANNELS;i++ ){
	playerArr[i] = new Array(PATTERNS);
	for (var j = 0; j<PATTERNS;j++){
		var x= i+1;
		var z= j+1;
			if(i>=8){
				playerArr[i][j] = new Tone.Player("wav/sound-"+x+"-"+z+".wav");
			}else{
				playerArr[i][j] = new Tone.Player("wav/sound-"+x+".wav");
			}
			playerArr[i][j].retrigger=true;
			playerArr[i][j].toMaster();


	}
}*/
var meter = new Tone.Meter (0.01);

const MELODIC_CHANNELS = 8;
var melodicArr = new Array (MELODIC_CHANNELS);
var melodicFilterArr = new Array (MELODIC_CHANNELS);
for (var i = 0; i <MELODIC_CHANNELS-4;i++ ){
	var x= i+1;

	melodicArr[i] = new Tone.Sampler({
		"C#4":"wav/sound-"+x+".wav"
	})

	melodicFilterArr[i] = new Tone.Filter(20, "highpass");
	// melodicFilterArr[i].toMaster();
	melodicFilterArr[i].chain(meter, Tone.Master);
	melodicArr[i].connect(melodicFilterArr[i]);
}

const DRUM_CHANNELS = 8;
var drumArr = new Array (DRUM_CHANNELS);
var drumFilterArr = new Array (DRUM_CHANNELS);
for (var i = 0; i <DRUM_CHANNELS-4;i++ ){
	var x= i+9;
	drumFilterArr[i]  = new Tone.Filter(20, "highpass");
	// drumFilterArr[i].toMaster();
	drumFilterArr[i].chain(meter, Tone.Master);
	drumArr[i]= new Tone.Players({
			"G#4" : "wav/sound-"+x+"-1.wav",
			"A4" :"wav/sound-"+x+"-2.wav",
			"B4": "wav/sound-"+x+"-3.wav",
			"C5": "wav/sound-"+x+"-4.wav",
			"C#4" :  "wav/sound-"+x+"-5.wav",
			"D#4": "wav/sound-"+x+"-6.wav",
			"E4" :  "wav/sound-"+x+"-7.wav",
			"F#4" :  "wav/sound-"+x+"-8.wav",
			"G#3" :  "wav/sound-"+x+"-9.wav",
			"A3" :  "wav/sound-"+x+"-10.wav",
			"B3" :  "wav/sound-"+x+"-11.wav",
			"C4" :  "wav/sound-"+x+"-12.wav",
			"C#3" :  "wav/sound-"+x+"-13.wav",
			"D#3" :  "wav/sound-"+x+"-14.wav",
			"E3" :  "wav/sound-"+x+"-15.wav",
			"F#3" :  "wav/sound-"+x+"-16.wav"

		});
	drumArr[i].connect(drumFilterArr[i]);
}

//, Tone.Master);
//drumFilterArr[3].connect(meter);//, Tone.Master);
/*
var test  = new Tone.Player("wav/sound-1.wav").toMaster();
//TRANSPORT
var keys = new Tone.Players({
			"G#4" : "wav/sound-1-1.wav",
			"A4" :"wav/sound-9-2.wav",
			"B4": "wav/sound-9-3.wav",
			"C5": "wav/sound-9-4.wav",
			"C#4" :  "wav/sound-9-5.wav",
			"D#4": "wav/sound-9-6.wav",
			"E4" :  "wav/sound-9-7.wav",
			"F#4" :  "wav/sound-9-8.wav",
			"G#3" :  "wav/sound-9-9.wav",
			"A3" :  "wav/sound-9-10.wav",
			"B3" :  "wav/sound-9-11.wav",
			"C4" :  "wav/sound-9-12.wav",
			"C#3" :  "wav/sound-9-13.wav",
			"D#3" :  "wav/sound-9-14.wav",
			"E3" :  "wav/sound-9-15.wav",
			"F#3" :  "wav/sound-9-16.wav"
		}, {
			"volume" : -10,
			"fadeOut" : "64n",
		}).toMaster();

		*/




		//CONVERT BUTTON NUMBERS TO NOTE NAMES USED BY TONE.JS
		var noteArray = ["G#4","A4","B4","C5","C#4","D#4","E4","F#4","G#3","A3","B3","C4","C#3","D#3","E3","F#3"];

		//TONE.JS SEQUENCE USED TO LOOP AND TRIGGER EVENTS ACCURATELY
		var loop = new Tone.Sequence(function(time, beat){
			beatCount = beat;
			updateDisplay();
			$("#beatCount").html(beatCount);

			for(i=0;i<MELODIC_CHANNELS;i++){
				var thisChannel = newChannelArr[i][currentPattern][beat];

					if(thisChannel.noteOn==1){
						var chanSettings = channelSettingsArr[i];

						//FILTER
						var thisFilter = melodicFilterArr[i];

						thisFilter.frequency.value = thisChannel.fxFilterFreq;
						thisFilter.type = thisChannel.fxFilterType;
						thisFilter.Q.value = thisChannel.fxFilterRes;

						//SAMPLER
						var thisSampler = melodicArr[i];
						thisSampler.releaseAll();

						var vol = thisChannel.fxVolume;
						var pitch = thisChannel.notePitch
						var trim = chanSettings.fxTrim/1000;
						var length = chanSettings.fxLength/1000;


						//var pitch = thisChannel.fxPitch;
						var sampleLength = thisSampler.buffers.get(61).duration;
						var duration = sampleLength*length;
						var offset = sampleLength*trim;

						thisSampler.volume.value = vol;
						thisSampler.triggerAttackExt(noteArray[pitch],time,1,offset,duration);
					}

			}

			for(i=0;i<DRUM_CHANNELS-4;i++){
				var thisChannel = newChannelArr[i+8][currentPattern][beat];

					if(thisChannel.noteOn==1){
						var chanSettings = channelSettingsArr[i];

						//FILTER
						var thisFilter = drumFilterArr[i];
						thisFilter.frequency.value = thisChannel.fxFilterFreq;
						thisFilter.type = thisChannel.fxFilterType;
						thisFilter.Q.value = thisChannel.fxFilterRes;

						var vol = thisChannel.fxVolume;
						var thisPitch = thisChannel.notePitch

						var thisSampler = drumArr[i];
						thisSampler.volume.value = vol;
						vel = 1;



						var offset = thisChannel.fxTrim;
						var duration = thisChannel.fxLength;
						var pitch = thisChannel.fxPitch;
						var gain = thisChannel.fxVolume;

						thisSampler.get(noteArray[thisPitch]).start(time);
					}

			}



			if(beat==15){
				patternCount++;

				if(patternCount>patternChain.length-1){
				 	patternCount = 0;
				 }

				currentPattern = patternChain[patternCount];
			}



		}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "16n");


var levelMeterFunction = function(){
	const level = meter.getLevel();
	!segmentDisplayLock && updateLevelMeter(0, level+18);

	setTimeout(levelMeterFunction,20);

}




setTimeout(levelMeterFunction,100);

//OBJECT CONTAINING EACH BEATS SETTINGS
function Beat(){
	this.noteOn=0;
	this.noteLength=1;
	this.notePitch=0;
	this.noteVolume = 1;
	this.fxPitch=0;
	this.fxVolume=-12;
	this.fxTrim=0;
	this.fxLength=1000;
	this.fxFilter=0;
	this.fxFilterType = "highpass";
	this.fxFilterFreq = 20;
	this.fxResonance=0;
	this.fxFilterRes = 1;
}

//AN ARRAY TO HOLD ALL THE BEAT SETTINGS FOR EVEY BEAT IN EVERY PATTERN FOR EVERY CHANNEL
var newChannelArr = new Array (CHANNELS);
for (var i = 0; i <newChannelArr.length;i++ ){
	newChannelArr[i] = new Array(PATTERNS);
	for (var j = 0; j<newChannelArr[i].length;j++){
		newChannelArr[i][j] = new Array(BEATS);
		for (var k = 0; k<newChannelArr[i][j].length;k++){
			newChannelArr[i][j][k] = new Beat();
		}
	}
}

var loadDefault = function(){
		//LOAD DEAFULT PATTERNS AND INSERT DATA INTO CHANNEL ARRAY
		 $.getJSON("json/default.json", function( data ) {
		 	for(pattern in data){
			 	for (channel in data[pattern]){
					for(i=0;i<16;i++){
						var channelObj = newChannelArr[channel][pattern][i];
						var dataObj = data[pattern][channel];
						channelObj.noteOn = dataObj.noteOn[i];
						channelObj.notePitch =  (dataObj.pitch[i])-1;
						channelObj.fxVolume =  dataObj.volume[i];

						if((pattern=="2")&&(channel=="3")){


								channelObj.fxFilterType = dataObj.filterType[i]
								channelObj.fxFilterFreq = dataObj.filterFreq[i]

						}else{

							channelObj.fxFilterType = "highpass";
							channelObj.fxFilterFreq = "20";
						}
					}
				}
			}
	});
}
loadDefault();


//CURRENT CHANNEL SETTINGS USED FOR LIVE PLAY BACK AND ADDING NOTES
function ChannelSettings(){
	this.noteOn=0;
	this.noteLength=1;
	this.notePitch=0;
	this.fxPitch=0;
	this.fxVolume=-12;
	this.fxTrim=0;
	this.fxLength=1000;
	this.fxFilter=0;
	this.fxFilterType = "highpass";
	this.fxFilterFreq = 20;
	this.fxResonance=0;
	this.fxFilterRes = 1;
	//this.samples = new Array(16);
}

//ARRAY TO HOLD EACH CHANNEL SETTINGS
channelSettingsArr = [];
for (var i = 0; i <16; i++) {
	var x = new ChannelSettings();
	channelSettingsArr.push(x);
}


//WHEN DOCUMENT LOADED ADD FUNCTIONS TO BUTTONS
$(document).ready(function(){



	//test.triggerAttack("C#4");
	//melodicArr[1].triggerAttack(noteArray[1]);
	//ADD BUTTON FUNCTION TO ALL NUMBER BUTTONS
	for (let i = 1; i <= 16; i++) {
		$("#btn"+i).click(function() {
		    buttonFunction(i);
		});
	}

		//SOUND BUTTON
	  $("#btnSound").click(function() {
		soundButtonFunction();
	  });

	  //PATTERN BUTTON
	  $("#btnPattern").click(function() {
		patternButtonFunction();
	  });

	  //TEMPO BUTTON
	 $("#btnBPM").click(function() {
		tempoButtonFunction();
	  });


	//BPM DOUBLE CLICK CYCLES PRESET TEMPOS
	  $("#btnBPM").dblclick(function() {

	 	tempoState = (tempoState+1)%3;

	 	//HIDE LCD LABELS
	 	$("#disco, #tencho, #hiphop").css("opacity","0");

	 	switch(tempoState){

	 		case 0: //DISCO

	 			tempo = 120

	 			//SHOW  lABEL
	 			$("#disco").css("opacity","1");
	 			break;

	 		case 1: //TENCHO

	 			tempo = 140

	 			//SHOW  lABEL
	 			$("#tencho").css("opacity","1");
	 			break;

	 		case 2: //HIPHOP

	 			tempo = 80

	 			//SHOW  lABEL
	 			$("#hiphop").css("opacity","1");
	 			break;


	 	}

	 	//SET TONE TRANSPORT TEMPO
		Tone.Transport.bpm.value = tempo;

		//LOCK DISPLY FOR 3 SECONDS
		segmentDisplayLock=1;
		clearTimeout(segDispLockTimer);
		segDispLockTimer = setTimeout(segmentDisplayLockFunc,3000);

		//UPDATE DISPLAY
		updateSegmentDisplay(tempo);

		//SHOW CLOCK IN 3 SECONDS
		screenTimeOut()


	});


	  //FX BUTTON
	  $("#btnFX").click(function() {
		fxButtonFunction();
	  });

});




  //FUNCTION CALLED BY BUTTON AND KEYBOARD
  var soundButtonFunction = function(){
  	changeState(2);
	updateDisplay();
  }





  //FUNCTION CALLED BY BUTTON AND KEYBOARD
  var patternButtonFunction = function(){
  	changeState(3);
	resetPatternChain = 1;
	updateDisplay();
	//updateView();
  }







  //FUNCTION CALLED BY BUTTON AND KEYBOARD
  var tempoButtonFunction = function(){
  	changeState(4);
	updateDisplay();
  }

//CURRENT LOCK STATE OF SEGMENT DISPLAY
//(PREVENT SEGMENT DISPLAY FROM BEING OVERWRITEN FOR 3 SECONDS)
var segmentDisplayLock = 0
var segDispLockTimer;
var segmentDisplayLockFunc = function(){
	segmentDisplayLock = 0;
}



  //FUNCTION CALLED BY BUTTON AND KEYBOARD
  var fxButtonFunction = function(){
	var mod;
	play ? mod=2:mod=3;

  	fxMode = (fxMode+1)%mod;

	var value;
	switch(fxMode){
		case 0:
			value = "ton";
			break;
		case 1:
			value = "flt";
			break;
		case 2:
			value = "tri";
			break;
	}
	segmentDisplayLock=1;
	clearTimeout(segDispLockTimer);
	segDispLockTimer = setTimeout(segmentDisplayLockFunc,3000);
	updateSegmentDisplay(value);
	screenTimeOut();
  }

var allowSound = function(){
	melodicArr[0].volume.value = -100;
	melodicArr[0].triggerAttack(noteArray[0]);
}

//PLAY BUTTON
  $("#btnPlay").click(function() {
   playButtonFunction();
  });



var playButtonFunction = function(){
	 if(play){
    	play = false;
    	 $("#beatCount").html(0);
    	 beatCount = 0;
    	 patternCount = 0;
    	 currentPattern = patternChain[patternCount];

    	 updateDisplay();
    	 Tone.Transport.stop();
    	 loop.stop();
    }else{
    	play = true;
		Tone.Transport.start();
    	loop.start();
    }
}
var btnWriteMouseUpTimer;
var btnWriteHold = false;


  //WRITE EDIT BUTTON
$("#btnWrite").mousedown(function() {
	btnWriteHold = false;
	btnWriteMouseUpTimer = setTimeout(function(){
		btnWriteHold = true;
	},3000)
  });

$("#btnWrite").mouseup(function() {
	clearTimeout(btnWriteMouseUpTimer);
  });


  $("#btnWrite").click(function() {
  	writeButtonFunction();
  });

  var writeButtonFunction = function(){
  	var value;

  	switch(mode){
	  		case 0:
		  		mode = 1;
				value = "EDT";
				break;
	  		case 1:
	  		case 11:
	  			mode = 0;
				value = "PRF";
				break;

	}

	if(play&&btnWriteHold){
		mode = 11;
		value = "LVE";
	}


  	switch(view){
  		case 3:
  			//mode=33;
  			view=33;
  			break;
  		case 33:
  			//mode=3;
  			view=3;
  			break;
  	}
	$('#currentMode').html(mode);
	updateDisplay();
	updateSegmentDisplay(value);
	screenTimeOut();
  }

//PLAYER PLAY SOUND FOR LIVE PLAYBACK
var playSound = function(channel,pitch){
	var chan =  channelSettingsArr[channel];
	var vol = chan.fxVolume;
	var filterFreq = chan.fxFilterFreq;
	var filterType = chan.fxFilterType;
	var filterRes = chan.fxFilterRes

	if(channel<MELODIC_CHANNELS){

		melodicFilterArr[channel].frequency.value = filterFreq;
		melodicFilterArr[channel].type = filterType;
		melodicFilterArr[channel].Q.value = filterRes;
		melodicArr[channel].volume.value = vol;

		melodicArr[channel].releaseAll();
		melodicArr[channel].triggerAttack(noteArray[pitch]);
	}else{

		drumFilterArr[channel-8].frequency.value = filterFreq;
		drumFilterArr[channel-8].type = filterType;
		drumFilterArr[channel-8].Q.value = filterRes;

		var trim = chan.fxTrim;
		var length = chan.fxLength;
		var fxPitch = chan.fxPitch;

		drumArr[channel-8].volume.value = vol;

		var sampleLength = drumArr[channel-8].get(noteArray[pitch]).buffer.duration;;
		var duration = (sampleLength/1000)*length;

		var offset = (sampleLength/1000)*trim;

		drumArr[channel-8].volume.value = vol;
		drumArr[channel-8].get(noteArray[pitch]).start("+0", offset, duration);
	}

}

//EDIT PATTERN
var editPattern = function(channel,beat){

	var chan = newChannelArr[channel][currentPattern][beat];
	var chanSettings = channelSettingsArr[channel];
	//IF NOTE EXISTS, REMOVE, OTHERWISE COPY CURRENT CHANNEL SETTINGS TO NOTE ARRAY
	if(chan.noteOn){
		chan.noteOn = 0;
	}else{
		chan.noteOn = 1;
		chan.notePitch = selectedPitch;
		chan.fxPitch = chanSettings.fxPitch;
		chan.fxVolume = chanSettings.fxVolume;
		chan.fxTrim = chanSettings.fxTrim;
		chan.fxLength = chanSettings.fxLength;
		chan.fxFilter = chanSettings.fxFilter;
		chan.fxFilterType = chanSettings.fxFilterType;
		chan.fxFilterFreq = chanSettings.fxFilterFreq;
		chan.fxResonance = chanSettings.fxResonance;
		chan.fxFilterRes = chanSettings.fxFilterRes
	}
 	var myJSON = JSON.stringify(newChannelArr, null, "  ");
	localStorage.setItem("po33_settings", myJSON);

}


//LEDS, SEGMENT DISPLAY AND BUTTON DECORATION STATE MACHINE
var updateDisplay = function(){
	//IF SOUND,PATTERN OR BPM NOT TO BE VIEWED SET VIEW TO MODE;
	if(state==0){
		view = mode;
	}

	//UPDATE SIDEBAR
	//$("#viewDisp").html(view);

	//LIGHT UP PLAY BUTTON LED EVERY FIRST BEAT
	if(play&&(beatCount%4)==0){
		btnPlayLed.addClass("ledOnFull");
	}else{
		btnPlayLed.removeClass("ledOnFull");
	}

	//TURN OFF ALL LEDS
	for(i=0;i<BTNLEDS;i++){
		ledArr[i].removeClass("ledOnFull ledOnHalf ledFlash");
	}

	//REMOVE ALL BUTTON PUSHED DECORATION
  	$("#btnSound>.gridHover, #btnPattern>.gridHover, #btnBPM>.gridHover,  #btnWrite>.gridHover ").removeClass("buttonHold");

	switch(view){
		case 0://PERF

			//IF PLAYING
			if(play){

				//FLASH PLAY BUTTON LED
				ledArr[beatCount].addClass("ledOnFull");

				//LIGHT UP CHANNELS AS THEY PLAY
				for (i=0;i<BTNLEDS;i++){
					if(newChannelArr[i][currentPattern][beatCount].noteOn){
						ledArr[i].addClass("ledOnHalf");
					}
				}

				//UPDATE IF SEGMENT DISPLAY NOT SHOWING IMPORTNAT INFO
				if(!segmentDisplayLock){
				//SEGMENT DISPLAY SHOWS CURRENT PATTERN
				var x=currentPattern+1;
				var value = "P"+ ("00"+x).slice(-2);

				updateSegmentDisplay(value);
				}

			}else{
				//IF NOT PLAYING SHOW CLOCK
				showClock();
			}
			break;

		case 1://EDIT

			//TURN ON LEDS FOR EACH NOTE-ON FOR CURRENT CHANNEL PATTERN
			for(i=0;i<BTNLEDS;i++){
				if(newChannelArr[selectedChannel][currentPattern][i].noteOn){
					ledArr[i].addClass("ledOnHalf");
					if(newChannelArr[selectedChannel][currentPattern][i].notePitch == channelSettingsArr[selectedChannel].notePitch){
						ledArr[i].addClass("ledOnFull");
					}
				}
			}

			//IF PLAYING FLASH PLAY BUTTON LED
			if(play){
				ledArr[beatCount].addClass("ledOnFull");

				if(!segmentDisplayLock){
					//SEGMENT DISAPLY SHOWS CURRENT SOUND
					if(selectedChannel<8){
						//MELODIC
						var value = selectedChannel+1;
					}else{
						//DRUMS
						var x = selectedChannel+1;
						var y = channelSettingsArr[selectedChannel].notePitch + 1;
						var value = x + y;
					}
					updateSegmentDisplay(value);
				}
			}else{
				if(!segmentDisplayLock){
					//IF NOT PLAYING SHOW CLOCK
					showClock();
				}
			}
			break;

		case 11:
			//ADD HOLD DECORATION
  			 $("#btnWrite > .gridHover").addClass("buttonHold");
			break;

		case 2://SOUND

			//ADD HOLD DECORATION
  			 $("#btnSound > .gridHover").addClass("buttonHold");

  			//TURN ON LED FOR EACH CHANNEL WITH SAMPLE LOADED
			for(i=0;i<BTNLEDS;i++){
				if(i<MELODIC_CHANNELS){
					try {
						if(melodicArr[i].loaded==true){
							ledArr[i].addClass("ledOnHalf");
						}
					}catch (err){


					}

				}else{
					try{
						if(drumArr[i-8].loaded==true){
							ledArr[i].addClass("ledOnHalf");
						}
					}catch(err){

					}

				}

				/*if(newAudioArr[i][0][0].readyState>0){
					ledArr[i].addClass("ledOnHalf");
				}*/
			}

			//TURN LED ON FULL FOR CURRENT SOUND
			ledArr[selectedChannel].removeClass("ledOnFull ledOnHalf");
			ledArr[selectedChannel].addClass("ledFlash");


			break;

		case 33://COPY PATTERN
		case 34://PASTE PATTERN

			//IF COPY OR PASTE ADD WRITE BUTTON HOLD DECORATION
			$("#btnWrite > .gridHover").addClass("buttonHold");

			//NO BREAK HERE SO FALLS THROUGH TO CASE 3

		case 3: //Pattern
			//ADD PATTERN HOLD DECORATION
  			$("#btnPattern > .gridHover").addClass("buttonHold");

  			//CHECK TO SEE IF ANY PPATTERN CONTAINS ANY NOTE ONS FOR ANY CHANNEL, IF IT DOES
  			//TURN LED ON HALF AND BREAK TO NEXT PATTERN

	  		patternLoop:
	  		for(i=0;i<PATTERNS;i++){
	  			channelLoop:
	  			for(j=0;j<CHANNELS;j++){
	  				noteLoop:
	  				for(k=0;k<BEATS;k++){
	  					if(newChannelArr[j][i][k].noteOn==1){
							ledArr[i].addClass("ledOnHalf");
							k=0;
							j=0;
							break channelLoop;
						}
	  				}
	  			}
	  		}


	  		//IF PATTERN IS IN CURRENT PATTERN CHAIN LIGHT LED
			for(i=0;i<BTNLEDS;i++){
				if(patternChain.includes(i)){
					ledArr[i].addClass("ledOnFull");
				}

			}
			//FLASH CURRENT PATTERN LED
			ledArr[currentPattern].removeClass("ledOnFull ledOnHalf");
			ledArr[currentPattern].addClass("ledFlash");

			break;


		case 4://BPM
			//ADD BPM HOLD DECORATION
  			$("#btnBPM > .gridHover").addClass("buttonHold");

			//DISAPLAY VOLUME ON LEDS
			for(i=0;i<BTNLEDS;i++){
				 if(i<=volume){
					ledArr[i].addClass("ledOnHalf");
				 }
			}
			break;
	}

}

var resetPatternChain=0;
var patternToCopy = 0;

//CALLED WHEN ANY NUMBER OR CORRESPONDING KEYBOARD BUTTON IS PUSHED
var buttonFunction = function(buttonNumber){
	var btnNum = buttonNumber-1;
	switch(view){
		case 0: //PERF

			//UPDATE PITCH USED FOR EDITING
			selectedPitch = btnNum;
			channelSettingsArr[selectedChannel].notePitch = selectedPitch;

			//LIVE PLAY SELECTED SOUND
			playSound(selectedChannel,selectedPitch);

			break;

		case 1://EDIT

			//ADD OR REMOVE NOTE FROM PATTERN
			editPattern(selectedChannel,btnNum);

			break;

		case 11://LIVE RECORD

			selectedPitch = btnNum;
			playSound(selectedChannel,selectedPitch);

			editPattern(selectedChannel,beatCount);

			break;


		case 2://SOUND

			//UPDATE SELECTED CHANNEL
			selectedChannel = btnNum;

			//UPDATE SIDE BAR
			// $('#selectedChannelDisp').html(selectedChannel);

			//IF NOT PLAYING PLAY SOUND
			if(!play){

				//IF MELODIC SOUND PLAY CURRENT SELECTED PITCH
				if(buttonNumber<8){
					var pitch = channelSettingsArr[selectedChannel].notePitch;
					//pitch--;
					playSound(selectedChannel,pitch);
					updateSegmentDisplay(buttonNumber);
				}else{
					//IF DRUMS PLAY DEFAULT SAMPLE THEN SET DEFAULT TO NEXT SAMPLE
					var thisPitch = channelSettingsArr[selectedChannel].notePitch;
					playSound(selectedChannel,thisPitch);

					//SETUP TO PLAY NEXT SAMPLE
					thisPitch++;

					//UPDATE DISPLAY
					var string = selectedChannel.toString() + ("00"+thisPitch).slice(-2);
					updateSegmentDisplay(string);

					//KEEP SAMPLE SELECTION BETWEEN 0 AND 15
					channelSettingsArr[selectedChannel].notePitch = (thisPitch)%16;
				}

			}
			break;

		case 3: //PATTERN

			//SEE IF THE PATTERN BUTTON HAS BEEN PRESSED BETWEEN CALLS
			if(resetPatternChain){
				//IF IT HAS, RESET SONG PATTERN CHAIN
				resetPatternChain = 0;
				patternChain.length = 0;
				if(!play){
					//SET CURRENT PATTERN TO BUTTON NUMBER
				currentPattern = btnNum;
				}
			}

			//ADD PATTERN TO PATTERN CHAIN
			patternChain.push(btnNum);

			//IF FIRST PATTERN IN CHAIN SET DISPLAY TO PATTERN NUMBER
			if(patternChain.length==1){
				var x = patternChain[0]+1;
				value = "P"+("0"+x).slice(-2);

			}else{

				//IF NOT FIRST IN CHAIN, DISPLAY PATTERN LENGTH
				value = "L"+("0"+patternChain.length).slice(-2);
			}

			//UPDATE SEGMENT DISPLAY
			updateSegmentDisplay(value);

			break;


		case 33:// COPY PATTERN

			//UPDATE SEGMENT DISPLAY
			updateSegmentDisplay("CPY");

			//SET VIEW TO PASTE
			view = 34;

			//SET THE PATTERN TO COPY TO BUTTON NUMBER
			patternToCopy =btnNum;

			break;

		case 34:// PASTE PATTERN

			//UPDATE SEGMENT DISPLAY
			updateSegmentDisplay("CPY");


			//COPY PATTERN DATA TO NEW PATTERN SLOT
			for(i=0;i<16;i++){
				var original =newChannelArr[i][patternToCopy];
				newChannelArr[i][btnNum]= JSON.parse(JSON.stringify(original));
			}

			//CHANGE VIEW TO 3
			changeState(3);


			break;


		case 4: //BPM


			//SET MAIN VOLUME TO BUTTON NUMBER
			//VOLUME 0-15 FOR LEDS
			volume =(btnNum);

			//TONE.JS VOLUME IN dB
			mainVolume = (volume-16)*2;

			Tone.Master.volume.value =mainVolume;

			break;
	}

	//UPDATE DISAPLY
	updateDisplay();
}


var showClock = function(){
	var date = new Date();
		var hours = date.getHours();
		var mins = date.getMinutes();
		if(mins<10){
			mins = "0"+mins.toString();
		}else{
			mins =  mins.toString();
		}
		if(hours<12){
			$("#am").css("opacity","1");
			$("#pm").css("opacity","0");
		}else{
			hours = hours-12;
			$("#pm").css("opacity","1");
			$("#am").css("opacity","0");
		}
		if(hours<10){
			$(".segmentDisplay").css("margin","0 0 0 1em");
		}else{
			$(".segmentDisplay").css("margin","0 0 0 0");
		}
		var value = hours.toString() + mins;

		$(".segmentDisplay").html(value);
		//updateSegmentDisplay(value);
}
//showClock();
var clockTimer;
var screenTimeOut = function(){
	clockTimer = setTimeout(showClock,3000);
}
showClock();


var changeState = function(newState){
	//SET NEW STATE, SAVE OLD STATE
	if(state == newState){
  		state = 0;
  	}else{
  		state = newState;
  	}

  	switch(state){
  		case 0: view = 0;break;
  		case 1: view = 1; break;
  		case 2: //SOUND
  			view = 2;
  			break;
  		case 3: //PATTERN
  			view = 3;
  			break;
  		case 4: //BPM
  			view = 4;
  			break;
  	}
  	//UPDATE DISPLAY
  	//$('#currentState').html(state);
  	//$('#selectedChannelDisp').html(selectedChannel);
}

var dial1Value =0
var dial2Value =0;

var levelMeter = $(".levelMeter");
//levelMeter.hide();
var lmsArr = [];
for (i=0;i<33;i++) {
	var name = 'levelMeterSegment'+i;
	levelMeter.append("<div id="+name+" class=levelMeterSegment></div>");
	lmsArr.push($("#levelMeterSegment"+i));
	//lmsArr[i].hide();
	lmsArr[i].css("opacity","0");

}

var updateLevelMeter = function(meterMode, level, length){
	if(level>32)level=32;
	if(level<0)level=0;
	for(i=0;i<lmsArr.length;i++){
		//lmsArr[i].hide();
		lmsArr[i].css("opacity","0");
	}

	switch(meterMode){
		case 0://start from middle
				var _width = Math.round(level)+1;
			_width = _width/2;

				//lmsArr[16].show();
				for (i=0;i<_width;i++) {
					lmsArr[16+i].css("opacity","1");
					lmsArr[16-i].css("opacity","1");

				}




				levelMeter.css({
					"margin" : "80px auto",
					"justify-content":"flex-start"
				});
			break;

		case 1://start from left
				levelMeter.css({
					"margin":"80px 25px",
					"justify-content":"flex-start"

				});
				for (i=0;i<level+1;i++) {

					lmsArr[i].css("opacity","1");
				}
			break;

		case 2://start from right
		var _start =  Math.round(level);

				levelMeter.css({
					"margin":"80px 25px",
					"justify-content":"flex-start"
				});
				for (i=0;i<1+_start;i++) {

					lmsArr[32-i].css("opacity","1");

				}
			break;

		case 3://TRIM

			var _start =  Math.round(level);
			var _length = Math.round(length);

				for (i=_start;i<1+_length+_start;i++) {
					try{
						lmsArr[i].css("opacity","1");

					}catch(err){

					}
				}




				levelMeter.css({
					"margin" : "80px 25px",
					"justify-content":"flex-start"
				});
				break;


	}


	if(meterMode){//start from left

	}else{//start from middle

	}

}




var rotateDial = function(event,dialNumber) {

	//taken from https://codepen.io/graphilla/pen/MybXwy
	 var // get center of div to rotate
      pw = document.getElementById('dial'+dialNumber+'Rotate'),
      //pw = $("#dial1 > .dialBG > .dialCircle"),
      pwBox = pw.getBoundingClientRect();
      center_x = (pwBox.left + pwBox.right) / 2;
      center_y = (pwBox.top + pwBox.bottom) / 2;
    //  center_y= center_y - 100;
      // get mouse position
      mouse_x = event.pageX;
      mouse_y = event.pageY;
      radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
      degree = Math.round((radians * (180 / Math.PI) * -1) + 0);

      if ( (degree < 35)&&(degree > -35 ) ){
      	//do nothing

      }else{
      	 if(degree<0) degree+=360;
	    var rotateCSS = 'rotate(' + (degree + 170) + 'deg)';

	    $('#dial'+dialNumber+'Rotate').css({
	    	'transform' : rotateCSS,
	      '-moz-transform': rotateCSS,
	      '-webkit-transform': rotateCSS
	    });
	    var currentValue = Math.floor(((degree -35)/290)*1000);
	   /* if(currentValue<0)currentValue=0;
	    if(currentValue>127)currentValue=127;*/

		if(dialNumber==1){
			dial1Value = currentValue;
			//$('#dial1Disp').html(currentValue);
		}else{
			dial2Value = currentValue;
			//$('#dial2Disp').html(currentValue);
		}

      }



}
var dialLock=0;
$('#dial1').draggable({
  handle: '#dial1BG',
  opacity: 0.001,
  helper: 'clone',
  drag: function(event) {
  	rotateDial(event, "1");

  	var dialTimer = setTimeout(function(){
  		dialLock=0;
  	},100);

  	if(!dialLock){
  		dialFunction(1);
  		dialLock=1;
  	}
  }
});

$('#dial2').draggable({
  handle: '#dial2BG',
  opacity: 0.001,
  helper: 'clone',
  drag: function(event) {
  	rotateDial(event, "2");
  	dialFunction(2);
  }
});

/*
//https://stackoverflow.com/questions/846221/logarithmic-slider
function LogSlider(options) {
   options = options || {};
   this.minpos = options.minpos || 0;
   this.maxpos = options.maxpos || 100;
   this.minlval = Math.log(options.minval || 1);
   this.maxlval = Math.log(options.maxval || 100000);

   this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
}

LogSlider.prototype = {
   // Calculate value from a slider position
   value: function(position) {
      return Math.exp((position - this.minpos) * this.scale + this.minlval);
   },
   // Calculate slider position from a value
   position: function(value) {
      return this.minpos + (Math.log(value) - this.minlval) / this.scale;
   }
};


var logsl = new LogSlider({minpos:0, maxpos:475, minval: 20, maxval: 12000});
*/




var dialFunction = function(dialNumber){
	if(state==0){
		view = mode;
	}
	if(view==2){

	}
	if(view==4){//BPM
		if(dialNumber==1){
			 	swing = dial1Value;
			 	Tone.Transport.swing = swing/1000;				//swingInterval = (tempoInterval/256)*swing;

				var x = Math.floor(dial1Value/31.25)
				//32 segments
 				updateLevelMeter(1,x);

 				var value = Math.floor(swing/52.63);
 				if(value<10){
					value = "50"+value;
				}else if(value<100){
					value = "5"+value;
				}
				value = Math.floor(value);
 				 updateSegmentDisplay(value);
		}else{
				//HIDE LCD LABELS
	 		$("#disco, #tencho, #hiphop").css("opacity","0");

			  	tempo = Math.floor(((dial2Value)/1000*180)+60);
			  	//Tone.Transport.bpm.rampTo(tempo,0.5);
			  	Tone.Transport.bpm.value  = tempo;
 				//tempoInterval = 15000/(tempo);
 				var x = Math.floor(dial2Value/31.25)
			 	updateLevelMeter(1,x);

			 	var value = tempo;
			 	if(value<100){
					value = "0"+value;
				}
				value = Math.floor(value);
			 	updateSegmentDisplay(value);

		}
	}else{
		switch(fxMode){
			case 0: //TONE
				if(dialNumber==1){
					segmentDisplayLock=1;
					clearTimeout(segDispLockTimer);
					segDispLockTimer = setTimeout(segmentDisplayLockFunc,3000);
					updateSegmentDisplay("Ptc");


					updateLevelMeter(1,dial1Value/31.25);

					 channelSettingsArr[selectedChannel].fxPitch = dial1Value;
				}else{
					segmentDisplayLock=1;
					clearTimeout(segDispLockTimer);
					segDispLockTimer = setTimeout(segmentDisplayLockFunc,3000);
					updateSegmentDisplay("VOL");

					updateLevelMeter(1,dial2Value/31.25);

					/*(0-1000)-500 = (-500 to 500);
					/ 20.8
					-24 to 24*/
					 channelSettingsArr[selectedChannel].fxVolume = (dial2Value-500)/20.8;//0-((1000-dial2Value)/16);

				}
				break;
			case 1: //FILTER
				if(dialNumber==1){

					segmentDisplayLock=1;
					clearTimeout(segDispLockTimer);
					segDispLockTimer = setTimeout(segmentDisplayLockFunc,3000);

					 // position will be between 0 and 100
					  var minp = 0;
					  var maxp = 475;

					  // The result should be between 100 an 10000000
					  var minv = Math.log(20);
					  var maxv = Math.log(12000);

					  // calculate adjustment factor
					  var scale = (maxv-minv) / (maxp-minp);


					if(dial1Value<475){
						var filterFreq = Math.exp(minv + scale*(dial1Value-minp));
						var value = "LPF";
						var filtType = "lowpass";
						//var filterFreq = (dial1Value*25.2)+20;//0-450 = 20 - 20,000
						var levelMeterType = 1;
						updateLevelMeter(levelMeterType,dial1Value/15.625);

					}else if(dial1Value>525){

						var val = dial1Value-525;
					 	var filterFreq = Math.exp(minv + scale*(val-minp));

						var value = "HPF";
						var filtType = "highpass";
						//var filterFreq = ((dial1Value-525)*25.2)+20;//= 20- 20,000 (dial1Value*44.4)+20
						var levelMeterType = 2;
						var segLevel = 32-(dial1Value-525)/14.844;// 32-(dial1Value/15.625)
						updateLevelMeter(levelMeterType,segLevel);

					}else{

						var value = "noF";
						var filtType = "highpass";
						var filterFreq = 20;
						levelMeterType = 0;
						updateLevelMeter(levelMeterType,0);
					}

					updateSegmentDisplay(value);

					channelSettingsArr[selectedChannel].fxFilter = dial1Value;
					channelSettingsArr[selectedChannel].fxFilterType = filtType;
				    channelSettingsArr[selectedChannel].fxFilterFreq = filterFreq;


			}else{

				segmentDisplayLock=1;
				clearTimeout(segDispLockTimer);
				segDispLockTimer = setTimeout(segmentDisplayLockFunc,3000);
				 updateSegmentDisplay("RE5");

				 var value = 32-dial2Value/31.25;
				 updateLevelMeter(0,value);

				 var filterRes = dial2Value/100;

				 channelSettingsArr[selectedChannel].fxFilterRes = filterRes;
				 channelSettingsArr[selectedChannel].fxResonance = dial2Value;

			}

				break;
			case 2: //TRIM
			if(dialNumber==1){
				segmentDisplayLock=1;
				clearTimeout(segDispLockTimer);
				segDispLockTimer = setTimeout(segmentDisplayLockFunc,3000);

				channelSettingsArr[selectedChannel].fxTrim = dial1Value;

				dial1Value=Math.min(999,dial1Value);
				updateSegmentDisplay(dial1Value);

				updateLevelMeter(3,dial1Value/31.25,dial2Value/31.25);



			}else{
				segmentDisplayLock=1;
				clearTimeout(segDispLockTimer);
				segDispLockTimer = setTimeout(segmentDisplayLockFunc,3000);

				channelSettingsArr[selectedChannel].fxLength = dial2Value;

				dial2Value=Math.min(999,dial2Value);
				updateSegmentDisplay(dial2Value);

				updateLevelMeter(3,dial1Value/31.25,dial2Value/31.25);





			}
				break;
		}
	}
}

var updateSegmentDisplay = function(value){
	clearTimeout(clockTimer);
	$(".segmentDisplay").css("margin","0 0 0 1em");
	$(".segmentDisplay").html(value);
	$("#am").css("opacity","0");
	$("#pm").css("opacity","0");
}
//});

document.onkeydown = checkKey;
function checkKey(e) {
    var event = window.event ? window.event : e;
    switch(event.keyCode){
    	case 13://Return
    		// console.log("Return");
    		playButtonFunction();
    		break;

    		case 56://FX
    		// console.log("FX");
    		fxButtonFunction();
    		break;

    		case 57://WRITE
    		// console.log("Write");
    		writeButtonFunction();
    		break;

    	case 53://5
    		// console.log("5");
    		soundButtonFunction();
    		break;

		case 54://6
    		// console.log("6");
    		patternButtonFunction();
    		break;555

		case 55://7
    		// console.log("7");
    		tempoButtonFunction();
    		break;


    	case 49://1
    		buttonFunction(1);
    		// console.log("1");
    		break;

		case 50://2
		buttonFunction(2);
    		// console.log("2");
    		break;

		case 51://3
		buttonFunction(3);
    		// console.log("3");
    		break;

		case 52://4
		buttonFunction(4);
    		// console.log("4");
    		break;

		case 81://Q
		//test.triggerAttackExt(noteArray[1],"+0",1,0,1);

		buttonFunction(5);
    		// console.log("Q");
    		break;

		case 87://W
		buttonFunction(6);
    		// console.log("W");
    		break;

    	case 69://E
    	buttonFunction(7);
    		// console.log("E");
    		break;

		case 82://Q
		buttonFunction(8);
    		// console.log("R");
    		break;


		case 65://A
		buttonFunction(9);
    		// console.log("A");
    		break;

		case 83://S
		buttonFunction(10);
    		// console.log("S");
    		break;

    		case 68://Q
    		buttonFunction(11);
    		// console.log("D");
    		break;

    		case 70://Q
    		buttonFunction(12);
    		// console.log("F");
    		break;

    		case 90://Q
    		buttonFunction(13);
    		// console.log("Z");
    		break;

    		case 88://Q
    		buttonFunction(14);
    		// console.log("X");
    		break;

    		case 67://Q
    		buttonFunction(15);
    		// console.log("C");
    		break;

    		case 86://Q
    		buttonFunction(16);
    		// console.log("V");
    		break;

    }
}
