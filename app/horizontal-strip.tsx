"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Localized } from "./localized";

export function HorizontalStrip({ id, title, className = "", children }: {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () => {
      const start = element.scrollLeft <= 2;
      const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 2;
      setEdges(previous => previous.start === start && previous.end === end ? previous : { start, end });
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const remaining = element.scrollWidth - element.clientWidth - element.scrollLeft;
      if ((event.deltaY > 0 && remaining <= 2) || (event.deltaY < 0 && element.scrollLeft <= 2)) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? element.clientWidth : 1);
      element.scrollLeft += delta;
    };
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    if (element.firstElementChild) resize.observe(element.firstElementChild);
    measure();
    element.addEventListener("scroll", measure, { passive: true });
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      resize.disconnect();
      element.removeEventListener("scroll", measure);
      element.removeEventListener("wheel", wheel);
    };
  }, []);

  const move = (direction: number) => {
    const element = viewport.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * .75,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return <Localized>{<section className={`horizontal-strip ${className}`} aria-labelledby={`${id}-title`}>
    <div className="strip-heading">
      <h3 className="mono-label" id={`${id}-title`}>{title}</h3>
      <div className="strip-controls">
        <button type="button" aria-label="Scroll left" aria-controls={id} disabled={edges.start} onClick={() => move(-1)}><ArrowLeft aria-hidden="true" /></button>
        <button type="button" aria-label="Scroll right" aria-controls={id} disabled={edges.end} onClick={() => move(1)}><ArrowRight aria-hidden="true" /></button>
      </div>
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
