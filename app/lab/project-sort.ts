import type { LabExperiment } from "../lab-data";

export type LabSortKey = "original" | "updated" | "created" | "name" | "type";
export type LabSortDirection = "asc" | "desc";

export function sortLabProjects(
  projects: readonly LabExperiment[],
  key: LabSortKey,
  direction: LabSortDirection,
): LabExperiment[] {
  const factor = direction === "asc" ? 1 : -1;
  const text = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
  // Month-only records use the beginning of the month for ordering only.
  // Their displayed dates retain the original precision.
  const dateValue = (date: string) => date.length === 7 ? date + "-01" : date;
  return projects.map((project, index) => ({ project, index }))
    .sort((a, b) => {
      let comparison = a.index - b.index;
      if (key === "updated" || key === "created") {
        comparison = dateValue(a.project.date[key]).localeCompare(dateValue(b.project.date[key]));
      } else if (key === "name" || key === "type") {
        comparison = text.compare(a.project[key === "name" ? "title" : "type"], b.project[key === "name" ? "title" : "type"]);
      }
      return comparison * factor || a.index - b.index;
    })
    .map(({ project }) => project);
}
