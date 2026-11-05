export type SoundCue = 'click'|'type'|'drag'|'snap'|'complete';

const profiles:Record<SoundCue,{length:number;peak:number;filter:BiquadFilterType;frequency:number;thump:number}>={
  click:{length:.036,peak:.38,filter:'bandpass',frequency:1900,thump:130},
  type:{length:.045,peak:.24,filter:'bandpass',frequency:2400,thump:165},
  drag:{length:.08,peak:.07,filter:'lowpass',frequency:850,thump:0},
  snap:{length:.022,peak:.19,filter:'highpass',frequency:1800,thump:210},
  complete:{length:.04,peak:.22,filter:'bandpass',frequency:1300,thump:115},
};

/** A press/release click, key tap or softly windowed friction texture, not a pitched UI beep. */
export function soundTexture(cue:SoundCue,sampleRate:number,random=Math.random):Float32Array{
  const spec=profiles[cue],samples=new Float32Array(Math.ceil(spec.length*sampleRate));
  for(let i=0;i<samples.length;i++){
    const t=i/sampleRate;
    const envelope=cue==='drag'?Math.pow(Math.sin(Math.PI*t/spec.length),1.5):
      cue==='click'?Math.exp(-t*450)+(t>=.018?.4*Math.exp(-(t-.018)*500):0):Math.exp(-t*(cue==='snap'?400:230));
    samples[i]=(random()*2-1)*envelope*spec.peak;
  }
  return samples;
}

/** Enabled by default; browser autoplay rules decide when output can begin. */
export class SwarmAudio {
  private context:AudioContext|null=null;
  private gain:GainNode|null=null;
  private last=new Map<SoundCue,number>();
  private voices=new Set<AudioScheduledSourceNode>();
  private closing=false;
  enabled=true;
  private unlisten(){
    window.removeEventListener('pointerdown',this.unlock,true);window.removeEventListener('click',this.unlock,true);window.removeEventListener('keydown',this.unlock,true);
  }
  private stateChanged=()=>{if(this.context?.state==='running')this.unlisten();};
  private unlock=(event:Event)=>{
    if(!event.isTrusted||document.hidden||!this.enabled||this.closing||!this.context)return;
    if(event instanceof KeyboardEvent&&(event.ctrlKey||event.metaKey||event.altKey||['Shift','Control','Alt','Meta'].includes(event.key)))return;
    const context=this.context;
    void context.resume().then(()=>{if(!this.closing&&context.state==='running'){this.unlisten();this.play('click',event instanceof MouseEvent?event.clientX/innerWidth:.5);}}).catch(()=>{});
  };
  arm(){
    if(this.closing||!this.enabled)return;
    try{
      this.context??=new AudioContext({latencyHint:'interactive'});
      if(!this.gain){this.gain=this.context.createGain();this.gain.gain.value=.035;this.gain.connect(this.context.destination);this.context.addEventListener('statechange',this.stateChanged);}
      this.gain.gain.setTargetAtTime(.035,this.context.currentTime,.01);
      if(this.context.state!=='running'){
        window.addEventListener('pointerdown',this.unlock,true);window.addEventListener('click',this.unlock,true);window.addEventListener('keydown',this.unlock,true);
        if(navigator.userActivation?.isActive)void this.context.resume().catch(()=>{});
      }
    }catch{this.enabled=false;this.unlisten();this.close();}
  }
  setEnabled(enabled:boolean){
    this.enabled=enabled;
    if(enabled)this.arm();else{this.unlisten();if(this.context&&this.gain)this.gain.gain.setTargetAtTime(0,this.context.currentTime,.01);}
  }
  private track(source:AudioScheduledSourceNode,nodes:AudioNode[],end:number){
    this.voices.add(source);source.onended=()=>{source.disconnect();for(const node of nodes)node.disconnect();this.voices.delete(source);if(this.closing&&!this.voices.size)this.close();};source.start();source.stop(end);
  }
  play(cue:SoundCue,x=.5){
    const context=this.context;if(!this.enabled||!context||!this.gain||context.state!=='running'||this.closing)return;
    const now=context.currentTime,spacing=cue==='type'?.06:cue==='drag'?.075:.04;
    if(now-(this.last.get(cue)??-1)<spacing)return;this.last.set(cue,now);
    const spec=profiles[cue],samples=soundTexture(cue,context.sampleRate);
    const buffer=context.createBuffer(1,samples.length,context.sampleRate);buffer.getChannelData(0).set(samples);
    const source=context.createBufferSource(),filter=context.createBiquadFilter(),pan=context.createStereoPanner();
    source.buffer=buffer;filter.type=spec.filter;filter.frequency.value=Math.min(context.sampleRate*.45,spec.frequency*(cue==='type'?.9+Math.random()*.2:1));filter.Q.value=.7;
    pan.pan.value=Math.max(-.65,Math.min(.65,(x-.5)*1.3));source.connect(filter);filter.connect(pan);pan.connect(this.gain);
    if(spec.thump){
      const body=context.createOscillator(),envelope=context.createGain(),length=Math.min(.028,spec.length-.004);
      body.type='triangle';body.frequency.setValueAtTime(spec.thump*(cue==='type'?.9+Math.random()*.2:1),now);body.frequency.exponentialRampToValueAtTime(spec.thump*.65,now+length);
      envelope.gain.setValueAtTime(.1,now);envelope.gain.exponentialRampToValueAtTime(.0001,now+length);body.connect(envelope);envelope.connect(pan);
      this.track(body,[envelope],now+length+.002);
    }
    this.track(source,[filter,pan],now+spec.length+.004);
  }
  private close(){
    const context=this.context;this.context=null;this.gain=null;
    if(context){context.removeEventListener('statechange',this.stateChanged);if(context.state!=='closed')void context.close().catch(()=>{});}
  }
  dispose(){
    this.enabled=false;this.closing=true;this.unlisten();this.last.clear();
    if(this.context&&this.gain)this.gain.gain.setTargetAtTime(0,this.context.currentTime,.012);
    if(!this.voices.size)this.close();
  }
}
