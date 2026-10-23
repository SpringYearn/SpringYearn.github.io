"use client";

import { useEffect, useRef } from "react";

export function useHeroParallax() {
  const hero = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = hero.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      frame = 0;
      const distance = reduced.matches ? 0 : Math.min(element.offsetHeight, Math.max(0, window.scrollY));
      element.style.setProperty("--hero-scroll", `${distance.toFixed(2)}px`);
    };
    const schedule = () => {
      if (!reduced.matches && !frame) frame = requestAnimationFrame(paint);
    };
    const preferenceChanged = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      paint();
    };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", preferenceChanged);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", preferenceChanged);
    };
  }, []);

  return hero;
}
