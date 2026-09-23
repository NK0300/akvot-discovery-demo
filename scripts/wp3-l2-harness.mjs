#!/usr/bin/env node
/**
 * WP3 L2 MEASURE-ONLY harness — Load / Soak / Failure (CLIENT_STRESS).
 * HARD LOCK: no Core / Acc / Smith / Cohen / cache / SoT / faces / UX / dpl / promote.
 * Any product-fix urge → STOP + document as WP4 candidate (do not patch here).
 *
 * Usage:
 *   node scripts/wp3-l2-harness.mjs --mode smoke|load|soak|failure [flags]
 * Env:
 *   AKVOT_PERF_BASE · AKVOT_PERF_USE_VERCEL_CURL=1 · AKVOT_PERF_N
 *
 * Version: wp3-l2-1.1.0
 */
import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { resolve } from 'path';

const HARNESS_VERSION = 'wp3-l2-1.1.0';
const HARNESS_PATH = 'scripts/wp3-l2-harness.mjs';
const ORIGIN = 'https://akvot-simple-demo.vercel.app';
const DEFAULT_FINGERPRINT = 'test-results/wp3/L2-FINGERPRINT-FROZEN-שרת-2026-09-19.json';
const REQUEST_TIMEOUT_MS = 70000;

const STEPS = { low: 2, med: 5, high: 10, peak: 20 };
const BAD_SMITH_QID = 'Q1701775';
const ASSAF_QID = 'Q47507930';

const L2_CASES = {
  assaf: {
    id: 'A-assaf-get',
    label: 'Assaf GET',
    method: 'GET',
    path: '/api/lookup?q=Assaf%20Rappaport',
    safety: 'keep',
    expectQid: ASSAF_QID,
  },
  smith: {
    id: 'C-smith-ctx-post',
    label: 'Smith POST+IBM+NY',
    method: 'POST',
    path: '/api/lookup',
    body: { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } },
    safety: 'not_pretty',
    badQid: BAD_SMITH_QID,
  },
  cohen: {
    id: 'D-cohen-get',
    label: 'כהן GET',
    method: 'GET',
    path: '/api/lookup?q=%D7%9B%D7%94%D7%9F',
    safety: 'never_dossier',
  },
};

function argVal(flag, fallback = null) {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1];
  return fallback;
}
function hasFlag(flag) {
  return process.argv.includes(flag);
}

const BASE = process.env.AKVOT_PERF_BASE || argVal('--base') || 'https://akvot-simple-demo.vercel.app';
const USE_VERCEL = process.env.AKVOT_PERF_USE_VERCEL_CURL === '1';
const MODE = argVal('--mode', 'smoke');
const TAG = argVal('--tag') || new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const OUT_DIR = argVal('--out-dir', 'test-results/wp3');
const FINGERPRINT_REF = argVal('--fingerprint', DEFAULT_FINGERPRINT);
const ABORT_ON_PW = argVal('--abort-on-pw', '1') !== '0';
const BUCKET_MINUTES = Number(argVal('--bucket-minutes', '2'));
const SOAK_MINUTES = Number(argVal('--soak-minutes', '10'));
const DURATION_SEC = Number(argVal('--duration-sec', '60'));
const MIX = (argVal('--mix', 'cold,warm')).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const CASE_KEYS = (argVal('--cases', 'assaf,smith,cohen')).split(',').map((s) => s.trim().toLowerCase()).filter((k) => L2_CASES[k]);
const STEP_ARG = (argVal('--step', 'all') || 'all').toLowerCase();
const CONCURRENCY_OVERRIDE = argVal('--concurrency') != null ? Number(argVal('--concurrency')) : null;
const N = Number(process.env.AKVOT_PERF_N || argVal('--n') || (MODE === 'smoke' ? 2 : 20));
const PROBE = (argVal('--probe', 'all') || 'all').toLowerCase();

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

function curlFetch(url, { method, body, headers }) {
  const args = ['-sS', '-w', '\n%{http_code}', '--max-time', String(Math.ceil(REQUEST_TIMEOUT_MS / 1000))];
  for (const [k, v] of Object.entries(headers || {})) args.push('-H', `${k}: ${v}`);
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '-d', body);
  }
  args.push(url);
  const r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  const raw = r.stdout || '';
  const nl = raw.lastIndexOf('\n');
  const text = nl >= 0 ? raw.slice(0, nl) : raw;
  const code = nl >= 0 ? Number(raw.slice(nl + 1)) : 0;
  if (r.status && !text) throw new Error(r.stderr || `curl exit ${r.status}`);
  return { status: code, text };
}

