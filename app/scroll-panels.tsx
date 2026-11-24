"use client";

import { useEffect } from "react";

const selector = "[data-reveal]";
const entering = "is-panel-entering";
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
      if (!down || !visible.size) return;

      const limit = window.innerHeight - bottomInset;
      const panels = [...visible].filter(target => {
        const bounds = target.getBoundingClientRect();
        return target.isConnected && bounds.height > 0 && bounds.bottom > 0 && bounds.top <= limit;
      });
      for (const target of panels) {
        visible.delete(target);
        seen.add(target);
        intersection.unobserve(target);
        if (!reduced.matches && !target.matches(":focus-within")) target.classList.add(entering);
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
      // A panel already exposed near the top is ready to read. One peeking
      // in below the fold can still reveal on the first downward scroll.
      if (bounds.height > 0 && (bounds.top < innerHeight / 2 || bounds.bottom <= innerHeight)) {
        seen.add(target);
        return;
      }
      intersection.observe(target);
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
            }
          }
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    const finish = (event: AnimationEvent) => {
      if (event.animationName === "editorial-panel-in" && event.target instanceof Element) {
        event.target.classList.remove(entering);
      }
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
      document.querySelectorAll("." + entering).forEach(el => el.classList.remove(entering));
    };
  }, []);

  return null;
}
