#!/usr/bin/env node
/**
 * Acc P0 POST-PROMOTE SMOKE — דיוק · production alias · NO further deploy
 * 1) Assaf → dossier Q47507930
 * 2) POST Smith+IBM/NY/US COLD+WARM×2 — NEVER Q1701775 · faces=0 · pw=0
 * 3) כהן → need_context|thin never dossier
 * 4) John Rappaport → not Assaf QID
 * Entity-Agnostic: Acc fixtures must be multi-seed; no David Cohen-only golden path
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://akvot-simple-demo.vercel.app';
const ORIGIN = BASE;
const DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const SCOPE = 'k-akvot';
const RAW = '/workspace/akvot-quick-demo/test-results/wp3/ACC-P0-POST-PROMOTE-SMOKE-דיוק-raw';
const OUT_MD = '/workspace/akvot-quick-demo/test-results/wp3/ACC-P0-POST-PROMOTE-SMOKE-דיוק-2026-09-20.md';
const OUT_JSON = '/workspace/akvot-quick-demo/test-results/wp3/ACC-P0-POST-PROMOTE-SMOKE-דיוק-2026-09-20.json';
const FORBIDDEN = /Q1701775|wd-Q1701775/i;
const SMITH = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };
const SOFT = new Set(['candidates', 'thin', 'need_context']);
const ASSAF_QID = 'Q47507930';

mkdirSync(RAW, { recursive: true });

function nowJerusalem() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'medium', hour12: false,
  }).format(new Date()).replace(' ', 'T') + '+03:00';
}

function publicFetch(url, { method = 'GET', bodyObj = null } = {}) {
  const args = ['-sS', '-D', '-', '-o', '/tmp/acc-smoke-body.json', '-w', '\n__HTTP_CODE__:%{http_code}\n',
    '-H', `Origin: ${ORIGIN}`, '-H', 'Accept: application/json', '--max-time', '120'];
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(bodyObj || {}));
  }
  args.push(url);
  const t0 = Date.now();
  const r = spawnSync('curl', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 130000 });
  const ms = Date.now() - t0;
  const stdout = r.stdout || '';
  const codeMatch = stdout.match(/__HTTP_CODE__:(\d+)/);
  const status = codeMatch ? Number(codeMatch[1]) : (r.status || 0);
  const headerPart = stdout.split('\n__HTTP_CODE__:')[0] || '';
  let bodyText = '';
  try { bodyText = readFileSync('/tmp/acc-smoke-body.json', 'utf8'); } catch (_) { bodyText = ''; }
  let json = null;
  try { json = bodyText ? JSON.parse(bodyText) : null; } catch (_) {}
  const headers = {};
  for (const line of headerPart.split(/\r?\n/)) {
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (m) headers[m[1].toLowerCase()] = m[2].trim();
  }
  return { ms, status, json, text: bodyText, headers, access: 'public-fetch', err: json ? null : (r.stderr || `HTTP ${status}`) };
}

function vercelCurl(url, { method = 'GET', bodyObj = null } = {}) {
  const args = ['curl', url, '--scope', SCOPE, '--', '-sS', '-H', `Origin: ${ORIGIN}`, '-H', 'Accept: application/json'];
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(bodyObj || {}));
  }
  const t0 = Date.now();
  const r = spawnSync('vercel', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 120000 });
  const ms = Date.now() - t0;
  const out = (r.stdout || '').trim();
  const lines = out.split('\n');
  let jsonLine = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i].trim();
    if (l.startsWith('{') || l.startsWith('[')) { jsonLine = l; break; }
  }
  let json = null;
  try { json = jsonLine ? JSON.parse(jsonLine) : null; } catch (_) {}
  return {
    ms, status: json ? 200 : (r.status || 0), json, text: jsonLine || out,
    headers: {}, access: 'vercel-curl-scope', err: json ? null : (r.stderr || `exit ${r.status}`),
  };
}

function request(url, opts = {}) {
  const pub = publicFetch(url, opts);
  if (pub.status === 200 && pub.json) return pub;
  if (pub.status === 401 || pub.status === 403 || pub.status === 307 || pub.status === 308 || pub.status === 302) {
    process.stderr.write(`  public ${pub.status} → scoped fallback\n`);
    return vercelCurl(url, opts);
  }
  if (!pub.json) {
    process.stderr.write(`  public fail (${pub.status}) → scoped fallback\n`);
    return vercelCurl(url, opts);
  }
  return pub;
}

function scanLeak(text) {
  const hits = [];
  const re = /Q1701775|wd-Q1701775/gi;
  let m;
  while ((m = re.exec(String(text || ''))) !== null) hits.push(m[0]);
  return hits;
}

function facesOf(j) {
  if (!j) return null;
  if (Array.isArray(j.images)) return j.images.length;
  if (typeof j.faces === 'number') return j.faces;
  if (Array.isArray(j.faces)) return j.faces.length;
  if (j.faces === false) return 0;
  if (j.faces === true) return 1;
  return 0;
}

function summarize(label, req) {
  const j = req.json;
  const text = req.text || (j ? JSON.stringify(j) : '');
  const hits = scanLeak(text);
  const candidates = Array.isArray(j?.candidates) ? j.candidates : [];
  const sources = Array.isArray(j?.sources) ? j.sources : [];
  const ui = j?.uiState ?? j?.ui ?? j?.mode ?? null;
  const qid = j?.qid ?? j?.dossier?.qid ?? null;
  const faces = facesOf(j);
  const out = {
    label,
    method: req.method || null,
    url: req.url || null,
    request_body: req.body ?? null,
    ms: req.ms,
    status: req.status,
    access: req.access,
    headers: {
      'cache-control': req.headers?.['cache-control'] || null,
      age: req.headers?.age || null,
      'content-type': req.headers?.['content-type'] || null,
      date: req.headers?.date || null,
      'x-vercel-cache': req.headers?.['x-vercel-cache'] || null,
      'x-vercel-id': req.headers?.['x-vercel-id'] || null,
    },
    err: req.err,
    ui,
    mode: j?.mode ?? null,
    uiState: j?.uiState ?? null,
    qid,
    faces,
    candidates_count: candidates.length,
    candidate_ids: candidates.slice(0, 10).map(c => c?.id ?? c?.qid ?? null),
    leakage_count: hits.length,
    leakage_terms: hits,
    candidate_leakage_count: scanLeak(JSON.stringify(candidates)).length,
    source_leakage_count: scanLeak(JSON.stringify(sources)).length,
    forbiddenIdentitiesVersion: j?.forbiddenIdentitiesVersion ?? j?.meta?.forbiddenIdentitiesVersion ?? null,
    requestId: j?.requestId || j?.rid || null,
    raw_file: `${label}.json`,
  };
  writeFileSync(join(RAW, out.raw_file), text || JSON.stringify({ error: req.err }, null, 2));
  return out;
}

function doReq(label, url, opts = {}) {
  process.stderr.write(`[${label}] ... `);
  const r = request(url, opts);
  r.method = opts.method || 'GET';
  r.url = url;
  r.body = opts.bodyObj ?? null;
  const out = summarize(label, r);
  process.stderr.write(`${out.ui || '?'} qid=${out.qid || 'null'} faces=${out.faces} leak=${out.leakage_count} ${out.ms}ms\n`);
  return out;
}

const started = nowJerusalem();
const startedIso = new Date().toISOString();

const healthRaw = (() => {
  const r = request(`${BASE}/api/health`);
  r.method = 'GET'; r.url = `${BASE}/api/health`; r.body = null;
  const out = summarize('health', r);
  out.build = r.json?.build ?? null;
  out.build_match = out.build === DPL;
  return out;
})();
process.stderr.write(`[health] build=${healthRaw.build} match=${healthRaw.build_match} ${healthRaw.ms}ms\n`);

const cases = [];
cases.push(doReq('assaf', `${BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}`));
cases.push(doReq('cohen', `${BASE}/api/lookup?q=${encodeURIComponent('כהן')}`));
cases.push(doReq('smith-cold', `${BASE}/api/lookup`, { method: 'POST', bodyObj: { ...SMITH, nocache: 1 } }));
cases.push(doReq('smith-warm-1', `${BASE}/api/lookup`, { method: 'POST', bodyObj: SMITH }));
cases.push(doReq('smith-warm-2', `${BASE}/api/lookup`, { method: 'POST', bodyObj: SMITH }));
cases.push(doReq('john-rappaport', `${BASE}/api/lookup?q=${encodeURIComponent('John Rappaport')}`));

const by = Object.fromEntries(cases.map(c => [c.label, c]));

const assafPass = by.assaf.status === 200 && by.assaf.ui === 'dossier' && by.assaf.qid === ASSAF_QID && by.assaf.leakage_count === 0;
const cohenPass = by.cohen.status === 200
  && ['need_context', 'thin'].includes(by.cohen.ui)
  && by.cohen.ui !== 'dossier'
  && by.cohen.leakage_count === 0;
const smithRows = [by['smith-cold'], by['smith-warm-1'], by['smith-warm-2']];
const smithPass = smithRows.every(x =>
  x.status === 200
  && SOFT.has(x.ui)
  && x.ui !== 'dossier'
  && x.faces === 0
  && x.leakage_count === 0
  && x.candidate_leakage_count === 0
  && x.source_leakage_count === 0
  && (x.qid == null || !FORBIDDEN.test(String(x.qid)))
);
const johnPass = by['john-rappaport'].status === 200
  && by['john-rappaport'].leakage_count === 0
  && by['john-rappaport'].qid !== ASSAF_QID;

// Body scan all raw files
let bodyHits = 0;
const offenders = [];
const rawFiles = readdirSync(RAW).filter(f => f.endsWith('.json') && f !== 'run-post-promote-smoke.mjs');
for (const f of rawFiles) {
  const t = readFileSync(join(RAW, f), 'utf8');
  const h = scanLeak(t);
  if (h.length) { bodyHits += h.length; offenders.push(f); }
}

const leakage_count = cases.reduce((n, c) => n + c.leakage_count, 0) + (healthRaw.leakage_count || 0);
const pw = (leakage_count > 0 || bodyHits > 0) ? 1 : 0;
const pass = !!(healthRaw.build_match && assafPass && cohenPass && smithPass && johnPass && leakage_count === 0 && bodyHits === 0 && pw === 0);
const closed = pass ? 'GO' : 'NO-GO';

const finished = nowJerusalem();
const result = {
  meta: {
    title: 'ACC-P0-POST-PROMOTE-SMOKE',
    role: 'דיוק',
    date: '2026-09-20',
    checked_at: started,
    finished_at: finished,
    started_iso: startedIso,
    timezone: 'Asia/Jerusalem (UTC+3)',
    base: BASE,
    origin: ORIGIN,
    scope: SCOPE,
    required_deployment: DPL,
    promote: false,
    further_deploy: false,
    core_patch: false,
    phase_b: 'HOLD',
    forbidden_pattern: 'Q1701775|wd-Q1701775',
    access_attempt: 'public fetch first; scoped fallback only on 403/redirect',
    entity_agnostic_note: 'Acc fixtures must be multi-seed; no David Cohen-only golden path. This smoke uses Assaf Rappaport, John Smith+IBM/NY/US, כהן (bare), and John Rappaport — four distinct seeds spanning dossier / soft-candidates / need_context / non-Assaf-QID paths.',
  },
  health: healthRaw,
  cases,
  checks: {
    health_build: !!healthRaw.build_match,
    assaf: assafPass,
    cohen: cohenPass,
    john_smith_cold_warm_x2: smithPass,
    john_rappaport: johnPass,
    body_scan_Q1701775: bodyHits === 0,
  },
  body_scan: { files: rawFiles.length, hits: bodyHits, offenders },
  leakage_count,
  pw,
  status: pass ? 'PASS' : 'FAIL',
  Acc_CLOSED: closed,
  abort_fail: !pass,
  notes: [
    'Post-promote production-alias smoke only; NO further deploy, no Core, no Phase B, no load.',
    'Smith sequence: one nocache COLD + two WARM POSTs with IBM/New York/US context.',
    'pw := 1 iff any Q1701775 / wd-Q1701775 leakage in responses or body scan; else 0.',
    'Entity-Agnostic: Acc fixtures must be multi-seed; no David Cohen-only golden path.',
  ],
};

writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n');

const md = `# Acc P0 POST-PROMOTE SMOKE · דיוק · 2026-09-20

**STATUS:** Acc CLOSED **${closed}** · smoke **${result.status}** · **NO further deploy**  
**When:** ${started} → ${finished} (Asia/Jerusalem UTC+3)

## Target
| Field | Value |
|-------|--------|
| BASE / alias | \`${BASE}\` |
| Expected build | \`${DPL}\` |
| health.build | \`${healthRaw.build ?? 'null'}\` · match=${healthRaw.build_match} |
| Access | public fetch first; scoped \`vercel curl --scope k-akvot\` fallback only on 403/redirect |
| Constraints | measure only · no further deploy · Phase B HOLD |

## HARD invariant
| Check | Result |
|-------|--------|
| Q1701775 / wd-Q1701775 anywhere | **${bodyHits}** hits (files=${rawFiles.length}) |
| leakage_count | **${leakage_count}** |
| pw | **${pw}** |
| faces on Smith soft path | **0 required** · observed cold=${by['smith-cold'].faces} warm1=${by['smith-warm-1'].faces} warm2=${by['smith-warm-2'].faces} |
| STOP Acc FAIL if any Q1701775 | ${pw > 0 || bodyHits > 0 ? 'TRIGGERED' : 'not triggered'} |

## Smoke checks
| Check | Result | Key evidence |
|---|---|---|
| GET /api/health | ${healthRaw.build_match ? 'PASS' : 'FAIL'} | status=${healthRaw.status}, build=${healthRaw.build ?? 'null'} |
| Assaf → dossier Q47507930 | ${assafPass ? 'PASS' : 'FAIL'} | ui=${by.assaf.ui}, qid=${by.assaf.qid}, leakage=${by.assaf.leakage_count} |
| כהן → need_context\\|thin never dossier | ${cohenPass ? 'PASS' : 'FAIL'} | ui=${by.cohen.ui}, faces=${by.cohen.faces}, qid=${by.cohen.qid ?? 'null'}, leakage=${by.cohen.leakage_count} |
| Smith POST COLD nocache | ${smithRows[0].status===200 && SOFT.has(smithRows[0].ui) && smithRows[0].faces===0 && smithRows[0].leakage_count===0 ? 'PASS' : 'FAIL'} | ui=${by['smith-cold'].ui}, faces=${by['smith-cold'].faces}, qid=${by['smith-cold'].qid ?? 'null'}, leak=${by['smith-cold'].leakage_count}, ${by['smith-cold'].ms}ms |
| Smith POST WARM #1 | ${smithRows[1].status===200 && SOFT.has(smithRows[1].ui) && smithRows[1].faces===0 && smithRows[1].leakage_count===0 ? 'PASS' : 'FAIL'} | ui=${by['smith-warm-1'].ui}, faces=${by['smith-warm-1'].faces}, qid=${by['smith-warm-1'].qid ?? 'null'}, leak=${by['smith-warm-1'].leakage_count}, ${by['smith-warm-1'].ms}ms |
| Smith POST WARM #2 | ${smithRows[2].status===200 && SOFT.has(smithRows[2].ui) && smithRows[2].faces===0 && smithRows[2].leakage_count===0 ? 'PASS' : 'FAIL'} | ui=${by['smith-warm-2'].ui}, faces=${by['smith-warm-2'].faces}, qid=${by['smith-warm-2'].qid ?? 'null'}, leak=${by['smith-warm-2'].leakage_count}, ${by['smith-warm-2'].ms}ms |
| John Rappaport → not Assaf QID | ${johnPass ? 'PASS' : 'FAIL'} | ui=${by['john-rappaport'].ui}, qid=${by['john-rappaport'].qid ?? 'null'}, leakage=${by['john-rappaport'].leakage_count} |
| Body scan Q1701775 | ${bodyHits === 0 ? 'PASS' : 'FAIL'} | files=${rawFiles.length}, hits=${bodyHits} |
| **leakage** | **${leakage_count}** | |
| **pw** | **${pw}** | |
| **Acc CLOSED** | **${closed}** | |

## Entity-Agnostic (doc note)
Acc fixtures **must be multi-seed**; there is **no David Cohen-only golden path**. This smoke covers four distinct seeds:
1. **Assaf Rappaport** — known dossier hit (\`Q47507930\`)
2. **John Smith + IBM/NY/US** — soft candidates path; denylist scrub (never \`Q1701775\`)
3. **כהן** (bare Hebrew) — \`need_context|thin\`, never dossier
4. **John Rappaport** — must not resolve to Assaf QID

## Verdict / stop line
**${result.status}.** Post-promote Acc smoke on NEW alias \`dpl\` \`${DPL}\`. **pw=${pw} · leakage=${leakage_count} · Acc CLOSED ${closed}.** Phase B remains HOLD. **NO further deploy.**

## Artifacts
- \`${OUT_MD.replace('/workspace/akvot-quick-demo/', '')}\`
- \`${OUT_JSON.replace('/workspace/akvot-quick-demo/', '')}\`
- Raw: \`test-results/wp3/ACC-P0-POST-PROMOTE-SMOKE-דיוק-raw/\`
`;

writeFileSync(OUT_MD, md);
console.log(JSON.stringify({
  status: result.status,
  pw,
  leakage_count,
  Acc_CLOSED: closed,
  checks: result.checks,
  health_build: healthRaw.build,
  output_md: OUT_MD,
  output_json: OUT_JSON,
}, null, 2));
