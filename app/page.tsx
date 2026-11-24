"use client";
import { Localized } from "./localized";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Clapperboard, Copy, Workflow } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SiteHeader } from "./header-controls";
import { useSiteLanguage, type Locale } from "./site-language";
import { localizeText } from "./localization";
import { SiteStatus } from "./site-status";
import { ForNever } from "./for-never";
import { SpringLogo } from "./spring-logo";
import { HomeReel } from "./home-reel";
import "./home.css";

const copy = {
  en: {
    contact: "Contact",
    heroEyebrow: "VISUAL ARTIST & EDITOR // TAIWAN",
    heroStatement: "I make images move, and sometimes stay still.",
    intro: "I work across editing, motion, drawing, graphic design and 3D. If an idea calls for a different medium, I’m happy to try it.",
    exploreWorks: "Explore Works",
    reelLabel: "Showreel",
    workArchive: "ARCHIVE",
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
    heroEyebrow: "視覺藝術家與剪輯師 // 台灣",
    heroStatement: "讓畫面動起來，有時也讓它安靜停格。",
    intro: "創作橫跨剪輯、動態設計、繪畫、平面與 3D。只要點子需要不同的媒材呈現，我都樂於嘗試。",
    exploreWorks: "探索作品",
    reelLabel: "作品精華",
    workArchive: "總覽",
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
    year: { en: "LATE 2026", zh: "2026 年底" },
    href: null,
    phase: { en: "Milestone", zh: "里程碑" },
    title: {
      en: "Cumulative earnings from editing projects handled by me officially exceeded $10,000 USD",
      zh: "經手剪輯專案累積收入正式超過 1 萬美元",
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
  const middle = statement.slice(first + move.length, last);
  const lineBreak = locale === "zh" ? middle.indexOf("，") + 1 : 0;
  return <h1 id="hero-title" className="editorial-statement" lang={locale === "zh" ? "zh-Hant" : undefined} data-localize="off">
    {statement.slice(0, first)}<strong>{move}</strong>
    {middle.slice(0, lineBreak)}{lineBreak > 0 && <br />}{middle.slice(lineBreak)}
    <em>{still}</em>{statement.slice(last + still.length)}
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
  const timelineRef = useRef<HTMLOListElement>(null);
  const t = copy[language];
  const chinese = language === "zh";

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  useEffect(() => {
    const timeline = timelineRef.current;
    const lastRow = timeline?.lastElementChild;
    if (!timeline || !lastRow || !("ResizeObserver" in window && "IntersectionObserver" in window)) return;

    const syncEnd = () => timeline.style.setProperty("--timeline-last-height", `${lastRow.getBoundingClientRect().height}px`);
    syncEnd();
    const resize = new ResizeObserver(syncEnd);
    resize.observe(lastRow, { box: "border-box" });
    const viewport = new IntersectionObserver(([entry]) =>
      timeline.classList.toggle("is-timeline-visible", entry.isIntersecting));
    viewport.observe(timeline);
    return () => {
      resize.disconnect();
      viewport.disconnect();
      timeline.classList.remove("is-timeline-visible");
      timeline.style.removeProperty("--timeline-last-height");
    };
  }, []);

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
        <p className="editorial-hero-overline mono-label">{t.heroEyebrow}</p>
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
        <div className="editorial-bento" data-reveal>
          <Link href="/work/" className="editorial-work-card" aria-labelledby="work-title">
            <div className="editorial-work-meta">
              <span className="editorial-work-showreel"><span data-reveal-text>{t.reelLabel}</span></span>
              <span className="editorial-work-archive"><span data-reveal-text>{t.workArchive}</span><ArrowUpRight aria-hidden="true" /></span>
            </div>
            <div className="editorial-work-film" aria-hidden="true"><HomeReel /></div>
            <div className="editorial-work-footer">
              <h2 id="work-title"><span data-reveal-text>{t.exploreWorks}</span></h2>
              <ArrowRight aria-hidden="true" />
            </div>
          </Link>
          <div className="editorial-bento-side">
            <div className="editorial-reels">
              <h3><span data-reveal-text>{t.showreelTitle}</span></h3>
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
                <h3><span data-reveal-text>{chinese ? "資源區 // LAB" : "Resources // LAB"}</span></h3>
                <p>{chinese ? "免費專案檔與開發工具" : "Free project files and tools"}</p>
              </div>
              <div className="editorial-resources-visual" aria-hidden="true">
                <div className="editorial-resources-stack">
                  <span className="editorial-resource-frame editorial-resource-frame-files"><Clapperboard /></span>
                  <span className="editorial-resource-frame editorial-resource-frame-lab"><Workflow /></span>
                </div>
                <span className="editorial-resources-arrow"><ArrowUpRight /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section id="profile" className="editorial-band editorial-profile" aria-labelledby="profile-title">
        <SectionIndex label="SECTION 02 // PROFILE" locale={locale} />
        <div className="editorial-profile-intro" data-reveal>
          <h2 id="profile-title"><span data-reveal-text>{t.profileTitle}</span></h2>
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
            <h3><span data-reveal-text>{t.brandTitle}</span></h3>
            <dl>
              <div><dt className="editorial-brand-spring" lang="en" data-localize="off"><span>SPRING</span></dt><dd>{t.springMeaning}</dd></div>
              <div><dt className="editorial-brand-yearn" lang="en" data-localize="off"><span>YEARN</span></dt><dd>{t.yearnMeaning}</dd></div>
            </dl>
            <p>{t.brandClosing}</p>
          </div>
        </div>

        <div className="editorial-practice" data-reveal>
          <section aria-labelledby="capabilities-title">
            <h3 id="capabilities-title"><span data-reveal-text>{t.services}</span></h3>
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
            <h3 id="software-title"><span data-reveal-text>{chinese ? "使用軟體 / 工具" : "Software / Toolkit"}</span></h3>
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
        <div className="editorial-history-heading" data-reveal>
          <h2 id="history-title"><span data-reveal-text>2020—NOW</span></h2>
          <p>{chinese
            ? "持續進行動態影像、繪畫、平面設計、合成與 3D 的自主創作。"
            : "A self-directed practice across moving image, drawing, graphic design, compositing and 3D."}</p>
        </div>
        <ol className="editorial-timeline" ref={timelineRef}>
          {practiceHistory.map(item => (
            <li className="editorial-timeline-row" key={item.title.en}
              data-linked={item.href ? "" : undefined} data-official={item.phase.en === "Official project" ? "" : undefined}>
              <div className="editorial-event" data-reveal>
                <div className="editorial-time">
                  <strong data-reveal-text>{item.year[language]}</strong>
                </div>
                <div className="editorial-event-meta mono-label">
                  <span className="editorial-phase">{item.phase[language]}</span>
                  {item.partner && <span>{item.partner[language]}</span>}
                </div>
                <h3>
                  {item.href ? (
                    <a className="editorial-timeline-link" href={item.href} target="_blank" rel="noreferrer">
                      <span data-reveal-text>{item.title[language]}</span>
                      <span className="editorial-timeline-arrow" aria-hidden="true"><ArrowUpRight /></span>
                    </a>
                  ) : <span data-reveal-text>{item.title[language]}</span>}
                </h3>
                {item.body && <p>{item.body[language]}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="contact" className="editorial-band editorial-contact" aria-labelledby="contact-title">
        <SectionIndex label="SECTION 04 // CONTACT" locale={locale} />
        <div className="editorial-contact-info" data-reveal>
          <div>
            <h2 id="contact-title"><span data-reveal-text>{t.contactTitle}</span></h2>
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
        <ul className="editorial-socials" data-reveal>
          {socialLinks.map(social => (
            <li key={social.href}>
              <a href={social.href} target="_blank" rel="noreferrer">
                <span className="mono-label">{social.label}</span>
                <strong><span data-reveal-text>{social.handle}</span></strong>
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
