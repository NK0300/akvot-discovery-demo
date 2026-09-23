#!/usr/bin/env node
/**
 * Acc Gate FORMAL — stricter than FIX-3 · Preview only · NO promote
 * 1) Smith quiet×5 + COLD×3 + WARM×3 — NEVER Q1701775 · ui soft · faces=0 · pw=0 · leakage=0
 * 2) Assaf → dossier Q47507930 ×2
 * 3) כהן → need_context|thin never dossier ×2
 * 4) John Rappaport → not Assaf QID ×1
 * 5) Scan all bodies for Q1701775
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://akvot-simple-demo-4ij5qy655-k-akvot.vercel.app';
const ORIGIN = 'https://akvot-simple-demo.vercel.app';
const DPL = 'dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ';
const ALIAS_FROZEN = 'dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR';
const SCOPE = 'k-akvot';
const RAW = '/workspace/akvot-quick-demo/test-results/wp3/ACC-P0-GATE-FORMAL-raw';
const OUT_MD = '/workspace/akvot-quick-demo/test-results/wp3/ACC-P0-GATE-FORMAL-דיוק-2026-09-20.md';
const OUT_JSON = '/workspace/akvot-quick-demo/test-results/wp3/ACC-P0-GATE-FORMAL-דיוק-2026-09-20.json';
const FORBIDDEN = /Q1701775|wd-Q1701775/i;
const SMITH_BODY = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };
const SOFT_UI = new Set(['candidates', 'thin', 'need_context']);

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
  const re = /Q1701775|wd-Q1701775/gi;
  let m;
  while ((m = re.exec(raw)) !== null) hits.push({ match: m[0], index: m.index });
  return hits;
}

function summarize(json) {
  if (!json) return { ui: null, mode: null, qid: null, faces: null, facesCount: null, top: [], stripped: null, ver: null, rid: null, candN: 0, photo: false, messageKey: null, scenario: null, confidence: null };
  const mode = json.mode || null;
  const ui = json.uiState || json.ui || mode || null;
  const qid = json.qid ?? json.dossier?.qid ?? null;
  const facesCount = Array.isArray(json.images) ? json.images.length
    : (typeof json.faces === 'number' ? json.faces
      : (Array.isArray(json.faces) ? json.faces.length : 0));
  const photo = !!(json.photo || (facesCount > 0));
  const cands = json.candidates || [];
  const top = cands.slice(0, 3).map(c => c.id || c.qid || c.label).filter(Boolean);
  const stripped = json.forbiddenStripped ?? json.meta?.forbiddenStripped ?? json.debug?.forbiddenStripped ?? null;
  const ver = json.forbiddenIdentitiesVersion ?? json.meta?.forbiddenIdentitiesVersion ?? null;
  const rid = json.requestId || json.rid || null;
  return {
    ui, mode, qid,
    faces: facesCount > 0, facesCount, photo,
    top, stripped, ver, rid, candN: cands.length,
    messageKey: json.messageKey || null,
    scenario: json.scenario || null,
    confidence: json.confidence || null,
    thin: !!json.thin,
    ambiguous: !!json.ambiguous,
  };
}

function analyze(label, r) {
  const leaks = scanLeak(r.json, r.text);
  const sum = summarize(r.json);
  const candLeak = (r.json?.candidates || []).some(c => FORBIDDEN.test(String(c.id || '')) || FORBIDDEN.test(String(c.qid || '')));
  const dossierLeak = FORBIDDEN.test(String(r.json?.qid || ''));
  const sourcesLeak = (r.json?.sources || []).some(s => FORBIDDEN.test(JSON.stringify(s)));
  const hasLeak = leaks.length > 0 || candLeak || dossierLeak || sourcesLeak;
  return {
    label,
    ms: r.ms,
    status: r.status,
    err: r.err || null,
    has_Q1701775: hasLeak,
    leak_hits: leaks.length,
    leak_detail: leaks.slice(0, 5),
    candLeak, dossierLeak, sourcesLeak,
    ...sum,
  };
}

function saveRaw(name, r) {
  const path = join(RAW, name);
  writeFileSync(path, r.text || JSON.stringify({ err: r.err, stderr: r.stderr }, null, 2));
  return path;
}

const startedAt = new Date().toISOString();
const results = {
  meta: {
    title: 'ACC-P0-GATE-FORMAL',
    role: 'דיוק',
    date: '2026-09-20',
    zone: 'Asia/Jerusalem (UTC+3)',
    startedAt,
    base: BASE,
    dpl: DPL,
    alias_frozen_dpl: ALIAS_FROZEN,
    origin: ORIGIN,
    alias_frozen: true,
    promote: false,
    access: 'vercel curl --scope k-akvot',
    stricter_than: 'FIX-3',
    battery: [
      'Smith POST+IBM/NY/US quiet×5 + COLD×3 + WARM×3',
      'Assaf dossier Q47507930 ×2',
      'כהן need_context|thin never dossier ×2',
      'John Rappaport not Assaf QID ×1',
      'Scan all bodies for Q1701775',
    ],
  },
  matrix: {},
  leakage_total: 0,
  pw: 0,
  stop_acc_fail: false,
  body_scan: { files: 0, hits: 0, offenders: [] },
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
    a.i = i;
    rows.push(a);
    process.stderr.write(`${a.ui || '?'} leak=${a.has_Q1701775} faces=${a.facesCount} qid=${a.qid || 'null'} ${a.ms}ms\n`);
    if (a.has_Q1701775) {
      results.leakage_total += a.leak_hits || 1;
      results.stop_acc_fail = true;
      if (opts.stopOnLeak) {
        const pass = false;
        results.matrix[id] = { rows, pass, leakage: rows.filter(x => x.has_Q1701775).length, n, stopped_early: true };
        return rows;
      }
    }
  }
  const pass = rows.every(row => {
    if (row.has_Q1701775) return false;
    if (row.err && !row.ui) return false;
    if (opts.expect) return opts.expect(row);
    const uiOk = SOFT_UI.has(row.ui);
    const facesOk = row.facesCount === 0 && row.faces === false;
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

// HEALTH
{
  const r = vercelCurl(`${BASE}/api/health`);
  saveRaw('health.json', r);
  results.health = r.json;
  results.meta.health_build = r.json?.build || null;
  results.meta.health_build_match = r.json?.build === DPL;
  process.stderr.write(`health.build=${r.json?.build} match=${results.meta.health_build_match}\n`);
  if (!results.meta.health_build_match) {
    results.stop_acc_fail = true;
    process.stderr.write('FATAL: dpl mismatch — aborting gate\n');
    writeFileSync(join(RAW, '_matrix-internal.json'), JSON.stringify(results, null, 2));
    process.exit(2);
  }
}

// F1 quiet×5 Smith POST+IBM/NY/US
runCell('F1_quiet', 5, (i) => ({
  url: `${BASE}/api/lookup`,
  method: 'POST',
  bodyObj: { ...SMITH_BODY },
  fileTag: 'F1-quiet-smith',
}), { stopOnLeak: true });

// F2 COLD×3 +nocache
runCell('F2_cold', 3, (i) => ({
  url: `${BASE}/api/lookup`,
  method: 'POST',
  bodyObj: { ...SMITH_BODY, nocache: 1 },
  fileTag: 'F2-cold-smith',
}), { stopOnLeak: true });

// F3 WARM×3 after cold
runCell('F3_warm', 3, (i) => ({
  url: `${BASE}/api/lookup`,
  method: 'POST',
  bodyObj: { ...SMITH_BODY },
  fileTag: 'F3-warm-smith',
}), { stopOnLeak: true });

// F4 Assaf ×2
runCell('F4_assaf', 2, (i) => ({
  url: `${BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}`,
  method: 'GET',
  fileTag: 'F4-assaf',
}), {
  expect: (row) => row.ui === 'dossier' && row.qid === 'Q47507930' && !row.has_Q1701775,
});

// F5 כהן ×2 — need_context|thin never dossier (candidates also soft-ok per FIX-3 soft set? User said need_context|thin)
runCell('F5_cohen', 2, (i) => ({
  url: `${BASE}/api/lookup?q=${encodeURIComponent('כהן')}`,
  method: 'GET',
  fileTag: 'F5-cohen',
}), {
  expect: (row) => {
    if (row.has_Q1701775) return false;
    if (row.ui === 'dossier') return false;
    return row.ui === 'need_context' || row.ui === 'thin';
  },
});

// F6 John Rappaport ×1 — not Assaf QID
runCell('F6_tc6', 1, () => ({
  url: `${BASE}/api/lookup?q=${encodeURIComponent('John Rappaport')}`,
  method: 'GET',
  fileTag: 'F6-john-rappaport',
}), {
  expect: (row) => {
    if (row.has_Q1701775) return false;
    if (row.qid === 'Q47507930') return false;
    return true;
  },
});

// F7 Scan ALL raw JSON bodies for Q1701775
{
  const offenders = [];
  let files = 0;
  let hits = 0;
  for (const name of readdirSync(RAW)) {
    if (!name.endsWith('.json')) continue;
    if (name.startsWith('_')) continue;
    files++;
    const text = readFileSync(join(RAW, name), 'utf8');
    const leaks = scanLeak(null, text);
    if (leaks.length) {
      hits += leaks.length;
      offenders.push({ file: name, hits: leaks.length, sample: leaks.slice(0, 3) });
    }
  }
  results.body_scan = { files, hits, offenders };
  results.leakage_total += hits;
  process.stderr.write(`[F7_scan] files=${files} hits=${hits} offenders=${offenders.length}\n`);
}

results.pw = results.leakage_total > 0 ? 1 : 0;
results.stop_acc_fail = results.leakage_total > 0 || results.stop_acc_fail;

const smithOk = ['F1_quiet', 'F2_cold', 'F3_warm'].every(id => results.matrix[id]?.pass);
const assafOk = results.matrix.F4_assaf?.pass;
const cohenOk = results.matrix.F5_cohen?.pass;
const tc6Ok = results.matrix.F6_tc6?.pass;
const scanOk = results.body_scan.hits === 0;
const facesSmithOk = ['F1_quiet', 'F2_cold', 'F3_warm'].every(id =>
  (results.matrix[id]?.rows || []).every(r => r.facesCount === 0)
);

results.gate = {
  F1_quiet_x5: results.matrix.F1_quiet?.pass ? 'PASS' : 'FAIL',
  F2_cold_x3: results.matrix.F2_cold?.pass ? 'PASS' : 'FAIL',
  F3_warm_x3: results.matrix.F3_warm?.pass ? 'PASS' : 'FAIL',
  F4_assaf_x2: results.matrix.F4_assaf?.pass ? 'PASS' : 'FAIL',
  F5_cohen_x2: results.matrix.F5_cohen?.pass ? 'PASS' : 'FAIL',
  F6_john_rappaport_x1: results.matrix.F6_tc6?.pass ? 'PASS' : 'FAIL',
  F7_body_scan_Q1701775: scanOk ? 'PASS' : 'FAIL',
  leakage_count: results.leakage_total,
  pw: results.pw,
  faces_smith_soft: facesSmithOk ? 0 : 'NONZERO',
  health_build_match: results.meta.health_build_match,
  promote: false,
  alias_frozen: true,
  Acc_Gate: (smithOk && assafOk && cohenOk && tc6Ok && scanOk && results.leakage_total === 0 && facesSmithOk)
    ? 'GO'
    : 'NO-GO',
  Chief_REVIEW: 'HOLD promote · Acc Gate verdict only',
};

results.meta.finishedAt = new Date().toISOString();
results.meta.forbiddenIdentitiesVersion =
  results.matrix.F1_quiet?.rows?.[0]?.ver ||
  results.matrix.F2_cold?.rows?.[0]?.ver ||
  null;

writeFileSync(join(RAW, '_matrix-internal.json'), JSON.stringify(results, null, 2));

// Build public JSON (compact rows)
function pubRows(cell) {
  return (cell?.rows || []).map(r => ({
    i: r.i,
    raw: r.raw,
    ui: r.ui,
    mode: r.mode,
    qid: r.qid,
    faces: r.faces,
    facesCount: r.facesCount,
    photo: r.photo,
    candN: r.candN,
    top: r.top,
    stripped: r.stripped,
    ver: r.ver,
    requestId: r.rid,
    has_Q1701775: r.has_Q1701775,
    leak_hits: r.leak_hits,
    candLeak: r.candLeak,
    dossierLeak: r.dossierLeak,
    sourcesLeak: r.sourcesLeak,
    messageKey: r.messageKey,
    scenario: r.scenario,
    confidence: r.confidence,
    ms: r.ms,
    err: r.err,
  }));
}

const publicJson = {
  meta: results.meta,
  hard_invariant: {
    Q1701775_anywhere: 'NEVER',
    leakage_count: results.leakage_total,
    pw: results.pw,
    faces_smith_soft: facesSmithOk ? 0 : 'NONZERO',
  },
  gate: results.gate,
  body_scan: results.body_scan,
  matrix: {
    F1_quiet: { pass: !!results.matrix.F1_quiet?.pass, n: 5, leakage: results.matrix.F1_quiet?.leakage || 0, rows: pubRows(results.matrix.F1_quiet) },
    F2_cold: { pass: !!results.matrix.F2_cold?.pass, n: 3, leakage: results.matrix.F2_cold?.leakage || 0, rows: pubRows(results.matrix.F2_cold) },
    F3_warm: { pass: !!results.matrix.F3_warm?.pass, n: 3, leakage: results.matrix.F3_warm?.leakage || 0, rows: pubRows(results.matrix.F3_warm) },
    F4_assaf: { pass: !!results.matrix.F4_assaf?.pass, n: 2, leakage: results.matrix.F4_assaf?.leakage || 0, rows: pubRows(results.matrix.F4_assaf) },
    F5_cohen: { pass: !!results.matrix.F5_cohen?.pass, n: 2, leakage: results.matrix.F5_cohen?.leakage || 0, rows: pubRows(results.matrix.F5_cohen) },
    F6_tc6: { pass: !!results.matrix.F6_tc6?.pass, n: 1, leakage: results.matrix.F6_tc6?.leakage || 0, rows: pubRows(results.matrix.F6_tc6) },
  },
  health: results.health,
};

writeFileSync(OUT_JSON, JSON.stringify(publicJson, null, 2));

function rowTable(rows) {
  const lines = ['| i | uiState | qid | faces | Q170 | stripped | ver | requestId | ms | raw |',
    '|---|--------|-----|-------|------|----------|-----|-----------|----|-----|'];
  for (const r of rows || []) {
    lines.push(`| ${r.i} | ${r.ui || '?'} | ${r.qid || 'null'} | ${r.facesCount ?? '?'} | ${r.has_Q1701775} | ${r.stripped ?? '—'} | ${r.ver || '—'} | \`${r.rid || ''}\` | ${r.ms} | ${r.raw} |`);
  }
  return lines.join('\n');
}

const g = results.gate;
const md = `# Acc Gate FORMAL · דיוק · 2026-09-20

**STATUS:** Acc Gate **${g.Acc_Gate}** for Chief REVIEW · **NO promote** · alias **FROZEN**  
**When:** ${results.meta.finishedAt} (box local Asia/Jerusalem UTC+3)  
**Stricter than:** FIX-3 minrepro

## Target
| Field | Value |
|-------|--------|
| BASE | \`${BASE}\` |
| dpl | \`${DPL}\` |
| health.build | \`${results.meta.health_build}\` · match=${results.meta.health_build_match} |
| Origin | \`${ORIGIN}\` |
| Access | \`vercel curl --scope k-akvot\` |
| Alias | \`${ALIAS_FROZEN}\` **FROZEN** · promote=false |
| Denylist ver | \`${results.meta.forbiddenIdentitiesVersion || 'n/a'}\` |

## HARD invariant
| Check | Result |
|-------|--------|
| Q1701775 / wd-Q1701775 anywhere in response JSON | **${results.leakage_total === 0 ? '0 hits' : results.leakage_total + ' HITS'}** across all matrix + body scan |
| leakage_count | **${results.leakage_total}** |
| pw | **${results.pw}** |
| faces on Smith soft path | **${facesSmithOk ? 0 : 'NONZERO'}** (F1–F3) |
| STOP Acc FAIL if any Q1701775 | ${results.stop_acc_fail ? '**TRIGGERED**' : 'not triggered'} |

## Gate summary
| Cell | Result | Notes |
|------|--------|-------|
| F1 quiet×5 Smith POST+IBM/NY/US | **${g.F1_quiet_x5}** | ui soft · faces=0 · Q170∉ |
| F2 COLD×3 +nocache | **${g.F2_cold_x3}** | same |
| F3 WARM×3 after cold | **${g.F3_warm_x3}** | same · scrub on HIT too |
| F4 Assaf×2 | **${g.F4_assaf_x2}** | dossier Q47507930 |
| F5 כהן×2 | **${g.F5_cohen_x2}** | need_context\\|thin · never dossier |
| F6 John Rappaport×1 | **${g.F6_john_rappaport_x1}** | not Assaf QID |
| F7 Scan all bodies Q1701775 | **${g.F7_body_scan_Q1701775}** | files=${results.body_scan.files} hits=${results.body_scan.hits} |
| **leakage** | **${results.leakage_total}** | |
| **pw** | **${results.pw}** | |
| **Acc Gate** | **${g.Acc_Gate}** | Chief REVIEW · HOLD promote |

## Detail tables

### F1 quiet×5
${rowTable(results.matrix.F1_quiet?.rows)}

### F2 COLD×3 (nocache:1)
${rowTable(results.matrix.F2_cold?.rows)}

### F3 WARM×3
${rowTable(results.matrix.F3_warm?.rows)}

### F4 Assaf×2 / F5 כהן×2 / F6 T-C6×1
| Cell | i | uiState | mode | qid | faces | Q170 | requestId | raw |
|------|---|--------|------|-----|-------|------|-----------|-----|
${(results.matrix.F4_assaf?.rows || []).map(r => `| F4 | ${r.i} | ${r.ui} | ${r.mode} | ${r.qid} | ${r.facesCount} | ${r.has_Q1701775} | \`${r.rid || ''}\` | ${r.raw} |`).join('\n')}
${(results.matrix.F5_cohen?.rows || []).map(r => `| F5 | ${r.i} | ${r.ui} | ${r.mode} | ${r.qid || 'null'} | ${r.facesCount} | ${r.has_Q1701775} | \`${r.rid || ''}\` | ${r.raw} |`).join('\n')}
${(results.matrix.F6_tc6?.rows || []).map(r => `| F6 | ${r.i} | ${r.ui} | ${r.mode} | ${r.qid || 'null'} | ${r.facesCount} | ${r.has_Q1701775} | \`${r.rid || ''}\` | ${r.raw} |`).join('\n')}

## Body scan (F7)
- files scanned: **${results.body_scan.files}**
- Q1701775 hits: **${results.body_scan.hits}**
- offenders: ${results.body_scan.offenders.length ? JSON.stringify(results.body_scan.offenders) : 'none'}

## Artifacts
- \`test-results/wp3/ACC-P0-GATE-FORMAL-דיוק-2026-09-20.md\`
- \`test-results/wp3/ACC-P0-GATE-FORMAL-דיוק-2026-09-20.json\`
- \`test-results/wp3/ACC-P0-GATE-FORMAL-raw/\` (health + F1–F6 payloads)

## Handoff
**Acc Gate ${g.Acc_Gate}** → Chief REVIEW · **HOLD promote** · alias \`${ALIAS_FROZEN}\` frozen · Preview \`${DPL}\` only.
`;

writeFileSync(OUT_MD, md);
console.log(JSON.stringify(results.gate, null, 2));
process.stderr.write(`\n=== Acc Gate ${results.gate.Acc_Gate} leakage=${results.leakage_total} pw=${results.pw} ===\n`);
process.stderr.write(`Wrote ${OUT_MD}\nWrote ${OUT_JSON}\n`);
