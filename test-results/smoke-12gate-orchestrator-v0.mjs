#!/usr/bin/env node
/**
 * 12-gate smoke vs local orchestrator-v0 (or BASE).
 * Dual bar: SAFETY (must) + PRODUCT (uiState / evidence targets).
 */
import { decideStage, filterEvidencedCandidates, classifyScenario } from '../api/lib/orchestrator.js';
import fs from 'fs';

const BASE = process.env.BASE || 'http://127.0.0.1:4011';
const OUT = new URL('./SMOKE-12gate-orchestrator-v0-2026-09-08.json', import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FAKE_PHONE = '050-9998877';
const FAKE_EMAIL = 'qa.rethink.test@example.com';

const GATES = [
  { id: 'G1-bibi', sc: 'A', q: 'בנימין נתניהו',
    safety: (d) => !!d.qid || (d.mode||'').includes('wiki'),
    product: (d) => d.uiState === 'dossier' && d.scenario === 'known' && d.qid === 'Q43723' && ((d.images||[]).length>=1 || d.photo) },
  { id: 'G2a-galon-he', sc: 'A', q: 'זהבה גלאון',
    safety: (d) => true,
    product: (d) => d.uiState === 'dossier' && (d.qid === 'Q2630062' || (d.mode||'').includes('wiki')) },
  { id: 'G2b-galon-en', sc: 'A', q: 'Zehava Galon',
    safety: (d) => true,
    product: (d) => d.uiState === 'dossier' && d.qid === 'Q2630062' },
  { id: 'G3a-obama-en', sc: 'A', q: 'Barack Obama',
    safety: (d) => true,
    product: (d) => d.uiState === 'dossier' && d.qid === 'Q76' },
  { id: 'G3b-obama-he', sc: 'A', q: 'ברק אובמה',
    safety: (d) => true,
    product: (d) => d.uiState === 'dossier' && (d.qid === 'Q76' || (d.mode||'').includes('wiki')) },
  { id: 'G4-dani', sc: 'B', q: 'דני כהן',
    safety: (d) => !d.photo && !(d.images||[]).length,
    product: (d) => d.uiState === 'need_context' || (d.uiState === 'candidates' && evidenced(d)) },
  { id: 'G5-dani-ctx', sc: 'B', q: 'דני כהן', city: 'תל אביב', org: 'הייטק',
    safety: (d) => !d.photo || ((d.sources||[]).length > 0),
    product: (d) => d.uiState !== 'thin' || evidenced(d) /* soft: ideally candidates+evidence or dossier; thin after ctx is IMPROVE */ },
  { id: 'G6-smith', sc: 'D', q: 'John Smith',
    safety: (d) => !d.photo && !(d.images||[]).length,
    product: (d) => d.uiState === 'need_context' || (d.uiState === 'candidates' && evidenced(d)) },
  { id: 'G7-smith-ibm', sc: 'D', q: 'John Smith', org: 'IBM', city: 'New York', country: 'US',
    safety: (d) => !(d.photo && !(d.sources||[]).length && !d.qid),
    product: (d) => d.uiState === 'candidates' && evidenced(d) || d.uiState === 'dossier' },
  { id: 'G8-mbrown', sc: 'D', q: 'Michael Brown',
    safety: (d) => !d.photo && !(d.images||[]).length,
    product: (d) => d.uiState === 'need_context' || d.ms < 20000 || (d.uiState === 'candidates' && evidenced(d)) },
  { id: 'G9-assaf', sc: 'D', q: 'Assaf Rappaport',
    safety: (d) => !(d.photo && !(d.sources||[]).length && !d.qid),
    product: (d) => d.uiState === 'dossier' || ((d.sources||[]).length >= 1) },
  { id: 'G10-phone', sc: 'C', phone: FAKE_PHONE, city: 'תל אביב',
    safety: (d, raw) => !raw.includes(FAKE_PHONE) && !/truecaller|sync\.me|getcontact/i.test(raw),
    product: (d) => d.scenario === 'identifier' || d.uiState === 'thin' || d.uiState === 'need_context' || d.uiState === 'candidates' },
  { id: 'G11-email', sc: 'C', q: 'John Smith', email: FAKE_EMAIL,
    safety: (d, raw) => !raw.includes(FAKE_EMAIL) && !d.photo,
    product: (d) => true },
  { id: 'G12a-junk-he', sc: 'X', q: 'פלורקסימון זבולון קפצוני',
    safety: (d) => !d.photo && !(d.images||[]).length && !d.qid,
    product: (d) => d.uiState === 'thin' || d.uiState === 'need_context' },
  { id: 'G12b-junk-en', sc: 'X', q: 'Xyzzypq Blorfnak 999',
    safety: (d) => !d.photo && !(d.images||[]).length && !d.qid,
    product: (d) => d.uiState === 'thin' || d.uiState === 'need_context' },
];

function evidenced(d) {
  const cands = d.candidates || [];
  if (!cands.length) return (d.sources || []).some((s) => s && s.url && /^https:/i.test(s.url));
  return filterEvidencedCandidates(cands).length > 0;
}

function buildUrl(c) {
  const p = new URLSearchParams();
  if (c.q) p.set('q', c.q);
  if (c.phone) p.set('phone', c.phone);
  if (c.email) p.set('email', c.email);
  if (c.city) p.set('city', c.city);
  if (c.org) p.set('org', c.org);
  if (c.country) p.set('country', c.country);
  p.set('nocache', '1');
  return `${BASE}/api/lookup?${p}`;
}

// --- Unit contract checks (no network) ---
const units = [];
{
  const s = decideStage({ q: 'דני כהן', ctx: {}, softAmbiguous: true, wiki: { found: false }, wikiCommitted: false, rich: false, candidates: [], sources: [], thin: false });
  units.push({ id: 'U-dani-need_context', pass: s.uiState === 'need_context' && s.scenario === 'stranger', detail: s });
}
{
  const s = decideStage({ q: 'John Smith', ctx: {}, softAmbiguous: true, wiki: { found: false }, wikiCommitted: false, rich: false, candidates: [], sources: [], thin: false });
  units.push({ id: 'U-smith-need_context', pass: s.uiState === 'need_context' && s.scenario === 'foreign', detail: s });
}
{
  const s = decideStage({ q: 'בנימין נתניהו', ctx: {}, softAmbiguous: false, wiki: { found: true, qid: 'Q43723', ambiguous: false }, wikiCommitted: true, rich: true, candidates: [], sources: [{ url: 'https://he.wikipedia.org' }], thin: false, images: [{}], photo: 'x' });
  units.push({ id: 'U-known-dossier', pass: s.uiState === 'dossier' && s.scenario === 'known', detail: s });
}
{
  const gated = filterEvidencedCandidates([{ label: 'X', why: ['התאמה מחיפוש ציבורי'], sourcesPreview: [] }]);
  units.push({ id: 'U-gate-reject-generic', pass: gated.length === 0, detail: gated });
}
console.log('UNIT', units.map((u) => `${u.pass ? 'PASS' : 'FAIL'} ${u.id}`).join(' | '));

const results = [];
console.log(`LIVE smoke → ${BASE}  gates=${GATES.length}`);
for (const g of GATES) {
  process.stdout.write(`→ ${g.id} ... `);
  const t0 = Date.now();
  let d = null, status = 0, err = null, raw = '';
  try {
    const r = await fetch(buildUrl(g), { signal: AbortSignal.timeout(95000) });
    status = r.status;
    raw = await r.text();
    try { d = JSON.parse(raw); } catch { d = null; }
  } catch (e) {
    err = String(e.message || e);
  }
  const ms = Date.now() - t0;
  if (d) d.ms = ms;
  let safetyOk = false, productOk = false, fails = [];
  if (err) fails.push(err);
  else if (status === 429) fails.push('http 429');
  else if (status !== 200) fails.push(`http ${status}`);
  else if (!d) fails.push('bad json');
  else {
    try { safetyOk = !!g.safety(d, raw); } catch (e) { fails.push('safety throw ' + e.message); }
    try { productOk = !!g.product(d, raw); } catch (e) { fails.push('product throw ' + e.message); }
    if (!safetyOk) fails.push('SAFETY fail');
    // product fail is IMPROVE not blocker for deploy gate unless safety
  }
  // Critical safety failures
  const critical = fails.some((f) => /SAFETY|phone leaked|caller|CRIT/i.test(f)) || (d && d.qid === 'Q875556');
  const passSafety = !err && status === 200 && d && safetyOk;
  const passProduct = passSafety && productOk;
  const row = {
    id: g.id, sc: g.sc, ms, status, err,
    passSafety, passProduct, critical,
    fails,
    phase: d?.phase, uiState: d?.uiState, scenario: d?.scenario, confidence: d?.confidence,
    messageKey: d?.messageKey, mode: d?.mode, qid: d?.qid, label: d?.label,
    photo: !!d?.photo, imgs: (d?.images || []).length, src: (d?.sources || []).length,
    candidates: (d?.candidates || []).length, needContextFields: d?.needContextFields,
  };
  results.push(row);
  const tag = !passSafety ? (critical ? 'FAIL-CRIT' : 'FAIL-SAFE') : (passProduct ? 'PASS' : 'PASS-SAFE/IMPROVE');
  console.log(`${tag} ${ms}ms phase=${row.phase} ui=${row.uiState} scn=${row.scenario} qid=${row.qid || '-'} cand=${row.candidates} src=${row.src}`);
  if (fails.length) console.log('   ', fails.join('; '));
  await sleep(2000);
}

const out = {
  when: new Date().toISOString(),
  base: BASE,
  units,
  unitPass: units.filter((u) => u.pass).length,
  unitN: units.length,
  safetyPass: results.filter((r) => r.passSafety).length,
  productPass: results.filter((r) => r.passProduct).length,
  n: results.length,
  critical: results.filter((r) => r.critical).length,
  results,
};
console.log('\n=== SMOKE-12 ===', JSON.stringify({
  unit: `${out.unitPass}/${out.unitN}`,
  safety: `${out.safetyPass}/${out.n}`,
  product: `${out.productPass}/${out.n}`,
  critical: out.critical,
}));
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log('wrote', OUT.pathname);
