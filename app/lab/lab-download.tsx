"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole, X } from "lucide-react";
import { labExperiments } from "../lab-data";

// This is a public service address, never a password, verifier or file URL.
function downloadEndpoint() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_LAB_DOWNLOAD_ENDPOINT ?? "");
    return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash
      ? url.href : null;
  } catch {
    return null;
  }
}

const copy = {
  en: {
    download: "DOWNLOAD CURRENT BUILD", title: "Authorized testing",
    notice: "These experimental builds are available for authorized testing only. To request a download, please contact SpringYearn directly for access.",
    pending: "Online verification is not available yet. Please contact SpringYearn to arrange access to the current build.",
    contact: "Contact SpringYearn", close: "Close", password: "Access password",
    verify: "Verify & download", busy: "Verifying…", denied: "Unable to authorize this download. Please check your access or contact SpringYearn.",
    unavailable: "This build is not available for download yet. Please contact SpringYearn.",
    failed: "The download could not be completed. Please try again or contact SpringYearn.",
    success: "Download started. The ZIP also requires your authorized password to extract.",
  },
  zh: {
    download: "下載目前版本 / DOWNLOAD CURRENT BUILD", title: "授權測試",
    notice: "此實驗版本僅提供授權測試。若需要下載，請直接聯絡 SpringYearn 取得存取權限。",
    pending: "線上驗證尚未開放，請聯絡 SpringYearn 安排目前版本的存取權限。",
    contact: "聯絡 SpringYearn", close: "關閉", password: "存取密碼",
    verify: "驗證並下載", busy: "驗證中⋯⋯", denied: "無法授權此下載，請確認存取權限或聯絡 SpringYearn。",
    unavailable: "此專案尚未提供可下載版本，請聯絡 SpringYearn。",
    failed: "下載未能完成，請重試或聯絡 SpringYearn。",
    success: "已開始下載，解壓縮 ZIP 時亦需輸入授權密碼。",
  },
};

export function LabDownload({ project, language }: {
  project: (typeof labExperiments)[number];
  language: "en" | "zh";
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<"denied" | "unavailable" | "failed" | "success" | null>(null);
  const endpoint = downloadEndpoint();
  const t = copy[language];
  useEffect(() => () => controller.current?.abort(), []);
  const cleanup = () => {
    controller.current?.abort();
    dialog.current?.querySelector("form")?.reset();
    setBusy(false);
    setMessage(null);
    trigger.current?.focus();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!endpoint || busy) return;
    const form = event.currentTarget;
    const password = new FormData(form).get("password");
    form.reset();
    setMessage(null);
    setBusy(true);
    const request = new AbortController();
    controller.current = request;
    const timeout = window.setTimeout(() => request.abort(), 30_000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: project.id, password }),
        credentials: "omit", cache: "no-store", redirect: "error",
        referrerPolicy: "no-referrer", signal: request.signal,
      });
      if (request.signal.aborted) return;
      if (!response.ok) {
        setMessage(response.status === 401 || response.status === 403 ? "denied"
          : response.status === 404 ? "unavailable" : "failed");
        return;
      }
      // The private service must return a verified AES-encrypted ZIP after auth.
      if (response.headers.get("content-type")?.split(";")[0].trim() !== "application/zip") {
        setMessage("failed");
        return;
      }
      const file = await response.blob();
      if (request.signal.aborted) return;
      if (!file.size) { setMessage("failed"); return; }
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = project.id.toLowerCase() + "-current-build.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setMessage("success");
    } catch {
      if (dialog.current?.open) setMessage("failed");
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === request) {
        controller.current = null;
        setBusy(false);
      }
    }
  };

  return (
    <div className="lab-download">
      <button ref={trigger} className="lab-download-button" type="button"
        aria-haspopup="dialog" aria-label={project.title + " — " + t.download}
        onClick={() => { setMessage(null); dialog.current?.showModal(); }}>
        <LockKeyhole aria-hidden="true" /><span>{t.download}</span><ArrowUpRight aria-hidden="true" />
      </button>
      <dialog ref={dialog} className="lab-download-dialog" aria-labelledby={project.id + "-download-title"}
        aria-describedby={project.id + "-download-notice"} onClose={cleanup}>
        <button type="button" className="lab-dialog-close" aria-label={t.close} onClick={() => dialog.current?.close()}><X aria-hidden="true" /></button>
        <p className="mono-label">{project.id} / {t.title}</p>
        <h2 id={project.id + "-download-title"}>{project.title}</h2>
        <p id={project.id + "-download-notice"}>{t.notice}</p>
        {endpoint ? (
          <form onSubmit={submit}>
            <label htmlFor={project.id + "-password"}>{t.password}</label>
            <input id={project.id + "-password"} name="password" type="password" required maxLength={256}
              autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={busy} />
            <button className="lab-download-button" type="submit" disabled={busy}>{busy ? t.busy : t.verify}</button>
          </form>
        ) : <p className="lab-download-pending">{t.pending}</p>}
        <p role="status" aria-live="polite">{message ? t[message] : ""}</p>
        <Link href="/#contact" className="text-link" onClick={() => dialog.current?.close()}>{t.contact}<ArrowUpRight aria-hidden="true" /></Link>
      </dialog>
    </div>
  );
}
