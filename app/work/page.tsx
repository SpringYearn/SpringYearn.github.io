"use client";
import { Localized } from "../localized";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, ArrowRight, ChevronDown } from "lucide-react";
import { HeaderControls } from "../header-controls";
import { useSiteLanguage } from "../site-language";
import { Button } from "@/components/ui/button";
import { projects, type Category } from "../portfolio-data";
import { SiteStatus } from "../site-status";
import { ForNever } from "../for-never";
import { SpringMark } from "../spring-mark";
import { projectDates } from "./project-dates";
import { sortWorkProjects, type WorkSortDirection, type WorkSortKey } from "./project-sort";
import { WorkDate } from "./work-date";
import { FeaturedWork } from "./featured-work";

const copy = {
  en: {
    nav: { home: "Home", profile: "Profile", contact: "Contact" },
    eyebrow: "Work / 2020—Now",
    intro:
      "A collection of my APP / UI, editing, motion, 3D, drawing and graphic design work. Pick a category, or browse the whole mix.",
    count: "Work archive / Taiwan",
    filters: {
      all: "All",
      design: "APP / UI",
      editing: "Editing / Motion",
      "3d": "3D",
      drawing: "Drawing",
    },
    overviewHint: "Start with a category, change the order, or pick a cover that looks interesting.",
    atlasTitle: "Different formats.\nPlenty to explore.", atlasLabel: "Browse the collection", sheet: "Plate", pieces: "works",
    sort: "Sort by", direction: "Order", asc: "Ascending", desc: "Descending", sorted: "Current order:",
    sortKeys: { original: "Original order", date: "Artwork date clues", created: "Source file created", updated: "Source file modified", name: "Name", category: "Discipline" },
    dateNote: "Dates follow publication records or matched source files. File timestamps are clues, not the start of a work; unknown dates stay last.",
    more: "More to come.",
    moreBody: "I’m still adding work here. Check back for more edits, designs and experiments.",
    moreTag: "Ongoing archive",
    view: "View details",
    returnHome: "Return to profile",
    footer: "SpringYearn® — Work Archive",
    backTop: "Back to top",
  },
  zh: {
    nav: { home: "首頁", profile: "關於我", contact: "聯絡" },
    eyebrow: "作品／2020—現在",
    intro: "這裡整理了我的 APP／UI、剪輯、動態圖形、3D、繪畫和平面設計作品。挑一個分類看，或全部逛一遍。",
    count: "作品集／台灣",
    filters: {
      all: "全部",
      design: "APP／UI",
      editing: "剪輯／動態圖形",
      "3d": "3D",
      drawing: "繪畫",
    },
    overviewHint: "可以從分類開始、換個排序，或直接點開一張喜歡的封面。",
    atlasTitle: "各種形式，\n慢慢看。", atlasLabel: "逛逛作品集", sheet: "圖版", pieces: "件作品",
    sort: "排列依據", direction: "排列方向", asc: "升序", desc: "降序", sorted: "目前排列：",
    sortKeys: { original: "原始順序", date: "作品日期線索", created: "原檔建立日", updated: "原檔修改日", name: "名稱", category: "媒介分類" },
    dateNote: "日期取自發布紀錄或比對到的原檔。檔案時間是線索，不代表創作起點；未確認的日期排在最後。",
    more: "還有作品慢慢補上。",
    moreBody: "作品還在陸續整理上架，之後會再放更多剪輯、設計與實驗。",
    moreTag: "持續更新",
    view: "查看詳情",
    returnHome: "回到個人介紹",
    footer: "SpringYearn® — 作品集",
    backTop: "回到頂端",
  },
};

function setPointerPosition(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === "touch") return;

  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  const element = event.currentTarget;

  element.style.setProperty("--pointer-x", (x - 0.5).toFixed(3));
  element.style.setProperty("--pointer-y", (y - 0.5).toFixed(3));
  element.style.setProperty("--spot-x", `${(x * 100).toFixed(1)}%`);
  element.style.setProperty("--spot-y", `${(y * 100).toFixed(1)}%`);
}

function resetPointerPosition(event: ReactPointerEvent<HTMLElement>) {
  const element = event.currentTarget;
  element.style.setProperty("--pointer-x", "0");
  element.style.setProperty("--pointer-y", "0");
  element.style.setProperty("--spot-x", "50%");
  element.style.setProperty("--spot-y", "50%");
}

