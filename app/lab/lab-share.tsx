"use client";
import { Localized } from "../localized";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { labProjectUrl } from "./project-link";

const copy = {
  en: { share: "Share this project", copied: "Project link copied.", manual: "Copy this project link", opened: "Share options opened." },
  zh: { share: "分享此專案", copied: "已複製專案連結。", manual: "複製此專案連結", opened: "已開啟分享選項。" },
};

export function LabShare({ id, title, language }: { id: string; title: string; language: "en" | "zh" }) {
  const [message, setMessage] = useState<"copied" | "opened" | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const t = copy[language];
  const share = async () => {
    if (busy) return;
    setBusy(true); setMessage(null); setManualUrl("");
    const url = labProjectUrl(window.location.origin, id);
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: title + " / SpringYearn LAB", url });
          setMessage("opened"); return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        setMessage("copied");
      } catch { setManualUrl(url); }
    } finally { setBusy(false); }
  };
  return <Localized>{(
    <div className="lab-share">
      <button type="button" className="lab-share-button" onClick={share} disabled={busy} aria-label={title + " — " + t.share}>
        <Share2 aria-hidden="true" /><span>{t.share}</span>
      </button>
      <span className="lab-share-status" role="status" aria-live="polite">{message ? t[message] : ""}</span>
      {manualUrl && <input className="lab-share-url" aria-label={t.manual} value={manualUrl} readOnly onFocus={event => event.currentTarget.select()} />}
    </div>
  )}</Localized>;
}
