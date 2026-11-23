"use client";
import { Localized } from "./localized";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Dialog, DropdownMenu } from "radix-ui";
import { ArrowUpRight, Check, ChevronDown, Globe2, Menu, Moon, Sun, X } from "lucide-react";
import { localeNames, locales, useSiteLanguage, type Locale } from "./site-language";

type SiteHeaderProps = {
  active?: "work" | "resources" | "whiteboard";
  onBrowseResources?: () => void;
};

const pages = [
  { id: "work", href: "/work", en: "Work archive", zh: "作品集" },
  { id: "resources", href: "/resources", en: "Resources", zh: "資源區" },
  { id: "profile", href: "/#profile", en: "Profile", zh: "關於我" },
  { id: "contact", href: "/#contact", en: "Contact", zh: "聯絡" },
] as const;

const whiteboard = { id: "whiteboard", href: "/whiteboard", en: "Whiteboard", zh: "塗鴉板" } as const;
const mobilePages = [{ id: "home", href: "/#top", en: "Home", zh: "首頁" } as const, ...pages, whiteboard];

export function SiteHeader({ active, onBrowseResources }: SiteHeaderProps) {
  const { language, locale, setLanguage } = useSiteLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const chinese = language === "zh";
  const languageLabel = chinese ? "選擇顯示語言" : "Choose display language";
  const themeLabel = chinese ? "淺色主題" : "Light theme";
  const picker = (mobile = false) => (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className={mobile ? "mobile-language-switch" : "language-switch header-language-switch"}
        aria-label={languageLabel} title={languageLabel}>
        <Globe2 aria-hidden="true" />
        <span data-localize="off">{localeNames[locale]}</span>
        <ChevronDown className="language-chevron" aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="language-menu" sideOffset={8} align="end" collisionPadding={12} loop>
          <DropdownMenu.RadioGroup value={locale} onValueChange={code => setLanguage(code as Locale)}>
            {locales.map(code => (
              <DropdownMenu.RadioItem className="language-menu-option" key={code} value={code} textValue={localeNames[code]}>
                <span data-localize="off" lang={code === "zh" ? "zh-Hant" : code}>{localeNames[code]}</span>
                <DropdownMenu.ItemIndicator><Check aria-hidden="true" /></DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
  const navLabel = chinese ? "主要導覽" : "Main navigation";
  const browseResources = onBrowseResources ? (event: { preventDefault: () => void }) => {
    event.preventDefault();
    onBrowseResources();
  } : undefined;

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 900px)");
    const closeOnDesktop = () => { if (!mobile.matches) setOpen(false); };
    mobile.addEventListener("change", closeOnDesktop);
    return () => mobile.removeEventListener("change", closeOnDesktop);
  }, []);

  return <Localized><header className="site-header">
    <Link className="wordmark" href="/#top" aria-label="SpringYearn home">
      <span className="wordmark-symbol"><img src="/logo.png" alt="" width="30" height="32" /></span>
      <span className="wordmark-text" lang="en" data-localize="off">SPRINGYEARN</span>
    </Link>
    <nav className="desktop-nav" aria-label={navLabel}>
      {pages.map(page => <Link key={page.id} href={page.href}
        onNavigate={page.id === "resources" ? browseResources : undefined}
        aria-current={page.id === active ? "page" : undefined}>
        {page[language]}
      </Link>)}
    </nav>
    <div className="header-extra-tools">
      <Link className="whiteboard-nav-link" href={whiteboard.href}
        aria-current={active === "whiteboard" ? "page" : undefined}>{whiteboard[language]}</Link>
      {picker()}
      <button type="button" className="theme-switch" aria-label={themeLabel} title={themeLabel}
        aria-pressed={resolvedTheme === "light"}
        onClick={() => setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light")}>
        <Sun className="theme-sun" aria-hidden="true" />
        <Moon className="theme-moon" aria-hidden="true" />
      </button>
    </div>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="mobile-menu-toggle" aria-label={chinese ? "開啟導覽選單" : "Open navigation menu"}><Menu aria-hidden="true" /></button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-nav-overlay" />
        <Dialog.Content className="mobile-nav-panel">
          <div className="mobile-nav-heading">
            <Dialog.Title>{chinese ? "網站導覽" : "Navigation"}</Dialog.Title>
            <Dialog.Close asChild><button type="button" className="mobile-menu-close" aria-label={chinese ? "關閉導覽選單" : "Close navigation menu"}><X aria-hidden="true" /></button></Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{chinese ? "前往網站各頁面，或切換顯示語言。" : "Explore the site or change the display language."}</Dialog.Description>
          <nav className="mobile-nav-links" aria-label={navLabel}>
            {mobilePages.map(page => <Link
              key={page.id}
              href={page.href}
              aria-current={page.id === active ? "page" : undefined}
              onClick={() => setOpen(false)}
              onNavigate={page.id === "resources" ? browseResources : undefined}
            >
              <span>{page[language]}</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>)}
          </nav>
          <div className="mobile-nav-language"><span className="mono-label">{chinese ? "語言" : "Language"}</span>{picker(true)}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </header></Localized>;
}
