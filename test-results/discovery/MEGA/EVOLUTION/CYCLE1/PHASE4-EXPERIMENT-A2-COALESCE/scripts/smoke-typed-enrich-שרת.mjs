#!/usr/bin/env node
/**
 * EXP-A2 typed soft-ref enrich — Preview smoke S01/S04/S05 (שרת)
 * Acc redef families: wikidata ≠ wikipedia ≠ openlibrary ≠ viaf
 * NO alias · HOLD promote
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHASE = join(__dirname, '..');
const RAW = join(PHASE, 'raw/typed-enrich-smoke');
mkdirSync(RAW, { recursive: true });

const DPL = 'dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9';
const URL = 'https://akvot-simple-demo-mcqip894c-k-akvot.vercel.app';
const SCOPE = 'k-akvot';
const ROOT = '/workspace/akvot-quick-demo';
const CORE_BASE = 'https://akvot-simple-demo.vercel.app';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const GATE = 0.15;

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

function vercelCurl(path, { method = 'GET', body = null, timeout = 180000 } = {}) {
  const args = ['curl', path, '--deployment', DPL, '--scope', SCOPE, '--'];
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
  let json = null;
  // Prefer first top-level JSON object after CLI banner (lastIndexOf truncates nested payloads)
  const lines = stdout.split('\n').map((s) => s.trim()).filter(Boolean);
  for (const line of lines) {
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
    const idx = stdout.indexOf('\n{') >= 0 ? stdout.indexOf('\n{') + 1 : stdout.indexOf('{');
    if (idx >= 0) {
      try {
        json = JSON.parse(stdout.slice(idx));
      } catch {
        /* ignore */
      }
    }
  }
  return { ms, json, stdout, status: r.status };
}

function save(name, obj) {
  writeFileSync(join(RAW, `${name}.json`), JSON.stringify(obj, null, 2));
}

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

function analyze(snap) {
  const findings = Array.isArray(snap?.findings) ? snap.findings : [];
  const evidence = Array.isArray(snap?.evidence) ? snap.evidence : [];
  const evById = new Map(evidence.map((e) => [e.id || e.evidenceId, e]));
  let multi_n = 0;
  let with_ev_n = 0;
  let viaf_n = 0;
  let providers_ge2 = 0;
  const famUnion = new Set();
  const sample_multi = [];
  for (const f of findings) {
    const eids = Array.isArray(f?.evidenceIds) ? f.evidenceIds : [];
    const fams = new Set();
    for (const eid of eids) {
      const ev = evById.get(eid);
      if (!ev) continue;
      fams.add(providerFamily(ev));
    }
    fams.delete('unknown');
    for (const x of fams) famUnion.add(x);
    if (eids.length >= 1) {
      with_ev_n += 1;
      const multi = fams.size >= 2;
      if (multi) {
        multi_n += 1;
        if (sample_multi.length < 6) {
          sample_multi.push({
            id: f.id,
            title: String(f.title || '').slice(0, 60),
            providers: f.providers || [],
            fams: [...fams].sort(),
            entityRefs: (f.entityRefs || []).slice(0, 8),
          });
        }
      }
      if ((f.providers || []).length >= 2) providers_ge2 += 1;
      if (fams.has('viaf') || (f.providers || []).includes('viaf')) viaf_n += 1;
    }
  }
  const rate = with_ev_n ? multi_n / with_ev_n : 0;
  const blob = JSON.stringify(snap || {});
  const leak = (blob.match(FORBIDDEN_RE) || []).length;
  return {
    findings_n: findings.length,
    with_ev_n,
    multi_n,
    multi_rate: Math.round(rate * 10000) / 10000,
    viaf_n,
    providers_ge2,
    corr_edges: Array.isArray(snap?.corroborationEdges) ? snap.corroborationEdges.length : 0,
    families_union: [...famUnion].sort(),
    acc_leak: leak,
    sample_multi,
  };
}

function sleepSync(ms) {
  spawnSync('sleep', [String(Math.max(1, Math.ceil(ms / 1000)))]);
}

