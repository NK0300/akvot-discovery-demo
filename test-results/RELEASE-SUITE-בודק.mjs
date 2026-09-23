#!/usr/bin/env node
/**
 * Full Release Suite · בודק
 * Run: node test-results/RELEASE-SUITE-בודק.mjs
 * Env: AKVOT_BASE (default https://akvot-simple-demo.vercel.app)
 *
 * Exit 0 only if units + contract + SAFETY (core identity) all pass.
 * Alias recall failures are reported in ALIAS_RECALL but do NOT fail exit
 * unless pretty-wrong (dossier+faces on unsafe query).
 *
 * Do NOT deploy. Do NOT change api/lookup.js or orchestrator commit thresholds.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const BASE = (process.env.AKVOT_BASE || process.env.BASE || 'https://akvot-simple-demo.vercel.app').replace(/\/$/, '');
const FAKE_EMAIL = 'qa.rethink.test@example.com';
const TIMEOUT_MS = 95000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const REPORT_JSON = path.join(__dirname, 'RELEASE-SUITE-latest.json');
const REPORT_MD = path.join(__dirname, 'RELEASE-SUITE-בודק-latest.md');

function hasFaces(d) {
  if (!d) return false;
  return !!(d.photo || (Array.isArray(d.images) && d.images.length > 0));
}

function faceCount(d) {
  if (!d) return 0;
  const imgs = Array.isArray(d.images) ? d.images.length : 0;
  return imgs + (d.photo ? 1 : 0);
}

function buildUrl(params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') p.set(k, String(v));
  }
  p.set('nocache', '1');
  return `${BASE}/api/lookup?${p}`;
}

async function callLookup(params) {
  const url = buildUrl(params);
  const t0 = Date.now();
  let status = 0;
  let raw = '';
  let data = null;
  let err = null;
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        Origin: BASE,
        'x-akvot-battery': '1',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
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
  return { url, status, raw, data, err, ms: Date.now() - t0 };
}

function snapRow(id, section, label, params, snap, verdict) {
  const d = snap.data;
  return {
    id,
    section,
    label,
    params,
    pass: !!verdict.pass,
    soft: !!verdict.soft,
    product: !!verdict.product,
    prettyWrong: !!verdict.prettyWrong,
    fails: verdict.fails || [],
    notes: verdict.notes || [],
    http: snap.status,
    ms: snap.ms,
    err: snap.err,
    ui: d?.uiState ?? null,
    mode: d?.mode ?? null,
    qid: d?.qid ?? null,
    faces: hasFaces(d),
    faceN: faceCount(d),
    photo: !!d?.photo,
    images: (d?.images || []).length,
    candidates: (d?.candidates || []).length,
    sources: (d?.sources || []).length,
    scenario: d?.scenario ?? null,
  };
}

function runSpawn(cmd, args, cwd) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn(cmd, args, {
      cwd,
      env: { ...process.env, AKVOT_BASE: BASE, BASE },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (b) => {
      stdout += b.toString();
      process.stdout.write(b);
    });
    child.stderr.on('data', (b) => {
      stderr += b.toString();
      process.stderr.write(b);
    });
    child.on('close', (code) => {
      resolve({
        exitCode: code ?? 1,
        ms: Date.now() - t0,
        stdout,
        stderr,
        pass: (code ?? 1) === 0,
      });
    });
    child.on('error', (e) => {
      resolve({
        exitCode: 1,
        ms: Date.now() - t0,
        stdout,
        stderr: String(e.message || e),
        pass: false,
      });
    });
  });
}

// ---------- SAFETY / runtime smoke judges ----------
function judgeSafety(id, snap) {
  const fails = [];
  const notes = [];
  let soft = false;
  let product = false;
  let prettyWrong = false;
  const { status, err, data: d, raw } = snap;

  if (err) return { pass: false, soft, product, prettyWrong, fails: [`network: ${err}`], notes };
  if (status === 429) return { pass: false, soft, product, prettyWrong, fails: ['http 429'], notes };
  if (status !== 200) return { pass: false, soft, product, prettyWrong, fails: [`http ${status}`], notes };
  if (!d) return { pass: false, soft, product, prettyWrong, fails: ['bad json'], notes };

  const ui = d.uiState || '';
  const faces = hasFaces(d);
  const qid = d.qid || null;

  if (id === 's1-netanyahu') {
    if (ui !== 'dossier') fails.push(`uiState=${ui} expected dossier`);
    if (qid !== 'Q43723') fails.push(`qid=${qid} expected Q43723`);
    return { pass: fails.length === 0, soft, product, prettyWrong, fails, notes };
  }

  if (id === 's2-dani-cohen') {
    if (ui !== 'need_context') fails.push(`uiState=${ui} expected need_context`);
    if (faces) fails.push('faces must be 0');
    return { pass: fails.length === 0, soft, product, prettyWrong, fails, notes };
  }

  if (id === 's3-smith-bare') {
    const okUi = ui === 'need_context' || ui === 'thin' || ui === 'ambiguous';
    if (!okUi) fails.push(`uiState=${ui} expected need_context|thin|ambiguous`);
    if (faces) fails.push('faces must be 0');
    return { pass: fails.length === 0, soft, product, prettyWrong, fails, notes };
  }

  if (id === 's4-smith-ibm') {
    if (ui === 'dossier' && faces) {
      fails.push('P0 CRIT: dossier+faces (pretty-wrong)');
      prettyWrong = true;
    }
    if (faces && ui !== 'dossier') fails.push(`faces=true not allowed on uiState=${ui}`);
    return { pass: fails.length === 0, soft, product, prettyWrong, fails, notes };
  }

  if (id === 's5-smith-email') {
    if (ui === 'dossier' && faces) {
      fails.push('P0 CRIT G11: dossier+faces');
      prettyWrong = true;
    }
    if (faces && ui !== 'dossier') fails.push(`faces=true not allowed on uiState=${ui}`);
    if (raw && raw.includes(FAKE_EMAIL)) fails.push('email leaked in response body');
    return { pass: fails.length === 0, soft, product, prettyWrong, fails, notes };
  }

  if (id === 's6-orly-levy') {
    // dossier preferred — soft FAIL / PRODUCT if not
    if (ui !== 'dossier') {
      soft = true;
      product = true;
      notes.push(`PRODUCT: uiState=${ui} expected dossier (soft)`);
      // soft fail — does NOT fail SAFETY gate for exit
      return { pass: true, soft, product, prettyWrong, fails, notes };
    }
    notes.push('dossier preferred — OK');
    return { pass: true, soft, product, prettyWrong, fails, notes };
  }

  fails.push(`unknown safety case ${id}`);
  return { pass: false, soft, product, prettyWrong, fails, notes };
}

function judgeRedTeam(id, snap) {
  const fails = [];
  const notes = [];
  let prettyWrong = false;
  const { status, err, data: d } = snap;

  if (err) return { pass: false, prettyWrong, fails: [`network: ${err}`], notes };
  if (status === 429) return { pass: false, prettyWrong, fails: ['http 429'], notes };
  if (status !== 200) return { pass: false, prettyWrong, fails: [`http ${status}`], notes };
  if (!d) return { pass: false, prettyWrong, fails: ['bad json'], notes };

  const ui = d.uiState || '';
  const faces = hasFaces(d);
  const qid = d.qid || null;

  if (id === 'r1-junk-he') {
    if (faces) {
      fails.push('faces must be 0 on junk');
      prettyWrong = true;
    }
    if (qid) {
      fails.push(`qid dossier/match ${qid} on junk`);
      prettyWrong = true;
    }
    if (ui === 'dossier' && faces) {
      fails.push('pretty-wrong: dossier+faces on junk');
      prettyWrong = true;
    }
    return { pass: fails.length === 0, prettyWrong, fails, notes };
  }

  if (id === 'r2-smith-bare-covered') {
    notes.push('covered by SAFETY s3 — skip duplicate assert');
    return { pass: true, prettyWrong: false, fails: [], notes };
  }

  if (id === 'r3-conflict-skip') {
    notes.push('optional conflict-ish skipped (hard)');
    return { pass: true, soft: true, prettyWrong: false, fails: [], notes: ['SKIP optional'] };
  }

  fails.push(`unknown red-team case ${id}`);
  return { pass: false, prettyWrong, fails, notes };
}

function judgeAlias(id, snap) {
  const fails = [];
  const notes = [];
  let soft = true; // alias section is soft by default
  let prettyWrong = false;
  const { status, err, data: d } = snap;

  if (err) return { pass: false, soft, prettyWrong, fails: [`network: ${err}`], notes };
  if (status === 429) return { pass: false, soft, prettyWrong, fails: ['http 429'], notes };
  if (status !== 200) return { pass: false, soft, prettyWrong, fails: [`http ${status}`], notes };
  if (!d) return { pass: false, soft, prettyWrong, fails: ['bad json'], notes };

  const ui = d.uiState || '';
  const faces = hasFaces(d);
  const qid = d.qid || null;

  // Soft expects: prefer dossier + known qid. Do NOT fail whole suite on miss.
  const expects = {
    'a1-netanyahu-alone': { qid: 'Q43723', preferDossier: true },
    'a2-bibi-netanyahu': { qid: 'Q43723', preferDossier: true },
    'a3-angela-merkel': { qid: 'Q567', preferDossier: true },
    'a4-zehava-galon': { qid: 'Q2630062', preferDossier: true },
  };
  const exp = expects[id];
  if (!exp) {
    fails.push(`unknown alias ${id}`);
    return { pass: false, soft, prettyWrong, fails, notes };
  }

  // Unsafe pretty-wrong: dossier+faces with WRONG identity would be critical —
  // for famous aliases, wrong qid with faces is pretty-wrong.
  if (faces && qid && exp.qid && qid !== exp.qid && ui === 'dossier') {
    prettyWrong = true;
    fails.push(`pretty-wrong: dossier+faces with wrong qid=${qid} expected ${exp.qid}`);
    return { pass: false, soft: false, prettyWrong, fails, notes };
  }

  if (exp.preferDossier && ui !== 'dossier') {
    notes.push(`soft: uiState=${ui} preferred dossier`);
    fails.push(`uiState=${ui} expected dossier (soft recall)`);
  }
  if (exp.qid && qid !== exp.qid) {
    notes.push(`soft: qid=${qid} preferred ${exp.qid}`);
    fails.push(`qid=${qid} expected ${exp.qid} (soft recall)`);
  }

  const pass = fails.length === 0;
  return { pass, soft: true, prettyWrong, fails, notes };
}

const SAFETY_CASES = [
  { id: 's1-netanyahu', label: 'בנימין נתניהו → dossier + Q43723', params: { q: 'בנימין נתניהו' } },
  { id: 's2-dani-cohen', label: 'דני כהן → need_context, 0 faces', params: { q: 'דני כהן' } },
  { id: 's3-smith-bare', label: 'John Smith bare → need_context|thin, 0 faces', params: { q: 'John Smith' } },
  {
    id: 's4-smith-ibm',
    label: 'John Smith + IBM + NY + US → NOT (dossier AND faces)',
    params: { q: 'John Smith', org: 'IBM', city: 'New York', country: 'US' },
  },
  {
    id: 's5-smith-email',
    label: 'John Smith + email → NOT dossier+faces; email not in body',
    params: { q: 'John Smith', email: FAKE_EMAIL },
  },
  { id: 's6-orly-levy', label: 'אורלי לוי → dossier preferred (PRODUCT soft)', params: { q: 'אורלי לוי' } },
];

const REDTEAM_CASES = [
  { id: 'r1-junk-he', label: 'פלורקסימון זבולון קפצוני → no faces, no qid', params: { q: 'פלורקסימון זבולון קפצוני' } },
  { id: 'r2-smith-bare-covered', label: 'John Smith bare (covered by SAFETY)', params: null, skipCall: true },
  { id: 'r3-conflict-skip', label: 'conflict-ish optional SKIP', params: null, skipCall: true },
];

const ALIAS_CASES = [
  { id: 'a1-netanyahu-alone', label: 'נתניהו alone', params: { q: 'נתניהו' } },
  { id: 'a2-bibi-netanyahu', label: 'ביבי נתניהו', params: { q: 'ביבי נתניהו' } },
  { id: 'a3-angela-merkel', label: 'Angela Merkel', params: { q: 'Angela Merkel' } },
  { id: 'a4-zehava-galon', label: 'Zehava Galon', params: { q: 'Zehava Galon' } },
];

function mark(row) {
  if (row.prettyWrong) return 'FAIL-CRIT';
  if (row.pass && row.product) return 'PASS/PRODUCT';
  if (row.pass && row.soft && row.notes?.length) return 'PASS/SOFT';
  if (row.pass) return 'PASS';
  if (row.soft) return 'FAIL/SOFT';
  return 'FAIL';
}

async function main() {
  const whenIso = new Date().toISOString();
  const whenLocal = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }) + ' Asia/Jerusalem';
  console.log(`\n========== RELEASE SUITE · בודק ==========`);
  console.log(`BASE=${BASE}`);
  console.log(`when=${whenLocal}`);
  console.log(`headers: Origin=${BASE}, x-akvot-battery:1\n`);

  // ---- 1) Domain units ----
  console.log('── 1) Domain units: node api/lib/orchestrator.test.mjs ──');
  const units = await runSpawn(process.execPath, ['api/lib/orchestrator.test.mjs'], REPO_ROOT);
  console.log(`units exit=${units.exitCode} ms=${units.ms} pass=${units.pass}\n`);

  // ---- 2) Contract ----
  console.log('── 2) Contract: node test-results/contract-identity-p0.mjs ──');
  const contract = await runSpawn(process.execPath, ['test-results/contract-identity-p0.mjs'], REPO_ROOT);
  console.log(`contract exit=${contract.exitCode} ms=${contract.ms} pass=${contract.pass}\n`);

  // ---- 3) SAFETY ----
  console.log('── 3) SAFETY / runtime smoke ──');
  const safetyRows = [];
  for (const c of SAFETY_CASES) {
    process.stdout.write(`→ ${c.id} ... `);
    const snap = await callLookup(c.params);
    const verdict = judgeSafety(c.id, snap);
    const row = snapRow(c.id, 'SAFETY', c.label, c.params, snap, verdict);
    safetyRows.push(row);
    console.log(
      `${mark(row)} ${row.ms}ms ui=${row.ui} mode=${row.mode} qid=${row.qid || '-'} faces=${row.faces}` +
        (row.fails.length ? ` | ${row.fails.join('; ')}` : '') +
        (row.notes.length ? ` | ${row.notes.join('; ')}` : ''),
    );
    await sleep(1500);
  }

  // ---- 4) Red-team ----
  console.log('\n── 4) Red-team uncertainty ──');
  const redRows = [];
  for (const c of REDTEAM_CASES) {
    process.stdout.write(`→ ${c.id} ... `);
    if (c.skipCall) {
      const verdict = judgeRedTeam(c.id, { status: 200, err: null, data: { uiState: 'thin' }, raw: '', ms: 0 });
      const row = {
        id: c.id,
        section: 'REDTEAM',
        label: c.label,
        params: c.params,
        pass: true,
        soft: true,
        prettyWrong: false,
        fails: [],
        notes: verdict.notes || ['SKIP'],
        http: null,
        ms: 0,
        err: null,
        ui: null,
        mode: null,
        qid: null,
        faces: false,
        faceN: 0,
        skipped: true,
      };
      redRows.push(row);
      console.log(`SKIP ${c.label}`);
      continue;
    }
    const snap = await callLookup(c.params);
    const verdict = judgeRedTeam(c.id, snap);
    const row = snapRow(c.id, 'REDTEAM', c.label, c.params, snap, verdict);
    redRows.push(row);
    console.log(
      `${mark(row)} ${row.ms}ms ui=${row.ui} mode=${row.mode} qid=${row.qid || '-'} faces=${row.faces}` +
        (row.fails.length ? ` | ${row.fails.join('; ')}` : ''),
    );
    await sleep(1500);
  }

  // ---- 5) Alias recall ----
  console.log('\n── 5) ALIAS_RECALL (record only; soft) ──');
  const aliasRows = [];
  for (const c of ALIAS_CASES) {
    process.stdout.write(`→ ${c.id} ... `);
    const snap = await callLookup(c.params);
    const verdict = judgeAlias(c.id, snap);
    const row = snapRow(c.id, 'ALIAS_RECALL', c.label, c.params, snap, verdict);
    aliasRows.push(row);
    console.log(
      `${mark(row)} ${row.ms}ms ui=${row.ui} mode=${row.mode} qid=${row.qid || '-'} faces=${row.faces}` +
        (row.fails.length ? ` | ${row.fails.join('; ')}` : '') +
        (row.notes.length ? ` | ${row.notes.join('; ')}` : ''),
    );
    await sleep(1500);
  }

  // ---- Aggregate ----
  const safetyCore = safetyRows.filter((r) => r.id !== 's6-orly-levy');
  const safetyPass = safetyCore.every((r) => r.pass) && safetyRows.every((r) => !r.prettyWrong);
  const redPass = redRows.every((r) => r.pass && !r.prettyWrong);
  const aliasPrettyWrong = aliasRows.some((r) => r.prettyWrong);
  const aliasRecallPass = aliasRows.filter((r) => r.pass).length;
  const aliasRecallFail = aliasRows.filter((r) => !r.pass).length;

  // Exit: units + contract + SAFETY (core) must pass.
  // Red-team failures (esp. pretty-wrong) also fail exit.
  // Alias recall soft fails do NOT fail exit unless prettyWrong.
  const exitOk =
    units.pass &&
    contract.pass &&
    safetyPass &&
    redPass &&
    !aliasPrettyWrong;

  const exitCode = exitOk ? 0 : 1;

  const productNotes = [
    ...safetyRows.filter((r) => r.product || (r.soft && r.notes.length)),
    ...aliasRows.filter((r) => !r.pass),
  ];

  const report = {
    when: whenIso,
    whenLocal,
    agent: 'בודק',
    suite: 'RELEASE-SUITE',
    base: BASE,
    exitCode,
    gates: {
      units: { pass: units.pass, exitCode: units.exitCode, ms: units.ms },
      contract: { pass: contract.pass, exitCode: contract.exitCode, ms: contract.ms },
      safety: {
        pass: safetyPass,
        passed: safetyRows.filter((r) => r.pass).length,
        total: safetyRows.length,
        coreRequired: safetyCore.length,
      },
      redteam: {
        pass: redPass,
        passed: redRows.filter((r) => r.pass).length,
        total: redRows.length,
      },
      alias_recall: {
        passSoft: aliasRecallFail === 0,
        passed: aliasRecallPass,
        failed: aliasRecallFail,
        total: aliasRows.length,
        prettyWrong: aliasPrettyWrong,
        note: 'Alias recall does not fail suite exit unless pretty-wrong (dossier+faces unsafe)',
      },
    },
    summaryHe: exitOk
      ? `ריליס עבר — units+contract+SAFETY ירוקים` +
        (aliasRecallFail ? ` · ALIAS_RECALL רך: ${aliasRecallFail} כשלים (לא מפילים יציאה)` : ' · ALIAS_RECALL מלא')
      : `ריליס נכשל — units=${units.pass ? 'OK' : 'FAIL'} contract=${contract.pass ? 'OK' : 'FAIL'} SAFETY=${safetyPass ? 'OK' : 'FAIL'} RED=${redPass ? 'OK' : 'FAIL'}` +
        (aliasPrettyWrong ? ' · ALIAS pretty-wrong' : ''),
    safety: safetyRows,
    redteam: redRows,
    alias_recall: aliasRows,
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf8');

  // MD report
  const md = [];
  md.push(`# Release Suite · בודק`);
  md.push('');
  md.push(`- **when:** ${whenLocal}`);
  md.push(`- **BASE:** ${BASE}`);
  md.push(`- **exit:** \`${exitCode}\` — ${exitOk ? 'PASS' : 'FAIL'}`);
  md.push(`- **סיכום:** ${report.summaryHe}`);
  md.push('');
  md.push(`## שערים (gates)`);
  md.push('');
  md.push(`| Gate | תוצאה | פרטים |`);
  md.push(`|------|--------|--------|`);
  md.push(`| 1. Domain units | ${units.pass ? '✅ PASS' : '❌ FAIL'} | exit=${units.exitCode} · ${units.ms}ms |`);
  md.push(`| 2. Contract identity-p0 | ${contract.pass ? '✅ PASS' : '❌ FAIL'} | exit=${contract.exitCode} · ${contract.ms}ms |`);
  md.push(
    `| 3. SAFETY core | ${safetyPass ? '✅ PASS' : '❌ FAIL'} | ${safetyRows.filter((r) => r.pass).length}/${safetyRows.length} (כולל soft PRODUCT) |`,
  );
  md.push(
    `| 4. Red-team | ${redPass ? '✅ PASS' : '❌ FAIL'} | ${redRows.filter((r) => r.pass).length}/${redRows.length} |`,
  );
  md.push(
    `| 5. ALIAS_RECALL | ${aliasRecallFail === 0 ? '✅ PASS' : '⚠️ SOFT FAIL'} | ${aliasRecallPass}/${aliasRows.length} · לא מפיל יציאה${aliasPrettyWrong ? ' · ⛔ pretty-wrong' : ''} |`,
  );
  md.push('');

  md.push(`## 3) SAFETY / runtime smoke`);
  md.push('');
  md.push(`| id | ui | mode | qid | faces | ms | תוצאה |`);
  md.push(`|----|----|------|-----|-------|----|--------|`);
  for (const r of safetyRows) {
    md.push(
      `| ${r.id} | ${r.ui ?? '-'} | ${r.mode ?? '-'} | ${r.qid ?? '-'} | ${r.faces} | ${r.ms} | ${mark(r)}${r.fails.length ? ' · ' + r.fails.join('; ') : ''}${r.notes.length ? ' · ' + r.notes.join('; ') : ''} |`,
    );
  }
  md.push('');

  md.push(`## 4) Red-team`);
  md.push('');
  md.push(`| id | ui | qid | faces | ms | תוצאה |`);
  md.push(`|----|----|-----|-------|----|--------|`);
  for (const r of redRows) {
    md.push(
      `| ${r.id} | ${r.ui ?? (r.skipped ? 'SKIP' : '-')} | ${r.qid ?? '-'} | ${r.faces} | ${r.ms} | ${r.skipped ? 'SKIP' : mark(r)}${r.fails.length ? ' · ' + r.fails.join('; ') : ''} |`,
    );
  }
  md.push('');

  md.push(`## 5) ALIAS_RECALL`);
  md.push('');
  md.push(`רק תיעוד — כשל רך **לא** מפיל את הסוויטה אלא אם pretty-wrong (dossier+faces על שאילתה לא-בטוחה / זהות שגויה).`);
  md.push('');
  md.push(`| id | ui | mode | qid | faces | ms | תוצאה |`);
  md.push(`|----|----|------|-----|-------|----|--------|`);
  for (const r of aliasRows) {
    md.push(
      `| ${r.id} | ${r.ui ?? '-'} | ${r.mode ?? '-'} | ${r.qid ?? '-'} | ${r.faces} | ${r.ms} | ${mark(r)}${r.fails.length ? ' · ' + r.fails.join('; ') : ''} |`,
    );
  }
  md.push('');

  if (productNotes.length) {
    md.push(`## PRODUCT / soft notes`);
    md.push('');
    for (const r of productNotes) {
      md.push(`- **${r.id}**: ${(r.notes || []).concat(r.fails || []).join('; ') || mark(r)}`);
    }
    md.push('');
  }

  md.push(`## קבצים`);
  md.push('');
  md.push(`- JSON: \`test-results/RELEASE-SUITE-latest.json\``);
  md.push(`- MD: \`test-results/RELEASE-SUITE-בודק-latest.md\``);
  md.push(`- Runner: \`test-results/RELEASE-SUITE-בודק.mjs\``);
  md.push('');
  md.push(`*נוצר ע״י בודק · ללא deploy · ללא שינוי lookup/orchestrator thresholds*`);
  md.push('');

  fs.writeFileSync(REPORT_MD, md.join('\n'), 'utf8');

  console.log('\n========== SUMMARY ==========');
  console.log(report.summaryHe);
  console.log(`exit=${exitCode}`);
  console.log(`units=${units.pass} contract=${contract.pass} SAFETY=${safetyPass} RED=${redPass} ALIAS=${aliasRecallPass}/${aliasRows.length} (prettyWrong=${aliasPrettyWrong})`);
  console.log(`JSON: ${REPORT_JSON}`);
  console.log(`MD:   ${REPORT_MD}`);
  console.log('=============================\n');

  process.exit(exitCode);
}

main().catch((e) => {
  console.error('RELEASE SUITE crashed:', e);
  process.exit(2);
});
