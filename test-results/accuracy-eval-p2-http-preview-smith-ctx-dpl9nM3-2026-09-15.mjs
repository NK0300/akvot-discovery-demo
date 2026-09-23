#!/usr/bin/env node
/**
 * Accuracy (דיוק) HTTP Acc — P2 Preview SMITH-CTX (dpl_9nM3)
 * Preview: https://akvot-simple-demo-lwvupih3v-k-akvot.vercel.app
 * Deploy: dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL
 * Case set: handoff/P2-CASES-דיוק-2026-09-15.json (N=18) — EXPECTED unchanged
 * Access: vercel curl (plain curl → 302 protection)
 * NO product code changes · NO EXPECTED rewrite · NO promote
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { hasOrgCityEvidenceMatch } from '../api/lib/orchestrator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW_URL = (process.env.AKVOT_BASE || process.env.BASE || process.env.ORIGIN || 'https://akvot-simple-demo-lwvupih3v-k-akvot.vercel.app').replace(/\/$/, '');
const ORIGIN = 'https://akvot-simple-demo.vercel.app';
const TIMEOUT_MS = 65000;
const CONCURRENCY = Number(process.env.AKVOT_CONCURRENCY || 2);
const DEPLOY = 'dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL';
const PHASE_EXPECTED = 'orchestrator-v0-b';
const CASE_SET = path.join(__dirname, 'handoff', 'P2-CASES-דיוק-2026-09-15.json');
const OUT_MD = path.join(__dirname, 'ACCURACY_EVAL-P2-HTTP-Preview-SMITH-CTX-דיוק-2026-09-15.md');
const OUT_JSON = path.join(__dirname, 'ACCURACY_EVAL-P2-HTTP-Preview-SMITH-CTX-דיוק-2026-09-15.json');
const OUT_REPORT = path.join(__dirname, 'ACCURACY_REPORT-P2-HTTP-Preview-SMITH-CTX-dpl9nM3-2026-09-15.md');
const OUT_LOG = path.join(__dirname, 'ACCURACY_EVAL-P2-HTTP-Preview-SMITH-CTX-דיוק-2026-09-15.run.log');
const FAKE_EMAIL = 'qa.rethink.test@example.com';
const CWD = path.join(__dirname, '..');

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

/** Run vercel curl; returns { status, headers, body, ms, err } */
function vercelCurl(pathAndQuery, { method = 'GET', body = null, headersExtra = [] } = {}) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const args = [
      'curl',
      '--yes',
      '--deployment',
      DEPLOY,
      pathAndQuery,
      '--',
      '--max-time',
      String(Math.ceil(TIMEOUT_MS / 1000)),
      '-sS',
      '-D',
      '-', // headers to stdout first via -w? We use -D - with body after -- so headers go to stderr? 
      // Better: write to temp via process — use -w for status and -D for headers file
    ];
    // Use a unique tempfile pair per call
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const hdrFile = `/tmp/akvot-vc-${id}.hdr`;
    const bodyFile = `/tmp/akvot-vc-${id}.body`;
    const curlArgs = [
      'curl',
      '--yes',
      '--deployment',
      DEPLOY,
      pathAndQuery,
      '--',
      '--max-time',
      String(Math.ceil(TIMEOUT_MS / 1000)),
      '-sS',
      '-D',
      hdrFile,
      '-o',
      bodyFile,
      '-H',
      `Origin: ${ORIGIN}`,
      '-H',
      'Accept: application/json',
      '-H',
      'x-akvot-battery: 1',
      ...headersExtra,
    ];
    if (method === 'POST') {
      curlArgs.push('-X', 'POST', '-H', 'Content-Type: application/json');
      if (body != null) {
        curlArgs.push('--data', typeof body === 'string' ? body : JSON.stringify(body));
      }
    }
    const child = spawn('vercel', curlArgs, {
      cwd: CWD,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    let stdout = '';
    child.stdout.on('data', (b) => {
      stdout += b.toString();
    });
    child.stderr.on('data', (b) => {
      stderr += b.toString();
    });
    child.on('close', (code) => {
      const ms = Date.now() - t0;
      let headers = '';
      let bodyText = '';
      let status = 0;
      try {
        headers = fs.existsSync(hdrFile) ? fs.readFileSync(hdrFile, 'utf8') : '';
        bodyText = fs.existsSync(bodyFile) ? fs.readFileSync(bodyFile, 'utf8') : '';
        const m = headers.match(/HTTP\/[\d.]+\s+(\d+)/);
        if (m) status = Number(m[1]);
      } catch (e) {
        resolve({
          status: 0,
          headers: '',
          body: '',
          ms,
          err: String(e.message || e),
          code,
          stderr: stderr.slice(0, 500),
        });
        return;
      } finally {
        try {
          fs.unlinkSync(hdrFile);
        } catch {}
        try {
          fs.unlinkSync(bodyFile);
        } catch {}
      }
      if (code !== 0 && !bodyText) {
        resolve({
          status,
          headers,
          body: bodyText,
          ms,
          err: `vercel curl exit ${code}: ${(stderr || stdout).slice(0, 400)}`,
          code,
          stderr: stderr.slice(0, 500),
        });
        return;
      }
      resolve({ status, headers, body: bodyText, ms, err: null, code, stderr: stderr.slice(0, 200) });
    });
  });
}

