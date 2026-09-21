import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const history = JSON.parse(readFileSync(path.join(root, "site-history.json"), "utf8"));
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

// The first release of this feature deliberately retains the previous update.
// After that, the latest site-changing commit drives the date, never build time.
if (git("rev-parse", "--is-shallow-repository") === "true") {
  throw new Error("Update dates require full Git history. Use actions/checkout with fetch-depth: 0.");
}
const introduction = git("log", "--diff-filter=A", "--format=%H", "--", "site-history.json")
  .split("\n").filter(Boolean).at(-1);
const [latestCommit, committedAt] = git(
  "log", "-1", "--format=%H%n%cI", "--",
  "app", "components", "hooks", "lib", "public", "src", "styles", "scripts",
  "site-history.json", "package.json", "package-lock.json", "next.config.*",
  "tsconfig*.json", "postcss.config.*", "tailwind.config.*", "vendor",
  ".github/workflows/deploy-pages.yml",
).split("\n");

let lastUpdated = history.initialLastUpdated;
if (introduction && latestCommit && latestCommit !== introduction) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: history.timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(committedAt));
  const part = (name) => parts.find((item) => item.type === name).value;
  lastUpdated = `${part("year")}-${part("month")}-${part("day")}`;
}

console.log(`Site last updated: ${lastUpdated} (${history.timeZone})`);
if (!process.argv.includes("--print-date")) {
  const result = spawnSync(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "1", NEXT_PUBLIC_SITE_UPDATED: lastUpdated },
  });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
