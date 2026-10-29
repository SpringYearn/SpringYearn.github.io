"use client";

import { useEffect, useId, useRef } from "react";

const SVG_NS = "http://www.w3.org/2000/svg";
const duration = 880;
const directManipulation = 'input, textarea, select, video, audio, canvas, [contenteditable="true"], [role="slider"], .board-viewport, .spring-logo, [data-no-ripple]';

function svgElement<K extends keyof SVGElementTagNameMap>(name: K, attributes: Record<string, string>) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

function displacementTexture() {
  const size = 192;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + .5 - size / 2) / (size / 2);
      const dy = (y + .5 - size / 2) / (size / 2);
      const radius = Math.hypot(dx, dy);
      const band = (radius - .55) / .09;
      const wave = Math.sin((radius - .55) * 48) * Math.exp(-band * band);
      const offset = (y * size + x) * 4;
      image.data[offset] = Math.round(127.5 + 127.5 * dx / Math.max(radius, .001) * wave);
      image.data[offset + 1] = Math.round(127.5 + 127.5 * dy / Math.max(radius, .001) * wave);
      // The unused blue channel carries a soft crest mask for the light catch.
      image.data[offset + 2] = Math.round(255 * Math.exp(-Math.pow((radius - .55) / .035, 2)));
      image.data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

type Surface = {
  element: HTMLElement;
  filter: SVGFilterElement;
  image: SVGFEImageElement;
  displacement: SVGFEDisplacementMapElement;
  highlight: SVGFEFloodElement;
  original: string;
  priority: string;
  applied: string;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
};

