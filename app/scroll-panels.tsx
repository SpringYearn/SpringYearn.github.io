"use client";

import { useEffect } from "react";

const panelSelector = "[data-reveal]";
const textSelector = "[data-reveal-text]";
const selector = `${panelSelector}, ${textSelector}`;
const entering = "is-panel-entering";
const textPending = "is-reveal-text-pending";
const textEntering = "is-reveal-text-entering";
const animationClasses = [entering, textPending, textEntering];
const bottomInset = 56;

export function ScrollPanels() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const seen = new WeakSet<Element>();
    const visible = new Set<Element>();
    let lastY = window.scrollY;
    let down = false;
    const revealVisible = () => {
      const next = window.scrollY;
      if (next !== lastY) {
        down = next > lastY;
        lastY = next;
      }
      if (!visible.size) return;

      const limit = window.innerHeight - bottomInset;
      const targets = [...visible].filter(target => {
        if (!down && !target.matches(textSelector)) return false;
        const bounds = target.getBoundingClientRect();
        return target.isConnected && bounds.height > 0 && bounds.bottom > 0 && bounds.top <= limit;
      });
      for (const target of targets) {
        visible.delete(target);
        seen.add(target);
        intersection.unobserve(target);
        target.classList.remove(textPending);
        const isText = target.matches(textSelector);
        const panel = isText ? target.closest(panelSelector) : target;
        if (down && !reduced.matches && !panel?.matches(":focus-within")) {
          target.classList.add(isText ? textEntering : entering);
        }
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
              target.classList.remove(...animationClasses);
            }
          }
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    const finish = (event: AnimationEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.animationName === "editorial-panel-in") event.target.classList.remove(entering);
      if (event.animationName === "editorial-panel-text") event.target.classList.remove(textEntering);
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
        .forEach(el => el.classList.remove(...animationClasses));
    };
  }, []);

  return null;
}
