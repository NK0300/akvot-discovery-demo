#!/usr/bin/env node
/**
 * EXP-A2-safe · בודק Evidence Pack QA · A2-safe vs B0 + Core + comparison matrix
 * Acc redef: wikidata ≠ wikipedia ≠ openlibrary ≠ viaf ≠ other:<apex>
 * rate = multi_n / findings_with_ge1_evidence
 * Gate mean(S01,S04,S05) ≥ 0.15 · Acc leak = 0 · S01 no vacuum vs B0
 * HOLD promote · Core LOCKED
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACK = '/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-EVIDENCE-PACK';
const COALESCE = '/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-COALESCE';
const PHASE = PACK;
const RAW = join(PACK, '09-RAW-REPRESENTATIVE', 'qa-a2safe');
const RAW2 = join(PACK, 'raw', 'qa-a2safe');
const CORE_RAW = join(PACK, 'raw', 'core');
mkdirSync(RAW, { recursive: true });
mkdirSync(RAW2, { recursive: true });
mkdirSync(CORE_RAW, { recursive: true });

function writeRaw(name, data) {
  const s = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  writeFileSync(join(RAW, name), s);
  writeFileSync(join(RAW2, name), s);
}

const PREVIEW_DPL = 'dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9';
const PREVIEW_URL = 'https://akvot-simple-demo-mcqip894c-k-akvot.vercel.app';
const B0_DPL = 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const B0_ALIAS = 'https://akvot-discovery.vercel.app';
const CORE_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const CORE_BASE = 'https://akvot-simple-demo.vercel.app';
const SCOPE = 'k-akvot';
const ROOT = '/workspace/akvot-quick-demo';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const MULTI_THRESHOLD = 0.15;

const SEEDS = [
  { id: 'S01', seed: 'Tim Berners-Lee', category: 'person' },
  { id: 'S04', seed: 'Stripe', category: 'company' },
  { id: 'S05', seed: 'Red Cross', category: 'organization' },
];

const B0_FROZEN = {
  S01: { multi_independent_rate: 0.0, findings_count: 10, acc_leak: 0 },
  S04: { multi_independent_rate: 0.0, findings_count: 14, acc_leak: 0 },
  S05: { multi_independent_rate: 0.0, findings_count: 6, acc_leak: 0 },
  mean: 0.0,
  leak_total: 0,
};


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

function facesCount(j) {
  if (Array.isArray(j?.images)) return j.images.length;
  if (typeof j?.faces === 'number') return j.faces;
  if (j?.faces === false) return 0;
  if (j?.faces === true) return 1;
  if (Array.isArray(j?.faces)) return j.faces.length;
  return 0;
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
  return { json, ms, stderr: r.stderr || '', status: r.status, raw: stdout.slice(0, 4000) };
}

/** Acc redef family map: wikidata ≠ wikipedia ≠ openlibrary ≠ viaf ≠ other:<apex> */
function providerFamily(ev) {
  const providerId = String(ev?.providerId || '').toLowerCase();
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
  if (host.includes('wikidata')) return 'wikidata';
  if (host.includes('wikipedia') || (host.includes('wikimedia') && !host.includes('wikidata')))
    return 'wikipedia';
  if (host.includes('openlibrary')) return 'openlibrary';
  if (host.includes('viaf')) return 'viaf';
  const parts = host.split('.').filter(Boolean);
  const apex = parts.length >= 2 ? parts.slice(-2).join('.') : host;
  return `other:${apex}`;
}

function analyzeSnapshot(snap) {
  const findings = Array.isArray(snap?.findings) ? snap.findings : [];
  const evidence = Array.isArray(snap?.evidence) ? snap.evidence : [];
  const evById = new Map(evidence.map((e) => [e.id, e]));
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
    // Acc redef: unit is Evidence[] families; do not invent from providers[] alone
    // but if evidenceIds empty and providers present, still no Evidence → exclude from denom
    const hostFamilies = [...fams].sort();
    const hasEv = eids.length >= 1 && hostFamilies.length >= 1;
    if (!hasEv && eids.length === 0) {
      rows.push({
        id: f.id,
        title: String(f.title || '').slice(0, 80),
        providers: f.providers || [],
        evidenceCount: 0,
        hostFamilies: [],
        multi_independent: false,
        in_denominator: false,
      });
      continue;
    }
    // findings with evidenceIds but unresolved → still count if we got families; else if eids>=1 count denom with fams from resolved only
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
    }
  }

  const rate = with_ev_n ? multi_n / with_ev_n : 0;
  const text = JSON.stringify(snap);
  const acc_leak_count = (text.match(FORBIDDEN_RE) || []).length;
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
    acc_leak_count,
    corroborationEdges_n: Array.isArray(snap?.corroborationEdges) ? snap.corroborationEdges.length : 0,
    facet_multi_n: rows.filter((r) => r.facetMulti).length,
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runSeed(label, deployment, seedObj) {
  const create = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body: { seed: seedObj.seed, locale: 'en' },
    deployment,
  });
  writeRaw(`${label}-${seedObj.id}-create.json`, create.json || { raw: create.raw, stderr: create.stderr });
  const sessionId = create.json?.sessionId || create.json?.snapshot?.sessionId;
  if (!sessionId) {
    return {
      id: seedObj.id,
      seed: seedObj.seed,
      error: 'no sessionId',
      create_ms: create.ms,
      raw: create.raw.slice(0, 500),
      findings_count: 0,
      findings_with_ge1_evidence_n: 0,
      multi_independent_n: 0,
      multi_independent_rate: 0,
      acc_leak_count: 0,
    };
  }
  let final = create.json?.snapshot || null;
  let status = create.json?.status || final?.status;
  for (let i = 0; i < 10 && status && !['complete', 'partial', 'failed_soft'].includes(status); i++) {
    await sleep(2000);
    const get = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`, { deployment });
    writeRaw(`${label}-${seedObj.id}-poll${i}.json`, get.json || {});
    if (get.json?.snapshot) final = get.json.snapshot;
    else if (get.json?.findings) final = get.json;
    status = get.json?.status || final?.status || status;
  }
  const getFinal = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`, { deployment });
  writeRaw(`${label}-${seedObj.id}-final.json`, getFinal.json || {});
  const snap = getFinal.json?.snapshot || getFinal.json || final;
  const metrics = analyzeSnapshot(snap);
  return {
    id: seedObj.id,
    seed: seedObj.seed,
    category: seedObj.category,
    sessionId,
    status: getFinal.json?.status || status,
    create_ms: create.ms,
    ...metrics,
  };
}

