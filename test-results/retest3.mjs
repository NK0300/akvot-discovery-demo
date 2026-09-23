const BASE = 'https://akvot-simple-demo.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CASES = [
  { id: 'wiki-netanyahu', q: 'בנימין נתניהו', expect: 'wikiRich', qid: 'Q43723' },
  { id: 'wiki-lieberman', q: 'אביגדור ליברמן', expect: 'wikiRich' },
  { id: 'wiki-galon', q: 'זהבה גלאון', expect: 'wikiRich', qid: 'Q2630062' },
  { id: 'wiki-obama', q: 'ברק אובמה', expect: 'wikiRich', qid: 'Q76' },
  { id: 'amb-israel', q: 'ישראל ישראלי', expect: 'ambiguousSafe' },
  { id: 'amb-moshe', q: 'משה כהן', expect: 'ambiguousSafe' },
  { id: 'amb-dani', q: 'דני כהן', expect: 'ambiguousSafe' },
  { id: 'junk', q: 'פלורקסימון זבולון קפצוני', expect: 'empty' },
  { id: 'biz-assaf', q: 'Assaf Rappaport', expect: 'bizOk' },
  { id: 'biz-gil', q: 'גיל פרידמן', expect: 'bizOk' },
  { id: 'biz-dov', q: 'דב מורן', expect: 'wikiRich', qid: 'Q1252841' },
  { id: 'wiki-herzog', q: 'יצחק הרצוג', expect: 'wikiRich' },
];

function judge(c, d) {
  const fails = [];
  const wiki = (d.mode || '').includes('wiki') || !!d.qid;
  const imgs = (d.images || []).length;
  const photo = !!d.photo;
  if (c.expect === 'wikiRich') {
    if (!wiki) fails.push('missing wiki');
    if (c.qid && d.qid && d.qid !== c.qid) fails.push(`qid ${d.qid}!=${c.qid}`);
    if (imgs < 1 && !photo) fails.push('no images');
  }
  if (c.expect === 'ambiguousSafe') {
    if (wiki) fails.push(`should not commit wiki: ${d.label} (${d.qid})`);
    if (photo && imgs === 0) fails.push('orphan photo');
    // alts OK
  }
  if (c.expect === 'empty') {
    if (imgs || photo || wiki) fails.push('not empty');
  }
  if (c.expect === 'bizOk') {
    if (photo && !(d.sources || []).length && !wiki) fails.push('photo no sources');
  }
  // critical wrong ids
  if (d.qid === 'Q875556') fails.push('Israelis group');
  if (d.qid === 'Q6915744') fails.push('pirate');
  return fails;
}

const results = [];
for (const c of CASES) {
  process.stdout.write(`→ ${c.id} ... `);
  const t0 = Date.now();
  let d, err, status = 0;
  try {
    const r = await fetch(`${BASE}/api/lookup?q=${encodeURIComponent(c.q)}&nocache=1`, { signal: AbortSignal.timeout(90000) });
    status = r.status;
    d = await r.json();
  } catch (e) { err = String(e.message || e); }
  const ms = Date.now() - t0;
  const fails = err ? [err] : judge(c, d || {});
  const row = { id: c.id, q: c.q, ms, status, pass: !fails.length, fails, mode: d?.mode, label: d?.label, qid: d?.qid, photo: !!d?.photo, imgs: (d?.images||[]).length, src: (d?.sources||[]).length, alts: (d?.alts||[]).length, wikiError: d?.wikiError || null };
  results.push(row);
  console.log(`${row.pass?'PASS':'FAIL'} ${ms}ms ${row.mode} qid=${row.qid} imgs=${row.imgs} photo=${row.photo} alts=${row.alts}${row.wikiError?' wikiErr='+row.wikiError:''}`);
  if (fails.length) console.log('   ', fails.join('; '));
  await sleep(2500);
}
const times = results.map(r=>r.ms).sort((a,b)=>a-b);
const out = { pass: results.filter(r=>r.pass).length, fail: results.filter(r=>!r.pass).length, p50: times[Math.floor(times.length/2)], p95: times[Math.min(times.length-1, Math.floor(times.length*0.95))], times, results };
console.log('\nSUMMARY', JSON.stringify({pass:out.pass,fail:out.fail,p50:out.p50,p95:out.p95}));
await import('fs').then(fs => fs.writeFileSync('/workspace/akvot-quick-demo/test-results/live-round3.json', JSON.stringify(out,null,2)));
