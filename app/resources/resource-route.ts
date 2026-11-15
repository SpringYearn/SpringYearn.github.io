export type ResourceSection = "project-files" | "lab";

export function resourceSectionFor(url: URL): ResourceSection | null {
  let hash: string;
  try { hash = decodeURIComponent(url.hash.slice(1)); } catch { hash = url.hash.slice(1); }
  if (/^lab-\d{2}$/i.test(url.searchParams.get("project") ?? "") || /^lab(?:-\d{2})?$/i.test(hash)) return "lab";
  return hash && hash !== "top" ? "project-files" : null;
}
