"use client";

import { useEffect, useRef, type RefObject } from "react";
import { growVines, paintVines } from "./resources/resource-vine-drawing";

function attachVines(field: HTMLCanvasElement, grid: HTMLElement, selector: string, restGrowth: number) {
  const shell = field.parentElement;
  const section = grid.closest("section");
  if (!shell || !section) return;
  const boundary = shell.closest(".site-shell") ?? shell;
  const hover = matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const elements = grid.matches(selector) ? [grid] : Array.from(grid.querySelectorAll<HTMLElement>(selector));
  const cards = elements.map(element => ({
    element, cool: element.dataset.vineTone === "cool",
    growth: 0, vines: [] as ReturnType<typeof growVines>,
  }));
  type Card = typeof cards[number];
  let pointer: Card | undefined, focus: Card | undefined;
  let visible = restGrowth === 0;
  let frame = 0, previous = 0, width = 1, height = 1, dirty = true;
  let context: CanvasRenderingContext2D | null = null;

  const measure = () => {
    const parent = shell.getBoundingClientRect();
    const bounds = boundary.getBoundingClientRect();
    const group = grid.getBoundingClientRect();
    const padding = section.getBoundingClientRect();
    const neighbor = section.querySelector("[data-vine-obstacle]")?.getBoundingClientRect();
    const horizontalLimit = neighbor && neighbor.left >= group.right ? Math.max(group.right, neighbor.left - 4) : bounds.right;
    const verticalLimit = neighbor && neighbor.top >= group.bottom ? Math.max(group.bottom, neighbor.top - 4) : padding.bottom;
    const left = Math.max(bounds.left, group.left - 104);
    const right = Math.min(bounds.right, horizontalLimit, group.right + 104);
    const top = Math.max(padding.top, group.top - 92);
    const bottom = Math.min(padding.bottom, verticalLimit, group.bottom + 69);
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
    if (!visible || document.hidden) { previous = 0; return; }
    const active = reduced.matches ? undefined : pointer ?? focus;
    const target = (card: Card) => card === active ? 1 : restGrowth;
    const elapsed = previous ? Math.min(45, now - previous) : 16;
    previous = now;
    for (const card of cards) {
      const goal = target(card);
      const growing = card.growth < goal;
      card.growth = reduced.matches ? goal : growing
        ? Math.min(goal, card.growth + elapsed / (card === active ? 1060 : 1800))
        : Math.max(goal, card.growth - elapsed / 415);
    }
    if (!cards.some(card => card.growth > 0)) { clear(); return; }
    context ??= field.getContext("2d");
    if (!context) return;
    if (dirty) measure();
    context.clearRect(0, 0, width, height);
    for (const card of cards) if (card.growth > 0) paintVines(context, card.vines, card.growth, card.cool);
    if (cards.some(card => card.growth !== target(card))) request();
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
  const visibilityChanged = () => {
    if (restGrowth > 0) grid.dataset.vinesVisible = String(visible && !document.hidden);
    if (visible && !document.hidden) request();
  };
  const observer = new ResizeObserver(resized);
  observer.observe(grid);
  const viewport = restGrowth > 0 ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visibilityChanged();
  }, { rootMargin: "64px 0px" }) : undefined;
  viewport?.observe(grid);
  document.addEventListener("visibilitychange", visibilityChanged, { signal });
  shell.addEventListener("transitionend", event => {
    if (event.target === shell && event.propertyName === "transform") resized();
  }, { signal });
  window.addEventListener("resize", resized, { signal, passive: true });
  reduced.addEventListener("change", preferencesChanged, { signal });
  hover.addEventListener("change", preferencesChanged, { signal });

  return () => {
    listeners.abort();
    observer.disconnect();
    viewport?.disconnect();
    delete grid.dataset.vinesVisible;
    cancelAnimationFrame(frame);
    clear();
  };
}

export function CardVines({ grid, selector, className, restGrowth = 0 }: {
  grid: RefObject<HTMLElement | null>;
  selector: string;
  className: string;
  restGrowth?: number;
}) {
  const field = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (field.current && grid.current) return attachVines(field.current, grid.current, selector, restGrowth);
  }, [grid, selector, restGrowth]);
  return <canvas ref={field} className={className} width={1} height={1} data-swarm-ignore aria-hidden="true" />;
}
