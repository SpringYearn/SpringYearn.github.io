"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole, X } from "lucide-react";
import { labExperiments } from "../lab-data";
import builds from "./builds.json";
import { verifyEncryptedBuild } from "./verify-encrypted-build";

const copy = {
  en: {
    download: "DOWNLOAD CURRENT BUILD", title: "Authorized testing",
    notice: "These experimental builds are available for authorized testing only. To request a download, please contact SpringYearn directly for access.",
    archive: "AES-256 encrypted ZIP. Extract it with your authorized password, then open the original build ZIP inside.",
    contact: "Contact SpringYearn", close: "Close", password: "Access password",
    verify: "Verify & download", confirm: "Confirm", busy: "Verifying…", denied: "Unable to authorize this download. Please check your access or contact SpringYearn.",
    unavailable: "No downloadable build",
    failed: "The download could not be completed. Please try again or contact SpringYearn.",
    success: "Download started. The ZIP also requires your authorized password to extract.",
  },
  zh: {
    download: "下載目前版本 / DOWNLOAD CURRENT BUILD", title: "授權測試",
    notice: "此實驗版本僅提供授權測試。若需要下載，請直接聯絡 SpringYearn 取得存取權限。",
    archive: "AES-256 加密 ZIP。以授權密碼解壓縮後，再開啟其中的原始版本 ZIP。",
    contact: "聯絡 SpringYearn", close: "關閉", password: "存取密碼",
    verify: "驗證並下載", confirm: "確認下載", busy: "驗證中⋯⋯", denied: "無法授權此下載，請確認存取權限或聯絡 SpringYearn。",
    unavailable: "未提供下載版本",
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
  const build = Object.entries(builds).find(([id]) => id === project.id)?.[1];
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
    if (!build || busy) return;
    const form = event.currentTarget;
    const password = new FormData(form).get("password");
    form.reset();
    if (typeof password !== "string" || !password) return;
    setMessage(null);
    setBusy(true);
    const request = new AbortController();
    controller.current = request;
    const timeout = window.setTimeout(() => request.abort(), 90_000);
    try {
      // Fetch ciphertext only. The visitor's password never leaves this browser.
      const response = await fetch("/lab-builds/" + build.filename, {
        credentials: "omit", cache: "no-store", redirect: "error",
        referrerPolicy: "no-referrer", signal: request.signal,
      });
      if (request.signal.aborted) return;
      if (!response.ok) {
        setMessage(response.status === 404 ? "unavailable" : "failed");
        return;
      }
      const file = await response.blob();
      if (request.signal.aborted) return;
      await verifyEncryptedBuild(file, password, build, request.signal);
      if (request.signal.aborted) return;
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = build.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setMessage("success");
    } catch (error) {
      if (dialog.current?.open && !request.signal.aborted) {
        setMessage(error instanceof Error && error.message === "ACCESS_DENIED" ? "denied" : "failed");
      } else if (dialog.current?.open) setMessage("failed");
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === request) {
        controller.current = null;
        setBusy(false);
      }
    }
  };

  if (!build) return <p className="lab-build-unavailable mono-label">{t.unavailable}</p>;

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
        <p className="lab-build-filename">{build.originalFilename}</p>
        <p className="lab-download-pending">{t.archive}</p>
        <form onSubmit={submit}>
          <label htmlFor={project.id + "-password"}>{t.password}</label>
          <div className="lab-password-row">
            <input id={project.id + "-password"} name="password" type="password" required maxLength={256}
              autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={busy} />
            <button className="lab-confirm-button" type="submit" aria-label={busy ? t.busy : t.verify} disabled={busy}>
              {busy ? t.busy : t.confirm}<ArrowUpRight aria-hidden="true" />
            </button>
          </div>
        </form>
        <p role="status" aria-live="polite">{message ? t[message] : ""}</p>
        <Link href="/#contact" className="text-link" onClick={() => dialog.current?.close()}>{t.contact}<ArrowUpRight aria-hidden="true" /></Link>
      </dialog>
    </div>
  );
}
