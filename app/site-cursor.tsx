"use client";

import { useEffect, useRef, type Ref } from "react";

const interactive = "a, button, input, select, summary, [role=combobox], [role=option], [role=menuitemradio]";
const labDialog = ".lab-download-dialog[open]";

export function CursorMark({ markerRef, inDialog = false }: {
  markerRef?: Ref<HTMLDivElement>;
  inDialog?: boolean;
}) {
  return (
    <div ref={markerRef} className={`art-cursor${inDialog ? " lab-dialog-cursor" : ""}`} aria-hidden="true">
      <span className="cursor-ring" />
      <span className="cursor-core" />
    </div>
  );
}

export function SiteCursor() {
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pageMark = marker.current;
    if (!pageMark) return;

    const root = document.documentElement;
    const finePointer = window.matchMedia("(pointer: fine)");
    const events = new AbortController();
    const options = { passive: true, signal: events.signal };

    let activeMark: HTMLElement = pageMark;
    let dialogMark: HTMLElement | null = null;
    let point: { x: number; y: number } | null = null;
    let pressed = false;
    const resetMark = (element: HTMLElement) => element.classList.remove("is-visible", "is-active", "is-pressed");
    const release = () => {
      pressed = false;
      activeMark.classList.remove("is-pressed");
    };
    const hide = () => {
      point = null;
      pressed = false;
      resetMark(activeMark);
      root.classList.remove("has-art-cursor");
    };
    const paint = (target: Element | null) => {
      if (!point) return;
      const nextMark = dialogMark?.closest(labDialog) ? dialogMark : pageMark;
      if (nextMark !== activeMark) {
        resetMark(activeMark);
        activeMark = nextMark;
      }
      activeMark.style.setProperty("--cursor-x", `${point.x}px`);
      activeMark.style.setProperty("--cursor-y", `${point.y}px`);
      if (!activeMark.classList.contains("is-visible")) {
        activeMark.classList.add("is-visible");
        root.classList.add("has-art-cursor");
      }
      activeMark.classList.toggle("is-active", !!target?.closest(interactive));
      activeMark.classList.toggle("is-pressed", pressed);
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== "mouse") {
        hide();
        return;
      }
      const target = event.target instanceof Element ? event.target : null;
      const dialog = target?.closest(labDialog);
      if (dialog && dialogMark?.parentElement !== dialog) dialogMark = dialog.querySelector<HTMLElement>(".lab-dialog-cursor");
      point = { x: event.clientX, y: event.clientY };
      paint(target);
    };
    const toggleDialog = (event: Event) => {
      const dialog = event.target;
      if (!(dialog instanceof HTMLDialogElement) || !dialog.classList.contains("lab-download-dialog")) return;
      if (dialog.open) dialogMark = dialog.querySelector<HTMLElement>(".lab-dialog-cursor");
      else if (dialogMark?.parentElement === dialog) dialogMark = null;
      release();
      paint(point ? document.elementFromPoint(point.x, point.y) : null);
    };

    window.addEventListener("pointermove", move, options);
    window.addEventListener("pointerover", move, options);
    window.addEventListener("pointerdown", (event) => {
      pressed = true;
      move(event);
    }, options);
    window.addEventListener("pointerup", release, options);
    window.addEventListener("pointercancel", hide, options);
    window.addEventListener("pointerout", event => {
      if (!event.relatedTarget) hide();
    }, options);
    window.addEventListener("blur", hide, options);
    document.addEventListener("toggle", toggleDialog, { ...options, capture: true });
    finePointer.addEventListener("change", hide, options);

    return () => {
      events.abort();
      hide();
    };
  }, []);

  return <CursorMark markerRef={marker} />;
}
