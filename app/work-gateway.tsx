"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { Localized } from "./localized";
import { projects } from "./portfolio-data";
import { useSiteLanguage, type Locale } from "./site-language";
import { featuredWorkIds } from "./work/featured-data";
import { CardVines } from "./card-vines";
import { SpringMark } from "./spring-mark";

const titles: Record<Locale, string> = {
  en: "WORKS", zh: "作品", ja: "作品", ko: "작품", ru: "Работы", vi: "Tác phẩm",
};
const stills = featuredWorkIds.map(id => projects.find(project => project.id === id)!.thumbnail);

export function WorkGateway() {
  const { language, locale } = useSiteLanguage();
  const link = useRef<HTMLAnchorElement>(null);

  return <Localized>{<div className="work-gateway-main" data-reveal>
    <CardVines grid={link} selector=".work-gateway-link" className="work-gateway-vine-field" restGrowth={.55} />
    <Link href="/work/" className="work-gateway-link" ref={link}
      data-audio="work-gateway" aria-labelledby="work-gateway-title work-gateway-action">
      <div className="work-gateway-art" aria-hidden="true">
        {stills.map(still => <span key={still}><img src={still} alt="" loading="lazy" width={1280} height={720} /></span>)}
      </div>
      <SpringMark className="work-gateway-sprig" />
      <h2 id="work-gateway-title" data-localize="off">{titles[locale]}</h2>
      <span className="work-gateway-action" id="work-gateway-action">
        {language === "zh" ? "瀏覽作品集" : "Browse the work"}
        <span className="work-gateway-arrow"><ArrowUpRight aria-hidden="true" /></span>
      </span>
    </Link>
  </div>}</Localized>;
}