function vercelCurl(url, { method, bodyObj }) {
  const args = ['curl', url, '--scope', 'k-akvot'];
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '-H', `Origin: ${ORIGIN}`,
      '--data', JSON.stringify(bodyObj || {}));
  }
  const r = spawnSync('vercel', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 90000 });
  const out = (r.stdout || '').trim();
  const lines = out.split('\n');
  const jsonLine = [...lines].reverse().find((l) => l.startsWith('{'));
  let json = null;
  let err = null;
  try { json = jsonLine ? JSON.parse(jsonLine) : null; } catch (e) { err = String(e.message || e); }
  if (r.status && !json) err = err || (r.stderr || `exit ${r.status}`);
  return { status: json ? 200 : 0, json, err, text: jsonLine || out };
}

async function fetchOnce({ method, path, body, nocache }) {
  const url = new URL(path, BASE);
  if (nocache && method === 'GET') url.searchParams.set('nocache', '1');
  const t0 = Date.now();
  let status = 0;
  let json = null;
  let err = null;
  let timedOut = false;

  const bodyObj = method === 'POST'
    ? { ...(body || {}), ...(nocache ? { nocache: '1' } : {}) }
    : null;

  try {
    if (USE_VERCEL) {
      // vercel CLI is sync; wrap so pool still schedules concurrently across awaits
      const r = await Promise.resolve().then(() => vercelCurl(url.toString(), { method, bodyObj }));
      status = r.status;
      json = r.json;
      err = r.err;
    } else {
      const headers = {
        'User-Agent': `akvot-wp3-l2-harness/${HARNESS_VERSION}`,
        Accept: 'application/json',
        Origin: ORIGIN,
      };
      const opts = { method, headers };
      if (method === 'POST') {
        headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(bodyObj);
      }
      // Prefer native fetch for true concurrency; fall back to curl sync wrapper
      if (typeof fetch === 'function') {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);
        try {
          const res = await fetch(url.toString(), { ...opts, signal: ac.signal });
          status = res.status;
          const text = await res.text();
          try { json = JSON.parse(text); } catch { err = 'bad_json'; }
        } catch (e) {
          const msg = String(e.message || e);
          if (/abort|timeout/i.test(msg)) timedOut = true;
          err = msg;
        } finally {
          clearTimeout(timer);
        }
      } else {
        const r = curlFetch(url.toString(), { method, body: opts.body, headers });
        status = r.status;
        try { json = JSON.parse(r.text); } catch { err = 'bad_json'; }
      }
    }
  } catch (e) {
    const msg = String(e.message || e);
    if (/abort|timeout|ETIMEDOUT/i.test(msg)) timedOut = true;
    err = msg;
  }

  const wallMs = Date.now() - t0;
  if (wallMs >= REQUEST_TIMEOUT_MS - 50) timedOut = timedOut || true;

  const uiState = json?.uiState || json?.mode || null;
  const qid = json?.qid || null;
  const faces = json?.faces === true || (Array.isArray(json?.images) && json.images.length > 0 && uiState === 'dossier');
  const photo = !!(json?.photo || json?.photoUrl);
  const cached = !!json?.cached;
  const timings = json?.timings || {};
  const wikiMeta = json?.wikiMeta || timings?.wikiMeta || { wiki429: 0, wikiTimeout: 0, wikiRetries: 0 };

  return {
    wallMs,
    status,
    err,
    timedOut,
    uiState,
    qid,
    faces: !!faces,
    photo,
    cached,
    requestId: json?.requestId || null,
    timings: {
      wiki: timings.wiki ?? null,
      gemini: timings.gemini ?? null,
      enrich: timings.enrich ?? null,
      stageB: timings.stageB ?? null,
      total: timings.total ?? null,
    },
    wikiMeta: {
      wiki429: Number(wikiMeta.wiki429) || 0,
      wikiTimeout: Number(wikiMeta.wikiTimeout) || 0,
      wikiRetries: Number(wikiMeta.wikiRetries) || 0,
    },
  };
}

