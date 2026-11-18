"use client";
import { Localized } from "../localized";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, ChevronDown } from "lucide-react";
import { useSiteLanguage } from "../site-language";
import { labExperiments } from "../lab-data";
import { LabDownload } from "./lab-download";
import { LabAuthorIntro } from "./lab-author-intro";
import { ResourceSections } from "../resources/resource-sections";
import { SortSelect } from "../sort-select";
import { sortLabProjects, type LabSortDirection, type LabSortKey } from "./project-sort";

const copy = {
  en: {
    work: "Work archive", contact: "Contact",
    title: "Small tools,\nideas to test.",
    intro: "Tools and experiments I’ve built in DaVinci Resolve and Fusion. Some are usable builds; others are prototypes or research. Each starts with an idea worth trying.",
    count: `${String(labExperiments.length).padStart(2, "0")} development records / 2026`, back: "Return home",
    access: "These experimental builds are available for authorized testing only. To request a download, please contact SpringYearn directly for access.",
    buildLanguage: "Build language",
    languageNotice: "Most files currently available here are Traditional Chinese versions.",
    sort: "Sort by", direction: "Order", asc: "Ascending", desc: "Descending",
    sortKeys: { original: "Original order", updated: "Last updated", created: "Created date", name: "Name", type: "Tool type" },
    sorted: "Current order:",
  },
  zh: {
    work: "作品集", contact: "聯絡",
    title: "工具、原型，\n還有一些實驗。",
    intro: "這裡記錄我在 DaVinci Resolve 和 Fusion 裡做的工具、插件與實驗。有些已經能用，有些還是原型或研究；有個想試的點子，就動手做做看。",
    count: `${String(labExperiments.length).padStart(2, "0")} 筆開發紀錄 / 2026`, back: "返回首頁",
    access: "此實驗版本僅提供授權測試。若需要下載，請直接聯絡 SpringYearn 取得存取權限。",
    buildLanguage: "版本語言",
    languageNotice: "目前大多數檔案都是繁體中文版本。",
    sort: "排列依據", direction: "排列方向", asc: "升序", desc: "降序",
    sortKeys: { original: "原始順序", updated: "最後更新日", created: "建立日期", name: "名稱", type: "工具類型" },
    sorted: "目前排列：",
  },
};

export function LabContent({ showResourceSections = false }: { showResourceSections?: boolean }) {
  const { language } = useSiteLanguage();
  const [sortKey, setSortKey] = useState<LabSortKey>("updated");
  const [sortDirection, setSortDirection] = useState<LabSortDirection>("desc");
  const projects = useMemo(() => sortLabProjects(labExperiments, sortKey, sortDirection), [sortKey, sortDirection]);
  const t = copy[language];

  return <Localized>
    <>
      <section className="section-block lab-hero" aria-labelledby="lab-title">
        {showResourceSections && <ResourceSections active="lab" language={language} />}
        <h1 id="lab-title">{t.title}</h1>
        <LabAuthorIntro text={t.intro} />
        <nav className="lab-page-links" aria-label={language === "en" ? "Explore the site" : "網站導覽"}>
          <Link href="/" className="text-link archive-home-link"><ArrowLeft aria-hidden="true" />{t.back}</Link>
          <Link href="/work" className="text-link">{t.work}<ArrowUpRight aria-hidden="true" /></Link>
        </nav>
      </section>
      <section className="section-block lab-records" data-lab-platform="resolve" aria-labelledby="lab-platform-title">
        <div className="lab-platform-heading"><h2 id="lab-platform-title">DaVinci Resolve / Fusion</h2></div>
        <div className="lab-access-note"><div><p>{t.access}</p><p className="lab-language-note"><span>{t.buildLanguage}</span>{t.languageNotice}</p></div><Link href="/#contact" className="text-link">{t.contact}<ArrowUpRight aria-hidden="true" /></Link></div>
        <div className="lab-sort-controls lab-sort-panel">
          <SortSelect id="lab-sort-key" label={t.sort} value={sortKey} options={t.sortKeys} onChange={setSortKey} />
          <fieldset className="lab-sort-direction"><legend className="sr-only">{t.direction}</legend>
            <button type="button" aria-pressed={sortDirection === "asc"} onClick={() => setSortDirection("asc")}><ArrowUp aria-hidden="true" />{t.asc}</button>
            <button type="button" aria-pressed={sortDirection === "desc"} onClick={() => setSortDirection("desc")}><ArrowDown aria-hidden="true" />{t.desc}</button>
          </fieldset>
          <span className="sr-only" role="status">{t.sorted} {t.sortKeys[sortKey]} / {sortDirection === "asc" ? t.asc : t.desc}</span>
        </div>
        <div className="lab-grid">
          {projects.map(experiment => (
            <article className="lab-card" key={experiment.id} id={experiment.id.toLowerCase()} data-reveal>
              <div className="lab-card-top"><span className="lab-date" aria-label={(language === "en" ? "Created: " : "建立：") + experiment.date.created + (language === "en" ? "; Last updated: " : "；最後更新：") + experiment.date.updated}>
                <time dateTime={experiment.date.created}>{experiment.date.created.replaceAll("-", ".")}</time><span aria-hidden="true"> — </span><time dateTime={experiment.date.updated}>{experiment.date.updated.replaceAll("-", ".")}</time>
              </span></div>
              <div className="lab-card-main"><span className="lab-type mono-label">{experiment.type}</span><h2>{experiment.title}</h2><p>{experiment.body[language]}</p>
                <details className="lab-checkpoint"><summary><span>{language === "en" ? "History / checkpoints" : "歷史 checkpoint"} <span className="lab-checkpoint-count">({experiment.history.length})</span></span><ChevronDown aria-hidden="true" /></summary>
                  <ol className="lab-checkpoint-list">{experiment.history.map((checkpoint, checkpointIndex) => <li key={checkpointIndex}><div className="lab-checkpoint-heading"><time dateTime={checkpoint.date}>{checkpoint.date.replaceAll("-", ".")}</time><span>{checkpoint.title[language]}</span></div><p>{checkpoint.body[language]}</p></li>)}</ol>
                  {experiment.checkpoint && <details className="lab-checkpoint-full"><summary>{language === "en" ? "Full 0.3.5 validation record" : "完整 0.3.5 驗證紀錄"}</summary><p>{experiment.checkpoint.body[language]}</p></details>}
                </details>
              </div>
              <div className="lab-card-foot"><span className="lab-status-dot" aria-hidden="true" /><span>{experiment.status[language]}</span></div>
              <LabDownload project={experiment} language={language} />
            </article>
          ))}
        </div>
      </section>
    </>
  </Localized>;
}
