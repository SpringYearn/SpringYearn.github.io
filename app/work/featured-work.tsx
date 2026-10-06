"use client";

import Link from "next/link";
import { ArrowRight, Sparkle } from "lucide-react";
import { projects } from "../portfolio-data";
import { useSiteLanguage } from "../site-language";
import { featuredWorkIds, featuredSummaries } from "./featured-data";

export function FeaturedWork() {
  const { language } = useSiteLanguage();
  return <section className="featured-work" aria-labelledby="featured-work-title">
    <div className="featured-work-heading"><p className="featured-selection-label mono-label"><Sparkle aria-hidden="true" />{language === "en" ? "SELECTED WORKS" : "精選作品"}<span>03 / SY</span></p><h2 id="featured-work-title">{language === "en" ? "A few places to start." : "從這幾件作品開始。"}</h2></div>
    <div className="featured-work-grid">
      {featuredWorkIds.map((id, index) => {
        const project = projects.find(item => item.id === id)!;
        return <Link className="featured-work-card" href={`/work/${id}/`} key={id} aria-label={`${project.title} — ${language === "en" ? "View details" : "查看詳情"}`}>
          <div className="featured-work-art"><img src={project.thumbnail} alt="" loading="lazy" style={{ objectFit: project.fit ?? "cover" }} /><span className="featured-work-seal mono-label"><Sparkle aria-hidden="true" />{language === "en" ? "SELECTED" : "精選"} / {String(index + 1).padStart(2, "0")}</span></div>
          <span className="mono-label">{language === "en" ? "Focus" : "創作方向"} / {project.type[language]}</span>
          <h3>{project.title}</h3>
          <p>{featuredSummaries[id]?.[language] ?? project.detail[language]}</p>
          <span className="item-details-cta">{language === "en" ? "View details" : "查看詳情"}<ArrowRight aria-hidden="true" /></span>
        </Link>;
      })}
    </div>
  </section>;
}
