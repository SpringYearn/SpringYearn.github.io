"use client";

import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { ArrowUpRight, Globe2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeaderControlsProps = {
  language: "en" | "zh";
  onToggleLanguage: () => void;
};

export function HeaderControls({ language, onToggleLanguage }: HeaderControlsProps) {
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState<"open" | "close" | null>(null);
  const clearPress = () => setPressed(null);
  const pressProps = (button: "open" | "close") => ({
    "data-pressed": pressed === button,
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.isPrimary && event.button === 0) setPressed(button);
    },
    onPointerUp: clearPress,
    onPointerCancel: clearPress,
    onPointerLeave: clearPress,
    onBlur: clearPress,
    onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === " " || event.key === "Enter") setPressed(button);
    },
    onKeyUp: clearPress,
  });
  const chinese = language === "zh";
  const languageLabel = chinese ? "切換為英文" : "Switch to Chinese";
  const links = [
    { href: "/", label: chinese ? "首頁" : "Home" },
    { href: "/work", label: chinese ? "作品集" : "Work archive" },
    { href: "/lab", label: "LAB" },
    { href: "/project-files", label: chinese ? "專案檔" : "Project files" },
    { href: "/#profile", label: chinese ? "關於我" : "Profile" },
    { href: "/#contact", label: chinese ? "聯絡" : "Contact" },
  ];

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 900px)");
    const closeOnDesktop = () => { if (!mobile.matches) { setPressed(null); setOpen(false); } };
    mobile.addEventListener("change", closeOnDesktop);
    return () => mobile.removeEventListener("change", closeOnDesktop);
  }, []);

  return <>
    <Button type="button" variant="outline" className="language-switch header-language-switch" onClick={onToggleLanguage} aria-label={languageLabel}>
      <Globe2 aria-hidden="true" />{chinese ? "EN" : "中文"}
    </Button>
    <Dialog.Root open={open} onOpenChange={next => { setPressed(null); setOpen(next); }}>
      <Dialog.Trigger asChild>
        <button type="button" className="mobile-menu-toggle" {...pressProps("open")} aria-label={chinese ? "開啟導覽選單" : "Open navigation menu"}><Menu aria-hidden="true" /></button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-nav-overlay" />
        <Dialog.Content className="mobile-nav-panel">
          <div className="mobile-nav-heading">
            <div><span className="mono-label">SPRING YEARN / INDEX</span><Dialog.Title>{chinese ? "網站導覽" : "Navigation"}</Dialog.Title></div>
            <Dialog.Close asChild><button type="button" className="mobile-menu-close" {...pressProps("close")} aria-label={chinese ? "關閉導覽選單" : "Close navigation menu"}><X aria-hidden="true" /></button></Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{chinese ? "前往網站各頁面，或切換中英文。" : "Explore the site or change the display language."}</Dialog.Description>
          <nav className="mobile-nav-links" aria-label={chinese ? "主要導覽" : "Main navigation"}>
            {links.map((link, index) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}><span className="mono-label">{String(index + 1).padStart(2, "0")}</span><span>{link.label}</span><ArrowUpRight aria-hidden="true" /></Link>)}
          </nav>
          <div className="mobile-nav-language"><span className="mono-label">{chinese ? "語言" : "Language"}</span><button type="button" className="mobile-language-switch" onClick={onToggleLanguage} aria-label={languageLabel}><Globe2 aria-hidden="true" /><span>{chinese ? "中文 → English" : "English → 中文"}</span></button></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
