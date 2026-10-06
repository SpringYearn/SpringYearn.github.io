"use client";
import { Localized } from "../localized";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, ChevronDown } from "lucide-react";
import { HeaderControls } from "../header-controls";
import { useSiteLanguage } from "../site-language";
import { SiteStatus } from "../site-status";
import { ForNever } from "../for-never";
import { labExperiments } from "../lab-data";
import { LabDownload } from "./lab-download";
import { sortLabProjects, type LabSortDirection, type LabSortKey } from "./project-sort";

const copy = {
  en: {
    home: "Home", work: "Work archive", contact: "Contact", files: "Project files",
    title: "Small tools,\nideas to test.",
    intro: "Tools and experiments I’ve built in DaVinci Resolve and Fusion. Some are usable builds; others are prototypes or research. Each starts with an idea worth trying.",
    count: `${String(labExperiments.length).padStart(2, "0")} development records / 2026`, back: "Return home", top: "Back to top",
    access: "These experimental builds are available for authorized testing only. To request a download, please contact SpringYearn directly for access.",
    buildLanguage: "Build language",
    languageNotice: "Most files currently available here are Traditional Chinese versions.",
    sort: "Sort by", direction: "Order", asc: "Ascending", desc: "Descending",
    sortKeys: { original: "Original order", updated: "Last updated", created: "Created date", name: "Name", type: "Tool type" },
    sorted: "Current order:",
  },
  zh: {
    home: "首頁", work: "作品集", contact: "聯絡", files: "專案檔",
    title: "工具、原型，\n還有一些實驗。",
    intro: "這裡記錄我在 DaVinci Resolve 和 Fusion 裡做的工具、插件與實驗。有些已經能用，有些還是原型或研究；有個想試的點子，就動手做做看。",
    count: `${String(labExperiments.length).padStart(2, "0")} 筆開發紀錄 / 2026`, back: "返回首頁", top: "回到頂端",
    access: "此實驗版本僅提供授權測試。若需要下載，請直接聯絡 SpringYearn 取得存取權限。",
    buildLanguage: "版本語言",
    languageNotice: "目前大多數檔案都是繁體中文版本。",
    sort: "排列依據", direction: "排列方向", asc: "升序", desc: "降序",
    sortKeys: { original: "原始順序", updated: "最後更新日", created: "建立日期", name: "名稱", type: "工具類型" },
    sorted: "目前排列：",
  },
};

