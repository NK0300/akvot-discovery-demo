#!/usr/bin/env node
/**
 * Phase B HARDEN QA · בודק · 2026-09-20
 * NEW Preview only · MEASURE · NO promote
 * Prior dpl_BvWg results DO NOT carry over.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const RAW = join(__dirname, 'PHASE-B-HARDEN-QA-raw');
mkdirSync(RAW, { recursive: true });

const DISC_URL = 'https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app';
const DISC_DPL = 'dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB';
const ALIAS_BASE = 'https://akvot-simple-demo.vercel.app';
const ALIAS_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const SEEDS = [
  { id: 'S1', seed: 'דוד כהן', slug: 'david-cohen' },
  { id: 'S2', seed: 'Alex Morgan', slug: 'alex-morgan' },
  { id: 'S3', seed: 'example.org', slug: 'example-org' },
];

const OUT_JSON = join(__dirname, 'PHASE-B-HARDEN-QA-בודק-2026-09-20.json');
const OUT_MD = join(__dirname, 'PHASE-B-HARDEN-QA-בודק-2026-09-20.md');
const OUT_EVIDENCE = join(__dirname, 'PHASE-B-HARDEN-EVIDENCE-בודק-2026-09-20.md');

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

function vercelCurl(urlOrPath, {
  method = 'GET',
  body = null,
  deployment = null,
  extra = [],
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
    '-sS',
    '-o', bodyFile,
    '-D', hdrFile,
    '-w', '%{http_code}',
    '-H', `Accept: ${accept}`,
    '-H', `Origin: ${ALIAS_BASE}`,
  );
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  }
  for (const e of extra) args.push(e);
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout,
    cwd: ROOT,
  });
  const ms = Date.now() - t0;
  let headers = '';
  let textBody = '';
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
  return {
    url: urlOrPath,
    method,
    body,
    ms,
    exit: r.status,
    httpStatus,
    contentType,
    json,
    text: textBody,
    headers,
    stderr: (r.stderr || '').slice(0, 2000),
  };
}

function leaks(text) {
  const hits = String(text || '').match(FORBIDDEN_RE) || [];
  return hits.map((x) => x.toLowerCase());
}

function hasDossierOrFaces(obj, text) {
  const t = String(text || JSON.stringify(obj || {}));
  const bans = [];
  if (/\b"dossier"\s*:/.test(t) || (obj && Object.prototype.hasOwnProperty.call(obj, 'dossier') && obj.dossier)) {
    bans.push('dossier');
  }
  // Discovery must not expose faces array / faces truthy commit
  if (/\b"faces"\s*:\s*\[/.test(t) || (Array.isArray(obj?.faces) && obj.faces.length)) {
    bans.push('faces');
  }
  if (/\b"photoUrl"\s*:/.test(t) && /identity|dossier|faces/i.test(t)) {
    bans.push('photoUrl');
  }
  // also check nested snapshot
  const snap = obj?.snapshot || obj;
  if (snap && typeof snap === 'object') {
    if (snap.dossier) bans.push('snapshot.dossier');
    if (Array.isArray(snap.faces) && snap.faces.length) bans.push('snapshot.faces');
  }
  return [...new Set(bans)];
}

function extractSnapshot(resp) {
  const j = resp?.json;
  if (!j) return null;
  if (j.snapshot) return j.snapshot;
  if (j.findings || j.sessionId) return j;
  return j;
}

function evidenceWithProv(snap) {
  const findings = snap?.findings || [];
  const evidence = snap?.evidence || [];
  const byId = new Map(evidence.map((e) => [e.id, e]));
  let withProv = 0;
  let findingsOk = 0;
  for (const f of findings) {
    const ids = f.evidenceIds || f.evidence || [];
    const ok = (Array.isArray(ids) ? ids : []).some((id) => {
      const e = byId.get(id) || (typeof id === 'object' ? id : null);
      const url = e?.provenanceUrl || e?.url;
      return url && String(url).startsWith('http');
    });
    // also accept finding-level provenanceUrl
    const fProv = f.provenanceUrl || f.url;
    if (ok || (fProv && String(fProv).startsWith('http'))) {
      withProv++;
      findingsOk++;
    } else if (f.id && f.kind) {
      // count finding present even if we check evidence separately
    }
  }
  // alternate: count evidence items with provenanceUrl
  const evProv = evidence.filter((e) => e?.provenanceUrl && String(e.provenanceUrl).startsWith('http')).length;
  return { findingsCount: findings.length, findingsWithProv: withProv, evidenceCount: evidence.length, evidenceWithProv: evProv };
}

function topKeys(snap) {
  if (!snap || typeof snap !== 'object') return [];
  return Object.keys(snap).sort();
}

function pickFacet(snap) {
  const facets = snap?.facets;
  if (!facets) return null;
  // facets may be array of {key,label,buckets} or object map
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

function parseSSE(text) {
  const events = [];
  const blocks = String(text || '').split(/\n\n+/);
  for (const block of blocks) {
    const lines = block.split(/\n/);
    let id = null;
    let event = null;
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith('id:')) id = line.slice(3).trim();
      else if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length || event || id) {
      let data = dataLines.join('\n');
      let parsed = null;
      try {
        parsed = JSON.parse(data);
      } catch (_) {}
      events.push({ id, event: event || parsed?.type || parsed?.event || null, data: parsed || data });
    }
  }
  return events;
}

function save(name, content) {
  const p = join(RAW, name);
  writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  return p;
}

function assertSeed(result) {
  const fails = [];
  if (!result.post?.ok) fails.push('POST failed');
  if (!result.get?.ok) fails.push('GET session failed');
  if (!result.sse?.ok && !result.poll?.ok) fails.push('SSE/poll failed');
  if (result.narrowAttempted && !result.narrow?.ok) fails.push('narrow failed');
  if (result.findings < 1) fails.push('findings < 1');
  if (result.findingsWithProv < 1 && result.evidenceWithProv < 1) fails.push('no provenanceUrl');
  if (result.bans.length) fails.push('dossier/faces: ' + result.bans.join(','));
  if (result.leakage > 0) fails.push('leakage=' + result.leakage);
  if (!result.forbiddenIdentitiesVersion) fails.push('missing forbiddenIdentitiesVersion');
  return fails;
}

console.log(`[harden-qa] start ${nowJerusalem()} dpl=${DISC_DPL}`);

// --- health ---
const health = vercelCurl('/api/health', { deployment: DISC_DPL });
save('preview-health.json', { httpStatus: health.httpStatus, json: health.json, ms: health.ms, text: health.text });
const healthOk = health.json?.ok === true && health.json?.build === DISC_DPL;
console.log(`[health] ok=${healthOk} build=${health.json?.build} status=${health.httpStatus}`);

const seedResults = [];
const allLeakHits = [];
const pathShapes = [];

for (const S of SEEDS) {
  console.log(`\n=== ${S.id} seed=${S.seed} ===`);
  const row = {
    id: S.id,
    seed: S.seed,
    post: null,
    get: null,
    sse: null,
    poll: null,
    narrow: null,
    narrowAttempted: false,
    findings: 0,
    findingsWithProv: 0,
    evidenceWithProv: 0,
    bans: [],
    leakage: 0,
    forbiddenIdentitiesVersion: null,
    regenerated: null,
    store: null,
    status: null,
    sessionId: null,
    pathKeys: [],
    fails: [],
  };

  // 1. POST
  const post = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body: { seed: S.seed },
    deployment: DISC_DPL,
  });
  save(`POST-${S.slug}.json`, { httpStatus: post.httpStatus, ms: post.ms, json: post.json, text: post.text.slice(0, 500000) });
  const postSnap = extractSnapshot(post);
  const postLeak = leaks(post.text);
  allLeakHits.push(...postLeak);
  const postBans = hasDossierOrFaces(post.json, post.text);
  row.post = {
    ok: (post.httpStatus === 200 || post.httpStatus === 201) && !!(post.json?.sessionId || postSnap?.sessionId || post.json?.ok !== false),
    httpStatus: post.httpStatus,
    ms: post.ms,
    leak: postLeak.length,
    bans: postBans,
  };
  row.sessionId = post.json?.sessionId || postSnap?.sessionId || null;
  row.store = post.json?.store || postSnap?.store || null;
  row.status = postSnap?.status || post.json?.status || null;
  row.forbiddenIdentitiesVersion =
    postSnap?.forbiddenIdentitiesVersion || post.json?.forbiddenIdentitiesVersion || null;
  const postProv = evidenceWithProv(postSnap || {});
  row.findings = postProv.findingsCount;
  row.findingsWithProv = postProv.findingsWithProv;
  row.evidenceWithProv = postProv.evidenceWithProv;
  row.bans.push(...postBans);
  row.leakage += postLeak.length;
  row.pathKeys = topKeys(postSnap);
  pathShapes.push({ seed: S.seed, keys: row.pathKeys });
  console.log(`[POST] status=${post.httpStatus} sid=${row.sessionId} findings=${row.findings} ms=${post.ms}`);

  if (!row.sessionId) {
    row.fails = assertSeed(row);
    seedResults.push(row);
    continue;
  }

  const encId = encodeURIComponent(row.sessionId);

  // 2. GET session (durable / fs-regen)
  const get = vercelCurl(`/api/discovery/sessions/${encId}`, { deployment: DISC_DPL });
  save(`GET-${S.slug}.json`, { httpStatus: get.httpStatus, ms: get.ms, json: get.json, text: get.text.slice(0, 500000) });
  const getSnap = extractSnapshot(get);
  const getLeak = leaks(get.text);
  allLeakHits.push(...getLeak);
  const getBans = hasDossierOrFaces(get.json, get.text);
  row.regenerated = get.json?.regenerated ?? getSnap?.regenerated ?? get.json?.store?.regenerated ?? null;
  const getProv = evidenceWithProv(getSnap || {});
  row.get = {
    ok: get.httpStatus === 200 && (get.json?.ok === true || !!getSnap?.findings || !!get.json?.sessionId),
    httpStatus: get.httpStatus,
    ms: get.ms,
    findings: getProv.findingsCount,
    regenerated: row.regenerated,
    leak: getLeak.length,
    bans: getBans,
    forbiddenIdentitiesVersion: getSnap?.forbiddenIdentitiesVersion || get.json?.forbiddenIdentitiesVersion || null,
  };
  row.bans.push(...getBans);
  row.leakage += getLeak.length;
  if (row.get.forbiddenIdentitiesVersion) row.forbiddenIdentitiesVersion = row.get.forbiddenIdentitiesVersion;
  // prefer GET counts if available
  if (getProv.findingsCount > 0) {
    row.findings = getProv.findingsCount;
    row.findingsWithProv = getProv.findingsWithProv;
    row.evidenceWithProv = getProv.evidenceWithProv;
  }
  console.log(`[GET] status=${get.httpStatus} regenerated=${row.regenerated} findings=${row.get.findings} ms=${get.ms}`);

  // 3. SSE / events (smoke) — short timeout via max-time
  const sse = vercelCurl(`/api/discovery/sessions/${encId}/events`, {
    deployment: DISC_DPL,
    accept: 'text/event-stream',
    extra: ['-N', '--max-time', '25'],
    timeout: 40000,
  });
  save(`SSE-${S.slug}.txt`, `HTTP=${sse.httpStatus}\nCT=${sse.contentType}\n\n${sse.headers}\n\n${sse.text}`);
  const sseEvents = parseSSE(sse.text);
  const sseTypes = sseEvents.map((e) => e.event).filter(Boolean);
  const sseLeak = leaks(sse.text);
  allLeakHits.push(...sseLeak);
  const sseOk =
    (sse.contentType && /text\/event-stream/i.test(sse.contentType)) ||
    sseEvents.length > 0 ||
    /event:|data:/.test(sse.text);
  row.sse = {
    ok: !!sseOk,
    httpStatus: sse.httpStatus,
    contentType: sse.contentType,
    eventCount: sseEvents.length,
    types: [...new Set(sseTypes)],
    hasCursorIds: sseEvents.some((e) => e.id != null && e.id !== ''),
    leak: sseLeak.length,
    ms: sse.ms,
  };
  row.leakage += sseLeak.length;
  console.log(`[SSE] ok=${row.sse.ok} ct=${sse.contentType} events=${sseEvents.length} types=${row.sse.types.join(',')}`);

  // fallback poll if SSE weak
  if (!row.sse.ok) {
    const poll = vercelCurl(`/api/discovery/sessions/${encId}`, { deployment: DISC_DPL });
    row.poll = { ok: poll.httpStatus === 200, httpStatus: poll.httpStatus, ms: poll.ms };
  }

  // 4. Narrow with facet if present
  const facetSource = getSnap || postSnap;
  const facetFilter = pickFacet(facetSource);
  if (facetFilter) {
    row.narrowAttempted = true;
    const narrow = vercelCurl(`/api/discovery/sessions/${encId}/narrow`, {
      method: 'POST',
      body: { facets: facetFilter },
      deployment: DISC_DPL,
    });
    save(`NARROW-${S.slug}.json`, {
      httpStatus: narrow.httpStatus,
      ms: narrow.ms,
      filter: facetFilter,
      json: narrow.json,
      text: narrow.text.slice(0, 500000),
    });
    const nSnap = extractSnapshot(narrow);
    const nLeak = leaks(narrow.text);
    allLeakHits.push(...nLeak);
    const nBans = hasDossierOrFaces(narrow.json, narrow.text);
    const nProv = evidenceWithProv(nSnap || {});
    const before = row.findings;
    const after = nProv.findingsCount || nSnap?.findings?.length || narrow.json?.afterCount || null;
    row.narrow = {
      ok: (narrow.httpStatus === 200 || narrow.httpStatus === 201) && (narrow.json?.ok !== false),
      httpStatus: narrow.httpStatus,
      ms: narrow.ms,
      filter: facetFilter,
      beforeCount: before,
      afterCount: after,
      version: nSnap?.version ?? narrow.json?.version ?? null,
      leak: nLeak.length,
      bans: nBans,
      forbiddenIdentitiesVersion: nSnap?.forbiddenIdentitiesVersion || null,
    };
    row.bans.push(...nBans);
    row.leakage += nLeak.length;
    console.log(`[NARROW] status=${narrow.httpStatus} filter=${JSON.stringify(facetFilter)} before=${before} after=${after}`);
  } else {
    console.log(`[NARROW] skipped — no facets`);
    row.narrow = { ok: true, skipped: true, reason: 'no facets present' };
  }

  row.bans = [...new Set(row.bans)];
  row.fails = assertSeed(row);
  row.pass = row.fails.length === 0;
  seedResults.push(row);
  console.log(`[${S.id}] ${row.pass ? 'PASS' : 'FAIL'} fails=${row.fails.join('; ') || 'none'}`);
}

// --- Core regression ---
console.log('\n=== CORE alias regression ===');
const coreHealth = vercelCurl(`${ALIAS_BASE}/api/health`);
save('core-health.json', coreHealth.json || coreHealth.text);

const coreAssaf = vercelCurl(`${ALIAS_BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}&nocache=1`);
save('core-assaf.json', coreAssaf.json || coreAssaf.text);

const coreCohen = vercelCurl(`${ALIAS_BASE}/api/lookup?q=${encodeURIComponent('כהן')}&nocache=1`);
save('core-cohen.json', coreCohen.json || coreCohen.text);

const coreSmith = vercelCurl(`${ALIAS_BASE}/api/lookup`, {
  method: 'POST',
  body: { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' }, nocache: 1 },
});
save('core-smith.json', coreSmith.json || coreSmith.text);

const coreLeak = [
  ...leaks(JSON.stringify(coreAssaf.json || {})),
  ...leaks(JSON.stringify(coreCohen.json || {})),
  ...leaks(JSON.stringify(coreSmith.json || {})),
];
allLeakHits.push(...coreLeak);

function uiOf(j) {
  return j?.uiState || j?.ui || j?.state || j?.result?.uiState || null;
}
function qidOf(j) {
  return j?.qid || j?.entity?.qid || j?.dossier?.qid || j?.result?.qid || null;
}

const core = {
  health: {
    ok: coreHealth.json?.build === ALIAS_DPL,
    build: coreHealth.json?.build,
    expect: ALIAS_DPL,
  },
  assaf: {
    ok: uiOf(coreAssaf.json) === 'dossier' && String(qidOf(coreAssaf.json) || '').includes('Q47507930'),
    ui: uiOf(coreAssaf.json),
    qid: qidOf(coreAssaf.json),
    ms: coreAssaf.ms,
  },
  cohen: {
    ok: uiOf(coreCohen.json) !== 'dossier' && uiOf(coreCohen.json) != null,
    ui: uiOf(coreCohen.json),
    ms: coreCohen.ms,
  },
  smith: {
    ok:
      uiOf(coreSmith.json) != null &&
      uiOf(coreSmith.json) !== 'dossier' &&
      leaks(JSON.stringify(coreSmith.json || {})).length === 0,
    ui: uiOf(coreSmith.json),
    faces: coreSmith.json?.faces ?? coreSmith.json?.images?.length ?? null,
    ms: coreSmith.ms,
  },
  leakage: coreLeak.length,
};
core.pass =
  core.health.ok && core.assaf.ok && core.cohen.ok && core.smith.ok && core.leakage === 0;
console.log(`[CORE] health=${core.health.build} assaf=${core.assaf.ui}/${core.assaf.qid} cohen=${core.cohen.ui} smith=${core.smith.ui} leak=${core.leakage} PASS=${core.pass}`);

// Entity-agnostic path shape
const keySets = pathShapes.map((p) => p.keys.join(','));
const entityAgnostic = keySets.length >= 3 && keySets.every((k) => k === keySets[0]);

const discPass = healthOk && seedResults.every((r) => r.pass) && entityAgnostic;
const overallLeak = allLeakHits.length;
const overall = discPass && core.pass && overallLeak === 0 ? 'PASS' : 'FAIL';

const report = {
  role: 'בודק',
  phase: 'PHASE-B-HARDEN-QA',
  checkedAt: nowJerusalem(),
  zone: 'Asia/Jerusalem (IDT / UTC+3)',
  measureOnly: true,
  promote: 'NOT DONE',
  priorPreviewNote: 'dpl_BvWg results DO NOT carry over — fresh run',
  target: {
    url: DISC_URL,
    dpl: DISC_DPL,
    healthBuildMatch: healthOk,
    origin: ALIAS_BASE,
  },
  overall,
  discovery: {
    pass: discPass,
    healthOk,
    leakage: overallLeak,
    entityAgnostic,
    pathKeys: pathShapes[0]?.keys || [],
    seeds: seedResults,
  },
  core: {
    pass: core.pass,
    alias: ALIAS_BASE,
    expectDpl: ALIAS_DPL,
    ...core,
  },
  rawDir: 'test-results/discovery/PHASE-B-HARDEN-QA-raw/',
};

save('SUMMARY.json', report);
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

// Markdown report
const seedTable = seedResults
  .map((r) => {
    const n = r.narrow?.skipped
      ? 'skipped'
      : r.narrow
        ? `${r.narrow.httpStatus} ${r.narrow.beforeCount}→${r.narrow.afterCount}`
        : 'n/a';
    return `| ${r.id} \`${r.seed}\` | ${r.pass ? '**PASS**' : '**FAIL**'} | ${r.status} | ${r.findings} | ${r.findingsWithProv}/${r.evidenceWithProv} | ${r.get?.ok ? 'OK' : 'FAIL'} regen=${r.regenerated} | ${r.sse?.ok ? 'OK' : 'FAIL'} ev=${r.sse?.eventCount ?? 0} | ${n} | ${r.forbiddenIdentitiesVersion || '—'} | ${r.leakage} | ${(r.bans || []).join(',') || 'none'} |`;
  })
  .join('\n');

const md = `# Phase B · HARDEN QA · בודק · 2026-09-20

**STATUS:** **${overall}** · MEASURE ONLY · **NO PROMOTE**  
**Preview:** \`${DISC_URL}\`  
**dpl:** \`${DISC_DPL}\` (health.build ${healthOk ? 'match' : 'MISMATCH'})  
**Origin:** \`${ALIAS_BASE}\`  
**Access:** \`vercel curl --deployment ${DISC_DPL} --scope k-akvot\`  
**Zone:** Asia/Jerusalem (UTC+3) · run ${report.checkedAt}  
**Prior Preview:** \`dpl_BvWg…\` results **DO NOT carry over** (fresh matrix)

---

## Gate

| Track | Result |
|-------|--------|
| Discovery health.build | **${healthOk ? 'PASS' : 'FAIL'}** (\`${DISC_DPL}\`) |
| S1 \`דוד כהן\` | **${seedResults[0]?.pass ? 'PASS' : 'FAIL'}** |
| S2 \`Alex Morgan\` | **${seedResults[1]?.pass ? 'PASS' : 'FAIL'}** |
| S3 \`example.org\` | **${seedResults[2]?.pass ? 'PASS' : 'FAIL'}** |
| Multi-Seed / Entity-Agnostic | **${entityAgnostic ? 'PASS' : 'FAIL'}** |
| Acc-DISC leakage | **${overallLeak === 0 ? 'PASS' : 'FAIL'}** · **${overallLeak}** |
| Core alias regression | **${core.pass ? 'PASS' : 'FAIL'}** |
| Promote | **NOT DONE** |

**Overall HARDEN QA:** **${overall}**

---

## Per-Seed matrix

| Seed | Result | status | findings | prov (f/ev) | GET session | SSE/events | narrow | Acc ver | leak | bans |
|------|--------|--------|----------|-------------|-------------|------------|--------|---------|------|------|
${seedTable}

### Failures (if any)
${seedResults
  .filter((r) => !r.pass)
  .map((r) => `- **${r.id}** \`${r.seed}\`: ${r.fails.join('; ')}`)
  .join('\n') || '_none_'}

### SSE detail
${seedResults
  .map(
    (r) =>
      `- **${r.id}**: ct=\`${r.sse?.contentType || '—'}\` events=${r.sse?.eventCount ?? 0} types=[${(r.sse?.types || []).join(', ')}] cursorIds=${r.sse?.hasCursorIds}`,
  )
  .join('\n')}

### Narrow detail
${seedResults
  .map((r) =>
    r.narrow?.skipped
      ? `- **${r.id}**: skipped (${r.narrow.reason})`
      : `- **${r.id}**: filter=\`${JSON.stringify(r.narrow?.filter)}\` before=${r.narrow?.beforeCount} after=${r.narrow?.afterCount} version=${r.narrow?.version}`,
  )
  .join('\n')}

### Store / regenerated
${seedResults
  .map(
    (r) =>
      `- **${r.id}**: sessionId=\`${r.sessionId}\` store=\`${JSON.stringify(r.store)}\` GET.regenerated=\`${r.regenerated}\``,
  )
  .join('\n')}

---

## Entity-Agnostic

Identical snapshot top-level keys across S1–S3: **${entityAgnostic ? 'YES' : 'NO'}**

\`\`\`
${(pathShapes[0]?.keys || []).join(', ')}
\`\`\`

Same \`POST /api/discovery/sessions\` → \`GET …/:id\` → \`GET …/events\` → \`POST …/narrow\` path · **${entityAgnostic ? 'PASS' : 'FAIL'}**.

---

## Acc-DISC

- Deep-scan all Discovery POST/GET/SSE/narrow raw for \`Q1701775\` / \`wd-Q1701775\`
- **leakage = ${overallLeak}**
- \`forbiddenIdentitiesVersion\` present: ${seedResults.every((r) => r.forbiddenIdentitiesVersion) ? 'all seeds' : 'MISSING on some'}
- No dossier/faces on Discovery surfaces: ${seedResults.every((r) => !(r.bans || []).length) ? 'PASS' : 'FAIL'}

---

## Core alias regression (DO NOT TOUCH / NO promote)

| Contract | Result | Detail |
|----------|--------|--------|
| health.build | **${core.health.ok ? 'PASS' : 'FAIL'}** | \`${core.health.build}\` (expect \`${ALIAS_DPL}\`) |
| Assaf Rappaport → Q47507930 | **${core.assaf.ok ? 'PASS' : 'FAIL'}** | ui=\`${core.assaf.ui}\` · qid=\`${core.assaf.qid}\` |
| כהן soft | **${core.cohen.ok ? 'PASS' : 'FAIL'}** | ui=\`${core.cohen.ui}\` · not dossier |
| Smith POST + IBM/NY/US soft | **${core.smith.ok ? 'PASS' : 'FAIL'}** | ui=\`${core.smith.ui}\` · faces=${core.smith.faces} · no Q1701775 |
| Acc leakage | **${core.leakage === 0 ? 'PASS' : 'FAIL'}** | **${core.leakage}** |

**Overall Core:** **${core.pass ? 'PASS' : 'FAIL'}**

---

## Paths exercised

1. \`POST /api/discovery/sessions\` \`{seed}\`
2. \`GET /api/discovery/sessions/:id\` (persistent/fs-regen; document regenerated)
3. \`GET /api/discovery/sessions/:id/events\` (SSE smoke)
4. \`POST /api/discovery/sessions/:id/narrow\` (server recompute when facets present)
5. Core \`GET/POST /api/lookup\` on alias only

Raw: \`test-results/discovery/PHASE-B-HARDEN-QA-raw/\`  
JSON: \`PHASE-B-HARDEN-QA-בודק-2026-09-20.json\`

**NO promote.**
`;

writeFileSync(OUT_MD, md);

const evidence = `# Phase B · HARDEN EVIDENCE · בודק → Chief · 2026-09-20

**Overall:** **${overall}** · MEASURE ONLY · **NO PROMOTE**  
**Preview:** \`${DISC_URL}\` · **dpl:** \`${DISC_DPL}\` (health ${healthOk ? 'OK' : 'FAIL'})  
**Checked:** ${report.checkedAt} Asia/Jerusalem  
**Prior dpl_BvWg:** not reused

| Gate | Result |
|------|--------|
| Discovery ≥3 Seeds (כהן / Alex Morgan / example.org) | **${discPass ? 'PASS' : 'FAIL'}** |
| GET session durable (fs-regen) | **${seedResults.every((r) => r.get?.ok) ? 'PASS' : 'FAIL'}** · regenerated observed: ${seedResults.map((r) => `${r.id}=${r.regenerated}`).join(', ')} |
| SSE /events smoke | **${seedResults.every((r) => r.sse?.ok || r.poll?.ok) ? 'PASS' : 'FAIL'}** |
| POST /narrow server recompute | **${seedResults.every((r) => !r.narrowAttempted || r.narrow?.ok) ? 'PASS' : 'FAIL'}** |
| Acc leakage Q1701775 | **${overallLeak}** |
| dossier/faces | **${seedResults.every((r) => !(r.bans || []).length) ? 'none' : 'FAIL'}** |
| Entity-Agnostic same path | **${entityAgnostic ? 'PASS' : 'FAIL'}** |
| Core alias \`dpl_8ag…\` | **${core.pass ? 'PASS' : 'FAIL'}** · Assaf/כהן/Smith soft · leak=${core.leakage} |
| Promote | **NOT DONE** |

Artifacts: \`PHASE-B-HARDEN-QA-בודק-2026-09-20.md\` + \`.json\` + \`PHASE-B-HARDEN-QA-raw/\`
`;

writeFileSync(OUT_EVIDENCE, evidence);

console.log(`\n=== OVERALL ${overall} disc=${discPass} core=${core.pass} leak=${overallLeak} ===`);
console.log(`wrote ${OUT_MD}`);
console.log(`wrote ${OUT_JSON}`);
console.log(`wrote ${OUT_EVIDENCE}`);
process.exit(overall === 'PASS' ? 0 : 1);
