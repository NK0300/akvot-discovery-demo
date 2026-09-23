#!/usr/bin/env node
/**
 * EXP-A2 coalesce — Acc-style multi_independent on S01/S04/S05 vs B0
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHASE = join(__dirname, '..');
const RAW = join(PHASE, 'raw');
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
  { id: 'S01', seed: 'Tim Berners-Lee' },
  { id: 'S04', seed: 'Stripe' },
  { id: 'S05', seed: 'Red Cross' },
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
  return { json, ms, stderr: r.stderr || '', status: r.status, raw: stdout.slice(0, 2000) };
}

function hostFamilyFromEvidence(ev) {
  const host = String(ev?.domain || '').toLowerCase() || (() => {
    try {
      return new URL(ev?.provenanceUrl || ev?.url || '').hostname.toLowerCase();
    } catch {
      return '';
    }
  })();
  const h = host.replace(/^www\./, '');
  if (h.includes('wikidata') || h.includes('wikipedia') || h.endsWith('wikimedia.org')) return 'wikimedia';
  if (h.includes('openlibrary')) return 'openlibrary';
  if (h.includes('viaf')) return 'viaf';
  if (!h) return 'unknown';
  const parts = h.split('.').filter(Boolean);
  return parts.length >= 2 ? parts.slice(-2).join('.') : h;
}

function analyzeSnapshot(snap) {
  const findings = Array.isArray(snap?.findings) ? snap.findings : [];
  const evidence = Array.isArray(snap?.evidence) ? snap.evidence : [];
  const evById = new Map(evidence.map((e) => [e.id, e]));
  const providersSession = snap?.providers || {};
  let viaf_findings_n = 0;
  let multi_n = 0;
  const hist = {};
  const rows = [];
  for (const f of findings) {
    const eids = Array.isArray(f?.evidenceIds) ? f.evidenceIds : [];
    const fams = new Set();
    for (const eid of eids) {
      const ev = evById.get(eid);
      if (!ev) continue;
      fams.add(hostFamilyFromEvidence(ev));
    }
    if (fams.size === 0 && Array.isArray(f.providers)) {
      for (const p of f.providers) {
        if (p === 'wikidata' || p === 'wikipedia') fams.add('wikimedia');
        else if (p === 'openlibrary') fams.add('openlibrary');
        else if (p === 'viaf') fams.add('viaf');
      }
    }
    const hostFamilies = [...fams].sort();
    const multi = hostFamilies.length >= 2;
    if (multi) multi_n += 1;
    if ((f.providers || []).includes('viaf') || hostFamilies.includes('viaf')) viaf_findings_n += 1;
    for (const fam of hostFamilies.length ? hostFamilies : ['none']) {
      hist[fam] = (hist[fam] || 0) + 1;
    }
    rows.push({
      id: f.id,
      title: String(f.title || '').slice(0, 80),
      providers: f.providers || [],
      evidenceCount: eids.length,
      hostFamilies,
      multi_independent: multi,
      facetMulti: (f.facetHints || []).includes('corroboration:multi_family'),
    });
  }
  const findings_count = findings.length;
  const multi_independent_rate = findings_count ? multi_n / findings_count : 0;
  const text = JSON.stringify(snap);
  const acc_leak_count = (text.match(FORBIDDEN_RE) || []).length;
  const families_union = [...new Set(Object.keys(hist).filter((k) => k !== 'none'))].sort();
  return {
    findings_count,
    evidence_count: evidence.length,
    multi_independent_n: multi_n,
    multi_independent_rate: Math.round(multi_independent_rate * 10000) / 10000,
    viaf_findings_n,
    families_union,
    hostFamily_histogram: hist,
    providers_session: providersSession,
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
  writeFileSync(join(RAW, `${label}-${seedObj.id}-create.json`), JSON.stringify(create.json || { raw: create.raw }, null, 2));
  const sessionId = create.json?.sessionId || create.json?.snapshot?.sessionId;
  if (!sessionId) {
    return { id: seedObj.id, seed: seedObj.seed, error: 'no sessionId', create_ms: create.ms, raw: create.raw.slice(0, 500) };
  }
  let final = create.json?.snapshot || null;
  let status = create.json?.status || final?.status;
  for (let i = 0; i < 8 && status && !['complete', 'partial', 'failed_soft'].includes(status); i++) {
    await sleep(1500);
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
console.log('EXP-A2 measure', stamp);
console.log('Preview', PREVIEW_DPL, PREVIEW_URL);
console.log('B0', B0_DPL, B0_ALIAS);

const previewRows = [];
for (const s of SEEDS) {
  console.log('PREVIEW', s.id, s.seed, '...');
  const row = await runSeed('PREVIEW', PREVIEW_DPL, s);
  previewRows.push(row);
  console.log(
    `  findings=${row.findings_count} multi=${row.multi_independent_n}/${row.findings_count}=${row.multi_independent_rate} viaf=${row.viaf_findings_n} leak=${row.acc_leak_count} fams=${JSON.stringify(row.families_union)} edges=${row.corroborationEdges_n}`,
  );
}

const b0Rows = [];
for (const s of SEEDS) {
  console.log('B0', s.id, s.seed, '...');
  const row = await runSeed('B0', B0_DPL, s);
  b0Rows.push(row);
  console.log(
    `  findings=${row.findings_count} multi=${row.multi_independent_n}/${row.findings_count}=${row.multi_independent_rate} viaf=${row.viaf_findings_n} leak=${row.acc_leak_count} fams=${JSON.stringify(row.families_union)}`,
  );
}

const preview_mean = mean(previewRows.map((r) => r.multi_independent_rate || 0));
const b0_mean = mean(b0Rows.map((r) => r.multi_independent_rate || 0));
const preview_pooled_n = previewRows.reduce((a, r) => a + (r.multi_independent_n || 0), 0);
const preview_pooled_total = previewRows.reduce((a, r) => a + (r.findings_count || 0), 0);
const preview_pooled = preview_pooled_total ? preview_pooled_n / preview_pooled_total : 0;
const leak_total =
  previewRows.reduce((a, r) => a + (r.acc_leak_count || 0), 0) +
  b0Rows.reduce((a, r) => a + (r.acc_leak_count || 0), 0);

const s01 = previewRows.find((r) => r.id === 'S01');
const coverageOk = (s01?.findings_count || 0) >= 5;
const multiPass = preview_mean >= MULTI_THRESHOLD;
const leakPass = leak_total === 0;
const overall = multiPass && leakPass && coverageOk;

const out = {
  stamp,
  zone: 'Asia/Jerusalem',
  experiment: 'EXP-A2-COALESCE',
  preview: { dpl: PREVIEW_DPL, url: PREVIEW_URL },
  b0: { dpl: B0_DPL, alias: B0_ALIAS },
  core: { dpl: CORE_DPL, alias: CORE_BASE },
  gate: {
    metric: 'multi_independent_rate',
    aggregation: 'mean(S01,S04,S05)',
    threshold: MULTI_THRESHOLD,
    also_report_pooled: true,
  },
  before_B0: {
    mean_multi_independent_rate: Math.round(b0_mean * 10000) / 10000,
    perSeed: Object.fromEntries(
      b0Rows.map((r) => [
        r.id,
        {
          rate: r.multi_independent_rate,
          findings: r.findings_count,
          multi_n: r.multi_independent_n,
          families: r.families_union,
          viaf: (r.viaf_findings_n || 0) > 0,
        },
      ]),
    ),
  },
  after_PREVIEW: {
    mean_multi_independent_rate: Math.round(preview_mean * 10000) / 10000,
    pooled_multi_independent_rate: Math.round(preview_pooled * 10000) / 10000,
    pooled_n: `${preview_pooled_n}/${preview_pooled_total}`,
    perSeed: Object.fromEntries(
      previewRows.map((r) => [
        r.id,
        {
          rate: r.multi_independent_rate,
          findings: r.findings_count,
          multi_n: r.multi_independent_n,
          families: r.families_union,
          viaf: (r.viaf_findings_n || 0) > 0,
          corroborationEdges_n: r.corroborationEdges_n,
          facet_multi_n: r.facet_multi_n,
          sample_multi: r.sample_multi,
          sample_titles: r.sample_titles,
        },
      ]),
    ),
  },
  delta_mean: Math.round((preview_mean - b0_mean) * 10000) / 10000,
  accLeakTotal: leak_total,
  coverage: {
    S01_findings: s01?.findings_count ?? null,
    no_vacuum_collapse: coverageOk,
    note: 'S01 must keep ≥5 findings (attach_keep; not softLabel vacuum to 1)',
  },
  aliasesUntouched: true,
  coreLocked: CORE_DPL,
  pass: overall,
  gates: {
    multi_independent_mean: multiPass ? 'PASS' : 'FAIL',
    acc_leak: leakPass ? 'PASS' : 'FAIL',
    coverage_no_vacuum: coverageOk ? 'PASS' : 'FAIL',
  },
  previewRows,
  b0Rows,
};

writeFileSync(join(PHASE, 'BEFORE-AFTER.json'), JSON.stringify(out, null, 2));
writeFileSync(join(PHASE, 'MEASURE-COMPARE.json'), JSON.stringify(out, null, 2));
writeFileSync(
  join(PHASE, 'ACC-SCAN.json'),
  JSON.stringify(
    {
      stamp,
      forbiddenQID: 'Q1701775',
      leak_total: leak_total,
      result: leakPass ? 'PASS' : 'FAIL',
      preview_leaks: previewRows.map((r) => ({ id: r.id, leak: r.acc_leak_count })),
      b0_leaks: b0Rows.map((r) => ({ id: r.id, leak: r.acc_leak_count })),
    },
    null,
    2,
  ),
);

console.log('\n=== SUMMARY ===');
console.log(
  JSON.stringify(
    {
      preview_mean: out.after_PREVIEW.mean_multi_independent_rate,
      preview_pooled: out.after_PREVIEW.pooled_multi_independent_rate,
      b0_mean: out.before_B0.mean_multi_independent_rate,
      S01_findings: s01?.findings_count,
      leak: leak_total,
      pass: overall,
      gates: out.gates,
    },
    null,
    2,
  ),
);
