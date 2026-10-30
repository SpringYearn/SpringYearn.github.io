"use client";

import { useEffect, useRef } from "react";
import { localizeText } from "../localization";
import { useSiteLanguage, type Locale } from "../site-language";

const authors: Record<Locale, string> = { en: "I", zh: "我", ja: "私", ko: "제가", ru: "я", vi: "tôi" };
const descriptions: Record<Locale, string> = {
  en: "I, crossed out in red; handwritten correction: ChatGPT",
  zh: "「我」畫上紅叉，手寫改成 ChatGPT",
  ja: "「私」を赤で消し、手書きで ChatGPT に訂正",
  ko: "「제가」에 빨간 X를 긋고 손글씨로 ChatGPT라고 수정",
  ru: "«я» зачёркнуто красным; от руки написано ChatGPT",
  vi: "Gạch chéo đỏ chữ «tôi», sửa bằng chữ viết tay: ChatGPT",
};

function HandwrittenChatGPT() {
  return <svg viewBox="0 0 148 44" fill="none" aria-hidden="true" focusable="false">
    <g stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11C12 5 3 10 4 22C5 34 15 34 20 29" />
      <path d="M26 6L25 33M25 23C27 16 35 15 37 21L38 33" />
      <path d="M55 21C45 14 40 26 46 31C50 35 56 29 56 23M56 19L57 32" />
      <path d="M66 10L64 29Q64 35 70 31M59 19L74 18" />
      <path d="M95 12C87 5 76 12 77 23C78 35 91 34 96 27L97 22L87 23" />
      <path d="M104 34L106 9Q119 8 118 18Q117 25 105 23" />
      <path d="M126 10L143 9M135 10L132 34" />
    </g>
    <path d="M7 39Q72 34 141 37" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>;
}

export function LabAuthorIntro({ text }: { text: string }) {
  const { locale } = useSiteLanguage();
  const paragraph = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const root = paragraph.current;
    const original = root?.querySelector<HTMLElement>(".lab-author-original");
    const note = root?.querySelector<HTMLElement>(".lab-author-note");
    if (!root || !original || !note) return;
    let active = true;
    const align = () => {
      if (!active) return;
      const bounds = root.getBoundingClientRect(), word = original.getBoundingClientRect();
      const center = word.left + word.width / 2;
      // Keep the correction over its subject; only shift it when a narrow line needs room.
      const halfWidth = note.offsetWidth / 2 + note.offsetHeight * .06 + 2;
      const clamped = Math.max(bounds.left + halfWidth, Math.min(center, bounds.right - halfWidth));
      note.style.setProperty("--lab-note-shift", `${clamped - center}px`);
    };
    const observer = new ResizeObserver(align);
    observer.observe(root);
    document.fonts.ready.then(align);
    align();
    return () => { active = false; observer.disconnect(); };
  }, [locale, text]);
  let intro = localizeText(text, locale);
  // These translations omit the subject; make it explicit for the same visual joke.
  if (locale === "ja") intro = "私が" + intro;
  if (locale === "ko") intro = "제가 " + intro;
  const author = authors[locale], index = intro.indexOf(author);
  if (index < 0) return <p ref={paragraph} className="lab-intro" data-localize="off">{intro}</p>;
  const suffix = intro.slice(index + author.length);
  const contraction = locale === "en" && suffix.startsWith("’ve") ? "’ve" : "";

  return <p ref={paragraph} className="lab-intro lab-authorship-intro" data-localize="off">
    {intro.slice(0, index)}
    <span className="lab-author-edit" role="img" aria-label={descriptions[locale]}>
      <span className="lab-author-word" aria-hidden="true">
        <span className="lab-author-original">
          {author}
          <span className="lab-author-note" aria-hidden="true">
            <span className="sr-only">ChatGPT</span>
            <HandwrittenChatGPT />
          </span>
          <svg className="lab-author-cross" viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" focusable="false">
            <path d="M3 3C8 9 14 15 22 21M21 2C15 8 8 16 2 22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </span>{contraction}
      </span>
    </span>
    {suffix.slice(contraction.length)}
  </p>;
}
