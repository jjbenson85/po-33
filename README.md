# P0-33

This project was created as part of the pre-work for the General Assembly Web Development Immersive course.

It is a clone of the Teenage Engineering Pocket Operator 33 Knock Out!

[PO-33 Review](https://www.soundonsound.com/reviews/teenage-engineering-po-33-ko-po-35-speak)

[Offical PO-33 Guide](https://teenage.engineering/guides/po-33/en)

[PO-33 Introduction Video](https://www.youtube.com/watch?v=T1841FR_eE8&vl=en)

![image](https://user-images.githubusercontent.com/34242042/64187853-3b1aa280-ce69-11e9-8d52-31c8f9daf53a.png)

I aim to update this project to use better techniques and make it easier to use!


## Setup

I run this locally by using [serve](https://www.npmjs.com/package/serve)

Download and navigate to the folder then run the command

```npx serve```



## Things that work!

### Play
Play Patterns, Chain Patterns, Play sounds live when playback is stopped. Play sounds with keyboard (Number keys = 1234,qwer,asdf,zxcv);

### Edit
In PRF mode select a pitch or sample, in EDT mode add that sound to the pattern.

### Copy Patterns
In Pattern Select mode, press Write to enter Pattern Copy mode. Select a Pattern to copy (Slots with patterns are shown with lit LEDs). Paste the pattern by selecting a new Pattern Slot.

### Select Sounds
Press the Sound button then select a sound using the number keys. (Available sounds are shown with lit LEDs.) Melodic sounds play a note. Drum sounds will cycle all samples in that kit when pressed repeatedly.

Exit Sound mode by pressing Sound again.

Melodic sounds (Nos.1-8) can be played in a scale.

Drum sounds (Nos. 9-16) play different Samples for each number button.


### Record Patterns
Whilst playing, hold down write button for 3 seconds. Sounds played will be recorded into the pattern.

### Change Tempo and Swing
Press the BPM button. The dials control Tempo and Swing.
Numbers 1 to 16 control master volume.

Double tap BPM to cycle around the preset Tempos

### Filter Sounds
When in PRF mode cycle through fx modes to FLT. The dials apply different filters. The sounds can be added to Patterns in Edit mode.


### Not implemented

Trim sample and change length

Change sample volume and pitch with dials.

Add new samples

Record samples

