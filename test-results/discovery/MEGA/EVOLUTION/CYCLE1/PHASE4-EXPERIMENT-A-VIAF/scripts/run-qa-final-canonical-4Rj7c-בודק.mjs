#!/usr/bin/env node
/**
 * QA-FINAL-RESULT · בודק · CANONICAL Preview dpl_4Rj7c (NOT H9o45)
 * Acc family map · HOLD promote · 2026-09-20
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHASE4 = join(__dirname, '..');
const ROOT = '/workspace/akvot-quick-demo';
const RAW = join(PHASE4, 'raw-qa-final');
mkdirSync(RAW, { recursive: true });

const PREVIEW_DPL = 'dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE';
const PREVIEW_URL = 'https://akvot-simple-demo-c7eq1un0r-k-akvot.vercel.app';
const B0_DPL = 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const B0_ALIAS = 'https://akvot-discovery.vercel.app';
const CORE_BASE = 'https://akvot-simple-demo.vercel.app';
const CORE_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const SUPERSEDED_H9 = 'dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const MULTI_THRESHOLD = 0.15;

const BEFORE = JSON.parse(
  readFileSync(join(PHASE4, 'ACC-B0-BEFORE-S01-S04-S05-דיוק-2026-09-20.json'), 'utf8')
);

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
  const args = ['-sS', '-H', 'Accept: application/json', '-H', `Origin: ${CORE_BASE}`, '--max-time', String(Math.ceil(timeout / 1000))];
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

function hasDossier(j) {
  if (!j || typeof j !== 'object') return false;
  if (j.uiState === 'dossier' || j.mode === 'dossier' || j.ui === 'dossier') return true;
  if (j.dossier && typeof j.dossier === 'object') return true;
  if (j?.snapshot?.uiState === 'dossier') return true;
  return false;
}

function saveRaw(label, data) {
  const payload = data?.json != null ? data.json : { text: String(data?.text || '').slice(0, 200000), stderr: data?.stderr, exit: data?.exit };
  writeFileSync(join(RAW, `${label}.json`), JSON.stringify(payload, null, 2));
  return `${label}.json`;
}

/** Acc SoT family mapping (wikidata ≠ wikipedia ≠ openlibrary ≠ viaf) */
function hostFamilyFromEvidence(ev) {
  const provider = String(ev?.providerId || ev?.provider || '').toLowerCase();
  const domain = String(ev?.domain || '').toLowerCase().replace(/^www\./, '');
  const url = String(ev?.url || ev?.provenanceUrl || '').toLowerCase();
  const host =
    domain ||
    (() => {
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
        families: [fam],
      };
    });
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
    providers_n: Array.isArray(f.providers) ? f.providers.length : 0,
    hostFamilies,
    hostFamilyCount: hostFamilies.length,
    multi_independent: hostFamilies.length >= 2,
    evidenceIds: eids,
    evidence_n: evidence.length,
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
  const providers_session = snap?.providers || j?.providers || null;
  const viaf_findings_n = findings.filter(
    (f) => f.hostFamilies.includes('viaf') || f.providers.includes('viaf') || String(f.findingId || '').startsWith('viaf')
  ).length;
  const multi_provider_n = findings.filter((f) => (f.providers || []).length >= 2).length;
  return {
    id: seedMeta.id,
    seed: seedMeta.seed,
    category: seedMeta.category,
    label,
    sessionId: j?.sessionId || snap?.sessionId || extras.sessionId || null,
    status: snap?.status || j?.status || null,
    findings_n: findings_count,
    multi_independent_n,
    multi_independent_rate: Math.round(multi_independent_rate * 10000) / 10000,
    multi_provider_n,
    acc_leak_count: leakHits.length,
    hostFamily_histogram: hist,
    providers_session,
    viaf_findings_n,
    viaf_present:
      viaf_findings_n > 0 ||
      (providers_session && Object.prototype.hasOwnProperty.call(providers_session, 'viaf')),
    dossier_bind: hasDossier(j),
    ms: req.ms,
    raw_file: extras.raw_file || null,
    findings_sample: findings.slice(0, 12).map((f) => ({
      id: f.findingId,
      title: f.title,
      providers: f.providers,
      hostFamilies: f.hostFamilies,
      multi: f.multi_independent,
    })),
  };
}

