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
  assert.equal(days[0].version, "V.052 — V.053");
  assert.equal(days[1].version, "V.047 — V.051");
  assert.equal(days[2].version, "V.042 — V.046");
  assert.equal(days[3].version, "V.024 — V.041");
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
