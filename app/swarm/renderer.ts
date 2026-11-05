import type { Agent, Box, BuildTask, Glyph, Job, Point } from './types';
import { dimensionBadge, mediaProgress, SCAN_START, toolBox } from './choreography';

type Ghost = { root: HTMLDivElement; letters: HTMLSpanElement[]; glyphs: Glyph[]; shown: number };
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const clamp=(value:number,low:number,high:number)=>Math.max(low,Math.min(high,value));

/** Canvas draws the tools; actual DOM glyphs and the original media form the built content. */
export class AnimationRenderer {
  canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private ghosts=new Map<number,Ghost>();
  private opening: HTMLDivElement;
  private width=0;private height=0;
  constructor(private host:HTMLElement){
    this.opening=document.createElement('div');this.opening.className='swarm-opening';
    const mark=document.createElement('div');mark.className='swarm-assembly';
    const logo=document.createElement('img');logo.src='/logo.png';logo.alt='';logo.width=72;logo.height=72;
    const name=document.createElement('span');name.textContent='SPRING YEARN';mark.append(logo,name);this.opening.append(mark);
    this.canvas=document.createElement('canvas');this.canvas.className='swarm-canvas';this.canvas.setAttribute('aria-hidden','true');
    const context=this.canvas.getContext('2d');if(!context)throw new Error('Canvas unavailable');this.context=context;
    host.append(this.opening,this.canvas);this.resize();
  }
  resize(){
    this.width=innerWidth;this.height=innerHeight;const dpr=Math.min(2,devicePixelRatio||1);
    this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);
    this.canvas.style.width=`${this.width}px`;this.canvas.style.height=`${this.height}px`;this.context.setTransform(dpr,0,0,dpr,0,0);
  }
  begin(task:BuildTask,glyphs:Glyph[]){
    if(task.kind!=='text')return;
    const root=document.createElement('div');root.className='swarm-type-ghost';root.setAttribute('aria-hidden','true');root.inert=true;
    const fragment=document.createDocumentFragment();
    const letters=glyphs.map(glyph=>{
      const span=document.createElement('span');span.textContent=glyph.text;
      Object.assign(span.style,{left:`${glyph.x}px`,top:`${glyph.y}px`,font:glyph.font,color:glyph.color,letterSpacing:glyph.spacing,height:`${glyph.height}px`,lineHeight:`${glyph.height}px`,visibility:'hidden'});
      fragment.append(span);return span;
    });root.append(fragment);this.host.append(root);this.ghosts.set(task.id,{root,letters,glyphs,shown:0});
  }
  drop(task:BuildTask){const ghost=this.ghosts.get(task.id);ghost?.root.remove();this.ghosts.delete(task.id);}
  glyphs(task:BuildTask){return this.ghosts.get(task.id)?.glyphs??[];}
  goal(job:Job,top:number,left:number):Point {
    const {task,progress:p}=job,r=task.rect;
    if(task.kind==='text'){
      const glyphs=this.glyphs(task),glyph=glyphs[Math.max(0,Math.min(glyphs.length-1,Math.floor(p*glyphs.length)-1))];
      if(glyph)return{x:clamp(r.x+glyph.x+glyph.width-left+4,8,this.width-18),y:clamp(r.y+glyph.y+glyph.height*.7-top,8,this.height-18)};
    }
    const box=toolBox(job),scanning=task.kind==='image'&&p>=SCAN_START;
    const x=task.kind==='line'?r.x+r.width*p:scanning?r.x+r.width*mediaProgress(p):box.x+box.width;
    const y=task.kind==='line'?r.y:scanning?r.y+r.height*.5:box.y+box.height;
    return{x:clamp(x-left,8,this.width-18),y:clamp(y-top,8,this.height-18)};
  }
  paint(agents:Agent[],jobs:Job[],top:number,left:number,time:number,intro:number,multiplier=1){
    const working=agents.filter(agent=>agent.present);
    this.canvas.dataset.swarmCursorCount=String(working.length);
    this.canvas.dataset.swarmTempo=String(multiplier);
    this.canvas.dataset.swarmTasks=jobs.map(job=>`${job.task.id}:${job.agent.id}`).join(',');
    this.canvas.dataset.swarmHandoffs=working.filter(agent=>!agent.busy).map(agent=>String(agent.id)).join(',');
    this.canvas.dataset.swarmBatches=working.map(agent=>`${agent.id}:${agent.batch}:${agent.completed}:${agent.quota}`).join(',');
    const c=this.context;c.clearRect(0,0,this.width,this.height);
    this.opening.style.opacity=String(1-clamp((intro-.65)/.35,0,1));
    this.opening.style.visibility=intro>=1?'hidden':'visible';
    for(const job of jobs){
      if(!job.arrived)continue;
      const r={...job.task.rect,x:job.task.rect.x-left,y:job.task.rect.y-top},p=job.progress;
      const ghost=this.ghosts.get(job.task.id);
      if(ghost){
        ghost.root.style.transform=`translate3d(${r.x}px,${r.y}px,0)`;
        ghost.root.style.width=`${r.width}px`;ghost.root.style.height=`${r.height}px`;
        const clip=job.task.clip;
        ghost.root.style.clipPath=clip?`inset(${Math.max(0,clip.y-job.task.rect.y)}px ${Math.max(0,job.task.rect.x+r.width-clip.x-clip.width)}px ${Math.max(0,job.task.rect.y+r.height-clip.y-clip.height)}px ${Math.max(0,clip.x-job.task.rect.x)}px)`:'none';
        const shown=Math.min(ghost.letters.length,Math.floor(p*ghost.letters.length));
        for(let index=ghost.shown;index<shown;index++)ghost.letters[index].style.visibility='visible';ghost.shown=shown;
      }
      c.save();
      if(job.task.clip){const clip=job.task.clip;c.beginPath();c.rect(clip.x-left,clip.y-top,clip.width,clip.height);c.clip();}
      this.paintTask(job,r,time);c.restore();
    }
    for(const agent of working){
      if(agent.trail.length>1&&Math.hypot(agent.vx,agent.vy)>45){
        c.beginPath();agent.trail.forEach((point,index)=>index?c.lineTo(point.x,point.y):c.moveTo(point.x,point.y));
        c.strokeStyle=agent.color;c.globalAlpha=.3;c.lineWidth=1.4;c.stroke();
      }
      c.save();c.translate(agent.x,agent.y);c.rotate(Math.sin(agent.phase+time*.3)*.06);
      c.beginPath();c.moveTo(0,0);c.lineTo(3.5,17);c.lineTo(8,11);c.lineTo(15,11);c.closePath();
      c.fillStyle=agent.color;c.strokeStyle='#f7f8f5';c.lineWidth=1.25;c.globalAlpha=.98;c.fill();c.stroke();
      c.restore();
    }
    c.globalAlpha=1;
  }
  private paintTask(job:Job,r:Box,time:number){
    const c=this.context,{task,progress:p}=job;
    const b=toolBox(job),selection={...b,x:b.x+r.x-task.rect.x,y:b.y+r.y-task.rect.y};
    c.save();c.lineWidth=1.6;c.strokeStyle='#3577ad';c.globalAlpha=.95;
    // Local guides remain legible without filling the whole page with a grid.
    c.strokeStyle='#b34c4e';c.globalAlpha=.78;c.setLineDash([5,4]);
    c.beginPath();c.moveTo(Math.max(8,r.x-30),r.y);c.lineTo(Math.min(this.width-8,r.x+r.width+30),r.y);
    c.moveTo(r.x,Math.max(8,r.y-26));c.lineTo(r.x,Math.min(this.height-90,r.y+r.height+26));c.stroke();c.setLineDash([]);
    if(task.operation==='align'||task.operation==='duplicate'){
      c.globalAlpha=.58;c.lineWidth=1.3;c.beginPath();c.moveTo(8,r.y);c.lineTo(this.width-8,r.y);c.stroke();
    }
    if(task.kind==='text'){
      c.strokeStyle='#3577ad';c.globalAlpha=.86;c.lineWidth=1.6;c.setLineDash([5,3]);c.strokeRect(r.x-4,r.y-3,r.width+8,r.height+6);c.setLineDash([]);
      if(Math.sin(time*13)>-.3){
        const glyphs=this.glyphs(task),glyph=glyphs[Math.max(0,Math.min(glyphs.length-1,Math.floor(p*glyphs.length)-1))];
        if(glyph){c.globalAlpha=1;c.fillStyle='#3577ad';c.fillRect(r.x+glyph.x+glyph.width,r.y+glyph.y,2.2,glyph.height);}
      }
      this.paintHandles({...r,x:r.x-4,y:r.y-3,width:r.width+8,height:r.height+6},false);
      this.paintDimensions(r,false);
    }else if(task.kind==='line'){
      c.strokeStyle='#3577ad';c.globalAlpha=1;c.lineWidth=2.2;c.beginPath();c.moveTo(r.x,r.y);c.lineTo(r.x+r.width*p,r.y);c.stroke();
      for(const x of [r.x,r.x+r.width*p]){c.beginPath();c.arc(x,r.y,3.5,0,Math.PI*2);c.fillStyle='#f7f8f5';c.fill();c.stroke();}
    }else{
      const {x,y,width,height}=selection;
      if(task.operation==='duplicate'&&job.source){
        const source={...job.source,x:job.source.x+r.x-task.rect.x,y:job.source.y+r.y-task.rect.y};
        c.strokeStyle='#3577ad';c.globalAlpha=.45;c.setLineDash([5,4]);c.strokeRect(source.x,source.y,source.width,source.height);c.setLineDash([]);
        c.strokeStyle='#b34c4e';c.globalAlpha=.8;c.beginPath();c.moveTo(source.x,source.y+source.height*.5);c.lineTo(x,y+height*.5);c.stroke();
      }
      c.fillStyle='#3577ad';c.globalAlpha=.055;c.fillRect(x,y,width,height);
      c.strokeStyle='#f7f8f5';c.lineWidth=4;c.globalAlpha=.95;c.strokeRect(x,y,width,height);
      c.strokeStyle='#3577ad';c.lineWidth=1.8;c.strokeRect(x,y,width,height);
      if(task.kind==='image'&&p<SCAN_START){
        c.globalAlpha=.45;c.beginPath();c.moveTo(x,y);c.lineTo(x+width,y+height);c.moveTo(x+width,y);c.lineTo(x,y+height);c.stroke();
      }
      if(task.kind==='image'&&p>=SCAN_START){c.strokeStyle='#3577ad';c.globalAlpha=.95;c.lineWidth=2.4;c.beginPath();c.moveTo(r.x+r.width*mediaProgress(p),r.y);c.lineTo(r.x+r.width*mediaProgress(p),r.y+r.height);c.stroke();}
      this.paintHandles(selection,true);this.paintDimensions(selection,task.operation==='duplicate');
    }
    c.restore();
  }
  private paintHandles(r:Box,midpoints:boolean){
    const c=this.context,points=[{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x,y:r.y+r.height},{x:r.x+r.width,y:r.y+r.height}];
    if(midpoints)points.push({x:r.x+r.width*.5,y:r.y},{x:r.x+r.width*.5,y:r.y+r.height},{x:r.x,y:r.y+r.height*.5},{x:r.x+r.width,y:r.y+r.height*.5});
    c.fillStyle='#f7f8f5';c.strokeStyle='#3577ad';c.lineWidth=1.6;c.globalAlpha=1;
    for(const point of points){c.fillRect(point.x-3.5,point.y-3.5,7,7);c.strokeRect(point.x-3.5,point.y-3.5,7,7);}
  }
  private paintDimensions(r:Box,copy:boolean){
    const c=this.context,label=`${Math.round(r.width)} × ${Math.round(r.height)}${copy?'  ⌥ COPY':''}`;
    c.font='12px monospace';const badge=dimensionBadge(r,this.width,this.height,c.measureText(label).width+20);
    c.globalAlpha=.98;c.fillStyle='#f7f8f5';c.fillRect(badge.x,badge.y,badge.width,badge.height);c.strokeStyle='#3577ad';c.lineWidth=1.3;c.strokeRect(badge.x,badge.y,badge.width,badge.height);
    c.fillStyle='#284e69';c.fillText(label,badge.x+10,badge.y+17);
  }
  dispose(){for(const ghost of this.ghosts.values())ghost.root.remove();this.ghosts.clear();this.canvas.remove();this.opening.remove();}
}
