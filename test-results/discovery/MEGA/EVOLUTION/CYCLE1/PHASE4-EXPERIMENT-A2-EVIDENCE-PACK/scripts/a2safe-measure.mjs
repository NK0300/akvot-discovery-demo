#!/usr/bin/env node
/**
 * EXP-A2-SAFE live measure: S01/S04/S05 + golden + Acc leak + Core lock
 * Preview-only · HOLD promote
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACK = join(__dirname, '..');
const RAW = join(PACK, 'raw/a2safe-smoke');
mkdirSync(RAW, { recursive: true });
mkdirSync(join(PACK, 'raw/acc'), { recursive: true });
mkdirSync(join(PACK, 'raw/homonym'), { recursive: true });
mkdirSync(join(PACK, 'raw/core'), { recursive: true });

const DPL = process.env.A2SAFE_DPL || 'dpl_4Zxd9MnMs6WsTgSLrryyvGY3htpY';
const URL = process.env.A2SAFE_URL || 'https://akvot-simple-demo-murf2gh8a-k-akvot.vercel.app';
const SCOPE = 'k-akvot';
const ROOT = '/workspace/akvot-quick-demo';
const CORE_BASE = 'https://akvot-simple-demo.vercel.app';
const DISC_ALIAS = 'https://akvot-discovery.vercel.app';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const GATE = 0.15;

const SEEDS = [
  { id: 'S01', seed: 'Tim Berners-Lee', category: 'person' },
  { id: 'S04', seed: 'Stripe', category: 'company' },
  { id: 'S05', seed: 'Red Cross', category: 'organization' },
];

const GOLDEN = [
  { id: 'G-HE', seed: 'בנימין נתניהו', category: 'person' },
  { id: 'G-LAT', seed: 'Ada Lovelace', category: 'person' },
  { id: 'G-ORG', seed: 'UNESCO', category: 'organization' },
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
];

function nowJ() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'medium', hour12: false })
    .format(new Date()).replace(' ', 'T') + '+03:00';
}

function vercelCurl(path, { method = 'GET', body = null, timeout = 180000, deployment = DPL } = {}) {
  const args = ['curl', path, '--deployment', deployment, '--scope', SCOPE, '--'];
  args.push('-sS', '-H', 'Accept: application/json', '-H', `Origin: ${CORE_BASE}`);
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  }
  const t0 = Date.now();
  const r = spawnSync('vercel', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout, cwd: ROOT });
  const ms = Date.now() - t0;
  const stdout = r.stdout || '';
  let json = null;
  for (const line of stdout.split('\n').map((s) => s.trim()).filter(Boolean)) {
    if (line.startsWith('{') || line.startsWith('[')) {
      try { json = JSON.parse(line); break; } catch { /* */ }
    }
  }
  if (!json) {
    const idx = stdout.indexOf('\n{') >= 0 ? stdout.indexOf('\n{') + 1 : stdout.indexOf('{');
    if (idx >= 0) { try { json = JSON.parse(stdout.slice(idx)); } catch { /* */ } }
  }
  return { ms, json, stdout, status: r.status };
}

function save(dir, name, obj) {
  writeFileSync(join(dir, `${name}.json`), JSON.stringify(obj, null, 2));
}

function providerFamily(ev) {
  const providerId = String(ev?.providerId || ev?.provider || '').toLowerCase();
  if (['wikidata', 'wikipedia', 'openlibrary', 'viaf'].includes(providerId)) return providerId;
  let host = String(ev?.domain || '').toLowerCase();
  if (!host) {
    try { host = new URL(ev?.provenanceUrl || ev?.url || '').hostname.toLowerCase(); } catch { host = ''; }
  }
  host = host.replace(/^www\./, '');
  if (!host) return 'unknown';
  if (host.includes('wikidata') || host.endsWith('wikidata.org')) return 'wikidata';
  if (host.includes('wikipedia') || (host.includes('wikimedia') && !host.includes('wikidata'))) return 'wikipedia';
  if (host.includes('openlibrary')) return 'openlibrary';
  if (host.includes('viaf')) return 'viaf';
  const parts = host.split('.').filter(Boolean);
  return `other:${parts.length >= 2 ? parts.slice(-2).join('.') : host}`;
}

function countLeak(obj) {
  const s = JSON.stringify(obj ?? {});
  const m = s.match(FORBIDDEN_RE);
  return m ? m.length : 0;
}

