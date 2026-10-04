import assert from "node:assert/strict";
import { test } from "node:test";
import { labExperiments } from "../app/lab-data.ts";
import { sortLabProjects } from "../app/lab/project-sort.ts";

test("each criterion supports both directions without changing the projects", () => {
  const before = structuredClone(labExperiments);
  const ids = projects => projects.map(project => project.id);
  assert.deepEqual(ids(sortLabProjects(labExperiments, "original", "asc")), ids(before));
  assert.deepEqual(ids(sortLabProjects(labExperiments, "original", "desc")), ids(before).reverse());
  for (const direction of ["asc", "desc"]) {
    const factor = direction === "asc" ? 1 : -1;
    for (const key of ["updated", "created", "name", "type"]) {
      const ordered = sortLabProjects(labExperiments, key, direction);
      assert.deepEqual(ids(ordered).sort(), ids(before).sort());
      assert.ok(ordered.every(project => labExperiments.includes(project)));
      for (let index = 1; index < ordered.length; index++) {
        const value = project => key === "name" ? project.title : key === "type" ? project.type : project.date[key].padEnd(10, "-01");
        assert.ok(new Intl.Collator("en", { numeric: true, sensitivity: "base" }).compare(value(ordered[index - 1]), value(ordered[index])) * factor <= 0);
      }
    }
  }
  assert.deepEqual(labExperiments, before);
  assert.equal(sortLabProjects(labExperiments, "updated", "desc")[0].id, "LAB-01");
  assert.equal(sortLabProjects(labExperiments, "name", "asc")[0].id, "LAB-07");
});

test("equal values keep original relative order in both directions, including month-only dates", () => {
  const projects = labExperiments.slice(0, 3).map(project => ({ ...project, type: "Same type", date: { created: "2026-09", updated: "2026-09-01" } }));
  projects[1].date.updated = "2026-09";
  for (const key of ["created", "updated", "type"]) {
    for (const direction of ["asc", "desc"]) {
      assert.deepEqual(sortLabProjects(projects, key, direction).map(project => project.id), projects.map(project => project.id));
    }
  }
  assert.equal(projects[1].date.updated, "2026-09");
  assert.deepEqual(sortLabProjects([], "name", "desc"), []);
});
