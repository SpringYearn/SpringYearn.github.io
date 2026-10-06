"use client";
import { Localized } from "../localized";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Eraser, Leaf, Pencil, Plus, RefreshCw, RotateCcw, ZoomOut } from "lucide-react";
import { HeaderControls } from "../header-controls";
import { SiteStatus } from "../site-status";
import { useSiteLanguage } from "../site-language";
import { boardFetch, getSession, readStored, writeStored, type BoardData, type Point, type Session, type Stroke } from "./board-client";
import { applyErase, eraseInk } from "./erase-geometry";

type Mutation = {type:"draw";stroke:Stroke} | {type:"erase";id:string;points:Point[];radius:number;group?:string} | {type:"undo";id:string;target:string} | {type:"delete";id:string;operationId:string};
const colors = ["#4d6b6f", "#272c2c", "#8f9c81", "#b89987", "#9791b1", "#bd8890"];
export default function WhiteboardPage() {
  const {language,setLanguage} = useSiteLanguage(), zh=language==="zh";
  const [scrolled,setScrolled]=useState(false), [tool,setTool]=useState<"pen"|"eraser">("pen"), [color,setColor]=useState(colors[0]), [width,setWidth]=useState(3), [eraserWidth,setEraserWidth]=useState(32), [scale,setScale]=useState(1);
  const [board,setBoard]=useState(1), [boards,setBoards]=useState([1]), [requested,setRequested]=useState(false), [requesting,setRequesting]=useState(false), [emailReady,setEmailReady]=useState(false);
  const [status,setStatus]=useState<"loading"|"ready"|"saving"|"offline">("loading"), [message,setMessage]=useState(""), [loaded,setLoaded]=useState(false), [undoId,setUndoId]=useState<string|null>(null), [interacting,setInteracting]=useState(false);
  const canvas=useRef<HTMLCanvasElement>(null), viewport=useRef<HTMLDivElement>(null), artCursor=useRef<HTMLDivElement>(null);
  const session=useRef<Session|null>(null), strokes=useRef<Stroke[]>([]), current=useRef<Stroke|null>(null), queue=useRef<Mutation[]>([]), pointer=useRef<number|null>(null), busy=useRef(false), boardId=useRef(1), etag=useRef(""), alive=useRef(false);
  const gesture=useRef("");
  const epoch=useRef(0), scaleRef=useRef(1), zoomFrame=useRef(0);
  const touches=useRef(new Map<number,{x:number;y:number}>()), touchNavigation=useRef(false);
  const pinch=useRef<{distance:number;scale:number;anchorX:number;anchorY:number}|null>(null);
  const lastMouse=useRef({x:0,y:0});
  const currentErase=useRef<{id:string;points:Point[];radius:number;group:string}|null>(null), pan=useRef<{x:number;y:number;left:number;top:number}|null>(null);
  const chinese=useRef(zh), syncing=useRef(false), mutationSerial=useRef(0);
  useEffect(()=>{chinese.current=zh;},[zh]);
  const effective=useCallback(()=>{
    let ink=[...strokes.current];
    for(const m of queue.current){
      if(m.type==="draw")ink=[...ink.filter(s=>s.id!==m.stroke.id),m.stroke];
      else if(m.type==="erase"&&session.current)ink=applyErase(ink,m.points,m.radius,m.id,session.current.owner);
      else if(m.type==="delete")ink=ink.filter(s=>s.id!==m.id);
    }
    return ink.sort((a,b)=>(a.created??0)-(b.created??0)||(a.id<b.id?-1:a.id>b.id?1:0));
  },[]);
  const redraw=useCallback(()=>{
    const ctx=canvas.current?.getContext("2d");if(!ctx)return;
    ctx.clearRect(0,0,1600,1000);
    let ink=effective();const eraser=currentErase.current;
    if(eraser&&session.current)ink=applyErase(ink,eraser.points,eraser.radius,eraser.id,session.current.owner);
    if(current.current)ink.push(current.current);
    ink.sort((a,b)=>(a.created??0)-(b.created??0)||a.id.localeCompare(b.id));
    for(const s of ink){ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.width;ctx.lineCap="round";ctx.lineJoin="round";
      if(s.points.length===1){ctx.beginPath();ctx.arc(s.points[0][0]*1600,s.points[0][1]*1000,s.width/2,0,Math.PI*2);ctx.fill();continue;}
      ctx.beginPath();s.points.forEach((p,i)=>i?ctx.lineTo(p[0]*1600,p[1]*1000):ctx.moveTo(p[0]*1600,p[1]*1000));ctx.stroke();
    }
  },[effective]);
  const stash=useCallback(()=>{writeStored(`springyearn:board-pending:${boardId.current}`,JSON.stringify(queue.current));writeStored(`springyearn:board-epoch:${boardId.current}`,String(epoch.current));},[]);
  const sync=useCallback(async()=>{
    if(!alive.current||syncing.current)return;
    const id=boardId.current, serial=mutationSerial.current;syncing.current=true;
    try{
      session.current=await getSession();
      const r=await boardFetch(`/board?id=${id}`,{headers:{...(etag.current?{"If-None-Match":etag.current}:{}),Authorization:`Bearer ${session.current.token}`}});
      if(!alive.current||id!==boardId.current||serial!==mutationSerial.current)return;
      if(r.status!==304){const data:BoardData=await r.json();etag.current=(r.headers.get("ETag")??"").replace(/^W\//,"");if(epoch.current!==data.board.epoch){queue.current=[];current.current=null;currentErase.current=null;epoch.current=data.board.epoch;stash();}strokes.current=data.strokes;setBoards(data.boards.map(b=>b.id));setRequested(data.requested);setEmailReady(data.emailReady);setUndoId(data.undoId??null);redraw();}
      setLoaded(true);setStatus(queue.current.length?"saving":"ready");setMessage("");
    }catch{if(alive.current){setStatus("offline");setMessage(chinese.current?"暫時無法連線。未送出的筆跡會保留並重試。":"Connection interrupted. Unsent marks are kept for retry.");}}
    finally{syncing.current=false;}
  },[redraw,stash]);
  const flush=useCallback(async()=>{
    if(busy.current||!session.current||!alive.current||!queue.current.length)return;
    busy.current=true;const id=boardId.current;
    try{
      while(queue.current.length&&alive.current&&boardId.current===id){
        const m=queue.current[0];setStatus("saving");
        const editing=m.type==="erase"||m.type==="undo";
        const value=m.type==="draw"?m.stroke:m.type==="erase"?{action:"erase",id:m.id,points:m.points,radius:m.radius,group:m.group}:m.type==="undo"?{action:"undo",id:m.id,target:m.target}:{id:m.id,operationId:m.operationId};
        let r:Response;
        try{r=await boardFetch(`/${editing?"edit":"board"}?id=${id}`,{method:m.type==="delete"?"DELETE":"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.current.token}`},body:JSON.stringify({...value,epoch:epoch.current})});}
        catch(error){if((error as Error&{code?:string}).code==="board_reset"){queue.current=[];current.current=null;currentErase.current=null;stash();etag.current="";await sync();break;}if(m.type==="undo"&&(error as Error&{status?:number}).status===409){queue.current.shift();stash();etag.current="";await sync();setMessage(chinese.current?"白板已更新，請再按一次復原。":"The board changed. Please try Undo again.");continue;}throw error;}
        if(boardId.current!==id)break;
        const result=await r.json(), removed=new Set<string>(result.removed??[]), added:Stroke[]=result.added??(result.stroke?[result.stroke]:[]);
        const replaced=new Set(added.map(s=>s.id));strokes.current=[...strokes.current.filter(s=>!removed.has(s.id)&&!replaced.has(s.id)),...added];
        setUndoId(result.undoId??null);mutationSerial.current++;queue.current.shift();stash();etag.current="";redraw();
      }
      if(alive.current){setStatus("ready");}
    }catch{if(alive.current){setStatus("offline");setMessage(chinese.current?"尚未保存成功，請稍後重試。你的筆跡仍保留在此瀏覽器。":"Not saved yet. Your marks are kept in this browser; retry shortly.");}}
    finally{busy.current=false;}
  },[redraw,stash,sync]);
  useEffect(()=>{
    const root=document.documentElement;root.classList.add("motion-ready");
    const fine=window.matchMedia("(pointer: fine)").matches,cursor=artCursor.current;
    const move=(e:PointerEvent)=>{if(!fine||e.pointerType==="touch"||!cursor)return;cursor.style.setProperty("--cursor-x",`${e.clientX}px`);cursor.style.setProperty("--cursor-y",`${e.clientY}px`);cursor.classList.add("is-visible");};
    const target=(e:PointerEvent)=>{if(cursor&&e.target instanceof Element)cursor.classList.toggle("is-active",!!e.target.closest("a,button,input,select,summary"));};
    const press=()=>cursor?.classList.add("is-pressed"),release=()=>cursor?.classList.remove("is-pressed"),hide=(e:PointerEvent)=>{if(!e.relatedTarget)cursor?.classList.remove("is-visible");};
    if(fine){root.classList.add("has-art-cursor");window.addEventListener("pointermove",move,{passive:true});window.addEventListener("pointerover",target,{passive:true});window.addEventListener("pointerdown",press,{passive:true});window.addEventListener("pointerup",release,{passive:true});window.addEventListener("pointercancel",release,{passive:true});window.addEventListener("pointerout",hide,{passive:true});}
    const scroll=()=>setScrolled(window.scrollY>20);scroll();window.addEventListener("scroll",scroll,{passive:true});
    return()=>{window.removeEventListener("scroll",scroll);root.classList.remove("motion-ready","has-art-cursor");window.removeEventListener("pointermove",move);window.removeEventListener("pointerover",target);window.removeEventListener("pointerdown",press);window.removeEventListener("pointerup",release);window.removeEventListener("pointercancel",release);window.removeEventListener("pointerout",hide);};
  },[]);
  useEffect(()=>{
    alive.current=true;boardId.current=board;epoch.current=Number(readStored(`springyearn:board-epoch:${board}`)??0);etag.current="";strokes.current=[];current.current=null;currentErase.current=null;pan.current=null;pointer.current=null;
    try{const saved=JSON.parse(readStored(`springyearn:board-pending:${board}`)??"[]");queue.current=Array.isArray(saved)?saved.map(m=>m.type==="erase"&&!Array.isArray(m.points)?{type:"delete",id:m.id,operationId:`legacy-${m.id}`} :m):[];}catch{queue.current=[];}
    redraw();const refresh=async()=>{await sync();await flush();};void refresh();
    const interval=setInterval(()=>{if(!document.hidden)void refresh();},3000),wake=()=>{if(!document.hidden)void refresh();};
    window.addEventListener("online",wake);document.addEventListener("visibilitychange",wake);
    const beforeLeave=(e:BeforeUnloadEvent)=>{if(queue.current.length){e.preventDefault();e.returnValue="";}};window.addEventListener("beforeunload",beforeLeave);
    return()=>{alive.current=false;clearInterval(interval);window.removeEventListener("online",wake);document.removeEventListener("visibilitychange",wake);window.removeEventListener("beforeunload",beforeLeave);};
  },[board,redraw,sync,flush]);
  const undo=useCallback(()=>{if(!undoId||status!=="ready"||pointer.current!==null||queue.current.length)return;queue.current.push({type:"undo",id:crypto.randomUUID(),target:undoId});stash();void flush();},[undoId,status,stash,flush]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"&&!e.shiftKey&&!(e.target instanceof Element&&e.target.closest("input,textarea,[contenteditable]"))){e.preventDefault();undo();}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);},[undo]);
  const point=(e:ReactPointerEvent<HTMLCanvasElement>):Point=>{const b=e.currentTarget.getBoundingClientRect();return[Math.max(0,Math.min(1,(e.clientX-b.left)/b.width)),Math.max(0,Math.min(1,(e.clientY-b.top)/b.height))];};
  const submitCurrent=()=>{
    if(current.current){queue.current.push({type:"draw",stroke:current.current});current.current=null;}
    const erase=currentErase.current;if(erase&&session.current&&eraseInk(effective(),erase.points,erase.radius,erase.id,session.current.owner).removed.length)queue.current.push({type:"erase",...erase});currentErase.current=null;
    stash();redraw();void flush();
  };
  const zoomAt=useCallback((next:number,x:number,y:number,anchor?:{x:number;y:number})=>{
    const v=viewport.current,sheet=canvas.current;if(!v||!sheet)return;
    const rect=sheet.getBoundingClientRect(),view=v.getBoundingClientRect();
    const ax=anchor?.x??(x-rect.left)/rect.width,ay=anchor?.y??(y-rect.top)/rect.height;
    const value=Math.max(1,Math.min(6,next));scaleRef.current=value;setScale(value);
    cancelAnimationFrame(zoomFrame.current);zoomFrame.current=requestAnimationFrame(()=>{
      const currentRect=sheet.getBoundingClientRect();
      v.scrollLeft=ax*currentRect.width-(x-view.left);v.scrollTop=ay*currentRect.height-(y-view.top);
      if(pan.current)pan.current={...lastMouse.current,left:v.scrollLeft,top:v.scrollTop};
    });
  },[]);
  useEffect(()=>{
    const v=viewport.current;if(!v)return;
    const wheel=(e:WheelEvent)=>{if(!pan.current)return;e.preventDefault();zoomAt(scaleRef.current*Math.exp(-e.deltaY*.002),e.clientX,e.clientY);};
    v.addEventListener("wheel",wheel,{passive:false});
    return()=>{v.removeEventListener("wheel",wheel);cancelAnimationFrame(zoomFrame.current);};
  },[zoomAt]);
  const start=(e:ReactPointerEvent<HTMLCanvasElement>)=>{
    if(e.pointerType==="touch"){
      e.preventDefault();touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});e.currentTarget.setPointerCapture(e.pointerId);
      if(touches.current.size>=2){
        touchNavigation.current=true;current.current=null;currentErase.current=null;pointer.current=null;redraw();setInteracting(true);
        const [a,b]=[...touches.current.values()],rect=e.currentTarget.getBoundingClientRect();
        pinch.current={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),scale:scaleRef.current,anchorX:((a.x+b.x)/2-rect.left)/rect.width,anchorY:((a.y+b.y)/2-rect.top)/rect.height};return;
      }
      if(touchNavigation.current)return;
    }else if(e.button===1){
      e.preventDefault();const v=viewport.current;if(!v)return;pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);lastMouse.current={x:e.clientX,y:e.clientY};pan.current={...lastMouse.current,left:v.scrollLeft,top:v.scrollTop};setInteracting(true);return;
    }
    if(e.button!==0||pointer.current!==null||!loaded||!session.current)return;
    e.preventDefault();gesture.current=crypto.randomUUID();pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);setInteracting(true);
    if(tool==="eraser")currentErase.current={id:crypto.randomUUID(),points:[point(e)],radius:eraserWidth/2,group:gesture.current};
    else current.current={id:crypto.randomUUID(),owner:session.current.owner,color,width,points:[point(e)],created:Date.now(),group:gesture.current};
    redraw();
  };
  const move=(e:ReactPointerEvent<HTMLCanvasElement>)=>{
    if(e.pointerType==="touch"&&touches.current.has(e.pointerId)){
      touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(touchNavigation.current){
        if(touches.current.size>=2&&pinch.current){const [a,b]=[...touches.current.values()],p=pinch.current;zoomAt(p.scale*Math.hypot(a.x-b.x,a.y-b.y)/p.distance,(a.x+b.x)/2,(a.y+b.y)/2,{x:p.anchorX,y:p.anchorY});}return;
      }
    }
    if(pointer.current!==e.pointerId)return;
    if(pan.current){lastMouse.current={x:e.clientX,y:e.clientY};const v=viewport.current;if(v){v.scrollLeft=pan.current.left-(e.clientX-pan.current.x);v.scrollTop=pan.current.top-(e.clientY-pan.current.y);}return;}
    const p=point(e),erase=currentErase.current,s=current.current,last=(erase?.points??s?.points)?.at(-1);if(!last||Math.hypot((p[0]-last[0])*1600,(p[1]-last[1])*1000)<2)return;
    if(erase){if(erase.points.length>=256){const radius=erase.radius;submitCurrent();currentErase.current={id:crypto.randomUUID(),points:[last,p],radius,group:gesture.current};}else erase.points.push(p);}
    else if(s){if(s.points.length>=256){submitCurrent();current.current={id:crypto.randomUUID(),owner:session.current!.owner,color:s.color,width:s.width,points:[last,p],created:Date.now(),group:s.group};}else s.points.push(p);}
    redraw();
  };
  const end=(e:ReactPointerEvent<HTMLCanvasElement>)=>{
    if(e.pointerType==="touch"){touches.current.delete(e.pointerId);if(touchNavigation.current){if(!touches.current.size){touchNavigation.current=false;pinch.current=null;setInteracting(false);}if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);return;}}
    if(pointer.current!==e.pointerId)return;pointer.current=null;setInteracting(false);if(pan.current)pan.current=null;else if(e.type==="pointercancel"){current.current=null;currentErase.current=null;redraw();}else submitCurrent();if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const fit=()=>{scaleRef.current=1;setScale(1);requestAnimationFrame(()=>viewport.current?.scrollTo(0,0));};
  const requestBoard=async()=>{if(!session.current||requested||requesting)return;setRequesting(true);try{const response=await boardFetch("/request",{method:"POST",headers:{Authorization:`Bearer ${session.current.token}`}});const result=await response.json();if(!result.mailSent)throw new Error("Email not sent");setRequested(true);setMessage(zh?"已寄信給 SpringYearn，請耐心等候新增白板。":"Email sent to SpringYearn. A new board is on the wish list.");}catch{setMessage(zh?"申請尚未送出，請稍後重試。":"Request not sent. Please retry shortly.");}finally{setRequesting(false);}};

  const statusText=status==="loading"?(zh?"連線中":"Connecting"):status==="saving"?(zh?"儲存中":"Saving"):status==="offline"?(zh?"等待重新連線":"Waiting for connection"):(zh?"已同步・共用白板":"Synced · shared board");
  return <Localized>{<main id="top" className="site-shell whiteboard-page">
    <header className={`site-header${scrolled?" is-scrolled":""}`}><Link className="wordmark" href="/" aria-label="SpringYearn home"><span className="wordmark-symbol"><img src="/logo.png" alt=""/></span><span className="wordmark-text">SPRING YEARN</span><span className="wordmark-reg">®</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation"><Link href="/">{zh?"首頁":"Home"}</Link><Link href="/work">{zh?"作品集":"Work"}</Link><Link href="/lab">LAB</Link><Link href="/project-files">{zh?"專案檔":"Project files"}</Link><Link href="/#profile">{zh?"關於我":"Profile"}</Link><Link href="/#contact">{zh?"聯絡":"Contact"}</Link></nav><HeaderControls language={language} onToggleLanguage={()=>setLanguage(v=>v==="en"?"zh":"en")}/>
    </header>
    <section className="section-block board-intro"><div><p className="mono-label">OPEN CANVAS / A SHARED LITTLE EXTRA</p><h1>{zh?"有空嗎？畫點什麼吧。":"Got a minute? Doodle something."}</h1><p>{zh?"這是大家共用的白板。畫個塗鴉、小圖，或隨手留一條線，給下一位訪客看看。":"This board is shared with everyone who visits. Leave a doodle, a little sketch, or just a line for the next person to find."}</p></div><Leaf className="board-intro-leaf" aria-hidden="true"/></section>
    <section className="section-block board-workspace" aria-label={zh?"共用塗鴉白板":"Shared doodle whiteboard"}>
      <div className="board-toolbar"><div className="board-tool-group" aria-label={zh?"繪畫工具":"Drawing tools"}>
        <button type="button" onClick={()=>setTool("pen")} aria-pressed={tool==="pen"}><Pencil aria-hidden="true"/>{zh?"畫筆":"Pen"}</button><button type="button" onClick={()=>setTool("eraser")} aria-pressed={tool==="eraser"}><Eraser aria-hidden="true"/>{zh?"橡皮擦":"Eraser"}</button><button type="button" onClick={undo} disabled={!undoId||status!=="ready"||interacting} aria-label={zh?"返回上一步":"Undo last action"} title={zh?"復原上一步（Ctrl+Z / ⌘Z）":"Undo (Ctrl+Z / ⌘Z)"}><RotateCcw aria-hidden="true"/>{zh?"復原":"Undo"}</button>
      </div><div className="board-colors" aria-label={zh?"畫筆顏色":"Pen colors"}>{colors.map(c=><button key={c} type="button" style={{background:c}} disabled={tool==="eraser"} onClick={()=>setColor(c)} aria-label={`${zh?"顏色":"Color"} ${c}`} aria-pressed={color===c}/>)}</div><label className="board-custom-color">{zh?"自選色":"Custom"}<input type="color" value={color} disabled={tool==="eraser"} onChange={e=>setColor(e.target.value)}/></label><label className="board-width">{tool==="eraser"?(zh?"擦除範圍":"Eraser size"):(zh?"筆寬":"Width")}<input type="range" min="1" max={tool==="eraser"?48:6} step="1" value={tool==="eraser"?eraserWidth:width} onChange={e=>(tool==="eraser"?setEraserWidth:setWidth)(Number(e.target.value))}/><span className="mono-label">{tool==="eraser"?eraserWidth:width} px</span></label><button className="board-zoom" type="button" onClick={fit}><ZoomOut aria-hidden="true"/>{zh?"全覽":"Fit view"}</button></div>
      <div className="board-frame"><span className="board-corner board-corner-tl" aria-hidden="true"/><span className="board-corner board-corner-tr" aria-hidden="true"/><span className="board-corner board-corner-bl" aria-hidden="true"/><span className="board-corner board-corner-br" aria-hidden="true"/><div className="board-frame-top mono-label"><span>SY / OPEN CANVAS</span><span>NO. {String(board).padStart(2,"0")}</span></div>
        <div className="board-viewport" ref={viewport}><div className="board-sheet" style={{width:`${scale*100}%`}}><canvas ref={canvas} width="1600" height="1000" data-tool={tool} aria-label={zh?"使用滑鼠或觸控在共用白板繪畫":"Draw on the shared whiteboard with a mouse or touch"} onAuxClick={e=>{if(e.button===1)e.preventDefault();}} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>{zh?"你的瀏覽器不支援畫布。":"Your browser does not support canvas."}</canvas>{!loaded&&<div className="board-loading" role="status">{status==="offline"?(zh?"暫時無法載入共用白板。":"Unable to load the shared board."):(zh?"正在載入大家的塗鴉⋯":"Loading everyone’s doodles…")}</div>}</div></div>
        <div className="board-frame-bottom"><span className="board-sync mono-label" data-status={status} role="status"><i aria-hidden="true"/>{statusText}</span>{boards.length>1&&<label className="board-switch">{zh?"白板":"Board"}<select value={board} disabled={status!=="ready"} onChange={e=>{setLoaded(false);setStatus("loading");setBoard(Number(e.target.value));}}>{boards.map(id=><option key={id} value={id}>{String(id).padStart(2,"0")}</option>)}</select></label>}<span className="mono-label">1600 × 1000</span></div>
      </div>
      <div className="board-footnote"><p>{tool==="eraser"?(zh?"橡皮擦只會擦掉你自己筆跡中滑過的部分，其他人的畫會保留。":"The eraser only removes your own marks where you pass over them. Other visitors’ drawings are kept."):(zh?"筆寬最多 6 px，也留點空間給下一位訪客。":"Pen width goes up to 6 px. Save a little space for the next visitor.")}</p>{status==="offline"&&<button type="button" className="text-link" onClick={()=>{void sync().then(flush);}}><RefreshCw aria-hidden="true"/>{zh?"重試連線":"Retry connection"}</button>}</div>
      <p className="board-instructions">{zh?"手機：雙指縮放與移動，單指繪畫。電腦：按住滑鼠中鍵拖曳；按住中鍵並滾動滾輪縮放。":"Touch: use two fingers to zoom and move, one to draw. Mouse: drag with the middle button; hold it and scroll the wheel to zoom."}</p>
      <p className="board-message" role="status">{message}</p>
      <div className="board-request"><div><p className="mono-label">ROOM FOR ANOTHER?</p><p>{zh?"白板都快畫滿了？告訴我，我會再加一張。":"Boards filling up? Let me know and I’ll add another."}</p></div><button type="button" className="item-details-cta" disabled={!loaded||!emailReady||requested||requesting} onClick={()=>void requestBoard()}><Plus aria-hidden="true"/>{requested?(zh?"已申請新增白板":"Another board requested"):requesting?(zh?"送出中⋯":"Sending…"):(zh?"通知我新增白板":"Request another board")}</button></div>{loaded&&!emailReady&&<p className="board-email-note">{zh?"寄信功能設定中。急著加白板的話，先從聯絡頁告訴我。":"Email requests are being set up. Need a board sooner? Use the Contact page for now."}</p>}
    </section>
    <section className="section-block board-return"><Link className="text-link" href="/"><ArrowLeft aria-hidden="true"/>{zh?"返回首頁":"Return home"}</Link><Link className="text-link" href="/#contact">{zh?"聯絡":"Contact"}<ArrowUpRight aria-hidden="true"/></Link></section><SiteStatus language={language}/><div ref={artCursor} className="art-cursor" aria-hidden="true"><span className="cursor-ring"/><span className="cursor-core"/></div>
  </main>}</Localized>;
}
