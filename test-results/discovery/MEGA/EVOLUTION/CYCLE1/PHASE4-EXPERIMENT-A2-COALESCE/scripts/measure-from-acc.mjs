#!/usr/bin/env node
/**
 * CYCLE1 PHASE4 EXP-A VIAF · Acc AFTER on Preview vs B0 BEFORE · דיוק · 2026-09-20
 * NO promote · NO Core touch · NO Discovery alias touch
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHASE4 = join(__dirname, '..');
const ROOT = '/workspace/akvot-quick-demo';
const RAW = join(PHASE4, 'raw/acc-after-דיוק');
const CORE_RAW = join(RAW, 'core');
mkdirSync(RAW, { recursive: true });
mkdirSync(CORE_RAW, { recursive: true });

const PREVIEW_DPL = 'dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU';
const PREVIEW_URL = 'https://akvot-simple-demo-93bc30m30-k-akvot.vercel.app';
const B0_DPL = 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const B0_ALIAS = 'https://akvot-discovery.vercel.app';
const CORE_BASE = 'https://akvot-simple-demo.vercel.app';
const CORE_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const FIV_EXPECTED = '2026-09-19.1';
const MULTI_THRESHOLD = 0.15;

const BEFORE = JSON.parse(
  readFileSync(join(PHASE4, 'ACC-B0-BEFORE-S01-S04-S05-דיוק-2026-09-20.json'), 'utf8')
);
const FAMILY_MAPPING = BEFORE.family_mapping;

const SEEDS = [
  { id: 'S01', seed: 'Tim Berners-Lee', category: 'person' },
  { id: 'S04', seed: 'Stripe', category: 'company' },
  { id: 'S05', seed: 'Red Cross', category: 'organization' },
];

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

function vercelCurl(urlOrPath, { method = 'GET', body = null, deployment = null, timeout = 180000 } = {}) {
  const args = ['curl'];
  if (deployment) {
    const path = urlOrPath.startsWith('http')
      ? new URL(urlOrPath).pathname + new URL(urlOrPath).search
      : urlOrPath;
    args.push(path, '--deployment', deployment, '--scope', SCOPE, '--');
  } else {
    args.push(urlOrPath, '--scope', SCOPE, '--');
  }
  args.push('-sS', '-H', 'Accept: application/json', '-H', `Origin: ${CORE_BASE}`);
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

function publicCurl(url, { method = 'GET', body = null, timeout = 90000 } = {}) {
  const args = [
    '-sS',
    '-H',
    'Accept: application/json',
    '-H',
    `Origin: ${CORE_BASE}`,
    '--max-time',
    String(Math.ceil(timeout / 1000)),
  ];
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  }
  args.push(url);
  const t0 = Date.now();
  const r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout });
  let json = null;
  try {
    json = JSON.parse((r.stdout || '').trim());
  } catch (_) {}
  return { url, method, body, ms: Date.now() - t0, exit: r.status, json, text: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function leaks(text) {
  return String(text || '').match(FORBIDDEN_RE) || [];
}

function deepScanForbidden(obj, path = '') {
  const found = [];
  if (obj == null) return found;
  if (typeof obj === 'string' || typeof obj === 'number') {
    const hits = leaks(String(obj));
    for (const h of hits) found.push({ path, term: String(h).toLowerCase(), value: String(obj).slice(0, 200) });
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

function extractContradictionFindingIds(obj) {
  const out = [];
  const snap = obj?.snapshot || obj;
  const cons = Array.isArray(snap?.contradictions)
    ? snap.contradictions
    : Array.isArray(obj?.contradictions)
      ? obj.contradictions
      : [];
  cons.forEach((c, i) => {
    const ids = Array.isArray(c?.findingIds) ? c.findingIds : [];
    ids.forEach((id, j) => out.push({ path: `contradictions[${i}].findingIds[${j}]`, value: String(id) }));
  });
  return out;
}

function scrubB23(obj) {
  const ids = extractContradictionFindingIds(obj);
  const b23Leaks = [];
  for (const row of ids) {
    const hits = String(row.value).match(FORBIDDEN_RE) || [];
    for (const h of hits) b23Leaks.push({ ...row, term: String(h).toLowerCase() });
  }
  return { findingIds: ids.map((x) => x.value), findingIds_n: ids.length, leak_n: b23Leaks.length, leaks: b23Leaks };
}

function hasDossier(j) {
  if (!j || typeof j !== 'object') return false;
  if (j.uiState === 'dossier' || j.mode === 'dossier' || j.ui === 'dossier') return true;
  if (j.dossier && typeof j.dossier === 'object') return true;
  if (j?.snapshot?.uiState === 'dossier') return true;
  return false;
}

function facesCount(j) {
  if (Array.isArray(j?.images)) return j.images.length;
  if (typeof j?.faces === 'number') return j.faces;
  if (j?.faces === false) return 0;
  if (j?.faces === true) return 1;
  if (Array.isArray(j?.faces)) return j.faces.length;
  return 0;
}

function saveRaw(label, data) {
  const payload = data?.json != null ? data.json : { text: String(data?.text || '').slice(0, 200000), stderr: data?.stderr, exit: data?.exit };
  writeFileSync(join(RAW, `${label}.json`), JSON.stringify(payload, null, 2));
  return `${label}.json`;
}

function saveCoreRaw(label, data) {
  const payload = data?.json != null ? data.json : { text: String(data?.text || '').slice(0, 200000), stderr: data?.stderr };
  writeFileSync(join(CORE_RAW, `${label}.json`), JSON.stringify(payload, null, 2));
  return `core/${label}.json`;
}

/** SAME family mapping as ACC-B0-BEFORE */
function hostFamilyFromEvidence(ev) {
  const provider = String(ev?.providerId || ev?.provider || '').toLowerCase();
  const domain = String(ev?.domain || '').toLowerCase().replace(/^www\./, '');
  const url = String(ev?.url || ev?.provenanceUrl || '').toLowerCase();
  const host = domain || (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  })();

  if (provider === 'wikidata' || host.endsWith('wikidata.org') || host === 'wikidata.org') return 'wikidata';
  if (
    provider === 'wikipedia' ||
    host.endsWith('wikipedia.org') ||
    (host.endsWith('wikimedia.org') && !host.endsWith('wikidata.org'))
  ) {
    return 'wikipedia';
  }
  if (provider === 'openlibrary' || host.endsWith('openlibrary.org')) return 'openlibrary';
  if (provider === 'viaf' || host.endsWith('viaf.org')) return 'viaf';
  if (host) {
    const parts = host.split('.');
    const apex = parts.length >= 2 ? parts.slice(-2).join('.') : host;
    return `other:${apex}`;
  }
  if (provider) return `other:provider:${provider}`;
  return 'other:unknown';
}

