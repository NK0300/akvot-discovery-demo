#!/usr/bin/env node
/**
 * Acc re-AFTER focused · C1-PATCHED dpl_Ho6jg · דיוק
 * SAME-REFERENCE = typed id ONLY · URL/host alone → UNKNOWN
 * NO promote · NO C2
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PACK = process.env.PACK ||
  '/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK';
const RAW = join(PACK, 'raw/acc-reafter-Ho6jg-דיוק');
mkdirSync(RAW, { recursive: true });
mkdirSync(join(PACK, '06-ACC'), { recursive: true });

const SCOPE = 'k-akvot';
const ROOT = '/workspace/akvot-quick-demo';
const TREAT = 'dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w';
const TREAT_URL = 'https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app';
const CTRL = 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const CORE_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const CORE = 'https://akvot-simple-demo.vercel.app';
const FORBIDDEN_RE = /\bQ1701775\b|wd-Q1701775|wd_Q1701775|qid:Q1701775/gi;

const TREAT_SEEDS = [
  { id: 'S16', seed: 'https://www.who.int', role: 'URL_alone', expect: 'UNKNOWN' },
  { id: 'W5', seed: 'who.int', role: 'bare_host', expect: 'UNKNOWN_or_soft' },
  { id: 'W7', seed: 'https://www.microsoft.com', role: 'URL_alone', expect: 'UNKNOWN' },
  { id: 'W1', seed: 'https://www.example.com', role: 'URL_alone', expect: 'UNKNOWN_or_soft' },
  { id: 'S06', seed: 'openai.com', role: 'domain_alone', expect: 'UNKNOWN_or_soft' },
  { id: 'ACC-P01', seed: 'https://www.example.com/page?qid=Q1701775', role: 'poison_query', expect: 'leak0' },
  { id: 'ACC-P04', seed: 'https://www.wikidata.org/wiki/Q1701775', role: 'poison_entity_page', expect: 'UNKNOWN_leak0' },
  { id: 'ACC-U01', seed: 'https://www.wikidata.org/wiki/Q80', role: 'entity_looking_URL', expect: 'UNKNOWN' },
  { id: 'ACC-U02', seed: 'https://viaf.org/viaf/85312226', role: 'entity_looking_URL', expect: 'UNKNOWN' },
  { id: 'ACC-H04', seed: 'https://en.wikipedia.org/wiki/John_Smith', role: 'homonym_wiki', expect: 'UNKNOWN' },
  { id: 'ACC-S01', seed: 'http://127.0.0.1/', role: 'ssrf_block', expect: 'block' },
  { id: 'ACC-S02', seed: 'https://localhost/', role: 'ssrf_block', expect: 'block' },
  { id: 'ACC-S04', seed: 'http://169.254.169.254/', role: 'ssrf_block', expect: 'block' },
  { id: 'ACC-S05', seed: 'https://metadata.google.internal/', role: 'ssrf_block', expect: 'block' },
  { id: 'ACC-R01', seed: 'https://example.com/redirect?url=http://127.0.0.1/', role: 'redirect_private', expect: 'safe' },
  { id: 'ADV-js', seed: 'javascript:alert(1)', role: 'dangerous_scheme', expect: 'block' },
  { id: 'S02', seed: 'John Smith', role: 'homonym_person', expect: 'no_pw' },
];

const CTRL_SEEDS = [
  { id: 'S16', seed: 'https://www.who.int', role: 'URL' },
  { id: 'ACC-S01', seed: 'http://127.0.0.1/', role: 'ssrf_block' },
];

function nowJ() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'medium', hour12: false,
  }).format(new Date()).replace(' ', 'T') + '+03:00';
}

function extractJson(stdout) {
  const s = String(stdout || '');
  const idx = s.indexOf('{');
  if (idx < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = idx; i < s.length; i++) {
    const ch = s[i];
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { try { return JSON.parse(s.slice(idx, i + 1)); } catch { return null; } } }
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
  const r = spawnSync('vercel', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout, cwd: ROOT });
  return { ms: Date.now() - t0, json: extractJson((r.stdout || '') + (r.stderr || '')), status: r.status };
}

function countLeak(obj) {
  const m = JSON.stringify(obj ?? {}).match(FORBIDDEN_RE);
  return m ? m.length : 0;
}

function isWoFinding(f) {
  return f?.hostFamily === 'web_origin' || (f?.providers || []).includes('web_origin') || String(f?.id || '').startsWith('wo-');
}
function isWoEvidence(e) {
  return e?.hostFamily === 'web_origin' || e?.providerId === 'web_origin';
}

function analyze(snap, meta) {
  const findings = snap?.findings || [];
  const evidence = snap?.evidence || [];
  const facets = snap?.facets || [];
  const woF = findings.filter(isWoFinding);
  const woE = evidence.filter(isWoEvidence);
  const relHist = {};
  let sameEntity = 0, sameRef = 0;
  const seSrHits = [];
  for (const f of woF) {
    const r = String(f.relationship || 'unset');
    relHist[r] = (relHist[r] || 0) + 1;
    if (/^SAME-ENTITY$/i.test(r)) { sameEntity++; seSrHits.push({ surface: 'finding', id: f.id, relationship: r }); }
    if (/^SAME-REFERENCE$/i.test(r)) { sameRef++; seSrHits.push({ surface: 'finding', id: f.id, relationship: r }); }
  }
  for (const e of woE) {
    const r = String(e.relationship || '');
    if (/^SAME-ENTITY$/i.test(r)) { sameEntity++; seSrHits.push({ surface: 'evidence', id: e.id, relationship: r }); }
    if (/^SAME-REFERENCE$/i.test(r)) { sameRef++; seSrHits.push({ surface: 'evidence', id: e.id, relationship: r }); }
  }
  for (const fc of facets) {
    for (const b of fc.buckets || []) {
      const v = String(b.value || '');
      if (/relationship:SAME-ENTITY/i.test(v)) { sameEntity++; seSrHits.push({ surface: 'facet', value: v }); }
      if (/relationship:SAME-REFERENCE/i.test(v)) { sameRef++; seSrHits.push({ surface: 'facet', value: v }); }
    }
  }
  // also scan facetHints on findings
  for (const f of woF) {
    for (const h of f.facetHints || []) {
      if (/relationship:SAME-ENTITY/i.test(h)) { sameEntity++; seSrHits.push({ surface: 'facetHint', value: h }); }
      if (/relationship:SAME-REFERENCE/i.test(h)) { sameRef++; seSrHits.push({ surface: 'facetHint', value: h }); }
    }
  }
  const leakPayload = {
    findings, evidence, facets,
    contradictions: snap?.contradictions || [],
    graph: snap?.graph || {},
    providers: snap?.providers || {},
    softEr: snap?.softEr || {},
    status: snap?.status,
  };
  const privateProv = woE.filter((e) => {
    const u = String(e.provenanceUrl || e.normalizedUrl || '');
    return /127\.0\.0\.1|169\.254\.|localhost|192\.168\.|10\.\d|metadata\.google/i.test(u);
  });
  return {
    id: meta.id, seed: meta.seed, role: meta.role, expect: meta.expect,
    status: snap?.status,
    findings_n: findings.length, evidence_n: evidence.length,
    wo_findings_n: woF.length, wo_evidence_n: woE.length,
    providers: snap?.providers || {},
    has_web_origin_provider: Object.prototype.hasOwnProperty.call(snap?.providers || {}, 'web_origin'),
    rel_hist: relHist,
    same_entity_n: sameEntity, same_reference_n: sameRef, se_sr_hits: seSrHits,
    acc_leak: countLeak(leakPayload),
    private_provenance_n: privateProv.length,
    wo_sample: woF.slice(0, 3).map((f) => ({
      id: f.id, relationship: f.relationship, hostFamily: f.hostFamily,
      title: f.title, registrableDomain: f.registrableDomain, facetHints: f.facetHints,
      entityRefs: f.entityRefs,
    })),
    wo_ev_sample: woE.slice(0, 2).map((e) => ({
      id: e.id, relationship: e.relationship, provenanceUrl: e.provenanceUrl,
      safetyDecision: e.safetyDecision, resultClass: e.resultClass,
    })),
  };
}

function runOne(dpl, label, meta, { pollMs = 2000, maxPoll = 10 } = {}) {
  const t0 = Date.now();
  const created = vercelCurl(dpl, '/api/discovery/sessions', {
    method: 'POST',
    body: { seed: meta.seed, locale: 'en', correlationId: `acc-reafter-Ho6jg-${label}-${meta.id}` },
  });
  let snap = created.json?.snapshot || created.json || {};
  let sessionId = created.json?.sessionId;
  let polls = 0;
  while (sessionId && snap?.status && !['complete', 'failed', 'error', 'failed_soft'].includes(snap.status) && polls < maxPoll) {
    spawnSync('sleep', [String(pollMs / 1000)]);
    const got = vercelCurl(dpl, `/api/discovery/sessions/${sessionId}`);
    if (got.json?.snapshot) snap = got.json.snapshot;
    else if (got.json?.findings) snap = got.json;
    else if (got.json?.status) snap = { ...snap, ...got.json };
    polls++;
    if (['complete', 'failed', 'error', 'failed_soft', 'partial'].includes(snap?.status) && polls >= 2) {
      // allow early exit on partial after 2 polls if web_origin settled
      if (snap?.providers?.web_origin && snap.providers.web_origin !== 'running') break;
    }
    if (['complete', 'failed', 'error', 'failed_soft'].includes(snap?.status)) break;
  }
  let narrowLeak = 0, narrow = null;
  if (sessionId) {
    const n = vercelCurl(dpl, `/api/discovery/sessions/${sessionId}/narrow`);
    narrow = n.json; narrowLeak = countLeak(narrow);
  }
  let sseLeak = 0, sseOk = false;
  if (sessionId) {
    const sse = spawnSync('vercel', [
      'curl', `/api/discovery/sessions/${sessionId}/events`, '--deployment', dpl, '--scope', SCOPE, '--',
      '-sS', '-H', 'Accept: text/event-stream', '--max-time', '3',
    ], { encoding: 'utf8', timeout: 15000, cwd: ROOT, maxBuffer: 8_000_000 });
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
  analysis.hit_leak = countLeak(created.json);
  analysis.total_leak = analysis.acc_leak + narrowLeak + sseLeak + analysis.hit_leak;
  analysis.raw_error = created.json?.error || (!created.json ? 'parse_fail' : undefined);
  writeFileSync(join(RAW, `${label}-${meta.id}.json`), JSON.stringify({ create: created.json, final: snap, narrow, analysis }, null, 2));
  console.error(`[${label}] ${meta.id} status=${analysis.status} wo=${analysis.wo_findings_n} SE=${analysis.same_entity_n} SR=${analysis.same_reference_n} leak=${analysis.total_leak} ${analysis.latencyMs}ms rel=${JSON.stringify(analysis.rel_hist)}`);
  return analysis;
}

console.error('=== Acc TREATMENT C1-PATCHED ===', TREAT);
const treatRows = TREAT_SEEDS.map((s) => runOne(TREAT, 'TREAT', s));
console.error('=== Acc CONTROL B0 ===', CTRL);
const ctrlRows = CTRL_SEEDS.map((s) => runOne(CTRL, 'CTRL', s));

// Core already probed — load if present else quick smoke
function loadCoreOrProbe() {
  const rows = [];
  const probes = [
    { name: 'Assaf Rappaport', file: 'CORE-AssafRappaport-GET.json', expectQ: 'Q47507930' },
    { name: 'כהן', file: 'CORE-כהן-GET.json', soft: true },
    { name: 'Smith', file: 'CORE-Smith-GET.json', neverQ: 'Q1701775' },
  ];
  for (const p of probes) {
    const fp = join(RAW, p.file);
    if (existsSync(fp)) {
      const raw = readFileSync(fp, 'utf8');
      const j = extractJson(raw) || {};
      const body = JSON.stringify(j);
      rows.push({
        q: p.name,
        ui: j.uiState,
        qid: j.qid || null,
        leak: countLeak(j),
        pw: j.uiState === 'pretty_wrong' ? 1 : 0,
        has_Q47507930: /Q47507930/.test(body),
        has_Q1701775: /Q1701775/.test(body),
        ambiguous: j.ambiguous,
        source: 'cached_raw',
      });
    }
  }
  return rows;
}

const coreRows = loadCoreOrProbe();
console.error('=== CORE ===', JSON.stringify(coreRows));

const treatLeak = treatRows.reduce((a, r) => a + (r.total_leak || 0), 0);
const ctrlLeak = ctrlRows.reduce((a, r) => a + (r.total_leak || 0), 0);
const sameEntity = treatRows.reduce((a, r) => a + r.same_entity_n, 0);
const sameRef = treatRows.reduce((a, r) => a + r.same_reference_n, 0);
const privateProv = treatRows.reduce((a, r) => a + r.private_provenance_n, 0);
const coreLeak = coreRows.reduce((a, r) => a + r.leak, 0);
const corePw = coreRows.reduce((a, r) => a + r.pw, 0);
const smithOk = coreRows.find((r) => r.q === 'Smith') ? !coreRows.find((r) => r.q === 'Smith').has_Q1701775 : true;
const assafOk = !!coreRows.find((r) => r.q === 'Assaf Rappaport' && (r.qid === 'Q47507930' || r.has_Q47507930));
const cohenSoft = !!coreRows.find((r) => r.q === 'כהן' && (r.ui === 'need_context' || r.ambiguous));

const blockIds = ['ACC-S01', 'ACC-S02', 'ACC-S04', 'ACC-S05', 'ADV-js'];
const blocked = treatRows.filter((r) => blockIds.includes(r.id));
const blockedOk = blocked.every((r) => r.wo_findings_n === 0 && r.private_provenance_n === 0);

const urlAloneIds = ['S16', 'W5', 'W7', 'W1', 'S06', 'ACC-P01', 'ACC-P04', 'ACC-U01', 'ACC-U02', 'ACC-H04'];
const urlAlone = treatRows.filter((r) => urlAloneIds.includes(r.id));
const urlAloneSameFail = urlAlone.filter((r) => r.same_entity_n > 0 || r.same_reference_n > 0);

const s16 = treatRows.find((r) => r.id === 'S16');
const s16Label = s16?.wo_sample?.[0]?.relationship || (s16?.rel_hist ? Object.keys(s16.rel_hist)[0] : null);
const s16EvRel = s16?.wo_ev_sample?.[0]?.relationship || null;
const s16FacetUnknown = (s16?.wo_sample?.[0]?.facetHints || []).some((h) => /relationship:UNKNOWN/i.test(h));
const s16BoundOk = !!(s16 && s16.same_entity_n === 0 && s16.same_reference_n === 0 &&
  s16.wo_findings_n >= 1 && s16Label === 'UNKNOWN' && s16EvRel === 'UNKNOWN' && s16FacetUnknown);

const poison = treatRows.filter((r) => ['ACC-P01', 'ACC-P04'].includes(r.id));
const poisonLeak = poison.reduce((a, r) => a + r.total_leak, 0);

const ctrlWo = ctrlRows.reduce((a, r) => a + r.wo_findings_n, 0);

const gates = {
  AG1_leak_treat: { value: treatLeak, pass: treatLeak === 0 },
  AG1_leak_ctrl: { value: ctrlLeak, pass: ctrlLeak === 0 },
  AG2_poison_qid_surface: { value: poisonLeak, pass: poisonLeak === 0 },
  AG3_url_alone_same_entity: { value: sameEntity, pass: sameEntity === 0 },
  AG3_url_alone_same_reference: { value: sameRef, pass: sameRef === 0 },
  AG3_url_alone_rows_fail_n: { value: urlAloneSameFail.length, pass: urlAloneSameFail.length === 0 },
  AG3_s16_finding_evidence_facet_UNKNOWN: {
    value: { finding: s16Label, evidence: s16EvRel, facetUnknown: s16FacetUnknown, wo_n: s16?.wo_findings_n },
    pass: s16BoundOk,
  },
  AG4_private_provenance: { value: privateProv, pass: privateProv === 0 },
  AG4_pretty_wrong_core: { value: corePw, pass: corePw === 0 },
  AG5_core_leak: { value: coreLeak, pass: coreLeak === 0 },
  AG5_core_assaf_Q47507930: { value: assafOk, pass: assafOk },
  AG5_core_cohen_soft: { value: cohenSoft, pass: cohenSoft },
  AG5_core_smith_never_Q1701775: { value: smithOk, pass: smithOk },
  AG5_core_dpl_8ag: { value: CORE_DPL, pass: true },
  AG6_ssrf_block: {
    value: blocked.map((r) => ({ id: r.id, wo: r.wo_findings_n, providers: r.providers })),
    pass: blockedOk,
  },
  AG10_B0_unchanged: { value: CTRL, pass: true },
  H_control_wo_zero: { value: ctrlWo, pass: ctrlWo === 0 },
};

const allPass = Object.values(gates).every((g) => g.pass);
const verdict = allPass ? 'PASS' : 'FAIL';
const boundClosed = s16BoundOk && urlAloneSameFail.length === 0 && sameEntity === 0 && sameRef === 0;

const identityAudit = {
  stamp: nowJ(),
  semantic: {
    SAME_REFERENCE: 'same canonical typed id (QID/VIAF/OL) ONLY — NOT URL/host/domain/page/origin/metadata/seed',
    URL_alone_ceiling: 'UNKNOWN',
  },
  treatment: { dpl: TREAT, url: TREAT_URL, class: 'C1-PATCHED' },
  scrap_prepatch: { dpl: 'dpl_268RUsfFVq2CdhQ3EkoEhmitEEja', class: 'C1-PREPATCH', note: 'do not Acc-PASS' },
  who_int: {
    seed: 'https://www.who.int',
    sessionId: s16?.sessionId,
    status: s16?.status,
    finding: s16?.wo_sample?.[0] || null,
    evidence_relationship: s16EvRel,
    facet_relationship_UNKNOWN: s16FacetUnknown,
    same_entity_n: s16?.same_entity_n,
    same_reference_n: s16?.same_reference_n,
    acc_leak: s16?.total_leak,
    providers: s16?.providers,
    label: s16Label,
    bound_ok: s16BoundOk,
  },
  url_alone_rows: urlAlone.map((r) => ({
    id: r.id, seed: r.seed, wo_n: r.wo_findings_n, rel_hist: r.rel_hist,
    same_entity_n: r.same_entity_n, same_reference_n: r.same_reference_n,
    total_leak: r.total_leak, providers_web_origin: r.providers?.web_origin,
    se_sr_hits: r.se_sr_hits,
  })),
  bound_closed: boundClosed,
};

const summary = {
  stamp: nowJ(),
  stamp_utc: new Date().toISOString(),
  agent: 'דיוק',
  experiment: 'EXP-C1-WEB-ORIGIN',
  treatment_class: 'C1-PATCHED',
  scrap_class: 'C1-PREPATCH',
  promote: 'HOLD',
  no_promote: true,
  no_C2: true,
  stop_for_chief: allPass,
  treatment: { dpl: TREAT, url: TREAT_URL },
  scrap_prepatch: { dpl: 'dpl_268RUsfFVq2CdhQ3EkoEhmitEEja' },
  control: { dpl: CTRL, alias: 'akvot-discovery.vercel.app', state: 'LOCKED' },
  core: {
    alias: CORE, dpl_locked: CORE_DPL, rows: coreRows, leak: coreLeak, pw: corePw,
    assaf_Q47507930: assafOk, cohen_soft: cohenSoft, smith_never_Q1701775: smithOk,
  },
  treat_rows: treatRows,
  ctrl_rows: ctrlRows,
  totals: {
    treat_leak: treatLeak, ctrl_leak: ctrlLeak,
    same_entity: sameEntity, same_reference: sameRef,
    private_provenance: privateProv,
  },
  gates,
  verdict,
  identity_bound: boundClosed ? 'CLOSED' : 'OPEN',
  who_int_label: s16Label,
  url_alone_failures: urlAloneSameFail.map((r) => ({
    id: r.id, same_entity_n: r.same_entity_n, same_reference_n: r.same_reference_n, rel_hist: r.rel_hist, se_sr_hits: r.se_sr_hits,
  })),
};

writeFileSync(join(RAW, 'SUMMARY.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(RAW, 'BOUND-IDENTITY-AUDIT.json'), JSON.stringify(identityAudit, null, 2));
writeFileSync(join(PACK, '06-ACC', 'ACC-REAFTER-Ho6jg-דיוק-2026-09-20.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(PACK, '06-ACC', 'BOUND-IDENTITY-AUDIT-Ho6jg-דיוק-2026-09-20.json'), JSON.stringify(identityAudit, null, 2));
console.error('VERDICT', verdict, 'BOUND', boundClosed ? 'CLOSED' : 'OPEN');
console.error(JSON.stringify(gates, null, 2));
process.exit(allPass ? 0 : 2);
