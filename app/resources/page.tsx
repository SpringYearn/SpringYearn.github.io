"use client";

import { useEffect, useState } from "react";
import { LabContent } from "../lab/lab-content";
import { ProjectFilesContent } from "../project-files/project-files-content";
import { ResourceFrame } from "./resource-frame";
import { ResourcePicker } from "./resource-picker";
import { resourceSectionFor, type ResourceSection } from "./resource-route";

export default function ResourcesPage() {
  const [section, setSection] = useState<ResourceSection | null>(null);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const sync = () => {
      setAnimate(false);
      setSection(resourceSectionFor(new URL(window.location.href)));
    };
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => { window.removeEventListener("hashchange", sync); window.removeEventListener("popstate", sync); };
  }, []);
  const select = (next: ResourceSection | null) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (next === section) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("project");
    url.hash = next ?? "";
    window.history.pushState(window.history.state, "", url);
    setAnimate(true);
    setSection(next);
  };
  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (section !== "lab" || !/^#lab-\d{2}$/.test(hash) || new URLSearchParams(window.location.search).has("project")) return;
    const frame = requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [section]);

  return <ResourceFrame section={section} onBrowseResources={() => select(null)}>
    <ResourcePicker active={section} animate={animate} onSelect={select} />
    {section === "lab" && <LabContent />}
    {section === "project-files" && <ProjectFilesContent />}
  </ResourceFrame>;
}
