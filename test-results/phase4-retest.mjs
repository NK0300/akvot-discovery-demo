const BASE = 'https://akvot-simple-demo.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CASES = [
  { id: 'wiki-netanyahu', q: 'בנימין נתניהו', expect: 'wikiRich', qid: 'Q43723' },
  { id: 'amb-dani', q: 'דני כהן', expect: 'ambiguousSafe' },
  { id: 'junk', q: 'פלורקסימון זבולון קפצוני', expect: 'empty' },
  { id: 'biz-gil', q: 'גיל פרידמן', expect: 'bizOk' },
];

function judge(c, d, status) {
  const fails = [];
  if (status !== 200) return { fails: [`http ${status}`], critical: status >= 500 };
  const wiki = (d.mode || '').includes('wiki') || !!d.qid;
  const imgs = (d.images || []).length;
  const photo = !!d.photo;
  if (c.expect === 'wikiRich') {
    if (!wiki) fails.push('missing wiki');
    if (c.qid && d.qid && d.qid !== c.qid) fails.push(`qid mismatch ${d.qid}`);
    if (imgs < 1 && !photo) fails.push('no images');
    if ((d.sources || []).length < 2) fails.push('few sources');
  }
  if (c.expect === 'ambiguousSafe') {
    if (wiki && d.qid) fails.push(`CRITICAL committed wiki ${d.label}/${d.qid}`);
    if (photo) fails.push('CRITICAL photo on unresolved ambiguous');
    if (imgs > 0) fails.push(`CRITICAL images=${imgs} on unresolved ambiguous`);
    if (!d.ambiguous) fails.push('expected ambiguous=true');
    if (!(d.alts || []).length) fails.push('expected alts');
  }
  if (c.expect === 'empty') {
    if (imgs || photo || (wiki && d.qid)) fails.push('not honestly empty');
  }
  if (c.expect === 'bizOk') {
    if (d.ambiguous && !d.qid) fails.push('biz wrongly ambiguous (blocked google)');
    if (photo && !(d.sources || []).length && !wiki) fails.push('photo no sources');
    if (!wiki && !(d.sources || []).length && !imgs && !d.extract && !d.desc) fails.push('empty business');
  }
  return { fails, critical: fails.some((f) => /CRITICAL/i.test(f)) };
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
  const row = {
    id: c.id, q: c.q, ms, status, pass: !v.fails.length, critical: !!v.critical, fails: v.fails,
    mode: d?.mode, label: d?.label, qid: d?.qid, photo: !!d?.photo, imgs: (d?.images||[]).length,
    src: (d?.sources||[]).length, alts: (d?.alts||[]).length, broad: d?.allowBroadImages,
    ambiguous: d?.ambiguous, phase: d?.phase,
  };
  results.push(row);
  console.log(`${row.pass?'PASS':row.critical?'FAIL-CRIT':'FAIL'} ${ms}ms mode=${row.mode} qid=${row.qid} label=${row.label} imgs=${row.imgs} photo=${row.photo} alts=${row.alts} amb=${row.ambiguous}`);
  if (v.fails.length) console.log('   ', v.fails.join('; '));
  await sleep(2500);
}

process.stdout.write('→ sse ... ');
let sseOk = false;
try {
  const r = await fetch(`${BASE}/api/lookup?q=${encodeURIComponent('בנימין נתניהו')}&stream=1&nocache=1`, { signal: AbortSignal.timeout(95000), headers: { Accept: 'text/event-stream' } });
  const t = await r.text();
  sseOk = r.ok && /data:.*"type":"progress"/.test(t) && /"type":"result"/.test(t) && /Q43723/.test(t);
  console.log(sseOk ? 'PASS' : 'FAIL', `bytes=${t.length}`);
} catch (e) { console.log('FAIL', e.message); }

const times = results.map(r => r.ms).sort((a,b)=>a-b);
const out = {
  when: new Date().toISOString(),
  phase: 4,
  prod: BASE,
  deploy: 'dpl_2aoyA7y7GUMzYMv4NvgjUXvmujX9',
  phase3_p50: 27831,
  success: results.every(r=>r.pass) && sseOk,
  pass: results.filter(r=>r.pass).length,
  fail: results.filter(r=>!r.pass).length,
  critical: results.filter(r=>r.critical).length,
  latency: { p50: times[Math.floor(times.length*0.5)], min: times[0], max: times[times.length-1], n: times.length, all: times },
  sseOk,
  results,
};
console.log('\n=== P4 ===', JSON.stringify({ success: out.success, pass: out.pass, fail: out.fail, critical: out.critical, p50: out.latency.p50, vs_p3_p50: out.latency.p50 - 27831, sseOk, netanyahu_ms: results.find(r=>r.id==='wiki-netanyahu')?.ms, amb_ms: results.find(r=>r.id==='amb-dani')?.ms }));
await import('fs').then(fs => fs.writeFileSync('/workspace/akvot-quick-demo/test-results/PHASE4-REPORT.json', JSON.stringify(out, null, 2)));
