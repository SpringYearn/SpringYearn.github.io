"use client";
import { Localized } from "../localized";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { projects } from "../portfolio-data";
import { useSiteLanguage } from "../site-language";
import { CardVines } from "../card-vines";
import { SpringMark } from "../spring-mark";
import { featuredWorkIds, featuredSummaries } from "./featured-data";

const motes = [
  { x: 14, y: 0, dx: -12, dy: -37, seconds: 7.2, delay: -4.2, size: 2 },
  { x: 34, y: 0, dx: 12, dy: -48, seconds: 9.4, delay: -2.1, size: 2.5 },
  { x: 69, y: 0, dx: -18, dy: -42, seconds: 8.1, delay: -5.9, size: 1.5 },
  { x: 84, y: 0, dx: 22, dy: -35, seconds: 10.3, delay: -3.6, size: 2 },
  { x: 0, y: 23, dx: -25, dy: -33, seconds: 8.4, delay: -6.6, size: 1.5 },
  { x: 100, y: 32, dx: 23, dy: -43, seconds: 7.8, delay: -3.1, size: 2.5 },
  { x: 0, y: 70, dx: -22, dy: -31, seconds: 9.1, delay: -1.2, size: 2 },
  { x: 100, y: 77, dx: 26, dy: -36, seconds: 10.1, delay: -7.8, size: 1.5 },
];

function FeaturedArt({ src, fit, cool }: { src: string; fit: CSSProperties["objectFit"]; cool: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  return <div className="featured-work-art" ref={frame} data-vine-tone={cool ? "cool" : undefined}>
    <span className="featured-art-glow" aria-hidden="true" data-swarm-ignore />
    <span className="featured-art-motes" aria-hidden="true" data-swarm-ignore>
      {motes.map(({ x, y, dx, dy, seconds, delay, size }, index) => <i key={index} style={{
        left: `${x}%`, top: `${y}%`, width: size, height: size,
        "--mote-x": `${dx}px`, "--mote-y": `${dy}px`, animationDuration: `${seconds}s`, animationDelay: `${delay}s`,
      } as CSSProperties} />)}
    </span>
    <CardVines grid={frame} selector=".featured-work-art" className="featured-vine-field" />
    <div className="featured-work-frame">
      <img src={src} alt="" loading="lazy" width={1280} height={720} style={{ objectFit: fit }} />
    </div>
  </div>;
}

export function FeaturedWork() {
  const { language, locale } = useSiteLanguage();
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frames = grid.current?.querySelectorAll<HTMLElement>(".featured-work-art");
    if (!frames?.length) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) (entry.target as HTMLElement).dataset.artVisible = String(entry.isIntersecting);
    }, { rootMargin: "40px 0px" });
    frames.forEach(frame => observer.observe(frame));
    return () => observer.disconnect();
  }, []);

  return <Localized>{
    <section className="section-block featured-work" aria-labelledby="featured-work-title">
    <div className="featured-work-heading">
      <h2 id="featured-work-title">{language === "en" ? "Selected works" : "精選作品"}</h2>
      <SpringMark className="featured-work-sprig" />
    </div>
    <div className="featured-work-grid" ref={grid}>
      {featuredWorkIds.map(id => {
        const project = projects.find(item => item.id === id)!;
        return <Link className="featured-work-card" href={`/work/${id}/`} key={id}
          aria-labelledby={`featured-title-${id} featured-action-${id}`}>
          <FeaturedArt src={project.thumbnail} fit={project.fit ?? "cover"} cool={id === "01"} />
          <div className="featured-card-heading">
            <h3 id={`featured-title-${id}`} data-localize="off">{project.title}</h3>
            <span id={`featured-action-${id}`}>{language === "en" ? "View details" : "查看詳情"}<ArrowRight aria-hidden="true" /></span>
          </div>
          <p>{featuredSummaries[id]?.[locale] ?? featuredSummaries[id]?.[language] ?? project.detail[language]}</p>
        </Link>;
      })}
    </div>
    </section>
  }</Localized>;
}
