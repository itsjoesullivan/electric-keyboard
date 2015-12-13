import ElectricKeyboard from './index';
import FriendlyMIDI from 'friendly-midi';

var width = $(".container").width();
var height = width / 4;

var keyboard = new QwertyHancock({
  id: 'keyboard',
    width: width,
    height: height,
    octaves: 2,
    startNote: 'c4',
    whiteNotesColour: 'white',
    blackNotesColour: 'black',
    hoverColour: '#f3e939'
});

var context = new AudioContext();

var eKeyboard = new ElectricKeyboard(context);

eKeyboard.connect(context.destination);

keyboard.keyDown = function (note, frequency) {
  console.log('keyDown', note, frequency);
  eKeyboard.noteOn(context.currentTime, {
    note: note,
    frequency: frequency,
    velocity: 100
  });
};
keyboard.keyUp = function (note, frequency) {
  console.log('keyUp', note, frequency);
  eKeyboard.noteOff(context.currentTime, {
    note: note,
    frequency: frequency
  });
};

 
var midi = new FriendlyMIDI();
 
midi.on('noteOn', function(data) {
  eKeyboard.noteOn(context.currentTime, {
    note: data.note,
    frequency: data.frequency,
    velocity: data.velocity
  });

});
 
midi.on('noteOff', function(data) {
  eKeyboard.noteOff(context.currentTime, {
    note: data.note,
    frequency: data.frequency
  });
});
 
midi.on('pitchBend', function(value) {
});
 
midi.on('modulation', function(value) {
  console.log(data);
});
