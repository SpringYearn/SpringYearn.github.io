"use client";

import { Localized } from "../localized";
import type { ResourceSection } from "./resource-route";

export function ResourceSections({ active, language }: { active: ResourceSection; language: "en" | "zh" }) {
  const chinese = language === "zh";
  return <Localized>{<div className="resource-sections">
    <span className="mono-label">{chinese ? "資源區" : "Resources"}</span>
    <nav className="resource-section-links" aria-label={chinese ? "資源分類" : "Resource categories"}>
      {([
        ["project-files", chinese ? "免費專案檔" : "Free project files"],
        ["lab", chinese ? "LAB / 工具" : "LAB / Tools"],
      ] as const).map(([section, label]) => <a key={section} href={`/resources/#${section}`}
        aria-current={active === section ? "page" : undefined}>{label}</a>)}
    </nav>
  </div>}</Localized>;
}