function mean(nums) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

const stamp = nowJerusalem();
console.log('בודק QA-AFTER-vs-B0', stamp);
console.log('Preview', PREVIEW_DPL, PREVIEW_URL);
console.log('B0', B0_DPL, B0_ALIAS);
console.log('Core LOCKED', CORE_DPL);
console.log('HOLD promote');

const previewRows = [];
for (const s of SEEDS) {
  console.log('PREVIEW', s.id, s.seed, '...');
  const row = await runSeed('PREVIEW', PREVIEW_DPL, s);
  previewRows.push(row);
  console.log(
    `  findings=${row.findings_count} withEv=${row.findings_with_ge1_evidence_n} multi=${row.multi_independent_n}/${row.findings_with_ge1_evidence_n}=${row.multi_independent_rate} viaf=${row.viaf_findings_n} leak=${row.acc_leak_count} fams=${JSON.stringify(row.families_union)}`,
  );
}

const b0Rows = [];
for (const s of SEEDS) {
  console.log('B0', s.id, s.seed, '...');
  const row = await runSeed('B0', B0_DPL, s);
  b0Rows.push(row);
  console.log(
    `  findings=${row.findings_count} withEv=${row.findings_with_ge1_evidence_n} multi=${row.multi_independent_n}/${row.findings_with_ge1_evidence_n}=${row.multi_independent_rate} viaf=${row.viaf_findings_n} leak=${row.acc_leak_count} fams=${JSON.stringify(row.families_union)}`,
  );
}

const preview_mean = mean(previewRows.map((r) => r.multi_independent_rate || 0));
const b0_live_mean = mean(b0Rows.map((r) => r.multi_independent_rate || 0));
const preview_pooled_n = previewRows.reduce((a, r) => a + (r.multi_independent_n || 0), 0);
const preview_pooled_den = previewRows.reduce((a, r) => a + (r.findings_with_ge1_evidence_n || 0), 0);
const preview_pooled = preview_pooled_den ? preview_pooled_n / preview_pooled_den : 0;
const leak_preview = previewRows.reduce((a, r) => a + (r.acc_leak_count || 0), 0);
const leak_b0 = b0Rows.reduce((a, r) => a + (r.acc_leak_count || 0), 0);
const leak_total = leak_preview + leak_b0;

const s01p = previewRows.find((r) => r.id === 'S01');
const s01b = b0Rows.find((r) => r.id === 'S01');
const s01_b0_frozen = B0_FROZEN.S01.findings_count;
const s01_preview = s01p?.findings_count ?? 0;
const no_vacuum =
  s01_preview >= 5 &&
  !(s01_b0_frozen >= 8 && s01_preview <= 2) &&
  !(s01_preview < s01_b0_frozen * 0.3);

const multiPass = preview_mean >= MULTI_THRESHOLD;
const leakPass = leak_total === 0;

const overallDiscovery = multiPass && leakPass && no_vacuum;

// --- Core smoke LOCKED 8ag ---
console.log('[core] smoke LOCKED', CORE_DPL);
const coreHealth = publicCurl(`${CORE_BASE}/api/health`);
writeFileSync(join(CORE_RAW, 'health-public.json'), JSON.stringify(coreHealth.json || { text: coreHealth.text }, null, 2));
const coreHealthVc = vercelCurl('/api/health', { deployment: CORE_DPL });
writeFileSync(join(CORE_RAW, 'health-vercel.json'), JSON.stringify(coreHealthVc.json || {}, null, 2));
const coreBuild = coreHealth.json?.build || coreHealthVc.json?.build || null;
const coreBuildOk = coreBuild === CORE_DPL;

