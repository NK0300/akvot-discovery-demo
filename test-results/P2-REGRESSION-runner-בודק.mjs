#!/usr/bin/env node
/**
 * P2 HTTP regression battery · בודק · Evidence only
 * Env: AKVOT_BASE (Preview URL), optional VERCEL_OIDC_TOKEN via preload
 * Does NOT change product code / EXPECTED / thresholds.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.AKVOT_BASE || '').replace(/\/$/, '');
const DPL = process.env.AKVOT_DPL || 'dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT';
const FAKE_EMAIL = 'qa.rethink.test@example.com';
const TIMEOUT_MS = 95000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!BASE) {
  console.error('AKVOT_BASE required');
  process.exit(2);
}

function hasFaces(d) {
  if (!d) return false;
  return !!(d.photo || (Array.isArray(d.images) && d.images.length > 0));
}

function buildUrl(params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') p.set(k, String(v));
  }
  p.set('nocache', '1');
  return `${BASE}/api/lookup?${p}`;
}

async function callLookup(params) {
  const url = buildUrl(params);
  const t0 = Date.now();
  let status = 0;
  let raw = '';
  let data = null;
  let err = null;
  let requestIdHdr = null;
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        Origin: BASE,
        'x-akvot-battery': '1',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    status = r.status;
    requestIdHdr = r.headers.get('x-request-id');
    raw = await r.text();
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  } catch (e) {
    err = String(e.message || e);
  }
  return { url, status, raw, data, err, ms: Date.now() - t0, requestIdHdr };
}

async function callPostNested(body) {
  const url = `${BASE}/api/lookup`;
  const t0 = Date.now();
  let status = 0;
  let raw = '';
  let data = null;
  let err = null;
  let requestIdHdr = null;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Origin: BASE,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-akvot-battery': '1',
      },
      body: JSON.stringify({ ...body, nocache: 1 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    status = r.status;
    requestIdHdr = r.headers.get('x-request-id');
    raw = await r.text();
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  } catch (e) {
    err = String(e.message || e);
  }
  return { url, status, raw, data, err, ms: Date.now() - t0, requestIdHdr };
}

async function callHealth() {

  const url = `${BASE}/api/health`;
  const t0 = Date.now();
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30000) });
    const raw = await r.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {}
    return { url, status: r.status, data, raw, err: null, ms: Date.now() - t0 };
  } catch (e) {
    return { url, status: 0, data: null, raw: '', err: String(e.message || e), ms: Date.now() - t0 };
  }
}

/** @type {Array<{id:string, section:string, label:string, params?:object, kind:string, expect:any}>} */
const CASES = [
  // A SAFETY
  { id: 'S-A1', section: 'SAFETY', label: 'דני כהן', params: { q: 'דני כהן' }, kind: 'safe_nc', expect: { ui: ['need_context'], faces: false, noQid: true } },
  { id: 'S-A2', section: 'SAFETY', label: 'John Smith bare', params: { q: 'John Smith' }, kind: 'safe_nc', expect: { ui: ['need_context'], faces: false } },
  { id: 'S-A3', section: 'SAFETY', label: 'Smith+IBM+NY', params: { q: 'John Smith', org: 'IBM', city: 'New York', country: 'US' }, kind: 'not_pretty', expect: { ui: ['candidates', 'thin', 'need_context', 'ambiguous'], faces: false, notDossierFaces: true } },
  { id: 'S-A3-POST', section: 'SAFETY', label: 'Smith+IBM+NY POST nested', method: 'POST', body: { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } }, kind: 'not_pretty', expect: { ui: ['candidates', 'thin', 'need_context', 'ambiguous'], faces: false, notDossierFaces: true } },
  { id: 'S-A4', section: 'SAFETY', label: 'Smith+email', params: { q: 'John Smith', email: FAKE_EMAIL }, kind: 'g11', expect: { ui: ['candidates', 'thin', 'need_context'], faces: false, notDossierFaces: true, noEmailLeak: true } },
  { id: 'S-A5', section: 'SAFETY', label: 'junk HE', params: { q: 'פלורקסימון זבולון קפצוני' }, kind: 'safe_nc_thin', expect: { ui: ['need_context', 'thin'], faces: false } },
  { id: 'S-A7', section: 'SAFETY', label: 'obscure+org', params: { q: 'פלמוני אלמוניזקש', org: 'מפעל בדיקה פיקטיבי' }, kind: 'safe_nc_thin', expect: { ui: ['need_context', 'thin'], faces: false } },
  { id: 'S-A8', section: 'SAFETY', label: 'כהן bare', params: { q: 'כהן' }, kind: 'safe_nc', expect: { ui: ['need_context'], faces: false, neverDossier: true } },
  // B KEEP
  { id: 'K-B1', section: 'KEEP', label: 'בנימין נתניהו', params: { q: 'בנימין נתניהו' }, kind: 'keep_qid', expect: { ui: ['dossier'], qid: 'Q43723' } },
  { id: 'K-B3a', section: 'KEEP', label: 'נתניהו', params: { q: 'נתניהו' }, kind: 'keep_qid', expect: { ui: ['dossier'], qid: 'Q43723' } },
  { id: 'K-B3b', section: 'KEEP', label: 'ביבי', params: { q: 'ביבי' }, kind: 'keep_qid', expect: { ui: ['dossier'], qid: 'Q43723' } },
  { id: 'K-B2', section: 'KEEP', label: 'אורלי לוי', params: { q: 'אורלי לוי' }, kind: 'keep_qid', expect: { ui: ['dossier'], qid: 'Q466537' } },
  { id: 'K-B4a', section: 'KEEP', label: 'Angela Merkel', params: { q: 'Angela Merkel' }, kind: 'keep_qid', expect: { ui: ['dossier'], qid: 'Q567' } },
  { id: 'K-B4b', section: 'KEEP', label: 'Zehava Galon', params: { q: 'Zehava Galon' }, kind: 'keep_qid', expect: { ui: ['dossier'], qid: 'Q2630062' } },
  { id: 'K-B4c', section: 'KEEP', label: 'זהבה גלאון', params: { q: 'זהבה גלאון' }, kind: 'keep_qid', expect: { ui: ['dossier'], qid: 'Q2630062' } },
  // C P2 Assaf
  { id: 'T-C1', section: 'P2', label: 'Assaf Rappaport', params: { q: 'Assaf Rappaport' }, kind: 'keep_qid', expect: { ui: ['dossier'], qid: 'Q47507930' } },
  { id: 'T-C1b', section: 'P2', label: 'אסף רפפורט', params: { q: 'אסף רפפורט' }, kind: 'keep_qid', expect: { ui: ['dossier'], qid: 'Q47507930' } },
  { id: 'T-C5', section: 'P2', label: 'Assaf Smith', params: { q: 'Assaf Smith' }, kind: 'not_assaf', expect: { ui: ['need_context', 'candidates', 'thin', 'ambiguous'], notQid: 'Q47507930' } },
  { id: 'T-C6', section: 'P2', label: 'John Rappaport', params: { q: 'John Rappaport' }, kind: 'not_assaf', expect: { ui: ['need_context', 'candidates', 'thin', 'ambiguous'], notQid: 'Q47507930' } },
];

