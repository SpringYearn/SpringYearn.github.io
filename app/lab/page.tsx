"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteStatus } from "../site-status";
import { labExperiments } from "../lab-data";
import { LabDownload } from "./lab-download";

const copy = {
  en: {
    home: "Home", work: "Work archive", contact: "Contact",
    title: "Tools, prototypes,\nand useful detours.",
    intro: "A development log of DaVinci Resolve and Fusion tools built to test workflows, solve specific problems, or explore ideas that existing tools did not quite cover.",
    count: "08 development records / 2026", back: "Return home", top: "Back to top",
    access: "These experimental builds are available for authorized testing only. To request a download, please contact SpringYearn directly for access.",
  },
  zh: {
    home: "首頁", work: "作品集", contact: "聯絡",
    title: "把奇怪的問題，\n做成可以測試的工具。",
    intro: "記錄我在 DaVinci Resolve 與 Fusion 裡做過的工具、插件與實驗。它們有些已經可用，有些仍是原型或研究，重點是把想法真的做出來測試。",
    count: "08 筆開發紀錄 / 2026", back: "返回首頁", top: "回到頂端",
    access: "此實驗版本僅提供授權測試。若需要下載，請直接聯絡 SpringYearn 取得存取權限。",
  },
};

export default function LabPage() {
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
          <Link href="/">{t.home}</Link><Link href="/work">{t.work}</Link><Link href="/#contact">{t.contact}</Link>
        </nav>
        <Button type="button" variant="outline" className="language-switch"
          onClick={() => setLanguage(current => current === "en" ? "zh" : "en")}
          aria-label={language === "en" ? "Switch to Chinese" : "切換為英文"}>
          <Globe2 aria-hidden="true" />{language === "en" ? "中文" : "EN"}
        </Button>
      </header>
      <section className="section-block lab-hero" aria-labelledby="lab-title">
        <div className="work-archive-top mono-label"><span>LAB / EXPERIMENTS</span><span>{t.count}</span></div>
        <h1 id="lab-title">{t.title}</h1>
        <p className="lab-intro">{t.intro}</p>
        <nav className="lab-page-links" aria-label={language === "en" ? "Explore the site" : "網站導覽"}>
          <Link href="/" className="text-link archive-home-link"><ArrowLeft aria-hidden="true" />{t.back}</Link>
          <Link href="/work" className="text-link">{t.work}<ArrowUpRight aria-hidden="true" /></Link>
        </nav>
      </section>
      <section className="section-block lab-records" aria-label={t.count}>
        <div className="lab-access-note"><p>{t.access}</p><Link href="/#contact" className="text-link">{t.contact}<ArrowUpRight aria-hidden="true" /></Link></div>
        <div className="lab-grid">
          {labExperiments.map((experiment, index) => (
            <article className="lab-card" key={experiment.id} id={experiment.id.toLowerCase()} data-reveal>
              <div className="lab-card-top"><span className="lab-index">{experiment.id}</span><span className="lab-date">{experiment.date}</span></div>
              <div className="lab-card-main"><span className="lab-type mono-label">{experiment.type}</span><h2>{experiment.title}</h2><p>{experiment.body[language]}</p></div>
              <div className="lab-card-foot"><span className="lab-status-dot" aria-hidden="true" /><span>{experiment.status[language]}</span><span aria-hidden="true">{String(index + 1).padStart(2, "0")} / 08</span></div>
              <LabDownload project={experiment} language={language} />
            </article>
          ))}
        </div>
      </section>
      <SiteStatus language={language} />
      <footer className="site-footer"><span>SpringYearn® — LAB / EXPERIMENTS</span><a href="#top">{t.top}<ArrowUpRight aria-hidden="true" /></a></footer>
    </main>
  );
}
