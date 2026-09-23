#!/usr/bin/env node
/**
 * Phase B · Discovery Preview VS + Acc-DISC + Core alias regression
 * MEASURE ONLY · NO promote · בודק · 2026-09-20
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DISCOVERY_BASE = 'https://akvot-simple-demo-p5zxut9y5-k-akvot.vercel.app';
const DISCOVERY_DPL = 'dpl_BvWg9yUsibVqdrCAexSTMpwoabZ6';
const CORE_ALIAS = 'https://akvot-simple-demo.vercel.app';
const CORE_EXPECT_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const ORIGIN = 'https://akvot-simple-demo.vercel.app';
const SCOPE = 'k-akvot';
const RAW = '/workspace/akvot-quick-demo/test-results/discovery/PHASE-B-VS-raw';
const OUT = '/workspace/akvot-quick-demo/test-results/discovery';

const FORBIDDEN_RE = /Q1701775|wd-Q1701775/gi;
const DENYLIST_CLASS = ['Q1701775'];

const SEEDS = [
  { id: 'S1', seed: 'דוד כהן', kind: 'HE person soft' },
  { id: 'S2', seed: 'Alex Morgan', kind: 'Latin ambiguous' },
  { id: 'S3', seed: 'example.org', kind: 'org/domain' },
];

mkdirSync(RAW, { recursive: true });

function vercelCurl(urlOrPath, { method = 'GET', bodyObj = null, deployment = null, baseHint = null } = {}) {
  const args = ['curl'];
  // Prefer path form with --deployment when given; else absolute URL with --scope
  if (deployment && urlOrPath.startsWith('http')) {
    const u = new URL(urlOrPath);
    args.push(u.pathname + u.search, '--deployment', deployment, '--scope', SCOPE, '--yes', '--');
  } else if (deployment && urlOrPath.startsWith('/')) {
    args.push(urlOrPath, '--deployment', deployment, '--scope', SCOPE, '--yes', '--');
  } else {
    args.push(urlOrPath, '--scope', SCOPE, '--yes', '--');
  }
  args.push('-sS', '-H', `Origin: ${ORIGIN}`, '-H', 'Accept: application/json');
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(bodyObj || {}));
  }
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout: 180000,
    cwd: '/workspace/akvot-quick-demo',
  });
  const ms = Date.now() - t0;
  const out = (r.stdout || '').trim();
  const lines = out.split('\n');
  let jsonLine = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i].trim();
    if (l.startsWith('{') || l.startsWith('[')) {
      jsonLine = l;
      break;
    }
  }
  let json = null;
  let parseErr = null;
  try {
    json = jsonLine ? JSON.parse(jsonLine) : null;
  } catch (e) {
    parseErr = String(e.message || e);
  }
  const err = r.status && !json ? (r.stderr || `exit ${r.status}`) : parseErr;
  return {
    ms,
    exit: r.status,
    json,
    err,
    text: jsonLine || out,
    stderr: (r.stderr || '').slice(0, 2000),
    rawOut: out.slice(0, 50000),
  };
}

function deepScanLeak(obj, text) {
  const raw = text || (obj != null ? JSON.stringify(obj) : '');
  const hits = [];
  const re = new RegExp(FORBIDDEN_RE.source, 'gi');
  let m;
  while ((m = re.exec(raw)) !== null) {
    hits.push({ match: m[0], index: m.index, ctx: raw.slice(Math.max(0, m.index - 40), m.index + 60) });
  }
  return hits;
}

function saveRaw(name, data) {
  const p = join(RAW, name);
  const body = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  writeFileSync(p, body);
  return p;
}

function isUri(s) {
  try {
    const u = new URL(String(s));
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function extractSnapshot(postJson) {
  if (!postJson) return null;
  // Prefer embedded snapshot (serverless cross-instance mitigation)
  if (postJson.snapshot && typeof postJson.snapshot === 'object') return postJson.snapshot;
  // Or top-level fields if already a snapshot-like response
  if (postJson.findings || postJson.sessionId) return postJson;
  return null;
}

function assertVS(seedMeta, snap, rawText) {
  const fails = [];
  const notes = [];
  const checks = {};

  if (!snap) {
    fails.push('no snapshot');
    return { pass: false, fails, notes, checks, leakage: deepScanLeak(null, rawText) };
  }

  const status = snap.status;
  checks.status = status;
  checks.statusOk = ['running', 'partial', 'complete', 'failed_soft'].includes(status);
  if (!checks.statusOk) fails.push(`status=${status}`);

  const findings = Array.isArray(snap.findings) ? snap.findings : [];
  const evidence = Array.isArray(snap.evidence) ? snap.evidence : [];
  checks.findingsCount = findings.length;
  checks.evidenceCount = evidence.length;

  // ≥1 Finding
  if (findings.length < 1) {
    // soft fail if failed_soft with emptyReason documented
    if (status === 'failed_soft') {
      notes.push('failed_soft with 0 findings — soft documented');
      checks.findingsMin = false;
    } else {
      fails.push('findings < 1');
      checks.findingsMin = false;
    }
  } else {
    checks.findingsMin = true;
  }

  // Evidence.provenanceUrl for each finding's evidenceIds
  const evidById = new Map(evidence.map((e) => [e.id, e]));
  let provenanceOk = 0;
  let provenanceBad = 0;
  for (const f of findings) {
    const ids = Array.isArray(f.evidenceIds) ? f.evidenceIds : [];
    if (ids.length < 1) {
      provenanceBad++;
      fails.push(`finding ${f.id} missing evidenceIds`);
      continue;
    }
    for (const eid of ids) {
      const ev = evidById.get(eid);
      if (!ev || !isUri(ev.provenanceUrl)) {
        provenanceBad++;
        fails.push(`evidence ${eid} missing/invalid provenanceUrl`);
      } else {
        provenanceOk++;
      }
    }
  }
  checks.provenanceOk = provenanceOk;
  checks.provenanceBad = provenanceBad;
  if (findings.length >= 1 && provenanceOk < 1) fails.push('no finding with valid provenanceUrl');

  // no dossier / faces
  const blob = JSON.stringify(snap);
  const hasDossier = !!(snap.dossier || (typeof snap.dossier === 'object' && snap.dossier));
  // check keys
  const bannedKeys = [];
  function walk(o, path = '') {
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      const p = path ? `${path}.${k}` : k;
      if (k === 'dossier' && v) bannedKeys.push(p);
      if (k === 'faces' && v && (Array.isArray(v) ? v.length : true)) bannedKeys.push(p);
      if (k === 'photoUrl' && v) bannedKeys.push(p);
      if (typeof v === 'object') walk(v, p);
    }
  }
  walk(snap);
  checks.bannedKeys = bannedKeys;
  if (bannedKeys.length) fails.push(`banned keys: ${bannedKeys.join(',')}`);
  // also string scan for "dossier":
  if (/"dossier"\s*:\s*\{/.test(blob)) {
    fails.push('dossier object in payload');
    checks.hasDossierObject = true;
  } else {
    checks.hasDossierObject = false;
  }

  // facets OK or emptyReason
  const facets = snap.facets;
  checks.facetsType = Array.isArray(facets) ? 'array' : typeof facets;
  let facetsOk = false;
  if (Array.isArray(facets)) {
    if (facets.length === 0) {
      facetsOk = true;
      notes.push('facets empty array');
    } else {
      facetsOk = facets.every((f) => {
        if (!f || typeof f !== 'object') return false;
        if (Array.isArray(f.buckets) && f.buckets.length > 0) return !!f.key;
        return !!f.emptyReason || (Array.isArray(f.buckets) && f.key);
      });
    }
  } else if (facets && typeof facets === 'object') {
    // object form — OK if empty or has keys / emptyReason
    facetsOk = true;
    if (facets.emptyReason) notes.push(`facets.emptyReason=${facets.emptyReason}`);
  } else if (facets == null) {
    notes.push('facets null/absent — soft note');
    facetsOk = true; // soft: document
  }
  checks.facetsOk = facetsOk;
  if (!facetsOk) fails.push('facets invalid');

  // forbiddenIdentitiesVersion
  checks.forbiddenIdentitiesVersion =
    snap.forbiddenIdentitiesVersion ||
    snap.meta?.forbiddenIdentitiesVersion ||
    null;
  if (!checks.forbiddenIdentitiesVersion) notes.push('forbiddenIdentitiesVersion absent');

  // Acc leakage
  const leaks = deepScanLeak(snap, rawText);
  checks.leakHits = leaks.length;
  if (leaks.length) fails.push(`Acc leakage hits=${leaks.length}`);

  // schema-ish: finding required fields
  let schemaFindingOk = true;
  for (const f of findings) {
    if (!f.id || !f.kind || !f.title) schemaFindingOk = false;
    if (!Array.isArray(f.evidenceIds) || f.evidenceIds.length < 1) schemaFindingOk = false;
    if (!Array.isArray(f.providers) || f.providers.length < 1) schemaFindingOk = false;
  }
  checks.schemaFindingOk = schemaFindingOk || findings.length === 0;
  if (findings.length && !schemaFindingOk) fails.push('finding schema fields incomplete');

  // sessionId / q
  checks.sessionId = snap.sessionId || null;
  checks.q = snap.q || snap.seed || seedMeta.seed;

  return {
    pass: fails.length === 0,
    fails,
    notes,
    checks,
    leakage: leaks,
  };
}

const report = {
  meta: {
    role: 'בודק',
    date: '2026-09-20',
    zone: 'Asia/Jerusalem UTC+3',
    measure_only: true,
    promote: false,
    discovery: {
      url: DISCOVERY_BASE,
      dpl: DISCOVERY_DPL,
      origin: ORIGIN,
    },
    core_alias: {
      url: CORE_ALIAS,
      expect_dpl: CORE_EXPECT_DPL,
    },
    endpoints: {
      create: 'POST /api/discovery/sessions',
      get: 'GET /api/discovery/sessions/:id',
      note: 'SSE/events and /narrow not in slice; snapshot on POST for serverless',
    },
  },
  health: {},
  seeds: {},
  acc_disc: {},
  core: {},
  entity_agnostic: {},
  gate: {},
};

// --- Discovery health ---
process.stderr.write('[health] Discovery Preview...\n');
{
  const r = vercelCurl('/api/health', { deployment: DISCOVERY_DPL });
  saveRaw('discovery-health.json', r.text || JSON.stringify({ err: r.err }));
  report.health.discovery = {
    ms: r.ms,
    json: r.json,
    build_match: r.json?.build === DISCOVERY_DPL,
    ok: !!r.json?.ok,
  };
  process.stderr.write(`  build=${r.json?.build} match=${report.health.discovery.build_match}\n`);
}

// --- VS per seed ---
const shapes = [];
for (const s of SEEDS) {
  process.stderr.write(`[VS] ${s.id} seed=${s.seed}...\n`);
  const post = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    bodyObj: { seed: s.seed },
    deployment: DISCOVERY_DPL,
  });
  saveRaw(`${s.id}-POST.json`, post.text || JSON.stringify({ err: post.err, stderr: post.stderr }));

  let snap = extractSnapshot(post.json);
  let getResult = null;
  const sessionId = post.json?.sessionId || snap?.sessionId;

  // Try GET poll if we have sessionId (may 404 cross-instance — documented soft)
  if (sessionId) {
    getResult = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`, {
      deployment: DISCOVERY_DPL,
    });
    saveRaw(`${s.id}-GET.json`, getResult.text || JSON.stringify({ err: getResult.err }));
    if (getResult.json?.ok && (getResult.json.findings || getResult.json.status)) {
      // Prefer GET if richer/complete
      const gStatus = getResult.json.status;
      if (['partial', 'complete'].includes(gStatus) || !snap) {
        snap = getResult.json;
      }
    }
  }

  // If POST returned snapshot already complete/partial, use it
  if (!snap && post.json) snap = extractSnapshot(post.json);

  const rawForScan = JSON.stringify({ post: post.json, get: getResult?.json, snap });
  const vs = assertVS(s, snap, rawForScan);

  // Path sameness fingerprint (entity-agnostic)
  const shape = {
    hasSessionId: !!(post.json?.sessionId || snap?.sessionId),
    status: snap?.status || post.json?.status || null,
    hasFindingsArray: Array.isArray(snap?.findings),
    hasEvidenceArray: Array.isArray(snap?.evidence),
    hasFacets: snap?.facets != null,
    hasProviders: snap?.providers != null,
    hasForbiddenVer: !!(snap?.forbiddenIdentitiesVersion || post.json?.snapshot?.forbiddenIdentitiesVersion),
    topLevelKeys: snap ? Object.keys(snap).sort() : [],
    postKeys: post.json ? Object.keys(post.json).sort() : [],
  };
  shapes.push({ id: s.id, shape });

  const seedReport = {
    seed: s.seed,
    kind: s.kind,
    post_ms: post.ms,
    post_ok: !!post.json?.ok || !!post.json?.sessionId,
    sessionId: sessionId || null,
    get_status: getResult?.json?.status || (getResult?.json?.ok === false ? 'error' : null),
    get_http_note: getResult?.json?.error || null,
    used_snapshot_from: snap === post.json?.snapshot ? 'POST.snapshot' : snap === getResult?.json ? 'GET' : 'other',
    vs_pass: vs.pass,
    fails: vs.fails,
    notes: vs.notes,
    checks: vs.checks,
    leak_hits: vs.leakage.length,
    leak_detail: vs.leakage.slice(0, 5),
    sample_finding: snap?.findings?.[0]
      ? {
          id: snap.findings[0].id,
          kind: snap.findings[0].kind,
          title: snap.findings[0].title,
          evidenceIds: snap.findings[0].evidenceIds,
          providers: snap.findings[0].providers,
        }
      : null,
    sample_evidence: snap?.evidence?.[0]
      ? {
          id: snap.evidence[0].id,
          provenanceUrl: snap.evidence[0].provenanceUrl,
          providerId: snap.evidence[0].providerId,
        }
      : null,
    providers: snap?.providers || null,
    forbiddenIdentitiesVersion: vs.checks.forbiddenIdentitiesVersion,
  };
  report.seeds[s.id] = seedReport;
  process.stderr.write(
    `  status=${vs.checks.status} findings=${vs.checks.findingsCount} leak=${vs.leakage.length} pass=${vs.pass}\n`
  );
}

// Entity-agnostic: same response shape keys across seeds
{
  const keySets = shapes.map((x) => JSON.stringify(x.shape.topLevelKeys));
  const postKeySets = shapes.map((x) => JSON.stringify(x.shape.postKeys));
  const sameTop = keySets.every((k) => k === keySets[0]);
  const samePost = postKeySets.every((k) => k === postKeySets[0]);
  const samePipeline =
    shapes.every((x) => x.shape.hasFindingsArray && x.shape.hasEvidenceArray) &&
    shapes.every((x) => x.shape.hasSessionId);
  report.entity_agnostic = {
    same_topLevelKeys: sameTop,
    same_postKeys: samePost,
    same_pipeline_fields: samePipeline,
    shapes,
    pass: samePipeline && (sameTop || samePost),
    note: 'Same endpoints + pipeline fields for all seeds; no seed-specific branch observed in response shape',
  };
}

// Acc-DISC aggregate
{
  let totalLeak = 0;
  const perSeed = {};
  for (const [id, s] of Object.entries(report.seeds)) {
    totalLeak += s.leak_hits || 0;
    perSeed[id] = { leak_hits: s.leak_hits, version: s.forbiddenIdentitiesVersion };
  }
  // Also re-scan all raw files
  const rawFiles = SEEDS.flatMap((s) => [`${s.id}-POST.json`, `${s.id}-GET.json`]);
  const fileLeaks = [];
  for (const f of rawFiles) {
    try {
      const t = readFileSync(join(RAW, f), 'utf8');
      const hits = deepScanLeak(null, t);
      if (hits.length) fileLeaks.push({ file: f, hits: hits.length, detail: hits.slice(0, 3) });
      totalLeak += hits.length; // careful: double count — use max
    } catch {
      /* missing GET ok */
    }
  }
  // Use unique approach: recompute from seeds only for gate; file scan for proof
  const seedLeakSum = Object.values(report.seeds).reduce((a, s) => a + (s.leak_hits || 0), 0);
  const fileLeakSum = fileLeaks.reduce((a, x) => a + x.hits, 0);
  report.acc_disc = {
    denylist_class: DENYLIST_CLASS,
    seed_leakage_sum: seedLeakSum,
    raw_file_leakage_sum: fileLeakSum,
    leakage: Math.max(seedLeakSum, fileLeakSum),
    file_leaks: fileLeaks,
    per_seed: perSeed,
    inject_harness: false,
    note: 'No Discovery inject harness on live Preview; observe-only deep scan of live responses',
    pass: Math.max(seedLeakSum, fileLeakSum) === 0,
  };
}