export default function WorkArchive() {
  const { language, setLanguage } = useSiteLanguage();
  const [filter, setFilter] = useState<Category>("all");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [sortKey, setSortKey] = useState<WorkSortKey>("original");
  const [sortDirection, setSortDirection] = useState<WorkSortDirection>("asc");
  const t = copy[language];
  const filteredProjects = useMemo(
    () => sortWorkProjects(projects.filter((project) => filter === "all" || project.category === filter), projectDates, sortKey, sortDirection),
    [filter, sortKey, sortDirection],
  );
  const plates = Array.from({ length: Math.ceil(filteredProjects.length / 7) }, (_, index) => filteredProjects.slice(index * 7, index * 7 + 7));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");
    const cursor = document.querySelector<HTMLElement>(".art-cursor");
    const supportsCustomCursor = window.matchMedia("(pointer: fine)").matches;

    const updateCursor = (event: PointerEvent) => {
      if (!cursor || !supportsCustomCursor) return;
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
      cursor.classList.add("is-visible");
    };

    const updateCursorTarget = (event: PointerEvent) => {
      if (!cursor || !(event.target instanceof Element)) return;
      cursor.classList.toggle(
        "is-active",
        Boolean(event.target.closest("a, button, select, summary, .project-card")),
      );
    };

    const pressCursor = () => cursor?.classList.add("is-pressed");
    const releaseCursor = () => cursor?.classList.remove("is-pressed");
    const hideCursor = (event: PointerEvent) => {
      if (!event.relatedTarget) cursor?.classList.remove("is-visible");
    };

    if (supportsCustomCursor) {
      root.classList.add("has-art-cursor");
      window.addEventListener("pointermove", updateCursor, { passive: true });
      window.addEventListener("pointerover", updateCursorTarget, { passive: true });
      window.addEventListener("pointerdown", pressCursor, { passive: true });
      window.addEventListener("pointerup", releaseCursor, { passive: true });
      window.addEventListener("pointerout", hideCursor, { passive: true });
    }

    const updateScroll = () => {
      const maximum = root.scrollHeight - window.innerHeight;
      setScrollProgress(maximum > 0 ? window.scrollY / maximum : 0);
      setHasScrolled(window.scrollY > 28);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) =>
      observer.observe(element),
    );
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScroll);
      observer.disconnect();
      root.classList.remove("motion-ready");
      root.classList.remove("has-art-cursor");
      window.removeEventListener("pointermove", updateCursor);
      window.removeEventListener("pointerover", updateCursorTarget);
      window.removeEventListener("pointerdown", pressCursor);
      window.removeEventListener("pointerup", releaseCursor);
      window.removeEventListener("pointerout", hideCursor);
    };
  }, []);

  return <Localized>{(
    <main id="top" className="site-shell work-page">
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />
      <div className="grain" aria-hidden="true" />
      <div className="art-cursor" aria-hidden="true">
        <span className="cursor-ring" />
        <span className="cursor-core" />
      </div>

      <header className={`site-header${hasScrolled ? " is-scrolled" : ""}`}>
        <Link className="wordmark" href="/" aria-label="SpringYearn home">
          <span className="wordmark-symbol">
            <img src="/logo.png" alt="" />
          </span>
          <span className="wordmark-text">SPRING YEARN</span>
          <span className="wordmark-reg">®</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/">{t.nav.home}</Link>
          <Link href="/lab">LAB</Link>
          <Link href="/project-files">{language === "en" ? "Project files" : "專案檔"}</Link>
          <Link href="/#profile">{t.nav.profile}</Link>
          <Link href="/#contact">{t.nav.contact}</Link>
        </nav>
        <HeaderControls language={language} onToggleLanguage={() => setLanguage(current => current === "en" ? "zh" : "en")} />
      </header>

      <section className="work-archive-hero" aria-labelledby="archive-title">
        <div className="work-archive-top mono-label">
          <span>{t.eyebrow}</span>
          <span>{t.count}</span>
        </div>
        <div
          className="work-archive-title-wrap"
          onPointerMove={setPointerPosition}
          onPointerLeave={resetPointerPosition}
        >
          <h1 id="archive-title" aria-label="WORK ARCHIVE">
            {["WORK", "ARCHIVE"].map((word) => (
              <span className="archive-word" aria-hidden="true" key={word}>
                {Array.from(word).map((letter, letterIndex) => (
                  <span
                    className="archive-letter"
                    style={{ "--archive-index": letterIndex } as CSSProperties}
                    key={`${word}-${letterIndex}`}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <span className="archive-coordinate mono-label">SY / OPEN INDEX</span>
        </div>
        <div className="work-archive-intro">
          <p>{t.intro}</p>
          <Link href="/" className="text-link archive-home-link">
            <ArrowLeft aria-hidden="true" />
            {t.returnHome}
          </Link>
        </div>
      </section>

      <section className="section-block work-archive-gallery" aria-label={t.count}>
        <div className="filter-row archive-filter-row" role="group" aria-label="Project filters" data-reveal>
          {(Object.keys(t.filters) as Category[]).map((category) => (
            <Button
              key={category}
              type="button"
              variant="ghost"
              className="filter-button"
              data-active={filter === category}
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {t.filters[category]}
            </Button>
          ))}
        </div>

        <div className="lab-sort-controls work-sort-controls">
          <label className="lab-sort-field" htmlFor="work-sort-key"><span>{t.sort}</span><span className="lab-sort-select">
            <select id="work-sort-key" value={sortKey} onChange={event => setSortKey(event.target.value as WorkSortKey)}>
              {(Object.keys(t.sortKeys) as WorkSortKey[]).map(key => <option key={key} value={key}>{t.sortKeys[key]}</option>)}
            </select><ChevronDown aria-hidden="true" />
          </span></label>
          <fieldset className="lab-sort-direction"><legend className="sr-only">{t.direction}</legend>
            <button type="button" aria-pressed={sortDirection === "asc"} onClick={() => setSortDirection("asc")}><ArrowUp aria-hidden="true" />{t.asc}</button>
            <button type="button" aria-pressed={sortDirection === "desc"} onClick={() => setSortDirection("desc")}><ArrowDown aria-hidden="true" />{t.desc}</button>
          </fieldset>
          <span className="sr-only" role="status">{t.sorted} {t.sortKeys[sortKey]} / {sortDirection === "asc" ? t.asc : t.desc}</span>
        </div>
        <p className="work-date-note">{t.dateNote}</p>
        <p className="work-entry-hint">{language === "en" ? "Open a cover or title to explore the project details." : "點擊封面或標題，進入這件作品的詳細頁。"}</p>
        {filter === "all" && <FeaturedWork />}

        {filter === "all" ? (
          <div className="archive-overview archive-atlas">
            <div className="atlas-intro">
              <div><p className="mono-label">{t.atlasLabel} / {projects.length} {t.pieces}</p><h2>{t.atlasTitle}</h2></div>
              <div className="atlas-directory"><p>{t.overviewHint}</p></div><SpringMark className="atlas-spring" />
            </div>
            {plates.map((plate, plateIndex) => <section className="atlas-plate" key={plateIndex} aria-labelledby={`plate-${plateIndex}`}>
              <div className="atlas-plate-heading"><h3 id={`plate-${plateIndex}`}><span>{String(plateIndex + 1).padStart(2, "0")}</span>{t.sheet}</h3><span className="mono-label">{String(plateIndex * 7 + 1).padStart(2, "0")} — {String(plateIndex * 7 + plate.length).padStart(2, "0")} / {filteredProjects.length}</span></div>
              <div className="project-overview">
              {plate.map((project, index) => (
                <article
                  className={`overview-item${project.frame === "portrait" ? " overview-portrait" : ""}`}
                  key={project.id}
                  data-project-id={project.id}
                  id={`work-${project.id}`}
                  style={{ "--overview-index": index } as CSSProperties}
                >
                  <Link className="work-detail-link" href={`/work/${project.id}/`} aria-label={`${project.title} — ${t.view}`}><span className="atlas-art">
                  {project.mediaType === "video" ? (
                    <video
                      className={`overview-media${project.fit === "contain" ? " media-contain" : ""}`}
                      src={project.thumbnail}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="metadata"
                      draggable={false}
                    />
                  ) : (
                    <img
                      className={`overview-media${project.fit === "contain" ? " media-contain" : ""}`}
                      src={project.thumbnail}
                      alt=""
                      draggable={false}
                    />
                  )}
                  <span className="overview-index">{project.id}</span>
                  </span>
                  <span className="atlas-meta"><span className="overview-category mono-label">{t.filters[project.category]}</span><WorkDate id={project.id} language={language} basis={sortKey} /></span>
                  <h4 className="atlas-title">{project.title}</h4>
                  <span className="item-details-cta">{t.view}<ArrowRight aria-hidden="true" /></span>
                  </Link>
                </article>
              ))}
              </div>
            </section>)}
              <div className="overview-more atlas-more">
                <span className="mono-label">{t.moreTag}</span>
                <strong>{t.more}</strong>
                <p>{t.moreBody}</p>
              </div>
          </div>
        ) : (
          <div className="project-grid" aria-live="polite">
            {filteredProjects.map((project) => (
              <article
                className="project-card"
                key={project.id}
                data-project-id={project.id}
                  id={`work-${project.id}`}
                onPointerMove={setPointerPosition}
                onPointerLeave={resetPointerPosition}
                style={{ animationDelay: `${Number(project.id) * 55}ms` }}
              >
                <Link className="work-detail-link" href={`/work/${project.id}/`} aria-label={`${project.title} — ${t.view}`}><div
                  className={`project-art art-${project.art}${project.frame === "portrait" ? " frame-portrait" : ""}`}
                  aria-hidden="true"
                >
                  {project.mediaType === "video" ? (
                    <video
                      className="project-media"
                      src={project.thumbnail}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      className={`project-media${project.fit === "contain" ? " media-contain" : ""}`}
                      src={project.thumbnail}
                      alt=""
                    />
                  )}
                  <span className="project-index">{project.id}</span>
                  <span className="art-title">{project.title.split(" / ")[0]}</span>
                </div>
                <div className="project-info">
                  <div>
                    <p className="mono-label">{project.type[language]} / {project.detail[language]}</p>
                    <h2>{project.title}</h2>
                    <WorkDate id={project.id} language={language} basis={sortKey} />
                  </div>
                  <span className="project-detail-action"><span className="project-action" aria-hidden="true"><ArrowRight /></span><span className="project-detail-label">{t.view}</span></span>
                </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <SiteStatus language={language} />
      <footer className="site-footer">
        <span>{t.footer}</span>
        <ForNever language={language} place="work" />
        <a href="#top">
          {t.backTop}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </footer>
    </main>
  )}</Localized>;
}
