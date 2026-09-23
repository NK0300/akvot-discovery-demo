#!/usr/bin/env node
/**
 * FIX-4 client stress regression — Preview only. Measure only; no promote/alias/Core changes.
 */
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://akvot-simple-demo-4ij5qy655-k-akvot.vercel.app';
const ORIGIN = 'https://akvot-simple-demo.vercel.app';
const DPL = 'dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ';
const SCOPE = 'k-akvot';
const RAW = '/workspace/akvot-quick-demo/test-results/wp3/FIX4-LOAD-raw';
const REPORT_MD = '/workspace/akvot-quick-demo/test-results/wp3/FIX4-LOAD-REGRESSION-בודק-2026-09-19.md';
const REPORT_JSON = '/workspace/akvot-quick-demo/test-results/wp3/FIX4-LOAD-REGRESSION-בודק-2026-09-19.json';
const FORBIDDEN = /Q1701775|wd-Q1701775/i;
const FORBIDDEN_GLOBAL = /Q1701775|wd-Q1701775/gi;
const SMITH_BODY = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };
const REQUEST_TIMEOUT_MS = 120000;

mkdirSync(RAW, { recursive: true });

function nowJerusalem() {
  const d = new Date();
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(d).reduce((a, p) => (a[p.type] = p.value, a), {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+03:00`;
}

function findJson(stdout) {
  const lines = String(stdout || '').trim().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const s = lines[i].trim();
    if (!s.startsWith('{') && !s.startsWith('[')) continue;
    try { return { json: JSON.parse(s), jsonText: s }; } catch {}
  }
  const text = String(stdout || '').trim();
  const starts = [];
  for (let i = 0; i < text.length; i++) if (text[i] === '{' || text[i] === '[') starts.push(i);
  for (let i = starts.length - 1; i >= 0; i--) {
    try {
      const candidate = text.slice(starts[i]);
      return { json: JSON.parse(candidate), jsonText: candidate };
    } catch {}
  }
  return { json: null, jsonText: null };
}

function vercelCurl(url, { method = 'GET', bodyObj = null } = {}) {
  return new Promise((resolve) => {
    const args = ['curl', url, '--scope', SCOPE, '--', '-sS', '-H', `Origin: ${ORIGIN}`, '-H', 'Accept: application/json'];
    if (method === 'POST') {
      args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(bodyObj || {}));
    }
    const t0 = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;
    const child = spawn('vercel', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => { if (!settled) child.kill('SIGKILL'); }, 1000);
    }, REQUEST_TIMEOUT_MS);
    child.stdout.on('data', (b) => { stdout += b.toString(); });
    child.stderr.on('data', (b) => { stderr += b.toString(); });
    child.on('error', (e) => {
      clearTimeout(timer); settled = true;
      resolve({ ms: Date.now() - t0, status: 0, json: null, jsonText: null, stdout, stderr, err: String(e.message || e), timedOut });
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer); settled = true;
      const parsed = findJson(stdout);
      const err = timedOut ? `timeout after ${REQUEST_TIMEOUT_MS}ms` : (!parsed.json ? (stderr.trim() || `exit ${code ?? 'null'}${signal ? ` ${signal}` : ''}`) : null);
      resolve({ ms: Date.now() - t0, status: parsed.json ? 200 : (code || 0), json: parsed.json, jsonText: parsed.jsonText, stdout, stderr, err, timedOut });
    });
  });
}

function leakHits(r) {
  const text = r.json ? JSON.stringify(r.json) : (r.jsonText || r.stdout || '');
  const hits = [];
  FORBIDDEN_GLOBAL.lastIndex = 0;
  let m;
  while ((m = FORBIDDEN_GLOBAL.exec(text)) !== null) hits.push({ match: m[0], index: m.index });
  return hits;
}

function summarize(json) {
  if (!json) return { ui: null, qid: null, faces: null, facesCount: null, top: [], stripped: null, ver: null, rid: null, label: null };
  const ui = json.uiState || json.mode || json.ui || null;
  const qid = json.qid ?? json.dossier?.qid ?? null;
  const facesCount = Array.isArray(json.images) ? json.images.length : (typeof json.faces === 'number' ? json.faces : null);
  const faces = facesCount === 0 ? false : (facesCount > 0 ? true : (json.faces === true || !!json.photo));
  const cands = Array.isArray(json.candidates) ? json.candidates : [];
  const top = cands.slice(0, 3).map(c => c.id || c.qid || c.label).filter(Boolean);
  const stripped = json.forbiddenStripped ?? json.timings?.forbiddenStripped ?? json.meta?.forbiddenStripped ?? json.debug?.forbiddenStripped ?? null;
  const ver = json.forbiddenIdentitiesVersion ?? json.meta?.forbiddenIdentitiesVersion ?? null;
  const rid = json.requestId || json.rid || null;
  return { ui, qid, faces, facesCount, top, stripped, ver, rid, label: json.label || null };
}

function analyze(task, r) {
  const jsonText = r.json ? JSON.stringify(r.json) : (r.jsonText || r.stdout || '');
  const hits = leakHits(r);
  // Keep explicit checks for the required locations in addition to whole JSON text.
  const candLeak = (r.json?.candidates || []).some(c => FORBIDDEN.test(String(c?.id || '')) || FORBIDDEN.test(String(c?.qid || '')));
  const dossierLeak = FORBIDDEN.test(String(r.json?.qid || '')) || FORBIDDEN.test(String(r.json?.dossier?.qid || ''));
  const sourcesLeak = (r.json?.sources || []).some(s => FORBIDDEN.test(JSON.stringify(s)));
  const hasLeak = hits.length > 0 || candLeak || dossierLeak || sourcesLeak || FORBIDDEN.test(jsonText);
  const s = summarize(r.json);
  let caseOk = Boolean(r.json && !r.err && !r.timedOut && !hasLeak);
  let failure = null;
  if (!r.json || r.err || r.timedOut) { caseOk = false; failure = r.timedOut ? 'timeout' : (r.err || 'no JSON response'); }
  else if (hasLeak) { caseOk = false; failure = 'forbidden Q1701775 leakage'; }
  else if (task.case === 'smith') {
    if (s.ui === 'dossier') { caseOk = false; failure = 'Smith ui=dossier'; }
    else if (!['candidates', 'thin', 'need_context'].includes(s.ui)) { caseOk = false; failure = `Smith unexpected ui=${s.ui}`; }
    else if ((s.facesCount ?? (s.faces ? 1 : 0)) > 0 || s.faces === true) { caseOk = false; failure = 'faces>0 on Smith soft path'; }
  } else if (task.case === 'assaf') {
    if (s.ui !== 'dossier' || s.qid !== 'Q47507930') { caseOk = false; failure = `Assaf wrong dossier/qid ui=${s.ui} qid=${s.qid}`; }
  } else if (task.case === 'cohen') {
    if (s.ui === 'dossier') { caseOk = false; failure = 'כהן dossier'; }
    else if (!['need_context', 'thin', 'candidates'].includes(s.ui)) { caseOk = false; failure = `כהן unexpected ui=${s.ui}`; }
  }
  return {
    level: task.level, request: task.index, case: task.case, variant: task.variant || null,
    method: task.method, path: task.path, ms: r.ms, status: r.status, ok: caseOk,
    failure, err: r.err || null, timedOut: Boolean(r.timedOut), forbiddenLeak: hasLeak,
    leak_hits: hits.length, leak_detail: hits.slice(0, 5), candLeak, dossierLeak, sourcesLeak,
    ...s,
  };
}

function rawName(task) {
  const v = task.variant ? `-${task.variant}` : '';
  return `${task.level}-${String(task.index).padStart(2, '0')}-${task.case}${v}.json`;
}

function saveRaw(task, r, analysis) {
  const name = rawName(task);
  const payload = r.json ? r.json : { error: r.err, timedOut: r.timedOut, status: r.status, stdout: r.stdout, stderr: r.stderr };
  // Every failure is retained. PASS payloads are also retained for this <=100 request run.
  writeFileSync(join(RAW, name), JSON.stringify({ meta: { ...analysis, rawFile: name }, response: payload }, null, 2));
  return name;
}

function makeTasks(level, smithN, assafN, cohenN) {
  const tasks = [];
  let index = 0;
  const add = (caseName, variant = null) => {
    index++;
    if (caseName === 'smith') tasks.push({ level, index, case: caseName, variant, method: 'POST', path: '/api/lookup', url: `${BASE}/api/lookup`, bodyObj: { ...SMITH_BODY, ...(variant === 'cold' ? { nocache: 1 } : {}) } });
    else if (caseName === 'assaf') tasks.push({ level, index, case: caseName, method: 'GET', path: '/api/lookup?q=Assaf%20Rappaport', url: `${BASE}/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}` });
    else tasks.push({ level, index, case: caseName, method: 'GET', path: '/api/lookup?q=%D7%9B%D7%94%D7%9F', url: `${BASE}/api/lookup?q=${encodeURIComponent('כהן')}` });
  };
  // Deterministic round-robin keeps each pool populated by all case types.
  const smithCold = Math.floor(smithN / 2);
  const smithWarm = smithN - smithCold;
  const buckets = [
    Array.from({ length: smithCold }, () => ['smith', 'cold']),
    Array.from({ length: smithWarm }, () => ['smith', 'warm']),
    Array.from({ length: assafN }, () => ['assaf', null]),
    Array.from({ length: cohenN }, () => ['cohen', null]),
  ];
  while (buckets.some(b => b.length)) for (const b of buckets) if (b.length) { const [c, v] = b.shift(); add(c, v); }
  return tasks;
}

async function runLevel(levelSpec, allResults) {
  const { id, concurrency, smith, assaf, cohen } = levelSpec;
  const tasks = makeTasks(id, smith, assaf, cohen);
  const rows = [];
  let next = 0;
  let aborted = false;
  let stopReason = null;
  const worker = async () => {
    while (true) {
      if (aborted) return;
      const task = tasks[next++];
      if (!task) return;
      const r = await vercelCurl(task.url, { method: task.method, bodyObj: task.bodyObj });
      const a = analyze(task, r);
      a.raw = saveRaw(task, r, a);
      rows.push(a);
      process.stderr.write(`[${id}] ${task.index}/${tasks.length} ${task.case}${task.variant ? `/${task.variant}` : ''} ${a.ok ? 'PASS' : `FAIL:${a.failure}`} ${a.ms}ms\n`);
      if (!a.ok && !aborted) {
        aborted = true;
        stopReason = `${id} request ${task.index} ${task.case}${task.variant ? `/${task.variant}` : ''}: ${a.failure}`;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  rows.sort((a, b) => a.request - b.request);
  const leakageHits = rows.reduce((n, r) => n + r.leak_hits, 0);
  const leakageRequests = rows.filter(r => r.forbiddenLeak).length;
  const timeouts = rows.filter(r => r.timedOut).length;
  const errors = rows.filter(r => r.err || r.timedOut).length;
  const byCase = {};
  for (const c of ['smith', 'assaf', 'cohen']) {
    const cr = rows.filter(r => r.case === c);
    const times = cr.map(r => r.ms).sort((a, b) => a - b);
    const pct = p => times.length ? times[Math.min(times.length - 1, Math.ceil(p * times.length) - 1)] : null;
    byCase[c] = { requests: cr.length, completed: cr.filter(r => r.json).length, p50_ms: pct(0.50), p95_ms: pct(0.95), pass: cr.length > 0 && cr.every(r => r.ok) };
  }
  const pass = !aborted && rows.length === tasks.length && rows.length > 0 && rows.every(r => r.ok);
  const levelResult = { id, concurrency, requested: tasks.length, completed: rows.length, pass, aborted, stopReason, rows, leakageRequests, leakageHits, errors, timeouts, byCase };
  allResults.push(levelResult);
  return levelResult;
}

function mdTable(rows, headers) {
  const out = [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`];
  for (const row of rows) out.push(`| ${row.join(' | ')} |`);
  return out.join('\n');
}