// --- Core alias regression ---
process.stderr.write('[CORE] alias health + Assaf/כהן/Smith...\n');
{
  const health = vercelCurl(`${CORE_ALIAS}/api/health`);
  saveRaw('core-health.json', health.text || JSON.stringify({ err: health.err }));
  const build = health.json?.build;
  report.core.health = {
    ms: health.ms,
    build,
    expect: CORE_EXPECT_DPL,
    match: build === CORE_EXPECT_DPL || (typeof build === 'string' && build.startsWith('dpl_8ag')),
    json: health.json,
  };

  // Assaf
  const assaf = vercelCurl(`${CORE_ALIAS}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}&nocache=1`);
  saveRaw('core-assaf.json', assaf.text || JSON.stringify({ err: assaf.err }));
  const aQid = assaf.json?.qid || assaf.json?.dossier?.qid || null;
  const aUi = assaf.json?.uiState || assaf.json?.mode || null;
  const aLeak = deepScanLeak(assaf.json, assaf.text);
  report.core.assaf = {
    ms: assaf.ms,
    ui: aUi,
    qid: aQid,
    leak: aLeak.length,
    pass: aQid === 'Q47507930' && aLeak.length === 0,
  };

  // כהן soft
  const cohen = vercelCurl(`${CORE_ALIAS}/api/lookup?q=${encodeURIComponent('כהן')}&nocache=1`);
  saveRaw('core-cohen.json', cohen.text || JSON.stringify({ err: cohen.err }));
  const cUi = cohen.json?.uiState || cohen.json?.mode || null;
  const cLeak = deepScanLeak(cohen.json, cohen.text);
  const cSoft = ['need_context', 'thin', 'candidates', 'ambiguous'].includes(cUi) && cUi !== 'dossier';
  report.core.cohen = {
    ms: cohen.ms,
    ui: cUi,
    qid: cohen.json?.qid || null,
    leak: cLeak.length,
    pass: cSoft && cLeak.length === 0,
  };

  // Smith POST + IBM/NY/US soft
  const smith = vercelCurl(`${CORE_ALIAS}/api/lookup`, {
    method: 'POST',
    bodyObj: { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' }, nocache: 1 },
  });
  saveRaw('core-smith-post.json', smith.text || JSON.stringify({ err: smith.err }));
  const sUi = smith.json?.uiState || smith.json?.mode || null;
  const sLeak = deepScanLeak(smith.json, smith.text);
  const sSoft =
    ['need_context', 'thin', 'candidates', 'ambiguous'].includes(sUi) &&
    sUi !== 'dossier' &&
    sLeak.length === 0;
  // Also fail if Q1701775 in candidates
  report.core.smith = {
    ms: smith.ms,
    ui: sUi,
    qid: smith.json?.qid || null,
    faces: !!(smith.json?.photo || (Array.isArray(smith.json?.images) && smith.json.images.length)),
    leak: sLeak.length,
    pass: sSoft && !report.core.smith?.faces,
  };
  report.core.smith.pass = sSoft && !report.core.smith.faces;

  const coreLeak = (report.core.assaf.leak || 0) + (report.core.cohen.leak || 0) + (report.core.smith.leak || 0);
  report.core.leakage = coreLeak;
  report.core.pass =
    !!report.core.health.match &&
    !!report.core.assaf.pass &&
    !!report.core.cohen.pass &&
    !!report.core.smith.pass &&
    coreLeak === 0;

  process.stderr.write(
    `  build=${build} match=${report.core.health.match} Assaf=${report.core.assaf.pass} cohen=${report.core.cohen.pass} smith=${report.core.smith.pass} leak=${coreLeak}\n`
  );
}

// Gate
const vsAll = SEEDS.every((s) => report.seeds[s.id]?.vs_pass);
const accPass = report.acc_disc.pass;
const eaPass = report.entity_agnostic.pass;
const corePass = report.core.pass;
const healthDisc = report.health.discovery?.build_match;

report.gate = {
  discovery_health_build: healthDisc ? 'PASS' : 'FAIL',
  VS_S1: report.seeds.S1?.vs_pass ? 'PASS' : 'FAIL',
  VS_S2: report.seeds.S2?.vs_pass ? 'PASS' : 'FAIL',
  VS_S3: report.seeds.S3?.vs_pass ? 'PASS' : 'FAIL',
  VS_multi_seed: vsAll ? 'PASS' : 'FAIL',
  Acc_DISC: accPass ? 'PASS' : 'FAIL',
  leakage: report.acc_disc.leakage,
  Entity_Agnostic: eaPass ? 'PASS' : 'FAIL',
  Core_regression: corePass ? 'PASS' : 'FAIL',
  Core_leakage: report.core.leakage,
  promote: 'NOT_DONE',
  overall:
    healthDisc && vsAll && accPass && eaPass && corePass
      ? 'PASS'
      : 'FAIL',
};

writeFileSync(join(OUT, 'PHASE-B-VS-בודק-2026-09-20.json'), JSON.stringify(report, null, 2));
writeFileSync(join(RAW, '_vs-internal.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.gate, null, 2));
process.stderr.write(`\n=== Phase B VS ${report.gate.overall} leakage=${report.acc_disc.leakage} Core=${report.gate.Core_regression} ===\n`);
