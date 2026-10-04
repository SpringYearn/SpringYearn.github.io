import assert from "node:assert/strict";
import { test } from "node:test";
import { labExperiments } from "../app/lab-data.ts";
import { labProjectUrl } from "../app/lab/project-link.ts";

test("every project has a chronological date range and dated, compact history", () => {
  const stamp = /^\d{4}-\d{2}(?:-\d{2})?$/;
  for (const project of labExperiments) {
    assert.match(project.date.created, stamp);
    assert.match(project.date.updated, stamp);
    assert.ok(project.date.created <= project.date.updated);
    assert.ok(project.history.length > 0);
    let date = project.date.created;
    for (const checkpoint of project.history) {
      assert.match(checkpoint.date, stamp);
      assert.ok(date <= checkpoint.date && checkpoint.date <= project.date.updated, project.id);
      date = checkpoint.date;
      for (const language of ["en", "zh"]) {
        assert.ok(checkpoint.title[language]);
        assert.ok(checkpoint.body[language].length > 0 && checkpoint.body[language].length < 180);
      }
    }
  }
  for (const id of ["LAB-05", "LAB-07", "LAB-08"]) {
    const project = labExperiments.find(project => project.id === id);
    assert.equal(project.date.created.length, 7);
    assert.equal(project.date.updated.length, 7);
  }
});

test("project sharing preserves only its public project identity", () => {
  for (const project of labExperiments) {
    const url = new URL(labProjectUrl("https://springyearn.github.io/lab/?unrelated=value#old", project.id));
    assert.equal(url.origin, "https://springyearn.github.io");
    assert.equal(url.pathname, "/lab/");
    assert.deepEqual([...url.searchParams], [["project", project.id.toLowerCase()]]);
    assert.equal(url.hash, "#" + project.id.toLowerCase());
  }
  for (const id of ["../file", "LAB-01&password=value", "<script>"]) assert.throws(() => labProjectUrl("https://springyearn.github.io", id));
});
