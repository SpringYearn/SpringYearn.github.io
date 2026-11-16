"use client";

import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {useSiteLanguage} from '../site-language';
import type {SwarmController} from './controller';
import type {BuilderSnapshot} from './types';
import {DESKTOP_QUERY, ENTRANCE_ATTRIBUTE, REDUCED_MOTION_QUERY, SWARM_SEEN_KEY} from './availability';
import {SwarmAudio} from './audio';
import {scheduleEntranceScore} from './entrance-audio';
import {SiteEntrance} from './site-entrance';
import {ENTRANCE_TRAVEL_MS} from './timing';
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
    if (html.getAttribute(ENTRANCE_ATTRIBUTE) !== 'boot') return;

    const desktop = matchMedia(DESKTOP_QUERY);
    const reducedMotion = matchMedia(REDUCED_MOTION_QUERY);
    const root = document.querySelector<HTMLElement>('main.site-shell');
    const surface = host.current;
    if (!root || !surface || !desktop.matches || reducedMotion.matches) {
      html.removeAttribute(ENTRANCE_ATTRIBUTE);
      return;
    }

    let phase: 'boot' | 'waiting' | 'launching' | 'handoff' | 'closed' = 'boot';
    const originalInert = root.inert;
    const audio = new SwarmAudio();
    let launchTimer = 0, handoffTimer = 0, loadDeadline = 0;
    // Preload on eligible desktops. The engine itself starts after the click.
    const engine = import('./controller').catch(() => null);
    const frame = requestAnimationFrame(() => {
      if (html.getAttribute(ENTRANCE_ATTRIBUTE) !== 'boot') return;
      root.inert = true;
      phase = 'waiting';
      html.setAttribute(ENTRANCE_ATTRIBUTE, phase);
      setEntranceReady(true);
    });

    const rememberEntry = () => {
      try { sessionStorage.setItem(SWARM_SEEN_KEY, '1'); } catch { /* This page can still open. */ }
    };
    const dismiss = () => {
      if (phase === 'closed') return;
      phase = 'closed';
      window.clearTimeout(launchTimer);
      window.clearTimeout(handoffTimer);
      window.clearTimeout(loadDeadline);
      if (!controller.current) audio.dispose();
      root.inert = originalInert;
      html.removeAttribute(ENTRANCE_ATTRIBUTE);
      setEntranceReady(false);
    };
    const handoff = (module: Awaited<typeof engine>) => {
      if (phase !== 'launching') return;
      window.clearTimeout(loadDeadline);
      if (module) {
        try {
          controller.current = new module.SwarmController(root, surface, setState, 1, audio);
        } catch {
          surface.replaceChildren();
          html.classList.remove('swarm-building');
          setState(initial);
        }
      }
      phase = 'handoff';
      html.setAttribute(ENTRANCE_ATTRIBUTE, phase);
      handoffTimer = window.setTimeout(dismiss, handoffDuration);
    };
    enter.current = () => {
      if (phase !== 'waiting') return;
      rememberEntry();
      phase = 'launching';
      html.setAttribute(ENTRANCE_ATTRIBUTE, phase);
      setEntranceReady(false);
      audio.startEntrance(context => scheduleEntranceScore(context, context.destination, ENTRANCE_TRAVEL_MS / 1000));
      launchTimer = window.setTimeout(() => { void engine.then(handoff); }, ENTRANCE_TRAVEL_MS);
      loadDeadline = window.setTimeout(() => handoff(null), ENTRANCE_TRAVEL_MS + 1400);
    };

    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || phase === 'closed' || phase === 'boot') return;
      rememberEntry();
      controller.current?.finish('done');
      dismiss();
    };
    const preferenceChanged = () => {
      if (desktop.matches && !reducedMotion.matches) return;
      controller.current?.finish(reducedMotion.matches ? 'reduced' : 'ready');
      dismiss();
    };
    window.addEventListener('keydown', escape);
    desktop.addEventListener('change', preferenceChanged);
    reducedMotion.addEventListener('change', preferenceChanged);

    return () => {
      cancelAnimationFrame(frame);
      if (phase !== 'boot') dismiss();
      enter.current = null;
      controller.current?.finish('ready');
      controller.current = null;
      audio.dispose();
      window.removeEventListener('keydown', escape);
      desktop.removeEventListener('change', preferenceChanged);
      reducedMotion.removeEventListener('change', preferenceChanged);
    };
  }, [pathname]);

  const active = ['opening', 'building', 'waiting', 'paused'].includes(state.phase);
  return <>
    <SiteEntrance button={entryButton} ready={entranceReady} onEnter={() => enter.current?.()} />
    <aside className="swarm-root" data-swarm-phase={state.phase} data-swarm-done={state.done} data-swarm-total={state.total} data-swarm-cursors={state.cursors} data-swarm-sound={String(state.sound)} data-no-ripple data-localize="off" aria-label="Swarm Website Builder">
      <div className="swarm-surface" ref={host} aria-hidden="true" />
      {active && <div className="swarm-panel"><button type="button" className="swarm-skip" onClick={() => controller.current?.finish('done')}>{skipCopy[locale]} ↗</button></div>}
    </aside>
  </>;
}
