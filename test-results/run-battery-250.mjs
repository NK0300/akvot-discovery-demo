#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const BASE = process.env.AKVOT_BASE || 'http://127.0.0.1:4012';
const LIST = process.env.BATTERY_LIST || './test-results/BATTERY-250-list.json';
const OUT = process.env.BATTERY_OUT || `./test-results/BATTERY-250-raw-${Date.now()}.json`;
const CONCURRENCY = Number(process.env.CONCURRENCY || 3);
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : null;
const OFFSET = Number(process.env.OFFSET || 0);
const ORIGIN = process.env.ORIGIN || 'http://localhost:3000';

const list = JSON.parse(fs.readFileSync(LIST, 'utf8'));
let cases = list.cases || [];
if (OFFSET) cases = cases.slice(OFFSET);
if (LIMIT) cases = cases.slice(0, LIMIT);

function hasFace(d) {
  const imgs = d?.images || [];
  return !!(d?.photo || imgs.length);
}

function classify(d) {
  return d?.uiState || d?.mode || 'unknown';
}

function judge(c, d, err) {
  if (err) return { pass: false, reason: 'error:' + err };
  const ui = classify(d);
  const faces = hasFace(d);
  if (c.bucket === 'nonexist') {
    if (faces && ui === 'dossier') return { pass: false, reason: 'false_dossier_face' };
    if (ui === 'dossier' && (d?.qid || d?.label) && !String(d.label||'').includes('לא')) {
      // soft: allow thin/need_context/candidates without faces
    }
    return { pass: !faces || ui === 'need_context' || ui === 'thin' || ui === 'candidates', reason: faces ? 'face_on_nonexist' : 'ok' };
  }
  if (c.bucket === 'famous') {
    const ok = ui === 'dossier' || ui === 'candidates' || ui === 'wiki' || ui === 'wiki+google' || ui === 'google';
    return { pass: ok, reason: ok ? 'ok' : 'expected_dossier_got_' + ui };
  }
  // obscure: need_context, candidates with evidence, thin OK; dossier only with evidence
  if (ui === 'dossier' && !faces && !(d?.sources||[]).length) return { pass: false, reason: 'empty_dossier' };
  return { pass: ['need_context','candidates','thin','dossier','wiki','google','wiki+google','ambiguous'].includes(ui) || !!d?.mode, reason: 'ok' };
}

async function one(c) {
  const t0 = Date.now();
  const url = `${BASE}/api/lookup?q=${encodeURIComponent(c.q)}&nocache=1`;
  try {
    const r = await fetch(url, { headers: { Origin: ORIGIN, 'x-akvot-battery': '1' }, signal: AbortSignal.timeout(65000) });
    const d = await r.json();
    const ms = Date.now() - t0;
    const j = judge(c, d, r.ok ? null : `http_${r.status}`);
    return {
      q: c.q, bucket: c.bucket, scenario: c.scenario,
      ok: r.ok, ms, uiState: d.uiState || null, mode: d.mode || null, phase: d.phase || null,
      faces: hasFace(d), sources: (d.sources||[]).length, candidates: (d.candidates||[]).length,
      pass: j.pass, reason: j.reason, degraded: !!d.degraded,
    };
  } catch (e) {
    return { q: c.q, bucket: c.bucket, pass: false, reason: 'ex:' + (e.message||e), ms: Date.now()-t0 };
  }
}

function summarizePartial(done, base) {
  const results = done.filter(Boolean);
  const summary = {
    base, at: new Date().toISOString(), n: results.length, partial: true,
    pass: results.filter(r => r.pass).length,
    fail: results.filter(r => !r.pass).length,
    byBucket: {},
  };
  for (const b of ['famous','obscure','nonexist']) {
    const rs = results.filter(r => r.bucket === b);
    summary.byBucket[b] = { n: rs.length, pass: rs.filter(r=>r.pass).length, fail: rs.filter(r=>!r.pass).length };
  }
  return { summary, results };
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  let completed = 0;
  const checkpointEvery = Number(process.env.CHECKPOINT_EVERY || 50);
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
      completed++;
      if (completed % 10 === 0) {
        console.error(`…${completed}/${items.length}`);
      }
      if (checkpointEvery > 0 && completed % checkpointEvery === 0) {
        const partial = summarizePartial(out, BASE);
        const cp = OUT.replace(/\.json$/, '') + `-checkpoint-${completed}.json`;
        fs.writeFileSync(cp, JSON.stringify(partial, null, 2));
        const md = `# BATTERY-250 interim @${completed}\n\nbase: ${BASE}\npass: ${partial.summary.pass}/${partial.summary.n}\n\n` +
          Object.entries(partial.summary.byBucket).map(([k,v]) => `- ${k}: ${v.pass}/${v.n}`).join('\n') + `\n\nraw: ${cp}\n`;
        fs.writeFileSync(cp.replace(/\.json$/, '.md'), md);
        console.error(`checkpoint ${completed} pass=${partial.summary.pass}/${partial.summary.n} -> ${cp}`);
      }
    }
  }
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

const results = await pool(cases, CONCURRENCY, one);
const summary = {
  base: BASE, at: new Date().toISOString(), n: results.length,
  pass: results.filter(r => r.pass).length,
  fail: results.filter(r => !r.pass).length,
  byBucket: {},
  p50: null, p95: null,
};
for (const b of ['famous','obscure','nonexist']) {
  const rs = results.filter(r => r.bucket === b);
  summary.byBucket[b] = { n: rs.length, pass: rs.filter(r=>r.pass).length, fail: rs.filter(r=>!r.pass).length };
}
const times = results.map(r => r.ms||0).sort((a,b)=>a-b);
summary.p50 = times[Math.floor(times.length*0.5)] || 0;
summary.p95 = times[Math.floor(times.length*0.95)] || 0;
fs.writeFileSync(OUT, JSON.stringify({ summary, results }, null, 2));
const md = `# BATTERY-250\n\nbase: ${BASE}\npass: ${summary.pass}/${summary.n}\np50: ${summary.p50}ms · p95: ${summary.p95}ms\n\n` +
  Object.entries(summary.byBucket).map(([k,v]) => `- ${k}: ${v.pass}/${v.n}`).join('\n') +
  `\n\nraw: ${OUT}\n`;
fs.writeFileSync(OUT.replace(/\.json$/, '.md'), md);
console.log(JSON.stringify(summary, null, 2));
