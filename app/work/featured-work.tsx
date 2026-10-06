"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Sparkle } from "lucide-react";
import { projects } from "../portfolio-data";
import { useSiteLanguage } from "../site-language";
import { featuredWorkIds, featuredSummaries } from "./featured-data";

export function FeaturedWork() {
  const { language } = useSiteLanguage();
  const section = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)), { rootMargin: "100px" });
    if (section.current) observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  return <section ref={section} className="featured-work" data-in-view={inView} aria-labelledby="featured-work-title">
    <div className="featured-work-heading"><p className="featured-selection-label mono-label"><Sparkle aria-hidden="true" />{language === "en" ? "SELECTED WORKS" : "精選作品"}<span>03 / SY</span></p><h2 id="featured-work-title">{language === "en" ? "A few places to start." : "從這幾件作品開始。"}</h2></div>
    <div className="featured-work-grid">
      <svg className="featured-orbits" viewBox="0 0 1200 500" fill="none" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="600" cy="240" rx="555" ry="192" className="featured-orbit-line" />
        <path d="M40 390C210 95 515 455 775 160S1070 95 1170 280" className="featured-orbit-line featured-orbit-path" />
        <g className="featured-orbit-marks"><circle cx="146" cy="125" r="10" /><path d="M130 125H162M146 109V141M1020 358H1060M1040 338V378" /><circle cx="1040" cy="358" r="20" /></g>
      </svg>
      {featuredWorkIds.map((id, index) => {
        const project = projects.find(item => item.id === id)!;
        return <Link className="featured-work-card" href={`/work/${id}/`} key={id} style={{ "--selection-angle": ["-3deg", "2deg", "-1.8deg"][index], "--selection-mobile-angle": ["-1.2deg", "1.1deg", "-.8deg"][index], "--selection-offset": ["0px", "28px", "10px"][index], "--selection-period": ["8.2s", "9.4s", "8.8s"][index], "--selection-delay": ["-1s", "-4s", "-2.3s"][index] } as CSSProperties} aria-label={`${project.title} — ${language === "en" ? "View details" : "查看詳情"}`}>
          <div className="featured-card-inner">
          <div className="featured-work-art"><img src={project.thumbnail} alt="" loading="lazy" style={{ objectFit: project.fit ?? "cover" }} /><span className="featured-work-seal mono-label"><Sparkle aria-hidden="true" />{language === "en" ? "SELECTED" : "精選"} / {String(index + 1).padStart(2, "0")}</span><svg className="featured-frame-trace" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none" aria-hidden="true"><rect x="2" y="2" width="96" height="96" pathLength="100" vectorEffect="non-scaling-stroke" /></svg></div>
          <span className="mono-label">{language === "en" ? "Focus" : "創作方向"} / {project.type[language]}</span>
          <h3>{project.title}</h3>
          <p>{featuredSummaries[id]?.[language] ?? project.detail[language]}</p>
          <span className="item-details-cta">{language === "en" ? "View details" : "查看詳情"}<ArrowRight aria-hidden="true" /></span>
          </div>
        </Link>;
      })}
    </div>
  </section>;
}
