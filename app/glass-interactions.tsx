"use client";

import { useEffect, useId, useRef } from "react";

const controls = "button, a[href], summary, [role=button], [role=option]";
const disabled = ":disabled, [aria-disabled=true], [inert]";
const reach = 13;
const settle = .065;
type Pointer = { x: number; y: number; target: EventTarget | null };
type Edge = { x: number; y: number; nx: number; ny: number; pull: number; width: number; height: number };
type FilterState = { value: string; priority: string; applied: string };

function surfaceFor(target: EventTarget | null) {
  const control = target instanceof Element ? target.closest<HTMLElement>(controls) : null;
  if (!control || control.closest(disabled)) return null;
  const surface = control.matches(".item-preview-link") ? control.querySelector<HTMLElement>(".item-preview-play") ?? control : control;
  return getComputedStyle(surface).getPropertyValue("--glass-interactive").trim() === "1" ? surface : null;
}

function edgeAt(element: HTMLElement, pointer: Pointer): Edge | null {
  const rect = element.getBoundingClientRect();
  const width = element.offsetWidth, height = element.offsetHeight;
  if (!rect.width || !rect.height || !width || !height) return null;
  const x = (pointer.x - rect.left) * width / rect.width;
  const y = (pointer.y - rect.top) * height / rect.height;
  const outside = Math.max(-x, -y, x - width, y - height);
  if (outside > 7) return null;
  const px = Math.max(0, Math.min(width, x)), py = Math.max(0, Math.min(height, y));
  const sides = [
    { distance: Math.abs(x), x: 0, y: py, nx: -1, ny: 0 },
    { distance: Math.abs(width - x), x: width, y: py, nx: 1, ny: 0 },
    { distance: Math.abs(y), x: px, y: 0, nx: 0, ny: -1 },
    { distance: Math.abs(height - y), x: px, y: height, nx: 0, ny: 1 },
  ];
  const { distance, ...side } = sides.reduce((a, b) => a.distance <= b.distance ? a : b);
  const span = Math.min(reach, Math.min(width, height) * .36);
  const pull = Math.max(0, 1 - Math.max(distance, outside) / span) ** .8;
  return { ...side, pull: pull * 8.4, width, height };
}

function displacementBrush() {
  const canvas = document.createElement("canvas");
  const size = 64;
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const pixels = context.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + .5) / (size / 2) - 1;
      const dy = (y + .5) / (size / 2) - 1;
      const ink = Math.round(255 * Math.max(0, 1 - dx * dx - dy * dy) ** 2);
      const i = (y * size + x) * 4;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = ink;
      pixels.data[i + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL();
}