function analyzeFinding(f, evidenceById) {
  const eids = Array.isArray(f?.evidenceIds) ? f.evidenceIds : [];
  const evidence = eids
    .map((id) => evidenceById.get(id))
    .filter(Boolean)
    .map((ev) => {
      const fam = hostFamilyFromEvidence(ev);
      return {
        evidenceId: ev.id || ev.evidenceId,
        providerId: ev.providerId || ev.provider || null,
        domain: ev.domain || null,
        url: ev.url || ev.provenanceUrl || null,
        provenanceUrl: ev.provenanceUrl || ev.url || null,
        families: [fam],
      };
    });
  // Also fall back to ranking.factors.domains / providers if evidence missing
  if (evidence.length === 0) {
    const domains = f?.ranking?.factors?.domains || [];
    const providers = Array.isArray(f?.providers) ? f.providers : [];
    for (let i = 0; i < Math.max(domains.length, providers.length, 1); i++) {
      const fake = {
        providerId: providers[i] || providers[0] || null,
        domain: domains[i] || domains[0] || null,
        url: null,
      };
      const fam = hostFamilyFromEvidence(fake);
      if (fam !== 'other:unknown' || providers.length || domains.length) {
        evidence.push({
          evidenceId: null,
          providerId: fake.providerId,
          domain: fake.domain,
          url: null,
          provenanceUrl: null,
          families: [fam],
        });
      }
    }
  }
  const hostFamilies = [...new Set(evidence.flatMap((e) => e.families))];
  return {
    findingId: f.id || f.findingId,
    title: f.title || null,
    kind: f.kind || null,
    providers: Array.isArray(f.providers) ? f.providers : [],
    hostFamilies,
    hostFamilyCount: hostFamilies.length,
    multi_independent: hostFamilies.length >= 2,
    evidenceIds: eids,
    evidence,
    scoreFinding: f.scoreFinding ?? null,
    discoveryScore: f?.ranking?.discoveryScore ?? null,
  };
}

function analyzeSession(label, seedMeta, req, extras = {}) {
  const j = req.json;
  const snap = j?.snapshot || j;
  const leakHits = deepScanForbidden(j);
  const findingsRaw = Array.isArray(snap?.findings) ? snap.findings : Array.isArray(j?.findings) ? j.findings : [];
  const evidenceRaw = Array.isArray(snap?.evidence) ? snap.evidence : Array.isArray(j?.evidence) ? j.evidence : [];
  const evidenceById = new Map();
  for (const ev of evidenceRaw) {
    const id = ev.id || ev.evidenceId;
    if (id) evidenceById.set(id, ev);
  }
  const findings = findingsRaw.map((f) => analyzeFinding(f, evidenceById));
  const multi_independent_n = findings.filter((f) => f.multi_independent).length;
  const findings_count = findings.length;
  const multi_independent_rate = findings_count ? multi_independent_n / findings_count : 0;
  const hist = {};
  for (const f of findings) {
    const key = JSON.stringify([...f.hostFamilies].sort());
    hist[key] = (hist[key] || 0) + 1;
  }
  const b23 = scrubB23(j);
  const status = snap?.status || j?.status || null;
  const sessionId = j?.sessionId || snap?.sessionId || extras.sessionId || null;
  const providers_session = snap?.providers || j?.providers || null;
  const viaf_findings_n = findings.filter(
    (f) => f.hostFamilies.includes('viaf') || f.providers.includes('viaf') || String(f.findingId || '').startsWith('viaf')
  ).length;
  const dossier = hasDossier(j);
  const fiv = snap?.forbiddenIdentitiesVersion || j?.forbiddenIdentitiesVersion || null;

  const fir_notes = [];
  if (seedMeta.id === 'S01') {
    const wdIds = findings.filter((f) => String(f.findingId || '').startsWith('wd-')).map((f) => f.findingId);
    if (wdIds.length > 3) fir_notes.push(`FIR/near-dup smell: ${wdIds.length} Wikidata QIDs: ${JSON.stringify(wdIds)}`);
  }
  if (seedMeta.id === 'S04') {
    const companyish = findings.filter((f) => /stripe,?\s*inc\.?/i.test(f.title || '') || (f.title || '').toLowerCase() === 'stripe');
    fir_notes.push(`company-primary-ish titles: ${companyish.length}/${findings_count}`);
  }

  return {
    id: seedMeta.id,
    seed: seedMeta.seed,
    category: seedMeta.category,
    label,
    surface: extras.surface || 'discovery-get',
    sessionId,
    status,
    findings_count,
    multi_independent_n,
    multi_independent_rate: Math.round(multi_independent_rate * 10000) / 10000,
    acc_leak_count: leakHits.length,
    acc_leak_hits: leakHits.slice(0, 30),
    contradictions_n: Array.isArray(snap?.contradictions) ? snap.contradictions.length : Array.isArray(j?.contradictions) ? j.contradictions.length : 0,
    contradictions_findingIds: b23.findingIds,
    contradictions_findingIds_Q1701775_hits: b23.leak_n,
    hostFamily_histogram: hist,
    fir_pretty_wrong_smell_notes: fir_notes,
    providers_session,
    viaf_findings_n,
    viaf_present: viaf_findings_n > 0 || (providers_session && Object.prototype.hasOwnProperty.call(providers_session, 'viaf')),
    dossier_bind: dossier,
    forbiddenIdentitiesVersion: fiv,
    ms: req.ms,
    raw_file: extras.raw_file || null,
    findings,
    pretty_wrong: false, // Discovery surface: no false dossier bind; flag separately if dossier
  };
}