const assafReq = publicCurl(`${CORE_BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}&nocache=1`);
writeFileSync(join(CORE_RAW, 'assaf.json'), JSON.stringify(assafReq.json || { text: assafReq.text }, null, 2));
const assaf = analyzeCore('assaf', assafReq);
assaf.pass = assaf.uiState === 'dossier' && assaf.qid === 'Q47507930' && assaf.leakage === 0;

const cohenReq = publicCurl(`${CORE_BASE}/api/lookup?q=${encodeURIComponent('כהן')}&nocache=1`);
writeFileSync(join(CORE_RAW, 'cohen.json'), JSON.stringify(cohenReq.json || { text: cohenReq.text }, null, 2));
const cohen = analyzeCore('cohen', cohenReq);
cohen.pass =
  ['need_context', 'thin', 'candidates'].includes(cohen.uiState) &&
  cohen.faces === 0 &&
  cohen.leakage === 0 &&
  cohen.qid !== 'Q1701775';

const smithBody = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };
const smithNcReq = publicCurl(`${CORE_BASE}/api/lookup`, { method: 'POST', body: { ...smithBody, nocache: 1 } });
writeFileSync(join(CORE_RAW, 'smith-nocache.json'), JSON.stringify(smithNcReq.json || { text: smithNcReq.text }, null, 2));
const smithNc = analyzeCore('smith-nocache', smithNcReq);
smithNc.pass =
  ['candidates', 'thin', 'need_context'].includes(smithNc.uiState) &&
  smithNc.leakage === 0 &&
  smithNc.qid !== 'Q1701775' &&
  !String(smithNc.qid || '').includes('1701775') &&
  smithNc.faces === 0;

const smithWarmReq = publicCurl(`${CORE_BASE}/api/lookup`, { method: 'POST', body: smithBody });
writeFileSync(join(CORE_RAW, 'smith-warm.json'), JSON.stringify(smithWarmReq.json || { text: smithWarmReq.text }, null, 2));
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
console.log(
  `  Assaf=${assaf.pass} כהן=${cohen.pass} smithNc=${smithNc.pass} smithWarm=${smithWarm.pass} build=${coreBuild} pw=${corePw} leak=${coreLeak} corePass=${corePass}`,
);

const overall = overallDiscovery && corePass;
const finished = nowJerusalem();
const a2_mean = Math.round(preview_mean * 10000) / 10000;
const a2_pooled = Math.round(preview_pooled * 10000) / 10000;
const a2_findings = previewRows.reduce((a, r) => a + (r.findings_count || 0), 0);
const a2_with_ev = preview_pooled_den;
const a2_evidence = previewRows.reduce((a, r) => a + (r.evidence_count || 0), 0);
const a2_viaf = previewRows.reduce((a, r) => a + (r.viaf_findings_n || 0), 0);
const a2_contr = previewRows.reduce((a, r) => a + (r.contradictions_n || 0), 0);
const a2_fams = [...new Set(previewRows.flatMap((r) => r.families_union || []))].sort();
const s01rate = previewRows.find((r) => r.id === 'S01')?.multi_independent_rate ?? null;
const s04rate = previewRows.find((r) => r.id === 'S04')?.multi_independent_rate ?? null;
const s05rate = previewRows.find((r) => r.id === 'S05')?.multi_independent_rate ?? null;

const PRIOR = {
  B0: {
    mean_multi: 0.0,
    pooled_multi: 0.0,
    per_seed: { S01: 0.0, S04: 0.0, S05: 0.0 },
    findings_total: 30,
    relevant_findings: 30,
    evidence_coverage: 'Acc BEFORE sticky — Findings had Evidence (Phase2)',
    source_diversity: '3 families (no viaf)',
    acc_leak: 0,
    pretty_wrong: false,
    false_merge: 'N/A — observation baseline',
    source: 'PHASE4-EXPERIMENT-A-VIAF/ACC-B0-BEFORE-S01-S04-S05-דיוק-2026-09-20.md',
  },
  A_VIAF: {
    dpl: 'dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU',
    mean_multi: 0.0,
    pooled_multi: 0.0,
    per_seed: { S01: 0, S04: 0, S05: 0 },
    findings_total: 78,
    relevant_findings: 78,
    viaf_findings_n: 24,
    evidence_coverage: 'N/A separately published; Acc unit=Finding multi=0',
    source_diversity: 'session union includes viaf; per-Finding multi=0',
    acc_leak: 0,
    pretty_wrong: false,
    false_merge: 'N/A — דיוק owns adversarial; EXP-A Acc adv_pass=true',
    source: 'PHASE4-EXPERIMENT-A-VIAF/ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.md',
  },
  FRNDab: {
    dpl: 'dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2',
    mean_multi: 0.5189,
    pooled_multi: 0.4675,
    per_seed: { S01: 0.8235, S04: 0.3333, S05: 0.4 },
    findings_total: 77,
    relevant_findings: 77,
    evidence_coverage: '77/77 with ≥1 Evidence',
    source_diversity: '4 families',
    acc_leak: 0,
    pretty_wrong: false,
    false_merge: 'N/A — דיוק owns adversarial; title-bridge caveat by ARCH',
    qa_mean_prior: 0.4414,
    source: 'PHASE4-EXPERIMENT-A2-COALESCE/ACC-AFTER-FRNDab-דיוק-2026-09-20.md (+ QA 0.4414)',
  },
  Bound1: {
    dpl: 'dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw',
    mean_multi: 0,
    pooled_multi: 0,
    per_seed: { S01: 0, S04: 0, S05: 0 },
    findings_total: 78,
    relevant_findings: 78,
    evidence_coverage: '78/78 with ≥1 Evidence',
    source_diversity: '4 families at session; per-Finding multi=0',
    acc_leak: 0,
    pretty_wrong: false,
    false_merge: 'N/A — דיוק adversarial PASS (leak=0)',
    source: 'PHASE4-EXPERIMENT-A2-COALESCE/ACC-AFTER-BOUND1-Fz2iq-דיוק-2026-09-20.md',
  },
};