export function GlassInteractions() {
  const id = "glass-edge-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filter = useRef<SVGFilterElement>(null);
  const brush = useRef<SVGFEImageElement>(null);
  const tint = useRef<SVGFEColorMatrixElement>(null);
  const warp = useRef<SVGFEDisplacementMapElement>(null);

  useEffect(() => {
    const lens = filter.current, image = brush.current, vector = tint.current, shift = warp.current;
    if (!lens || !image || !vector || !shift) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const presses = new Set<Animation>();
    const lastPress = new WeakMap<HTMLElement, Animation>();
    const events = new AbortController();
    const { signal } = events;
    let active: HTMLElement | null = null, original: FilterState | null = null;
    let pointer: Pointer | null = null, pending = false;
    let current: Edge | null = null, goal: Edge | null = null;
    let frame = 0, previous = 0;
    let texture: string | null | undefined;

    const detach = () => {
      if (active && original && active.style.getPropertyValue("filter") === original.applied) {
        if (original.value) active.style.setProperty("filter", original.value, original.priority);
        else active.style.removeProperty("filter");
      }
      active = null;
      original = null;
      current = goal = null;
    };
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = previous = 0;
      pointer = null;
      pending = false;
      detach();
    };
    const draw = (now: number) => {
      frame = 0;
      if (reduced.matches || !fine.matches || document.hidden) { clear(); return; }
      const blend = 1 - Math.exp(-Math.min(48, previous ? now - previous : 16) / 46);
      previous = now;
      if (pending) {
        pending = false;
        const candidate = surfaceFor(pointer?.target ?? null);
        if (candidate && candidate !== active) { detach(); active = candidate; }
        goal = active && pointer ? edgeAt(active, pointer) : null;
      }
      if (!active?.isConnected || (!current && !goal?.pull)) { detach(); return; }
      current ??= { ...goal!, pull: 0 };
      const target = goal ?? { ...current, pull: 0 };
      current.x += (target.x - current.x) * blend;
      current.y += (target.y - current.y) * blend;
      current.nx += (target.nx - current.nx) * blend;
      current.ny += (target.ny - current.ny) * blend;
      current.pull += (target.pull - current.pull) * blend;
      if (target.pull === 0 && current.pull <= settle) { detach(); return; }

      texture = texture === undefined ? displacementBrush() : texture;
      if (!texture) { detach(); return; }
      if (!image.hasAttribute("href")) image.setAttribute("href", texture);
      const { width, height, x, y, nx, ny, pull } = current;
      const size = Math.max(26, Math.min(76, Math.min(width, height) * 1.36));
      // The brush shifts only the small arc of glass immediately under the pointer.
      image.setAttribute("x", (x - size / 2).toFixed(2));
      image.setAttribute("y", (y - size / 2).toFixed(2));
      image.setAttribute("width", size.toFixed(2));
      image.setAttribute("height", size.toFixed(2));
      vector.setAttribute("values", `${(-nx / 2).toFixed(3)} 0 0 0 .5 ${(-ny / 2).toFixed(3)} 0 0 0 .5 0 0 0 0 .5 0 0 0 1 0`);
      shift.setAttribute("scale", pull.toFixed(3));
      if (!original) {
        lens.setAttribute("width", String(width + 28));
        lens.setAttribute("height", String(height + 28));
        const value = active.style.getPropertyValue("filter");
        const priority = active.style.getPropertyPriority("filter");
        const existing = getComputedStyle(active).filter;
        active.style.setProperty("filter", `${existing === "none" ? "" : existing + " "}url("#${id}")`, priority);
        original = { value, priority, applied: active.style.getPropertyValue("filter") };
      }
      const difference = Math.abs(target.pull - pull) + Math.hypot(target.x - x, target.y - y) +
        4 * Math.hypot(target.nx - nx, target.ny - ny);
      if (difference > settle) request();
      else previous = 0;
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const move = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY, target: event.target };
      pending = true;
      request();
    };
    const press = (target: EventTarget | null) => {
      if (reduced.matches || document.hidden) return;
      const surface = surfaceFor(target);
      if (!surface?.animate || !surface.offsetWidth || !surface.offsetHeight) return;
      lastPress.get(surface)?.cancel();
      const radius = Number.parseFloat(getComputedStyle(surface).borderTopLeftRadius) || 0;
      const corner = `${radius}px`;
      const spread = 1 + Math.min(.037, 3.5 / surface.offsetWidth);
      const squash = 1 - Math.min(.115, 4.8 / surface.offsetHeight);
      const animation = surface.animate([
        { scale: "1", borderRadius: corner, easing: "cubic-bezier(.2,.76,.25,1)" },
        { scale: `${spread} ${squash}`, borderRadius: `${radius + 4}px`, offset: .24, easing: "cubic-bezier(.18,.68,.3,1)" },
        { scale: "1 1.019", borderRadius: corner, offset: .59 },
        { scale: "1", borderRadius: corner },
      ], { duration: 420 });
      presses.add(animation);
      lastPress.set(surface, animation);
      const finish = () => {
        presses.delete(animation);
        if (lastPress.get(surface) === animation) lastPress.delete(surface);
      };
      animation.onfinish = animation.oncancel = finish;
    };
    const stop = () => {
      clear();
      presses.forEach(animation => animation.cancel());
      presses.clear();
    };

    window.addEventListener("pointermove", move, { passive: true, signal });
    window.addEventListener("pointerout", event => { if (!event.relatedTarget) clear(); }, { signal });
    window.addEventListener("pointerdown", event => {
      if (event.isPrimary && event.button === 0) press(event.target);
    }, { passive: true, capture: true, signal });
    window.addEventListener("click", event => { if (event.detail === 0) press(event.target); }, { capture: true, signal });
    window.addEventListener("scroll", clear, { passive: true, capture: true, signal });
    window.addEventListener("resize", clear, { passive: true, signal });
    window.addEventListener("blur", stop, { signal });
    document.addEventListener("visibilitychange", stop, { signal });
    fine.addEventListener("change", clear, { signal });
    reduced.addEventListener("change", stop, { signal });
    return () => { events.abort(); stop(); };
  }, [id]);

  return <svg className="screen-ripple-defs" aria-hidden="true" focusable="false">
    <defs>
      <filter ref={filter} id={id} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse"
        x="-14" y="-14" width="1" height="1" colorInterpolationFilters="sRGB">
        <feFlood floodColor="#808080" result="neutral" />
        <feImage ref={brush} preserveAspectRatio="none" result="brush" x="0" y="0" width="1" height="1" />
        <feColorMatrix ref={tint} in="brush" type="matrix" result="direction" />
        <feMerge result="map"><feMergeNode in="neutral" /><feMergeNode in="direction" /></feMerge>
        <feDisplacementMap ref={warp} in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>;
}
