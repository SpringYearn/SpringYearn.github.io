"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Localized } from "../localized";
import { projects, projectTitle } from "../portfolio-data";
import { useSiteLanguage } from "../site-language";
import { featuredWorkIds, featuredSummaries } from "./featured-data";

export function FeaturedWork() {
  const { language, locale } = useSiteLanguage();
  const heading = language === "en" ? "Selected works" : "精選作品";
  const action = language === "en" ? "View details" : "查看詳情";

  return <Localized>
    <section className="section-block featured-work" aria-labelledby="featured-work-title">
      <h2 className="featured-work-heading mono-label" id="featured-work-title">{heading}</h2>
      <div className="featured-work-grid">
        {featuredWorkIds.map(id => {
          const project = projects.find(item => item.id === id)!;
          return (
            <Link className="featured-work-card" href={`/work/${id}/`} key={id} data-reveal
              aria-labelledby={`featured-title-${id} featured-action-${id}`}>
              <div className="featured-work-art">
                <img src={project.thumbnail} alt="" loading="lazy" width={1280} height={720}
                  style={{ objectFit: project.fit ?? "cover" }} />
                <span className="featured-work-corner" aria-hidden="true"><ArrowUpRight /></span>
              </div>
              <div className="featured-card-heading">
                <h3 id={`featured-title-${id}`} data-localize="off">{projectTitle(project, locale)}</h3>
                <span id={`featured-action-${id}`}>{action}<ArrowRight aria-hidden="true" /></span>
              </div>
              <p>{featuredSummaries[id]?.[locale] ?? featuredSummaries[id]?.[language] ?? project.detail[language]}</p>
            </Link>
          );
        })}
      </div>
    </section>
  </Localized>;
}
