#!/usr/bin/env node
/**
 * Acc AFTER Preview · EXP-C1 WEB-ORIGIN · דיוק
 * Control B0 vs Treatment Preview · leak scan · identity audit · adversarial subset · Core smoke
 * NO promote · NO B0/Core/A2 mutation
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PACK =
  process.env.PACK ||
  '/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK';
const RAW = join(PACK, 'raw/acc-reafter-Ho6jg-דיוק');
mkdirSync(RAW, { recursive: true });
mkdirSync(join(PACK, '06-ACC'), { recursive: true });

const SCOPE = 'k-akvot';
const ROOT = '/workspace/akvot-quick-demo';
const TREAT = process.env.DPL_TREAT || 'dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w';
const CTRL = process.env.DPL_CTRL || 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const CORE = 'https://akvot-simple-demo.vercel.app';
const FORBIDDEN_RE = /\bQ1701775\b|wd-Q1701775|wd_Q1701775|qid:Q1701775/gi;

const TREAT_SEEDS = [
  { id: 'S01', seed: 'Tim Berners-Lee', role: 'person' },
  { id: 'S04', seed: 'Stripe', role: 'company' },
  { id: 'S05', seed: 'Red Cross', role: 'org' },
  { id: 'S06', seed: 'openai.com', role: 'domain' },
  { id: 'S16', seed: 'https://www.who.int', role: 'URL' },
  { id: 'S02', seed: 'John Smith', role: 'ambiguous' },
  { id: 'W5', seed: 'who.int', role: 'domain' },
  { id: 'W7', seed: 'https://www.microsoft.com', role: 'URL' },
  { id: 'W1', seed: 'https://www.example.com', role: 'URL' },
  { id: 'ACC-P01', seed: 'https://www.example.com/page?qid=Q1701775', role: 'poison_query' },
  { id: 'ACC-P04', seed: 'https://www.wikidata.org/wiki/Q1701775', role: 'poison_entity_page' },
  { id: 'ACC-U01', seed: 'https://www.wikidata.org/wiki/Q80', role: 'entity_url' },
  { id: 'ACC-U02', seed: 'https://viaf.org/viaf/85312226', role: 'entity_url' },
  { id: 'ACC-H04', seed: 'https://en.wikipedia.org/wiki/John_Smith', role: 'homonym_wiki' },
  { id: 'ACC-S01', seed: 'http://127.0.0.1/', role: 'ssrf_block' },
  { id: 'ACC-S02', seed: 'https://localhost/', role: 'ssrf_block' },
  { id: 'ACC-S04', seed: 'http://169.254.169.254/', role: 'ssrf_block' },
  { id: 'ACC-S05', seed: 'https://metadata.google.internal/', role: 'ssrf_block' },
  { id: 'ACC-R01', seed: 'https://example.com/redirect?url=http://127.0.0.1/', role: 'redirect_private' },
  { id: 'ADV-js', seed: 'javascript:alert(1)', role: 'dangerous_scheme' },
];

const CTRL_SEEDS = [
  { id: 'S01', seed: 'Tim Berners-Lee', role: 'person' },
  { id: 'S04', seed: 'Stripe', role: 'company' },
  { id: 'S05', seed: 'Red Cross', role: 'org' },
  { id: 'S06', seed: 'openai.com', role: 'domain' },
  { id: 'S16', seed: 'https://www.who.int', role: 'URL' },
  { id: 'W1', seed: 'https://www.example.com', role: 'URL' },
  { id: 'ACC-S01', seed: 'http://127.0.0.1/', role: 'ssrf_block' },
];

function nowJ() {
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

function extractJson(stdout) {
  const s = String(stdout || '');
  const idx = s.indexOf('{');
  if (idx < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = idx; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(s.slice(idx, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function vercelCurl(dpl, path, { method = 'GET', body = null, timeout = 120000 } = {}) {
  const args = ['curl', path, '--deployment', dpl, '--scope', SCOPE, '--'];
  args.push('-sS', '-H', 'Accept: application/json', '-H', `Origin: ${CORE}`);
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  }
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout,
    cwd: ROOT,
  });
  const ms = Date.now() - t0;
  const stdout = (r.stdout || '') + (r.stderr || '');
  const json = extractJson(stdout);
  return { ms, json, stdout: stdout.slice(0, 8000), status: r.status };
}

function countLeak(obj) {
  const s = JSON.stringify(obj ?? {});
  const m = s.match(FORBIDDEN_RE);
  return m ? m.length : 0;
}

function isWoFinding(f) {
  return (
    f?.hostFamily === 'web_origin' ||
    (f?.providers || []).includes('web_origin') ||
    String(f?.id || '').startsWith('wo-')
  );
}

function isWoEvidence(e) {
  return e?.hostFamily === 'web_origin' || e?.providerId === 'web_origin';
}

function analyze(snap, meta) {
  const findings = snap?.findings || [];
  const evidence = snap?.evidence || [];
  const facets = snap?.facets || [];
  const contradictions = snap?.contradictions || [];
  const graph = snap?.graph || {};
  const providers = snap?.providers || {};
  const softEr = snap?.softEr || {};
  const woF = findings.filter(isWoFinding);
  const woE = evidence.filter(isWoEvidence);
  const relHist = {};
  let sameEntity = 0;
  let sameRef = 0;
  for (const f of woF) {
    const r = String(f.relationship || 'unset');
    relHist[r] = (relHist[r] || 0) + 1;
    if (/^SAME-ENTITY$/i.test(r)) sameEntity++;
    if (/^SAME-REFERENCE$/i.test(r)) sameRef++;
  }
  for (const e of woE) {
    const r = String(e.relationship || '');
    if (/^SAME-ENTITY$/i.test(r)) sameEntity++;
    if (/^SAME-REFERENCE$/i.test(r)) sameRef++;
  }
  // facet relationship buckets
  for (const fc of facets) {
    if (fc.key === 'hint' || /relationship/i.test(fc.key || '')) {
      for (const b of fc.buckets || []) {
        const v = String(b.value || '');
        if (/relationship:SAME-ENTITY/i.test(v)) sameEntity++;
        if (/relationship:SAME-REFERENCE/i.test(v)) sameRef++;
      }
    }
  }
  const leakPayload = {
    findings,
    evidence,
    facets,
    contradictions,
    graph,
    providers,
    softEr,
    status: snap?.status,
    forbiddenIdentitiesVersion: snap?.forbiddenIdentitiesVersion,
  };
  const leak = countLeak(leakPayload);
  const privateProv = woE.filter((e) => {
    const u = String(e.provenanceUrl || e.normalizedUrl || '');
    return /127\.0\.0\.1|169\.254\.|localhost|192\.168\.|10\.\d|metadata\.google/i.test(u);
  });
  return {
    id: meta.id,
    seed: meta.seed,
    role: meta.role,
    status: snap?.status,
    findings_n: findings.length,
    evidence_n: evidence.length,
    wo_findings_n: woF.length,
    wo_evidence_n: woE.length,
    providers,
    has_web_origin_provider: Object.prototype.hasOwnProperty.call(providers, 'web_origin'),
    rel_hist: relHist,
    same_entity_n: sameEntity,
    same_reference_n: sameRef,
    acc_leak: leak,
    forbidden_stripped: snap?.forbiddenStripped || 0,
    private_provenance_n: privateProv.length,
    wo_sample: woF.slice(0, 3).map((f) => ({
      id: f.id,
      relationship: f.relationship,
      hostFamily: f.hostFamily,
      title: f.title,
      registrableDomain: f.registrableDomain,
    })),
    wo_ev_sample: woE.slice(0, 2).map((e) => ({
      id: e.id,
      relationship: e.relationship,
      provenanceUrl: e.provenanceUrl,
      safetyDecision: e.safetyDecision,
      resultClass: e.resultClass,
    })),
  };
}

function runOne(dpl, label, meta, { pollMs = 2500, maxPoll = 12 } = {}) {
  const t0 = Date.now();
  const created = vercelCurl(dpl, '/api/discovery/sessions', {
    method: 'POST',
    body: { seed: meta.seed, locale: 'en', correlationId: `acc-c1-${label}-${meta.id}` },
  });
  let snap = created.json?.snapshot || created.json || {};
  let sessionId = created.json?.sessionId;
  let polls = 0;
  while (
    sessionId &&
    snap?.status &&
    !['complete', 'failed', 'error'].includes(snap.status) &&
    polls < maxPoll
  ) {
    spawnSync('sleep', [String(pollMs / 1000)]);
    const got = vercelCurl(dpl, `/api/discovery/sessions/${sessionId}`);
    if (got.json?.snapshot) snap = got.json.snapshot;
    else if (got.json?.findings) snap = got.json;
    else if (got.json?.status) snap = { ...snap, ...got.json };
    polls++;
    if (['complete', 'failed', 'error'].includes(snap?.status)) break;
  }
  // narrow surface
  let narrow = null;
  let narrowLeak = 0;
  if (sessionId) {
    const n = vercelCurl(dpl, `/api/discovery/sessions/${sessionId}/narrow`);
    narrow = n.json;
    narrowLeak = countLeak(narrow);
  }
  // SSE sample (short curl, may fail closed — count leak if body)
  let sseLeak = 0;
  let sseOk = false;
  if (sessionId) {
    const sse = spawnSync(
      'vercel',
      [
        'curl',
        `/api/discovery/sessions/${sessionId}/events`,
        '--deployment',
        dpl,
        '--scope',
        SCOPE,
        '--',
        '-sS',
        '-H',
        'Accept: text/event-stream',
        '--max-time',
        '3',
      ],
      { encoding: 'utf8', timeout: 15000, cwd: ROOT, maxBuffer: 8_000_000 },
    );
    const body = (sse.stdout || '') + (sse.stderr || '');
    sseOk = body.length > 0;
    sseLeak = (body.match(FORBIDDEN_RE) || []).length;
    writeFileSync(join(RAW, `${label}-${meta.id}-sse.txt`), body.slice(0, 4000));
  }

  const analysis = analyze(snap, meta);
  analysis.sessionId = sessionId;
  analysis.create_ok = !!sessionId;
  analysis.polls = polls;
  analysis.latencyMs = Date.now() - t0;
  analysis.narrow_leak = narrowLeak;
  analysis.sse_leak = sseLeak;
  analysis.sse_sampled = sseOk;
  analysis.total_leak = analysis.acc_leak + narrowLeak + sseLeak;
  analysis.raw_error = created.json?.error || (!created.json ? 'parse_fail' : undefined);
  writeFileSync(
    join(RAW, `${label}-${meta.id}.json`),
    JSON.stringify({ create: created.json, final: snap, narrow, analysis }, null, 2),
  );
  console.error(
    `[${label}] ${meta.id} status=${analysis.status} f=${analysis.findings_n} wo=${analysis.wo_findings_n} SE=${analysis.same_entity_n} SR=${analysis.same_reference_n} leak=${analysis.total_leak} ${analysis.latencyMs}ms`,
  );
  return analysis;
}

function runLane(dpl, label, seeds) {
  return seeds.map((s) => runOne(dpl, label, s));
}

console.error('=== Acc TREATMENT Preview C1 ===', TREAT);
const treatRows = runLane(TREAT, 'TREAT', TREAT_SEEDS);
console.error('=== Acc CONTROL B0 ===', CTRL);
const ctrlRows = runLane(CTRL, 'CTRL', CTRL_SEEDS);

function coreLookup(q) {
  const r = spawnSync(
    'curl',
    [
      '-sS',
      '-X',
      'POST',
      `${CORE}/api/lookup`,
      '-H',
      'content-type: application/json',
      '--data-binary',
      JSON.stringify({ q }),
    ],
    { encoding: 'utf8', timeout: 60000, maxBuffer: 4_000_000 },
  );
  let json = null;
  try {
    json = JSON.parse(r.stdout || '{}');
  } catch {
    json = null;
  }
  const leak = countLeak(json);
  const pw =
    json?.uiState === 'pretty_wrong' || json?.prettyWrong === true || json?.state === 'pretty_wrong'
      ? 1
      : 0;
  return { q, leak, pw, ui: json?.uiState || json?.status || null };
}

console.error('=== CORE alias smoke ===');
const coreRows = ['Assaf', 'Cohen', 'Smith'].map((q) => {
  const row = coreLookup(q);
  console.error(`[CORE] ${q} leak=${row.leak} pw=${row.pw} ui=${row.ui}`);
  return row;
});

const treatLeak = treatRows.reduce((a, r) => a + (r.total_leak || 0), 0);
const ctrlLeak = ctrlRows.reduce((a, r) => a + (r.total_leak || 0), 0);
const sameEntity = treatRows.reduce((a, r) => a + r.same_entity_n, 0);
const sameRef = treatRows.reduce((a, r) => a + r.same_reference_n, 0);
const privateProv = treatRows.reduce((a, r) => a + r.private_provenance_n, 0);
const coreLeak = coreRows.reduce((a, r) => a + r.leak, 0);
const corePw = coreRows.reduce((a, r) => a + r.pw, 0);

const blockIds = ['ACC-S01', 'ACC-S02', 'ACC-S04', 'ACC-S05', 'ADV-js'];
const blocked = treatRows.filter((r) => blockIds.includes(r.id));
const blockedOk = blocked.every((r) => r.wo_findings_n === 0 && r.private_provenance_n === 0);

const urlAloneIds = ['S06', 'S16', 'W5', 'W7', 'W1', 'ACC-P01', 'ACC-P04', 'ACC-U01', 'ACC-U02', 'ACC-H04'];
const urlAlone = treatRows.filter((r) => urlAloneIds.includes(r.id));
const urlAloneSameFail = urlAlone.filter((r) => r.same_entity_n > 0 || r.same_reference_n > 0);

const s16 = treatRows.find((r) => r.id === 'S16');
const s06 = treatRows.find((r) => r.id === 'S06');
const poison = treatRows.filter((r) => ['ACC-P01', 'ACC-P04'].includes(r.id));
const poisonLeak = poison.reduce((a, r) => a + r.total_leak, 0);

const ctrlWo = ctrlRows.reduce((a, r) => a + r.wo_findings_n, 0);
const treatWo = treatRows.reduce((a, r) => a + r.wo_findings_n, 0);

const gates = {
  AG1_leak_treat: { value: treatLeak, pass: treatLeak === 0 },
  AG1_leak_ctrl: { value: ctrlLeak, pass: ctrlLeak === 0 },
  AG2_poison_qid_surface: { value: poisonLeak, pass: poisonLeak === 0 },
  AG3_url_alone_same_entity: { value: sameEntity, pass: sameEntity === 0 },
  AG3_url_alone_same_reference: { value: sameRef, pass: sameRef === 0 },
  AG3_url_alone_rows_fail_n: { value: urlAloneSameFail.length, pass: urlAloneSameFail.length === 0 },
  AG4_private_provenance: { value: privateProv, pass: privateProv === 0 },
  AG5_core_leak: { value: coreLeak, pass: coreLeak === 0 },
  AG5_core_pw: { value: corePw, pass: corePw === 0 },
  AG6_ssrf_block: {
    value: blocked.map((r) => ({ id: r.id, wo: r.wo_findings_n, providers: r.providers })),
    pass: blockedOk,
  },
  H_treatment_has_wo: { value: treatWo, pass: treatWo >= 1 || !!(s16 && s16.wo_findings_n >= 1) },
  H_control_wo_zero: { value: ctrlWo, pass: ctrlWo === 0 },
  G_s16_wo: {
    value: { wo: s16?.wo_findings_n, rel: s16?.rel_hist },
    pass: !!(s16 && s16.wo_findings_n >= 1),
  },
  G_s06_provider_or_wo: {
    value: { wo: s06?.wo_findings_n, provider: s06?.providers?.web_origin },
    pass: !!(s06 && (s06.wo_findings_n >= 1 || s06.has_web_origin_provider)),
  },
};

const allPass = Object.values(gates).every((g) => g.pass);
const verdict = allPass ? 'PASS' : 'FAIL';

const summary = {
  stamp: nowJ(),
  stamp_utc: new Date().toISOString(),
  agent: 'דיוק',
  experiment: 'EXP-C1-WEB-ORIGIN',
  promote: 'HOLD',
  treatment: {
    dpl: TREAT,
    url: 'https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app',
  },
  control: { dpl: CTRL, alias: 'akvot-discovery.vercel.app' },
  core: { alias: CORE, leak: coreLeak, pw: corePw, rows: coreRows },
  treat_rows: treatRows,
  ctrl_rows: ctrlRows,
  totals: {
    treat_leak: treatLeak,
    ctrl_leak: ctrlLeak,
    same_entity: sameEntity,
    same_reference: sameRef,
    treat_wo_findings: treatWo,
    ctrl_wo_findings: ctrlWo,
    private_provenance: privateProv,
  },
  gates,
  verdict,
  url_alone_failures: urlAloneSameFail.map((r) => ({
    id: r.id,
    same_entity_n: r.same_entity_n,
    same_reference_n: r.same_reference_n,
    rel_hist: r.rel_hist,
  })),
};

writeFileSync(join(RAW, 'SUMMARY.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(PACK, '06-ACC', 'ACC-REAFTER-Ho6jg-דיוק-2026-09-20.json'), JSON.stringify(summary, null, 2));
console.error('VERDICT', verdict);
console.error(JSON.stringify(gates, null, 2));

const identityAudit = {
  stamp: nowJ(),
  treatment: { dpl: TREAT, url: summary.treatment.url },
  control: { dpl: CTRL },
  gate: 'URL/hostname-alone → UNKNOWN (never SAME-REFERENCE / SAME-ENTITY)',
  who_int: (() => {
    const r = treatRows.find((x) => x.id === 'S16');
    const f = r?.wo_sample?.[0] || null;
    return {
      seed: 'https://www.who.int',
      status: r?.status,
      wo_n: r?.wo_findings_n,
      wo_e_n: r?.wo_evidence_n,
      rel_hist: r?.rel_hist,
      same_entity_n: r?.same_entity_n,
      same_reference_n: r?.same_reference_n,
      acc_leak: r?.total_leak,
      providers: r?.providers,
      finding: f,
      evidence_rel: r?.wo_ev_sample?.[0]?.relationship || null,
      bound_ok: !!(r && r.same_entity_n === 0 && r.same_reference_n === 0 && (r.rel_hist?.UNKNOWN >= 1 || r.wo_findings_n === 0)),
      label: f?.relationship || (r?.rel_hist ? Object.keys(r.rel_hist)[0] : null),
    };
  })(),
  url_alone_rows: urlAlone.map((r) => ({
    id: r.id,
    seed: r.seed,
    wo_n: r.wo_findings_n,
    rel_hist: r.rel_hist,
    same_entity_n: r.same_entity_n,
    same_reference_n: r.same_reference_n,
    total_leak: r.total_leak,
    providers_web_origin: r.providers?.web_origin,
  })),
  bound_closed: urlAloneSameFail.length === 0 && sameEntity === 0 && sameRef === 0,
};
writeFileSync(join(RAW, 'BOUND-IDENTITY-AUDIT.json'), JSON.stringify(identityAudit, null, 2));
writeFileSync(join(PACK, '06-ACC', 'BOUND-IDENTITY-AUDIT-Ho6jg-דיוק-2026-09-20.json'), JSON.stringify(identityAudit, null, 2));
process.exit(allPass ? 0 : 2);

