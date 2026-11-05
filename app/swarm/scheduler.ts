import type { Agent, BuildTask, Job } from './types';

export class TaskScheduler {
  jobs: Job[] = [];
  tasks: BuildTask[];
  limit: number;
  constructor(tasks: BuildTask[], limit: number) { this.tasks=tasks;this.limit=limit; }
  get complete() { return this.tasks.every(task => task.state === 'done'); }
  get done() { return this.tasks.filter(task => task.state === 'done').length; }
  visible(task: BuildTask, top: number, height: number, width=Infinity, left=0) {
    const r=task.rect,c=task.clip;
    const x=Math.max(r.x,c?.x??-Infinity),y=Math.max(r.y,c?.y??-Infinity);
    const right=Math.min(r.x+r.width,c?c.x+c.width:Infinity),bottom=Math.min(r.y+r.height,c?c.y+c.height:Infinity);
    return right>x&&bottom>y&&bottom>top-40&&y<top+height+40&&right>left-30&&x<left+width+30;
  }
  ready(task: BuildTask) { return task.state === 'pending' && (task.parent === null || this.tasks[task.parent]?.state === 'done'); }

  assign(agents: Agent[], top: number, height: number, width=Infinity, left=0, now=0) {
    let available = this.tasks.filter(task => this.ready(task) && this.visible(task, top, height,width,left));
    const stage = Math.min(...available.map(task=>task.priority??0),...this.jobs.map(job=>job.task.priority??0));
    available=available.filter(task=>(task.priority??0)<=stage);
    available.sort((a, b) => a.rect.y - b.rect.y || a.depth - b.depth || a.rect.x - b.rect.x || a.order - b.order);
    const created: Job[] = [];
    for (const task of available) {
      if (this.jobs.length >= this.limit) break;
      const free=agents.filter(agent=>!agent.busy&&agent.readyAt<=now);
      free.sort((a,b)=>Number(b.present)-Number(a.present)||Math.hypot(a.x-(task.rect.x-left),a.y-(task.rect.y-top))-Math.hypot(b.x-(task.rect.x-left),b.y-(task.rect.y-top)));
      const agent=free[0];
      if (!agent) break;
      const continuing=agent.present;
      if(!continuing){agent.batch++;agent.completed=0;agent.quota=3+(agent.id+agent.batch-1)%3;}
      agent.busy=true;agent.present=true;task.state='active';
      const source=task.source==null?null:this.tasks[task.source]?.rect??null;
      const job = { task, agent, elapsed: 0, travel: 0, arrived: false, progress: 0, continuing, source };
      this.jobs.push(job); created.push(job);
    }
    return created;
  }

  private release(job:Job){job.agent.busy=false;job.agent.working=false;this.jobs=this.jobs.filter(current=>current!==job);}
  private retire(agent:Agent,now:number){agent.present=false;agent.vx=0;agent.vy=0;agent.trail=[];agent.readyAt=now+.25;}
  finish(job: Job,now=0) {
    job.task.state='done';this.release(job);job.agent.completed++;
    if(job.agent.completed>=job.agent.quota)this.retire(job.agent,now);
    else job.agent.idleUntil=now+.6;
  }
  suspend(job: Job) { job.task.state='pending';this.release(job);this.retire(job.agent,0);job.agent.readyAt=0; }
  retireIdle(agents:Agent[],now:number,hasWork:boolean){
    for(const agent of agents)if(agent.present&&!agent.busy&&(!hasWork||now>=agent.idleUntil))this.retire(agent,now);
  }
  passed(top: number) {
    const passed = this.tasks.filter(task => task.state !== 'done' && task.rect.y + task.rect.height < top - 80);
    for (const task of passed) {
      const job = this.jobs.find(job => job.task === task);
      if (job) this.suspend(job);task.state = 'done';
    }
    return passed;
  }
}