function yn(b) {
  return b ? 'PASS' : 'FAIL';
}

const started = nowJerusalem();
console.log(`[דיוק] ACC AFTER Preview start ${started}`);
console.log(`[דיוק] Preview ${PREVIEW_URL} → ${PREVIEW_DPL}`);
console.log(`[דיוק] B0 LOCKED ${B0_ALIAS} → ${B0_DPL}`);
console.log(`[דיוק] Core LOCKED ${CORE_BASE} → ${CORE_DPL}`);

// --- Health / alias proofs ---
const previewHealth = vercelCurl('/api/health', { deployment: PREVIEW_DPL });
saveRaw('preview-health', previewHealth);
const previewDiscHealth = vercelCurl('/api/discovery/health', { deployment: PREVIEW_DPL });
saveRaw('preview-discovery-health', previewDiscHealth);
const b0Health = vercelCurl('/api/health', { deployment: B0_DPL });
saveRaw('b0-health', b0Health);

const b0Inspect = spawnSync(
  'vercel',
  ['inspect', 'akvot-discovery.vercel.app', '--scope', SCOPE],
  { encoding: 'utf8', cwd: ROOT, timeout: 60000 }
);
writeFileSync(join(RAW, 'b0-alias-inspect.txt'), (b0Inspect.stdout || '') + '\n' + (b0Inspect.stderr || ''));
const b0AliasStillAvyhr =
  (b0Inspect.stdout || '').includes(B0_DPL) || (b0Health.json?.build === B0_DPL);
const previewBuildOk = previewHealth.json?.build === PREVIEW_DPL;

console.log(`[health] preview build=${previewHealth.json?.build} ok=${previewBuildOk}`);
console.log(`[health] B0 build=${b0Health.json?.build} aliasStillAvyhr=${b0AliasStillAvyhr}`);

// --- Seeds create + get ---
const per_seed = [];
for (const seedMeta of SEEDS) {
  const hints = {};
  if (seedMeta.category === 'company' || seedMeta.category === 'organization') hints.kind = 'org';
  console.log(`[corpus] ${seedMeta.id} POST seed=${seedMeta.seed}`);
  const postReq = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body: { seed: seedMeta.seed, hints },
    deployment: PREVIEW_DPL,
    timeout: 180000,
  });
  const postFile = saveRaw(`create-${seedMeta.id}`, postReq);
  const postRow = analyzeSession(`${seedMeta.id}-post`, seedMeta, postReq, {
    surface: 'discovery-post',
    raw_file: postFile,
  });
  console.log(
    `  POST → status=${postRow.status} findings=${postRow.findings_count} multi=${postRow.multi_independent_n}/${postRow.findings_count}=${postRow.multi_independent_rate} viaf=${postRow.viaf_findings_n} leak=${postRow.acc_leak_count}`
  );

  let getRow = null;
  if (postRow.sessionId) {
    const enc = encodeURIComponent(postRow.sessionId);
    // sticky poll: wait briefly then GET
    spawnSync('sleep', ['2']);
    const getReq = vercelCurl(`/api/discovery/sessions/${enc}`, { deployment: PREVIEW_DPL, timeout: 180000 });
    const getFile = saveRaw(`get-${seedMeta.id}`, getReq);
    getRow = analyzeSession(`${seedMeta.id}-get`, seedMeta, getReq, {
      surface: 'discovery-get',
      sessionId: postRow.sessionId,
      raw_file: getFile,
    });
    console.log(
      `  GET  → status=${getRow.status} findings=${getRow.findings_count} multi=${getRow.multi_independent_n}/${getRow.findings_count}=${getRow.multi_independent_rate} viaf=${getRow.viaf_findings_n} leak=${getRow.acc_leak_count}`
    );
  } else {
    console.log('  GET → SKIP no sessionId');
    writeFileSync(join(RAW, `create-${seedMeta.id}-raw.txt`), postReq.rawStdout || postReq.text || '');
  }

  // Prefer GET (sticky) for metrics; fall back to POST
  const primary = getRow && getRow.findings_count > 0 ? getRow : postRow;
  per_seed.push({
    ...primary,
    post_findings_count: postRow.findings_count,
    get_findings_count: getRow?.findings_count ?? null,
    post_ms: postRow.ms,
    get_ms: getRow?.ms ?? null,
  });
}

// --- Adversarial ---
console.log('[adv] Smith+IBM/NY/US');
const advSmithBody = { seed: 'John Smith', hints: { org: 'IBM', city: 'New York', country: 'US' } };
const advSmithPost = vercelCurl('/api/discovery/sessions', { method: 'POST', body: advSmithBody, deployment: PREVIEW_DPL });
saveRaw('adv-smith-ctx-post', advSmithPost);
const advSmithPostRow = analyzeSession('adv-smith-ctx-post', { id: 'ADV-SMITH', seed: 'John Smith', category: 'adversarial' }, advSmithPost, {
  surface: 'adversarial-post',
  raw_file: 'adv-smith-ctx-post.json',
});
let advSmithGetRow = null;
if (advSmithPostRow.sessionId) {
  const enc = encodeURIComponent(advSmithPostRow.sessionId);
  spawnSync('sleep', ['1']);
  const advSmithGet = vercelCurl(`/api/discovery/sessions/${enc}`, { deployment: PREVIEW_DPL });
  saveRaw('adv-smith-ctx-get', advSmithGet);
  advSmithGetRow = analyzeSession('adv-smith-ctx-get', { id: 'ADV-SMITH', seed: 'John Smith', category: 'adversarial' }, advSmithGet, {
    surface: 'adversarial-get',
    sessionId: advSmithPostRow.sessionId,
    raw_file: 'adv-smith-ctx-get.json',
  });
}

