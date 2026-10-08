import type {Locale} from './site-language';
import aliases from './locales/aliases.json';
import en from './locales/en.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import vi from './locales/vi.json';
import additional from './locales/v051.json';
import update052 from './locales/v052.json';
import update053 from './locales/v053.json';
import update054 from './locales/v054.json';
import update055 from './locales/v055.json';
import update056 from './locales/v056.json';
import update057 from './locales/v057.json';
import update058 from './locales/v058.json';

const dictionaries:Record<Locale,Record<string,string>>={en,zh,ja,ko,ru,vi};
const index:Record<string,string>=aliases;
const normalize=(value:string)=>value.replace(/\s+/g,' ').trim().toLowerCase();
for(const row of [...additional,...update052,...update053,...update054,...update055,...update056,...update057,...update058]){
  for(const locale of ['en','zh','ja','ko','ru','vi'] as const)dictionaries[locale][row.id]=row[locale];
  index[normalize(row.en)]=row.id;index[normalize(row.zh)]=row.id;
}
const patterns=Object.entries(index).filter(([text])=>/\{\d+\}/.test(text)).map(([text,id])=>({id,regex:new RegExp('^'+text.split(/(\{\d+\})/).map(part=>/^\{\d+\}$/.test(part)?'(.+?)':part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('')+'$','i')}));

export function localizeText(value:string,locale:Locale):string {
  const normalized=normalize(value),id=index[normalized];
  if(id&&dictionaries[locale][id])return dictionaries[locale][id];
  for(const pattern of patterns){const match=value.replace(/\s+/g,' ').trim().match(pattern.regex);if(match){const translated=dictionaries[locale][pattern.id];if(translated)return translated.replace(/\{(\d+)\}/g,(_,n)=>match[Number(n)+1]??'');}}
  // Dynamic labels combine fixed UI copy with project names, dates or counts.
  // Translate only the fixed pieces; URLs, filenames and form values stay intact.
  const pieces=value.split(/(\n| — | · | \/ |: )/);
  if(pieces.length>1)return pieces.map((part,i)=>i%2?part:localizeText(part,locale)).join('');
  return value;
}
