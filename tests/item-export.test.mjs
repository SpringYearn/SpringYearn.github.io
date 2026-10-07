import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { projects } from "../app/portfolio-data.ts";
import { projectFiles } from "../app/project-files/files.ts";
import { featuredWorkIds } from "../app/work/featured-data.ts";
import { workStories } from "../app/work/work-stories.ts";

const read = path => readFileSync(new URL("../out/" + path, import.meta.url), "utf8");
const decode = value => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const meta = (html, key) => {
  const tag = [...html.matchAll(/<meta\b[^>]*>/g)].map(match => match[0]).find(tag => tag.includes(`property="${key}"`) || tag.includes(`name="${key}"`));
  return tag ? decode(tag.match(/content="([^"]*)"/)[1]) : null;
};

test("all 34 current individual pages export with their own canonical URL, title, description and cover", () => {
  for (const [kind, items] of [["work", projects], ["project-files", projectFiles]]) {
    for (const item of items) {
      const html = read(`${kind}/${item.id}/index.html`);
      const url = `https://springyearn.github.io/${kind}/${item.id}/`;
      assert.ok(html.includes(`rel="canonical" href="${url}"`), url);
      assert.equal(meta(html, "og:url"), url);
      assert.equal(meta(html, "og:title"), `${item.title} / SpringYearn`);
      assert.ok(meta(html, "og:description").length > 20);
      assert.equal(meta(html, "og:image"), `https://springyearn.github.io/share/${kind}/${item.id}/cover.png`);
      assert.equal(meta(html, "twitter:image"), meta(html, "og:image"));
      assert.equal(meta(html, "og:image:width"), "1200");
      assert.equal(meta(html, "og:image:height"), "630");
    }
  }
});

test("every preview cover is a distinct, valid 1200 by 630 PNG", () => {
  const hashes = new Set();
  for (const [kind, items] of [["work", projects], ["project-files", projectFiles]]) {
    for (const item of items) {
      const png = readFileSync(new URL(`../out/share/${kind}/${item.id}/cover.png`, import.meta.url));
      assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.equal(png.readUInt32BE(16), 1200);
      assert.equal(png.readUInt32BE(20), 630);
      hashes.add(createHash("sha256").update(png).digest("hex"));
    }
  }
  assert.equal(hashes.size, projects.length + projectFiles.length);
});

test("the three chosen works are featured remain selected after combining PAIKE into 27 archive projects", () => {
  assert.deepEqual(featuredWorkIds, ["02", "01", "03"]);
  assert.equal(projects.length, 27);
  const archive = read("work/index.html");
  for (const id of featuredWorkIds) assert.ok(archive.includes(`href="/work/${id}/"`));
  for (const project of projects) assert.ok(archive.includes(`data-project-id="${project.id}"`));
});

test("project-file pages preserve original downloads and distinguish supplied ZIP media from AEP", () => {
  for (const file of projectFiles) {
    const html = read(`project-files/${file.id}/index.html`);
    assert.ok(html.includes(`href="${file.downloadUrl.replaceAll("&", "&amp;")}"`), file.id);
    assert.ok(html.includes(file.filename.replaceAll("'", "&#x27;")), file.id);
    assert.ok(html.includes(file.filename.endsWith(".zip") ? "ZIP includes media." : "AEP does not include media."));
  }
});
test("the three work stories retain supplied results, software versions and linked credit",()=>{
  assert.deepEqual(Object.keys(workStories).sort(),["01","02","03"]);
  assert.deepEqual(workStories["02"].software,["DaVinci Resolve 19","Blender 4.5"]);
  assert.deepEqual(workStories["01"].software,["DaVinci Resolve 20","Blender 4.5"]);
  assert.deepEqual(workStories["03"].software,["DaVinci Resolve 19","Blender 4.4"]);
  for(const id of featuredWorkIds){
    assert.deepEqual(Object.keys(workStories[id].text).sort(),["en","ja","ko","ru","vi","zh"]);
    for(const story of Object.values(workStories[id].text))assert.ok(story.paragraphs.length>=2&&story.paragraphs.every(p=>p.trim().length>10));
    const html=read(`work/${id}/index.html`);assert.ok(html.includes('class="section-block item-story"'));for(const software of workStories[id].software)assert.ok(html.includes(software));
  }
  assert.match(workStories["02"].text.zh.paragraphs.join(' '),/ACEEC 25.*第 7 名.*ATLAS T2/);
  assert.match(workStories["01"].text.zh.paragraphs.join(' '),/2026.*Zeruel.*Avalon/);
  assert.match(workStories["03"].text.zh.paragraphs.join(' '),/EPHEC.*第三名.*2025.*Blender.*Sage/);
  assert.ok(read('work/03/index.html').includes('href="https://www.youtube.com/@drgz3D"'));
  assert.ok(!read('work/14/index.html').includes('class="section-block item-story"'));
});

test("archive covers and titles lead to details while sharing stays in individual pages", () => {
  const work = read("work/index.html"), files = read("project-files/index.html");
  assert.ok(!work.includes('class="item-share-button"'));
  assert.ok(!files.includes('class="item-share-button"'));
  for (const project of projects) {
    assert.ok([...work.matchAll(/<a\b[^>]*>/g)].some(([tag]) => tag.includes('class="work-detail-link"') && tag.includes(`href="/work/${project.id}/"`)), project.id);
    assert.ok(read(`work/${project.id}/index.html`).includes('class="item-share-button"'));
  }
  for (const file of projectFiles) {
    assert.ok(files.includes(`href="/project-files/${file.id}/"`), file.id);
    assert.ok(read(`project-files/${file.id}/index.html`).includes('class="item-share-button"'));
  }
});

test("preview links explain their destination and Project Files retains one detail CTA per item", () => {
  const files = read("project-files/index.html");
  assert.ok(!files.includes('class="pf-detail-badge"'));
  assert.equal([...files.matchAll(/class="item-details-cta"/g)].length, projectFiles.length);
  assert.ok(read("work/01/index.html").includes("Watch on YouTube"));
  assert.ok(read("work/05/index.html").includes("Open on Instagram"));
  assert.ok(read("work/14/index.html").includes("Open full image"));
  assert.ok(read("project-files/500lbs/index.html").includes("Watch on YouTube"));
  for (const path of ["work/01", "work/05", "work/14", "project-files/500lbs"]) {
    const html = read(path + "/index.html");
    assert.ok(html.includes("item-preview-caption"));
    assert.ok(html.includes("New tab"));
  }
  assert.ok(!read("project-files/ratchet/index.html").includes('class="item-preview-play"'));
});
