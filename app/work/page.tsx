"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects, type Category, type Language } from "../portfolio-data";

const copy = {
  en: {
    nav: { home: "Home", profile: "Profile", contact: "Contact" },
    eyebrow: "Selected practice / 2020—Now",
    intro:
      "A growing archive across APP / UI, editing, motion, 3D, drawing and graphic image — arranged by medium, connected by rhythm.",
    count: "Open archive / Taiwan",
    filters: {
      all: "All",
      design: "APP / UI",
      editing: "Editing / Motion",
      "3d": "3D",
      drawing: "Drawing",
    },
    overviewHint: "Overview — choose a discipline to view each project in detail.",
    more: "And there is more...",
    moreBody: "Only part of the practice is online. The archive keeps growing.",
    moreTag: "Ongoing archive",
    view: "View project",
    returnHome: "Return to profile",
    footer: "SpringYearn® — Work Archive",
    backTop: "Back to top",
  },
  zh: {
    nav: { home: "首頁", profile: "關於我", contact: "聯絡" },
    eyebrow: "精選創作／2020—現在",
    intro: "持續整理 APP／UI、剪輯、動態圖形、3D、繪畫與平面影像，媒介彼此不同，卻共享同一種節奏。",
    count: "開放式創作檔案／台灣",
    filters: {
      all: "全部",
      design: "APP／UI",
      editing: "剪輯／動態圖形",
      "3d": "3D",
      drawing: "繪畫",
    },
    overviewHint: "總覽模式——切換分類，逐件查看完整作品。",
    more: "還有更多⋯⋯",
    moreBody: "目前只上傳了部分創作，這份檔案仍在持續累積。",
    moreTag: "持續更新",
    view: "查看作品",
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

function followOverviewLink(event: ReactMouseEvent<HTMLAnchorElement>) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  window.location.assign(event.currentTarget.href);
}

export default function WorkArchive() {
  const [language, setLanguage] = useState<Language>("en");
  const [filter, setFilter] = useState<Category>("all");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const t = copy[language];
  const filteredProjects = useMemo(
    () => projects.filter((project) => filter === "all" || project.category === filter),
    [filter],
  );

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
        Boolean(event.target.closest("a, button, .project-card")),
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

  return (
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
          <Link href="/#profile">{t.nav.profile}</Link>
          <Link href="/#contact">{t.nav.contact}</Link>
        </nav>
        <Button
          type="button"
          variant="outline"
          className="language-switch"
          onClick={() => setLanguage((current) => (current === "en" ? "zh" : "en"))}
          aria-label={language === "en" ? "Switch to Chinese" : "切換為英文"}
        >
          <Globe2 aria-hidden="true" />
          {language === "en" ? "中文" : "EN"}
        </Button>
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
              onClick={() => setFilter(category)}
            >
              {t.filters[category]}
            </Button>
          ))}
        </div>

        {filter === "all" ? (
          <div className="archive-overview" aria-live="polite">
            <p className="overview-hint mono-label">{t.overviewHint}</p>
            <div className="project-overview">
              {projects.map((project, index) => (
                <a
                  className={`overview-item${project.frame === "portrait" ? " overview-portrait" : ""}`}
                  key={project.id}
                  href={project.href}
                  onClick={followOverviewLink}
                  style={{ "--overview-index": index } as CSSProperties}
                  aria-label={`${project.title} — ${t.view}`}
                >
                  {project.mediaType === "video" ? (
                    <video
                      className="overview-media"
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
                      className="overview-media"
                      src={project.thumbnail}
                      alt=""
                      draggable={false}
                    />
                  )}
                  <span className="overview-index">{project.id}</span>
                  <span className="overview-category mono-label">{t.filters[project.category]}</span>
                </a>
              ))}
              <div className="overview-more">
                <span className="mono-label">{t.moreTag}</span>
                <strong>{t.more}</strong>
                <p>{t.moreBody}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="project-grid" aria-live="polite">
            {filteredProjects.map((project) => (
              <a
                className="project-card"
                key={project.id}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.title} — ${t.view}`}
                onPointerMove={setPointerPosition}
                onPointerLeave={resetPointerPosition}
                style={{ animationDelay: `${Number(project.id) * 55}ms` }}
              >
                <div
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
                  </div>
                  <span className="project-action" aria-label={t.view}>
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer">
        <span>{t.footer}</span>
        <a href="#top">
          {t.backTop}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </footer>
    </main>
  );
}
