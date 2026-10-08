"use client";
import { useSiteLanguage } from "../site-language";
import { localizeText } from "../localization";

export function BoardLoading({ offline }: { offline: boolean }) {
  const { language, locale } = useSiteLanguage();
  const message = localizeText(offline
    ? (language === "zh" ? "暫時無法載入共用白板。" : "Unable to load the shared board.")
    : (language === "zh" ? "正在載入大家的塗鴉⋯" : "Loading everyone’s doodles…"), locale);
  return <div className="board-loading" role="status" data-loading={!offline}>
    {offline ? message : <><span className="sr-only">{message}</span><span className="board-loading-message" aria-hidden="true"><span>{message.replace(/(?:…|⋯|\.{3})$/u, "")}</span><span className="board-loading-dots"><span>.</span><span>.</span><span>.</span></span></span></>}
  </div>;
}
