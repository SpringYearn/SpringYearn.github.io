import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { workPageIds } from "../../../../portfolio-data";
import { projectFiles } from "../../../../project-files/files";
import { getShareItem, type ItemKind } from "../../../../share-data";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return [...workPageIds.map(id => ({ kind: "work", id })), ...projectFiles.map(item => ({ kind: "project-files", id: item.id }))];
}

async function thumbnail(src: string | null) {
  if (!src) return null;
  try {
    let input: Buffer;
    if (src.startsWith("/")) input = await readFile(path.join(process.cwd(), "public", src.slice(1)));
    else {
      const response = await fetch(src, { signal: AbortSignal.timeout(8000), cache: "force-cache" });
      if (!response.ok) return null;
      input = Buffer.from(await response.arrayBuffer());
    }
    const png = await sharp(input).resize(760, 520, { fit: "inside", withoutEnlargement: true }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch { return null; }
}

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  if (kind !== "work" && kind !== "project-files") return new Response("Not found", { status: 404 });
  const item = getShareItem(kind as ItemKind, id);
  if (!item) return new Response("Not found", { status: 404 });
  const image = await thumbnail(item.image);
  const title = item.title.replace(/\s*\/\s*平凡$/, "");
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", padding: 44, background: "#f7f8f5", color: "#11110f", fontFamily: "sans-serif" }}>
    <div style={{ display: "flex", width: "100%", height: "100%", border: "1px solid #4e6c70", padding: 30, position: "relative" }}>
      <div style={{ display: "flex", position: "absolute", top: 25, left: 30, right: 30, justifyContent: "space-between", fontSize: 17, letterSpacing: 3, color: "#4e6c70" }}><span>SPRING YEARN</span><span>{kind === "work" ? "WORK / ARCHIVE" : "PROJECT FILES / FREE"}</span></div>
      {image && <div style={{ display: "flex", width: 560, height: 350, alignSelf: "center", marginRight: 38, background: "#e7eee6", border: "1px solid #bdcfce" }}><img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: item.fit === "contain" ? "contain" : "cover" }} /></div>}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, paddingTop: 30, paddingBottom: 30 }}>
        <div style={{ display: "flex", fontSize: image ? 46 : 78, lineHeight: 1.08, fontWeight: 700, letterSpacing: -2, marginBottom: 28 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 23, lineHeight: 1.4, color: "#4e6c70" }}>{item.label}</div>
      </div>
      <div style={{ display: "flex", position: "absolute", bottom: 24, left: 30, right: 30, justifyContent: "space-between", borderTop: "1px solid #bdcfce", paddingTop: 16, fontSize: 16, color: "#4e6c70" }}><span>{kind === "work" ? "A work by SpringYearn" : "Watch the edit. Open the project."}</span><span>SY / {id}</span></div>
    </div>
  </div>, { width: 1200, height: 630 });
}
