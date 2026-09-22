"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import history from "../site-history.json";

const lastUpdated = process.env.NEXT_PUBLIC_SITE_UPDATED || history.initialLastUpdated;
const displayDate = lastUpdated.replaceAll("-", ".");

// One request per document, shared by both routes and React Strict Mode mounts.
// The global total is stored by Busuanzi, never invented in localStorage.
let visitorRequest: Promise<number> | undefined;
function getVisitors(): Promise<number> {
  if (visitorRequest) return visitorRequest;
  visitorRequest = new Promise((resolve, reject) => {
    const callback = `SpringYearnVisitors_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const callbacks = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");
    const cleanup = () => {
      window.clearTimeout(timeout);
      delete callbacks[callback];
      script.remove();
    };
    const fail = () => { cleanup(); reject(new Error("Visitor count unavailable")); };
    const timeout = window.setTimeout(fail, 10000);
    callbacks[callback] = (data: { site_uv?: unknown }) => {
      const count = data?.site_uv;
      cleanup();
      if (typeof count === "number" && Number.isSafeInteger(count) && count >= 0) resolve(count);
      else reject(new Error("Invalid visitor count"));
    };
    script.async = true;
    // Only the origin is needed for a site total; do not send paths or queries.
    script.referrerPolicy = "origin";
    script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callback}`;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return visitorRequest;
}

const copy = {
  en: {
    updated: "Last updated",
    visitors: "Total visitors",
    replay: "Replay date animation",
    replayVisitors: "Replay visitor count animation",
    pending: "Loading visitor count",
    unavailable: "Visitor count temporarily unavailable",
    note: "Estimated unique visitors since the counter was enabled. Different browsers or devices may count separately. Powered by Busuanzi.",
  },
  zh: {
    updated: "最後更新日期",
    visitors: "總瀏覽人數",
    replay: "重播日期動畫",
    replayVisitors: "重播瀏覽人數動畫",
    pending: "正在讀取瀏覽人數",
    unavailable: "瀏覽人數暫時無法讀取",
    note: "啟用後累計的訪客估計值；不同瀏覽器或裝置可能分別計算。統計由不蒜子提供。",
  },
};

function RollingDigits({ value, replay, className }: { value: string; replay: number; className: string }) {
  return (
    <span className={`${className}${replay ? " is-decoding" : ""}`} key={replay} aria-hidden="true">
      {Array.from(value, (digit, index) => /\d/.test(digit) ? (
        <span className="status-digit" key={index} style={{ "--digit-delay": `${index * 32}ms` } as CSSProperties}>
          <span className="status-digit-reel">
            {[7, 3, 1, 0].map((offset) => <span key={offset}>{(Number(digit) + offset) % 10}</span>)}
          </span>
        </span>
      ) : <span className="status-date-separator" key={index}>{digit}</span>)}
    </span>
  );
}

export function SiteStatus({ language }: { language: "en" | "zh" }) {
  const t = copy[language];
  const root = useRef<HTMLDivElement>(null);
  const lastReplay = useRef(-Infinity);
  const [replay, setReplay] = useState(0);
  const lastVisitorReplay = useRef(-Infinity);
  const [visitorReplay, setVisitorReplay] = useState(0);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [countState, setCountState] = useState<"loading" | "ready" | "unavailable">("loading");

  const animateDate = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const now = performance.now();
    if (now - lastReplay.current < 1100) return;
    lastReplay.current = now;
    setReplay((value) => value + 1);
  }, []);

  const animateVisitors = useCallback(() => {
    if (visitors === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const now = performance.now();
    if (now - lastVisitorReplay.current < 1100) return;
    lastVisitorReplay.current = now;
    setVisitorReplay((value) => value + 1);
  }, [visitors]);

  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { animateDate(); observer.disconnect(); }
    }, { threshold: 0.5 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [animateDate]);

  useEffect(() => {
    // Wait for a real count and visibility; scrolling before it loads is safe.
    const element = root.current;
    if (!element || visitors === null) return;
    if (!("IntersectionObserver" in window)) { animateVisitors(); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { animateVisitors(); observer.disconnect(); }
    }, { threshold: 0.5 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [visitors, animateVisitors]);

  useEffect(() => {
    // Local QA and the private backup must not contaminate the public total.
    if (window.location.hostname !== "springyearn.github.io") {
      setCountState("unavailable");
      return;
    }
    let active = true;
    getVisitors().then((count) => {
      if (active) { setVisitors(count); setCountState("ready"); }
    }).catch(() => { if (active) setCountState("unavailable"); });
    return () => { active = false; };
  }, []);

  const countText = visitors === null ? "—" : visitors.toLocaleString("en-US");
  const countLabel = countState === "ready" ? `${t.visitors}: ${countText}`
    : countState === "loading" ? t.pending : t.unavailable;

  return (
    <div className="site-status" ref={root}>
      <span className="status-register" aria-hidden="true">SY / LOG</span>
      <button
        type="button"
        className="status-updated"
        onPointerEnter={animateDate}
        onFocus={animateDate}
        onClick={animateDate}
        aria-label={`${t.updated}: ${lastUpdated}. ${t.replay}`}
        title={`${t.updated}: ${lastUpdated} · ${history.timeZone}`}
      >
        <span className="status-label">{t.updated}</span>
        <time dateTime={lastUpdated} aria-label={lastUpdated}>
          <RollingDigits value={displayDate} replay={replay} className="status-date" />
        </time>
      </button>
      <button
        type="button"
        className="status-visitors"
        onPointerEnter={animateVisitors}
        onFocus={animateVisitors}
        onClick={animateVisitors}
        aria-label={`${countLabel}. ${countState === "ready" ? `${t.replayVisitors}. ` : ""}${t.note}`}
      >
        <span className="status-label">{t.visitors}</span>
        <span className="status-count" aria-live="polite" aria-label={countLabel}>
          {visitors === null ? "—" : <RollingDigits value={countText} replay={visitorReplay} className="status-count-digits" />}
        </span>
        <span className="status-note" role="tooltip">{countState === "unavailable" ? `${t.unavailable}。` : ""}{t.note}</span>
      </button>
    </div>
  );
}