function createAndPoll(surface, deployment, seedMeta) {
  const tag = `${surface}-${seedMeta.id}`;
  console.log(`[${surface}] CREATE ${seedMeta.id} ${seedMeta.seed}`);
  const create = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    deployment,
    body: { seed: seedMeta.seed, category: seedMeta.category },
  });
  saveRaw(`${tag}-create`, create);
  const sessionId = create.json?.sessionId || create.json?.id || create.json?.snapshot?.sessionId;
  if (!sessionId) {
    console.log(`[${surface}] CREATE FAIL ${seedMeta.id}`, (create.text || '').slice(0, 300));
    return analyzeSession(tag, seedMeta, create, { surface, raw_file: `${tag}-create.json` });
  }
  let final = create;
  for (let i = 0; i < 12; i++) {
    spawnSync('sleep', ['3']);
    const get = vercelCurl(`/api/discovery/sessions/${sessionId}`, { deployment });
    saveRaw(`${tag}-poll${i}`, get);
    const status = get.json?.snapshot?.status || get.json?.status;
    const fn = (get.json?.snapshot?.findings || get.json?.findings || []).length;
    console.log(`[${surface}] POLL ${seedMeta.id} i=${i} status=${status} findings=${fn}`);
    final = get;
    if (status === 'done' || status === 'complete' || status === 'ready') break;
    // sticky partial with stable findings after a few polls is OK
    if (i >= 3 && (status === 'partial' || status === 'running') && fn > 0) {
      // keep going a bit more then accept
      if (i >= 6) break;
    }
  }
  saveRaw(`${tag}-final`, final);
  return analyzeSession(tag, seedMeta, final, { surface, sessionId, raw_file: `${tag}-final.json` });
}

const started = nowJerusalem();
console.log(`[בודק] QA-FINAL CANONICAL Preview start ${started}`);
console.log(`[בודק] Preview ${PREVIEW_URL} → ${PREVIEW_DPL} (H9o45 SUPERSEDED)`);
console.log(`[בודק] B0 ${B0_ALIAS} → ${B0_DPL}`);
console.log(`[בודק] Core ${CORE_BASE} → ${CORE_DPL} LOCKED · HOLD promote`);

// Health / locks
const previewHealth = vercelCurl('/api/health', { deployment: PREVIEW_DPL });
saveRaw('preview-health', previewHealth);
const b0Health = vercelCurl('/api/health', { deployment: B0_DPL });
saveRaw('b0-health', b0Health);
const coreHealth = publicCurl(`${CORE_BASE}/api/health`);
saveRaw('core-health', coreHealth);

const previewBuildOk = previewHealth.json?.build === PREVIEW_DPL;
const b0BuildOk = b0Health.json?.build === B0_DPL;
const coreBuildOk = coreHealth.json?.build === CORE_DPL;

console.log(`[lock] preview build=${previewHealth.json?.build} ok=${previewBuildOk}`);
console.log(`[lock] b0 build=${b0Health.json?.build} ok=${b0BuildOk}`);
console.log(`[lock] core build=${coreHealth.json?.build} ok=${coreBuildOk}`);

const previewRows = [];
const b0Rows = [];
for (const seed of SEEDS) {
  previewRows.push(createAndPoll('PREVIEW', PREVIEW_DPL, seed));
}
for (const seed of SEEDS) {
  b0Rows.push(createAndPoll('B0', B0_DPL, seed));
}

// Core smoke Assaf/כהן/Smith (public Core)
function coreQuery(q, label) {
  const r = publicCurl(`${CORE_BASE}/api/query?q=${encodeURIComponent(q)}`);
  saveRaw(`core-${label}`, r);
  const j = r.json || {};
  const leak = deepScanForbidden(j).length;
  return {
    label,
    q,
    ui: j.ui || j.uiState || j.mode || null,
    qid: j.qid || j.selectedQid || j.identity?.qid || null,
    leak,
    dossier: hasDossier(j),
    build: j.build || null,
  };
}
const coreSmoke = [
  coreQuery('Assaf', 'assaf'),
  coreQuery('כהן', 'cohen'),
  coreQuery('Smith', 'smith'),
];

