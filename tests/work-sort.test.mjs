import assert from "node:assert/strict";
import { test } from "node:test";
import { projects } from "../app/portfolio-data.ts";
import { projectDates } from "../app/work/project-dates.ts";
import { sortWorkProjects, workDateFor } from "../app/work/project-sort.ts";

test("work sorting preserves every item and its source for both directions and each discipline", () => {
  const original = structuredClone(projects);
  for (const category of ["all", "design", "editing", "3d", "drawing"]) {
    const input = projects.filter(project => category === "all" || project.category === category);
    for (const key of ["original", "date", "created", "updated", "name", "category"]) {
      for (const direction of ["asc", "desc"]) {
        const sorted = sortWorkProjects(input, projectDates, key, direction);
        assert.deepEqual(sorted.map(project => project.id).sort(), input.map(project => project.id).sort());
        assert.ok(sorted.every(project => input.includes(project)));
      }
    }
  }
  assert.deepEqual(projects, original);
  assert.deepEqual(sortWorkProjects(projects, projectDates, "original", "desc"), [...projects].reverse());
  assert.equal(sortWorkProjects(projects, projectDates, "name", "asc")[0].title, "14.3 Billion Years");
});

test("unknown dates stay last in either direction and equal dates retain input order", () => {
  const input = projects.slice(0, 5);
  const dates = { "01": { published: "2024" }, "02": { published: "2024-01-01" }, "04": { published: "2025-02" } };
  assert.deepEqual(sortWorkProjects(input, dates, "date", "asc").map(project => project.id), ["01", "02", "04", "03", "05"]);
  assert.deepEqual(sortWorkProjects(input, dates, "date", "desc").map(project => project.id), ["04", "01", "02", "03", "05"]);
  assert.deepEqual(sortWorkProjects(input, dates, "created", "desc"), input);
  assert.deepEqual(sortWorkProjects(input, dates, "updated", "desc").map(p=>p.id),["04","01","02","03","05"]);
  assert.deepEqual(sortWorkProjects([], dates, "date", "asc"), []);
  assert.equal(dates["01"].published, "2024");
});
test("last update ordering uses genuine date clues and labels their source",()=>{
 const input=projects.slice(0,4),dates={"01":{updated:"2025-01-01",published:"2026-01-01"},"02":{published:"2025-06-01"},"03":{recorded:"2024"}};
 assert.deepEqual(sortWorkProjects(input,dates,"updated","desc").map(p=>p.id),["02","01","03","04"]);
 assert.deepEqual(workDateFor(dates["01"],"updated"),{source:"updated",date:"2025-01-01"});assert.deepEqual(workDateFor(dates["02"],"updated"),{source:"published",date:"2025-06-01"});assert.deepEqual(workDateFor(dates["03"],"updated"),{source:"recorded",date:"2024"});
});

test("publication dates use the site's Taipei timezone, independently of file creation", () => {
  assert.equal(projectDates["01"].published, "2026-03-31");
  assert.equal(projectDates["03"].published, "2025-06-29");
  assert.equal(projectDates["04"].published, "2024-10-24");
  assert.equal(projectDates["28"].published, "2025-02-12");
  for (const dates of Object.values(projectDates)) {
    for (const value of Object.values(dates)) assert.match(value, /^\d{4}(?:-\d{2}){0,2}$/);
  }
  for (const id of ["19", "26", "27"]) assert.equal(projectDates[id], undefined);
  for (const id of ["13", "14", "15", "16", "17", "18", "22", "23", "24", "25"]) assert.equal(projectDates[id].created, undefined);
});
