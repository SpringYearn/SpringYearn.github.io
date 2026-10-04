import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { labExperiments } from "../app/lab-data.ts";

const baseline = "a52e1092993e70daf58749132c5734a54895f3fe";
const gitFile = path => execFileSync("git", ["show", baseline + ":" + path], { encoding: "utf8" });
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("all eight original records and the full checkpoint survive the new LAB progress", () => {
  const home = gitFile("app/page.tsx");
  const original = home.slice(home.indexOf("const labExperiments = ["), home.indexOf("\nconst displayWords"));
  const evaluate = code => JSON.parse(JSON.stringify(runInNewContext(code + "\nlabExperiments;")));
  const records = labExperiments;
  const previous = evaluate(original);
  assert.equal(records.length, 9);
  for (let index = 1; index < 8; index++) {
    for (const field of ["id", "title", "type", "status", "body"]) assert.deepEqual(records[index][field], previous[index][field]);
  }
  const { checkpoint, history, ...current } = records[0];
  assert.ok(history.length > 0);
  assert.deepEqual({ ...current, ...checkpoint }, previous[0]);
  assert.match(checkpoint.body.en, /0\.3\.5-perbody/);
  assert.match(checkpoint.body.en, /158 tests pass/);
  assert.match(current.body.en, /0\.4\.1-usability/);
  assert.match(current.body.en, /245 passing tests/);
  assert.match(current.body.en, /await Resolve host acceptance/);
  assert.equal(records[8].title, "SY_Handwriter");
  assert.match(records[8].body.en, /0\.3\.0 Test 4/);
});

test("V.027 extends V.026 and every existing release without changing date automation", () => {
  const before = JSON.parse(execFileSync("git", ["show", "c8e4ddafce1aef9b1770294928b7ffe13edc7ff4:site-history.json"], { encoding: "utf8" }));
  const after = JSON.parse(read("site-history.json"));
  assert.equal(after.releases[0].version, "V.027");
  assert.deepEqual(after.releases.slice(1), before.releases);
  for (const key of ["initialLastUpdated", "previousReleaseCommit", "timeZone"]) {
    assert.equal(after[key], before[key]);
  }
  assert.match(read("app/site-status.tsx"), /const VISITOR_BASELINE = 3280/);
  for (const path of ["scripts/build-github.mjs", "app/portfolio-data.ts", "app/archive-transition.tsx", "app/device-tilt-control.tsx", "app/interaction-audio.tsx", "app/cursor-trail.tsx", "app/pointer-burst.tsx"]) {
    assert.equal(read(path).replaceAll("\r\n", "\n"), gitFile(path).replaceAll("\r\n", "\n"), path + " changed unexpectedly");
  }
});

test("homepage is an entrance and all LAB navigation resolves to existing routes", () => {
  const home = read("app/page.tsx");
  assert.doesNotMatch(home, /labExperiments\.map|className="lab-grid"/);
  assert.match(home, /href="\/lab"/);
  assert.match(read("app/work/page.tsx"), /href="\/lab"/);
  const lab = read("app/lab/page.tsx");
  for (const href of ["/", "/work", "/#contact"]) assert.ok(lab.includes('href="' + href + '"'));
  assert.match(lab, /<LabDownload project=\{experiment\}/);
});
