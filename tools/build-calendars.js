/* Generates calendars-data.js from the two monasteries' CSV exports.
 *
 *   node tools/build-calendars.js [abhayagiri.csv] [drba.csv]
 *
 * Defaults to calendars/source/*.csv, which are the exports the committed table was built from.
 * To refresh a calendar: drop the new export over the one in calendars/source, re-run this, and
 * commit both. Do not hand-edit calendars-data.js — it is overwritten wholesale.
 *
 * Warnings on stderr mean the source said something this script does not know how to read (an
 * unrecognised lunar day, a moon phase that is not New/Full, an Abhayagiri URL that is not the
 * derivable per-date page). A clean run prints none. */
const fs=require('fs');
const path=require('path');
const ROOT=path.join(__dirname,'..');
const AB=process.argv[2]||path.join(ROOT,'calendars','source','abhayagiri.csv');
const DR=process.argv[3]||path.join(ROOT,'calendars','source','drba.csv');
const OUT=path.join(ROOT,'calendars-data.js');

function parseCSV(text){
  const rows=[];let row=[],f='',q=false;
  text=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){f+='"';i++} else q=false } else f+=c }
    else if(c==='"')q=true;
    else if(c===','){row.push(f);f=''}
    else if(c==='\n'){row.push(f);f='';rows.push(row);row=[]}
    else f+=c;
  }
  if(f!==''||row.length){row.push(f);rows.push(row)}
  return rows.filter(r=>r.some(x=>x.trim()!==''));
}
const iso=us=>{const[m,d,y]=us.split('/');return y+'-'+m+'-'+d};

/* ---------------- Abhayagiri ---------------- */
const ab=parseCSV(fs.readFileSync(AB,'utf8')).slice(1);
const abByDate={};
ab.forEach(r=>{
  const key=iso(r[2].trim());
  const rec=abByDate[key]||(abByDate[key]={subs:[],url:(r[4]||'').trim()});
  rec.subs.push(r[0].trim());
});
// Alms Round and the observance day are always the same day (verified 32/32), so they collapse
// into one row. Which half moon it is comes from the preceding observance: the list alternates
// New -> Half -> Full -> Half with no breaks, so a Half after New waxes and a Half after Full wanes.
const PH={New:0,First:1,Full:2,Last:3};
const dates=Object.keys(abByDate).sort();
let lastMajor=null;
const abOut={};
dates.forEach(key=>{
  const rec=abByDate[key];
  const obs=rec.subs.find(s=>/Moon Observance Day$/.test(s));
  const alms=rec.subs.filter(s=>/^Alms Round/.test(s));
  const rest=rec.subs.filter(s=>!/Moon Observance Day$/.test(s)&&!/^Alms Round/.test(s));
  const events=[];
  let phase;
  if(obs){
    const kind=obs.replace(' Moon Observance Day','');
    if(kind==='New'){phase=PH.New;lastMajor='New'}
    else if(kind==='Full'){phase=PH.Full;lastMajor='Full'}
    else phase=(lastMajor==='Full')?PH.Last:PH.First;
    // The phase alone marks the observance: `p` present means this is a Wan Phra day. The app
    // names the phase once, in the shared moon reading, so storing "New Moon Wan Phra" here would
    // only make the day cell say "New Moon" twice.
  }else if(alms.length){
    events.push(alms[0]);                       // never happens in this data; kept for safety
  }
  rest.forEach(s=>events.push(s));
  const o={e:events};
  if(phase!=null)o.p=phase;
  // Every row's Description is the monastery's own page for that date; it is derivable from the
  // date, so only a URL that does NOT match the pattern is worth storing.
  const derived='https://www.abhayagiri.org/calendar/'+key.slice(0,4)+'/'+ +key.slice(5,7)+'/'+ +key.slice(8);
  if(rec.url&&rec.url!==derived){o.u=rec.url;console.warn('non-derivable url',key,rec.url)}
  abOut[key]=o;
});

