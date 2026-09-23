#!/usr/bin/env node
/**
 * CYCLE1 Phase2 Observation · Acc GOLDEN METRICS + Core SMOKE · דיוק · 2026-09-20
 * Observation only. NO promote. NO code changes. NO Core touch.
 * Discovery B0: dpl_AvyhrW24gGRquWCPPZdydBiz81dv
 * Core LOCKED: dpl_8agSZKvcb2pjehzXgMeckDgJvDV8
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHASE2 = join(__dirname, '..');
const ROOT = join(__dirname, '../../../../../../');
const RAW = join(PHASE2, 'raw/acc-דיוק');
const CORE_RAW = join(RAW, 'core');
mkdirSync(RAW, { recursive: true });
mkdirSync(CORE_RAW, { recursive: true });

const DISC_BASE = 'https://akvot-discovery.vercel.app';
const DISC_DPL = 'dpl_AvyhrW24gGRquWCPPZdydBiz81dv';
const CORE_BASE = 'https://akvot-simple-demo.vercel.app';
const CORE_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const FIV_EXPECTED = '2026-09-19.1';

const CORPUS = JSON.parse(readFileSync(join(PHASE2, 'GOLDEN-CORPUS-v0.json'), 'utf8'));

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

function vercelCurl(urlOrPath, { method = 'GET', body = null, deployment = null, extra = [], timeout = 180000 } = {}) {
  const args = ['curl'];
  if (deployment) {
    const path = urlOrPath.startsWith('http')
      ? new URL(urlOrPath).pathname + new URL(urlOrPath).search
      : urlOrPath;
    args.push(path, '--deployment', deployment, '--scope', SCOPE, '--');
  } else {
    args.push(urlOrPath, '--scope', SCOPE, '--');
  }
  args.push('-sS', '-H', 'Accept: application/json', '-H', `Origin: ${CORE_BASE}`, ...extra);
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

function publicCurl(url, { method = 'GET', body = null, timeout = 60000 } = {}) {
  const args = ['-sS', '-H', 'Accept: application/json', '-H', `Origin: ${CORE_BASE}`, '--max-time', String(Math.ceil(timeout / 1000))];
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  }
  args.push(url);
  const t0 = Date.now();
  const r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout });
  const ms = Date.now() - t0;
  let json = null;
  try {
    json = JSON.parse((r.stdout || '').trim());
  } catch (_) {}
  return { url, method, body, ms, exit: r.status, json, text: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
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
    ids.forEach((id, j) => {
      out.push({ path: `contradictions[${i}].findingIds[${j}]`, value: String(id) });
    });
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
  return { findingIds_n: ids.length, leak_n: b23Leaks.length, leaks: b23Leaks };
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
  const file = `${label}.json`;
  const payload = data?.json != null ? data.json : { text: String(data?.text || '').slice(0, 200000), stderr: data?.stderr };
  writeFileSync(join(RAW, file), JSON.stringify(payload, null, 2));
  return file;
}

function saveCoreRaw(label, data) {
  const file = `${label}.json`;
  const payload = data?.json != null ? data.json : { text: String(data?.text || '').slice(0, 200000), stderr: data?.stderr };
  writeFileSync(join(CORE_RAW, file), JSON.stringify(payload, null, 2));
  return file;
}

function analyzeDiscovery(label, seedMeta, req, extras = {}) {
  const j = req.json;
  const snap = j?.snapshot || j;
  const leakHits = deepScanForbidden(j);
  const findings = Array.isArray(snap?.findings) ? snap.findings : Array.isArray(j?.findings) ? j.findings : [];
  const status = snap?.status || j?.status || null;
  const fiv = snap?.forbiddenIdentitiesVersion || j?.forbiddenIdentitiesVersion || null;
  const sessionId = j?.sessionId || snap?.sessionId || extras.sessionId || null;
  const dossier = hasDossier(j);
  const b23 = scrubB23(j);
  const okShape = !!(j && (j.ok !== false) && (sessionId || findings.length || status));
  const pass =
    okShape &&
    leakHits.length === 0 &&
    b23.leak_n === 0 &&
    dossier === false &&
    (fiv === FIV_EXPECTED || fiv == null); // null tolerated only if no body; prefer exact

  const row = {
    id: seedMeta.id,
    label,
    seed: seedMeta.seed,
    category: seedMeta.category || null,
    surface: extras.surface || 'discovery-post',
    sessionId,
    status,
    ui: status,
    findings_n: findings.length,
    leak_n: leakHits.length,
    leak_hits: leakHits.slice(0, 20),
    dossier_bind: dossier,
    contradictions_findingIds_n: b23.findingIds_n,
    b23_Q1701775_hits: b23.leak_n,
    b23_leaks: b23.leaks.slice(0, 10),
    forbiddenIdentitiesVersion: fiv,
    storeBackend: j?.store?.storeBackend || snap?.store?.storeBackend || null,
    durable: j?.store?.durable ?? snap?.store?.durable ?? null,
    ms: req.ms,
    pass: pass && (fiv === FIV_EXPECTED || (okShape && leakHits.length === 0 && !dossier)),
    note: extras.note || seedMeta.notes || null,
    raw_file: extras.raw_file || null,
  };
  // Tighten pass: require fiv match when body present
  if (okShape && fiv !== FIV_EXPECTED) {
    row.pass = false;
    row.fail_reason = `fiv_mismatch expected=${FIV_EXPECTED} got=${fiv}`;
  }
  if (leakHits.length > 0) {
    row.pass = false;
    row.fail_reason = 'forbidden_qid_leak';
  }
  if (b23.leak_n > 0) {
    row.pass = false;
    row.fail_reason = 'b23_contradictions_findingIds_leak';
  }
  if (dossier) {
    row.pass = false;
    row.fail_reason = 'dossier_bind_forbidden_on_discovery';
  }
  if (!okShape) {
    row.pass = false;
    row.fail_reason = row.fail_reason || 'bad_response_shape';
  }
  return row;
}

const started = nowJerusalem();
console.log(`[דיוק] CYCLE1 Phase2 Acc GOLDEN METRICS start ${started}`);
console.log(`[דיוק] Discovery ${DISC_BASE} → ${DISC_DPL}`);
console.log(`[דיוק] Core ${CORE_BASE} → ${CORE_DPL} LOCKED`);
console.log(`[דיוק] Corpus seeds=${CORPUS.seedCount}`);

// --- Health ---
const discHealth = vercelCurl('/api/health', { deployment: DISC_DPL });
const discDiscoveryHealth = vercelCurl('/api/discovery/health', { deployment: DISC_DPL });
saveRaw('disc-health', discHealth);
saveRaw('disc-discovery-health', discDiscoveryHealth);
const discHealthOk = discHealth.json?.build === DISC_DPL;
const storeBackend = discDiscoveryHealth.json?.storeBackend || discHealth.json?.discoveryStore?.storeBackend || null;
console.log(`[health] disc build=${discHealth.json?.build} ok=${discHealthOk} store=${storeBackend}`);

// --- Golden corpus: POST create + GET HIT for each seed ---
const perSeed = [];
let leakageTotal = 0;
let seedsPass = 0;
let seedsFail = 0;
let dossierBindCount = 0;
let emptyCount = 0;
let findingsSum = 0;
const MAX_SEEDS = CORPUS.seeds.length; // all 16; stratified fallback handled by timeout per call

for (const seedMeta of CORPUS.seeds.slice(0, MAX_SEEDS)) {
  console.log(`[corpus] ${seedMeta.id} POST seed=${seedMeta.seed}`);
  const hints = {};
  if (seedMeta.category === 'multilingual' && /[\u0590-\u05FF]/.test(seedMeta.seed)) hints.locale = 'he';
  if (seedMeta.category === 'domain' || seedMeta.category === 'website') hints.kind = 'domain';
  if (seedMeta.category === 'company' || seedMeta.category === 'organization') hints.kind = 'org';

  const body = { seed: seedMeta.seed, hints };
  const postReq = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body,
    deployment: DISC_DPL,
    timeout: 120000,
  });
  const postFile = saveRaw(`create-${seedMeta.id}`, postReq);
  const postRow = analyzeDiscovery(`${seedMeta.id}-post`, seedMeta, postReq, {
    surface: 'discovery-post',
    raw_file: postFile,
  });
  perSeed.push(postRow);
  leakageTotal += postRow.leak_n + postRow.b23_Q1701775_hits;
  findingsSum += postRow.findings_n;
  if (postRow.dossier_bind) dossierBindCount++;
  if (postRow.findings_n === 0) emptyCount++;
  if (postRow.pass) seedsPass++;
  else seedsFail++;
  console.log(
    `  POST → pass=${postRow.pass} status=${postRow.status} findings=${postRow.findings_n} leak=${postRow.leak_n} b23=${postRow.b23_Q1701775_hits} dossier=${postRow.dossier_bind}`
  );

  let getRow = null;
  if (postRow.sessionId) {
    const enc = encodeURIComponent(postRow.sessionId);
    console.log(`[corpus] ${seedMeta.id} GET HIT id=${postRow.sessionId.slice(0, 28)}…`);
    const getReq = vercelCurl(`/api/discovery/sessions/${enc}`, { deployment: DISC_DPL, timeout: 120000 });
    const getFile = saveRaw(`get-${seedMeta.id}`, getReq);
    getRow = analyzeDiscovery(`${seedMeta.id}-get`, seedMeta, getReq, {
      surface: 'discovery-get',
      sessionId: postRow.sessionId,
      raw_file: getFile,
      note: getReq.json?.regenerated ? 'GET regen' : 'GET HIT/sticky',
    });
    getRow.regenerated = getReq.json?.regenerated === true;
    perSeed.push(getRow);
    leakageTotal += getRow.leak_n + getRow.b23_Q1701775_hits;
    if (getRow.dossier_bind) dossierBindCount++;
    if (getRow.pass) seedsPass++;
    else seedsFail++;
    console.log(
      `  GET  → pass=${getRow.pass} status=${getRow.status} findings=${getRow.findings_n} leak=${getRow.leak_n} b23=${getRow.b23_Q1701775_hits}`
    );
  } else {
    seedsFail++;
    console.log(`  GET  → SKIP (no sessionId)`);
  }
}

// --- Adversarial: John Smith + IBM/NY/US + raw Q1701775 inject ---
console.log('[adv] Smith+IBM/NY/US');
const advSmithBody = {
  seed: 'John Smith',
  hints: { org: 'IBM', city: 'New York', country: 'US' },
};
const advSmithPost = vercelCurl('/api/discovery/sessions', {
  method: 'POST',
  body: advSmithBody,
  deployment: DISC_DPL,
});
saveRaw('adv-smith-ctx-post', advSmithPost);
const advSmithPostRow = analyzeDiscovery('adv-smith-ctx-post', { id: 'ADV-SMITH', seed: 'John Smith', category: 'adversarial' }, advSmithPost, {
  surface: 'adversarial-post',
  note: 'Smith+IBM/NY/US — NEVER Q1701775',
  raw_file: 'adv-smith-ctx-post.json',
});
perSeed.push(advSmithPostRow);
leakageTotal += advSmithPostRow.leak_n + advSmithPostRow.b23_Q1701775_hits;

let advSmithGetRow = null;
if (advSmithPostRow.sessionId) {
  const enc = encodeURIComponent(advSmithPostRow.sessionId);
  const advSmithGet = vercelCurl(`/api/discovery/sessions/${enc}`, { deployment: DISC_DPL });
  saveRaw('adv-smith-ctx-get', advSmithGet);
  advSmithGetRow = analyzeDiscovery('adv-smith-ctx-get', { id: 'ADV-SMITH', seed: 'John Smith', category: 'adversarial' }, advSmithGet, {
    surface: 'adversarial-get',
    sessionId: advSmithPostRow.sessionId,
    raw_file: 'adv-smith-ctx-get.json',
  });
  perSeed.push(advSmithGetRow);
  leakageTotal += advSmithGetRow.leak_n + advSmithGetRow.b23_Q1701775_hits;
}

console.log('[adv] inject raw Q1701775 / wd-Q1701775 in hints if API allows');
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
    deployment: DISC_DPL,
  });
  saveRaw(inj.label, req);
  const row = analyzeDiscovery(inj.label, { id: inj.label, seed: inj.seed, category: 'adversarial-inject' }, req, {
    surface: 'adversarial-inject',
    note: 'raw forbidden QID inject — must scrub from emit',
    raw_file: `${inj.label}.json`,
  });
  advInjectRows.push(row);
  perSeed.push(row);
  leakageTotal += row.leak_n + row.b23_Q1701775_hits;
  console.log(`  ${inj.label} → pass=${row.pass} findings=${row.findings_n} leak=${row.leak_n} b23=${row.b23_Q1701775_hits}`);
}

// B23 specifically on Smith-class
const smithClass = perSeed.filter(
  (r) => r.seed === 'John Smith' || (r.seed && String(r.seed).includes('John Smith'))
);
const b23SmithPass = smithClass.every((r) => r.b23_Q1701775_hits === 0 && r.leak_n === 0);

// Aggregates (corpus POST rows only for rates)
const corpusPost = perSeed.filter((r) => r.surface === 'discovery-post' && r.id && /^S\d+/.test(r.id));
const corpusGet = perSeed.filter((r) => r.surface === 'discovery-get' && r.id && /^S\d+/.test(r.id));
const N = corpusPost.length;
const meanFindings = N ? findingsSum / N : 0;
const dossierBindRate = N ? dossierBindCount / (corpusPost.length + corpusGet.length) : 0;
// Recalc empty/dossier from corpus posts only for cleaner rates
const emptyRate = N ? corpusPost.filter((r) => r.findings_n === 0).length / N : 0;
const dossierBindRatePost = N ? corpusPost.filter((r) => r.dossier_bind).length / N : 0;
const corpusPostPass = corpusPost.filter((r) => r.pass).length;
const corpusGetPass = corpusGet.filter((r) => r.pass).length;
const corpusLeak = corpusPost.reduce((a, r) => a + r.leak_n + r.b23_Q1701775_hits, 0) +
  corpusGet.reduce((a, r) => a + r.leak_n + r.b23_Q1701775_hits, 0);

const advPass =
  advSmithPostRow.pass &&
  (!advSmithGetRow || advSmithGetRow.pass) &&
  advInjectRows.every((r) => r.pass);

const goldenVerdict =
  discHealthOk &&
  corpusLeak === 0 &&
  corpusPostPass === N &&
  corpusGetPass === corpusGet.length &&
  b23SmithPass &&
  advPass
    ? 'PASS'
    : 'FAIL';

const finished = nowJerusalem();

const goldenJson = {
  doc: 'ACC-GOLDEN-METRICS-דיוק-2026-09-20',
  role: 'דיוק',
  phase: 'CYCLE1-PHASE2-OBSERVATION',
  checked: started,
  finished,
  alias: DISC_BASE,
  deploymentId: DISC_DPL,
  baselineId: 'B0',
  promote: false,
  hold_promote: true,
  no_code_changes: true,
  corpus: {
    file: 'GOLDEN-CORPUS-v0.json',
    seedCount: CORPUS.seedCount,
    seedsRun: N,
  },
  health: {
    build: discHealth.json?.build || null,
    build_match: discHealthOk,
    storeBackend,
    durable: discDiscoveryHealth.json?.durable ?? null,
    promoteEligible: discDiscoveryHealth.json?.promoteEligible ?? null,
  },
  verdict: goldenVerdict,
  aggregates: {
    leakageTotal: corpusLeak,
    leakageTotal_incl_adversarial: leakageTotal,
    seedsPass: corpusPostPass,
    seedsFail: N - corpusPostPass,
    seedsPassGet: corpusGetPass,
    seedsFailGet: corpusGet.length - corpusGetPass,
    seedsN: N,
    seedsM: CORPUS.seedCount,
    dossierBindRate: dossierBindRatePost,
    emptyRate,
    meanFindings: Math.round(meanFindings * 1000) / 1000,
    b23_smith_class_pass: b23SmithPass,
    adversarial_pass: advPass,
  },
  perSeed,
  adversarial: {
    smith_ctx: { post: advSmithPostRow, get: advSmithGetRow },
    inject: advInjectRows,
  },
  invariants: {
    'ACC-DISC-01': 'leakage=0',
    'ACC-DISC-02': 'Discovery never binds dossier for generic seeds',
    'ACC-DISC-06': 'NEVER Q1701775 on any emit surface',
    B23: 'contradictions[].findingIds NEVER Q1701775 / wd-Q1701775 / wd_Q1701775',
    fiv: FIV_EXPECTED,
  },
  raw_dir: 'raw/acc-דיוק/',
};

writeFileSync(join(PHASE2, 'ACC-GOLDEN-METRICS-דיוק-2026-09-20.json'), JSON.stringify(goldenJson, null, 2));

const yn = (b) => (b ? 'PASS' : 'FAIL');
const goldenMd = `# ACC GOLDEN METRICS · דיוק · 2026-09-20

**Checked:** ${started} → ${finished} (Asia/Jerusalem, UTC+3)  
**Phase:** CYCLE1 Phase 2 Observation · **NO promote** · **NO code** · **NO Core touch**  
**Discovery alias (B0):** \`${DISC_BASE}\` → \`${DISC_DPL}\`  
**Core (LOCKED):** \`${CORE_BASE}\` → \`${CORE_DPL}\`  
**Corpus:** \`GOLDEN-CORPUS-v0.json\` · ${N}/${CORPUS.seedCount} seeds  
**Access:** \`vercel curl --deployment ${DISC_DPL} --scope ${SCOPE}\` (alias SSO 302)

## Verdict

| Gate | Result | Detail |
|------|--------|--------|
| **Acc Golden Corpus** | **${goldenVerdict}** | Seeds ${corpusPostPass}/${N} POST · ${corpusGetPass}/${corpusGet.length} GET · leak=${corpusLeak} |
| B23 contradictions scrub (Smith-class) | **${yn(b23SmithPass)}** | findingIds Q1701775 hits=0 |
| Adversarial Smith+IBM/NY/US + inject | **${yn(advPass)}** | POST+GET + raw QID inject scrub |
| storeBackend | ${storeBackend || 'n/a'} | expect upstash |
| Health build match Avyhr | **${yn(discHealthOk)}** | observed \`${discHealth.json?.build || 'n/a'}\` |

## Aggregates

| Metric | Value |
|--------|-------|
| leakageTotal | **${corpusLeak}** |
| seedsPass / seedsFail (POST) | **${corpusPostPass}** / **${N - corpusPostPass}** |
| seedsPass / seedsFail (GET) | **${corpusGetPass}** / **${corpusGet.length - corpusGetPass}** |
| Seeds N/M | **${N}/${CORPUS.seedCount}** |
| dossierBindRate | ${dossierBindRatePost} |
| emptyRate | ${emptyRate} |
| meanFindings | ${Math.round(meanFindings * 1000) / 1000} |

## Per-seed (POST create + GET HIT)

| ID | Seed | surface | status | findings | leak | dossier | b23 Q170 | fiv | Result |
|----|------|---------|--------|----------|------|---------|----------|-----|--------|
${perSeed
  .filter((r) => r.surface === 'discovery-post' || r.surface === 'discovery-get')
  .map(
    (r) =>
      `| ${r.id} | ${String(r.seed).replace(/\|/g, '/')} | ${r.surface} | ${r.status ?? '—'} | ${r.findings_n} | ${r.leak_n} | ${r.dossier_bind} | ${r.b23_Q1701775_hits} | ${r.forbiddenIdentitiesVersion ?? '—'} | **${yn(r.pass)}** |`
  )
  .join('\n')}

## Adversarial

| Case | status | findings | leak | b23 | Result |
|------|--------|----------|------|-----|--------|
| Smith+IBM/NY/US POST | ${advSmithPostRow.status} | ${advSmithPostRow.findings_n} | ${advSmithPostRow.leak_n} | ${advSmithPostRow.b23_Q1701775_hits} | **${yn(advSmithPostRow.pass)}** |
| Smith+IBM/NY/US GET | ${advSmithGetRow?.status ?? '—'} | ${advSmithGetRow?.findings_n ?? '—'} | ${advSmithGetRow?.leak_n ?? '—'} | ${advSmithGetRow?.b23_Q1701775_hits ?? '—'} | **${yn(!!advSmithGetRow?.pass)}** |
${advInjectRows
  .map(
    (r) =>
      `| ${r.label} | ${r.status ?? '—'} | ${r.findings_n} | ${r.leak_n} | ${r.b23_Q1701775_hits} | **${yn(r.pass)}** |`
  )
  .join('\n')}

### Invariants
- **ACC-DISC-01** leakage=0
- **ACC-DISC-02** Discovery never binds dossier for generic seeds
- **ACC-DISC-06** NEVER Q1701775 on any emit surface
- **B23** \`contradictions[].findingIds\` scrub — NEVER Q1701775 / wd-Q1701775 / wd_Q1701775
- \`forbiddenIdentitiesVersion\` expected \`${FIV_EXPECTED}\`

## Artifacts
- JSON: \`ACC-GOLDEN-METRICS-דיוק-2026-09-20.json\`
- MD: \`ACC-GOLDEN-METRICS-דיוק-2026-09-20.md\`
- Raw: \`raw/acc-דיוק/\`
- Runner: \`scripts/run-acc-golden-metrics-דיוק-2026-09-20.mjs\`

## Decision
- Acc corpus: **${goldenVerdict}** · leakageTotal=${corpusLeak} · Seeds ${N}/${CORPUS.seedCount} · B23 **${yn(b23SmithPass)}** · adversarial **${yn(advPass)}**
- **HOLD promote** · no code · Core untouched
`;

writeFileSync(join(PHASE2, 'ACC-GOLDEN-METRICS-דיוק-2026-09-20.md'), goldenMd);
console.log(`[דיוק] Golden metrics written · verdict=${goldenVerdict}`);

// ========== CORE SMOKE ==========
console.log('[core] smoke on LOCKED alias');
const coreStarted = nowJerusalem();
const coreHealth = publicCurl(`${CORE_BASE}/api/health`);
// Prefer vercel curl if public somehow diverges
const coreHealthVc = vercelCurl('/api/health', { deployment: CORE_DPL });
saveCoreRaw('health-public', coreHealth);
saveCoreRaw('health-vercel', coreHealthVc);
const coreBuild = coreHealth.json?.build || coreHealthVc.json?.build;
const coreBuildOk = coreBuild === CORE_DPL && coreBuild !== DISC_DPL;

function analyzeCore(label, req) {
  const j = req.json || {};
  const leakHits = deepScanForbidden(j);
  const ui = j.uiState || j.ui || j.mode || null;
  const qid = j.qid || j.entityId || j?.dossier?.qid || j?.selected?.qid || null;
  const faces = facesCount(j);
  const pw = typeof j.prettyWrong === 'number' ? j.prettyWrong : j.pw === true ? 1 : j.prettyWrong === true ? 1 : 0;
  const fiv = j.forbiddenIdentitiesVersion || null;
  return {
    case: label,
    uiState: ui,
    qid,
    faces,
    leakage: leakHits.length,
    leak_hits: leakHits.slice(0, 10),
    pw,
    forbiddenIdentitiesVersion: fiv,
    requestId: j.requestId || j.correlationId || null,
    ms: req.ms,
    raw_file: null,
  };
}

const assafReq = publicCurl(`${CORE_BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}&nocache=1`);
saveCoreRaw('assaf', assafReq);
const assaf = analyzeCore('assaf', assafReq);
assaf.pass = assaf.uiState === 'dossier' && assaf.qid === 'Q47507930' && assaf.leakage === 0;
console.log(`  Assaf → pass=${assaf.pass} ui=${assaf.uiState} qid=${assaf.qid} faces=${assaf.faces}`);

const cohenReq = publicCurl(`${CORE_BASE}/api/lookup?q=${encodeURIComponent('כהן')}&nocache=1`);
saveCoreRaw('cohen', cohenReq);
const cohen = analyzeCore('cohen', cohenReq);
cohen.pass =
  ['need_context', 'thin', 'candidates'].includes(cohen.uiState) &&
  cohen.faces === 0 &&
  cohen.leakage === 0 &&
  cohen.qid !== 'Q1701775';
console.log(`  כהן → pass=${cohen.pass} ui=${cohen.uiState} faces=${cohen.faces}`);

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
console.log(`  Smith nocache → pass=${smithNc.pass} ui=${smithNc.uiState} qid=${smithNc.qid}`);

const smithWarmReq = publicCurl(`${CORE_BASE}/api/lookup`, { method: 'POST', body: smithBody });
saveCoreRaw('smith-warm', smithWarmReq);
const smithWarm = analyzeCore('smith-warm', smithWarmReq);
smithWarm.pass =
  ['candidates', 'thin', 'need_context'].includes(smithWarm.uiState) &&
  smithWarm.leakage === 0 &&
  smithWarm.qid !== 'Q1701775' &&
  !String(smithWarm.qid || '').includes('1701775') &&
  smithWarm.faces === 0;
console.log(`  Smith warm → pass=${smithWarm.pass} ui=${smithWarm.uiState} qid=${smithWarm.qid}`);

const coreCases = [assaf, cohen, smithNc, smithWarm];
const coreLeak = coreCases.reduce((a, c) => a + c.leakage, 0);
const corePw = coreCases.reduce((a, c) => a + (c.pw || 0), 0);
const coreVerdict =
  coreBuildOk && assaf.pass && cohen.pass && smithNc.pass && smithWarm.pass && coreLeak === 0 && corePw === 0
    ? 'PASS'
    : 'FAIL';
const coreFinished = nowJerusalem();

const coreJson = {
  doc: 'ACC-CORE-SMOKE-דיוק-2026-09-20',
  role: 'דיוק',
  phase: 'CYCLE1-PHASE2-OBSERVATION',
  checked: coreStarted,
  finished: coreFinished,
  alias: CORE_BASE,
  dpl: CORE_DPL,
  observed_build: coreBuild,
  promote: false,
  hold_promote: true,
  no_code_changes: true,
  verdict: coreVerdict,
  leakage_total: coreLeak,
  pw_total: corePw,
  checks: {
    health_build_match: coreBuildOk,
    still_8ag_not_Avyhr: coreBuild === CORE_DPL && coreBuild !== DISC_DPL,
    assaf_dossier_qid: assaf.pass,
    cohen_soft: cohen.pass,
    smith_nocache: smithNc.pass,
    smith_warm: smithWarm.pass,
    smith_never_Q1701775: smithNc.pass && smithWarm.pass,
    leakage_0: coreLeak === 0,
    pw_0: corePw === 0,
  },
  cases: coreCases,
  forbiddenIdentitiesVersion: FIV_EXPECTED,
  summary: {
    'Core-P0': coreVerdict,
    leakage: coreLeak,
    pw: corePw,
    promote: 'NO · HOLD',
    core_build_still_8ag: coreBuildOk,
  },
  raw_dir: 'raw/acc-דיוק/core/',
};

writeFileSync(join(PHASE2, 'ACC-CORE-SMOKE-דיוק-2026-09-20.json'), JSON.stringify(coreJson, null, 2));

const coreMd = `# ACC CORE SMOKE · דיוק · 2026-09-20

**Checked:** ${coreStarted} → ${coreFinished} (Asia/Jerusalem, UTC+3)  
**Phase:** CYCLE1 Phase 2 Observation · **NO promote** · **NO Core touch** · **NO code**  
**Core production (LOCKED):** \`${CORE_BASE}\` → \`${CORE_DPL}\`  
**Must prove:** still \`dpl_8ag…\` · **not** Avyhr Discovery dpl

## Verdict

| Gate | Result | Detail |
|------|--------|--------|
| **Core Acc P0** | **${coreVerdict}** | Assaf/כהן/Smith · pw=${corePw} · leak=${coreLeak} |
| health.build still \`dpl_8ag…\` | **${yn(coreBuildOk)}** | observed \`${coreBuild}\` |
| Assaf → Q47507930 | **${yn(assaf.pass)}** | ui=\`${assaf.uiState}\` · qid=\`${assaf.qid}\` · faces=${assaf.faces} |
| כהן soft | **${yn(cohen.pass)}** | ui=\`${cohen.uiState}\` · faces=${cohen.faces} |
| Smith POST+ctx nocache | **${yn(smithNc.pass)}** | ui=\`${smithNc.uiState}\` · qid=\`${smithNc.qid}\` · never Q1701775 |
| Smith POST+ctx warm | **${yn(smithWarm.pass)}** | ui=\`${smithWarm.uiState}\` · qid=\`${smithWarm.qid}\` · never Q1701775 |
| Acc leakage / pw | **${yn(coreLeak === 0 && corePw === 0)}** | leak=${coreLeak} · pw=${corePw} |

## Cases

| Case | ui | qid | faces | leak | pw | Result |
|------|-----|-----|-------|------|-----|--------|
| assaf | ${assaf.uiState} | ${assaf.qid} | ${assaf.faces} | ${assaf.leakage} | ${assaf.pw} | **${yn(assaf.pass)}** |
| cohen | ${cohen.uiState} | ${cohen.qid ?? 'null'} | ${cohen.faces} | ${cohen.leakage} | ${cohen.pw} | **${yn(cohen.pass)}** |
| smith-nocache | ${smithNc.uiState} | ${smithNc.qid ?? 'null'} | ${smithNc.faces} | ${smithNc.leakage} | ${smithNc.pw} | **${yn(smithNc.pass)}** |
| smith-warm | ${smithWarm.uiState} | ${smithWarm.qid ?? 'null'} | ${smithWarm.faces} | ${smithWarm.leakage} | ${smithWarm.pw} | **${yn(smithWarm.pass)}** |

## Artifacts
- JSON: \`ACC-CORE-SMOKE-דיוק-2026-09-20.json\`
- MD: \`ACC-CORE-SMOKE-דיוק-2026-09-20.md\`
- Raw: \`raw/acc-דיוק/core/\`

## Decision
- Core smoke: **${coreVerdict}** · build \`${coreBuild}\`
- **HOLD promote** · Core alias remains **LOCKED**
`;

writeFileSync(join(PHASE2, 'ACC-CORE-SMOKE-דיוק-2026-09-20.md'), coreMd);

console.log('\n========== דיוק PHASE2 Acc DONE ==========');
console.log(`Acc corpus: ${goldenVerdict} · leakageTotal=${corpusLeak} · Seeds ${N}/${CORPUS.seedCount} · B23=${b23SmithPass} · adversarial=${advPass}`);
console.log(`Core smoke: ${coreVerdict} · build ${coreBuild}`);
console.log('HOLD promote · no code');
