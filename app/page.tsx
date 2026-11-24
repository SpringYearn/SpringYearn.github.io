"use client";
import { Localized } from "./localized";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Copy } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SiteHeader } from "./header-controls";
import { useSiteLanguage, type Locale } from "./site-language";
import { localizeText } from "./localization";
import { SiteStatus } from "./site-status";
import { ForNever } from "./for-never";
import { SpringLogo } from "./spring-logo";
import { projects, projectTitle } from "./portfolio-data";
import { featuredWorkIds } from "./work/featured-data";
import "./home.css";

const copy = {
  en: {
    contact: "Contact",
    heroRole: "Visual Artist / Editor",
    heroStatement: "I make images move, and sometimes stay still.",
    intro: "I work across editing, motion, drawing, graphic design and 3D. If an idea calls for a different medium, I’m happy to try it.",
    heroOrigin: "Independent creative / Taiwan",
    exploreWorks: "Explore Works",
    selectedWorks: "SELECTED WORKS",
    allWorks: "ALL WORKS",
    showreelTitle: "A year of edits",
    showreelView: "Watch showreel",
    profileTitle: "Hi, I’m\nSpringYearn.",
    profileBody:
      "I’m a visual artist, designer and editor based in Taiwan, currently studying Visual Communication & Animation Design. I work with video, drawing, graphic design, compositing and 3D.",
    profileBody2:
      "Editing is at the center of what I do. Trying other media gives me more ways to test an idea and see what works.",
    brandTitle: "Why SpringYearn?",
    springMeaning:
      "Spring is about fresh starts, hope, and the energy to try again.",
    yearnMeaning:
      "Yearn is the urge to learn something new and make the next thing a little better.",
    brandClosing: "Put them together: stay curious, keep learning, keep making.",
    services: "What I do",
    contactTitle: "Contact me",
    contactBody:
      "Tell me about your project, share an idea, or debate whether a hotdog is a sandwich. I’m happy to chat.",
    email: "bbal96421@gmail.com",
    emailGmail: "Gmail compose",
    emailApp: "Mail app",
    emailCopy: "Copy address",
    emailCopied: "COPIED TO CLIPBOARD",
    emailFailed: "Could not copy the address",
    socials: "Find me elsewhere",
    footer: "SpringYearn® — Visual Artist / Designer / Editor",
    legacyNote: "Legacy site / no longer updated",
    legacyEnter: "Open previous website",
    backTop: "Back to top",
  },
  zh: {
    contact: "聯絡",
    heroRole: "視覺藝術家 / 剪輯師",
    heroStatement: "讓畫面動起來，有時也讓它安靜停格。",
    intro: "創作橫跨剪輯、動態設計、繪畫、平面與 3D。只要點子需要不同的媒材呈現，我都樂於嘗試。",
    heroOrigin: "獨立創作者 / 台灣",
    exploreWorks: "探索作品",
    selectedWorks: "精選作品",
    allWorks: "所有作品",
    showreelTitle: "這一年剪了什麼",
    showreelView: "觀看 Showreel",
    profileTitle: "嗨，我是\nSpringYearn。",
    profileBody:
      "我是來自台灣的視覺藝術家、設計師與剪輯師，目前主修視覺傳達與動畫設計，創作涵蓋動態影像、特效合成、3D、插畫與平面設計。",
    profileBody2:
      "剪輯是我的創作核心；而跨足其他媒材，讓我能從不同維度實驗想法，找出最適合的表現形式。",
    brandTitle: "SpringYearn 是什麼意思？",
    springMeaning: "象徵春天與新的開始，帶著希望與再次嘗試的動力。",
    yearnMeaning: "代表對新知與未知作品的渴望，期許每一次創作都能更進一步。",
    brandClosing: "合在一起，就是保持好奇、繼續學、繼續做。",
    services: "我會做的事",
    contactTitle: "聯絡我",
    contactBody: "有專案想聊、點子想分享，或想討論鳳梨到底該不該放在披薩上，都歡迎寫信給我。",
    email: "bbal96421@gmail.com",
    emailGmail: "使用 Gmail 寄信",
    emailApp: "裝置郵件程式",
    emailCopy: "複製信箱地址",
    emailCopied: "已複製到剪貼簿",
    emailFailed: "無法複製信箱地址",
    socials: "其他地方也找得到我",
    footer: "SpringYearn® — 視覺藝術家 / 設計師 / 剪輯師",
    legacyNote: "舊網站 / 已停止更新",
    legacyEnter: "進入舊版本網站",
    backTop: "回到頂端",
  },
};

