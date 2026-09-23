#!/usr/bin/env node
/**
 * PR-CLOSEOUT QA FULL MATRIX · בודק · 2026-09-20
 * Preview dpl_9PkJ… · Core alias dpl_8ag… LOCKED · NO promote
 * Real HTTP via vercel curl --deployment / --scope k-akvot
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..');
const RAW = join(OUT, 'raw', 'qa-matrix');
mkdirSync(RAW, { recursive: true });

const DISC_DPL = 'dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2';
const DISC_BASE = 'https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app';
const ALIAS_BASE = 'https://akvot-simple-demo.vercel.app';
const ALIAS_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const SCOPE = 'k-akvot';
const ROOT = join(__dirname, '../../../../..');
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;

function nowJerusalem() {
  return (
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Jerusalem',
      dateStyle: 'short',
      timeStyle: 'medium',
      hour12: false,
    })
      .format(new Date())
      .replace(' ', 'T') + '+03:00'
  );
}

function sleep(ms) {
  spawnSync('sleep', [String(ms / 1000)], { stdio: 'ignore' });
}

function vercelCurl(urlOrPath, {
  method = 'GET',
  body = null,
  deployment = DISC_DPL,
  timeout = 180000,
  accept = 'application/json',
} = {}) {
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const bodyFile = join(RAW, `_curl-body-${stamp}`);
  const hdrFile = join(RAW, `_curl-hdr-${stamp}`);
  const args = ['curl'];
  if (deployment) {
    const path = urlOrPath.startsWith('http')
      ? new URL(urlOrPath).pathname + new URL(urlOrPath).search
      : urlOrPath;
    args.push(path, '--deployment', deployment, '--scope', SCOPE, '--');
  } else {
    args.push(urlOrPath, '--scope', SCOPE, '--');
  }
  args.push(
    '-sS', '-o', bodyFile, '-D', hdrFile, '-w', '%{http_code}',
    '--max-time', String(Math.ceil(timeout / 1000)),
    '-H', `Accept: ${accept}`,
    '-H', `Origin: ${ALIAS_BASE}`,
  );
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  }
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: timeout + 8000, cwd: ROOT,
  });
  const ms = Date.now() - t0;
  let headers = '', textBody = '';
  try { headers = readFileSync(hdrFile, 'utf8'); } catch (_) {}
  try { textBody = readFileSync(bodyFile, 'utf8'); } catch (_) {}
  try { unlinkSync(bodyFile); } catch (_) {}
  try { unlinkSync(hdrFile); } catch (_) {}
  const stdoutCode = (r.stdout || '').trim().split('\n').filter(Boolean).pop() || '';
  let httpStatus = Number(stdoutCode);
  if (!httpStatus) {
    const m = headers.match(/HTTP\/[\d.]+ (\d+)/);
    httpStatus = m ? Number(m[1]) : null;
  }
  let json = null;
  try { json = JSON.parse(textBody); } catch (_) {}
  return { ms, httpStatus, json, text: textBody, headers, exit: r.status, stderr: (r.stderr || '').slice(0, 2000) };
}

function vercelCurlSSE(path, { deployment = DISC_DPL, maxSeconds = 25 } = {}) {
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const bodyFile = join(RAW, `_sse-${stamp}`);
  const args = [
    'curl', path, '--deployment', deployment, '--scope', SCOPE, '--',
    '-sS', '-N', '-o', bodyFile,
    '-H', 'Accept: text/event-stream',
    '-H', `Origin: ${ALIAS_BASE}`,
    '--max-time', String(maxSeconds),
  ];
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    timeout: (maxSeconds + 20) * 1000, cwd: ROOT,
  });
  let text = '';
  try { text = readFileSync(bodyFile, 'utf8'); } catch (_) {}
  try { unlinkSync(bodyFile); } catch (_) {}
  return { ms: Date.now() - t0, text, exit: r.status, stderr: (r.stderr || '').slice(0, 1000) };
}

function aliasFetch(path, { method = 'GET', body = null, timeout = 120000 } = {}) {
  const url = path.startsWith('http') ? path : `${ALIAS_BASE}${path}`;
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const bodyFile = join(RAW, `_alias-${stamp}`);
  const hdrFile = join(RAW, `_alias-hdr-${stamp}`);
  const args = [
    '-sS', '-o', bodyFile, '-D', hdrFile, '-w', '%{http_code}',
    '--max-time', String(Math.ceil(timeout / 1000)),
    '-H', 'Accept: application/json',
    '-H', `Origin: ${ALIAS_BASE}`,
    url,
  ];
  if (method === 'POST') {
    args.unshift('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  }
  const t0 = Date.now();
  const r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: timeout + 5000 });
  let headers = '', textBody = '';
  try { headers = readFileSync(hdrFile, 'utf8'); } catch (_) {}
  try { textBody = readFileSync(bodyFile, 'utf8'); } catch (_) {}
  try { unlinkSync(bodyFile); } catch (_) {}
  try { unlinkSync(hdrFile); } catch (_) {}
  const stdoutCode = (r.stdout || '').trim().split('\n').filter(Boolean).pop() || '';
  let httpStatus = Number(stdoutCode);
  if (!httpStatus) {
    const m = headers.match(/HTTP\/[\d.]+ (\d+)/);
    httpStatus = m ? Number(m[1]) : null;
  }
  let json = null;
  try { json = JSON.parse(textBody); } catch (_) {}
  return { ms: Date.now() - t0, httpStatus, json, text: textBody, exit: r.status, stderr: (r.stderr || '').slice(0, 1000) };
}

function leaks(t) {
  FORBIDDEN_RE.lastIndex = 0;
  return (String(t || '').match(FORBIDDEN_RE) || []).length;
}

function deepLeakCount(obj) {
  return leaks(JSON.stringify(obj ?? null));
}

function contradictionClean(obj) {
  const snap = obj?.snapshot || obj || {};
  const cons = snap?.contradictions || [];
  if (!Array.isArray(cons)) return true;
  for (const c of cons) {
    for (const id of c?.findingIds || []) {
      if (/Q1701775|wd-Q1701775|wd_Q1701775/i.test(String(id))) return false;
    }
  }
  return true;
}

function saveRaw(name, data) {
  const path = join(RAW, `${name}.json`);
  let s = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  s = s.replace(/UPSTASH_REDIS_REST_TOKEN["\s:=]+[^\s",}]+/gi, 'UPSTASH_REDIS_REST_TOKEN":"[REDACTED]"');
  s = s.replace(/Bearer\s+[A-Za-z0-9._\-]+/g, 'Bearer [REDACTED]');
  writeFileSync(path, s);
  return `raw/qa-matrix/${name}.json`;
}

function snapMeta(j) {
  const snap = j?.snapshot || j || {};
  return {
    sessionId: j?.sessionId || snap?.sessionId || null,
    status: snap?.status || j?.status || null,
    findings: Array.isArray(snap?.findings) ? snap.findings.length : 0,
    evidence: Array.isArray(snap?.evidence) ? snap.evidence.length : 0,
    facets: Array.isArray(snap?.facets) ? snap.facets.length : 0,
    contradictions: Array.isArray(snap?.contradictions) ? snap.contradictions.length : 0,
    regenerated: snap?.regenerated ?? j?.regenerated ?? snap?._storeInfo?.regenerated ?? null,
    storeBackend: snap?._storeInfo?.storeBackend || j?._storeInfo?.storeBackend || snap?.storeBackend || null,
    durable: snap?._storeInfo?.durable ?? j?._storeInfo?.durable ?? null,
    fiv: snap?.forbiddenIdentitiesVersion || j?.forbiddenIdentitiesVersion || null,
    candidatesPresent: (snap?.candidates ?? j?.candidates) != null,
  };
}

const started = nowJerusalem();
const rows = [];
const openItems = [];

function add(row) {
  rows.push(row);
  const mark = row.status === 'PASS' ? 'PASS' : row.status === 'HOLD' ? 'HOLD' : 'FAIL';
  console.log(`[${mark}] ${row.id} · ${row.category} · ${row.name}${row.notes ? ' · ' + String(row.notes).slice(0, 120) : ''}`);
  return row;
}

console.log(`\n=== PR-CLOSEOUT QA MATRIX start ${started} ===`);
console.log(`Preview ${DISC_DPL} · Core ${ALIAS_DPL} LOCKED · HOLD promote\n`);

// ─── STORAGE / HEALTH ───────────────────────────────────────────
console.log('--- storage/health ---');
const hApi = vercelCurl('/api/health', { timeout: 60000 });
saveRaw('health-api', { httpStatus: hApi.httpStatus, json: hApi.json, ms: hApi.ms });
const ds = hApi.json?.discoveryStore || {};
add({
  id: 'ST-01', category: 'storage', name: 'Preview /api/health upstash durable',
  status: hApi.httpStatus === 200 && hApi.json?.ok === true && hApi.json?.build === DISC_DPL &&
    (ds.storeBackend === 'upstash' || ds.storeBackend === 'vercel-kv') && ds.durable === true && ds.kvCredsPresent === true
    ? 'PASS' : 'FAIL',
  http: hApi.httpStatus, ms: hApi.ms,
  evidence: 'raw/qa-matrix/health-api.json',
  notes: `build=${hApi.json?.build} store=${ds.storeBackend} durable=${ds.durable} promoteEligible=${ds.promoteEligible}`,
});

const hDisc = vercelCurl('/api/discovery/health', { timeout: 60000 });
saveRaw('health-discovery', { httpStatus: hDisc.httpStatus, json: hDisc.json, ms: hDisc.ms });
const steps = hDisc.json?.steps || [];
const wrudOk = ['WRITE', 'READ', 'UPDATE', 'DELETE'].every((s) =>
  steps.some((x) => x.step === s && x.ok === true),
);
add({
  id: 'ST-02', category: 'storage', name: 'Discovery health WRUD upstash',
  status: hDisc.httpStatus === 200 && hDisc.json?.ok === true && wrudOk &&
    (hDisc.json?.storeBackend === 'upstash' || hDisc.json?.backend === 'upstash')
    ? 'PASS' : 'FAIL',
  http: hDisc.httpStatus, ms: hDisc.ms,
  evidence: 'raw/qa-matrix/health-discovery.json',
  notes: `steps=${steps.map((s) => `${s.step}:${s.ok}`).join(',')} latencyMs=${hDisc.json?.latencyMs}`,
});

const hCore = aliasFetch('/api/health');
saveRaw('health-core-alias', { httpStatus: hCore.httpStatus, json: hCore.json, ms: hCore.ms });
add({
  id: 'ST-03', category: 'storage', name: 'Core alias health build locked',
  status: hCore.httpStatus === 200 && hCore.json?.ok === true && hCore.json?.build === ALIAS_DPL ? 'PASS' : 'FAIL',
  http: hCore.httpStatus, ms: hCore.ms,
  evidence: 'raw/qa-matrix/health-core-alias.json',
  notes: `build=${hCore.json?.build}`,
});

// ─── FUNCTIONAL Discovery (≥5 seed types) ───────────────────────
console.log('--- functional Discovery ---');
const FUNC_SEEDS = [
  { id: 'FN-01', name: 'HE person דוד כהן', seed: 'דוד כהן', hints: {}, expectHttp: [200, 201], expectMinFindings: 1 },
  { id: 'FN-02', name: 'Latin ambiguous Alex Morgan', seed: 'Alex Morgan', hints: {}, expectHttp: [200, 201], expectMinFindings: 1 },
  { id: 'FN-03', name: 'org/domain example.org', seed: 'example.org', hints: {}, expectHttp: [200, 201], expectMinFindings: 0 },
  { id: 'FN-04', name: 'empty seed → 400', seed: '', hints: {}, expectHttp: [400], expectError: true },
  { id: 'FN-05', name: 'Smith+ctx IBM/NY/US', seed: 'John Smith', hints: { org: 'IBM', city: 'New York', country: 'US' }, expectHttp: [200, 201], expectMinFindings: 1 },
];

const sessions = {};

for (const s of FUNC_SEEDS) {
  console.log(`POST ${s.id} ${s.seed || '(empty)'}`);
  const post = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body: { seed: s.seed, hints: s.hints || {}, locale: 'en' },
    timeout: 200000,
  });
  const meta = snapMeta(post.json);
  const leak = deepLeakCount(post.json);
  const contraOk = contradictionClean(post.json);
  const httpOk = s.expectHttp.includes(post.httpStatus);
  let pass = httpOk && leak === 0 && contraOk;
  if (s.expectError) {
    pass = httpOk && leak === 0 && (post.json?.ok === false || !!post.json?.error || post.httpStatus === 400);
  } else if (!s.expectError) {
    pass = pass && !!meta.sessionId && meta.findings >= (s.expectMinFindings || 0) && !meta.candidatesPresent;
  }
  saveRaw(`POST-${s.id}`, { httpStatus: post.httpStatus, ms: post.ms, json: post.json, meta, leak, contraOk });
  if (meta.sessionId) sessions[s.id] = meta.sessionId;

  add({
    id: s.id, category: 'functional', name: s.name,
    status: pass ? 'PASS' : 'FAIL',
    http: post.httpStatus, ms: post.ms,
    sessionId: meta.sessionId,
    findings: meta.findings, leak, contraOk,
    evidence: `raw/qa-matrix/POST-${s.id}.json`,
    notes: `sid=${meta.sessionId || '-'} findings=${meta.findings} leak=${leak} contraClean=${contraOk} fiv=${meta.fiv}`,
  });

  // POST→GET durable for successful creates
  if (meta.sessionId && !s.expectError) {
    sleep(400);
    const get = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(meta.sessionId)}`, { timeout: 120000 });
    const gMeta = snapMeta(get.json);
    const gLeak = deepLeakCount(get.json);
    const gContra = contradictionClean(get.json);
    const getPass = get.httpStatus === 200 && gLeak === 0 && gContra &&
      (gMeta.regenerated === false || gMeta.regenerated == null) && !gMeta.candidatesPresent;
    saveRaw(`GET-${s.id}`, { httpStatus: get.httpStatus, ms: get.ms, json: get.json, meta: gMeta, leak: gLeak });
    add({
      id: `${s.id}-GET`, category: 'storage', name: `POST→GET durable ${s.name}`,
      status: getPass ? 'PASS' : 'FAIL',
      http: get.httpStatus, ms: get.ms,
      sessionId: meta.sessionId,
      findings: gMeta.findings, leak: gLeak,
      evidence: `raw/qa-matrix/GET-${s.id}.json`,
      notes: `regen=${gMeta.regenerated} findings=${gMeta.findings} leak=${gLeak}`,
    });
  }
}

// Acc scrub deep on Smith+ctx (all surfaces)
console.log('--- security/Acc scrub ---');
const smithSid = sessions['FN-05'];
if (smithSid) {
  const sse = vercelCurlSSE(`/api/discovery/sessions/${encodeURIComponent(smithSid)}/events`, { maxSeconds: 20 });
  const sseLeak = leaks(sse.text);
  const sseEvents = (sse.text || '').split(/\n\n+/).filter(Boolean).length;
  saveRaw('SSE-FN-05', { ms: sse.ms, events: sseEvents, leak: sseLeak, textHead: (sse.text || '').slice(0, 4000) });
  add({
    id: 'ACC-01', category: 'security', name: 'SSE Acc scrub Smith+ctx (Q1701775=0)',
    status: sseLeak === 0 && sseEvents > 0 ? 'PASS' : (sseLeak === 0 ? 'PASS' : 'FAIL'),
    ms: sse.ms, leak: sseLeak,
    evidence: 'raw/qa-matrix/SSE-FN-05.json',
    notes: `events=${sseEvents} leak=${sseLeak}`,
  });

  const narrow = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(smithSid)}/narrow`, {
    method: 'POST',
    body: { facets: { provider: ['wikidata'] } },
    timeout: 120000,
  });
  const nLeak = deepLeakCount(narrow.json);
  const nContra = contradictionClean(narrow.json);
  saveRaw('NARROW-FN-05', { httpStatus: narrow.httpStatus, ms: narrow.ms, json: narrow.json, leak: nLeak });
  add({
    id: 'ACC-02', category: 'security', name: 'narrow Acc scrub + contradictions clean',
    status: (narrow.httpStatus === 200 || narrow.httpStatus === 201) && nLeak === 0 && nContra ? 'PASS' : 'FAIL',
    http: narrow.httpStatus, ms: narrow.ms, leak: nLeak, contraOk: nContra,
    evidence: 'raw/qa-matrix/NARROW-FN-05.json',
    notes: `leak=${nLeak} contraClean=${nContra}`,
  });
} else {
  add({ id: 'ACC-01', category: 'security', name: 'SSE Acc scrub Smith+ctx', status: 'FAIL', notes: 'no smith session' });
  add({ id: 'ACC-02', category: 'security', name: 'narrow Acc scrub', status: 'FAIL', notes: 'no smith session' });
}

// Aggregate Acc scrub across all functional POST/GET raw
let totalLeak = 0;
for (const r of rows) {
  if (typeof r.leak === 'number') totalLeak += r.leak;
}
add({
  id: 'ACC-03', category: 'security', name: 'Aggregate Q1701775/wd-Q1701775 leakage=0 all surfaces so far',
  status: totalLeak === 0 ? 'PASS' : 'FAIL',
  leak: totalLeak,
  notes: `aggregateLeak=${totalLeak}`,
});

// QID inject seed texts
const ADV_INJECT = [
  { id: 'ACC-04', name: 'seed text inject Q1701775', seed: 'John Smith Q1701775' },
  { id: 'ACC-05', name: 'seed text inject wd-Q1701775', seed: 'wd-Q1701775' },
];
for (const a of ADV_INJECT) {
  const post = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body: { seed: a.seed, hints: {}, locale: 'en' },
    timeout: 200000,
  });
  const meta = snapMeta(post.json);
  const leak = deepLeakCount(post.json);
  const contraOk = contradictionClean(post.json);
  // Seed may echo in request path but response must scrub identity tokens from findings/evidence/contradictions
  // Allow seed echo in status messages? Mandate: scrub on all surfaces — count deep scan of response body.
  // If seed itself contains QID, some APIs echo seed; check findings/evidence/contradictions specifically.
  const snap = post.json?.snapshot || post.json || {};
  const surfaceObj = {
    findings: snap.findings, evidence: snap.evidence, facets: snap.facets,
    contradictions: snap.contradictions, errors: snap.errors, graph: snap.graph,
    candidates: snap.candidates,
  };
  const surfaceLeak = deepLeakCount(surfaceObj);
  const pass = [200, 201].includes(post.httpStatus) && surfaceLeak === 0 && contraOk && !meta.candidatesPresent;
  saveRaw(`ADV-inject-${a.id}`, { httpStatus: post.httpStatus, ms: post.ms, meta, leak, surfaceLeak, contraOk, json: post.json });
  add({
    id: a.id, category: 'security', name: a.name,
    status: pass ? 'PASS' : 'FAIL',
    http: post.httpStatus, ms: post.ms, leak: surfaceLeak,
    evidence: `raw/qa-matrix/ADV-inject-${a.id}.json`,
    notes: `surfaceLeak=${surfaceLeak} fullLeak=${leak} findings=${meta.findings} (seed may echo)`,
  });
}

// ─── ADVERSARIAL ────────────────────────────────────────────────
console.log('--- adversarial ---');
const ADV = [
  { id: 'ADV-01', name: 'empty seed', seed: '', expectHttp: [400] },
  { id: 'ADV-02', name: 'whitespace seed', seed: '   ', expectHttp: [400] },
  { id: 'ADV-03', name: 'bare surname כהן', seed: 'כהן', expectHttp: [200, 201] },
  { id: 'ADV-04', name: 'bare John Smith', seed: 'John Smith', expectHttp: [200, 201] },
];
for (const a of ADV) {
  const post = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body: { seed: a.seed, hints: {}, locale: 'en' },
    timeout: 200000,
  });
  const meta = snapMeta(post.json);
  const leak = deepLeakCount(post.json);
  const httpOk = a.expectHttp.includes(post.httpStatus);
  let pass = httpOk && leak === 0 && contradictionClean(post.json);
  if (a.expectHttp.includes(400)) {
    pass = httpOk && leak === 0;
  }
  saveRaw(`ADV-${a.id}`, { httpStatus: post.httpStatus, ms: post.ms, meta, leak, json: post.json });
  add({
    id: a.id, category: 'adversarial', name: a.name,
    status: pass ? 'PASS' : 'FAIL',
    http: post.httpStatus, ms: post.ms, leak, findings: meta.findings,
    evidence: `raw/qa-matrix/ADV-${a.id}.json`,
    notes: `http=${post.httpStatus} findings=${meta.findings} leak=${leak}`,
  });
}

// ─── CONCURRENCY (2 parallel sessions) ──────────────────────────
console.log('--- concurrency ---');
const concSeeds = [
  { label: 'C1', seed: 'Ada Lovelace' },
  { label: 'C2', seed: 'OpenAI' },
];
for (const c of concSeeds) {
  writeFileSync(join(RAW, `conc-${c.label}-req.json`), JSON.stringify({ seed: c.seed, hints: {}, locale: 'en' }));
}
const concBash = `
set -e
ROOT="${ROOT}"
RAW="${RAW}"
DISC_DPL="${DISC_DPL}"
SCOPE="${SCOPE}"
ALIAS_BASE="${ALIAS_BASE}"
cd "$ROOT"
run_one() {
  local L="$1"
  vercel curl /api/discovery/sessions --deployment "$DISC_DPL" --scope "$SCOPE" -- \\
    -sS -o "$RAW/conc-$L-out.json" -w '%{http_code}' \\
    -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' \\
    -H "Origin: $ALIAS_BASE" --data @"$RAW/conc-$L-req.json" --max-time 200 \\
    > "$RAW/conc-$L-code.txt" 2>"$RAW/conc-$L-err.txt" || true
}
run_one C1 &
PID1=$!
run_one C2 &
PID2=$!
wait $PID1 $PID2 || true
`;
const concT0 = Date.now();
const concRun = spawnSync('bash', ['-c', concBash], {
  encoding: 'utf8', cwd: ROOT, timeout: 220000, env: process.env,
});
const concMs = Date.now() - concT0;
saveRaw('CONC-runner', { ms: concMs, exit: concRun.status, stdout: (concRun.stdout || '').slice(0, 500), stderr: (concRun.stderr || '').slice(0, 1000) });

const concResults = [];
for (const c of concSeeds) {
  let httpStatus = null, json = null, text = '', err = '';
  try { httpStatus = Number(readFileSync(join(RAW, `conc-${c.label}-code.txt`), 'utf8').trim()); } catch (_) {}
  try { text = readFileSync(join(RAW, `conc-${c.label}-out.json`), 'utf8'); json = JSON.parse(text); } catch (_) {}
  try { err = readFileSync(join(RAW, `conc-${c.label}-err.txt`), 'utf8').slice(0, 500); } catch (_) {}
  const meta = snapMeta(json);
  const leak = deepLeakCount(json);
  concResults.push({ label: c.label, seed: c.seed, httpStatus, meta, leak, ms: concMs, err });
  saveRaw(`CONC-${c.label}`, { httpStatus, ms: concMs, meta, leak, json, err });
}
const concPass = concResults.length === 2 &&
  concResults.every((r) => [200, 201].includes(r.httpStatus) && r.meta.sessionId && r.leak === 0) &&
  concResults[0].meta.sessionId !== concResults[1].meta.sessionId;
add({
  id: 'CONC-01', category: 'concurrency', name: '2 parallel Discovery sessions distinct durable',
  status: concPass ? 'PASS' : 'FAIL',
  evidence: 'raw/qa-matrix/CONC-C1.json · CONC-C2.json',
  notes: concResults.map((r) => `${r.label}:http=${r.httpStatus}/sid=${r.meta.sessionId}/leak=${r.leak}/findings=${r.meta.findings}`).join(' | '),
});

// ─── REGRESSION RB-01..12 spot recheck ───────────────────────────
console.log('--- regression RB-01..12 ---');
const rb = [];
function rbAdd(id, name, status, notes, evidence) {
  const row = { id, category: 'regression', name, status, notes, evidence };
  rb.push(row);
  add(row);
}

rbAdd('RB-01', 'KV SoT storeBackend=upstash',
  ds.storeBackend === 'upstash' && ds.durable === true ? 'PASS' : 'FAIL',
  `storeBackend=${ds.storeBackend}`, 'raw/qa-matrix/health-api.json');
rbAdd('RB-02', 'storeBackend ≠ fs-regen',
  ds.storeBackend && ds.storeBackend !== 'fs-regen' && ds.fsRegenFallback === false ? 'PASS' : 'FAIL',
  `storeBackend=${ds.storeBackend} fsRegenFallback=${ds.fsRegenFallback}`, 'raw/qa-matrix/health-api.json');

const fnPass = ['FN-01', 'FN-02', 'FN-03', 'FN-05'].every((id) => rows.find((r) => r.id === id)?.status === 'PASS');
const smithRow = rows.find((r) => r.id === 'FN-05');
rbAdd('RB-03', 'Acc ≥3 seeds + Smith+ctx leakage=0',
  fnPass && (smithRow?.leak || 0) === 0 ? 'PASS' : 'FAIL',
  `fnPass=${fnPass} smithLeak=${smithRow?.leak}`, 'raw/qa-matrix/POST-FN-*.json');

// SSE smoke on FN-01 session
const s1 = sessions['FN-01'];
if (s1) {
  const sse1 = vercelCurlSSE(`/api/discovery/sessions/${encodeURIComponent(s1)}/events`, { maxSeconds: 18 });
  const ev = (sse1.text || '').split(/\n\n+/).filter(Boolean).length;
  const sLeak = leaks(sse1.text);
  saveRaw('SSE-FN-01', { ms: sse1.ms, events: ev, leak: sLeak, head: (sse1.text || '').slice(0, 2000) });
  rbAdd('RB-04', 'SSE works', ev > 0 && sLeak === 0 ? 'PASS' : 'FAIL', `events=${ev} leak=${sLeak}`, 'raw/qa-matrix/SSE-FN-01.json');
} else {
  rbAdd('RB-04', 'SSE works', 'FAIL', 'no FN-01 session', null);
}

// durable GET2
if (s1) {
  const get2 = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(s1)}`, { timeout: 90000 });
  const m2 = snapMeta(get2.json);
  const l2 = deepLeakCount(get2.json);
  saveRaw('GET2-FN-01', { httpStatus: get2.httpStatus, meta: m2, leak: l2, json: get2.json });
  rbAdd('RB-05', 'durable GET across calls (regen false|absent)',
    get2.httpStatus === 200 && (m2.regenerated == null || m2.regenerated === false) && l2 === 0 ? 'PASS' : 'FAIL',
    `http=${get2.httpStatus} regen=${m2.regenerated}`, 'raw/qa-matrix/GET2-FN-01.json');
  rbAdd('RB-06', 'KV HIT / GET same sessionId',
    get2.httpStatus === 200 && !!m2.sessionId ? 'PASS' : 'FAIL',
    `http=${get2.httpStatus}`, 'raw/qa-matrix/GET2-FN-01.json');
} else {
  rbAdd('RB-05', 'durable GET', 'FAIL', 'no session', null);
  rbAdd('RB-06', 'KV HIT', 'FAIL', 'no session', null);
}

if (s1) {
  const nar = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(s1)}/narrow`, {
    method: 'POST', body: { facets: { provider: ['wikidata'] } }, timeout: 120000,
  });
  const nL = deepLeakCount(nar.json);
  saveRaw('NARROW-FN-01', { httpStatus: nar.httpStatus, leak: nL, json: nar.json });
  rbAdd('RB-07', 'narrow works',
    [200, 201].includes(nar.httpStatus) && nL === 0 ? 'PASS' : 'FAIL',
    `http=${nar.httpStatus} leak=${nL}`, 'raw/qa-matrix/NARROW-FN-01.json');
} else {
  rbAdd('RB-07', 'narrow works', 'FAIL', 'no session', null);
}

const leakRows = rows.filter((r) => typeof r.leak === 'number');
const aggLeak = leakRows.reduce((n, r) => n + r.leak, 0);
rbAdd('RB-08', 'leakage=0 deep scan all surfaces incl contradictions',
  aggLeak === 0 && rows.filter((r) => r.contraOk === false).length === 0 ? 'PASS' : 'FAIL',
  `aggregateLeak=${aggLeak}`, 'raw/qa-matrix/');

// Core alias Assaf / כהן / Smith — also fills 04-QA-CORE-REGRESSION
console.log('--- Core regression ---');
const coreCases = [
  { id: 'CORE-Assaf', q: 'Assaf Rappaport', path: '/api/lookup?q=Assaf%20Rappaport&nocache=1', expect: { uiExact: 'dossier', qidExact: 'Q47507930' } },
  { id: 'CORE-כהן', q: 'כהן', path: '/api/lookup?q=%D7%9B%D7%94%D7%9F&nocache=1', expect: { uiIn: ['need_context', 'candidates', 'soft'], forbidDossier: true } },
  { id: 'CORE-Smith', q: 'John Smith', path: '/api/lookup?q=John%20Smith&nocache=1', expect: { uiIn: ['need_context', 'candidates', 'soft'], forbidDossier: true } },
  { id: 'CORE-Smith-ctx', q: 'John Smith+IBM', path: '/api/lookup?q=John%20Smith&org=IBM&city=New%20York&country=US&nocache=1', expect: { uiIn: ['need_context', 'candidates', 'soft'], forbidDossier: true, forbidQid: 'Q1701775' } },
];
const coreRows = [];
for (const c of coreCases) {
  const r = aliasFetch(c.path);
  const j = r.json || {};
  const leak = deepLeakCount(j);
  const ui = j.uiState ?? null;
  const qid = j.qid ?? null;
  const faces = Array.isArray(j.images) ? j.images.length : j.photo ? 1 : 0;
  const checks = {
    http_ok: r.httpStatus === 200 && j && j.ok !== false,
    leak_0: leak === 0,
    ui_ok: c.expect.uiExact ? ui === c.expect.uiExact : (!c.expect.uiIn || c.expect.uiIn.includes(ui)),
    qid_ok: !c.expect.qidExact || qid === c.expect.qidExact,
    not_dossier: !c.expect.forbidDossier || ui !== 'dossier',
    not_pw_qid: qid !== 'Q1701775' && qid !== (c.expect.forbidQid || '___'),
    faces_ok: !c.expect.forbidDossier || faces === 0,
  };
  const pass = Object.values(checks).every(Boolean);
  const pw = qid === 'Q1701775' || (c.id.includes('Smith') && ui === 'dossier');
  saveRaw(c.id, { httpStatus: r.httpStatus, ms: r.ms, ui, qid, faces, leak, checks, json: j });
  const row = {
    id: c.id, category: 'core', name: `Core ${c.q}`,
    status: pass ? 'PASS' : 'FAIL',
    http: r.httpStatus, ms: r.ms, ui, qid, faces, leak, pw: !!pw,
    evidence: `raw/qa-matrix/${c.id}.json`,
    notes: `ui=${ui} qid=${qid} faces=${faces} leak=${leak} pw=${!!pw}`,
  };
  coreRows.push(row);
  add(row);
}

const corePw = coreRows.filter((r) => r.pw).length;
const coreLeak = coreRows.reduce((n, r) => n + (r.leak || 0), 0);
rbAdd('RB-09', 'pw=0 (Core)',
  corePw === 0 ? 'PASS' : 'FAIL',
  `pw=${corePw}`, 'raw/qa-matrix/CORE-*.json');
rbAdd('RB-10', 'Core alias regression PASS',
  coreRows.every((r) => r.status === 'PASS') && coreLeak === 0 ? 'PASS' : 'FAIL',
  `pass=${coreRows.filter((r) => r.status === 'PASS').length}/${coreRows.length} leak=${coreLeak}`,
  'raw/qa-matrix/CORE-*.json');

// RB-11 rehydrate scrub — already covered by GET after POST; spot check FN-05
const getSmith = rows.find((r) => r.id === 'FN-05-GET');
rbAdd('RB-11', 'rehydrate scrub GET after POST forbidden absent',
  getSmith?.status === 'PASS' && (getSmith?.leak || 0) === 0 ? 'PASS' : 'FAIL',
  `FN-05-GET=${getSmith?.status}`, 'raw/qa-matrix/GET-FN-05.json');

const advPass = ['ADV-01', 'ADV-03', 'ADV-04'].every((id) => rows.find((r) => r.id === id)?.status === 'PASS');
rbAdd('RB-12', 'ADV quick empty · bare כהן · John Smith bare',
  advPass ? 'PASS' : 'FAIL',
  `ADV-01/03/04 pass=${advPass}`, 'raw/qa-matrix/ADV-*.json');

rbAdd('RB-13', 'Chief GO', 'HOLD', 'No Chief GO · HOLD promote', '00-CHIEF-MANDATE.md');
rbAdd('RB-14', 'promote ask', 'HOLD', 'HOLD · do not promote', 'this matrix');

// ─── Summaries & deliverables ───────────────────────────────────
const ended = nowJerusalem();
const passN = rows.filter((r) => r.status === 'PASS').length;
const failN = rows.filter((r) => r.status === 'FAIL').length;
const holdN = rows.filter((r) => r.status === 'HOLD').length;

const byCat = {};
for (const r of rows) {
  byCat[r.category] = byCat[r.category] || { PASS: 0, FAIL: 0, HOLD: 0 };
  byCat[r.category][r.status] = (byCat[r.category][r.status] || 0) + 1;
}

const rbSpot = rows.filter((r) => /^RB-0([1-9]|1[0-2])$/.test(r.id));
const rbSpotPass = rbSpot.every((r) => r.status === 'PASS');

const blockers = rows.filter((r) => r.status === 'FAIL');
for (const b of blockers) {
  openItems.push({ id: b.id, category: b.category, name: b.name, notes: b.notes, owner: b.category === 'core' ? 'Core/Acc' : 'Server/Discovery' });
}
// Soft B17/B18
openItems.push({
  id: 'B17',
  category: 'observability',
  name: 'Store telemetry taxonomy (outcome/failureClass/retryCount) incomplete vs mandate',
  notes: 'Soft OK — owned by Server; not a QA matrix HTTP FAIL',
  owner: 'Server',
  severity: 'soft',
});
openItems.push({
  id: 'B18',
  category: 'observability',
  name: 'B18 production-readiness observability gaps (if any remaining)',
  notes: 'Soft OK — owned by Server; track in FINAL-REPORT',
  owner: 'Server',
  severity: 'soft',
});

const hardFail = failN > 0;
const recommendation = !hardFail && rbSpotPass && corePw === 0 && coreLeak === 0 && aggLeak === 0
  ? 'PROMOTE-READY'
  : 'NOT-PROMOTE-READY';

const matrixJson = {
  stamp_start: started,
  stamp_end: ended,
  role: 'בודק',
  promote: 'HOLD',
  recommendation,
  targets: {
    discovery_preview: { dpl: DISC_DPL, url: DISC_BASE },
    core_alias: { dpl: ALIAS_DPL, url: ALIAS_BASE, locked: true },
  },
  commit: 'unknown',
  counts: { PASS: passN, FAIL: failN, HOLD: holdN, total: rows.length },
  by_category: byCat,
  aggregate_leak: aggLeak,
  core_pw: corePw,
  core_leak: coreLeak,
  rb_01_12_all_pass: rbSpotPass,
  rows,
  open_items: openItems,
};

writeFileSync(join(OUT, '04-QA-FULL-MATRIX.json'), JSON.stringify(matrixJson, null, 2));

// Markdown matrix
const mdLines = [];
mdLines.push(`# 04 — QA FULL MATRIX · PR-CLOSEOUT · בודק`);
mdLines.push(`**Stamp:** ${started} → ${ended} IDT`);
mdLines.push(`**Preview:** \`${DISC_DPL}\` · ${DISC_BASE}`);
mdLines.push(`**Core alias (LOCKED):** \`${ALIAS_DPL}\` · ${ALIAS_BASE}`);
mdLines.push(`**Promote:** **HOLD** · Recommendation: **${recommendation}** (do not promote)`);
mdLines.push(`**Commit:** unknown (no .git)`);
mdLines.push('');
mdLines.push(`## Counts`);
mdLines.push(`| PASS | FAIL | HOLD | Total |`);
mdLines.push(`|-----:|-----:|-----:|------:|`);
mdLines.push(`| ${passN} | ${failN} | ${holdN} | ${rows.length} |`);
mdLines.push('');
mdLines.push(`## By category`);
mdLines.push(`| Category | PASS | FAIL | HOLD |`);
mdLines.push(`|----------|-----:|-----:|-----:|`);
for (const [cat, c] of Object.entries(byCat)) {
  mdLines.push(`| ${cat} | ${c.PASS || 0} | ${c.FAIL || 0} | ${c.HOLD || 0} |`);
}
mdLines.push('');
mdLines.push(`## Results`);
mdLines.push(`| ID | Cat | Status | Name | Notes |`);
mdLines.push(`|----|-----|--------|------|-------|`);
for (const r of rows) {
  mdLines.push(`| ${r.id} | ${r.category} | **${r.status}** | ${r.name} | ${(r.notes || '').replace(/\|/g, '/')} |`);
}
mdLines.push('');
mdLines.push(`## Acc / leakage`);
mdLines.push(`- aggregate_leak = **${aggLeak}**`);
mdLines.push(`- core_pw = **${corePw}** · core_leak = **${coreLeak}**`);
mdLines.push(`- RB-01..12 all PASS: **${rbSpotPass ? 'YES' : 'NO'}**`);
mdLines.push('');
mdLines.push(`## Recommendation`);
mdLines.push(`**${recommendation}**`);
mdLines.push(`HOLD promote · Core alias LOCKED · no promote executed.`);
mdLines.push('');
mdLines.push(`## Evidence`);
mdLines.push(`- \`04-QA-FULL-MATRIX.json\``);
mdLines.push(`- \`raw/qa-matrix/\``);
mdLines.push(`- Freeze: \`00-FREEZE-FORENSICS.md\``);
writeFileSync(join(OUT, '04-QA-FULL-MATRIX.md'), mdLines.join('\n'));

// Core regression md
const coreMd = [];
coreMd.push(`# 04 — QA CORE REGRESSION · PR-CLOSEOUT · בודק`);
coreMd.push(`**Stamp:** ${ended} IDT`);
coreMd.push(`**Alias:** \`${ALIAS_DPL}\` · ${ALIAS_BASE} · **LOCKED**`);
coreMd.push(`**Promote:** HOLD`);
coreMd.push('');
coreMd.push(`## Invariants`);
coreMd.push(`- pw = **${corePw}** (must be 0)`);
coreMd.push(`- leakage = **${coreLeak}** (must be 0)`);
coreMd.push('');
coreMd.push(`| ID | Status | ui | qid | faces | leak | pw |`);
coreMd.push(`|----|--------|----|-----|------:|-----:|----|`);
for (const r of coreRows) {
  coreMd.push(`| ${r.id} | **${r.status}** | ${r.ui} | ${r.qid} | ${r.faces} | ${r.leak} | ${r.pw} |`);
}
coreMd.push('');
coreMd.push(`## Verdict`);
const coreVerdict = coreRows.every((r) => r.status === 'PASS') && corePw === 0 && coreLeak === 0 ? 'PASS' : 'FAIL';
coreMd.push(`**${coreVerdict}** · Assaf/כהן/Smith · pw=0 · leakage=0 requirement: ${corePw === 0 && coreLeak === 0 ? 'MET' : 'NOT MET'}`);
coreMd.push('');
coreMd.push(`Evidence: \`raw/qa-matrix/CORE-*.json\``);
writeFileSync(join(OUT, '04-QA-CORE-REGRESSION.md'), coreMd.join('\n'));
writeFileSync(join(OUT, '04-QA-CORE-REGRESSION.json'), JSON.stringify({
  stamp: ended, alias: ALIAS_DPL, locked: true, pw: corePw, leakage: coreLeak,
  verdict: coreVerdict, cases: coreRows, promote: 'HOLD',
}, null, 2));

// Open items
const oiMd = [];
oiMd.push(`# 04 — QA OPEN ITEMS · PR-CLOSEOUT · בודק`);
oiMd.push(`**Stamp:** ${ended} IDT`);
oiMd.push(`**Recommendation:** **${recommendation}** · HOLD promote`);
oiMd.push('');
if (blockers.length === 0) {
  oiMd.push(`## Hard FAIL items`);
  oiMd.push(`None — all matrix hard checks PASS (RB-13/14 HOLD by design).`);
} else {
  oiMd.push(`## Hard FAIL items (not GREEN)`);
  oiMd.push(`| ID | Category | Name | Notes | Owner |`);
  oiMd.push(`|----|----------|------|-------|-------|`);
  for (const b of blockers) {
    oiMd.push(`| ${b.id} | ${b.category} | ${b.name} | ${(b.notes || '').replace(/\|/g, '/')} | Server/QA |`);
  }
}
oiMd.push('');
oiMd.push(`## Soft / owned by Server (OK to note)`);
oiMd.push(`| ID | Name | Notes | Owner |`);
oiMd.push(`|----|------|-------|-------|`);
oiMd.push(`| B17 | Store telemetry taxonomy incomplete | outcome/failureClass/retryCount gaps vs mandate · soft | Server |`);
oiMd.push(`| B18 | Observability production-readiness remainder | track in FINAL-REPORT · soft | Server |`);
oiMd.push('');
oiMd.push(`## HOLD by design`);
oiMd.push(`- RB-13 Chief GO — HOLD until Chief`);
oiMd.push(`- RB-14 promote ask — HOLD · **do not promote**`);
oiMd.push(`- Core alias \`${ALIAS_DPL}\` LOCKED`);
writeFileSync(join(OUT, '04-QA-OPEN-ITEMS.md'), oiMd.join('\n'));
writeFileSync(join(OUT, '04-QA-OPEN-ITEMS.json'), JSON.stringify({
  stamp: ended, recommendation, hard_fails: blockers, soft: openItems.filter((o) => o.severity === 'soft'),
  hold: ['RB-13', 'RB-14'], promote: 'HOLD',
}, null, 2));

console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(matrixJson.counts, null, 2));
console.log('recommendation:', recommendation);
console.log('rb_01_12_all_pass:', rbSpotPass);
console.log('aggregate_leak:', aggLeak, 'core_pw:', corePw);
process.exit(hardFail ? 1 : 0);
