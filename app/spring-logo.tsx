"use client";

import { useEffect, useRef } from "react";

export function SpringLogo() {
  const host = useRef<HTMLDivElement>(null);
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
  return (
    <div ref={host} className="spring-logo" role="img" aria-label="SpringYearn 3D logo">
      <img className="spring-logo-fallback" src="/logo.png" alt="" />
    </div>
  );
}
