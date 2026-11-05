export type SoundCue = 'click'|'type'|'drag'|'snap'|'complete';

/** Small synthesized sounds only; no recordings, requests or autoplay before consent. */
export class SwarmAudio {
  private context: AudioContext|null=null;
  private gain: GainNode|null=null;
  private last=new Map<SoundCue,number>();
  private voices=new Set<OscillatorNode>();
  private closing=false;
  enabled=false;
  setEnabled(enabled:boolean){
    this.enabled=enabled;
    if(enabled){
      try{
        this.context??=new AudioContext();
        if(!this.gain){this.gain=this.context.createGain();this.gain.gain.value=.035;this.gain.connect(this.context.destination);}
        void this.context.resume().catch(()=>{});
      }catch{this.enabled=false;}
    }else if(this.context&&this.gain)this.gain.gain.setTargetAtTime(0,this.context.currentTime,.01);
    if(enabled&&this.context&&this.gain)this.gain.gain.setTargetAtTime(.035,this.context.currentTime,.01);
  }
  play(cue:SoundCue,x=.5){
    const context=this.context;if(!this.enabled||!context||!this.gain||context.state!=='running')return;
    const now=context.currentTime,spacing=cue==='type'?.065:cue==='drag'?.14:.045;
    if(now-(this.last.get(cue)??-1)<spacing)return;this.last.set(cue,now);
    const frequencies:Record<SoundCue,number>={click:1250,type:820,drag:210,snap:1468,complete:587};
    const oscillator=context.createOscillator(),gain=context.createGain(),pan=context.createStereoPanner();
    const length=cue==='complete'?.24:cue==='drag'?.08:.035;
    oscillator.type=cue==='drag'?'sine':'triangle';
    oscillator.frequency.setValueAtTime(frequencies[cue]*(cue==='type'?1+Math.random()*.22:1),now);
    oscillator.frequency.exponentialRampToValueAtTime(frequencies[cue]*(cue==='complete'?1.5:.6),now+length);
    gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(cue==='type'?.15:.3,now+.003);gain.gain.exponentialRampToValueAtTime(.001,now+length);
    pan.pan.value=Math.max(-.7,Math.min(.7,(x-.5)*1.4));oscillator.connect(gain);gain.connect(pan);pan.connect(this.gain);
    this.voices.add(oscillator);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();pan.disconnect();this.voices.delete(oscillator);if(this.closing&&!this.voices.size)this.close();};oscillator.start(now);oscillator.stop(now+length+.01);
  }
  private close(){if(this.context)void this.context.close().catch(()=>{});this.context=null;this.gain=null;}
  dispose(){this.enabled=false;this.closing=true;this.last.clear();if(!this.voices.size)this.close();}
}
