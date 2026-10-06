"use client";
import { Localized } from "./localized";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import history from "../site-history.json";
import { groupReleasesByDate } from "./site-history";
import { getVisitors } from "./visitor-count";

const lastUpdated = process.env.NEXT_PUBLIC_SITE_UPDATED || history.initialLastUpdated;
const displayDate = lastUpdated.replaceAll("-", ".");
const VISITOR_BASELINE = 3280;
const [latestDay, ...pastDays] = groupReleasesByDate(history.releases);

const copy = {
  en: {
    updated: "Last updated",
    visitors: "Total visitors",
    replay: "Replay date animation",
    updateSummary: "Daily update",
    changelog: "SY / Changelog",
    changelogHint: "By date",
    allDailyUpdates: "All updates for this day",
    showUpdate: "View update summary",
    replayVisitors: "Replay visitor count animation",
    pending: "Loading visitor count",
    unavailable: "Visitor count temporarily unavailable",
    note: "Includes the historical baseline and estimated unique visitors counted since the statistics service changed on 2026-10-03. Different browsers or devices may count separately. Powered by Busuanzi / 9420.",
  },
  zh: {
    updated: "最後更新日期",
    visitors: "總瀏覽人數",
    replay: "重播日期動畫",
    updateSummary: "當日更新",
    changelog: "SY / 更新歷史",
    changelogHint: "依日期整合",
    allDailyUpdates: "查看當日全部更新",
    showUpdate: "查看更新內容",
    replayVisitors: "重播瀏覽人數動畫",
    pending: "正在讀取瀏覽人數",
    unavailable: "瀏覽人數暫時無法讀取",
    note: "包含歷史基準值與 2026-10-03 更換統計服務後累計的訪客估計值；不同瀏覽器或裝置可能分別計算。統計由不蒜子／9420 提供。",
  },
};

function RollingDigits({ value, replay, className }: { value: string; replay: number; className: string }) {
  return <Localized>{(
    <span className={`${className}${replay ? " is-decoding" : ""}`} key={replay} aria-hidden="true">
      {Array.from(value, (digit, index) => /\d/.test(digit) ? (
        <span className="status-digit" key={index} style={{ "--digit-delay": `${index * 32}ms` } as CSSProperties}>
          <span className="status-digit-reel">
            {[7, 3, 1, 0].map((offset) => <span key={offset}>{(Number(digit) + offset) % 10}</span>)}
          </span>
        </span>
      ) : <span className="status-date-separator" key={index}>{digit}</span>)}
    </span>
  )}</Localized>;
}

export function SiteStatus({ language }: { language: "en" | "zh" }) {
  const t = copy[language];
  const root = useRef<HTMLDivElement>(null);
  const summaryTitleId = useId();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const closeSummaryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastReplay = useRef(-Infinity);
  const [replay, setReplay] = useState(0);
  const lastVisitorReplay = useRef(-Infinity);
  const [visitorReplay, setVisitorReplay] = useState(0);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [countState, setCountState] = useState<"loading" | "ready" | "unavailable">("loading");

  const keepSummaryOpen = () => {
    if (closeSummaryTimer.current) clearTimeout(closeSummaryTimer.current);
    setSummaryOpen(true);
  };
  const closeSummarySoon = () => {
    if (closeSummaryTimer.current) clearTimeout(closeSummaryTimer.current);
    // Allow the pointer to cross the small gap and read the popup itself.
    closeSummaryTimer.current = setTimeout(() => setSummaryOpen(false), 160);
  };
  useEffect(() => () => {
    if (closeSummaryTimer.current) clearTimeout(closeSummaryTimer.current);
  }, []);

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
      const timer = setTimeout(() => setCountState("unavailable"), 0);
      return () => clearTimeout(timer);
    }
    let active = true;
    let attempts = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const load = () => {
      if (!active) return;
      if (retry) clearTimeout(retry);
      attempts += 1;
      setCountState("loading");
      getVisitors().then((count) => {
        if (active) { setVisitors(count); setCountState("ready"); }
      }).catch(() => {
        if (!active) return;
        setCountState("unavailable");
        if (attempts < 3) retry = setTimeout(load, attempts * 3000);
      });
    };
    const online = () => { attempts = 0; load(); };
    retry = setTimeout(load, 0);
    window.addEventListener("online", online);
    return () => { active = false; clearTimeout(retry); window.removeEventListener("online", online); };
  }, []);

  const displayedVisitors = visitors === null ? null : VISITOR_BASELINE + visitors;
  const countText = displayedVisitors === null ? "—" : displayedVisitors.toLocaleString("en-US");
  const countLabel = countState === "ready" ? `${t.visitors}: ${countText}`
    : countState === "loading" ? t.pending : t.unavailable;

  return <Localized>{(
    <div className="site-status" ref={root}>
      <span className="status-register" aria-hidden="true">SY / LOG</span>
      <Popover open={summaryOpen} onOpenChange={setSummaryOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="status-updated"
            onPointerEnter={(event) => {
              animateDate();
              if (event.pointerType !== "touch") keepSummaryOpen();
            }}
            onPointerLeave={(event) => {
              if (event.pointerType !== "touch" && !event.currentTarget.matches(":focus-visible")) closeSummarySoon();
            }}
            onFocus={(event) => {
              animateDate();
              if (event.currentTarget.matches(":focus-visible")) keepSummaryOpen();
            }}
            onClick={animateDate}
            aria-label={`${t.updated}: ${lastUpdated}. ${t.showUpdate}. ${t.replay}`}
          >
            <span className="status-label">{t.updated}</span>
            <time dateTime={lastUpdated} aria-label={lastUpdated}>
              <RollingDigits value={displayDate} replay={replay} className="status-date" />
            </time>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="status-update-panel"
          side="top"
          align="start"
          sideOffset={12}
          collisionPadding={16}
          aria-labelledby={summaryTitleId}
          onPointerEnter={(event) => { if (event.pointerType !== "touch") keepSummaryOpen(); }}
          onPointerLeave={(event) => { if (event.pointerType !== "touch") closeSummarySoon(); }}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className="status-update-heading">
            <h3 id={summaryTitleId}>{t.updateSummary}</h3>
            <div className="status-update-meta">
              <span>{latestDay.version}</span>
              <time dateTime={latestDay.date}>{latestDay.date.replaceAll("-", ".")}</time>
            </div>
          </div>
          <ul className="status-update-list">
            {latestDay[language].slice(0, 2).map((item, index) => (
              <li key={item}>
                <span className="status-update-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {latestDay[language].length > 2 && <details className="status-daily-more">
            <summary>{t.allDailyUpdates} <span>({latestDay[language].length})</span></summary>
            <ul className="status-daily-notes">{latestDay[language].slice(2).map(item => <li key={item}>{item}</li>)}</ul>
          </details>}
          <details className="status-changelog">
            <summary className="status-changelog-heading">
              <strong>{t.changelog}</strong>
              <span>{t.changelogHint}</span>
            </summary>
            <ol className="status-changelog-list">
              {pastDays.map((release) => (
                <li key={release.date}>
                  <details className="status-day-history">
                  <summary className="status-changelog-meta">
                    <time dateTime={release.date}>{release.date.replaceAll("-", ".")}</time>
                    <strong>{release.version}</strong>
                  </summary>
                  <ul className="status-daily-notes">{release[language].map(item => <li key={item}>{item}</li>)}</ul>
                  </details>
                </li>
              ))}
            </ol>
          </details>
        </PopoverContent>
      </Popover>
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
  )}</Localized>;
}
