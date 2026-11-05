import type { Agent, Point } from './types';

const palette = ['#91b8bb','#bdcfce','#adb8a0','#d4b6a2','#a6b3ca','#c9a9b8','#b1c6a6','#e0d8b9'];
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

/** Task-owned cursors. Idle workers have no position animation and are never painted. */
export class CursorSwarmEngine {
  agents: Agent[];
  time = 0;
  constructor(count: number, origin: Point, random = Math.random) {
    this.agents = Array.from({length:count},(_,id) => {
      const phase = random()*Math.PI*2, radius = 20+random()*85;
      return {id,x:origin.x+Math.cos(phase)*radius,y:origin.y+Math.sin(phase)*radius,vx:0,vy:0,goal:{...origin},color:palette[id%palette.length],phase,pace:.78+random()*.44,busy:false,working:false,trail:[]};
    });
  }
  reduce(count: number) {
    for(let index=this.agents.length-1;index>=0&&this.agents.length>count;index--)if(!this.agents[index].busy)this.agents.splice(index,1);
  }
  activate(agent: Agent, target: Point, width: number, height: number) {
    agent.goal={...target};agent.working=false;agent.vx=0;agent.vy=0;agent.trail=[];
    // Enter next to this task, never fly across the page from an idle swarm.
    agent.x=clamp(target.x-30-(agent.id%3)*7,8,width-8);
    agent.y=clamp(target.y+22+(agent.id%2)*8,8,height-8);
  }
  step(delta: number, width: number, height: number, rate=1) {
    let remaining=Math.min(.05,Math.max(0,delta))*clamp(rate,.1,15);
    const active=this.agents.filter(agent=>agent.busy);
    // Fixed-size substeps keep inertia stable even at the faster build rate.
    while(remaining>0){
    const dt=Math.min(1/120,remaining);remaining-=dt;this.time+=dt;
    const forces=active.map(agent=>{
      let sx=0,sy=0;
      for(const other of active){
        if(other===agent)continue;
        const dx=agent.x-other.x,dy=agent.y-other.y,d2=dx*dx+dy*dy;
        if(d2<34*34&&d2>.001){sx+=dx/d2;sy+=dy/d2;}
      }
      const noise=Math.sin(this.time*2.1+agent.phase)*2;
      return {x:(agent.goal.x-agent.x)*90-agent.vx*17+sx*150+noise,y:(agent.goal.y-agent.y)*90-agent.vy*17+sy*150-noise*.65};
    });
    active.forEach((agent,index)=>{
      // While building, the pointer owns the actual caret/resize handle.
      if(agent.working){agent.x=agent.goal.x;agent.y=agent.goal.y;agent.vx=0;agent.vy=0;agent.trail=[];return;}
      agent.vx+=forces[index].x*dt;agent.vy+=forces[index].y*dt;
      const length=Math.hypot(agent.vx,agent.vy),maximum=570*agent.pace;
      if(length>maximum){agent.vx*=maximum/length;agent.vy*=maximum/length;}
      agent.x=clamp(agent.x+agent.vx*dt,8,width-8);agent.y=clamp(agent.y+agent.vy*dt,8,height-8);
      agent.trail.push({x:agent.x,y:agent.y});if(agent.trail.length>7)agent.trail.shift();
    });
    }
  }
}
