import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const baseline = "a52e1092993e70daf58749132c5734a54895f3fe";
const gitFile = path => execFileSync("git", ["show", baseline + ":" + path], { encoding: "utf8" });
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("all eight bilingual records exactly match the latest checkpoint commit", () => {
  const home = gitFile("app/page.tsx");
  const original = home.slice(home.indexOf("const labExperiments = ["), home.indexOf("\nconst displayWords"));
  const moved = read("app/lab-data.ts").replace("export const", "const");
  const evaluate = code => JSON.parse(JSON.stringify(runInNewContext(code + "\nlabExperiments;")));
  const records = evaluate(moved);
  assert.equal(records.length, 8);
  assert.deepEqual(records, evaluate(original));
  assert.match(records[0].body.en, /0\.3\.5-perbody/);
  assert.match(records[0].body.en, /158 tests pass/);
});

test("V.020 extends every existing release and leaves date automation unchanged", () => {
  const before = JSON.parse(gitFile("site-history.json"));
  const after = JSON.parse(read("site-history.json"));
  assert.equal(after.releases[0].version, "V.020");
  assert.deepEqual(after.releases.slice(1), before.releases);
  for (const key of ["initialLastUpdated", "previousReleaseCommit", "timeZone"]) {
    assert.equal(after[key], before[key]);
  }
  for (const path of ["app/site-status.tsx", "scripts/build-github.mjs", "app/portfolio-data.ts", "app/archive-transition.tsx", "app/device-tilt-control.tsx", "app/interaction-audio.tsx", "app/cursor-trail.tsx", "app/pointer-burst.tsx"]) {
    assert.equal(read(path).replaceAll("\r\n", "\n"), gitFile(path).replaceAll("\r\n", "\n"), path + " changed unexpectedly");
  }
});

test("homepage is an entrance and all LAB navigation resolves to existing routes", () => {
  const home = read("app/page.tsx");
  assert.doesNotMatch(home, /labExperiments|className="lab-grid"/);
  assert.match(home, /href="\/lab"/);
  assert.match(read("app/work/page.tsx"), /href="\/lab"/);
  const lab = read("app/lab/page.tsx");
  for (const href of ["/", "/work", "/#contact"]) assert.ok(lab.includes('href="' + href + '"'));
  assert.match(lab, /<LabDownload project=\{experiment\}/);
});
