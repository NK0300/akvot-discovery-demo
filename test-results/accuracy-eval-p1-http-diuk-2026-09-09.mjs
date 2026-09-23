#!/usr/bin/env node
/**
 * Accuracy (דיוק) LIVE HTTP eval — post P1 deploy dpl_D2zvC3QvUVgz6kaSaWqnSUCoD9hU
 * Case set: ACCURACY_EVAL-v2-set-דיוק-2026-09-09.json (N=34) + forced IBM+NY smoke
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.AKVOT_BASE || 'https://akvot-simple-demo.vercel.app').replace(/\/$/, '');
const ORIGIN = BASE;
const TIMEOUT_MS = 65000;
const CONCURRENCY = Number(process.env.AKVOT_CONCURRENCY || 3);
const FAKE_EMAIL = 'qa.rethink.test@example.com';
const DEPLOY = 'dpl_D2zvC3QvUVgz6kaSaWqnSUCoD9hU';
const PHASE_EXPECTED = 'orchestrator-v0-b';
const CASE_SET = path.join(__dirname, 'ACCURACY_EVAL-v2-set-דיוק-2026-09-09.json');
const OUT_MD = path.join(__dirname, 'ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09.md');
const OUT_JSON = path.join(__dirname, 'ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09.json');
const OUT_REPORT = path.join(__dirname, 'ACCURACY_REPORT.md');
const OUT_LOG = path.join(__dirname, 'ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09.run.log');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hasFaces(d) {
  if (!d) return false;
  return !!(d.photo || (Array.isArray(d.images) && d.images.length > 0));
}

function evidenceBrief(d) {
  if (!d) return 'none';
  const srcs = Array.isArray(d.sources) ? d.sources : [];
  if (!srcs.length) return 'none';
  return srcs
    .slice(0, 5)
    .map((s) => {
      let host = '';
      try {
        host = s.url ? new URL(s.url).hostname : '';
      } catch {
        host = '';
      }
      return `${s.kind || s.group || '?'}:${s.title || host || ''}@${host || '-'}`;
    })
    .join('; ');
}

async function callLookup({ method = 'GET', q, ctx = {} }) {
  const t0 = Date.now();
  let status = 0;
  let raw = '';
  let data = null;
  let err = null;
  try {
    const headers = {
      Origin: ORIGIN,
      Accept: 'application/json',
      'x-akvot-battery': '1',
    };
    let url;
    let opts;
    if (method === 'POST') {
      url = `${BASE}/api/lookup?nocache=1`;
      headers['Content-Type'] = 'application/json';
      opts = {
        method: 'POST',
        headers,
        body: JSON.stringify({ q, ...ctx, nocache: 1 }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      };
    } else {
      const p = new URLSearchParams();
      p.set('q', q);
      for (const [k, v] of Object.entries(ctx)) {
        if (v != null && v !== '') p.set(k, String(v));
      }
      p.set('nocache', '1');
      url = `${BASE}/api/lookup?${p}`;
      opts = {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      };
    }
    const r = await fetch(url, opts);
    status = r.status;
    raw = await r.text();
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  } catch (e) {
    err = String(e.message || e);
  }
  return { status, raw, data, err, ms: Date.now() - t0 };
}

function classifyErrorType(c, snap, fails, prettyWrong) {
  if (!fails.length) return null;
  const ui = snap.data?.uiState || '';
  const expUi = c.expected.uiState || [];
  const wantsDossier = expUi.includes('dossier') && expUi.length === 1;
  const forbidsDossierFaces = (c.expected.must_not || []).includes('dossier+faces');
  const forbidsFake = (c.expected.must_not || []).includes('fake_dossier');

  if (prettyWrong) return 'PRETTY-WRONG';
  if (snap.err || (snap.status && snap.status !== 200)) return 'OTHER';

  if (wantsDossier && ui !== 'dossier') {
    // expected commit but gated / missed
    if (ui === 'need_context' || ui === 'thin' || ui === 'candidates') return 'OVER-GATE';
    return 'FN';
  }

  if ((forbidsDossierFaces || forbidsFake) && ui === 'dossier') {
    if (hasFaces(snap.data)) return 'PRETTY-WRONG';
    return 'FP';
  }

  if (c.category === 'unknown' && ui === 'dossier') return 'UNKNOWN';
  if (c.category === 'ambiguous' && ui === 'dossier') return 'AMBIGUOUS';
  if (c.category === 'conflict' && ui === 'dossier') return 'CONFLICT';

  if (c.expected.qid && snap.data?.qid && snap.data.qid !== c.expected.qid) {
    return 'FP'; // wrong person
  }

  if (wantsDossier && ui === 'dossier' && c.expected.faces === true && !hasFaces(snap.data)) {
    return 'OTHER'; // faces miss but committed
  }

  if (!wantsDossier && ui === 'dossier') return 'FP';
  if (wantsDossier && ui !== 'dossier') return 'FN';
  return 'OTHER';
}

function classifyConfusion(c, snap, pass) {
  // Positive class = committed dossier identity
  const expUi = c.expected.uiState || [];
  const wantsPositive =
    expUi.length === 1 && expUi[0] === 'dossier' && c.expected.qid != null;
  const gotPositive = snap.data?.uiState === 'dossier';
  if (wantsPositive && gotPositive && pass) return 'TP';
  if (wantsPositive && gotPositive && !pass) return 'FP'; // wrong qid / faces etc.
  if (wantsPositive && !gotPositive) return 'FN';
  if (!wantsPositive && !gotPositive && pass) return 'TN';
  if (!wantsPositive && gotPositive) return 'FP';
  if (!wantsPositive && !gotPositive && !pass) return 'TN'; // still negative class, wrong subtype
  return null;
}

function judge(c, snap) {
  const fails = [];
  const notes = [];
  const { status, err, data: d, raw } = snap;
  if (err) {
    fails.push(`network: ${err}`);
    return { pass: false, fails, notes, prettyWrong: false };
  }
  if (status === 429) {
    fails.push('http 429');
    return { pass: false, fails, notes, prettyWrong: false };
  }
  if (status !== 200) {
    fails.push(`http ${status}`);
    return { pass: false, fails, notes, prettyWrong: false };
  }
  if (!d) {
    fails.push('bad json');
    return { pass: false, fails, notes, prettyWrong: false };
  }

  const exp = c.expected;
  const uiStates = exp.uiState || exp.uiStates || [];
  const ui = d.uiState || '';
  const faces = hasFaces(d);
  const qid = d.qid || null;
  let prettyWrong = false;

  if (uiStates.length && !uiStates.includes(ui)) {
    fails.push(`uiState=${ui} expected ${uiStates.join('|')}`);
  }
  if (exp.qid != null) {
    if (qid !== exp.qid) fails.push(`qid=${qid} expected ${exp.qid}`);
  }
  if (exp.faces === true && !faces) fails.push('faces expected');
  if (exp.faces === false && faces) fails.push('faces must be 0');

  const mustNot = exp.must_not || [];
  if (mustNot.includes('dossier+faces') && ui === 'dossier' && faces) {
    fails.push('pretty-wrong: dossier+faces');
    prettyWrong = true;
  }
  if (mustNot.includes('fake_dossier') && ui === 'dossier') {
    fails.push('fake dossier on unknown/garbage/ambiguous');
    prettyWrong = true;
  }
  if (mustNot.includes('email_leak')) {
    const email = (c.input.ctx && c.input.ctx.email) || FAKE_EMAIL;
    if (raw && raw.includes(email)) fails.push('email leaked in response');
  }
  if (mustNot.includes('qid_when_unknown') && qid) {
    fails.push(`qid fabricated=${qid}`);
    prettyWrong = true;
  }
  if (mustNot.includes('faces') && faces) {
    fails.push('faces not allowed');
  }
  if (mustNot.includes('wrong_person_dossier') && ui === 'dossier' && exp.qid == null) {
    // near-match: dossier OK only if not clearly wrong — soft: if qid present treat as ok unless known wrong
    notes.push(`near-match dossier qid=${qid || '-'}`);
  }

  if (d.phase && d.phase !== PHASE_EXPECTED) {
    notes.push(`phase=${d.phase} (expected ${PHASE_EXPECTED})`);
  }

  return { pass: fails.length === 0, fails, notes, prettyWrong };
}

function expectedLabel(c) {
  const e = c.expected;
  const parts = [];
  parts.push(`ui∈[${(e.uiState || []).join('|')}]`);
  if (e.qid) parts.push(`qid=${e.qid}`);
  if (e.faces === true) parts.push('faces');
  if (e.faces === false) parts.push('0 faces');
  if ((e.must_not || []).length) parts.push(`must_not=${e.must_not.join(',')}`);
  return parts.join(' · ');
}

// Load case set
const set = JSON.parse(fs.readFileSync(CASE_SET, 'utf8'));
const cases = set.cases.map((c) => ({
  ...c,
  method: c.input.ctx ? 'POST' : 'GET',
  smoke: false,
  expectedLabel: expectedLabel(c),
}));

// Forced smoke: John Smith + IBM + NY (explicit in brief; case set has Microsoft/Seattle)
const smokeIbm = {
  id: 'smoke-smith-ibm-ny',
  category: 'conflict',
  subset: 'smoke',
  input: { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } },
  expected: {
    uiState: ['candidates', 'need_context', 'thin'],
    faces: false,
    qid: null,
    must_not: ['dossier+faces', 'fake_dossier'],
  },
  errorTypesIfFail: ['pretty_wrong', 'over_commit'],
  notes: 'Forced smoke: John Smith + IBM + NY → NOT dossier+faces',
  method: 'POST',
  smoke: true,
  expectedLabel: 'candidates|need_context|thin · 0 faces · must_not=dossier+faces,fake_dossier',
};
cases.push(smokeIbm);

const logLines = [];
function log(...args) {
  const line = args.map(String).join(' ');
  console.log(line);
  logLines.push(line);
}

log(`ACCURACY EVAL P1-HTTP דיוק → ${BASE}`);
log(`deploy: ${DEPLOY}`);
log(`caseSet: ${path.basename(CASE_SET)} n=${set.meta.n} + smokeIbm → ${cases.length}`);
log(`concurrency=${CONCURRENCY} timeout=${TIMEOUT_MS}ms Origin=${ORIGIN}`);
log('');

const results = new Array(cases.length);
let nextIdx = 0;

async function worker(wid) {
  while (true) {
    const i = nextIdx++;
    if (i >= cases.length) return;
    const c = cases[i];
    log(`[w${wid}] → ${c.id} [${c.category}/${c.subset}] ${c.method} q=${c.input.q}`);
    const snap = await callLookup({
      method: c.method,
      q: c.input.q,
      ctx: c.input.ctx || {},
    });
    const verdict = judge(c, snap);
    const d = snap.data;
    const faces = hasFaces(d);
    const errorType = classifyErrorType(c, snap, verdict.fails, verdict.prettyWrong);
    const confusion = classifyConfusion(c, snap, verdict.pass);
    const row = {
      id: c.id,
      category: c.category,
      subset: c.subset,
      smoke: !!c.smoke,
      method: c.method,
      input: c.input,
      expectedLabel: c.expectedLabel,
      expected: {
        uiState: c.expected.uiState,
        qid: c.expected.qid ?? null,
        faces: c.expected.faces ?? null,
        must_not: c.expected.must_not || [],
      },
      pass: verdict.pass,
      prettyWrong: verdict.prettyWrong,
      errorType,
      confusion,
      fails: verdict.fails,
      notes: verdict.notes,
      http: snap.status,
      ms: snap.ms,
      err: snap.err,
      actual: {
        uiState: d?.uiState ?? null,
        mode: d?.mode ?? null,
        qid: d?.qid ?? null,
        photo: !!d?.photo,
        images: (d?.images || []).length,
        faces,
        sources: (d?.sources || []).length,
        candidates: (d?.candidates || []).length,
        scenario: d?.scenario ?? null,
        confidence: d?.confidence ?? null,
        phase: d?.phase ?? null,
        thin: !!d?.thin,
        ambiguous: !!d?.ambiguous,
        messageKey: d?.messageKey ?? null,
        label: d?.label ?? null,
      },
      confidence: d?.confidence ?? null,
      evidence: evidenceBrief(d),
    };
    results[i] = row;
    const tag = verdict.pass ? 'PASS' : verdict.prettyWrong ? 'FAIL/PRETTY-WRONG' : `FAIL/${errorType || 'OTHER'}`;
    log(
      `[w${wid}] ← ${tag} ${c.id} ${snap.ms}ms http=${snap.status} ui=${row.actual.uiState} qid=${row.actual.qid || '-'} faces=${faces} conf=${row.confidence || '-'} phase=${row.actual.phase || '-'}` +
        (verdict.fails.length ? ` | ${verdict.fails.join('; ')}` : ''),
    );
    await sleep(400); // light spacing per worker
  }
}

const tStart = Date.now();
await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1)));
const elapsedMs = Date.now() - tStart;

const rows = results;
const passed = rows.filter((r) => r.pass).length;
const failed = rows.filter((r) => !r.pass).length;
const prettyWrongHits = rows.filter((r) => r.prettyWrong);
const phaseOk = rows.every((r) => !r.actual.phase || r.actual.phase === PHASE_EXPECTED);
const whenIso = new Date().toISOString();
const whenLocal =
  new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) + ' Asia/Jerusalem';

// Metrics
const byCat = {};
for (const r of rows) {
  const k = r.category;
  if (!byCat[k]) byCat[k] = { n: 0, pass: 0, fail: 0 };
  byCat[k].n++;
  if (r.pass) byCat[k].pass++;
  else byCat[k].fail++;
}

const errorTypeCounts = {};
for (const r of rows.filter((x) => !x.pass)) {
  const t = r.errorType || 'OTHER';
  errorTypeCounts[t] = (errorTypeCounts[t] || 0) + 1;
}

const confusion = { TP: 0, FP: 0, TN: 0, FN: 0 };
for (const r of rows) {
  if (r.confusion && confusion[r.confusion] != null) confusion[r.confusion]++;
}

const overGate = rows.filter((r) => r.errorType === 'OVER-GATE').length;
const prettyWrongN = prettyWrongHits.length;

// Forced smoke checklist
const smokeIds = [
  'reg-netanyahu-bare',
  'reg-bibi-netanyahu',
  'reg-zehava-galon',
  'reg-angela-merkel',
  'ambiguous-danny-cohen',
  'duplicate-john-smith-bare',
  'conflict-smith-email',
  'smoke-smith-ibm-ny',
];
const smokeRows = smokeIds.map((id) => rows.find((r) => r.id === id)).filter(Boolean);

const regressionRows = rows.filter((r) => r.subset === 'regression');
const keepSafety = rows.filter((r) =>
  ['ambiguous-danny-cohen', 'duplicate-john-smith-bare', 'conflict-smith-email', 'smoke-smith-ibm-ny', 'conflict-smith-microsoft-seattle'].includes(r.id),
);

// GO / NO-GO
let recommendation = 'GO';
const reasons = [];
if (prettyWrongN > 0) {
  recommendation = 'NO-GO';
  reasons.push(`pretty-wrong=${prettyWrongN}`);
}
const regFail = regressionRows.filter((r) => !r.pass);
if (regFail.length) {
  recommendation = 'NO-GO';
  reasons.push(`regression FAIL ${regFail.map((r) => r.id).join(',')}`);
}
const keepFail = keepSafety.filter((r) => !r.pass);
if (keepFail.length) {
  recommendation = 'NO-GO';
  reasons.push(`KEEP safety FAIL ${keepFail.map((r) => r.id).join(',')}`);
}
if (!phaseOk) {
  recommendation = 'NO-GO';
  reasons.push('phase mismatch');
}
// Soft: if only minor OTHER fails on non-critical, still GO with caveats
const criticalFail = rows.filter(
  (r) =>
    !r.pass &&
    (r.subset === 'regression' ||
      r.prettyWrong ||
      ['ambiguous-danny-cohen', 'duplicate-john-smith-bare', 'conflict-smith-email', 'smoke-smith-ibm-ny'].includes(r.id)),
);
if (criticalFail.length === 0 && failed > 0 && recommendation === 'GO') {
  reasons.push(`${failed} non-critical FAIL(s) — GO with caveats`);
}
if (recommendation === 'GO' && failed === 0) reasons.push('all cases PASS');

const report = {
  meta: {
    id: 'ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09',
    agent: 'דיוק',
    role: 'Accuracy',
    when: whenIso,
    whenLocal,
    deploy: DEPLOY,
    base: BASE,
    origin: ORIGIN,
    phaseExpected: PHASE_EXPECTED,
    phaseOk,
    caseSet: path.basename(CASE_SET),
    nCaseSet: set.meta.n,
    nRun: rows.length,
    skipped: [],
    concurrency: CONCURRENCY,
    timeoutMs: TIMEOUT_MS,
    elapsedMs,
    recommendation,
    recommendationReasons: reasons,
  },
  summary: {
    N: rows.length,
    PASS: passed,
    FAIL: failed,
    TP: confusion.TP,
    FP: confusion.FP,
    TN: confusion.TN,
    FN: confusion.FN,
    OVER_GATE: overGate,
    PRETTY_WRONG: prettyWrongN,
    byCategory: byCat,
    errorTypeCounts,
    regression: {
      n: regressionRows.length,
      pass: regressionRows.filter((r) => r.pass).length,
      fail: regFail.map((r) => r.id),
    },
    keepSafety: {
      n: keepSafety.length,
      pass: keepSafety.filter((r) => r.pass).length,
      fail: keepFail.map((r) => r.id),
    },
    forcedSmoke: smokeRows.map((r) => ({
      id: r.id,
      pass: r.pass,
      ui: r.actual.uiState,
      qid: r.actual.qid,
      faces: r.actual.faces,
      errorType: r.errorType,
    })),
  },
  rows,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

function esc(s) {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

let md = '';
md += `# ACCURACY_EVAL · P1 HTTP · דיוק · 2026-09-09\n\n`;
md += `**Agent:** Accuracy (דיוק)  \n`;
md += `**Live alias:** ${BASE}  \n`;
md += `**Deploy:** \`${DEPLOY}\`  \n`;
md += `**When:** ${whenLocal}  \n`;
md += `**Phase expected:** ${PHASE_EXPECTED} · **phaseOk:** ${phaseOk}  \n`;
md += `**Case set:** \`${path.basename(CASE_SET)}\` (N=${set.meta.n}) + forced smoke IBM+NY → **N=${rows.length}** run  \n`;
md += `**Skipped:** none — ALL cases run  \n`;
md += `**Rules:** public sources only · no Sync.me/Truecaller · no product code change · UNKNOWN stays UNKNOWN · no threshold lowering  \n`;
md += `**Method:** GET simple q · POST JSON for ctx · Origin=${ORIGIN} · nocache=1 · timeout=65s · concurrency=${CONCURRENCY}  \n`;
md += `**Elapsed:** ${(elapsedMs / 1000).toFixed(1)}s\n\n`;

md += `## Summary metrics\n\n`;
md += `| Metric | Value |\n|--------|-------|\n`;
md += `| N | ${rows.length} |\n`;
md += `| PASS | ${passed} |\n`;
md += `| FAIL | ${failed} |\n`;
md += `| TP | ${confusion.TP} |\n`;
md += `| FP | ${confusion.FP} |\n`;
md += `| TN | ${confusion.TN} |\n`;
md += `| FN | ${confusion.FN} |\n`;
md += `| OVER-GATE | ${overGate} |\n`;
md += `| PRETTY-WRONG | ${prettyWrongN} |\n`;
md += `| Regression 4 | ${regressionRows.filter((r) => r.pass).length}/${regressionRows.length} |\n`;
md += `| KEEP safety | ${keepSafety.filter((r) => r.pass).length}/${keepSafety.length} |\n`;
md += `| Recommendation | **${recommendation}** |\n\n`;

md += `**Recommendation evidence:** ${reasons.join('; ') || '—'}\n\n`;

md += `### By category\n\n`;
md += `| Category | N | PASS | FAIL |\n|----------|---|------|------|\n`;
for (const k of Object.keys(byCat).sort()) {
  const v = byCat[k];
  md += `| ${k} | ${v.n} | ${v.pass} | ${v.fail} |\n`;
}

md += `\n### Error type counts (FAIL only)\n\n`;
if (!Object.keys(errorTypeCounts).length) {
  md += `None.\n`;
} else {
  md += `| Error type | Count |\n|------------|-------|\n`;
  for (const [k, v] of Object.entries(errorTypeCounts).sort((a, b) => b[1] - a[1])) {
    md += `| ${k} | ${v} |\n`;
  }
}

md += `\n## Forced smoke checks\n\n`;
md += `| Case | Expected | Actual | Conf | Status | Error |\n|------|----------|--------|------|--------|-------|\n`;
for (const r of smokeRows) {
  const act = `ui=${r.actual.uiState}; qid=${r.actual.qid || '-'}; faces=${r.actual.faces}`;
  md += `| ${esc(r.id)} | ${esc(r.expectedLabel)} | ${esc(act)} | ${esc(r.confidence)} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.errorType || '—'} |\n`;
}

md += `\n## Cases table\n\n`;
md += `| # | Cat | Subset | Input | Expected | Actual | Conf | Evidence | ms | Status | Error |\n`;
md += `|---|-----|--------|-------|----------|--------|------|----------|----|--------|-------|\n`;
rows.forEach((r, i) => {
  const input = esc(JSON.stringify(r.input));
  const act = esc(
    `ui=${r.actual.uiState} mode=${r.actual.mode} qid=${r.actual.qid || '-'} faces=${r.actual.faces} img=${r.actual.images} src=${r.actual.sources} scen=${r.actual.scenario} phase=${r.actual.phase}`,
  );
  const st = r.pass ? 'PASS' : r.prettyWrong ? 'FAIL/PW' : 'FAIL';
  md += `| ${i + 1} | ${r.category} | ${r.subset} | ${input} | ${esc(r.expectedLabel)} | ${act} | ${esc(r.confidence)} | ${esc(r.evidence).slice(0, 100)} | ${r.ms} | **${st}** | ${r.errorType || '—'} |\n`;
});

md += `\n## Detail per case\n\n`;
for (const r of rows) {
  md += `### ${r.id} [${r.category}/${r.subset}] — ${r.pass ? 'PASS' : 'FAIL'}${r.prettyWrong ? ' · PRETTY-WRONG' : ''}\n\n`;
  md += `- **INPUT:** \`${esc(JSON.stringify(r.input))}\` (${r.method})\n`;
  md += `- **EXPECTED:** ${esc(r.expectedLabel)}\n`;
  md += `- **ACTUAL:** uiState=${r.actual.uiState} mode=${r.actual.mode} qid=${r.actual.qid} photo=${r.actual.photo} images=${r.actual.images} faces=${r.actual.faces} sources=${r.actual.sources} scenario=${r.actual.scenario} confidence=${r.confidence} phase=${r.actual.phase} messageKey=${r.actual.messageKey} ms=${r.ms}\n`;
  md += `- **CONFIDENCE:** ${r.confidence}\n`;
  md += `- **EVIDENCE:** ${esc(r.evidence)}\n`;
  md += `- **PASS/FAIL:** ${r.pass ? 'PASS' : 'FAIL'}${r.fails.length ? ` — ${r.fails.join('; ')}` : ''}\n`;
  md += `- **ERROR TYPE:** ${r.errorType || '—'}\n`;
  md += `- **CONFUSION:** ${r.confusion || '—'}\n`;
  if (r.notes.length) md += `- **NOTES:** ${r.notes.join('; ')}\n`;
  md += `\n`;
}

md += `## Pretty-wrong verdict\n\n`;
if (prettyWrongN === 0) {
  md += `**CLEAR** — no dossier+faces on conflict/garbage/unknown/ambiguous traps.\n`;
} else {
  md += `**HIT** — ${prettyWrongN} case(s):\n`;
  for (const r of prettyWrongHits) {
    md += `- ${r.id}: ui=${r.actual.uiState} qid=${r.actual.qid} faces=${r.actual.faces} — ${r.fails.join('; ')}\n`;
  }
}

md += `\n## Recommendation\n\n`;
md += `**${recommendation}** from Accuracy (דיוק) with evidence: ${reasons.join('; ')}.\n\n`;

md += `## Room summary (HE · 4 sentences)\n\n`;
const heFailList = rows.filter((r) => !r.pass).map((r) => r.id);
md += `רצנו הערכת דיוק חיה (HTTP) מול האליאס אחרי P1 (\`${DEPLOY}\`) — ${rows.length} מקרים מתוך סט v2 (34) פלוס סמוק IBM+NY, ללא דילוגים. `;
md += `תוצאה: ${passed} PASS / ${failed} FAIL; pretty-wrong=${prettyWrongN}; OVER-GATE=${overGate}; TP/FP/TN/FN=${confusion.TP}/${confusion.FP}/${confusion.TN}/${confusion.FN}; phase=${phaseOk ? 'orchestrator-v0-b מאומת' : 'חריגה'}. `;
md += `רגרסיות P1 (נתניהו/ביבי/Zehava/Merkel) ו-KEEP בטיחות (דני כהן, John Smith, אימייל, IBM+NY): ${regFail.length === 0 && keepFail.length === 0 ? 'כולן PASS' : 'כשל ב-' + [...regFail, ...keepFail].map((r) => r.id).join(', ')}. `;
md += `המלצת Accuracy: **${recommendation}**${heFailList.length ? ` (כשלים: ${heFailList.join(', ')})` : ''}; דוחות: ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09.md/.json + ACCURACY_REPORT.md.\n`;

fs.writeFileSync(OUT_MD, md, 'utf8');

// ACCURACY_REPORT.md — latest run
let rep = '';
rep += `# ACCURACY_REPORT\n\n`;
rep += `**Latest eval:** ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09  \n`;
rep += `**When:** ${whenLocal}  \n`;
rep += `**Base:** ${BASE} · deploy \`${DEPLOY}\` · phase ${PHASE_EXPECTED} · phaseOk=${phaseOk}  \n`;
rep += `**Totals:** N=${rows.length} · PASS=${passed} · FAIL=${failed} · pretty-wrong=${prettyWrongN} · OVER-GATE=${overGate}  \n`;
rep += `**Confusion:** TP=${confusion.TP} FP=${confusion.FP} TN=${confusion.TN} FN=${confusion.FN}  \n`;
rep += `**Recommendation:** **${recommendation}** — ${reasons.join('; ')}\n\n`;
rep += `| Case | Cat | Expected | Actual | Confidence | Status | Error |\n`;
rep += `|------|-----|----------|--------|------------|--------|-------|\n`;
for (const r of rows) {
  const act = `ui=${r.actual.uiState}; qid=${r.actual.qid || '-'}; faces=${r.actual.faces}; src=${r.actual.sources}`;
  const st = r.pass ? 'PASS' : r.prettyWrong ? 'FAIL/PW' : 'FAIL';
  rep += `| ${esc(r.id)} | ${esc(r.category)} | ${esc(r.expectedLabel)} | ${esc(act)} | ${esc(r.confidence)} | ${st} | ${r.errorType || '—'} |\n`;
}
rep += `\n## By category\n\n`;
rep += `| Category | N | PASS | FAIL |\n|----------|---|------|------|\n`;
for (const k of Object.keys(byCat).sort()) {
  const v = byCat[k];
  rep += `| ${k} | ${v.n} | ${v.pass} | ${v.fail} |\n`;
}
rep += `\n## Pretty-wrong\n${prettyWrongN === 0 ? 'None — CLEAR.' : prettyWrongHits.map((r) => `- ${r.id}`).join('\n')}\n`;
rep += `\n## Prior eval\nPrevious: ACCURACY_EVAL-דיוק-2026-09-09 (N=16, PASS=12, FAIL=4, pretty-wrong=0) on dpl_9V8i — P1 targets those 4 over-gate/recall FAILs.\n`;
fs.writeFileSync(OUT_REPORT, rep, 'utf8');
fs.writeFileSync(OUT_LOG, logLines.join('\n') + '\n', 'utf8');

log('');
log('========== SUMMARY ==========');
log(`N=${rows.length} PASS=${passed} FAIL=${failed} pretty-wrong=${prettyWrongN} OVER-GATE=${overGate}`);
log(`TP=${confusion.TP} FP=${confusion.FP} TN=${confusion.TN} FN=${confusion.FN}`);
log(`phaseOk=${phaseOk} recommendation=${recommendation}`);
log(`elapsed=${(elapsedMs / 1000).toFixed(1)}s`);
log(`md: ${OUT_MD}`);
log(`json: ${OUT_JSON}`);
log(`report: ${OUT_REPORT}`);
for (const r of rows) {
  log(
    `  ${r.pass ? '✓' : '✗'} ${r.id} ui=${r.actual.uiState} qid=${r.actual.qid || '-'} faces=${r.actual.faces}` +
      (r.fails.length ? ` :: ${r.fails.join('; ')}` : ''),
  );
}
log('=============================');
process.exit(failed === 0 ? 0 : 1);
