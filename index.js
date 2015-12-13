import Voice from './voice';

class ElectricKeyboard {
  constructor(context) {
    this.notes = new Map();
    this.context = context;
    this.output = this.context.createGain();
  }
  noteOn(when, data) {
    var voice = new Voice(this.context, data);
    voice.start(when);
    voice.connect(this.output);
    this.notes.set(data.note.toUpperCase(), voice);
  }
  noteOff(when, data) {
    var voice = this.notes.get(data.note.toUpperCase());
    voice.release(when);
    //this.notes.delete(data.note.toUpperCase());
  }
  connect(target) {
    this.output.connect(target);
  }
  disconnect() {
    this.output.disconnect();
  }
};

export default ElectricKeyboard;