const qaJson = {
  doc: '07-QA-בודק-2026-09-20',
  role: 'בודק',
  stamp,
  finished,
  zone: 'Asia/Jerusalem',
  experiment: 'EXP-A2-SAFE',
  mode: 'GOLDEN_SMOKE_A2SAFE_VS_B0_PLUS_CORE',
  promote: 'HOLD',
  aliasesUntouched: true,
  coreLocked: true,
  preview: { dpl: PREVIEW_DPL, url: PREVIEW_URL, label: 'A2-safe typed enrich (canonical NOW)' },
  b0: { dpl: B0_DPL, alias: B0_ALIAS },
  core: { dpl: CORE_DPL, alias: CORE_BASE },
  metric: {
    name: 'multi_independent_rate',
    redef: 'ACC-MULTI-INDEPENDENT-REDEF-דיוק-2026-09-20',
    unit: 'FindingId_after_coalesce',
    predicate: 'Evidence[] has >=2 distinct provider families',
    families: ['wikidata', 'wikipedia', 'openlibrary', 'viaf', 'other:<apex>'],
    rate_formula: 'multi_n / findings_with_ge1_evidence_n',
    aggregation: 'mean(S01,S04,S05)',
    threshold: MULTI_THRESHOLD,
  },
  seeds: SEEDS,
  b0_frozen_acc: B0_FROZEN,
  server_smoke_claim_mean: 0.2408,
  note_independent_remeasure: 'שרת smoke claimed mean 0.2408 — this run independently re-measured live',
  after_A2SAFE: {
    mean_multi_independent_rate: a2_mean,
    pooled_multi_independent_rate: a2_pooled,
    pooled_n: `${preview_pooled_n}/${preview_pooled_den}`,
    findings_total: a2_findings,
    evidence_total: a2_evidence,
    viaf_findings_n: a2_viaf,
    families_union: a2_fams,
    contradictions_n: a2_contr,
    perSeed: Object.fromEntries(
      previewRows.map((r) => [
        r.id,
        {
          seed: r.seed,
          rate: r.multi_independent_rate,
          findings_count: r.findings_count,
          findings_with_ge1_evidence_n: r.findings_with_ge1_evidence_n,
          multi_n: r.multi_independent_n,
          evidence_count: r.evidence_count,
          families: r.families_union,
          viaf: (r.viaf_findings_n || 0) > 0,
          viaf_n: r.viaf_findings_n,
          acc_leak: r.acc_leak_count,
          status: r.status,
          sessionId: r.sessionId,
          sample_multi: r.sample_multi,
          sample_titles: r.sample_titles,
          error: r.error || null,
        },
      ]),
    ),
  },
  before_B0_live: {
    mean_multi_independent_rate: Math.round(b0_live_mean * 10000) / 10000,
    perSeed: Object.fromEntries(
      b0Rows.map((r) => [
        r.id,
        {
          seed: r.seed,
          rate: r.multi_independent_rate,
          findings_count: r.findings_count,
          findings_with_ge1_evidence_n: r.findings_with_ge1_evidence_n,
          multi_n: r.multi_independent_n,
          families: r.families_union,
          viaf: (r.viaf_findings_n || 0) > 0,
          acc_leak: r.acc_leak_count,
          status: r.status,
          sessionId: r.sessionId,
          error: r.error || null,
        },
      ]),
    ),
  },
  acc_leak: {
    forbidden: ['Q1701775', 'wd-Q1701775', 'wd_Q1701775'],
    a2safe_total: leak_preview,
    b0_total: leak_b0,
    core_total: coreLeak,
    discovery_total: leak_total,
    total_including_core: leak_total + coreLeak,
  },
  coverage_watch: {
    S01_b0_frozen_findings: s01_b0_frozen,
    S01_b0_live_findings: s01b?.findings_count ?? null,
    S01_a2safe_findings: s01_preview,
    no_vacuum_collapse: no_vacuum,
  },
  core_smoke: {
    build: coreBuild,
    buildOk: coreBuildOk,
    alias: CORE_BASE,
    expected_dpl: CORE_DPL,
    assaf,
    cohen,
    smith_nocache: smithNc,
    smith_warm: smithWarm,
    pw_total: corePw,
    leak_total: coreLeak,
    pass: corePass,
  },
  gates: {
    multi_independent_mean: multiPass ? 'PASS' : 'FAIL',
    multi_mean_value: a2_mean,
    threshold: MULTI_THRESHOLD,
    acc_leak: leakPass && coreLeak === 0 ? 'PASS' : 'FAIL',
    coverage_no_vacuum: no_vacuum ? 'PASS' : 'FAIL',
    core_smoke: corePass ? 'PASS' : 'FAIL',
  },
  overall: overall ? 'PASS' : 'FAIL',
  pass: overall,
  promote_decision: 'HOLD',
  raw_dirs: ['09-RAW-REPRESENTATIVE/qa-a2safe/', 'raw/qa-a2safe/', 'raw/core/'],
  previewRows,
  b0Rows,
};

