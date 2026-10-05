"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download, Globe2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteStatus } from "../site-status";
import { projectFiles } from "./files";

const copy = {
  en: {
    home: "Home", work: "Work archive", contact: "Contact", back: "Return home", top: "Back to top",
    title: "The edit,\nopened up.",
    intro: "Project files from my edits, shared freely. Watch the finished piece, open the timeline, and explore how it came together.",
    count: "07 files / 02 applications", free: "Free / public downloads",
    help: "If you have any related questions, contact me (SpringYearn). I’m happy to help.",
    helpLabel: "A note from SpringYearn", preview: "Watch preview", download: "Free download",
    aeNote: "Compositions, layers and the details behind the edit.", davinciNote: "A closer look at the rhythm and structure of the timeline.",
    fileLabel: "Project file", aepNote: "Original .aep project file", zipNote: "Original ZIP package",
  },
  zh: {
    home: "首頁", work: "作品集", contact: "聯絡", back: "返回首頁", top: "回到頂端",
    title: "把剪輯打開，\n把想法分享出去。",
    intro: "把我免費分享的剪輯專案檔整理在這裡。先看完成的影片，再打開時間軸，看看每個畫面是如何拼起來的。",
    count: "07 個檔案 / 02 種軟體", free: "免費 / 公開下載",
    help: "有任何相關問題可以聯絡我（SpringYearn），我很樂意解答。",
    helpLabel: "來自 SpringYearn 的小提醒", preview: "觀看影片預覽", download: "免費下載",
    aeNote: "從合成、圖層到細節，打開剪輯背後的安排。", davinciNote: "走進時間軸，看看節奏與畫面是如何安排的。",
    fileLabel: "專案檔", aepNote: "原始 .aep 專案檔", zipNote: "原始 ZIP 專案包",
  },
};

const groups = [
  { id: "ae", name: "After Effects", abbreviation: "Ae" },
  { id: "davinci", name: "DaVinci Resolve", abbreviation: "DR" },
] as const;

function formatSize(bytes: number) {
  return bytes >= 1_000_000_000 ? (bytes / 1_000_000_000).toFixed(2) + " GB" : (bytes / 1_000_000).toFixed(1) + " MB";
}

