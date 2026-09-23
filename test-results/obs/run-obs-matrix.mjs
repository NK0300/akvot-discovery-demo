#!/usr/bin/env node
/**
 * OBS EMIT matrix — Preview ONLY — MEASURE ONLY
 * Access: vercel curl (Deployment Protection bypass) — NOT raw unprotected curl
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PREVIEW = 'https://akvot-simple-demo-ko9ttarut-k-akvot.vercel.app';
const SCOPE = 'k-akvot';
const BASELINE_PREFIX = 'dpl_6Tmott';
const EXPECT_BUILD_PREFIX = 'dpl_6vYRKn';
const OUT = 'test-results/obs';
const RAW = join(OUT, 'raw');
mkdirSync(RAW, { recursive: true });

let streak403 = 0;
const ABORT_403 = 5;
let aborted = false;
const cases = [];

function vercelCurl(pathAndQuery, curlArgs = [], label = 'req') {
  if (aborted) return { http: 0, body: null, err: 'ABORTED', wallMs: 0 };
  const bodyFile = `/tmp/obs-body-${label.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
  const args = [
    'curl', pathAndQuery,
    '--scope', SCOPE,
    '--deployment', PREVIEW,
    '--yes',
    '--',
    '-sS',
    '-o', bodyFile,
    '-w', 'HTTPCODE:%{http_code}\nTIME:%{time_total}\n',
    '-H', 'Origin: https://akvot-simple-demo.vercel.app',
    '-H', 'User-Agent: akvot-obs-matrix-bodek/1',
    ...curlArgs,
  ];
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    timeout: 120000,
    cwd: '/workspace/akvot-quick-demo',
    env: process.env,
  });
  const wallMs = Date.now() - t0;
  const out = r.stdout || '';
  const errOut = r.stderr || '';
  let http = 0;
  let curlTime = null;
  const hm = out.match(/HTTPCODE:(\d{3})/);
  const tm = out.match(/TIME:([0-9.]+)/);
  if (hm) http = Number(hm[1]);
  if (tm) curlTime = Number(tm[1]);
  let bodyText = '';
  try { bodyText = readFileSync(bodyFile, 'utf8'); } catch {}
  let body = null;
  try { body = bodyText ? JSON.parse(bodyText) : null; } catch { body = { _raw: bodyText.slice(0, 800) }; }
  // if write-out mangled but JSON body present, treat as 200
  if (!http && body && typeof body === 'object' && (body.ok === true || body.uiState || body.requestId || body.build)) {
    http = 200;
  }
  if (http === 403) {
    streak403++;
    if (streak403 >= ABORT_403) {
      aborted = true;
      console.error(`INFRA ABORT: 403 streak >= ${ABORT_403}`);
    }
  } else if (http && http !== 403) {
    streak403 = 0;
  }
  const snap = {
    label, http, wallMs, curlTime, path: pathAndQuery, body,
    cliExit: r.status, stderrTail: errOut.trim().split(/\n/).slice(-2),
  };
  writeFileSync(join(RAW, `${label.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`), JSON.stringify(snap, null, 2));
  console.log(`[${label}] HTTP ${http} wall=${wallMs}ms curl=${curlTime}`);
  return snap;
}

function summarize(snap) {
  const b = snap.body || {};
  let faceCount = 0;
  if (b.faces === false || b.faces === 0) faceCount = 0;
  else if (b.faces === true) faceCount = 1;
  else if (typeof b.faces === 'number') faceCount = b.faces;
  else faceCount = b.photo ? 1 : 0;
  const wikiMeta = b.wikiMeta;
  const wikiMetaPresent = wikiMeta != null && typeof wikiMeta === 'object' && !Array.isArray(wikiMeta);
  return {
    http: snap.http,
    wallMs: snap.wallMs,
    uiState: b.uiState ?? null,
    qid: b.qid ?? null,
    photo: !!b.photo,
    faces: faceCount,
    facesRaw: b.faces ?? null,
    imagesLen: Array.isArray(b.images) ? b.images.length : null,
    cached: b.cached === true,
    requestId: b.requestId ?? null,
    wikiMetaPresent,
    wikiMeta: wikiMetaPresent ? wikiMeta : null,
    timings: b.timings ?? null,
    timingsCacheHit: b.timings?.cacheHit ?? null,
    mode: b.mode ?? null,
    thin: b.thin ?? null,
    build: b.build ?? null,
  };
}

function prettyWrong(s, kind) {
  if (kind === 'assaf') {
    if (s.uiState === 'dossier' && s.qid && s.qid !== 'Q47507930') return true;
    return false;
  }
  if (kind === 'smith') {
    if (s.uiState === 'dossier') return true;
    if (s.qid === 'Q1701775') return true;
    return false;
  }
  if (kind === 'cohen') {
    if (s.uiState === 'dossier') return true;
    if (s.qid === 'Q47507930') return true;
    return false;
  }
  return false;
}

function passAssaf(s) {
  return s.http === 200 && s.uiState === 'dossier' && s.qid === 'Q47507930' && s.wikiMetaPresent;
}
function passSmith(s) {
  const uiOk = s.uiState && s.uiState !== 'dossier';
  const qidOk = s.qid == null || s.qid !== 'Q1701775';
  const facesHard = (s.facesRaw === false || s.facesRaw === 0 || s.faces === 0) && !s.photo;
  return s.http === 200 && uiOk && qidOk && facesHard && s.wikiMetaPresent;
}
function passCohen(s) {
  const uiOk = s.uiState === 'need_context' || s.uiState === 'thin';
  const facesHard = (s.facesRaw === false || s.facesRaw === 0 || s.faces === 0) && !s.photo;
  return s.http === 200 && uiOk && facesHard && s.wikiMetaPresent;
}

console.log('OBS MATRIX start', new Date().toISOString(), 'target', PREVIEW);

// O-P5
{
  const snap = vercelCurl('/api/health', [], 'O-P5-health');
  const s = summarize(snap);
  const build = s.build || snap.body?.build;
  const ok = snap.http === 200 && build && String(build).startsWith(EXPECT_BUILD_PREFIX) && !String(build).startsWith(BASELINE_PREFIX);
  cases.push({ id: 'O-P5', name: 'health', ...s, build, wikiMetaPresent: null, pass: ok, notes: `build=${build}`, pw: false });
  console.log('O-P5', ok ? 'PASS' : 'FAIL', 'build=', build);
}

// O-P1 Assaf GET COLD
{
  const snap = vercelCurl('/api/lookup?q=Assaf%20Rappaport&nocache=1', ['-H', 'Accept: application/json'], 'O-P1-assaf-cold');
  const s = summarize(snap);
  const pw = prettyWrong(s, 'assaf');
  cases.push({ id: 'O-P1', name: 'Assaf GET COLD nocache', ...s, pass: passAssaf(s), pw, notes: `ui=${s.uiState} qid=${s.qid} wikiMeta=${s.wikiMetaPresent}` });
}

// O-P2 Smith POST nested COLD
{
  const body = JSON.stringify({ q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' }, nocache: 1 });
  const snap = vercelCurl('/api/lookup', ['-X', 'POST', '-H', 'Content-Type: application/json', '-H', 'Accept: application/json', '--data-binary', body], 'O-P2-smith-cold');
  const s = summarize(snap);
  const pw = prettyWrong(s, 'smith');
  cases.push({ id: 'O-P2', name: 'Smith POST nested COLD', ...s, pass: passSmith(s), pw, notes: `ui=${s.uiState} qid=${s.qid} faces=${s.facesRaw} wikiMeta=${s.wikiMetaPresent}` });
}

// O-P3 כהן GET COLD
{
  const q = encodeURIComponent('כהן');
  const snap = vercelCurl(`/api/lookup?q=${q}&nocache=1`, ['-H', 'Accept: application/json'], 'O-P3-cohen-cold');
  const s = summarize(snap);
  const pw = prettyWrong(s, 'cohen');
  cases.push({ id: 'O-P3', name: 'כהן GET COLD', ...s, pass: passCohen(s), pw, notes: `ui=${s.uiState} faces=${s.facesRaw} wikiMeta=${s.wikiMetaPresent}` });
}

// O-P4 Assaf COLD then WARM without nocache
{
  const snap1 = vercelCurl('/api/lookup?q=Assaf%20Rappaport&nocache=1', ['-H', 'Accept: application/json'], 'O-P4a-assaf-cold');
  const s1 = summarize(snap1);
  const snap2 = vercelCurl('/api/lookup?q=Assaf%20Rappaport', ['-H', 'Accept: application/json'], 'O-P4b-assaf-warm');
  const s2 = summarize(snap2);
  const hit = s2.cached === true || s2.timingsCacheHit != null;
  let hitNote = hit
    ? `HIT cached=${s2.cached} cacheHit=${s2.timingsCacheHit} total=${s2.timings?.total}`
    : 'MISS (no cached:true) — multi-instance note OK';
  const pw = prettyWrong(s1, 'assaf') || prettyWrong(s2, 'assaf');
  cases.push({
    id: 'O-P4', name: 'Assaf COLD then WARM no-nocache',
    http: s2.http, wallMs: s2.wallMs, uiState: s2.uiState, qid: s2.qid,
    wikiMetaPresent: s1.wikiMetaPresent && s2.wikiMetaPresent,
    wikiMeta: s2.wikiMeta, timings: s2.timings, cached: s2.cached, requestId: s2.requestId,
    cold: { wallMs: s1.wallMs, total: s1.timings?.total, rid: s1.requestId, wikiMeta: s1.wikiMetaPresent },
    warm: { wallMs: s2.wallMs, total: s2.timings?.total, rid: s2.requestId, cached: s2.cached, cacheHit: s2.timingsCacheHit },
    pass: s1.http === 200 && s2.http === 200 && s1.wikiMetaPresent && s2.wikiMetaPresent && s2.qid === 'Q47507930',
    pw, notes: hitNote,
  });
}

// O-R1 Smith POST ×5 COLD
{
  const runs = [];
  let allWm = true, anyPw = false, allPass = true;
  for (let i = 1; i <= 5; i++) {
    const body = JSON.stringify({ q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' }, nocache: 1 });
    const snap = vercelCurl('/api/lookup', ['-X', 'POST', '-H', 'Content-Type: application/json', '-H', 'Accept: application/json', '--data-binary', body], `O-R1-smith-${i}`);
    const s = summarize(snap);
    const pw = prettyWrong(s, 'smith');
    const p = passSmith(s);
    if (!s.wikiMetaPresent) allWm = false;
    if (pw) anyPw = true;
    if (!p) allPass = false;
    runs.push({ i, http: s.http, uiState: s.uiState, qid: s.qid, facesRaw: s.facesRaw, photo: s.photo, wikiMetaPresent: s.wikiMetaPresent, wikiMeta: s.wikiMeta, requestId: s.requestId, wallMs: s.wallMs, pass: p, pw });
  }
  cases.push({ id: 'O-R1', name: 'Smith POST ×5 COLD', http: 200, wikiMetaPresent: allWm, runs, pass: allPass && allWm && !anyPw, pw: anyPw, notes: `wikiMeta_each=${allWm} pw=${anyPw ? 1 : 0} passes=${runs.filter(r => r.pass).length}/5` });
}

// O-R2 Assaf ×3
{
  const runs = [];
  let allWm = true, anyPw = false, allPass = true;
  const qids = new Set();
  for (let i = 1; i <= 3; i++) {
    const snap = vercelCurl('/api/lookup?q=Assaf%20Rappaport&nocache=1', ['-H', 'Accept: application/json'], `O-R2-assaf-${i}`);
    const s = summarize(snap);
    const pw = prettyWrong(s, 'assaf');
    const p = passAssaf(s);
    if (!s.wikiMetaPresent) allWm = false;
    if (pw) anyPw = true;
    if (!p) allPass = false;
    qids.add(s.qid);
    runs.push({ i, http: s.http, uiState: s.uiState, qid: s.qid, wikiMetaPresent: s.wikiMetaPresent, wikiMeta: s.wikiMeta, requestId: s.requestId, wallMs: s.wallMs, pass: p, pw });
  }
  const stable = qids.size === 1 && qids.has('Q47507930');
  cases.push({ id: 'O-R2', name: 'Assaf ×3', wikiMetaPresent: allWm, runs, pass: allPass && allWm && stable && !anyPw, pw: anyPw, notes: `dossier_stable=${stable} wikiMeta_each=${allWm} qids=${[...qids]}` });
}

// O-N1 missing q / bad JSON
{
  const snap1 = vercelCurl('/api/lookup', ['-X', 'POST', '-H', 'Content-Type: application/json', '-H', 'Accept: application/json', '--data-binary', '{}'], 'O-N1a-missing-q');
  const snap2 = vercelCurl('/api/lookup', ['-X', 'POST', '-H', 'Content-Type: application/json', '-H', 'Accept: application/json', '--data-binary', '{not-json'], 'O-N1b-bad-json');
  const soft1 = snap1.http >= 200 && snap1.http < 500;
  const soft2 = snap2.http > 0 && snap2.http < 500;
  cases.push({
    id: 'O-N1', name: 'missing q / bad JSON',
    missing_q: { http: snap1.http, bodyKeys: snap1.body && typeof snap1.body === 'object' ? Object.keys(snap1.body).slice(0, 12) : null, wikiMeta: !!(snap1.body && snap1.body.wikiMeta), uiState: snap1.body?.uiState ?? null },
    bad_json: { http: snap2.http, bodyPreview: snap2.body && typeof snap2.body === 'object' ? Object.keys(snap2.body).slice(0, 8) : String(snap2.body).slice(0, 200) },
    pass: soft1 && soft2, pw: false,
    notes: `missing_q HTTP ${snap1.http}; bad_json HTTP ${snap2.http} — soft fail documented`,
  });
}

// O-N2 wrong method
{
  const snap = vercelCurl('/api/lookup?q=test', ['-X', 'PUT', '-H', 'Accept: application/json'], 'O-N2-put');
  cases.push({
    id: 'O-N2', name: 'wrong method PUT', http: snap.http,
    pass: snap.http === 405 || (snap.http >= 400 && snap.http < 500),
    documented: true, pw: false, notes: `HTTP ${snap.http} (expect 405 if supported)`,
  });
}

const pwTotal = cases.reduce((n, c) => n + (c.pw ? 1 : 0), 0);
const byId = (id) => cases.find((c) => c.id === id);
const gatePass =
  !aborted &&
  byId('O-P5')?.pass &&
  byId('O-P1')?.pass &&
  byId('O-P2')?.pass &&
  byId('O-P3')?.pass &&
  byId('O-P4')?.pass &&
  byId('O-R1')?.pass &&
  byId('O-R2')?.pass &&
  pwTotal === 0;

const report = {
  meta: {
    role: 'בודק',
    date: '2026-09-18',
    timeZone: 'Asia/Jerusalem',
    target: PREVIEW,
    access: 'vercel curl --scope k-akvot --deployment Preview (protection bypass)',
    expectBuildPrefix: EXPECT_BUILD_PREFIX,
    baselineLocked: 'dpl_6TmottkUQ3UbnHYfGNwYjeQbFJd8',
    measureOnly: true,
    aborted403: aborted,
    streak403,
    finishedAt: new Date().toISOString(),
  },
  health: byId('O-P5'),
  cases,
  summary: {
    gate: gatePass ? 'PASS' : (aborted ? 'INFRA_ABORT' : 'FAIL'),
    pw: pwTotal,
    wikiMeta: {
      'O-P1': byId('O-P1')?.wikiMetaPresent ?? false,
      'O-P2': byId('O-P2')?.wikiMetaPresent ?? false,
      'O-P3': byId('O-P3')?.wikiMetaPresent ?? false,
    },
    build: byId('O-P5')?.build,
  },
};

writeFileSync(join(OUT, 'OBS-MATRIX-dpl6vYRKn-בודק-2026-09-18.json'), JSON.stringify(report, null, 2));
console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(report.summary, null, 2));
for (const c of cases) {
  console.log(`${c.id} ${c.pass ? 'PASS' : 'FAIL'} wikiMeta=${c.wikiMetaPresent} pw=${!!c.pw} — ${c.notes || ''}`);
}
process.exit(aborted ? 2 : 0);
