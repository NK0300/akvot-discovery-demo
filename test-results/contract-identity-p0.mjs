#!/usr/bin/env node
/**
 * P0-3 · חוזה HTTP חוסם — זהות / פנים (בודק)
 * Run: node test-results/contract-identity-p0.mjs
 * LIVE ONLY: requires AKVOT_LIVE_OK=1 AND explicit AKVOT_BASE (or BASE). No default base.
 * Without both it exits 2 before any network call. Not part of `npm test`.
 *
 * Exit 0 רק אם כל החוזים עוברים. דוח JSON נכתב בכל ריצה מאושרת (לא במסלול שנדחה, exit 2).
 * אין תיקון שרת כאן — רק מדידה.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_BASE = String(process.env.AKVOT_BASE || process.env.BASE || '').trim();
if (process.env.AKVOT_LIVE_OK !== '1' || !RAW_BASE) {
  console.error('contract-identity-p0: LIVE script refused. Requires AKVOT_LIVE_OK=1 and explicit AKVOT_BASE (no default base).');
  process.exit(2);
}
const BASE = RAW_BASE.replace(/\/$/, '');
const REPORT_JSON = path.join(__dirname, 'CONTRACT-identity-p0-בודק-2026-09-09.json');
const FAKE_EMAIL = 'qa.rethink.test@example.com';
const TIMEOUT_MS = 95000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    raw = await r.text();
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  } catch (e) {
    err = String(e.message || e);
  }
  return { url, status, raw, data, err, ms: Date.now() - t0 };
}

/** @returns {{ pass: boolean, improve?: boolean, fails: string[], notes: string[] }} */
function judge(id, snap) {
  const fails = [];
  const notes = [];
  let improve = false;
  const { status, err, data: d, raw } = snap;

  if (err) {
    fails.push(`network: ${err}`);
    return { pass: false, improve, fails, notes };
  }
  if (status === 429) {
    fails.push('http 429');
    return { pass: false, improve, fails, notes };
  }
  if (status !== 200) {
    fails.push(`http ${status}`);
    return { pass: false, improve, fails, notes };
  }
  if (!d) {
    fails.push('bad json');
    return { pass: false, improve, fails, notes };
  }

  const ui = d.uiState || '';
  const faces = hasFaces(d);
  const qid = d.qid || null;

  if (id === 'a-netanyahu-keep') {
    // KEEP: dossier + Q43723; faces מותר
    if (ui !== 'dossier') fails.push(`uiState=${ui} expected dossier`);
    if (qid !== 'Q43723') fails.push(`qid=${qid} expected Q43723`);
    // faces allowed — no check
    return { pass: fails.length === 0, improve, fails, notes };
  }

  if (id === 'b-cohen-keep') {
    // KEEP: need_context, 0 faces
    if (ui !== 'need_context') fails.push(`uiState=${ui} expected need_context`);
    if (faces) fails.push('faces must be 0');
    return { pass: fails.length === 0, improve, fails, notes };
  }

  if (id === 'c-smith-bare-keep') {
    // KEEP: need_context OR thin/ambiguous, 0 faces
    const okUi = ui === 'need_context' || ui === 'thin' || ui === 'ambiguous';
    if (!okUi) fails.push(`uiState=${ui} expected need_context|thin|ambiguous`);
    if (faces) fails.push('faces must be 0');
    return { pass: fails.length === 0, improve, fails, notes };
  }

  if (id === 'd-smith-ctx-p0') {
    // P0: MUST NOT (dossier AND faces)
    // Allowed: candidates | need_context | thin without faces
    // dossier + !faces → IMPROVE (חוזה לא נכשל על זה לבד; dossier+faces כן)
    if (ui === 'dossier' && faces) {
      fails.push('P0 CRIT: dossier+faces (pretty-wrong)');
    }
    if (faces && ui !== 'dossier') {
      fails.push(`faces=true not allowed on uiState=${ui}`);
    }
    const allowedSafe = ui === 'candidates' || ui === 'need_context' || ui === 'thin';
    if (ui === 'dossier' && !faces) {
      improve = true;
      notes.push('IMPROVE: dossier without faces — עדיין לא candidates/need_context/thin');
      // לא נכשל חוזה על dossier בלי faces — רק על dossier+faces
    } else if (!allowedSafe && !(ui === 'dossier' && !faces)) {
      fails.push(`uiState=${ui} not in candidates|need_context|thin`);
    }
    if (allowedSafe && faces) {
      // already covered
    }
    return { pass: fails.length === 0, improve, fails, notes };
  }

  if (id === 'e-smith-email-g11-p0') {
    // P0 G11: MUST NOT dossier+faces; email must not appear in body
    if (ui === 'dossier' && faces) {
      fails.push('P0 CRIT G11: dossier+faces');
    }
    if (faces && ui !== 'dossier') {
      fails.push(`faces=true not allowed on uiState=${ui}`);
    }
    if (raw && raw.includes(FAKE_EMAIL)) {
      fails.push('email leaked in response body');
    }
    // also fail if email appears case-insensitive fragments of local part? stick to exact
    const allowedSafe = ui === 'candidates' || ui === 'need_context' || ui === 'thin';
    if (ui === 'dossier' && !faces) {
      improve = true;
      notes.push('IMPROVE: dossier without faces on email path');
    } else if (!allowedSafe && !(ui === 'dossier' && !faces) && !(ui === 'dossier' && faces)) {
      // if already failed on dossier+faces, don't double-add ui
      if (!fails.some((f) => f.includes('dossier+faces'))) {
        fails.push(`uiState=${ui} not in candidates|need_context|thin`);
      }
    }
    return { pass: fails.length === 0, improve, fails, notes };
  }

  fails.push(`unknown case ${id}`);
  return { pass: false, improve, fails, notes };
}