const advInjectBodies = [
  { label: 'adv-inject-qid', seed: 'John Smith', hints: { org: 'IBM', city: 'New York', country: 'US', qid: 'Q1701775' } },
  { label: 'adv-inject-wd-qid', seed: 'John Smith', hints: { org: 'IBM', forceId: 'wd-Q1701775', entityRef: 'wd_Q1701775' } },
  { label: 'adv-inject-seed-poison', seed: 'John Smith Q1701775', hints: { org: 'IBM' } },
];
const advInjectRows = [];
for (const inj of advInjectBodies) {
  const req = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body: { seed: inj.seed, hints: inj.hints },
    deployment: PREVIEW_DPL,
  });
  saveRaw(inj.label, req);
  const row = analyzeSession(inj.label, { id: inj.label, seed: inj.seed, category: 'adversarial-inject' }, req, {
    surface: 'adversarial-inject',
    raw_file: `${inj.label}.json`,
  });
  advInjectRows.push(row);
  console.log(`  ${inj.label} → leak=${row.acc_leak_count} b23=${row.contradictions_findingIds_Q1701775_hits} dossier=${row.dossier_bind} findings=${row.findings_count}`);
}

const advLeak =
  advSmithPostRow.acc_leak_count +
  (advSmithGetRow?.acc_leak_count || 0) +
  advSmithPostRow.contradictions_findingIds_Q1701775_hits +
  (advSmithGetRow?.contradictions_findingIds_Q1701775_hits || 0) +
  advInjectRows.reduce((a, r) => a + r.acc_leak_count + r.contradictions_findingIds_Q1701775_hits, 0);
const advPrettyWrong =
  advSmithPostRow.dossier_bind ||
  advSmithGetRow?.dossier_bind ||
  advInjectRows.some((r) => r.dossier_bind);
const advPass = advLeak === 0 && !advPrettyWrong;

// --- Core smoke ---
console.log('[core] smoke LOCKED 8ag');
const coreHealth = publicCurl(`${CORE_BASE}/api/health`);
saveCoreRaw('health-public', coreHealth);
const coreHealthVc = vercelCurl('/api/health', { deployment: CORE_DPL });
saveCoreRaw('health-vercel', coreHealthVc);
const coreBuild = coreHealth.json?.build || coreHealthVc.json?.build;
const coreBuildOk = coreBuild === CORE_DPL;

function analyzeCore(label, req) {
  const j = req.json || {};
  const leakHits = deepScanForbidden(j);
  const ui = j.uiState || j.ui || j.mode || null;
  const qid = j.qid || j.entityId || j?.dossier?.qid || j?.selected?.qid || null;
  const faces = facesCount(j);
  const pw = typeof j.prettyWrong === 'number' ? j.prettyWrong : j.pw === true ? 1 : j.prettyWrong === true ? 1 : 0;
  return {
    case: label,
    uiState: ui,
    qid,
    faces,
    leakage: leakHits.length,
    leak_hits: leakHits.slice(0, 10),
    pw,
    forbiddenIdentitiesVersion: j.forbiddenIdentitiesVersion || null,
    ms: req.ms,
  };
}

const assafReq = publicCurl(`${CORE_BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}&nocache=1`);
saveCoreRaw('assaf', assafReq);
const assaf = analyzeCore('assaf', assafReq);
assaf.pass = assaf.uiState === 'dossier' && assaf.qid === 'Q47507930' && assaf.leakage === 0;

const cohenReq = publicCurl(`${CORE_BASE}/api/lookup?q=${encodeURIComponent('כהן')}&nocache=1`);
saveCoreRaw('cohen', cohenReq);
const cohen = analyzeCore('cohen', cohenReq);
cohen.pass =
  ['need_context', 'thin', 'candidates'].includes(cohen.uiState) &&
  cohen.faces === 0 &&
  cohen.leakage === 0 &&
  cohen.qid !== 'Q1701775';

const smithBody = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };
const smithNcReq = publicCurl(`${CORE_BASE}/api/lookup`, { method: 'POST', body: { ...smithBody, nocache: 1 } });
saveCoreRaw('smith-nocache', smithNcReq);
const smithNc = analyzeCore('smith-nocache', smithNcReq);
smithNc.pass =
  ['candidates', 'thin', 'need_context'].includes(smithNc.uiState) &&
  smithNc.leakage === 0 &&
  smithNc.qid !== 'Q1701775' &&
  !String(smithNc.qid || '').includes('1701775') &&
  smithNc.faces === 0;

const smithWarmReq = publicCurl(`${CORE_BASE}/api/lookup`, { method: 'POST', body: smithBody });
saveCoreRaw('smith-warm', smithWarmReq);
const smithWarm = analyzeCore('smith-warm', smithWarmReq);
smithWarm.pass =
  ['candidates', 'thin', 'need_context'].includes(smithWarm.uiState) &&
  smithWarm.leakage === 0 &&
  smithWarm.qid !== 'Q1701775' &&
  !String(smithWarm.qid || '').includes('1701775') &&
  smithWarm.faces === 0;

const coreCases = [assaf, cohen, smithNc, smithWarm];
const coreLeak = coreCases.reduce((a, c) => a + c.leakage, 0);
const corePw = coreCases.reduce((a, c) => a + (c.pw || 0), 0);
const corePass = coreBuildOk && assaf.pass && cohen.pass && smithNc.pass && smithWarm.pass && coreLeak === 0 && corePw === 0;
console.log(`  Assaf=${assaf.pass} כהן=${cohen.pass} smithNc=${smithNc.pass} smithWarm=${smithWarm.pass} build=${coreBuild}`);

