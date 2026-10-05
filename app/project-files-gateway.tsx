import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SpringMark } from "./spring-mark";

export function ProjectFilesGateway({ language }: { language: "en" | "zh" }) {
  const title = language === "en" ? "Open the project files" : "打開免費剪輯專案檔";
  return (
    <Link href="/project-files" className="pf-gateway-link" aria-label={title} data-reveal>
      <div className="pf-gateway-art" aria-hidden="true">
        <svg className="pf-folder" viewBox="0 0 240 180" fill="none">
          <path className="pf-folder-back" d="M21 142V27H86L102 42H214V142Z" />
          <g className="pf-folder-sheet">
            <path d="M39 133V51H183L202 70V133Z" />
            <path d="M183 51V70H202M54 67H116M54 78H87" />
            <rect x="54" y="90" width="68" height="9" />
            <rect x="83" y="104" width="94" height="9" />
            <rect x="65" y="118" width="78" height="9" />
            <g className="pf-folder-playhead"><path d="M110 85V133" /><path d="M106 85H114L110 90Z" /></g>
          </g>
          <path className="pf-folder-front" d="M21 145L10 83H88L102 96H229L214 145Z" />
          <path d="M32 112H68M32 120H52M190 121V134M184 128L190 134L196 128" />
          <path className="pf-folder-baseline" d="M6 156H234M20 152V160M220 152V160" />
        </svg>
        <SpringMark className="pf-gateway-sprout" />
        <span className="mono-label pf-gateway-art-label">SY / FROM MY TIMELINE</span>
      </div>
      <div className="pf-gateway-copy">
        <span className="mono-label pf-gateway-eyebrow">PROJECT FILES / FREE PF</span>
        <strong>{title}</strong>
        <p>{language === "en" ? "A little of the process, ready for your next idea." : "分享一點創作過程，留給你的下一個靈感。"}</p>
        <div className="pf-gateway-meta mono-label"><span>AFTER EFFECTS</span><span>DAVINCI RESOLVE</span></div>
      </div>
      <div className="pf-gateway-action">
        <span className="mono-label">07 / {language === "en" ? "FREE DOWNLOADS" : "免費下載"}</span>
        <span className="pf-gateway-arrow"><ArrowUpRight aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
