#!/usr/bin/env node
/**
 * Accuracy (דיוק) live eval — post P0 deploy dpl_9V8iig4PLALA4t7V7hNNQFo8Q3az
 * BASE alias: https://akvot-simple-demo.vercel.app
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.AKVOT_BASE || 'https://akvot-simple-demo.vercel.app').replace(/\/$/, '');
const ORIGIN = BASE;
const TIMEOUT_MS = 65000;
const FAKE_EMAIL = 'qa.rethink.test@example.com';
const DEPLOY_HINT = 'dpl_9V8iig4PLALA4t7V7hNNQFo8Q3az';
const OUT_MD = path.join(__dirname, 'ACCURACY_EVAL-דיוק-2026-09-09.md');
const OUT_JSON = path.join(__dirname, 'ACCURACY_EVAL-דיוק-2026-09-09.json');
const OUT_REPORT = path.join(__dirname, 'ACCURACY_REPORT.md');
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

async function callLookup({ method = 'GET', q, ctx = {}, body }) {
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
      const payload = body || { q, ...ctx, nocache: 1 };
      opts = {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
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

/**
 * EXPECTED shape:
 * - uiStates: string[] allowed
 * - qid?: string exact
 * - faces?: boolean | null (null=any)
 * - must_not: string[] e.g. 'dossier+faces', 'fake_dossier', 'email_leak', 'qid_fabricated'
 * - prettyWrongIf?: (d)=>bool
 */
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
  const ui = d.uiState || '';
  const faces = hasFaces(d);
  const qid = d.qid || null;
  let prettyWrong = false;

  if (exp.uiStates && !exp.uiStates.includes(ui)) {
    fails.push(`uiState=${ui} expected ${exp.uiStates.join('|')}`);
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
    fails.push('fake dossier on unknown/garbage');
    prettyWrong = true;
  }
  if (mustNot.includes('email_leak') && raw && raw.includes(FAKE_EMAIL)) {
    fails.push('email leaked in response');
  }
  if (mustNot.includes('qid_when_unknown') && qid) {
    fails.push(`qid fabricated=${qid}`);
    prettyWrong = true;
  }
  if (mustNot.includes('faces') && faces) {
    fails.push('faces not allowed');
  }
  // phase check soft note
  if (d.phase && d.phase !== 'orchestrator-v0-b') {
    notes.push(`phase=${d.phase} (expected orchestrator-v0-b)`);
  }

  // custom
  if (typeof exp.extra === 'function') {
    const extraFails = exp.extra(d, raw) || [];
    for (const f of extraFails) fails.push(f);
  }

  return { pass: fails.length === 0, fails, notes, prettyWrong };
}