function judge(c, snap) {
  const fails = [];
  let prettyWrong = false;
  const { status, err, data: d, raw } = snap;
  if (err) return { pass: false, prettyWrong, fails: [`network: ${err}`] };
  if (status !== 200) return { pass: false, prettyWrong, fails: [`http ${status}`] };
  if (!d) return { pass: false, prettyWrong, fails: ['bad json'] };

  const ui = d.uiState || '';
  const faces = hasFaces(d);
  const qid = d.qid || null;
  const exp = c.expect || {};

  if (exp.ui && exp.ui.length && !exp.ui.includes(ui)) {
    // For not_pretty / not_assaf, allow dossier only if not pretty-wrong path handled below
    if (c.kind === 'not_pretty' || c.kind === 'g11' || c.kind === 'not_assaf') {
      // ui mismatch alone if dossier — handled via notDossierFaces / notQid
      if (!(exp.notDossierFaces || exp.notQid)) fails.push(`uiState=${ui} not in ${exp.ui.join('|')}`);
      else if (!exp.ui.includes(ui) && ui !== 'dossier') fails.push(`uiState=${ui} not in ${exp.ui.join('|')}|dossier(safe)`);
    } else {
      fails.push(`uiState=${ui} expected ${exp.ui.join('|')}`);
    }
  }
  if (exp.faces === false && faces) fails.push('faces must be 0');
  if (exp.qid && qid !== exp.qid) fails.push(`qid=${qid} expected ${exp.qid}`);
  if (exp.noQid && qid) fails.push(`qid=${qid} expected none`);
  if (exp.neverDossier && ui === 'dossier') fails.push('must never dossier');
  if (exp.notQid && qid === exp.notQid) fails.push(`must not resolve Assaf QID ${exp.notQid}`);
  if (exp.noEmailLeak && raw && raw.includes(FAKE_EMAIL)) fails.push('email leaked');

  if (exp.notDossierFaces || c.kind === 'not_pretty' || c.kind === 'g11') {
    if (ui === 'dossier' && faces) {
      fails.push('PRETTY-WRONG: dossier+faces');
      prettyWrong = true;
    }
    if (faces && ui !== 'dossier') {
      fails.push(`faces on uiState=${ui}`);
      prettyWrong = true;
    }
  }

  // Unsafe dossier+faces on SAFETY / near-miss = pretty-wrong
  if ((c.section === 'SAFETY' || c.kind === 'not_assaf') && ui === 'dossier' && faces) {
    if (!fails.some((f) => f.includes('PRETTY-WRONG'))) fails.push('PRETTY-WRONG: dossier+faces on unsafe');
    prettyWrong = true;
  }

  // Wrong KEEP QID with faces is also critical for Assaf path
  if (c.kind === 'keep_qid' && exp.qid && qid && qid !== exp.qid && faces) {
    fails.push('PRETTY-WRONG: wrong QID with faces');
    prettyWrong = true;
  }

  return { pass: fails.length === 0, prettyWrong, fails };
}

