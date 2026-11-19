"use client";

import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {useSiteLanguage} from '../site-language';
import type {SwarmController} from './controller';
import type {BuilderSnapshot} from './types';
import {BUILD_AWAITING_ATTRIBUTE, DESKTOP_QUERY, ENTRANCE_ATTRIBUTE, REDUCED_MOTION_QUERY, SWARM_SEEN_KEY} from './availability';
import {SwarmAudio} from './audio';
import {scheduleEntranceScore} from './entrance-audio';
import {SiteEntrance} from './site-entrance';
import {ENTRANCE_TRAVEL_MS, scrollTempo} from './timing';
import './swarm.css';

const skipCopy={en:'Skip',zh:'略過',ja:'スキップ',ko:'건너뛰기',ru:'Пропустить',vi:'Bỏ qua'};
const initial:BuilderSnapshot={phase:'ready',done:0,total:0,cursors:0,speed:1,sound:true};
const handoffDuration = 280;

export function SwarmWebsiteBuilder() {
  const { locale } = useSiteLanguage();
  const pathname = usePathname();
  const host = useRef<HTMLDivElement>(null);
  const entryButton = useRef<HTMLButtonElement>(null);
  const controller = useRef<SwarmController | null>(null);
  const enter = useRef<(() => void) | null>(null);
  const [entranceReady, setEntranceReady] = useState(false);
  const [state, setState] = useState(initial);

  useEffect(() => {
    if (entranceReady) entryButton.current?.focus({ preventScroll: true });
  }, [entranceReady]);

  useEffect(() => {
    const html = document.documentElement;
    const desktop = matchMedia(DESKTOP_QUERY);
    const reducedMotion = matchMedia(REDUCED_MOTION_QUERY);
    const root = document.querySelector<HTMLElement>('main.home-page');
    const surface = host.current;
    if (!root || pathname !== '/' || !surface || location.hash || !desktop.matches || reducedMotion.matches) {
      html.removeAttribute(ENTRANCE_ATTRIBUTE);
      return;
    }

    const opening = html.getAttribute(ENTRANCE_ATTRIBUTE) === 'boot';
    let phase: 'boot' | 'waiting' | 'launching' | 'handoff' | 'closed' = opening ? 'boot' : 'closed';
    const originalInert = root.inert;
    let audio = new SwarmAudio();
    let launchTimer = 0, handoffTimer = 0, cancelled = false, started = false;
    const entryTop = scrollY;
    let previousTop = entryTop;
    root.setAttribute(BUILD_AWAITING_ATTRIBUTE, '');
    const releaseAwaiting = () => root.removeAttribute(BUILD_AWAITING_ATTRIBUTE);
    const report = (snapshot: BuilderSnapshot) => {
      releaseAwaiting();
      setState(snapshot);
    };
    const engine = import('./controller').catch(() => {
      if (!cancelled) releaseAwaiting();
      return null;
    });
    const frame = opening ? requestAnimationFrame(() => {
      if (html.getAttribute(ENTRANCE_ATTRIBUTE) !== 'boot') { phase = 'closed'; return; }
      root.inert = true;
      phase = 'waiting';
      html.setAttribute(ENTRANCE_ATTRIBUTE, phase);
      setEntranceReady(true);
    }) : 0;

    const rememberEntry = () => {
      try { sessionStorage.setItem(SWARM_SEEN_KEY, '1'); } catch { /* This page can still open. */ }
    };
    const dismiss = () => {
      phase = 'closed';
      window.clearTimeout(launchTimer);
      window.clearTimeout(handoffTimer);
      root.inert = originalInert;
      html.removeAttribute(ENTRANCE_ATTRIBUTE);
      setEntranceReady(false);
    };
    const beginBuildOnScroll = () => {
      const top = scrollY;
      const down = top > previousTop;
      previousTop = top;
      if (cancelled || started || phase !== 'closed' || !down || top <= entryTop ||
          scrollTempo(entryTop, top, innerHeight) === 1) return;
      started = true;
      const entryFold = entryTop + innerHeight;
      void engine.then(module => {
        if (cancelled || !root.isConnected) return;
        if (!module || location.hash || !desktop.matches || reducedMotion.matches) {
          releaseAwaiting();
          return;
        }
        try {
          controller.current = new module.SwarmController(root, surface, report, entryFold, audio);
        } catch {
          surface.replaceChildren();
          html.classList.remove('swarm-building');
          report(initial);
        }
      });
    };
    enter.current = () => {
      if (phase !== 'waiting') return;
      rememberEntry();
      phase = 'launching';
      html.setAttribute(ENTRANCE_ATTRIBUTE, phase);
      setEntranceReady(false);
      audio.startEntrance(context => scheduleEntranceScore(context, context.destination, ENTRANCE_TRAVEL_MS / 1000));
      launchTimer = window.setTimeout(() => {
        if (phase !== 'launching') return;
        phase = 'handoff';
        html.setAttribute(ENTRANCE_ATTRIBUTE, phase);
        handoffTimer = window.setTimeout(dismiss, handoffDuration);
      }, ENTRANCE_TRAVEL_MS);
    };

    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || phase === 'closed' || phase === 'boot') return;
      rememberEntry();
      audio.dispose();
      audio = new SwarmAudio();
      dismiss();
    };
    const cancelBuild = () => {
      cancelled = true;
      releaseAwaiting();
      controller.current?.finish('done');
      if (phase !== 'closed') dismiss();
    };
    const preferenceChanged = () => {
      if (desktop.matches && !reducedMotion.matches) return;
      cancelBuild();
      audio.dispose();
    };
    window.addEventListener('scroll', beginBuildOnScroll, { passive: true });
    window.addEventListener('hashchange', cancelBuild);
    window.addEventListener('keydown', escape);
    desktop.addEventListener('change', preferenceChanged);
    reducedMotion.addEventListener('change', preferenceChanged);

    return () => {
      cancelAnimationFrame(frame);
      cancelled = true;
      releaseAwaiting();
      if (phase !== 'closed') dismiss();
      enter.current = null;
      controller.current?.finish('ready');
      controller.current = null;
      audio.dispose();
      window.removeEventListener('scroll', beginBuildOnScroll);
      window.removeEventListener('hashchange', cancelBuild);
      window.removeEventListener('keydown', escape);
      desktop.removeEventListener('change', preferenceChanged);
      reducedMotion.removeEventListener('change', preferenceChanged);
    };
  }, [pathname]);

  const active = ['building', 'waiting', 'paused'].includes(state.phase);
  return <>
    <SiteEntrance button={entryButton} ready={entranceReady} onEnter={() => enter.current?.()} />
    <aside className="swarm-root" data-swarm-phase={state.phase} data-swarm-done={state.done} data-swarm-total={state.total} data-swarm-cursors={state.cursors} data-swarm-sound={String(state.sound)} data-no-ripple data-localize="off" aria-label="Swarm Website Builder">
      <div className="swarm-surface" ref={host} aria-hidden="true" />
      {active && <div className="swarm-panel"><button type="button" className="swarm-skip" onClick={() => controller.current?.finish('done')}>{skipCopy[locale]} ↗</button></div>}
    </aside>
  </>;
}