async function main() {
  const meta = { generatedAt: nowJerusalem(), date: '2026-09-19', zone: 'Asia/Jerusalem UTC+3', base: BASE, dpl: DPL, origin: ORIGIN, scope: SCOPE, alias_frozen: true, promote: false, core_patch: false, mode: 'CLIENT_STRESS', denylist: null };
  const report = { status: 'FAIL', meta, health: null, levels: [], totalRequests: 0, completedRequests: 0, errors: 0, timeouts: 0, leakage: { requests: 0, hits: 0 }, pw: 0, forbiddenStripped: { observed: [], total: 0 }, denylistVersion: null, stopReason: null };

  const healthTask = { level: 'HEALTH', index: 1, case: 'health', method: 'GET', path: '/api/health', url: `${BASE}/api/health` };
  const healthR = await vercelCurl(healthTask.url);
  const healthA = analyze(healthTask, healthR);
  const healthRaw = saveRaw(healthTask, healthR, healthA);
  report.health = { ...healthA, raw: healthRaw, build: healthR.json?.build ?? null, buildMatch: healthR.json?.build === DPL };
  process.stderr.write(`health.build=${healthR.json?.build} match=${report.health.buildMatch}\n`);
  if (!report.health.buildMatch) {
    report.stopReason = `health build mismatch: expected ${DPL}, got ${healthR.json?.build ?? 'null'}`;
    report.pw = 0;
    await writeReports(report);
    return report;
  }

  const specs = [
    { id: 'L1', concurrency: 2, smith: 20, assaf: 5, cohen: 5 },
    { id: 'L2', concurrency: 5, smith: 28, assaf: 6, cohen: 6 },
    { id: 'L3', concurrency: 10, smith: 20, assaf: 5, cohen: 5 },
  ];
  for (const spec of specs) {
    const level = await runLevel(spec, report.levels);
    if (!level.pass) {
      report.stopReason = level.stopReason || `${spec.id} failed`;
      break;
    }
  }

  for (const level of report.levels) {
    report.totalRequests += level.requested;
    report.completedRequests += level.completed;
    report.errors += level.errors;
    report.timeouts += level.timeouts;
    report.leakage.requests += level.leakageRequests;
    report.leakage.hits += level.leakageHits;
    for (const row of level.rows) {
      if (row.stripped != null) { report.forbiddenStripped.total += Number(row.stripped) || 0; report.forbiddenStripped.observed.push({ level: level.id, request: row.request, value: row.stripped }); }
      if (row.ver != null && !report.denylistVersion) report.denylistVersion = row.ver;
    }
  }
  report.pw = report.leakage.hits;
  report.forbiddenStripped.observed = report.forbiddenStripped.observed.slice(0, 100);
  report.status = report.health.buildMatch && report.levels.length === specs.length && report.levels.every(l => l.pass) && report.leakage.hits === 0 && report.pw === 0 ? 'PASS' : 'FAIL';
  if (!report.stopReason && report.status === 'FAIL') report.stopReason = 'one or more required invariants failed';
  await writeReports(report);
  return report;
}

