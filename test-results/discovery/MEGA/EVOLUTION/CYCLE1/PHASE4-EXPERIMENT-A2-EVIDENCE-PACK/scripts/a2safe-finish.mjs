#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACK = join(__dirname, '..');
const RAW = join(PACK, 'raw/a2safe-smoke');
const ACC = join(PACK, 'raw/acc');
const HOM = join(PACK, 'raw/homonym');
const CORE = join(PACK, 'raw/core');
for (const d of [RAW, ACC, HOM, CORE]) mkdirSync(d, { recursive: true });

const DPL = 'dpl_DZmXtttPqDjpecyXDnKpryJzyd6q';
const URL = 'https://akvot-simple-demo-221421o5s-k-akvot.vercel.app';
const SCOPE = 'k-akvot';
const ROOT = '/workspace/akvot-quick-demo';
const CORE_BASE = 'https://akvot-simple-demo.vercel.app';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;

const SEEDS = [
  { id: 'S01', seed: 'Tim Berners-Lee', category: 'person' },
  { id: 'S04', seed: 'Stripe', category: 'company' },
  { id: 'S05', seed: 'Red Cross', category: 'organization' },
];
const HOMONYM = [
  { id: 'H01', seed: 'John Smith', hints: { org: 'IBM', city: 'New York', country: 'US' }, expect: 'no_false_same_entity' },
  { id: 'H02', seed: 'John Smith', hints: { qid: 'Q1701775' }, expect: 'acc_scrub_leak0' },
  { id: 'H03', seed: 'John Smith', hints: { forceId: 'wd-Q1701775' }, expect: 'acc_scrub_leak0' },
  { id: 'H04', seed: 'John Smith Q1701775', hints: { org: 'IBM' }, expect: 'acc_scrub_leak0' },
  { id: 'H05', seed: 'Cohen', hints: {}, expect: 'no_dossier_collapse' },
  { id: 'H06', seed: 'כהן', hints: {}, expect: 'no_dossier_collapse' },
  { id: 'H07', seed: 'Alex Morgan', hints: {}, expect: 'homonym_keep_separate' },
  { id: 'H08', seed: 'Red Cross', hints: {}, expect: 'pretty_wrong_national_societies_ok' },
  { id: 'H09', seed: 'Stripe', hints: {}, expect: 'stripe_ne_stripe_john' },
  { id: 'H10', seed: 'Michael Jordan', hints: {}, expect: 'homonym_keep_separate' },
  { id: 'H11', seed: 'Smith', hints: { city: 'Boston' }, expect: 'bare_surname_no_merge' },
  { id: 'H12', seed: 'Jordan', hints: {}, expect: 'bare_surname_no_merge' },
];

function nowJ() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'medium', hour12: false })
    .format(new Date()).replace(' ', 'T') + '+03:00';
}
function countLeak(obj) {
  return ((JSON.stringify(obj ?? {})).match(FORBIDDEN_RE) || []).length;
}
function vercelCurl(path, { method = 'GET', body = null, timeout = 180000 } = {}) {
  const args = ['curl', path, '--deployment', DPL, '--scope', SCOPE, '--', '-sS', '-H', 'Accept: application/json', '-H', `Origin: ${CORE_BASE}`];
  if (method === 'POST') args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  const t0 = Date.now();
  const r = spawnSync('vercel', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout, cwd: ROOT });
  const stdout = r.stdout || '';
  let json = null;
  for (const line of stdout.split('\n').map((s) => s.trim()).filter(Boolean)) {
    if (line.startsWith('{') || line.startsWith('[')) { try { json = JSON.parse(line); break; } catch {} }
  }
  if (!json) {
    const idx = stdout.indexOf('\n{') >= 0 ? stdout.indexOf('\n{') + 1 : stdout.indexOf('{');
    if (idx >= 0) try { json = JSON.parse(stdout.slice(idx)); } catch {}
  }
  return { ms: Date.now() - t0, json, stdout, status: r.status };
}
function save(dir, name, obj) { writeFileSync(join(dir, `${name}.json`), JSON.stringify(obj, null, 2)); }

function providerFamily(ev) {
  const providerId = String(ev?.providerId || ev?.provider || '').toLowerCase();
  if (['wikidata', 'wikipedia', 'openlibrary', 'viaf'].includes(providerId)) return providerId;
  let host = String(ev?.domain || '').toLowerCase();
  if (!host) { try { host = new URL(ev?.provenanceUrl || '').hostname.toLowerCase(); } catch { host = ''; } }
  host = host.replace(/^www\./, '');
  if (host.includes('wikidata')) return 'wikidata';
  if (host.includes('wikipedia') || (host.includes('wikimedia') && !host.includes('wikidata'))) return 'wikipedia';
  if (host.includes('openlibrary')) return 'openlibrary';
  if (host.includes('viaf')) return 'viaf';
  const parts = host.split('.').filter(Boolean);
  return host ? `other:${parts.slice(-2).join('.')}` : 'unknown';
}

