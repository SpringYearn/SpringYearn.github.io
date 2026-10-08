"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "./site-language";

// This heading names the archive; the shared "works" translation is a count suffix.
export const workGatewayLabels: Record<Locale, string> = {
  en: "WORKS",
  zh: "作品",
  ja: "作品",
  ko: "작품",
  ru: "Работы",
  vi: "Tác phẩm",
};

export function useWorkGatewayMotion() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = false;
    const update = () => {
      element.dataset.gatewayMotion = visible && !document.hidden ? "running" : "paused";
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.05;
      update();
    }, { threshold: [0, 0.05] });

    update();
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      delete element.dataset.gatewayMotion;
    };
  }, []);

  return ref;
}
