#!/usr/bin/env node
/**
 * P3 PERFORMANCE HARNESS — measure only (no Core optimize / no dpl).
 * Baseline: dpl_Crsqe… · N≥30 · p50–p99 · COLD/WARM · GET/POST/ctx
 *
 * Usage:
 *   node scripts/perf-harness.mjs [--base URL] [--n 30] [--tag LABEL]
 * Env:
 *   AKVOT_PERF_BASE · AKVOT_PERF_N · AKVOT_PERF_USE_VERCEL_CURL=1
 */
import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

const BASE = process.env.AKVOT_PERF_BASE
  || process.argv.find((a, i) => process.argv[i - 1] === '--base')
  || 'https://akvot-simple-demo.vercel.app';
const N = Number(process.env.AKVOT_PERF_N
  || process.argv.find((a, i) => process.argv[i - 1] === '--n')
  || 30);
const TAG = process.argv.find((a, i) => process.argv[i - 1] === '--tag') || new Date().toISOString().slice(0, 16).replace(/[:T]/g, '');
const USE_VERCEL = process.env.AKVOT_PERF_USE_VERCEL_CURL === '1';
const ORIGIN = 'https://akvot-simple-demo.vercel.app';

const CASES = [
  { id: 'A-assaf-get', method: 'GET', path: '/api/lookup?q=Assaf%20Rappaport', cold: true },
  { id: 'B-smith-bare-get', method: 'GET', path: '/api/lookup?q=John%20Smith', cold: true },
  { id: 'C-smith-ctx-post', method: 'POST', path: '/api/lookup', body: { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } }, cold: true },
  { id: 'D-cohen-get', method: 'GET', path: '/api/lookup?q=%D7%9B%D7%94%D7%9F', cold: true },
  { id: 'E-rappaport-get', method: 'GET', path: '/api/lookup?q=John%20Rappaport', cold: true },
  { id: 'F-netanyahu-get', method: 'GET', path: '/api/lookup?q=%D7%A0%D7%AA%D7%A0%D7%99%D7%94%D7%95', cold: true },
];

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

function fetchOnce({ method, path, body, nocache }) {
  const url = new URL(path, BASE);
  if (nocache) url.searchParams.set('nocache', '1');
  const t0 = Date.now();
  let status = 0;
  let json = null;
  let err = null;

  if (USE_VERCEL) {
    const args = ['curl', url.toString(), '--scope', 'k-akvot'];
    if (method === 'POST') {
      args.push('-X', 'POST', '-H', 'Content-Type: application/json', '-H', `Origin: ${ORIGIN}`,
        '--data', JSON.stringify({ ...(body || {}), nocache: nocache ? '1' : undefined }));
    }
    const r = spawnSync('vercel', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 90000 });
    const out = (r.stdout || '').trim();
    const lines = out.split('\n');
    const jsonLine = lines.reverse().find((l) => l.startsWith('{'));
    try { json = jsonLine ? JSON.parse(jsonLine) : null; status = json ? 200 : 0; }
    catch (e) { err = String(e.message || e); }
    if (r.status && !json) err = err || (r.stderr || `exit ${r.status}`);
  } else {
    try {
      const opts = {
        method,
        headers: { 'User-Agent': 'akvot-perf-harness/1', Accept: 'application/json', Origin: ORIGIN },
      };
      if (method === 'POST') {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify({ ...(body || {}), ...(nocache ? { nocache: '1' } : {}) });
      }
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 70000);
      // node 20 fetch
      const res = await_fetch(url.toString(), { ...opts, signal: ac.signal });
      clearTimeout(timer);
      status = res.status;
      const text = res.text;
      try { json = JSON.parse(text); } catch { err = 'bad_json'; }
    } catch (e) {
      err = String(e.message || e);
    }
  }

  const wall = Date.now() - t0;
  const timings = json?.timings || {};
  return {
    wallMs: wall,
    status,
    err,
    uiState: json?.uiState || null,
    qid: json?.qid || null,
    requestId: json?.requestId || null,
    cached: !!json?.cached,
    timings: {
      wiki: timings.wiki ?? null,
      gemini: timings.gemini ?? null,
      enrich: timings.enrich ?? null,
      stageB: timings.stageB ?? null,
      total: timings.total ?? null,
    },
  };
}

function await_fetch(url, opts) {
  // sync wrapper via spawn curl for reliability without top-level await complexity in sync loop
  const args = ['-sS', '-w', '\n%{http_code}', '--max-time', '70', '-H', `User-Agent: ${opts.headers['User-Agent']}`, '-H', 'Accept: application/json'];
  if (opts.headers.Origin) args.push('-H', `Origin: ${opts.headers.Origin}`);
  if (opts.method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '-d', opts.body);
  }
  args.push(url);
  const r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  const raw = r.stdout || '';
  const nl = raw.lastIndexOf('\n');
  const body = nl >= 0 ? raw.slice(0, nl) : raw;
  const code = nl >= 0 ? Number(raw.slice(nl + 1)) : 0;
  if (r.status && !body) throw new Error(r.stderr || `curl exit ${r.status}`);
  return { status: code, text: body };
}

