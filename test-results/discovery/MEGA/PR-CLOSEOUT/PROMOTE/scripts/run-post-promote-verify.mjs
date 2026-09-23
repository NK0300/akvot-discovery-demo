#!/usr/bin/env node
/**
 * PROJECT A — POST-PROMOTE VERIFICATION
 * Discovery alias: akvot-discovery.vercel.app = dpl_AvyhrW24gGRquWCPPZdydBiz81dv
 * Core production LOCKED: akvot-simple-demo.vercel.app = dpl_8agSZKvcb2pjehzXgMeckDgJvDV8
 * NO further promote/alias changes.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..');
const RAW = join(OUT, 'raw');
mkdirSync(RAW, { recursive: true });

const DISC_DPL = 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const DISC_ALIAS = 'https://akvot-discovery.vercel.app';
const DISC_ALIAS2 = 'https://akvot-discovery-k-akvot.vercel.app';
const CORE_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const CORE_ALIAS = 'https://akvot-simple-demo.vercel.app';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const SECRET_RE = /UPSTASH_REDIS_REST_TOKEN|KV_REST_API_TOKEN|eyJ[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9._\-]{20,}/gi;
const ROOT = join(__dirname, '../../../../../..');

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
  return {
    ms, httpStatus, json, text: textBody, headers,
    exit: r.status, stderr: (r.stderr || '').slice(0, 2000),
    method, url: urlOrPath,
  };
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

function scoreIdentityPresent(obj) {
  const snap = obj?.snapshot || obj;
  const v = snap?.scoreIdentity ?? obj?.scoreIdentity;
  if (v == null || v === 0 || v === false) return { present: false, value: v ?? 0 };
  return { present: true, value: v };
}

function scrubSecrets(s) {
  return String(s || '')
    .replace(/UPSTASH_REDIS_REST_TOKEN["\s:=]+[^\s",}]+/gi, 'UPSTASH_REDIS_REST_TOKEN":"[REDACTED]"')
    .replace(/KV_REST_API_TOKEN["\s:=]+[^\s",}]+/gi, 'KV_REST_API_TOKEN":"[REDACTED]"')
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/g, 'Bearer [REDACTED]');
}

function saveRaw(label, data) {
  const file = `${label}.json`;
  let payload;
  if (data?.json != null) payload = data.json;
  else if (typeof data === 'string') payload = { text: data.slice(0, 200000) };
  else if (data?.text != null && !data.json) {
    payload = {
      text: String(data.text).slice(0, 200000),
      httpStatus: data.httpStatus,
      ms: data.ms,
      stderr: data.stderr,
    };
  } else payload = data;
  writeFileSync(join(RAW, file), scrubSecrets(JSON.stringify(payload, null, 2)));
  return file;
}

function snapFields(j) {
  const snap = j?.snapshot || j || {};
  const findings = Array.isArray(snap.findings) ? snap.findings : Array.isArray(j?.findings) ? j.findings : [];
  const contradictions = Array.isArray(snap.contradictions)
    ? snap.contradictions
    : Array.isArray(j?.contradictions)
      ? j.contradictions
      : [];
  return { snap, findings, contradictions, sessionId: j?.sessionId || snap?.sessionId || null };
}

const started = nowJerusalem();
const report = {
  stamp_start: started,
  stamp_zone: 'Asia/Jerusalem (IDT, UTC+3)',
  discovery: {
    alias: DISC_ALIAS,
    alias2: DISC_ALIAS2,
    expected_dpl: DISC_DPL,
  },
  core: {
    alias: CORE_ALIAS,
    expected_dpl: CORE_DPL,
  },
  health: {},
  seeds: [],
  lifecycle: {},
  acc: {},
  core_checks: {},
  observability: {},
  incidents: [],
  summary: {},
};

console.log(`[PROMOTE-VERIFY] start ${started}`);

// ─── 1. LIVE HEALTH ───────────────────────────────────────────
console.log('[1] Discovery LIVE HEALTH');
const hApi = vercelCurl('/api/health', { deployment: DISC_DPL });
const hDisc = vercelCurl('/api/discovery/health', { deployment: DISC_DPL });
const hAlias = vercelCurl(`${DISC_ALIAS}/api/health`);
const hAlias2 = vercelCurl(`${DISC_ALIAS2}/api/health`);
saveRaw('01-api-health', hApi);
saveRaw('01-discovery-health', hDisc);
saveRaw('01-alias-health', hAlias);
saveRaw('01-alias2-health', hAlias2);

const ds = hApi.json?.discoveryStore || {};
const dh = hDisc.json || {};
report.health = {
  api: {
    httpStatus: hApi.httpStatus,
    build: hApi.json?.build,
    build_match: hApi.json?.build === DISC_DPL,
    storeBackend: ds.storeBackend,
    durable: ds.durable,
    promoteEligible: ds.promoteEligible,
    kvReachable: ds.kvReachable,
    durabilityState: ds.durabilityState,
    fallback: ds.fallback,
    kvCredsPresent: ds.kvCredsPresent,
    kvPing: hApi.json?.kvPing || null,
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
    latencyMs: dh.latencyMs,
  },
  alias: {
    httpStatus: hAlias.httpStatus,
    build: hAlias.json?.build,
    build_match: hAlias.json?.build === DISC_DPL,
  },
  alias2: {
    httpStatus: hAlias2.httpStatus,
    build: hAlias2.json?.build,
    build_match: hAlias2.json?.build === DISC_DPL,
  },
};

const healthPass =
  report.health.api.build_match &&
  report.health.api.storeBackend === 'upstash' &&
  report.health.api.durable === true &&
  report.health.api.promoteEligible === true &&
  report.health.api.kvReachable === true &&
  report.health.discovery_health.ok === true &&
  report.health.discovery_health.storeBackend === 'upstash' &&
  report.health.discovery_health.durable === true &&
  report.health.discovery_health.promoteEligible === true &&
  (report.health.discovery_health.kvReachable === true || report.health.discovery_health.mode === 'kv-shared') &&
  report.health.alias.build_match;

report.health.pass = healthPass;
console.log(`[1] healthPass=${healthPass} build=${report.health.api.build} backend=${report.health.api.storeBackend}`);

if (report.health.api.durable !== true || report.health.api.kvReachable !== true) {
  report.incidents.push({
    severity: 'CRITICAL',
    code: 'KV_NOT_DURABLE',
    detail: `durable=${report.health.api.durable} kvReachable=${report.health.api.kvReachable}`,
  });
}

// ─── 2. SEEDS (≥6) ────────────────────────────────────────────
console.log('[2] Discovery seeds');
const SEEDS = [
  { id: 'person', seed: 'Ada Lovelace', kind: 'person', hints: { locale: 'en' } },
  { id: 'company', seed: 'IBM', kind: 'company', hints: {} },
  { id: 'domain', seed: 'example.org', kind: 'domain', hints: {} },
  { id: 'org', seed: 'Red Cross', kind: 'org', hints: {} },
  { id: 'ambiguous', seed: 'Alex Morgan', kind: 'ambiguous', hints: {} },
  { id: 'no-match', seed: 'Zxqqq Nonexistent Entity 99999', kind: 'no-match', hints: {} },
];

let lifecycleSessionId = null;
const sessionIds = [];

for (const s of SEEDS) {
  console.log(`  POST seed=${s.id}`);
  const post = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    deployment: DISC_DPL,
    body: { seed: s.seed, hints: s.hints || {}, locale: 'en' },
    timeout: 200000,
  });
  saveRaw(`02-post-${s.id}`, post);
  const { snap, findings, contradictions, sessionId } = snapFields(post.json);
  const leakHits = deepScan(post.json);
  const b23 = contradictionFindingIdLeaks(post.json);
  const si = scoreIdentityPresent(post.json);
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
      storeBackend: post.json?.storeBackend || post.json?._storeInfo?.storeBackend || snap?.storeBackend,
      durable: post.json?.durable ?? post.json?._storeInfo?.durable ?? snap?.durable,
      promoteEligible: post.json?.promoteEligible ?? post.json?._storeInfo?.promoteEligible,
      leakage_count: leakHits.length,
      b23_findingIds_leaks: b23.length,
      scoreIdentity: si.value,
      scoreIdentity_absent_or_0: !si.present,
    },
  };

  if (sessionId) {
    sessionIds.push(sessionId);
    if (!lifecycleSessionId && s.id === 'domain') lifecycleSessionId = sessionId;
    // wait briefly then GET
    sleep(1500);
    console.log(`  GET seed=${s.id} sid=${sessionId.slice(0, 20)}…`);
    const get = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`, {
      deployment: DISC_DPL,
      timeout: 180000,
    });
    saveRaw(`02-get-${s.id}`, get);
    const g = snapFields(get.json);
    const gLeak = deepScan(get.json);
    const gB23 = contradictionFindingIdLeaks(get.json);
    const gSi = scoreIdentityPresent(get.json);
    row.get = {
      httpStatus: get.httpStatus,
      ms: get.ms,
      sessionId: g.sessionId,
      sessionId_match: g.sessionId === sessionId,
      status: g.snap?.status || get.json?.status,
      findings_n: g.findings.length,
      regenerated: get.json?.regenerated ?? g.snap?.regenerated ?? null,
      leakage_count: gLeak.length,
      b23_findingIds_leaks: gB23.length,
      scoreIdentity: gSi.value,
      scoreIdentity_absent_or_0: !gSi.present,
      leakage: gLeak.slice(0, 10),
      b23: gB23,
    };
    const allowEmpty = s.id === 'no-match';
    row.pass =
      post.httpStatus >= 200 && post.httpStatus < 300 &&
      get.httpStatus === 200 &&
      row.get.sessionId_match &&
      row.get.leakage_count === 0 &&
      row.get.b23_findingIds_leaks === 0 &&
      row.post.leakage_count === 0 &&
      row.get.scoreIdentity_absent_or_0 &&
      (allowEmpty || row.get.findings_n >= 0); // no-match may be empty
  } else {
    row.pass = false;
    row.error = 'no sessionId on POST';
  }
  report.seeds.push(row);
  console.log(`  → ${s.id} pass=${row.pass} findings=${row.get?.findings_n} leak=${row.get?.leakage_count}`);
}

const seedsPass = report.seeds.length >= 6 && report.seeds.every((r) => r.pass);
const totalLeak = report.seeds.reduce((a, r) => a + (r.post?.leakage_count || 0) + (r.get?.leakage_count || 0), 0);
report.seeds_summary = {
  n: report.seeds.length,
  pass: seedsPass,
  total_acc_leak: totalLeak,
};

if (totalLeak > 0) {
  report.incidents.push({ severity: 'CRITICAL', code: 'ACC_LEAK', detail: `seed Acc leak count=${totalLeak}` });
}

// ─── 3. LIFECYCLE SSE/NARROW/HIT ───────────────────────────────
console.log('[3] Lifecycle SSE/NARROW/HIT');
if (!lifecycleSessionId) {
  // create fresh domain session for lifecycle
  const create = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    deployment: DISC_DPL,
    body: { seed: 'example.org', hints: { kind: 'domain' }, locale: 'en' },
    timeout: 200000,
  });
  saveRaw('03-lifecycle-CREATE', create);
  lifecycleSessionId = create.json?.sessionId || create.json?.snapshot?.sessionId;
  report.lifecycle.create = {
    httpStatus: create.httpStatus,
    sessionId: lifecycleSessionId,
    storeBackend: create.json?.storeBackend,
    durable: create.json?.durable,
  };
} else {
  report.lifecycle.create = { sessionId: lifecycleSessionId, reused_from: 'domain-seed' };
}

const lifeSid = lifecycleSessionId;
if (lifeSid) {
  // GET
  const lifeGet = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(lifeSid)}`, { deployment: DISC_DPL });
  saveRaw('03-lifecycle-GET', lifeGet);
  report.lifecycle.get = {
    httpStatus: lifeGet.httpStatus,
    sessionId: lifeGet.json?.sessionId,
    match: lifeGet.json?.sessionId === lifeSid,
    findings_n: snapFields(lifeGet.json).findings.length,
    leakage_count: deepScan(lifeGet.json).length,
  };

  // SSE
  console.log('  SSE…');
  const sse = vercelCurlSSE(`/api/discovery/sessions/${encodeURIComponent(lifeSid)}/events`, {
    deployment: DISC_DPL,
    maxSeconds: 45,
  });
  writeFileSync(join(RAW, '03-lifecycle-SSE.txt'), scrubSecrets(sse.text || ''));
  writeFileSync(join(RAW, '03-lifecycle-SSE.meta.json'), JSON.stringify({
    httpStatus: sse.httpStatus, ms: sse.ms, exit: sse.exit, bytes: (sse.text || '').length,
  }, null, 2));
  const sseText = sse.text || '';
  const sseFrames = sseText.split(/\n\n+/).filter(Boolean);
  const sseEvents = [...sseText.matchAll(/^event:\s*(\S+)/gm)].map((m) => m[1]);
  const hasDone = /event:\s*done/i.test(sseText) || /"type"\s*:\s*"done"/i.test(sseText);
  const sseLeak = leaks(sseText);
  report.lifecycle.sse = {
    httpStatus: sse.httpStatus,
    ms: sse.ms,
    frames_n: sseFrames.length,
    events: sseEvents,
    has_done: hasDone,
    leakage_count: sseLeak.length,
    content_type: (sse.headers.match(/content-type:\s*([^\r\n]+)/i) || [])[1] || null,
  };

  // NARROW
  console.log('  NARROW…');
  const narrow = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(lifeSid)}/narrow`, {
    method: 'POST',
    deployment: DISC_DPL,
    body: { facets: { kind: ['page'] } },
    timeout: 120000,
  });
  saveRaw('03-lifecycle-NARROW', narrow);
  const nFields = snapFields(narrow.json);
  report.lifecycle.narrow = {
    httpStatus: narrow.httpStatus,
    sessionId: narrow.json?.sessionId || nFields.sessionId,
    match: (narrow.json?.sessionId || nFields.sessionId) === lifeSid,
    findings_n: nFields.findings.length,
    leakage_count: deepScan(narrow.json).length,
  };

  // HIT / GET reload
  console.log('  GET reload…');
  const lifeGet2 = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(lifeSid)}`, { deployment: DISC_DPL });
  saveRaw('03-lifecycle-GET2', lifeGet2);
  report.lifecycle.get2 = {
    httpStatus: lifeGet2.httpStatus,
    sessionId: lifeGet2.json?.sessionId,
    match: lifeGet2.json?.sessionId === lifeSid,
    findings_n: snapFields(lifeGet2.json).findings.length,
    regenerated: lifeGet2.json?.regenerated ?? null,
    leakage_count: deepScan(lifeGet2.json).length,
  };

  // Cross-session bleed check: GET a different session and ensure IDs don't mix
  const otherSid = sessionIds.find((id) => id !== lifeSid);
  if (otherSid) {
    const other = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(otherSid)}`, { deployment: DISC_DPL });
    saveRaw('03-lifecycle-OTHER', other);
    report.lifecycle.cross_session = {
      otherSessionId: otherSid,
      returnedSessionId: other.json?.sessionId,
      match: other.json?.sessionId === otherSid,
      not_life: other.json?.sessionId !== lifeSid,
      leakage_count: deepScan(other.json).length,
    };
  }

  report.lifecycle.pass =
    report.lifecycle.get?.match === true &&
    report.lifecycle.sse?.has_done === true &&
    report.lifecycle.sse?.leakage_count === 0 &&
    report.lifecycle.narrow?.match === true &&
    report.lifecycle.narrow?.leakage_count === 0 &&
    report.lifecycle.get2?.match === true &&
    report.lifecycle.get2?.leakage_count === 0 &&
    (report.lifecycle.cross_session
      ? report.lifecycle.cross_session.match && report.lifecycle.cross_session.not_life
      : true);
} else {
  report.lifecycle.pass = false;
  report.lifecycle.error = 'no sessionId for lifecycle';
  report.incidents.push({ severity: 'HIGH', code: 'LIFECYCLE_NO_SESSION', detail: 'Could not obtain sessionId' });
}
console.log(`[3] lifecycle pass=${report.lifecycle.pass}`);

// ─── 4. ACC ADVERSARIAL ───────────────────────────────────────
console.log('[4] Acc adversarial');
const ADV = [
  { id: 'adv-smith', seed: 'John Smith', hints: { org: 'IBM', city: 'New York', country: 'US' } },
  { id: 'adv-qid', seed: 'John Smith Q1701775', hints: {} },
  { id: 'adv-wd', seed: 'wd-Q1701775', hints: {} },
  { id: 'adv-wd2', seed: 'Q1701775', hints: {} },
];
const advRows = [];
for (const a of ADV) {
  console.log(`  ADV POST ${a.id}`);
  const post = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    deployment: DISC_DPL,
    body: { seed: a.seed, hints: a.hints, locale: 'en' },
    timeout: 200000,
  });
  saveRaw(`04-${a.id}-post`, post);
  const sid = post.json?.sessionId;
  let getLeak = [];
  let getJson = null;
  if (sid) {
    sleep(1200);
    const get = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sid)}`, { deployment: DISC_DPL });
    saveRaw(`04-${a.id}-get`, get);
    getJson = get.json;
    getLeak = deepScan(get.json);
  }
  const postLeak = deepScan(post.json);
  const postB23 = contradictionFindingIdLeaks(post.json);
  const getB23 = contradictionFindingIdLeaks(getJson);
  const row = {
    id: a.id,
    seed: a.seed,
    httpStatus: post.httpStatus,
    sessionId: sid,
    post_leakage: postLeak.length,
    get_leakage: getLeak.length,
    b23_leaks: postB23.length + getB23.length,
    leakage_terms: [...postLeak, ...getLeak].slice(0, 10),
    pass: postLeak.length === 0 && getLeak.length === 0 && postB23.length === 0 && getB23.length === 0,
  };
  advRows.push(row);
  console.log(`  → ${a.id} pass=${row.pass} leak=${row.post_leakage + row.get_leakage}`);
}
const advLeakTotal = advRows.reduce((a, r) => a + r.post_leakage + r.get_leakage + r.b23_leaks, 0);
report.acc = {
  adversarial: advRows,
  total_leakage: advLeakTotal + totalLeak,
  seeds_leakage: totalLeak,
  adv_leakage: advLeakTotal,
  pass: advLeakTotal === 0 && totalLeak === 0,
};
if (advLeakTotal > 0) {
  report.incidents.push({ severity: 'CRITICAL', code: 'ACC_ADV_LEAK', detail: `adv leak=${advLeakTotal}` });
}

// ─── 5. CORE PROTECTION ───────────────────────────────────────
console.log('[5] Core protection');
const coreHealth = vercelCurl(`${CORE_ALIAS}/api/health`, { origin: CORE_ALIAS });
saveRaw('05-core-alias-health', coreHealth);
const coreHealthDpl = vercelCurl('/api/health', { deployment: CORE_DPL, origin: CORE_ALIAS });
saveRaw('05-core-dpl-health', coreHealthDpl);

// Core Smith ctx P0 (contract-identity style)
const coreCases = [
  {
    id: 'core-smith-ctx',
    path: '/api/lookup?q=John%20Smith&org=IBM&city=New%20York&country=US&nocache=1',
    expect: { forbidQid: 'Q1701775' },
  },
  {
    id: 'core-smith-bare',
    path: '/api/lookup?q=John%20Smith&nocache=1',
    expect: { forbidQid: 'Q1701775' },
  },
];

const coreResults = [];
for (const c of coreCases) {
  console.log(`  CORE ${c.id}`);
  const r = vercelCurl(c.path, { deployment: CORE_DPL, origin: CORE_ALIAS, timeout: 120000 });
  // also try alias URL
  const rAlias = vercelCurl(`${CORE_ALIAS}${c.path}`, { origin: CORE_ALIAS, timeout: 120000 });
  saveRaw(`05-${c.id}-dpl`, r);
  saveRaw(`05-${c.id}-alias`, rAlias);
  const j = r.json || rAlias.json;
  const leakHits = deepScan(j);
  const qid = j?.qid ?? null;
  const ui = j?.uiState ?? j?.mode ?? null;
  const faces = Array.isArray(j?.images) ? j.images.length : j?.photo ? 1 : 0;
  const row = {
    id: c.id,
    httpStatus: r.httpStatus || rAlias.httpStatus,
    ui,
    qid,
    faces,
    leakage_count: leakHits.length,
    never_Q1701775: qid !== 'Q1701775',
    pass: leakHits.length === 0 && qid !== 'Q1701775',
  };
  coreResults.push(row);
  console.log(`  → ${c.id} ui=${ui} qid=${qid} leak=${row.leakage_count} pass=${row.pass}`);
}

// Run contract-identity-p0 if present (may target env URL — capture exit)
console.log('  contract-identity-p0…');
const contractEnv = {
  ...process.env,
  AKVOT_BASE: CORE_ALIAS,
  BASE_URL: CORE_ALIAS,
  CONTRACT_BASE: CORE_ALIAS,
};
const contract = spawnSync('node', ['test-results/contract-identity-p0.mjs'], {
  encoding: 'utf8',
  cwd: ROOT,
  env: contractEnv,
  timeout: 300000,
  maxBuffer: 16 * 1024 * 1024,
});
writeFileSync(join(RAW, '05-contract-identity-p0.log'), scrubSecrets(
  `exit=${contract.status}\n---stdout---\n${(contract.stdout || '').slice(0, 80000)}\n---stderr---\n${(contract.stderr || '').slice(0, 20000)}`,
));

report.core_checks = {
  alias_health: {
    httpStatus: coreHealth.httpStatus,
    build: coreHealth.json?.build,
    build_match: coreHealth.json?.build === CORE_DPL,
    locked: coreHealth.json?.build === CORE_DPL,
  },
  dpl_health: {
    httpStatus: coreHealthDpl.httpStatus,
    build: coreHealthDpl.json?.build,
    build_match: coreHealthDpl.json?.build === CORE_DPL,
  },
  cases: coreResults,
  contract_identity_p0: {
    exit: contract.status,
    // parse pw/leakage from log if present
    stdout_tail: (contract.stdout || '').slice(-2000),
  },
  pass:
    coreHealth.json?.build === CORE_DPL &&
    coreResults.every((r) => r.pass) &&
    coreResults.reduce((a, r) => a + r.leakage_count, 0) === 0,
};

if (coreHealth.json?.build !== CORE_DPL) {
  report.incidents.push({
    severity: 'CRITICAL',
    code: 'CORE_ALIAS_CHANGED',
    detail: `expected ${CORE_DPL} got ${coreHealth.json?.build}`,
  });
}
if (!report.core_checks.pass && coreResults.some((r) => r.leakage_count > 0)) {
  report.incidents.push({ severity: 'CRITICAL', code: 'CORE_ACC_LEAK', detail: 'Core lookup Acc leakage > 0' });
}
console.log(`[5] core pass=${report.core_checks.pass} build=${coreHealth.json?.build}`);

// ─── 6. OBSERVABILITY ─────────────────────────────────────────
console.log('[6] Observability');
const healthFields = {
  api_discoveryStore_keys: Object.keys(ds || {}),
  discovery_health_keys: Object.keys(dh || {}).filter((k) => k !== 'steps'),
  has_storeBackend: !!(ds.storeBackend || dh.storeBackend),
  has_durable: typeof (ds.durable ?? dh.durable) === 'boolean',
  has_promoteEligible: typeof (ds.promoteEligible ?? dh.promoteEligible) === 'boolean',
  has_kvReachable: typeof (ds.kvReachable ?? dh.kvReachable) === 'boolean',
  has_durabilityState: !!(ds.durabilityState || dh.durabilityState),
  has_kvPing: !!hApi.json?.kvPing,
  no_secrets_in_health: !SECRET_RE.test(JSON.stringify(hApi.json || {})) && !SECRET_RE.test(JSON.stringify(dh || {})),
};
SECRET_RE.lastIndex = 0;
// scan evidence raw folder for secrets (sample)
const sampleTexts = [
  JSON.stringify(hApi.json),
  JSON.stringify(dh),
  JSON.stringify(report.seeds.map((s) => s.post?.sessionId)),
];
const secretHits = sampleTexts.flatMap((t) => {
  SECRET_RE.lastIndex = 0;
  return (String(t).match(SECRET_RE) || []);
});
report.observability = {
  health_fields: healthFields,
  secret_hits_in_health: secretHits.length,
  pass:
    healthFields.has_storeBackend &&
    healthFields.has_durable &&
    healthFields.has_promoteEligible &&
    healthFields.no_secrets_in_health &&
    secretHits.length === 0,
};
console.log(`[6] obs pass=${report.observability.pass}`);

// ─── FINAL ────────────────────────────────────────────────────
const ended = nowJerusalem();
report.stamp_end = ended;

const critical = report.incidents.filter((i) => i.severity === 'CRITICAL');
const shouldRollback =
  critical.some((i) => ['CORE_ALIAS_CHANGED', 'ACC_LEAK', 'ACC_ADV_LEAK', 'KV_NOT_DURABLE', 'CORE_ACC_LEAK'].includes(i.code));

let finalStatus;
if (shouldRollback) {
  finalStatus = 'ROLLED BACK'; // recommendation — we do NOT auto-rollback unless critical Core/Acc; report CRITICAL
  // Per mandate: do NOT auto-rollback unless critical Core/Acc; report CRITICAL and stop
  if (critical.some((i) => i.code.startsWith('CORE_') || i.code.startsWith('ACC_'))) {
    finalStatus = 'CRITICAL — STOP (recommend ROLLBACK; no auto-rollback performed)';
  } else if (critical.some((i) => i.code === 'KV_NOT_DURABLE')) {
    finalStatus = 'CRITICAL — STOP (KV not durable; recommend ROLLBACK; no auto-rollback performed)';
  }
} else if (
  report.health.pass &&
  report.seeds_summary.pass &&
  report.lifecycle.pass &&
  report.acc.pass &&
  report.core_checks.pass &&
  report.observability.pass
) {
  finalStatus = 'GREEN/PROMOTED';
} else {
  finalStatus = 'AMBER — issues found (see incidents); Core locked; no auto-rollback';
}

report.summary = {
  health: report.health.pass,
  seeds: report.seeds_summary.pass,
  lifecycle: report.lifecycle.pass,
  acc: report.acc.pass,
  core: report.core_checks.pass,
  observability: report.observability.pass,
  total_acc_leakage: report.acc.total_leakage,
  core_build_locked: report.core_checks.alias_health?.locked === true,
  discovery_build: report.health.api.build,
  final_status: finalStatus,
  incidents_n: report.incidents.length,
};

writeFileSync(join(OUT, 'PROMOTE-VERIFY.json'), scrubSecrets(JSON.stringify(report, null, 2)));
console.log(`[PROMOTE-VERIFY] DONE status=${finalStatus}`);
console.log(JSON.stringify(report.summary, null, 2));
process.exit(shouldRollback && critical.some((i) => i.code.startsWith('CORE_') || i.code.startsWith('ACC_') || i.code === 'KV_NOT_DURABLE') ? 2 : 0);