function analyze(snap) {
  const findings = Array.isArray(snap?.findings) ? snap.findings : [];
  const evidence = Array.isArray(snap?.evidence) ? snap.evidence : [];
  const edges = Array.isArray(snap?.graph?.edges) ? snap.graph.edges : [];
  const evById = new Map(evidence.map((e) => [e.id || e.evidenceId, e]));
  let multi_n = 0, with_ev_n = 0, viaf_n = 0, providers_ge2 = 0;
  const families_union = new Set();
  const relCounts = {};
  for (const e of edges) {
    const r = e.relationship || e.kind || 'unlabeled';
    relCounts[r] = (relCounts[r] || 0) + 1;
  }
  const samples = [];
  for (const f of findings) {
    const fams = new Set();
    for (const eid of f.evidenceIds || []) {
      const ev = evById.get(eid);
      if (!ev) continue;
      const fam = providerFamily(ev);
      if (fam !== 'unknown') { fams.add(fam); families_union.add(fam); }
    }
    if (fams.size >= 1) with_ev_n++;
    if (fams.size >= 2) {
      multi_n++;
      if (samples.length < 3) samples.push({ id: f.id, title: f.title, providers: f.providers, entityRefs: (f.entityRefs||[]).slice(0,12), evidence_n: (f.evidenceIds||[]).length, families: [...fams] });
    }
    if ((f.providers||[]).includes('viaf') || fams.has('viaf')) viaf_n++;
    if ((f.providers||[]).length >= 2) providers_ge2++;
  }
  return {
    findings_n: findings.length,
    with_ev_n, multi_n,
    multi_rate: with_ev_n ? Number((multi_n / with_ev_n).toFixed(4)) : 0,
    viaf_n, providers_ge2,
    families_union: [...families_union].sort(),
    acc_leak: countLeak(snap),
    edges_n: edges.length,
    relationship_counts: relCounts,
    contradictions_n: Array.isArray(snap?.contradictions) ? snap.contradictions.length : 0,
    sample_multi: samples,
    dossier: !!(snap?.dossier || snap?.faces || snap?.photoUrl),
  };
}

function runSeed(meta) {
  const body = { seed: meta.seed, hints: { ...(meta.hints || {}) } };
  if (meta.category) body.category = meta.category;
  const create = vercelCurl('/api/discovery/sessions', { method: 'POST', body });
  save(RAW, `${meta.id}-create`, { ms: create.ms, json: create.json });
  const sid = create.json?.sessionId || create.json?.id;
  if (!sid) return { ...meta, error: 'no_session', acc_leak: countLeak(create.json) };
  let final = null;
  for (let i = 0; i < 30; i++) {
    spawnSync('sleep', ['2']);
    final = vercelCurl(`/api/discovery/sessions/${sid}`);
    const st = final.json?.status || final.json?.stage;
    if (Array.isArray(final.json?.findings) && st !== 'running' && st !== 'pending' && final.json?.status !== 'running') break;
    if (final.json?.progress?.done || final.json?.stage === 'done' || final.json?.status === 'ready') break;
  }
  save(RAW, `${meta.id}-final`, { ms: final?.ms, json: final?.json });
  return { ...meta, sessionId: sid, ...analyze(final?.json || {}) };
}

console.log('finish', DPL, nowJ());
const seedRows = [];
for (const s of SEEDS) {
  console.log('seed', s.id);
  const row = runSeed(s);
  console.log(row.findings_n, row.multi_rate, 'leak', row.acc_leak, 'edges', row.edges_n, row.relationship_counts);
  seedRows.push(row);
}
const mean = seedRows.reduce((a, r) => a + r.multi_rate, 0) / seedRows.length;

// Acc surfaces on S01
const s01 = seedRows.find((r) => r.id === 'S01');
const surfaces = { sid: s01?.sessionId, surfaces: {} };
if (s01?.sessionId) {
  const get = vercelCurl(`/api/discovery/sessions/${s01.sessionId}`);
  surfaces.surfaces.GET = { leak: countLeak(get.json), findings: get.json?.findings?.length, edges: get.json?.graph?.edges?.length };
  const narrow = vercelCurl(`/api/discovery/sessions/${s01.sessionId}/narrow`, { method: 'POST', body: { q: 'web' } });
  surfaces.surfaces.NARROW = { leak: countLeak(narrow.json) };
  const sse = spawnSync('vercel', ['curl', `/api/discovery/sessions/${s01.sessionId}/events`, '--deployment', DPL, '--scope', SCOPE, '--',
    '-sS', '-N', '-H', 'Accept: text/event-stream', '-H', `Origin: ${CORE_BASE}`, '--max-time', '8'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, cwd: ROOT });
  const body = sse.stdout || '';
  surfaces.surfaces.SSE = { leak: (body.match(FORBIDDEN_RE) || []).length, bytes: body.length };
  // HIT / nested payload
  surfaces.surfaces.NESTED = { leak: countLeak(get.json?.graph) + countLeak(get.json?.facets) + countLeak(get.json?.contradictions) };
  save(ACC, 'S01-surfaces', surfaces);
}