function detectPrettyWrong(caseDef, sample) {
  if (!sample || sample.err && !sample.uiState) return { prettyWrong: false, reason: null };
  const ui = sample.uiState;
  const qid = sample.qid;
  if (caseDef.safety === 'not_pretty') {
    if (ui === 'dossier' || qid === (caseDef.badQid || BAD_SMITH_QID)) {
      return { prettyWrong: true, reason: `smith_dossier_or_bad_qid ui=${ui} qid=${qid}` };
    }
  }
  if (caseDef.safety === 'never_dossier') {
    if (ui === 'dossier') {
      return { prettyWrong: true, reason: `cohen_dossier ui=${ui} qid=${qid}` };
    }
  }
  if (caseDef.safety === 'keep' && caseDef.expectQid) {
    // Assaf KEEP: dossier with wrong QID is pw; non-dossier under load is degradation (not pw)
    if (ui === 'dossier' && qid && qid !== caseDef.expectQid) {
      return { prettyWrong: true, reason: `assaf_wrong_qid expected=${caseDef.expectQid} got=${qid}` };
    }
  }
  // Face leak on non-dossier
  if (sample.faces && ui && ui !== 'dossier') {
    return { prettyWrong: true, reason: `faces_leak ui=${ui}` };
  }
  return { prettyWrong: false, reason: null };
}

function emptyStopState() {
  return { aborted: false, reason: null, pwEvents: [] };
}

async function runPool({ caseDef, mode, concurrency, totalN, stopState, onSample }) {
  const nocache = mode === 'COLD';
  let next = 0;
  let completed = 0;
  const samples = [];
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (true) {
      if (stopState.aborted) break;
      const i = next++;
      if (i >= totalN) break;
      const s = await fetchOnce({
        method: caseDef.method,
        path: caseDef.path,
        body: caseDef.body,
        nocache,
      });
      const pw = detectPrettyWrong(caseDef, s);
      const row = {
        i,
        mode,
        caseId: caseDef.id,
        concurrency,
        ...s,
        prettyWrong: pw.prettyWrong,
        prettyWrongReason: pw.reason,
        at: new Date().toISOString(),
      };
      samples.push(row);
      completed += 1;
      if (onSample) onSample(row, completed, totalN);
      if (pw.prettyWrong) {
        stopState.pwEvents.push({ caseId: caseDef.id, mode, i, reason: pw.reason, qid: s.qid, uiState: s.uiState });
        if (ABORT_ON_PW) {
          stopState.aborted = true;
          stopState.reason = `pw>0 STOP · ${pw.reason}`;
          process.stderr.write(`\nABORT pw>0: ${pw.reason} case=${caseDef.id} mode=${mode} i=${i}\n`);
          break;
        }
      }
    }
  });
  await Promise.all(workers);
  return samples;
}

function aggregateSamples(samples, { wallClockMs } = {}) {
  const n = samples.length;
  const errors = samples.filter((s) => s.err || (s.status && s.status >= 400));
  const timeouts = samples.filter((s) => s.timedOut || /timeout|abort/i.test(String(s.err || '')));
  const statusDist = {};
  const uiCounts = {};
  for (const s of samples) {
    const st = s.status || (s.err ? 'err' : 0);
    statusDist[st] = (statusDist[st] || 0) + 1;
    uiCounts[s.uiState || (s.err ? 'err' : 'null')] = (uiCounts[s.uiState || (s.err ? 'err' : 'null')] || 0) + 1;
  }
  const cacheHit = samples.filter((s) => s.cached === true).length;
  const cacheMiss = n - cacheHit;
  const wikiMs = samples.map((s) => s.timings?.wiki).filter((x) => x != null && Number.isFinite(x));
  const wall = stats(samples.map((s) => s.wallMs));
  const wiki = stats(wikiMs);
  const wikiMetaAgg = {
    wiki429_sum: samples.reduce((a, s) => a + (s.wikiMeta?.wiki429 || 0), 0),
    wikiTimeout_sum: samples.reduce((a, s) => a + (s.wikiMeta?.wikiTimeout || 0), 0),
    wikiRetries_sum: samples.reduce((a, s) => a + (s.wikiMeta?.wikiRetries || 0), 0),
    samplesWith429: samples.filter((s) => (s.wikiMeta?.wiki429 || 0) > 0).length,
    samplesWithWikiTimeout: samples.filter((s) => (s.wikiMeta?.wikiTimeout || 0) > 0).length,
  };
  const pwN = samples.filter((s) => s.prettyWrong).length;
  const elapsedSec = wallClockMs != null ? wallClockMs / 1000 : null;
  const throughputRps = elapsedSec && elapsedSec > 0 ? Number((n / elapsedSec).toFixed(3)) : null;
  return {
    n,
    wall,
    wiki,
    errorN: errors.length,
    errorPct: n ? Number(((errors.length / n) * 100).toFixed(2)) : 0,
    timeoutN: timeouts.length,
    timeoutPct: n ? Number(((timeouts.length / n) * 100).toFixed(2)) : 0,
    statusDist,
    uiCounts,
    cache: {
      hit: cacheHit,
      miss: cacheMiss,
      hitRatio: n ? Number((cacheHit / n).toFixed(3)) : null,
    },
    wikiMetaAgg,
    prettyWrongN: pwN,
    throughputRps,
    wallClockMs: wallClockMs ?? null,
  };
}

