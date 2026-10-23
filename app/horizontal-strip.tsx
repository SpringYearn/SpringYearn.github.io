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
    const anchor = element.closest<HTMLElement>(".profile-strips") ?? element;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (reduced.matches) return;
      const height = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (height * .85 - anchor.getBoundingClientRect().top) / (height * .65)));
      const distance = Math.max(0, element.scrollWidth - element.clientWidth);
      element.scrollLeft = distance * (reverse ? 1 - progress : progress);
    };
    const schedule = () => {
      if (!reduced.matches && !frame) frame = requestAnimationFrame(paint);
    };
    const preferenceChanged = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (reduced.matches) element.scrollLeft = 0;
      else paint();
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    if (element.firstElementChild) resize.observe(element.firstElementChild);
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", preferenceChanged);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", preferenceChanged);
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
