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
import update059 from './locales/v059.json';
import update060 from './locales/v060.json';
import update061 from './locales/v061.json';
import update062 from './locales/v062.json';
import update063 from './locales/v063.json';
import update064 from './locales/v064.json';
import update065 from './locales/v065.json';
import update066 from './locales/v066.json';
import update067 from './locales/v067.json';
import update068 from './locales/v068.json';
import update069 from './locales/v069.json';
import update070 from './locales/v070.json';
import update071 from './locales/v071.json';
import update072 from './locales/v072.json';
import update073 from './locales/v073.json';
import update074 from './locales/v074.json';
import update075 from './locales/v075.json';
import update076 from './locales/v076.json';
import update077 from './locales/v077.json';
import update078 from './locales/v078.json';
import update079 from './locales/v079.json';
import update080 from './locales/v080.json';
import update081 from './locales/v081.json';
import update082 from './locales/v082.json';
import update083 from './locales/v083.json';
import update084 from './locales/v084.json';
import update085 from './locales/v085.json';
import update086 from './locales/v086.json';
import update087 from './locales/v087.json';
import update088 from './locales/v088.json';
import update089 from './locales/v089.json';
import update090 from './locales/v090.json';
import update091 from './locales/v091.json';
import update092 from './locales/v092.json';
import update093 from './locales/v093.json';
import update094 from './locales/v094.json';
import update095 from './locales/v095.json';
import update096 from './locales/v096.json';
import update097 from './locales/v097.json';
import update098 from './locales/v098.json';
import update099 from './locales/v099.json';
import update100 from './locales/v100.json';
import update101 from './locales/v101.json';
import update102 from './locales/v102.json';
import update103 from './locales/v103.json';
import update104 from './locales/v104.json';
import update105 from './locales/v105.json';
import update106 from './locales/v106.json';
import update107 from './locales/v107.json';
import update108 from './locales/v108.json';
import update109 from './locales/v109.json';
import update110 from './locales/v110.json';
import update111 from './locales/v111.json';
import update112 from './locales/v112.json';
import update113 from './locales/v113.json';
import update114 from './locales/v114.json';
import update115 from './locales/v115.json';
import update116 from './locales/v116.json';
import update117 from './locales/v117.json';

const dictionaries:Record<Locale,Record<string,string>>={en,zh,ja,ko,ru,vi};
const index:Record<string,string>=aliases;
const normalize=(value:string)=>value.replace(/\s+/g,' ').trim().toLowerCase();
for(const row of [...additional,...update052,...update053,...update054,...update055,...update056,...update057,...update058,...update059,...update060,...update061,...update062,...update063,...update064,...update065,...update066,...update067,...update068,...update069,...update070,...update071,...update072,...update073,...update074,...update075,...update076,...update077,...update078,...update079,...update080,...update081,...update082,...update083,...update084,...update085,...update086,...update087,...update088,...update089,...update090,...update091,...update092,...update093,...update094,...update095,...update096,...update097,...update098,...update099,...update100,...update101,...update102,...update103,...update104,...update105,...update106,...update107,...update108,...update109,...update110,...update111,...update112,...update113,...update114,...update115,...update116,...update117]){
  for(const locale of ['en','zh','ja','ko','ru','vi'] as const)dictionaries[locale][row.id]=row[locale];
  index[normalize(row.en)]=row.id;index[normalize(row.zh)]=row.id;
}
const patterns=Object.entries(index).filter(([text])=>/\{\d+\}/.test(text)).map(([text,id])=>({id,regex:new RegExp('^'+text.split(/(\{\d+\})/).map(part=>/^\{\d+\}$/.test(part)?'(.+?)':part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('')+'$','i')}));

function translateText(value:string,locale:Locale):string {
  const normalized=normalize(value),id=index[normalized];
  if(id&&dictionaries[locale][id])return dictionaries[locale][id];
  for(const pattern of patterns){const match=value.replace(/\s+/g,' ').trim().match(pattern.regex);if(match){const translated=dictionaries[locale][pattern.id];if(translated)return translated.replace(/\{(\d+)\}/g,(_,n)=>match[Number(n)+1]??'');}}
  // Dynamic labels combine fixed UI copy with project names, dates or counts.
  // Translate only the fixed pieces; URLs, filenames and form values stay intact.
  const pieces=value.split(/(\n| — | · | \/ |: )/);
  if(pieces.length>1)return pieces.map((part,i)=>i%2?part:translateText(part,locale)).join('');
  return value;
}

export function localizeText(value: string, locale: Locale): string {
  const text = translateText(value, locale);
  if (locale !== 'zh') return text;

  // Apply the current Chinese typography when rendering older records as well.
  return text.replace(/[^\S\r\n]*／[^\S\r\n]*/g, ' / ')
    .replaceAll('動態圖形', '動態設計')
    .replaceAll('聯繫我', '聯絡我')
    .replace(/共用(?:塗鴉)?白板|共享白板/g, '塗鴉板');
}
