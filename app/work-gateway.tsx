"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Localized } from "./localized";
import { projects } from "./portfolio-data";
import { useSiteLanguage } from "./site-language";
import { featuredWorkIds } from "./work/featured-data";

const selections = featuredWorkIds.map(id => projects.find(project => project.id === id)!);

export function WorkGateway() {
  const { language } = useSiteLanguage();
  return <Localized>
    <Link href="/work/" className="work-gateway-link editorial-work-card"
      aria-labelledby="work-gateway-title work-gateway-action">
      <div className="editorial-work-heading">
        <h2 id="work-gateway-title">{language === "zh" ? "精選作品" : "Selected works"}</h2>
        <span id="work-gateway-action">{language === "zh" ? "瀏覽作品集" : "Browse the work"}<ArrowRight aria-hidden="true" /></span>
      </div>
      <div className="editorial-work-covers">
        {selections.map(project => (
          <figure key={project.id}>
            <span><img src={project.thumbnail} alt="" loading="lazy" width="1280" height="720" /></span>
            <figcaption data-localize="off">{project.title}</figcaption>
          </figure>
        ))}
      </div>
    </Link>
  </Localized>;
}