const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const previewMean = mean(previewRows.map((r) => r.multi_independent_rate));
const b0Mean = mean(b0Rows.map((r) => r.multi_independent_rate));
const pooledPreview = {
  findings_n: previewRows.reduce((a, r) => a + r.findings_n, 0),
  multi_n: previewRows.reduce((a, r) => a + r.multi_independent_n, 0),
};
pooledPreview.rate = pooledPreview.findings_n ? pooledPreview.multi_n / pooledPreview.findings_n : 0;
const pooledB0 = {
  findings_n: b0Rows.reduce((a, r) => a + r.findings_n, 0),
  multi_n: b0Rows.reduce((a, r) => a + r.multi_independent_n, 0),
};
pooledB0.rate = pooledB0.findings_n ? pooledB0.multi_n / pooledB0.findings_n : 0;

const accLeakTotal =
  previewRows.reduce((a, r) => a + r.acc_leak_count, 0) + b0Rows.reduce((a, r) => a + r.acc_leak_count, 0);
const dossierAny = previewRows.some((r) => r.dossier_bind) || b0Rows.some((r) => r.dossier_bind);
const viafAllPreview = previewRows.every((r) => r.viaf_present);
const viafAnyB0 = b0Rows.some((r) => r.viaf_present);
const multiGatePass = previewMean >= MULTI_THRESHOLD;

const finished = nowJerusalem();

// RCA if fail
let rca = null;
if (!multiGatePass) {
  const viafN = previewRows.reduce((a, r) => a + r.viaf_findings_n, 0);
  const multiProv = previewRows.reduce((a, r) => a + r.multi_provider_n, 0);
  rca = {
    root_cause:
      'VIAF adds findings / session-level family union, but Acc multi_independent requires ≥2 distinct hostFamilies on the SAME Finding (Evidence). Observed pattern: single-family Evidence per Finding OR merge not lifting Acc-map rate to ≥0.15.',
    aligns_with_acc_fail:
      'YES — Acc AFTER on H9o45 FAIL (VIAF adds findings but single-family evidence / no cross-family merge). Canonical 4Rj7c remeasure under same Acc formula.',
    observed: {
      preview_mean: previewMean,
      pooled_rate: pooledPreview.rate,
      viaf_findings_n: viafN,
      viaf_on_all_seeds: viafAllPreview,
      multi_provider_findings_n: multiProv,
      multi_independent_n: pooledPreview.multi_n,
    },
    note_vs_result_md:
      'RESULT.md PASS (mean≈0.414) used runtime hostFamily collapse (WD+WP→wikimedia) / soft-label merge reporting — Acc SoT keeps wikidata≠wikipedia and Evidence-derived families. Honest gate uses Acc SoT.',
  };
}

const verdict = multiGatePass && accLeakTotal === 0 && !dossierAny && previewBuildOk && coreBuildOk && b0BuildOk ? 'PASS' : 'FAIL';