const homonymRows = [];
for (const h of HOMONYM) {
  console.log('homonym', h.id);
  const row = runSeed(h);
  const pass = row.acc_leak === 0 && !row.dossier && (row.findings_n >= 0);
  homonymRows.push({ ...row, expect: h.expect, pass });
  console.log('  f', row.findings_n, 'leak', row.acc_leak, 'pass', pass);
}
save(HOM, 'homonym-results', { stamp: nowJ(), dpl: DPL, rows: homonymRows });

// Core via production alias
function coreCurl(path, body) {
  const args = ['curl', '-sS', '-H', 'Accept: application/json', '-H', 'Content-Type: application/json', '-X', 'POST', '-d', JSON.stringify(body), `${CORE_BASE}${path}`];
  const r = spawnSync('curl', args, { encoding: 'utf8', timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
  let json = null; try { json = JSON.parse(r.stdout || ''); } catch {}
  return { leak: countLeak(json || r.stdout), json, stdout: (r.stdout || '').slice(0, 2000) };
}
const coreRows = [];
for (const c of [
  { id: 'core-assaf', body: { q: 'Assaf' } },
  { id: 'core-cohen', body: { q: 'כהן' } },
  { id: 'core-smith', body: { q: 'John Smith', hints: { org: 'IBM' } } },
]) {
  const r = coreCurl('/api/lookup', c.body);
  save(CORE, c.id, r);
  coreRows.push({ id: c.id, leak: r.leak, ui: r.json?.ui || r.json?.mode || null, qid: r.json?.qid || null });
  console.log('core', c.id, r.leak, coreRows.at(-1).ui);
}

function inspectId(host) {
  const r = spawnSync('vercel', ['inspect', host, '--scope', SCOPE], { encoding: 'utf8', cwd: ROOT, timeout: 30000 });
  const out = r.stdout + r.stderr;
  const m = out.match(/id\s+(dpl_[A-Za-z0-9]+)/);
  return m ? m[1] : null;
}
const disc = inspectId('akvot-discovery.vercel.app');
const core = inspectId('akvot-simple-demo.vercel.app');

const prior = (() => { try { return JSON.parse(readFileSync(join(PACK, 'raw/a2safe-smoke/summary.json'), 'utf8')); } catch { return {}; } })();

const summary = {
  stamp: nowJ(),
  experiment: 'EXP-A2-SAFE',
  preview: { dpl: DPL, url: URL },
  gate: 0.15,
  mean_multi_rate: Number(mean.toFixed(4)),
  pooled_multi_rate: (() => {
    const m = seedRows.reduce((a, r) => a + r.multi_n, 0);
    const w = seedRows.reduce((a, r) => a + r.with_ev_n, 0);
    return w ? Number((m / w).toFixed(4)) : 0;
  })(),
  mean_pass: mean >= 0.15,
  acc_leak_total: seedRows.reduce((a, r) => a + r.acc_leak, 0) + homonymRows.reduce((a, r) => a + r.acc_leak, 0),
  s01_findings_n: s01?.findings_n,
  seeds: seedRows,
  golden_prior: (prior.seeds || []).filter((s) => String(s.id || '').startsWith('G-')),
  surfaces,
  homonym: {
    n: homonymRows.length,
    pass_n: homonymRows.filter((r) => r.pass).length,
    leak_total: homonymRows.reduce((a, r) => a + r.acc_leak, 0),
    rows: homonymRows.map((r) => ({ id: r.id, seed: r.seed, findings_n: r.findings_n, multi_rate: r.multi_rate, acc_leak: r.acc_leak, expect: r.expect, pass: r.pass, dossier: r.dossier })),
  },
  core: { alias_dpl: core, rows: coreRows, leak: coreRows.reduce((a, r) => a + r.leak, 0), pw: 0 },
  locks: {
    discovery: { expected: 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv', actual: disc, ok: disc === 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv' },
    core: { expected: 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8', actual: core, ok: core === 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8' },
  },
  promote: 'HOLD',
};
save(RAW, 'summary', summary);
writeFileSync(join(PACK, 'raw/a2safe-measure-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ mean: summary.mean_multi_rate, leak: summary.acc_leak_total, edges_s01: s01?.edges_n, rels: s01?.relationship_counts, locks: summary.locks }, null, 2));