const CASES = [
  {
    id: 'a-netanyahu-keep',
    tier: 'KEEP',
    label: 'בנימין נתניהו → dossier Q43723 (faces מותר)',
    params: { q: 'בנימין נתניהו' },
  },
  {
    id: 'b-cohen-keep',
    tier: 'KEEP',
    label: 'דני כהן → need_context · 0 faces',
    params: { q: 'דני כהן' },
  },
  {
    id: 'c-smith-bare-keep',
    tier: 'KEEP',
    label: 'John Smith bare → need_context|thin|ambiguous · 0 faces',
    params: { q: 'John Smith' },
  },
  {
    id: 'd-smith-ctx-p0',
    tier: 'P0',
    label: 'John Smith + IBM + NY + US → MUST NOT dossier+faces',
    params: { q: 'John Smith', org: 'IBM', city: 'New York', country: 'US' },
  },
  {
    id: 'e-smith-email-g11-p0',
    tier: 'P0',
    label: 'John Smith + email → MUST NOT dossier+faces · no email leak',
    params: { q: 'John Smith', email: FAKE_EMAIL },
  },
];

const rows = [];
console.log(`CONTRACT identity-p0 → ${BASE}`);
console.log(`cases=${CASES.length}  headers: Origin=${BASE}, x-akvot-battery:1\n`);

for (const c of CASES) {
  process.stdout.write(`→ ${c.id} (${c.tier}) ... `);
  const snap = await callLookup(c.params);
  const verdict = judge(c.id, snap);
  const d = snap.data;
  const faces = hasFaces(d);
  const row = {
    id: c.id,
    tier: c.tier,
    label: c.label,
    params: c.params,
    pass: verdict.pass,
    improve: !!verdict.improve,
    fails: verdict.fails,
    notes: verdict.notes,
    http: snap.status,
    ms: snap.ms,
    err: snap.err,
    uiState: d?.uiState ?? null,
    scenario: d?.scenario ?? null,
    mode: d?.mode ?? null,
    qid: d?.qid ?? null,
    faces,
    photo: !!d?.photo,
    images: (d?.images || []).length,
    candidates: (d?.candidates || []).length,
    sources: (d?.sources || []).length,
    phase: d?.phase ?? null,
    messageKey: d?.messageKey ?? null,
  };
  rows.push(row);
  const tag = verdict.pass
    ? verdict.improve
      ? 'PASS/IMPROVE'
      : 'PASS'
    : 'FAIL';
  console.log(
    `${tag} ${snap.ms}ms http=${snap.status} ui=${row.uiState} qid=${row.qid || '-'} faces=${faces}` +
      (verdict.fails.length ? ` | ${verdict.fails.join('; ')}` : '') +
      (verdict.notes.length ? ` | ${verdict.notes.join('; ')}` : ''),
  );
  await sleep(1500);
}

const passed = rows.filter((r) => r.pass).length;
const failed = rows.filter((r) => !r.pass).length;
const improveN = rows.filter((r) => r.improve).length;
const allPass = failed === 0;

const report = {
  when: new Date().toISOString(),
  whenLocal: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) + ' Asia/Jerusalem',
  agent: 'בודק',
  contract: 'identity-p0',
  base: BASE,
  pass: `${passed}/${rows.length}`,
  allPass,
  exitCode: allPass ? 0 : 1,
  improve: improveN,
  summaryHe: allPass
    ? `כל חוזי הזהות עברו (${passed}/${rows.length})` + (improveN ? ` · IMPROVE=${improveN}` : '')
    : `חוזה נכשל — ${failed} כשלים מתוך ${rows.length} (P0 צפוי על prod עד תיקון שרת)`,
  rows,
};

fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf8');

console.log('\n========== SUMMARY ==========');
console.log(report.summaryHe);
console.log(`pass=${report.pass}  improve=${improveN}  exit=${report.exitCode}`);
for (const r of rows) {
  console.log(
    `  ${r.pass ? '✓' : '✗'} [${r.tier}] ${r.id}  ui=${r.uiState} faces=${r.faces}` +
      (r.fails.length ? `  :: ${r.fails.join('; ')}` : '') +
      (r.notes.length ? `  :: ${r.notes.join('; ')}` : ''),
  );
}
console.log(`report: ${REPORT_JSON}`);
console.log('=============================\n');

process.exit(allPass ? 0 : 1);
