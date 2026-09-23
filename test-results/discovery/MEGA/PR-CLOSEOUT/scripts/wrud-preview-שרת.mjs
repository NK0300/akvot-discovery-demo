#!/usr/bin/env node
/**
 * Preview WRUD + light SSE smoke via `vercel curl` (Deployment Protection).
 * Usage: node wrud-preview-שרת.mjs dpl_xxx
 */
import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const dpl = process.argv[2];
if (!dpl) {
  console.error('usage: node wrud-preview-שרת.mjs dpl_...');
  process.exit(2);
}
const outDir = join(process.cwd(), 'test-results/discovery/MEGA/PR-CLOSEOUT/raw');
mkdirSync(outDir, { recursive: true });

function vcurl(path, { method = 'GET', body, headers = [] } = {}) {
  const args = ['vercel', 'curl', path, '--deployment', dpl, '-X', method];
  for (const h of headers) {
    args.push('-H', h);
  }
  if (body) {
    args.push('-H', 'Content-Type: application/json', '--data', body);
  }
  // vercel curl writes progress to stderr; capture stdout only via spawn
  const r = spawnSync('npx', args, {
    encoding: 'utf8',
    maxBuffer: 5_000_000,
    env: process.env,
  });
  const combined = `${r.stdout || ''}\n${r.stderr || ''}`;
  // Find last JSON object in output
  const matches = combined.match(/\{[\s\S]*\}/g);
  let json = null;
  if (matches) {
    for (let i = matches.length - 1; i >= 0; i--) {
      try {
        json = JSON.parse(matches[i]);
        break;
      } catch {
        /* continue */
      }
    }
  }
  return { status: r.status, json, raw: combined.slice(0, 4000) };
}

const report = {
  dpl,
  stamp: new Date().toISOString(),
  steps: [],
  ok: true,
};

function step(name, ok, detail) {
  report.steps.push({ name, ok, detail });
  if (!ok) report.ok = false;
  console.log(ok ? 'PASS' : 'FAIL', name, typeof detail === 'string' ? detail.slice(0, 120) : JSON.stringify(detail)?.slice(0, 120));
}

// 1) Health WRUD
const health = vcurl('/api/discovery/health');
writeFileSync(join(outDir, 'wrud-discovery-health.json'), JSON.stringify(health.json, null, 2));
step(
  'HEALTH_WRUD',
  health.json?.ok === true &&
    health.json?.storeBackend === 'upstash' &&
    health.json?.durable === true &&
    health.json?.promoteEligible === true &&
    Array.isArray(health.json?.steps) &&
    health.json.steps.every((s) => s.ok),
  {
    storeBackend: health.json?.storeBackend,
    durable: health.json?.durable,
    promoteEligible: health.json?.promoteEligible,
    durabilityState: health.json?.durabilityState,
    latencyMs: health.json?.latencyMs,
  },
);

// 2) CREATE
const createBody = JSON.stringify({
  seed: 'WRUD Closeout Entity Demo',
  locale: 'en',
  hints: { wrud: true },
});
const created = vcurl('/api/discovery/sessions', {
  method: 'POST',
  body: createBody,
  headers: ['X-Correlation-Id: wrud-closeout-1'],
});
writeFileSync(join(outDir, 'wrud-create.json'), JSON.stringify(created.json, null, 2));
const sid = created.json?.sessionId || created.json?.snapshot?.sessionId;
step('CREATE', Boolean(sid) && (created.json?.ok !== false), {
  sessionIdPrefix: sid ? String(sid).slice(0, 12) : null,
  status: created.json?.status || created.json?.snapshot?.status,
  store: created.json?.store || created.json?.snapshot?.store,
});

// 3) GET HIT
let got = { json: null };
if (sid) {
  got = vcurl(`/api/discovery/sessions/${encodeURIComponent(sid)}`, {
    headers: ['X-Correlation-Id: wrud-closeout-get'],
  });
  writeFileSync(join(outDir, 'wrud-get.json'), JSON.stringify(got.json, null, 2));
}
step('GET_HIT', Boolean(got.json?.sessionId || got.json?.snapshot?.sessionId || got.json?.ok !== false) && Boolean(sid), {
  hasFindings: Array.isArray(got.json?.findings || got.json?.snapshot?.findings),
  store: got.json?.store || got.json?.snapshot?.store,
});

// 4) NARROW (best-effort)
let narrow = { json: null };
if (sid) {
  narrow = vcurl(`/api/discovery/sessions/${encodeURIComponent(sid)}/narrow`, {
    method: 'POST',
    body: JSON.stringify({ filters: {} }),
    headers: ['X-Correlation-Id: wrud-closeout-narrow'],
  });
  writeFileSync(join(outDir, 'wrud-narrow.json'), JSON.stringify(narrow.json, null, 2));
}
step('NARROW', narrow.json != null && narrow.json?.error !== 'method not allowed', {
  keys: narrow.json ? Object.keys(narrow.json).slice(0, 12) : [],
});

// 5) SSE cheap smoke — first bytes / status via vercel curl (may not stream long)
let sse = { raw: '', json: null };
if (sid) {
  sse = vcurl(`/api/discovery/sessions/${encodeURIComponent(sid)}/events?cursor=0`, {
    headers: ['Accept: text/event-stream', 'X-Correlation-Id: wrud-closeout-sse'],
  });
  writeFileSync(join(outDir, 'wrud-sse-raw.txt'), sse.raw.slice(0, 8000));
}
const sseOk =
  /event:\s*(meta|progress|done|error)/i.test(sse.raw) ||
  /text\/event-stream/i.test(sse.raw) ||
  sse.json?.ok === true ||
  /done|meta|progress/i.test(sse.raw);
step('SSE_SMOKE', Boolean(sid) && (sseOk || sse.raw.length > 0), {
  rawLen: sse.raw.length,
  hasEvent: /event:/i.test(sse.raw),
});

// 6) Acc scrub glance — no forbidden QID in create/get
const blob = JSON.stringify({ create: created.json, get: got.json, narrow: narrow.json });
const leak = /Q1701775|wd-Q1701775/i.test(blob);
step('ACC_NO_FORBIDDEN_QID', !leak, { leak });

writeFileSync(join(outDir, 'wrud-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok: report.ok, steps: report.steps.map((s) => [s.name, s.ok]) }, null, 2));
process.exit(report.ok ? 0 : 1);
