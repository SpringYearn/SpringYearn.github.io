"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import type { Language } from "./portfolio-data";

const storageKey = "springyearn:language";
let current: Language = "en";
let initialized = false;
const listeners = new Set<() => void>();
const parse = (value: string | null): Language => value === "zh" ? "zh" : "en";
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
const setLanguage = (next: Language | ((previous: Language) => Language)) => {
  current = typeof next === "function" ? next(snapshot()) : next;
  initialized = true;
  try { window.localStorage.setItem(storageKey, current); } catch { /* Navigation still retains the current preference. */ }
  publish();
};
const LanguageContext = createContext<{ language: Language; setLanguage: typeof setLanguage } | null>(null);

export function SiteLanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, snapshot, () => "en" as const);
  useEffect(() => { document.documentElement.lang = language === "zh" ? "zh-Hant" : "en"; }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useSiteLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("Site language provider is missing.");
  return context;
}
