#!/usr/bin/env node
/**
 * Acc LIVE measure for A2-safe Evidence Pack · dpl_7Mmf…
 * S01/S04/S05 + Core smoke + adversarial Smith + homonym corpus
 * NO promote · NO alias
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACK = join(__dirname, '..');
const RAW = join(PACK, 'raw/acc-live-דיוק');
const RAW_HOM = join(PACK, 'raw/homonym');
const RAW_CORE = join(PACK, 'raw/core');
for (const d of [RAW, RAW_HOM, RAW_CORE, join(PACK, '06-ACC'), join(PACK, '05-ADVERSARIAL'), join(PACK, '10-FP-CASES'), join(PACK, '11-FN-CASES')]) {
  mkdirSync(d, { recursive: true });
}

const DPL = process.env.A2SAFE_DPL || 'dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9';
const URL = process.env.A2SAFE_URL || 'https://akvot-simple-demo-mcqip894c-k-akvot.vercel.app';
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

const ADVERSARIAL = [
  { id: 'ADV-SMITH-CTX', seed: 'John Smith', hints: { org: 'IBM', city: 'New York', country: 'US' }, expect: 'no_false_same_entity' },
  { id: 'ADV-INJECT-QID', seed: 'John Smith', hints: { qid: 'Q1701775' }, expect: 'acc_scrub_leak0' },
  { id: 'ADV-INJECT-WD', seed: 'John Smith', hints: { forceId: 'wd-Q1701775' }, expect: 'acc_scrub_leak0' },
  { id: 'ADV-SEED-POISON', seed: 'John Smith Q1701775', hints: { org: 'IBM' }, expect: 'acc_scrub_leak0' },
];

/** Homonym corpus — ≥1 per required category */
const HOMONYM = [
  { id: 'H-SAME-TITLE', category_tag: 'same_title', seed: 'Tim Berners-Lee', hints: {}, note: 'exact title across registry families; merge only via typed refs' },
  { id: 'H-SAME-PERSON', category_tag: 'same_person_name', seed: 'John Smith', hints: { org: 'IBM', city: 'New York', country: 'US' }, note: 'common full person name + context' },
  { id: 'H-SAME-ORG', category_tag: 'same_org', seed: 'Red Cross', hints: {}, note: 'org name shared by national societies / ICRC / IFRC' },
  { id: 'H-DOMAIN', category_tag: 'same_domain_pattern', seed: 'Stripe', hints: {}, note: 'corp vs person title-prefix domain pattern' },
  { id: 'H-TRANSLATED', category_tag: 'translated_title', seed: 'International Committee of the Red Cross', hints: {}, note: 'English formal title vs common Red Cross' },
  { id: 'H-TRANSLIT', category_tag: 'transliteration', seed: 'כהן', hints: {}, note: 'Hebrew Cohen transliteration / surname ambiguity' },
  { id: 'H-SURNAME', category_tag: 'common_surname', seed: 'Cohen', hints: {}, note: 'common surname alone' },
  { id: 'H-IDENT-META', category_tag: 'identical_metadata', seed: 'Ada Lovelace', hints: {}, note: 'well-typed person; expect same-reference attach not same-entity Gate' },
  { id: 'H-SIBLING', category_tag: 'sibling_works', seed: 'Michael Jordan', hints: {}, note: 'homonym athletes/others; keep separate without shared typed id' },
  { id: 'H-ALEX', category_tag: 'same_person_name', seed: 'Alex Morgan', hints: {}, note: 'additional person-name homonym' },
];

function nowJ() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'medium', hour12: false,
  }).format(new Date()).replace(' ', 'T') + '+03:00';
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

function hasTitleOnlyCoalesceKey(f) {
  const refs = [...(f.entityRefs || []), ...(f.coalesceKeys || []), ...(f.softRefs || [])].map(String);
  const typed = refs.some((r) => /^(viaf:|qid:|ol:|wd-Q|viaf-|ol-)/i.test(r));
  const titleish = refs.some((r) => /^title:/i.test(r));
  return titleish && !typed;
}

