type Release = { version: string; date: string; en: string[]; zh: string[] };
type DailyRelease = Release & { versions: string[] };

export function groupReleasesByDate(releases: readonly Release[]): DailyRelease[] {
  const days = new Map<string, DailyRelease>();
  for (const release of releases) {
    let day = days.get(release.date);
    if (!day) {
      day = { date: release.date, version: release.version, versions: [], en: [], zh: [] };
      days.set(release.date, day);
    }
    day.versions.push(release.version);
    for (const language of ["en", "zh"] as const) {
      for (const note of release[language]) {
        if (!day[language].includes(note)) day[language].push(note);
      }
    }
    day.version = day.versions.length === 1 ? day.versions[0] : `${day.versions.at(-1)} — ${day.versions[0]}`;
  }
  return [...days.values()].sort((a, b) => b.date.localeCompare(a.date));
}