writeFileSync(join(PACK, '07-QA-בודק-2026-09-20.json'), JSON.stringify(qaJson, null, 2));

const qaMd = `# 07-QA · בודק · EXP-A2-safe Evidence Pack · 2026-09-20

**Role:** בודק (QA)  
**Stamp:** ${stamp} → ${finished} (Asia/Jerusalem / IDT)  
**Promote:** **HOLD**  
**Core:** LOCKED \`${CORE_DPL}\` · Assaf/כהן/Smith  
**Aliases:** untouched (\`${B0_ALIAS}\` stays B0 · Core stays 8ag)

## Targets

| Lane | Deployment | URL |
|------|------------|-----|
| **A2-safe (canonical NOW)** | \`${PREVIEW_DPL}\` | ${PREVIEW_URL} |
| **B0** | \`${B0_DPL}\` | ${B0_ALIAS} |
| **Core LOCKED** | \`${CORE_DPL}\` | ${CORE_BASE} |

## Metric (Acc redef)

- **Unit:** FindingId after coalesce  
- **multi_independent:** Evidence[] has **≥2** distinct provider families  
- **Families:** \`wikidata\` ≠ \`wikipedia\` ≠ \`openlibrary\` ≠ \`viaf\` ≠ \`other:<apex>\` (lang Wikipedia mirrors = one family)  
- **Rate:** multi_n / findings_with_≥1_Evidence  
- **Gate:** mean(S01, S04, S05) **≥ ${MULTI_THRESHOLD}** · Acc leak **= 0** · S01 no vacuum vs B0 frozen findings=10

## Live A2-safe golden results (independent re-measure)

| Seed | Findings | With ≥1 Ev | Multi_n | **Rate** | Families | VIAF | Leak |
|------|----------|------------|---------|----------|----------|------|------|
${previewRows
  .map(
    (r) =>
      `| ${r.id} | ${r.findings_count} | ${r.findings_with_ge1_evidence_n} | ${r.multi_independent_n} | **${r.multi_independent_rate}** | ${(r.families_union || []).join(', ') || '—'} | ${(r.viaf_findings_n || 0) > 0 ? 'Y' : 'N'} | ${r.acc_leak_count} |`,
  )
  .join('\n')}

- **mean multi_independent_rate:** **${a2_mean.toFixed(4)}**  
- **pooled (diagnostic):** ${a2_pooled.toFixed(4)} (${preview_pooled_n}/${preview_pooled_den})  
- **שרת prior claim:** 0.2408 (smoke) — **this is independent live QA**, not a copy

## B0 live (re-measure)

| Seed | Findings | With ≥1 Ev | Multi_n | Rate | Families | Leak |
|------|----------|------------|---------|------|----------|------|
${b0Rows
  .map(
    (r) =>
      `| ${r.id} | ${r.findings_count} | ${r.findings_with_ge1_evidence_n} | ${r.multi_independent_n} | ${r.multi_independent_rate} | ${(r.families_union || []).join(', ') || '—'} | ${r.acc_leak_count} |`,
  )
  .join('\n')}

- **mean (live B0):** ${(Math.round(b0_live_mean * 10000) / 10000).toFixed(4)}

## Coverage watch (S01)

| | Findings |
|--|----------|
| B0 frozen | ${s01_b0_frozen} |
| B0 live | ${s01b?.findings_count ?? '—'} |
| A2-safe | **${s01_preview}** |
| No vacuum | **${no_vacuum ? 'PASS' : 'FAIL'}** |

## Acc leak

- Forbidden: Q1701775 / wd-Q1701775  
- A2-safe: ${leak_preview} · B0: ${leak_b0} · Core: ${coreLeak} · **Discovery total: ${leak_total}** → **${leakPass ? 'PASS' : 'FAIL'}**

## Core smoke (LOCKED)

| Case | Result | Detail |
|------|--------|--------|
| Assaf Q47507930 | ${assaf.pass ? 'PASS' : 'FAIL'} | ui=${assaf.uiState} qid=${assaf.qid} |
| כהן soft | ${cohen.pass ? 'PASS' : 'FAIL'} | ui=${cohen.uiState} faces=${cohen.faces} |
| Smith never Q1701775 (nocache) | ${smithNc.pass ? 'PASS' : 'FAIL'} | ui=${smithNc.uiState} |
| Smith warm | ${smithWarm.pass ? 'PASS' : 'FAIL'} | ui=${smithWarm.uiState} |
| pw=0 / leak=0 | ${corePw === 0 && coreLeak === 0 ? 'PASS' : 'FAIL'} | pw=${corePw} leak=${coreLeak} |
| alias → dpl_8ag | ${coreBuildOk ? 'PASS' : 'FAIL'} | build=\`${coreBuild}\` |

**Core overall:** **${corePass ? 'PASS' : 'FAIL'}**

## Gates

| Gate | Result | Value |
|------|--------|-------|
| mean multi ≥ ${MULTI_THRESHOLD} | **${multiPass ? 'PASS' : 'FAIL'}** | ${a2_mean} |
| Acc leak = 0 | **${leakPass && coreLeak === 0 ? 'PASS' : 'FAIL'}** | discovery=${leak_total} core=${coreLeak} |
| S01 no vacuum | **${no_vacuum ? 'PASS' : 'FAIL'}** | A2-safe ${s01_preview} vs B0 frozen ${s01_b0_frozen} |
| Core smoke | **${corePass ? 'PASS' : 'FAIL'}** | build 8ag · pw=${corePw} · leak=${coreLeak} |

## Overall

# **${overall ? 'PASS' : 'FAIL'}**

**Promote: HOLD** (explicit — no alias retarget, no Core touch, no --prod)

## Raw paths

- \`09-RAW-REPRESENTATIVE/qa-a2safe/\` (mirrored under \`raw/qa-a2safe/\`)
- \`raw/core/\`
- Script: \`scripts/qa-a2safe-vs-matrix-בודק.mjs\`

## Method

\`vercel curl --deployment <dpl> --scope k-akvot\` from \`/workspace/akvot-quick-demo\`  
POST \`/api/discovery/sessions\` → poll until complete/partial → score Acc redef on snapshot.  
Core: public curl to \`${CORE_BASE}/api/lookup\` + \`/api/health\`.
`;

