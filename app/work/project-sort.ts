import type { Project } from "../portfolio-data";
import type { ProjectDates } from "./project-dates";

export type WorkSortKey = "original" | "date" | "created" | "updated" | "name" | "category";
export type WorkSortDirection = "asc" | "desc";

export function workDateFor(dates: ProjectDates | undefined, key: WorkSortKey) {
  const source: keyof ProjectDates = key === "created" ? "created"
    : key === "updated" ? (dates?.updated ? "updated" : dates?.published ? "published" : "recorded")
    : dates?.published ? "published" : dates?.updated ? "updated" : "recorded";
  return { source, date: dates?.[source] };
}

export function sortWorkProjects(
  projects: readonly Project[],
  dates: Readonly<Record<string, ProjectDates>>,
  key: WorkSortKey,
  direction: WorkSortDirection,
): Project[] {
  const text = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
  const factor = direction === "asc" ? 1 : -1;
  const dateFor = (project: Project) => {
    const date = dates[project.id];
    return workDateFor(date, key).date;
  };
  return projects.map((project, index) => ({ project, index }))
    .sort((a, b) => {
      let comparison = a.index - b.index;
      if (key === "date" || key === "created" || key === "updated") {
        const left = dateFor(a.project), right = dateFor(b.project);
        // Unknown dates stay last in both directions; partial dates retain their precision.
        if (!left || !right) return left ? -1 : right ? 1 : a.index - b.index;
        comparison = left.padEnd(10, "-01").localeCompare(right.padEnd(10, "-01"));
      } else if (key === "name" || key === "category") {
        comparison = text.compare(a.project[key === "name" ? "title" : "category"], b.project[key === "name" ? "title" : "category"]);
      }
      return comparison * factor || a.index - b.index;
    })
    .map(({ project }) => project);
}