function runSeed(seedObj) {
  const hints = {};
  if (seedObj.category === 'company' || seedObj.category === 'organization') hints.kind = 'org';
  console.log(`[smoke] ${seedObj.id} POST ${seedObj.seed}`);
  const create = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body: { seed: seedObj.seed, locale: 'en', hints },
  });
  save(`${seedObj.id}-create`, create.json || { error: 'nojson', stdout: create.stdout?.slice(-500) });
  const sessionId = create.json?.sessionId || create.json?.snapshot?.sessionId;
  if (!sessionId) {
    console.log(`[smoke] ${seedObj.id} NO sessionId`);
    return { id: seedObj.id, seed: seedObj.seed, error: 'no sessionId', multi_rate: 0, findings_n: 0, multi_n: 0, acc_leak: 0 };
  }
  let final = create.json?.snapshot || create.json;
  let status = create.json?.status || final?.status;
  for (let i = 0; i < 14 && status && !['complete', 'partial', 'failed_soft'].includes(status); i++) {
    sleepSync(2500);
    const get = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`);
    save(`${seedObj.id}-poll${i}`, get.json || {});
    if (get.json?.snapshot) final = get.json.snapshot;
    else if (get.json?.findings) final = get.json;
    status = get.json?.status || final?.status || status;
  }
  sleepSync(1500);
  const getFinal = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sessionId)}`);
  save(`${seedObj.id}-final`, getFinal.json || {});
  if (getFinal.json?.snapshot) final = getFinal.json.snapshot;
  else if (getFinal.json?.findings) final = getFinal.json;
  status = getFinal.json?.status || final?.status || status;
  const scored = analyze(final);
  const row = { id: seedObj.id, seed: seedObj.seed, sessionId, status, ...scored };
  console.log(
    `[smoke] ${seedObj.id} status=${status} findings=${row.findings_n} multi=${row.multi_n}/${row.with_ev_n}=${row.multi_rate} viaf=${row.viaf_n} ge2=${row.providers_ge2} edges=${row.corr_edges} leak=${row.acc_leak} fams=${JSON.stringify(row.families_union)}`,
  );
  return row;
}

const health = vercelCurl('/api/discovery/health');
save('discovery-health', health.json || {});
console.log('health ok=', health.json?.ok, 'backend=', health.json?.backend);

const per_seed = SEEDS.map(runSeed);
const rates = per_seed.map((r) => r.multi_rate || 0);
const mean = rates.reduce((a, b) => a + b, 0) / (rates.length || 1);
const multiSum = per_seed.reduce((a, r) => a + (r.multi_n || 0), 0);
const denomSum = per_seed.reduce((a, r) => a + (r.with_ev_n || 0), 0);
const pooled = denomSum ? multiSum / denomSum : 0;
const leak = per_seed.reduce((a, r) => a + (r.acc_leak || 0), 0);
const s01 = per_seed.find((r) => r.id === 'S01');

const summary = {
  stamp: nowJerusalem(),
  stampLabel: nowJerusalem().replace('T', ' ').replace('+03:00', ' IDT'),
  experiment: 'EXP-A2-COALESCE',
  wave: 'typed-softref-enrich',
  promote: 'HOLD',
  aliasTouch: false,
  preview: { dpl: DPL, url: URL },
  aliasesUntouched: {
    discovery: { dpl: 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv', status: 'UNCHANGED' },
    core: { dpl: 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8', status: 'LOCKED' },
  },
  gate: GATE,
  mean_multi_rate: Math.round(mean * 10000) / 10000,
  pooled_multi_rate: Math.round(pooled * 10000) / 10000,
  mean_pass: mean >= GATE,
  acc_leak: leak,
  s01_findings_n: s01?.findings_n ?? null,
  per_seed,
};

writeFileSync(join(RAW, 'summary.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(PHASE, 'raw/typed-enrich-smoke-summary.json'), JSON.stringify(summary, null, 2));
console.log('\n=== SUMMARY ===');
console.log(JSON.stringify({
  dpl: DPL,
  url: URL,
  mean_multi_rate: summary.mean_multi_rate,
  pooled_multi_rate: summary.pooled_multi_rate,
  mean_pass: summary.mean_pass,
  acc_leak: leak,
  s01_findings_n: summary.s01_findings_n,
}, null, 2));