function analyze(snap) {
  const findings = Array.isArray(snap?.findings) ? snap.findings : [];
  const evidence = Array.isArray(snap?.evidence) ? snap.evidence : [];
  const edges = Array.isArray(snap?.corroborationEdges) ? snap.corroborationEdges : [];
  const evById = new Map(evidence.map((e) => [e.id || e.evidenceId, e]));
  let multi_n = 0, with_ev_n = 0, viaf_n = 0, providers_ge2 = 0;
  const families_union = new Set();
  const relCounts = {};
  for (const e of edges) {
    const r = e.relationship || 'unlabeled';
    relCounts[r] = (relCounts[r] || 0) + 1;
  }
  for (const f of findings) {
    const fams = new Set();
    for (const eid of f.evidenceIds || []) {
      const ev = evById.get(eid);
      if (!ev) continue;
      const fam = providerFamily(ev);
      if (fam && fam !== 'unknown') { fams.add(fam); families_union.add(fam); }
    }
    if (fams.size >= 1) with_ev_n++;
    if (fams.size >= 2) multi_n++;
    if ([...(f.providers || [])].includes('viaf') || fams.has('viaf')) viaf_n++;
    if ((f.providers || []).length >= 2) providers_ge2++;
  }
  const multi_rate = with_ev_n ? multi_n / with_ev_n : 0;
  return {
    findings_n: findings.length,
    with_ev_n,
    multi_n,
    multi_rate: Number(multi_rate.toFixed(4)),
    viaf_n,
    providers_ge2,
    families_union: [...families_union].sort(),
    acc_leak: countLeak(snap),
    edges_n: edges.length,
    relationship_counts: relCounts,
    contradictions_n: Array.isArray(snap?.contradictions) ? snap.contradictions.length : 0,
    sample_multi: findings.filter((f) => {
      const fams = new Set();
      for (const eid of f.evidenceIds || []) {
        const ev = evById.get(eid);
        if (ev) fams.add(providerFamily(ev));
      }
      fams.delete('unknown');
      return fams.size >= 2;
    }).slice(0, 3).map((f) => ({
      id: f.id,
      title: f.title,
      providers: f.providers,
      entityRefs: (f.entityRefs || []).slice(0, 12),
      evidence_n: (f.evidenceIds || []).length,
    })),
  };
}

function runSeed(meta, hints = {}) {
  const body = { seed: meta.seed, hints: { ...(meta.hints || {}), ...hints } };
  if (meta.category) body.category = meta.category;
  const create = vercelCurl('/api/discovery/sessions', { method: 'POST', body });
  save(RAW, `${meta.id}-create`, { ms: create.ms, status: create.status, json: create.json });
  const sid = create.json?.sessionId || create.json?.id;
  if (!sid) return { ...meta, error: 'no_session', create };
  // poll
  let final = null;
  for (let i = 0; i < 24; i++) {
    spawnSync('sleep', ['2']);
    const g = vercelCurl(`/api/discovery/sessions/${sid}`);
    final = g;
    const st = g.json?.status || g.json?.phase || g.json?.state;
    if (st === 'ready' || st === 'done' || st === 'complete' || (g.json?.findings && g.json?.status !== 'running')) {
      if (st === 'running' || st === 'pending') continue;
      if (Array.isArray(g.json?.findings)) break;
    }
  }
  save(RAW, `${meta.id}-final`, { ms: final?.ms, status: final?.status, json: final?.json });
  const a = analyze(final?.json || {});
  return { ...meta, sessionId: sid, ...a, create_ms: create.ms, get_ms: final?.ms };
}

function narrowSurfaces(sid, label) {
  const out = { label, sid, surfaces: {} };
  const get = vercelCurl(`/api/discovery/sessions/${sid}`);
  out.surfaces.GET = { leak: countLeak(get.json), findings: get.json?.findings?.length };
  const narrow = vercelCurl(`/api/discovery/sessions/${sid}/narrow`, { method: 'POST', body: { q: 'test' } });
  out.surfaces.NARROW = { leak: countLeak(narrow.json), status: narrow.status };
  // SSE sample via vercel curl may not stream well — capture headers/body snippet
  const sse = spawnSync('vercel', ['curl', `/api/discovery/sessions/${sid}/events`, '--deployment', DPL, '--scope', SCOPE, '--',
    '-sS', '-N', '-H', 'Accept: text/event-stream', '-H', `Origin: ${CORE_BASE}`, '--max-time', '8'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, cwd: ROOT });
  const sseBody = sse.stdout || '';
  out.surfaces.SSE = { leak: (sseBody.match(FORBIDDEN_RE) || []).length, bytes: sseBody.length };
  save(join(PACK, 'raw/acc'), `${label}-surfaces`, out);
  return out;
}

console.log('A2-SAFE measure', DPL, nowJ());

// health
const health = vercelCurl('/api/discovery/health');
save(RAW, 'discovery-health', health.json || { raw: health.stdout?.slice(0, 2000) });

const seedRows = [];
for (const s of [...SEEDS, ...GOLDEN]) {
  console.log('seed', s.id, s.seed);
  const row = runSeed(s);
  console.log(' ', row.findings_n, 'multi', row.multi_rate, 'leak', row.acc_leak, 'rels', row.relationship_counts);
  seedRows.push(row);
}

const s01s04s05 = seedRows.filter((r) => ['S01', 'S04', 'S05'].includes(r.id));
const mean = s01s04s05.reduce((a, r) => a + (r.multi_rate || 0), 0) / (s01s04s05.length || 1);
const pooled_multi = s01s04s05.reduce((a, r) => a + (r.multi_n || 0), 0);
const pooled_with = s01s04s05.reduce((a, r) => a + (r.with_ev_n || 0), 0);

