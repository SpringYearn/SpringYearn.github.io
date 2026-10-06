"use client";
import { Localized } from "./localized";

import {
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HeaderControls } from "./header-controls";
import { useSiteLanguage } from "./site-language";
import { SiteStatus } from "./site-status";
import { ForNever } from "./for-never";
import { SpringLogo } from "./spring-logo";
import { SpringMark } from "./spring-mark";
import { BrandWord } from "./brand-word";
import { ProjectFilesGateway } from "./project-files-gateway";
import { labExperiments } from "./lab-data";

const copy = {
  en: {
    nav: { work: "Work archive", profile: "Profile", contact: "Contact" },
    available: "Independent visual creator",
    heroTop: "Visual Artist / Editor",
    heroBottom: "I make images move, and sometimes stay still.",
    intro:
      "I work across editing, motion, drawing, graphic design and 3D. If an idea calls for a different medium, I’m happy to try it.",
    explore: "Take a look at my work",
    index: "Independent creative / Taiwan",
    gatewayEyebrow: "01 / Work archive",
    gatewayTitle: "A little bit\nof everything.",
    gatewayBody:
      "Editing, motion, APP / UI, 3D, drawing and graphic design. Browse by category, or see what catches your eye.",
    gatewayMeta: "Selected work / more on the way",
    gatewayIndex: "Archive index",
    gatewayCta: "Browse the work",
    showreelEyebrow: "Yearly highlights",
    showreelTitle: "A year of edits",
    showreelView: "Watch showreel",
    profileEyebrow: "02 / Profile",
    profileTitle: "Hi, I’m\nSpringYearn.",
    profileBody:
      "I’m a visual artist, designer and editor based in Taiwan, currently studying Visual Communication & Animation Design. I work with video, drawing, graphic design, compositing and 3D.",
    profileBody2:
      "Editing is at the center of what I do. Trying other media gives me more ways to test an idea and see what works.",
    brandEyebrow: "Name / Philosophy",
    brandTitle: "Why SpringYearn?",
    springMeaning:
      "Spring is about fresh starts, hope, and the energy to try again.",
    yearnMeaning:
      "Yearn is the urge to learn something new and make the next thing a little better.",
    brandClosing: "Put them together: stay curious, keep learning, keep making.",
    services: "What I do",
    experience: "Along the way",
    labEyebrow: "LAB / Experiments",
    labTitle: "Small tools,\nideas to test.",
    labBody: "Tools and experiments I’ve built in DaVinci Resolve and Fusion. Some are usable builds; others are prototypes or research. Each starts with an idea worth trying.",
    labCount: `${String(labExperiments.length).padStart(2, "0")} development records / 2026`,
    labCta: "Take a look in LAB",
    contactEyebrow: "03 / Contact",
    contactTitle: "Your next project,\nor a good food debate.",
    contactBody:
      "Tell me about your project, share an idea, or debate whether a hotdog is a sandwich. I’m happy to chat.",
    email: "bbal96421@gmail.com",
    emailOptions: "Choose how to write",
    emailGmail: "Gmail compose",
    emailGmailMeta: "Open in browser",
    emailApp: "Mail app",
    emailAppMeta: "Use device default",
    emailCopy: "Copy address",
    emailCopied: "Address copied",
    socials: "Find me elsewhere",
    footer: "SpringYearn® — Visual Artist / Designer / Editor",
    legacyNote: "Legacy site / no longer updated",
    legacyEnter: "Open previous website",
    backTop: "Back to top",
  },
  zh: {
    nav: { work: "作品集", profile: "關於我", contact: "聯絡" },
    available: "獨立視覺創作者",
    heroTop: "視覺藝術家 / 剪輯師",
    heroBottom: "讓影像動起來，也做點靜態創作。",
    intro:
      "我做剪輯、動態圖形、繪畫、平面設計和 3D。有些點子適合用不同的方式呈現，那就試試看。",
    explore: "看看作品集",
    index: "獨立創作者 / 台灣",
    gatewayEyebrow: "01 / 作品集",
    gatewayTitle: "各種作品，\n放在這裡。",
    gatewayBody: "剪輯、動態圖形、APP／UI、3D、繪畫和平面設計。可以按分類逛，也可以直接點開感興趣的作品。",
    gatewayMeta: "精選作品／陸續更新",
    gatewayIndex: "作品索引",
    gatewayCta: "看看作品集",
    showreelEyebrow: "年度精華",
    showreelTitle: "這一年剪了什麼",
    showreelView: "觀看 Showreel",
    profileEyebrow: "02 / 關於我",
    profileTitle: "嗨，我是\nSpringYearn。",
    profileBody:
      "我是來自台灣的視覺藝術家、設計師與剪輯師，目前就讀視覺傳達動畫設計系。平常做動態影像、繪畫、平面設計、合成和 3D。",
    profileBody2:
      "剪輯是我的創作重心。試試其他媒介，也讓我能用不同的方法測試點子，看看什麼最適合。",
    brandEyebrow: "名稱 / 創作理念",
    brandTitle: "SpringYearn 是什麼意思？",
    springMeaning: "Spring 是春天，也代表新的開始、希望，以及再試一次的動力。",
    yearnMeaning: "Yearn 是對新知識和新作品的期待，也希望每次都能再進步一點。",
    brandClosing: "合在一起，就是保持好奇、繼續學、繼續做。",
    services: "我會做的事",
    experience: "一路以來",
    labEyebrow: "LAB / 實驗",
    labTitle: "工具、原型，\n還有一些實驗。",
    labBody: "這裡記錄我在 DaVinci Resolve 和 Fusion 裡做的工具、插件與實驗。有些已經能用，有些還是原型或研究；有個想試的點子，就動手做做看。",
    labCount: `${String(labExperiments.length).padStart(2, "0")} 筆開發紀錄 / 2026`,
    labCta: "看看 LAB",
    contactEyebrow: "03 / 聯絡",
    contactTitle: "聊聊你的專案，\n或披薩上的鳳梨。",
    contactBody: "有專案想聊、點子想分享，或想討論鳳梨到底該不該放在披薩上，都歡迎寫信給我。",
    email: "bbal96421@gmail.com",
    emailOptions: "選擇寄信方式",
    emailGmail: "使用 Gmail 寄信",
    emailGmailMeta: "在瀏覽器中開啟",
    emailApp: "裝置郵件程式",
    emailAppMeta: "使用系統預設設定",
    emailCopy: "複製信箱地址",
    emailCopied: "已複製信箱地址",
    socials: "其他地方也找得到我",
    footer: "SpringYearn® — 視覺藝術家 / 設計師 / 剪輯師",
    legacyNote: "舊網站／已停止更新",
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

const softwareStack = [
  {
    "id": "resolve",
    "name": "DaVinci Resolve"
  },
  {
    "id": "blender",
    "name": "Blender"
  },
  {
    "id": "maya",
    "name": "Maya"
  },
  {
    "id": "aftereffects",
    "name": "After Effects"
  },
  {
    "id": "photoshop",
    "name": "Photoshop"
  },
  {
    "id": "illustrator",
    "name": "Illustrator"
  },
  {
    "id": "medibang",
    "name": "MediBang Paint Pro"
  },
  {
    "id": "capcut",
    "name": "CapCut"
  },
  {
    "id": "powerdirector",
    "name": "PowerDirector"
  },
  {
    "id": "fusion",
    "name": "Fusion"
  },
  {
    "id": "figma",
    "name": "Figma"
  },
  {
    "id": "procreate",
    "name": "Procreate"
  }
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
    partner: { en: "Project / Yelodog", zh: "專案／黃狗" },
    title: { en: "A fictional trailer takes shape", zh: "虛構預告片成形" },
    body: {
      en: "Created a fictional trailer through Blender and DaVinci Resolve.",
      zh: "以 Blender 與 DaVinci Resolve 完成一支虛構預告片。",
    },
  },
  {
    year: { en: "2024", zh: "2024" },
    href: "https://youtube.com/@dfh-r6869?si=Ck2eNc0wMIyhQmBU",
    phase: { en: "Collaboration", zh: "合作階段" },
    partner: { en: "With / 江爸", zh: "合作／江爸" },
    title: { en: "Editing & thumbnail design", zh: "剪輯與縮圖設計" },
    body: {
      en: "Edited and designed thumbnails across 14 published videos.",
      zh: "參與 14 支影片的剪輯與縮圖設計。",
    },
  },
  {
    year: { en: "2026", zh: "2026" },
    href: "https://x.com/ValorantEsports/status/2102684410382287046?s=20",
    phase: { en: "Official project", zh: "官方專案" },
    partner: { en: "Riot Games × Rosewood Creative", zh: "Riot Games × Rosewood Creative" },
    title: { en: "VALORANT Esports / Creator Editor", zh: "VALORANT Esports／Creator Editor" },
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
    title: { en: "Independent commissions", zh: "零散自由接案" },
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
  { label: "Discord", handle: "Profile", href: "https://discord.com/users/696278366663213106" },
  { label: "Discord", handle: "Server", href: "https://discord.gg/Y4MQSsEBGN" },
];

const displayWords = ["SPRING", "YEARN"];

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

function setPointerPosition(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === "touch") return;

  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  const element = event.currentTarget;

  element.style.setProperty("--pointer-x", (x - 0.5).toFixed(3));
  element.style.setProperty("--pointer-y", (y - 0.5).toFixed(3));
  element.style.setProperty("--spot-x", `${(x * 100).toFixed(1)}%`);
  element.style.setProperty("--spot-y", `${(y * 100).toFixed(1)}%`);
}

function resetPointerPosition(event: ReactPointerEvent<HTMLElement>) {
  const element = event.currentTarget;
  element.style.setProperty("--pointer-x", "0");
  element.style.setProperty("--pointer-y", "0");
  element.style.setProperty("--spot-x", "50%");
  element.style.setProperty("--spot-y", "50%");
}

export default function Home() {
  const { language, setLanguage } = useSiteLanguage();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMailMenuOpen, setIsMailMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const t = copy[language];

  const copyEmailAddress = async () => {
    const address = "bbal96421@gmail.com";

    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const temporaryInput = document.createElement("textarea");
      temporaryInput.value = address;
      temporaryInput.setAttribute("readonly", "");
      temporaryInput.style.position = "fixed";
      temporaryInput.style.opacity = "0";
      document.body.appendChild(temporaryInput);
      temporaryInput.select();
      document.execCommand("copy");
      temporaryInput.remove();
    }

    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 1800);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");
    const cursor = document.querySelector<HTMLElement>(".art-cursor");
    const supportsCustomCursor = window.matchMedia("(pointer: fine)").matches;

    const updateCursor = (event: PointerEvent) => {
      if (!cursor || !supportsCustomCursor) return;
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
      cursor.classList.add("is-visible");
    };

    const updateCursorTarget = (event: PointerEvent) => {
      if (!cursor || !(event.target instanceof Element)) return;
      cursor.classList.toggle(
        "is-active",
        Boolean(event.target.closest("a, button, summary, .project-card, .display-letter")),
      );
    };

    const pressCursor = () => cursor?.classList.add("is-pressed");
    const releaseCursor = () => cursor?.classList.remove("is-pressed");
    const hideCursor = (event: PointerEvent) => {
      if (!event.relatedTarget) cursor?.classList.remove("is-visible");
    };

    if (supportsCustomCursor) {
      root.classList.add("has-art-cursor");
      window.addEventListener("pointermove", updateCursor, { passive: true });
      window.addEventListener("pointerover", updateCursorTarget, { passive: true });
      window.addEventListener("pointerdown", pressCursor, { passive: true });
      window.addEventListener("pointerup", releaseCursor, { passive: true });
      window.addEventListener("pointerout", hideCursor, { passive: true });
    }

    const updateScroll = () => {
      const maximum = root.scrollHeight - window.innerHeight;
      setScrollProgress(maximum > 0 ? window.scrollY / maximum : 0);
      setHasScrolled(window.scrollY > 28);
      root.style.setProperty("--page-scroll", `${window.scrollY}px`);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) =>
      observer.observe(element),
    );
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScroll);
      observer.disconnect();
      root.classList.remove("motion-ready");
      root.classList.remove("has-art-cursor");
      root.style.removeProperty("--page-scroll");
      window.removeEventListener("pointermove", updateCursor);
      window.removeEventListener("pointerover", updateCursorTarget);
      window.removeEventListener("pointerdown", pressCursor);
      window.removeEventListener("pointerup", releaseCursor);
      window.removeEventListener("pointerout", hideCursor);
    };
  }, []);

  return <Localized>{(
    <main id="top" className="site-shell">
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />
      <div className="grain" aria-hidden="true" />
      <div className="art-cursor" aria-hidden="true">
        <span className="cursor-ring" />
        <span className="cursor-core" />
      </div>

      <header className={`site-header${hasScrolled ? " is-scrolled" : ""}`}>
        <a className="wordmark" href="#top" aria-label="SpringYearn home">
          <span className="wordmark-symbol">
            <img src="/logo.png" alt="" />
          </span>
          <span className="wordmark-text">SPRING YEARN</span>
          <span className="wordmark-reg">®</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/work">{t.nav.work}</Link>
          <Link href="/lab">LAB</Link>
          <Link href="/project-files">{language === "en" ? "Project files" : "專案檔"}</Link>
          <a href="#profile">{t.nav.profile}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
        <HeaderControls language={language} onToggleLanguage={() => setLanguage(current => current === "en" ? "zh" : "en")} />
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-meta mono-label">
          <span>{t.index}</span>
          <span>UTC+08 / TAIWAN</span>
        </div>

        <div className="hero-status mono-label">
          <span className="status-dot" aria-hidden="true" />
          {t.available}
        </div>

        <div
          className="hero-composition"
          onPointerMove={setPointerPosition}
          onPointerLeave={resetPointerPosition}
        >
          <div className="orb orb-one" aria-hidden="true" />
          <div className="orb orb-two" aria-hidden="true" />
          <div className="axis axis-x" aria-hidden="true" />
          <div className="axis axis-y" aria-hidden="true" />
          <SpringMark className="hero-spring-mark" />
          <div className="hero-title-cluster">
            <p className="hero-kicker">SPRING YEARN / VISUAL PRACTICE</p>
            <h1 id="hero-title">
              <span>{t.heroTop}</span>
              <strong className="hero-display" aria-label="SPRING YEARN">
                {displayWords.map((word) => (
                  <span
                    className="display-word"
                    aria-hidden="true"
                    data-word={word}
                    key={word}
                  >
                    {Array.from(word).map((letter, letterIndex) => (
                      <span
                        className="display-letter"
                        style={{ "--letter-index": letterIndex } as CSSProperties}
                        key={`${word}-${letterIndex}`}
                      >
                        <span className="display-letter-inner">{letter}</span>
                      </span>
                    ))}
                  </span>
                ))}
              </strong>
            </h1>
          </div>
          <p className="hero-statement">{t.heroBottom}</p>
        </div>

        <div className="hero-footer">
          <p>{t.intro}</p>
          <Link href="/work" className="text-link">
            {t.explore}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="work" className="section-block work-gateway" aria-labelledby="work-gateway-title">
        <div className="work-portal-layout">
          <Link
            className="work-gateway-link"
            href="/work"
            data-audio="work-gateway"
            data-reveal
            onPointerMove={setPointerPosition}
            onPointerLeave={resetPointerPosition}
          >
            <div className="gateway-panel gateway-heading-panel">
              <p className="eyebrow">{t.gatewayEyebrow}</p>
              <h2 id="work-gateway-title">{t.gatewayTitle}</h2>
            </div>
            <div className="gateway-panel gateway-index-panel">
              <span className="mono-label">{t.gatewayIndex}</span>
              <strong>WORKS</strong>
            </div>
            <div className="gateway-panel gateway-copy-panel">
              <p>{t.gatewayBody}</p>
              <span className="mono-label">{t.gatewayMeta}</span>
            </div>
            <div className="gateway-panel gateway-action-panel">
              <span className="mono-label">SY / WORKS</span>
              <strong>
                {t.gatewayCta}
                <ArrowUpRight aria-hidden="true" />
              </strong>
            </div>
          </Link>

          <aside className="annual-reels" aria-labelledby="annual-reels-title" data-reveal>
            <div className="annual-reels-heading">
              <p className="mono-label">{t.showreelEyebrow}</p>
              <h3 id="annual-reels-title">{t.showreelTitle}</h3>
            </div>
            {annualReels.map((reel) => (
              <a
                className="annual-reel-card"
                href={reel.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${reel.year} — ${t.showreelView}`}
                key={reel.year}
              >
                <div className="annual-reel-meta">
                  <strong>{reel.year}</strong>
                  <span className="mono-label">Showreel</span>
                </div>
                <div className="annual-reel-thumb" aria-hidden="true">
                  <img src={reel.thumbnail} alt="" />
                  <ArrowUpRight aria-hidden="true" />
                </div>
              </a>
            ))}
          </aside>
        </div>
      </section>

      <section id="lab" className="section-block lab-gateway" aria-labelledby="lab-title">
        <Link href="/lab" className="lab-entry-link" data-reveal onPointerMove={setPointerPosition} onPointerLeave={resetPointerPosition}>
          <div className="lab-entry-specimen" aria-hidden="true">
            <span className="mono-label">SY / GROWTH STUDIES</span>
            <SpringMark />
            <span className="lab-entry-coordinate mono-label">{String(labExperiments.length).padStart(2, "0")} / IN PROGRESS</span>
          </div>
          <div className="lab-entry-copy">
            <p className="eyebrow">{t.labEyebrow}</p>
            <h2 id="lab-title">{t.labTitle}</h2>
            <p className="lab-intro">{t.labBody}</p>
          </div>
          <div className="lab-entry-action">
            <span className="mono-label">{t.labCount}</span>
            <strong>{t.labCta}<ArrowUpRight aria-hidden="true" /></strong>
          </div>
        </Link>
        <ProjectFilesGateway language={language} />
      </section>

      <section id="profile" className="section-block profile-section" aria-labelledby="profile-title">
        <div className="profile-grid" data-reveal>
          <div className="section-heading profile-heading">
            <p className="eyebrow">{t.profileEyebrow}</p>
            <h2 id="profile-title">{t.profileTitle}</h2>
          </div>
          <div className="profile-copy">
            <p className="lead-copy">{t.profileBody}</p>
            <p>{t.profileBody2}</p>
          </div>
        </div>

        <div className="brand-story" data-reveal>
          <div className="brand-story-intro">
            <p className="mono-label">{t.brandEyebrow}</p>
            <h3>{t.brandTitle}</h3>
          </div>
          <figure className="brand-logo-panel">
            <SpringLogo language={language} />
            <figcaption>SY / SPRING YEARN</figcaption>
          </figure>
          <div className="brand-meanings">
            <article>
              <span className="brand-index">01</span>
              <BrandWord word="SPRING" />
              <p>{t.springMeaning}</p>
            </article>
            <article>
              <span className="brand-index">02</span>
              <BrandWord word="YEARN" />
              <p>{t.yearnMeaning}</p>
            </article>
          </div>
          <p className="brand-closing">{t.brandClosing}</p>
        </div>

        <div className="capability-grid" data-reveal>
          <div>
            <p className="mono-label">{t.services}</p>
            <ol className="capability-list">
              {capabilities.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
            <div className="software-stack" aria-label={language === "en" ? "Software toolkit" : "軟體工具"}>
              <p className="mono-label">{language === "en" ? "Software / Toolkit" : "使用軟體／工具"}</p>
              <ul>
                {softwareStack.map((software) => (
                  <li key={software.id}><span className="software-logo"><img src={`/toolkit/${software.id}.svg`} alt="" loading="lazy" width="32" height="32" /></span><span>{software.name}</span></li>
                ))}
                <li className="software-more">{language === "en" ? "And more…" : "以及更多⋯⋯"}</li>
              </ul>
            </div>
          </div>
          <div className="practice-card">
            <p className="mono-label">{t.experience}</p>
            <strong>2020—NOW</strong>
            <p>
              {language === "en"
                ? "A self-directed practice across moving image, drawing, graphic design, compositing and 3D."
                : "持續進行動態影像、繪畫、平面設計、合成與 3D 的自主創作。"}
            </p>
            <div className="practice-mark" aria-hidden="true">
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="history-list" data-reveal>
          {practiceHistory.map((item, index) => {
            const entry = (
              <>
                <span className="history-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="history-time">
                  <strong>{item.year[language]}</strong>
                  <span>{item.phase[language]}</span>
                </div>
                <div className="history-detail">
                  <span className="history-partner mono-label">
                    {item.partner[language]}
                    {item.href ? <ArrowUpRight aria-hidden="true" /> : null}
                  </span>
                  <h3>{item.title[language]}</h3>
                  <p>{item.body[language]}</p>
                </div>
              </>
            );

            return item.href ? (
              <a
                className="history-entry history-entry-link"
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${item.partner[language]} — ${item.title[language]}`}
                key={item.title.en}
              >
                {entry}
              </a>
            ) : (
              <article className="history-entry" key={item.title.en}>
                {entry}
              </article>
            );
          })}
        </div>
      </section>

      <section id="contact" className="contact-section" aria-labelledby="contact-title">
        <div className="contact-glow" aria-hidden="true" />
        <p className="eyebrow" data-reveal>{t.contactEyebrow}</p>
        <h2 id="contact-title" data-reveal>{t.contactTitle}</h2>
        <div className="contact-lower" data-reveal>
          <p>{t.contactBody}</p>
          <div className="contact-actions">
            <button
              className="primary-contact"
              type="button"
              aria-expanded={isMailMenuOpen}
              aria-controls="contact-mail-menu"
              onClick={() => setIsMailMenuOpen((current) => !current)}
            >
              {t.email}
              <ArrowUpRight aria-hidden="true" />
            </button>
            {isMailMenuOpen ? (
              <div className="contact-mail-menu" id="contact-mail-menu" aria-label={t.emailOptions}>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=bbal96421%40gmail.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{t.emailGmail}</span>
                  <small>{t.emailGmailMeta}</small>
                  <ArrowUpRight aria-hidden="true" />
                </a>
                <a href="mailto:bbal96421@gmail.com?subject=Hello%20SpringYearn">
                  <span>{t.emailApp}</span>
                  <small>{t.emailAppMeta}</small>
                  <ArrowUpRight aria-hidden="true" />
                </a>
                <button type="button" onClick={copyEmailAddress} aria-live="polite">
                  <span>{emailCopied ? t.emailCopied : t.emailCopy}</span>
                  <small>bbal96421@gmail.com</small>
                </button>
              </div>
            ) : null}
            <span className="mono-label">{t.socials}</span>
            <div className="social-grid" aria-label={t.socials}>
              {socialLinks.map((social) =>
                social.href ? (
                  <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
                    <span>{social.label}</span>
                    <strong>{social.handle}</strong>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : (
                  <span className="social-static" key={social.label}>
                    <span>{social.label}</span>
                    <strong>{social.handle}</strong>
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteStatus language={language} />
      <footer className="site-footer">
        <span>{t.footer}</span>
        <ForNever language={language} place="home" />
        <details className="legacy-index">
          <summary aria-label={language === "en" ? "Reveal legacy site" : "顯示舊網站入口"}>
            SY / V.01
          </summary>
          <div className="legacy-index-panel">
            <span>{t.legacyNote}</span>
            <a href="https://springyearn.webflow.io/" target="_blank" rel="noreferrer">
              {t.legacyEnter}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </details>
        <a href="#top">
          {t.backTop}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </footer>
    </main>
  )}</Localized>;
}