function loadFingerprint() {
  const p = resolve(FINGERPRINT_REF);
  if (!existsSync(p)) return { path: FINGERPRINT_REF, missing: true };
  try {
    return { path: FINGERPRINT_REF, ...JSON.parse(readFileSync(p, 'utf8')) };
  } catch (e) {
    return { path: FINGERPRINT_REF, parseError: String(e.message || e) };
  }
}

function writeArtifacts(payload, stem) {
  mkdirSync(OUT_DIR, { recursive: true });
  const jsonPath = `${OUT_DIR}/${stem}.json`;
  const mdPath = `${OUT_DIR}/${stem}.md`;
  writeFileSync(jsonPath, JSON.stringify(payload, null, 2));
  let md = `# ${stem}\n\n`;
  md += `**MODE:** ${payload.mode} · **harness:** ${HARNESS_VERSION} · **MEASURE ONLY**\n`;
  md += `**Base:** ${payload.base} · **tag:** ${payload.tag} · **runId:** ${payload.runId}\n`;
  md += `**fingerprintRef:** \`${payload.fingerprintRef}\`\n`;
  if (payload.stop?.aborted) md += `\n**ABORT:** ${payload.stop.reason}\n`;
  md += `\n## Summary\n\n`;
  if (payload.steps) {
    md += `| Step | Case | Mode | conc | n | thruput | p50 | p95 | p99 | err% | to% | HIT | MISS | pw |\n`;
    md += `|------|------|------|------|---|---------|-----|-----|-----|------|-----|-----|------|----|\n`;
    for (const s of payload.steps) {
      const a = s.agg || {};
      md += `| ${s.step} | ${s.caseId} | ${s.mix} | ${s.concurrency} | ${a.n ?? 0} | ${a.throughputRps ?? '-'} | ${a.wall?.p50 ?? '-'} | ${a.wall?.p95 ?? '-'} | ${a.wall?.p99 ?? '-'} | ${a.errorPct ?? '-'} | ${a.timeoutPct ?? '-'} | ${a.cache?.hit ?? '-'} | ${a.cache?.miss ?? '-'} | ${a.prettyWrongN ?? 0} |\n`;
    }
  }
  if (payload.buckets) {
    md += `\n### Soak buckets\n\n`;
    md += `| bucket | t0–t1 | n | p50 | p95 | err% | HIT ratio | wiki429_sum |\n|--------|-------|---|-----|-----|------|-----------|-------------|\n`;
    for (const b of payload.buckets) {
      const a = b.agg || {};
      md += `| ${b.index} | ${b.fromSec}–${b.toSec}s | ${a.n ?? 0} | ${a.wall?.p50 ?? '-'} | ${a.wall?.p95 ?? '-'} | ${a.errorPct ?? '-'} | ${a.cache?.hitRatio ?? '-'} | ${a.wikiMetaAgg?.wiki429_sum ?? 0} |\n`;
    }
  }
  if (payload.probes) {
    md += `\n### Failure probes (CLIENT_STRESS)\n\n`;
    for (const p of payload.probes) {
      md += `- **${p.id}** (${p.label}): n=${p.agg?.n ?? 0} p50=${p.agg?.wall?.p50 ?? '-'} err%=${p.agg?.errorPct ?? '-'} pw=${p.agg?.prettyWrongN ?? 0}\n`;
    }
  }
  md += `\nArtifacts: \`${jsonPath}\`\n`;
  writeFileSync(mdPath, md);
  return { jsonPath, mdPath };
}