const capabilities = [
  "Editorial & GMV",
  "Motion Design",
  "Kinetic Typography",
  "Compositing / Fusion",
  "3D / Blender",
  "Drawing / Illustration",
  "Graphic Design",
  "Web & Visual Systems",
  "Color & Finishing",
];

const toolkits = [
  { label: "Editing & Motion", tools: [
    { id: "resolve", name: "DaVinci Resolve" },
    { id: "aftereffects", name: "After Effects" },
    { id: "capcut", name: "CapCut" },
    { id: "powerdirector", name: "PowerDirector" },
  ] },
  { label: "3D & Compositing", tools: [
    { id: "blender", name: "Blender" },
    { id: "maya", name: "Maya" },
    { id: "fusion", name: "Fusion" },
  ] },
  { label: "Design & Drawing", tools: [
    { id: "photoshop", name: "Photoshop" },
    { id: "illustrator", name: "Illustrator" },
    { id: "figma", name: "Figma" },
    { id: "medibang", name: "MediBang Paint Pro" },
    { id: "procreate", name: "Procreate" },
  ] },
];

const practiceHistory = [
  {
    year: { en: "2020", zh: "2020" },
    href: null,
    phase: { en: "Foundation", zh: "起點" },
    partner: { en: "Independent practice", zh: "個人創作" },
    title: { en: "Independent beginnings", zh: "開始獨立創作" },
    body: {
      en: "Began learning editing independently and publishing personal visual work.",
      zh: "開始自學剪輯，並持續發表個人影像創作。",
    },
  },
  {
    year: { en: "2023", zh: "2023" },
    href: "https://youtu.be/ByVA3G0X1IU?si=8x4yM1sRhwDJtD0b",
    phase: { en: "Personal project", zh: "個人專案" },
    partner: { en: "Project / Yelodog", zh: "專案 / 黃狗" },
    title: { en: "A fictional trailer takes shape", zh: "完成首支概念預告片" },
    body: {
      en: "Created a fictional trailer through Blender and DaVinci Resolve.",
      zh: "以 Blender 與 DaVinci Resolve 完成一支虛構預告片。",
    },
  },
  {
    year: { en: "2024", zh: "2024" },
    href: "https://youtube.com/@dfh-r6869?si=Ck2eNc0wMIyhQmBU",
    phase: { en: "Collaboration", zh: "合作專案" },
    partner: { en: "With / 江爸", zh: "合作 / 江爸" },
    title: { en: "Editing & thumbnail design", zh: "剪輯與縮圖設計" },
    body: {
      en: "Edited and designed thumbnails across 14 published videos.",
      zh: "參與 14 支影片的剪輯與縮圖設計。",
    },
  },
  {
    year: { en: "2025", zh: "2025" },
    href: null,
    phase: { en: "Milestone", zh: "里程碑" },
    partner: { en: "FlowinColor / ATLAS", zh: "FlowinColor / ATLAS" },
    title: { en: "Community memberships", zh: "成為社群成員" },
    body: {
      en: "Joined FlowinColor and became an ATLAS T2 member.",
      zh: "成為 FlowinColor 成員和 ATLAS T2 成員。",
    },
  },
  {
    year: { en: "2025—2026", zh: "2025—2026" },
    href: null,
    phase: { en: "Milestone", zh: "里程碑" },
    partner: { en: "YouTube / TikTok / Bilibili", zh: "YouTube / TikTok / Bilibili" },
    title: { en: "1,000+ followers", zh: "粉絲突破 1,000" },
    body: {
      en: "2025.08.10 — YouTube\n2026.02.11 — TikTok\n2026.04.17 — Bilibili",
      zh: "2025.08.10 — YouTube\n2026.02.11 — TikTok\n2026.04.17 — Bilibili",
    },
  },
  {
    year: { en: "2026", zh: "2026" },
    href: "https://x.com/ValorantEsports/status/2102684410382287046?s=20",
    phase: { en: "Official project", zh: "官方專案" },
    partner: { en: "Riot Games × Rosewood Creative", zh: "Riot Games × Rosewood Creative" },
    title: { en: "VALORANT Esports / Creator Editor", zh: "VALORANT Esports / Creator Editor" },
    body: {
      en: "Created an official VALORANT Esports video as a Creator Editor through Rosewood Creative.",
      zh: "透過 Rosewood Creative 參與 Riot Games 官方 VALORANT Esports 影像製作，擔任 Creator Editor。",
    },
  },
  {
    year: { en: "ONGOING", zh: "持續" },
    href: null,
    phase: { en: "Current practice", zh: "現在" },
    partner: { en: "Various collaborators", zh: "不定期合作對象" },
    title: { en: "Independent commissions", zh: "獨立接案與委託創作" },
    body: {
      en: "Additional independent projects across editing and visual design.",
      zh: "持續承接剪輯與視覺設計相關的獨立專案。",
    },
  },
];

