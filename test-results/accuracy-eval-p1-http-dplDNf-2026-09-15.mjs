#!/usr/bin/env node
/**
 * Accuracy (דיוק) LIVE HTTP eval — P1 cases vs alias dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu
 * Case set: handoff/P1-CASES-דיוק-2026-09-14.json (N=25) — EXPECTED unchanged
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.AKVOT_BASE || 'https://akvot-simple-demo.vercel.app').replace(/\/$/, '');
const ORIGIN = 'https://akvot-simple-demo.vercel.app';
const TIMEOUT_MS = 65000;
const CONCURRENCY = Number(process.env.AKVOT_CONCURRENCY || 3);
const DEPLOY = 'dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu';
const PHASE_EXPECTED = 'orchestrator-v0-b';
const CASE_SET = path.join(__dirname, 'handoff', 'P1-CASES-דיוק-2026-09-14.json');
const OUT_MD = path.join(__dirname, 'ACCURACY_EVAL-P1-HTTP-dplDNf-דיוק-2026-09-15.md');
const OUT_JSON = path.join(__dirname, 'ACCURACY_EVAL-P1-HTTP-dplDNf-דיוק-2026-09-15.json');
const OUT_REPORT = path.join(__dirname, 'ACCURACY_REPORT.md');
const OUT_LOG = path.join(__dirname, 'ACCURACY_EVAL-P1-HTTP-dplDNf-דיוק-2026-09-15.run.log');
const FAKE_EMAIL = 'qa.rethink.test@example.com';

const logLines = [];
function log(s) {
  const line = typeof s === 'string' ? s : String(s);
  console.log(line);
  logLines.push(line);
}

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

async function probeHttp() {
  const t0 = Date.now();
  try {
    const r = await fetch(`${BASE}/api/lookup?q=test&nocache=1`, {
      headers: { Origin: ORIGIN, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await r.text();
    return { status: r.status, ms: Date.now() - t0, bodyHead: text.slice(0, 200) };
  } catch (e) {
    return { status: 0, ms: Date.now() - t0, err: String(e.message || e) };
  }
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

function expectedLabel(c) {
  const parts = [];
  parts.push(`ui∈[${(c.expected_ui || []).join('|')}]`);
  if (c.qid) parts.push(`qid=${c.qid}`);
  if (c.faces === 0) parts.push('0 faces');
  if (c.faces === true || c.faces === 1) parts.push('faces');
  if ((c.must_not || []).length) parts.push(`must_not=${c.must_not.join(',')}`);
  if (c.p2) parts.push('P2');
  return parts.join(' · ');
}

function isSafetyCase(c) {
  return /^S0[1-7]$/.test(c.id);
}

function judge(c, snap) {
  const fails = [];
  const notes = [];
  const { status, err, data: d, raw } = snap;
  if (err) {
    fails.push(`network: ${err}`);
    return { pass: false, statusKind: 'FAIL', fails, notes, prettyWrong: false, errorType: 'OTHER' };
  }
  if (status === 429) {
    fails.push('http 429');
    return { pass: false, statusKind: 'FAIL', fails, notes, prettyWrong: false, errorType: 'OTHER' };
  }
  if (status === 403) {
    fails.push('http 403');
    return { pass: false, statusKind: 'FAIL', fails, notes, prettyWrong: false, errorType: 'OTHER' };
  }
  if (status !== 200) {
    fails.push(`http ${status}`);
    return { pass: false, statusKind: 'FAIL', fails, notes, prettyWrong: false, errorType: 'OTHER' };
  }
  if (!d) {
    fails.push('bad json');
    return { pass: false, statusKind: 'FAIL', fails, notes, prettyWrong: false, errorType: 'OTHER' };
  }

  const uiStates = c.expected_ui || [];
  const ui = d.uiState || '';
  const faces = hasFaces(d);
  const qid = d.qid || null;
  let prettyWrong = false;
  const mustNot = c.must_not || [];

  // Assaf P06 special: need_context / thin → PASS_DOCUMENTED_P2 (do not force dossier)
  if (c.p2 || c.id === 'P06') {
    if (ui === 'need_context' || ui === 'thin') {
      // Documented P2 — acceptable without forcing dossier
      if (faces && mustNot.includes('dossier')) {
        // still flag if weird faces on lock — but P06 expected allows dossier too
      }
      notes.push('Assaf P2: need_context|thin acceptable — PASS_DOCUMENTED_P2');
      return {
        pass: true,
        statusKind: 'PASS_DOCUMENTED_P2',
        fails: [],
        notes,
        prettyWrong: false,
        errorType: null,
      };
    }
    // If dossier lands and is in expected_ui, treat as strict PASS (not forced)
    if (ui === 'dossier' && uiStates.includes('dossier')) {
      notes.push('Assaf P2: dossier returned (in EXPECTED) — strict PASS, not forced');
      // continue through normal qid/faces checks below
    }
  }

  if (uiStates.length && !uiStates.includes(ui)) {
    fails.push(`uiState=${ui} expected ${uiStates.join('|')}`);
  }

  // qid match when EXPECTED specifies qid and we got dossier (or any positive commit)
  if (c.qid != null && ui === 'dossier') {
    if (qid !== c.qid) {
      fails.push(`qid=${qid} expected ${c.qid}`);
      if (faces) prettyWrong = true;
    }
  }
  // If expected only dossier+qid and we have dossier with wrong/missing qid already failed

  if (c.faces === 0 && faces) fails.push('faces must be 0');
  if ((c.faces === true || c.faces === 1) && !faces) fails.push('faces expected');

  // must_not
  if (mustNot.includes('dossier') && ui === 'dossier') {
    fails.push('must_not dossier');
    if (faces) prettyWrong = true;
  }
  if (mustNot.includes('pretty_wrong') && ui === 'dossier' && faces) {
    fails.push('pretty-wrong: dossier+faces');
    prettyWrong = true;
  }
  if (mustNot.includes('email_leak')) {
    const email = (c.ctx && c.ctx.email) || FAKE_EMAIL;
    if (raw && raw.includes(email)) fails.push('email leaked in response');
  }

  // SAFETY S01-S07: dossier = pretty-wrong / SAFETY breach
  if (isSafetyCase(c) && ui === 'dossier') {
    fails.push('SAFETY: dossier on S-case');
    prettyWrong = true;
  }

  // Wrong-person dossier with faces
  if (ui === 'dossier' && faces && c.qid && qid && qid !== c.qid) {
    prettyWrong = true;
  }

  if (d.phase && d.phase !== PHASE_EXPECTED) {
    notes.push(`phase=${d.phase} (expected ${PHASE_EXPECTED})`);
  }

  let errorType = null;
  if (fails.length) {
    if (prettyWrong) errorType = 'PRETTY-WRONG';
    else if (uiStates.includes('dossier') && uiStates.length === 1 && ui !== 'dossier') {
      if (ui === 'need_context' || ui === 'thin' || ui === 'candidates') errorType = 'OVER-GATE';
      else errorType = 'FN';
    } else if (mustNot.includes('dossier') && ui === 'dossier') {
      errorType = faces ? 'PRETTY-WRONG' : 'FP';
    } else if (isSafetyCase(c) && ui === 'dossier') {
      errorType = 'PRETTY-WRONG';
    } else if (c.qid && qid && qid !== c.qid) {
      errorType = 'FP';
    } else {
      errorType = 'OTHER';
    }
  }

  return {
    pass: fails.length === 0,
    statusKind: fails.length === 0 ? 'PASS' : 'FAIL',
    fails,
    notes,
    prettyWrong,
    errorType,
  };
}

function actualBrief(d, ms, status) {
  if (!d) return `http=${status} (no body) ms=${ms}`;
  return `uiState=${d.uiState || '-'},qid=${d.qid || '-'},faces=${hasFaces(d)},sources=${(d.sources || []).length},confidence=${d.confidence || '-'},phase=${d.phase || '-'},ms=${ms}`;
}

async function poolMap(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker(wid) {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx, wid);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, (_, w) => worker(w)));
  return out;
}

async function main() {
  const started = new Date();
  const set = JSON.parse(fs.readFileSync(CASE_SET, 'utf8'));
  const cases = set.cases;

  log(`# ACCURACY EVAL P1 HTTP dplDNf · ${started.toISOString()}`);
  log(`BASE=${BASE} DEPLOY=${DEPLOY} CONCURRENCY=${CONCURRENCY}`);

  const probe = await probeHttp();
  log(`PROBE /api/lookup?q=test → HTTP ${probe.status} in ${probe.ms}ms`);
  if (probe.status === 403) {
    log('FATAL: probe returned 403 — aborting eval');
    fs.writeFileSync(OUT_LOG, logLines.join('\n'));
    process.exit(2);
  }
  if (probe.status !== 200 && probe.status !== 0) {
    log(`WARN: probe status ${probe.status} (not 403) — continuing`);
  }

  const t0 = Date.now();
  const results = await poolMap(cases, CONCURRENCY, async (c, idx, wid) => {
    const method = c.ctx ? 'POST' : 'GET';
    const input = { q: c.q, ...(c.ctx ? { ctx: c.ctx } : {}) };
    log(`[w${wid}] → ${c.id} ${method} q=${JSON.stringify(c.q)}${c.ctx ? ' ctx=' + JSON.stringify(c.ctx) : ''}`);
    const snap = await callLookup({ method, q: c.q, ctx: c.ctx || {} });
    const j = judge(c, snap);
    const d = snap.data;
    const row = {
      id: c.id,
      category: c.category,
      input,
      method,
      expected: {
        ui: c.expected_ui,
        qid: c.qid || null,
        faces: c.faces ?? null,
        must_not: c.must_not || [],
        p2: !!c.p2,
        label: expectedLabel(c),
      },
      actual: {
        http: snap.status,
        uiState: d?.uiState ?? null,
        qid: d?.qid ?? null,
        faces: hasFaces(d),
        sources: Array.isArray(d?.sources) ? d.sources.length : 0,
        confidence: d?.confidence ?? null,
        phase: d?.phase ?? null,
        mode: d?.mode ?? null,
        scenario: d?.scenario ?? null,
        images: Array.isArray(d?.images) ? d.images.length : 0,
        photo: !!d?.photo,
        messageKey: d?.messageKey ?? null,
        ms: snap.ms,
      },
      status: j.statusKind,
      pass: j.pass,
      prettyWrong: j.prettyWrong,
      errorType: j.errorType,
      fails: j.fails,
      notes: j.notes,
      evidence: evidenceBrief(d),
      err: snap.err,
    };
    log(
      `[w${wid}] ← ${c.id} ${snap.ms}ms http=${snap.status} ${actualBrief(d, snap.ms, snap.status)} → ${j.statusKind}` +
        (j.fails.length ? ' :: ' + j.fails.join('; ') : '') +
        (j.prettyWrong ? ' PRETTY-WRONG' : '')
    );
    return row;
  });

  const elapsedMs = Date.now() - t0;
  const N = results.length;
  const PASS = results.filter((r) => r.status === 'PASS').length;
  const FAIL = results.filter((r) => r.status === 'FAIL').length;
  const PASS_DOCUMENTED_P2 = results.filter((r) => r.status === 'PASS_DOCUMENTED_P2').length;
  const prettyWrong = results.filter((r) => r.prettyWrong).length;
  const safetyRows = results.filter((r) => isSafetyCase(r));
  const safetyPass = safetyRows.every((r) => r.pass && r.actual.uiState !== 'dossier' && !r.prettyWrong);
  const safetyLock = safetyPass ? 'PASS' : 'FAIL';
  const safetyDetail = `${safetyRows.filter((r) => r.pass).length}/${safetyRows.length}`;

  // Recommendation
  let recommendation = 'GO';
  let recNote = '';
  if (prettyWrong > 0) {
    recommendation = 'NO-GO';
    recNote = `${prettyWrong} pretty-wrong — STOP`;
  } else if (!safetyPass) {
    recommendation = 'NO-GO';
    recNote = 'SAFETY lock failed';
  } else if (FAIL > 0) {
    // non-safety FAILs: GO with caveats if no pretty-wrong
    const critical = results.filter(
      (r) => r.status === 'FAIL' && (r.errorType === 'FP' || r.errorType === 'PRETTY-WRONG')
    );
    if (critical.length) {
      recommendation = 'NO-GO';
      recNote = `${critical.length} critical FAIL(s)`;
    } else {
      recommendation = 'GO';
      recNote = `${FAIL} non-critical FAIL(s) — GO with caveats`;
    }
  } else {
    recNote = `all strict+documented pass (PASS=${PASS}, PASS_DOCUMENTED_P2=${PASS_DOCUMENTED_P2})`;
  }

  // Jerusalem/Bucharest wall clock for report
  const whenIL = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Bucharest',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(started);

  // Build MD
  let md = '';
  md += `# ACCURACY_EVAL · P1 HTTP · dplDNf · דיוק · 2026-09-15\n\n`;
  md += `**HTTP probe:** /api/lookup?q=test → **HTTP ${probe.status}** (NOT 403) · ${probe.ms}ms\n\n`;
  md += `**Agent:** Accuracy (דיוק)  \n`;
  md += `**Live alias:** ${BASE}  \n`;
  md += `**Deploy:** \`${DEPLOY}\`  \n`;
  md += `**When:** ${whenIL} Europe/Bucharest (UTC+3)  \n`;
  md += `**Phase expected:** ${PHASE_EXPECTED}  \n`;
  md += `**Case set:** \`handoff/P1-CASES-דיוק-2026-09-14.json\` (N=${N}) — EXPECTED unchanged  \n`;
  md += `**Rules:** GET simple q · POST JSON for ctx · Origin=${ORIGIN} · nocache=1 · timeout=65s · concurrency=${CONCURRENCY}  \n`;
  md += `**Assaf P06:** P2 — need_context|thin → PASS_DOCUMENTED_P2 (do not force dossier)  \n`;
  md += `**Elapsed:** ${(elapsedMs / 1000).toFixed(1)}s\n\n`;

  md += `## Summary metrics\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| N | ${N} |\n`;
  md += `| PASS | ${PASS} |\n`;
  md += `| FAIL | ${FAIL} |\n`;
  md += `| PASS_DOCUMENTED_P2 | ${PASS_DOCUMENTED_P2} |\n`;
  md += `| pretty-wrong | ${prettyWrong} |\n`;
  md += `| SAFETY lock S01–S07 | **${safetyLock}** (${safetyDetail}) |\n`;
  md += `| Recommendation | **${recommendation}** |\n\n`;
  md += `**Recommendation evidence:** ${recNote}\n\n`;

  // By category
  const cats = [...new Set(results.map((r) => r.category))];
  md += `### By category\n\n`;
  md += `| Category | N | PASS | FAIL | P2 |\n|----------|---|------|------|----|\n`;
  for (const cat of cats) {
    const rows = results.filter((r) => r.category === cat);
    md += `| ${cat} | ${rows.length} | ${rows.filter((r) => r.status === 'PASS').length} | ${rows.filter((r) => r.status === 'FAIL').length} | ${rows.filter((r) => r.status === 'PASS_DOCUMENTED_P2').length} |\n`;
  }
  md += `\n`;

  const errTypes = {};
  for (const r of results.filter((r) => r.status === 'FAIL')) {
    const t = r.errorType || 'OTHER';
    errTypes[t] = (errTypes[t] || 0) + 1;
  }
  if (Object.keys(errTypes).length) {
    md += `### Error type counts (FAIL only)\n\n`;
    md += `| Error type | Count |\n|------------|-------|\n`;
    for (const [t, n] of Object.entries(errTypes)) md += `| ${t} | ${n} |\n`;
    md += `\n`;
  }

  md += `## Cases table\n\n`;
  md += `| ID | INPUT | EXPECTED | ACTUAL | PASS/FAIL | ERROR TYPE |\n`;
  md += `|----|-------|----------|--------|-----------|------------|\n`;
  for (const r of results) {
    const inputStr = r.method === 'POST'
      ? `\`${r.input.q}\` + ${JSON.stringify(r.input.ctx || {})}`
      : `\`${r.input.q}\``;
    const act = actualBrief(
      {
        uiState: r.actual.uiState,
        qid: r.actual.qid,
        photo: r.actual.photo,
        images: Array(r.actual.images),
        sources: Array(r.actual.sources),
        confidence: r.actual.confidence,
        phase: r.actual.phase,
      },
      r.actual.ms,
      r.actual.http
    );
    // Fix faces display in actualBrief - rebuild manually
    const act2 = `uiState=${r.actual.uiState || '-'},qid=${r.actual.qid || '-'},faces=${r.actual.faces},sources=${r.actual.sources},confidence=${r.actual.confidence || '-'},phase=${r.actual.phase || '-'},ms=${r.actual.ms}`;
    md += `| ${r.id} | ${inputStr} | ${r.expected.label} | ${act2} | **${r.status}** | ${r.errorType || (r.fails.length ? r.fails.join('; ') : '—')} |\n`;
  }
  md += `\n`;

  md += `## Detail\n\n`;
  for (const r of results) {
    md += `### ${r.id} · ${r.status}\n`;
    md += `- **INPUT:** ${JSON.stringify(r.input)}\n`;
    md += `- **EXPECTED:** ${r.expected.label}\n`;
    md += `- **ACTUAL:** ${actualBrief({ uiState: r.actual.uiState, qid: r.actual.qid, photo: r.actual.photo, images: r.actual.images ? [{}] : [], sources: Array(r.actual.sources).fill({}), confidence: r.actual.confidence, phase: r.actual.phase }, r.actual.ms, r.actual.http).replace(/faces=(true|false)/, `faces=${r.actual.faces}`)}\n`;
    md += `- **ACTUAL raw:** uiState=${r.actual.uiState}, qid=${r.actual.qid}, faces=${r.actual.faces}, sources=${r.actual.sources}, confidence=${r.actual.confidence}, phase=${r.actual.phase}, mode=${r.actual.mode}, ms=${r.actual.ms}\n`;
    md += `- **Evidence:** ${r.evidence}\n`;
    if (r.fails.length) md += `- **Fails:** ${r.fails.join('; ')}\n`;
    if (r.notes.length) md += `- **Notes:** ${r.notes.join('; ')}\n`;
    md += `\n`;
  }

  md += `## Pretty-wrong\n`;
  const pw = results.filter((r) => r.prettyWrong);
  if (!pw.length) md += `None — CLEAR.\n\n`;
  else {
    for (const r of pw) md += `- ${r.id}: ${r.fails.join('; ')}\n`;
    md += `\n`;
  }

  md += `## SAFETY lock S01–S07\n`;
  md += `**${safetyLock}** (${safetyDetail}) — dossier forbidden; faces=0 preferred.\n\n`;
  for (const r of safetyRows) {
    md += `- ${r.id}: ui=${r.actual.uiState} faces=${r.actual.faces} → ${r.status}\n`;
  }
  md += `\n`;

  md += `## Hebrew summary (room)\n\n`;
  const heSummary = [
    `בדיקת HTTP חיה ל־25 מקרי P1 על alias dplDNf (probe HTTP ${probe.status}, לא 403): PASS=${PASS}, FAIL=${FAIL}, PASS_DOCUMENTED_P2=${PASS_DOCUMENTED_P2}, pretty-wrong=${prettyWrong}, SAFETY=${safetyLock}.`,
    `Assaf (P06) סומן P2 לפי מדיניות — need_context/thin כ־PASS_DOCUMENTED_P2 בלי לכפות dossier.`,
    `המלצה: **${recommendation}** — ${recNote}.`,
  ].join(' ');
  md += heSummary + '\n';

  fs.writeFileSync(OUT_MD, md, 'utf8');

  const jsonOut = {
    meta: {
      title: 'ACCURACY_EVAL-P1-HTTP-dplDNf',
      date: '2026-09-15',
      when: started.toISOString(),
      when_bucharest: whenIL,
      base: BASE,
      deploy: DEPLOY,
      origin: ORIGIN,
      phase_expected: PHASE_EXPECTED,
      case_set: 'handoff/P1-CASES-דיוק-2026-09-14.json',
      concurrency: CONCURRENCY,
      timeout_ms: TIMEOUT_MS,
      elapsed_ms: elapsedMs,
      probe: { status: probe.status, ms: probe.ms, not_403: probe.status !== 403 },
    },
    summary: {
      N,
      PASS,
      FAIL,
      PASS_DOCUMENTED_P2,
      pretty_wrong: prettyWrong,
      safety_lock: safetyLock,
      safety_detail: safetyDetail,
      recommendation,
      recommendation_evidence: recNote,
    },
    results,
    hebrew_summary: heSummary,
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(jsonOut, null, 2), 'utf8');

  // Update ACCURACY_REPORT.md briefly as latest
  let report = `# ACCURACY_REPORT\n\n`;
  report += `**Latest eval:** ACCURACY_EVAL-P1-HTTP-dplDNf-דיוק-2026-09-15  \n`;
  report += `**When:** ${whenIL} Europe/Bucharest  \n`;
  report += `**Base:** ${BASE} · deploy \`${DEPLOY}\` · probe HTTP ${probe.status} (not 403)  \n`;
  report += `**Totals:** N=${N} · PASS=${PASS} · FAIL=${FAIL} · PASS_DOCUMENTED_P2=${PASS_DOCUMENTED_P2} · pretty-wrong=${prettyWrong} · SAFETY=${safetyLock}  \n`;
  report += `**Recommendation:** **${recommendation}** — ${recNote}\n\n`;
  report += `| Case | Cat | Expected | Actual | Confidence | Status | Error |\n`;
  report += `|------|-----|----------|--------|------------|--------|-------|\n`;
  for (const r of results) {
    const act = `ui=${r.actual.uiState}; qid=${r.actual.qid || '-'}; faces=${r.actual.faces}; src=${r.actual.sources}`;
    report += `| ${r.id} | ${r.category} | ${r.expected.label} | ${act} | ${r.actual.confidence || '-'} | ${r.status} | ${r.errorType || '—'} |\n`;
  }
  report += `\n## Prior eval\n`;
  report += `Previous latest: ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09 (N=35, PASS=34, FAIL=1) on dpl_D2zv — superseded by this live P1 pack re-eval on dpl_DNf.\n`;
  fs.writeFileSync(OUT_REPORT, report, 'utf8');
  fs.writeFileSync(OUT_LOG, logLines.join('\n') + '\n', 'utf8');

  console.log('\n=== DONE ===');
  console.log(JSON.stringify(jsonOut.summary, null, 2));
  console.log(heSummary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
