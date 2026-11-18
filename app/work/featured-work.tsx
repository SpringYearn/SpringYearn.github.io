"use client";
import { Localized } from "../localized";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projects } from "../portfolio-data";
import { useSiteLanguage } from "../site-language";
import { featuredWorkIds, featuredSummaries } from "./featured-data";

export function FeaturedWork() {
  const { language, locale } = useSiteLanguage();
  return <Localized>{<section className="section-block featured-work" aria-labelledby="featured-work-title">
    <h2 id="featured-work-title">{language === "en" ? "Selected works" : "精選作品"}</h2>
    <div className="featured-work-grid">
      {featuredWorkIds.map(id => {
        const project = projects.find(item => item.id === id)!;
        return <Link className="featured-work-card" href={`/work/${id}/`} key={id} aria-labelledby={`featured-title-${id} featured-action-${id}`}>
          <div className="featured-work-art">
            <img src={project.thumbnail} alt="" loading="lazy" width={1280} height={720} style={{ objectFit: project.fit ?? "cover" }} />
          </div>
          <div className="featured-card-heading">
            <h3 id={`featured-title-${id}`} data-localize="off">{project.title}</h3>
            <span id={`featured-action-${id}`}>{language === "en" ? "View details" : "查看詳情"}<ArrowRight aria-hidden="true" /></span>
          </div>
          <p>{featuredSummaries[id]?.[locale] ?? featuredSummaries[id]?.[language] ?? project.detail[language]}</p>
        </Link>;
      })}
    </div>
  </section>}</Localized>;
}
