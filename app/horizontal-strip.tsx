"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Localized } from "./localized";

export function HorizontalStrip({ id, title, className = "", reverse = false, children }: {
  id: string;
  title: string;
  className?: string;
  reverse?: boolean;
  children: ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const header = document.querySelector<HTMLElement>(".site-header");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previousTime = 0;
    let current = element.scrollLeft;
    let target = current;
    let initialized = false;
    let reducedState = reduced.matches;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    };
    const motionAllowed = () => {
      const next = reduced.matches;
      if (next !== reducedState) {
        reducedState = next;
        stop();
        initialized = false;
        if (next) {
          current = target = 0;
          element.scrollLeft = 0;
        }
      }
      return !next;
    };
    const paint = (time: number) => {
      frame = 0;
      if (!motionAllowed()) return;
      const elapsed = previousTime ? Math.min(64, time - previousTime) : 1000 / 60;
      previousTime = time;
      current += (target - current) * (1 - Math.exp(-elapsed / 100));
      if (Math.abs(target - current) < .35) current = target;
      element.scrollLeft = current;
      if (current !== target) frame = requestAnimationFrame(paint);
      else previousTime = 0;
    };
    const measure = () => {
      if (!motionAllowed()) return;
      const height = window.innerHeight;
      const top = Math.max(0, Math.min(height, header?.getBoundingClientRect().bottom ?? 0));
      const bounds = element.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (height - bounds.top) / Math.max(1, height - top + bounds.height)));
      const distance = Math.max(0, element.scrollWidth - element.clientWidth);
      target = distance * (reverse ? 1 - progress : progress);
      if (!initialized || progress === 0 || progress === 1) {
        stop();
        current = target;
        element.scrollLeft = target;
        initialized = true;
      } else if (!frame) {
        current = element.scrollLeft;
        frame = requestAnimationFrame(paint);
      }
    };
    const preferenceChanged = () => {
      if (motionAllowed()) measure();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    if (element.firstElementChild) resize.observe(element.firstElementChild);
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    reduced.addEventListener("change", preferenceChanged);
    // Direct touch, trackpad and keyboard input takes over until the next page scroll.
    for (const event of ["pointerdown", "wheel", "keydown"] as const) {
      element.addEventListener(event, stop, { passive: true });
    }
    return () => {
      stop();
      resize.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      reduced.removeEventListener("change", preferenceChanged);
      for (const event of ["pointerdown", "wheel", "keydown"] as const) {
        element.removeEventListener(event, stop);
      }
    };
  }, [reverse]);

  const move = (direction: number) => {
    const element = viewport.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * .75,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return <Localized>{<section className={`horizontal-strip ${className}`} aria-labelledby={`${id}-title`}>
    <div className="strip-heading">
      <h3 className="mono-label" id={`${id}-title`}>{title}</h3>
    </div>
    <div className="strip-viewport" id={id} ref={viewport} tabIndex={0} role="region" aria-labelledby={`${id}-title`}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        } else if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          event.currentTarget.scrollLeft = event.key === "Home" ? 0 : event.currentTarget.scrollWidth;
        }
      }}>{children}</div>
  </section>}</Localized>;
}
