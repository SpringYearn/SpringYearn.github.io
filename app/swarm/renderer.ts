import type { Agent, Box, BuildTask, Glyph, Job, Point } from './types';

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
    const drawn=job.arrived?clamp(p/.38,0,1):0;
    const scanning=task.kind==='image'&&p>=.3;
    const drift=task.operation==='duplicate'?(1-drawn)*18:0;
    const x=task.kind==='line'?r.width*p:scanning?r.width*clamp((p-.3)/.7,0,1):r.width*drawn+drift;
    const y=task.kind==='line'?0:scanning?r.height*.5:r.height*drawn-drift;
    return{x:clamp(r.x+x-left,8,this.width-18),y:clamp(r.y+y-top,8,this.height-18)};
  }
  paint(agents:Agent[],jobs:Job[],top:number,left:number,time:number,intro:number){
    const working=agents.filter(agent=>agent.busy);
    this.canvas.dataset.swarmCursorCount=String(working.length);
    this.canvas.dataset.swarmTasks=jobs.map(job=>`${job.task.id}:${job.agent.id}`).join(',');
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
        c.strokeStyle=agent.color;c.globalAlpha=.17;c.lineWidth=1;c.stroke();
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
    c.save();c.lineWidth=1;c.strokeStyle=job.agent.color;c.globalAlpha=.88;
    if(task.operation==='align'||task.operation==='duplicate'){
      c.strokeStyle='#b85b58';c.globalAlpha=.43;c.setLineDash([4,5]);
      c.beginPath();c.moveTo(0,r.y);c.lineTo(this.width,r.y);c.moveTo(r.x,85);c.lineTo(r.x,this.height);c.stroke();c.setLineDash([]);
    }
    if(task.kind==='text'){
      c.strokeStyle='#739bba';c.globalAlpha=.36;c.setLineDash([3,4]);c.strokeRect(r.x-3,r.y-2,r.width+6,r.height+4);c.setLineDash([]);
      if(Math.sin(time*13)>-.3){
        const glyphs=this.glyphs(task),glyph=glyphs[Math.max(0,Math.min(glyphs.length-1,Math.floor(p*glyphs.length)-1))];
        if(glyph){c.globalAlpha=1;c.fillStyle='#4e6c70';c.fillRect(r.x+glyph.x+glyph.width,r.y+glyph.y,1.7,glyph.height);}
      }
    }else if(task.kind==='line'){
      c.beginPath();c.moveTo(r.x,r.y);c.lineTo(r.x+r.width*p,r.y);c.stroke();
    }else{
      const drawn=clamp(p/.38,0,1),width=r.width*drawn,height=r.height*drawn;
      const drift=task.operation==='duplicate'?(1-drawn)*18:0;
      c.strokeStyle='#739bba';c.globalAlpha=.78;c.strokeRect(r.x+drift,r.y-drift,width,height);
      if(task.kind==='image'&&p<.38){
        c.globalAlpha=.22;c.beginPath();c.moveTo(r.x,r.y);c.lineTo(r.x+width,r.y+height);c.moveTo(r.x+width,r.y);c.lineTo(r.x,r.y+height);c.stroke();
      }
      if(task.kind==='image'&&p>=.3){c.strokeStyle='#86acae';c.globalAlpha=.8;c.beginPath();c.moveTo(r.x+r.width*clamp((p-.3)/.7,0,1),r.y);c.lineTo(r.x+r.width*clamp((p-.3)/.7,0,1),r.y+r.height);c.stroke();}
      c.fillStyle='#f7f8f5';c.strokeStyle='#5588be';c.globalAlpha=.95;
      for(const point of [{x:r.x,y:r.y},{x:r.x+width,y:r.y},{x:r.x,y:r.y+height},{x:r.x+width,y:r.y+height}]){c.fillRect(point.x-2.5,point.y-2.5,5,5);c.strokeRect(point.x-2.5,point.y-2.5,5,5);}
      const label=`${Math.round(width)} × ${Math.round(height)}${task.operation==='duplicate'?'  ALT + COPY':''}`;
      const badgeX=clamp(r.x+width+7,8,this.width-150),badgeY=clamp(r.y+height+15,106,this.height-108);
      c.font='10px monospace';c.fillStyle='#f7f8f5';c.globalAlpha=.93;c.fillRect(badgeX-4,badgeY-12,Math.min(185,label.length*6+10),18);c.fillStyle='#4e6c70';c.fillText(label,badgeX,badgeY);
    }
    c.restore();
  }
  dispose(){for(const ghost of this.ghosts.values())ghost.root.remove();this.ghosts.clear();this.canvas.remove();this.opening.remove();}
}