/* ---------------- DRBA ---------------- */
const dr=parseCSV(fs.readFileSync(DR,'utf8')).slice(1);
const LD=['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
          '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
          '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
const LM=['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const drOut={};
let curMonth='';
dr.forEach(r=>{
  const key=r[0].trim();
  const lm=r[2].replace(/\s+/g,'');
  const ld=r[3].replace(/\s+/g,'');            // one source row reads '三 十'
  if(lm)curMonth=lm;
  const dn=LD.indexOf(ld)+1;
  if(!dn)console.warn('unknown lunar day',key,JSON.stringify(ld));
  const mn=LM.indexOf(curMonth)+1;
  if(curMonth&&!mn)console.warn('unknown lunar month',key,JSON.stringify(curMonth));
  // The source names the month only on the 1st and the 15th; it governs every day until the next
  // one, so it is carried forward. The very first row is the last day of a month the source never
  // names, and is deliberately left blank rather than inferred.
  const events=(r[5]||'').split(/\s*\|\s*|\n+/).map(s=>s.trim()).filter(Boolean);
  const o={d:ld};
  if(curMonth)o.m=curMonth;
  if(mn)o.mn=mn;
  if(dn)o.dn=dn;
  if(r[4]==='New')o.p=0; else if(r[4]==='Full')o.p=2; else if(r[4])console.warn('unknown phase',key,r[4]);
  if(events.length)o.e=events;
  drOut[key]=o;
});

/* ---------------- emit ---------------- */
const j=o=>JSON.stringify(o);
const block=(obj,indent)=>Object.keys(obj).sort().map(k=>indent+j(k)+':'+j(obj[k])).join(',\n');
const abKeys=Object.keys(abOut).sort(),drKeys=Object.keys(drOut).sort();
const out=`/* calendars-data.js — the Abhayagiri and DRBA observance calendars, as published.
 * v1.0 — data only, no logic. GENERATED from the monasteries' own CSV exports (dated 8/11/26);
 * edit the generator and re-run rather than hand-editing the tables below.
 *
 * These are two further daily layers over the local almanac, each keeping its own reckoning:
 * Abhayagiri follows the Thai forest tradition's lunar calendar, DRBA the Chinese one. The three
 * moon reckonings routinely disagree by a day and are NOT reconciled — that disagreement is real
 * and is shown as it falls.
 *
 * Abhayagiri: the CSV lists "Alms Round in Ukiah and Redwood Valley" and the matching
 * "<N> Moon Observance Day" as two rows on the same date, every time (32 of 32 in this export).
 * They are one occasion. Both are dropped from \`e\` and recorded as \`p\` instead: a date with a
 * \`p\` IS a Wan Phra observance day, and the app names the phase once in the shared moon reading
 * rather than repeating it in the observance's own title. A Half Moon is resolved to First or Last
 * Quarter from its place in the sequence, which runs New -> Half -> Full -> Half with no breaks.
 * \`p\` indexes AlmanacData.MOON (0 new, 1 first quarter, 2 full, 3 last quarter).
 * \`u\` appears only where the source URL is not the derivable per-date monastery page.
 *
 * DRBA: \`m\`/\`d\` are the lunar month and day, \`mn\`/\`dn\` the same as numbers for the tooltip.
 * The source names the month on the 1st and the 15th only; it is carried forward to every day it
 * governs. The first row is the closing day of a month the source never names, so it has no \`m\`.
 */
(function (root) {
  'use strict';

  /* Abhayagiri — event days only; most dates are absent. */
  var ABHAYAGIRI = {
${block(abOut,'    ')}
  };

  /* DRBA — every day carries a lunar date, so this table is dense. */
  var DRBA = {
${block(drOut,'    ')}
  };

  root.CalendarData = {
    version: '1.0',
    /* Each calendar covers only what its export contained; outside this the layer draws nothing
       rather than guessing. Re-run the generator against a fresh export to extend it. */
    range: {
      abhayagiri: { start: ${j(abKeys[0])}, end: ${j(abKeys[abKeys.length-1])} },
      drba: { start: ${j(drKeys[0])}, end: ${j(drKeys[drKeys.length-1])} }
    },
    ABHAYAGIRI: ABHAYAGIRI,
    DRBA: DRBA
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

if (typeof module !== 'undefined' && module.exports) module.exports = globalThis.CalendarData;
`;
fs.writeFileSync(OUT,out);
console.log('wrote',OUT,(out.length/1024).toFixed(1)+'KB');
console.log('abhayagiri dates',abKeys.length,abKeys[0],'->',abKeys[abKeys.length-1]);
console.log('drba dates',drKeys.length,drKeys[0],'->',drKeys[drKeys.length-1]);
const wp=Object.values(abOut).filter(o=>o.p!=null).length;
console.log('wan phra rows',wp,'of',abKeys.length);
console.log('sample', j(abOut['2026-08-13']), j(drOut['2026-08-13']));
