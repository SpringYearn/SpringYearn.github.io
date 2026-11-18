"use client";

import { useEffect, useId, useRef } from "react";

const controls = "button, a[href], summary, [role=button], [role=option]";
const disabled = ":disabled, [aria-disabled=true], [inert]";
const reach = 30;
const pullLimit = 10.4;
const settle = .065;
type Pointer = { x: number; y: number; target: EventTarget | null };
type Edge = { x: number; y: number; nx: number; ny: number; pull: number; width: number; height: number };
type StyleState = { value: string; priority: string; applied: string };
type Offset = { x: number; y: number };
type MotionProperty = "filter" | "translate";

function applyStyle(element: HTMLElement, property: MotionProperty, value: string, original?: StyleState) {
  const state = original ?? { value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property), applied: "" };
  element.style.setProperty(property, value, state.priority);
  state.applied = element.style.getPropertyValue(property);
  return state;
}

function restoreStyle(element: HTMLElement, property: MotionProperty, state?: StyleState) {
  if (!state || element.style.getPropertyValue(property) !== state.applied) return;
  if (state.value) element.style.setProperty(property, state.value, state.priority);
  else element.style.removeProperty(property);
}

function surfaceFor(target: EventTarget | null) {
  const control = target instanceof Element ? target.closest<HTMLElement>(controls) : null;
  if (!control || control.closest(disabled)) return null;
  const surface = control.matches(".item-preview-link") ? control.querySelector<HTMLElement>(".item-preview-play") ?? control : control;
  return getComputedStyle(surface).getPropertyValue("--glass-interactive").trim() === "1" ? surface : null;
}

function edgeAt(element: HTMLElement, pointer: Pointer, drift: Offset): Edge | null {
  const rect = element.getBoundingClientRect();
  const width = element.offsetWidth, height = element.offsetHeight;
  if (!rect.width || !rect.height || !width || !height) return null;
  // Measure against the resting hit area so the surface cannot chase its own motion.
  const x = (pointer.x - rect.left + drift.x) * width / rect.width;
  const y = (pointer.y - rect.top + drift.y) * height / rect.height;
  const outside = Math.max(-x, -y, x - width, y - height);
  if (outside > 11) return null;
  const px = Math.max(0, Math.min(width, x)), py = Math.max(0, Math.min(height, y));
  const span = Math.min(reach, Math.min(width, height) * .66);
  const weight = (distance: number) => Math.max(0, 1 - Math.max(Math.abs(distance), outside) / span) ** 1.65;
  const left = weight(x), right = weight(width - x), top = weight(y), bottom = weight(height - y);
  // Blend the two sides of a corner so the direction changes continuously.
  const dx = right - left, dy = bottom - top;
  const strength = Math.hypot(dx, dy);
  if (strength < .004) return null;
  const total = left + right + top + bottom;
  return {
    x: (right * width + (top + bottom) * px) / total,
    y: (bottom * height + (left + right) * py) / total,
    nx: dx / strength, ny: dy / strength, pull: Math.min(1, strength) * pullLimit, width, height,
  };
}

