"use client";

import { useEffect, useRef } from "react";

export function HomeBackdrop() {
  const backdrop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      backdrop.current?.style.setProperty("--parallax-shift", reduced.matches ? "0px" : `${(-220 * progress).toFixed(2)}px`);
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

  return <div className="home-backdrop" ref={backdrop} aria-hidden="true">
    <div className="home-backdrop-wash" />
    <div className="home-backdrop-orbit" />
    <div className="home-backdrop-grid" />
  </div>;
}
