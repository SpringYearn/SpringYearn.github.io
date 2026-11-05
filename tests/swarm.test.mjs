import assert from 'node:assert/strict';
import {test} from 'node:test';
import {CursorSwarmEngine} from '../app/swarm/engine.ts';
import {TaskScheduler} from '../app/swarm/scheduler.ts';
import {BUILD_RATE,buildStep} from '../app/swarm/timing.ts';
import {dimensionBadge,mediaProgress,toolBox} from '../app/swarm/choreography.ts';

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

test('only assigned workers move, keep inertia and bounded velocities, and are never retired',()=>{
  const engine=new CursorSwarmEngine(20,{x:400,y:300},()=>.5);
  engine.agents[0].x=390;engine.agents[1].x=392;engine.agents[0].busy=true;engine.agents[0].goal={x:700,y:300};
  const idle=structuredClone(engine.agents[1]);
  for(let frame=0;frame<240;frame++)engine.step(1/60,1000,800);
  assert.deepEqual(engine.agents[1],idle,'idle workers must not orbit or leave trails');
  for(const agent of engine.agents){
    assert.ok(Number.isFinite(agent.x)&&Number.isFinite(agent.vy));
    assert.ok(agent.x>=8&&agent.x<=992&&agent.y>=8&&agent.y<=792);
    assert.ok(Math.hypot(agent.vx,agent.vy)<=570*agent.pace+.001);
  }
  assert.ok(engine.agents[0].x>450,'assigned cursor should follow its destination');
  assert.ok(Math.hypot(engine.agents[0].x-engine.agents[1].x,engine.agents[0].y-engine.agents[1].y)>10);
  const assigned=engine.agents[0];engine.reduce(10);assert.equal(engine.agents.length,10);assert.ok(engine.agents.includes(assigned));
  assigned.working=false;assigned.goal={x:700,y:300};engine.activate(assigned,assigned.goal,1000,800);
  engine.step(1/60,1000,800);const before=assigned.vx;
  assigned.goal={x:650,y:300};engine.step(1/120,1000,800);assert.ok(Math.abs(assigned.vx-before)<120,'direction changes should retain inertia');
});

test('one task owns one cursor and the same worker moves continuously to its next task',()=>{
  const tasks=Array.from({length:8},(_,id)=>task(id,null,100)),scheduler=new TaskScheduler(tasks,3);
  const engine=new CursorSwarmEngine(20,{x:400,y:300});
  const jobs=scheduler.assign(engine.agents,0,800);
  assert.equal(jobs.length,3);assert.equal(new Set(jobs.map(job=>job.agent)).size,3);
  assert.deepEqual(scheduler.assign(engine.agents,0,800),[]);
  const job=jobs[0],owner=job.agent;engine.activate(owner,{x:200,y:200},1000,800);
  owner.working=true;engine.step(1/60,1000,800,BUILD_RATE);
  assert.equal(owner.x,200);assert.equal(owner.y,200,'the cursor tip must track its tool handle');
  scheduler.finish(job);assert.equal(owner.busy,false);assert.equal(owner.present,true);
  const idle=structuredClone(owner);engine.step(1/60,1000,800,BUILD_RATE);assert.deepEqual(owner,idle);
  assert.equal(engine.agents.filter(agent=>agent.busy).length,2);
  const next=scheduler.assign(engine.agents,0,800);
  assert.equal(next.length,1);assert.equal(next[0].agent,owner);assert.equal(next[0].continuing,true);
  engine.activate(owner,{x:700,y:600},1000,800,next[0].continuing);
  assert.equal(owner.x,200);assert.equal(owner.y,200,'continuing workers must not respawn at the next element');
});

test('the default build timeline is half V.077 and remains stable at maximum user speed',()=>{
  assert.equal(BUILD_RATE,2.5);
  for(const speed of [.5,1,1.5,2,3])assert.equal(buildStep(.02,speed),.02*speed*5/2);
  const engine=new CursorSwarmEngine(3,{x:100,y:100});
  for(const agent of engine.agents){agent.busy=true;engine.activate(agent,{x:400,y:300},1000,800);}
  for(let frame=0;frame<120;frame++)engine.step(.05,1000,800,15);
  for(const agent of engine.agents){assert.ok(Number.isFinite(agent.x));assert.ok(Math.hypot(agent.vx,agent.vy)<=570*agent.pace+.001);}
});

test('a cursor completes batches of three to five tasks, with no idle flock or stranded cooldown',()=>{
  const tasks=Array.from({length:12},(_,id)=>task(id,null,100)),scheduler=new TaskScheduler(tasks,1);
  const engine=new CursorSwarmEngine(1,{x:100,y:100}),agent=engine.agents[0],quotas=[];
  let now=0;
  for(let index=0;index<tasks.length;index++){
    const [job]=scheduler.assign(engine.agents,0,800,1000,0,now);
    assert.ok(job);assert.ok(agent.quota>=3&&agent.quota<=5);
    if(agent.completed===0)quotas.push(agent.quota);
    scheduler.finish(job,now);
    if(agent.completed===agent.quota){
      assert.equal(agent.present,false);assert.equal(scheduler.assign(engine.agents,0,800,1000,0,now).length,0);
    }else assert.equal(agent.present,true);
    now+=1;
  }
  assert.deepEqual(quotas,[3,4,5]);assert.equal(scheduler.complete,true);
  scheduler.retireIdle(engine.agents,now,false);assert.equal(agent.present,false);
});

test('cancelled and scrolled-past work does not consume the cursor batch',()=>{
  const scheduler=new TaskScheduler([task(0,null,100),task(1,null,2000)],1),agents=new CursorSwarmEngine(1,{x:100,y:100}).agents;
  scheduler.assign(agents,0,800);scheduler.passed(1200);
  assert.equal(agents[0].completed,0);assert.equal(agents[0].present,false);
  scheduler.assign(agents,1600,800);scheduler.suspend(scheduler.jobs[0]);
  assert.equal(agents[0].completed,0);assert.equal(agents[0].present,false);
});

test('copy geometry travels from its actual source to its target and the scan waits for positioning',()=>{
  const rect={x:500,y:400,width:240,height:180},source={x:30,y:80,width:200,height:140};
  const job={task:{rect,operation:'duplicate'},source,progress:.12};
  assert.deepEqual(toolBox(job),source);
  assert.deepEqual(toolBox({...job,progress:.55}),rect);
  assert.equal(mediaProgress(.55),0);assert.equal(mediaProgress(1),1);
  assert.ok(Math.abs(mediaProgress(.775)-.5)<1e-9);
  for(const width of [320,390,1440])for(const box of [rect,{x:-200,y:-100,width:500,height:80},{x:2000,y:1800,width:100,height:80}]){
    const badge=dimensionBadge(box,width,844,220);
    assert.ok(badge.x>=8&&badge.x+badge.width<=width-8);
    assert.ok(badge.y>=12&&badge.y+badge.height<844-90);
  }
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
