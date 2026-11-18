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

export function SiteEntrance({ button, ready, onEnter }: {
  button: RefObject<HTMLButtonElement | null>;
  ready: boolean;
  onEnter: () => void;
}) {
  const { locale } = useSiteLanguage();
  const field = useRef<HTMLCanvasElement>(null);
  const emblem = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!field.current || !emblem.current || !button.current ||
        !document.documentElement.hasAttribute(ENTRANCE_ATTRIBUTE)) return;
    return animateEntrance(field.current, emblem.current, button.current);
  }, [button]);

  return (
    <section className="site-entrance" role="dialog" aria-modal="true" aria-label="SpringYearn" style={entranceStyle} data-no-ripple>
      <canvas className="site-entrance-field" ref={field} aria-hidden="true" />
      <button className="site-entrance-enter" ref={button} type="button" aria-label={enterCopy[locale]} disabled={!ready} onClick={onEnter}>
        <span className="site-entrance-float" ref={emblem}>
          <span className="site-entrance-zoom">
            <img className="site-entrance-logo" src="/logo.png" alt="" width={150} height={157} draggable={false} />
            <canvas className="site-entrance-logo-warp" width={1} height={1} aria-hidden="true" />
          </span>
        </span>
      </button>
    </section>
  );
}