function runCase(c, mode) {
  const samples = [];
  let consecutive403 = 0;
  for (let i = 0; i < N; i++) {
    const nocache = mode === 'COLD';
    const s = fetchOnce({ method: c.method, path: c.path, body: c.body, nocache });
    samples.push({ i, mode, ...s });
    process.stderr.write(`  ${c.id} ${mode} ${i + 1}/${N} ${s.wallMs}ms ui=${s.uiState} qid=${s.qid || '-'} err=${s.err || '-'}\n`);
    if (s.err && /403|no_json|Forbidden|bad_json/.test(String(s.err))) {
      consecutive403 = (consecutive403 || 0) + 1;
      if (consecutive403 >= 5) {
        process.stderr.write(`ABORT: ${consecutive403} consecutive access errors — stop case ${c.id} ${mode}\n`);
        break;
      }
    } else {
      consecutive403 = 0;
    }
    // light pacing to reduce System Mitigations trips
    spawnSync('sleep', ['0.15']);
  }
  const wall = stats(samples.map((s) => s.wallMs));
  const serverTotal = stats(samples.map((s) => s.timings.total).filter((x) => x != null));
  const wiki = stats(samples.map((s) => s.timings.wiki).filter((x) => x != null));
  const stageB = stats(samples.map((s) => s.timings.stageB).filter((x) => x != null));
  const gemini = stats(samples.map((s) => s.timings.gemini).filter((x) => x != null));
  const uiCounts = {};
  for (const s of samples) uiCounts[s.uiState || 'null'] = (uiCounts[s.uiState || 'null'] || 0) + 1;
  const errors = samples.filter((s) => s.err || (s.status && s.status >= 400)).length;
  return { caseId: c.id, method: c.method, mode, wall, serverTotal, wiki, stageB, gemini, uiCounts, errors, samples };
}

const runId = randomUUID().slice(0, 8);
const started = new Date().toISOString();
const results = [];

console.error(`perf-harness base=${BASE} N=${N} tag=${TAG} run=${runId}`);

for (const c of CASES) {
  results.push(runCase(c, 'COLD'));
  results.push(runCase(c, 'WARM'));
}

const outDir = 'test-results/perf';
mkdirSync(outDir, { recursive: true });
const jsonPath = `${outDir}/PERF-HARNESS-${TAG}-${runId}.json`;
const mdPath = `${outDir}/PERF-HARNESS-${TAG}-${runId}.md`;
const payload = {
  runId,
  tag: TAG,
  started,
  finished: new Date().toISOString(),
  base: BASE,
  n: N,
  baselineHint: 'dpl_CrsqeSQX1GAhi1VFExVsGwdsSYHt',
  constraint: 'MEASURE ONLY — no Core optimize — no dpl',
  results: results.map(({ samples, ...sum }) => ({ ...sum, sampleCount: samples.length })),
  raw: results,
};

writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

let md = `# PERF HARNESS · ${TAG} · ${runId}\n`;
md += `**Base:** ${BASE} · **N:** ${N} · **Baseline:** dpl_Crsqe… · MEASURE ONLY\n\n`;
md += `| Case | Mode | n | p50 | p90 | p95 | p99 | max | err | ui |\n|------|------|---|-----|-----|-----|-----|-----|-----|----|\n`;
for (const r of results) {
  const w = r.wall || {};
  md += `| ${r.caseId} | ${r.mode} | ${w.n || 0} | ${w.p50 ?? '-'} | ${w.p90 ?? '-'} | ${w.p95 ?? '-'} | ${w.p99 ?? '-'} | ${w.max ?? '-'} | ${r.errors} | ${JSON.stringify(r.uiCounts)} |\n`;
}
md += `\n## Server timings (p50 wall vs timings.total)\n\n`;
md += `| Case | Mode | wall p50 | total p50 | wiki p50 | stageB p50 | gemini p50 |\n|------|------|----------|-----------|----------|------------|------------|\n`;
for (const r of results) {
  md += `| ${r.caseId} | ${r.mode} | ${r.wall?.p50 ?? '-'} | ${r.serverTotal?.p50 ?? '-'} | ${r.wiki?.p50 ?? '-'} | ${r.stageB?.p50 ?? '-'} | ${r.gemini?.p50 ?? '-'} |\n`;
}
md += `\nArtifacts: \`${jsonPath}\`\n`;
writeFileSync(mdPath, md);

console.log(JSON.stringify({ ok: true, jsonPath, mdPath, runId, n: N, cases: CASES.length }, null, 2));
