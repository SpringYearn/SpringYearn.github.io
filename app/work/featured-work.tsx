"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "../portfolio-data";
import { useSiteLanguage } from "../site-language";
import { featuredWorkIds, featuredSummaries } from "./featured-data";

export function FeaturedWork() {
  const { language } = useSiteLanguage();
  return <section className="featured-work" aria-labelledby="featured-work-title">
    <div className="featured-work-heading"><p className="mono-label">SELECTED / 03</p><h2 id="featured-work-title">{language === "en" ? "A few places to start." : "從這幾件作品開始。"}</h2></div>
    <div className="featured-work-grid">
      {featuredWorkIds.map(id => {
        const project = projects.find(item => item.id === id)!;
        return <Link className="featured-work-card" href={`/work/${id}/`} key={id}>
          <div className="featured-work-art"><img src={project.thumbnail} alt="" loading="lazy" style={{ objectFit: project.fit ?? "cover" }} /></div>
          <span className="mono-label">{language === "en" ? "Focus" : "創作方向"} / {project.type[language]}</span>
          <h3>{project.title}<ArrowUpRight aria-hidden="true" /></h3>
          <p>{featuredSummaries[id]?.[language] ?? project.detail[language]}</p>
        </Link>;
      })}
    </div>
  </section>;
}
