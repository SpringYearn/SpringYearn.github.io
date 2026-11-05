import { DOMAnalyzer, measureGlyphs } from './analyzer';
import { CursorSwarmEngine } from './engine';
import { TaskScheduler } from './scheduler';
import { AnimationRenderer } from './renderer';
import { SwarmAudio } from './audio';
import type { BuilderPhase, BuilderSnapshot, BuildTask, Job } from './types';

type DeviceNavigator=Navigator&{deviceMemory?:number;connection?:{saveData?:boolean}};
const clamp=(value:number,low:number,high:number)=>Math.max(low,Math.min(high,value));

export class SwarmController {
  private analyzer=new DOMAnalyzer();
  private scheduler:TaskScheduler|null=null;
  private engine:CursorSwarmEngine;
  private renderer:AnimationRenderer;
  private audio=new SwarmAudio();
  private frame=0;private previous=0;private intro=0;private clock=0;private prepared=false;private alive=true;private paused=false;
  private layoutDirty=false;private scrollDirty=false;private lastReport=0;private average=16;private samples=0;
  private lastMeasure=0;
  private observer:ResizeObserver;private mutations:MutationObserver;private reduced=matchMedia('(prefers-reduced-motion: reduce)');
  private startupTimer=0;private fontTimer=0;
  speed=1;sound=false;
  constructor(private root:HTMLElement,host:HTMLElement,private report:(snapshot:BuilderSnapshot)=>void,speed=1){
    this.speed=speed;const device=navigator as DeviceNavigator,small=innerWidth<700;
    const limited=(device.hardwareConcurrency||8)<=4||(device.deviceMemory??8)<=4||device.connection?.saveData;
    this.engine=new CursorSwarmEngine(limited?14:small?22:32,{x:innerWidth/2,y:innerHeight*.43});
    this.renderer=new AnimationRenderer(host);
    this.observer=new ResizeObserver(()=>{this.layoutDirty=true;});this.observer.observe(root);
    this.mutations=new MutationObserver(records=>{
      if(!this.prepared)return;
      const relevant=records.some(record=>{
        const element=record.target instanceof Element?record.target:record.target.parentElement;
        return element&&!element.closest('.site-status,.art-cursor,.spring-logo,.spring-logo-controls,.language-menu,.mobile-nav-panel,dialog');
      });
      if(relevant)this.finish('ready');
    });
    window.addEventListener('scroll',this.scroll,{passive:true});window.addEventListener('resize',this.resize,{passive:true});
    window.addEventListener('keydown',this.keyboard);document.addEventListener('visibilitychange',this.visibility);
    this.reduced.addEventListener('change',this.preference);document.fonts.addEventListener('loadingdone',this.fonts);
    document.documentElement.classList.add('swarm-building');
    this.emit('opening');this.request();
    this.startupTimer=window.setTimeout(()=>{if(!this.prepared)this.finish('ready');},6500);
    void this.prepare();
  }
  private async prepare(){
    try{
      await Promise.race([document.fonts.ready,new Promise(resolve=>{this.fontTimer=window.setTimeout(resolve,1500);})]);
      if(!this.alive)return;
      // Settle reveal transforms before reading the complete document in one pass.
      await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));if(!this.alive)return;
      const tasks=this.analyzer.analyze(this.root);if(!tasks.length){this.finish('done');return;}
      this.scheduler=new TaskScheduler(tasks,innerWidth<700?4:7);this.analyzer.conceal();this.prepared=true;
      this.mutations.observe(this.root,{subtree:true,childList:true,characterData:true});
      window.clearTimeout(this.startupTimer);window.clearTimeout(this.fontTimer);
    }catch{this.finish('ready');}
  }
  private emit(phase:BuilderPhase){
    this.report({phase,done:this.scheduler?.done??0,total:this.scheduler?.tasks.length??0,cursors:this.engine.agents.length,speed:this.speed,sound:this.sound});
  }
  private request(){if(this.alive&&!this.paused&&!document.hidden&&!this.frame)this.frame=requestAnimationFrame(this.tick);}
  private scroll=()=>{this.scrollDirty=true;this.request();};
  private resize=()=>{this.layoutDirty=true;this.renderer.resize();this.request();};
  private fonts=()=>{this.layoutDirty=true;this.request();};
  private keyboard=(event:KeyboardEvent)=>{if(event.key==='Escape')this.finish('done');};
  private preference=()=>{if(this.reduced.matches)this.finish('reduced');};
  private visibility=()=>{if(document.hidden){cancelAnimationFrame(this.frame);this.frame=0;this.previous=0;}else this.request();};
  togglePause(){this.paused=!this.paused;this.previous=0;if(this.paused){cancelAnimationFrame(this.frame);this.frame=0;this.emit('paused');}else{this.emit(this.intro<1.4?'opening':'building');this.request();}}
  setSpeed(speed:number){this.speed=clamp(speed,.5,3);this.emit(this.paused?'paused':this.intro<1.4?'opening':'building');}
  setSound(enabled:boolean){this.audio.setEnabled(enabled);this.sound=this.audio.enabled;this.emit(this.paused?'paused':this.intro<1.4?'opening':'building');if(enabled)this.audio.play('click');}

  private tick=(now:number)=>{
    this.frame=0;if(!this.alive||this.paused||document.hidden)return;
    try{
      const raw=this.previous?now-this.previous:16;this.previous=now;
      this.average=this.average*.96+raw*.04;this.samples++;
      if(this.samples%120===0&&this.average>27)this.engine.reduce(Math.max(10,this.engine.agents.length-4));
      const delta=Math.min(.05,raw/1000),step=delta*this.speed;this.clock+=step;
      if(this.prepared)this.intro=Math.min(1.4,this.intro+step);
      const top=scrollY,left=scrollX,height=innerHeight,width=innerWidth,scheduler=this.scheduler;
      const dropping:Job[]=[];let passed:BuildTask[]=[];
      if(scheduler&&this.prepared&&this.intro>=1.4){
        if(this.layoutDirty){
          this.analyzer.measure();
          for(const job of [...scheduler.jobs]){scheduler.suspend(job);dropping.push(job);}
          for(const task of scheduler.tasks)if(task.state!=='done'&&(!task.element.isConnected||task.rect.width<=1||task.rect.height<=1)){task.state='done';passed.push(task);}
          this.layoutDirty=false;
        }else if(this.scrollDirty||now-this.lastMeasure>120){
          this.analyzer.measure(scheduler.tasks.filter(task=>task.state!=='done'&&task.rect.y+task.rect.height>top-100&&task.rect.y<top+height+100));this.lastMeasure=now;
        }else this.analyzer.measure(scheduler.jobs.map(job=>job.task));
        this.scrollDirty=false;
        passed.push(...scheduler.passed(top));
        for(const job of [...scheduler.jobs])if(!scheduler.visible(job.task,top,height,width,left)){scheduler.suspend(job);dropping.push(job);}
        const created=scheduler.assign(this.engine.agents,top,height,width,left);
        // Read all newly assigned glyph geometry before changing any DOM styles.
        const glyphs=created.map(job=>({job,glyphs:job.task.kind==='text'?measureGlyphs(job.task):[]}));
        for(const job of dropping)this.renderer.drop(job.task);
        for(const task of passed){this.renderer.drop(task);this.analyzer.reveal(task);}
        for(const item of glyphs)this.renderer.begin(item.job.task,item.glyphs);
        for(const job of [...scheduler.jobs]){
          if(!job.task.element.isConnected){this.renderer.drop(job.task);scheduler.finish(job);continue;}
          const goal=this.renderer.goal(job,top,left);job.agent.goal=goal;job.travel+=step;
          if(!job.arrived&&(Math.hypot(job.agent.x-goal.x,job.agent.y-goal.y)<32||job.travel>2.2)){
            job.arrived=true;this.audio.play('click',job.agent.x/width);
          }
          if(job.arrived){
            const before=job.progress;job.elapsed+=step;job.progress=Math.min(1,job.elapsed/job.task.duration);
            if(job.task.kind==='text'&&Math.floor(before*100)!==Math.floor(job.progress*100))this.audio.play('type',job.agent.x/width);
            else if(job.task.kind!=='text')this.audio.play('drag',job.agent.x/width);
            if(job.task.kind==='image'&&job.progress>.3)this.analyzer.scan(job.task,clamp((job.progress-.3)/.7,0,1));
            if(job.progress>=1){this.renderer.drop(job.task);this.analyzer.reveal(job.task);scheduler.finish(job);this.audio.play('snap',job.agent.x/width);}
          }
        }
        if(scheduler.complete){this.audio.play('complete');this.finish('done');return;}
      }
      const jobs=scheduler?.jobs??[],focus=jobs[0]?.agent.goal??{x:width*.5,y:Math.min(height*.43,height-150)};
      this.engine.step(delta,width,height,focus,this.speed);
      this.renderer.paint(this.engine.agents,jobs,top,left,this.clock,this.intro/1.4);
      if(now-this.lastReport>220){this.lastReport=now;this.emit(this.intro<1.4?'opening':jobs.length?'building':'waiting');}
      this.request();
    }catch{this.finish('ready');}
  };

  finish(phase:BuilderPhase='done'){
    if(!this.alive)return;this.alive=false;cancelAnimationFrame(this.frame);this.frame=0;
    window.clearTimeout(this.startupTimer);window.clearTimeout(this.fontTimer);
    this.observer.disconnect();this.mutations.disconnect();
    window.removeEventListener('scroll',this.scroll);window.removeEventListener('resize',this.resize);window.removeEventListener('keydown',this.keyboard);
    document.removeEventListener('visibilitychange',this.visibility);this.reduced.removeEventListener('change',this.preference);document.fonts.removeEventListener('loadingdone',this.fonts);
    this.analyzer.restore();this.renderer.dispose();this.audio.dispose();document.documentElement.classList.remove('swarm-building');this.emit(phase);
  }
}
