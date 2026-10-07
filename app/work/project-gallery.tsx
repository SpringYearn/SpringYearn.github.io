"use client";
import { ArrowUpRight } from "lucide-react";
import { Localized } from "../localized";
import { useSiteLanguage } from "../site-language";
import type { Project } from "../portfolio-data";

export function ProjectGallery({ project }: { project: Project }) {
  const { language } = useSiteLanguage();
  if (!project.gallery?.length) return null;
  return <Localized>{<section className="section-block item-gallery" aria-labelledby="project-gallery-title">
    <div className="item-gallery-heading"><p className="mono-label">SY / {language==="en"?"Project details":"專案詳情"}</p><h2 id="project-gallery-title">{language==="en"?"Design details":"設計細節"}</h2></div>
    {project.gallery.map(image=><figure key={image.src}><a className="item-gallery-link" href={image.src} target="_blank" rel="noreferrer" aria-label={image.title[language]+" — "+(language==="en"?"Open full image":"開啟原圖")}><img src={image.src} alt={image.title[language]} loading="lazy"/><span className="item-preview-caption"><span>{image.title[language]}</span><span className="item-preview-newtab">{language==="en"?"Open full image":"開啟原圖"}<ArrowUpRight aria-hidden="true"/></span></span></a></figure>)}
  </section>}</Localized>;
}
