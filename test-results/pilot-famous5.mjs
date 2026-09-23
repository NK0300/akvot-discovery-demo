import fs from 'fs';
const BASE = 'https://akvot-simple-demo.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CASES = [
  { id: 'bibi', q: 'בנימין נתניהו', expectQid: 'Q43723', kind: 'famous' },
  { id: 'lapid', q: 'יאיר לפיד', expectQid: 'Q1396120', kind: 'famous' },
  { id: 'saar', q: 'גדעון סער', expectQid: 'Q966349', kind: 'famous' },
  { id: 'begin', q: 'מנחם בגין', expectQid: 'Q130873', kind: 'famous' },
  { id: 'meloni', q: 'Giorgia Meloni', expectQid: 'Q451791', kind: 'famous' },
  { id: 'dani', q: 'דני כהן', expectQid: null, kind: 'control' },
];

function judge(c, d, status, err) {
  const faces = !!(d && (d.photo || (d.images || []).length));
  const ui = d?.uiState ?? null;
  const mode = d?.mode ?? null;
  const qid = d?.qid ?? null;
  const fails = [];
  if (err) fails.push(err);
  if (status && status !== 200) fails.push('HTTP ' + status);
  if (c.kind === 'famous') {
    if (ui !== 'dossier' && !(String(mode || '').includes('wiki'))) fails.push('not_dossier');
    if (c.expectQid && qid !== c.expectQid) fails.push('qid=' + qid);
    if (!qid) fails.push('no_qid');
  } else {
    if (ui !== 'need_context' && !d?.needContext && d?.messageKey !== 'common_name') fails.push('ui=' + ui);
    if (faces) fails.push('FACES');
  }
  return { pass: fails.length === 0, fails, ui, mode, qid, faces, phase: d?.phase ?? null };
}

const rows = [];
for (const c of CASES) {
  const t0 = Date.now();
  let status = 0, d = null, err = null;
  try {
    const r = await fetch(`${BASE}/api/lookup?q=${encodeURIComponent(c.q)}&nocache=1`, {
      headers: { Origin: BASE, 'x-akvot-battery': '1' },
      signal: AbortSignal.timeout(95000),
    });
    status = r.status;
    const raw = await r.text();
    try { d = JSON.parse(raw); } catch { err = 'json:' + raw.slice(0, 60); }
  } catch (e) {
    err = String(e.message || e);
  }
  const ms = Date.now() - t0;
  const j = judge(c, d, status, err);
  rows.push({ id: c.id, q: c.q, kind: c.kind, http: status, ms, ...j });
  console.log(`${j.pass ? 'PASS' : 'FAIL'} ${c.id} HTTP=${status} ${ms}ms ui=${j.ui} mode=${j.mode} qid=${j.qid} faces=${j.faces} ${j.fails.join(';')}`);
  await sleep(2000);
}
const famous = rows.filter((r) => r.kind === 'famous');
const famousPass = famous.filter((r) => r.pass).length;
const dani = rows.find((r) => r.id === 'dani');
const out = {
  when: new Date().toISOString(),
  base: BASE,
  famous: `${famousPass}/5`,
  daniOk: !!dani?.pass,
  goReady: famousPass >= 4 && !!dani?.pass,
  rows,
};
fs.writeFileSync(new URL('./PILOT-famous5-בודק-2026-09-08.json', import.meta.url), JSON.stringify(out, null, 2));
const md = `# PILOT famous×5 · בודק · 2026-09-08

**famous: ${famousPass}/5** · דני: ${dani?.pass ? 'PASS' : 'FAIL'} · **GO ready: ${out.goReady ? 'YES (≥4/5)' : 'NO'}**

| id | HTTP | ms | ui | mode | qid | faces | result |
|----|------|----|----|------|-----|-------|--------|
${rows.map((r) => `| ${r.id} | ${r.http} | ${r.ms} | ${r.ui} | ${r.mode} | ${r.qid || '-'} | ${r.faces} | ${r.pass ? 'PASS' : 'FAIL ' + r.fails.join(';')} |`).join('\n')}
`;
fs.writeFileSync(new URL('./PILOT-famous5-בודק-2026-09-08.md', import.meta.url), md);
console.log('SUMMARY', JSON.stringify({ famous: out.famous, daniOk: out.daniOk, goReady: out.goReady }));
