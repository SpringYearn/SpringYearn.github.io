"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Localized } from "./localized";
import { projects, projectTitle } from "./portfolio-data";
import { useSiteLanguage } from "./site-language";
import { featuredWorkIds } from "./work/featured-data";

const selections = featuredWorkIds.map(id => projects.find(project => project.id === id)!);

export function WorkPreviews() {
  const { language, locale } = useSiteLanguage();
  return <Localized>
    <div className="editorial-work-card">
      <h2 id="work-preview-title" className="editorial-work-title">{language === "zh" ? "精選作品" : "Selected works"}</h2>
      <div className="editorial-work-covers">
        {selections.map(project => (
          <Link key={project.id} href={`/work/${project.id}/`} className="editorial-work-preview">
            <span className="editorial-work-preview-art">
              <img src={project.thumbnail} alt="" loading="lazy" width="1280" height="720" />
            </span>
            <span className="editorial-work-caption">
              <span data-localize="off">{projectTitle(project, locale)}</span>
              <ArrowRight aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </Localized>;
}
