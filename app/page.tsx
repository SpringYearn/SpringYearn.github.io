"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = "en" | "zh";
const copy = {
  en: {
    nav: { work: "Work archive", profile: "Profile", contact: "Contact" },
    available: "Independent visual practice",
    heroTop: "Visual Artist / Editor",
    heroBottom: "Images, rhythm and form — as a way of thinking.",
    intro:
      "Moving image, drawing, graphic design and 3D meet here as one evolving visual language — guided by curiosity rather than a fixed medium.",
    explore: "Enter work archive",
    index: "Independent creative / Taiwan",
    gatewayEyebrow: "01 / Work archive",
    gatewayTitle: "A separate space\nfor the work.",
    gatewayBody:
      "Editing, motion, 3D, drawing and graphic image — collected as an evolving archive beyond the profile.",
    gatewayMeta: "Selected work / 4 disciplines",
    gatewayIndex: "Archive index",
    gatewayCta: "Enter the archive",
    showreelEyebrow: "Annual notes",
    showreelTitle: "Year in motion",
    showreelView: "Watch showreel",
    profileEyebrow: "02 / Profile",
    profileTitle: "Making is how I\nthink in images.",
    profileBody:
      "I am a Taiwan-based visual artist, designer and editor currently studying Visual Communication & Animation Design. My practice moves between moving image, drawing, graphic design, compositing and 3D.",
    profileBody2:
      "Editing remains the core rhythm of my practice, while every medium becomes another way for me to observe, experiment and give a feeling its own form.",
    brandEyebrow: "Name / Philosophy",
    brandTitle: "A name built around renewal and desire.",
    springMeaning:
      "Renewal, hope and the energy of beginning again — the season when everything returns to motion.",
    yearnMeaning:
      "A deep pull toward ideas not yet learned, forms not yet made and the next version of the craft.",
    brandClosing: "SpringYearn is a promise to keep learning — and keep moving forward.",
    services: "Capabilities",
    experience: "Practice",
    contactEyebrow: "03 / Contact",
    contactTitle: "Ideas, conversations,\nand shared experiments.",
    contactBody:
      "For creative exchange, collaboration, or simply to share something interesting, the door is open.",
    email: "bbal96421@gmail.com",
    emailOptions: "Choose how to write",
    emailGmail: "Gmail compose",
    emailGmailMeta: "Open in browser",
    emailApp: "Mail app",
    emailAppMeta: "Use device default",
    emailCopy: "Copy address",
    emailCopied: "Address copied",
    socials: "Elsewhere / Creative traces",
    footer: "SpringYearn® — Visual Artist / Designer / Editor",
    backTop: "Back to top",
  },
  zh: {
    nav: { work: "作品集", profile: "關於我", contact: "聯絡" },
    available: "獨立視覺創作實踐",
    heroTop: "視覺藝術家 / 剪輯師",
    heroBottom: "以影像、節奏與形式，留下思考的痕跡。",
    intro:
      "讓動態影像、繪畫、平面設計與 3D 在同一套視覺語言中相遇——由好奇心出發，不被單一媒介定義。",
    explore: "進入作品集",
    index: "獨立創作者 / 台灣",
    gatewayEyebrow: "01 / 作品集",
    gatewayTitle: "讓作品擁有一個，\n獨立的空間。",
    gatewayBody: "剪輯、動態圖形、3D、繪畫與平面影像，被整理成主頁之外持續生長的創作檔案。",
    gatewayMeta: "精選作品／4 個領域",
    gatewayIndex: "作品索引",
    gatewayCta: "進入作品集",
    showreelEyebrow: "年度小結",
    showreelTitle: "流動的一年",
    showreelView: "觀看 Showreel",
    profileEyebrow: "02 / 關於我",
    profileTitle: "創作，是我用影像\n思考的方式。",
    profileBody:
      "我是一名來自台灣的視覺藝術家、設計師與剪輯師，目前就讀視覺傳達動畫設計系。我的創作游移於動態影像、繪畫、平面設計、合成與 3D 之間。",
    profileBody2:
      "剪輯仍是我創作的核心節奏，而每一種媒介，都是我觀察、實驗，以及替感受找到形狀的方法。",
    brandEyebrow: "名稱 / 創作理念",
    brandTitle: "一個關於新生與嚮往的名字。",
    springMeaning: "象徵新生、希望與重新出發的能量，如同萬物回到流動狀態的季節。",
    yearnMeaning: "代表對未知知識、尚未完成的作品，以及下一個創作階段的深切嚮往。",
    brandClosing: "SpringYearn 是持續學習、持續向前的承諾。",
    services: "能力領域",
    experience: "創作經歷",
    contactEyebrow: "03 / 聯絡",
    contactTitle: "讓想法相遇，\n讓靈感繼續流動。",
    contactBody: "無論是創作交流、合作，或只是想分享有趣的事物，這裡都留著一扇開放的門。",
    email: "bbal96421@gmail.com",
    emailOptions: "選擇寄信方式",
    emailGmail: "使用 Gmail 寄信",
    emailGmailMeta: "在瀏覽器中開啟",
    emailApp: "裝置郵件程式",
    emailAppMeta: "使用系統預設設定",
    emailCopy: "複製信箱地址",
    emailCopied: "已複製信箱地址",
    socials: "其他地方 / 創作足跡",
    footer: "SpringYearn® — 視覺藝術家 / 設計師 / 剪輯師",
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
  const [language, setLanguage] = useState<Language>("en");
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
        Boolean(event.target.closest("a, button, .project-card, .display-letter")),
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

  return (
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
          <a href="#profile">{t.nav.profile}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
        <Button
          type="button"
          variant="outline"
          className="language-switch"
          onClick={() => setLanguage((current) => (current === "en" ? "zh" : "en"))}
          aria-label={language === "en" ? "Switch to Chinese" : "切換為英文"}
        >
          <Globe2 aria-hidden="true" />
          {language === "en" ? "中文" : "EN"}
        </Button>
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
            <img src="/logo.png" alt="SpringYearn logo" />
            <figcaption>SY / SPRING YEARN</figcaption>
          </figure>
          <div className="brand-meanings">
            <article>
              <span className="brand-index">01</span>
              <strong>SPRING</strong>
              <p>{t.springMeaning}</p>
            </article>
            <article>
              <span className="brand-index">02</span>
              <strong>YEARN</strong>
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

      <footer className="site-footer">
        <span>{t.footer}</span>
        <a href="#top">
          {t.backTop}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </footer>
    </main>
  );
}
