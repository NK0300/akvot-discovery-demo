#!/usr/bin/env node
/**
 * POST-PROMOTE QA — MEASURE ONLY · NO further promote
 * Discovery: akvot-discovery.vercel.app → dpl_AvyhrW24gGRquWCPPZdydBiz81dv
 * Core LOCKED: akvot-simple-demo.vercel.app → dpl_8agSZKvcb2pjehzXgMeckDgJvDV8
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..');
const RAW = join(OUT, 'raw', 'qa');
mkdirSync(RAW, { recursive: true });

const DISC_DPL = 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const DISC_ALIAS = 'https://akvot-discovery.vercel.app';
const CORE_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const CORE_ALIAS = 'https://akvot-simple-demo.vercel.app';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const ROOT = join(__dirname, '../../../../../..');
const STAMP_DATE = '2026-09-20';

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
  deployment = null,
  timeout = 180000,
  accept = 'application/json',
  origin = DISC_ALIAS,
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
    '-H', `Origin: ${origin}`,
  );
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    args.push('-X', method, '-H', 'Content-Type: application/json', '--data', JSON.stringify(body ?? {}));
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
  return { ms, httpStatus, json, text: textBody, headers, exit: r.status, stderr: (r.stderr || '').slice(0, 2000), method, url: urlOrPath };
}

function vercelCurlSSE(path, { deployment, maxSeconds = 45, origin = DISC_ALIAS } = {}) {
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const bodyFile = join(RAW, `_sse-body-${stamp}`);
  const hdrFile = join(RAW, `_sse-hdr-${stamp}`);
  const args = [
    'curl', path, '--deployment', deployment, '--scope', SCOPE, '--',
    '-sS', '-N', '-o', bodyFile, '-D', hdrFile, '-w', '%{http_code}',
    '-H', 'Accept: text/event-stream',
    '-H', `Origin: ${origin}`,
    '--max-time', String(maxSeconds),
  ];
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    timeout: (maxSeconds + 30) * 1000, cwd: ROOT,
  });
  const ms = Date.now() - t0;
  let headers = '', text = '';
  try { headers = readFileSync(hdrFile, 'utf8'); } catch (_) {}
  try { text = readFileSync(bodyFile, 'utf8'); } catch (_) {}
  try { unlinkSync(bodyFile); } catch (_) {}
  try { unlinkSync(hdrFile); } catch (_) {}
  const stdoutCode = (r.stdout || '').trim().split('\n').filter(Boolean).pop() || '';
  let httpStatus = Number(stdoutCode);
  if (!httpStatus) {
    const m = headers.match(/HTTP\/[\d.]+ (\d+)/);
    httpStatus = m ? Number(m[1]) : null;
  }
  return { ms, httpStatus, text, headers, exit: r.status, stderr: (r.stderr || '').slice(0, 1500) };
}

function inspectAlias(alias) {
  const r = spawnSync('vercel', ['inspect', alias, '--scope', SCOPE], {
    encoding: 'utf8', timeout: 60000, cwd: ROOT, maxBuffer: 4 * 1024 * 1024,
  });
  const out = `${r.stdout || ''}\n${r.stderr || ''}`;
  const idM = out.match(/\bid\s+(dpl_[A-Za-z0-9]+)/);
  const statusM = out.match(/status\s+[●○]\s*(\w+)/);
  return { exit: r.status, text: out, dpl: idM ? idM[1] : null, status: statusM ? statusM[1] : null };
}

function leaks(t) {
  FORBIDDEN_RE.lastIndex = 0;
  return (String(t || '').match(FORBIDDEN_RE) || []).map((x) => x.toLowerCase());
}

function deepScan(obj, path = '') {
  const found = [];
  if (obj == null) return found;
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    for (const h of leaks(String(obj))) found.push({ path, term: h });
    return found;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => found.push(...deepScan(v, `${path}[${i}]`)));
    return found;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      found.push(...deepScan(v, path ? `${path}.${k}` : k));
    }
  }
  return found;
}

function contradictionFindingIdLeaks(obj) {
  const bad = [];
  const snap = obj?.snapshot || obj;
  const cons = snap?.contradictions;
  if (Array.isArray(cons)) {
    cons.forEach((c, i) => {
      for (const id of c?.findingIds || []) {
        if (/Q1701775|wd-Q1701775|wd_Q1701775/i.test(String(id))) {
          bad.push({ path: `contradictions[${i}].findingIds`, id: String(id) });
        }
      }
    });
  }
  return bad;
}

function scrubSecrets(s) {
  return String(s || '')
    .replace(/UPSTASH_REDIS_REST_TOKEN["\s:=]+[^\s",}]+/gi, 'UPSTASH_REDIS_REST_TOKEN":"[REDACTED]"')
    .replace(/KV_REST_API_TOKEN["\s:=]+[^\s",}]+/gi, 'KV_REST_API_TOKEN":"[REDACTED]"')
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/g, 'Bearer [REDACTED]');
}

function saveRaw(label, data) {
  let payload;
  if (data?.json != null) payload = { httpStatus: data.httpStatus, ms: data.ms, ...data.json };
  else if (typeof data === 'string') payload = { text: data.slice(0, 200000) };
  else if (data?.text != null && !data.json) {
    payload = { text: String(data.text).slice(0, 200000), httpStatus: data.httpStatus, ms: data.ms, stderr: data.stderr };
  } else payload = data;
  writeFileSync(join(RAW, `${label}.json`), scrubSecrets(JSON.stringify(payload, null, 2)));
}

function snapFields(j) {
  const snap = j?.snapshot || j || {};
  const findings = Array.isArray(snap.findings) ? snap.findings : Array.isArray(j?.findings) ? j.findings : [];
  const contradictions = Array.isArray(snap.contradictions) ? snap.contradictions : Array.isArray(j?.contradictions) ? j.contradictions : [];
  return { snap, findings, contradictions, sessionId: j?.sessionId || snap?.sessionId || null };
}

function uiOf(j) {
  return j?.uiState ?? j?.ui ?? j?.mode ?? null;
}

const started = nowJerusalem();
const report = {
  role: 'בודק',
  mode: 'MEASURE_ONLY_NO_PROMOTE',
  stamp_start: started,
  stamp_zone: 'Asia/Jerusalem (IDT, UTC+3)',
  discovery: { alias: DISC_ALIAS, expected_dpl: DISC_DPL },
  core: { alias: CORE_ALIAS, expected_dpl: CORE_DPL },
  inspect: {},
  health: {},
  seeds: [],
  lifecycle: {},
  acc: {},
  core_checks: {},
  incidents: [],
  summary: {},
};

console.log(`[POST-PROMOTE-QA] start ${started}`);

// ─── 0. INSPECT ALIASES ───────────────────────────────────────
console.log('[0] vercel inspect aliases');
const discInspect = inspectAlias('akvot-discovery.vercel.app');
const coreInspect = inspectAlias('akvot-simple-demo.vercel.app');
writeFileSync(join(RAW, '00-disc-inspect.txt'), discInspect.text);
writeFileSync(join(RAW, '00-core-inspect.txt'), coreInspect.text);
report.inspect = {
  discovery: { dpl: discInspect.dpl, status: discInspect.status, match: discInspect.dpl === DISC_DPL },
  core: { dpl: coreInspect.dpl, status: coreInspect.status, match: coreInspect.dpl === CORE_DPL, still_8ag: !!(coreInspect.dpl && coreInspect.dpl.startsWith('dpl_8ag')) },
};
if (!report.inspect.core.match) {
  report.incidents.push({
    severity: 'CRITICAL',
    code: 'CORE_RETARGETED',
    detail: `Core alias dpl=${coreInspect.dpl} expected ${CORE_DPL}`,
  });
  console.error(`FAIL LOUDLY: Core retargeted! got=${coreInspect.dpl} expected=${CORE_DPL}`);
}
if (!report.inspect.discovery.match) {
  report.incidents.push({
    severity: 'CRITICAL',
    code: 'DISC_DPL_MISMATCH',
    detail: `Discovery alias dpl=${discInspect.dpl} expected ${DISC_DPL}`,
  });
}
console.log(`  Discovery dpl=${discInspect.dpl} match=${report.inspect.discovery.match}`);
console.log(`  Core dpl=${coreInspect.dpl} still_8ag=${report.inspect.core.still_8ag}`);

// ─── 1. HEALTH ────────────────────────────────────────────────
console.log('[1] Discovery + Core health');
const hAlias = vercelCurl(`${DISC_ALIAS}/api/health`);
const hDisc = vercelCurl('/api/discovery/health', { deployment: DISC_DPL });
const hApi = vercelCurl('/api/health', { deployment: DISC_DPL });
const hCore = vercelCurl(`${CORE_ALIAS}/api/health`, { origin: CORE_ALIAS });
saveRaw('01-disc-alias-health', hAlias);
saveRaw('01-discovery-health', hDisc);
saveRaw('01-api-health', hApi);
saveRaw('01-core-alias-health', hCore);

const ds = hApi.json?.discoveryStore || {};
const dh = hDisc.json || {};
report.health = {
  discovery_alias: {
    httpStatus: hAlias.httpStatus,
    build: hAlias.json?.build,
    build_match: hAlias.json?.build === DISC_DPL,
  },
  api: {
    httpStatus: hApi.httpStatus,
    build: hApi.json?.build,
    build_match: hApi.json?.build === DISC_DPL,
    storeBackend: ds.storeBackend,
    durable: ds.durable,
    promoteEligible: ds.promoteEligible,
    kvReachable: ds.kvReachable,
    durabilityState: ds.durabilityState,
  },
  discovery_health: {
    httpStatus: hDisc.httpStatus,
    ok: dh.ok,
    storeBackend: dh.storeBackend || dh.backend,
    durable: dh.durable,
    promoteEligible: dh.promoteEligible,
    kvReachable: dh.kvReachable,
    durabilityState: dh.durabilityState,
    mode: dh.mode,
    steps: dh.steps,
  },
  core_alias: {
    httpStatus: hCore.httpStatus,
    build: hCore.json?.build,
    build_match: hCore.json?.build === CORE_DPL,
    still_8ag: !!(hCore.json?.build && String(hCore.json.build).startsWith('dpl_8ag')),
  },
};

report.health.pass =
  report.health.discovery_alias.build_match &&
  report.health.api.build_match &&
  (report.health.api.storeBackend === 'upstash' || report.health.discovery_health.storeBackend === 'upstash') &&
  (report.health.api.durable === true || report.health.discovery_health.durable === true) &&
  report.health.discovery_health.ok === true &&
  report.health.core_alias.build_match;

console.log(`[1] healthPass=${report.health.pass} discBuild=${report.health.discovery_alias.build} coreBuild=${report.health.core_alias.build} backend=${report.health.discovery_health.storeBackend}`);

if (!report.health.core_alias.build_match) {
  report.incidents.push({
    severity: 'CRITICAL',
    code: 'CORE_RETARGETED',
    detail: `Core /api/health build=${report.health.core_alias.build} expected ${CORE_DPL}`,
  });
}

// ─── 2. SEEDS (≥3 required: דוד כהן, Alex Morgan, example.org) ─
console.log('[2] Discovery seeds');
const SEEDS = [
  { id: 'david-cohen', seed: 'דוד כהן', kind: 'person', hints: { locale: 'he' }, locale: 'he' },
  { id: 'alex-morgan', seed: 'Alex Morgan', kind: 'ambiguous', hints: {}, locale: 'en' },
  { id: 'example-org', seed: 'example.org', kind: 'domain', hints: { kind: 'domain' }, locale: 'en' },
];

let lifecycleSessionId = null;
const sessionIds = [];

for (const s of SEEDS) {
  console.log(`  POST seed=${s.id} «${s.seed}»`);
  const post = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    deployment: DISC_DPL,
    body: { seed: s.seed, hints: s.hints || {}, locale: s.locale || 'en' },
    timeout: 200000,
  });
  saveRaw(`02-post-${s.id}`, post);
  const { snap, findings, sessionId } = snapFields(post.json);
  const leakHits = deepScan(post.json);
  const b23 = contradictionFindingIdLeaks(post.json);
  const storeObj = post.json?.store || post.json?._storeInfo || {};
  const store = storeObj.storeBackend || storeObj.backend || post.json?.storeBackend || snap?.storeBackend;
  const durable = storeObj.durable ?? post.json?.durable ?? snap?.durable;
  const row = {
    id: s.id,
    seed: s.seed,
    kind: s.kind,
    post: {
      httpStatus: post.httpStatus,
      ms: post.ms,
      sessionId,
      status: snap?.status || post.json?.status,
      findings_n: findings.length,
      storeBackend: store,
      durable,
      leakage_count: leakHits.length,
      contradictions_leak: b23.length,
      deep_scan_hits: leakHits.slice(0, 10),
      b23,
    },
  };

  if (sessionId) {
    sessionIds.push(sessionId);
    if (s.id === 'example-org') lifecycleSessionId = sessionId;
    sleep(1500);
    console.log(`  GET seed=${s.id} sid=${sessionId.slice(0, 24)}…`);
    const get = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`, {
      deployment: DISC_DPL,
      timeout: 180000,
    });
    saveRaw(`02-get-${s.id}`, get);
    const g = snapFields(get.json);
    const gLeak = deepScan(get.json);
    const gB23 = contradictionFindingIdLeaks(get.json);
    row.get = {
      httpStatus: get.httpStatus,
      ms: get.ms,
      sessionId: g.sessionId,
      sessionId_match: g.sessionId === sessionId,
      status: g.snap?.status || get.json?.status,
      findings_n: g.findings.length,
      leakage_count: gLeak.length,
      contradictions_leak: gB23.length,
      deep_scan_hits: gLeak.slice(0, 10),
      b23: gB23,
    };
    row.pass =
      post.httpStatus >= 200 && post.httpStatus < 300 &&
      get.httpStatus === 200 &&
      row.get.sessionId_match &&
      row.post.leakage_count === 0 &&
      row.get.leakage_count === 0 &&
      row.post.contradictions_leak === 0 &&
      row.get.contradictions_leak === 0 &&
      (store === 'upstash' || durable === true);
  } else {
    row.pass = false;
    row.error = 'no sessionId on POST';
  }
  report.seeds.push(row);
  console.log(`  → ${s.id} pass=${row.pass} findings=${row.get?.findings_n} leak=${(row.post?.leakage_count||0)+(row.get?.leakage_count||0)} store=${store}`);
}

const seedsLeak = report.seeds.reduce((a, r) => a + (r.post?.leakage_count || 0) + (r.get?.leakage_count || 0) + (r.post?.contradictions_leak || 0) + (r.get?.contradictions_leak || 0), 0);
report.seeds_summary = {
  n: report.seeds.length,
  min_required: 3,
  pass: report.seeds.length >= 3 && report.seeds.every((r) => r.pass),
  total_acc_leak: seedsLeak,
  storeBackend_prefer_upstash: report.seeds.every((r) => r.post?.storeBackend === 'upstash' || r.post?.durable === true),
};

if (seedsLeak > 0) {
  report.incidents.push({ severity: 'CRITICAL', code: 'ACC_LEAK', detail: `seed Acc leak=${seedsLeak}` });
}

// ─── 3. LIFECYCLE SSE / NARROW / GET2 ──────────────────────────
console.log('[3] Lifecycle SSE/narrow');
if (!lifecycleSessionId && sessionIds[0]) lifecycleSessionId = sessionIds[0];
const lifeSid = lifecycleSessionId;
if (lifeSid) {
  const lifeGet = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(lifeSid)}`, { deployment: DISC_DPL });
  saveRaw('03-lifecycle-GET', lifeGet);

  console.log('  SSE…');
  const sse = vercelCurlSSE(`/api/discovery/sessions/${encodeURIComponent(lifeSid)}/events`, {
    deployment: DISC_DPL,
    maxSeconds: 45,
  });
  writeFileSync(join(RAW, '03-lifecycle-SSE.txt'), scrubSecrets(sse.text || ''));
  const sseText = sse.text || '';
  const sseEvents = [...sseText.matchAll(/^event:\s*(\S+)/gm)].map((m) => m[1]);
  const hasDone = /event:\s*done/i.test(sseText) || /"type"\s*:\s*"done"/i.test(sseText);
  const sseLeak = leaks(sseText);

  console.log('  NARROW…');
  const narrow = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(lifeSid)}/narrow`, {
    method: 'POST',
    deployment: DISC_DPL,
    body: { facets: { kind: ['page'] } },
    timeout: 120000,
  });
  saveRaw('03-lifecycle-NARROW', narrow);
  const nFields = snapFields(narrow.json);

  const lifeGet2 = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(lifeSid)}`, { deployment: DISC_DPL });
  saveRaw('03-lifecycle-GET2', lifeGet2);

  const otherSid = sessionIds.find((id) => id !== lifeSid);
  let cross = null;
  if (otherSid) {
    const other = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(otherSid)}`, { deployment: DISC_DPL });
    saveRaw('03-lifecycle-OTHER', other);
    cross = {
      otherSessionId: otherSid,
      returnedSessionId: other.json?.sessionId,
      match: other.json?.sessionId === otherSid,
      not_life: other.json?.sessionId !== lifeSid,
      leakage_count: deepScan(other.json).length,
    };
  }

  report.lifecycle = {
    sessionId: lifeSid,
    get: {
      httpStatus: lifeGet.httpStatus,
      match: lifeGet.json?.sessionId === lifeSid,
      findings_n: snapFields(lifeGet.json).findings.length,
      leakage_count: deepScan(lifeGet.json).length,
    },
    sse: {
      httpStatus: sse.httpStatus,
      ms: sse.ms,
      events: sseEvents,
      has_done: hasDone,
      leakage_count: sseLeak.length,
    },
    narrow: {
      httpStatus: narrow.httpStatus,
      sessionId: narrow.json?.sessionId || nFields.sessionId,
      match: (narrow.json?.sessionId || nFields.sessionId) === lifeSid,
      findings_n: nFields.findings.length,
      leakage_count: deepScan(narrow.json).length,
    },
    get2: {
      httpStatus: lifeGet2.httpStatus,
      match: lifeGet2.json?.sessionId === lifeSid,
      leakage_count: deepScan(lifeGet2.json).length,
    },
    cross_session: cross,
  };
  report.lifecycle.pass =
    report.lifecycle.get?.match === true &&
    report.lifecycle.sse?.has_done === true &&
    report.lifecycle.sse?.leakage_count === 0 &&
    report.lifecycle.narrow?.match === true &&
    report.lifecycle.narrow?.leakage_count === 0 &&
    report.lifecycle.get2?.match === true &&
    report.lifecycle.get2?.leakage_count === 0 &&
    (cross ? cross.match && cross.not_life && cross.leakage_count === 0 : true);
} else {
  report.lifecycle = { pass: false, error: 'no sessionId' };
  report.incidents.push({ severity: 'HIGH', code: 'LIFECYCLE_NO_SESSION', detail: 'no sessionId' });
}
console.log(`[3] lifecycle pass=${report.lifecycle.pass}`);

// ─── 4. ACC DEEP-SCAN adversarial Q1701775 ─────────────────────
console.log('[4] Acc deep-scan Q1701775');
const ADV = [
  { id: 'adv-smith', seed: 'John Smith', hints: { org: 'IBM', city: 'New York', country: 'US' } },
  { id: 'adv-qid', seed: 'John Smith Q1701775', hints: {} },
  { id: 'adv-wd', seed: 'wd-Q1701775', hints: {} },
  { id: 'adv-q', seed: 'Q1701775', hints: {} },
];
const advRows = [];
for (const a of ADV) {
  console.log(`  ADV ${a.id}`);
  const post = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    deployment: DISC_DPL,
    body: { seed: a.seed, hints: a.hints, locale: 'en' },
    timeout: 200000,
  });
  saveRaw(`04-${a.id}-post`, post);
  const sid = post.json?.sessionId;
  let getLeak = [], getJson = null, getB23 = [];
  if (sid) {
    sleep(1200);
    const get = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sid)}`, { deployment: DISC_DPL });
    saveRaw(`04-${a.id}-get`, get);
    getJson = get.json;
    getLeak = deepScan(get.json);
    getB23 = contradictionFindingIdLeaks(get.json);
  }
  const postLeak = deepScan(post.json);
  const postB23 = contradictionFindingIdLeaks(post.json);
  const row = {
    id: a.id,
    seed: a.seed,
    httpStatus: post.httpStatus,
    sessionId: sid,
    post_leakage: postLeak.length,
    get_leakage: getLeak.length,
    contradictions_leak: postB23.length + getB23.length,
    deep_scan_hits: [...postLeak, ...getLeak].slice(0, 15),
    pass: postLeak.length === 0 && getLeak.length === 0 && postB23.length === 0 && getB23.length === 0,
  };
  advRows.push(row);
  console.log(`  → ${a.id} pass=${row.pass} leak=${row.post_leakage + row.get_leakage} b23=${row.contradictions_leak}`);
}
const advLeak = advRows.reduce((a, r) => a + r.post_leakage + r.get_leakage + r.contradictions_leak, 0);
report.acc = {
  adversarial: advRows,
  seeds_leakage: seedsLeak,
  adv_leakage: advLeak,
  total_leakage: seedsLeak + advLeak,
  contradictions_zero: advRows.every((r) => r.contradictions_leak === 0) && report.seeds.every((r) => (r.post?.contradictions_leak || 0) + (r.get?.contradictions_leak || 0) === 0),
  pass: advLeak === 0 && seedsLeak === 0,
};
if (advLeak > 0) {
  report.incidents.push({ severity: 'CRITICAL', code: 'ACC_ADV_LEAK', detail: `adv leak=${advLeak}` });
}

// ─── 5. CORE: Assaf · כהן soft · Smith soft ────────────────────
console.log('[5] Core Assaf / כהן soft / Smith soft');
const coreCases = [
  {
    id: 'assaf',
    path: '/api/lookup?q=Assaf%20Rappaport&nocache=1',
    expect: { ui: 'dossier', qid: 'Q47507930' },
  },
  {
    id: 'cohen-soft',
    path: `/api/lookup?q=${encodeURIComponent('כהן')}&nocache=1`,
    expect: { soft: true, not_dossier: true },
  },
  {
    id: 'smith-soft',
    path: '/api/lookup?q=John%20Smith&org=IBM&city=New%20York&country=US&nocache=1',
    expect: { soft: true, forbidQid: 'Q1701775' },
  },
];

const coreResults = [];
let corePw = 0;
for (const c of coreCases) {
  console.log(`  CORE ${c.id}`);
  const r = vercelCurl(`${CORE_ALIAS}${c.path}`, { origin: CORE_ALIAS, timeout: 120000 });
  saveRaw(`05-core-${c.id}`, r);
  const j = r.json || {};
  const leakHits = deepScan(j);
  const qid = j?.qid ?? null;
  const ui = uiOf(j);
  const faces = Array.isArray(j?.images) ? j.images.length : j?.photo ? 1 : 0;
  const isPw = qid === 'Q1701775' || leakHits.length > 0;
  if (isPw && c.id === 'smith-soft') corePw += 1;
  if (qid === 'Q1701775') corePw += 1;

  let pass = leakHits.length === 0 && qid !== 'Q1701775' && r.httpStatus === 200;
  if (c.expect.qid) pass = pass && qid === c.expect.qid;
  if (c.expect.ui) pass = pass && (ui === c.expect.ui || j?.mode === 'wiki');
  if (c.expect.not_dossier) pass = pass && ui !== 'dossier' && qid !== 'Q47507930';
  if (c.expect.soft) {
    // soft = not forced dossier of forbidden identity
    pass = pass && qid !== 'Q1701775';
  }

  const row = {
    id: c.id,
    httpStatus: r.httpStatus,
    ms: r.ms,
    ui,
    qid,
    faces,
    leakage_count: leakHits.length,
    pw: qid === 'Q1701775' ? 1 : 0,
    pass,
  };
  coreResults.push(row);
  console.log(`  → ${c.id} ui=${ui} qid=${qid} leak=${row.leakage_count} pw=${row.pw} pass=${row.pass}`);
}

report.core_checks = {
  alias_still_8ag: report.inspect.core.still_8ag && report.health.core_alias.still_8ag,
  alias_dpl: report.inspect.core.dpl || report.health.core_alias.build,
  expected_dpl: CORE_DPL,
  cases: coreResults,
  pw: coreResults.reduce((a, r) => a + (r.pw || 0), 0),
  leakage: coreResults.reduce((a, r) => a + r.leakage_count, 0),
  pass:
    report.inspect.core.match &&
    report.health.core_alias.build_match &&
    coreResults.every((r) => r.pass) &&
    coreResults.reduce((a, r) => a + r.leakage_count, 0) === 0,
};

if (!report.core_checks.pass && !report.inspect.core.match) {
  // already incidented
} else if (report.core_checks.leakage > 0) {
  report.incidents.push({ severity: 'CRITICAL', code: 'CORE_ACC_LEAK', detail: `Core leakage=${report.core_checks.leakage}` });
}

// ─── FINAL ────────────────────────────────────────────────────
const ended = nowJerusalem();
report.stamp_end = ended;

const critical = report.incidents.filter((i) => i.severity === 'CRITICAL');
const allPass =
  report.inspect.discovery.match &&
  report.inspect.core.match &&
  report.health.pass &&
  report.seeds_summary.pass &&
  report.lifecycle.pass &&
  report.acc.pass &&
  report.core_checks.pass;

let finalStatus;
if (critical.some((i) => i.code === 'CORE_RETARGETED')) {
  finalStatus = 'FAIL — CORE RETARGETED (dpl not 8ag)';
} else if (critical.length > 0) {
  finalStatus = 'FAIL — CRITICAL incidents';
} else if (allPass) {
  finalStatus = 'PASS';
} else {
  finalStatus = 'FAIL — checks incomplete';
}

report.summary = {
  final_status: finalStatus,
  pass: allPass && critical.length === 0,
  core_still_8ag: report.inspect.core.still_8ag === true && report.health.core_alias.still_8ag === true,
  discovery_dpl_match: report.inspect.discovery.match === true && report.health.discovery_alias.build_match === true,
  discovery_dpl: report.inspect.discovery.dpl || report.health.discovery_alias.build,
  core_dpl: report.inspect.core.dpl || report.health.core_alias.build,
  storeBackend: report.health.discovery_health.storeBackend || report.health.api.storeBackend,
  durable: report.health.discovery_health.durable ?? report.health.api.durable,
  leakage: report.acc.total_leakage,
  pw: report.core_checks.pw,
  seeds_pass: report.seeds_summary.pass,
  lifecycle_pass: report.lifecycle.pass,
  acc_pass: report.acc.pass,
  core_pass: report.core_checks.pass,
  health_pass: report.health.pass,
  contradictions_zero: report.acc.contradictions_zero,
  promote_performed: false,
  incidents_n: report.incidents.length,
};

const mdPath = join(OUT, `POST-PROMOTE-QA-בודק-${STAMP_DATE}.md`);
const jsonPath = join(OUT, `POST-PROMOTE-QA-בודק-${STAMP_DATE}.json`);

writeFileSync(jsonPath, scrubSecrets(JSON.stringify(report, null, 2)));

const md = `# POST-PROMOTE QA — בודק
**Stamp:** ${ended} IDT (Asia/Jerusalem, UTC+3)  
**Mode:** MEASURE ONLY · **NO promote**  
**FINAL:** **${finalStatus}**

---

## Verdict
| Check | Result |
|-------|--------|
| **PASS/FAIL** | **${finalStatus}** |
| Core still 8ag | **${report.summary.core_still_8ag ? 'YES' : 'NO'}** · \`${report.summary.core_dpl}\` |
| Discovery dpl match | **${report.summary.discovery_dpl_match ? 'YES' : 'NO'}** · \`${report.summary.discovery_dpl}\` (expect \`${DISC_DPL}\`) |
| storeBackend | \`${report.summary.storeBackend}\` · durable=\`${report.summary.durable}\` |
| Acc leakage | **${report.summary.leakage}** |
| Core pw | **${report.summary.pw}** |
| contradictions (Q1701775 in findingIds) | **${report.summary.contradictions_zero ? 0 : 'NONZERO'}** |
| Promote performed | **NO** |

---

## Alias inspect
| Alias | Expected | Observed | Match |
|-------|----------|----------|-------|
| \`${DISC_ALIAS}\` | \`${DISC_DPL}\` | \`${report.inspect.discovery.dpl}\` · ${report.inspect.discovery.status} | ${report.inspect.discovery.match ? 'YES' : '**NO**'} |
| \`${CORE_ALIAS}\` (LOCKED) | \`${CORE_DPL}\` | \`${report.inspect.core.dpl}\` · ${report.inspect.core.status} | ${report.inspect.core.match ? 'YES' : '**FAIL LOUDLY**'} |

Evidence: \`raw/qa/00-disc-inspect.txt\` · \`raw/qa/00-core-inspect.txt\`

---

## Health
| Probe | Result |
|-------|--------|
| Discovery alias \`/api/health\` | build=\`${report.health.discovery_alias.build}\` · match=${report.health.discovery_alias.build_match} |
| \`/api/discovery/health\` | ok=${report.health.discovery_health.ok} · store=\`${report.health.discovery_health.storeBackend}\` · durable=${report.health.discovery_health.durable} · mode=\`${report.health.discovery_health.mode}\` |
| Core alias \`/api/health\` | build=\`${report.health.core_alias.build}\` · still_8ag=${report.health.core_alias.still_8ag} |
| **health.pass** | **${report.health.pass}** |

---

## Discovery seeds (≥3)
| # | Seed | POST | GET findings | Acc leak | contradictions | store | Result |
|---|------|------|--------------|----------|----------------|-------|--------|
${report.seeds.map((r, i) => `| ${i + 1} | ${r.seed} | ${r.post?.httpStatus} · ${(r.post?.sessionId || '').slice(0, 18)}… | ${r.get?.findings_n ?? '—'} | ${(r.post?.leakage_count||0)+(r.get?.leakage_count||0)} | ${(r.post?.contradictions_leak||0)+(r.get?.contradictions_leak||0)} | ${r.post?.storeBackend} · durable=${r.post?.durable} | **${r.pass ? 'PASS' : 'FAIL'}** |`).join('\n')}

- seeds_pass=${report.seeds_summary.pass} · total_acc_leak=${report.seeds_summary.total_acc_leak}

---

## Lifecycle (SSE / narrow / GET2)
| Step | Result |
|------|--------|
| sessionId | \`${report.lifecycle.sessionId || '—'}\` |
| GET match | ${report.lifecycle.get?.match} · leak=${report.lifecycle.get?.leakage_count} |
| SSE events | ${(report.lifecycle.sse?.events || []).join(', ') || '—'} · has_done=${report.lifecycle.sse?.has_done} · leak=${report.lifecycle.sse?.leakage_count} |
| NARROW match | ${report.lifecycle.narrow?.match} · leak=${report.lifecycle.narrow?.leakage_count} |
| GET2 match | ${report.lifecycle.get2?.match} · leak=${report.lifecycle.get2?.leakage_count} |
| cross-session | match=${report.lifecycle.cross_session?.match} · not_life=${report.lifecycle.cross_session?.not_life} |
| **lifecycle.pass** | **${report.lifecycle.pass}** |

---

## Acc deep-scan (Q1701775 / wd-Q1701775)
| Case | Seed | leak POST+GET | contradictions | Result |
|------|------|---------------|----------------|--------|
${(report.acc.adversarial || []).map((r) => `| ${r.id} | \`${r.seed}\` | ${r.post_leakage + r.get_leakage} | ${r.contradictions_leak} | **${r.pass ? 'PASS' : 'FAIL'}** |`).join('\n')}

- **total Acc leakage = ${report.acc.total_leakage}** · contradictions_zero=${report.acc.contradictions_zero} · pass=${report.acc.pass}

---

## Core (LOCKED)
| Case | ui | qid | faces | leak | pw | Result |
|------|----|-----|-------|------|----|--------|
${coreResults.map((r) => `| ${r.id} | \`${r.ui}\` | \`${r.qid}\` | ${r.faces} | ${r.leakage_count} | ${r.pw} | **${r.pass ? 'PASS' : 'FAIL'}** |`).join('\n')}

- Expect Assaf → Q47507930 dossier · כהן soft · Smith soft · **pw=0 · leakage=0**
- Core still 8ag: **${report.summary.core_still_8ag ? 'YES' : 'NO'}**
- **core.pass = ${report.core_checks.pass}**

---

## Incidents
${report.incidents.length === 0 ? '_None._' : report.incidents.map((i) => `- **${i.severity}** \`${i.code}\`: ${i.detail}`).join('\n')}

---

## Evidence
- JSON: \`POST-PROMOTE-QA-בודק-${STAMP_DATE}.json\`
- Raw: \`raw/qa/\`
- Policy: **NO further promote / alias retarget**
`;

writeFileSync(mdPath, md);
console.log(`[POST-PROMOTE-QA] DONE status=${finalStatus}`);
console.log(JSON.stringify(report.summary, null, 2));
console.log(`Wrote ${mdPath}`);
console.log(`Wrote ${jsonPath}`);
process.exit(report.summary.pass ? 0 : 2);
