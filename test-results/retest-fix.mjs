const BASE = 'https://akvot-simple-demo.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CASES = [
  { id: 'amb-israel-israeli', q: 'ישראל ישראלי', expect: 'noWrongWiki' },
  { id: 'amb-moshe-cohen', q: 'משה כהן', expect: 'noWrongWiki' },
  { id: 'amb-dani-cohen', q: 'דני כהן', expect: 'noWrongWiki' },
  { id: 'junk-invented', q: 'פלורקסימון זבולון קפצוני', expect: 'empty' },
  { id: 'wiki-netanyahu', q: 'בנימין נתניהו', expect: 'wikiRich' },
  { id: 'wiki-galon', q: 'זהבה גלאון', expect: 'wikiRich' },
  { id: 'wiki-obama', q: 'ברק אובמה', expect: 'wikiRich' },
  { id: 'wiki-lieberman', q: 'אביגדור ליברמן', expect: 'wikiRich' },
  { id: 'biz-assaf', q: 'Assaf Rappaport', expect: 'bizOk' },
  { id: 'biz-gil', q: 'גיל פרידמן', expect: 'bizOk' },
  { id: 'biz-dov', q: 'דב מורן', expect: 'wikiRich' },
];

function judge(c, d) {
  const fails = [];
  const wiki = (d.mode || '').includes('wiki') || !!d.qid;
  const imgs = (d.images || []).length;
  const photo = !!d.photo;
  const alts = d.alts || [];
  if (c.expect === 'noWrongWiki') {
    // Must not confidently bind wrong identity
    if (wiki) {
      // allowed only if exactish label equals query (normalized spaces)
      const lab = String(d.label || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim();
      const q = c.q.trim();
      if (lab !== q && !lab.startsWith(q + ' ') === false) {
        // if wiki found with different longer name — fail
        const labTok = lab.split(/\s+/).filter(Boolean);
        const qTok = q.split(/\s+/).filter(Boolean);
        if (labTok.length > qTok.length || lab === 'ישראלים' || /הנריקז|סולל/i.test(lab)) {
          fails.push(`wrong/overconfident wiki: ${lab} (${d.qid})`);
        }
      }
      if (d.qid === 'Q875556') fails.push('matched Israelis group');
      if (d.qid === 'Q6915744') fails.push('matched pirate Henriques');
    }
    // photo without wiki for ambiguous: only JSON-LD ok; prefer thin
    if (!wiki && photo && imgs === 0) fails.push('orphan photo with 0 images');
    if (!wiki && photo && imgs > 2) fails.push('too many images without wiki');
  }
  if (c.expect === 'empty') {
    if (imgs > 0) fails.push(`imgs=${imgs}`);
    if (photo) fails.push('photo');
    if (wiki) fails.push('wiki');
  }
  if (c.expect === 'wikiRich') {
    if (!wiki) fails.push('missing wiki');
    if (imgs < 1 && !photo) fails.push('no images');
    if ((d.sources || []).length < 2) fails.push('few sources');
  }
  if (c.expect === 'bizOk') {
    if (photo && (d.sources || []).length === 0 && !wiki) fails.push('photo no sources');
  }
  return fails;
}

const results = [];
for (const c of CASES) {
  const url = `${BASE}/api/lookup?q=${encodeURIComponent(c.q)}&nocache=1`;
  const t0 = Date.now();
  let d, err, status;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
    status = r.status;
    d = await r.json();
  } catch (e) {
    err = String(e.message || e);
  }
  const ms = Date.now() - t0;
  const fails = err ? [err] : judge(c, d || {});
  const row = {
    id: c.id, q: c.q, ms, status, pass: fails.length === 0, fails,
    mode: d?.mode, label: d?.label, qid: d?.qid, photo: !!d?.photo,
    imgs: (d?.images || []).length, src: (d?.sources || []).length,
    alts: (d?.alts || []).slice(0, 5), broad: d?.allowBroadImages,
  };
  results.push(row);
  console.log(`${row.pass ? 'PASS' : 'FAIL'} ${c.id} ${ms}ms mode=${row.mode} label=${row.label} qid=${row.qid} imgs=${row.imgs} photo=${row.photo} alts=${row.alts?.length}`);
  if (fails.length) console.log('  ', fails.join('; '));
  await sleep(1200);
}
const times = results.map((r) => r.ms).sort((a, b) => a - b);
console.log('\npass', results.filter((r) => r.pass).length, '/', results.length,
  'p50', times[Math.floor(times.length / 2)], 'p95', times[Math.min(times.length - 1, Math.floor(times.length * 0.95))]);
await import('fs').then((fs) => fs.writeFileSync('/workspace/akvot-quick-demo/test-results/live-round2.json', JSON.stringify({ results, times }, null, 2)));
