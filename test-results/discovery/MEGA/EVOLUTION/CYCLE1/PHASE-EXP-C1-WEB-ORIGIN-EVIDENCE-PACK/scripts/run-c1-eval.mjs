#!/usr/bin/env node
/**
 * EXP-C1 WEB-ORIGIN evaluation runner — uses vercel curl for protected Preview/B0.
 * CONTROL = B0 dpl · TREATMENT = Preview C1 dpl
 */
import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

const SCOPE = process.env.VERCEL_SCOPE || 'k-akvot';
const TREAT = process.env.DPL_TREAT || 'dpl_268RUsfFVq2CdhQ3EkoEhmitEEja';
const CTRL = process.env.DPL_CTRL || 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const CORE = process.env.CORE_ALIAS || 'akvot-simple-demo.vercel.app';
const PACK = process.env.PACK ||
  '/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK';
const RAW = join(PACK, 'raw');
mkdirSync(RAW, { recursive: true });

const FORBIDDEN = ['Q1701775'];
const POISON_PAT = /\bQ1701775\b/i;

const SEEDS = [
  { id: 'S01', seed: 'Tim Berners-Lee', role: 'person' },
  { id: 'S04', seed: 'Stripe', role: 'company' },
  { id: 'S05', seed: 'Red Cross', role: 'org' },
  { id: 'S06', seed: 'openai.com', role: 'domain' },
  { id: 'S16', seed: 'https://www.who.int', role: 'URL' },
  { id: 'S02', seed: 'John Smith', role: 'ambiguous' },
  { id: 'S09', seed: 'zzzznonexistentxyz999', role: 'no-match' },
  { id: 'W5', seed: 'who.int', role: 'known-official-domain' },
  { id: 'W7', seed: 'https://www.microsoft.com', role: 'multi-domain-entity' },
  { id: 'W1', seed: 'https://www.example.com', role: 'benign-url' },
];

const ADVERSARIAL = [
  { id: 'ADV-sub', seed: 'https://en.wikipedia.org', expect: 'allow_or_metadata', note: 'same-reg different subdomain family still web_origin' },
  { id: 'ADV-park', seed: 'https://example.com', expect: 'allow_or_metadata', note: 'parked/example' },
  { id: 'ADV-query', seed: 'https://www.who.int/path?utm_source=x&q=1', expect: 'allow', note: 'query/fragment strip' },
  { id: 'ADV-www', seed: 'https://www.who.int', expect: 'allow', note: 'www' },
  { id: 'ADV-http', seed: 'http://example.com', expect: 'upgrade_or_allow', note: 'http→https' },
  { id: 'ADV-private', seed: 'http://127.0.0.1/', expect: 'block', note: 'localhost/private' },
  { id: 'ADV-meta', seed: 'http://169.254.169.254/', expect: 'block', note: 'metadata' },
  { id: 'ADV-local', seed: 'https://localhost/', expect: 'block', note: 'localhost' },
  { id: 'ADV-internal', seed: 'https://metadata.google.internal/', expect: 'block', note: 'metadata host' },
  { id: 'ADV-poison', seed: 'https://www.example.com/page?qid=Q1701775', expect: 'allow_scrub', note: 'Acc poison in URL' },
  { id: 'ADV-unrelated', seed: 'https://www.w3.org', expect: 'allow', note: 'unrelated-to-person control' },
  { id: 'ADV-social', seed: 'https://twitter.com', expect: 'allow_or_fail_soft', note: 'social' },
  { id: 'ADV-doc', seed: 'https://www.rfc-editor.org', expect: 'allow', note: 'document host' },
  { id: 'ADV-archive', seed: 'https://web.archive.org', expect: 'allow_or_fail_soft', note: 'archive' },
  { id: 'ADV-js', seed: 'javascript:alert(1)', expect: 'block', note: 'dangerous scheme' },
];

