#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://akvot-simple-demo-4ij5qy655-k-akvot.vercel.app';
const ORIGIN = 'https://akvot-simple-demo.vercel.app';
const DPL = 'dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ';
const SCOPE = 'k-akvot';
const FORBIDDEN = /Q1701775|wd-Q1701775/ig;
const RAW = join(process.cwd(), 'test-results/wp3/ACC-P0-PREPROMOTE-raw');
const OUT_JSON = join(process.cwd(), 'test-results/wp3/ACC-P0-PREPROMOTE-CONTRACTS-בודק-2026-09-20.json');
const OUT_MD = join(process.cwd(), 'test-results/wp3/ACC-P0-PREPROMOTE-CONTRACTS-בודק-2026-09-20.md');
const SMITH = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };
mkdirSync(RAW, { recursive: true });

function nowJerusalem() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'medium', hour12: false }).format(new Date()).replace(' ', 'T') + '+03:00';
}

function request(url, { method='GET', body=null } = {}) {
  const args = ['curl', url, '--scope', SCOPE, '--', '-sS', '-H', `Origin: ${ORIGIN}`, '-H', 'Accept: application/json'];
  if (method === 'POST') args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  const t0 = Date.now();
  const r = spawnSync('vercel', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 120000 });
  const ms = Date.now() - t0;
  const stdout = r.stdout || '';
  const lines = stdout.split('\n').map(s => s.trim()).filter(Boolean);
  let json = null, jsonLine = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('{') || lines[i].startsWith('[')) {
      jsonLine = lines[i];
      try { json = JSON.parse(jsonLine); } catch (_) {}
      if (json) break;
    }
  }
  const text = jsonLine || stdout.trim();
  const err = json ? null : ((r.stderr || '').trim() || `No JSON response (exit ${r.status ?? 'unknown'})`);
  return { url, method, body, ms, status: json ? 200 : (r.status || 0), json, text, stderr: (r.stderr || '').trim(), err };
}

function leaks(text) {
  const hits = String(text || '').match(FORBIDDEN) || [];
  return hits.map(x => x.toLowerCase());
}
function uiOf(j) { return j?.uiState ?? j?.mode ?? j?.ui ?? null; }
function qidOf(j) { return j?.qid ?? j?.dossier?.qid ?? null; }
function facesCountOf(j) {
  if (Array.isArray(j?.images)) return j.images.length;
  if (typeof j?.faces === 'number') return j.faces;
  if (j?.faces === false) return 0;
  if (j?.faces === true) return 1;
  return null;
}
function summary(label, req) {
  const payloadText = req.json ? JSON.stringify(req.json) : req.text;
  const hitTerms = leaks(payloadText);
  const j = req.json;
  const candidates = Array.isArray(j?.candidates) ? j.candidates : [];
  const sources = Array.isArray(j?.sources) ? j.sources : [];
  const candidateText = JSON.stringify(candidates);
  const sourceText = JSON.stringify(sources);
  const out = {
    label, method: req.method, url: req.url, request_body: req.body, ms: req.ms, status: req.status,
    err: req.err, ui: uiOf(j), mode: j?.mode ?? null, uiState: j?.uiState ?? null,
    qid: qidOf(j), faces: facesCountOf(j) === 0 ? 0 : facesCountOf(j),
    candidates_count: candidates.length, candidate_ids: candidates.slice(0, 10).map(c => c?.id ?? c?.qid ?? null),
    leakage_count: hitTerms.length, leakage_terms: hitTerms,
    candidate_leakage_count: leaks(candidateText).length, source_leakage_count: leaks(sourceText).length,
    raw_file: `${label}.json`
  };
  writeFileSync(join(RAW, out.raw_file), req.text || JSON.stringify({ error: req.err, stderr: req.stderr }, null, 2));
  return { req, out };
}

const started = nowJerusalem();
const cases = [];
const healthReq = request(`${BASE}/api/health`);
const health = { ...summary('health', healthReq).out, build: healthReq.json?.build ?? null, build_match: healthReq.json?.build === DPL };

const assaf = summary('assaf-get', request(`${BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}`));
const cohen = summary('cohen-get', request(`${BASE}/api/lookup?q=${encodeURIComponent('כהן')}`));
const smithCold = summary('john-smith-cold-nocache', request(`${BASE}/api/lookup`, { method: 'POST', body: { ...SMITH, nocache: 1 } }));
const smithWarm1 = summary('john-smith-warm-1', request(`${BASE}/api/lookup`, { method: 'POST', body: SMITH }));
const smithWarm2 = summary('john-smith-warm-2', request(`${BASE}/api/lookup`, { method: 'POST', body: SMITH }));
const johnRappaport = summary('john-rappaport-get', request(`${BASE}/api/lookup?q=${encodeURIComponent('John Rappaport')}`));
cases.push(assaf.out, cohen.out, smithCold.out, smithWarm1.out, smithWarm2.out, johnRappaport.out);