export function ScreenRipple() {
  const definitions = useRef<SVGDefsElement>(null);
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const defs = definitions.current;
    if (!defs) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let texture: string | null = null;
    let frame = 0;
    let serial = 0;
    let surfaces: Surface[] = [];
    let pointer: { id: number; x: number; y: number; time: number } | null = null;

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      for (const surface of surfaces) {
        if (surface.element.style.getPropertyValue("filter") === surface.applied) {
          if (surface.original) surface.element.style.setProperty("filter", surface.original, surface.priority);
          else surface.element.style.removeProperty("filter");
        }
      }
      surfaces = [];
      defs.replaceChildren();
    };

    const start = (x: number, y: number) => {
      stop();
      if (reduced.matches || document.hidden) return;
      const root = document.querySelector<HTMLElement>(".site-shell");
      if (!root) return;
      texture ??= displacementTexture();
      if (!texture) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const path = window.location.pathname;
      for (const element of root.children) {
        if (!(element instanceof HTMLElement) || element.getAttribute("aria-hidden") === "true" || element.tagName === "DIALOG") continue;
        const style = window.getComputedStyle(element);
        if (style.position === "fixed") continue;
        const bounds = element.getBoundingClientRect();
        if (bounds.bottom <= 0 || bounds.top >= height || bounds.right <= 0 || bounds.left >= width || !bounds.width || !bounds.height) continue;
        // Filtering the content surfaces preserves the viewport positioning of the global cursor and overlays.
        if (element.querySelector(':not(dialog)[style*="position: fixed"]')) continue;
        const scaleX = bounds.width / Math.max(1, element.offsetWidth);
        const scaleY = bounds.height / Math.max(1, element.offsetHeight);
        const top = Math.max(0, bounds.top - 64);
        const bottom = Math.min(height, bounds.bottom + 64);
        const id = `screen-ripple-${prefix}-${serial++}`;
        const filter = svgElement("filter", {
          id, filterUnits: "userSpaceOnUse", primitiveUnits: "userSpaceOnUse",
          x: String(-bounds.left / scaleX), y: String((top - bounds.top) / scaleY),
          width: String(width / scaleX), height: String((bottom - top) / scaleY),
          "color-interpolation-filters": "sRGB",
        });
        const flood = svgElement("feFlood", { "flood-color": "#808000", result: "neutral" });
        const image = svgElement("feImage", { href: texture, preserveAspectRatio: "none", result: "wave", width: "1", height: "1" });
        const merge = svgElement("feMerge", { result: "map" });
        merge.append(svgElement("feMergeNode", { in: "neutral" }), svgElement("feMergeNode", { in: "wave" }));
        const displacement = svgElement("feDisplacementMap", { in: "SourceGraphic", in2: "map", scale: "0", xChannelSelector: "R", yChannelSelector: "G", result: "refracted" });
        const crest = svgElement("feColorMatrix", { in: "map", type: "matrix",
          values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 0", result: "crest" });
        const highlight = svgElement("feFlood", { "flood-color": "#ffffff", "flood-opacity": "0", result: "light" });
        const lightBand = svgElement("feComposite", { in: "light", in2: "crest", operator: "in", result: "lightBand" });
        // Atop keeps the original content alpha: the sheen never paints an extra ring over empty space.
        const sheen = svgElement("feComposite", { in: "lightBand", in2: "refracted", operator: "atop" });
        filter.append(flood, image, merge, displacement, crest, highlight, lightBand, sheen);
        defs.append(filter);
        const computed = style.filter;
        const original = element.style.getPropertyValue("filter");
        const priority = element.style.getPropertyPriority("filter");
        element.style.setProperty("filter", `${computed === "none" ? "" : computed + " "}url("#${id}")`);
        surfaces.push({ element, filter, image, displacement, highlight, original, priority,
          applied: element.style.getPropertyValue("filter"), left: bounds.left, top: bounds.top, scaleX, scaleY });
        if (surfaces.length === 8) break;
      }
      if (!surfaces.length) return;
      const distance = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
      const started = performance.now();
      const paint = (now: number) => {
        frame = 0;
        const progress = Math.max(0, (now - started) / duration);
        if (progress >= 1 || reduced.matches || document.hidden || !root.isConnected || window.location.pathname !== path) {
          stop();
          return;
        }
        const radius = (12 + distance * progress * 1.12) / .55;
        const envelope = Math.pow(Math.sin(Math.PI * progress), 1.2);
        const strength = (width < 600 ? 4.3 : 5.2) * envelope;
        const light = (width < 600 ? .06 : .08) * envelope;
        for (const surface of surfaces) {
          surface.image.setAttribute("x", String((x - radius - surface.left) / surface.scaleX));
          surface.image.setAttribute("y", String((y - radius - surface.top) / surface.scaleY));
          surface.image.setAttribute("width", String(radius * 2 / surface.scaleX));
          surface.image.setAttribute("height", String(radius * 2 / surface.scaleY));
          surface.displacement.setAttribute("scale", String(strength / surface.scaleX));
          surface.highlight.setAttribute("flood-opacity", String(light));
        }
        frame = requestAnimationFrame(paint);
      };
      frame = requestAnimationFrame(paint);
    };

    const down = (event: PointerEvent) => {
      stop();
      pointer = null;
      if (!event.isPrimary || event.button !== 0) return;
      if (reduced.matches || !(event.target instanceof Element) || event.target.closest(directManipulation)) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
    };
    const move = (event: PointerEvent) => {
      if (pointer?.id === event.pointerId && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 10) pointer = null;
    };
    const up = (event: PointerEvent) => {
      const active = pointer;
      pointer = null;
      if (active?.id === event.pointerId && performance.now() - active.time < 650 &&
        Math.hypot(event.clientX - active.x, event.clientY - active.y) <= 10) start(event.clientX, event.clientY);
    };
    const cancel = () => { pointer = null; stop(); };
    const viewportScroll = (event: Event) => {
      if (event.target === document || event.target === window) cancel();
    };
    const preferenceChanged = () => { if (reduced.matches) cancel(); };
    window.addEventListener("pointerdown", down, { passive: true, capture: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", cancel, { passive: true });
    window.addEventListener("scroll", viewportScroll, { passive: true, capture: true });
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("resize", cancel);
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", cancel);
    reduced.addEventListener("change", preferenceChanged);
    return () => {
      cancel();
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("scroll", viewportScroll, true);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("resize", cancel);
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", cancel);
      reduced.removeEventListener("change", preferenceChanged);
    };
  }, [prefix]);

  return <svg className="screen-ripple-defs" aria-hidden="true" focusable="false"><defs ref={definitions} /></svg>;
}
