export type ResourceSection = "project-files" | "lab";

export function resourceSectionFor(url: URL): ResourceSection {
  let hash: string;
  try { hash = decodeURIComponent(url.hash.slice(1)); } catch { hash = ""; }
  return /^lab-\d{2}$/i.test(url.searchParams.get("project") ?? "") || /^lab(?:-\d{2})?$/i.test(hash)
    ? "lab" : "project-files";
}