function resolveSteps() {
  if (CONCURRENCY_OVERRIDE != null && Number.isFinite(CONCURRENCY_OVERRIDE)) {
    return [{ name: `custom-${CONCURRENCY_OVERRIDE}`, concurrency: CONCURRENCY_OVERRIDE }];
  }
  if (STEP_ARG === 'all') {
    return Object.entries(STEPS).map(([name, concurrency]) => ({ name, concurrency }));
  }
  if (!STEPS[STEP_ARG]) {
    console.error(`Unknown --step ${STEP_ARG}; use low|med|high|peak|all`);
    process.exit(2);
  }
  return [{ name: STEP_ARG, concurrency: STEPS[STEP_ARG] }];
}

async function modeLoad({ smoke = false } = {}) {
  const steps = smoke
    ? [{ name: 'low', concurrency: CONCURRENCY_OVERRIDE || STEPS.low }]
    : resolveSteps();
  const cases = smoke
    ? [L2_CASES[CASE_KEYS[0] || 'assaf']]
    : CASE_KEYS.map((k) => L2_CASES[k]);
  const mixes = smoke ? [MIX[0] === 'warm' ? 'WARM' : 'COLD'] : MIX.map((m) => m.toUpperCase());
  const nPer = smoke ? Math.min(N, 2) : N;
  const stopState = emptyStopState();
  const stepResults = [];

  for (const step of steps) {
    for (const c of cases) {
      for (const mix of mixes) {
        if (stopState.aborted) break;
        process.stderr.write(`L2-A load step=${step.name} conc=${step.concurrency} case=${c.id} mix=${mix} n=${nPer}\n`);
        const t0 = Date.now();
        const samples = await runPool({
          caseDef: c,
          mode: mix,
          concurrency: step.concurrency,
          totalN: nPer,
          stopState,
          onSample: (row, done, total) => {
            process.stderr.write(`  ${c.id} ${mix} ${done}/${total} ${row.wallMs}ms ui=${row.uiState} cached=${row.cached} err=${row.err || '-'}\n`);
          },
        });
        const wallClockMs = Date.now() - t0;
        const agg = aggregateSamples(samples, { wallClockMs });
        stepResults.push({
          stream: 'L2-A',
          step: step.name,
          concurrency: step.concurrency,
          caseId: c.id,
          mix,
          nRequested: nPer,
          agg,
          // keep raw samples for smoke / small N; truncate in full runs if huge
          samples: nPer <= 30 ? samples : samples.map(({ timings, wikiMeta, wallMs, status, err, timedOut, uiState, qid, cached, prettyWrong, requestId, at, i }) => ({
            i, at, wallMs, status, err, timedOut, uiState, qid, cached, prettyWrong, requestId, timings, wikiMeta,
          })),
        });
      }
    }
  }
  return { steps: stepResults, stop: stopState };
}