writeFileSync(join(PACK, '07-QA-בודק-2026-09-20.md'), qaMd);
writeFileSync(join(COALESCE, 'QA-A2SAFE-vs-B0-בודק-2026-09-20.md'), qaMd);
writeFileSync(join(COALESCE, 'QA-A2SAFE-vs-B0-בודק-2026-09-20.json'), JSON.stringify(qaJson, null, 2));

const matrixJson = {
  doc: '08-COMPARISON-METRICS-בודק-2026-09-20',
  role: 'בודק',
  stamp,
  finished,
  zone: 'Asia/Jerusalem',
  promote: 'HOLD',
  columns: {
    B0: { dpl: B0_DPL, source: PRIOR.B0.source },
    A_VIAF_no_coalesce: { dpl: PRIOR.A_VIAF.dpl, source: PRIOR.A_VIAF.source },
    A2_bound_FRNDab: { dpl: PRIOR.FRNDab.dpl, source: PRIOR.FRNDab.source, caveat: 'title-bridge NON-promote' },
    A2_safe_7MmfP: { dpl: PREVIEW_DPL, source: '07-QA-בודק-2026-09-20 (this live run)' },
    Bound1_Fz2iq_footnote: { dpl: PRIOR.Bound1.dpl, source: PRIOR.Bound1.source, note: 'extra column · multi=0 expected' },
  },
  rows: {
    multi_independent_mean: {
      B0: PRIOR.B0.mean_multi,
      A: PRIOR.A_VIAF.mean_multi,
      A2_bound_FRNDab: PRIOR.FRNDab.mean_multi,
      A2_safe_7MmfP: a2_mean,
      Bound1_Fz2iq: PRIOR.Bound1.mean_multi,
    },
    multi_independent_pooled: {
      B0: PRIOR.B0.pooled_multi,
      A: PRIOR.A_VIAF.pooled_multi,
      A2_bound_FRNDab: PRIOR.FRNDab.pooled_multi,
      A2_safe_7MmfP: a2_pooled,
      Bound1_Fz2iq: PRIOR.Bound1.pooled_multi,
    },
    multi_independent_per_seed: {
      B0: PRIOR.B0.per_seed,
      A: PRIOR.A_VIAF.per_seed,
      A2_bound_FRNDab: PRIOR.FRNDab.per_seed,
      A2_safe_7MmfP: { S01: s01rate, S04: s04rate, S05: s05rate },
      Bound1_Fz2iq: PRIOR.Bound1.per_seed,
    },
    false_merge: {
      B0: PRIOR.B0.false_merge,
      A: PRIOR.A_VIAF.false_merge,
      A2_bound_FRNDab: PRIOR.FRNDab.false_merge,
      A2_safe_7MmfP: 'N/A — דיוק owns adversarial false-merge; not re-run in this QA lane',
      Bound1_Fz2iq: PRIOR.Bound1.false_merge,
    },
    evidence_coverage: {
      B0: PRIOR.B0.evidence_coverage,
      A: PRIOR.A_VIAF.evidence_coverage,
      A2_bound_FRNDab: PRIOR.FRNDab.evidence_coverage,
      A2_safe_7MmfP: `${a2_with_ev}/${a2_findings} findings with ≥1 Evidence · evidence_total=${a2_evidence}`,
      Bound1_Fz2iq: PRIOR.Bound1.evidence_coverage,
    },
    source_diversity: {
      B0: PRIOR.B0.source_diversity,
      A: PRIOR.A_VIAF.source_diversity,
      A2_bound_FRNDab: PRIOR.FRNDab.source_diversity,
      A2_safe_7MmfP: `families_union=[${a2_fams.join(', ')}] · n=${a2_fams.length}`,
      Bound1_Fz2iq: PRIOR.Bound1.source_diversity,
    },
    relevant_findings: {
      B0: PRIOR.B0.relevant_findings,
      A: PRIOR.A_VIAF.relevant_findings,
      A2_bound_FRNDab: PRIOR.FRNDab.relevant_findings,
      A2_safe_7MmfP: a2_findings,
      Bound1_Fz2iq: PRIOR.Bound1.relevant_findings,
    },
    contradictions: {
      B0: 'Q1701775 hits=0',
      A: 'Q1701775 hits=0',
      A2_bound_FRNDab: 'Q1701775 hits=0',
      A2_safe_7MmfP: `contradictions_n=${a2_contr}`,
      Bound1_Fz2iq: 'Q1701775 hits=0',
    },
    acc_leakage: {
      B0: PRIOR.B0.acc_leak,
      A: PRIOR.A_VIAF.acc_leak,
      A2_bound_FRNDab: PRIOR.FRNDab.acc_leak,
      A2_safe_7MmfP: leak_preview,
      Bound1_Fz2iq: PRIOR.Bound1.acc_leak,
    },
    pretty_wrong: {
      B0: PRIOR.B0.pretty_wrong,
      A: PRIOR.A_VIAF.pretty_wrong,
      A2_bound_FRNDab: PRIOR.FRNDab.pretty_wrong,
      A2_safe_7MmfP: `Core pw=${corePw} (discovery golden N/A)`,
      Bound1_Fz2iq: PRIOR.Bound1.pretty_wrong,
    },
  },
  a2safe_live: {
    mean: a2_mean,
    pooled: a2_pooled,
    per_seed: { S01: s01rate, S04: s04rate, S05: s05rate },
    leak: leak_preview,
    core_pw: corePw,
    core_leak: coreLeak,
  },
  sources_cited: [PRIOR.B0.source, PRIOR.A_VIAF.source, PRIOR.FRNDab.source, PRIOR.Bound1.source, '07-QA-בודק-2026-09-20 (live)'],
};

