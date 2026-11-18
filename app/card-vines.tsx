"use client";

import { useEffect, useRef, type RefObject } from "react";
import { growVines, paintVines } from "./resources/resource-vine-drawing";

function attachVines(field: HTMLCanvasElement, grid: HTMLElement, selector: string) {
  const shell = field.parentElement;
  const picker = grid.parentElement;
  if (!shell || !picker) return;
  const hover = matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const cards = Array.from(grid.querySelectorAll<HTMLAnchorElement>(selector), element => ({
    element, cool: element.dataset.vineTone === "cool",
    growth: 0, vines: [] as ReturnType<typeof growVines>,
  }));
  type Card = typeof cards[number];
  let pointer: Card | undefined, focus: Card | undefined;
  let frame = 0, previous = 0, width = 1, height = 1, dirty = true;
  let context: CanvasRenderingContext2D | null = null;

  const measure = () => {
    const parent = shell.getBoundingClientRect();
    const group = grid.getBoundingClientRect();
    const section = picker.getBoundingClientRect();
    const left = Math.max(parent.left, group.left - 104);
    const right = Math.min(parent.right, group.right + 104);
    const top = Math.max(section.top, group.top - 92);
    const bottom = Math.min(section.bottom, group.bottom + 69);
    width = Math.max(1, right - left);
    height = Math.max(1, bottom - top);
    const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(2_200_000 / (width * height)));
    field.width = Math.max(1, Math.round(width * ratio));
    field.height = Math.max(1, Math.round(height * ratio));
    Object.assign(field.style, {
      left: `${left - parent.left}px`, top: `${top - parent.top}px`,
      width: `${width}px`, height: `${height}px`,
    });
    context?.setTransform(field.width / width, 0, 0, field.height / height, 0, 0);
    const boxes = cards.map(card => card.element.getBoundingClientRect());
    cards.forEach((card, index) => {
      const box = boxes[index];
      const edges = { left: box.left - left, right: right - box.right, top: box.top - top, bottom: bottom - box.bottom };
      for (const other of boxes) {
        if (other === box) continue;
        if (other.top < box.bottom && other.bottom > box.top) {
          if (other.right <= box.left) edges.left = Math.min(edges.left, box.left - other.right);
          if (other.left >= box.right) edges.right = Math.min(edges.right, other.left - box.right);
        }
        if (other.left < box.right && other.right > box.left) {
          if (other.bottom <= box.top) edges.top = Math.min(edges.top, box.top - other.bottom);
          if (other.top >= box.bottom) edges.bottom = Math.min(edges.bottom, other.top - box.bottom);
        }
      }
      card.vines = growVines({ x: box.left - left, y: box.top - top, width: box.width, height: box.height }, edges, card.cool);
    });
    dirty = false;
  };

  const clear = () => {
    field.width = field.height = 1;
    previous = 0;
    dirty = true;
  };
  const paint = (now: number) => {
    frame = 0;
    const active = reduced.matches ? undefined : pointer ?? focus;
    const elapsed = previous ? Math.min(45, now - previous) : 16;
    previous = now;
    for (const card of cards) {
      card.growth = reduced.matches ? 0 : card === active
        ? Math.min(1, card.growth + elapsed / 1060)
        : Math.max(0, card.growth - elapsed / 415);
    }
    if (!cards.some(card => card.growth > 0)) { clear(); return; }
    context ??= field.getContext("2d");
    if (!context) return;
    if (dirty) measure();
    context.clearRect(0, 0, width, height);
    for (const card of cards) if (card.growth > 0) paintVines(context, card.vines, card.growth, card.cool);
    if (cards.some(card => card.growth !== (card === active ? 1 : 0))) request();
    else previous = 0;
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(paint); };

  const listeners = new AbortController();
  const { signal } = listeners;
  for (const card of cards) {
    const { element } = card;
    element.addEventListener("pointerenter", event => {
      if (!hover.matches || event.pointerType === "touch") return;
      pointer = card;
      request();
    }, { signal });
    element.addEventListener("pointerleave", () => {
      if (pointer === card) { pointer = undefined; request(); }
    }, { signal });
    element.addEventListener("focus", () => {
      if (element.matches(":focus-visible")) { focus = card; request(); }
    }, { signal });
    element.addEventListener("blur", () => {
      if (focus === card) { focus = undefined; request(); }
    }, { signal });
  }
  const preferencesChanged = () => {
    if (!hover.matches) pointer = undefined;
    request();
  };
  const resized = () => {
    dirty = true;
    if (pointer || focus || cards.some(card => card.growth > 0)) request();
  };
  const observer = new ResizeObserver(resized);
  observer.observe(grid);
  window.addEventListener("resize", resized, { signal, passive: true });
  reduced.addEventListener("change", preferencesChanged, { signal });
  hover.addEventListener("change", preferencesChanged, { signal });

  return () => {
    listeners.abort();
    observer.disconnect();
    cancelAnimationFrame(frame);
    clear();
  };
}

export function CardVines({ grid, selector, className }: {
  grid: RefObject<HTMLElement | null>;
  selector: string;
  className: string;
}) {
  const field = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (field.current && grid.current) return attachVines(field.current, grid.current, selector);
  }, [grid, selector]);
  return <canvas ref={field} className={className} width={1} height={1} data-swarm-ignore aria-hidden="true" />;
}
