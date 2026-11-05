import type { Agent, Point } from './types';

const palette = ['#91b8bb','#bdcfce','#adb8a0','#d4b6a2','#a6b3ca','#c9a9b8','#b1c6a6','#e0d8b9'];
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

/** Independent boids simulation. Velocities remain in pixels per second, independent of refresh rate. */
export class CursorSwarmEngine {
  agents: Agent[];
  time = 0;
  constructor(count: number, origin: Point, random = Math.random) {
    this.agents = Array.from({length:count},(_,id) => {
      const phase = random()*Math.PI*2, radius = 20+random()*85;
      return {id,x:origin.x+Math.cos(phase)*radius,y:origin.y+Math.sin(phase)*radius,vx:0,vy:0,goal:{...origin},color:palette[id%palette.length],phase,pace:.78+random()*.44,busy:false,trail:[]};
    });
  }
  reduce(count: number) {
    for(let index=this.agents.length-1;index>=0&&this.agents.length>count;index--)if(!this.agents[index].busy)this.agents.splice(index,1);
  }
  step(delta: number, width: number, height: number, anchor: Point, speed=1) {
    const dt=Math.min(.034,Math.max(0,delta));this.time+=dt;
    const forces=this.agents.map(agent=>{
      let sx=0,sy=0,ax=0,ay=0,cx=0,cy=0,neighbors=0;
      for(const other of this.agents){
        if(other===agent)continue;
        const dx=agent.x-other.x,dy=agent.y-other.y,d2=dx*dx+dy*dy;
        if(d2<115*115){ax+=other.vx;ay+=other.vy;cx+=other.x;cy+=other.y;neighbors++;}
        if(d2<34*34&&d2>.001){sx+=dx/d2;sy+=dy/d2;}
      }
      const orbit=30+(agent.id%6)*15;
      const target=agent.busy?agent.goal:{x:anchor.x+Math.cos(this.time*.55+agent.phase)*orbit,y:anchor.y+Math.sin(this.time*.63+agent.phase)*orbit*.72};
      const noise=Math.sin(this.time*2.1+agent.phase)*5;
      let fx=(target.x-agent.x)*5.5-agent.vx*2.6+sx*320,fy=(target.y-agent.y)*5.5-agent.vy*2.6+sy*320;
      if(neighbors){fx+=(ax/neighbors-agent.vx)*.34+(cx/neighbors-agent.x)*.23;fy+=(ay/neighbors-agent.vy)*.34+(cy/neighbors-agent.y)*.23;}
      return {x:fx+noise,y:fy-noise*.65};
    });
    this.agents.forEach((agent,index)=>{
      agent.vx+=forces[index].x*dt;agent.vy+=forces[index].y*dt;
      const length=Math.hypot(agent.vx,agent.vy),maximum=570*agent.pace*Math.sqrt(speed);
      if(length>maximum){agent.vx*=maximum/length;agent.vy*=maximum/length;}
      agent.x=clamp(agent.x+agent.vx*dt,8,width-8);agent.y=clamp(agent.y+agent.vy*dt,8,height-8);
      agent.trail.push({x:agent.x,y:agent.y});if(agent.trail.length>7)agent.trail.shift();
    });
  }
}
