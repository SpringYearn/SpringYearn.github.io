import{test}from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{projects}from'../app/portfolio-data.ts';import{workStories}from'../app/work/work-stories.ts';
const read=id=>readFileSync(new URL(`../out/work/${id}/index.html`,import.meta.url),'utf8');
test('new introductions retain supplied software and personal context in all six languages',()=>{
 for(const[id,software]of[['04',['DaVinci Resolve 18','Blender 3.6']],['28',['DaVinci Resolve 19']],['14',['Figma']]]){assert.deepEqual(workStories[id].software,software);assert.deepEqual(Object.keys(workStories[id].text).sort(),['en','ja','ko','ru','vi','zh']);for(const text of Object.values(workStories[id].text))assert.equal(text.paragraphs.length,2);const html=read(id);assert.ok(html.includes('class="section-block item-story"'));for(const tool of software)assert.ok(html.includes(tool));}
 assert.match(workStories['04'].text.zh.paragraphs.join(' '),/學校.*Typography.*渲染/);assert.match(workStories['28'].text.zh.paragraphs.join(' '),/CS.*Pinegrove - Need 2.*舊報紙.*同款.*兩萬/);assert.match(workStories['14'].text.zh.paragraphs.join(' '),/E排客.*UI.*UX.*未完成品/);
});
test('NEED 2 keeps its video and URL while titles and share metadata update',()=>{
 const project=projects.find(p=>p.id==='28');assert.equal(project.title,'NEED 2');assert.equal(project.href,'https://youtu.be/Gg55gN6nvU0?si=HV5rvbhuhXhA_Nqi');const html=read('28');assert.ok(html.includes('<h1>NEED 2</h1>'));assert.ok(html.includes('content="NEED 2 / SpringYearn"'));assert.ok(html.includes('rel="canonical" href="https://springyearn.github.io/work/28/"'));
});
test('the exact Figma prototype link is available on both PAIKE routes',()=>{
 const href=workStories['14'].externalLink.href;assert.equal(href,'https://www.figma.com/proto/2iVV0bFJQ3BMauuAYiHVdQ/%E5%A4%9A%E4%BA%8C%E7%94%B211%E6%9E%97%E4%BD%91_APP%E8%A8%AD%E8%A8%88%E6%88%90%E5%93%81?node-id=8401-2&starting-point-node-id=8401%3A2&t=gXOEUtIq526gKwzl-1');for(const id of['14','15'])assert.ok(read(id).includes('href="'+href.replaceAll('&','&amp;')+'"'));assert.equal(Object.keys(workStories['14'].externalLink.label).length,6);
});
