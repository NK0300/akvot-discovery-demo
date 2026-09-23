#!/usr/bin/env node
/**
 * Live battery against BATTERY-250-list.json
 * Usage: BASE=http://127.0.0.1:4011 LIMIT=40 OFFSET=0 node BATTERY-250-runner.mjs
 * Out: BATTERY-250-raw-*.json + prints summary
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:4011';
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : 0; // 0 = all
const OFFSET = Number(process.env.OFFSET || 0);
const TAG = process.env.TAG || 'run';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'BATTERY-250-list.json'), 'utf8'));
let cases = list.cases.slice(OFFSET);
if (LIMIT > 0) cases = cases.slice(0, LIMIT);

function judge(c, d, status, ms) {
  const fails = [];
  const notes = [];
  if (status === 429) return { passSafety: false, passProduct: false, fails: ['http 429'], soft: true };
  if (status !== 200 || !d) return { passSafety: false, passProduct: false, fails: [`http ${status||0}`], soft: false };
  const ui = d.uiState;
  const scn = d.scenario;
  const qid = d.qid;
  const photo = !!d.photo;
  const imgs = (d.images || []).length;
  const src = (d.sources || []).length;
  const mode = d.mode || '';

  // SAFETY
  let passSafety = true;
  if (c.bucket === 'nonexist' || c.bucket === 'obscure') {
    if (photo && !qid && src === 0) { passSafety = false; fails.push('SAFETY photo no sources'); }
    if (c.bucket === 'nonexist' && qid) { passSafety = false; fails.push('SAFETY nonexist got qid '+qid); }
  }
  if (qid === 'Q875556' || qid === 'Q6915744') { passSafety = false; fails.push('SAFETY critical wrong qid'); }

  // PRODUCT by expect / scenario
  let passProduct = false;
  const exp = c.expect || '';
  if (c.scenario === 'A' || c.bucket === 'famous') {
    passProduct = ui === 'dossier' && !!qid;
    if (!passProduct && ui === 'dossier' && !qid) notes.push('dossier without qid');
    if (!passProduct && ui === 'need_context') notes.push('famous→need_context');
    if (!passProduct && (ui === 'candidates' || (mode||'').includes('wiki'))) notes.push('partial '+ui);
  } else if (c.bucket === 'nonexist') {
    passProduct = ui === 'thin' || ui === 'need_context' || (ui === 'candidates' && !photo);
  } else {
    // obscure B/D
    passProduct = ui === 'need_context' || ui === 'thin' || (ui === 'candidates' && (d.candidates||[]).length >= 0) || (ui === 'dossier' && src >= 2);
  }
  // if expect string hints
  if (/need_context/.test(exp) && ui === 'need_context') passProduct = true;
  if (/dossier/.test(exp) && ui === 'dossier' && qid) passProduct = true;

  return { passSafety, passProduct, fails, notes, ui, scn, qid, photo, imgs, src, mode, phase: d.phase, ms };
}

const results = [];
console.log(`BATTERY-250 ${TAG} → ${BASE} offset=${OFFSET} n=${cases.length}`);
for (let i = 0; i < cases.length; i++) {
  const c = cases[i];
  const id = `B${OFFSET + i + 1}-${c.bucket}-${c.scenario}`;
  process.stdout.write(`→ ${id} ${c.q.slice(0,40)} ... `);
  const p = new URLSearchParams({ q: c.q, nocache: '1' });
  if (c.city) p.set('city', c.city);
  if (c.org) p.set('org', c.org);
  if (c.country) p.set('country', c.country);
  const t0 = Date.now();
  let d = null, status = 0, err = null;
  try {
    const r = await fetch(`${BASE}/api/lookup?${p}`, { signal: AbortSignal.timeout(95000) });
    status = r.status;
    d = await r.json();
  } catch (e) { err = String(e.message || e); }
  const ms = Date.now() - t0;
  const v = err ? { passSafety: false, passProduct: false, fails: [err], notes: [], ms } : judge(c, d, status, ms);
  const row = { id, q: c.q, bucket: c.bucket, scenario: c.scenario, expect: c.expect, status, err, ...v };
  results.push(row);
  const tag = !v.passSafety ? 'FAIL-SAFE' : (v.passProduct ? 'PASS' : 'IMPROVE');
  console.log(`${tag} ${ms}ms ui=${v.ui} scn=${v.scn} qid=${v.qid||'-'}`);
  if (v.fails?.length) console.log('   ', v.fails.join('; '));
  await sleep(Number(process.env.SLEEP_MS || 2000));
}

const out = {
  when: new Date().toISOString(),
  tag: TAG,
  base: BASE,
  offset: OFFSET,
  n: results.length,
  safetyPass: results.filter(r => r.passSafety).length,
  productPass: results.filter(r => r.passProduct).length,
  byBucket: Object.fromEntries(['famous','obscure','nonexist'].map(b => {
    const rows = results.filter(r => r.bucket === b);
    return [b, { n: rows.length, safety: rows.filter(r=>r.passSafety).length, product: rows.filter(r=>r.passProduct).length }];
  })),
  fails: results.filter(r => !r.passSafety || !r.passProduct).map(r => ({ id: r.id, q: r.q, bucket: r.bucket, ui: r.ui, qid: r.qid, fails: r.fails, notes: r.notes })),
  results,
};
const rawPath = path.join(__dirname, `BATTERY-250-${TAG}-${new Date().toISOString().slice(0,10)}.json`);
fs.writeFileSync(rawPath, JSON.stringify(out, null, 2));
console.log('\n=== BATTERY ===', JSON.stringify({ tag: TAG, safety: `${out.safetyPass}/${out.n}`, product: `${out.productPass}/${out.n}`, byBucket: out.byBucket }));
console.log('wrote', rawPath);