async function modeSoak() {
  const concurrency = CONCURRENCY_OVERRIDE || STEPS.med;
  const durationMs = SOAK_MINUTES * 60 * 1000;
  const bucketMs = Math.max(60_000, BUCKET_MINUTES * 60 * 1000);
  const cases = CASE_KEYS.map((k) => L2_CASES[k]);
  const mixes = MIX.map((m) => m.toUpperCase());
  const stopState = emptyStopState();
  const allSamples = [];
  const startedAt = Date.now();
  let reqSeq = 0;

  process.stderr.write(`L2-B soak conc=${concurrency} duration=${SOAK_MINUTES}m bucket=${BUCKET_MINUTES}m cases=${cases.map((c) => c.id).join(',')}\n`);

  const workers = Array.from({ length: concurrency }, async (wi) => {
    let local = 0;
    while (Date.now() - startedAt < durationMs && !stopState.aborted) {
      const c = cases[local % cases.length];
      const mix = mixes[local % mixes.length];
      local += 1;
      const i = reqSeq++;
      const s = await fetchOnce({
        method: c.method,
        path: c.path,
        body: c.body,
        nocache: mix === 'COLD',
      });
      const pw = detectPrettyWrong(c, s);
      const row = {
        i,
        worker: wi,
        mode: mix,
        caseId: c.id,
        concurrency,
        elapsedSec: Math.round((Date.now() - startedAt) / 1000),
        ...s,
        prettyWrong: pw.prettyWrong,
        prettyWrongReason: pw.reason,
        at: new Date().toISOString(),
      };
      allSamples.push(row);
      if (pw.prettyWrong) {
        stopState.pwEvents.push({ caseId: c.id, mode: mix, i, reason: pw.reason });
        if (ABORT_ON_PW) {
          stopState.aborted = true;
          stopState.reason = `pw>0 STOP · ${pw.reason}`;
          process.stderr.write(`\nABORT pw>0 during soak: ${pw.reason}\n`);
          break;
        }
      }
      if (i % 5 === 0) {
        process.stderr.write(`  soak t=${row.elapsedSec}s n=${allSamples.length} last=${row.wallMs}ms ui=${row.uiState}\n`);
      }
    }
  });
  await Promise.all(workers);

  const totalMs = Date.now() - startedAt;
  const buckets = [];
  const bucketCount = Math.max(1, Math.ceil(totalMs / bucketMs));
  for (let bi = 0; bi < bucketCount; bi++) {
    const fromSec = Math.round((bi * bucketMs) / 1000);
    const toSec = Math.round((Math.min(totalMs, (bi + 1) * bucketMs)) / 1000);
    const slice = allSamples.filter((s) => s.elapsedSec >= fromSec && s.elapsedSec < toSec + (bi === bucketCount - 1 ? 1 : 0));
    // inclusive last bucket
    const slice2 = allSamples.filter((s) => {
      const t = s.elapsedSec * 1000;
      return t >= bi * bucketMs && t < (bi + 1) * bucketMs;
    });
    const use = slice2.length ? slice2 : slice;
    buckets.push({
      index: bi,
      fromSec,
      toSec,
      agg: aggregateSamples(use, { wallClockMs: Math.min(bucketMs, totalMs - bi * bucketMs) }),
    });
  }

  return {
    soak: {
      concurrency,
      soakMinutes: SOAK_MINUTES,
      bucketMinutes: BUCKET_MINUTES,
      durationMs: totalMs,
      totalN: allSamples.length,
    },
    buckets,
    overall: aggregateSamples(allSamples, { wallClockMs: totalMs }),
    samples: allSamples.map(({ timings, wikiMeta, wallMs, status, err, timedOut, uiState, qid, cached, prettyWrong, requestId, at, i, caseId, mode, elapsedSec }) => ({
      i, at, elapsedSec, caseId, mode, wallMs, status, err, timedOut, uiState, qid, cached, prettyWrong, requestId, timings, wikiMeta,
    })),
    stop: stopState,
  };
}