writeFileSync(join(PACK, '08-COMPARISON-METRICS-בודק-2026-09-20.json'), JSON.stringify(matrixJson, null, 2));

const matrixMd = `# 08-COMPARISON-METRICS · בודק · EXP-A2-safe · 2026-09-20

**Role:** בודק  
**Stamp:** ${finished} (Asia/Jerusalem)  
**Promote:** **HOLD**

## Columns

| Col | Lane | dpl | Source |
|-----|------|-----|--------|
| B0 | Discovery frozen | \`${B0_DPL}\` | ${PRIOR.B0.source} |
| A | VIAF no coalesce | \`${PRIOR.A_VIAF.dpl}\` | ${PRIOR.A_VIAF.source} |
| A2-bound | FRNDab (title-bridge caveat) | \`${PRIOR.FRNDab.dpl}\` | ${PRIOR.FRNDab.source} |
| **A2-safe** | **7MmfP typed enrich (LIVE)** | \`${PREVIEW_DPL}\` | 07-QA-בודק live |
| Bound#1 | Fz2iq typed-only (footnote) | \`${PRIOR.Bound1.dpl}\` | ${PRIOR.Bound1.source} |

## Metrics table

| Metric | B0 | A (VIAF no coalesce) | A2-bound (FRNDab) | **A2-safe (7MmfP)** | Bound#1 Fz2iq |
|--------|----|----------------------|-------------------|---------------------|---------------|
| **multi-independent (mean)** | ${PRIOR.B0.mean_multi} | ${PRIOR.A_VIAF.mean_multi} | ${PRIOR.FRNDab.mean_multi} | **${a2_mean}** | ${PRIOR.Bound1.mean_multi} |
| multi-independent (pooled) | ${PRIOR.B0.pooled_multi} | ${PRIOR.A_VIAF.pooled_multi} | ${PRIOR.FRNDab.pooled_multi} | **${a2_pooled}** (${preview_pooled_n}/${preview_pooled_den}) | ${PRIOR.Bound1.pooled_multi} |
| S01 rate | ${PRIOR.B0.per_seed.S01} | ${PRIOR.A_VIAF.per_seed.S01} | ${PRIOR.FRNDab.per_seed.S01} | **${s01rate}** | ${PRIOR.Bound1.per_seed.S01} |
| S04 rate | ${PRIOR.B0.per_seed.S04} | ${PRIOR.A_VIAF.per_seed.S04} | ${PRIOR.FRNDab.per_seed.S04} | **${s04rate}** | ${PRIOR.Bound1.per_seed.S04} |
| S05 rate | ${PRIOR.B0.per_seed.S05} | ${PRIOR.A_VIAF.per_seed.S05} | ${PRIOR.FRNDab.per_seed.S05} | **${s05rate}** | ${PRIOR.Bound1.per_seed.S05} |
| false merge | N/A (obs) | N/A (דיוק adv) | N/A (דיוק adv) | **N/A** (דיוק owns adversarial) | N/A (דיוק adv PASS) |
| evidence coverage | Acc BEFORE sticky | N/A published | 77/77 ≥1 Ev | **${a2_with_ev}/${a2_findings} ≥1 Ev** (ev=${a2_evidence}) | 78/78 ≥1 Ev |
| source diversity | 3 fam (no viaf) | session+viaf; Finding multi=0 | 4 fam | **${a2_fams.join(', ') || '—'}** | 4 fam session; Finding multi=0 |
| relevant findings | ${PRIOR.B0.relevant_findings} | ${PRIOR.A_VIAF.relevant_findings} | ${PRIOR.FRNDab.relevant_findings} | **${a2_findings}** | ${PRIOR.Bound1.relevant_findings} |
| contradictions (Q1701775) | 0 | 0 | 0 | contr_n=**${a2_contr}** | 0 |
| Acc leakage | 0 | 0 | 0 | **${leak_preview}** | 0 |
| pretty-wrong | false | false | false | Core pw=**${corePw}** | false |

## Footnotes

1. **A (VIAF no coalesce):** Acc AFTER — multi mean/pooled **0** despite viaf_findings_n=24. Source: \`PHASE4-EXPERIMENT-A-VIAF/ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.md\`.
2. **A2-bound FRNDab:** Acc mean **0.5189** · prior QA mean **0.4414** — title-bridge caveat · **NON-promote**.
3. **Bound#1 Fz2iq:** typed keys only · multi=**0** expected · Acc FAIL on multi gate · hard leak/Core PASS.
4. **A2-safe 7MmfP:** **this live QA** independently re-measured (שרת smoke claimed 0.2408 — not copied).
5. **false merge:** placeholder — דיוק owns adversarial; not re-scored in this QA lane.
6. **Promote: HOLD** on all columns.

## Continuity

- COALESCE copy: \`QA-A2SAFE-vs-B0-בודק-2026-09-20.md\`
- Raw: \`09-RAW-REPRESENTATIVE/qa-a2safe/\`
`;

