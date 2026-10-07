"use client";
import { ArrowUpRight } from "lucide-react";
import { useSiteLanguage } from "../site-language";
import { workStories } from "./work-stories";
const copy = {
  en: { title: "About this work", software: "Software used" }, zh: { title: "作品簡介", software: "使用軟體" },
  ja: { title: "この作品について", software: "使用ソフト" }, ko: { title: "작품 소개", software: "사용 소프트웨어" },
  ru: { title: "Об этой работе", software: "Использованные программы" }, vi: { title: "Về tác phẩm", software: "Phần mềm sử dụng" },
};
export function WorkProjectLink({ id }: { id: string }) {
  const { locale } = useSiteLanguage(), link = workStories[id]?.externalLink;
  if (!link) return null;
  return <a className="text-link work-project-link" href={link.href} target="_blank" rel="noreferrer">{link.label[locale]}<ArrowUpRight aria-hidden="true"/></a>;
}
export function WorkStory({ id }: { id: string }) {
  const { locale } = useSiteLanguage(), story = workStories[id];
  if (!story) return null;
  const t = copy[locale], text = story.text[locale];
  return <section className="section-block item-story" aria-labelledby="work-story-title">
    <div className="item-story-heading"><p className="mono-label">SY / {t.title}</p><h2 id="work-story-title">{t.title}</h2><div className="item-story-software"><p className="mono-label">{t.software}</p><ul>{story.software.map(name=><li key={name}>{name}</li>)}</ul></div></div>
    <div className="item-story-body">{text.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}{text.credit&&<p className="item-story-credit">{text.credit.before}<a href="https://www.youtube.com/@drgz3D" target="_blank" rel="noreferrer">Drgz<ArrowUpRight aria-hidden="true"/></a>{text.credit.after}</p>}</div>
  </section>;
}
