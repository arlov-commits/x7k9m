/* Academic Planner — syllabus feed (v11.5)
 *
 * The syllabus is no longer hard-coded. It is a spreadsheet the user maintains —
 * calendars/source/syllabus.xlsx — read straight out of the deployed site at runtime. Drop a new
 * .xlsx over that path, push, and the planner picks it up on the next load: no build step, no
 * generated file to keep in sync (unlike calendars-data.js, which is generated because its two
 * sources are third-party CSV exports that need reconciling).
 *
 * Architecture (see CLAUDE.md): the feed is READ-ONLY reference data. It is cached under its own
 * localStorage key, never in `state`, and never in a synced collection — pushing ~150 spreadsheet
 * rows through the per-record sync would be a lot of traffic for data every device can already
 * fetch for itself. The network is never in the critical path: the tab renders from the cache and
 * a refresh lands later. What IS the user's own (done / highlighted) lives in state.sylMarks,
 * keyed by the entry id this file derives.
 *
 * Ids are derived, not stored: -hash(alias|due|type|title|time). Same spreadsheet row -> same id on
 * every device, so a "done" tick survives a re-fetch and crosses devices. Editing a row's title or
 * date in the spreadsheet mints a new id and drops that row's tick — the deliberate trade for
 * having no id column to maintain by hand.
 *
 * Workbook layout:
 *   One sheet per class, named "Full Name (Alias)". Columns: date,type,title,detail,pages,source,
 *     link,notes. Header row is read by name, so columns may be reordered or added.
 *   A sheet whose name starts with "_" is not a class. "_Recurring" holds one row per repeating
 *     assignment (class,title,type,weekday,time,start_date,end_date,every_n_weeks,auto_number,
 *     skip_dates,notes), expanded here into one entry per due date so the spreadsheet stays short.
 *   Rows whose date does not parse are ignored, which is what lets the help text sit under the
 *     data on _Recurring.
 */

const SYL_FEED_URL='calendars/source/syllabus.xlsx';
const SYL_FEED_KEY='academic-planner-syl-feed';
const SYL_FEED_SCHEMA=1;
/* Class colour slots. c0..c5 are aliased to the existing per-theme accents in index.html's CSS, so
 * a class picks up a theme-correct colour without every theme needing a new variable. */
const SYL_SLOTS=6;
const SYL_TYPES=['reading','paper','exam','presentation','note','custom'];
const SYL_DOW={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6,
               sun:0,mon:1,tue:2,tues:2,wed:3,thu:4,thur:4,thurs:4,fri:5,sat:6};

/* ---------------- zip ---------------- */
/* An .xlsx is a zip of XML. Just enough of the format to pull named entries out: walk the central
 * directory (the only authoritative index), then inflate each member from its local header. */
function sylZipEntries(buf){
  const dv=new DataView(buf),u8=new Uint8Array(buf);
  let eocd=-1;
  for(let i=u8.length-22;i>=0&&i>=u8.length-22-65535;i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}}
  if(eocd<0)throw new Error('not a zip (no end-of-central-directory record)');
  const count=dv.getUint16(eocd+10,true);let p=dv.getUint32(eocd+16,true);
  const out=[];
  for(let n=0;n<count;n++){
    if(dv.getUint32(p,true)!==0x02014b50)throw new Error('bad central directory entry');
    const method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true),usize=dv.getUint32(p+24,true);
    const nlen=dv.getUint16(p+28,true),elen=dv.getUint16(p+30,true),clen=dv.getUint16(p+32,true);
    const lho=dv.getUint32(p+42,true);
    const name=new TextDecoder().decode(u8.subarray(p+46,p+46+nlen));
    // The local header repeats the name and carries its own extra field, whose length can differ
    // from the central one — read it here rather than assuming they match.
    const lnlen=dv.getUint16(lho+26,true),lelen=dv.getUint16(lho+28,true);
    const start=lho+30+lnlen+lelen;
    out.push({name,method,data:u8.subarray(start,start+csize),usize});
    p+=46+nlen+elen+clen;
  }
  return out;
}
async function sylInflate(bytes,method){
  if(method===0)return bytes;
  if(method!==8)throw new Error('unsupported zip compression method '+method);
  if(typeof DecompressionStream==='undefined')throw new Error('this browser cannot decompress the syllabus file (no DecompressionStream)');
  const ds=new DecompressionStream('deflate-raw');
  const w=ds.writable.getWriter();w.write(bytes);w.close();
  const chunks=[];const r=ds.readable.getReader();
  for(;;){const{done,value}=await r.read();if(done)break;chunks.push(value)}
  let len=0;chunks.forEach(c=>len+=c.length);
  const out=new Uint8Array(len);let o=0;chunks.forEach(c=>{out.set(c,o);o+=c.length});
  return out;
}
async function sylUnzip(buf){
  const files={};
  for(const e of sylZipEntries(buf))files[e.name]=new TextDecoder().decode(await sylInflate(e.data,e.method));
  return files;
}

