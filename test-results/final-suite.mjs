const BASE = 'https://akvot-simple-demo.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CASES = [
  { id: 'wiki-netanyahu', cat:'wiki', q: 'בנימין נתניהו', expect: 'wikiRich', qid: 'Q43723' },
  { id: 'wiki-galon', cat:'wiki', q: 'זהבה גלאון', expect: 'wikiRich', qid: 'Q2630062' },
  { id: 'wiki-lieberman', cat:'wiki', q: 'אביגדור ליברמן', expect: 'wikiRich', qid: 'Q58311' },
  { id: 'wiki-obama', cat:'wiki', q: 'ברק אובמה', expect: 'wikiRich', qid: 'Q76' },
  { id: 'wiki-herzog', cat:'wiki', q: 'יצחק הרצוג', expect: 'wikiRich' },
  { id: 'wiki-lapid', cat:'wiki', q: 'יאיר לפיד', expect: 'wikiRich' },
  { id: 'biz-gil', cat:'biz', q: 'גיל פרידמן', expect: 'bizOk' },
  { id: 'biz-assaf', cat:'biz', q: 'Assaf Rappaport', expect: 'bizOk' },
  { id: 'biz-dov', cat:'biz', q: 'דב מורן', expect: 'wikiRich', qid: 'Q1252841' },
  { id: 'amb-dani', cat:'amb', q: 'דני כהן', expect: 'ambiguousSafe' },
  { id: 'amb-israel', cat:'amb', q: 'ישראל ישראלי', expect: 'ambiguousSafe' },
  { id: 'amb-moshe', cat:'amb', q: 'משה כהן', expect: 'ambiguousSafe' },
  { id: 'junk1', cat:'junk', q: 'פלורקסימון זבולון קפצוני', expect: 'empty' },
  { id: 'junk2', cat:'junk', q: 'Xyzzypq Blorfnak 999', expect: 'empty' },
  { id: 'wiki-einstein', cat:'wiki', q: 'אלברט איינשטיין', expect: 'wikiRich' },
  { id: 'biz-kobi', cat:'biz', q: 'קובי אלכסנדר', expect: 'bizOrWiki' },
];

function judge(c, d, status) {
  const fails = [];
  if (status === 429) return { fails: ['http 429'], critical: false };
  if (status !== 200) return { fails: [`http ${status}`], critical: status >= 500 };
  const wiki = (d.mode || '').includes('wiki') || !!d.qid;
  const imgs = (d.images || []).length;
  const photo = !!d.photo;
  if (d.qid === 'Q875556') fails.push('CRITICAL Israelis group');
  if (d.qid === 'Q6915744') fails.push('CRITICAL pirate');
  if (c.expect === 'wikiRich') {
    if (!wiki) fails.push('missing wiki');
    if (c.qid && d.qid && d.qid !== c.qid) fails.push(`qid mismatch ${d.qid}`);
    if (imgs < 1 && !photo) fails.push('no images');
    if ((d.sources || []).length < 2) fails.push('few sources');
  }
  if (c.expect === 'ambiguousSafe') {
    if (wiki) fails.push(`CRITICAL committed wiki ${d.label}/${d.qid}`);
    if (photo) fails.push('CRITICAL photo on unresolved ambiguous');
    if (imgs > 0) fails.push(`CRITICAL images=${imgs} on unresolved ambiguous`);
    if (!(d.alts || []).length) fails.push('expected alts for ambiguous'); // soft? keep as fail for visibility
  }
  if (c.expect === 'empty') {
    if (imgs || photo || wiki) fails.push('not honestly empty');
  }
  if (c.expect === 'bizOk') {
    if (photo && !(d.sources || []).length && !wiki) fails.push('photo no sources');
    if (!wiki && !(d.sources || []).length && !imgs) fails.push('empty business');
  }
  if (c.expect === 'bizOrWiki') {
    if (photo && !(d.sources || []).length && !wiki) fails.push('photo no sources');
  }
  const critical = fails.some((f) => /CRITICAL|wrong|pirate|Israelis/i.test(f));
  return { fails, critical };
}

