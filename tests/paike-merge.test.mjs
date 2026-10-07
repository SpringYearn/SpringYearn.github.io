import{test}from'node:test';import assert from'node:assert/strict';import{execFileSync}from'node:child_process';import{readFileSync,existsSync}from'node:fs';import{createRequire}from'node:module';import{runInNewContext}from'node:vm';
import{projects,resolveWorkId,workPageIds}from'../app/portfolio-data.ts';import{projectDates}from'../app/work/project-dates.ts';
const require=createRequire(import.meta.url),ts=require('typescript');
const beforeSource=execFileSync('git',['show','d5a143b103e0ec37e4612fc6f32dacd8666a855d:app/portfolio-data.ts'],{encoding:'utf8'}),exports={};runInNewContext(ts.transpileModule(beforeSource,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});const before=JSON.parse(JSON.stringify(exports.projects));
test('PAIKE preserves both images and every unrelated work record',()=>{
 const paike=projects.find(p=>p.id==='14'),system=before.find(p=>p.id==='14'),mobile=before.find(p=>p.id==='15');assert.equal(projects.filter(p=>p.category==='design').length,1);assert.equal(paike.thumbnail,mobile.thumbnail);assert.equal(paike.href,mobile.href);assert.equal(paike.gallery[0].src,system.thumbnail);
 for(const item of before.filter(p=>p.id!=='14'&&p.id!=='15'))assert.deepEqual(projects.find(p=>p.id===item.id),item);
 for(const src of[paike.thumbnail,paike.gallery[0].src])assert.ok(existsSync(new URL('../public'+src,import.meta.url)));
 assert.equal(projectDates['14'].updated,'2024-06-21');assert.equal(resolveWorkId('15'),'14');assert.ok(workPageIds.includes('15'));
});
test('legacy PAIKE pages share the canonical project and both images',()=>{
 for(const id of['14','15']){const html=readFileSync(new URL(`../out/work/${id}/index.html`,import.meta.url),'utf8');assert.ok(html.includes('rel="canonical" href="https://springyearn.github.io/work/14/"'));assert.ok(html.includes('/works/paike-mobile-interface.webp'));assert.ok(html.includes('/works/paike-app-system.webp'));assert.ok(html.includes('/share/work/14/cover.png'));}
 assert.ok(existsSync(new URL('../out/share/work/15/cover.png',import.meta.url)));
});
