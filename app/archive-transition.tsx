"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function ArchiveTransitionListener({ currentPath }: { currentPath: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const startTransition = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;

      const destination = new URL(link.href, window.location.href);
      const normalizedPath = destination.pathname.replace(/\/+$/, "") || "/";
      if (
        destination.origin !== window.location.origin ||
        normalizedPath !== "/work" ||
        currentPath === "/work"
      ) {
        return;
      }

      setActive(true);
    };

    document.addEventListener("click", startTransition, true);
    return () => document.removeEventListener("click", startTransition, true);
  }, [currentPath]);

  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    root.classList.add("archive-is-transitioning");
    const safetyTimer = window.setTimeout(() => setActive(false), 10000);

    return () => {
      root.classList.remove("archive-is-transitioning");
      window.clearTimeout(safetyTimer);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="archive-transition"
      role="status"
      aria-live="polite"
      aria-label="Opening work archive / 正在開啟作品集"
    >
      <div className="archive-transition-grid" aria-hidden="true" />
      <div className="archive-transition-ghost" aria-hidden="true">WORK</div>
      <div className="archive-transition-content">
        <div className="archive-transition-meta">
          <span>SPRING YEARN / VISUAL PRACTICE</span>
          <span>OPENING ARCHIVE</span>
        </div>
        <div className="archive-transition-stage" aria-hidden="true">
          <div className="archive-transition-orbit">
            <span />
            <span />
          </div>
          <div className="archive-transition-index">
            <span>INDEX</span>
            <strong>00—∞</strong>
          </div>
        </div>
        <div className="archive-transition-copy">
          <div>
            <strong>CURATING THE FRAME</strong>
            <span>正在整理作品</span>
          </div>
          <div className="archive-transition-progress" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArchiveTransition() {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";

  return <ArchiveTransitionListener key={currentPath} currentPath={currentPath} />;
}