const CASES = [
  // 1. exact famous HE
  {
    id: '1-exact-netanyahu',
    cat: 'exact',
    method: 'GET',
    input: { q: 'נתניהו' },
    expected: {
      uiStates: ['dossier'],
      qid: 'Q43723',
      faces: true,
      must_not: [],
    },
    expectedLabel: 'dossier + Q43723 + faces OK',
  },
  {
    id: '1b-exact-bibi-full',
    cat: 'exact',
    method: 'GET',
    input: { q: 'בנימין נתניהו' },
    expected: {
      uiStates: ['dossier'],
      qid: 'Q43723',
      faces: true,
      must_not: [],
    },
    expectedLabel: 'dossier + Q43723 + faces OK',
  },
  // 2. clear non-match / garbage
  {
    id: '2-garbage-nonsense',
    cat: 'garbage',
    method: 'GET',
    input: { q: 'Xzqplmnvwtr987654321asdfgh' },
    expected: {
      uiStates: ['thin', 'need_context'],
      faces: false,
      must_not: ['fake_dossier', 'dossier+faces', 'faces'],
    },
    expectedLabel: 'thin|need_context, NO faces/dossier fake',
  },
  {
    id: '2b-garbage-he',
    cat: 'garbage',
    method: 'GET',
    input: { q: 'בלהבלהזומזום123xyz' },
    expected: {
      uiStates: ['thin', 'need_context'],
      faces: false,
      must_not: ['fake_dossier', 'dossier+faces', 'faces'],
    },
    expectedLabel: 'thin|need_context, NO faces/fake dossier',
  },
  // 3. ambiguous HE bare
  {
    id: '3-ambiguous-danny-cohen',
    cat: 'ambiguous',
    method: 'GET',
    input: { q: 'דני כהן' },
    expected: {
      uiStates: ['need_context'],
      faces: false,
      must_not: ['dossier+faces', 'faces'],
    },
    expectedLabel: 'need_context, 0 faces',
  },
  // 4. unknown / obscure
  {
    id: '4-unknown-obscure',
    cat: 'unknown',
    method: 'POST',
    input: { q: 'פלמוני אלמוניזקש', ctx: { city: 'דימונה', org: 'מפעל בדיקה פיקטיבי' } },
    expected: {
      uiStates: ['thin', 'need_context'],
      faces: false,
      must_not: ['fake_dossier', 'dossier+faces', 'qid_when_unknown', 'faces'],
    },
    expectedLabel: 'thin|need_context, UNKNOWN stays UNKNOWN',
  },
  {
    id: '4b-unknown-latin-obscure',
    cat: 'unknown',
    method: 'POST',
    input: {
      q: 'Zyxwvutsrqponmlkjihgfedcba Quux',
      ctx: { city: 'Reykjavik', org: 'Nonexistent Labs LLC' },
    },
    expected: {
      uiStates: ['thin', 'need_context', 'candidates'],
      faces: false,
      must_not: ['fake_dossier', 'dossier+faces'],
      extra: (d) => {
        const f = [];
        if (d.uiState === 'dossier') f.push('must not dossier on obscure');
        if (hasFaces(d)) f.push('faces on obscure');
        return f;
      },
    },
    expectedLabel: 'thin|need_context|candidates, no fabricated dossier+faces',
  },
  // 5. conflict / pretty-wrong traps
  {
    id: '5-conflict-smith-ibm-ny',
    cat: 'conflict',
    method: 'POST',
    input: {
      q: 'John Smith',
      ctx: { org: 'IBM', city: 'New York', country: 'US' },
    },
    expected: {
      uiStates: ['candidates', 'need_context', 'thin'],
      faces: false,
      must_not: ['dossier+faces'],
      extra: (d) => {
        const f = [];
        if (d.uiState === 'dossier' && hasFaces(d)) f.push('pretty-wrong dossier+faces');
        if (hasFaces(d) && d.uiState !== 'dossier') f.push(`faces on ${d.uiState}`);
        return f;
      },
    },
    expectedLabel: 'candidates|need_context|thin, NOT dossier+faces',
  },
  {
    id: '5b-conflict-smith-email',
    cat: 'conflict',
    method: 'POST',
    input: { q: 'John Smith', ctx: { email: FAKE_EMAIL } },
    expected: {
      uiStates: ['candidates', 'need_context', 'thin'],
      faces: false,
      must_not: ['dossier+faces', 'email_leak'],
      extra: (d) => {
        const f = [];
        if (d.uiState === 'dossier' && hasFaces(d)) f.push('pretty-wrong dossier+faces');
        return f;
      },
    },
    expectedLabel: 'NOT dossier+faces; no email leak',
  },
  // 6. partial evidence
  {
    id: '6-partial-emily-chen',
    cat: 'partial',
    method: 'POST',
    input: {
      q: 'Emily Chen',
      ctx: { city: 'Palo Alto', role: 'student' },
    },
    expected: {
      // not over-commit: may be candidates/need_context/thin; dossier only if strong — allow candidates/need_context/thin primarily
      // If dossier+faces without strong evidence that is over-commit → fail
      uiStates: ['candidates', 'need_context', 'thin', 'dossier'],
      must_not: [],
      extra: (d) => {
        const f = [];
        // Over-commit = dossier with faces when confidence low / thin evidence
        if (d.uiState === 'dossier' && hasFaces(d) && (d.confidence === 'low' || d.thin === true)) {
          f.push('over-commit: dossier+faces with low/thin');
        }
        // Prefer not dossier on weak partial — if dossier, require high confidence and qid
        if (d.uiState === 'dossier' && d.confidence !== 'high') {
          f.push(`over-commit: dossier confidence=${d.confidence}`);
        }
        return f;
      },
    },
    expectedLabel: 'not over-commit (no low-conf dossier+faces)',
  },
  // 7. near-match / transliteration
  {
    id: '7-near-zehava-galon',
    cat: 'near-match',
    method: 'GET',
    input: { q: 'Zehava Galon' },
    expected: {
      uiStates: ['dossier'],
      // Q2630062 historically
      faces: true,
      must_not: [],
      extra: (d) => {
        const f = [];
        if (d.uiState === 'dossier' && !d.qid) f.push('dossier without qid');
        return f;
      },
    },
    expectedLabel: 'dossier OK if wiki exact (transliteration)',
  },
  // 8. duplicate identity Latin bare
  {
    id: '8-dup-john-smith-bare',
    cat: 'duplicate',
    method: 'GET',
    input: { q: 'John Smith' },
    expected: {
      uiStates: ['need_context'],
      faces: false,
      must_not: ['dossier+faces', 'faces'],
    },
    expectedLabel: 'need_context 0 faces',
  },
  // KEEP regression seeded
  {
    id: '9-keep-orly-levy',
    cat: 'regression',
    method: 'GET',
    input: { q: 'אורלי לוי' },
    expected: {
      uiStates: ['dossier'],
      faces: true,
      must_not: [],
      extra: (d) => {
        const f = [];
        if (d.uiState !== 'dossier') f.push(`expected seeded dossier got ${d.uiState}`);
        return f;
      },
    },
    expectedLabel: 'seeded dossier (אורלי לוי)',
  },
];

