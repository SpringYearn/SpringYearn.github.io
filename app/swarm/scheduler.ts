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

  assign(agents: Agent[], top: number, height: number, width=Infinity, left=0) {
    let available = this.tasks.filter(task => this.ready(task) && this.visible(task, top, height,width,left));
    const stage = Math.min(...available.map(task=>task.priority??0),...this.jobs.map(job=>job.task.priority??0));
    available=available.filter(task=>(task.priority??0)<=stage);
    available.sort((a, b) => a.rect.y - b.rect.y || a.depth - b.depth || a.rect.x - b.rect.x || a.order - b.order);
    const created: Job[] = [];
    for (const task of available) {
      if (this.jobs.length >= this.limit) break;
      const agent = agents.find(agent => !agent.busy && agent.id === task.id % agents.length) ?? agents.find(agent => !agent.busy);
      if (!agent) break;
      agent.busy = true; task.state = 'active';
      const job = { task, agent, elapsed: 0, travel: 0, arrived: false, progress: 0 };
      this.jobs.push(job); created.push(job);
    }
    return created;
  }

  private release(job:Job){job.agent.busy=false;job.agent.working=false;job.agent.vx=0;job.agent.vy=0;job.agent.trail=[];this.jobs=this.jobs.filter(current=>current!==job);}
  finish(job: Job) { job.task.state = 'done'; this.release(job); }
  suspend(job: Job) { job.task.state = 'pending'; this.release(job); }
  passed(top: number) {
    const passed = this.tasks.filter(task => task.state !== 'done' && task.rect.y + task.rect.height < top - 80);
    for (const task of passed) {
      const job = this.jobs.find(job => job.task === task);
      if (job) this.finish(job); else task.state = 'done';
    }
    return passed;
  }
}
