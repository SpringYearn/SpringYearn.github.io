"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Localized } from "./localized";
import { useSiteLanguage } from "./site-language";
import { ENTRANCE_ATTRIBUTE, REDUCED_MOTION_QUERY } from "./swarm/availability";

export function HomeReel() {
  const { language } = useSiteLanguage();
  const video = useRef<HTMLVideoElement>(null);
  const preference = useRef<boolean | null>(null);
  const sync = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reduced = matchMedia(REDUCED_MOTION_QUERY);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;

    const update = () => {
      const allowed = preference.current ?? (!reduced.matches && !connection?.saveData);
      if (allowed && visible && !document.hidden && !document.documentElement.hasAttribute(ENTRANCE_ATTRIBUTE)) {
        if (!element.hasAttribute("src")) element.src = "/works/home-reel.mp4";
        element.muted = true;
        if (element.paused) void element.play().catch(() => {});
      } else {
        element.pause();
      }
    };

    sync.current = update;
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .08;
      update();
    }, { threshold: .08 });
    intersection.observe(element);
    const entrance = new MutationObserver(update);
    entrance.observe(document.documentElement, { attributes: true, attributeFilter: [ENTRANCE_ATTRIBUTE] });
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    return () => {
      sync.current = () => {};
      intersection.disconnect();
      entrance.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
      element.pause();
    };
  }, []);

  const toggle = () => {
    if (!video.current) return;
    preference.current = video.current.paused;
    sync.current();
  };
  const label = playing
    ? (language === "zh" ? "暫停背景影片" : "Pause background video")
    : (language === "zh" ? "播放背景影片" : "Play background video");

  return <Localized>{<>
    <div className="hero-reel" aria-hidden="true">
      <video ref={video} poster="/works/home-reel-poster.webp" loop muted playsInline preload="none" tabIndex={-1}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setUnavailable(true)} />
    </div>
    {!unavailable && <button type="button" className="hero-reel-control" aria-label={label} title={label} onClick={toggle}>
      {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
    </button>}
  </>}</Localized>;
}
