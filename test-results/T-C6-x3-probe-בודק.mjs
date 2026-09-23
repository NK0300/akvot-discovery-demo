#!/usr/bin/env node
/**
 * Mandatory Gate probe · T-C6 / A06 John Rappaport GET ×3 · בודק
 * Evidence only · Preview · no product/EXPECTED/threshold change
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.AKVOT_BASE || '').replace(/\/$/, '');
const DPL = process.env.AKVOT_DPL || 'dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk';
const STAMP = process.env.AKVOT_STAMP || 'dplHVGb-בודק-2026-09-15';
const TIMEOUT_MS = 95000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!BASE) {
  console.error('AKVOT_BASE required');
  process.exit(2);
}

const ALLOWED_UI = new Set(['need_context', 'candidates', 'thin']);
const FORBIDDEN_QIDS = new Set(['Q105094696', 'Q47507930']);

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
  if (ui === 'dossier') {
    fails.push('NOT dossier expected');
    if (faces) {
      fails.push('PRETTY-WRONG: dossier+faces');
      prettyWrong = true;
    }
  }
  if (faces) {
    fails.push(`faces=true on ui=${ui}`);
    prettyWrong = true;
  }
  if (qid != null) fails.push(`qid=${qid} expected null`);
  if (qid && FORBIDDEN_QIDS.has(qid)) {
    fails.push(`forbidden qid ${qid}`);
    prettyWrong = true;
  }
  if (!ALLOWED_UI.has(ui)) fails.push(`uiState=${ui} not in need_context|candidates|thin`);
  return { pass: fails.length === 0, prettyWrong, fails };
}

async function callGet() {
  const p = new URLSearchParams({ q: 'John Rappaport', nocache: '1' });
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

const whenIso = new Date().toISOString();
const whenLocal = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) + ' Asia/Jerusalem';

console.log(`T-C6 / A06 John Rappaport GET×3 · בודק → ${BASE}`);
console.log(`dpl=${DPL} when=${whenLocal}\n`);

const runs = [];
for (let i = 1; i <= 3; i++) {
  process.stdout.write(`→ GET run ${i} ... `);
  const snap = await callGet();
  const d = snap.data;
  const verdict = judge(d, snap.status, snap.err);
  const row = {
    run: i,
    method: 'GET',
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
  runs.push(row);
  console.log(
    `${row.pass ? 'PASS' : 'FAIL'}${row.prettyWrong ? '/PW' : ''} http=${row.http} ui=${row.ui} qid=${row.qid || '-'} faces=${row.faces} ms=${row.ms} rid=${row.requestId || '-'}` +
      (row.fails.length ? ` | ${row.fails.join('; ')}` : ''),
  );
  await sleep(1200);
}

const allPass = runs.every((r) => r.pass);
const pw = runs.filter((r) => r.prettyWrong).length;
const report = {
  case: 'T-C6 / A06',
  q: 'John Rappaport',
  base: BASE,
  dpl: DPL,
  when: whenIso,
  whenLocal,
  expected:
    'ui∈need_context|candidates|thin · qid=null · faces=false · NOT dossier · NOT Q105094696 · NOT Assaf Q47507930 · pw=0',
  gate: allPass && pw === 0 ? 'PASS' : 'FAIL',
  prettyWrong: pw,
  runs,
};

const outJson = path.join(__dirname, `T-C6-x3-${STAMP}.json`);
fs.writeFileSync(outJson, JSON.stringify(report, null, 2), 'utf8');

console.log('\n========== T-C6×3 SUMMARY ==========');
console.log(`gate=${report.gate} pass=${runs.filter((r) => r.pass).length}/3 pw=${pw}`);
console.log(`JSON: ${outJson}`);
console.log('====================================\n');
process.exit(allPass && pw === 0 ? 0 : 1);