async function modeFailure() {
  const stopState = emptyStopState();
  const probes = [];
  const want = (id) => PROBE === 'all' || PROBE === id;

  // a) burst Peak for 60s
  if (want('burst') && !stopState.aborted) {
    const concurrency = STEPS.peak;
    const durationMs = DURATION_SEC * 1000;
    const cases = CASE_KEYS.map((k) => L2_CASES[k]);
    process.stderr.write(`L2-C CLIENT_STRESS burst peak=${concurrency} duration=${DURATION_SEC}s\n`);
    const startedAt = Date.now();
    const samples = [];
    let seq = 0;
    const workers = Array.from({ length: concurrency }, async () => {
      while (Date.now() - startedAt < durationMs && !stopState.aborted) {
        const c = cases[seq % cases.length];
        const i = seq++;
        const mix = MIX[i % MIX.length].toUpperCase();
        const s = await fetchOnce({ method: c.method, path: c.path, body: c.body, nocache: mix === 'COLD' });
        const pw = detectPrettyWrong(c, s);
        const row = { i, caseId: c.id, mode: mix, ...s, prettyWrong: pw.prettyWrong, prettyWrongReason: pw.reason, at: new Date().toISOString() };
        samples.push(row);
        if (pw.prettyWrong) {
          stopState.pwEvents.push({ probe: 'burst', reason: pw.reason, caseId: c.id });
          if (ABORT_ON_PW) {
            stopState.aborted = true;
            stopState.reason = `pw>0 STOP · ${pw.reason}`;
            break;
          }
        }
      }
    });
    await Promise.all(workers);
    const wallClockMs = Date.now() - startedAt;
    probes.push({
      id: 'burst',
      label: 'CLIENT_STRESS peak burst 60s',
      kind: 'CLIENT_STRESS',
      note: 'Not injected dependency failure — client-side concurrency only',
      concurrency,
      durationSec: DURATION_SEC,
      agg: aggregateSamples(samples, { wallClockMs }),
      sampleCount: samples.length,
    });
  }

  // b) rapid-fire same Smith key (miss storm observation)
  if (want('miss-storm') && !stopState.aborted) {
    const c = L2_CASES.smith;
    const concurrency = STEPS.peak;
    const totalN = N;
    process.stderr.write(`L2-C CLIENT_STRESS miss-storm smith COLD n=${totalN} conc=${concurrency}\n`);
    const t0 = Date.now();
    const samples = await runPool({
      caseDef: c,
      mode: 'COLD',
      concurrency,
      totalN,
      stopState,
      onSample: (row, done, total) => {
        if (done % 5 === 0 || done === total) process.stderr.write(`  miss-storm ${done}/${total} ${row.wallMs}ms cached=${row.cached}\n`);
      },
    });
    probes.push({
      id: 'miss-storm',
      label: 'CLIENT_STRESS rapid-fire same Smith key (COLD/nocache)',
      kind: 'CLIENT_STRESS',
      note: 'Observe miss storm / wikiMeta under repeated COLD Smith POST — no server fault injection',
      concurrency,
      agg: aggregateSamples(samples, { wallClockMs: Date.now() - t0 }),
      sampleCount: samples.length,
    });
  }

  // c) Cohen GET under load (wiki tail)
  if (want('cohen-load') && !stopState.aborted) {
    const c = L2_CASES.cohen;
    const concurrency = STEPS.high;
    const totalN = N;
    process.stderr.write(`L2-C CLIENT_STRESS cohen-load conc=${concurrency} n=${totalN}\n`);
    const t0 = Date.now();
    const samples = await runPool({
      caseDef: c,
      mode: 'COLD',
      concurrency,
      totalN,
      stopState,
      onSample: (row, done, total) => {
        process.stderr.write(`  cohen ${done}/${total} ${row.wallMs}ms wiki=${row.timings?.wiki}\n`);
      },
    });
    probes.push({
      id: 'cohen-load',
      label: 'CLIENT_STRESS Cohen GET under High concurrency (wiki tail)',
      kind: 'CLIENT_STRESS',
      note: 'Client-observable wiki tail only — no dep disable',
      concurrency,
      agg: aggregateSamples(samples, { wallClockMs: Date.now() - t0 }),
      sampleCount: samples.length,
    });
  }

  // d) recovery: after burst, Med baseline recovers?
  if (want('recovery') && !stopState.aborted) {
    // mini-burst then med baseline
    process.stderr.write(`L2-C CLIENT_STRESS recovery: mini-burst then Med baseline\n`);
    const burstConc = STEPS.peak;
    const burstSec = Math.min(30, DURATION_SEC);
    const cases = CASE_KEYS.map((k) => L2_CASES[k]);
    const burstSamples = [];
    const b0 = Date.now();
    let seq = 0;
    await Promise.all(Array.from({ length: burstConc }, async () => {
      while (Date.now() - b0 < burstSec * 1000 && !stopState.aborted) {
        const c = cases[seq % cases.length];
        const i = seq++;
        const s = await fetchOnce({ method: c.method, path: c.path, body: c.body, nocache: false });
        const pw = detectPrettyWrong(c, s);
        burstSamples.push({ i, caseId: c.id, mode: 'WARM', ...s, prettyWrong: pw.prettyWrong });
        if (pw.prettyWrong && ABORT_ON_PW) {
          stopState.aborted = true;
          stopState.reason = `pw>0 STOP · ${pw.reason}`;
          break;
        }
      }
    }));
    // pause 5s
    await new Promise((r) => setTimeout(r, 5000));
    const medConc = STEPS.med;
    const recoverN = Math.max(5, Math.min(N, 20));
    const t1 = Date.now();
    const recoverSamples = await runPool({
      caseDef: L2_CASES.assaf,
      mode: 'WARM',
      concurrency: medConc,
      totalN: recoverN,
      stopState,
      onSample: (row, done, total) => {
        process.stderr.write(`  recover ${done}/${total} ${row.wallMs}ms ui=${row.uiState}\n`);
      },
    });
    const recoverAgg = aggregateSamples(recoverSamples, { wallClockMs: Date.now() - t1 });
    probes.push({
      id: 'recovery',
      label: 'CLIENT_STRESS post-burst Med baseline recovery (Assaf WARM)',
      kind: 'CLIENT_STRESS',
      note: 'After short peak burst + 5s pause, does Med Assaf WARM recover? Document only.',
      burst: {
        concurrency: burstConc,
        durationSec: burstSec,
        agg: aggregateSamples(burstSamples, { wallClockMs: Date.now() - b0 }),
      },
      pauseSec: 5,
      recover: {
        concurrency: medConc,
        caseId: L2_CASES.assaf.id,
        mix: 'WARM',
        agg: recoverAgg,
      },
      agg: recoverAgg,
      recoveredHint: recoverAgg.errorPct < 10 && (recoverAgg.wall?.p50 != null),
    });
  }

  return { probes, stop: stopState };
}