const out = {
  doc: 'QA-FINAL-RESULT',
  role: 'בודק',
  phase: 'CYCLE1 · PHASE4-EXPERIMENT-A-VIAF',
  stamp: started,
  finished,
  zone: 'Asia/Jerusalem',
  promote: 'HOLD',
  no_promote: true,
  core_untouched: true,
  canonical_preview: {
    dpl: PREVIEW_DPL,
    url: PREVIEW_URL,
    viaf_enabled: true,
    access: `vercel curl --deployment ${PREVIEW_DPL} --scope ${SCOPE}`,
  },
  superseded: {
    dpl: SUPERSEDED_H9,
    note: 'H9o45 superseded by 4Rj7c — do not use for FINAL',
  },
  locks: {
    preview_build_match: previewBuildOk,
    preview_build: previewHealth.json?.build || null,
    b0_alias: B0_ALIAS,
    b0_dpl: B0_DPL,
    b0_build_match: b0BuildOk,
    b0_build: b0Health.json?.build || null,
    core_alias: CORE_BASE,
    core_dpl: CORE_DPL,
    core_build_match: coreBuildOk,
    core_build: coreHealth.json?.build || null,
  },
  seeds: SEEDS,
  family_mapping: BEFORE.family_mapping || {
    formula:
      'multi_independent_rate = share of accepted Findings whose surviving Evidence spans ≥2 distinct independent hostFamily values',
    families: ['wikidata', 'wikipedia', 'openlibrary', 'viaf', 'other:<apex>'],
    notes: [
      'language wikipedia mirrors = one family',
      'wikidata ≠ wikipedia ≠ openlibrary ≠ viaf',
      'providers.length alone is NOT corroboration',
    ],
  },
  formula_documented: {
    metric: 'multi_independent_rate',
    definition:
      'share of accepted Findings whose surviving Evidence spans ≥2 distinct independent hostFamily values (Acc SoT)',
    aggregation_gate: 'mean(S01,S04,S05) ≥ 0.15',
    also_reported: 'pooled findings multi_n / findings_n',
    not_used_for_gate: 'session-level family union; providers.length alone; runtime wikimedia collapse',
  },
  gate: {
    threshold: MULTI_THRESHOLD,
    multi_independent_mean_preview: Math.round(previewMean * 10000) / 10000,
    multi_independent_mean_b0: Math.round(b0Mean * 10000) / 10000,
    multi_independent_pooled_preview: {
      findings_n: pooledPreview.findings_n,
      multi_n: pooledPreview.multi_n,
      rate: Math.round(pooledPreview.rate * 10000) / 10000,
    },
    multi_independent_pooled_b0: {
      findings_n: pooledB0.findings_n,
      multi_n: pooledB0.multi_n,
      rate: Math.round(pooledB0.rate * 10000) / 10000,
    },
    multi_gate_pass: multiGatePass,
    acc_leak_total: accLeakTotal,
    acc_leak_pass: accLeakTotal === 0,
    dossier_any: dossierAny,
    dossier_pass: !dossierAny,
    viaf_on_preview_all: viafAllPreview,
    viaf_on_b0_any: viafAnyB0,
  },
  preview: previewRows.map((r) => ({
    id: r.id,
    seed: r.seed,
    findings_n: r.findings_n,
    multi_independent_n: r.multi_independent_n,
    multi_independent_rate: r.multi_independent_rate,
    multi_provider_n: r.multi_provider_n,
    viaf_findings_n: r.viaf_findings_n,
    viaf_present: r.viaf_present,
    providers: r.providers_session,
    hostFamily_histogram: r.hostFamily_histogram,
    acc_leak: r.acc_leak_count,
    dossier: r.dossier_bind,
    status: r.status,
    sessionId: r.sessionId,
    findings_sample: r.findings_sample,
  })),
  b0: b0Rows.map((r) => ({
    id: r.id,
    seed: r.seed,
    findings_n: r.findings_n,
    multi_independent_n: r.multi_independent_n,
    multi_independent_rate: r.multi_independent_rate,
    viaf_findings_n: r.viaf_findings_n,
    viaf_present: r.viaf_present,
    providers: r.providers_session,
    hostFamily_histogram: r.hostFamily_histogram,
    acc_leak: r.acc_leak_count,
    dossier: r.dossier_bind,
    status: r.status,
    sessionId: r.sessionId,
  })),
  b0_before_freeze: {
    source: 'ACC-B0-BEFORE-S01-S04-S05-דיוק-2026-09-20',
    per_seed: (BEFORE.per_seed || BEFORE.seeds || []).length
      ? BEFORE.per_seed || BEFORE.seeds
      : BEFORE.aggregate || null,
    note: 'Live B0 remeasure also recorded above; freeze used for seed strings + family map',
  },
  core_smoke: coreSmoke,
  rca,
  verdict,
  fail_reasons: [
    !multiGatePass ? `multi_independent mean=${previewMean.toFixed(4)} < ${MULTI_THRESHOLD}` : null,
    accLeakTotal !== 0 ? `acc_leak=${accLeakTotal}` : null,
    dossierAny ? 'dossier_bind observed on discovery surface' : null,
    !previewBuildOk ? 'preview build mismatch' : null,
    !coreBuildOk ? 'core build mismatch' : null,
    !b0BuildOk ? 'b0 build mismatch' : null,
  ].filter(Boolean),
  raw_dir: 'raw-qa-final/',
};

writeFileSync(join(PHASE4, 'QA-FINAL-RESULT-בודק-2026-09-20.json'), JSON.stringify(out, null, 2));

