import assert from 'node:assert/strict';
import {test} from 'node:test';
import {CursorSwarmEngine} from '../app/swarm/engine.ts';
import {TaskScheduler} from '../app/swarm/scheduler.ts';

const task=(id,parent,y=0)=>({id,parent,rect:{x:0,y,width:120,height:80},state:'pending',depth:parent===null?0:1,order:id});

test('visible descendants wait for their parent; concurrency and scrolling do not strand workers',()=>{
  const tasks=[task(0,null),task(1,0),task(2,null,3000)],scheduler=new TaskScheduler(tasks,2);
  const agents=new CursorSwarmEngine(20,{x:100,y:100}).agents;
  assert.deepEqual(scheduler.assign(agents,0,800).map(job=>job.task.id),[0]);
  scheduler.finish(scheduler.jobs[0]);
  assert.deepEqual(scheduler.assign(agents,0,800).map(job=>job.task.id),[1]);
  scheduler.suspend(scheduler.jobs[0]);assert.equal(agents.filter(agent=>agent.busy).length,0);
  assert.deepEqual(scheduler.passed(2400).map(task=>task.id),[1]);
  assert.deepEqual(scheduler.assign(agents,2600,800).map(job=>job.task.id),[2]);
  scheduler.finish(scheduler.jobs[0]);assert.equal(scheduler.complete,true);
});

test('boids separate, keep inertia and bounded velocities, and never retire an assigned worker',()=>{
  const engine=new CursorSwarmEngine(20,{x:400,y:300},()=>.5);
  engine.agents[0].x=390;engine.agents[1].x=392;engine.agents[0].busy=true;engine.agents[0].goal={x:700,y:300};
  for(let frame=0;frame<240;frame++)engine.step(1/60,1000,800,{x:400,y:300});
  for(const agent of engine.agents){
    assert.ok(Number.isFinite(agent.x)&&Number.isFinite(agent.vy));
    assert.ok(agent.x>=8&&agent.x<=992&&agent.y>=8&&agent.y<=792);
    assert.ok(Math.hypot(agent.vx,agent.vy)<=570*agent.pace+.001);
  }
  assert.ok(engine.agents[0].x>450,'assigned cursor should follow its destination');
  assert.ok(Math.hypot(engine.agents[0].x-engine.agents[1].x,engine.agents[0].y-engine.agents[1].y)>10);
  const assigned=engine.agents[0];engine.reduce(10);assert.equal(engine.agents.length,10);assert.ok(engine.agents.includes(assigned));
  const before=assigned.vx;assigned.goal={x:100,y:100};engine.step(1/60,1000,800,{x:400,y:300});assert.ok(Math.abs(assigned.vx-before)<120,'direction changes should retain inertia');
});

test('navigation and its children build before a visible paragraph',()=>{
  const tasks=[{...task(0,null),priority:0},{...task(1,0),priority:0},{...task(2,null,400),priority:2}];
  const scheduler=new TaskScheduler(tasks,7),agents=new CursorSwarmEngine(20,{x:200,y:200}).agents;
  assert.deepEqual(scheduler.assign(agents,0,900).map(job=>job.task.id),[0]);
  assert.deepEqual(scheduler.assign(agents,0,900),[]);
  scheduler.finish(scheduler.jobs[0]);assert.deepEqual(scheduler.assign(agents,0,900).map(job=>job.task.id),[1]);
  scheduler.finish(scheduler.jobs[0]);assert.deepEqual(scheduler.assign(agents,0,900).map(job=>job.task.id),[2]);
});

test('a cursor is not assigned text clipped out of a horizontal viewport',()=>{
  const clipped={...task(0,null,200),rect:{x:400,y:200,width:100,height:80},clip:{x:0,y:0,width:300,height:800}};
  const visible=task(1,null,200),scheduler=new TaskScheduler([clipped,visible],7),agents=new CursorSwarmEngine(20,{x:200,y:200}).agents;
  assert.deepEqual(scheduler.assign(agents,0,800,1000).map(job=>job.task.id),[1]);
});
