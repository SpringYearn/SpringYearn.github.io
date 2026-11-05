import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.SWARM_PLAYWRIGHT_PATH?pathToFileURL(process.env.SWARM_PLAYWRIGHT_PATH).href:'playwright');
const origin=process.argv[2]??'http://127.0.0.1:4173',output=process.env.SWARM_REPORT_DIR??path.resolve('.swarm-checks');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.SWARM_CHROME_PATH?{executablePath:process.env.SWARM_CHROME_PATH}:{})});
const results=[];
const pagesOnly=process.argv.includes('--pages-only');
const active=['opening','building','waiting','paused'];
async function context(options={}){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference',...options});
  await context.addInitScript(()=>{
    localStorage.setItem('springyearn:language','en');
    window.__swarmPaint=null;window.__swarmFrames=[];window.__swarmTools={};window.__swarmTempos=[];
    const clear=CanvasRenderingContext2D.prototype.clearRect,translate=CanvasRenderingContext2D.prototype.translate;
    CanvasRenderingContext2D.prototype.clearRect=function(...args){
      if(this.canvas.classList.contains('swarm-canvas')){
        if(window.__swarmPaint){window.__swarmFrames.push(window.__swarmPaint);if(window.__swarmFrames.length>1200)window.__swarmFrames.shift();}
        window.__swarmPaint={tempo:Number(this.canvas.dataset.swarmTempo),points:[],tasks:(this.canvas.dataset.swarmTasks||'').split(',').filter(Boolean),handoffs:(this.canvas.dataset.swarmHandoffs||'').split(',').filter(Boolean),batches:(this.canvas.dataset.swarmBatches||'').split(',').filter(Boolean)};
        if(window.__swarmPaint.tasks.length&&!window.__swarmTempos.includes(window.__swarmPaint.tempo))window.__swarmTempos.push(window.__swarmPaint.tempo);
      }
      return clear.apply(this,args);
    };
    CanvasRenderingContext2D.prototype.translate=function(x,y){
      if(this.canvas.classList.contains('swarm-canvas'))window.__swarmPaint?.points.push({x,y});
      return translate.call(this,x,y);
    };
    for(const method of ['stroke','strokeRect','fillText']){
      const native=CanvasRenderingContext2D.prototype[method];
      CanvasRenderingContext2D.prototype[method]=function(...args){
        if(this.canvas.classList.contains('swarm-canvas')){
          const tools=window.__swarmTools;
          if(this.strokeStyle==='#3577ad'&&this.lineWidth>=1.6)tools.blueSelection=true;
          if(this.strokeStyle==='#b34c4e'&&this.globalAlpha>=.55)tools.redGuides=true;
          if(method==='strokeRect'&&args[2]===7&&args[3]===7)tools.largeHandles=true;
          if(method==='fillText'&&String(args[0]).includes(' × ')&&this.font==='12px monospace')tools.dimensions=true;
          if(method==='fillText'&&String(args[0]).includes('COPY'))tools.copy=true;
        }
        return native.apply(this,args);
      };
    }
    window.__swarmAudio=[];
    const Native=window.AudioContext;
    window.AudioContext=class extends Native {
      constructor(...args){super(...args);this.probeGains=[];this.probeOscillators=0;window.__swarmAudio.push(this);}
      createGain(){const gain=super.createGain();this.probeGains.push(gain);return gain;}
      createOscillator(){this.probeOscillators++;return super.createOscillator();}
    };
  });
  // A whiteboard view check must never change the public board or send email.
  await context.route('https://springyearn-whiteboard.springyearn.chatgpt.site/api/**',async route=>{
    if(new URL(route.request().url()).pathname.endsWith('/session'))return route.fulfill({json:{token:'a'.repeat(64),owner:'00000000-0000-4000-8000-000000000076'}});
    if(route.request().method()!=='GET')throw new Error('Verification attempted a public write');
    return route.fulfill({json:{board:{id:1,revision:1,epoch:1},boards:[{id:1,revision:1,epoch:1}],requested:false,emailReady:true,strokes:[],undoId:null}});
  });
  await context.route('https://busuanzi.9420.ltd/api',route=>route.fulfill({json:{success:true,data:{site_uv:1}}}));
  return context;
}
async function clean(page){
  await page.waitForFunction(()=>!document.documentElement.classList.contains('swarm-building')&&!document.querySelector('[data-swarm-pending],[data-swarm-reveal],.swarm-type-ghost,.swarm-canvas,.swarm-opening'));
}
async function signature(page){return page.locator('main.site-shell').evaluate(root=>({
  links:[...root.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),
  headings:[...root.querySelectorAll('h1,h2,h3')].map(h=>h.textContent),
  files:[...root.querySelectorAll('img,video')].map(media=>media.getAttribute('src')),
}));}
async function phase(page){return page.locator('.swarm-root').getAttribute('data-swarm-phase');}
async function skip(page){if(active.includes(await phase(page)))await page.getByRole('button',{name:'Skip ↗',exact:true}).click();await clean(page);}
async function shot(page,name){await page.screenshot({path:path.join(output,name+'.png')});}
try {
  if(!pagesOnly){
  const desktop=await context(),page=await desktop.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/',{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('.swarm-root')?.dataset.swarmPhase==='opening'&&+document.querySelector('.swarm-root').dataset.swarmTotal>0);
  assert.equal(+await page.locator('.swarm-root').getAttribute('data-swarm-cursors'),0,'no cursor should gather without a task');
  const before=await signature(page);
  await shot(page,'opening-desktop');
  await page.waitForFunction(()=>[...document.querySelectorAll('.swarm-type-ghost>span')].some(e=>getComputedStyle(e).visibility==='visible'));
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  assert.equal(await phase(page),'paused');
  const paused=await page.locator('.swarm-root').getAttribute('data-swarm-done');
  const visibleLetters=()=>page.locator('.swarm-type-ghost>span').evaluateAll(elements=>elements.filter(e=>getComputedStyle(e).visibility==='visible').length);
  const letters=await visibleLetters();await page.waitForTimeout(260);
  assert.equal(await page.locator('.swarm-root').getAttribute('data-swarm-done'),paused);assert.equal(await visibleLetters(),letters);
  const alignment=await page.evaluate(()=>{
    const glyphs=[...document.querySelectorAll('.swarm-type-ghost>span')].filter(e=>getComputedStyle(e).visibility==='visible'&&/^[a-z]$/i.test(e.textContent)).slice(0,16);
    const nodes=[],walker=document.createTreeWalker(document.querySelector('main.site-shell'),NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode()))if(node.parentElement&&!node.parentElement.closest('.sr-only,script,style,.site-status'))nodes.push(node);
    return glyphs.map(glyph=>{
      const box=glyph.getBoundingClientRect(),character=glyph.textContent.toLowerCase();let closest=Infinity;
      for(const node of nodes)for(let index=0;index<node.textContent.length;index++)if(node.textContent[index].toLowerCase()===character){
        const range=document.createRange();range.setStart(node,index);range.setEnd(node,index+1);const target=range.getBoundingClientRect();
        if(target.width)closest=Math.min(closest,Math.hypot(target.left-box.left,target.top-box.top));
      }
      return closest;
    });
  });
  assert.ok(alignment.length>0&&alignment.every(distance=>distance<2),'typed glyphs should match original DOM positions');
  await shot(page,'typing-paused');
  await page.getByRole('combobox',{name:'Speed',exact:true}).selectOption('3');
  await page.getByRole('button',{name:'Sound ○',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Sound ●',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Resume',exact:true}).click();
  await page.waitForFunction(()=>window.__swarmAudio.some(context=>context.state==='running'&&context.probeOscillators>3&&context.probeGains.some(gain=>Math.abs(gain.gain.value-.035)<.005)));
  let screen=0,previousDone=0;
  while(active.includes(await phase(page))&&screen<45){
    await page.waitForFunction(()=>![...document.querySelectorAll('[data-swarm-pending]')].some(element=>{
      const r=element.getBoundingClientRect(),clip=element.closest('.strip-viewport')?.getBoundingClientRect();
      return r.bottom>-40&&r.top<innerHeight+40&&r.right>0&&r.left<innerWidth&&(!clip||(r.right>clip.left&&r.left<clip.right));
    }),null,{timeout:25000});
    await page.waitForFunction(()=>['waiting','done','ready'].includes(document.querySelector('.swarm-root')?.dataset.swarmPhase),null,{timeout:25000});
    const status=await phase(page);assert.notEqual(status,'ready','build stopped before completion');
    if(status==='waiting'){
      assert.equal(await page.locator('.swarm-canvas').getAttribute('data-swarm-cursor-count'),'0','all completed task cursors must disappear');
      assert.equal(await page.evaluate(()=>window.__swarmPaint.points.length),0,'the actual canvas must paint no idle cursors');
    }
    const done=+await page.locator('.swarm-root').getAttribute('data-swarm-done');assert.ok(done>=previousDone);previousDone=done;
    if(status==='done')break;
    if(screen===0){assert.equal(await page.locator('.swarm-canvas').getAttribute('data-swarm-tempo'),'1','entry should retain its current pace');await shot(page,'first-screen-built');}
    await page.evaluate(()=>scrollBy({top:innerHeight*.65,behavior:'instant'}));
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    if(screen===0)await page.waitForFunction(()=>document.querySelector('.swarm-canvas')?.dataset.swarmTempo==='2');
    console.log('viewport',screen,'completed',done);
    if(screen===3)await shot(page,'building-lower-section');screen++;
  }
  assert.equal(await phase(page),'done');await clean(page);
  const counts=await page.locator('.swarm-root').evaluate(e=>({done:+e.dataset.swarmDone,total:+e.dataset.swarmTotal}));
  assert.ok(counts.total>50);assert.equal(counts.done,counts.total,'all DOM tasks should complete');assert.ok(screen>3,'lower sections must actually build');
  const frames=await page.evaluate(()=>window.__swarmFrames);
  const workingFrames=frames.filter(frame=>frame.tasks.length);
  assert.ok(workingFrames.length>10);
  assert.deepEqual((await page.evaluate(()=>window.__swarmTempos)).sort(),[1,2],'both entry and faster scroll construction should actually render');
  const batches=new Map();
  for(const frame of frames){
    assert.equal(frame.points.length,frame.tasks.length+frame.handoffs.length,'only task owners and brief batch handoffs may be painted');
    assert.ok(frame.points.length<=3,'no idle cluster or excessive concurrent work');
    assert.equal(new Set(frame.tasks.map(pair=>pair.split(':')[0])).size,frame.tasks.length,'a task cannot have two cursors');
    assert.equal(new Set(frame.tasks.map(pair=>pair.split(':')[1])).size,frame.tasks.length,'a cursor cannot own two tasks');
    for(const row of frame.batches){
      const [id,batch,completed,quota]=row.split(':').map(Number),key=id+':'+batch;
      assert.ok(quota>=3&&quota<=5);assert.ok(completed<quota);
      const record=batches.get(key)??{quota,tasks:new Set()};
      for(const pair of frame.tasks)if(Number(pair.split(':')[1])===id)record.tasks.add(pair.split(':')[0]);
      batches.set(key,record);
    }
  }
  assert.ok([...batches.values()].some(batch=>batch.tasks.size>=3),'a visible cursor must carry through at least three tasks');
  for(const batch of batches.values())assert.ok(batch.tasks.size<=batch.quota);
  const tools=await page.evaluate(()=>window.__swarmTools);
  for(const feature of ['blueSelection','redGuides','largeHandles','dimensions','copy'])assert.equal(tools[feature],true,feature+' must actually be painted');
  assert.deepEqual(await signature(page),before);
  await shot(page,'completed-desktop');
  await page.getByRole('button',{name:'Replay ↺',exact:true}).click();
  await page.waitForFunction(()=>document.documentElement.classList.contains('swarm-building'));
  await skip(page);assert.deepEqual(await signature(page),before);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.locator('.desktop-nav a[href="/work/"]').click();await page.waitForURL('**/work/');await clean(page);
  await page.getByRole('button',{name:'Replay ↺',exact:true}).click();await page.waitForFunction(()=>+document.querySelector('.swarm-root').dataset.swarmTotal>50);
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await skip(page);await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin+'/lab/',{waitUntil:'load'});await page.getByRole('button',{name:'Replay ↺',exact:true}).click();await page.waitForFunction(()=>+document.querySelector('.swarm-root').dataset.swarmTotal>30);
  await page.locator('.swarm-root').getByRole('button',{name:'Skip ↗',exact:true}).click();await clean(page);assert.equal(await page.locator('.lab-card').count(),10);
  const build=page.locator('#lab-10 .lab-download-button');await build.scrollIntoViewIfNeeded();await build.click();await page.locator('dialog[open]').waitFor({state:'visible'});await page.keyboard.press('Escape');
  assert.deepEqual(errors,[]);results.push({desktop:true,...counts,screens:screen,entryPacePreserved:true,scrollSpeedMultiplier:2,taskOwnedCursors:true,cursorBatches:true,noIdleCursors:true,tools,maxVisibleCursors:Math.max(...workingFrames.map(frame=>frame.points.length)),paused:true,glyphAlignment:Math.max(...alignment),replay:true,skip:true,audio:true,resize:true,routeCleanup:true,labDialog:true});await desktop.close();

  for(const width of [390,320]){
    const mobile=await context({viewport:{width,height:844},hasTouch:true,isMobile:true}),p=await mobile.newPage();
    await p.goto(origin+'/',{waitUntil:'load'});await p.waitForFunction(()=>+document.querySelector('.swarm-root')?.dataset.swarmTotal>0);
    assert.ok(+await p.locator('.swarm-root').getAttribute('data-swarm-cursors')<=2);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    await p.getByRole('combobox',{name:'Speed',exact:true}).selectOption('3');
    await p.evaluate(()=>scrollTo({top:innerHeight*2,behavior:'instant'}));
    await p.waitForFunction(()=>+document.querySelector('.swarm-root').dataset.swarmDone>5);
    await shot(p,'mobile-'+width);await skip(p);
    await p.locator('.mobile-menu-toggle').click();await p.locator('.mobile-nav-panel').waitFor({state:'visible'});await p.locator('.mobile-menu-close').click();
    await p.getByRole('button',{name:'Replay ↺',exact:true}).click();await p.waitForFunction(()=>document.documentElement.classList.contains('swarm-building'));
    await p.emulateMedia({reducedMotion:'reduce'});await clean(p);assert.equal(await phase(p),'reduced');
    results.push({width,scrollBuild:true,noOverflow:true,skip:true,mobileMenu:true,liveReducedMotion:true});await mobile.close();
  }
  const reduced=await context({reducedMotion:'reduce'}),p=await reduced.newPage();await p.goto(origin+'/',{waitUntil:'load'});
  await p.waitForFunction(()=>document.querySelector('.swarm-root')?.dataset.swarmPhase==='reduced');await clean(p);
  assert.equal(await p.getByRole('button',{name:'Replay ↺',exact:true}).isDisabled(),true);
  results.push({initialReducedMotion:true});await reduced.close();
  }
  const extras=await context(),extraPage=await extras.newPage();
  await extraPage.addInitScript(()=>sessionStorage.setItem('springyearn:swarm-seen','1'));
  await extraPage.goto(origin+'/project-files/',{waitUntil:'load'});
  await extraPage.getByRole('button',{name:'Replay ↺',exact:true}).click();
  await extraPage.waitForFunction(()=>+document.querySelector('.swarm-root').dataset.swarmTotal>30);await skip(extraPage);
  assert.equal(await extraPage.locator('.pf-card').count(),7);
  assert.equal(await extraPage.locator('video').count(),2);
  await extraPage.goto(origin+'/whiteboard/',{waitUntil:'load'});
  await extraPage.locator('.board-sync[data-status=ready]').waitFor({state:'visible'});
  await extraPage.getByRole('button',{name:'Replay ↺',exact:true}).click();
  await extraPage.waitForFunction(()=>+document.querySelector('.swarm-root').dataset.swarmTotal>0);
  assert.equal(await extraPage.locator('.board-viewport canvas').evaluate(canvas=>!!canvas.closest('[data-swarm-pending]')),false);
  await skip(extraPage);
  const zoom=extraPage.locator('.board-zoom-slider input'),previousZoom=Number(await zoom.inputValue());
  await extraPage.getByRole('button',{name:'Zoom in',exact:true}).click();
  assert.ok(Number(await zoom.inputValue())>previousZoom);
  results.push({projectFiles:true,publicFiles:7,videoPlayers:2,whiteboardCanvasPreserved:true,whiteboardZoom:true});await extras.close();
  await writeFile(path.join(output,'report.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
