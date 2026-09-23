#!/usr/bin/env node
/**
 * Smith POST nested ONLY — COLD N=30 (nocache=1) then WARM N=30 (no nocache).
 * Preview ONLY. Uses vercel curl for Deployment Protection. Never prints tokens.
 * MEASURE ONLY — no deploy/promote/product change.
 */
import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = process.env.AKVOT_PERF_BASE || 'https://akvot-simple-demo-1k80g2net-k-akvot.vercel.app';
const N = Number(process.env.AKVOT_PERF_N || 30);
const SCOPE = process.env.AKVOT_VERCEL_SCOPE || 'k-akvot';
const ORIGIN = 'https://akvot-simple-demo.vercel.app';
const BODY = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };
const BAD_QID = 'Q1701775';
const OUT_STEM = 'test-results/perf/PERF-REHARNESS-SMITH-POST-dplDEVknn-בודק-2026-09-17';
const HANDOFF = 'test-results/handoff/P3-REHARNESS-SMITH-POST-בודק-2026-09-17.md';

if (/akvot-simple-demo\.vercel\.app\/?$/.test(BASE.replace(/\/$/, ''))) {
  console.error('ABORT: refusing prod alias', BASE);
  process.exit(2);
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}
function stats(msArr) {
  const a = [...msArr].filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return null;
  const sum = a.reduce((s, x) => s + x, 0);
  return {
    n: a.length,
    min: a[0],
    max: a[a.length - 1],
    mean: Math.round(sum / a.length),
    p50: percentile(a, 50),
    p90: percentile(a, 90),
    p95: percentile(a, 95),
    p99: percentile(a, 99),
  };
}

function fetchOnce({ nocache }) {
  const url = new URL('/api/lookup', BASE);
  if (nocache) url.searchParams.set('nocache', '1');
  const payload = nocache ? { ...BODY, nocache: '1' } : { ...BODY };
  const t0 = Date.now();
  const args = [
    'curl', url.toString(), '--scope', SCOPE,
    '-X', 'POST',
    '-H', 'Content-Type: application/json',
    '-H', `Origin: ${ORIGIN}`,
    '--data', JSON.stringify(payload),
  ];
  const r = spawnSync('vercel', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 90000 });
  const wallMs = Date.now() - t0;
  const out = (r.stdout || '').trim();
  const errOut = (r.stderr || '').trim();
  const lines = out.split('\n');
  const jsonLine = [...lines].reverse().find((l) => l.trim().startsWith('{'));
  let json = null;
  let err = null;
  let status = 0;
  try {
    json = jsonLine ? JSON.parse(jsonLine) : null;
    status = json ? 200 : 0;
  } catch (e) {
    err = String(e.message || e);
  }
  if (r.status && !json) err = err || errOut || `exit ${r.status}`;
  // Detect access denial in body/stderr
  const blob = `${out}\n${errOut}`;
  if (/403|Forbidden|Authentication Required|DEPLOYMENT_NOT_FOUND/i.test(blob) && !json) {
    status = status || 403;
    err = err || 'ACCESS_403';
  }
  if (!json && /Redirecting|login/i.test(blob)) {
    status = status || 403;
    err = err || 'ACCESS_REDIRECT';
  }

  const uiState = json?.uiState || json?.mode || null;
  const qid = json?.qid || null;
  const faces = json?.faces === true;
  const photo = !!(json?.photo || json?.photoUrl);
  const cached = !!json?.cached;
  // Classic pretty-wrong: illegal dossier for Smith+ctx, esp. Q1701775
  const prettyWrong = uiState === 'dossier' || qid === BAD_QID;
  // faces/photo when not dossier is also a gate concern
  const facesLeak = faces && uiState !== 'dossier';
  const photoLeak = photo && uiState !== 'dossier';

  return {
    wallMs,
    status,
    err,
    uiState,
    qid,
    faces,
    photo,
    cached,
    prettyWrong,
    facesLeak,
    photoLeak,
    requestId: json?.requestId || null,
    timings: json?.timings || null,
  };
}

function summarize(samples) {
  const uiCounts = {};
  for (const s of samples) uiCounts[s.uiState || (s.err ? 'err' : 'null')] = (uiCounts[s.uiState || (s.err ? 'err' : 'null')] || 0) + 1;
  const dossier_n = samples.filter((s) => s.uiState === 'dossier').length;
  const Q1701775_n = samples.filter((s) => s.qid === BAD_QID).length;
  const faces_true_n = samples.filter((s) => s.faces).length;
  const photo_true_n = samples.filter((s) => s.photo).length;
  const faces_leak_n = samples.filter((s) => s.facesLeak).length;
  const photo_leak_n = samples.filter((s) => s.photoLeak).length;
  const pretty_wrong_n = samples.filter((s) => s.prettyWrong).length;
  const err_n = samples.filter((s) => s.err || (s.status && s.status >= 400)).length;
  const access_n = samples.filter((s) => s.status === 403 || /ACCESS_|403|Forbidden/i.test(String(s.err || ''))).length;
  const cached_n = samples.filter((s) => s.cached).length;
  const wall = stats(samples.map((s) => s.wallMs));
  return {
    n: samples.length,
    uiCounts,
    dossier_n,
    Q1701775_n,
    faces_true_n,
    photo_true_n,
    faces_leak_n,
    photo_leak_n,
    pretty_wrong_n,
    err_n,
    access_n,
    cached_n,
    wall,
    p50: wall?.p50 ?? null,
    p95: wall?.p95 ?? null,
  };
}

