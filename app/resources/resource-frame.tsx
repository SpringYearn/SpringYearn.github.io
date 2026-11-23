"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ForNever } from "../for-never";
import { SiteHeader } from "../header-controls";
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
  const { language } = useSiteLanguage();
  const shell = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const chinese = language === "zh";

  useEffect(() => {
    const root = document.documentElement;
    const updateScroll = () => {
      const maximum = root.scrollHeight - window.innerHeight;
      setScrollProgress(maximum > 0 ? window.scrollY / maximum : 0);
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    const size = new ResizeObserver(updateScroll);
    if (shell.current) size.observe(shell.current);
    return () => {
      size.disconnect();
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  const sectionClass = section === "lab" ? " lab-page" : section === "project-files" ? " pf-page" : "";
  const pageClass = onBrowseResources ? " resources-page" : "";
  const footerTitle = section === "lab" ? "LAB / EXPERIMENTS" : section === "project-files" ? "PROJECT FILES" : "Resources";

  return <Localized>
    <main id="top" className={`site-shell${sectionClass}${pageClass}`} ref={shell}>
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <SiteHeader active="resources" onBrowseResources={onBrowseResources} />
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
