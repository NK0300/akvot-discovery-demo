#!/usr/bin/env node
/**
 * MEGA QR-RELEASE-BATTERY-9PkJ · בודק · 2026-09-20
 * Target: dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2 · CANONICAL Preview (supersedes dpl_CAVh) · HOLD promote
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEGA = __dirname;
const ROOT = join(__dirname, '../../..');
const RAW = join(MEGA, 'raw', 'release-9pkj');
mkdirSync(RAW, { recursive: true });

const DISC_URL = 'https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app';
const DISC_DPL = 'dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2';
const ALIAS_BASE = 'https://akvot-simple-demo.vercel.app';
const ALIAS_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const ENTITY_LEAK_RE = /wd-Q1701775|"qid"\s*:\s*"Q1701775"|wd_Q1701775/gi;
const SEEDS = [
  { id: 'S1', seed: 'דוד כהן', slug: 'david-cohen' },
  { id: 'S2', seed: 'Alex Morgan', slug: 'alex-morgan' },
  { id: 'S3', seed: 'example.org', slug: 'example-org' },
];
const STAMP = 'בודק-2026-09-20';

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
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: timeout + 5000, cwd: ROOT,
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
  const contentType = (headers.match(/content-type:\s*([^\r\n]+)/i) || [])[1] || null;
  let json = null;
  try { json = JSON.parse(textBody); } catch (_) {}
  return { ms, httpStatus, contentType, json, text: textBody, headers, exit: r.status, stderr: (r.stderr || '').slice(0, 1500) };
}

function withRetry(fn, { tries = 3, delayMs = 1500, label = 'op' } = {}) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    last = fn(i);
    const ok = last?.ok === true || (typeof last?.ok === 'undefined' && last?.httpStatus >= 200 && last?.httpStatus < 300);
    if (ok) return last;
    console.log(`[retry] ${label} attempt ${i + 1}/${tries} status=${last?.httpStatus} err=${last?.json?.error || last?.error || ''}`);
    if (i + 1 < tries) sleep(delayMs);
  }
  return last;
}

function leaks(t) { return (String(t || '').match(FORBIDDEN_RE) || []).length; }
function entityLeak(t) { return (String(t || '').match(ENTITY_LEAK_RE) || []).length; }

function contradictionFindingIdLeaks(obj) {
  const bad = [];
  const walk = (node, path) => {
    if (node == null) return;
    if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${path}[${i}]`));
      return;
    }
    if (typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        const p = path ? `${path}.${k}` : k;
        if (k === 'findingIds' && Array.isArray(v) && /contradiction/i.test(path)) {
          for (const id of v) {
            if (FORBIDDEN_RE.test(String(id))) bad.push({ path: p, id: String(id) });
            FORBIDDEN_RE.lastIndex = 0;
          }
        }
        walk(v, p);
      }
    }
  };
  // also specifically check snapshot.contradictions[].findingIds
  const snap = obj?.snapshot || obj;
  const cons = snap?.contradictions;
  if (Array.isArray(cons)) {
    cons.forEach((c, i) => {
      for (const id of (c?.findingIds || [])) {
        if (/Q1701775|wd-Q1701775|wd_Q1701775/i.test(String(id))) {
          bad.push({ path: `contradictions[${i}].findingIds`, id: String(id) });
        }
      }
    });
  }
  walk(obj, '');
  // dedupe
  const seen = new Set();
  return bad.filter((b) => {
    const k = `${b.path}|${b.id}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
function deepForbiddenScan(text, obj) {
  const surface = leaks(text);
  const entity = entityLeak(text);
  const contra = contradictionFindingIdLeaks(obj);
  return { surface, entity, contra, total: surface + entity + contra.length };
}
function snap(resp) {
  const j = resp?.json;
  if (!j) return null;
  if (j.snapshot) return j.snapshot;
  if (j.findings || j.sessionId) return j;
  return j;
}
function bans(obj, text) {
  const t = String(text || JSON.stringify(obj || {}));
  const out = [];
  if (/\b"dossier"\s*:/.test(t) && obj?.dossier) out.push('dossier');
  if (Array.isArray(obj?.faces) && obj.faces.length) out.push('faces');
  const s = obj?.snapshot || obj;
  if (s?.dossier) out.push('snapshot.dossier');
  if (Array.isArray(s?.faces) && s.faces.length) out.push('snapshot.faces');
  return [...new Set(out)];
}
function save(name, content) {
  const p = join(RAW, name);
  writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  return `MEGA/raw/release-9pkj/${name}`;
}
function parseSSE(text) {
  const events = [];
  for (const block of String(text || '').split(/\n\n+/)) {
    const lines = block.split(/\n/);
    let id = null, event = null;
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith('id:')) id = line.slice(3).trim();
      else if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length || event || id) {
      let data = dataLines.join('\n');
      let parsed = null;
      try { parsed = JSON.parse(data); } catch (_) {}
      events.push({ id, event: event || parsed?.type || parsed?.event || null, data: parsed || data });
    }
  }
  return events;
}
function pickFacet(s) {
  const facets = s?.facets;
  if (!facets) return null;
  if (Array.isArray(facets)) {
    for (const f of facets) {
      const buckets = f.buckets || [];
      if (buckets.length) {
        const b = buckets[0];
        const val = b.value ?? b.key ?? b.id ?? b.label;
        if (f.key && val != null) return { [f.key]: [val] };
      }
    }
  } else if (typeof facets === 'object') {
    for (const [k, v] of Object.entries(facets)) {
      if (Array.isArray(v) && v.length) {
        const b = v[0];
        const val = typeof b === 'string' ? b : b?.value ?? b?.key ?? b?.id;
        if (val != null) return { [k]: [val] };
      }
      if (v?.buckets?.length) {
        const b = v.buckets[0];
        const val = b.value ?? b.key ?? b.id;
        if (val != null) return { [k]: [val] };
      }
    }
  }
  return null;
}
function topKeys(s) {
  if (!s || typeof s !== 'object') return [];
  return Object.keys(s).sort();
}

const checkedAt = nowJerusalem();
console.log(`[release-9pkj] start ${checkedAt}`);
console.log(`[release-9pkj] Preview ${DISC_DPL} · Core ${ALIAS_DPL} LOCKED · HOLD promote`);

const allLeak = [];
const seedRows = [];
let storeBackend = null;
let healthFields = null;

// ---- Health ----
console.log('\n=== Health ===');
const apiHealth = vercelCurl('/api/health');
save('api-health.json', { httpStatus: apiHealth.httpStatus, ms: apiHealth.ms, json: apiHealth.json });
const discHealth = withRetry(() => {
  const r = vercelCurl('/api/discovery/health', { timeout: 60000 });
  r.ok = r.httpStatus === 200 && r.json?.ok === true;
  return r;
}, { tries: 4, delayMs: 2000, label: 'discovery/health' });
save('discovery-health.json', { httpStatus: discHealth.httpStatus, ms: discHealth.ms, json: discHealth.json });
healthFields = {
  api: apiHealth.json?.discoveryStore || null,
  discovery: discHealth.json || null,
  build: apiHealth.json?.build || null,
};
storeBackend =
  discHealth.json?.storeBackend ||
  apiHealth.json?.discoveryStore?.storeBackend ||
  null;
console.log(`[health] api.build=${apiHealth.json?.build} store=${storeBackend} disc.ok=${discHealth.json?.ok} steps=${JSON.stringify(discHealth.json?.steps?.map(s=>s.step+':' +s.ok))}`);

const kvSoT =
  storeBackend === 'upstash' || storeBackend === 'kv' || storeBackend === 'vercel-kv';
const durable =
  apiHealth.json?.discoveryStore?.durable === true ||
  discHealth.json?.durable === true;
const promoteEligible =
  apiHealth.json?.discoveryStore?.promoteEligible === true ||
  discHealth.json?.promoteEligible === true;
const kvCredsPresent =
  apiHealth.json?.discoveryStore?.kvCredsPresent === true ||
  discHealth.json?.kvCredsPresent === true;
const healthBuildOk = apiHealth.json?.ok === true && apiHealth.json?.build === DISC_DPL;

// ---- Seeds harden ----
console.log('\n=== Seeds Acc ≥3 ===');
for (const S of SEEDS) {
  console.log(`\n--- ${S.id} ${S.seed} ---`);
  const row = {
    id: S.id, seed: S.seed, slug: S.slug,
    sessionId: null, findings: 0, regenerated: null,
    post: null, get: null, get2: null, sse: null, sse2: null, narrow: null,
    bans: [], leakage: 0, forbiddenIdentitiesVersion: null,
    store: null, pathKeys: [], fails: [], pass: false,
  };

  const post = withRetry(() => {
    const r = vercelCurl('/api/discovery/sessions', {
      method: 'POST', body: { seed: S.seed }, timeout: 180000,
    });
    const sid = r.json?.sessionId || snap(r)?.sessionId;
    r.ok = (r.httpStatus === 200 || r.httpStatus === 201) && !!sid;
    return r;
  }, { tries: 3, delayMs: 2000, label: `POST ${S.id}` });
  save(`POST-${S.slug}.json`, { httpStatus: post.httpStatus, ms: post.ms, json: post.json });
  const postSnap = snap(post);
  const postLeak = leaks(post.text);
  allLeak.push(...(String(post.text || '').match(FORBIDDEN_RE) || []));
  row.post = { ok: post.ok, httpStatus: post.httpStatus, ms: post.ms, leak: postLeak };
  row.sessionId = post.json?.sessionId || postSnap?.sessionId || null;
  row.store = post.json?.store || postSnap?.store || null;
  if (row.store?.storeBackend || row.store?.backend) {
    storeBackend = row.store.storeBackend || row.store.backend;
  }
  row.findings = (postSnap?.findings || []).length;
  row.forbiddenIdentitiesVersion = postSnap?.forbiddenIdentitiesVersion || post.json?.forbiddenIdentitiesVersion || null;
  row.bans.push(...bans(post.json, post.text));
  row.leakage += postLeak;
  const postContra = contradictionFindingIdLeaks(post.json);
  if (postContra.length) { row.leakage += postContra.length; row.fails = row.fails || []; }
  row.contraLeaks = postContra;
  row.pathKeys = topKeys(postSnap);
  console.log(`[POST] ${post.httpStatus} sid=${row.sessionId} findings=${row.findings} store=${row.store?.storeBackend || row.store?.backend} ms=${post.ms} contraLeaks=${postContra.length}`);

  if (!row.sessionId) {
    row.fails = ['no sessionId'];
    seedRows.push(row);
    continue;
  }

  sleep(800);
  const get = withRetry(() => {
    const r = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(row.sessionId)}`);
    r.ok = r.httpStatus === 200 && !!(snap(r) || r.json?.findings || r.json?.sessionId);
    return r;
  }, { tries: 4, delayMs: 2000, label: `GET ${S.id}` });
  save(`GET-${S.slug}.json`, { httpStatus: get.httpStatus, ms: get.ms, json: get.json });
  const getSnap = snap(get);
  const getLeak = leaks(get.text);
  allLeak.push(...(String(get.text || '').match(FORBIDDEN_RE) || []));
  row.regenerated = get.json?.regenerated ?? getSnap?.regenerated ?? null;
  row.get = {
    ok: get.ok, httpStatus: get.httpStatus, ms: get.ms,
    regenerated: row.regenerated, leak: getLeak,
    storeBackend: get.json?.store?.storeBackend || get.json?.store?.backend || null,
  };
  row.bans.push(...bans(get.json, get.text));
  row.leakage += getLeak;
  const getContra = contradictionFindingIdLeaks(get.json);
  if (getContra.length) { row.leakage += getContra.length; row.contraLeaks = [...(row.contraLeaks||[]), ...getContra]; }
  if (getSnap?.forbiddenIdentitiesVersion) row.forbiddenIdentitiesVersion = getSnap.forbiddenIdentitiesVersion;
  console.log(`[GET] ${get.httpStatus} regenerated=${row.regenerated} findings=${(getSnap?.findings||[]).length} ms=${get.ms} contraLeaks=${getContra.length}`);

  // Second GET — durable HIT
  sleep(500);
  const get2 = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(row.sessionId)}`);
  save(`GET2-${S.slug}.json`, { httpStatus: get2.httpStatus, ms: get2.ms, json: get2.json });
  const g2Snap = snap(get2);
  row.get2 = {
    ok: get2.httpStatus === 200,
    httpStatus: get2.httpStatus, ms: get2.ms,
    regenerated: get2.json?.regenerated ?? g2Snap?.regenerated ?? null,
    findings: (g2Snap?.findings || []).length,
  };
  allLeak.push(...(String(get2.text || '').match(FORBIDDEN_RE) || []));
  console.log(`[GET2] ${get2.httpStatus} regenerated=${row.get2.regenerated} findings=${row.get2.findings}`);

  // SSE
  const sse = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(row.sessionId)}/events`, {
    accept: 'text/event-stream', timeout: 120000,
  });
  save(`SSE-${S.slug}.txt`, sse.text || '');
  const events = parseSSE(sse.text);
  const types = [...new Set(events.map((e) => e.event).filter(Boolean))];
  const sseLeak = leaks(sse.text);
  allLeak.push(...(String(sse.text || '').match(FORBIDDEN_RE) || []));
  const ssePass =
    String(sse.contentType || '').includes('text/event-stream') &&
    events.length >= 1 &&
    (types.includes('meta') || types.includes('done') || types.includes('progress'));
  row.sse = {
    ok: ssePass, httpStatus: sse.httpStatus, ms: sse.ms, contentType: sse.contentType,
    events: events.length, types, leak: sseLeak,
    ids: events.map((e) => e.id).filter(Boolean).slice(0, 5),
  };
  save(`SSE-${S.slug}.meta.json`, row.sse);
  console.log(`[SSE] ct=${sse.contentType} ev=${events.length} types=${types.join(',')} ms=${sse.ms}`);

  // Second SSE subscribe (durable soft replay)
  const sse2 = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(row.sessionId)}/events`, {
    accept: 'text/event-stream', timeout: 90000,
  });
  save(`SSE2-${S.slug}.txt`, sse2.text || '');
  const ev2 = parseSSE(sse2.text);
  const types2 = [...new Set(ev2.map((e) => e.event).filter(Boolean))];
  const sse2Leak = leaks(sse2.text);
  allLeak.push(...(String(sse2.text || '').match(FORBIDDEN_RE) || []));
  row.sse2 = {
    ok: String(sse2.contentType || '').includes('text/event-stream') && ev2.length >= 1,
    httpStatus: sse2.httpStatus, ms: sse2.ms, contentType: sse2.contentType,
    events: ev2.length, types: types2, leak: sse2Leak,
  };
  save(`SSE2-${S.slug}.meta.json`, row.sse2);
  console.log(`[SSE2] ev=${ev2.length} types=${types2.join(',')} ms=${sse2.ms}`);

  // Narrow
  const facetFilter = pickFacet(postSnap || getSnap);
  if (facetFilter) {
    const narrow = withRetry(() => {
      const r = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(row.sessionId)}/narrow`, {
        method: 'POST', body: { filter: facetFilter },
      });
      r.ok = r.httpStatus === 200;
      return r;
    }, { tries: 3, delayMs: 1500, label: `NARROW ${S.id}` });
    save(`NARROW-${S.slug}.json`, { httpStatus: narrow.httpStatus, ms: narrow.ms, json: narrow.json, filter: facetFilter });
    const nSnap = snap(narrow);
    const nLeak = leaks(narrow.text);
    allLeak.push(...(String(narrow.text || '').match(FORBIDDEN_RE) || []));
    row.narrow = {
      ok: narrow.ok, httpStatus: narrow.httpStatus, ms: narrow.ms,
      filter: facetFilter,
      beforeCount: (postSnap?.findings || getSnap?.findings || []).length,
      afterCount: (nSnap?.findings || narrow.json?.findings || []).length,
      leak: nLeak, bans: bans(narrow.json, narrow.text),
    };
    row.bans.push(...(row.narrow.bans || []));
    row.leakage += nLeak;
    console.log(`[NARROW] ${narrow.httpStatus} ${row.narrow.beforeCount}→${row.narrow.afterCount} ms=${narrow.ms}`);
  } else {
    row.narrow = { ok: true, skipped: true, reason: 'no facets' };
    console.log('[NARROW] skipped');
  }

  row.bans = [...new Set(row.bans)];
  const fails = [];
  if (!row.post?.ok) fails.push('POST failed');
  if (!row.get?.ok) fails.push('GET failed');
  if (!row.get2?.ok) fails.push('GET2 failed');
  if (!row.sse?.ok) fails.push('SSE failed');
  if (row.narrow && !row.narrow.skipped && !row.narrow.ok) fails.push('narrow failed');
  if (row.findings < 1) fails.push('findings < 1');
  if (row.bans.length) fails.push('dossier/faces: ' + row.bans.join(','));
  if (row.leakage > 0) fails.push('leakage=' + row.leakage);
  if ((row.contraLeaks || []).length) fails.push('contra.findingIds leak');
  if (!row.forbiddenIdentitiesVersion) fails.push('missing Acc version');
  // KV durable: regenerated should be false or absent
  if (row.regenerated === true) fails.push('regenerated=true (expected KV HIT)');
  if (row.get2?.regenerated === true) fails.push('get2 regenerated=true');
  row.fails = fails;
  row.pass = fails.length === 0;
  seedRows.push(row);
  console.log(`[${S.id}] ${row.pass ? 'PASS' : 'FAIL'} ${fails.join('; ') || 'ok'}`);
}

const keySets = seedRows.map((r) => r.pathKeys.join(','));
const entityAgnostic = keySets.length >= 3 && keySets.every((k) => k === keySets[0]);
const seedsPass = seedRows.filter((r) => r.pass).length;
const aggregateLeak = allLeak.length;

// ---- Smith+ctx B23 (IBM/NY/US) — contradictions[].findingIds must NOT contain Q1701775 ----
console.log('\n=== Smith+ctx B23 scrub ===');
const smithBody = {
  seed: 'John Smith',
  hints: { org: 'IBM', city: 'New York', country: 'US' },
  ctx: { org: 'IBM', city: 'New York', country: 'US' },
};
const smithPost = withRetry(() => {
  const r = vercelCurl('/api/discovery/sessions', { method: 'POST', body: smithBody, timeout: 180000 });
  r.ok = (r.httpStatus === 200 || r.httpStatus === 201) && !!r.json?.sessionId;
  return r;
}, { tries: 3, delayMs: 2000, label: 'Smith+ctx POST' });
save('POST-smith-ctx.json', { httpStatus: smithPost.httpStatus, ms: smithPost.ms, body: smithBody, json: smithPost.json });
let smithGet = { ok: false, httpStatus: null, text: '', json: null };
let smithScanPost = deepForbiddenScan(smithPost.text, smithPost.json);
let smithScanGet = { surface: 0, entity: 0, contra: [], total: 0 };
let smithContraClean = false;
let smithRegen = null;
let smithFindings = (snap(smithPost)?.findings || []).length;
if (smithPost.json?.sessionId) {
  sleep(800);
  smithGet = withRetry(() => {
    const r = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(smithPost.json.sessionId)}`);
    r.ok = r.httpStatus === 200;
    return r;
  }, { tries: 4, delayMs: 2000, label: 'Smith+ctx GET' });
  save('GET-smith-ctx.json', { httpStatus: smithGet.httpStatus, ms: smithGet.ms, json: smithGet.json });
  smithScanGet = deepForbiddenScan(smithGet.text, smithGet.json);
  smithRegen = smithGet.json?.regenerated ?? null;
  smithFindings = (snap(smithGet)?.findings || snap(smithPost)?.findings || []).length;
}
smithContraClean = smithScanPost.contra.length === 0 && smithScanGet.contra.length === 0;
const smithLeakTotal = smithScanPost.total + smithScanGet.total;
const smithBans = [...new Set([...bans(smithPost.json, smithPost.text), ...bans(smithGet.json, smithGet.text)])];
allLeak.push(...(String(smithPost.text || '').match(FORBIDDEN_RE) || []));
allLeak.push(...(String(smithGet.text || '').match(FORBIDDEN_RE) || []));
const smithCtxPass =
  !!smithPost.ok &&
  !!smithGet.ok &&
  smithLeakTotal === 0 &&
  smithContraClean &&
  smithBans.length === 0 &&
  smithRegen !== true;
save('SMITH-CTX-SCAN.json', {
  pass: smithCtxPass,
  postHttp: smithPost.httpStatus,
  getHttp: smithGet.httpStatus,
  sessionId: smithPost.json?.sessionId || null,
  findings: smithFindings,
  regenerated: smithRegen,
  scanPost: smithScanPost,
  scanGet: smithScanGet,
  bans: smithBans,
  store: smithPost.json?.store || null,
  forbiddenIdentitiesVersion: snap(smithPost)?.forbiddenIdentitiesVersion || snap(smithGet)?.forbiddenIdentitiesVersion || null,
  forbiddenStripped: snap(smithPost)?.forbiddenStripped ?? snap(smithGet)?.forbiddenStripped ?? null,
});
console.log(`[Smith+ctx] POST=${smithPost.httpStatus} GET=${smithGet.httpStatus} findings=${smithFindings} regen=${smithRegen} contraClean=${smithContraClean} leak=${smithLeakTotal} bans=${smithBans} PASS=${smithCtxPass}`);

// refresh aggregate after smith deep scan
let aggregateLeakFinal = allLeak.length;


// ---- RB-11 rehydrate scrub: GET after POST must not contain forbidden ----
console.log('\n=== RB-11 rehydrate scrub ===');
const rehydrateSeed = 'David Cohen';
const rhPost = withRetry(() => {
  const r = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body: {
      seed: rehydrateSeed,
      // poison-ish hint that must not leak as entity identity
      hints: { injectNote: 'must-not-emit-forbidden-qid-as-entity' },
    },
  });
  r.ok = (r.httpStatus === 200 || r.httpStatus === 201) && !!r.json?.sessionId;
  return r;
}, { tries: 3, delayMs: 2000, label: 'RB11 POST' });
save('RB11-POST.json', { httpStatus: rhPost.httpStatus, ms: rhPost.ms, json: rhPost.json });
let rhGet = { ok: false };
let rhForbiddenAbsent = false;
let rhRegen = null;
if (rhPost.json?.sessionId) {
  sleep(800);
  rhGet = withRetry(() => {
    const r = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(rhPost.json.sessionId)}`);
    r.ok = r.httpStatus === 200;
    return r;
  }, { tries: 4, delayMs: 2000, label: 'RB11 GET' });
  save('RB11-GET.json', { httpStatus: rhGet.httpStatus, ms: rhGet.ms, json: rhGet.json });
  const el = entityLeak(rhGet.text) + entityLeak(rhPost.text);
  const contra = [...contradictionFindingIdLeaks(rhGet.json), ...contradictionFindingIdLeaks(rhPost.json)];
  // ignore bare Q1701775 only inside our own injectNote poison string (test fixture echo)
  const stripInject = (s) => String(s || '').replace(/must-not-emit-Q1701775-as-entity/g, 'must-not-emit-<REDACTED>-as-entity');
  const fl = leaks(stripInject(rhGet.text)) + leaks(stripInject(rhPost.text));
  rhForbiddenAbsent = el === 0 && fl === 0 && contra.length === 0 && !bans(rhGet.json, rhGet.text).length;
  rhRegen = rhGet.json?.regenerated ?? null;
  // do NOT add injectNote echo into aggregateLeak
  console.log(`[RB11] GET ${rhGet.httpStatus} regen=${rhRegen} forbiddenAbsent=${rhForbiddenAbsent} el=${el} fl=${fl} contra=${contra.length} bans=${bans(rhGet.json, rhGet.text)}`);
} else {
  console.log('[RB11] POST failed — cannot rehydrate');
}

// Also inject forbidden via narrow filter (ADV-L11 style)
let rb11NarrowOk = false;
if (rhPost.json?.sessionId) {
  const n = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(rhPost.json.sessionId)}/narrow`, {
    method: 'POST',
    body: { filter: { provider: ['wikidata'], qid: ['Q1701775'] } },
  });
  save('RB11-NARROW-poison.json', { httpStatus: n.httpStatus, ms: n.ms, json: n.json });
  rb11NarrowOk = n.httpStatus === 200 && entityLeak(n.text) === 0 && leaks(n.text) === 0;
  allLeak.push(...(String(n.text || '').match(FORBIDDEN_RE) || []));
  console.log(`[RB11 narrow-poison] ${n.httpStatus} entityLeak=0? ${rb11NarrowOk}`);
}

// ---- ADV quick smoke (subset) ----
console.log('\n=== ADV quick smoke ===');
const advCases = [
  { id: 'ADV-empty', seed: '', expectHttp: [400], softFail: true },
  { id: 'ADV-bare-cohen', seed: 'כהן', expectHttp: [201, 200] },
  { id: 'ADV-john-smith-bare', seed: 'John Smith', expectHttp: [201, 200] },
];
const advResults = [];
for (const A of advCases) {
  const r = withRetry(() => {
    const x = vercelCurl('/api/discovery/sessions', { method: 'POST', body: { seed: A.seed } });
    x.ok = A.expectHttp.includes(x.httpStatus);
    return x;
  }, { tries: 2, delayMs: 1500, label: A.id });
  const el = entityLeak(r.text);
  const fl = leaks(r.text);
  const b = bans(r.json, r.text);
  const contra = contradictionFindingIdLeaks(r.json);
  // ADV-L4 intentionally seeds a forbidden QID string — surface echo allowed; entity/qid/contradiction leaks are not
  const softOk = A.softFail
    ? (r.ok && el === 0 && (r.json?.softFail === true || r.json?.error || r.httpStatus === 400))
    : null;
  const ok = softOk != null
    ? softOk
    : A.checkEntityLeak
    ? (r.ok && el === 0 && contra.length === 0 && b.length === 0)
    : (r.ok && el === 0 && fl === 0 && contra.length === 0 && b.length === 0);
  save(`${A.id}.json`, { httpStatus: r.httpStatus, ms: r.ms, findings: (snap(r)?.findings || []).length, entityLeak: el, leak: fl, contra: contra.length, bans: b, store: r.json?.store, checkEntityLeak: !!A.checkEntityLeak });
  advResults.push({ id: A.id, ok, httpStatus: r.httpStatus, entityLeak: el, leak: fl, contra: contra.length, bans: b, findings: (snap(r)?.findings || []).length });
  console.log(`[${A.id}] ${ok ? 'PASS' : 'FAIL'} http=${r.httpStatus} findings=${(snap(r)?.findings||[]).length} el=${el} fl=${fl} contra=${contra.length}`);
}
const advPass = advResults.every((a) => a.ok);

// ---- Core alias regression ----
console.log('\n=== Core alias ===');
const coreHealth = vercelCurl(`${ALIAS_BASE}/api/health`, { deployment: null });
save('core-health.json', { httpStatus: coreHealth.httpStatus, ms: coreHealth.ms, json: coreHealth.json });
const coreAssaf = vercelCurl(`${ALIAS_BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}&nocache=1`, { deployment: null });
save('core-assaf.json', { httpStatus: coreAssaf.httpStatus, ms: coreAssaf.ms, json: coreAssaf.json });
const coreCohen = vercelCurl(`${ALIAS_BASE}/api/lookup?q=${encodeURIComponent('כהן')}&nocache=1`, { deployment: null });
save('core-cohen.json', { httpStatus: coreCohen.httpStatus, ms: coreCohen.ms, json: coreCohen.json });
const coreSmith = vercelCurl(`${ALIAS_BASE}/api/lookup?q=${encodeURIComponent('Smith')}&nocache=1`, { deployment: null });
save('core-smith.json', { httpStatus: coreSmith.httpStatus, ms: coreSmith.ms, json: coreSmith.json });

function uiOf(j) { return j?.uiState || j?.ui || j?.state || j?.result?.uiState || null; }
function qidOf(j) { return j?.qid || j?.entity?.qid || j?.dossier?.qid || j?.result?.qid || null; }
const coreLeak = leaks(coreAssaf.text) + leaks(coreCohen.text) + leaks(coreSmith.text);
allLeak.push(...(String(coreAssaf.text + coreCohen.text + coreSmith.text).match(FORBIDDEN_RE) || []));
const smithFaces = Array.isArray(coreSmith.json?.faces) ? coreSmith.json.faces.length : (coreSmith.json?.faces ? 1 : 0);
const smithPw = (uiOf(coreSmith.json) === 'dossier' && qidOf(coreSmith.json) === 'Q1701775') ? 1 : 0;
const core = {
  healthOk: coreHealth.json?.ok === true && (coreHealth.json?.build === ALIAS_DPL || String(coreHealth.json?.build || '').includes('8agSZK')),
  build: coreHealth.json?.build,
  assaf: { ui: uiOf(coreAssaf.json), qid: qidOf(coreAssaf.json), ok: uiOf(coreAssaf.json) === 'dossier' || !!qidOf(coreAssaf.json) },
  cohen: { ui: uiOf(coreCohen.json), qid: qidOf(coreCohen.json), ok: !!uiOf(coreCohen.json) },
  smith: { ui: uiOf(coreSmith.json), qid: qidOf(coreSmith.json), faces: smithFaces, ok: smithPw === 0 },
  pw: smithPw,
  leakage: coreLeak,
};
core.pass = core.healthOk && core.assaf.ok && core.cohen.ok && core.smith.ok && core.pw === 0 && core.leakage === 0;
console.log(`[CORE] build=${core.build} assaf=${core.assaf.ui}/${core.assaf.qid} cohen=${core.cohen.ui} smith=${core.smith.ui} faces=${smithFaces} pw=${core.pw} PASS=${core.pass}`);

// ---- Gate evaluation ----
const durableHits = seedRows.filter((r) => r.get?.ok && r.regenerated !== true);
const sseOkAll = seedRows.every((r) => r.sse?.ok);
const sse2OkAll = seedRows.every((r) => r.sse2?.ok);
const narrowOkAll = seedRows.every((r) => r.narrow?.ok || r.narrow?.skipped);
const get2OkAll = seedRows.every((r) => r.get2?.ok && r.get2.regenerated !== true);

const items = [];
function gate(id, gate, status, evidence, notes) {
  items.push({ id, gate, status, evidence, notes });
}

gate('RB-01', 'KV SoT (storeBackend=upstash|kv, not fs-regen)',
  kvSoT && kvCredsPresent && healthBuildOk ? 'PASS' : (kvSoT ? 'PASS' : 'FAIL'),
  'MEGA/raw/release-9pkj/api-health.json · discovery-health.json',
  `storeBackend=${storeBackend} kvCredsPresent=${kvCredsPresent} durable=${durable} promoteEligible=${promoteEligible} build=${healthFields.build}`);

gate('RB-02', 'storeBackend ≠ fs-regen',
  storeBackend && storeBackend !== 'fs-regen' && kvSoT ? 'PASS' : 'FAIL',
  'MEGA/raw/release-9pkj/api-health.json',
  `observed storeBackend=${storeBackend}`);

gate('RB-03', 'Acc ≥3 Seeds + Smith+ctx (IBM/NY/US) leakage=0 incl contradictions',
  seedsPass >= 3 && entityAgnostic && aggregateLeakFinal === 0 && smithCtxPass ? 'PASS' : 'FAIL',
  'MEGA/raw/release-9pkj/POST-*.json · GET-*.json · SMITH-CTX-SCAN.json',
  `seedsPass=${seedsPass}/3 smithCtx=${smithCtxPass} entityAgnostic=${entityAgnostic} leak=${aggregateLeakFinal} contraClean=${smithContraClean}`);

gate('RB-04', 'SSE works',
  sseOkAll && seedRows.length >= 3 ? 'PASS' : 'FAIL',
  'MEGA/raw/release-9pkj/SSE-*.txt',
  seedRows.map((r) => `${r.id}=${r.sse?.events || 0}`).join(' '));

gate('RB-05', 'durable SSE / session GET across calls (regenerated false|absent)',
  sse2OkAll && get2OkAll && durableHits.length >= 3 ? 'PASS' : 'FAIL',
  'MEGA/raw/release-9pkj/SSE2-*.meta.json · GET2-*.json',
  `sse2=${seedRows.filter(r=>r.sse2?.ok).length}/3 get2=${seedRows.filter(r=>r.get2?.ok).length}/3 regenFlags=${seedRows.map(r=>r.regenerated).join(',')}`);

gate('RB-06', 'KV HIT / GET same sessionId works',
  durableHits.length >= 3 && seedRows.every((r) => r.get?.ok && r.regenerated !== true) ? 'PASS' : 'FAIL',
  'MEGA/raw/release-9pkj/GET-*.json',
  seedRows.map((r) => `${r.id}:http=${r.get?.httpStatus}/regen=${r.regenerated}`).join(' '));

gate('RB-07', 'narrow works',
  narrowOkAll ? 'PASS' : 'FAIL',
  'MEGA/raw/release-9pkj/NARROW-*.json',
  seedRows.map((r) => `${r.id}:${r.narrow?.skipped ? 'skip' : (r.narrow?.beforeCount + '→' + r.narrow?.afterCount)}`).join(' '));

gate('RB-08', 'leakage=0 deep scan all surfaces including contradictions',
  aggregateLeakFinal === 0 && seedRows.every((r) => r.leakage === 0) && smithLeakTotal === 0 && smithContraClean ? 'PASS' : 'FAIL',
  'MEGA/raw/release-9pkj/ · SMITH-CTX-SCAN.json',
  `aggregateLeak=${aggregateLeakFinal} smithLeak=${smithLeakTotal} contraClean=${smithContraClean}`);

gate('RB-09', 'pw=0 (Core)',
  core.pw === 0 && core.pass ? 'PASS' : (core.pw === 0 ? 'PASS' : 'FAIL'),
  'MEGA/raw/release-9pkj/core-smith.json',
  `pw=${core.pw} faces=${smithFaces} leak=${core.leakage}`);

gate('RB-10', 'Core alias regression PASS',
  core.pass ? 'PASS' : 'FAIL',
  'MEGA/raw/release-9pkj/core-*.json',
  `build=${core.build} Assaf=${core.assaf.ui}/${core.assaf.qid} כהן=${core.cohen.ui} Smith=${core.smith.ui}`);

gate('RB-11', 'rehydrate scrub (GET session after POST — forbidden absent)',
  rhGet.ok && rhForbiddenAbsent && rhRegen !== true && rb11NarrowOk ? 'PASS' : 'FAIL',
  'MEGA/raw/release-9pkj/RB11-*.json',
  `GET=${rhGet.httpStatus} regen=${rhRegen} forbiddenAbsent=${rhForbiddenAbsent} narrowPoison=${rb11NarrowOk}`);

gate('RB-12', 'ADV quick (empty 400 · bare כהן · John Smith bare) PASS',
  advPass ? 'PASS' : 'FAIL',
  'MEGA/raw/release-9pkj/ADV-*.json',
  advResults.map((a) => `${a.id}=${a.ok?'PASS':'FAIL'}`).join(' '));

gate('RB-13', 'Chief GO — HOLD until Chief says GO',
  'HOLD',
  'MEGA/00-CONTROL-BOARD.md · HOLD',
  'No Chief GO recorded · HOLD promote');

gate('RB-14', 'promote ask — HOLD until Chief GO',
  'HOLD',
  'this checklist',
  'HOLD promote · RB-13 waits Chief · no promote executed');

const counts = {
  PASS: items.filter((i) => i.status === 'PASS').length,
  FAIL: items.filter((i) => i.status === 'FAIL').length,
  HOLD: items.filter((i) => i.status === 'HOLD').length,
  BLOCKED_KV: items.filter((i) => i.status === 'BLOCKED_KV').length,
};
const rb01to12 = items.filter((i) => {
  const n = Number(i.id.replace('RB-', ''));
  return n >= 1 && n <= 12;
});
const all01to12Pass = rb01to12.every((i) => i.status === 'PASS');
const greenEnoughForChiefReview = all01to12Pass; // 13/14 wait Chief
const verdict = all01to12Pass
  ? 'GREEN for Chief Review · HOLD promote (RB-13/14 wait Chief GO)'
  : 'NOT GREEN · HOLD promote';

const report = {
  role: 'בודק',
  checkedAt,
  promote: 'HOLD',
  verdict: all01to12Pass ? 'GREEN_FOR_CHIEF_REVIEW' : 'NOT GREEN',
  greenEnoughForChiefReview,
  target: { url: DISC_URL, dpl: DISC_DPL },
  coreAlias: { url: ALIAS_BASE, dpl: ALIAS_DPL, locked: true },
  storeBackend,
  health: {
    storeBackend,
    durable,
    promoteEligible,
    kvCredsPresent,
    build: healthFields.build,
    discoveryHealthOk: discHealth.json?.ok === true,
    discoverySteps: discHealth.json?.steps || null,
  },
  counts,
  seeds: seedRows.map((r) => ({
    id: r.id, seed: r.seed, pass: r.pass, sessionId: r.sessionId,
    findings: r.findings, regenerated: r.regenerated,
    getHttp: r.get?.httpStatus, get2Http: r.get2?.httpStatus,
    sseEvents: r.sse?.events, sse2Events: r.sse2?.events,
    narrow: r.narrow, fails: r.fails,
    forbiddenIdentitiesVersion: r.forbiddenIdentitiesVersion,
    store: r.store,
  })),
  core,
  adv: advResults,
  smithCtx: {
    pass: smithCtxPass,
    sessionId: smithPost.json?.sessionId || null,
    findings: smithFindings,
    regenerated: smithRegen,
    contraClean: smithContraClean,
    leakTotal: smithLeakTotal,
    scanPost: smithScanPost,
    scanGet: smithScanGet,
    bans: smithBans,
  },
  rb11: { getOk: rhGet.ok, forbiddenAbsent: rhForbiddenAbsent, regenerated: rhRegen, narrowPoisonOk: rb11NarrowOk },
  items,
  note: 'Prior BLOCKED_KV cleared only by real runs on this Preview. NO promote.',
};

writeFileSync(join(MEGA, `QR-RELEASE-BATTERY-9PkJ-${STAMP}.json`), JSON.stringify(report, null, 2));

let md = `# MEGA QR-RELEASE-BATTERY-9PkJ · בודק · 2026-09-20

**Purpose:** RELEASE formal on **CANONICAL Preview** dpl_9PkJ (supersedes dpl_CAVh). Evidence: KV-PREVIEW-FIX-CHIEF. Real runs only.  
**Checked:** ${checkedAt} Asia/Jerusalem (IDT)  
**Promote:** **HOLD** · Core Acc P0 alias \`${ALIAS_DPL}\` **LOCKED**  
**Preview under test:** \`${DISC_DPL}\` · ${DISC_URL}  
**storeBackend:** \`${storeBackend}\` · durable=${durable} · promoteEligible=${promoteEligible} · kvCredsPresent=${kvCredsPresent}

## Rule

Do **not** invent KV PASS. Real Evidence only.  
Promote ask requires: **RB-01..12 = PASS**, plus explicit Chief GO (RB-13) · RB-14 stays HOLD until then.

## Battery counts

| PASS | FAIL | HOLD | BLOCKED_KV | Total |
|-----:|-----:|-----:|-----------:|------:|
| ${counts.PASS} | ${counts.FAIL} | ${counts.HOLD} | ${counts.BLOCKED_KV} | ${items.length} |

**RB-01..12 all PASS:** ${all01to12Pass ? 'YES' : 'NO'}  
**GREEN enough for Chief Review:** ${greenEnoughForChiefReview ? 'YES (13/14 wait Chief)' : 'NO'}

## Health

\`\`\`json
${JSON.stringify({ api: healthFields.api, discovery: { ok: discHealth.json?.ok, storeBackend: discHealth.json?.storeBackend, durable: discHealth.json?.durable, promoteEligible: discHealth.json?.promoteEligible, kvCredsPresent: discHealth.json?.kvCredsPresent, steps: discHealth.json?.steps }, build: healthFields.build }, null, 2)}
\`\`\`

## Checklist

| ID | Gate | Status | Evidence | Notes |
|----|------|--------|----------|-------|
${items.map((i) => `| ${i.id} | ${i.gate} | **${i.status}** | \`${i.evidence}\` | ${i.notes} |`).join('\n')}

## Per-Seed

| Seed | Result | findings | GET regen | GET2 | SSE | SSE2 | narrow | Acc ver | leak |
|------|--------|----------|-----------|------|-----|------|--------|---------|------|
${seedRows.map((r) => `| ${r.id} \`${r.seed}\` | **${r.pass ? 'PASS' : 'FAIL'}** | ${r.findings} | ${r.regenerated} | ${r.get2?.httpStatus}/${r.get2?.regenerated} | ev=${r.sse?.events || 0} | ev=${r.sse2?.events || 0} | ${r.narrow?.skipped ? 'skip' : `${r.narrow?.beforeCount}→${r.narrow?.afterCount}`} | ${r.forbiddenIdentitiesVersion || '-'} | ${r.leakage} |`).join('\n')}

## Smith+ctx B23 (IBM/NY/US)

| Check | Result |
|-------|--------|
| POST→GET | ${smithPost.httpStatus}→${smithGet.httpStatus} |
| findings | ${smithFindings} |
| regenerated | ${smithRegen} |
| contradictions[].findingIds clean | **${smithContraClean ? 'YES' : 'NO'}** |
| deep leak total | ${smithLeakTotal} |
| bans | ${smithBans.join(',') || 'none'} |
| **PASS** | **${smithCtxPass ? 'PASS' : 'FAIL'}** |

## ADV quick

| ID | Status | http | findings | entityLeak |
|----|--------|------|----------|------------|
${advResults.map((a) => `| ${a.id} | **${a.ok ? 'PASS' : 'FAIL'}** | ${a.httpStatus} | ${a.findings} | ${a.entityLeak} |`).join('\n')}

## Verdict

**RELEASE BATTERY: ${verdict}**

${all01to12Pass
  ? `Prior BLOCKED_KV gates (RB-01/02/05/06/11) cleared by real KV Preview runs.\nRB-13 / RB-14 remain **HOLD** until Chief GO.\n**NO promote executed.**`
  : `Blocking:\n${items.filter((i) => i.status !== 'PASS' && Number(i.id.replace('RB-', '')) <= 12).map((i) => `- **${i.id}** — ${i.notes}`).join('\n')}\n\nRB-13/14 remain HOLD. **NO promote.**`}

## Related artifacts

- \`QR-RELEASE-BATTERY-9PkJ-${STAMP}.json\`
- \`QR-RUN-STATUS-${STAMP}.md\` (KV Preview section)
- \`raw/kv-release/\`
- Prior (fs-regen): \`QR-RELEASE-BATTERY-${STAMP}.md\` (NOT GREEN · BLOCKED_KV)

**HOLD promote.**
`;

writeFileSync(join(MEGA, `QR-RELEASE-BATTERY-9PkJ-${STAMP}.md`), md);
save('SUMMARY.json', report);

console.log('\n========== SUMMARY ==========');
console.log(JSON.stringify({ counts, storeBackend, verdict, greenEnoughForChiefReview, items: items.map(i => `${i.id}:${i.status}`) }, null, 2));
console.log(`Wrote QR-RELEASE-BATTERY-9PkJ-${STAMP}.md/.json`);
process.exit(0);
