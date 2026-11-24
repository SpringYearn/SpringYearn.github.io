"use client";

import { useEffect } from "react";

const panelSelector = "[data-reveal]";
const textSelector = "[data-reveal-text]";
const selector = `${panelSelector}, ${textSelector}`;
const entering = "is-panel-entering";
const textPending = "is-reveal-text-pending";
const textEntering = "is-reveal-text-entering";
const textDelay = "--reveal-text-delay";
const animationClasses = [entering, textPending, textEntering];
const bottomInset = 56;
const textInterval = 72;
const maxTextDelay = 432;

function clearEntrance(target: Element) {
  target.classList.remove(...animationClasses);
  if (target instanceof HTMLElement) target.style.removeProperty(textDelay);
}

export function ScrollPanels() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const seen = new WeakSet<Element>();
    const visible = new Set<Element>();
    let lastY = window.scrollY;
    let nextTextStart = 0;
    let down = false;
    const revealVisible = () => {
      const next = window.scrollY;
      if (next !== lastY) {
        down = next > lastY;
        lastY = next;
      }
      if (!visible.size) return;

      const limit = window.innerHeight - bottomInset;
      const targets = [...visible].flatMap(target => {
        const isText = target.matches(textSelector);
        if (!target.isConnected || (!down && !isText)) return [];
        const { top, left, bottom, height } = target.getBoundingClientRect();
        return height > 0 && bottom > 0 && top <= limit ? [{ target, isText, top, left }] : [];
      }).sort((a, b) => a.top - b.top || a.left - b.left);
      const now = performance.now();
      for (const { target, isText } of targets) {
        visible.delete(target);
        seen.add(target);
        intersection.unobserve(target);
        target.classList.remove(textPending);
        const panel = isText ? target.closest(panelSelector) : target;
        if (!down || reduced.matches || panel?.matches(":focus-within")) continue;
        if (isText && target instanceof HTMLElement) {
          const delay = Math.max(0, nextTextStart - now);
          // During a large scroll jump, show extra labels immediately instead of keeping them hidden.
          if (delay > maxTextDelay) continue;
          target.style.setProperty(textDelay, `${delay}ms`);
          nextTextStart = now + delay + textInterval;
        }
        target.classList.add(isText ? textEntering : entering);
      }
    };
    const intersection = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (seen.has(entry.target)) continue;
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      revealVisible();
    }, { rootMargin: `0px 0px -${bottomInset}px 0px` });

    const elementsIn = (node: Node) => {
      if (!(node instanceof Element)) return [];
      return node.matches(selector) ? [node, ...node.querySelectorAll(selector)] : [...node.querySelectorAll(selector)];
    };
    const observe = (target: Element) => {
      if (seen.has(target)) return;
      const bounds = target.getBoundingClientRect();
      const isText = target.matches(textSelector);
      // Keep already-readable text visible, including on a restored scroll position.
      const alreadyVisible = isText
        ? bounds.top < innerHeight
        : bounds.top < innerHeight / 2 || bounds.bottom <= innerHeight;
      if (bounds.height > 0 && alreadyVisible) {
        seen.add(target);
        return;
      }
      intersection.observe(target);
      if (isText) target.classList.add(textPending);
    };
    document.querySelectorAll(selector).forEach(observe);
    const mutations = new MutationObserver(records => {
      for (const { addedNodes, removedNodes } of records) {
        for (const node of addedNodes) elementsIn(node).forEach(observe);
        for (const node of removedNodes) {
          for (const target of elementsIn(node)) {
            if (!target.isConnected) {
              visible.delete(target);
              intersection.unobserve(target);
              clearEntrance(target);
            }
          }
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    const finish = (event: AnimationEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.animationName === "editorial-panel-in") event.target.classList.remove(entering);
      if (event.animationName === "editorial-panel-text") clearEntrance(event.target);
    };
    window.addEventListener("scroll", revealVisible, { passive: true });
    document.addEventListener("animationend", finish);
    document.addEventListener("animationcancel", finish);
    return () => {
      intersection.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", revealVisible);
      document.removeEventListener("animationend", finish);
      document.removeEventListener("animationcancel", finish);
      document.querySelectorAll(animationClasses.map(name => "." + name).join(", "))
        .forEach(clearEntrance);
    };
  }, []);

  return null;
}