// Acc surfaces on S01
const s01 = seedRows.find((r) => r.id === 'S01');
let surfaces = null;
if (s01?.sessionId) surfaces = narrowSurfaces(s01.sessionId, 'S01');

// Homonym corpus
const homonymRows = [];
for (const h of HOMONYM) {
  console.log('homonym', h.id, h.seed);
  const row = runSeed(h);
  const pass =
    row.acc_leak === 0 &&
    (h.expect !== 'acc_scrub_leak0' || row.acc_leak === 0) &&
    row.findings_n >= 1;
  homonymRows.push({ ...row, expect: h.expect, pass });
  console.log('  findings', row.findings_n, 'leak', row.acc_leak, 'pass', pass);
}
save(join(PACK, 'raw/homonym'), 'homonym-results', { stamp: nowJ(), dpl: DPL, rows: homonymRows });

// Core smoke (LOCKED 8ag) — via production alias URL not preview deploy
function coreCurl(path, body = null) {
  const args = ['curl', '-sS', '-H', 'Accept: application/json'];
  if (body) args.push('-X', 'POST', '-H', 'Content-Type: application/json', '-d', JSON.stringify(body));
  args.push(`${CORE_BASE}${path}`);
  const r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 60000 });
  let json = null;
  try { json = JSON.parse(r.stdout || ''); } catch { /* */ }
  return { status: r.status, json, stdout: r.stdout, leak: countLeak(json || r.stdout) };
}

const coreCases = [
  { id: 'core-assaf', path: '/api/lookup', body: { q: 'Assaf', hints: { qid: 'Q47507930' } } },
  { id: 'core-cohen', path: '/api/lookup', body: { q: 'כהן' } },
  { id: 'core-smith', path: '/api/lookup', body: { q: 'John Smith', hints: { org: 'IBM' } } },
];
const coreRows = [];
for (const c of coreCases) {
  const r = coreCurl(c.path, c.body);
  save(join(PACK, 'raw/core'), c.id, { ...c, leak: r.leak, json: r.json, stdout_head: String(r.stdout || '').slice(0, 1500) });
  coreRows.push({
    id: c.id,
    leak: r.leak,
    ui: r.json?.ui || r.json?.mode || r.json?.status || null,
    qid: r.json?.qid || r.json?.identity?.qid || null,
    faces: Array.isArray(r.json?.faces) ? r.json.faces.length : (r.json?.faces_n ?? null),
  });
  console.log('core', c.id, 'leak', r.leak, 'ui', coreRows.at(-1).ui);
}

// Alias lock check via vercel inspect parse
function inspectId(host) {
  const r = spawnSync('vercel', ['inspect', host, '--scope', SCOPE], { encoding: 'utf8', cwd: ROOT, timeout: 30000 });
  const out = r.stdout + r.stderr;
  const m = out.match(/id\s+(dpl_[A-Za-z0-9]+)/);
  return { host, dpl: m ? m[1] : null, raw: out.slice(0, 2500) };
}
const discLock = inspectId('akvot-discovery.vercel.app');
const coreLock = inspectId('akvot-simple-demo.vercel.app');

const summary = {
  stamp: nowJ(),
  stampLabel: nowJ().replace('T', ' ').replace('+03:00', ' IDT'),
  experiment: 'EXP-A2-SAFE',
  preview: { dpl: DPL, url: URL },
  gate: GATE,
  mean_multi_rate: Number(mean.toFixed(4)),
  pooled_multi_rate: pooled_with ? Number((pooled_multi / pooled_with).toFixed(4)) : 0,
  mean_pass: mean >= GATE,
  acc_leak_total: seedRows.reduce((a, r) => a + (r.acc_leak || 0), 0) + homonymRows.reduce((a, r) => a + (r.acc_leak || 0), 0),
  s01_findings_n: s01?.findings_n ?? null,
  seeds: seedRows,
  homonym: {
    n: homonymRows.length,
    pass_n: homonymRows.filter((r) => r.pass).length,
    leak_total: homonymRows.reduce((a, r) => a + (r.acc_leak || 0), 0),
    rows: homonymRows.map((r) => ({
      id: r.id, seed: r.seed, findings_n: r.findings_n, multi_rate: r.multi_rate,
      acc_leak: r.acc_leak, expect: r.expect, pass: r.pass, relationship_counts: r.relationship_counts,
    })),
  },
  surfaces,
  core: { alias_dpl: coreLock.dpl, rows: coreRows, pw: 0, leak: coreRows.reduce((a, r) => a + r.leak, 0) },
  locks: {
    discovery: { alias: 'akvot-discovery.vercel.app', expected: 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv', actual: discLock.dpl, ok: discLock.dpl === 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv' },
    core: { alias: 'akvot-simple-demo.vercel.app', expected: 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8', actual: coreLock.dpl, ok: coreLock.dpl === 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8' },
  },
  promote: 'HOLD',
};
save(RAW, 'summary', summary);
writeFileSync(join(PACK, 'raw/a2safe-measure-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ mean: summary.mean_multi_rate, leak: summary.acc_leak_total, locks: summary.locks, promote: 'HOLD' }, null, 2));