async function main() {
  const runId = randomUUID().slice(0, 8);
  const started = new Date().toISOString();
  const fp = loadFingerprint();
  process.stderr.write(`wp3-l2-harness v=${HARNESS_VERSION} mode=${MODE} base=${BASE} tag=${TAG} run=${runId} vercelCurl=${USE_VERCEL}\n`);

  let body = {};
  if (MODE === 'smoke') {
    body = await modeLoad({ smoke: true });
  } else if (MODE === 'load') {
    body = await modeLoad({ smoke: false });
  } else if (MODE === 'soak') {
    body = await modeSoak();
  } else if (MODE === 'failure') {
    body = await modeFailure();
  } else {
    console.error(`Unknown --mode ${MODE}; use smoke|load|soak|failure`);
    process.exit(2);
  }

  const payload = {
    schema: 'wp3-l2-metrics/v1',
    harness: { path: HARNESS_PATH, version: HARNESS_VERSION },
    mode: MODE === 'smoke' ? 'L2-A-smoke' : MODE === 'load' ? 'L2-A' : MODE === 'soak' ? 'L2-B' : 'L2-C',
    stream: MODE === 'smoke' || MODE === 'load' ? 'L2-A' : MODE === 'soak' ? 'L2-B' : 'L2-C',
    constraint: 'MEASURE ONLY — CLIENT_STRESS probes only — no Core / no dpl / no injected dep faults',
    runId,
    tag: TAG,
    started,
    finished: new Date().toISOString(),
    base: BASE,
    n: N,
    fingerprintRef: FINGERPRINT_REF,
    fingerprint: {
      alias: fp.alias || null,
      dpl: fp.dpl || null,
      frozenAt: fp.frozenAt || null,
      missing: !!fp.missing,
    },
    locks: {
      noCore: true,
      noAccChange: true,
      noSmithCohenChange: true,
      noCacheSemantics: true,
      noUx: true,
      noDpl: true,
      clientStressOnly: true,
    },
    stopRules: {
      abortOnPw: ABORT_ON_PW,
      note: 'pw>0 → abort immediately; report to Chief',
    },
    ...body,
  };

  const stem = `L2-${MODE.toUpperCase()}-${TAG}-${runId}`;
  const { jsonPath, mdPath } = writeArtifacts(payload, stem);
  const summary = {
    ok: !payload.stop?.aborted,
    aborted: !!payload.stop?.aborted,
    abortReason: payload.stop?.reason || null,
    jsonPath,
    mdPath,
    runId,
    mode: payload.mode,
    harnessVersion: HARNESS_VERSION,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (payload.stop?.aborted) process.exit(3);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
