"use client";
import { Localized } from "./localized";

import { useEffect, useId, useRef } from "react";

export function SpringLogo({ language }: { language: "en" | "zh" }) {
  const host = useRef<HTMLDivElement>(null);
  const hintId = useId();
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let release: (() => void) | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      // Neither the renderer nor the model is requested until the logo is near view.
      import("./spring-logo-scene").then(async ({ mountSpringLogo }) => {
        if (disposed) return;
        const cleanup = await mountSpringLogo(element);
        if (disposed) cleanup();
        else release = cleanup;
      }).catch(() => { /* The original logo remains visible if WebGL is unavailable. */ });
    }, { rootMargin: "180px" });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); release?.(); };
  }, []);
  return <Localized>{(
    <>
      <div ref={host} className="spring-logo" role="img" tabIndex={-1} aria-describedby={hintId}
        aria-label={language === "zh" ? "SpringYearn 3D logo。拖曳或使用方向鍵旋轉，Home 重設角度。" : "SpringYearn 3D logo. Drag or use arrow keys to rotate. Home resets the view."}>
        <img className="spring-logo-fallback" src="/logo.png" alt="" />
      </div>
      <div className="spring-logo-controls mono-label">
        <span id={hintId}>{language === "zh" ? "拖曳旋轉" : "Drag to rotate"}</span>
        <button type="button" onClick={() => host.current?.dispatchEvent(new Event("spring-logo-reset"))}>
          {language === "zh" ? "重設" : "Reset"}
        </button>
      </div>
    </>
  )}</Localized>;
}
