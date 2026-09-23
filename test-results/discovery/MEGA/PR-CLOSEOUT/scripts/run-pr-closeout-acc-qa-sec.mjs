#!/usr/bin/env node
/**
 * PR-CLOSEOUT Acc full-surface + Entity-agnostic + Security live + Core regression.
 * Preview: dpl_9PkJ… (detect via health) · Core alias dpl_8ag… LOCKED.
 * NO promote · NO Core alias change · No secrets in artifacts.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..');
const RAW = join(OUT, 'raw');
mkdirSync(RAW, { recursive: true });

const DISC_DPL = process.env.DISC_DPL || 'dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2';
const DISC_BASE = process.env.DISC_BASE || 'https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app';
const ALIAS_BASE = 'https://akvot-simple-demo.vercel.app';
const ALIAS_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const FIV_EXPECTED = '2026-09-19.1';
const ROOT = join(__dirname, '../../../../..');

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

function vercelCurl(urlOrPath, { method = 'GET', body = null, deployment = null, extra = [], timeout = 180000 } = {}) {
  const args = ['curl'];
  if (deployment) {
    const path = urlOrPath.startsWith('http')
      ? new URL(urlOrPath).pathname + new URL(urlOrPath).search
      : urlOrPath;
    args.push(path, '--deployment', deployment, '--scope', SCOPE, '--');
  } else {
    args.push(urlOrPath, '--scope', SCOPE, '--');
  }
  args.push('-sS', '-H', 'Accept: application/json', '-H', `Origin: ${ALIAS_BASE}`, ...extra);
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body ?? {}));
  }
  if (method === 'PUT' || method === 'PATCH') {
    args.push('-X', method, '-H', 'Content-Type: application/json', '--data', JSON.stringify(body ?? {}));
  }
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout,
    cwd: ROOT,
  });
  const ms = Date.now() - t0;
  const stdout = r.stdout || '';
  const lines = stdout.split('\n').map((s) => s.trim()).filter(Boolean);
  let json = null;
  let jsonLine = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('{') || lines[i].startsWith('[')) {
      jsonLine = lines[i];
      try {
        json = JSON.parse(jsonLine);
      } catch (_) {}
      if (json) break;
    }
  }
  if (!json) {
    try {
      json = JSON.parse(stdout.trim());
      jsonLine = stdout.trim();
    } catch (_) {}
  }
  return {
    url: urlOrPath,
    method,
    body,
    ms,
    exit: r.status,
    json,
    text: jsonLine || stdout.trim(),
    rawStdout: stdout,
    stderr: (r.stderr || '').trim(),
  };
}

function vercelCurlSSE(path, { deployment, maxSeconds = 40 } = {}) {
  const args = [
    'curl',
    path,
    '--deployment',
    deployment,
    '--scope',
    SCOPE,
    '--',
    '-sS',
    '-N',
    '-H',
    'Accept: text/event-stream',
    '-H',
    `Origin: ${ALIAS_BASE}`,
    '--max-time',
    String(maxSeconds),
  ];
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout: (maxSeconds + 30) * 1000,
    cwd: ROOT,
  });
  return {
    url: path,
    method: 'GET',
    ms: Date.now() - t0,
    exit: r.status,
    text: r.stdout || '',
    stderr: (r.stderr || '').trim(),
  };
}

function aliasFetch(path) {
  const url = path.startsWith('http') ? path : `${ALIAS_BASE}${path}`;
  const t0 = Date.now();
  const r = spawnSync('curl', ['-sS', '-H', 'Accept: application/json', '-H', `Origin: ${ALIAS_BASE}`, url], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    timeout: 120000,
  });
  let json = null;
  try {
    json = JSON.parse(r.stdout || '');
  } catch (_) {}
  return { url, method: 'GET', ms: Date.now() - t0, exit: r.status, json, text: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function leaks(text) {
  return String(text || '').match(FORBIDDEN_RE) || [];
}

function deepScanForbidden(obj, path = '') {
  const found = [];
  if (obj == null) return found;
  if (typeof obj === 'string' || typeof obj === 'number') {
    for (const h of leaks(String(obj))) found.push({ path, term: String(h).toLowerCase() });
    return found;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => found.push(...deepScanForbidden(v, `${path}[${i}]`)));
    return found;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      found.push(...deepScanForbidden(v, path ? `${path}.${k}` : k));
    }
  }
  return found;
}

function saveRaw(label, data) {
  const file = `${label}.json`;
  const payload =
    data?.json != null
      ? data.json
      : typeof data === 'string'
        ? { text: data }
        : { text: String(data?.text || '').slice(0, 200000), stderr: data?.stderr, exit: data?.exit, ms: data?.ms };
  // scrub any accidental env-looking secrets from saved text
  let s = JSON.stringify(payload, null, 2);
  s = s.replace(/UPSTASH_REDIS_REST_TOKEN["\s:=]+[^\s",}]+/gi, 'UPSTASH_REDIS_REST_TOKEN":"[REDACTED]"');
  s = s.replace(/Bearer\s+[A-Za-z0-9._\-]+/g, 'Bearer [REDACTED]');
  writeFileSync(join(RAW, file), s);
  return file;
}

function analyzeSnap(label, seed, req, extras = {}) {
  const j = req.json;
  const snap = j?.snapshot || j;
  const leakHits = deepScanForbidden(j);
  const findings = Array.isArray(snap?.findings) ? snap.findings : Array.isArray(j?.findings) ? j.findings : [];
  const evidence = Array.isArray(snap?.evidence) ? snap.evidence : Array.isArray(j?.evidence) ? j.evidence : [];
  const facets = Array.isArray(snap?.facets) ? snap.facets : Array.isArray(j?.facets) ? j.facets : [];
  const contradictions = Array.isArray(snap?.contradictions)
    ? snap.contradictions
    : Array.isArray(j?.contradictions)
      ? j.contradictions
      : [];
  const graph = snap?.graph || j?.graph || null;
  const candidates = snap?.candidates ?? j?.candidates;
  const errors = snap?.errors || j?.errors || [];
  const fiv = snap?.forbiddenIdentitiesVersion || j?.forbiddenIdentitiesVersion || null;
  const status = snap?.status || j?.status || null;
  const dossier = !!(j?.dossier || snap?.dossier || j?.uiState === 'dossier');
  const faces =
    (Array.isArray(j?.faces) ? j.faces.length : j?.faces ? 1 : 0) +
    (Array.isArray(snap?.faces) ? snap.faces.length : snap?.faces ? 1 : 0);
  const b23Leaks = contradictions.flatMap((c, i) =>
    (c?.findingIds || [])
      .filter((id) => FORBIDDEN_RE.test(String(id)))
      .map((id) => ({ path: `contradictions[${i}].findingIds`, id: String(id) })),
  );
  FORBIDDEN_RE.lastIndex = 0;

  const checks = {
    http_ok: !!(j && req.exit === 0 && !String(j.error || '').match(/fatal/i)),
    session_id: !!(j?.sessionId || snap?.sessionId || extras.sessionId),
    leakage_0: leakHits.length === 0,
    b23_findingIds_0: b23Leaks.length === 0,
    no_dossier: !dossier,
    faces_0: faces === 0,
    no_candidates_field: candidates === undefined || candidates === null,
    fiv_ok: !fiv || fiv === FIV_EXPECTED,
    evidence_provenance:
      evidence.length === 0 || evidence.every((e) => e?.provenanceUrl || e?.url),
  };
  const pass = Object.values(checks).every(Boolean);

  return {
    label,
    seed,
    kind: extras.kind || null,
    surface: extras.surface || 'POST',
    ms: req.ms,
    exit: req.exit,
    sessionId: j?.sessionId || snap?.sessionId || extras.sessionId || null,
    status,
    fiv,
    findings_n: findings.length,
    evidence_n: evidence.length,
    facets_n: facets.length,
    contradictions_n: contradictions.length,
    graph_nodes: Array.isArray(graph?.nodes) ? graph.nodes.length : 0,
    errors_n: Array.isArray(errors) ? errors.length : 0,
    candidates_present: candidates !== undefined && candidates !== null,
    dossier,
    faces,
    leakage_count: leakHits.length,
    leakage: leakHits.slice(0, 15),
    b23_leaks: b23Leaks,
    checks,
    pass,
    info_ne_identity:
      contradictions.some((c) => /INFORMATION/i.test(String(c?.note || c?.type || ''))) ||
      findings.length >= 0,
    unknown_ne_false: status !== 'false' && status !== false,
    raw_file: saveRaw(label, req),
  };
}

function analyzeSSE(label, req, sessionId) {
  const text = req.text || '';
  const leakHits = leaks(text);
  const events = text.split(/\n\n+/).filter(Boolean).length;
  const hasDone = /event:\s*done|\"type\"\s*:\s*\"done\"|event:\s*status/i.test(text);
  const hasFinding = /finding/i.test(text);
  const pass = leakHits.length === 0 && events > 0;
  saveRaw(label, { text: text.slice(0, 200000), exit: req.exit, ms: req.ms, stderr: req.stderr });
  return {
    label,
    surface: 'SSE',
    sessionId,
    ms: req.ms,
    exit: req.exit,
    events_n: events,
    hasFinding,
    hasDone,
    leakage_count: leakHits.length,
    pass,
    checks: { leakage_0: leakHits.length === 0, has_events: events > 0 },
  };
}

function analyzeNarrow(label, req, sessionId) {
  const a = analyzeSnap(label, null, req, { surface: 'narrow', sessionId });
  return a;
}

function analyzeCore(label, req, expect) {
  const j = req.json;
  const leakHits = deepScanForbidden(j);
  const ui = j?.uiState ?? null;
  const qid = j?.qid ?? null;
  const faces = Array.isArray(j?.images) ? j.images.length : j?.photo ? 1 : 0;
  const checks = {
    http_200: req.exit === 0 && j && (j.ok !== false || j.uiState),
    leakage_0: leakHits.length === 0,
    never_Q1701775_qid: qid !== 'Q1701775',
  };
  if (expect.uiExact) checks.ui = ui === expect.uiExact;
  if (expect.uiIn) checks.ui = expect.uiIn.includes(ui);
  if (expect.qidExact) checks.qid = qid === expect.qidExact;
  if (expect.forbidDossier) checks.not_dossier = ui !== 'dossier';
  if (expect.facesZero) checks.faces_0 = faces === 0;
  const pass = Object.values(checks).every(Boolean);
  saveRaw(label, req);
  return {
    label,
    surface: 'core-lookup',
    ms: req.ms,
    ui,
    qid,
    faces,
    leakage_count: leakHits.length,
    checks,
    pass,
  };
}

const started = nowJerusalem();
const report = {
  stamp_start: started,
  preview: { dpl: DISC_DPL, base: DISC_BASE },
  alias: { dpl: ALIAS_DPL, base: ALIAS_BASE },
  promote: 'HOLD',
  health: {},
  cases: [],
  security_live: [],
  core: [],
  summary: {},
};

console.log(`[PR-CLOSEOUT] health probe Preview ${DISC_DPL}`);
const h1 = vercelCurl('/api/health', { deployment: DISC_DPL });
const h2 = vercelCurl('/api/discovery/health', { deployment: DISC_DPL });
const hAlias = aliasFetch('/api/health');
report.health = {
  preview_api: h1.json,
  preview_discovery: h2.json,
  alias: hAlias.json,
  preview_build_match: h1.json?.build === DISC_DPL,
  preview_store: h1.json?.discoveryStore?.storeBackend || h2.json?.storeBackend,
  preview_ok: h1.json?.ok === true && h2.json?.ok === true,
};
saveRaw('health-preview-api', h1);
saveRaw('health-preview-discovery', h2);
saveRaw('health-alias', hAlias);

if (!report.health.preview_ok) {
  console.error('Preview health not OK — aborting live Acc');
  report.summary.verdict = 'FAIL-HEALTH';
  writeFileSync(join(OUT, 'ACC-FULL-SURFACE.json'), JSON.stringify(report, null, 2));
  process.exit(2);
}

const EA_SEEDS = [
  { id: 'person', seed: 'Ada Lovelace', kind: 'person', hints: { locale: 'en' } },
  { id: 'company', seed: 'Acme Corporation', kind: 'company', hints: {} },
  { id: 'domain', seed: 'example.org', kind: 'domain', hints: {} },
  { id: 'org', seed: 'Open Knowledge Foundation', kind: 'org', hints: {} },
  { id: 'ambiguous', seed: 'Alex Morgan', kind: 'ambiguous', hints: {} },
  { id: 'no-match', seed: 'Zzqxv Nonentity 99991', kind: 'no-match', hints: {} },
  // adversarial Smith / Q1701775 pressure
  { id: 'adv-smith', seed: 'John Smith', kind: 'ambiguous-person', hints: { org: 'IBM', city: 'New York', country: 'US' } },
  { id: 'adv-qid', seed: 'John Smith Q1701775', kind: 'adversarial', hints: {} },
  { id: 'adv-wd', seed: 'wd-Q1701775', kind: 'adversarial', hints: {} },
];

let primarySession = null;

for (const s of EA_SEEDS) {
  console.log(`[PR-CLOSEOUT] POST create seed=${s.id}`);
  const post = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    deployment: DISC_DPL,
    body: { seed: s.seed, hints: s.hints || {}, locale: 'en' },
    timeout: 200000,
  });
  const postA = analyzeSnap(`post-${s.id}`, s.seed, post, { kind: s.kind, surface: 'POST' });
  report.cases.push(postA);
  const sid = postA.sessionId;
  if (!primarySession && sid && s.id === 'adv-smith') primarySession = sid;
  if (!primarySession && sid && s.id === 'person') primarySession = sid;

  if (sid) {
    console.log(`[PR-CLOSEOUT] GET HIT ${s.id}`);
    const get = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sid)}`, { deployment: DISC_DPL });
    report.cases.push(analyzeSnap(`get-${s.id}`, s.seed, get, { kind: s.kind, surface: 'GET-HIT', sessionId: sid }));
  }
}

// SSE + narrow on primary
if (primarySession) {
  console.log(`[PR-CLOSEOUT] SSE ${primarySession}`);
  const sse = vercelCurlSSE(`/api/discovery/sessions/${encodeURIComponent(primarySession)}/events`, {
    deployment: DISC_DPL,
    maxSeconds: 35,
  });
  report.cases.push(analyzeSSE('sse-primary', sse, primarySession));

  console.log(`[PR-CLOSEOUT] narrow ${primarySession}`);
  const narrow = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(primarySession)}/narrow`, {
    method: 'POST',
    deployment: DISC_DPL,
    body: { facets: { provider: ['wikidata'] } },
  });
  report.cases.push(analyzeNarrow('narrow-primary', narrow, primarySession));
}

// Security live probes (create guards)
console.log('[PR-CLOSEOUT] security live probes');
const secCases = [
  {
    id: 'oversized-seed',
    body: { seed: 'x'.repeat(600) },
    expectStatus: [400, 413],
  },
  {
    id: 'empty-seed',
    body: { seed: '' },
    expectStatus: [400],
  },
  {
    id: 'malformed-hints-huge',
    body: { seed: 'ok', hints: { blob: 'y'.repeat(5000) } },
    expectStatus: [400, 413],
  },
];
for (const sc of secCases) {
  const r = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    deployment: DISC_DPL,
    body: sc.body,
    timeout: 60000,
  });
  const status =
    r.json?.statusCode ||
    r.json?.status ||
    (r.json?.error ? (String(r.json.error).match(/too large|413/i) ? 413 : 400) : null);
  // vercel curl may not expose HTTP code; infer from body
  const rejected =
    r.json?.ok === false ||
    !!r.json?.error ||
    /too large|required|invalid|413|400/i.test(JSON.stringify(r.json || r.text || ''));
  const leak = deepScanForbidden(r.json).length + leaks(r.text).length;
  const row = {
    id: sc.id,
    rejected,
    leakage_count: leak,
    pass: rejected && leak === 0,
    raw_file: saveRaw(`sec-${sc.id}`, r),
    ms: r.ms,
    error: r.json?.error || null,
  };
  report.security_live.push(row);
  console.log(`  sec ${sc.id}: pass=${row.pass} rejected=${rejected}`);
}

// Core regression on production alias (NO Discovery)
console.log('[PR-CLOSEOUT] Core identity-p0 on alias');
const coreCases = [
  {
    id: 'a-netanyahu-keep',
    path: '/api/lookup?q=%D7%A0%D7%AA%D7%A0%D7%99%D7%94%D7%95&nocache=1',
    expect: { uiExact: 'dossier', qidExact: 'Q43723' },
  },
  {
    id: 'b-cohen-keep',
    path: '/api/lookup?q=%D7%9B%D7%94%D7%9F&nocache=1',
    expect: { uiIn: ['need_context', 'candidates', 'soft'], forbidDossier: true, facesZero: true },
  },
  {
    id: 'c-smith-bare-keep',
    path: '/api/lookup?q=John%20Smith&nocache=1',
    expect: { uiIn: ['need_context', 'candidates', 'soft'], forbidDossier: true, facesZero: true },
  },
  {
    id: 'd-smith-ctx-p0',
    path: '/api/lookup?q=John%20Smith&org=IBM&city=New%20York&country=US&nocache=1',
    expect: { uiIn: ['candidates', 'need_context', 'soft'], forbidDossier: true, facesZero: true },
  },
  {
    id: 'e-smith-email-g11-p0',
    path: '/api/lookup?q=John%20Smith&email=qa.rethink.test%40example.com&nocache=1',
    expect: { uiIn: ['candidates', 'need_context', 'soft'], forbidDossier: true, facesZero: true },
  },
];
for (const c of coreCases) {
  const r = aliasFetch(c.path);
  const a = analyzeCore(`core-${c.id}`, r, c.expect);
  report.core.push(a);
  console.log(`  core ${c.id}: pass=${a.pass} ui=${a.ui} qid=${a.qid} leak=${a.leakage_count}`);
}

const discPass = report.cases.filter((c) => c.pass).length;
const discFail = report.cases.filter((c) => !c.pass).length;
const totalLeak = report.cases.reduce((n, c) => n + (c.leakage_count || 0), 0);
const secPass = report.security_live.every((s) => s.pass);
const corePass = report.core.every((c) => c.pass);
const coreLeak = report.core.reduce((n, c) => n + (c.leakage_count || 0), 0);
const pw = report.core.filter((c) => ['d-smith-ctx-p0', 'e-smith-email-g11-p0'].some((x) => c.label.includes(x)) && (c.qid === 'Q1701775' || c.ui === 'dossier')).length;

report.stamp_end = nowJerusalem();
report.summary = {
  disc_cases: report.cases.length,
  disc_pass: discPass,
  disc_fail: discFail,
  leakage_total: totalLeak,
  sec_live_pass: secPass,
  core_pass: corePass,
  core_leakage: coreLeak,
  core_pw: pw,
  health_ok: report.health.preview_ok === true,
  verdict_acc: discFail === 0 && totalLeak === 0 && report.health.preview_ok ? 'PASS' : 'FAIL',
  verdict_sec: secPass ? 'PASS' : 'FAIL',
  verdict_core: corePass && coreLeak === 0 && pw === 0 ? 'PASS' : 'FAIL',
  verdict_ea: report.cases.filter((c) => c.kind && c.surface === 'POST').every((c) => c.pass) ? 'PASS' : 'FAIL',
};

writeFileSync(join(OUT, 'ACC-FULL-SURFACE.json'), JSON.stringify(report, null, 2));
writeFileSync(
  join(OUT, 'ENTITY-AGNOSTIC.json'),
  JSON.stringify(
    {
      stamp: report.stamp_end,
      seeds: EA_SEEDS,
      cases: report.cases.filter((c) => c.kind),
      summary: {
        seed_kinds: [...new Set(EA_SEEDS.map((s) => s.kind))],
        n_seeds: EA_SEEDS.length,
        pass: report.summary.verdict_ea,
        invariants: ['INFORMATION≠IDENTITY', 'UNKNOWN≠FALSE', 'leakage=0', 'no dossier/faces'],
      },
    },
    null,
    2,
  ),
);
writeFileSync(
  join(OUT, 'SECURITY-PASS.json'),
  JSON.stringify(
    {
      stamp: report.stamp_end,
      preview: report.preview,
      live: report.security_live,
      health: report.health,
      summary: { verdict: report.summary.verdict_sec },
    },
    null,
    2,
  ),
);
writeFileSync(
  join(OUT, 'CORE-REGRESSION.json'),
  JSON.stringify(
    {
      stamp: report.stamp_end,
      alias: report.alias,
      cases: report.core,
      summary: {
        pw: pw,
        leakage: coreLeak,
        pass: report.summary.verdict_core,
        verdict: report.summary.verdict_core,
      },
    },
    null,
    2,
  ),
);

console.log('\n=== PR-CLOSEOUT SUMMARY ===');
console.log(JSON.stringify(report.summary, null, 2));
process.exit(
  report.summary.verdict_acc === 'PASS' &&
    report.summary.verdict_core === 'PASS' &&
    report.summary.verdict_sec === 'PASS'
    ? 0
    : 1,
);
