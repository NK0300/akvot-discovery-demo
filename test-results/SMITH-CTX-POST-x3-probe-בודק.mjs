#!/usr/bin/env node
/**
 * Mandatory Gate probe · Smith+US · POST nested ×3 + GET flat ×3 · בודק
 * Evidence only · Preview · no product/EXPECTED/threshold change
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.AKVOT_BASE || '').replace(/\/$/, '');
const DPL = process.env.AKVOT_DPL || 'dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT';
const STAMP = process.env.AKVOT_STAMP || 'dpl2Qrf-בודק-2026-09-15';
const TIMEOUT_MS = 95000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!BASE) {
  console.error('AKVOT_BASE required');
  process.exit(2);
}

const ALLOWED_UI = new Set(['candidates', 'need_context', 'thin']);
const FORBIDDEN_QID = 'Q1701775';

function hasFaces(d) {
  if (!d) return false;
  return !!(d.photo || (Array.isArray(d.images) && d.images.length > 0));
}

function judge(d, status, err) {
  const fails = [];
  let prettyWrong = false;
  if (err) return { pass: false, prettyWrong, fails: [`network: ${err}`] };
  if (status !== 200) return { pass: false, prettyWrong, fails: [`http ${status}`] };
  if (!d) return { pass: false, prettyWrong, fails: ['bad json'] };
  const ui = d.uiState || '';
  const faces = hasFaces(d);
  const qid = d.qid || null;
  if (ui === 'dossier' && faces) {
    fails.push('PRETTY-WRONG: dossier+faces');
    prettyWrong = true;
  }
  if (faces && ui !== 'dossier') {
    fails.push(`faces on uiState=${ui}`);
    prettyWrong = true;
  }
  if (qid === FORBIDDEN_QID) {
    fails.push(`forbidden qid ${FORBIDDEN_QID}`);
    prettyWrong = true;
  }
  if (!ALLOWED_UI.has(ui)) {
    fails.push(`uiState=${ui} not in candidates|need_context|thin`);
  }
  return { pass: fails.length === 0, prettyWrong, fails };
}

function rowFrom(snap, method, run) {
  const d = snap.data;
  const verdict = judge(d, snap.status, snap.err);
  return {
    run,
    method,
    pass: verdict.pass,
    prettyWrong: verdict.prettyWrong,
    fails: verdict.fails,
    http: snap.status,
    ms: snap.ms,
    err: snap.err,
    ui: d?.uiState ?? null,
    qid: d?.qid ?? null,
    photo: !!d?.photo,
    faces: hasFaces(d),
    images: (d?.images || []).length,
    mode: d?.mode ?? null,
    requestId: d?.requestId || snap.requestIdHdr || null,
    build: d?.build ?? null,
  };
}

async function callGet() {
  const p = new URLSearchParams({
    q: 'John Smith',
    org: 'IBM',
    city: 'New York',
    country: 'US',
    nocache: '1',
  });
  const url = `${BASE}/api/lookup?${p}`;
  const t0 = Date.now();
  let status = 0;
  let raw = '';
  let data = null;
  let err = null;
  let requestIdHdr = null;
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        Origin: BASE,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-akvot-battery': '1',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    status = r.status;
    requestIdHdr = r.headers.get('x-request-id');
    raw = await r.text();
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  } catch (e) {
    err = String(e.message || e);
  }
  return { url, status, raw, data, err, ms: Date.now() - t0, requestIdHdr };
}

async function callPostNested() {
  const url = `${BASE}/api/lookup`;
  const body = {
    q: 'John Smith',
    ctx: { org: 'IBM', city: 'New York', country: 'US' },
    nocache: 1,
  };
  const t0 = Date.now();
  let status = 0;
  let raw = '';
  let data = null;
  let err = null;
  let requestIdHdr = null;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Origin: BASE,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-akvot-battery': '1',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    status = r.status;
    requestIdHdr = r.headers.get('x-request-id');
    raw = await r.text();
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  } catch (e) {
    err = String(e.message || e);
  }
  return { url, status, raw, data, err, ms: Date.now() - t0, requestIdHdr, body };
}

const whenIso = new Date().toISOString();
const whenLocal = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) + ' Asia/Jerusalem';

console.log(`SMITH-CTX POST×3 + GET×3 · בודק → ${BASE}`);
console.log(`dpl=${DPL} when=${whenLocal}\n`);

const postRuns = [];
for (let i = 1; i <= 3; i++) {
  process.stdout.write(`→ POST nested run ${i} ... `);
  const snap = await callPostNested();
  const row = rowFrom(snap, 'POST', i);
  postRuns.push(row);
  console.log(
    `${row.pass ? 'PASS' : 'FAIL'}${row.prettyWrong ? '/PW' : ''} http=${row.http} ui=${row.ui} qid=${row.qid || '-'} faces=${row.faces} photo=${row.photo} ms=${row.ms} rid=${row.requestId || '-'}` +
      (row.fails.length ? ` | ${row.fails.join('; ')}` : ''),
  );
  await sleep(1200);
}

const getRuns = [];
for (let i = 1; i <= 3; i++) {
  process.stdout.write(`→ GET flat run ${i} ... `);
  const snap = await callGet();
  const row = rowFrom(snap, 'GET', i);
  getRuns.push(row);
  console.log(
    `${row.pass ? 'PASS' : 'FAIL'}${row.prettyWrong ? '/PW' : ''} http=${row.http} ui=${row.ui} qid=${row.qid || '-'} faces=${row.faces} photo=${row.photo} ms=${row.ms} rid=${row.requestId || '-'}` +
      (row.fails.length ? ` | ${row.fails.join('; ')}` : ''),
  );
  await sleep(1200);
}

const report = {
  case: 'd-smith-ctx-p0',
  base: BASE,
  dpl: DPL,
  when: whenIso,
  whenLocal,
  expected: 'NOT dossier+faces · NOT qid Q1701775 · ui in candidates|need_context|thin · pretty-wrong=0',
  postBody: { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' }, nocache: 1 },
  getParams: { q: 'John Smith', org: 'IBM', city: 'New York', country: 'US', nocache: 1 },
  post: { runs: postRuns, allPass: postRuns.every((r) => r.pass), prettyWrong: postRuns.filter((r) => r.prettyWrong).length },
  get: { runs: getRuns, allPass: getRuns.every((r) => r.pass), prettyWrong: getRuns.filter((r) => r.prettyWrong).length },
  // backward-compat shape for prior consumers looking at top-level runs
  runs: postRuns,
  allPass: postRuns.every((r) => r.pass) && getRuns.every((r) => r.pass),
};

const outPost = path.join(__dirname, `SMITH-CTX-POST-x3-${STAMP}.json`);
const outGet = path.join(__dirname, `SMITH-CTX-GET-x3-${STAMP}.json`);
const outCombined = path.join(__dirname, `SMITH-CTX-POST-x3-${STAMP}.combined.json`);

fs.writeFileSync(
  outPost,
  JSON.stringify(
    {
      case: report.case,
      method: 'POST',
      base: BASE,
      dpl: DPL,
      when: whenIso,
      whenLocal,
      expected: report.expected,
      body: report.postBody,
      runs: postRuns,
      allPass: report.post.allPass,
      prettyWrong: report.post.prettyWrong,
    },
    null,
    2,
  ),
  'utf8',
);
fs.writeFileSync(
  outGet,
  JSON.stringify(
    {
      case: report.case,
      method: 'GET',
      base: BASE,
      dpl: DPL,
      when: whenIso,
      whenLocal,
      expected: report.expected,
      params: report.getParams,
      runs: getRuns,
      allPass: report.get.allPass,
      prettyWrong: report.get.prettyWrong,
    },
    null,
    2,
  ),
  'utf8',
);
fs.writeFileSync(outCombined, JSON.stringify(report, null, 2), 'utf8');

console.log('\n========== SMITH-CTX SUMMARY ==========');
console.log(`POST×3 allPass=${report.post.allPass} pw=${report.post.prettyWrong}`);
console.log(`GET×3  allPass=${report.get.allPass} pw=${report.get.prettyWrong}`);
console.log(`POST JSON: ${outPost}`);
console.log(`GET  JSON: ${outGet}`);
console.log('=======================================\n');

process.exit(report.allPass && report.post.prettyWrong === 0 && report.get.prettyWrong === 0 ? 0 : 1);