const rows = [];
console.log(`ACCURACY EVAL דיוק → ${BASE}`);
console.log(`deploy hint: ${DEPLOY_HINT}`);
console.log(`cases=${CASES.length} Origin=${ORIGIN} timeout=${TIMEOUT_MS}ms\n`);

for (const c of CASES) {
  process.stdout.write(`→ ${c.id} [${c.cat}] ${c.method} ... `);
  const snap = await callLookup({
    method: c.method,
    q: c.input.q,
    ctx: c.input.ctx || {},
  });
  const verdict = judge(c, snap);
  const d = snap.data;
  const faces = hasFaces(d);
  const row = {
    id: c.id,
    cat: c.cat,
    method: c.method,
    input: c.input,
    expectedLabel: c.expectedLabel,
    expected: {
      uiStates: c.expected.uiStates,
      qid: c.expected.qid ?? null,
      faces: c.expected.faces ?? null,
      must_not: c.expected.must_not || [],
    },
    pass: verdict.pass,
    prettyWrong: verdict.prettyWrong,
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
  rows.push(row);
  const tag = verdict.pass ? 'PASS' : verdict.prettyWrong ? 'FAIL/PRETTY-WRONG' : 'FAIL';
  console.log(
    `${tag} ${snap.ms}ms http=${snap.status} ui=${row.actual.uiState} qid=${row.actual.qid || '-'} faces=${faces} conf=${row.confidence || '-'} phase=${row.actual.phase || '-'}` +
      (verdict.fails.length ? ` | ${verdict.fails.join('; ')}` : ''),
  );
  await sleep(1800);
}

const passed = rows.filter((r) => r.pass).length;
const failed = rows.filter((r) => !r.pass).length;
const prettyWrongHits = rows.filter((r) => r.prettyWrong);
const phaseOk = rows.every((r) => !r.actual.phase || r.actual.phase === 'orchestrator-v0-b');
const whenIso = new Date().toISOString();
const whenLocal =
  new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) + ' Asia/Jerusalem';