async function writeReports(report) {
  writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
  const levelRows = report.levels.map(l => [l.id, l.concurrency, `${l.completed}/${l.requested}`, l.pass ? 'PASS' : 'FAIL', l.leakageHits, l.timeouts, l.errors, l.stopReason || '—']);
  const pRows = [];
  for (const l of report.levels) for (const c of ['smith', 'assaf', 'cohen']) {
    const x = l.byCase[c];
    pRows.push([l.id, c, x.requests, x.p50_ms ?? '—', x.p95_ms ?? '—']);
  }
  const stripped = report.forbiddenStripped.observed.length ? report.forbiddenStripped.observed.map(x => `${x.level}/${x.request}=${x.value}`).join(', ') : 'none observed';
  const md = `# FIX-4 Load Regression · בודק · 2026-09-19\n\n` +
    `**STATUS:** **${report.status}** · CLIENT_STRESS · Preview only · no Core patch · no promote · alias frozen\n\n` +
    `Generated: ${report.meta.generatedAt} (Asia/Jerusalem, UTC+3)\n\n` +
    `## Target\n- BASE: \`${BASE}\`\n- Preview dpl: \`${report.meta.dpl}\`\n- Health build: \`${report.health?.build ?? 'null'}\` · match=${report.health?.buildMatch}\n- Access: \`vercel curl --scope k-akvot\` with Origin \`${ORIGIN}\`\n\n` +
    `## Required invariants\n- pw count: **${report.pw}**\n- Q1701775 leakage: **${report.leakage.hits} hits / ${report.leakage.requests} requests**\n- forbiddenStripped: **${stripped}**\n- denylist version: **${report.denylistVersion ?? 'not present'}**\n- timeouts: **${report.timeouts}** · errors: **${report.errors}**\n\n` +
    `## Levels\n${mdTable(levelRows, ['Level', 'Concurrency', 'Completed', 'Result', 'Leak hits', 'Timeouts', 'Errors', 'Stop reason'])}\n\n` +
    `## p50/p95 latency (ms)\n${mdTable(pRows, ['Level', 'Case', 'Requests completed', 'p50', 'p95'])}\n\n` +
    `## Stop reason\n${report.stopReason || 'none; ladder completed'}\n\n` +
    `## Artifacts\n- Runner: \`test-results/wp3/FIX4-LOAD-raw/run-fix4-load.mjs\`\n- Raw payloads: \`test-results/wp3/FIX4-LOAD-raw/\`\n- JSON report: \`test-results/wp3/FIX4-LOAD-REGRESSION-בודק-2026-09-19.json\`\n`;
  writeFileSync(REPORT_MD, md);
}

main().then((report) => {
  process.stderr.write(`\n=== FIX-4 ${report.status} requests=${report.completedRequests}/${report.totalRequests} leakage=${report.leakage.hits} pw=${report.pw} timeouts=${report.timeouts} ===\n`);
  process.stdout.write(JSON.stringify({ status: report.status, totalRequests: report.totalRequests, completedRequests: report.completedRequests, errors: report.errors, timeouts: report.timeouts, pw: report.pw, leakage: report.leakage, denylistVersion: report.denylistVersion, stopReason: report.stopReason }, null, 2) + '\n');
}).catch((e) => {
  process.stderr.write(String(e?.stack || e) + '\n');
  process.exitCode = 1;
});