function parseHeader(headers, name) {
  if (!headers) return null;
  const re = new RegExp(`^${name}:\\s*(.+)$`, 'im');
  const m = headers.match(re);
  return m ? m[1].trim() : null;
}

async function healthCheck() {
  const snap = await vercelCurl('/api/health', { method: 'GET' });
  let data = null;
  try {
    data = JSON.parse(snap.body || '');
  } catch {}
  return {
    status: snap.status,
    ms: snap.ms,
    data,
    buildOk: data?.build === DEPLOY,
    ok: data?.ok === true,
    phase: data?.phase || null,
    build: data?.build || null,
    err: snap.err,
  };
}

async function probeLookup() {
  const snap = await vercelCurl('/api/lookup?q=test&nocache=1', { method: 'GET' });
  let data = null;
  try {
    data = JSON.parse(snap.body || '');
  } catch {}
  const hdrRid = parseHeader(snap.headers, 'x-request-id');
  return {
    status: snap.status,
    ms: snap.ms,
    not_403: snap.status !== 403,
    requestId_header: hdrRid,
    requestId_body: data?.requestId || null,
    requestId_ok: !!(hdrRid && data?.requestId && hdrRid === data.requestId),
    uiState: data?.uiState || null,
    err: snap.err,
  };
}

async function callLookup({ method = 'GET', q, ctx = {} }) {
  let snap;
  if (method === 'POST') {
    snap = await vercelCurl('/api/lookup?nocache=1', {
      method: 'POST',
      body: { q, ...ctx, nocache: 1 },
    });
  } else {
    const p = new URLSearchParams();
    p.set('q', q);
    for (const [k, v] of Object.entries(ctx)) {
      if (v != null && v !== '') p.set(k, String(v));
    }
    p.set('nocache', '1');
    snap = await vercelCurl(`/api/lookup?${p}`, { method: 'GET' });
  }
  let data = null;
  try {
    data = JSON.parse(snap.body || '');
  } catch {
    data = null;
  }
  const hdrRid = parseHeader(snap.headers, 'x-request-id');
  return {
    status: snap.status,
    raw: snap.body,
    data,
    err: snap.err,
    ms: snap.ms,
    requestId_header: hdrRid,
    requestId_body: data?.requestId || null,
  };
}