const report = {
  when: whenIso,
  whenLocal,
  agent: 'דיוק',
  role: 'Accuracy',
  deploy: DEPLOY_HINT,
  base: BASE,
  phaseExpected: 'orchestrator-v0-b',
  phaseOk,
  n: rows.length,
  pass: passed,
  fail: failed,
  prettyWrong: prettyWrongHits.length,
  prettyWrongIds: prettyWrongHits.map((r) => r.id),
  rows,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

function esc(s) {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

let md = '';
md += `# ACCURACY_EVAL · דיוק · 2026-09-09\n\n`;
md += `**Agent:** Accuracy (דיוק)  \n`;
md += `**Live alias:** ${BASE}  \n`;
md += `**Deploy:** \`${DEPLOY_HINT}\`  \n`;
md += `**When:** ${whenLocal}  \n`;
md += `**Phase expected:** orchestrator-v0-b · **phaseOk:** ${phaseOk}  \n`;
md += `**Rules:** public sources only · no Sync.me/Truecaller · no product code change · UNKNOWN stays UNKNOWN  \n`;
md += `**Method:** GET simple q · POST /api/lookup JSON for context · Origin=${ORIGIN} · nocache=1 · timeout~65s\n\n`;
md += `## Summary\n\n`;
md += `| Metric | Value |\n|--------|-------|\n`;
md += `| N cases | ${rows.length} |\n`;
md += `| PASS | ${passed} |\n`;
md += `| FAIL | ${failed} |\n`;
md += `| Pretty-wrong hits | ${prettyWrongHits.length} |\n`;
md += `| Pretty-wrong IDs | ${prettyWrongHits.length ? prettyWrongHits.map((r) => r.id).join(', ') : '— none —'} |\n`;
md += `| Verdict | ${failed === 0 ? 'ALL PASS' : prettyWrongHits.length ? 'FAIL — pretty-wrong present' : 'FAIL — mismatches'} |\n\n`;

md += `## Cases\n\n`;
md += `| # | Cat | Input | Expected | Actual | Conf | Evidence | ms | Status |\n`;
md += `|---|-----|-------|----------|--------|------|----------|----|--------|\n`;
rows.forEach((r, i) => {
  const input = esc(JSON.stringify(r.input));
  const act = esc(
    `ui=${r.actual.uiState} mode=${r.actual.mode} qid=${r.actual.qid || '-'} faces=${r.actual.faces} img=${r.actual.images} src=${r.actual.sources} scen=${r.actual.scenario} phase=${r.actual.phase}`,
  );
  const st = r.pass ? 'PASS' : r.prettyWrong ? 'FAIL/PW' : 'FAIL';
  md += `| ${i + 1} | ${r.cat} | ${input} | ${esc(r.expectedLabel)} | ${act} | ${esc(r.confidence)} | ${esc(r.evidence).slice(0, 120)} | ${r.ms} | **${st}** |\n`;
});

md += `\n## Detail per case\n\n`;
for (const r of rows) {
  md += `### ${r.id} [${r.cat}] — ${r.pass ? 'PASS' : 'FAIL'}${r.prettyWrong ? ' · PRETTY-WRONG' : ''}\n\n`;
  md += `- **INPUT:** \`${esc(JSON.stringify(r.input))}\` (${r.method})\n`;
  md += `- **EXPECTED:** ${esc(r.expectedLabel)} · ui∈[${(r.expected.uiStates || []).join('|')}] · faces=${r.expected.faces} · must_not=${(r.expected.must_not || []).join(',') || '—'}\n`;
  md += `- **ACTUAL:** uiState=${r.actual.uiState} mode=${r.actual.mode} qid=${r.actual.qid} photo=${r.actual.photo} images=${r.actual.images} sources=${r.actual.sources} scenario=${r.actual.scenario} confidence=${r.confidence} phase=${r.actual.phase} ms=${r.ms}\n`;
  md += `- **CONFIDENCE:** ${r.confidence}\n`;
  md += `- **EVIDENCE:** ${esc(r.evidence)}\n`;
  md += `- **PASS/FAIL:** ${r.pass ? 'PASS' : 'FAIL'}${r.fails.length ? ` — ${r.fails.join('; ')}` : ''}\n`;
  if (r.notes.length) md += `- **NOTES:** ${r.notes.join('; ')}\n`;
  md += `\n`;
}

md += `## Pretty-wrong verdict\n\n`;
if (prettyWrongHits.length === 0) {
  md += `**CLEAR** — no dossier+faces on conflict/garbage/unknown traps in this run.\n`;
} else {
  md += `**HIT** — ${prettyWrongHits.length} case(s):\n`;
  for (const r of prettyWrongHits) {
    md += `- ${r.id}: ui=${r.actual.uiState} qid=${r.actual.qid} faces=${r.actual.faces} — ${r.fails.join('; ')}\n`;
  }
}

md += `\n## Room summary (HE)\n\n`;
md += `רצנו ${rows.length} מקרי דיוק מול האליאס החי אחרי P0 (\`${DEPLOY_HINT}\`). `;
md += `תוצאה: ${passed} PASS / ${failed} FAIL; pretty-wrong: ${prettyWrongHits.length}. `;
md += `phase=${phaseOk ? 'orchestrator-v0-b מאומת' : 'חריגת phase'}. `;
md += `דוחות: ACCURACY_EVAL-דיוק-2026-09-09.md / .json + ACCURACY_REPORT.md.\n`;

fs.writeFileSync(OUT_MD, md, 'utf8');

// ACCURACY_REPORT.md — sprint deliverable summary table
let rep = '';
rep += `# ACCURACY_REPORT\n\n`;
rep += `**Source eval:** ACCURACY_EVAL-דיוק-2026-09-09  \n`;
rep += `**When:** ${whenLocal}  \n`;
rep += `**Base:** ${BASE} · deploy \`${DEPLOY_HINT}\` · phase orchestrator-v0-b  \n`;
rep += `**Totals:** N=${rows.length} · PASS=${passed} · FAIL=${failed} · pretty-wrong=${prettyWrongHits.length}\n\n`;
rep += `| Case | Expected | Actual | Confidence | Status |\n`;
rep += `|------|----------|--------|------------|--------|\n`;
for (const r of rows) {
  const act = `ui=${r.actual.uiState}; qid=${r.actual.qid || '-'}; faces=${r.actual.faces}; src=${r.actual.sources}`;
  const st = r.pass ? 'PASS' : r.prettyWrong ? 'FAIL/PW' : 'FAIL';
  rep += `| ${esc(r.id)} | ${esc(r.expectedLabel)} | ${esc(act)} | ${esc(r.confidence)} | ${st} |\n`;
}
rep += `\n## Pretty-wrong\n${prettyWrongHits.length === 0 ? 'None.' : prettyWrongHits.map((r) => `- ${r.id}`).join('\\n')}\n`;
fs.writeFileSync(OUT_REPORT, rep, 'utf8');

console.log('\n========== SUMMARY ==========');
console.log(`N=${rows.length} PASS=${passed} FAIL=${failed} pretty-wrong=${prettyWrongHits.length}`);
console.log(`phaseOk=${phaseOk}`);
console.log(`md: ${OUT_MD}`);
console.log(`json: ${OUT_JSON}`);
console.log(`report: ${OUT_REPORT}`);
for (const r of rows) {
  console.log(
    `  ${r.pass ? '✓' : '✗'} ${r.id} ui=${r.actual.uiState} faces=${r.actual.faces}` +
      (r.fails.length ? ` :: ${r.fails.join('; ')}` : ''),
  );
}
console.log('=============================\n');
process.exit(failed === 0 ? 0 : 1);
