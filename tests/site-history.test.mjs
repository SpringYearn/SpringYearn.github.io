import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { groupReleasesByDate } from "../app/site-history.ts";

test("daily groups retain all release versions and bilingual notes without changing source records", () => {
  const { releases } = JSON.parse(readFileSync(new URL("../site-history.json", import.meta.url), "utf8"));
  const before = structuredClone(releases), days = groupReleasesByDate(releases);
  assert.deepEqual(releases, before);
  assert.equal(days.length, new Set(releases.map(release => release.date)).size);
  assert.deepEqual(days.map(day => day.date), days.map(day => day.date).toSorted().reverse());
  for (const day of days) {
    const original = releases.filter(release => release.date === day.date);
    assert.deepEqual(day.versions, original.map(release => release.version));
    for (const language of ["en", "zh"]) {
      assert.deepEqual(day[language], [...new Set(original.flatMap(release => release[language]))]);
    }
  }
  assert.deepEqual(days.slice(0, 20).map(day => day.version), [
    "V.102", "V.101", "V.099 — V.100", "V.090 — V.098", "V.083 — V.089", "V.082", "V.077 — V.081", "V.076", "V.074 — V.075",
    "V.070 — V.073", "V.068 — V.069", "V.065 — V.067", "V.064",
    "V.062 — V.063", "V.061", "V.056 — V.060", "V.052 — V.055",
    "V.047 — V.051", "V.042 — V.046", "V.024 — V.041",
  ]);
});

test("nonadjacent same-day records merge and repeated notes remain available on other dates", () => {
  const release = (version, date, en, zh) => ({ version, date, en, zh });
  const days = groupReleasesByDate([
    release("V.3", "2026-10-05", ["First", "Shared"], ["甲", "共用"]),
    release("V.2", "2026-09-30", ["Shared"], ["共用"]),
    release("V.1", "2026-10-05", ["Shared", "Second"], ["共用", "乙"]),
  ]);
  assert.equal(days.length, 2);
  assert.equal(days[0].version, "V.1 — V.3");
  assert.deepEqual(days[0].en, ["First", "Shared", "Second"]);
  assert.deepEqual(days[0].zh, ["甲", "共用", "乙"]);
  assert.equal(days[1].version, "V.2");
  assert.deepEqual(days[1].en, ["Shared"]);
  assert.deepEqual(groupReleasesByDate([]), []);
});