/* ---------------- xml ---------------- */
/* Hand-rolled rather than DOMParser: the same code then runs under node for tools/check-syllabus.js,
 * and a spreadsheet's sheet XML is regular enough that a scanner is honest here. */
function sylUnesc(s){return s.replace(/&(?:#(\d+)|#x([0-9a-fA-F]+)|(lt|gt|amp|quot|apos));/g,
  (m,d,x,n)=>d?String.fromCodePoint(+d):x?String.fromCodePoint(parseInt(x,16))
    :({lt:'<',gt:'>',amp:'&',quot:'"',apos:"'"})[n])}
function sylTagText(xml){ // concatenated text of every <t> in a fragment (rich text = several runs)
  let s='',m,re=/<t\b[^>]*>([\s\S]*?)<\/t>|<t\b[^>]*\/>/g;
  while((m=re.exec(xml)))s+=m[1]?sylUnesc(m[1]):'';
  return s;
}
function sylSharedStrings(xml){
  if(!xml)return [];
  const out=[],re=/<si\b[^>]*>([\s\S]*?)<\/si>|<si\b[^>]*\/>/g;let m;
  while((m=re.exec(xml)))out.push(m[1]?sylTagText(m[1]):'');
  return out;
}
function sylColIndex(ref){ // "AB12" -> 27
  let n=0;for(let i=0;i<ref.length;i++){const c=ref.charCodeAt(i);if(c<65||c>90)break;n=n*26+(c-64)}
  return n-1;
}
function sylSheetRows(xml,shared){
  const rows=[],rowRe=/<row\b[^>]*>([\s\S]*?)<\/row>|<row\b[^>]*\/>/g;let rm;
  while((rm=rowRe.exec(xml))){
    const body=rm[1]||'',cells=[];
    const cRe=/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;let cm;
    while((cm=cRe.exec(body))){
      const attrs=cm[1]||'',inner=cm[2]||'';
      const rAttr=(attrs.match(/\br="([A-Z]+\d+)"/)||[])[1];
      const t=(attrs.match(/\bt="([^"]+)"/)||[])[1]||'n';
      let v='';
      if(t==='inlineStr')v=sylTagText(inner);
      else{
        const vm=inner.match(/<v\b[^>]*>([\s\S]*?)<\/v>/);
        const raw=vm?sylUnesc(vm[1]):'';
        if(t==='s')v=shared[+raw]!==undefined?shared[+raw]:'';
        else if(t==='b')v=raw==='1'?'TRUE':'FALSE';
        else v=raw;
      }
      const ci=rAttr?sylColIndex(rAttr):cells.length;
      while(cells.length<ci)cells.push('');
      cells[ci]=v;
    }
    rows.push(cells);
  }
  return rows;
}

/* ---------------- values ---------------- */
const SYL_EPOCH=Date.UTC(1899,11,30); // Excel serial 1 = 1900-01-01, plus the 1900 leap-year bug
function sylSerialToIso(n){
  const d=new Date(SYL_EPOCH+Math.round(n)*864e5);
  return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');
}
function sylIsoDate(v){ // accepts an Excel serial, an ISO string, or M/D/YYYY
  if(v===''||v===null||v===undefined)return '';
  const s=String(v).trim();if(!s)return '';
  if(/^\d+(\.\d+)?$/.test(s)){const n=parseFloat(s);return n>=1?sylSerialToIso(n):''}
  let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(m)return m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');
  m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m)return m[3]+'-'+m[1].padStart(2,'0')+'-'+m[2].padStart(2,'0');
  return '';
}
function sylTime(v){ // "17:00", "5:00 PM", or an Excel time fraction
  if(v===''||v===null||v===undefined)return '';
  const s=String(v).trim();if(!s)return '';
  if(/^\d*\.\d+$/.test(s)){const mins=Math.round(parseFloat(s)*1440);
    return String(Math.floor(mins/60)%24).padStart(2,'0')+':'+String(mins%60).padStart(2,'0')}
  const m=s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?m\.?)?$/i);
  if(!m)return '';
  let h=+m[1];const ap=(m[3]||'').toLowerCase();
  if(ap.startsWith('p')&&h<12)h+=12;if(ap.startsWith('a')&&h===12)h=0;
  return String(h).padStart(2,'0')+':'+m[2];
}
function sylBool(v){return /^(true|yes|y|1|x)$/i.test(String(v||'').trim())}
function sylType(v){const t=String(v||'').trim().toLowerCase();return SYL_TYPES.includes(t)?t:(t?'custom':'reading')}
/* djb2 over the identifying fields. Negative so a feed id can never collide with genId()'s
 * positive, time-derived ids for hand-added entries. */
