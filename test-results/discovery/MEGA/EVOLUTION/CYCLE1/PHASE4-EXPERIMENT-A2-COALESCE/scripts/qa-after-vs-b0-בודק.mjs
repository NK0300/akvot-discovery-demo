#!/usr/bin/env node
/**
 * EXP-A2 coalesce · בודק golden smoke QA-AFTER-vs-B0
 * Acc redef: wikidata ≠ wikipedia ≠ openlibrary ≠ viaf ≠ other:<apex>
 * rate = multi_n / findings_with_ge1_evidence
 * Gate mean(S01,S04,S05) ≥ 0.15 · Acc leak = 0 · S01 no vacuum vs B0
 * HOLD promote · Core LOCKED
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHASE = join(__dirname, '..');
const RAW = join(PHASE, 'raw-qa');
mkdirSync(RAW, { recursive: true });

const PREVIEW_DPL = 'dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2';
const PREVIEW_URL = 'https://akvot-simple-demo-h9cq1ob4m-k-akvot.vercel.app';
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
  writeFileSync(
    join(RAW, `${label}-${seedObj.id}-create.json`),
    JSON.stringify(create.json || { raw: create.raw, stderr: create.stderr }, null, 2),
  );
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
    writeFileSync(join(RAW, `${label}-${seedObj.id}-poll${i}.json`), JSON.stringify(get.json || {}, null, 2));
    if (get.json?.snapshot) final = get.json.snapshot;
    else if (get.json?.findings) final = get.json;
    status = get.json?.status || final?.status || status;
  }
  const getFinal = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`, { deployment });
  writeFileSync(join(RAW, `${label}-${seedObj.id}-final.json`), JSON.stringify(getFinal.json || {}, null, 2));
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
const overall = multiPass && leakPass && no_vacuum;

const out = {
  doc: 'QA-AFTER-vs-B0-בודק-2026-09-20',
  role: 'בודק',
  stamp,
  zone: 'Asia/Jerusalem',
  experiment: 'EXP-A2-COALESCE',
  mode: 'GOLDEN_SMOKE_QA_AFTER_VS_B0',
  promote: 'HOLD',
  aliasesUntouched: true,
  coreLocked: true,
  preview: { dpl: PREVIEW_DPL, url: PREVIEW_URL },
  b0: { dpl: B0_DPL, alias: B0_ALIAS },
  core: { dpl: CORE_DPL, alias: CORE_BASE },
  metric: {
    name: 'multi_independent_rate',
    redef: 'ACC-MULTI-INDEPENDENT-REDEF-דיוק-2026-09-20',
    unit: 'FindingId_after_coalesce',
    predicate: 'Evidence[] has >=2 distinct provider families',
    families: ['wikidata', 'wikipedia', 'openlibrary', 'viaf', 'other:<apex>'],
    note: 'wikidata ≠ wikipedia; lang Wikipedia mirrors = one family',
    rate_formula: 'multi_n / findings_with_ge1_evidence_n',
    aggregation: 'mean(S01,S04,S05)',
    threshold: MULTI_THRESHOLD,
  },
  seeds: SEEDS,
  b0_frozen_acc: B0_FROZEN,
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
  after_PREVIEW: {
    mean_multi_independent_rate: Math.round(preview_mean * 10000) / 10000,
    pooled_multi_independent_rate: Math.round(preview_pooled * 10000) / 10000,
    pooled_n: `${preview_pooled_n}/${preview_pooled_den}`,
    perSeed: Object.fromEntries(
      previewRows.map((r) => [
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
          corroborationEdges_n: r.corroborationEdges_n,
          facet_multi_n: r.facet_multi_n,
          status: r.status,
          sessionId: r.sessionId,
          sample_multi: r.sample_multi,
          sample_titles: r.sample_titles,
          error: r.error || null,
        },
      ]),
    ),
  },
  delta_mean_vs_frozen_b0: Math.round((preview_mean - B0_FROZEN.mean) * 10000) / 10000,
  delta_mean_vs_live_b0: Math.round((preview_mean - b0_live_mean) * 10000) / 10000,
  acc_leak: {
    forbidden: ['Q1701775', 'wd-Q1701775', 'wd_Q1701775'],
    preview_total: leak_preview,
    b0_total: leak_b0,
    total: leak_total,
  },
  coverage_watch: {
    S01_b0_frozen_findings: s01_b0_frozen,
    S01_b0_live_findings: s01b?.findings_count ?? null,
    S01_preview_findings: s01_preview,
    no_vacuum_collapse: no_vacuum,
    note: 'reject if Preview collapses S01 like 10→1 softLabel vacuum',
  },
  gates: {
    multi_independent_mean: multiPass ? 'PASS' : 'FAIL',
    multi_mean_value: Math.round(preview_mean * 10000) / 10000,
    threshold: MULTI_THRESHOLD,
    acc_leak: leakPass ? 'PASS' : 'FAIL',
    coverage_no_vacuum: no_vacuum ? 'PASS' : 'FAIL',
  },
  overall: overall ? 'PASS' : 'FAIL',
  pass: overall,
  promote_decision: 'HOLD',
  previewRows,
  b0Rows,
  raw_qa_dir: 'raw-qa/',
};

writeFileSync(join(PHASE, 'QA-AFTER-vs-B0-בודק-2026-09-20.json'), JSON.stringify(out, null, 2));

const md = `# QA-AFTER-vs-B0 · בודק · EXP-A2 coalesce · 2026-09-20

**Role:** בודק (golden smoke)  
**Stamp:** ${stamp} (Asia/Jerusalem)  
**Promote:** **HOLD**  
**Core:** LOCKED \`${CORE_DPL}\` · Assaf/כהן/Smith — untouched  
**Aliases:** untouched (\`${B0_ALIAS}\` stays B0)

## Targets

| Lane | Deployment | URL |
|------|------------|-----|
| **Preview (coalesce)** | \`${PREVIEW_DPL}\` | ${PREVIEW_URL} |
| **B0** | \`${B0_DPL}\` | ${B0_ALIAS} |
| **Core LOCKED** | \`${CORE_DPL}\` | ${CORE_BASE} |

## Metric (Acc redef)

- **Unit:** FindingId after coalesce  
- **multi_independent:** Evidence[] has **≥2** distinct provider families  
- **Families:** \`wikidata\` ≠ \`wikipedia\` ≠ \`openlibrary\` ≠ \`viaf\` ≠ \`other:<apex>\` (lang Wikipedia mirrors = one family)  
- **Rate:** multi_n / findings_with_≥1_Evidence  
- **Gate:** mean(S01, S04, S05) **≥ ${MULTI_THRESHOLD}** · Acc leak **= 0** · S01 findings vs B0 (no vacuum)

## Seeds

| ID | Seed | Category |
|----|------|----------|
| S01 | Tim Berners-Lee | person |
| S04 | Stripe | company |
| S05 | Red Cross | organization |

## Results — Preview (AFTER)

| Seed | Findings | With ≥1 Ev | Multi_n | **Rate** | Families | VIAF | Leak |
|------|----------|------------|---------|----------|----------|------|------|
${previewRows
  .map(
    (r) =>
      `| ${r.id} | ${r.findings_count} | ${r.findings_with_ge1_evidence_n} | ${r.multi_independent_n} | **${r.multi_independent_rate}** | ${(r.families_union || []).join(', ') || '—'} | ${(r.viaf_findings_n || 0) > 0 ? 'Y' : 'N'} | ${r.acc_leak_count} |`,
  )
  .join('\n')}

- **mean multi_independent_rate:** **${(Math.round(preview_mean * 10000) / 10000).toFixed(4)}**  
- **pooled (diagnostic):** ${(Math.round(preview_pooled * 10000) / 10000).toFixed(4)} (${preview_pooled_n}/${preview_pooled_den})

## Results — B0 live (re-measure)

| Seed | Findings | With ≥1 Ev | Multi_n | Rate | Families | Leak |
|------|----------|------------|---------|------|----------|------|
${b0Rows
  .map(
    (r) =>
      `| ${r.id} | ${r.findings_count} | ${r.findings_with_ge1_evidence_n} | ${r.multi_independent_n} | ${r.multi_independent_rate} | ${(r.families_union || []).join(', ') || '—'} | ${r.acc_leak_count} |`,
  )
  .join('\n')}

- **mean (live B0):** ${(Math.round(b0_live_mean * 10000) / 10000).toFixed(4)}

## B0 frozen Acc BEFORE (reference)

| Seed | Findings | Rate | Leak |
|------|----------|------|------|
| S01 | 10 | 0.0 | 0 |
| S04 | 14 | 0.0 | 0 |
| S05 | 6 | 0.0 | 0 |
| **mean** | — | **0.0** | **0** |

## Coverage watch (S01)

| | Findings |
|--|----------|
| B0 frozen | ${s01_b0_frozen} |
| B0 live | ${s01b?.findings_count ?? '—'} |
| Preview | **${s01_preview}** |
| No vacuum | **${no_vacuum ? 'PASS' : 'FAIL'}** |

## Acc leak

- Forbidden: Q1701775 / wd-Q1701775  
- Preview: ${leak_preview} · B0: ${leak_b0} · **Total: ${leak_total}** → **${leakPass ? 'PASS' : 'FAIL'}**

## Gates

| Gate | Result | Value |
|------|--------|-------|
| mean multi ≥ ${MULTI_THRESHOLD} | **${multiPass ? 'PASS' : 'FAIL'}** | ${Math.round(preview_mean * 10000) / 10000} |
| Acc leak = 0 | **${leakPass ? 'PASS' : 'FAIL'}** | ${leak_total} |
| S01 no vacuum | **${no_vacuum ? 'PASS' : 'FAIL'}** | Preview ${s01_preview} vs B0 frozen ${s01_b0_frozen} |

## Overall

# **${overall ? 'PASS' : 'FAIL'}**

**Promote: HOLD** (explicit — no alias retarget, no Core touch)

## Artifacts

- \`QA-AFTER-vs-B0-בודק-2026-09-20.json\`
- \`raw-qa/\` (create + poll + final per seed × Preview/B0)
- Acc redef: \`ACC-MULTI-INDEPENDENT-REDEF-דיוק-2026-09-20.md\`

## Method

\`vercel curl --deployment <dpl> --scope k-akvot\` from \`/workspace/akvot-quick-demo\`  
POST \`/api/discovery/sessions\` → poll until complete/partial → score Acc redef on snapshot.
`;

writeFileSync(join(PHASE, 'QA-AFTER-vs-B0-בודק-2026-09-20.md'), md);
console.log('\n=== בודק SUMMARY ===');
console.log(
  JSON.stringify(
    {
      overall: out.overall,
      preview_mean: out.after_PREVIEW.mean_multi_independent_rate,
      preview_pooled: out.after_PREVIEW.pooled_multi_independent_rate,
      b0_live_mean: out.before_B0_live.mean_multi_independent_rate,
      S01_preview: s01_preview,
      S01_b0_frozen: s01_b0_frozen,
      leak: leak_total,
      gates: out.gates,
      promote: 'HOLD',
    },
    null,
    2,
  ),
);