// --- Aggregates ---
const findings_total = per_seed.reduce((a, s) => a + s.findings_count, 0);
const multi_independent_n = per_seed.reduce((a, s) => a + s.multi_independent_n, 0);
const multi_independent_rate_pooled = findings_total ? multi_independent_n / findings_total : 0;
const per_seed_rates = Object.fromEntries(per_seed.map((s) => [s.id, s.multi_independent_rate]));
const multi_independent_rate_mean_of_seeds =
  per_seed.length ? per_seed.reduce((a, s) => a + s.multi_independent_rate, 0) / per_seed.length : 0;
const acc_leak_count_total = per_seed.reduce(
  (a, s) => a + s.acc_leak_count + s.contradictions_findingIds_Q1701775_hits,
  0
);
const viaf_findings_n = per_seed.reduce((a, s) => a + s.viaf_findings_n, 0);
const viaf_on_all_seeds = per_seed.every((s) => s.viaf_present);

const multiGatePass = multi_independent_rate_pooled >= MULTI_THRESHOLD;
const leakPass = acc_leak_count_total === 0;
const overallPass = multiGatePass && leakPass && advPass && corePass && b0AliasStillAvyhr && previewBuildOk;

// RCA if multi fail
const rca = multiGatePass
  ? null
  : {
      root_cause:
        'VIAF adapter emits independent viaf-* Findings with single-family Evidence; orchestrator does not merge/corroborate cross-family Evidence onto the same FindingId. Therefore hostFamilyCount stays 1 for every Finding → multi_independent_rate=0 despite viaf present at session level.',
      observed: {
        viaf_findings_n,
        viaf_on_all_seeds,
        findings_with_providers_ge2: per_seed.reduce(
          (a, s) => a + s.findings.filter((f) => (f.providers || []).length >= 2).length,
          0
        ),
        findings_with_hostFamilyCount_ge2: multi_independent_n,
        session_families_include_viaf: viaf_on_all_seeds,
      },
      implication:
        'EXP-A flag successfully surfaces VIAF as a new independent family (session union), but Acc gate multi_independent_rate (≥2 distinct hostFamilies ON THE SAME Finding) requires cross-provider Evidence merge / identity join — not yet wired. Honest FAIL vs ≥0.15.',
      next:
        'HOLD promote. Optional follow-up (out of Acc scope): Finding join key across viaf↔wikidata↔wikipedia (e.g. VIAF↔WD external-id) before re-measure.',
    };

const finished = nowJerusalem();

const afterJson = {
  doc: 'ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20',
  role: 'דיוק',
  phase: 'CYCLE1-PHASE4-EXPERIMENT-A-VIAF',
  purpose: 'Acc AFTER on VIAF Preview vs frozen B0 BEFORE — multi_independent_rate + leak + adversarial + Core + B0 alias health',
  stamp: started,
  finished,
  mode: 'AFTER_MEASURE',
  promote: 'HOLD',
  no_code: true,
  no_promote: true,
  no_core_touch: true,
  no_discovery_alias_touch: true,
  preview: {
    dpl: PREVIEW_DPL,
    url: PREVIEW_URL,
    expect_flag: 'DISCOVERY_ENABLE_VIAF=1',
    health_build: previewHealth.json?.build || null,
    build_match: previewBuildOk,
  },
  b0_locked: {
    alias: B0_ALIAS,
    deploymentId: B0_DPL,
    health_build: b0Health.json?.build || null,
    alias_still_Avyhr: b0AliasStillAvyhr,
  },
  core_locked: {
    alias: CORE_BASE,
    deploymentId: CORE_DPL,
    observed_build: coreBuild,
    still_8ag: coreBuildOk,
  },
  forbidden: ['Q1701775', 'wd-Q1701775', 'wd_Q1701775'],
  corpus: { file: 'GOLDEN-CORPUS-v0.json', seeds: SEEDS },
  family_mapping: FAMILY_MAPPING,
  family_mapping_source: 'ACC-B0-BEFORE-S01-S04-S05-דיוק-2026-09-20.json (reused verbatim)',
  success_threshold_exp_a: {
    multi_independent_rate_aggregate: `>= ${MULTI_THRESHOLD}`,
    acc_leak: 0,
  },
  per_seed,
  aggregate: {
    seeds: SEEDS.map((s) => s.id),
    findings_total,
    multi_independent_n,
    multi_independent_rate_pooled: Math.round(multi_independent_rate_pooled * 10000) / 10000,
    multi_independent_rate_mean_of_seeds: Math.round(multi_independent_rate_mean_of_seeds * 10000) / 10000,
    per_seed_rates,
    acc_leak_count_total,
    contradictions_findingIds_Q1701775_hits_total: per_seed.reduce(
      (a, s) => a + s.contradictions_findingIds_Q1701775_hits,
      0
    ),
    viaf_findings_n,
    viaf_present_on_preview: viaf_on_all_seeds,
  },
  adversarial: {
    smith_ctx: { post: summarizeAdv(advSmithPostRow), get: advSmithGetRow ? summarizeAdv(advSmithGetRow) : null },
    inject: advInjectRows.map(summarizeAdv),
    leak_total: advLeak,
    pretty_wrong: advPrettyWrong,
    pass: advPass,
  },
  core_smoke: {
    verdict: corePass ? 'PASS' : 'FAIL',
    build: coreBuild,
    leakage_total: coreLeak,
    pw_total: corePw,
    checks: {
      health_build_match: coreBuildOk,
      assaf_dossier_qid: assaf.pass,
      cohen_soft: cohen.pass,
      smith_nocache: smithNc.pass,
      smith_warm: smithWarm.pass,
      smith_never_Q1701775: smithNc.pass && smithWarm.pass,
      leakage_0: coreLeak === 0,
      pw_0: corePw === 0,
    },
    cases: coreCases,
  },
  rca_multi_independent: rca,
  invariants: {
    'ACC-DISC-01': 'leakage=0',
    'ACC-DISC-06': 'NEVER Q1701775 on any emit surface',
    B23: 'contradictions[].findingIds NEVER Q1701775 / wd-Q1701775',
    'EXP-A-AFTER': 'Preview measure · HOLD promote',
  },
  verdict: {
    multi_independent_gate: multiGatePass ? 'PASS' : 'FAIL',
    multi_independent_rate_pooled: Math.round(multi_independent_rate_pooled * 10000) / 10000,
    threshold: MULTI_THRESHOLD,
    acc_leak: leakPass ? 'PASS' : 'FAIL',
    adversarial: advPass ? 'PASS' : 'FAIL',
    core: corePass ? 'PASS' : 'FAIL',
    b0_still_Avyhr: b0AliasStillAvyhr ? 'PASS' : 'FAIL',
    preview_build: previewBuildOk ? 'PASS' : 'FAIL',
    overall: overallPass ? 'PASS' : 'FAIL',
    promote: 'HOLD',
    note: multiGatePass
      ? 'EXP-A Acc AFTER met multi_independent ≥0.15 with leak=0; still HOLD promote pending other gates/owners.'
      : 'Honest FAIL: VIAF live on Preview but multi_independent_rate still 0 (no cross-family Evidence merge per Finding). See rca_multi_independent.',
  },
  raw_dir: 'raw/acc-after-דיוק/',
};

