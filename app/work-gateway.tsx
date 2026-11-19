"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Localized } from "./localized";
import { projects } from "./portfolio-data";
import { useSiteLanguage, type Locale } from "./site-language";
import { featuredWorkIds } from "./work/featured-data";
import { CardVines } from "./card-vines";
import { SpringMark } from "./spring-mark";
import { BUILD_AWAITING_ATTRIBUTE, ENTRANCE_ATTRIBUTE } from "./swarm/availability";
import { WorkGatewayAtmosphere } from "./work-gateway-atmosphere";

const titles: Record<Locale, string> = {
  en: "WORKS", zh: "作品", ja: "作品", ko: "작품", ru: "Работы", vi: "Tác phẩm",
};
const stills = featuredWorkIds.map(id => projects.find(project => project.id === id)!.thumbnail);

export function WorkGateway() {
  const { language, locale } = useSiteLanguage();
  const link = useRef<HTMLAnchorElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const button = link.current;
    const home = button?.closest("main");
    const section = button?.closest("section");
    if (!button || !home || !section) return;
    const html = document.documentElement;
    const overlay = document.querySelector<HTMLElement>(".swarm-root");
    let visible = false;
    const update = () => {
      const phase = overlay?.dataset.swarmPhase;
      // "waiting" means the visible construction is finished and offscreen jobs are queued.
      const built = phase !== "building" && phase !== "paused"
        && !home.hasAttribute(BUILD_AWAITING_ATTRIBUTE) && !html.hasAttribute(ENTRANCE_ATTRIBUTE)
        && !button.closest("[data-swarm-pending],[inert]") && !button.querySelector("[data-swarm-pending]");
      setReady(built);
      setPlaying(built && visible && !document.hidden);
    };
    const construction = new MutationObserver(update);
    construction.observe(html, { attributes: true, attributeFilter: [ENTRANCE_ATTRIBUTE] });
    construction.observe(home, { attributes: true, attributeFilter: [BUILD_AWAITING_ATTRIBUTE, "inert"] });
    construction.observe(section, { subtree: true, attributes: true, attributeFilter: ["data-swarm-pending"] });
    if (overlay) construction.observe(overlay, { attributes: true, attributeFilter: ["data-swarm-phase"] });
    const viewport = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: .02 });
    viewport.observe(button);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      construction.disconnect();
      viewport.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return <Localized>{<div className="work-gateway-main" data-reveal
    data-gateway-ready={ready ? "" : undefined} data-gateway-playing={playing ? "" : undefined}>
    <WorkGatewayAtmosphere playing={playing} />
    <CardVines grid={link} selector=".work-gateway-link" className="work-gateway-vine-field" hoverOnly enabled={ready} />
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