function sylHashId(key){let h=5381;for(let i=0;i<key.length;i++)h=((h<<5)+h+key.charCodeAt(i))|0;return -((h>>>0)+1)}

/* ---------------- workbook -> feed ---------------- */
function sylHeaderMap(row){const m={};row.forEach((c,i)=>{const k=String(c||'').trim().toLowerCase();if(k&&m[k]===undefined)m[k]=i});return m}
function sylCell(row,map,name){const i=map[name];return i===undefined?'':String(row[i]===undefined||row[i]===null?'':row[i]).trim()}

function sylBuildFeed(sheets,warnings){
  const classes=[],entries=[];
  const seen=new Set();
  const push=e=>{ // ids are derived, so resolve the rare hash collision rather than lose an entry
    let id=sylHashId(e.cls+'|'+e.due+'|'+e.type+'|'+e.title+'|'+(e.dueTime||''));
    while(seen.has(id))id--;
    seen.add(id);entries.push({...e,id});
  };
  sheets.filter(s=>!s.name.startsWith('_')).forEach((sheet,idx)=>{
    const m=sheet.name.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
    const name=(m?m[1]:sheet.name).trim(),alias=(m?m[2]:sheet.name).trim();
    const cat='c'+(idx%SYL_SLOTS);
    classes.push({cat,alias,name,order:idx});
    if(!sheet.rows.length)return;
    const map=sylHeaderMap(sheet.rows[0]);
    if(map.date===undefined){warnings.push(`Sheet "${sheet.name}" has no "date" column — skipped.`);return}
    sheet.rows.slice(1).forEach(row=>{
      const due=sylIsoDate(sylCell(row,map,'date'));
      const title=sylCell(row,map,'title');
      if(!due||!title)return;
      push({cat,cls:alias,type:sylType(sylCell(row,map,'type')),title,due,dueTime:'',
            detail:sylCell(row,map,'detail'),pages:sylCell(row,map,'pages'),
            source:sylCell(row,map,'source'),link:sylCell(row,map,'link'),
            note:sylCell(row,map,'notes'),rec:false});
    });
  });
  /* Recurring: one row per repeating assignment, expanded to one entry per due date. */
  const recSheet=sheets.find(s=>s.name.replace(/^_/,'').toLowerCase()==='recurring');
  if(recSheet&&recSheet.rows.length){
    const map=sylHeaderMap(recSheet.rows[0]);
    recSheet.rows.slice(1).forEach(row=>{
      const alias=sylCell(row,map,'class'),title=sylCell(row,map,'title');
      const dow=SYL_DOW[sylCell(row,map,'weekday').toLowerCase()];
      const start=sylIsoDate(sylCell(row,map,'start_date')),end=sylIsoDate(sylCell(row,map,'end_date'));
      if(!alias||!title||dow===undefined||!start||!end)return; // help text under the data lands here
      let cls=classes.find(c=>c.alias.toLowerCase()===alias.toLowerCase())
            ||classes.find(c=>c.name.toLowerCase()===alias.toLowerCase())
            ||classes.find(c=>c.alias.toLowerCase().startsWith(alias.toLowerCase())||alias.toLowerCase().startsWith(c.alias.toLowerCase()));
      if(!cls){ // an unknown alias gets its own class rather than being dropped on the floor
        cls={cat:'c'+(classes.length%SYL_SLOTS),alias,name:alias,order:classes.length};
        classes.push(cls);
        warnings.push(`_Recurring names class "${alias}", which has no sheet — shown as its own class.`);
      }
      const every=Math.max(1,parseInt(sylCell(row,map,'every_n_weeks')||'1',10)||1);
      const num=sylBool(sylCell(row,map,'auto_number'));
      const time=sylTime(sylCell(row,map,'time'));
      const type=sylType(sylCell(row,map,'type'));
      const note=sylCell(row,map,'notes');
      const skip=new Set(sylCell(row,map,'skip_dates').split(/[;,]/).map(s=>sylIsoDate(s)).filter(Boolean));
      const [sy,sm,sd]=start.split('-').map(Number);
      const cur=new Date(Date.UTC(sy,sm-1,sd));
      cur.setUTCDate(cur.getUTCDate()+((dow-cur.getUTCDay())+7)%7); // first <dow> on or after start
      let n=0,guard=0;
      while(guard++<400){
        const iso=cur.getUTCFullYear()+'-'+String(cur.getUTCMonth()+1).padStart(2,'0')+'-'+String(cur.getUTCDate()).padStart(2,'0');
        if(iso>end)break;
        if(!skip.has(iso)){ // a skipped week is not numbered: #5 is the fifth one actually due
          n++;
          push({cat:cls.cat,cls:cls.alias,type,title:num?title+' #'+n:title,due:iso,dueTime:time,
                detail:'',pages:'',source:'',link:'',note,rec:true});
        }
        cur.setUTCDate(cur.getUTCDate()+7*every);
      }
    });
  }
  entries.sort((a,b)=>a.due.localeCompare(b.due)||a.cat.localeCompare(b.cat)||a.title.localeCompare(b.title));
  const dues=entries.map(e=>e.due);
  return {schema:SYL_FEED_SCHEMA,fetchedAt:new Date().toISOString(),classes,entries,warnings,
          first:dues.length?dues[0]:'',last:dues.length?dues[dues.length-1]:''};
}

