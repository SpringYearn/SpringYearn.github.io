"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ForNever } from "../for-never";
import { HeaderControls } from "../header-controls";
import { Localized } from "../localized";
import { useSiteLanguage } from "../site-language";
import { SiteStatus } from "../site-status";
import type { ResourceSection } from "./resource-route";

type Props = {
  section: ResourceSection | null;
  onBrowseResources?: () => void;
  children: ReactNode;
};

export function ResourceFrame({ section, onBrowseResources, children }: Props) {
  const { language, setLanguage } = useSiteLanguage();
  const shell = useRef<HTMLElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const chinese = language === "zh";

  useEffect(() => {
    const root = document.documentElement;
    const mark = cursor.current;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const move = (event: PointerEvent) => {
      mark?.style.setProperty("--cursor-x", `${event.clientX}px`);
      mark?.style.setProperty("--cursor-y", `${event.clientY}px`);
      mark?.classList.add("is-visible");
    };
    const target = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      mark?.classList.toggle("is-active", !!event.target.closest(
        "[role=option], [role=combobox], a, button, select, summary, .project-card",
      ));
    };
    const press = () => mark?.classList.add("is-pressed");
    const release = () => mark?.classList.remove("is-pressed");
    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) mark?.classList.remove("is-visible");
    };
    const updateScroll = () => {
      const maximum = root.scrollHeight - window.innerHeight;
      setScrollProgress(maximum > 0 ? window.scrollY / maximum : 0);
      setHasScrolled(window.scrollY > 28);
    };
    root.classList.add("motion-ready");
    if (fine) {
      root.classList.add("has-art-cursor");
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerover", target, { passive: true });
      window.addEventListener("pointerdown", press, { passive: true });
      window.addEventListener("pointerup", release, { passive: true });
      window.addEventListener("pointercancel", release, { passive: true });
      window.addEventListener("pointerout", leave, { passive: true });
    }
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    const size = new ResizeObserver(updateScroll);
    if (shell.current) size.observe(shell.current);
    return () => {
      size.disconnect();
      root.classList.remove("motion-ready", "has-art-cursor");
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", target);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("pointerout", leave);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    shell.current?.querySelectorAll("[data-reveal]").forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [section]);

  const sectionClass = section === "lab" ? " lab-page" : section === "project-files" ? " pf-page" : "";
  const pageClass = onBrowseResources ? " resources-page" : "";
  const footerTitle = section === "lab" ? "LAB / EXPERIMENTS" : section === "project-files" ? "PROJECT FILES" : "Resources";

  return <Localized>
    <main id="top" className={`site-shell${sectionClass}${pageClass}`} ref={shell}>
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div ref={cursor} className="art-cursor" aria-hidden="true"><span className="cursor-ring" /><span className="cursor-core" /></div>
      <header className={`site-header${hasScrolled ? " is-scrolled" : ""}`}>
        <Link className="wordmark" href="/" aria-label="SpringYearn home">
          <span className="wordmark-symbol"><img src="/logo.png" alt="" /></span>
          <span className="wordmark-text">SPRING YEARN</span><span className="wordmark-reg">®</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/">{chinese ? "首頁" : "Home"}</Link>
          <Link href="/work">{chinese ? "作品集" : "Work archive"}</Link>
          <Link href="/resources" aria-current="page" onNavigate={onBrowseResources ? event => {
            event.preventDefault();
            onBrowseResources();
          } : undefined}>{chinese ? "資源區" : "Resources"}</Link>
          <Link href="/#profile">{chinese ? "關於我" : "Profile"}</Link>
          <Link href="/#contact">{chinese ? "聯絡" : "Contact"}</Link>
        </nav>
        <HeaderControls language={language} onToggleLanguage={() => setLanguage(current => current === "en" ? "zh" : "en")} onBrowseResources={onBrowseResources} />
      </header>
      {children}
      <SiteStatus language={language} />
      <footer className="site-footer">
        <span>{`SpringYearn® — ${footerTitle}`}</span>
        {section === "lab" ? <ForNever language={language} place="lab" /> : <Link href="/#contact">{chinese ? "聯絡" : "Contact"}<ArrowUpRight aria-hidden="true" /></Link>}
        <a href="#top" onClick={onBrowseResources ? event => {
          event.preventDefault();
          window.scrollTo({ top: 0 });
        } : undefined}>{chinese ? "回到頂端" : "Back to top"}<ArrowUpRight aria-hidden="true" /></a>
      </footer>
    </main>
  </Localized>;
}
