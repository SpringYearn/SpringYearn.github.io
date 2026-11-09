"use client";

import { createContext, useContext } from "react";
import Link from "next/link";
import { Localized } from "../localized";
import type { ResourceSection } from "./resource-route";

export const ResourceNavigation = createContext<{ select: (section: ResourceSection) => void } | null>(null);

export function ResourceSections({ active, language }: { active: ResourceSection; language: "en" | "zh" }) {
  const navigation = useContext(ResourceNavigation);
  const chinese = language === "zh";
  return <Localized>{<div className="resource-sections">
    <span className="mono-label">{chinese ? "資源區" : "Resources"}</span>
    <nav className="resource-section-links" aria-label={chinese ? "資源分類" : "Resource categories"}>
      {([
        ["project-files", chinese ? "免費專案檔" : "Free project files"],
        ["lab", chinese ? "LAB / 工具" : "LAB / Tools"],
      ] as const).map(([section, label]) => <Link key={section} href={`/resources/#${section}`}
        aria-current={active === section ? "page" : undefined}
        onClick={event => {
          if (!navigation || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          navigation.select(section);
        }}>{label}</Link>)}
    </nav>
  </div>}</Localized>;
}
