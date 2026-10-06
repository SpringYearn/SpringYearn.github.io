"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { useSiteLanguage } from "./site-language";

export function ItemShare({ path, title, description }: { path: string; title: string; description?: string }) {
  const { language } = useSiteLanguage();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<"copied" | "opened" | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const chinese = language === "zh";
  const label = path.startsWith("/work/") ? (chinese ? "分享作品" : "Share work") : (chinese ? "分享專案檔" : "Share project file");
  const share = async () => {
    if (busy) return;
    setBusy(true); setMessage(null); setManualUrl("");
    const url = new URL(path, window.location.origin).href;
    try {
      if (navigator.share) {
        try { await navigator.share({ title: `${title} / SpringYearn`, text: description, url }); setMessage("opened"); return; }
        catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
      }
      try { await navigator.clipboard.writeText(url); setMessage("copied"); }
      catch { setManualUrl(url); }
    } finally { setBusy(false); }
  };
  return <div className="item-share">
    <button type="button" className="item-share-button" disabled={busy} onClick={share} aria-label={`${title} — ${label}`}><Share2 aria-hidden="true" /><span>{label}</span></button>
    <span role="status" aria-live="polite" className="item-share-status">{message === "copied" ? (chinese ? "已複製項目連結。" : "Item link copied.") : message === "opened" ? (chinese ? "已開啟分享選項。" : "Share options opened.") : ""}</span>
    {manualUrl && <input className="item-share-url" readOnly value={manualUrl} aria-label={chinese ? "複製項目連結" : "Copy this item link"} onFocus={event => event.currentTarget.select()} />}
  </div>;
}