const results = [];
for (const c of CASES) {
  process.stdout.write(`→ ${c.id} ... `);
  const t0 = Date.now();
  let d = null, status = 0, err = null;
  try {
    const r = await fetch(`${BASE}/api/lookup?q=${encodeURIComponent(c.q)}&nocache=1`, { signal: AbortSignal.timeout(95000) });
    status = r.status;
    d = await r.json();
  } catch (e) { err = String(e.message || e); }
  const ms = Date.now() - t0;
  const v = err ? { fails: [err], critical: true } : judge(c, d || {}, status);
  // soft: alts missing on ambiguous — downgrade if otherwise safe
  if (c.expect === 'ambiguousSafe' && v.fails.length === 1 && v.fails[0] === 'expected alts for ambiguous') {
    // still note but pass if no face
    if (!d?.photo && !(d?.images || []).length && !d?.qid) {
      v.fails = [];
      v.note = 'thin without alts';
    }
  }
  const row = {
    id: c.id, cat: c.cat, q: c.q, ms, status, pass: !v.fails.length, critical: !!v.critical, fails: v.fails,
    mode: d?.mode, label: d?.label, qid: d?.qid, photo: !!d?.photo, imgs: (d?.images||[]).length,
    src: (d?.sources||[]).length, alts: (d?.alts||[]).length, broad: d?.allowBroadImages, ambiguous: d?.ambiguous,
    groups: [...new Set((d?.sources||[]).map(s=>s.group).filter(Boolean))],
  };
  results.push(row);
  console.log(`${row.pass?'PASS':row.critical?'FAIL-CRIT':'FAIL'} ${ms}ms mode=${row.mode} qid=${row.qid} imgs=${row.imgs} photo=${row.photo} alts=${row.alts} amb=${row.ambiguous} broad=${row.broad}`);
  if (v.fails.length) console.log('   ', v.fails.join('; '));
  await sleep(2800);
}

// SSE smoke
process.stdout.write('→ sse-smoke ... ');
let sseOk = false;
try {
  const r = await fetch(`${BASE}/api/lookup?q=${encodeURIComponent('זהבה גלאון')}&stream=1&nocache=1`, { signal: AbortSignal.timeout(90000), headers: { Accept: 'text/event-stream' } });
  const t = await r.text();
  sseOk = r.ok && /data:.*"type":"progress"/.test(t) && /"type":"result"/.test(t);
  console.log(sseOk ? 'PASS' : 'FAIL', `bytes=${t.length}`);
} catch (e) { console.log('FAIL', e.message); }

// mobile
process.stdout.write('→ mobile-html ... ');
const mh = await fetch(BASE, { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' } });
const html = await mh.text();
const mobOk = mh.ok && /width=device-width/.test(html);
console.log(mobOk ? 'PASS' : 'FAIL');

const times = results.map(r => r.ms).sort((a,b)=>a-b);
const out = {
  when: new Date().toISOString(),
  pass: results.filter(r=>r.pass).length,
  fail: results.filter(r=>!r.pass).length,
  critical: results.filter(r=>r.critical).length,
  latency: { p50: times[Math.floor(times.length*0.5)], p95: times[Math.min(times.length-1, Math.floor(times.length*0.95))], min: times[0], max: times[times.length-1], n: times.length, all: times },
  rate429: results.filter(r=>r.status===429).length,
  sseOk, mobOk,
  results,
};
console.log('\n=== FINAL ===', JSON.stringify({ pass: out.pass, fail: out.fail, critical: out.critical, p50: out.latency.p50, p95: out.latency.p95, rate429: out.rate429, sseOk, mobOk }));
await import('fs').then(fs => fs.writeFileSync('/workspace/akvot-quick-demo/test-results/live-final.json', JSON.stringify(out, null, 2)));