function summarizeAdv(row) {
  if (!row) return null;
  return {
    id: row.id,
    label: row.label,
    surface: row.surface,
    sessionId: row.sessionId,
    status: row.status,
    findings_count: row.findings_count,
    acc_leak_count: row.acc_leak_count,
    contradictions_findingIds_Q1701775_hits: row.contradictions_findingIds_Q1701775_hits,
    dossier_bind: row.dossier_bind,
    viaf_findings_n: row.viaf_findings_n,
  };
}

// strip bulky findings from adversarial already summarized; keep per_seed findings
writeFileSync(join(PHASE4, 'ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.json'), JSON.stringify(afterJson, null, 2));

const afterMd = `# ACC AFTER PREVIEW · S01/S04/S05 · דיוק · 2026-09-20

**Stamp:** ${started} → ${finished} (Asia/Jerusalem, UTC+3)  
**Agent:** דיוק (Accuracy)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A-VIAF  
**Mode:** AFTER measure · **NO promote** · **NO Core touch** · **NO Discovery alias touch**

## Targets

| Surface | Value |
|---------|-------|
| Preview (VIAF ON) | \`${PREVIEW_DPL}\` · ${PREVIEW_URL} |
| Expect flag | \`DISCOVERY_ENABLE_VIAF=1\` (Preview env) |
| B0 LOCKED | \`${B0_ALIAS}\` → \`${B0_DPL}\` |
| Core LOCKED | \`${CORE_BASE}\` → \`${CORE_DPL}\` |
| Access | \`vercel curl --deployment ${PREVIEW_DPL} --scope ${SCOPE}\` |

## Verdict

| Gate | Result | Detail |
|------|--------|--------|
| **multi_independent ≥ ${MULTI_THRESHOLD}** | **${yn(multiGatePass)}** | pooled=${(Math.round(multi_independent_rate_pooled * 10000) / 10000)} · n=${multi_independent_n}/${findings_total} |
| Acc leak (emit + contr.findingIds) | **${yn(leakPass)}** | total=${acc_leak_count_total} |
| Adversarial Smith+IBM/NY/US + QID inject | **${yn(advPass)}** | leak=${advLeak} · pretty-wrong/dossier=${advPrettyWrong} |
| Core smoke still 8ag | **${yn(corePass)}** | build=\`${coreBuild}\` · Assaf/כהן/Smith · pw=${corePw} |
| B0 alias still Avyhr | **${yn(b0AliasStillAvyhr)}** | inspect+health |
| Preview build match | **${yn(previewBuildOk)}** | \`${previewHealth.json?.build}\` |
| **OVERALL Acc EXP-A AFTER** | **${yn(overallPass)}** | **HOLD promote** |

## Per-seed multi_independent (AFTER)

| Seed | findings | multi_n | rate | viaf_n | leak | providers |
|------|----------:|--------:|-----:|-------:|-----:|-----------|
${per_seed
  .map(
    (s) =>
      `| ${s.id} ${s.seed} | ${s.findings_count} | ${s.multi_independent_n} | ${s.multi_independent_rate} | ${s.viaf_findings_n} | ${s.acc_leak_count + s.contradictions_findingIds_Q1701775_hits} | \`${JSON.stringify(s.providers_session)}\` |`
  )
  .join('\n')}
| **AGG pooled** | **${findings_total}** | **${multi_independent_n}** | **${Math.round(multi_independent_rate_pooled * 10000) / 10000}** | **${viaf_findings_n}** | **${acc_leak_count_total}** | |

