#!/usr/bin/env node
/**
 * Acc FIX-3 minimal repro matrix — Preview only, NO promote.
 * HARD: Q1701775 / wd-Q1701775 anywhere => Acc P0 FAIL
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://akvot-simple-demo-4ij5qy655-k-akvot.vercel.app';
const ORIGIN = 'https://akvot-simple-demo.vercel.app';
const DPL = 'dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ';
const SCOPE = 'k-akvot';
const RAW = '/workspace/akvot-quick-demo/test-results/wp3/ACC-P0-FIX-MINREPRO-raw';
const FORBIDDEN = /Q1701775|wd-Q1701775/i;
const SMITH_BODY = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };

mkdirSync(RAW, { recursive: true });

function vercelCurl(url, { method = 'GET', bodyObj = null } = {}) {
  const args = ['curl', url, '--scope', SCOPE, '--'];
  args.push('-sS', '-H', `Origin: ${ORIGIN}`, '-H', 'Accept: application/json');
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(bodyObj || {}));
  }
  const t0 = Date.now();
  const r = spawnSync('vercel', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 120000 });
  const ms = Date.now() - t0;
  const out = (r.stdout || '').trim();
  // vercel CLI may print banner lines; find JSON
  const lines = out.split('\n');
  let jsonLine = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i].trim();
    if (l.startsWith('{') || l.startsWith('[')) { jsonLine = l; break; }
  }
  let json = null;
  let parseErr = null;
  try { json = jsonLine ? JSON.parse(jsonLine) : null; } catch (e) { parseErr = String(e.message || e); }
  const err = r.status && !json ? (r.stderr || `exit ${r.status}`) : parseErr;
  return { ms, status: json ? 200 : (r.status || 0), json, err, text: jsonLine || out, stderr: r.stderr || '' };
}

function scanLeak(json, text) {
  const raw = text || (json ? JSON.stringify(json) : '');
  const hits = [];
  if (FORBIDDEN.test(raw)) {
    // count occurrences
    const re = /Q1701775|wd-Q1701775/gi;
    let m;
    while ((m = re.exec(raw)) !== null) hits.push({ match: m[0], index: m.index });
  }
  return hits;
}

function summarize(json) {
  if (!json) return { ui: null, qid: null, faces: null, top: [], stripped: null, ver: null, rid: null };
  const ui = json.mode || json.ui || null;
  const qid = json.qid ?? json.dossier?.qid ?? null;
  const faces = Array.isArray(json.images) ? json.images.length : (json.faces ?? null);
  const facesBool = faces === 0 ? false : (faces > 0 ? true : !!json.photo);
  const cands = json.candidates || [];
  const top = cands.slice(0, 3).map(c => c.id || c.qid || c.label).filter(Boolean);
  const stripped = json.forbiddenStripped ?? json.meta?.forbiddenStripped ?? json.debug?.forbiddenStripped ?? null;
  const ver = json.forbiddenIdentitiesVersion ?? json.meta?.forbiddenIdentitiesVersion ?? null;
  const rid = json.requestId || json.rid || null;
  return { ui, qid, faces: facesBool, facesCount: faces, top, stripped, ver, rid, candN: cands.length };
}

function analyze(label, r) {
  const leaks = scanLeak(r.json, r.text);
  const sum = summarize(r.json);
  const hasLeak = leaks.length > 0;
  // also check candidates ids specifically
  const candLeak = (r.json?.candidates || []).some(c => {
    const id = String(c.id || '');
    const qid = String(c.qid || '');
    return FORBIDDEN.test(id) || FORBIDDEN.test(qid);
  });
  const dossierLeak = FORBIDDEN.test(String(r.json?.qid || ''));
  const sourcesLeak = (r.json?.sources || []).some(s => FORBIDDEN.test(JSON.stringify(s)));
  return {
    label,
    ms: r.ms,
    status: r.status,
    err: r.err || null,
    has_Q1701775: hasLeak || candLeak || dossierLeak || sourcesLeak,
    leak_hits: leaks.length,
    leak_detail: leaks.slice(0, 5),
    candLeak,
    dossierLeak,
    sourcesLeak,
    ...sum,
  };
}

function saveRaw(name, r) {
  const path = join(RAW, name);
  writeFileSync(path, r.text || JSON.stringify({ err: r.err, stderr: r.stderr }, null, 2));
  return path;
}

const results = {
  meta: {
    date: '2026-09-19',
    zone: 'Asia/Jerusalem UTC+3',
    base: BASE,
    dpl: DPL,
    origin: ORIGIN,
    alias_frozen: true,
    promote: false,
    health_build_confirmed: true,
  },
  matrix: {},
  leakage_total: 0,
  pw: 0,
  stop_acc_fail: false,
};

function runCell(id, n, makeReq, opts = {}) {
  const rows = [];
  for (let i = 1; i <= n; i++) {
    const { url, method, bodyObj, fileTag } = makeReq(i);
    process.stderr.write(`[${id}] ${i}/${n} ... `);
    const r = vercelCurl(url, { method, bodyObj });
    const a = analyze(`${id}-${i}`, r);
    const fname = `${fileTag || id}-${i}.json`;
    saveRaw(fname, r);
    a.raw = fname;
    rows.push(a);
    process.stderr.write(`${a.ui||'?'} leak=${a.has_Q1701775} faces=${a.faces} ${a.ms}ms\n`);
    if (a.has_Q1701775) {
      results.leakage_total += a.leak_hits || 1;
      results.stop_acc_fail = true;
      if (opts.stopOnLeak) {
        results.matrix[id] = { rows, pass: false, stopped_early: true };
        return rows;
      }
    }
  }
  const pass = rows.every(row => {
    if (row.has_Q1701775) return false;
    if (row.err && !row.json) return false;
    if (opts.expect) return opts.expect(row);
    // default Smith soft path
    const uiOk = ['candidates', 'thin', 'need_context'].includes(row.ui);
    const facesOk = row.faces === false || row.facesCount === 0;
    return uiOk && facesOk && !row.has_Q1701775;
  });
  results.matrix[id] = {
    rows,
    pass,
    leakage: rows.filter(x => x.has_Q1701775).length,
    n,
  };
  return rows;
}

// HEALTH already done externally; reconfirm
{
  const r = vercelCurl(`${BASE}/api/health`);
  saveRaw('health.json', r);
  results.health = r.json;
  results.meta.health_build_confirmed = r.json?.build === DPL;
  process.stderr.write(`health.build=${r.json?.build} match=${results.meta.health_build_confirmed}\n`);
}

// M1 quiet×3 Smith POST
runCell('M1', 3, (i) => ({
  url: `${BASE}/api/lookup`,
  method: 'POST',
  bodyObj: { ...SMITH_BODY },
  fileTag: 'M1-quiet-smith',
}), { stopOnLeak: true });

// M2 COLD×3 same + nocache
runCell('M2', 3, (i) => ({
  url: `${BASE}/api/lookup`,
  method: 'POST',
  bodyObj: { ...SMITH_BODY, nocache: 1 },
  fileTag: 'M2-cold-smith',
}), { stopOnLeak: true });

// M3 WARM×3 same after cold (no nocache)
runCell('M3', 3, (i) => ({
  url: `${BASE}/api/lookup`,
  method: 'POST',
  bodyObj: { ...SMITH_BODY },
  fileTag: 'M3-warm-smith',
}), { stopOnLeak: true });

// M4 repeated quiet×5
runCell('M4', 5, (i) => ({
  url: `${BASE}/api/lookup`,
  method: 'POST',
  bodyObj: { ...SMITH_BODY },
  fileTag: 'M4-repeat-smith',
}), { stopOnLeak: true });

// M5 optional — note WD 429/empty if visible in responses (no harness to force)
{
  const notes = [];
  for (const id of ['M1', 'M2', 'M3', 'M4']) {
    for (const row of results.matrix[id]?.rows || []) {
      // peek raw for wd hints
      notes.push({ cell: row.label, stripped: row.stripped, ui: row.ui });
    }
  }
  results.matrix.M5 = {
    pass: true,
    feasible: false,
    note: 'No WD empty/429 harness on Preview; observed natural strip/empty via forbiddenStripped where present. Soft UI OK if no Q1701775.',
    observed: notes.filter(n => n.stripped != null),
  };
  process.stderr.write(`[M5] SKIP harness (optional) — noted stripped=${results.matrix.M5.observed.length}\n`);
}

// M6 Assaf → dossier Q47507930
runCell('M6', 1, () => ({
  url: `${BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}`,
  method: 'GET',
  fileTag: 'M6-assaf',
}), {
  expect: (row) => row.ui === 'dossier' && row.qid === 'Q47507930' && !row.has_Q1701775,
});

// M7 כהן → need_context|thin never dossier
runCell('M7', 1, () => ({
  url: `${BASE}/api/lookup?q=${encodeURIComponent('כהן')}`,
  method: 'GET',
  fileTag: 'M7-cohen',
}), {
  expect: (row) => ['need_context', 'thin', 'candidates'].includes(row.ui) && row.ui !== 'dossier' && !row.has_Q1701775,
});

// M8 John Rappaport → not Assaf QID
runCell('M8', 1, () => ({
  url: `${BASE}/api/lookup?q=${encodeURIComponent('John Rappaport')}`,
  method: 'GET',
  fileTag: 'M8-john-rappaport',
}), {
  expect: (row) => {
    if (row.has_Q1701775) return false;
    if (row.qid === 'Q47507930') return false; // Assaf bleed
    // preferred: not dossier, or dossier of someone else
    return true;
  },
});

// pw = 0 if Q1701775 absent everywhere
results.pw = results.leakage_total > 0 ? 1 : 0;
results.stop_acc_fail = results.leakage_total > 0;

const m1to4 = ['M1', 'M2', 'M3', 'M4'].every(id => results.matrix[id]?.pass);
const m6 = results.matrix.M6?.pass;
const m7 = results.matrix.M7?.pass;
const m8 = results.matrix.M8?.pass;
results.gate = {
  M1: results.matrix.M1?.pass ? 'PASS' : 'FAIL',
  M2: results.matrix.M2?.pass ? 'PASS' : 'FAIL',
  M3: results.matrix.M3?.pass ? 'PASS' : 'FAIL',
  M4: results.matrix.M4?.pass ? 'PASS' : 'FAIL',
  M5: 'SKIP_OPTIONAL',
  M6: results.matrix.M6?.pass ? 'PASS' : 'FAIL',
  M7: results.matrix.M7?.pass ? 'PASS' : 'FAIL',
  M8: results.matrix.M8?.pass ? 'PASS' : 'FAIL',
  leakage_count: results.leakage_total,
  pw: results.pw,
  Assaf: m6 ? 'PASS' : 'FAIL',
  cohen: m7 ? 'PASS' : 'FAIL',
  TC6: m8 ? 'PASS' : 'FAIL',
  Acc_GO: (m1to4 && m6 && m7 && m8 && results.leakage_total === 0) ? 'GO' : 'NO-GO',
};

writeFileSync(join(RAW, '_matrix-internal.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.gate, null, 2));
process.stderr.write(`\n=== Acc ${results.gate.Acc_GO} leakage=${results.leakage_total} pw=${results.pw} ===\n`);
