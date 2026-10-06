"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import type { Language } from "./portfolio-data";

const storageKey = "springyearn:language";
export const locales = ["en", "zh", "ja", "ko", "ru", "vi"] as const;
export type Locale = (typeof locales)[number];
export const localeNames: Record<Locale,string> = {en:"English",zh:"繁體中文",ja:"日本語",ko:"한국어",ru:"Русский",vi:"Tiếng Việt"};
let current: Locale = "en";
let initialized = false;
const listeners = new Set<() => void>();
const parse = (value: string | null): Locale => locales.includes(value as Locale) ? value as Locale : "en";
const publish = () => listeners.forEach(listener => listener());
const snapshot = () => {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    try { current = parse(window.localStorage.getItem(storageKey)); } catch { /* Keep an in-memory preference when storage is unavailable. */ }
  }
  return current;
};
const storageChanged = (event: StorageEvent) => {
  if (event.key === storageKey || event.key === null) { current = parse(event.newValue); publish(); }
};
const subscribe = (listener: () => void) => {
  if (!listeners.size) window.addEventListener("storage", storageChanged);
  listeners.add(listener);
  return () => { listeners.delete(listener); if (!listeners.size) window.removeEventListener("storage", storageChanged); };
};
const setLanguage = (next: Locale | ((previous: Language) => Locale)) => {
  current = typeof next === "function" ? next(snapshot()==="zh"?"zh":"en") : next;
  initialized = true;
  try { window.localStorage.setItem(storageKey, current); } catch { /* Navigation still retains the current preference. */ }
  publish();
};
const LanguageContext = createContext<{ language: Language; locale:Locale; setLanguage: typeof setLanguage } | null>(null);

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, snapshot, () => "en" as const);
  const language:Language=locale==="zh"?"zh":"en";
  useEffect(() => { document.documentElement.lang = locale === "zh" ? "zh-Hant" : locale; }, [locale]);
  return <LanguageContext.Provider value={{ language, locale, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useSiteLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("Site language provider is missing.");
  return context;
}