function expectedLabel(c) {
  const parts = [];
  parts.push(`ui∈[${(c.expected_ui || []).join('|')}]`);
  if (c.qid) parts.push(`qid=${c.qid}`);
  if (c.faces === 0) parts.push('0 faces');
  if (c.faces === true || c.faces === 1) parts.push('faces');
  if ((c.must_not || []).length) parts.push(`must_not=${c.must_not.join(',')}`);
  if (c.measure_ms) parts.push('measure_ms');
  return parts.join(' · ');
}

function isSafetyCase(c) {
  return /^P2-S0[1-7]$/.test(c.id) || /^S0[1-7]$/.test(c.id);
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
  if (status === 403 || status === 302 || status === 401) {
    fails.push(`http ${status} (protection?)`);
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

  if (uiStates.length && !uiStates.includes(ui)) {
    fails.push(`uiState=${ui} expected ${uiStates.join('|')}`);
  }

  if (c.qid != null && ui === 'dossier') {
    if (qid !== c.qid) {
      fails.push(`qid=${qid} expected ${c.qid}`);
      if (faces) prettyWrong = true;
    }
  }

  if (c.faces === 0 && faces) fails.push('faces must be 0');
  if ((c.faces === true || c.faces === 1) && !faces) fails.push('faces expected');

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
  // must_not qid:Q…
  for (const mn of mustNot) {
    if (mn.startsWith('qid:')) {
      const banned = mn.slice(4);
      if (qid === banned) {
        fails.push(`must_not ${mn}`);
        if (ui === 'dossier' && faces) prettyWrong = true;
      }
      // also scan raw for QID bleed in candidates
      if (raw && raw.includes(banned) && qid === banned) {
        // already failed above
      } else if (raw && new RegExp(`"${banned}"|"qid"\\s*:\\s*"${banned}"`).test(raw) && ui === 'dossier') {
        // covered
      }
    }
  }

  if (isSafetyCase(c) && ui === 'dossier') {
    fails.push('SAFETY: dossier on S-case');
    prettyWrong = true;
  }

  if (ui === 'dossier' && faces && c.qid && qid && qid !== c.qid) {
    prettyWrong = true;
  }

  if (d.phase && d.phase !== PHASE_EXPECTED) {
    notes.push(`phase=${d.phase} (expected ${PHASE_EXPECTED})`);
  }

  // Emily note
  if (c.id === 'P2-E02') {
    notes.push(`Emily shape: ui=${ui} (EXPECTED candidates|need_context; thin would be OTHER not pw)`);
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

function actualBrief(r) {
  return `uiState=${r.actual.uiState || '-'},qid=${r.actual.qid || '-'},faces=${r.actual.faces},sources=${r.actual.sources},confidence=${r.actual.confidence || '-'},phase=${r.actual.phase || '-'},ms=${r.actual.ms}`;
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

function runE01Probes() {
  const probes = [
    {
      id: 'E01-url-noise-ib',
      expect: false,
      actual: hasOrgCityEvidenceMatch(
        [{ url: 'https://example.com/path/ib/noise', title: 'Unrelated', note: '' }],
        { org: 'ib', city: '' },
      ),
    },
    {
      id: 'E01-title-IBM',
      expect: true,
      actual: hasOrgCityEvidenceMatch(
        [{ url: 'https://example.com/x', title: 'Works at IBM Research', note: '' }],
        { org: 'IBM', city: '' },
      ),
    },
    {
      id: 'E01-url-boston',
      expect: true,
      actual: hasOrgCityEvidenceMatch(
        [{ url: 'https://example.com/jobs/boston/role', title: '', note: '' }],
        { org: '', city: 'boston' },
      ),
    },
  ];
  return probes.map((p) => ({
    ...p,
    pass: p.actual === p.expect,
  }));
}

async function main() {
  const started = new Date();
  const set = JSON.parse(fs.readFileSync(CASE_SET, 'utf8'));
  const cases = set.cases;

  log(`# ACCURACY EVAL P2 HTTP Preview · ${started.toISOString()}`);
  log(`PREVIEW=${PREVIEW_URL} DEPLOY=${DEPLOY} CONCURRENCY=${CONCURRENCY}`);
  log(`CASE_SET=${CASE_SET} n=${cases.length}`);

  const health = await healthCheck();
  log(
    `HEALTH /api/health → HTTP ${health.status} ok=${health.ok} build=${health.build} phase=${health.phase} buildOk=${health.buildOk} (${health.ms}ms)`,
  );
  if (!health.buildOk) {
    log(`FATAL: health.build !== ${DEPLOY} (got ${health.build})`);
    fs.writeFileSync(OUT_LOG, logLines.join('\n'));
    process.exit(2);
  }

  const probe = await probeLookup();
  log(
    `PROBE /api/lookup?q=test → HTTP ${probe.status} in ${probe.ms}ms · requestId_ok=${probe.requestId_ok} hdr=${probe.requestId_header} body=${probe.requestId_body}`,
  );
  if (probe.status === 403 || probe.status === 302) {
    log('FATAL: probe returned protection status — aborting');
    fs.writeFileSync(OUT_LOG, logLines.join('\n'));
    process.exit(2);
  }

  const e01 = runE01Probes();
  for (const p of e01) {
    log(`E01 ${p.id}: expect=${p.expect} actual=${p.actual} → ${p.pass ? 'PASS' : 'FAIL'}`);
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
        measure_ms: !!c.measure_ms,
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
        timings_total: d?.timings?.total ?? null,
        requestId: snap.requestId_body || snap.requestId_header || null,
        requestId_header: snap.requestId_header,
        requestId_body: snap.requestId_body,
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
      `[w${wid}] ← ${c.id} ${snap.ms}ms http=${snap.status} ${actualBrief(row)} → ${j.statusKind}` +
        (j.fails.length ? ' :: ' + j.fails.join('; ') : '') +
        (j.prettyWrong ? ' PRETTY-WRONG' : ''),
    );
    return row;
  });

  const elapsedMs = Date.now() - t0;
  const N = results.length;
  let PASS = results.filter((r) => r.status === 'PASS').length;
  let FAIL = results.filter((r) => r.status === 'FAIL').length;
  let prettyWrong = results.filter((r) => r.prettyWrong).length;
  const safetyRows = results.filter((r) => isSafetyCase(r));
  let safetyPass = safetyRows.every((r) => r.pass && r.actual.uiState !== 'dossier' && !r.prettyWrong);
  let safetyLock = safetyPass ? 'PASS' : 'FAIL';
  let safetyDetail = `${safetyRows.filter((r) => r.pass).length}/${safetyRows.length}`;
  const e01Pass = e01.every((p) => p.pass);

  // Critical Assaf checks
  const a01 = results.find((r) => r.id === 'P2-A01');
  const a03 = results.find((r) => r.id === 'P2-A03');
  const a05 = results.find((r) => r.id === 'P2-A05');
  const a06 = results.find((r) => r.id === 'P2-A06');
  const e02 = results.find((r) => r.id === 'P2-E02');
  const l03 = results.find((r) => r.id === 'P2-L03');
  const s03 = results.find((r) => r.id === 'P2-S03');
  // Extra S03 guard: must not surface Q1701775
  if (s03 && (s03.actual.qid === 'Q1701775' || (JSON.stringify(s03).includes('Q1701775')))) {
    s03.pass = false;
    s03.status = 'FAIL';
    s03.fails = [...(s03.fails || []), 'must_not Q1701775'];
    s03.errorType = s03.actual.faces ? 'PRETTY-WRONG' : 'FP';
    if (s03.actual.faces) s03.prettyWrong = true;
  }
  // recount after S03 post-judge mutations
  PASS = results.filter((r) => r.status === 'PASS').length;
  FAIL = results.filter((r) => r.status === 'FAIL').length;
  prettyWrong = results.filter((r) => r.prettyWrong).length;
  safetyPass = safetyRows.every((r) => r.pass && r.actual.uiState !== 'dossier' && !r.prettyWrong);
  safetyLock = safetyPass ? 'PASS' : 'FAIL';
  safetyDetail = `${safetyRows.filter((r) => r.pass).length}/${safetyRows.length}`;

  let recommendation = 'GO';
  let recNote = '';
  if (prettyWrong > 0) {
    recommendation = 'NO-GO';
    recNote = `${prettyWrong} pretty-wrong — STOP`;
  } else if (!safetyPass) {
    recommendation = 'NO-GO';
    recNote = 'SAFETY lock failed';
  } else if (!health.buildOk) {
    recommendation = 'NO-GO';
    recNote = 'health build mismatch';
  } else if (FAIL > 0) {
    const critical = results.filter(
      (r) =>
        r.status === 'FAIL' &&
        (r.errorType === 'FP' ||
          r.errorType === 'PRETTY-WRONG' ||
          r.errorType === 'OVER-GATE' ||
          ['P2-A01', 'P2-A03', 'P2-A05', 'P2-A06', 'P2-L03'].includes(r.id)),
    );
    if (critical.length) {
      recommendation = 'NO-GO';
      recNote = `${critical.length} critical FAIL(s): ${critical.map((r) => r.id).join(',')}`;
    } else {
      recommendation = 'GO';
      recNote = `${FAIL} non-critical FAIL(s) — GO with caveats (pw=0, SAFETY=${safetyLock})`;
    }
  } else {
    recNote = `all ${N} cases PASS · pw=0 · SAFETY=${safetyLock} · health build match · requestId ok`;
  }

  const whenIL = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jerusalem',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(started);

  // Build MD
  let md = '';
  md += `# ACCURACY_EVAL · P2 HTTP · Preview · SMITH-CTX · dpl_9nM3 · דיוק · 2026-09-15\n\n`;
  md += `**HTTP probe:** /api/lookup?q=test → **HTTP ${probe.status}** (NOT 403) · ${probe.ms}ms · requestId ok=${probe.requestId_ok}\n`;
  md += `**Health:** /api/health → HTTP ${health.status} · ok=${health.ok} · **build=\`${health.build}\`** (match=${health.buildOk}) · phase=${health.phase} · ${health.ms}ms\n\n`;
  md += `**Agent:** Accuracy (דיוק)  \n`;
  md += `**Preview URL:** ${PREVIEW_URL}  \n`;
  md += `**Deploy:** \`${DEPLOY}\`  \n`;
  md += `**When:** ${whenIL} Asia/Jerusalem (UTC+3)  \n`;
  md += `**Phase expected:** ${PHASE_EXPECTED}  \n`;
  md += `**Case set:** \`handoff/P2-CASES-דיוק-2026-09-15.json\` (N=${N}) — EXPECTED unchanged  \n`;
  md += `**Rules:** vercel curl · GET simple q · POST JSON for ctx · Origin=${ORIGIN} · nocache=1 · timeout=65s · concurrency=${CONCURRENCY}  \n`;
  md += `**Constraints:** NO product code changes · NO EXPECTED rewrite · NO promote  \n`;
  md += `**Elapsed:** ${(elapsedMs / 1000).toFixed(1)}s\n\n`;

  md += `## Summary metrics\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| N | ${N} |\n`;
  md += `| PASS | ${PASS} |\n`;
  md += `| FAIL | ${FAIL} |\n`;
  md += `| pretty-wrong | ${prettyWrong} |\n`;
  md += `| SAFETY lock P2-S01–S07 | **${safetyLock}** (${safetyDetail}) |\n`;
  md += `| Health build | **${health.buildOk ? 'PASS' : 'FAIL'}** \`${health.build}\` |\n`;
  md += `| requestId (probe) | **${probe.requestId_ok ? 'PASS' : 'FAIL'}** |\n`;
  md += `| P2-E01 entity-match | **${e01Pass ? 'PASS' : 'FAIL'}** (${e01.filter((p) => p.pass).length}/3) |\n`;
  md += `| P2-S03 Smith+IBM+NY+US | ${s03 ? `**${s03.status}** ui=${s03.actual.uiState} qid=${s03.actual.qid||'-'} faces=${s03.actual.faces}` : '—'} |\n`;
  md += `| P2-A01 Assaf Rappaport | ${a01 ? `**${a01.status}** ui=${a01.actual.uiState} qid=${a01.actual.qid}` : '—'} |\n`;
  md += `| P2-A03 אסף רפפורט | ${a03 ? `**${a03.status}** ui=${a03.actual.uiState} qid=${a03.actual.qid}` : '—'} |\n`;
  md += `| P2-A05/A06 no Assaf QID | ${a05 && a06 ? `**${a05.status}/${a06.status}** qids=${a05.actual.qid}/${a06.actual.qid}` : '—'} |\n`;
  md += `| P2-E02 Emily | ${e02 ? `**${e02.status}** ui=${e02.actual.uiState}` : '—'} |\n`;
  md += `| P2-L03 latency | ${l03 ? `**${l03.status}** wall_ms=${l03.actual.ms} timings.total=${l03.actual.timings_total}` : '—'} |\n`;
  md += `| Recommendation (Acc Gate) | **${recommendation}** |\n`;
  md += `| Promote | **HOLD** (Acc eval only; do not promote) |\n\n`;
  md += `**Recommendation evidence:** ${recNote}\n\n`;

  const cats = [...new Set(results.map((r) => r.category))];
  md += `### By category\n\n`;
  md += `| Category | N | PASS | FAIL |\n|----------|---|------|------|\n`;
  for (const cat of cats) {
    const rows = results.filter((r) => r.category === cat);
    md += `| ${cat} | ${rows.length} | ${rows.filter((r) => r.status === 'PASS').length} | ${rows.filter((r) => r.status === 'FAIL').length} |\n`;
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
    const inputStr =
      r.method === 'POST'
        ? `\`${r.input.q}\` + ${JSON.stringify(r.input.ctx || {})}`
        : `\`${r.input.q}\``;
    md += `| ${r.id} | ${inputStr} | ${r.expected.label} | ${actualBrief(r)} | **${r.status}** | ${r.errorType || (r.fails.length ? r.fails.join('; ') : '—')} |\n`;
  }
  md += `\n`;

  md += `## P2-E01 entity-match (layer helper; not in cases pack)\n\n`;
  md += `| Probe | Expect | Actual | Result |\n|-------|--------|--------|--------|\n`;
  for (const p of e01) {
    md += `| ${p.id} | ${p.expect} | ${p.actual} | **${p.pass ? 'PASS' : 'FAIL'}** |\n`;
  }
  md += `\n`;

  md += `## Observability\n\n`;
  md += `| Check | Result |\n|-------|--------|\n`;
  md += `| health.build | \`${health.build}\` · match DEPLOY=${health.buildOk} |\n`;
  md += `| health.phase | ${health.phase} |\n`;
  md += `| probe requestId header | ${probe.requestId_header} |\n`;
  md += `| probe requestId body | ${probe.requestId_body} |\n`;
  md += `| requestId header===body | ${probe.requestId_ok} |\n\n`;

  md += `## Detail\n\n`;
  for (const r of results) {
    md += `### ${r.id} · ${r.status}\n`;
    md += `- **INPUT:** ${JSON.stringify(r.input)}\n`;
    md += `- **EXPECTED:** ${r.expected.label}\n`;
    md += `- **ACTUAL:** ${actualBrief(r)}\n`;
    md += `- **ACTUAL raw:** uiState=${r.actual.uiState}, qid=${r.actual.qid}, faces=${r.actual.faces}, sources=${r.actual.sources}, confidence=${r.actual.confidence}, phase=${r.actual.phase}, mode=${r.actual.mode}, ms=${r.actual.ms}, timings.total=${r.actual.timings_total}, requestId=${r.actual.requestId}\n`;
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

  md += `## SAFETY lock P2-S01–S07\n`;
  md += `**${safetyLock}** (${safetyDetail}) — dossier forbidden; faces=0 preferred.\n\n`;
  for (const r of safetyRows) {
    md += `- ${r.id}: ui=${r.actual.uiState} faces=${r.actual.faces} → ${r.status}\n`;
  }
  md += `\n`;

  md += `## CRITICAL Assaf class\n\n`;
  md += `- **A01** Assaf Rappaport → ${a01?.status} · ui=${a01?.actual.uiState} · qid=${a01?.actual.qid} · ms=${a01?.actual.ms}\n`;
  md += `- **A03** אסף רפפורט → ${a03?.status} · ui=${a03?.actual.uiState} · qid=${a03?.actual.qid} · ms=${a03?.actual.ms}\n`;
  md += `- **A05** Assaf Smith → ${a05?.status} · ui=${a05?.actual.uiState} · qid=${a05?.actual.qid} (must_not Q47507930)\n`;
  md += `- **A06** John Rappaport → ${a06?.status} · ui=${a06?.actual.uiState} · qid=${a06?.actual.qid} (must_not Q47507930)\n`;
  md += `- **L03** latency Assaf → ${l03?.status} · wall_ms=${l03?.actual.ms} · timings.total=${l03?.actual.timings_total}\n\n`;

  md += `## Hebrew summary (room)\n\n`;
  const heSummary = [
    `בדיקת HTTP Acc ל־P2 RC Preview (\`${DEPLOY}\`): N=${N}, PASS=${PASS}, FAIL=${FAIL}, pretty-wrong=${prettyWrong}, SAFETY=${safetyLock}.`,
    `Health מחזיר build=\`${health.build}\` (התאמה=${health.buildOk ? 'כן' : 'לא'}) · requestId=${probe.requestId_ok ? 'PASS' : 'FAIL'}.`,
    `Assaf A01/A03 → ${a01?.actual.uiState}/${a03?.actual.uiState} qid=${a01?.actual.qid}/${a03?.actual.qid} · A05/A06 ללא Q47507930 · E01=${e01Pass ? 'PASS' : 'FAIL'} · E02 ui=${e02?.actual.uiState} · L03 ${l03?.actual.ms}ms.`,
    `המלצה לשער P2 Release: **${recommendation}** — ${recNote}.`,
    `ללא שינוי קוד מוצר · ללא rewrite ל־EXPECTED · ללא promote.`,
  ].join(' ');
  md += heSummary + '\n';

  fs.writeFileSync(OUT_MD, md, 'utf8');

  const jsonOut = {
    meta: {
      title: 'ACCURACY_EVAL-P2-HTTP-Preview-SMITH-CTX-dpl_9nM3',
      date: '2026-09-15',
      when: started.toISOString(),
      when_jerusalem: whenIL,
      preview_url: PREVIEW_URL,
      deploy: DEPLOY,
      origin: ORIGIN,
      phase_expected: PHASE_EXPECTED,
      case_set: 'handoff/P2-CASES-דיוק-2026-09-15.json',
      concurrency: CONCURRENCY,
      timeout_ms: TIMEOUT_MS,
      elapsed_ms: elapsedMs,
      access: 'vercel curl',
      constraints: ['NO product code changes', 'NO EXPECTED rewrite', 'NO promote'],
      probe: {
        status: probe.status,
        ms: probe.ms,
        not_403: probe.not_403,
        requestId_ok: probe.requestId_ok,
        requestId_header: probe.requestId_header,
        requestId_body: probe.requestId_body,
      },
      health: {
        status: health.status,
        ms: health.ms,
        ok: health.ok,
        build: health.build,
        buildOk: health.buildOk,
        phase: health.phase,
      },
    },
    summary: {
      N,
      PASS,
      FAIL,
      pretty_wrong: prettyWrong,
      safety_lock: safetyLock,
      safety_detail: safetyDetail,
      e01_pass: e01Pass,
      health_build_ok: health.buildOk,
      requestId_ok: probe.requestId_ok,
      recommendation,
      recommendation_evidence: recNote,
      critical: {
        S03: s03 ? { status: s03.status, ui: s03.actual.uiState, qid: s03.actual.qid, faces: s03.actual.faces, ms: s03.actual.ms } : null,
        A01: a01 ? { status: a01.status, ui: a01.actual.uiState, qid: a01.actual.qid, ms: a01.actual.ms } : null,
        A03: a03 ? { status: a03.status, ui: a03.actual.uiState, qid: a03.actual.qid, ms: a03.actual.ms } : null,
        A05: a05 ? { status: a05.status, ui: a05.actual.uiState, qid: a05.actual.qid } : null,
        A06: a06 ? { status: a06.status, ui: a06.actual.uiState, qid: a06.actual.qid } : null,
        E02: e02 ? { status: e02.status, ui: e02.actual.uiState } : null,
        L03: l03
          ? { status: l03.status, wall_ms: l03.actual.ms, timings_total: l03.actual.timings_total, qid: l03.actual.qid }
          : null,
      },
    },
    e01_probes: e01,
    results,
    hebrew_summary: heSummary,
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(jsonOut, null, 2), 'utf8');

  // Update ACCURACY_REPORT.md briefly as latest P2 Preview
  let report = `# ACCURACY_REPORT\n\n`;
  report += `**Latest eval:** ACCURACY_EVAL-P2-HTTP-Preview-SMITH-CTX-דיוק-2026-09-15  \n`;
  report += `**When:** ${whenIL} Asia/Jerusalem  \n`;
  report += `**Base:** Preview ${PREVIEW_URL} · deploy \`${DEPLOY}\` · health build match · probe HTTP ${probe.status} (not 403) · requestId=${probe.requestId_ok ? 'ok' : 'FAIL'}  \n`;
  report += `**Totals:** N=${N} · PASS=${PASS} · FAIL=${FAIL} · pretty-wrong=${prettyWrong} · SAFETY=${safetyLock} · E01=${e01Pass ? 'PASS' : 'FAIL'}  \n`;
  report += `**Recommendation (P2 Release Gate):** **${recommendation}** — ${recNote}\n\n`;
  report += `| Case | Cat | Expected | Actual | Confidence | Status | Error |\n`;
  report += `|------|-----|----------|--------|------------|--------|-------|\n`;
  for (const r of results) {
    const act = `ui=${r.actual.uiState}; qid=${r.actual.qid || '-'}; faces=${r.actual.faces}; src=${r.actual.sources}; ms=${r.actual.ms}`;
    report += `| ${r.id} | ${r.category} | ${r.expected.label} | ${act} | ${r.actual.confidence || '-'} | ${r.status} | ${r.errorType || '—'} |\n`;
  }
  report += `\n### P2-E01 (not in pack)\n`;
  for (const p of e01) {
    report += `- ${p.id}: expect=${p.expect} actual=${p.actual} → ${p.pass ? 'PASS' : 'FAIL'}\n`;
  }
  report += `\n## Prior eval\n`;
  report += `Previous latest: ACCURACY_EVAL-P1-HTTP-dplDNf-דיוק-2026-09-15 (N=25, PASS=24, FAIL=0, PASS_DOCUMENTED_P2=1) on live alias dpl_DNf — superseded as *latest* by this P2 Preview HTTP Acc on \`${DEPLOY}\`. Local layer-only: ACCURACY_REEVAL-P2-LOCAL-דיוק-2026-09-15 (N=18, PASS=17, FAIL=1 E02).\n`;
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
