"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowDownRight, Check, Clapperboard, Workflow } from "lucide-react";
import { Localized } from "../localized";
import { useSiteLanguage } from "../site-language";
import type { ResourceSection } from "./resource-route";
import { ResourceVines } from "./resource-vines";
import "./resource-picker.css";

const choices = [
  {
    id: "project-files",
    title: { en: "Free project files", zh: "免費專案檔" },
    description: "After Effects / DaVinci Resolve",
    Icon: Clapperboard,
  },
  {
    id: "lab",
    title: { en: "LAB / Tools", zh: "LAB / 工具" },
    description: "Fusion tools, prototypes and development notes",
    Icon: Workflow,
  },
] as const;

export function ResourcePicker({ active, animate, onSelect }: {
  active: ResourceSection | null;
  animate: boolean;
  onSelect: (section: ResourceSection) => void;
}) {
  const { language } = useSiteLanguage();
  const grid = useRef<HTMLElement>(null);
  const title = language === "zh" ? "資源區" : "Resources";
  return <Localized>
    {active === null && <ResourceVines grid={grid} />}
    <section className="section-block resource-picker" data-expanded={active === null} data-animate={animate} aria-labelledby="resource-picker-title">
      <div className="resource-picker-heading">
        {active === null ? <h1 id="resource-picker-title">{title}</h1> : <p id="resource-picker-title">{title}</p>}
      </div>
      <nav ref={grid} className="resource-choice-grid" aria-label={language === "zh" ? "資源分類" : "Resource categories"}>
        {choices.map(({ id, title, description, Icon }) => <Link
          key={id}
          href={`/resources/#${id}`}
          className={`resource-choice resource-choice-${id}`}
          aria-current={active === id ? "page" : undefined}
          aria-labelledby={`resource-label-${id}`}
          aria-describedby={active === null ? `resource-description-${id}` : undefined}
          onNavigate={event => { event.preventDefault(); onSelect(id); }}
        >
          <span className="resource-choice-art" aria-hidden="true">
            <span className="resource-choice-art-clip">
              {id === "lab" ? <span className="resource-node-graph">
                <span className="resource-node-wire" />
                <span className="resource-node-wire resource-node-wire-branch" />
                <span className="resource-node resource-node-input" />
                <span className="resource-node resource-node-mix" />
                <span className="resource-node resource-node-output" />
                <span className="resource-node resource-node-branch" />
              </span> : <span className="resource-edit-timeline">
                <span className="resource-edit-ruler" />
                <span className="resource-edit-track"><i /><i /></span>
                <span className="resource-edit-track"><i /><i /></span>
                <span className="resource-edit-track"><i /><i /></span>
                <span className="resource-edit-playhead" />
              </span>}
            </span>
          </span>
          <span className="resource-choice-info">
            <Icon className="resource-choice-icon" aria-hidden="true" />
            <span className="resource-choice-text">
              <span className="resource-choice-title" id={`resource-label-${id}`}>{title[language]}</span>
              <span className="resource-choice-description" aria-hidden={active !== null}>
                <span id={`resource-description-${id}`}>{description}</span>
              </span>
            </span>
            <span className="resource-choice-arrow">
              {active === id ? <Check aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}
            </span>
          </span>
        </Link>)}
      </nav>
    </section>
  </Localized>;
}