Family mapping: **reused verbatim** from B0 BEFORE (\`wikidata\` / \`wikipedia\` mirrors-as-one / \`openlibrary\` / \`viaf\` / \`other:<apex>\`).

## RCA (multi gate)

${
  rca
    ? `**Root cause:** ${rca.root_cause}

**Observed:** viaf_findings_n=${rca.observed.viaf_findings_n} · viaf_on_all_seeds=${rca.observed.viaf_on_all_seeds} · findings providers≥2=${rca.observed.findings_with_providers_ge2} · hostFamilyCount≥2=${rca.observed.findings_with_hostFamilyCount_ge2}

**Implication:** ${rca.implication}

**Next:** ${rca.next}`
    : '_n/a — multi gate PASS_'
}

## Adversarial

| Case | findings | leak | b23 | dossier | Result |
|------|----------:|-----:|----:|---------|--------|
| Smith+IBM/NY/US POST | ${advSmithPostRow.findings_count} | ${advSmithPostRow.acc_leak_count} | ${advSmithPostRow.contradictions_findingIds_Q1701775_hits} | ${advSmithPostRow.dossier_bind} | **${yn(advSmithPostRow.acc_leak_count === 0 && !advSmithPostRow.dossier_bind)}** |
| Smith+IBM/NY/US GET | ${advSmithGetRow?.findings_count ?? '—'} | ${advSmithGetRow?.acc_leak_count ?? '—'} | ${advSmithGetRow?.contradictions_findingIds_Q1701775_hits ?? '—'} | ${advSmithGetRow?.dossier_bind ?? '—'} | **${yn(!!advSmithGetRow && advSmithGetRow.acc_leak_count === 0 && !advSmithGetRow.dossier_bind)}** |
${advInjectRows
  .map(
    (r) =>
      `| ${r.label} | ${r.findings_count} | ${r.acc_leak_count} | ${r.contradictions_findingIds_Q1701775_hits} | ${r.dossier_bind} | **${yn(r.acc_leak_count === 0 && r.contradictions_findingIds_Q1701775_hits === 0 && !r.dossier_bind)}** |`
  )
  .join('\n')}

## Core smoke (LOCKED)

| Case | ui | qid | faces | leak | pw | Result |
|------|-----|-----|------:|-----:|----:|--------|
| assaf | ${assaf.uiState} | ${assaf.qid} | ${assaf.faces} | ${assaf.leakage} | ${assaf.pw} | **${yn(assaf.pass)}** |
| כהן | ${cohen.uiState} | ${cohen.qid ?? 'null'} | ${cohen.faces} | ${cohen.leakage} | ${cohen.pw} | **${yn(cohen.pass)}** |
| smith-nocache | ${smithNc.uiState} | ${smithNc.qid ?? 'null'} | ${smithNc.faces} | ${smithNc.leakage} | ${smithNc.pw} | **${yn(smithNc.pass)}** |
| smith-warm | ${smithWarm.uiState} | ${smithWarm.qid ?? 'null'} | ${smithWarm.faces} | ${smithWarm.leakage} | ${smithWarm.pw} | **${yn(smithWarm.pass)}** |

## Artifacts

- \`ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.md\` + \`.json\`
- \`ACC-COMPARE-B0-vs-PREVIEW-דיוק-2026-09-20.md\` + \`.json\`
- \`STATUS-דיוק.md\`
- Raw: \`raw/acc-after-דיוק/\`

## Decision

- Acc EXP-A AFTER: **${yn(overallPass)}** (multi **${yn(multiGatePass)}** · leak **${yn(leakPass)}** · adv **${yn(advPass)}** · Core **${yn(corePass)}** · B0 **${yn(b0AliasStillAvyhr)}**)
- **HOLD promote** · no alias mutation · Core untouched
`;

writeFileSync(join(PHASE4, 'ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.md'), afterMd);

// --- COMPARE pack ---
const beforeRates = BEFORE.aggregate.per_seed_rates;
const beforeAgg = BEFORE.aggregate;
const compareRows = SEEDS.map((s) => {
  const b = BEFORE.per_seed.find((x) => x.id === s.id);
  const a = per_seed.find((x) => x.id === s.id);
  return {
    id: s.id,
    seed: s.seed,
    before: {
      findings_count: b?.findings_count ?? null,
      multi_independent_n: b?.multi_independent_n ?? null,
      multi_independent_rate: b?.multi_independent_rate ?? null,
      viaf_findings_n: 0,
      acc_leak_count: b?.acc_leak_count ?? null,
    },
    after: {
      findings_count: a?.findings_count ?? null,
      multi_independent_n: a?.multi_independent_n ?? null,
      multi_independent_rate: a?.multi_independent_rate ?? null,
      viaf_findings_n: a?.viaf_findings_n ?? null,
      acc_leak_count: (a?.acc_leak_count || 0) + (a?.contradictions_findingIds_Q1701775_hits || 0),
    },
    delta_rate: Math.round(((a?.multi_independent_rate || 0) - (b?.multi_independent_rate || 0)) * 10000) / 10000,
  };
});

const compareJson = {
  doc: 'ACC-COMPARE-B0-vs-PREVIEW-דיוק-2026-09-20',
  role: 'דיוק',
  phase: 'CYCLE1-PHASE4-EXPERIMENT-A-VIAF',
  stamp: finished,
  promote: 'HOLD',
  before: {
    source: 'ACC-B0-BEFORE-S01-S04-S05-דיוק-2026-09-20.json',
    deploymentId: B0_DPL,
    alias: B0_ALIAS,
    multi_independent_rate_pooled: beforeAgg.multi_independent_rate_pooled,
    per_seed_rates: beforeRates,
    viaf_present: false,
  },
  after: {
    source: 'ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.json',
    deploymentId: PREVIEW_DPL,
    url: PREVIEW_URL,
    multi_independent_rate_pooled: Math.round(multi_independent_rate_pooled * 10000) / 10000,
    per_seed_rates,
    viaf_present: viaf_on_all_seeds,
    viaf_findings_n,
  },
  table: compareRows,
  aggregate_delta: {
    multi_independent_rate_pooled_before: beforeAgg.multi_independent_rate_pooled,
    multi_independent_rate_pooled_after: Math.round(multi_independent_rate_pooled * 10000) / 10000,
    delta: Math.round((multi_independent_rate_pooled - beforeAgg.multi_independent_rate_pooled) * 10000) / 10000,
    threshold: MULTI_THRESHOLD,
    gate: multiGatePass ? 'PASS' : 'FAIL',
  },
  side_gates: {
    acc_leak_after: acc_leak_count_total,
    adversarial: advPass ? 'PASS' : 'FAIL',
    core: corePass ? 'PASS' : 'FAIL',
    b0_still_Avyhr: b0AliasStillAvyhr,
  },
  rca: rca,
  verdict: overallPass ? 'PASS' : 'FAIL',
  promote_decision: 'HOLD',
};

writeFileSync(join(PHASE4, 'ACC-COMPARE-B0-vs-PREVIEW-דיוק-2026-09-20.json'), JSON.stringify(compareJson, null, 2));

const compareMd = `# ACC COMPARE · B0 BEFORE vs PREVIEW AFTER · דיוק · 2026-09-20

**Stamp:** ${finished} (Asia/Jerusalem, UTC+3)  
**Promote:** **HOLD**  
**Family mapping:** identical to B0 BEFORE pack

## Before / After table

| Seed | BEFORE findings | BEFORE multi rate | AFTER findings | AFTER multi rate | Δ rate | AFTER viaf_n |
|------|----------------:|------------------:|---------------:|-----------------:|-------:|-------------:|
${compareRows
  .map(
    (r) =>
      `| ${r.id} ${r.seed} | ${r.before.findings_count} | ${r.before.multi_independent_rate} | ${r.after.findings_count} | ${r.after.multi_independent_rate} | ${r.delta_rate} | ${r.after.viaf_findings_n} |`
  )
  .join('\n')}
| **AGG pooled** | **${beforeAgg.findings_total}** | **${beforeAgg.multi_independent_rate_pooled}** | **${findings_total}** | **${Math.round(multi_independent_rate_pooled * 10000) / 10000}** | **${Math.round((multi_independent_rate_pooled - beforeAgg.multi_independent_rate_pooled) * 10000) / 10000}** | **${viaf_findings_n}** |

## Gate

| Metric | BEFORE | AFTER | Threshold | Result |
|--------|-------:|------:|----------:|--------|
| multi_independent_rate (pooled) | ${beforeAgg.multi_independent_rate_pooled} | ${Math.round(multi_independent_rate_pooled * 10000) / 10000} | ≥ ${MULTI_THRESHOLD} | **${yn(multiGatePass)}** |
| viaf present | false | ${viaf_on_all_seeds} | — | ${viaf_on_all_seeds ? 'YES' : 'NO'} |
| acc_leak | 0 | ${acc_leak_count_total} | 0 | **${yn(leakPass)}** |
| adversarial | — | ${yn(advPass)} | PASS | **${yn(advPass)}** |
| Core still 8ag | — | ${yn(corePass)} | PASS | **${yn(corePass)}** |
| B0 still Avyhr | — | ${yn(b0AliasStillAvyhr)} | PASS | **${yn(b0AliasStillAvyhr)}** |

## RCA

${rca ? rca.root_cause : 'n/a'}

## Decision

**${yn(overallPass)}** Acc EXP-A AFTER · multi **${yn(multiGatePass)}** · **HOLD promote**
`;

writeFileSync(join(PHASE4, 'ACC-COMPARE-B0-vs-PREVIEW-דיוק-2026-09-20.md'), compareMd);

const statusMd = `# STATUS — דיוק · CYCLE1 PHASE4 EXP-A VIAF · Acc AFTER

**Stamp:** ${finished} IDT (Asia/Jerusalem, UTC+3)  
**Agent:** דיוק (Accuracy)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A-VIAF  
**Mode:** AFTER measure complete

## State

| Item | Value |
|------|-------|
| Preview | \`${PREVIEW_DPL}\` · VIAF ON |
| Promote | **HOLD** |
| Code | **NONE** (Acc observation) |
| Core \`${CORE_DPL}\` | **LOCKED / untouched** · smoke **${yn(corePass)}** |
| Discovery B0 \`${B0_DPL}\` | **UNCHANGED (still Avyhr)** · **${yn(b0AliasStillAvyhr)}** |
| Acc leak (S01/S04/S05 + adv) | **${acc_leak_count_total + advLeak}** · seeds leak **${acc_leak_count_total}** · adv leak **${advLeak}** |
| contr.findingIds Q1701775 | **${per_seed.reduce((a, s) => a + s.contradictions_findingIds_Q1701775_hits, 0)}** |
| Adversarial pretty-wrong | **${advPrettyWrong ? 'FAIL' : '0 / PASS'}** |

## multi_independent_rate BEFORE → AFTER

| Seed | BEFORE | AFTER |
|------|-------:|------:|
| S01 Tim Berners-Lee | ${beforeRates.S01} | ${per_seed_rates.S01} |
| S04 Stripe | ${beforeRates.S04} | ${per_seed_rates.S04} |
| S05 Red Cross | ${beforeRates.S05} | ${per_seed_rates.S05} |
| **AGG pooled** | **${beforeAgg.multi_independent_rate_pooled}** | **${Math.round(multi_independent_rate_pooled * 10000) / 10000}** |

**Gate ≥0.15:** **${yn(multiGatePass)}**  
**OVERALL:** **${yn(overallPass)}** · **HOLD promote**

${rca ? `## RCA\n\n${rca.root_cause}\n` : ''}
## Deliverables

1. \`ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.md\` + \`.json\`
2. \`ACC-COMPARE-B0-vs-PREVIEW-דיוק-2026-09-20.md\` + \`.json\`
3. \`STATUS-דיוק.md\` (this file)
4. Raw: \`raw/acc-after-דיוק/\`
`;

writeFileSync(join(PHASE4, 'STATUS-דיוק.md'), statusMd);

console.log('\n========== דיוק EXP-A Acc AFTER DONE ==========');
console.log(
  `multi_pooled=${Math.round(multi_independent_rate_pooled * 10000) / 10000} gate=${yn(multiGatePass)} leak=${acc_leak_count_total} adv=${yn(advPass)} core=${yn(corePass)} b0=${yn(b0AliasStillAvyhr)} overall=${yn(overallPass)}`
);
console.log('HOLD promote');
