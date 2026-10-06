"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download, Play, Expand } from "lucide-react";
import { HeaderControls } from "./header-controls";
import { SiteStatus } from "./site-status";
import { ItemShare } from "./item-share";
import { useSiteLanguage } from "./site-language";
import { itemPath, materialLabel } from "./share-data";
import type { Project } from "./portfolio-data";
import type { ProjectFile } from "./project-files/files";
import { featuredSummaries } from "./work/featured-data";

type Props = { kind: "work"; project: Project } | { kind: "project-files"; project: ProjectFile };
function quietPreview(video: HTMLVideoElement | null) { if (video) video.volume = .25; }

export function ItemPage(props: Props) {
  const { language, setLanguage } = useSiteLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const chinese = language === "zh";
  const { project, kind } = props;
  const indexPath = kind === "work" ? `/work/#work-${project.id}` : `/project-files/#${project.id}`;
  useEffect(() => {
    const root = document.documentElement;
    const cursor = document.querySelector<HTMLElement>(".art-cursor");
    const fine = window.matchMedia("(pointer: fine)").matches;
    root.classList.add("motion-ready");
    if (fine) root.classList.add("has-art-cursor");
    const move = (event: PointerEvent) => {
      if (!fine || !cursor) return;
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`); cursor.style.setProperty("--cursor-y", `${event.clientY}px`); cursor.classList.add("is-visible");
    };
    const over = (event: PointerEvent) => { cursor?.classList.toggle("is-active", !!(event.target as Element)?.closest("a,button,input,summary")); };
    const down = () => cursor?.classList.add("is-pressed");
    const up = () => cursor?.classList.remove("is-pressed");
    const out = (event: PointerEvent) => { if (!event.relatedTarget) cursor?.classList.remove("is-visible"); };
    const scroll = () => { setScrolled(window.scrollY > 28); const max = root.scrollHeight - innerHeight; setProgress(max > 0 ? scrollY / max : 0); };
    window.addEventListener("scroll", scroll, { passive: true }); scroll();
    if (fine) { window.addEventListener("pointermove", move, { passive: true }); window.addEventListener("pointerover", over, { passive: true }); window.addEventListener("pointerdown", down, { passive: true }); window.addEventListener("pointerup", up, { passive: true }); window.addEventListener("pointerout", out, { passive: true }); }
    return () => { root.classList.remove("motion-ready", "has-art-cursor"); window.removeEventListener("scroll", scroll); window.removeEventListener("pointermove", move); window.removeEventListener("pointerover", over); window.removeEventListener("pointerdown", down); window.removeEventListener("pointerup", up); window.removeEventListener("pointerout", out); };
  }, []);
  const links = [{ href: "/", label: chinese ? "首頁" : "Home" }, { href: "/work/", label: chinese ? "作品集" : "Work archive" }, { href: "/lab/", label: "LAB" }, { href: "/project-files/", label: chinese ? "專案檔" : "Project files" }, { href: "/#profile", label: chinese ? "關於我" : "Profile" }, { href: "/#contact", label: chinese ? "聯絡" : "Contact" }];
  const preview = props.kind === "work" ? props.project.thumbnail : "youtubeId" in props.project.preview ? `https://i.ytimg.com/vi/${props.project.preview.youtubeId}/hqdefault.jpg` : props.project.preview.poster;
  const video = props.kind === "work" ? props.project.mediaType === "video" ? props.project.thumbnail : null : "video" in props.project.preview ? props.project.preview.video : null;
  const source = props.kind === "work" ? props.project.href : "youtubeId" in props.project.preview ? `https://youtu.be/${props.project.preview.youtubeId}` : props.project.preview.video;
  const youtube = /^https:\/\/(?:www\.)?(?:youtu\.be|youtube\.com)\//i.test(source);
  const instagram = /^https:\/\/(?:www\.)?instagram\.com\//i.test(source);
  const sourceVideo = youtube || (instagram && props.kind === "work" && props.project.art === "video");
  const sourceLabel = youtube ? (chinese ? "在 YouTube 播放" : "Watch on YouTube")
    : instagram ? (sourceVideo ? (chinese ? "在 Instagram 播放" : "Watch on Instagram") : (chinese ? "在 Instagram 開啟" : "Open on Instagram"))
    : (chinese ? "開啟原圖" : "Open full image");
  const label = props.kind === "work" ? props.project.type[language] : `${props.project.software === "ae" ? "After Effects" : "DaVinci Resolve"} / ${chinese ? "免費專案檔" : "FREE PROJECT FILE"}`;
  const intro = props.kind === "work" ? featuredSummaries[props.project.id]?.[language] ?? props.project.detail[language] : materialLabel(props.project, language);
  return <main id="top" className="site-shell item-page">
    <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" /><div className="grain" aria-hidden="true" /><div className="art-cursor" aria-hidden="true"><span className="cursor-ring" /><span className="cursor-core" /></div>
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}><Link className="wordmark" href="/" aria-label="SpringYearn home"><span className="wordmark-symbol"><img src="/logo.png" alt="" /></span><span className="wordmark-text">SPRING YEARN</span><span className="wordmark-reg">®</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}<Link className="whiteboard-nav-link" href="/whiteboard">{language === "zh" ? "塗鴉板" : "Whiteboard"}</Link></nav><HeaderControls language={language} onToggleLanguage={() => setLanguage(value => value === "en" ? "zh" : "en")} />
    </header>
    <section className="section-block item-hero"><Link className="text-link" href={indexPath}><ArrowLeft aria-hidden="true" />{kind === "work" ? (chinese ? "返回作品集" : "Back to work archive") : (chinese ? "返回專案檔" : "Back to project files")}</Link><p className="mono-label">{label}</p><h1>{project.title}</h1><p className="item-intro">{intro}</p><ItemShare path={itemPath(kind, project.id)} title={project.title} /></section>
    <section className="section-block item-content" aria-label={chinese ? "項目預覽與資訊" : "Item preview and information"}>
      <div className="item-preview">{video ? <video ref={quietPreview} controls playsInline preload="none" poster={props.kind === "project-files" ? preview : undefined} src={video} /> : <a className={`item-preview-link${sourceVideo ? " is-video-destination" : ""}`} href={source} target="_blank" rel="noreferrer" aria-label={`${project.title} — ${sourceLabel}, ${chinese ? "在新分頁開啟" : "opens in a new tab"}`}>
        <span className="item-preview-visual"><img src={preview} alt={project.title} style={{ objectFit: props.kind === "work" ? props.project.fit ?? "cover" : "cover" }} />
        {sourceVideo && <span className="item-preview-play" aria-hidden="true"><Play /></span>}</span>
        <span className="item-preview-caption"><span>{!sourceVideo && <Expand aria-hidden="true" />}{sourceLabel}</span><span className="item-preview-newtab">{chinese ? "在新分頁開啟" : "New tab"}<ArrowUpRight aria-hidden="true" /></span></span>
      </a>}</div>
      <div className="item-information"><p className="mono-label">{kind === "work" ? (chinese ? "作品" : "WORK") : (chinese ? "免費公開專案檔" : "FREE / PUBLIC DOWNLOAD")}</p><h2>{label}</h2><p>{intro}</p>
        {props.kind === "project-files" && <><p className="item-file-meta">{props.project.filename} / {props.project.bytes >= 1_000_000_000 ? `${(props.project.bytes / 1_000_000_000).toFixed(2)} GB` : `${(props.project.bytes / 1_000_000).toFixed(1)} MB`}</p><a className="pf-download-link" href={props.project.downloadUrl} download={props.project.downloadUrl.startsWith("/") ? props.project.filename : undefined} target={props.project.downloadUrl.startsWith("/") ? undefined : "_blank"} rel="noreferrer"><span>{chinese ? "免費下載" : "Free download"}</span><Download aria-hidden="true" /></a><p>{chinese ? "有相關問題，歡迎聯絡我，我很樂意解答。" : "If you have any related questions, contact me. I’m happy to help."}</p></>}
        <a className="text-link" href={source} target="_blank" rel="noreferrer">{chinese ? "觀看原始作品／預覽" : "View original work / preview"}<ArrowUpRight aria-hidden="true" /></a><Link className="text-link" href="/#contact">{chinese ? "聯絡" : "Contact"}<ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </section>
    <SiteStatus language={language} /><footer className="site-footer"><span>SpringYearn® — {kind === "work" ? "WORK" : "PROJECT FILES"}</span><Link href={kind === "work" ? "/work/" : "/project-files/"}>{chinese ? "返回索引" : "Back to index"}<ArrowUpRight aria-hidden="true" /></Link><a href="#top">{chinese ? "回到頂端" : "Back to top"}<ArrowUpRight aria-hidden="true" /></a></footer>
  </main>;
}
