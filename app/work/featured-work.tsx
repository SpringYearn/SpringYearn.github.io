"use client";
import { Localized } from "../localized";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { projects } from "../portfolio-data";
import { useSiteLanguage } from "../site-language";
import { CardVines } from "../card-vines";
import { SpringMark } from "../spring-mark";
import { featuredWorkIds, featuredSummaries } from "./featured-data";

export function FeaturedWork() {
  const { language, locale } = useSiteLanguage();
  const grid = useRef<HTMLDivElement>(null);
  return <Localized>{<>
    <CardVines grid={grid} selector=".featured-work-card" className="featured-vine-field" restGrowth={.62} />
    <section className="section-block featured-work" aria-labelledby="featured-work-title">
    <div className="featured-work-heading">
      <h2 id="featured-work-title">{language === "en" ? "Selected works" : "精選作品"}</h2>
      <SpringMark className="featured-work-sprig" />
    </div>
    <div className="featured-work-grid" ref={grid}>
      {featuredWorkIds.map(id => {
        const project = projects.find(item => item.id === id)!;
        return <Link className="featured-work-card" href={`/work/${id}/`} key={id}
          data-vine-tone={id === "01" ? "cool" : undefined} aria-labelledby={`featured-title-${id} featured-action-${id}`}>
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
    </section>
  </>}</Localized>;
}
