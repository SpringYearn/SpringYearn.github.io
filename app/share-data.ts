import type { Metadata } from "next";
import { projects, resolveWorkId } from "./portfolio-data";
import { projectFiles, type ProjectFile } from "./project-files/files";
import { featuredSummaries } from "./work/featured-data";
import { workStories } from "./work/work-stories";

export type ItemKind = "work" | "project-files";
export const siteOrigin = process.env.GITHUB_PAGES === "1" ? "https://springyearn.github.io" : "https://springyearn-portfolio.springyearn.chatgpt.site";
export const itemPath = (kind: ItemKind, id: string) => `/${kind}/${encodeURIComponent(id)}/`;
export const materialState = (file: ProjectFile) => /\.zip$/i.test(file.filename) ? "included" : /\.aep$/i.test(file.filename) ? "not-included" : "unknown";
export const materialLabel = (file: ProjectFile, language: "en" | "zh") => materialState(file) === "included"
  ? (language === "en" ? "ZIP includes media." : "ZIP 已包含素材。")
  : materialState(file) === "not-included" ? (language === "en" ? "AEP does not include media." : "AEP 未包含素材。") : "";

export function getShareItem(kind: ItemKind, id: string) {
  if (kind === "work") {
    const item = projects.find(project => project.id === resolveWorkId(id));
    if (!item) return null;
    return { kind, id: item.id, title: item.title, label: item.type.en, description: `${workStories[item.id]?.summary?.en ?? featuredSummaries[item.id]?.en ?? `${item.title} — ${item.type.en}.`} A work by SpringYearn.`, image: item.mediaType === "video" ? null : item.thumbnail, fit: item.fit ?? "cover" };
  }
  const item = projectFiles.find(file => file.id === id);
  if (!item) return null;
  const software = item.software === "ae" ? "After Effects" : "DaVinci Resolve";
  return { kind, id, title: item.title, label: `Free ${software} project file`, description: `${item.title} — Free ${software} project file by SpringYearn. ${materialLabel(item, "en")}`, image: "youtubeId" in item.preview ? `https://i.ytimg.com/vi/${item.preview.youtubeId}/hqdefault.jpg` : item.preview.poster, fit: "cover" };
}

export function itemMetadata(kind: ItemKind, id: string): Metadata {
  const item = getShareItem(kind, id);
  if (!item) return {};
  const url = new URL(itemPath(kind, item.id), siteOrigin).href;
  const image = new URL(`/share/${kind}/${item.id}/cover.png`, siteOrigin).href;
  return { title: `${item.title} / SpringYearn`, description: item.description, alternates: { canonical: url },
    openGraph: { title: `${item.title} / SpringYearn`, description: item.description, url, type: "website", locale: "en_US", alternateLocale: "zh_TW", images: [{ url: image, width: 1200, height: 630, alt: item.title }] },
    twitter: { card: "summary_large_image", title: `${item.title} / SpringYearn`, description: item.description, images: [image] } };
}
