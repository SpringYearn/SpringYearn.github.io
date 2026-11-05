"use client";

import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {useSiteLanguage} from '../site-language';
import {SwarmController} from './controller';
import type {BuilderSnapshot} from './types';
import './swarm.css';

const copy={
  en:{replay:'Replay',skip:'Skip',pause:'Pause',resume:'Resume',speed:'Speed',sound:'Sound',title:'Swarm',waiting:'Scroll to keep building',opening:'Gathering',building:'Building',paused:'Paused',reduced:'Reduced motion',progress:'Website build progress'},
  zh:{replay:'重播',skip:'略過',pause:'暫停',resume:'繼續',speed:'速度',sound:'音效',title:'Swarm',waiting:'往下捲動，繼續建造',opening:'集合中',building:'建造中',paused:'已暫停',reduced:'已減少動態效果',progress:'網站建造進度'},
  ja:{replay:'再生',skip:'スキップ',pause:'一時停止',resume:'再開',speed:'速度',sound:'音',title:'Swarm',waiting:'スクロールして続きを作る',opening:'集合中',building:'制作中',paused:'一時停止中',reduced:'動きを抑制中',progress:'サイトの制作進行状況'},
  ko:{replay:'다시 재생',skip:'건너뛰기',pause:'일시 정지',resume:'계속',speed:'속도',sound:'소리',title:'Swarm',waiting:'스크롤하면 계속 만들어요',opening:'모이는 중',building:'만드는 중',paused:'일시 정지',reduced:'동작 줄이기 적용',progress:'사이트 제작 진행률'},
  ru:{replay:'Повторить',skip:'Пропустить',pause:'Пауза',resume:'Продолжить',speed:'Скорость',sound:'Звук',title:'Swarm',waiting:'Прокрутите, чтобы продолжить',opening:'Сбор',building:'Сборка',paused:'Пауза',reduced:'Движение уменьшено',progress:'Ход сборки сайта'},
  vi:{replay:'Phát lại',skip:'Bỏ qua',pause:'Tạm dừng',resume:'Tiếp tục',speed:'Tốc độ',sound:'Âm thanh',title:'Swarm',waiting:'Cuộn xuống để xây tiếp',opening:'Đang tập hợp',building:'Đang xây dựng',paused:'Đã tạm dừng',reduced:'Đã giảm chuyển động',progress:'Tiến độ xây dựng trang'},
};
const initial:BuilderSnapshot={phase:'ready',done:0,total:0,cursors:0,speed:1,sound:false};
const seenKey='springyearn:swarm-seen';

export function SwarmWebsiteBuilder(){
  const {locale}=useSiteLanguage(),pathname=usePathname(),t=copy[locale];
  const host=useRef<HTMLDivElement>(null),controller=useRef<SwarmController|null>(null),speed=useRef(1),autoplayed=useRef(false);
  const [state,setState]=useState(initial);
  const start=()=>{
    controller.current?.finish('ready');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){setState({...initial,phase:'reduced'});return;}
    const root=document.querySelector<HTMLElement>('main.site-shell');if(!root||!host.current)return;
    try{controller.current=new SwarmController(root,host.current,setState,speed.current);}catch{document.documentElement.classList.remove('swarm-building');setState(initial);}
  };
  useEffect(()=>{
    let frame=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const pref=()=>{if(reduced.matches){controller.current?.finish('reduced');setState({...initial,phase:'reduced'});}else setState(initial);};
    if(!autoplayed.current){
      autoplayed.current=true;let seen=false;try{seen=sessionStorage.getItem(seenKey)==='1';sessionStorage.setItem(seenKey,'1');}catch{}
      if(reduced.matches)setState({...initial,phase:'reduced'});
      else if(!seen)frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(start);});
    }else setState(reduced.matches?{...initial,phase:'reduced'}:initial);
    reduced.addEventListener('change',pref);
    return()=>{cancelAnimationFrame(frame);controller.current?.finish('ready');controller.current=null;reduced.removeEventListener('change',pref);};
    // The controller reads the current live document; a route change always restores it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[pathname]);
  useEffect(()=>{controller.current?.finish('ready');},[locale]);
  const active=['opening','building','waiting','paused'].includes(state.phase),percent=state.total?Math.round(state.done/state.total*100):0;
  return <aside className="swarm-root" data-swarm-phase={state.phase} data-swarm-done={state.done} data-swarm-total={state.total} data-swarm-cursors={state.cursors} data-no-ripple data-localize="off" aria-label="Swarm Website Builder">
    <div className="swarm-surface" ref={host} aria-hidden="true" />
    <div className={'swarm-panel'+(active?' is-building':'')}>
      <span className="swarm-panel-brand" aria-hidden="true"><i />{t.title}</span>
      {active&&<>
        <span className="swarm-build-status" role="status">{state.phase==='paused'?t.paused:state.phase==='opening'?t.opening:state.phase==='waiting'?t.waiting:t.building}</span>
        <span className="swarm-progress" role="progressbar" aria-label={t.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>{percent}%</span>
        <button type="button" onClick={()=>controller.current?.togglePause()}>{state.phase==='paused'?t.resume:t.pause}</button>
        <label className="swarm-speed">{t.speed}<select aria-label={t.speed} value={state.speed} onChange={event=>{speed.current=Number(event.target.value);controller.current?.setSpeed(speed.current);}}>{[.5,1,1.5,2,3].map(value=><option value={value} key={value}>{value}×</option>)}</select></label>
        <button type="button" aria-pressed={state.sound} onClick={()=>controller.current?.setSound(!state.sound)}>{t.sound} {state.sound?'●':'○'}</button>
      </>}
      <button type="button" disabled={state.phase==='reduced'} title={state.phase==='reduced'?t.reduced:undefined} onClick={start}>{t.replay} ↺</button>
      {active&&<button type="button" className="swarm-skip" onClick={()=>controller.current?.finish('done')}>{t.skip} ↗</button>}
    </div>
  </aside>;
}