function displacementBrush() {
  const canvas = document.createElement("canvas");
  const size = 224;
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

function positionBrush(element: SVGFEImageElement, cx: number, cy: number, width: number, height: number) {
  element.setAttribute("x", (cx - width / 2).toFixed(2));
  element.setAttribute("y", (cy - height / 2).toFixed(2));
  element.setAttribute("width", width.toFixed(2));
  element.setAttribute("height", height.toFixed(2));
}

export function GlassInteractions() {
  const id = "glass-edge-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filter = useRef<SVGFilterElement>(null);
  const brush = useRef<SVGFEImageElement>(null);
  const rimBrush = useRef<SVGFEImageElement>(null);
  const softener = useRef<SVGFEGaussianBlurElement>(null);
  const tint = useRef<SVGFEColorMatrixElement>(null);
  const warp = useRef<SVGFEDisplacementMapElement>(null);

  useEffect(() => {
    const lens = filter.current, image = brush.current, rim = rimBrush.current, blur = softener.current;
    const vector = tint.current, shift = warp.current;
    if (!lens || !image || !rim || !blur || !vector || !shift) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const presses = new Set<Animation>();
    const lastPress = new WeakMap<HTMLElement, Animation>();
    const events = new AbortController();
    const { signal } = events;
    let active: HTMLElement | null = null;
    let originalFilter: StyleState | undefined, originalTranslate: StyleState | undefined;
    const drift: Offset = { x: 0, y: 0 };
    let pointer: Pointer | null = null, pending = false;
    let current: Edge | null = null, goal: Edge | null = null;
    let frame = 0, previous = 0;
    let texture: string | null | undefined;

    const detach = () => {
      if (active) {
        restoreStyle(active, "filter", originalFilter);
        restoreStyle(active, "translate", originalTranslate);
      }
      active = null;
      originalFilter = originalTranslate = undefined;
      drift.x = drift.y = 0;
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
      const elapsed = Math.min(48, previous ? now - previous : 16);
      previous = now;
      if (pending) {
        pending = false;
        const candidate = surfaceFor(pointer?.target ?? null);
        if (candidate && candidate !== active) { detach(); active = candidate; }
        goal = active && pointer ? edgeAt(active, pointer, drift) : null;
      }
      if (!active?.isConnected || active.closest(disabled) || (!current && !goal?.pull)) { detach(); return; }
      current ??= { ...goal!, pull: 0 };
      const target = goal ?? { ...current, pull: 0 };
      const blend = 1 - Math.exp(-elapsed / (target.pull ? 56 : 84));
      current.x += (target.x - current.x) * blend;
      current.y += (target.y - current.y) * blend;
      current.nx += (target.nx - current.nx) * blend;
      current.ny += (target.ny - current.ny) * blend;
      current.pull += (target.pull - current.pull) * blend;
      if (target.pull === 0 && current.pull <= settle) { detach(); return; }

      texture = texture === undefined ? displacementBrush() : texture;
      if (!texture) { detach(); return; }
      if (!image.hasAttribute("href")) {
        image.setAttribute("href", texture);
        rim.setAttribute("href", texture);
      }
      const { width, height, x, y, nx, ny, pull } = current;
      const ax = Math.abs(nx), ay = Math.abs(ny);
      const normalSpan = Math.min(66, Math.max(26, Math.min(width, height) * .80));
      const spanX = ax * normalSpan + (1 - ax) * Math.min(320, Math.max(82, width * 1.24));
      const spanY = ay * normalSpan + (1 - ay) * Math.min(224, Math.max(64, height * 1.38));
      positionBrush(image, x, y, spanX, spanY);
      // Smooth along the rim's tangent, within a narrow mask away from the label.
      positionBrush(rim, x + nx * pull / 2, y + ny * pull / 2,
        22 + (spanX - 22) * (1 - ax), 22 + (spanY - 22) * (1 - ay));
      blur.setAttribute("stdDeviation", `${(.46 + 3.55 * ay).toFixed(2)} ${(.46 + 3.55 * ax).toFixed(2)}`);
      vector.setAttribute("values", `${(-nx / 2).toFixed(3)} 0 0 0 .5 ${(-ny / 2).toFixed(3)} 0 0 0 .5 0 0 0 0 .5 0 0 0 1 0`);
      shift.setAttribute("scale", pull.toFixed(3));
      if (!originalFilter) {
        lens.setAttribute("width", String(width + 32));
        lens.setAttribute("height", String(height + 32));
        const existing = getComputedStyle(active).filter;
        originalFilter = applyStyle(active, "filter", `${existing === "none" ? "" : existing + " "}url("#${id}")`);
      }
      const follow = pull / pullLimit * 3.8;
      drift.x = (nx * .86 + .28 * (x / width - .5)) * follow;
      drift.y = (ny * .86 + .28 * (y / height - .5)) * follow;
      originalTranslate = applyStyle(active, "translate", `${drift.x.toFixed(3)}px ${drift.y.toFixed(3)}px`, originalTranslate);
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
        x="-16" y="-16" width="1" height="1" colorInterpolationFilters="sRGB">
        <feFlood floodColor="#808080" result="neutral" />
        <feImage ref={brush} preserveAspectRatio="none" result="brush" x="0" y="0" width="1" height="1" />
        <feColorMatrix ref={tint} in="brush" type="matrix" result="direction" />
        <feMerge result="map"><feMergeNode in="neutral" /><feMergeNode in="direction" /></feMerge>
        <feDisplacementMap ref={warp} in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="pulled" />
        <feImage ref={rimBrush} preserveAspectRatio="none" result="rim" x="0" y="0" width="1" height="1" />
        <feColorMatrix in="rim" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" result="rimMask" />
        <feGaussianBlur ref={softener} in="pulled" stdDeviation=".46" result="softened" />
        <feComposite in="softened" in2="rimMask" operator="in" result="softRim" />
        <feComposite in="pulled" in2="rimMask" operator="out" result="crispCenter" />
        <feComposite in="softRim" in2="crispCenter" operator="arithmetic" k2="1" k3="1" />
      </filter>
    </defs>
  </svg>;
}
