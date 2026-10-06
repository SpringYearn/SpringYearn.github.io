"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Eraser, Hand, Leaf, Pencil, Plus, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { HeaderControls } from "../header-controls";
import { SiteStatus } from "../site-status";
import { useSiteLanguage } from "../site-language";
import { boardFetch, getSession, nearStroke, readStored, writeStored, type BoardData, type Point, type Session, type Stroke } from "./board-client";

type Mutation = {type:"draw";stroke:Stroke} | {type:"erase";id:string};
const colors = ["#4d6b6f", "#272c2c", "#8f9c81", "#b89987", "#9791b1", "#bd8890"];
export default function WhiteboardPage() {
  const {language,setLanguage} = useSiteLanguage(), zh=language==="zh";
  const [scrolled,setScrolled]=useState(false), [tool,setTool]=useState<"pen"|"eraser"|"hand">("pen"), [color,setColor]=useState(colors[0]), [width,setWidth]=useState(3), [zoom,setZoom]=useState(false);
  const [board,setBoard]=useState(1), [boards,setBoards]=useState([1]), [requested,setRequested]=useState(false), [requesting,setRequesting]=useState(false);
  const [status,setStatus]=useState<"loading"|"ready"|"saving"|"offline">("loading"), [message,setMessage]=useState(""), [loaded,setLoaded]=useState(false);
  const canvas=useRef<HTMLCanvasElement>(null), session=useRef<Session|null>(null), strokes=useRef<Stroke[]>([]), current=useRef<Stroke|null>(null), queue=useRef<Mutation[]>([]), pointer=useRef<number|null>(null), busy=useRef(false), boardId=useRef(1), etag=useRef(""), alive=useRef(false);
  const chinese=useRef(zh), syncing=useRef(false), mutationSerial=useRef(0);
  useEffect(()=>{chinese.current=zh;},[zh]);
  const redraw=useCallback(()=>{
    const ctx=canvas.current?.getContext("2d");if(!ctx)return;
    ctx.clearRect(0,0,1600,1000);
    const erased=new Set(queue.current.filter(m=>m.type==="erase").map(m=>(m as {id:string}).id));
    const pending=queue.current.filter(m=>m.type==="draw").map(m=>(m as {stroke:Stroke}).stroke);
    const all=[...strokes.current,...pending,...(current.current?[current.current]:[])],seen=new Set<string>();
    for(const s of all){if(erased.has(s.id)||seen.has(s.id))continue;seen.add(s.id);ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.width;ctx.lineCap="round";ctx.lineJoin="round";
      if(s.points.length===1){ctx.beginPath();ctx.arc(s.points[0][0]*1600,s.points[0][1]*1000,s.width/2,0,Math.PI*2);ctx.fill();continue;}
      ctx.beginPath();s.points.forEach((p,i)=>i?ctx.lineTo(p[0]*1600,p[1]*1000):ctx.moveTo(p[0]*1600,p[1]*1000));ctx.stroke();
    }
  },[]);
  const stash=useCallback(()=>writeStored(`springyearn:board-pending:${boardId.current}`,JSON.stringify(queue.current)),[]);
  const sync=useCallback(async()=>{
    if(!alive.current||syncing.current)return;
    const id=boardId.current, serial=mutationSerial.current;syncing.current=true;
    try{
      session.current=await getSession();
      const r=await boardFetch(`/board?id=${id}`,{headers:etag.current?{"If-None-Match":etag.current}:{}});
      if(!alive.current||id!==boardId.current||serial!==mutationSerial.current)return;
      if(r.status!==304){const data:BoardData=await r.json();etag.current=(r.headers.get("ETag")??"").replace(/^W\//,"");strokes.current=data.strokes;setBoards(data.boards.map(b=>b.id));setRequested(data.requested);redraw();}
      setLoaded(true);setStatus(queue.current.length?"saving":"ready");setMessage("");
    }catch{if(alive.current){setStatus("offline");setMessage(chinese.current?"暫時無法連線。未送出的筆跡會保留並重試。":"Connection interrupted. Unsent marks are kept for retry.");}}
    finally{syncing.current=false;}
  },[redraw]);
  const flush=useCallback(async()=>{
    if(busy.current||!session.current||!alive.current||!queue.current.length)return;
    busy.current=true;
    const id=boardId.current;
    try{
      while(queue.current.length&&alive.current&&boardId.current===id){
        const m=queue.current[0];setStatus("saving");
        const r=await boardFetch(`/board?id=${id}`,{method:m.type==="draw"?"POST":"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.current.token}`},body:JSON.stringify(m.type==="draw"?m.stroke:{id:m.id})});
        if(boardId.current!==id)break;
        if(m.type==="draw"){const result=await r.json();strokes.current=[...strokes.current.filter(s=>s.id!==m.stroke.id),result.stroke];}else strokes.current=strokes.current.filter(s=>s.id!==m.id);
        mutationSerial.current++;queue.current.shift();stash();etag.current="";redraw();
      }
      if(alive.current){setStatus("ready");setMessage("");}
    }catch{if(alive.current){setStatus("offline");setMessage(chinese.current?"尚未保存成功，請稍後重試。你的筆跡仍保留在此瀏覽器。":"Not saved yet. Your marks are kept in this browser; retry shortly.");}}
    finally{busy.current=false;}
  },[redraw,stash]);
  useEffect(()=>{
    const root=document.documentElement;root.classList.add("motion-ready");
    const scroll=()=>setScrolled(window.scrollY>20);scroll();window.addEventListener("scroll",scroll,{passive:true});return()=>{window.removeEventListener("scroll",scroll);root.classList.remove("motion-ready");};
  },[]);
  useEffect(()=>{
    alive.current=true;boardId.current=board;etag.current="";strokes.current=[];current.current=null;pointer.current=null;
    try{const saved=JSON.parse(readStored(`springyearn:board-pending:${board}`)??"[]");queue.current=Array.isArray(saved)?saved:[];}catch{queue.current=[];}
    redraw();
    const refresh=async()=>{await sync();await flush();};void refresh();
    const interval=setInterval(()=>{if(!document.hidden)void refresh();},3000),wake=()=>{if(!document.hidden)void refresh();};
    window.addEventListener("online",wake);document.addEventListener("visibilitychange",wake);
    const beforeLeave=(e:BeforeUnloadEvent)=>{if(queue.current.length){e.preventDefault();e.returnValue="";}};window.addEventListener("beforeunload",beforeLeave);
    return()=>{alive.current=false;clearInterval(interval);window.removeEventListener("online",wake);document.removeEventListener("visibilitychange",wake);window.removeEventListener("beforeunload",beforeLeave);};
  },[board,redraw,sync,flush]);
  const point=(e:ReactPointerEvent<HTMLCanvasElement>):Point=>{const b=e.currentTarget.getBoundingClientRect();return[Math.max(0,Math.min(1,(e.clientX-b.left)/b.width)),Math.max(0,Math.min(1,(e.clientY-b.top)/b.height))];};
  const submitCurrent=()=>{if(!current.current)return;queue.current.push({type:"draw",stroke:current.current});current.current=null;stash();redraw();void flush();};
  const erase=(p:Point)=>{
    const erased=new Set(queue.current.filter(m=>m.type==="erase").map(m=>(m as {id:string}).id));
    const pending=queue.current.filter(m=>m.type==="draw").map(m=>(m as {stroke:Stroke}).stroke);
    const hit=[...strokes.current,...pending].reverse().find(s=>s.owner===session.current?.owner&&!erased.has(s.id)&&nearStroke(s,p));
    if(hit){queue.current.push({type:"erase",id:hit.id});stash();redraw();void flush();}
  };
  const start=(e:ReactPointerEvent<HTMLCanvasElement>)=>{
    if(tool==="hand"||!loaded||!session.current||!e.isPrimary||e.button!==0||pointer.current!==null)return;
    e.preventDefault();pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);
    if(tool==="eraser")erase(point(e));else{current.current={id:crypto.randomUUID(),owner:session.current.owner,color,width,points:[point(e)]};redraw();}
  };
  const move=(e:ReactPointerEvent<HTMLCanvasElement>)=>{
    if(pointer.current!==e.pointerId)return;
    const p=point(e);if(tool==="eraser"){erase(p);return;}const s=current.current;if(!s)return;
    const last=s.points.at(-1)!;if(Math.hypot((p[0]-last[0])*1600,(p[1]-last[1])*1000)<2)return;
    if(s.points.length>=256){submitCurrent();current.current={id:crypto.randomUUID(),owner:session.current!.owner,color:s.color,width:s.width,points:[last,p]};}else s.points.push(p);
    redraw();
  };
  const end=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(pointer.current!==e.pointerId)return;pointer.current=null;submitCurrent();if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
  const requestBoard=async()=>{if(!session.current||requested||requesting)return;setRequesting(true);try{await boardFetch("/request",{method:"POST",headers:{Authorization:`Bearer ${session.current.token}`}});setRequested(true);setMessage(zh?"申請已保存，SpringYearn 會收到新增白板通知。":"Request saved. SpringYearn will be notified to add a board.");}catch{setMessage(zh?"申請尚未送出，請稍後重試。":"Request not sent. Please retry shortly.");}finally{setRequesting(false);}};
  const statusText=status==="loading"?(zh?"連線中":"Connecting"):status==="saving"?(zh?"儲存中":"Saving"):status==="offline"?(zh?"等待重新連線":"Waiting for connection"):(zh?"已同步・共用白板":"Synced · shared board");
  return <main id="top" className="site-shell whiteboard-page">
    <header className={`site-header${scrolled?" is-scrolled":""}`}><Link className="wordmark" href="/" aria-label="SpringYearn home"><span className="wordmark-symbol"><img src="/logo.png" alt=""/></span><span className="wordmark-text">SPRING YEARN</span><span className="wordmark-reg">®</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation"><Link href="/">{zh?"首頁":"Home"}</Link><Link href="/work">{zh?"作品集":"Work"}</Link><Link href="/lab">LAB</Link><Link href="/project-files">{zh?"專案檔":"Project files"}</Link><Link href="/#profile">{zh?"關於我":"Profile"}</Link><Link href="/#contact">{zh?"聯絡":"Contact"}</Link><Link className="whiteboard-nav-link" href="/whiteboard" aria-current="page">{zh?"塗鴉板":"Whiteboard"}</Link></nav><HeaderControls language={language} onToggleLanguage={()=>setLanguage(v=>v==="en"?"zh":"en")}/>
    </header>
    <section className="section-block board-intro"><div><p className="mono-label">OPEN CANVAS / A SHARED LITTLE EXTRA</p><h1>{zh?"留下一點筆跡。":"Leave a little mark."}</h1><p>{zh?"這張白板屬於每個路過的人。隨手畫點什麼，讓下一位訪客也能看見。":"A whiteboard for everyone passing through. Draw something for the next visitor to find."}</p></div><Leaf className="board-intro-leaf" aria-hidden="true"/></section>
    <section className="section-block board-workspace" aria-label={zh?"共用塗鴉白板":"Shared doodle whiteboard"}>
      <div className="board-toolbar"><div className="board-tool-group" aria-label={zh?"繪畫工具":"Drawing tools"}>
        <button type="button" onClick={()=>setTool("pen")} aria-pressed={tool==="pen"}><Pencil aria-hidden="true"/>{zh?"畫筆":"Pen"}</button><button type="button" onClick={()=>setTool("eraser")} aria-pressed={tool==="eraser"}><Eraser aria-hidden="true"/>{zh?"橡皮擦":"Eraser"}</button><button type="button" onClick={()=>setTool("hand")} aria-pressed={tool==="hand"}><Hand aria-hidden="true"/>{zh?"移動畫布":"Pan"}</button>
      </div><div className="board-colors" aria-label={zh?"畫筆顏色":"Pen colors"}>{colors.map(c=><button key={c} type="button" style={{background:c}} onClick={()=>{setColor(c);setTool("pen");}} aria-label={`${zh?"顏色":"Color"} ${c}`} aria-pressed={color===c}/>)}</div><label className="board-custom-color">{zh?"自選色":"Custom"}<input type="color" value={color} onChange={e=>{setColor(e.target.value);setTool("pen");}}/></label><label className="board-width">{zh?"筆寬":"Width"}<input type="range" min="1" max="6" step="1" value={width} onChange={e=>setWidth(Number(e.target.value))}/><span className="mono-label">{width} px</span></label><button className="board-zoom" type="button" onClick={()=>setZoom(v=>!v)} aria-pressed={zoom}>{zoom?<ZoomOut aria-hidden="true"/>:<ZoomIn aria-hidden="true"/>}{zoom?(zh?"全覽":"Fit"):(zh?"放大":"Zoom")}</button></div>
      <div className="board-frame"><span className="board-corner board-corner-tl" aria-hidden="true"/><span className="board-corner board-corner-tr" aria-hidden="true"/><span className="board-corner board-corner-bl" aria-hidden="true"/><span className="board-corner board-corner-br" aria-hidden="true"/><div className="board-frame-top mono-label"><span>SY / OPEN CANVAS</span><span>NO. {String(board).padStart(2,"0")}</span></div>
        <div className="board-viewport"><div className={`board-sheet${zoom?" is-zoomed":""}`}><canvas ref={canvas} width="1600" height="1000" data-tool={tool} aria-label={zh?"使用滑鼠或觸控在共用白板繪畫":"Draw on the shared whiteboard with a mouse or touch"} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>{zh?"你的瀏覽器不支援畫布。":"Your browser does not support canvas."}</canvas>{!loaded&&<div className="board-loading" role="status">{status==="offline"?(zh?"暫時無法載入共用白板。":"Unable to load the shared board."):(zh?"正在取回大家的筆跡⋯":"Fetching everyone’s marks…")}</div>}</div></div>
        <div className="board-frame-bottom"><span className="board-sync mono-label" data-status={status} role="status"><i aria-hidden="true"/>{statusText}</span>{boards.length>1&&<label className="board-switch">{zh?"白板":"Board"}<select value={board} disabled={status!=="ready"} onChange={e=>{setLoaded(false);setStatus("loading");setBoard(Number(e.target.value));}}>{boards.map(id=><option key={id} value={id}>{String(id).padStart(2,"0")}</option>)}</select></label>}<span className="mono-label">1600 × 1000</span></div>
      </div>
      <div className="board-footnote"><p>{tool==="eraser"?(zh?"橡皮擦會移除你自己的一筆線條，其他人的筆跡會保留。":"The eraser removes one of your strokes and leaves other visitors’ marks intact."):tool==="hand"?(zh?"放大後，可以滑動或使用捲軸移動畫布。":"After zooming, swipe or use the scrollbars to explore the canvas."):(zh?"筆寬上限 6 px。請留點空間給下一個人。":"Up to 6 px. Leave a little room for the next person.")}</p>{status==="offline"&&<button type="button" className="text-link" onClick={()=>{void sync().then(flush);}}><RefreshCw aria-hidden="true"/>{zh?"重試連線":"Retry connection"}</button>}</div>
      <p className="board-message" role="status">{message}</p>
      <div className="board-request"><div><p className="mono-label">ROOM FOR ANOTHER?</p><p>{zh?"所有白板都畫滿了嗎？告訴我，我會再加一張。":"All the boards full? Let me know and I’ll make a little more room."}</p></div><button type="button" className="item-details-cta" disabled={!loaded||requested||requesting} onClick={()=>void requestBoard()}><Plus aria-hidden="true"/>{requested?(zh?"已申請新增白板":"Another board requested"):requesting?(zh?"送出中⋯":"Sending…"):(zh?"通知我新增白板":"Request another board")}</button></div>
    </section>
    <section className="section-block board-return"><Link className="text-link" href="/"><ArrowLeft aria-hidden="true"/>{zh?"返回首頁":"Return home"}</Link><Link className="text-link" href="/#contact">{zh?"聯絡":"Contact"}<ArrowUpRight aria-hidden="true"/></Link></section><SiteStatus language={language}/>
  </main>;
}