async function sylParseWorkbook(buf){
  const warnings=[];
  const files=await sylUnzip(buf);
  const wb=files['xl/workbook.xml'];
  if(!wb)throw new Error('not an .xlsx workbook (xl/workbook.xml missing)');
  const rels={},relRe=/<Relationship\b[^>]*>/g,relXml=files['xl/_rels/workbook.xml.rels']||'';
  let rm;while((rm=relRe.exec(relXml))){
    const id=(rm[0].match(/\bId="([^"]+)"/)||[])[1],tgt=(rm[0].match(/\bTarget="([^"]+)"/)||[])[1];
    if(id&&tgt)rels[id]=tgt.replace(/^\/?xl\//,'').replace(/^\.\//,'');
  }
  const shared=sylSharedStrings(files['xl/sharedStrings.xml']);
  const sheets=[];
  const shRe=/<sheet\b[^>]*\/?>/g;let sm;
  while((sm=shRe.exec(wb))){
    const name=sylUnesc((sm[0].match(/\bname="([^"]*)"/)||[])[1]||'');
    const rid=(sm[0].match(/r:id="([^"]+)"/)||[])[1];
    const target=rels[rid];
    const xml=target?files['xl/'+target]:null;
    if(!xml){warnings.push(`Sheet "${name}" could not be read.`);continue}
    sheets.push({name,rows:sylSheetRows(xml,shared)});
  }
  return sylBuildFeed(sheets,warnings);
}

/* ---------------- cache + fetch ---------------- */
/* The cache is the source the UI renders from. A fetch only ever replaces it wholesale — the feed
 * is one document, so there is nothing here to reconcile per record. */
let _sylFeed=null,_sylFetching=false,_sylError='';
function sylFeed(){
  if(_sylFeed)return _sylFeed;
  try{const raw=localStorage.getItem(SYL_FEED_KEY);
    if(raw){const f=JSON.parse(raw);if(f&&f.schema===SYL_FEED_SCHEMA)_sylFeed=f}
  }catch(e){}
  return _sylFeed;
}
function sylFeedError(){return _sylError}
function sylFeedBusy(){return _sylFetching}
async function sylFeedRefresh(onDone){
  if(_sylFetching)return;
  _sylFetching=true;_sylError='';
  try{
    // cache:'no-store' so a service worker copy never masks a spreadsheet the user just pushed.
    // No cache-buster in the URL: the service worker keys its cache by request, so a stable URL is
    // what lets an offline load fall back to the last copy. cache:'no-store' keeps the HTTP cache
    // from masking a spreadsheet that was just pushed.
    const r=await fetch(SYL_FEED_URL,{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const feed=await sylParseWorkbook(await r.arrayBuffer());
    if(!feed.entries.length)throw new Error('the workbook parsed but held no dated rows');
    _sylFeed=feed;
    try{localStorage.setItem(SYL_FEED_KEY,JSON.stringify(feed))}catch(e){}
  }catch(e){
    _sylError=(e&&e.message)||String(e);
  }
  _sylFetching=false;
  if(onDone)onDone(_sylFeed,_sylError);
}
if(typeof module!=='undefined'&&module.exports)module.exports={sylParseWorkbook,sylIsoDate,sylTime,sylHashId};
