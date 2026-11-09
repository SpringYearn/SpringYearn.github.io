"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LabPage from "../lab/page";
import ProjectFilesPage from "../project-files/page";
import { ResourceNavigation } from "./resource-sections";
import { resourceSectionFor, type ResourceSection } from "./resource-route";

export default function ResourcesPage() {
  const [section, setSection] = useState<ResourceSection>("project-files");
  const focusSelected = useRef(false);
  useEffect(() => {
    const sync = () => setSection(resourceSectionFor(new URL(window.location.href)));
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => { window.removeEventListener("hashchange", sync); window.removeEventListener("popstate", sync); };
  }, []);
  const select = useCallback((next: ResourceSection) => {
    if (next === section) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("project");
    url.hash = next;
    window.history.pushState(window.history.state, "", url);
    focusSelected.current = true;
    setSection(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [section]);
  useEffect(() => {
    if (!focusSelected.current) return;
    focusSelected.current = false;
    document.querySelector<HTMLElement>('.resource-section-links a[aria-current="page"]')?.focus({ preventScroll: true });
  }, [section]);
  return <ResourceNavigation.Provider value={{ select }}>
    {section === "lab" ? <LabPage /> : <ProjectFilesPage />}
  </ResourceNavigation.Provider>;
}
