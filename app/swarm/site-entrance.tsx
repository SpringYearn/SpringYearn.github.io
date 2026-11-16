"use client";

import { ArrowUpRight } from "lucide-react";
import type { CSSProperties, RefObject } from "react";
import { useSiteLanguage } from "../site-language";
import "./site-entrance.css";

const enterCopy = {
  en: "Click to enter",
  zh: "點擊進入",
  ja: "クリックして入る",
  ko: "클릭해서 들어가기",
  ru: "Нажмите, чтобы войти",
  vi: "Nhấp để vào",
};

// Offset the phases so particles drift at different speeds and the field
// already has depth when the first frame appears.
const particles = Array.from({ length: 30 }, (_, index) => {
  const angle = index * 2.39996;
  const reach = .56 + ((index * 13) % 23) * .025;
  const duration = 6.5 + (index * 7 % 13) * .39;
  return {
    "--drift-x": `${Math.round(Math.cos(angle) * reach * 318)}px`,
    "--drift-y": `${Math.round(Math.sin(angle) * reach * 205)}px`,
    "--particle-size": `${index % 5 === 0 ? 2.8 : index % 3 === 0 ? 2.1 : 1.5}px`,
    "--particle-duration": `${duration.toFixed(2)}s`,
    "--particle-delay": `${(-duration * ((index * 19) % 31) / 31).toFixed(2)}s`,
  } as CSSProperties;
});

export function SiteEntrance({ button, ready, onEnter }: {
  button: RefObject<HTMLButtonElement | null>;
  ready: boolean;
  onEnter: () => void;
}) {
  const { locale } = useSiteLanguage();
  return (
    <section className="site-entrance" role="dialog" aria-modal="true" aria-label="SpringYearn" data-no-ripple>
      <div className="site-entrance-particles" aria-hidden="true">
        {particles.map((style, index) => <i key={index} style={style} />)}
      </div>
      <button className="site-entrance-enter" ref={button} type="button" disabled={!ready} onClick={onEnter}>
        <span className="site-entrance-guides" aria-hidden="true" />
        <img className="site-entrance-logo" src="/logo.png" alt="" width={116} height={121} />
        <span className="site-entrance-light" aria-hidden="true" />
        <span className="site-entrance-cue">{enterCopy[locale]}<ArrowUpRight aria-hidden="true" /></span>
      </button>
    </section>
  );
}