const assafPass = assaf.out.status === 200 && assaf.out.ui === 'dossier' && assaf.out.qid === 'Q47507930' && assaf.out.leakage_count === 0;
const cohenPass = cohen.out.status === 200 && ['need_context','thin','candidates'].includes(cohen.out.ui) && cohen.out.ui !== 'dossier' && cohen.out.faces === 0 && cohen.out.leakage_count === 0;
const smithPass = [smithCold, smithWarm1, smithWarm2].every(x => x.out.status === 200 && ['candidates','thin','need_context'].includes(x.out.ui) && x.out.ui !== 'dossier' && x.out.faces === 0 && x.out.leakage_count === 0 && (x.out.qid == null || !/Q1701775|wd-Q1701775/i.test(String(x.out.qid))));
const optionalPass = johnRappaport.out.status === 200 && johnRappaport.out.leakage_count === 0 && johnRappaport.out.qid !== 'Q47507930';
const leakageCount = cases.reduce((n, x) => n + x.leakage_count, 0);
const pass = health.build_match && assafPass && cohenPass && smithPass && optionalPass && leakageCount === 0;
const result = {
  meta: { checked_at: started, timezone: 'Asia/Jerusalem (UTC+3)', base: BASE, origin: ORIGIN, scope: SCOPE, required_deployment: DPL, promote: false, core_patch: false, forbidden_pattern: 'Q1701775|wd-Q1701775', access: 'vercel curl URL --scope k-akvot --' },
  health, cases, checks: { health_build: health.build_match, assaf: assafPass, cohen: cohenPass, john_smith_3x: smithPass, john_rappaport_optional: optionalPass },
  leakage_count: leakageCount, status: pass ? 'PASS' : 'FAIL', abort_fail: !pass,
  notes: ['Preview-only verification; no promote performed and no Core patch performed.', 'Forbidden scan covers the complete response JSON and separately candidates and sources.']
};
writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n');

const c = Object.fromEntries(cases.map(x => [x.label, x]));
const md = `# Acc P0 pre-promote contract verification — בודק\n\n- Checked: ${started} (Asia/Jerusalem, UTC+3)\n- Preview only: **no promote**, **no Core patch**\n- Base: ${BASE}\n- Required deployment: \`${DPL}\`\n- Result: **${result.status}**\n- Leakage count: **${leakageCount}**\n\n## Gate checks\n\n| Check | Result | Key evidence |\n|---|---|---|\n| Health build | ${health.build_match ? 'PASS' : 'FAIL'} | build=${health.build ?? 'null'} |\n| Assaf Rappaport GET | ${assafPass ? 'PASS' : 'FAIL'} | ui=${assaf.out.ui}, qid=${assaf.out.qid}, leakage=${assaf.out.leakage_count} |\n| כהן GET | ${cohenPass ? 'PASS' : 'FAIL'} | ui=${cohen.out.ui}, faces=${cohen.out.faces}, qid=${cohen.out.qid ?? 'null'}, leakage=${cohen.out.leakage_count} |\n| John Smith cold nocache | ${smithCold.out.status === 200 && ['candidates','thin','need_context'].includes(smithCold.out.ui) && smithCold.out.ui !== 'dossier' && smithCold.out.faces === 0 && smithCold.out.leakage_count === 0 ? 'PASS' : 'FAIL'} | ui=${smithCold.out.ui}, qid=${smithCold.out.qid ?? 'null'}, faces=${smithCold.out.faces}, leakage=${smithCold.out.leakage_count} |\n| John Smith warm #1 | ${smithWarm1.out.status === 200 && ['candidates','thin','need_context'].includes(smithWarm1.out.ui) && smithWarm1.out.ui !== 'dossier' && smithWarm1.out.faces === 0 && smithWarm1.out.leakage_count === 0 ? 'PASS' : 'FAIL'} | ui=${smithWarm1.out.ui}, qid=${smithWarm1.out.qid ?? 'null'}, faces=${smithWarm1.out.faces}, leakage=${smithWarm1.out.leakage_count} |\n| John Smith warm #2 | ${smithWarm2.out.status === 200 && ['candidates','thin','need_context'].includes(smithWarm2.out.ui) && smithWarm2.out.ui !== 'dossier' && smithWarm2.out.faces === 0 && smithWarm2.out.leakage_count === 0 ? 'PASS' : 'FAIL'} | ui=${smithWarm2.out.ui}, qid=${smithWarm2.out.qid ?? 'null'}, faces=${smithWarm2.out.faces}, leakage=${smithWarm2.out.leakage_count} |\n| John Rappaport GET (optional) | ${optionalPass ? 'PASS' : 'FAIL'} | ui=${johnRappaport.out.ui}, qid=${johnRappaport.out.qid ?? 'null'}, leakage=${johnRappaport.out.leakage_count} |\n\n## Raw artifacts\n\nRaw responses are in \`test-results/wp3/ACC-P0-PREPROMOTE-raw/\`. Machine-readable report: \`test-results/wp3/ACC-P0-PREPROMOTE-CONTRACTS-בודק-2026-09-20.json\`.\n`;
writeFileSync(OUT_MD, md);
console.log(JSON.stringify({ status: result.status, leakage_count: leakageCount, checks: result.checks, output_json: OUT_JSON, output_md: OUT_MD }, null, 2));
