"use client";

import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {useSiteLanguage} from '../site-language';
import type {SwarmController} from './controller';
import type {BuilderSnapshot} from './types';
import {DESKTOP_QUERY} from './availability';
import './swarm.css';

const skipCopy={en:'Skip',zh:'略過',ja:'スキップ',ko:'건너뛰기',ru:'Пропустить',vi:'Bỏ qua'};
const initial:BuilderSnapshot={phase:'ready',done:0,total:0,cursors:0,speed:1,sound:true};
const seenKey='springyearn:desktop-swarm-seen';

export function SwarmWebsiteBuilder(){
  const {locale}=useSiteLanguage(),pathname=usePathname();
  const host=useRef<HTMLDivElement>(null),controller=useRef<SwarmController|null>(null),autoplayed=useRef(false);
  const [allowed,setAllowed]=useState(false),[state,setState]=useState(initial);
  useEffect(()=>{
    const desktop=matchMedia(DESKTOP_QUERY),reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setAllowed(desktop.matches&&!reduced.matches);
    update();desktop.addEventListener('change',update);reduced.addEventListener('change',update);
    return()=>{desktop.removeEventListener('change',update);reduced.removeEventListener('change',update);};
  },[]);
  useEffect(()=>{
    let cancelled=false,frame=0;
    if(!allowed){setState(initial);return;}
    let seen=false;try{seen=sessionStorage.getItem(seenKey)==='1';}catch{}
    if(autoplayed.current||seen){setState(initial);return;}
    const start=async()=>{
      try{
        // Touch devices never load the engine or create its audio context.
        const {SwarmController}=await import('./controller');
        if(cancelled||!matchMedia(DESKTOP_QUERY).matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
        const root=document.querySelector<HTMLElement>('main.site-shell');
        if(!root||!host.current)return;
        autoplayed.current=true;try{sessionStorage.setItem(seenKey,'1');}catch{}
        controller.current=new SwarmController(root,host.current,setState);
      }catch{document.documentElement.classList.remove('swarm-building');setState(initial);}
    };
    frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{void start();});});
    return()=>{cancelled=true;cancelAnimationFrame(frame);controller.current?.finish('ready');controller.current=null;};
  },[allowed,pathname,locale]);
  const active=allowed&&['opening','building','waiting','paused'].includes(state.phase);
  return <aside className="swarm-root" hidden={!allowed} data-swarm-phase={state.phase} data-swarm-done={state.done} data-swarm-total={state.total} data-swarm-cursors={state.cursors} data-swarm-sound={String(state.sound)} data-no-ripple data-localize="off" aria-label="Swarm Website Builder">
    <div className="swarm-surface" ref={host} aria-hidden="true" />
    {active&&<div className="swarm-panel"><button type="button" className="swarm-skip" onClick={()=>controller.current?.finish('done')}>{skipCopy[locale]} ↗</button></div>}
  </aside>;
}
