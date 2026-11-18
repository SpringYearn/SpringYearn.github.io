"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { useSiteLanguage } from "../site-language";
import { ENTRANCE_ATTRIBUTE } from "./availability";
import { animateEntrance } from "./entrance-scene";
import { ENTRANCE_TRAVEL_MS } from "./timing";
import "./site-entrance.css";

const enterCopy = {
  en: "Enter SpringYearn",
  zh: "進入 SpringYearn",
  ja: "SpringYearn に入る",
  ko: "SpringYearn 들어가기",
  ru: "Войти на SpringYearn",
  vi: "Vào SpringYearn",
};
const entranceStyle = { "--entrance-travel": `${ENTRANCE_TRAVEL_MS}ms` } as CSSProperties;

function positionCut(layer: HTMLDivElement, still: HTMLImageElement, viewport: HTMLCanvasElement) {
  const { left, top, width, height } = still.getBoundingClientRect();
  if (width === 0 || height === 0) return;

  // This percentage is the center of the light between the hands in the still.
  const x = .5;
  const y = .46;
  const centerX = viewport.clientWidth / 2;
  const centerY = viewport.clientHeight / 2;
  const scale = Math.max(centerX / (width * x), centerY / (height * y));
  Object.assign(layer.style, {
    left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px`,
    transformOrigin: `${x * 100}% ${y * 100}%`,
    backgroundImage: `url("${still.currentSrc}")`,
  });
  layer.style.setProperty("--cut-x", `${centerX - left - width * x}px`);
  layer.style.setProperty("--cut-y", `${centerY - top - height * y}px`);
  layer.style.setProperty("--cut-scale", String(scale * 1.06));
}

export function SiteEntrance({ button, ready, onEnter }: {
  button: RefObject<HTMLButtonElement | null>;
  ready: boolean;
  onEnter: () => void;
}) {
  const { locale } = useSiteLanguage();
  const field = useRef<HTMLCanvasElement>(null);
  const emblem = useRef<HTMLSpanElement>(null);
  const cut = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!field.current || !emblem.current || !button.current ||
        !document.documentElement.hasAttribute(ENTRANCE_ATTRIBUTE)) return;
    const stop = animateEntrance(field.current, emblem.current, button.current);
    const resize = () => {
      if (cut.current?.hasAttribute("data-positioned") &&
          document.documentElement.getAttribute(ENTRANCE_ATTRIBUTE) === "launching") {
        const still = document.querySelector<HTMLImageElement>("[data-entrance-frame]");
        if (still && field.current) positionCut(cut.current, still, field.current);
      }
    };
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      stop?.();
      window.removeEventListener("resize", resize);
    };
  }, [button]);

  const traceStill = () => {
    const still = document.querySelector<HTMLImageElement>("[data-entrance-frame]");
    if (cut.current && field.current && still?.naturalWidth) {
      positionCut(cut.current, still, field.current);
      cut.current.setAttribute("data-positioned", "");
    }
    onEnter();
  };

  return (
    <section className="site-entrance" role="dialog" aria-modal="true" aria-label="SpringYearn" style={entranceStyle} data-no-ripple>
      <div className="site-entrance-cut" ref={cut} aria-hidden="true" />
      <canvas className="site-entrance-field" ref={field} aria-hidden="true" />
      <button className="site-entrance-enter" ref={button} type="button" aria-label={enterCopy[locale]} disabled={!ready} onClick={traceStill}>
        <span className="site-entrance-float" ref={emblem}>
          <span className="site-entrance-zoom">
            <img className="site-entrance-logo" src="/logo.png" alt="" width={150} height={157} />
            <canvas className="site-entrance-logo-warp" width={1} height={1} aria-hidden="true" />
          </span>
        </span>
      </button>
    </section>
  );
}
