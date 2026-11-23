"use client";
import { Localized } from "./localized";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download, Play, Expand } from "lucide-react";
import { SiteHeader } from "./header-controls";
import { SiteStatus } from "./site-status";
import { ItemShare } from "./item-share";
import { useSiteLanguage } from "./site-language";
import { itemPath, materialLabel } from "./share-data";
import { projectTitle, type Project } from "./portfolio-data";
import type { ProjectFile } from "./project-files/files";
import { featuredSummaries } from "./work/featured-data";
import { WorkStory, WorkProjectLink } from "./work/work-story";
import { workStories } from "./work/work-stories";
import { ProjectGallery } from "./work/project-gallery";

type Props = { kind: "work"; project: Project } | { kind: "project-files"; project: ProjectFile };
function quietPreview(video: HTMLVideoElement | null) { if (video) video.volume = .25; }

export function ItemPage(props: Props) {
  const { language, locale } = useSiteLanguage();
  const [progress, setProgress] = useState(0);
  const chinese = language === "zh";
  const { project, kind } = props;
  const title = kind === "work" ? projectTitle(props.project, locale) : project.title;
  const indexPath = kind === "work" ? `/work/#work-${project.id}` : `/resources/#${project.id}`;
  // A full navigation keeps the resource fragment intact when returning to a cached index.
  const IndexLink = kind === "work" ? Link : "a";
  useEffect(() => {
    const root = document.documentElement;
    const scroll = () => { const max = root.scrollHeight - innerHeight; setProgress(max > 0 ? scrollY / max : 0); };
    window.addEventListener("scroll", scroll, { passive: true }); scroll();
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  const preview = props.kind === "work" ? props.project.thumbnail : "youtubeId" in props.project.preview ? `https://i.ytimg.com/vi/${props.project.preview.youtubeId}/hqdefault.jpg` : props.project.preview.poster;
  const video = props.kind === "work" ? props.project.mediaType === "video" ? props.project.thumbnail : null : "video" in props.project.preview ? props.project.preview.video : null;
  const poster = props.kind === "work" ? props.project.poster : preview;
  const source = props.kind === "work" ? props.project.href : "youtubeId" in props.project.preview ? `https://youtu.be/${props.project.preview.youtubeId}` : props.project.preview.video;
  const youtube = /^https:\/\/(?:www\.)?(?:youtu\.be|youtube\.com)\//i.test(source);
  const instagram = /^https:\/\/(?:www\.)?instagram\.com\//i.test(source);
  const sourceVideo = youtube || (instagram && props.kind === "work" && props.project.art === "video");
  const sourceLabel = youtube ? (chinese ? "在 YouTube 播放" : "Watch on YouTube")
    : instagram ? (sourceVideo ? (chinese ? "在 Instagram 播放" : "Watch on Instagram") : (chinese ? "在 Instagram 開啟" : "Open on Instagram"))
    : (chinese ? "開啟原圖" : "Open full image");
  const label = props.kind === "work" ? props.project.type[language] : `${props.project.software === "ae" ? "After Effects" : "DaVinci Resolve"} / ${chinese ? "免費專案檔" : "FREE PROJECT FILE"}`;
  const story = props.kind === "work" ? workStories[props.project.id] : undefined;
  const intro = props.kind === "work" ? featuredSummaries[props.project.id]?.[locale] ?? featuredSummaries[props.project.id]?.[language] : materialLabel(props.project, language);
  return <Localized>{<main id="top" className={`site-shell item-page item-page-${kind}`}>
    <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" /><div className="grain" aria-hidden="true" />
    <SiteHeader active={kind === "work" ? "work" : "resources"} />
    <section className="section-block item-hero">
      <IndexLink className="text-link" href={indexPath}><ArrowLeft aria-hidden="true" />{kind === "work" ? (chinese ? "返回作品集" : "Back to work archive") : (chinese ? "返回專案檔" : "Back to project files")}</IndexLink>
      <div className="item-title-row">
        <h1>{title}</h1>
        <ItemShare path={itemPath(kind, project.id)} title={title} />
      </div>
      {kind === "project-files" && <p className="item-intro">{intro}</p>}
    </section>
    <section className="section-block item-content" aria-label={chinese ? "項目預覽與資訊" : "Item preview and information"} data-reveal>
      <div className="item-preview">{video ? <video ref={quietPreview} controls playsInline preload="none" poster={poster} src={video} /> : <a className={`item-preview-link${sourceVideo ? " is-video-destination" : ""}`} href={source} target="_blank" rel="noreferrer" aria-label={`${title} — ${sourceLabel}, ${chinese ? "在新分頁開啟" : "opens in a new tab"}`}>
        <span className="item-preview-visual"><img src={preview} alt={title} style={{ objectFit: props.kind === "work" ? props.project.fit ?? "cover" : "cover" }} />
        {sourceVideo && <span className="item-preview-play" aria-hidden="true"><Play /></span>}</span>
        <span className="item-preview-caption"><span>{!sourceVideo && <Expand aria-hidden="true" />}{sourceLabel}</span><span className="item-preview-newtab">{chinese ? "在新分頁開啟" : "New tab"}<ArrowUpRight aria-hidden="true" /></span></span>
      </a>}</div>
      <div className="item-information">
        {props.kind === "work" ? <>
          <p className="mono-label item-category">{label}</p>
          {!story && intro && <p className="item-intro">{intro}</p>}
          <WorkStory id={props.project.id} />
          <WorkProjectLink id={props.project.id} />
        </> : <>
          <h2>{label}</h2>
          <p className="item-file-meta">{props.project.filename} / {props.project.bytes >= 1_000_000_000 ? `${(props.project.bytes / 1_000_000_000).toFixed(2)} GB` : `${(props.project.bytes / 1_000_000).toFixed(1)} MB`}</p>
          <a className="pf-download-link" href={props.project.downloadUrl} download={props.project.downloadUrl.startsWith("/") ? props.project.filename : undefined} target={props.project.downloadUrl.startsWith("/") ? undefined : "_blank"} rel="noreferrer"><span>{chinese ? "免費下載" : "Free download"}</span><Download aria-hidden="true" /></a>
        </>}
        {video && <a className="text-link" href={source} target="_blank" rel="noreferrer">{chinese ? "觀看原始作品 / 預覽" : "View original work / preview"}<ArrowUpRight aria-hidden="true" /></a>}
        <Link className="text-link" href="/#contact">{chinese ? "聯絡" : "Contact"}<ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </section>
    {props.kind === "work" && <ProjectGallery project={props.project} />}
    <SiteStatus language={language} /><footer className="site-footer"><span>SpringYearn® — {kind === "work" ? "WORK" : "PROJECT FILES"}</span><Link href={kind === "work" ? "/work/" : "/resources/"}>{chinese ? "返回索引" : "Back to index"}<ArrowUpRight aria-hidden="true" /></Link><a href="#top">{chinese ? "回到頂端" : "Back to top"}<ArrowUpRight aria-hidden="true" /></a></footer>
  </main>}</Localized>;
}