const whenIso = new Date().toISOString();
const whenLocal = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) + ' Asia/Jerusalem';

console.log(`P2 REGRESSION · בודק → ${BASE}`);
console.log(`dpl=${DPL} when=${whenLocal}\n`);

const health = await callHealth();
const healthOk = health.status === 200 && health.data?.ok === true;
console.log(`O-F1 health: http=${health.status} ok=${health.data?.ok} build=${health.data?.build || '-'} ${health.ms}ms ${healthOk ? 'PASS' : 'FAIL'}`);

const rows = [];
let requestIdSeen = false;

for (const c of CASES) {
  process.stdout.write(`→ ${c.id} ${c.label} ... `);
  const snap = c.method === 'POST' ? await callPostNested(c.body) : await callLookup(c.params);
  const verdict = judge(c, snap);
  const d = snap.data;
  const rid = d?.requestId || snap.requestIdHdr || null;
  if (rid) requestIdSeen = true;
  const row = {
    id: c.id,
    section: c.section,
    label: c.label,
    params: c.params || null,
    method: c.method || 'GET',
    body: c.body || null,
    expected: c.expect,
    verdict: verdict.pass ? 'PASS' : 'FAIL',
    prettyWrong: verdict.prettyWrong,
    fails: verdict.fails,
    actual: {
      http: snap.status,
      ui: d?.uiState ?? null,
      qid: d?.qid ?? null,
      faces: hasFaces(d),
      mode: d?.mode ?? null,
      confidence: d?.confidence ?? null,
      requestId: rid,
      ms: snap.ms,
      err: snap.err,
      build: d?.build ?? null,
    },
  };
  rows.push(row);
  console.log(
    `${row.verdict}${row.prettyWrong ? '/PW' : ''} ${row.actual.ms}ms http=${row.actual.http} ui=${row.actual.ui} qid=${row.actual.qid || '-'} faces=${row.actual.faces}` +
      (verdict.fails.length ? ` | ${verdict.fails.join('; ')}` : ''),
  );
  await sleep(1200);
}

