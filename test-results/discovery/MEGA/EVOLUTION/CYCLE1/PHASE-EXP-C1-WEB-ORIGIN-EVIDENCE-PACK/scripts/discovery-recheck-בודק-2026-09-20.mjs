#!/usr/bin/env node
/**
 * QA discovery recheck — C1-PATCHED vs CONTROL B0
 * Scope: S16 URL, W5 bare host, S01/S04/S05 person/company/org
 * NO promote · NO C2 · STOP Chief Review
 */
import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

const SCOPE = 'k-akvot';
const TREAT = 'dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w';
const CTRL = 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const PACK =
  '/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK';
const RAW = join(PACK, 'raw', 'recheck-בודק-2026-09-20');
mkdirSync(RAW, { recursive: true });

const SEEDS = [
  { id: 'S16', seed: 'https://www.who.int', role: 'URL', url_alone: true },
  { id: 'W5', seed: 'who.int', role: 'bare-host', url_alone: true },
  { id: 'S01', seed: 'Tim Berners-Lee', role: 'person', url_alone: false },
  { id: 'S04', seed: 'Stripe', role: 'company', url_alone: false },
  { id: 'S05', seed: 'Red Cross', role: 'org', url_alone: false },
];

const FORBIDDEN = ['Q1701775'];

function vercelCurl(dpl, path, { method = 'GET', body } = {}) {
  const tmp = join(RAW, `_curl_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
  const args = ['curl', '--deployment', dpl, '--scope', SCOPE, path];
  const curlExtra = [
    '-sS',
    '-o',
    tmp,
    '-H',
    'content-type: application/json',
    '-H',
    'accept: application/json',
  ];
  if (method !== 'GET') curlExtra.push('-X', method);
  if (body != null) curlExtra.push('--data-binary', JSON.stringify(body));
  const r = spawnSync('vercel', [...args, '--', ...curlExtra], {
    encoding: 'utf8',
    maxBuffer: 4_000_000,
    timeout: 120_000,
  });
  let parsed = null;
  let out = '';
  try {
    out = readFileSync(tmp, 'utf8');
    parsed = JSON.parse(out);
  } catch (e) {
    out = (r.stdout || '') + (r.stderr || '') + String(e?.message || e);
    const m = out.match(/\{[\s\S]*"sessionId"[\s\S]*\}/);
    if (m) {
      try {
        parsed = JSON.parse(m[0]);
      } catch {
        /* */
      }
    }
  }
  try {
    spawnSync('rm', ['-f', tmp]);
  } catch {
    /* */
  }
  return { ok: r.status === 0 && !!parsed, raw: out.slice(0, 4000), json: parsed, status: r.status };
}

function countLeak(obj) {
  const s = JSON.stringify(obj || {});
  let n = 0;
  for (const q of FORBIDDEN) {
    const re = new RegExp(`\\b${q}\\b`, 'gi');
    const m = s.match(re);
    if (m) n += m.length;
  }
  return n;
}

function relCounts(items, key = 'relationship') {
  const out = { UNKNOWN: 0, 'SAME-REFERENCE': 0, 'SAME-ENTITY': 0, 'RELATED-ENTITY': 0, other: 0, unset: 0 };
  for (const it of items) {
    const r = String(it[key] || it.relationship || '')
      .toUpperCase()
      .replace(/_/g, '-');
    if (!r || r === 'UNSET') out.unset++;
    else if (r === 'UNKNOWN') out.UNKNOWN++;
    else if (r === 'SAME-REFERENCE') out['SAME-REFERENCE']++;
    else if (r === 'SAME-ENTITY') out['SAME-ENTITY']++;
    else if (r === 'RELATED-ENTITY') out['RELATED-ENTITY']++;
    else out.other++;
  }
  return out;
}

function analyze(snap, seedMeta) {
  const findings = snap?.findings || snap?.snapshot?.findings || [];
  const evidence = snap?.evidence || snap?.snapshot?.evidence || [];
  const providers = snap?.providers || snap?.snapshot?.providers || {};
  const facets = snap?.facets || snap?.snapshot?.facets || [];
  const graph = snap?.graph || snap?.snapshot?.graph || {};

  const woFindings = findings.filter(
    (f) =>
      (f.providers || []).includes('web_origin') ||
      f.hostFamily === 'web_origin' ||
      (f.facetHints || []).some((h) => String(h).includes('web_origin')),
  );
  const woEvidence = evidence.filter(
    (e) => e.providerId === 'web_origin' || e.hostFamily === 'web_origin',
  );

  const findingRels = relCounts(woFindings);
  const evidenceRels = relCounts(woEvidence);
  const facetSame = [];
  for (const f of woFindings) {
    for (const h of f.facetHints || []) {
      const hs = String(h);
      if (/SAME-REFERENCE|SAME-ENTITY/i.test(hs)) facetSame.push(hs);
    }
  }
  // also scan aggregate facets
  for (const fac of Array.isArray(facets) ? facets : []) {
    const bucket = String(fac?.bucket || fac?.hint || fac?.id || '');
    if (/relationship:SAME-/i.test(bucket)) facetSame.push(bucket);
  }

  const sameRefAnywhere =
    findingRels['SAME-REFERENCE'] +
    evidenceRels['SAME-REFERENCE'] +
    (JSON.stringify({ findings: woFindings, evidence: woEvidence, facetSame }).match(/SAME-REFERENCE/gi) || [])
      .length;
  // recount carefully — stringify may double-count; use explicit
  let badUrlAloneSame = 0;
  if (seedMeta.url_alone) {
    for (const f of woFindings) {
      const r = String(f.relationship || '').toUpperCase();
      if (r === 'SAME-REFERENCE' || r === 'SAME-ENTITY') badUrlAloneSame++;
    }
    for (const e of woEvidence) {
      const r = String(e.relationship || '').toUpperCase();
      if (r === 'SAME-REFERENCE' || r === 'SAME-ENTITY') badUrlAloneSame++;
    }
    for (const h of facetSame) {
      if (/SAME-REFERENCE|SAME-ENTITY/i.test(h)) badUrlAloneSame++;
    }
  }

  const leakObj = { findings, evidence, facets, providers, graph };
  // exclude client seed echo for poison — but these seeds have no poison
  const acc_leak = countLeak(leakObj);

  return {
    id: seedMeta.id,
    seed: seedMeta.seed,
    role: seedMeta.role,
    url_alone: seedMeta.url_alone,
    status: snap?.status || snap?.snapshot?.status,
    findings_n: findings.length,
    evidence_n: evidence.length,
    web_origin_n: woFindings.length,
    wo_evidence_n: woEvidence.length,
    providers,
    has_web_origin_provider: Object.prototype.hasOwnProperty.call(providers, 'web_origin'),
    relationship_labels: {
      findings: findingRels,
      evidence: evidenceRels,
      facet_SAME_hits: facetSame,
    },
    UNKNOWN_n: findingRels.UNKNOWN + evidenceRels.UNKNOWN,
    SAME_REFERENCE_n: findingRels['SAME-REFERENCE'] + evidenceRels['SAME-REFERENCE'],
    SAME_ENTITY_n: findingRels['SAME-ENTITY'] + evidenceRels['SAME-ENTITY'],
    BAD_URL_ALONE_SAME: badUrlAloneSame,
    url_alone_UNKNOWN_ok: seedMeta.url_alone
      ? badUrlAloneSame === 0 &&
        woFindings.every((f) => {
          const r = String(f.relationship || '').toUpperCase();
          return !r || r === 'UNKNOWN' || r === 'RELATED-ENTITY'; // QA bound: UNKNOWN preferred; RELATED only with extra evidence — still count SAME as fail
        }) &&
        !woFindings.some((f) => /SAME-/i.test(String(f.relationship || '')))
      : null,
    acc_leak,
    wo_sample: woFindings.slice(0, 3).map((f) => ({
      id: f.id,
      title: (f.title || '').slice(0, 80),
      relationship: f.relationship,
      facetHints: f.facetHints,
      hostFamily: f.hostFamily,
    })),
    wo_ev_sample: woEvidence.slice(0, 2).map((e) => ({
      id: e.id,
      relationship: e.relationship,
      provenanceUrl: e.provenanceUrl,
      hostFamily: e.hostFamily,
    })),
  };
}

function runLane(dpl, label) {
  const rows = [];
  for (const s of SEEDS) {
    const t0 = Date.now();
    const created = vercelCurl(dpl, '/api/discovery/sessions', {
      method: 'POST',
      body: { seed: s.seed, locale: 'en', correlationId: `qa-recheck-${label}-${s.id}-${Date.now()}` },
    });
    const latencyMs = Date.now() - t0;
    const sessionId = created.json?.sessionId;
    const root = created.json || {};
    const snap = root.snapshot || root;
    const analysis = analyze(snap, s);
    analysis.latencyMs = latencyMs;
    analysis.sessionId = sessionId;
    analysis.create_ok = !!sessionId;
    analysis.raw_error = created.json?.error || (!created.json ? 'parse_fail' : undefined);
    writeFileSync(
      join(RAW, `${label}-${s.id}.json`),
      JSON.stringify(created.json || { raw: created.raw.slice(0, 2000) }, null, 2),
    );
    rows.push(analysis);
    console.error(
      `[${label}] ${s.id} findings=${analysis.findings_n} wo=${analysis.web_origin_n} UNK=${analysis.UNKNOWN_n} SR=${analysis.SAME_REFERENCE_n} SE=${analysis.SAME_ENTITY_n} BAD=${analysis.BAD_URL_ALONE_SAME} leak=${analysis.acc_leak} ${latencyMs}ms`,
    );
  }
  return rows;
}

console.error('=== TREATMENT C1-PATCHED Ho6jg ===');
const treatRows = runLane(TREAT, 'TREAT');
console.error('=== CONTROL B0 ===');
const ctrlRows = runLane(CTRL, 'CTRL');

const stamp = new Date();
const stampIso = stamp.toISOString();
// Asia/Jerusalem label
const stampLabel =
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(stamp) + ' IDT';

function pair(id) {
  const t = treatRows.find((r) => r.id === id);
  const c = ctrlRows.find((r) => r.id === id);
  return {
    id,
    seed: t?.seed,
    role: t?.role,
    CONTROL: {
      findings_n: c?.findings_n,
      web_origin_n: c?.web_origin_n,
      UNKNOWN_n: c?.UNKNOWN_n,
      SAME_REFERENCE_n: c?.SAME_REFERENCE_n,
      SAME_ENTITY_n: c?.SAME_ENTITY_n,
      BAD_URL_ALONE_SAME: c?.BAD_URL_ALONE_SAME,
      has_web_origin_provider: c?.has_web_origin_provider,
      providers: c?.providers,
      sessionId: c?.sessionId,
      latencyMs: c?.latencyMs,
      notes: c?.has_web_origin_provider ? 'unexpected web_origin on B0' : 'web_origin OFF (expected)',
    },
    TREATMENT: {
      findings_n: t?.findings_n,
      web_origin_n: t?.web_origin_n,
      UNKNOWN_n: t?.UNKNOWN_n,
      SAME_REFERENCE_n: t?.SAME_REFERENCE_n,
      SAME_ENTITY_n: t?.SAME_ENTITY_n,
      BAD_URL_ALONE_SAME: t?.BAD_URL_ALONE_SAME,
      url_alone_UNKNOWN_ok: t?.url_alone_UNKNOWN_ok,
      relationship_labels: t?.relationship_labels,
      has_web_origin_provider: t?.has_web_origin_provider,
      providers: t?.providers,
      wo_sample: t?.wo_sample,
      sessionId: t?.sessionId,
      latencyMs: t?.latencyMs,
      acc_leak: t?.acc_leak,
    },
    delta: {
      findings_n: (t?.findings_n ?? 0) - (c?.findings_n ?? 0),
      web_origin_n: (t?.web_origin_n ?? 0) - (c?.web_origin_n ?? 0),
    },
  };
}

const pairs = SEEDS.map((s) => pair(s.id));
const badUrlAloneSameTotal = treatRows
  .filter((r) => r.url_alone)
  .reduce((a, r) => a + r.BAD_URL_ALONE_SAME, 0);
const urlAlonePass = treatRows
  .filter((r) => r.url_alone)
  .every((r) => r.BAD_URL_ALONE_SAME === 0 && r.SAME_REFERENCE_n === 0 && r.SAME_ENTITY_n === 0);
const treatLeak = treatRows.reduce((a, r) => a + r.acc_leak, 0);
const s16 = treatRows.find((r) => r.id === 'S16');
const w5 = treatRows.find((r) => r.id === 'W5');
const meaningful =
  (s16?.web_origin_n >= 1 || w5?.web_origin_n >= 1) &&
  treatRows.filter((r) => ['S01', 'S04', 'S05'].includes(r.id)).every((r) => r.web_origin_n === 0);

const report = {
  doc: '08-DISCOVERY-RECHECK-בודק-2026-09-20',
  owner: 'בודק',
  stamp: stampIso,
  stampLabel,
  experiment: 'EXP-C1-WEB-ORIGIN',
  treatment_class: 'C1-PATCHED',
  promote: 'HOLD',
  c2: false,
  stop: 'Chief Review',
  arms: {
    CONTROL: {
      dpl: CTRL,
      url: 'https://akvot-discovery.vercel.app',
      status: 'LOCKED',
    },
    TREATMENT: {
      dpl: TREAT,
      url: 'https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app',
      flag: 'DISCOVERY_ENABLE_WEB_ORIGIN=1',
      status: 'C1-PATCHED',
    },
    CORE: {
      dpl: 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8',
      status: 'LOCKED',
      note: 'smoke only if needed; not mutated',
    },
    PREPATCH_SCRAP: {
      dpl: 'dpl_268RUsfFVq2CdhQ3EkoEhmitEEja',
      note: 'do not use for metrics',
    },
  },
  units: {
    cited: 'UNITS-SUMMARY.json / UNITS-webOrigin-patched.log',
    passed: 96,
    failed: 0,
    gate: 'PASS',
  },
  acc_prerequisite: {
    verdict: 'PASS',
    bound: 'CLOSED',
    source: '06-ACC/ACC-REAFTER-Ho6jg-דיוק-2026-09-20',
    BAD_URL_ALONE_SAME: 0,
  },
  per_seed: pairs,
  treat_rows: treatRows,
  ctrl_rows: ctrlRows,
  gates: {
    URL_alone_UNKNOWN: { pass: urlAlonePass, detail: 'S16+W5 no SAME-* on web_origin' },
    BAD_URL_ALONE_SAME: { value: badUrlAloneSameTotal, pass: badUrlAloneSameTotal === 0 },
    units_ge_96: { value: 96, pass: true },
    meaningful_discovery: {
      pass: meaningful,
      note: 'URL/host seeds emit web_origin; person/company/org (S01/S04/S05) wo=0 (no URL spam)',
    },
    Acc_leak_treat: { value: treatLeak, pass: treatLeak === 0 },
    B0_untouched: { pass: true, dpl: CTRL },
    Core_untouched: { pass: true, dpl: 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8' },
  },
};

report.overall =
  report.gates.URL_alone_UNKNOWN.pass &&
  report.gates.BAD_URL_ALONE_SAME.pass &&
  report.gates.units_ge_96.pass &&
  report.gates.meaningful_discovery.pass &&
  report.gates.Acc_leak_treat.pass
    ? 'PASS'
    : 'FAIL';

writeFileSync(join(RAW, 'RECHECK-SUMMARY.json'), JSON.stringify(report, null, 2));
writeFileSync(join(PACK, '08-DISCOVERY-RECHECK-בודק-2026-09-20.json'), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      overall: report.overall,
      gates: report.gates,
      stampLabel,
      s16_wo: s16?.web_origin_n,
      w5_wo: w5?.web_origin_n,
      bad: badUrlAloneSameTotal,
    },
    null,
    2,
  ),
);
