"use client";

import { useEffect } from "react";

const selector = "[data-reveal]";
const entering = "is-panel-entering";

export function ScrollPanels() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const seen = new WeakSet<Element>();
    let lastY = window.scrollY;
    let down = false;
    const onScroll = () => {
      const next = window.scrollY;
      down = next > lastY;
      lastY = next;
    };
    const intersection = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        intersection.unobserve(entry.target);
        if (down && !reduced.matches && entry.boundingClientRect.top >= 0) {
          entry.target.classList.add(entering);
        }
      }
    }, { threshold: .09, rootMargin: "0px 0px -4% 0px" });

    const elementsIn = (node: Node) => {
      if (!(node instanceof Element)) return [];
      return node.matches(selector) ? [node, ...node.querySelectorAll(selector)] : [...node.querySelectorAll(selector)];
    };
    const observe = (target: Element) => {
      if (seen.has(target)) return;
      seen.add(target);
      if (target.getBoundingClientRect().top >= innerHeight - 12) intersection.observe(target);
    };
    document.querySelectorAll(selector).forEach(observe);
    const mutations = new MutationObserver(records => {
      for (const { addedNodes, removedNodes } of records) {
        for (const node of addedNodes) elementsIn(node).forEach(observe);
        for (const node of removedNodes) {
          for (const target of elementsIn(node)) {
            if (!target.isConnected) intersection.unobserve(target);
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
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("animationend", finish);
    document.addEventListener("animationcancel", finish);
    return () => {
      intersection.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("animationend", finish);
      document.removeEventListener("animationcancel", finish);
      document.querySelectorAll("." + entering).forEach(el => el.classList.remove(entering));
    };
  }, []);

  return null;
}
