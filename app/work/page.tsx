"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpRight, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Localized } from "../localized";
import { SiteHeader } from "../header-controls";
import { useSiteLanguage } from "../site-language";
import { projects, projectTitle, type Category, type Project } from "../portfolio-data";
import { SiteStatus } from "../site-status";
import { ForNever } from "../for-never";
import { SortSelect } from "../sort-select";
import { useVisibleVideo } from "../home-reel";
import { projectDates } from "./project-dates";
import { sortWorkProjects, type WorkSortDirection, type WorkSortKey } from "./project-sort";
import { WorkDate } from "./work-date";
import { FeaturedWork } from "./featured-work";
import "./work.css";

const copy = {
  en: {
    title: "Work archive",
    filters: {
      all: "All",
      design: "APP / UI",
      editing: "Editing / Motion",
      "3d": "3D",
      drawing: "Drawing",
    },
    atlasTitle: "All work",
    sort: "Sort by", direction: "Order", asc: "Ascending", desc: "Descending", sorted: "Current order:",
    sortKeys: { original: "Original order", date: "Artwork date clues", created: "Source file created", updated: "Last updated", name: "Name", category: "Discipline" },
    dateNote: "Last updated uses file modification dates when known, then publication dates or existing year clues. Unconfirmed dates stay last.",
    view: "View details",
    footer: "SpringYearn® — Work Archive",
    backTop: "Back to top",
  },
  zh: {
    title: "作品集",
    filters: {
      all: "全部",
      design: "APP / UI",
      editing: "剪輯 / 動態設計",
      "3d": "3D",
      drawing: "繪畫",
    },
    atlasTitle: "所有作品",
    sort: "排列依據", direction: "排列方向", asc: "升序", desc: "降序", sorted: "目前排列：",
    sortKeys: { original: "原始順序", date: "作品日期", created: "原檔建立日", updated: "最後更新日", name: "名稱", category: "媒介分類" },
    dateNote: "依作品完成或發布時間排序（未標註日期之早期作品列於最後）。",
    view: "查看詳情",
    footer: "SpringYearn® — 作品集",
    backTop: "回到頂端",
  },
};

function ArchiveMedia({ project }: { project: Project }) {
  const isVideo = project.mediaType === "video";
  const deferred = isVideo && project.poster !== undefined;
  const video = useVisibleVideo(deferred ? project.thumbnail : undefined);
  return (
    <span className="archive-entry-art" aria-hidden="true" data-fit={project.fit ?? "cover"}>
      {isVideo ? (
        <>
          <video ref={video} src={deferred ? undefined : project.thumbnail} poster={project.poster}
            preload={deferred ? "none" : "metadata"} autoPlay={!deferred} muted loop playsInline disablePictureInPicture />
          <span className="archive-entry-play"><Play /></span>
        </>
      ) : (
        <img src={project.thumbnail} alt="" loading="lazy" draggable={false} />
      )}
    </span>
  );
}

export default function WorkArchive() {
  const { language, locale } = useSiteLanguage();
  const [filter, setFilter] = useState<Category>("all");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [sortKey, setSortKey] = useState<WorkSortKey>("updated");
  const [sortDirection, setSortDirection] = useState<WorkSortDirection>("desc");
  const t = copy[language];
  const filteredProjects = useMemo(
    () => sortWorkProjects(projects.filter(project => filter === "all" || project.category === filter), projectDates, sortKey, sortDirection),
    [filter, sortKey, sortDirection],
  );

  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const maximum = root.scrollHeight - innerHeight;
      setScrollProgress(maximum > 0 ? scrollY / maximum : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return <Localized>
    <main id="top" className="site-shell work-page">
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} aria-hidden="true" />
      <SiteHeader active="work" />

      <div className="section-block work-archive-heading">
        <h1 id="archive-title">{t.title}</h1>
        <a className="archive-jump text-link" href="#all-work">
          {t.atlasTitle}<ArrowDown aria-hidden="true" />
        </a>
      </div>

      <FeaturedWork />

      <section className="section-block work-archive-gallery" id="all-work" aria-labelledby="all-work-title">
        <div className="archive-controls" data-reveal>
          <h2 id="all-work-title">{t.atlasTitle}</h2>
          <div className="filter-row archive-filter-row" role="group" aria-label="Project filters">
            {(["all", "editing", "3d", "drawing", "design"] as Category[]).map(category => (
              <Button key={category} type="button" variant="ghost" className="filter-button"
                data-active={filter === category} aria-pressed={filter === category}
                onClick={() => setFilter(category)}>
                {t.filters[category]}
              </Button>
            ))}
          </div>
        </div>
        <div className="lab-sort-controls work-sort-controls">
          <SortSelect id="work-sort-key" label={t.sort} value={sortKey} options={t.sortKeys} onChange={setSortKey} />
          <fieldset className="lab-sort-direction">
            <legend className="sr-only">{t.direction}</legend>
            <button type="button" aria-pressed={sortDirection === "asc"} onClick={() => setSortDirection("asc")}><ArrowUp aria-hidden="true" />{t.asc}</button>
            <button type="button" aria-pressed={sortDirection === "desc"} onClick={() => setSortDirection("desc")}><ArrowDown aria-hidden="true" />{t.desc}</button>
          </fieldset>
          <span className="sr-only" role="status">{t.sorted} {t.sortKeys[sortKey]} / {sortDirection === "asc" ? t.asc : t.desc}</span>
        </div>
        {sortKey === "updated" && <p className="work-date-note">{t.dateNote}</p>}

        <div className="archive-spreads" data-length={filteredProjects.length === 1 ? "single" : "multiple"}>
          {filteredProjects.map(project => {
            const title = projectTitle(project, locale);
            return (
              <article className="archive-entry" id={`work-${project.id}`} key={project.id} data-reveal
                data-project-id={project.id} data-frame={project.frame ?? "landscape"}>
                <Link className="work-detail-link" href={`/work/${project.id}/`} aria-label={`${title} — ${t.view}`}>
                  <ArchiveMedia project={project} />
                  <div className="archive-entry-caption">
                    <div>
                      <div className="archive-entry-meta">
                        <span className="mono-label">{t.filters[project.category]}</span>
                        <WorkDate id={project.id} language={language} basis={sortKey} />
                      </div>
                      <h3 data-localize="off">{title}</h3>
                    </div>
                    <span className="archive-entry-action"><span>{t.view}</span><ArrowRight aria-hidden="true" /></span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <SiteStatus language={language} />
      <footer className="site-footer">
        <span>{t.footer}</span>
        <ForNever language={language} place="work" />
        <a href="#top">{t.backTop}<ArrowUpRight aria-hidden="true" /></a>
      </footer>
    </main>
  </Localized>;
}