export default function ProjectFilesPage() {
  const [language, setLanguage] = useState<"en" | "zh">("en");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
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

  return (
    <main id="top" className="site-shell pf-page">
      <div className="scroll-progress" style={{ transform: "scaleX(" + scrollProgress + ")" }} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="art-cursor" aria-hidden="true"><span className="cursor-ring" /><span className="cursor-core" /></div>
      <header className={"site-header" + (hasScrolled ? " is-scrolled" : "")}>
        <Link className="wordmark" href="/" aria-label="SpringYearn home">
          <span className="wordmark-symbol"><img src="/logo.png" alt="" /></span>
          <span className="wordmark-text">SPRING YEARN</span><span className="wordmark-reg">®</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/">{t.home}</Link><Link href="/work">{t.work}</Link><Link href="/lab">LAB</Link><Link href="/#contact">{t.contact}</Link>
        </nav>
        <Button type="button" variant="outline" className="language-switch" onClick={() => setLanguage(current => current === "en" ? "zh" : "en")}
          aria-label={language === "en" ? "Switch to Chinese" : "切換為英文"}>
          <Globe2 aria-hidden="true" />{language === "en" ? "中文" : "EN"}
        </Button>
      </header>
      <section className="section-block pf-hero" aria-labelledby="pf-title">
        <div className="work-archive-top mono-label"><span>PROJECT FILES / FREE PF</span><span>{t.count}</span></div>
        <div className="pf-hero-grid">
          <div><h1 id="pf-title">{t.title}</h1><p className="lab-intro">{t.intro}</p></div>
          <div className="pf-timeline-mark" aria-hidden="true"><span className="mono-label">SY / OPEN TIMELINE</span><div className="pf-timeline-tracks"><i /><i /><i /><i /><span /></div><span className="mono-label">SOURCE → SHARED</span></div>
        </div>
        <nav className="lab-page-links" aria-label={language === "en" ? "Explore the site" : "網站導覽"}>
          <Link href="/" className="text-link"><ArrowLeft aria-hidden="true" />{t.back}</Link><Link href="/work" className="text-link">{t.work}<ArrowUpRight aria-hidden="true" /></Link><Link href="/lab" className="text-link">LAB<ArrowUpRight aria-hidden="true" /></Link>
        </nav>
      </section>
      <aside className="pf-help-note" aria-label={t.helpLabel}><div><span className="mono-label">{t.free}</span><p>{t.help}</p></div><Link href="/#contact" className="text-link">{t.contact}<ArrowUpRight aria-hidden="true" /></Link></aside>
      <nav className="pf-category-index" aria-label={language === "en" ? "Project file categories" : "專案檔分類"}>
        {groups.map(group => <a key={group.id} href={"#" + group.id}><span>{group.name}</span><span className="mono-label">{String(projectFiles.filter(file => file.software === group.id).length).padStart(2, "0")}<ArrowUpRight aria-hidden="true" /></span></a>)}
      </nav>
      {groups.map((group, groupIndex) => (
        <section className="pf-group" key={group.id} id={group.id} aria-labelledby={group.id + "-title"}>
          <div className="pf-group-heading" data-reveal><span className="pf-software-mark" aria-hidden="true">{group.abbreviation}</span><div><p className="mono-label">0{groupIndex + 1} / PROJECT FILES</p><h2 id={group.id + "-title"}>{group.name}</h2><p>{group.id === "ae" ? t.aeNote : t.davinciNote}</p></div></div>
          <div className="pf-grid">
            {projectFiles.filter(file => file.software === group.id).map((file, index) => {
              const previewUrl = "youtubeId" in file.preview ? "https://youtu.be/" + file.preview.youtubeId : file.preview.video;
              return <article className="pf-card" key={file.id} id={file.id} data-reveal>
                <div className="pf-card-meta mono-label"><span>{group.abbreviation} / {String(index + 1).padStart(2, "0")}</span><span>{formatSize(file.bytes)}</span></div>
                {"youtubeId" in file.preview ? <a className="pf-preview-link" href={previewUrl} target="_blank" rel="noreferrer" aria-label={t.preview + " — " + file.title}>
                  <img loading="lazy" src={"https://i.ytimg.com/vi/" + file.preview.youtubeId + "/hqdefault.jpg"} alt={file.title + " — " + t.preview} /><span className="pf-play-mark" aria-hidden="true"><Play /></span>
                </a> : <video className="pf-preview-video" controls playsInline preload="none" poster={file.preview.poster} aria-label={t.preview + " — " + file.title}><source src={file.preview.video} type="video/mp4" /><a href={previewUrl}>{t.preview}</a></video>}
                <div className="pf-card-copy"><h3>{file.title}</h3><p><span>{file.filename.endsWith(".aep") ? t.aepNote : t.zipNote}</span><span className="mono-label">{file.filename.endsWith(".aep") ? "AEP" : "ZIP"}</span></p></div>
                <div className="pf-card-actions"><a className="text-link pf-preview-action" href={previewUrl} target="_blank" rel="noreferrer">{t.preview}<ArrowUpRight aria-hidden="true" /></a>
                  <a className="pf-download-link" href={file.downloadUrl} download={file.downloadUrl.startsWith("/") ? file.filename : undefined} target={file.downloadUrl.startsWith("/") ? undefined : "_blank"} rel="noreferrer" aria-label={t.download + " — " + file.title}><span>{t.download}</span><Download aria-hidden="true" /></a></div>
              </article>;
            })}
          </div>
        </section>
      ))}
      <SiteStatus language={language} />
      <footer className="site-footer"><span>SpringYearn® — PROJECT FILES</span><Link href="/#contact">{t.contact}<ArrowUpRight aria-hidden="true" /></Link><a href="#top">{t.top}<ArrowUpRight aria-hidden="true" /></a></footer>
    </main>
  );
}