export default function LabPage() {
  const { language, setLanguage } = useSiteLanguage();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [sortKey, setSortKey] = useState<LabSortKey>("original");
  const [sortDirection, setSortDirection] = useState<LabSortDirection>("asc");
  const projects = useMemo(() => sortLabProjects(labExperiments, sortKey, sortDirection), [sortKey, sortDirection]);
  const t = copy[language];
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
        Boolean(event.target.closest("[role=option], [role=combobox], a, button, select, summary, .project-card")),
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
    <main id="top" className="site-shell lab-page">
      <div className="scroll-progress" style={{ transform: "scaleX(" + scrollProgress + ")" }} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="art-cursor" aria-hidden="true"><span className="cursor-ring" /><span className="cursor-core" /></div>
      <header className={"site-header" + (hasScrolled ? " is-scrolled" : "")}>
        <Link className="wordmark" href="/" aria-label="SpringYearn home">
          <span className="wordmark-symbol"><img src="/logo.png" alt="" /></span>
          <span className="wordmark-text">SPRING YEARN</span><span className="wordmark-reg">®</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/">{t.home}</Link><Link href="/work">{t.work}</Link><Link href="/project-files">{t.files}</Link><Link href="/#profile">{language === "en" ? "Profile" : "關於我"}</Link><Link href="/#contact">{t.contact}</Link>
        </nav>
        <HeaderControls language={language} onToggleLanguage={() => setLanguage(current => current === "en" ? "zh" : "en")} />
      </header>
      <section className="section-block lab-hero" aria-labelledby="lab-title">
        <div className="work-archive-top mono-label"><span>LAB / EXPERIMENTS</span><span>{t.count}</span></div>
        <h1 id="lab-title">{t.title}</h1>
        <p className="lab-intro">{t.intro}</p>
        <nav className="lab-page-links" aria-label={language === "en" ? "Explore the site" : "網站導覽"}>
          <Link href="/" className="text-link archive-home-link"><ArrowLeft aria-hidden="true" />{t.back}</Link>
          <Link href="/work" className="text-link">{t.work}<ArrowUpRight aria-hidden="true" /></Link>
          <Link href="/project-files" className="text-link">{t.files}<ArrowUpRight aria-hidden="true" /></Link>
        </nav>
      </section>
      <section className="section-block lab-records" aria-label={t.count}>
        <div className="lab-access-note"><div><p>{t.access}</p><p className="lab-language-note"><span>{t.buildLanguage}</span>{t.languageNotice}</p></div><Link href="/#contact" className="text-link">{t.contact}<ArrowUpRight aria-hidden="true" /></Link></div>
        <div className="lab-sort-controls">
          <label className="lab-sort-field" htmlFor="lab-sort-key"><span>{t.sort}</span><span className="lab-sort-select">
            <select id="lab-sort-key" value={sortKey} onChange={event => setSortKey(event.target.value as LabSortKey)}>
              {(Object.keys(t.sortKeys) as LabSortKey[]).map(key => <option key={key} value={key}>{t.sortKeys[key]}</option>)}
            </select><ChevronDown aria-hidden="true" />
          </span></label>
          <fieldset className="lab-sort-direction"><legend className="sr-only">{t.direction}</legend>
            <button type="button" aria-pressed={sortDirection === "asc"} onClick={() => setSortDirection("asc")}><ArrowUp aria-hidden="true" />{t.asc}</button>
            <button type="button" aria-pressed={sortDirection === "desc"} onClick={() => setSortDirection("desc")}><ArrowDown aria-hidden="true" />{t.desc}</button>
          </fieldset>
          <span className="sr-only" role="status">{t.sorted} {t.sortKeys[sortKey]} / {sortDirection === "asc" ? t.asc : t.desc}</span>
        </div>
        <div className="lab-grid">
          {projects.map((experiment, index) => (
            <article className="lab-card" key={experiment.id} id={experiment.id.toLowerCase()} data-reveal>
              <div className="lab-card-top"><span className="lab-index">{experiment.id}</span><span className="lab-date" aria-label={(language === "en" ? "Created: " : "建立：") + experiment.date.created + (language === "en" ? "; Last updated: " : "；最後更新：") + experiment.date.updated}>
                <time dateTime={experiment.date.created}>{experiment.date.created.replaceAll("-", ".")}</time><span aria-hidden="true"> — </span><time dateTime={experiment.date.updated}>{experiment.date.updated.replaceAll("-", ".")}</time>
              </span></div>
              <div className="lab-card-main"><span className="lab-type mono-label">{experiment.type}</span><h2>{experiment.title}</h2><p>{experiment.body[language]}</p>
                <details className="lab-checkpoint"><summary><span>{language === "en" ? "History / checkpoints" : "歷史 checkpoint"} <span className="lab-checkpoint-count">({experiment.history.length})</span></span><ChevronDown aria-hidden="true" /></summary>
                  <ol className="lab-checkpoint-list">{experiment.history.map((checkpoint, checkpointIndex) => <li key={checkpointIndex}><div className="lab-checkpoint-heading"><time dateTime={checkpoint.date}>{checkpoint.date.replaceAll("-", ".")}</time><span>{checkpoint.title[language]}</span></div><p>{checkpoint.body[language]}</p></li>)}</ol>
                  {experiment.checkpoint && <details className="lab-checkpoint-full"><summary>{language === "en" ? "Full 0.3.5 validation record" : "完整 0.3.5 驗證紀錄"}</summary><p>{experiment.checkpoint.body[language]}</p></details>}
                </details>
              </div>
              <div className="lab-card-foot"><span className="lab-status-dot" aria-hidden="true" /><span>{experiment.status[language]}</span><span aria-hidden="true">{String(index + 1).padStart(2, "0")} / {String(labExperiments.length).padStart(2, "0")}</span></div>
              <LabDownload project={experiment} language={language} />
            </article>
          ))}
        </div>
      </section>
      <SiteStatus language={language} />
      <footer className="site-footer"><span>SpringYearn® — LAB / EXPERIMENTS</span><ForNever language={language} place="lab" /><a href="#top">{t.top}<ArrowUpRight aria-hidden="true" /></a></footer>
    </main>
  )}</Localized>;
}