function classifyIdentity(f, snap) {
  const refs = (f.entityRefs || []).map(String);
  const hasViaf = refs.some((r) => /^viaf:/i.test(r) || /^viaf-/i.test(r));
  const hasQid = refs.some((r) => /^qid:/i.test(r) || /^wd-Q/i.test(r));
  const hasOl = refs.some((r) => /^ol:/i.test(r) || /^ol-/i.test(r));
  const typedN = [hasViaf, hasQid, hasOl].filter(Boolean).length;
  const fams = new Set();
  const evById = new Map((snap?.evidence || []).map((e) => [e.id || e.evidenceId, e]));
  for (const eid of f.evidenceIds || []) {
    const ev = evById.get(eid);
    if (ev) {
      const fam = providerFamily(ev);
      if (fam !== 'unknown') fams.add(fam);
    }
  }
  if (fams.size >= 2 && typedN >= 1) return 'same-reference';
  if (fams.size >= 2 && typedN === 0) return 'possible-match'; // suspicious — Acc FAIL if title-only
  if ((f.providers || []).length >= 2 && typedN === 0) return 'possible-match';
  if (typedN >= 1 && fams.size === 1) return 'same-source';
  if (fams.size <= 1) return 'unknown';
  return 'related-entity';
}

function analyze(snap) {
  const findings = Array.isArray(snap?.findings) ? snap.findings : [];
  const evidence = Array.isArray(snap?.evidence) ? snap.evidence : [];
  const edges = Array.isArray(snap?.corroborationEdges) ? snap.corroborationEdges : [];
  const evById = new Map(evidence.map((e) => [e.id || e.evidenceId, e]));
  let multi_n = 0, with_ev_n = 0, viaf_n = 0, providers_ge2 = 0;
  let title_only_n = 0;
  const families_union = new Set();
  const relCounts = {};
  const labelCounts = {};
  const multiSamples = [];
  const rejectedish = [];
  for (const e of edges) {
    const r = e.relationship || e.label || 'unlabeled';
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
    if (fams.size >= 2) {
      multi_n++;
      if (multiSamples.length < 5) {
        multiSamples.push({
          id: f.id, title: f.title, providers: f.providers,
          entityRefs: (f.entityRefs || []).slice(0, 12),
          families: [...fams].sort(),
          identity_label: classifyIdentity(f, snap),
          evidence_n: (f.evidenceIds || []).length,
          title_only_key: hasTitleOnlyCoalesceKey(f),
        });
      }
    }
    if ([...(f.providers || [])].includes('viaf') || fams.has('viaf')) viaf_n++;
    if ((f.providers || []).length >= 2) providers_ge2++;
    if (hasTitleOnlyCoalesceKey(f)) title_only_n++;
    const lab = classifyIdentity(f, snap);
    labelCounts[lab] = (labelCounts[lab] || 0) + 1;
  }
  // findings that look like high-title peers kept separate
  for (const f of findings) {
    const refs = (f.entityRefs || []).map(String);
    const typed = refs.filter((r) => /^(viaf:|qid:|ol:)/i.test(r));
    if (typed.length === 0 && (f.providers || []).length === 1) {
      if (rejectedish.length < 8) rejectedish.push({ id: f.id, title: f.title, providers: f.providers, entityRefs: refs.slice(0, 6), identity_label: 'unknown' });
    }
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
    identity_label_counts: labelCounts,
    title_only_n,
    contradictions_n: Array.isArray(snap?.contradictions) ? snap.contradictions.length : 0,
    sample_multi: multiSamples,
    sample_single_family: rejectedish.slice(0, 5),
  };
}

