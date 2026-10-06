import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript');
const locales=['en','zh','ja','ko','ru','vi'];
const dictionaries=Object.fromEntries(locales.map(locale=>[locale,JSON.parse(readFileSync(new URL(`../app/locales/${locale}.json`,import.meta.url),'utf8'))]));
const source=readFileSync(new URL('../app/localization.ts',import.meta.url),'utf8');
const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{exports,require(path){return JSON.parse(readFileSync(new URL('../app/'+path.replace('./',''),import.meta.url),'utf8'));}});
test('all six locales have complete, nonempty catalogues and matching placeholders',()=>{
 const keys=Object.keys(dictionaries.en).sort();
 for(const locale of locales){assert.deepEqual(Object.keys(dictionaries[locale]).sort(),keys);for(const id of keys){assert.ok(dictionaries[locale][id].trim(),`${locale}:${id}`);assert.deepEqual(dictionaries[locale][id].match(/\{\d+\}/g),dictionaries.en[id].match(/\{\d+\}/g),`${locale}:${id}`);}}
});
test('UI translation preserves project names, URLs and dynamic values',()=>{
 const {localizeText:t}=exports;
 for(const locale of locales){assert.equal(t('FusionDynamics2D',locale),'FusionDynamics2D');assert.equal(t('https://example.com/ZIP',locale),'https://example.com/ZIP');}
 assert.notEqual(t('Contact','ja'),'Contact');assert.notEqual(t('Contact','ko'),'Contact');assert.notEqual(t('Contact','ru'),'Contact');assert.notEqual(t('Contact','vi'),'Contact');
 assert.ok(t('FusionDynamics2D — Share this project','ja').startsWith('FusionDynamics2D — '));
 assert.ok(t('Color #AbCdEf','ru').includes('#AbCdEf'));
});