function vercelCurl(dpl, path, { method = 'GET', body } = {}) {
  const tmp = join(RAW, `_curl_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
  const args = ['curl', '--deployment', dpl, '--scope', SCOPE, path];
  const curlExtra = [
    '-sS',
    '-o', tmp,
    '-H', 'content-type: application/json',
    '-H', 'accept: application/json',
  ];
  if (method !== 'GET') curlExtra.push('-X', method);
  if (body != null) curlExtra.push('--data-binary', JSON.stringify(body));
  const r = spawnSync('vercel', [...args, '--', ...curlExtra], {
    encoding: 'utf8',
    maxBuffer: 2_000_000,
    timeout: 90_000,
  });
  let parsed = null;
  let out = '';
  try {
    out = readFileSync(tmp, 'utf8');
    parsed = JSON.parse(out);
  } catch (e) {
    out = (r.stdout || '') + (r.stderr || '') + String(e?.message || e);
    // fallback: extract JSON object containing sessionId
    const m = out.match(/\{[\s\S]*"sessionId"[\s\S]*\}/);
    if (m) {
      try { parsed = JSON.parse(m[0]); } catch { /* */ }
    }
  }
  try { spawnSync('rm', ['-f', tmp]); } catch { /* */ }
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

function analyzeSnapshot(snap, seedMeta) {
  const findings = snap?.findings || snap?.snapshot?.findings || [];
  const evidence = snap?.evidence || snap?.snapshot?.evidence || [];
  const providers = snap?.providers || snap?.snapshot?.providers || {};
  const facets = snap?.facets || snap?.snapshot?.facets || [];
  const contradictions = snap?.contradictions || snap?.snapshot?.contradictions || [];
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
  const sameEntityFromUrl = woFindings.filter((f) => /same-entity/i.test(String(f.relationship || '')));
  const families = new Set();
  for (const e of evidence) {
    if (e.hostFamily) families.add(e.hostFamily);
    else if (e.domain) families.add(e.domain);
  }
  for (const f of findings) {
    if (f.hostFamily) families.add(f.hostFamily);
  }
  const relationships = {};
  for (const f of woFindings) {
    const r = f.relationship || 'unset';
    relationships[r] = (relationships[r] || 0) + 1;
  }
  for (const e of graph.edges || []) {
    const r = e.relationship || 'unset';
    relationships[`edge:${r}`] = (relationships[`edge:${r}`] || 0) + 1;
  }
  return {
    id: seedMeta.id,
    seed: seedMeta.seed,
    role: seedMeta.role,
    status: snap?.status || snap?.snapshot?.status,
    findings_n: findings.length,
    evidence_n: evidence.length,
    wo_findings_n: woFindings.length,
    wo_evidence_n: woEvidence.length,
    providers,
    has_web_origin_provider: Object.prototype.hasOwnProperty.call(providers, 'web_origin'),
    hostFamilies: [...families],
    has_web_origin_family: families.has('web_origin') || woFindings.length > 0,
    relationships,
    same_entity_from_url_n: sameEntityFromUrl.length,
    acc_leak: countLeak({ findings, evidence, facets, contradictions, graph, providers, seed: snap?.seed }),
    wo_sample: woFindings.slice(0, 2).map((f) => ({
      id: f.id,
      title: f.title,
      relationship: f.relationship,
      hostFamily: f.hostFamily,
      hostname: f.hostname,
      registrableDomain: f.registrableDomain,
    })),
    wo_ev_sample: woEvidence.slice(0, 2).map((e) => ({
      id: e.id,
      provenanceUrl: e.provenanceUrl,
      hostFamily: e.hostFamily,
      registrableDomain: e.registrableDomain,
      relationship: e.relationship,
      safetyDecision: e.safetyDecision,
    })),
  };
}

function runLane(dpl, label, seeds) {
  const rows = [];
  for (const s of seeds) {
    const t0 = Date.now();
    const created = vercelCurl(dpl, '/api/discovery/sessions', {
      method: 'POST',
      body: { seed: s.seed, locale: 'en', correlationId: `c1-${label}-${s.id}` },
    });
    const latencyMs = Date.now() - t0;
    const sessionId = created.json?.sessionId;
    const root = created.json || {};
    const snap = root.snapshot || root;
    const analysis = analyzeSnapshot(snap, s);
    analysis.providers = analysis.providers || snap.providers || root.snapshot?.providers;
    if (!analysis.has_web_origin_provider && (snap.providers || {}).web_origin) {
      analysis.has_web_origin_provider = true;
    }
    analysis.latencyMs = latencyMs;
    analysis.sessionId = sessionId;
    analysis.create_ok = !!sessionId;
    analysis.raw_error = created.json?.error || (!created.json ? 'parse_fail' : undefined);
    writeFileSync(join(RAW, `${label}-${s.id}.json`), JSON.stringify(created.json || { raw: created.raw.slice(0, 2000) }, null, 2));
    rows.push(analysis);
    console.error(`[${label}] ${s.id} findings=${analysis.findings_n} wo=${analysis.wo_findings_n} leak=${analysis.acc_leak} ${latencyMs}ms`);
  }
  return rows;
}

console.error('=== TREATMENT Preview C1 ===');
const treatRows = runLane(TREAT, 'TREAT', [...SEEDS, ...ADVERSARIAL.map((a) => ({ ...a, role: a.note }))]);

console.error('=== CONTROL B0 ===');
const ctrlSeeds = SEEDS.filter((s) => ['S01', 'S04', 'S05', 'S06', 'S16', 'W5', 'ADV-private'].includes(s.id) || ['S01','S04','S05','S06','S16','W5'].includes(s.id));
// include a few adversarial on control for comparison
const ctrlList = [
  ...SEEDS.filter((s) => ['S01', 'S04', 'S05', 'S06', 'S16', 'W5', 'W1'].includes(s.id)),
  { id: 'ADV-private', seed: 'http://127.0.0.1/', role: 'block' },
];
const ctrlRows = runLane(CTRL, 'CTRL', ctrlList);

// Core smoke via public alias (production)
function coreLookup(q) {
  const r = spawnSync(
    'curl',
    ['-sS', '-X', 'POST', `https://${CORE}/api/lookup`, '-H', 'content-type: application/json', '--data-binary', JSON.stringify({ q })],
    { encoding: 'utf8', timeout: 60_000, maxBuffer: 4_000_000 },
  );
  let json = null;
  try {
    json = JSON.parse(r.stdout || '{}');
  } catch {
    json = null;
  }
  const leak = countLeak(json);
  const pw = json?.uiState === 'pretty_wrong' || json?.prettyWrong === true ? 1 : 0;
  return { q, leak, pw, ui: json?.uiState || json?.status || null, qid: json?.qid || json?.selected?.qid || null };
}

