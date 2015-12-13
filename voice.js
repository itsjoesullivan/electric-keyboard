import adsr from 'adsr';

var smallNumber = 0.00001;

class Voice {
  constructor(context, data) {
    this.context = context;
    this.output = this.context.createGain();


    var op1 = context.createOscillator();
    var op2 = context.createOscillator();
    var op2Gain = context.createGain();
    var env1 = this.env1 = context.createGain();
    var env2 = this.env2 = context.createGain();


    op1.frequency.value = 1 * data.frequency;
    op1.detune.value = 3;
    op2.frequency.value = 14 * data.frequency;
    op2Gain.gain.value = 1 * op1.frequency.value;

    this.env1.gain.value = smallNumber;
    this.env2.gain.value = smallNumber;


    op2.connect(op2Gain);
    op2Gain.connect(env2);
    env2.connect(op1.frequency);
    op1.connect(env1);
    env1.connect(this.output);


    var op3 = context.createOscillator();
    var op4 = context.createOscillator();
    var op4Gain = context.createGain();
    var env3 = this.env3 = context.createGain();
    var env4 = this.env4 = context.createGain();

    this.env3.gain.value = smallNumber;
    this.env4.gain.value = smallNumber;

    op3.frequency.value = 1 * data.frequency;
    op4.frequency.value = 1 * data.frequency;
    op4Gain.gain.value = 1 * op3.frequency.value;

    op4.connect(op4Gain);
    op4Gain.connect(env4);
    env4.connect(op3.frequency);
    op3.connect(env3);
    env3.connect(this.output);


    var op5 = context.createOscillator();
    var op6 = context.createOscillator();
    var op6Gain = context.createGain();
    var env5 = this.env5 = context.createGain();
    var env6 = this.env6 = context.createGain();

    this.env5.gain.value = smallNumber;
    this.env6.gain.value = smallNumber;

    op5.frequency.value = 1 * data.frequency;
    op5.detune.value = -7;
    op6.frequency.value = 1 * data.frequency;
    op6.detune.value = 7;
    op6Gain.gain.value = 4 * op5.frequency.value;

    op6.connect(op6Gain);
    op6Gain.connect(env6);
    env6.connect(op5.frequency);
    op5.connect(env5);
    env5.connect(this.output);

    this.ops =  [
      op1,
      op2,
      op3,
      op4,
      op5,
      op6
    ];

    this.output.gain.value = (data.velocity / 100) * 1/6;


  }
  start(when) {

    this.env1.gain.exponentialRampToValueAtTime(1, when + 0.01);
    this.env1.gain.exponentialRampToValueAtTime(smallNumber, when + 1);

    this.env2.gain.exponentialRampToValueAtTime(1, when + 0.01);
    this.env2.gain.exponentialRampToValueAtTime(smallNumber, when + 0.5);

    this.env3.gain.exponentialRampToValueAtTime(1, when + 0.01);
    this.env3.gain.exponentialRampToValueAtTime(smallNumber, when + 30);

    this.env4.gain.exponentialRampToValueAtTime(1, when + 0.01);
    this.env4.gain.exponentialRampToValueAtTime(smallNumber, when + 30);

    this.env5.gain.exponentialRampToValueAtTime(1, when + 0.01);
    this.env5.gain.exponentialRampToValueAtTime(smallNumber, when + 30);

    this.env6.gain.exponentialRampToValueAtTime(1, when + 0.01);
    this.env6.gain.exponentialRampToValueAtTime(smallNumber, when + 30);

    this.ops.forEach(function(op) {
      op.start(when);
    });
  }
  release(when) {
    let [op1, op2, op3, op4, op5, op6] = this.ops;

    this.env1.gain.cancelScheduledValues(when);
    this.env1.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

    this.env2.gain.cancelScheduledValues(when);
    this.env2.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

    this.env3.gain.cancelScheduledValues(when);
    this.env3.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

    this.env4.gain.cancelScheduledValues(when);
    this.env4.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

    this.env5.gain.cancelScheduledValues(when + 0.1);
    this.env5.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

    this.env6.gain.cancelScheduledValues(when);
    this.env6.gain.exponentialRampToValueAtTime(smallNumber, when + 0.3);

    op1.stop(when + 0.6);
    op2.stop(when + 0.6);
    op3.stop(when + 0.6);
    op4.stop(when + 0.6);
    op5.stop(when + 0.6);
    op6.stop(when + 0.6);
  }
  connect(target) {
    this.output.connect(target);
  }
  disconnect(target) {
    this.output.disconnect(target);
  }
}
export default Voice;
