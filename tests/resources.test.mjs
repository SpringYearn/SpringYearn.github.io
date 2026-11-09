import assert from "node:assert/strict";
import { test } from "node:test";
import { resourceSectionFor } from "../app/resources/resource-route.ts";

test("resource links keep file previews, software filters and LAB deep links in the correct section", () => {
  const section = suffix => resourceSectionFor(new URL("https://springyearn.github.io/resources/" + suffix));
  for (const suffix of ["", "#project-files", "#ae", "#davinci", "#need-2", "#ratchet", "#%E0%A4%A", "#unknown"]) {
    assert.equal(section(suffix), "project-files", suffix);
  }
  for (const suffix of ["#lab", "#lab-01", "#LAB-10", "#lab%2D09", "?project=lab-01#lab-01", "?project=lab-09", "?project=lab-10#project-files"]) {
    assert.equal(section(suffix), "lab", suffix);
  }
  assert.equal(section("?project=not-a-lab#project-files"), "project-files");
});