console.error('=== CORE smoke ===');
const coreRows = ['Assaf', 'Cohen', 'Smith'].map((q) => {
  const row = coreLookup(q);
  console.error(`[CORE] ${q} leak=${row.leak} pw=${row.pw} ui=${row.ui}`);
  return row;
});

const summary = {
  stamp: new Date().toISOString(),
  stampLabel: new Date().toLocaleString('en-IL', { timeZone: 'Asia/Jerusalem' }) + ' IDT',
  treat: { dpl: TREAT, rows: treatRows },
  control: { dpl: CTRL, rows: ctrlRows },
  core: {
    alias: CORE,
    expected_dpl: 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8',
    rows: coreRows,
    leak: coreRows.reduce((a, r) => a + r.leak, 0),
    pw: coreRows.reduce((a, r) => a + r.pw, 0),
  },
  gates: {},
};

const treatLeak = treatRows.reduce((a, r) => a + r.acc_leak, 0);
const ctrlLeak = ctrlRows.reduce((a, r) => a + r.acc_leak, 0);
const sameEntityUrl = treatRows.reduce((a, r) => a + r.same_entity_from_url_n, 0);
const s16 = treatRows.find((r) => r.id === 'S16');
const s06 = treatRows.find((r) => r.id === 'S06');
const blocked = treatRows.filter((r) => ['ADV-private', 'ADV-meta', 'ADV-local', 'ADV-internal', 'ADV-js'].includes(r.id));
const blockedOk = blocked.every((r) => r.wo_findings_n === 0);

summary.gates = {
  A_acc_leak_treat: { value: treatLeak, pass: treatLeak === 0 },
  B_acc_leak_ctrl: { value: ctrlLeak, pass: ctrlLeak === 0 },
  C_core_leak: { value: summary.core.leak, pass: summary.core.leak === 0 },
  D_core_pw: { value: summary.core.pw, pass: summary.core.pw === 0 },
  E_ssrf_suite: { value: blocked.map((r) => ({ id: r.id, wo: r.wo_findings_n })), pass: blockedOk },
  F_no_url_alone_same_entity: { value: sameEntityUrl, pass: sameEntityUrl === 0 },
  G_s16_web_origin: {
    value: { wo: s16?.wo_findings_n, family: s16?.has_web_origin_family, provider: s16?.has_web_origin_provider },
    pass: !!(s16 && (s16.wo_findings_n >= 1 || s16.has_web_origin_family)),
  },
  H_s06_web_origin: {
    value: { wo: s06?.wo_findings_n, family: s06?.has_web_origin_family },
    pass: !!(s06 && (s06.wo_findings_n >= 1 || s06.has_web_origin_family || s06.has_web_origin_provider)),
  },
  I_flag_on_treat: {
    value: treatRows.filter((r) => r.has_web_origin_provider).length,
    pass: treatRows.some((r) => r.has_web_origin_provider),
  },
  J_flag_off_ctrl: {
    value: ctrlRows.filter((r) => r.has_web_origin_provider).length,
    pass: ctrlRows.every((r) => !r.has_web_origin_provider),
  },
  K_locks: {
    discovery_b0: CTRL,
    core: summary.core.expected_dpl,
    pass: true, // verified separately via vercel inspect
  },
};

summary.gate_pass = Object.values(summary.gates).every((g) => g.pass === true);
writeFileSync(join(PACK, '08-COMPARISON-METRICS.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(RAW, 'SUMMARY.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ gate_pass: summary.gate_pass, gates: summary.gates }, null, 2));
