"use client";

import { useEffect, useRef } from "react";
import { REDUCED_MOTION_QUERY } from "./swarm/availability";

export function useVisibleVideo(source: string | undefined) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element || !source) return;
    const reduced = matchMedia(REDUCED_MOTION_QUERY);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;

    const update = () => {
      if (!reduced.matches && !connection?.saveData && visible && !document.hidden) {
        if (element.getAttribute("src") !== source) element.src = source;
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
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    return () => {
      intersection.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
      element.pause();
    };
  }, [source]);

  return video;
}
