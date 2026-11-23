"use client";

import { useEffect, useRef } from "react";

const interactive = "a, button, input, select, summary, [role=combobox], [role=option]";

export function HomeCursor() {
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = marker.current;
    if (!cursor) return;

    const root = document.documentElement;
    const finePointer = window.matchMedia("(pointer: fine)");
    const events = new AbortController();
    const options = { passive: true, signal: events.signal };

    const release = () => cursor.classList.remove("is-pressed");
    const hide = () => {
      cursor.classList.remove("is-visible", "is-active", "is-pressed");
      root.classList.remove("has-art-cursor");
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== "mouse") {
        hide();
        return;
      }
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
      if (!cursor.classList.contains("is-visible")) {
        cursor.classList.add("is-visible");
        root.classList.add("has-art-cursor");
      }
      cursor.classList.toggle("is-active",
        event.target instanceof Element && event.target.closest(interactive) !== null);
    };

    window.addEventListener("pointermove", move, options);
    window.addEventListener("pointerover", move, options);
    window.addEventListener("pointerdown", (event) => {
      move(event);
      if (cursor.classList.contains("is-visible")) cursor.classList.add("is-pressed");
    }, options);
    window.addEventListener("pointerup", release, options);
    window.addEventListener("pointercancel", hide, options);
    window.addEventListener("pointerout", event => {
      if (!event.relatedTarget) hide();
    }, options);
    window.addEventListener("blur", hide, options);
    finePointer.addEventListener("change", hide, options);

    return () => {
      events.abort();
      hide();
    };
  }, []);

  return (
    <div ref={marker} className="art-cursor" aria-hidden="true">
      <span className="cursor-ring" />
      <span className="cursor-core" />
    </div>
  );
}
