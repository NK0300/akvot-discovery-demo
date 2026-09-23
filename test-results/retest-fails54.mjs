#!/usr/bin/env node
import fs from 'fs';

const BASE = process.env.AKVOT_BASE || 'https://akvot-simple-demo.vercel.app';
const ORIGIN = process.env.ORIGIN || BASE;
const CONCURRENCY = Number(process.env.CONCURRENCY || 2);
const fails = JSON.parse(fs.readFileSync('./test-results/BATTERY-250-prod-GO-fails54.json', 'utf8'));
const cases = fails.cases.map((c) => ({
  ...c,
  kind: String(c.reason || '').startsWith('ex:') ? 'infra' : 'product',
}));
cases.push({ q: 'דני כהן', bucket: 'control', kind: 'control', reason: 'control' });

function hasFace(d) {
  return !!(d?.photo || (d?.images || []).length);
}

function judge(c, d, err, status) {
  if (err) return { pass: false, reason: 'ex:' + err };
  if (status && status !== 200) return { pass: false, reason: 'http_' + status };
  const ui = d?.uiState || null;
  const mode = d?.mode || null;
  const faces = hasFace(d);
  if (c.kind === 'control') {
    const ok = ui === 'need_context' && !faces;
    return { pass: ok, reason: ok ? 'ok' : `control_ui=${ui}_faces=${faces}` };
  }
  if (c.kind === 'product') {
    const ok = ui === 'dossier' || String(mode || '').includes('wiki');
    return { pass: ok, reason: ok ? 'ok' : `expected_dossier_got_${ui}` };
  }
  const ok = !!ui || d?.degraded || !!d?.error;
  return { pass: ok, reason: ok ? (d?.error || ui || 'json_ok') : 'no_ui' };
}

async function one(c) {
  const t0 = Date.now();
  try {
    const r = await fetch(`${BASE}/api/lookup?q=${encodeURIComponent(c.q)}&nocache=1`, {
      headers: { Origin: ORIGIN, 'x-akvot-battery': '1' },
      signal: AbortSignal.timeout(70000),
    });
    const raw = await r.text();
    let d = null;
    let err = null;
    try { d = JSON.parse(raw); } catch { err = 'json:' + raw.slice(0, 80); }
    const j = judge(c, d, err, r.status);
    return {
      q: c.q, bucket: c.bucket, kind: c.kind, prevReason: c.reason,
      ok: r.ok, http: r.status, ms: Date.now() - t0,
      uiState: d?.uiState ?? null, mode: d?.mode ?? null, qid: d?.qid ?? null,
      faces: d ? hasFace(d) : false, error: d?.error ?? null, degraded: !!d?.degraded,
      pass: j.pass, reason: j.reason,
    };
  } catch (e) {
    return {
      q: c.q, bucket: c.bucket, kind: c.kind, prevReason: c.reason,
      pass: false, reason: 'ex:' + (e.message || e), ms: Date.now() - t0,
    };
  }
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
      const done = out.filter(Boolean).length;
      if (done % 5 === 0 || done === items.length) {
        const pass = out.filter((r) => r?.pass).length;
        console.log(`…${done}/${items.length} pass=${pass}`);
      }
    }
  }
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

const results = await pool(cases, CONCURRENCY, one);
const byKind = {};
for (const k of ['product', 'infra', 'control']) {
  const rs = results.filter((r) => r.kind === k);
  byKind[k] = { n: rs.length, pass: rs.filter((r) => r.pass).length, fail: rs.filter((r) => !r.pass).length };
}
const summary = {
  base: BASE,
  deployHint: 'dpl_CHsC8R2jLVxvkYCkGpFiZgTifjgU',
  at: new Date().toISOString(),
  n: results.length,
  pass: results.filter((r) => r.pass).length,
  fail: results.filter((r) => !r.pass).length,
  byKind,
};
fs.writeFileSync('./test-results/RETEST-fails54-בודק-2026-09-08.json', JSON.stringify({ summary, results }, null, 2));
const still = results.filter((r) => !r.pass);
const md = `# RETEST 54 FAIL · בודק · 2026-09-08

deploy: \`dpl_CHsC8R2jLVxvkYCkGpFiZgTifjgU\` · base: ${BASE}

**${summary.pass}/${summary.n}** pass · fail ${summary.fail}

| kind | pass/n |
|------|--------|
| product famous×8 | ${byKind.product.pass}/${byKind.product.n} |
| infra | ${byKind.infra.pass}/${byKind.infra.n} |
| control דני | ${byKind.control.pass}/${byKind.control.n} |

## עדיין FAIL
${still.length ? still.map((r) => `- \`${r.q}\` [${r.kind}/${r.bucket}] ui=${r.uiState} mode=${r.mode} qid=${r.qid || '-'} reason=${r.reason} (${r.ms}ms)`).join('\n') : '_אין_'}

## PASS product
${results.filter((r) => r.kind === 'product' && r.pass).map((r) => `- \`${r.q}\` · ${r.uiState}/${r.mode} · ${r.qid || '-'} · ${r.ms}ms`).join('\n') || '_אין_'}

raw: test-results/RETEST-fails54-בודק-2026-09-08.json
`;
fs.writeFileSync('./test-results/RETEST-fails54-בודק-2026-09-08.md', md);
console.log(JSON.stringify(summary, null, 2));