const socialLinks = [
  {
    label: "YouTube",
    handle: "@SpringYearn",
    href: "https://youtube.com/@springyearn.?si=HL-AY8T7GCGKagFG",
  },
  {
    label: "Instagram",
    handle: "@linyo._0421",
    href: "https://www.instagram.com/linyo._0421?igsh=MTFha3RleGYwZTY0Zw==",
  },
  { label: "X", handle: "@SpringYearn", href: "https://x.com/SpringYearn" },
  {
    label: "TikTok",
    handle: "@springyearn",
    href: "https://www.tiktok.com/@springyearn?is_from_webapp=1&sender_device=pc",
  },
  { label: "Bilibili", handle: "SpringYearn", href: "https://space.bilibili.com/1302495143" },
  { label: "Douyin", handle: "SpringYearn", href: "https://v.douyin.com/qTySM3kJ0LA/" },
  { label: "Discord", handle: "Discord profile", href: "https://discord.com/users/696278366663213106" },
  { label: "Discord", handle: "Server", href: "https://discord.gg/Y4MQSsEBGN" },
];

const annualReels = [
  {
    year: "2025",
    href: "https://youtu.be/nC9t-suMW7Y?si=yDNmrzpVW0p3dn1x",
    thumbnail: "https://i.ytimg.com/vi/nC9t-suMW7Y/hqdefault.jpg",
  },
  {
    year: "2024",
    href: "https://youtu.be/B97PZErKCOQ?si=Nin7dyxTOY2-jSlJ",
    thumbnail: "https://i.ytimg.com/vi/B97PZErKCOQ/hqdefault.jpg",
  },
];

const selectedWorks = featuredWorkIds.map(id => projects.find(project => project.id === id)!);

const emphasis: Record<Locale, [string, string]> = {
  en: ["move", "still."],
  zh: ["動起來", "安靜停格。"],
  ja: ["動かします", "静かな一枚"],
  ko: ["움직이게", "남기기도 합니다."],
  ru: ["двигаться", "неподвижными."],
  vi: ["chuyển động", "đứng yên."],
};

function HeroStatement({ text, locale }: { text: string; locale: Locale }) {
  const statement = localizeText(text, locale);
  const [move, still] = emphasis[locale];
  const first = statement.indexOf(move);
  const last = statement.lastIndexOf(still);
  if (first < 0 || last < first + move.length) {
    return <h1 id="hero-title" className="editorial-statement" data-localize="off">{statement}</h1>;
  }
  return <h1 id="hero-title" className="editorial-statement" data-localize="off">
    {statement.slice(0, first)}<strong>{move}</strong>
    {statement.slice(first + move.length, last)}<em>{still}</em>{statement.slice(last + still.length)}
  </h1>;
}

function SectionIndex({ label, locale }: { label: string; locale: Locale }) {
  const [section, name] = localizeText(label, locale).split(" // ");
  return <div className="editorial-index mono-label" data-localize="off">
    <span>{section}</span>{" "}<span aria-hidden="true">//</span>{" "}<span>{name}</span>
  </div>;
}