const md = `# QA-FINAL-RESULT — EXP-A VIAF · בודק · 2026-09-20

**Stamp:** ${started} → ${finished} IDT (Asia/Jerusalem, UTC+3)  
**Agent:** בודק (QA)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A-VIAF  
**Canonical Preview:** \`${PREVIEW_DPL}\` · ${PREVIEW_URL}  
**Superseded:** \`${SUPERSEDED_H9}\` (H9o45) — **not** used for FINAL  
**Promote:** **HOLD** · Core untouched · no alias moves

---

## Verdict: **${verdict}**

${out.fail_reasons.length ? out.fail_reasons.map((r) => `- ${r}`).join('\\n') : '- All gates cleared'}

---

## Locks (verified live)

| Lock | Expected | Actual | OK |
|------|----------|--------|----|
| Canonical Preview | \`${PREVIEW_DPL}\` | \`${out.locks.preview_build || '?'}\` | ${previewBuildOk ? 'PASS' : 'FAIL'} |
| B0 alias \`akvot-discovery\` | \`${B0_DPL}\` | \`${out.locks.b0_build || '?'}\` | ${b0BuildOk ? 'PASS' : 'FAIL'} |
| Core \`akvot-simple-demo\` | \`${CORE_DPL}\` | \`${out.locks.core_build || '?'}\` | ${coreBuildOk ? 'PASS' : 'FAIL'} |
| Acc leak Q1701775 | 0 | ${accLeakTotal} | ${accLeakTotal === 0 ? 'PASS' : 'FAIL'} |
| Dossier bind (discovery) | none | ${dossierAny} | ${!dossierAny ? 'PASS' : 'FAIL'} |
| VIAF on Preview | all seeds | ${viafAllPreview} | ${viafAllPreview ? 'PASS' : 'FAIL'} |
| VIAF on B0 | none | ${viafAnyB0} | ${!viafAnyB0 ? 'PASS' : 'WARN'} |

Access: \`vercel curl --deployment ${PREVIEW_DPL} --scope ${SCOPE}\`

---

## Seeds (Acc BEFORE exact · GOLDEN-CORPUS-v0)

| ID | Seed | Category |
|----|------|----------|
| S01 | Tim Berners-Lee | person |
| S04 | Stripe | company |
| S05 | Red Cross | organization |

---

## Formula (Acc SoT — documented)

\`multi_independent_rate\` = share of accepted Findings whose surviving Evidence spans **≥2 distinct independent \`hostFamily\` values**.

| Family | Map rule |
|--------|----------|
| \`wikidata\` | \`*.wikidata.org\` OR \`providerId=wikidata\` |
| \`wikipedia\` | \`*.wikipedia.org\` / \`*.wikimedia.org\` (non-wikidata) OR \`providerId=wikipedia\` — language mirrors = one family |
| \`openlibrary\` | \`*.openlibrary.org\` OR \`providerId=openlibrary\` |
| \`viaf\` | \`*.viaf.org\` OR \`providerId=viaf\` |
| \`other\` | any other apex → \`other:<apex>\` |

**Independent:** \`wikidata\` ≠ \`wikipedia\` ≠ \`openlibrary\` ≠ \`viaf\`.  
**Not used for gate:** session-level family union · \`providers.length\` alone · runtime WD+WP→\`wikimedia\` collapse (RESULT.md style).

**Gate aggregation:** mean(S01, S04, S05) ≥ **0.15**

---

## Metrics — Canonical Preview vs B0 (live)

| Seed | Preview findings | Preview multi_n | Preview rate | B0 findings | B0 multi_n | B0 rate | VIAF Preview | providers Preview |
|------|-----------------:|----------------:|-------------:|------------:|-----------:|--------:|:------------:|-------------------|
${previewRows
  .map((p, i) => {
    const b = b0Rows[i];
    return `| ${p.id} | ${p.findings_n} | ${p.multi_independent_n} | **${p.multi_independent_rate}** | ${b.findings_n} | ${b.multi_independent_n} | ${b.multi_independent_rate} | ${p.viaf_present} | \`${JSON.stringify(p.providers_session)}\` |`;
  })
  .join('\\n')}
| **Mean** | | | **${previewMean.toFixed(4)}** | | | **${b0Mean.toFixed(4)}** | | |
| **Pooled** | ${pooledPreview.findings_n} | ${pooledPreview.multi_n} | **${pooledPreview.rate.toFixed(4)}** | ${pooledB0.findings_n} | ${pooledB0.multi_n} | **${pooledB0.rate.toFixed(4)}** | | |

Gate threshold: **≥ 0.15** → **${multiGatePass ? 'PASS' : 'FAIL'}** (mean Acc = ${previewMean.toFixed(4)})

### Preview hostFamily histograms (Acc map)

${previewRows.map((p) => `- **${p.id}:** \`${JSON.stringify(p.hostFamily_histogram)}\``).join('\\n')}

---

## RCA (honest)