function runMode(mode) {
  const samples = [];
  let consecutive403 = 0;
  let aborted = false;
  const nocache = mode === 'COLD';
  for (let i = 0; i < N; i++) {
    const s = fetchOnce({ nocache });
    samples.push({ i: i + 1, mode, ...s });
    process.stderr.write(
      `  ${mode} ${i + 1}/${N} ${s.wallMs}ms ui=${s.uiState} qid=${s.qid || '-'} faces=${s.faces} photo=${s.photo} cached=${s.cached} err=${s.err || '-'}\n`
    );
    const is403 = s.status === 403 || /ACCESS_|403|Forbidden/i.test(String(s.err || ''));
    if (is403) {
      consecutive403 += 1;
      if (consecutive403 >= 5) {
        process.stderr.write(`ABORT: ${consecutive403} consecutive ACCESS errors — INFRA stop (${mode})\n`);
        aborted = true;
        break;
      }
    } else {
      consecutive403 = 0;
    }
    spawnSync('sleep', ['0.15']);
  }
  return { mode, aborted, consecutive403, summary: summarize(samples), samples };
}

// Health via vercel curl
function healthCheck() {
  const r = spawnSync(
    'vercel',
    ['curl', `${BASE}/api/health`, '--scope', SCOPE],
    { encoding: 'utf8', maxBuffer: 2 * 1024 * 1024, timeout: 30000 }
  );
  const out = (r.stdout || '').trim();
  const line = out.split('\n').reverse().find((l) => l.trim().startsWith('{'));
  try {
    return line ? JSON.parse(line) : null;
  } catch {
    return null;
  }
}

const started = new Date().toISOString();
process.stderr.write(`Smith POST re-harness base=${BASE} N=${N} started=${started}\n`);
const health = healthCheck();
process.stderr.write(`health=${JSON.stringify(health)}\n`);

const cold = runMode('COLD');
const warm = cold.aborted
  ? { mode: 'WARM', aborted: true, consecutive403: cold.consecutive403, summary: summarize([]), samples: [], skipped: true }
  : runMode('WARM');

const finished = new Date().toISOString();

const gate = {
  warm_dossier_0: (warm.summary.dossier_n || 0) === 0,
  cold_dossier_0: (cold.summary.dossier_n || 0) === 0,
  no_Q1701775: (cold.summary.Q1701775_n || 0) + (warm.summary.Q1701775_n || 0) === 0,
  faces_false_when_not_dossier: (cold.summary.faces_leak_n || 0) + (warm.summary.faces_leak_n || 0) === 0,
  photo_false_when_not_dossier: (cold.summary.photo_leak_n || 0) + (warm.summary.photo_leak_n || 0) === 0,
  pretty_wrong_0: (cold.summary.pretty_wrong_n || 0) + (warm.summary.pretty_wrong_n || 0) === 0,
  prefer_all_faces_false: (cold.summary.faces_true_n || 0) + (warm.summary.faces_true_n || 0) === 0,
  n_cold_30: cold.summary.n === N,
  n_warm_30: warm.summary.n === N,
  no_access_abort: !cold.aborted && !warm.aborted,
};
const productPass =
  gate.warm_dossier_0 &&
  gate.cold_dossier_0 &&
  gate.no_Q1701775 &&
  gate.faces_false_when_not_dossier &&
  gate.photo_false_when_not_dossier &&
  gate.pretty_wrong_0 &&
  gate.n_cold_30 &&
  gate.n_warm_30 &&
  gate.no_access_abort;

const accessBlocked = cold.aborted || warm.aborted;
const STATUS = accessBlocked ? 'INFRA_ABORT' : productPass ? 'PASS' : 'FAIL';

mkdirSync('test-results/perf', { recursive: true });
mkdirSync('test-results/handoff', { recursive: true });

const payload = {
  agent: 'בודק',
  when: finished,
  started,
  finished,
  base: BASE,
  dpl_hint: 'dpl_DEVknn…',
  health,
  case: 'C-smith-ctx-post',
  body: BODY,
  N,
  constraint: 'MEASURE ONLY — Preview ONLY — no deploy/promote/product change',
  STATUS,
  gate,
  productPass,
  accessBlocked,
  COLD: cold.summary,
  WARM: warm.summary,
  cold_aborted: !!cold.aborted,
  warm_aborted: !!warm.aborted,
  samples: { COLD: cold.samples, WARM: warm.samples },
};

writeFileSync(`${OUT_STEM}.json`, JSON.stringify(payload, null, 2));

