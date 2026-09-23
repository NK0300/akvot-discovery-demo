#!/usr/bin/env node
/**
 * EXP-A2 COALESCE · Acc AFTER · דיוק · 2026-09-20
 * PRIMARY verdict: Bound #1 dpl_Fz2iq… (typed keys only)
 * FRNDab: optional caveat baseline (not promote-path)
 * Acc redef: FindingId after coalesce; multi iff Evidence[] ≥2 families;
 *            rate = multi / findings≥1 Evidence; gate mean(S01,S04,S05)≥0.15
 * NO promote · NO Core/B0 alias mutation
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHASE = join(__dirname, '..');
const ROOT = '/workspace/akvot-quick-demo';
const RAW = join(PHASE, 'raw/acc-after-דיוק');
mkdirSync(join(RAW, 'bound1'), { recursive: true });
mkdirSync(join(RAW, 'frndab'), { recursive: true });
mkdirSync(join(RAW, 'core'), { recursive: true });
mkdirSync(join(RAW, 'b0'), { recursive: true });

const PRIMARY = {
  label: 'bound1',
  dpl: 'dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw',
  url: 'https://akvot-simple-demo-2u3mwx1k4-k-akvot.vercel.app',
  role: 'PRIMARY_VERDICT',
};
const FRNDAB = {
  label: 'frndab',
  dpl: 'dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2',
  url: 'https://akvot-simple-demo-h9cq1ob4m-k-akvot.vercel.app',
  role: 'CAVEAT_BASELINE',
};
const B0_DPL = 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const B0_ALIAS = 'https://akvot-discovery.vercel.app';
const CORE_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const CORE_BASE = 'https://akvot-simple-demo.vercel.app';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const MULTI_THRESHOLD = 0.15;
const B0_FROZEN = {
  S01: { findings_count: 10, multi_independent_rate: 0.0 },
  S04: { findings_count: 14, multi_independent_rate: 0.0 },
  S05: { findings_count: 6, multi_independent_rate: 0.0 },
};

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

function vercelCurl(path, { method = 'GET', body = null, deployment, timeout = 180000 } = {}) {
  const args = ['curl', path, '--deployment', deployment, '--scope', SCOPE, '--'];
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
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.startsWith('{') || line.startsWith('[')) {
      try {
        json = JSON.parse(line);
        break;
      } catch {
        /* continue */
      }
    }
  }
  if (!json) {
    const idx = stdout.lastIndexOf('{');
    if (idx >= 0) {
      try {
        json = JSON.parse(stdout.slice(idx));
      } catch {
        /* ignore */
      }
    }
  }
  return { json, ms, stderr: (r.stderr || '').trim(), status: r.status, raw: stdout.slice(0, 8000) };
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
  } catch {
    /* ignore */
  }
  return { json, ms: Date.now() - t0, status: r.status, text: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function save(subdir, label, data) {
  const payload = data?.json != null ? data.json : { text: String(data?.raw || data?.text || '').slice(0, 200000), stderr: data?.stderr, status: data?.status };
  const path = join(RAW, subdir, `${label}.json`);
  writeFileSync(path, JSON.stringify(payload, null, 2));
  return `${subdir}/${label}.json`;
}

function deepScanForbidden(obj, path = '') {
  const found = [];
  if (obj == null) return found;
  if (typeof obj === 'string' || typeof obj === 'number') {
    const hits = String(obj).match(FORBIDDEN_RE) || [];
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

/** Acc redef family map */
function providerFamily(ev) {
  const providerId = String(ev?.providerId || ev?.provider || '').toLowerCase();
  if (providerId === 'wikidata') return 'wikidata';
  if (providerId === 'wikipedia') return 'wikipedia';
  if (providerId === 'openlibrary') return 'openlibrary';
  if (providerId === 'viaf') return 'viaf';

  let host = String(ev?.domain || '').toLowerCase();
  if (!host) {
    try {
      host = new URL(ev?.provenanceUrl || ev?.url || '').hostname.toLowerCase();
    } catch {
      host = '';
    }
  }
  host = host.replace(/^www\./, '');
  if (!host) return 'unknown';
  if (host.includes('wikidata') || host.endsWith('wikidata.org')) return 'wikidata';
  if (host.includes('wikipedia') || (host.includes('wikimedia') && !host.includes('wikidata'))) return 'wikipedia';
  if (host.includes('openlibrary')) return 'openlibrary';
  if (host.includes('viaf')) return 'viaf';
  const parts = host.split('.').filter(Boolean);
  const apex = parts.length >= 2 ? parts.slice(-2).join('.') : host;
  return `other:${apex}`;
}

function analyzeSnapshot(snap, rawObj) {
  const findings = Array.isArray(snap?.findings) ? snap.findings : [];
  const evidence = Array.isArray(snap?.evidence) ? snap.evidence : [];
  const evById = new Map(evidence.map((e) => [e.id || e.evidenceId, e]));
  let multi_n = 0;
  let with_ev_n = 0;
  let viaf_findings_n = 0;
  const hist = {};
  const rows = [];

  for (const f of findings) {
    const eids = Array.isArray(f?.evidenceIds) ? f.evidenceIds : [];
    const fams = new Set();
    for (const eid of eids) {
      const ev = evById.get(eid);
      if (!ev) continue;
      fams.add(providerFamily(ev));
    }
    fams.delete('unknown');
    const hostFamilies = [...fams].sort();
    if (eids.length >= 1) {
      with_ev_n += 1;
      const multi = hostFamilies.length >= 2;
      if (multi) multi_n += 1;
      if (hostFamilies.includes('viaf') || (f.providers || []).includes('viaf')) viaf_findings_n += 1;
      for (const fam of hostFamilies.length ? hostFamilies : ['unresolved']) {
        hist[fam] = (hist[fam] || 0) + 1;
      }
      rows.push({
        id: f.id,
        title: String(f.title || '').slice(0, 80),
        providers: f.providers || [],
        evidenceCount: eids.length,
        hostFamilies,
        multi_independent: multi,
        in_denominator: true,
        facetMulti: (f.facetHints || []).includes('corroboration:multi_family'),
      });
    } else {
      rows.push({
        id: f.id,
        title: String(f.title || '').slice(0, 80),
        providers: f.providers || [],
        evidenceCount: 0,
        hostFamilies: [],
        multi_independent: false,
        in_denominator: false,
      });
    }
  }

  const rate = with_ev_n ? multi_n / with_ev_n : 0;
  const leakHits = deepScanForbidden(rawObj || snap);
  const b23 = scrubB23(rawObj || snap);
  const families_union = [...new Set(Object.keys(hist).filter((k) => k !== 'unresolved' && k !== 'none'))].sort();

  return {
    findings_count: findings.length,
    findings_with_ge1_evidence_n: with_ev_n,
    evidence_count: evidence.length,
    multi_independent_n: multi_n,
    multi_independent_rate: Math.round(rate * 10000) / 10000,
    viaf_findings_n,
    families_union,
    hostFamily_histogram: hist,
    providers_session: snap?.providers || {},
    acc_leak_count: leakHits.length,
    acc_leak_hits: leakHits.slice(0, 20),
    contradictions_n: Array.isArray(snap?.contradictions) ? snap.contradictions.length : 0,
    contradictions_findingIds: b23.findingIds,
    contradictions_findingIds_Q1701775_hits: b23.leak_n,
    corroborationEdges_n: Array.isArray(snap?.corroborationEdges) ? snap.corroborationEdges.length : 0,
    facet_multi_n: rows.filter((r) => r.facetMulti).length,
    dossier_bind: hasDossier(rawObj || snap),
    sample_multi: rows.filter((r) => r.multi_independent).slice(0, 8),
    sample_titles: rows.slice(0, 12).map((r) => ({
      id: r.id,
      title: r.title,
      multi: r.multi_independent,
      fams: r.hostFamilies,
      nEv: r.evidenceCount,
      inDenom: r.in_denominator,
    })),
  };
}

function sleepSync(ms) {
  spawnSync('sleep', [String(Math.ceil(ms / 1000))]);
}

function runSeed(subdir, deployment, seedObj) {
  const hints = {};
  if (seedObj.category === 'company' || seedObj.category === 'organization') hints.kind = 'org';
  console.log(`  [${subdir}] ${seedObj.id} POST seed=${seedObj.seed}`);
  const create = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body: { seed: seedObj.seed, locale: 'en', hints },
    deployment,
  });
  save(subdir, `${seedObj.id}-create`, create);
  const sessionId = create.json?.sessionId || create.json?.snapshot?.sessionId;
  if (!sessionId) {
    console.log(`  [${subdir}] ${seedObj.id} NO sessionId`);
    return {
      id: seedObj.id,
      seed: seedObj.seed,
      category: seedObj.category,
      error: 'no sessionId',
      create_ms: create.ms,
      findings_count: 0,
      findings_with_ge1_evidence_n: 0,
      multi_independent_n: 0,
      multi_independent_rate: 0,
      acc_leak_count: 0,
      contradictions_findingIds_Q1701775_hits: 0,
      dossier_bind: false,
      viaf_findings_n: 0,
      families_union: [],
    };
  }

  let final = create.json?.snapshot || create.json;
  let status = create.json?.status || final?.status;
  let lastGet = create;
  for (let i = 0; i < 12 && status && !['complete', 'partial', 'failed_soft'].includes(status); i++) {
    sleepSync(2000);
    const get = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`, { deployment });
    save(subdir, `${seedObj.id}-poll${i}`, get);
    lastGet = get;
    if (get.json?.snapshot) final = get.json.snapshot;
    else if (get.json?.findings) final = get.json;
    status = get.json?.status || final?.status || status;
  }
  // final sticky GET
  sleepSync(1000);
  const getFinal = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`, { deployment });
  save(subdir, `${seedObj.id}-final`, getFinal);
  if (getFinal.json?.snapshot) final = getFinal.json.snapshot;
  else if (getFinal.json?.findings) final = getFinal.json;
  status = getFinal.json?.status || final?.status || status;
  lastGet = getFinal;

  const scored = analyzeSnapshot(final, getFinal.json || create.json);
  const row = {
    id: seedObj.id,
    seed: seedObj.seed,
    category: seedObj.category,
    sessionId,
    status,
    create_ms: create.ms,
    get_ms: lastGet.ms,
    ...scored,
    b0_frozen_findings: B0_FROZEN[seedObj.id]?.findings_count ?? null,
    coverage_vs_b0: scored.findings_count - (B0_FROZEN[seedObj.id]?.findings_count ?? 0),
  };
  console.log(
    `  [${subdir}] ${seedObj.id} → status=${status} findings=${row.findings_count} withEv=${row.findings_with_ge1_evidence_n} multi=${row.multi_independent_n}/${row.findings_with_ge1_evidence_n}=${row.multi_independent_rate} viaf=${row.viaf_findings_n} leak=${row.acc_leak_count} b23=${row.contradictions_findingIds_Q1701775_hits}`,
  );
  return row;
}

function measurePreview(target, { adversarial = false } = {}) {
  console.log(`\n=== ${target.role} ${target.label} ${target.dpl} ===`);
  const health = vercelCurl('/api/health', { deployment: target.dpl });
  save(target.label, 'health', health);
  const discHealth = vercelCurl('/api/discovery/health', { deployment: target.dpl });
  save(target.label, 'discovery-health', discHealth);
  const buildOk = health.json?.build === target.dpl || String(health.json?.build || '').includes(target.dpl.replace(/^dpl_/, ''));
  // also accept exact match of full dpl
  const buildExact = health.json?.build === target.dpl;
  console.log(`  health build=${health.json?.build} exact=${buildExact}`);

  const per_seed = [];
  for (const s of SEEDS) {
    per_seed.push(runSeed(target.label, target.dpl, s));
  }

  let adversarialResult = null;
  if (adversarial) {
    console.log(`  [adv] Smith+IBM/NY/US on ${target.label}`);
    const advBody = { seed: 'John Smith', hints: { org: 'IBM', city: 'New York', country: 'US' } };
    const advPost = vercelCurl('/api/discovery/sessions', { method: 'POST', body: advBody, deployment: target.dpl });
    save(target.label, 'adv-smith-ctx-post', advPost);
    let advSnap = advPost.json?.snapshot || advPost.json;
    const advSid = advPost.json?.sessionId || advSnap?.sessionId;
    if (advSid) {
      sleepSync(2000);
      const advGet = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(advSid)}`, { deployment: target.dpl });
      save(target.label, 'adv-smith-ctx-get', advGet);
      advSnap = advGet.json?.snapshot || advGet.json || advSnap;
    }
    const advScored = analyzeSnapshot(advSnap, advPost.json);
    const injects = [
      { label: 'adv-inject-qid', seed: 'John Smith', hints: { org: 'IBM', city: 'New York', country: 'US', qid: 'Q1701775' } },
      { label: 'adv-inject-wd-qid', seed: 'John Smith', hints: { org: 'IBM', forceId: 'wd-Q1701775', entityRef: 'wd_Q1701775' } },
      { label: 'adv-inject-seed-poison', seed: 'John Smith Q1701775', hints: { org: 'IBM' } },
    ];
    const injectRows = [];
    for (const inj of injects) {
      const req = vercelCurl('/api/discovery/sessions', {
        method: 'POST',
        body: { seed: inj.seed, hints: inj.hints },
        deployment: target.dpl,
      });
      save(target.label, inj.label, req);
      const scored = analyzeSnapshot(req.json?.snapshot || req.json, req.json);
      injectRows.push({ label: inj.label, ...scored, sessionId: req.json?.sessionId });
      console.log(`  [adv] ${inj.label} leak=${scored.acc_leak_count} b23=${scored.contradictions_findingIds_Q1701775_hits} dossier=${scored.dossier_bind} findings=${scored.findings_count}`);
    }
    const advLeak =
      advScored.acc_leak_count +
      advScored.contradictions_findingIds_Q1701775_hits +
      injectRows.reduce((a, r) => a + r.acc_leak_count + r.contradictions_findingIds_Q1701775_hits, 0);
    const advPw = advScored.dossier_bind || injectRows.some((r) => r.dossier_bind);
    adversarialResult = {
      smith_ctx: {
        sessionId: advSid,
        findings_count: advScored.findings_count,
        multi_independent_rate: advScored.multi_independent_rate,
        acc_leak_count: advScored.acc_leak_count,
        b23_leak: advScored.contradictions_findingIds_Q1701775_hits,
        dossier_bind: advScored.dossier_bind,
        families_union: advScored.families_union,
      },
      injects: injectRows.map((r) => ({
        label: r.label,
        findings_count: r.findings_count,
        acc_leak_count: r.acc_leak_count,
        b23_leak: r.contradictions_findingIds_Q1701775_hits,
        dossier_bind: r.dossier_bind,
      })),
      adv_leak_total: advLeak,
      adv_pretty_wrong: !!advPw,
      adv_pass: advLeak === 0 && !advPw,
    };
  }

  const rates = per_seed.map((s) => s.multi_independent_rate);
  const mean = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
  const withEvTotal = per_seed.reduce((a, s) => a + s.findings_with_ge1_evidence_n, 0);
  const multiTotal = per_seed.reduce((a, s) => a + s.multi_independent_n, 0);
  const pooled = withEvTotal ? multiTotal / withEvTotal : 0;
  const leakTotal = per_seed.reduce(
    (a, s) => a + s.acc_leak_count + s.contradictions_findingIds_Q1701775_hits,
    0,
  );
  const dossierAny = per_seed.some((s) => s.dossier_bind);
  const s01 = per_seed.find((s) => s.id === 'S01');
  const s01_coverage_pass = (s01?.findings_count || 0) >= 5; // no vacuum vs B0≈10; reject 10→1
  const multi_gate_pass = mean >= MULTI_THRESHOLD;
  const leak_pass = leakTotal === 0 && !dossierAny;
  const hard_pass = leak_pass && (adversarialResult ? adversarialResult.adv_pass : true);

  return {
    target,
    health: { build: health.json?.build, buildExact, discovery: discHealth.json || null },
    per_seed,
    aggregates: {
      mean_multi_independent_rate: Math.round(mean * 10000) / 10000,
      pooled_multi_independent_rate: Math.round(pooled * 10000) / 10000,
      multi_total: multiTotal,
      with_ev_total: withEvTotal,
      leak_total: leakTotal,
      dossier_any: dossierAny,
      s01_findings: s01?.findings_count ?? 0,
      s01_vs_b0_frozen: (s01?.findings_count ?? 0) - B0_FROZEN.S01.findings_count,
      multi_gate_pass,
      leak_pass,
      s01_coverage_pass,
      hard_pass,
      multi_threshold: MULTI_THRESHOLD,
    },
    adversarial: adversarialResult,
  };
}

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

const stamp = nowJerusalem();
console.log(`[דיוק] ACC AFTER Bound#1 PRIMARY start ${stamp}`);
console.log(`[דיוק] PRIMARY ${PRIMARY.dpl}`);
console.log(`[דיוק] B0 LOCKED ${B0_ALIAS} → ${B0_DPL}`);
console.log(`[דיוק] Core LOCKED ${CORE_BASE} → ${CORE_DPL}`);
console.log(`[דיוק] Promote HOLD`);

// B0 health + alias inspect
const b0Health = vercelCurl('/api/health', { deployment: B0_DPL });
save('b0', 'health', b0Health);
const b0Inspect = spawnSync('vercel', ['inspect', 'akvot-discovery.vercel.app', '--scope', SCOPE], {
  encoding: 'utf8',
  cwd: ROOT,
  timeout: 60000,
});
writeFileSync(join(RAW, 'b0', 'alias-inspect.txt'), (b0Inspect.stdout || '') + '\n' + (b0Inspect.stderr || ''));
const b0AliasStillAvyhr =
  (b0Inspect.stdout || '').includes(B0_DPL) || b0Health.json?.build === B0_DPL;
console.log(`[b0] build=${b0Health.json?.build} aliasStillAvyhr=${b0AliasStillAvyhr}`);

// PRIMARY Bound#1 with adversarial
const primary = measurePreview(PRIMARY, { adversarial: true });

// Core smoke once
console.log('\n[core] smoke LOCKED 8ag');
const coreHealth = publicCurl(`${CORE_BASE}/api/health`);
save('core', 'health-public', coreHealth);
const coreHealthVc = vercelCurl('/api/health', { deployment: CORE_DPL });
save('core', 'health-vercel', coreHealthVc);
const coreBuild = coreHealth.json?.build || coreHealthVc.json?.build;
const coreBuildOk = coreBuild === CORE_DPL;

const assafReq = publicCurl(`${CORE_BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}&nocache=1`);
save('core', 'assaf', assafReq);
const assaf = analyzeCore('assaf', assafReq);
assaf.pass = assaf.uiState === 'dossier' && assaf.qid === 'Q47507930' && assaf.leakage === 0;

const cohenReq = publicCurl(`${CORE_BASE}/api/lookup?q=${encodeURIComponent('כהן')}&nocache=1`);
save('core', 'cohen', cohenReq);
const cohen = analyzeCore('cohen', cohenReq);
cohen.pass =
  ['need_context', 'thin', 'candidates'].includes(cohen.uiState) &&
  cohen.faces === 0 &&
  cohen.leakage === 0 &&
  cohen.qid !== 'Q1701775';

const smithBody = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };
const smithNcReq = publicCurl(`${CORE_BASE}/api/lookup`, { method: 'POST', body: { ...smithBody, nocache: 1 } });
save('core', 'smith-nocache', smithNcReq);
const smithNc = analyzeCore('smith-nocache', smithNcReq);
smithNc.pass =
  ['candidates', 'thin', 'need_context'].includes(smithNc.uiState) &&
  smithNc.leakage === 0 &&
  smithNc.qid !== 'Q1701775' &&
  !String(smithNc.qid || '').includes('1701775') &&
  smithNc.faces === 0;

const smithWarmReq = publicCurl(`${CORE_BASE}/api/lookup`, { method: 'POST', body: smithBody });
save('core', 'smith-warm', smithWarmReq);
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
console.log(`  Assaf=${assaf.pass} כהן=${cohen.pass} smithNc=${smithNc.pass} smithWarm=${smithWarm.pass} build=${coreBuild} corePass=${corePass}`);

// FRNDab spot-confirm (optional caveat)
const frndab = measurePreview(FRNDAB, { adversarial: false });

// Verdicts
const pAgg = primary.aggregates;
const hardPassBoth =
  pAgg.hard_pass &&
  pAgg.leak_pass &&
  (primary.adversarial?.adv_pass ?? true) &&
  corePass &&
  b0AliasStillAvyhr &&
  frndab.aggregates.leak_pass;

const bound1_multi = pAgg.multi_gate_pass ? 'PASS' : 'FAIL';
const bound1_overall =
  hardPassBoth && pAgg.s01_coverage_pass
    ? pAgg.multi_gate_pass
      ? 'PASS'
      : 'FAIL' // honest: multi gate fails → Acc FAIL for promote-path (expected OK)
    : hardPassBoth === false
      ? 'FAIL'
      : pAgg.multi_gate_pass
        ? 'PASS'
        : 'FAIL';

// Acc hard must PASS; multi reported separately. For Chief promote-path Bound#1:
// overall Acc AFTER = FAIL if multi < 0.15 OR hard fail OR coverage vacuum
const bound1_acc_verdict =
  !hardPassBoth || !pAgg.s01_coverage_pass
    ? 'FAIL'
    : pAgg.multi_gate_pass
      ? 'PASS'
      : 'FAIL';

const frndab_confirm =
  frndab.aggregates.leak_pass &&
  frndab.aggregates.s01_coverage_pass &&
  frndab.aggregates.mean_multi_independent_rate >= 0.15
    ? 'CONFIRM_PASS'
    : frndab.aggregates.leak_pass && frndab.aggregates.s01_coverage_pass
      ? 'CONFIRM_HARD_OK_MULTI_LOW'
      : 'CONFIRM_FAIL';

const ended = nowJerusalem();

const primaryJson = {
  doc: 'ACC-AFTER-BOUND1-Fz2iq-דיוק-2026-09-20',
  role: 'דיוק',
  phase: 'CYCLE1-PHASE4-EXPERIMENT-A2-COALESCE',
  stamp,
  ended,
  promote: 'HOLD',
  mode: 'ACC_AFTER_PRIMARY_BOUND1',
  preview: PRIMARY,
  locks: {
    discoveryB0: B0_DPL,
    discoveryAlias: B0_ALIAS,
    b0_alias_still_avyhr: b0AliasStillAvyhr,
    core: CORE_DPL,
    forbidden: ['Q1701775', 'wd-Q1701775'],
  },
  acc_redef: {
    unit: 'FindingId_after_coalesce',
    multi_iff: 'Evidence[] has >=2 families (wikidata|wikipedia|openlibrary|viaf|other:apex)',
    rate: 'multi_n / findings_with_ge1_evidence_n',
    gate: 'mean(S01,S04,S05) >= 0.15',
  },
  per_seed: primary.per_seed.map((s) => ({
    id: s.id,
    seed: s.seed,
    sessionId: s.sessionId,
    status: s.status,
    findings_count: s.findings_count,
    findings_with_ge1_evidence_n: s.findings_with_ge1_evidence_n,
    multi_independent_n: s.multi_independent_n,
    multi_independent_rate: s.multi_independent_rate,
    viaf_findings_n: s.viaf_findings_n,
    families_union: s.families_union,
    acc_leak_count: s.acc_leak_count,
    b23_leak: s.contradictions_findingIds_Q1701775_hits,
    dossier_bind: s.dossier_bind,
    b0_frozen_findings: s.b0_frozen_findings,
    coverage_vs_b0: s.coverage_vs_b0,
    sample_titles: s.sample_titles,
  })),
  aggregates: pAgg,
  adversarial: primary.adversarial,
  core_smoke: {
    build: coreBuild,
    buildOk: coreBuildOk,
    assaf,
    cohen,
    smith_nocache: smithNc,
    smith_warm: smithWarm,
    core_leak: coreLeak,
    core_pw: corePw,
    core_pass: corePass,
  },
  gates: {
    multi_mean_ge_015: { result: bound1_multi, value: pAgg.mean_multi_independent_rate },
    acc_leak_eq_0: { result: pAgg.leak_pass ? 'PASS' : 'FAIL', value: pAgg.leak_total },
    s01_no_vacuum: { result: pAgg.s01_coverage_pass ? 'PASS' : 'FAIL', value: pAgg.s01_findings, b0_frozen: 10 },
    adversarial: { result: primary.adversarial?.adv_pass ? 'PASS' : 'FAIL', leak: primary.adversarial?.adv_leak_total },
    core: { result: corePass ? 'PASS' : 'FAIL' },
    b0_alias: { result: b0AliasStillAvyhr ? 'PASS' : 'FAIL', dpl: B0_DPL },
  },
  verdict: bound1_acc_verdict,
  note:
    'Bound #1 typed-keys-only: multi=0 may be expected after title-only removal. FAIL on multi gate is OK / honest. HOLD promote.',
};

writeFileSync(join(PHASE, 'ACC-AFTER-BOUND1-Fz2iq-דיוק-2026-09-20.json'), JSON.stringify(primaryJson, null, 2));

const frndabJson = {
  doc: 'ACC-AFTER-FRNDab-דיוק-2026-09-20',
  role: 'דיוק',
  phase: 'CYCLE1-PHASE4-EXPERIMENT-A2-COALESCE',
  stamp,
  ended,
  promote: 'HOLD',
  mode: 'ACC_AFTER_CAVEAT_BASELINE_NOT_PROMOTE_PATH',
  preview: FRNDAB,
  note: 'FRNDab = interim/caveat baseline only (pre-Bound1 title-coalesce). Chief promote-path = Bound#1 Fz2iq.',
  per_seed: frndab.per_seed.map((s) => ({
    id: s.id,
    seed: s.seed,
    sessionId: s.sessionId,
    status: s.status,
    findings_count: s.findings_count,
    findings_with_ge1_evidence_n: s.findings_with_ge1_evidence_n,
    multi_independent_n: s.multi_independent_n,
    multi_independent_rate: s.multi_independent_rate,
    viaf_findings_n: s.viaf_findings_n,
    families_union: s.families_union,
    acc_leak_count: s.acc_leak_count,
    b23_leak: s.contradictions_findingIds_Q1701775_hits,
    dossier_bind: s.dossier_bind,
    sample_titles: s.sample_titles,
  })),
  aggregates: frndab.aggregates,
  confirm: frndab_confirm,
  expect: { mean_multi: '0.44–0.52', s01_findings: '~18', leak: 0 },
};
writeFileSync(join(PHASE, 'ACC-AFTER-FRNDab-דיוק-2026-09-20.json'), JSON.stringify(frndabJson, null, 2));

const compare = {
  doc: 'ACC-COMPARE-A2-דיוק-2026-09-20',
  role: 'דיוק',
  stamp,
  ended,
  promote: 'HOLD',
  chief_promote_path: 'Bound#1 Fz2iq',
  frndab_role: 'interim/caveat baseline only',
  table: [
    {
      lane: 'Bound1-Fz2iq',
      dpl: PRIMARY.dpl,
      mean_multi: pAgg.mean_multi_independent_rate,
      pooled: pAgg.pooled_multi_independent_rate,
      s01_findings: pAgg.s01_findings,
      leak: pAgg.leak_total,
      multi_gate: bound1_multi,
      hard: hardPassBoth ? 'PASS' : 'FAIL',
      acc_verdict: bound1_acc_verdict,
    },
    {
      lane: 'FRNDab-caveat',
      dpl: FRNDAB.dpl,
      mean_multi: frndab.aggregates.mean_multi_independent_rate,
      pooled: frndab.aggregates.pooled_multi_independent_rate,
      s01_findings: frndab.aggregates.s01_findings,
      leak: frndab.aggregates.leak_total,
      multi_gate: frndab.aggregates.multi_gate_pass ? 'PASS' : 'FAIL',
      hard: frndab.aggregates.leak_pass ? 'PASS' : 'FAIL',
      acc_verdict: frndab_confirm,
    },
    {
      lane: 'B0',
      dpl: B0_DPL,
      mean_multi: 0.0,
      pooled: 0.0,
      s01_findings: 10,
      leak: 0,
      multi_gate: 'N/A (frozen BEFORE)',
      hard: b0AliasStillAvyhr ? 'PASS' : 'FAIL',
      acc_verdict: 'LOCKED_BEFORE',
    },
  ],
  exp_a2_acc_for_chief: bound1_acc_verdict,
  note: 'Chief Acc PASS|FAIL = Bound#1 only. FRNDab not promote-path.',
};
writeFileSync(join(PHASE, 'ACC-COMPARE-A2-דיוק-2026-09-20.json'), JSON.stringify(compare, null, 2));

function mdTableSeeds(per) {
  const lines = [
    '| Seed | Findings | With≥1 Ev | Multi_n | **Rate** | Families | VIAF | Leak | vs B0 |',
    '|------|----------|-----------|---------|----------|----------|------|------|-------|',
  ];
  for (const s of per) {
    lines.push(
      `| ${s.id} | ${s.findings_count} | ${s.findings_with_ge1_evidence_n} | ${s.multi_independent_n} | **${s.multi_independent_rate}** | ${(s.families_union || []).join(', ') || '—'} | ${s.viaf_findings_n} | ${s.acc_leak_count + (s.contradictions_findingIds_Q1701775_hits || 0)} | ${s.b0_frozen_findings ?? '—'}→${s.findings_count} |`,
    );
  }
  return lines.join('\n');
}

const primaryMd = `# ACC-AFTER Bound #1 (Fz2iq) — PRIMARY · דיוק · 2026-09-20

**Stamp:** ${stamp} → ${ended} IDT (Asia/Jerusalem, UTC+3)  
**Agent:** דיוק (Accuracy)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A2-COALESCE  
**Mode:** Acc AFTER PRIMARY · **HOLD promote** · NO Core/B0 alias mutation  
**Preview (PRIMARY):** \`${PRIMARY.dpl}\` · ${PRIMARY.url}  
**Locks:** B0 \`${B0_DPL}\` aliasStill=${b0AliasStillAvyhr} · Core \`${CORE_DPL}\` LOCKED

---

## Acc redef (frozen)

Unit = \`FindingId\` after coalesce · multi iff \`Evidence[]\` ≥2 families (\`wikidata\`≠\`wikipedia\`≠\`openlibrary\`≠\`viaf\`≠\`other:<apex>\`) · rate = multi / Findings≥1 Evidence · gate **mean(S01,S04,S05) ≥ 0.15**

## Per-seed (PRIMARY Bound #1)

${mdTableSeeds(primary.per_seed)}

- **mean multi_independent_rate:** **${pAgg.mean_multi_independent_rate}** (gate 0.15 → **${bound1_multi}**)
- **pooled (diagnostic):** ${pAgg.pooled_multi_independent_rate} (${pAgg.multi_total}/${pAgg.with_ev_total})
- **Acc leak total:** ${pAgg.leak_total}
- **S01 coverage:** ${pAgg.s01_findings} vs B0 frozen 10 · vacuum=${pAgg.s01_coverage_pass ? 'NO' : 'YES'} → **${pAgg.s01_coverage_pass ? 'PASS' : 'FAIL'}**

## Adversarial (PRIMARY)

- Smith+IBM/NY/US · inject Q1701775 / wd-Q1701775 / seed-poison
- adv_leak_total=${primary.adversarial?.adv_leak_total} · dossier=${primary.adversarial?.adv_pretty_wrong} → **${primary.adversarial?.adv_pass ? 'PASS' : 'FAIL'}**

## Core smoke (once · LOCKED 8ag)

| Case | Result | Detail |
|------|--------|--------|
| Assaf Q47507930 | ${assaf.pass ? 'PASS' : 'FAIL'} | ui=${assaf.uiState} qid=${assaf.qid} |
| כהן soft | ${cohen.pass ? 'PASS' : 'FAIL'} | ui=${cohen.uiState} faces=${cohen.faces} |
| Smith never Q1701775 | ${smithNc.pass && smithWarm.pass ? 'PASS' : 'FAIL'} | nc=${smithNc.uiState} warm=${smithWarm.uiState} |
| pw=0 / leak=0 | ${corePw === 0 && coreLeak === 0 ? 'PASS' : 'FAIL'} | pw=${corePw} leak=${coreLeak} |
| build | ${coreBuildOk ? 'PASS' : 'FAIL'} | ${coreBuild} |

**Core overall:** **${corePass ? 'PASS' : 'FAIL'}**

## Gates

| Gate | Result | Value |
|------|--------|-------|
| mean multi ≥ 0.15 | **${bound1_multi}** | ${pAgg.mean_multi_independent_rate} |
| Acc leak = 0 | **${pAgg.leak_pass ? 'PASS' : 'FAIL'}** | ${pAgg.leak_total} |
| S01 no vacuum | **${pAgg.s01_coverage_pass ? 'PASS' : 'FAIL'}** | ${pAgg.s01_findings} vs B0=10 |
| Adversarial | **${primary.adversarial?.adv_pass ? 'PASS' : 'FAIL'}** | leak=${primary.adversarial?.adv_leak_total} |
| Core / B0 | **${corePass && b0AliasStillAvyhr ? 'PASS' : 'FAIL'}** | Core ${coreBuildOk} · B0 ${b0AliasStillAvyhr} |

## Verdict (Chief promote-path = Bound #1)

# **${bound1_acc_verdict}**

**Promote: HOLD** (always — no alias retarget)

**Note:** Bound #1 removed title-only coalesce; multi≈0 may be expected when typed soft-refs do not yet intersect across families. Honest Acc FAIL on multi gate is OK.

## Paths

- \`ACC-AFTER-BOUND1-Fz2iq-דיוק-2026-09-20.md\` + \`.json\`
- raw: \`raw/acc-after-דיוק/bound1/\`
`;

writeFileSync(join(PHASE, 'ACC-AFTER-BOUND1-Fz2iq-דיוק-2026-09-20.md'), primaryMd);

const frndabMd = `# ACC-AFTER FRNDab — caveat baseline (NOT promote-path) · דיוק · 2026-09-20

**Stamp:** ${stamp} → ${ended} IDT  
**Preview:** \`${FRNDAB.dpl}\` · ${FRNDAB.url}  
**Role:** interim/caveat baseline only · **Chief promote-path = Bound #1 Fz2iq**  
**Promote:** **HOLD**

## Per-seed

${mdTableSeeds(frndab.per_seed)}

- **mean:** **${frndab.aggregates.mean_multi_independent_rate}** (expect ~0.44–0.52)
- **pooled:** ${frndab.aggregates.pooled_multi_independent_rate}
- **leak:** ${frndab.aggregates.leak_total}
- **S01 findings:** ${frndab.aggregates.s01_findings} (expect ~18)

## Confirm

# **${frndab_confirm}**

## Paths

- \`ACC-AFTER-FRNDab-דיוק-2026-09-20.md\` + \`.json\`
- raw: \`raw/acc-after-דיוק/frndab/\`
`;
writeFileSync(join(PHASE, 'ACC-AFTER-FRNDab-דיוק-2026-09-20.md'), frndabMd);

const compareMd = `# ACC-COMPARE-A2 · דיוק · 2026-09-20

**Stamp:** ${stamp} → ${ended} IDT  
**Promote:** **HOLD**  
**Chief promote-path:** Bound #1 \`dpl_Fz2iq…\` only  
**FRNDab:** interim/caveat baseline (not promote-path)

## Table

| Lane | dpl | mean multi | pooled | S01 findings | leak | multi gate | hard | Acc |
|------|-----|------------|--------|--------------|------|------------|------|-----|
| **Bound1-Fz2iq (PRIMARY)** | \`${PRIMARY.dpl}\` | **${pAgg.mean_multi_independent_rate}** | ${pAgg.pooled_multi_independent_rate} | ${pAgg.s01_findings} | ${pAgg.leak_total} | **${bound1_multi}** | ${hardPassBoth ? 'PASS' : 'FAIL'} | **${bound1_acc_verdict}** |
| FRNDab (caveat) | \`${FRNDAB.dpl}\` | ${frndab.aggregates.mean_multi_independent_rate} | ${frndab.aggregates.pooled_multi_independent_rate} | ${frndab.aggregates.s01_findings} | ${frndab.aggregates.leak_total} | ${frndab.aggregates.multi_gate_pass ? 'PASS' : 'FAIL'} | ${frndab.aggregates.leak_pass ? 'PASS' : 'FAIL'} | ${frndab_confirm} |
| B0 (frozen BEFORE) | \`${B0_DPL}\` | 0.0 | 0.0 | 10 | 0 | N/A | ${b0AliasStillAvyhr ? 'PASS' : 'FAIL'} | LOCKED |

## EXP-A2 Acc for Chief

# **${bound1_acc_verdict}** on Bound #1

Hard gates (leak/PW/Core/B0): **${hardPassBoth ? 'PASS' : 'FAIL'}** on measured surfaces · multi gate Bound#1: **${bound1_multi}** (${pAgg.mean_multi_independent_rate}) · S01 coverage: **${pAgg.s01_coverage_pass ? 'PASS' : 'FAIL'}** (${pAgg.s01_findings})

**HOLD promote** always.
`;
writeFileSync(join(PHASE, 'ACC-COMPARE-A2-דיוק-2026-09-20.md'), compareMd);

const statusMd = `# STATUS — דיוק · CYCLE1 PHASE4 EXP-A2 COALESCE · Acc AFTER Bound #1

**Stamp:** ${ended} IDT (Asia/Jerusalem, UTC+3)  
**Agent:** דיוק (Accuracy)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A2-COALESCE

## State

| Item | Value |
|------|-------|
| PRIMARY Preview | \`${PRIMARY.dpl}\` Bound #1 |
| Acc AFTER Bound#1 | **${bound1_acc_verdict}** · mean multi **${pAgg.mean_multi_independent_rate}** · leak **${pAgg.leak_total}** · S01 **${pAgg.s01_findings}** |
| FRNDab caveat | ${frndab_confirm} · mean **${frndab.aggregates.mean_multi_independent_rate}** |
| Promote | **HOLD** |
| Core \`${CORE_DPL}\` | **LOCKED** · smoke **${corePass ? 'PASS' : 'FAIL'}** |
| Discovery B0 \`${B0_DPL}\` | **LOCKED / unchanged** · aliasStill=${b0AliasStillAvyhr} |

## Gates (Bound #1 Chief)

| Gate | Result |
|------|--------|
| mean multi ≥ 0.15 | **${bound1_multi}** (${pAgg.mean_multi_independent_rate}) |
| Acc leak = 0 | **${pAgg.leak_pass ? 'PASS' : 'FAIL'}** |
| S01 no vacuum | **${pAgg.s01_coverage_pass ? 'PASS' : 'FAIL'}** (${pAgg.s01_findings}) |
| Adversarial / Core / B0 | **${(primary.adversarial?.adv_pass && corePass && b0AliasStillAvyhr) ? 'PASS' : 'FAIL'}** |

## Deliverables

1. \`ACC-AFTER-BOUND1-Fz2iq-דיוק-2026-09-20.md\` + \`.json\` (PRIMARY verdict)
2. \`ACC-AFTER-FRNDab-דיוק-2026-09-20.md\` + \`.json\` (caveat confirm)
3. \`ACC-COMPARE-A2-דיוק-2026-09-20.md\` (+ \`.json\`)
4. \`STATUS-דיוק.md\` (this file)
5. raw: \`raw/acc-after-דיוק/\`

## Note

Bound #1 typed-keys-only — multi=0 after title-only removal is expected; Acc FAIL on multi gate is honest. **HOLD** promote.
`;
writeFileSync(join(PHASE, 'STATUS-דיוק.md'), statusMd);

console.log('\n========== SUMMARY ==========');
console.log(`Bound1 mean=${pAgg.mean_multi_independent_rate} multi_gate=${bound1_multi} leak=${pAgg.leak_total} S01=${pAgg.s01_findings} VERDICT=${bound1_acc_verdict}`);
console.log(`FRNDab mean=${frndab.aggregates.mean_multi_independent_rate} confirm=${frndab_confirm}`);
console.log(`Core=${corePass} B0alias=${b0AliasStillAvyhr} HOLD`);
console.log('DONE');