${
  rca
    ? `- FAIL gate: multi_independent_rate mean on Canonical Preview S01/S04/S05 = ${previewMean.toFixed(4)} < 0.15
- Aligns with Acc FAIL (H9o45 pack): VIAF adds findings but single-family Evidence / no cross-family merge lifting Acc rate
- VIAF present on Preview all seeds=${viafAllPreview}; viaf_findings_n=${previewRows.reduce((a, r) => a + r.viaf_findings_n, 0)}; multi_provider_findings_n=${previewRows.reduce((a, r) => a + r.multi_provider_n, 0)}; multi_independent_n=${pooledPreview.multi_n}
- RESULT.md claimed PASS (~0.414) under runtime wikimedia-collapse / soft-label reporting — **not** Acc SoT; this FINAL uses Acc Evidence hostFamily map
- B0 viaf_any=${viafAnyB0}; B0 mean=${b0Mean.toFixed(4)}
- **HOLD promote** — no alias mutation · Core untouched`
    : `- multi_independent mean ${previewMean.toFixed(4)} ≥ 0.15 under Acc SoT
- Acc leak=0 · no dossier · locks OK
- Still **HOLD promote** per experiment brief (do not promote from this QA alone)`
}

---

## Core smoke (LOCKED \`dpl_8ag…\`)

| Case | ui | qid | leak | dossier |
|------|-----|-----|-----:|---------|
${coreSmoke.map((c) => `| ${c.label} | ${c.ui} | ${c.qid} | ${c.leak} | ${c.dossier} |`).join('\\n')}

---

## Gate checklist

| Gate | Result |
|------|--------|
| Acc leakage = 0 | **${accLeakTotal === 0 ? 'PASS' : 'FAIL'}** |
| Core still \`dpl_8ag…\` | **${coreBuildOk ? 'PASS' : 'FAIL'}** |
| B0 alias still Avyhr | **${b0BuildOk ? 'PASS' : 'FAIL'}** |
| Canonical Preview = 4Rj7c (not H9o45) | **${previewBuildOk ? 'PASS' : 'FAIL'}** |
| multi_independent ≥ 0.15 (Acc SoT mean) | **${multiGatePass ? 'PASS' : 'FAIL'}** (${previewMean.toFixed(4)}) |
| Promote | **HOLD** |

---

## Paths

- \`PHASE4-EXPERIMENT-A-VIAF/QA-FINAL-RESULT-בודק-2026-09-20.md\`
- \`PHASE4-EXPERIMENT-A-VIAF/QA-FINAL-RESULT-בודק-2026-09-20.json\`
- raw: \`PHASE4-EXPERIMENT-A-VIAF/raw-qa-final/\`

## Promote

**HOLD** — do not promote. Core untouched. B0 alias unchanged. H9o45 superseded by 4Rj7c.
`;

writeFileSync(join(PHASE4, 'QA-FINAL-RESULT-בודק-2026-09-20.md'), md);

writeFileSync(
  join(PHASE4, 'STATUS-בודק.md'),
  `# STATUS — בודק · CYCLE1 PHASE4 EXP-A VIAF · QA-FINAL-RESULT

**Stamp:** ${finished} IDT  
**Canonical:** \`${PREVIEW_DPL}\` (H9o45 superseded)  
**Verdict:** **${verdict}** (multi_independent mean=${previewMean.toFixed(4)} ${multiGatePass ? '≥' : '<'} 0.15 Acc SoT)  
**Promote:** **HOLD**

| Check | Result |
|-------|--------|
| Preview VIAF ON (4Rj7c) | ${viafAllPreview ? 'PASS' : 'FAIL'} |
| Acc leak | ${accLeakTotal === 0 ? 'PASS' : 'FAIL'} (${accLeakTotal}) |
| Core \`dpl_8ag…\` | ${coreBuildOk ? 'PASS locked' : 'FAIL'} |
| B0 alias Avyhr | ${b0BuildOk ? 'PASS unchanged' : 'FAIL'} |
| multi_independent ≥0.15 | **${multiGatePass ? 'PASS' : 'FAIL'}** mean=${previewMean.toFixed(4)} |

See \`QA-FINAL-RESULT-בודק-2026-09-20.md\`.
`
);

console.log(JSON.stringify({ verdict, previewMean, pooledPreview, accLeakTotal, viafAllPreview, promote: 'HOLD' }, null, 2));
console.log(`[בודק] wrote QA-FINAL-RESULT-בודק-2026-09-20.{md,json} · STATUS-בודק.md`);