function runSeed(meta) {
  const body = { seed: meta.seed, hints: { ...(meta.hints || {}) } };
  if (meta.category) body.category = meta.category;
  const create = vercelCurl('/api/discovery/sessions', { method: 'POST', body });
  save(RAW, `${meta.id}-create`, { ms: create.ms, status: create.status, json: create.json });
  const sid = create.json?.sessionId || create.json?.id;
  if (!sid) return { ...meta, error: 'no_session', create_ms: create.ms, acc_leak: countLeak(create.json) };
  let final = null;
  for (let i = 0; i < 30; i++) {
    spawnSync('sleep', ['2']);
    const g = vercelCurl(`/api/discovery/sessions/${sid}`);
    final = g;
    const st = g.json?.status || g.json?.phase || g.json?.state;
    if (Array.isArray(g.json?.findings) && st !== 'running' && st !== 'pending') break;
    if (st === 'ready' || st === 'done' || st === 'complete') break;
  }
  save(RAW, `${meta.id}-final`, { ms: final?.ms, status: final?.status, json: final?.json });
  const a = analyze(final?.json || {});
  return { ...meta, sessionId: sid, status: final?.json?.status, ...a, create_ms: create.ms, get_ms: final?.ms };
}

function narrowSurfaces(sid, label) {
  const out = { label, sid, surfaces: {} };
  const get = vercelCurl(`/api/discovery/sessions/${sid}`);
  out.surfaces.GET = { leak: countLeak(get.json), findings: get.json?.findings?.length };
  const narrow = vercelCurl(`/api/discovery/sessions/${sid}/narrow`, { method: 'POST', body: { q: 'test' } });
  out.surfaces.NARROW = { leak: countLeak(narrow.json) };
  const sse = spawnSync('vercel', ['curl', `/api/discovery/sessions/${sid}/events`, '--deployment', DPL, '--scope', SCOPE, '--',
    '-sS', '-N', '-H', 'Accept: text/event-stream', '-H', `Origin: ${CORE_BASE}`, '--max-time', '8'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, cwd: ROOT });
  const sseBody = sse.stdout || '';
  out.surfaces.SSE = { leak: (sseBody.match(FORBIDDEN_RE) || []).length, bytes: sseBody.length };
  save(RAW, `${label}-surfaces`, out);
  return out;
}

function coreCurl(path, body = null) {
  const args = ['curl', '-sS', '-H', 'Accept: application/json'];
  if (body) args.push('-X', 'POST', '-H', 'Content-Type: application/json', '-d', JSON.stringify(body));
  args.push(`${CORE_BASE}${path}`);
  const r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 60000 });
  let json = null;
  try { json = JSON.parse(r.stdout || ''); } catch { /* */ }
  return { status: r.status, json, stdout: r.stdout, leak: countLeak(json || r.stdout) };
}

