"use client";
import { Localized } from "./localized";

import { useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import type { Language } from "./portfolio-data";

const verses = {
  home: {
    en: "I loved your work.\nSome of it found its way into mine.\nIt hurts to know there won’t be another edit.\nThank you, 4NEVER.",
    zh: "我很喜歡你的作品。\n我的一些剪輯裡，也有從你那裡得到的靈感。\n想到以後看不到你的新作品，還是很難過。\n謝謝你，4NEVER。",
  },
  work: {
    en: "Watching your edits often gave me ideas of my own.\nI wish you could know how much that meant.\nI’m leaving these words for never—\nthank you. I’ll keep editing, and I’ll remember you.",
    zh: "看你的作品時，常常會冒出自己的想法。\n真希望你能知道，你帶給過我多少靈感。\n留幾句話 for never——\n謝謝你。我會繼續剪片，也會記得你。",
  },
  lab: {
    en: "Some work makes you want to go make something yourself.\nYours did.\nThank you for sharing it.\nI’ll remember you, 4NEVER.",
    zh: "有些作品，會讓人看完也想動手試試。\n你的就是。\n謝謝你做過那些剪輯。\n我會記得你，4NEVER。",
  },
};

export function ForNever({ language, place }: { language: Language; place: keyof typeof verses }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const sequence = useRef({ count: 0, started: 0 });
  const resetSequence = () => { sequence.current = { count: 0, started: 0 }; };
  const pause = () => {
    const now = performance.now();
    const previous = sequence.current;
    sequence.current = !previous.count || now - previous.started > 4000
      ? { count: 1, started: now }
      : { ...previous, count: previous.count + 1 };
    if (sequence.current.count === 4) {
      resetSequence();
      setOpen(true);
    }
  };
  return <Localized>{(
    <div className="for-never">
      <button ref={trigger} type="button" className="for-never-trigger" onClick={pause} onBlur={resetSequence}
        onKeyDown={event => { if (event.repeat && (event.key === "Enter" || event.key === " ")) event.preventDefault(); }}
        aria-label={language === "en" ? "Pause a moment" : "停留片刻"}>
        <svg className="for-never-frame" viewBox="0 0 38 18" fill="none" aria-hidden="true">
          <path d="M17 5V2H2V16H17V13" />
          <path className="for-never-continuation" d="M11 9H36" />
        </svg>
      </button>
      <Dialog.Root open={open} onOpenChange={next => { resetSequence(); setOpen(next); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="for-never-overlay" />
          <Dialog.Content className="for-never-note" onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}>
            <Dialog.Close asChild><button type="button" className="for-never-close" aria-label={language === "en" ? "Close this note" : "關閉紀念文字"}><X aria-hidden="true" /></button></Dialog.Close>
            <Dialog.Title className="for-never-title">{language === "en" ? "In memory of 4NEVER" : "紀念 4NEVER"}</Dialog.Title>
            <Dialog.Description className="for-never-verse">{verses[place][language]}</Dialog.Description>
            <p className="for-never-signature">— SpringYearn</p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )}</Localized>;
}