writeFileSync(join(PACK, '08-COMPARISON-METRICS-בודק-2026-09-20.md'), matrixMd);

const statusMd = `# STATUS-בודק · EXP-A2-safe Evidence Pack

| Field | Value |
|-------|-------|
| **RESULT** | **${overall ? 'PASS' : 'FAIL'}** |
| Preview | \`${PREVIEW_DPL}\` A2-safe |
| mean multi | **${a2_mean}** |
| pooled | ${a2_pooled} (${preview_pooled_n}/${preview_pooled_den}) |
| S01 / S04 / S05 | ${s01rate} / ${s04rate} / ${s05rate} |
| Acc leak | **${leak_total + coreLeak}** (discovery=${leak_total} core=${coreLeak}) |
| Core | **${corePass ? 'PASS' : 'FAIL'}** (pw=${corePw} leak=${coreLeak} build=\`${coreBuild}\`) |
| Promote | **HOLD** |
| Stamp | ${finished} IDT |

Gates: multi=${multiPass ? 'PASS' : 'FAIL'} · leak=${leakPass && coreLeak === 0 ? 'PASS' : 'FAIL'} · vacuum=${no_vacuum ? 'PASS' : 'FAIL'} · core=${corePass ? 'PASS' : 'FAIL'}
`;

writeFileSync(join(PACK, 'STATUS-בודק.md'), statusMd);

console.log('\n=== בודק A2-safe SUMMARY ===');
console.log(
  JSON.stringify(
    {
      overall: overall ? 'PASS' : 'FAIL',
      mean: a2_mean,
      pooled: a2_pooled,
      per_seed: { S01: s01rate, S04: s04rate, S05: s05rate },
      leak_discovery: leak_total,
      core_leak: coreLeak,
      core: corePass ? 'PASS' : 'FAIL',
      promote: 'HOLD',
      stamp: finished,
      files: [
        join(PACK, '07-QA-בודק-2026-09-20.md'),
        join(PACK, '07-QA-בודק-2026-09-20.json'),
        join(PACK, '08-COMPARISON-METRICS-בודק-2026-09-20.md'),
        join(PACK, '08-COMPARISON-METRICS-בודק-2026-09-20.json'),
        join(PACK, 'STATUS-בודק.md'),
        join(COALESCE, 'QA-A2SAFE-vs-B0-בודק-2026-09-20.md'),
      ],
    },
    null,
    2,
  ),
);
