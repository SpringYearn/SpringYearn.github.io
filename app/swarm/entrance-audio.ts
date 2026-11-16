type Tone = {
  at: number;
  length: number;
  attack: number;
  frequency: number;
  level: number;
  pan?: number;
  wave?: OscillatorType;
  glide?: number;
};

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const floor = .0001;

/** An original entrance cue whose rises and landings follow the visual transition. */
export function scheduleEntranceScore(context: BaseAudioContext, output: AudioNode, travel: number) {
  const start = context.currentTime + .016;
  const master = context.createGain();
  master.gain.value = .66;
  master.connect(output);
  const music = context.createBiquadFilter();
  music.type = "lowpass";
  music.frequency.value = 2400;
  music.Q.value = .36;
  music.connect(master);
  const echo = context.createDelay(.24);
  const echoLevel = context.createGain();
  echo.delayTime.value = .137;
  echoLevel.gain.value = .14;
  music.connect(echo);
  echo.connect(echoLevel);
  echoLevel.connect(master);

  const voices = new Set<AudioScheduledSourceNode>();
  let endPlayback!: () => void;
  const finished = new Promise<void>(resolve => { endPlayback = resolve; });
  const track = (source: AudioScheduledSourceNode, nodes: AudioNode[], from: number, until: number) => {
    voices.add(source);
    source.onended = () => {
      source.disconnect();
      for (const node of nodes) node.disconnect();
      voices.delete(source);
      if (!voices.size) {
        music.disconnect();
        echo.disconnect();
        echoLevel.disconnect();
        master.disconnect();
        endPlayback();
      }
    };
    source.start(from);
    source.stop(until);
  };

  const tone = (spec: Tone, destination: AudioNode = music) => {
    const from = start + spec.at, until = from + spec.length;
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    const panner = context.createStereoPanner();
    oscillator.type = spec.wave ?? "sine";
    oscillator.frequency.setValueAtTime(spec.frequency, from);
    if (spec.glide) oscillator.frequency.exponentialRampToValueAtTime(spec.glide, until);
    volume.gain.setValueAtTime(floor, from);
    volume.gain.exponentialRampToValueAtTime(spec.level, from + spec.attack);
    volume.gain.exponentialRampToValueAtTime(spec.level * .46, from + spec.attack + (spec.length - spec.attack) * .4);
    volume.gain.exponentialRampToValueAtTime(floor, until);
    panner.pan.value = spec.pan ?? 0;
    oscillator.connect(volume);
    volume.connect(panner);
    panner.connect(destination);
    track(oscillator, [volume, panner], from, until + .006);
  };

  // The air narrows to a high, soft sweep as the lines converge.
  const airLength = travel * 1.04;
  const buffer = context.createBuffer(1, Math.ceil(airLength * context.sampleRate), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
  const air = context.createBufferSource();
  const band = context.createBiquadFilter();
  const airLevel = context.createGain();
  const airStart = start + .035, airEnd = airStart + airLength;
  air.buffer = buffer;
  band.type = "bandpass";
  band.Q.value = .6;
  band.frequency.setValueAtTime(310, airStart);
  band.frequency.exponentialRampToValueAtTime(1800, airStart + travel * .52);
  band.frequency.exponentialRampToValueAtTime(5100, airStart + travel * .91);
  airLevel.gain.setValueAtTime(floor, airStart);
  airLevel.gain.exponentialRampToValueAtTime(.024, airStart + travel * .23);
  airLevel.gain.exponentialRampToValueAtTime(.17, airStart + travel * .69);
  airLevel.gain.exponentialRampToValueAtTime(floor, airEnd);
  air.connect(band);
  band.connect(airLevel);
  airLevel.connect(master);
  track(air, [band, airLevel], airStart, airEnd);

  tone({ at: .002, length: .20, attack: .009, frequency: 141, glide: 62, level: .092, wave: "triangle" }, master);
  tone({ at: travel * .70, length: .53, attack: .14, frequency: 93, glide: 51, level: .075 }, master);

  // The suspended D harmony opens into G as the portal reaches the paper.
  for (const [index, note] of [50, 57, 61, 64, 66].entries()) {
    tone({ at: index * .032, length: 2.12, attack: .27 + index * .035,
      frequency: hz(note), level: index === 0 ? .039 : .024, pan: index % 2 ? .28 : -.28, wave: "triangle" });
  }
  for (const [index, note] of [43, 55, 59, 62, 69].entries()) {
    tone({ at: travel * .84 + index * .023, length: 2.49 - index * .09, attack: .39 + index * .021,
      frequency: hz(note), level: index < 2 ? .038 : .023, pan: index % 2 ? -.3 : .3, wave: "triangle" });
  }
  const melody = [[.13, 69], [.34, 73], [.61, 76], [.87, 78], [1.06, 74], [1.36, 69]];
  for (const [index, [beat, note]] of melody.entries()) {
    const at = travel * beat;
    const pan = index % 2 ? .4 : -.4;
    tone({ at, length: .72, attack: .016, frequency: hz(note), level: .041, pan });
    tone({ at: at + .012, length: .34, attack: .013, frequency: hz(note + 12), level: .013, pan: -pan });
  }

  let stopping = false;
  return {
    finished,
    stop() {
      if (stopping || !voices.size) return;
      stopping = true;
      const now = context.currentTime;
      master.gain.setTargetAtTime(0, now, .019);
      for (const voice of voices) voice.stop(now + .095);
    },
  };
}
