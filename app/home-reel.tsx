"use client";

import { useEffect, useRef } from "react";
import { ENTRANCE_ATTRIBUTE, REDUCED_MOTION_QUERY } from "./swarm/availability";

export function HomeReel() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reduced = matchMedia(REDUCED_MOTION_QUERY);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;

    const update = () => {
      if (!reduced.matches && !connection?.saveData && visible && !document.hidden &&
          !document.documentElement.hasAttribute(ENTRANCE_ATTRIBUTE)) {
        if (!element.hasAttribute("src")) element.src = "/works/home-reel.mp4?v=096";
        element.muted = true;
        if (element.paused) void element.play().catch(() => {});
      } else {
        element.pause();
      }
    };

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
      intersection.disconnect();
      entrance.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
      element.pause();
    };
  }, []);

  return (
    <div className="hero-reel" aria-hidden="true">
      <video ref={video} poster="/works/home-reel-poster.webp?v=096" loop muted playsInline preload="none" tabIndex={-1} />
    </div>
  );
}