function fmtSum(label, s) {
  return [
    `### ${label}`,
    `- N: ${s.n}`,
    `- uiCounts: ${JSON.stringify(s.uiCounts)}`,
    `- dossier_n: ${s.dossier_n}`,
    `- Q1701775_n: ${s.Q1701775_n}`,
    `- faces_true_n: ${s.faces_true_n}`,
    `- photo_true_n: ${s.photo_true_n}`,
    `- faces_leak_n: ${s.faces_leak_n}`,
    `- photo_leak_n: ${s.photo_leak_n}`,
    `- pretty_wrong_n: ${s.pretty_wrong_n}`,
    `- err_n: ${s.err_n}`,
    `- access_n: ${s.access_n}`,
    `- cached_n: ${s.cached_n}`,
    `- p50/p95 ms: ${s.p50 ?? '-'}/${s.p95 ?? '-'}`,
  ].join('\n');
}

let md = `# PERF REHARNESS · Smith POST · dpl_DEVknn… · בודק · 2026-09-17\n\n`;
md += `**STATUS:** ${STATUS}\n`;
md += `**Base:** ${BASE}\n`;
md += `**Health build:** ${health?.build || 'unchecked'}\n`;
md += `**Case:** C-smith-ctx-post nested POST \`{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"}}\`\n`;
md += `**Modes:** COLD N=${N} nocache=1 → WARM N=${N} WITHOUT nocache (same process)\n`;
md += `**Constraint:** Preview ONLY · MEASURE ONLY · no prod · no deploy\n\n`;
md += `## Gate\n\n`;
md += `| Check | OK |\n|-------|----|\n`;
for (const [k, v] of Object.entries(gate)) md += `| ${k} | ${v ? '✅' : '❌'} |\n`;
md += `\n**productPass:** ${productPass} · **accessBlocked:** ${accessBlocked}\n\n`;
md += fmtSum('COLD', cold.summary) + '\n\n';
md += fmtSum('WARM', warm.summary) + '\n\n';
if (accessBlocked) md += `## ACCESS blocker\nINFRA abort: consecutive ACCESS/403 ≥5. Not a product PASS/FAIL.\n\n`;
md += `Artifacts: \`${OUT_STEM}.json\` · handoff \`${HANDOFF}\`\n`;
writeFileSync(`${OUT_STEM}.md`, md);

let hand = `# P3 REHARNESS · Smith POST · בודק · 2026-09-17\n\n`;
hand += `**STATUS:** ${STATUS}\n\n`;
hand += `| Mode | N | uiCounts | dossier | Q1701775 | faces_true | err | p50 | p95 |\n`;
hand += `|------|---|----------|---------|----------|------------|-----|-----|-----|\n`;
hand += `| COLD | ${cold.summary.n} | ${JSON.stringify(cold.summary.uiCounts)} | ${cold.summary.dossier_n} | ${cold.summary.Q1701775_n} | ${cold.summary.faces_true_n} | ${cold.summary.err_n} | ${cold.summary.p50 ?? '-'} | ${cold.summary.p95 ?? '-'} |\n`;
hand += `| WARM | ${warm.summary.n} | ${JSON.stringify(warm.summary.uiCounts)} | ${warm.summary.dossier_n} | ${warm.summary.Q1701775_n} | ${warm.summary.faces_true_n} | ${warm.summary.err_n} | ${warm.summary.p50 ?? '-'} | ${warm.summary.p95 ?? '-'} |\n\n`;
hand += `**pretty_wrong:** COLD=${cold.summary.pretty_wrong_n} WARM=${warm.summary.pretty_wrong_n}\n`;
hand += `**faces/photo leak (non-dossier):** faces_leak COLD=${cold.summary.faces_leak_n} WARM=${warm.summary.faces_leak_n} · photo_leak COLD=${cold.summary.photo_leak_n} WARM=${warm.summary.photo_leak_n}\n`;
hand += `**health.build:** ${health?.build || 'n/a'}\n`;
hand += `**base:** ${BASE}\n`;
if (accessBlocked) hand += `\n**ACCESS:** INFRA abort (403 streak ≥5) — not product PASS.\n`;
hand += `\nFull: \`${OUT_STEM}.{md,json}\`\n`;
writeFileSync(HANDOFF, hand);

console.log(JSON.stringify({
  STATUS,
  productPass,
  accessBlocked,
  health,
  COLD: {
    N: cold.summary.n,
    uiCounts: cold.summary.uiCounts,
    dossier_n: cold.summary.dossier_n,
    Q1701775_n: cold.summary.Q1701775_n,
    faces_true_n: cold.summary.faces_true_n,
    err_n: cold.summary.err_n,
    p50: cold.summary.p50,
    p95: cold.summary.p95,
  },
  WARM: {
    N: warm.summary.n,
    uiCounts: warm.summary.uiCounts,
    dossier_n: warm.summary.dossier_n,
    Q1701775_n: warm.summary.Q1701775_n,
    faces_true_n: warm.summary.faces_true_n,
    err_n: warm.summary.err_n,
    p50: warm.summary.p50,
    p95: warm.summary.p95,
  },
  out: { md: `${OUT_STEM}.md`, json: `${OUT_STEM}.json`, handoff: HANDOFF },
}, null, 2));