// Obs O-F2: use first KEEP lookup requestId
const obsRequestId = requestIdSeen;
const N = rows.length;
const PASS = rows.filter((r) => r.verdict === 'PASS').length;
const FAIL = rows.filter((r) => r.verdict === 'FAIL').length;
const pw = rows.filter((r) => r.prettyWrong).length;
const assaf = rows.find((r) => r.id === 'T-C1');
const assafHe = rows.find((r) => r.id === 'T-C1b');

const report = {
  when: whenIso,
  whenLocal,
  agent: 'בודק',
  suite: 'P2-REGRESSION',
  base: BASE,
  dpl: DPL,
  N,
  PASS,
  FAIL,
  prettyWrong: pw,
  health: { pass: healthOk, status: health.status, body: health.data, ms: health.ms },
  requestId: { pass: obsRequestId, note: 'x-request-id header and/or JSON requestId on lookup' },
  assafQid: {
    T_C1: { pass: assaf?.verdict === 'PASS', qid: assaf?.actual?.qid, ui: assaf?.actual?.ui },
    T_C1b: { pass: assafHe?.verdict === 'PASS', qid: assafHe?.actual?.qid, ui: assafHe?.actual?.ui },
  },
  cases: rows,
};

const stamp = process.env.AKVOT_STAMP || 'dpl2Qrf-בודק-2026-09-15';
const outJson = path.join(__dirname, `P2-REGRESSION-${stamp}.json`);
const outMd = path.join(__dirname, `P2-REGRESSION-${stamp}.md`);

const md = [];
md.push(`# P2 REGRESSION · בודק · ${stamp}`);
md.push('');
md.push(`- **when:** ${whenLocal}`);
md.push(`- **BASE:** ${BASE}`);
md.push(`- **dpl:** \`${DPL}\``);
md.push(`- **N/PASS/FAIL/pw:** ${N}/${PASS}/${FAIL}/${pw}`);
md.push(`- **health:** ${healthOk ? 'PASS' : 'FAIL'} http=${health.status} build=${health.data?.build || '-'}`);
md.push(`- **requestId:** ${obsRequestId ? 'PASS' : 'FAIL'}`);
md.push(`- **Assaf QID:** T-C1=${assaf?.actual?.qid || '-'} (${assaf?.verdict}) · T-C1b=${assafHe?.actual?.qid || '-'} (${assafHe?.verdict})`);
md.push('');
md.push(`| ID | section | ui | qid | faces | ms | verdict |`);
md.push(`|----|---------|----|-----|-------|----|---------|`);
for (const r of rows) {
  md.push(
    `| ${r.id} | ${r.section} | ${r.actual.ui ?? '-'} | ${r.actual.qid ?? '-'} | ${r.actual.faces} | ${r.actual.ms} | ${r.verdict}${r.prettyWrong ? ' PW' : ''}${r.fails.length ? ' · ' + r.fails.join('; ') : ''} |`,
  );
}
md.push('');
md.push(`*Evidence only · Preview · no promote · no product/EXPECTED change*`);
md.push('');

fs.writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(outMd, md.join('\n'), 'utf8');

console.log('\n========== P2 SUMMARY ==========');
console.log(`N=${N} PASS=${PASS} FAIL=${FAIL} pw=${pw}`);
console.log(`health=${healthOk} requestId=${obsRequestId}`);
console.log(`Assaf T-C1=${assaf?.actual?.qid} (${assaf?.verdict}) T-C1b=${assafHe?.actual?.qid} (${assafHe?.verdict})`);
console.log(`JSON: ${outJson}`);
console.log(`MD:   ${outMd}`);
console.log('================================\n');

process.exit(FAIL === 0 && pw === 0 && healthOk && obsRequestId ? 0 : 1);
