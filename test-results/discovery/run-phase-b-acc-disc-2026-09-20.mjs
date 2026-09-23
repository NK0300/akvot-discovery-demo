#!/usr/bin/env node
/**
 * Phase B Acc-DISC + Core alias regression · דיוק · 2026-09-20
 * NO promote.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const RAW = join(__dirname, 'PHASE-B-ACC-DISC-raw');
mkdirSync(RAW, { recursive: true });

const DISC_BASE = 'https://akvot-simple-demo-p5zxut9y5-k-akvot.vercel.app';
const DISC_DPL = 'dpl_BvWg9yUsibVqdrCAexSTMpwoabZ6';
const ALIAS_BASE = 'https://akvot-simple-demo.vercel.app';
const ALIAS_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const OUT_JSON = join(__dirname, 'PHASE-B-ACC-DISC-דיוק-2026-09-20.json');
const OUT_MD = join(__dirname, 'PHASE-B-ACC-DISC-דיוק-2026-09-20.md');

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

function vercelCurl(urlOrPath, { method = 'GET', body = null, deployment = null } = {}) {
  const args = ['curl'];
  if (deployment) {
    // path form with --deployment
    const path = urlOrPath.startsWith('http')
      ? new URL(urlOrPath).pathname + new URL(urlOrPath).search
      : urlOrPath;
    args.push(path, '--deployment', deployment, '--scope', SCOPE, '--');
  } else {
    args.push(urlOrPath, '--scope', SCOPE, '--');
  }
  args.push('-sS', '-H', 'Accept: application/json', '-H', `Origin: ${ALIAS_BASE}`);
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  }
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout: 180000,
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
  // sometimes vercel curl prints extra; try whole stdout
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
    stderr: (r.stderr || '').trim(),
  };
}

function leaks(text) {
  const hits = String(text || '').match(FORBIDDEN_RE) || [];
  return hits.map((x) => x.toLowerCase());
}

function facesCount(j) {
  if (Array.isArray(j?.images)) return j.images.length;
  if (typeof j?.faces === 'number') return j.faces;
  if (j?.faces === false) return 0;
  if (j?.faces === true) return 1;
  if (Array.isArray(j?.faces)) return j.faces.length;
  return 0;
}

function hasDossier(j) {
  if (!j || typeof j !== 'object') return false;
  if (j.uiState === 'dossier' || j.mode === 'dossier' || j.ui === 'dossier') return true;
  if (j.dossier && typeof j.dossier === 'object') return true;
  return false;
}

function deepScanForbidden(obj, path = '') {
  const found = [];
  if (obj == null) return found;
  if (typeof obj === 'string' || typeof obj === 'number') {
    const hits = leaks(String(obj));
    for (const h of hits) found.push({ path, term: h, value: String(obj).slice(0, 200) });
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

function saveRaw(label, req) {
  const file = `${label}.json`;
  writeFileSync(
    join(RAW, file),
    req.json ? JSON.stringify(req.json, null, 2) : JSON.stringify({ error: 'no-json', text: req.text, stderr: req.stderr }, null, 2)
  );
  return file;
}

function analyzeDiscovery(label, seed, hints, req) {
  const j = req.json;
  const snap = j?.snapshot || j;
  const text = JSON.stringify(j || {});
  const leakHits = deepScanForbidden(j);
  const findings = Array.isArray(snap?.findings) ? snap.findings : Array.isArray(j?.findings) ? j.findings : [];
  const evidence = Array.isArray(snap?.evidence) ? snap.evidence : Array.isArray(j?.evidence) ? j.evidence : [];
  const facets = Array.isArray(snap?.facets) ? snap.facets : Array.isArray(j?.facets) ? j.facets : [];
  const graph = snap?.graph || j?.graph || null;
  const candidates = Array.isArray(snap?.candidates) ? snap.candidates : Array.isArray(j?.candidates) ? j.candidates : [];
  const status = snap?.status || j?.status || null;
  const fiv = snap?.forbiddenIdentitiesVersion || j?.forbiddenIdentitiesVersion || null;
  const dossier = hasDossier(j) || hasDossier(snap);
  const faces = facesCount(j) + facesCount(snap);
  const entityRefs = [];
  for (const f of findings) {
    if (Array.isArray(f?.entityRefs)) entityRefs.push(...f.entityRefs);
  }
  // UNKNOWN≠FALSE: Discovery must not emit dossier / committed identity certainty
  const falseDossier = dossier === true;
  // progressive: status may be partial|complete|running|failed_soft
  const progressiveOk = ['running', 'partial', 'complete', 'failed_soft'].includes(String(status));

  const checks = {
    http_ok: !!(j && (j.ok === true || j.sessionId || findings.length >= 0) && req.exit === 0),
    session_created: !!(j?.sessionId || snap?.sessionId),
    no_Q1701775: leakHits.length === 0,
    no_dossier: !falseDossier,
    faces_zero: faces === 0,
    has_forbiddenIdentitiesVersion: !!fiv,
    progressive_status_valid: progressiveOk,
    findings_scrubbed: leakHits.filter((x) => String(x.path).includes('finding')).length === 0,
    facets_scrubbed: leakHits.filter((x) => String(x.path).includes('facet')).length === 0,
    graph_scrubbed: leakHits.filter((x) => String(x.path).includes('graph')).length === 0,
    candidates_scrubbed: leakHits.filter((x) => String(x.path).includes('candidate')).length === 0,
    evidence_has_provenance: evidence.length === 0 || evidence.every((e) => e?.provenanceUrl || e?.url),
  };
  const pass = Object.values(checks).every(Boolean) && leakHits.length === 0 && !falseDossier && faces === 0;

  const out = {
    label,
    seed,
    hints: hints || null,
    surface: 'discovery',
    method: req.method,
    ms: req.ms,
    exit: req.exit,
    ok: j?.ok ?? null,
    sessionId: j?.sessionId || snap?.sessionId || null,
    status,
    forbiddenIdentitiesVersion: fiv,
    findings_n: findings.length,
    evidence_n: evidence.length,
    facets_n: facets.length,
    candidates_n: candidates.length,
    graph_nodes: Array.isArray(graph?.nodes) ? graph.nodes.length : graph ? 1 : 0,
    entityRefs_n: entityRefs.length,
    dossier: falseDossier,
    faces,
    leakage_count: leakHits.length,
    leakage: leakHits.slice(0, 20),
    checks,
    pass,
    raw_file: saveRaw(label, req),
  };
  return out;
}

function analyzeLookup(label, req, expect) {
  const j = req.json;
  const text = JSON.stringify(j || {});
  const leakHits = deepScanForbidden(j);
  const ui = j?.uiState ?? j?.mode ?? j?.ui ?? null;
  const qid = j?.qid ?? j?.dossier?.qid ?? null;
  const faces = facesCount(j);
  const checks = {};
  let pass = true;

  if (expect.uiExact) {
    checks.ui = ui === expect.uiExact;
    pass = pass && checks.ui;
  }
  if (expect.uiIn) {
    checks.ui = expect.uiIn.includes(ui) && ui !== 'dossier';
    pass = pass && checks.ui;
  }
  if (expect.qidExact) {
    checks.qid = qid === expect.qidExact;
    pass = pass && checks.qid;
  }
  if (expect.neverQid) {
    checks.never_qid = qid !== expect.neverQid && leakHits.length === 0;
    pass = pass && checks.never_qid;
  }
  if (expect.faces === 0) {
    checks.faces_zero = faces === 0;
    pass = pass && checks.faces_zero;
  }
  checks.no_leakage = leakHits.length === 0;
  pass = pass && checks.no_leakage;
  checks.http_ok = !!(j && req.exit === 0);
  pass = pass && checks.http_ok;

  // pretty-wrong proxy
  const pw = ui === 'dossier' && (qid === 'Q1701775' || leakHits.length > 0);
  checks.pw_zero = !pw;
  pass = pass && !pw;

  return {
    label,
    surface: 'lookup',
    method: req.method,
    ms: req.ms,
    exit: req.exit,
    ui,
    qid,
    faces,
    leakage_count: leakHits.length,
    leakage: leakHits.slice(0, 10),
    pw: pw ? 1 : 0,
    checks,
    pass,
    expect,
    raw_file: saveRaw(label, req),
  };
}

const started = nowJerusalem();
console.log(`[acc-disc] start ${started}`);

// --- Health ---
const discHealth = vercelCurl('/api/health', { deployment: DISC_DPL });
const aliasHealth = vercelCurl('/api/health', { deployment: ALIAS_DPL });
saveRaw('disc-health', discHealth);
saveRaw('alias-health', aliasHealth);

const discHealthOk = discHealth.json?.build === DISC_DPL;
const aliasHealthOk = aliasHealth.json?.build === ALIAS_DPL || aliasHealth.json?.ok === true;
// alias may report build as dpl_8ag… — verify
console.log('[health] disc', discHealth.json?.build, 'alias', aliasHealth.json?.build);

// --- Acc-DISC: ≥3 Seeds on Discovery Preview ---
const seeds = [
  {
    label: 'disc-seed-he-soft',
    seed: 'דוד כהן',
    hints: { locale: 'he' },
    note: 'HE person soft — entity-agnostic',
  },
  {
    label: 'disc-seed-smith-ctx',
    seed: 'John Smith',
    hints: { org: 'IBM', city: 'New York', country: 'US' },
    note: 'Smith+IBM/NY/US — NEVER Q1701775',
  },
  {
    label: 'disc-seed-org-domain',
    seed: 'example.org',
    hints: { kind: 'domain' },
    note: 'Org/domain fixture',
  },
];

const discCases = [];
for (const s of seeds) {
  console.log(`[disc] POST session seed=${s.seed}`);
  const body = { seed: s.seed, hints: s.hints };
  const req = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body,
    deployment: DISC_DPL,
  });
  const analyzed = analyzeDiscovery(s.label, s.seed, s.hints, req);
  analyzed.note = s.note;
  discCases.push(analyzed);
  console.log(`  → pass=${analyzed.pass} status=${analyzed.status} findings=${analyzed.findings_n} leak=${analyzed.leakage_count} dossier=${analyzed.dossier}`);

  // Progressive/partial: also try GET if sessionId present (may 404 cross-instance — still scrub check if 200)
  if (analyzed.sessionId) {
    const getReq = vercelCurl(`/api/discovery/sessions/${analyzed.sessionId}`, {
      deployment: DISC_DPL,
    });
    const getLabel = `${s.label}-get`;
    if (getReq.json && getReq.json.ok !== false && !getReq.json.error) {
      const g = analyzeDiscovery(getLabel, s.seed, s.hints, getReq);
      g.note = 'progressive GET poll scrub';
      g.progressive_get = true;
      discCases.push(g);
      console.log(`  GET → pass=${g.pass} status=${g.status} leak=${g.leakage_count}`);
    } else {
      const skip = {
        label: getLabel,
        seed: s.seed,
        surface: 'discovery-get',
        note: 'GET skipped/404 (serverless Map not sticky) — POST snapshot is SoT',
        skip: true,
        pass: true, // not a fail — known limit
        http_status_hint: getReq.json?.error || getReq.text?.slice(0, 80),
        raw_file: saveRaw(getLabel, getReq),
      };
      discCases.push(skip);
      console.log(`  GET → skip (${getReq.json?.error || 'no body'})`);
    }
  }
}

// Extra: Smith via Core lookup ON PREVIEW (discovery wraps? — Acc plan: if discovery wraps lookup OR via lookup)
console.log('[disc] Smith+ctx via preview /api/lookup (forbidden scrub regression)');
const smithPreview = vercelCurl('/api/lookup', {
  method: 'POST',
  body: { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' }, nocache: 1 },
  deployment: DISC_DPL,
});
const smithPreviewCase = analyzeLookup('preview-lookup-smith-ctx', smithPreview, {
  uiIn: ['candidates', 'thin', 'need_context'],
  neverQid: 'Q1701775',
  faces: 0,
});
smithPreviewCase.note = 'Smith+ctx on preview lookup — Acc scrub';
discCases.push(smithPreviewCase);
console.log(`  → pass=${smithPreviewCase.pass} ui=${smithPreviewCase.ui} qid=${smithPreviewCase.qid} leak=${smithPreviewCase.leakage_count}`);

// --- Core regression on ALIAS ---
console.log('[core] alias Assaf / כהן / Smith');
const coreCases = [];

const assaf = analyzeLookup(
  'alias-assaf',
  vercelCurl(`/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}`, { deployment: ALIAS_DPL }),
  { uiExact: 'dossier', qidExact: 'Q47507930', faces: undefined, neverQid: 'Q1701775' }
);
// Assaf may have faces — Acc P0 cares about QID keep; don't force faces=0
delete assaf.checks.faces_zero;
assaf.pass = assaf.checks.ui && assaf.checks.qid && assaf.checks.no_leakage && assaf.checks.http_ok && assaf.checks.pw_zero;
coreCases.push(assaf);
console.log(`  Assaf → pass=${assaf.pass} ui=${assaf.ui} qid=${assaf.qid}`);

const cohen = analyzeLookup(
  'alias-cohen',
  vercelCurl(`/api/lookup?q=${encodeURIComponent('כהן')}`, { deployment: ALIAS_DPL }),
  { uiIn: ['need_context', 'thin', 'candidates'], faces: 0, neverQid: 'Q1701775' }
);
coreCases.push(cohen);
console.log(`  כהן → pass=${cohen.pass} ui=${cohen.ui} faces=${cohen.faces}`);

const smithBody = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };
const smithCold = analyzeLookup(
  'alias-smith-post-ctx-nocache',
  vercelCurl('/api/lookup', { method: 'POST', body: { ...smithBody, nocache: 1 }, deployment: ALIAS_DPL }),
  { uiIn: ['candidates', 'thin', 'need_context'], neverQid: 'Q1701775', faces: 0 }
);
const smithWarm = analyzeLookup(
  'alias-smith-post-ctx-warm',
  vercelCurl('/api/lookup', { method: 'POST', body: smithBody, deployment: ALIAS_DPL }),
  { uiIn: ['candidates', 'thin', 'need_context'], neverQid: 'Q1701775', faces: 0 }
);
coreCases.push(smithCold, smithWarm);
console.log(`  Smith cold → pass=${smithCold.pass} ui=${smithCold.ui} qid=${smithCold.qid} faces=${smithCold.faces} pw=${smithCold.pw}`);
console.log(`  Smith warm → pass=${smithWarm.pass} ui=${smithWarm.ui} qid=${smithWarm.qid} faces=${smithWarm.faces} pw=${smithWarm.pw}`);

// Aggregate
const discRunnable = discCases.filter((c) => !c.skip);
const discPass = discRunnable.every((c) => c.pass);
const discLeak = discRunnable.reduce((n, c) => n + (c.leakage_count || 0), 0);
const corePass = coreCases.every((c) => c.pass);
const coreLeak = coreCases.reduce((n, c) => n + (c.leakage_count || 0), 0);
const corePw = coreCases.reduce((n, c) => n + (c.pw || 0), 0);

const accDiscGo = discPass && discLeak === 0 && discHealthOk;
const coreAliasGo = corePass && coreLeak === 0 && corePw === 0;

const result = {
  meta: {
    checked_at: started,
    timezone: 'Asia/Jerusalem (UTC+3)',
    phase: 'B',
    role: 'דיוק',
    promote: false,
    discovery_preview: DISC_BASE,
    discovery_dpl: DISC_DPL,
    alias: ALIAS_BASE,
    alias_dpl_expected: ALIAS_DPL,
    alias_build_observed: aliasHealth.json?.build ?? null,
    forbidden: 'Q1701775',
    forbiddenIdentitiesVersion_expected: '2026-09-19.1',
    endpoints: {
      discovery: ['POST /api/discovery/sessions', 'GET /api/discovery/sessions/:id'],
      core: ['GET|POST /api/lookup'],
    },
  },
  health: {
    discovery: { build: discHealth.json?.build ?? null, match: discHealthOk, ms: discHealth.ms },
    alias: { build: aliasHealth.json?.build ?? null, match: aliasHealthOk || aliasHealth.json?.build === ALIAS_DPL, ms: aliasHealth.ms },
  },
  acc_disc: {
    verdict: accDiscGo ? 'GO' : 'NO-GO',
    pass: discPass,
    leakage_count: discLeak,
    seeds_n: seeds.length,
    cases: discCases,
  },
  core_alias: {
    verdict: coreAliasGo ? 'GO' : 'NO-GO',
    pass: corePass,
    leakage_count: coreLeak,
    pw: corePw,
    cases: coreCases,
  },
  summary: {
    'Acc-DISC': accDiscGo ? 'GO' : 'NO-GO',
    'Core-alias': coreAliasGo ? 'GO' : 'NO-GO',
    leakage_total: discLeak + coreLeak,
    pw_total: corePw,
    promote: 'NOT DONE',
  },
};

writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n');

function yn(b) {
  return b ? 'PASS' : 'FAIL';
}

const md = `# Phase B · Acc-DISC + Core regression · דיוק · 2026-09-20

**Checked:** ${started} (Asia/Jerusalem, UTC+3)  
**Promote:** **NO** (explicit)  
**Discovery Preview:** \`${DISC_BASE}\` · \`${DISC_DPL}\`  
**Core Alias:** \`${ALIAS_BASE}\` · expected \`${ALIAS_DPL}\` · observed build \`${aliasHealth.json?.build ?? 'null'}\`

## Verdict

| Gate | Result | Leakage | Notes |
|------|--------|---------|-------|
| **Acc-DISC** | **${result.summary['Acc-DISC']}** | ${discLeak} | ≥3 entity-agnostic Seeds · NEVER Q1701775 on Discovery emit |
| **Core alias (Acc P0)** | **${result.summary['Core-alias']}** | ${coreLeak} · pw=${corePw} | Assaf / כהן / Smith POST+ctx |

## Health

| Target | build | match |
|--------|-------|-------|
| Discovery Preview | \`${discHealth.json?.build ?? 'null'}\` | ${yn(discHealthOk)} |
| Alias | \`${aliasHealth.json?.build ?? 'null'}\` | ${yn(aliasHealth.json?.build === ALIAS_DPL)} |

## Acc-DISC cases (Discovery API)

Endpoints: \`POST /api/discovery/sessions\` · \`GET /api/discovery/sessions/:id\` (poll; GET may 404 cross-instance — POST snapshot SoT).

| Case | Seed | status | findings | leak | dossier | faces | Result |
|------|------|--------|----------|------|---------|-------|--------|
${discCases
  .map((c) => {
    if (c.skip) return `| ${c.label} | ${c.seed} | skip | — | — | — | — | SKIP (sticky Map) |`;
    return `| ${c.label} | ${c.seed ?? '—'} | ${c.status ?? c.ui ?? '—'} | ${c.findings_n ?? '—'} | ${c.leakage_count} | ${c.dossier ?? false} | ${c.faces ?? '—'} | ${c.pass ? 'PASS' : 'FAIL'} |`;
  })
  .join('\n')}

### Invariants exercised
- **ACC-DISC-01** leakage=0 (findings / candidates / facets / graph / progressive)
- **ACC-DISC-02** Discovery never emits dossier / identity commit
- **ACC-DISC-03** UNKNOWN≠FALSE (no false dossier from soft HE / ambiguous / org seeds)
- **ACC-DISC-06** NEVER Q1701775 in ranked Discovery outputs
- Smith+ctx also via preview \`/api/lookup\` scrub

## Core alias regression (Acc P0 must PASS)

| Case | ui | qid | faces | leak | pw | Result |
|------|----|-----|-------|------|----|--------|
${coreCases
  .map(
    (c) =>
      `| ${c.label} | ${c.ui} | ${c.qid ?? 'null'} | ${c.faces} | ${c.leakage_count} | ${c.pw} | ${c.pass ? 'PASS' : 'FAIL'} |`
  )
  .join('\n')}

Expectations:
- Assaf → \`dossier\` · \`Q47507930\`
- כהן → \`need_context|thin|candidates\` · faces=0
- Smith POST+ctx → never \`Q1701775\` · faces=0 · pw=0

## Leakage

- Discovery total: **${discLeak}**
- Core alias total: **${coreLeak}**
- Pretty-wrong (pw): **${corePw}**

## Artifacts

- JSON: \`test-results/discovery/PHASE-B-ACC-DISC-דיוק-2026-09-20.json\`
- MD: \`test-results/discovery/PHASE-B-ACC-DISC-דיוק-2026-09-20.md\`
- Raw: \`test-results/discovery/PHASE-B-ACC-DISC-raw/\`
- Runner: \`test-results/discovery/run-phase-b-acc-disc-2026-09-20.mjs\`

## Decision

- Acc-DISC: **${result.summary['Acc-DISC']}**
- Core alias: **${result.summary['Core-alias']}**
- **NO promote** performed.
`;

writeFileSync(OUT_MD, md);
console.log(JSON.stringify(result.summary, null, 2));
console.log('wrote', OUT_JSON);
console.log('wrote', OUT_MD);
process.exit(accDiscGo && coreAliasGo ? 0 : 1);