function inspectId(host) {
  const r = spawnSync('vercel', ['inspect', host, '--scope', SCOPE], { encoding: 'utf8', cwd: ROOT, timeout: 30000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const m = out.match(/id\s+(dpl_[A-Za-z0-9]+)/);
  return { host, dpl: m ? m[1] : null };
}

console.log('ACC A2-SAFE LIVE', DPL, nowJ());
const health = vercelCurl('/api/discovery/health');
save(RAW, 'discovery-health', health.json || { raw: (health.stdout || '').slice(0, 2000) });

const seedRows = [];
for (const s of SEEDS) {
  console.log('seed', s.id, s.seed);
  const row = runSeed(s);
  console.log(' ', 'findings', row.findings_n, 'multi', row.multi_rate, 'leak', row.acc_leak, 'title_only', row.title_only_n, 'labels', row.identity_label_counts);
  seedRows.push(row);
}

const mean = seedRows.reduce((a, r) => a + (r.multi_rate || 0), 0) / (seedRows.length || 1);
const pooled_multi = seedRows.reduce((a, r) => a + (r.multi_n || 0), 0);
const pooled_with = seedRows.reduce((a, r) => a + (r.with_ev_n || 0), 0);
const title_only_total = seedRows.reduce((a, r) => a + (r.title_only_n || 0), 0);

let surfaces = null;
const s01 = seedRows.find((r) => r.id === 'S01');
if (s01?.sessionId) surfaces = narrowSurfaces(s01.sessionId, 'S01');

console.log('--- adversarial ---');
const advRows = [];
for (const h of ADVERSARIAL) {
  console.log('adv', h.id);
  const row = runSeed(h);
  const pass = (row.acc_leak || 0) === 0;
  advRows.push({ ...row, expect: h.expect, pass });
  console.log('  findings', row.findings_n, 'leak', row.acc_leak, 'pass', pass);
}

console.log('--- homonym corpus ---');
const homonymRows = [];
for (const h of HOMONYM) {
  console.log('homonym', h.id, h.category_tag, h.seed);
  const row = runSeed(h);
  // false-merge heuristic: multi↑ with title_only OR possible-match labels dominating multi samples
  const false_merge_risk =
    (row.title_only_n || 0) > 0 ||
    (row.sample_multi || []).some((s) => s.title_only_key || s.identity_label === 'possible-match');
  const pass = (row.acc_leak || 0) === 0 && !false_merge_risk;
  homonymRows.push({
    ...row,
    category_tag: h.category_tag,
    note: h.note,
    false_merge_risk,
    pass,
  });
  console.log('  findings', row.findings_n, 'multi', row.multi_rate, 'leak', row.acc_leak, 'fm_risk', false_merge_risk, 'pass', pass);
}
save(RAW_HOM, 'homonym-corpus-live', { stamp: nowJ(), dpl: DPL, rows: homonymRows });

console.log('--- core smoke ---');
const coreCases = [
  { id: 'core-assaf', path: '/api/lookup', body: { q: 'Assaf', hints: { qid: 'Q47507930' } } },
  { id: 'core-cohen', path: '/api/lookup', body: { q: 'כהן' } },
  { id: 'core-smith', path: '/api/lookup', body: { q: 'John Smith', hints: { org: 'IBM' } } },
];
const coreRows = [];
for (const c of coreCases) {
  const r = coreCurl(c.path, c.body);
  save(RAW_CORE, c.id, { ...c, leak: r.leak, json: r.json, stdout_head: String(r.stdout || '').slice(0, 1500) });
  const ui = r.json?.ui || r.json?.mode || r.json?.status || null;
  const qid = r.json?.qid || r.json?.identity?.qid || null;
  const leak = r.leak;
  const ok =
    leak === 0 &&
    (c.id !== 'core-assaf' || String(qid || '').includes('Q47507930') || ui === 'dossier') &&
    (c.id !== 'core-smith' || !String(JSON.stringify(r.json || {})).includes('Q1701775'));
  coreRows.push({ id: c.id, leak, ui, qid, pass: ok });
  console.log('core', c.id, 'leak', leak, 'ui', ui, 'pass', ok);
}

const discLock = inspectId('akvot-discovery.vercel.app');
const coreLock = inspectId('akvot-simple-demo.vercel.app');

const leak_total =
  seedRows.reduce((a, r) => a + (r.acc_leak || 0), 0) +
  advRows.reduce((a, r) => a + (r.acc_leak || 0), 0) +
  homonymRows.reduce((a, r) => a + (r.acc_leak || 0), 0) +
  (surfaces ? Object.values(surfaces.surfaces).reduce((a, s) => a + (s.leak || 0), 0) : 0);

const false_merge_homonym = homonymRows.filter((r) => r.false_merge_risk).length;
const multi_gate = mean >= GATE;
const leak_gate = leak_total === 0;
const title_only_gate = title_only_total === 0;
const s01_coverage = (s01?.findings_n || 0) >= 10;
const adv_pass = advRows.every((r) => r.pass);
const core_pass = coreRows.every((r) => r.pass) && coreLock.dpl === 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const b0_pass = discLock.dpl === 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const false_merge_pass = false_merge_homonym === 0;

const verdict =
  multi_gate && leak_gate && title_only_gate && s01_coverage && adv_pass && core_pass && b0_pass && false_merge_pass
    ? 'PASS'
    : 'FAIL';

const summary = {
  stamp: nowJ(),
  stampLabel: nowJ().replace('T', ' ').replace('+03:00', ' IDT'),
  experiment: 'EXP-A2-SAFE-EVIDENCE-PACK-ACC',
  agent: 'דיוק',
  promote: 'HOLD',
  preview: { dpl: DPL, url: URL },
  gate: GATE,
  mean_multi_rate: Number(mean.toFixed(4)),
  pooled_multi_rate: pooled_with ? Number((pooled_multi / pooled_with).toFixed(4)) : 0,
  multi_gate_pass: multi_gate,
  acc_leak_total: leak_total,
  title_only_total,
  s01_findings_n: s01?.findings_n ?? null,
  seeds: seedRows.map((r) => ({
    id: r.id, seed: r.seed, sessionId: r.sessionId, findings_n: r.findings_n, with_ev_n: r.with_ev_n,
    multi_n: r.multi_n, multi_rate: r.multi_rate, viaf_n: r.viaf_n, families_union: r.families_union,
    acc_leak: r.acc_leak, title_only_n: r.title_only_n, identity_label_counts: r.identity_label_counts,
    relationship_counts: r.relationship_counts, sample_multi: r.sample_multi, sample_single_family: r.sample_single_family,
  })),
  adversarial: {
    pass: adv_pass,
    leak_total: advRows.reduce((a, r) => a + (r.acc_leak || 0), 0),
    rows: advRows.map((r) => ({
      id: r.id, seed: r.seed, findings_n: r.findings_n, multi_rate: r.multi_rate,
      acc_leak: r.acc_leak, expect: r.expect, pass: r.pass, identity_label_counts: r.identity_label_counts,
    })),
  },
  homonym: {
    n: homonymRows.length,
    pass_n: homonymRows.filter((r) => r.pass).length,
    false_merge_risk_n: false_merge_homonym,
    leak_total: homonymRows.reduce((a, r) => a + (r.acc_leak || 0), 0),
    rows: homonymRows.map((r) => ({
      id: r.id, category_tag: r.category_tag, seed: r.seed, note: r.note,
      findings_n: r.findings_n, multi_n: r.multi_n, multi_rate: r.multi_rate,
      acc_leak: r.acc_leak, title_only_n: r.title_only_n, false_merge_risk: r.false_merge_risk,
      pass: r.pass, identity_label_counts: r.identity_label_counts,
      sample_multi: r.sample_multi, relationship_counts: r.relationship_counts,
    })),
  },
  surfaces,
  core: {
    alias_dpl: coreLock.dpl,
    rows: coreRows,
    pass: core_pass,
    leak: coreRows.reduce((a, r) => a + r.leak, 0),
  },
  locks: {
    discovery: { alias: 'akvot-discovery.vercel.app', expected: 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv', actual: discLock.dpl, ok: b0_pass },
    core: { alias: 'akvot-simple-demo.vercel.app', expected: 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8', actual: coreLock.dpl, ok: coreLock.dpl === 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8' },
  },
  gates: {
    multi_ge_015: multi_gate,
    leak_eq_0: leak_gate,
    title_only_eq_0: title_only_gate,
    s01_no_vacuum: s01_coverage,
    adversarial: adv_pass,
    core_b0: core_pass && b0_pass,
    false_merge_homonym: false_merge_pass,
  },
  verdict,
};
save(RAW, 'summary', summary);
writeFileSync(join(PACK, 'raw/acc-live-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({
  mean: summary.mean_multi_rate,
  leak: summary.acc_leak_total,
  title_only: title_only_total,
  false_merge_homonym,
  verdict,
  promote: 'HOLD',
}, null, 2));