export default function Home() {
  const { language, locale } = useSiteLanguage();
  const [copyResult, setCopyResult] = useState<"success" | "failed" | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t = copy[language];
  const chinese = language === "zh";

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const copyEmailAddress = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(t.email);
      copied = true;
    } catch {
      const active = document.activeElement;
      const field = document.createElement("textarea");
      field.value = t.email;
      field.readOnly = true;
      field.style.cssText = "position: fixed; top: 0; left: 0; opacity: 0;";
      document.body.append(field);
      field.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      } finally {
        field.remove();
        if (active instanceof HTMLElement) active.focus({ preventScroll: true });
      }
    }
    clearTimeout(copyTimer.current);
    setCopyResult(copied ? "success" : "failed");
    copyTimer.current = setTimeout(() => setCopyResult(null), 2200);
  };

  return <Localized>
    <main id="top" className="site-shell home-page">
      <SiteHeader />

      <section className="editorial-hero" aria-labelledby="hero-title">
        <div className="editorial-hero-overline mono-label">
          <span className="editorial-byline" lang="en" data-localize="off">SPRINGYEARN</span>
          <span className="editorial-hero-role">
            <span>{t.heroOrigin}</span>
            <span aria-hidden="true"> · </span>
            <span>{t.heroRole}</span>
          </span>
        </div>
        <HeroStatement text={t.heroStatement} locale={locale} />
        <div className="editorial-hero-story">
          <p>{t.intro}</p>
          <div className="editorial-hero-actions">
            <a href="#work" className="editorial-cta editorial-cta-primary">{t.exploreWorks}<ArrowDown aria-hidden="true" /></a>
            <a href="#contact" className="editorial-cta editorial-cta-secondary">{t.contact}<ArrowUpRight aria-hidden="true" /></a>
          </div>
        </div>
        <dl className="editorial-facts">
          <div>
            <dt>{chinese ? "創作跨度" : "Creative practice"}</dt>
            <dd>2020—NOW</dd>
          </div>
          <div>
            <dt>{chinese ? "核心媒介" : "Primary medium"}</dt>
            <dd>{chinese ? "剪輯 / 動態設計" : "Editing / Motion"}</dd>
          </div>
        </dl>
      </section>

      <section id="work" className="editorial-band editorial-works" aria-labelledby="work-title" tabIndex={-1}>
        <SectionIndex label="SECTION 01 // WORKS" locale={locale} />
        <div className="editorial-bento">
          <div className="editorial-showcase" data-reveal>
            <div className="editorial-showcase-heading">
              <h2 id="work-title">{t.selectedWorks}</h2>
              <Link href="/work/" className="editorial-all-works">{t.allWorks}<ArrowUpRight aria-hidden="true" /></Link>
            </div>
            <div className="editorial-work-grid">
              {selectedWorks.map(project => (
                <Link key={project.id} href={`/work/${project.id}/`} className="editorial-work-tile"
                  aria-labelledby={`home-work-title-${project.id}`}>
                  <span className="editorial-work-media" aria-hidden="true">
                    <img src={project.thumbnail} alt="" width="1280" height="720" loading="lazy" decoding="async" />
                  </span>
                  <span className="editorial-work-caption">
                    <span className="editorial-work-type">{project.type[language]}</span>
                    <span id={`home-work-title-${project.id}`} className="editorial-work-name" data-localize="off">{projectTitle(project, locale)}</span>
                  </span>
                  <ArrowUpRight className="editorial-work-arrow" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
          <div className="editorial-bento-side" data-reveal>
            <div className="editorial-reels">
              <h3>{t.showreelTitle}</h3>
              <div className="editorial-reel-links">
                {annualReels.map(reel => (
                  <a href={reel.href} target="_blank" rel="noreferrer"
                    aria-label={reel.year + " — " + t.showreelView} key={reel.year}>
                    <span className="editorial-reel-cover">
                      <img src={reel.thumbnail} alt="" loading="lazy" width="480" height="360" />
                    </span>
                    <span className="editorial-reel-year"><strong>{reel.year}</strong><ArrowUpRight aria-hidden="true" /></span>
                  </a>
                ))}
              </div>
            </div>
            <Link id="lab" href="/resources/" className="editorial-resources-card">
              <div>
                <h3>{chinese ? "資源區 // LAB" : "Resources // LAB"}</h3>
                <p>{chinese ? "免費專案檔與開發工具" : "Free project files and tools"}</p>
              </div>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="profile" className="editorial-band editorial-profile" aria-labelledby="profile-title">
        <SectionIndex label="SECTION 02 // PROFILE" locale={locale} />
        <div className="editorial-profile-intro" data-reveal>
          <h2 id="profile-title">{t.profileTitle}</h2>
          <div>
            <p>{t.profileBody}</p>
            <p>{t.profileBody2}</p>
          </div>
        </div>

        <div className="editorial-brand" data-reveal>
          <figure className="brand-logo-panel editorial-logo">
            <SpringLogo language={language} />
          </figure>
          <div className="editorial-brand-copy">
            <h3>{t.brandTitle}</h3>
            <dl>
              <div><dt lang="en">SPRING</dt><dd>{t.springMeaning}</dd></div>
              <div><dt lang="en">YEARN</dt><dd>{t.yearnMeaning}</dd></div>
            </dl>
            <p>{t.brandClosing}</p>
          </div>
        </div>

        <div className="editorial-practice" data-reveal>
          <section aria-labelledby="capabilities-title">
            <h3 id="capabilities-title">{t.services}</h3>
            <ol className="editorial-capabilities">
              {capabilities.map((item, index) => (
                <li key={item}>
                  <span className="mono-label">{String(index + 1).padStart(2, "0")}</span>
                  <span className="editorial-capability-name">{item}</span>
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="software-title">
            <h3 id="software-title">{chinese ? "使用軟體 / 工具" : "Software / Toolkit"}</h3>
            {toolkits.map(group => (
              <div className="editorial-tool-group" key={group.label}>
                <h4 className="mono-label">{group.label}</h4>
                <ul>
                  {group.tools.map(tool => (
                    <li key={tool.id}>
                      <img src={"/toolkit/" + tool.id + ".svg"} alt="" width="18" height="18" loading="lazy" />
                      <span data-localize="off">{tool.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
      </section>

      <section id="history" className="editorial-band editorial-history" aria-labelledby="history-title">
        <SectionIndex label="SECTION 03 // ALONG THE WAY" locale={locale} />
        <div className="editorial-history-heading">
          <h2 id="history-title">2020—NOW</h2>
          <p>{chinese
            ? "持續進行動態影像、繪畫、平面設計、合成與 3D 的自主創作。"
            : "A self-directed practice across moving image, drawing, graphic design, compositing and 3D."}</p>
        </div>
        <ol className="editorial-timeline">
          {practiceHistory.map((item, index) => (
            <li className="editorial-timeline-row" data-official={item.phase.en === "Official project" ? "" : undefined} key={item.title.en}>
              <div className="editorial-time">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span aria-hidden="true">/</span>
                <strong>{item.year[language]}</strong>
              </div>
              <span className="editorial-phase mono-label">{item.phase[language]}</span>
              <div className="editorial-event">
                <p className="mono-label editorial-partner">{item.partner[language]}</p>
                <h3>{item.href
                  ? <a href={item.href} target="_blank" rel="noreferrer">{item.title[language]} <ArrowUpRight aria-hidden="true" /></a>
                  : item.title[language]}</h3>
                <p>{item.body[language]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="contact" className="editorial-band editorial-contact" aria-labelledby="contact-title">
        <SectionIndex label="SECTION 04 // CONTACT" locale={locale} />
        <div className="editorial-contact-info" data-reveal>
          <div>
            <h2 id="contact-title">{t.contactTitle}</h2>
            <p>{t.contactBody}</p>
          </div>
          <div className="editorial-contact-actions">
            <button type="button" className="editorial-email" onClick={copyEmailAddress} aria-label={t.emailCopy + " — " + t.email}>
              <span>{t.email}</span><Copy aria-hidden="true" />
            </button>
            <div className="editorial-mail-links">
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=bbal96421%40gmail.com" target="_blank" rel="noreferrer">{t.emailGmail}<ArrowUpRight aria-hidden="true" /></a>
              <a href="mailto:bbal96421@gmail.com?subject=Hello%20SpringYearn">{t.emailApp}<ArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>
        </div>
        <h3 className="mono-label editorial-social-title">{t.socials}</h3>
        <ul className="editorial-socials">
          {socialLinks.map(social => (
            <li key={social.href}>
              <a href={social.href} target="_blank" rel="noreferrer">
                <span className="mono-label">{social.label}</span>
                <strong>{social.handle}</strong>
                <ArrowUpRight aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <div className={copyResult ? "editorial-toast is-visible" : "editorial-toast"} role="status">
          {copyResult === "success" ? t.emailCopied : copyResult === "failed" ? t.emailFailed : ""}
        </div>
      </section>

      <SiteStatus language={language} />
      <footer className="site-footer">
        <span>{t.footer}</span>
        <ForNever language={language} place="home" />
        <div className="legacy-index">
          <Popover>
            <PopoverTrigger className="legacy-index-trigger" aria-label={chinese ? "顯示舊網站入口" : "Reveal legacy site"}>
              SY / V.01
            </PopoverTrigger>
            <PopoverContent className="legacy-index-panel" side="top" align="end" sideOffset={10} collisionPadding={12}
              aria-label={t.legacyNote}>
              <span>{t.legacyNote}</span>
              <a href="https://springyearn.webflow.io/" target="_blank" rel="noreferrer">
                {t.legacyEnter}<ArrowUpRight aria-hidden="true" />
              </a>
            </PopoverContent>
          </Popover>
        </div>
        <a href="#top">{t.backTop}<ArrowUpRight aria-hidden="true" /></a>
      </footer>
    </main>
  </Localized>;
}
