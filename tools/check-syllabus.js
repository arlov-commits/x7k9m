/* Reads calendars/source/syllabus.xlsx exactly the way the app does and prints what it found.
 *
 *   node tools/check-syllabus.js [path/to/syllabus.xlsx]
 *
 * Nothing is generated — the app parses the spreadsheet itself at runtime, so this is only a way to
 * see, before pushing, what the Syllabus tab is about to show. A row whose date or title does not
 * parse is silently ignored by the app; this prints the per-class counts and every warning so a
 * dropped row is visible here rather than as a gap in the tab.
 *
 * Requires node 18+ (DecompressionStream). */
const fs=require('fs');
const path=require('path');
const {sylParseWorkbook}=require(path.join(__dirname,'..','syllabus.js'));
const file=process.argv[2]||path.join(__dirname,'..','calendars','source','syllabus.xlsx');
const buf=fs.readFileSync(file);

sylParseWorkbook(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength)).then(f=>{
  console.log(path.relative(process.cwd(),file)+': '+f.entries.length+' entries, '+f.first+' → '+f.last);
  f.classes.forEach(c=>{
    const mine=f.entries.filter(e=>e.cat===c.cat);
    const rec=mine.filter(e=>e.rec).length;
    console.log('  '+c.alias.padEnd(10)+String(mine.length).padStart(4)+'  ('+(mine.length-rec)+' dated, '+rec+' recurring)  '+c.name);
  });
  const byType={};f.entries.forEach(e=>byType[e.type]=(byType[e.type]||0)+1);
  console.log('  types: '+Object.keys(byType).sort().map(t=>t+' '+byType[t]).join(', '));
  if(f.warnings.length){console.error('\nwarnings:');f.warnings.forEach(w=>console.error('  '+w));process.exitCode=1}
  const ids=new Set(f.entries.map(e=>e.id));
  if(ids.size!==f.entries.length){console.error('\nid collision: '+(f.entries.length-ids.size)+' duplicate id(s)');process.exitCode=1}
}).catch(e=>{console.error('failed to read '+file+': '+e.message);process.exitCode=1});
