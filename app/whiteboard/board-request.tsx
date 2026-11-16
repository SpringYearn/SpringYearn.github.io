"use client";

import Link from "next/link";
import { ArrowUpRight, Check, LoaderCircle, MailPlus, Plus, RotateCcw } from "lucide-react";
import { Localized } from "../localized";
import { useSiteLanguage } from "../site-language";

export function BoardRequest({ loaded, online, emailReady, requesting, requested, failed, onRequest }: {
  loaded: boolean;
  online: boolean;
  emailReady: boolean;
  requesting: boolean;
  requested: boolean;
  failed: boolean;
  onRequest: () => void;
}) {
  const { language } = useSiteLanguage();
  const zh = language === "zh";
  const state = requested ? "sent" : requesting ? "sending" : failed ? "failed" : "idle";
  const label = {
    sent: zh ? "已送出申請" : "Request sent",
    sending: zh ? "送出中⋯" : "Sending…",
    failed: zh ? "重試申請" : "Retry request",
    idle: zh ? "申請新增畫布" : "Request a new canvas",
  }[state];
  const Icon = { sent: Check, sending: LoaderCircle, failed: RotateCcw, idle: Plus }[state];

  return <Localized>
    <section className="board-request-panel" data-state={state} aria-labelledby="board-request-title">
      <div className="board-request-copy">
        <span className="board-request-symbol"><MailPlus aria-hidden="true" /></span>
        <div>
          <h2 id="board-request-title">{zh ? "畫布快滿了？" : "Running out of room?"}</h2>
          <p>{zh ? "申請後會寄信通知 SpringYearn。" : "Send SpringYearn an email request for a new canvas."}</p>
        </div>
      </div>
      <div className="board-request-actions">
        <button className="board-request-button" type="button" aria-busy={requesting} disabled={!loaded || !online || !emailReady || requesting || requested} onClick={onRequest}>
          <Icon aria-hidden="true" /><span>{label}</span>
        </button>
        <div className="board-request-feedback" role="status">
          {(requesting || requested) && <span className="sr-only">{label}</span>}
          {failed && !requested && !requesting && <p>{zh ? "申請尚未送出，請稍後重試。" : "Request not sent. Please retry shortly."}</p>}
          {loaded && !emailReady && <Link href="/#contact" className="text-link">
            {zh ? "寄信暫時無法使用，請聯絡我" : "Email unavailable. Contact me"}<ArrowUpRight aria-hidden="true" />
          </Link>}
        </div>
      </div>
    </section>
  </Localized>;
}
