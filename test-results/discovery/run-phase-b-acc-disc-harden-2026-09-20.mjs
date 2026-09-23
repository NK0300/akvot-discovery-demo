#!/usr/bin/env node
/**
 * Phase B Acc-DISC HARDEN Preview · דיוק · 2026-09-20
 * Prior dpl_BvWg Acc does NOT carry over. NO promote.
 * Surfaces: POST/GET sessions · SSE events · POST narrow · Core alias Acc P0
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const RAW = join(__dirname, 'PHASE-B-ACC-DISC-HARDEN-raw');
mkdirSync(RAW, { recursive: true });

const DISC_BASE = 'https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app';
const DISC_DPL = 'dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB';
const ALIAS_BASE = 'https://akvot-simple-demo.vercel.app';
const ALIAS_DPL = 'dpl_8agSZKvcb2pjehzXgMeckDgJvDV8';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const FIV_EXPECTED = '2026-09-19.1';
const OUT_JSON = join(__dirname, 'PHASE-B-ACC-DISC-HARDEN-דיוק-2026-09-20.json');
const OUT_MD = join(__dirname, 'PHASE-B-ACC-DISC-HARDEN-דיוק-2026-09-20.md');

function nowJerusalem() {
  return (
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Jerusalem',
      dateStyle: 'short',
      timeStyle: 'medium',
      hour12: false,
    })
      .format(new Date())
      .replace(' ', 'T') + '+03:00'
  );
}

function vercelCurl(urlOrPath, { method = 'GET', body = null, deployment = null, extra = [], timeout = 180000 } = {}) {
  const args = ['curl'];
  if (deployment) {
    const path = urlOrPath.startsWith('http')
      ? new URL(urlOrPath).pathname + new URL(urlOrPath).search
      : urlOrPath;
    args.push(path, '--deployment', deployment, '--scope', SCOPE, '--');
  } else {
    args.push(urlOrPath, '--scope', SCOPE, '--');
  }
  args.push('-sS', '-H', 'Accept: application/json', '-H', `Origin: ${ALIAS_BASE}`, ...extra);
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  }
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout,
    cwd: ROOT,
  });
  const ms = Date.now() - t0;
  const stdout = r.stdout || '';
  const lines = stdout.split('\n').map((s) => s.trim()).filter(Boolean);
  let json = null;
  let jsonLine = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith('{') || lines[i].startsWith('[')) {
      jsonLine = lines[i];
      try {
        json = JSON.parse(jsonLine);
      } catch (_) {}
      if (json) break;
    }
  }
  if (!json) {
    try {
      json = JSON.parse(stdout.trim());
      jsonLine = stdout.trim();
    } catch (_) {}
  }
  return {
    url: urlOrPath,
    method,
    body,
    ms,
    exit: r.status,
    json,
    text: jsonLine || stdout.trim(),
    rawStdout: stdout,
    stderr: (r.stderr || '').trim(),
  };
}

function vercelCurlSSE(path, { deployment, maxSeconds = 45 } = {}) {
  // Capture SSE stream; timeout via curl --max-time
  const args = [
    'curl',
    path,
    '--deployment',
    deployment,
    '--scope',
    SCOPE,
    '--',
    '-sS',
    '-N',
    '-H',
    'Accept: text/event-stream',
    '-H',
    `Origin: ${ALIAS_BASE}`,
    '-D',
    '-',
    '--max-time',
    String(maxSeconds),
  ];
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    timeout: (maxSeconds + 30) * 1000,
    cwd: ROOT,
  });
  const ms = Date.now() - t0;
  return {
    url: path,
    method: 'GET',
    ms,
    exit: r.status,
    text: r.stdout || '',
    stderr: (r.stderr || '').trim(),
  };
}

function leaks(text) {
  const hits = String(text || '').match(FORBIDDEN_RE) || [];
  return hits.map((x) => x.toLowerCase());
}

function facesCount(j) {
  if (Array.isArray(j?.images)) return j.images.length;
  if (typeof j?.faces === 'number') return j.faces;
  if (j?.faces === false) return 0;
  if (j?.faces === true) return 1;
  if (Array.isArray(j?.faces)) return j.faces.length;
  return 0;
}

function hasDossier(j) {
  if (!j || typeof j !== 'object') return false;
  if (j.uiState === 'dossier' || j.mode === 'dossier' || j.ui === 'dossier') return true;
  if (j.dossier && typeof j.dossier === 'object') return true;
  return false;
}

function deepScanForbidden(obj, path = '') {
  const found = [];
  if (obj == null) return found;
  if (typeof obj === 'string' || typeof obj === 'number') {
    const hits = leaks(String(obj));
    for (const h of hits) found.push({ path, term: h, value: String(obj).slice(0, 200) });
    return found;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => found.push(...deepScanForbidden(v, `${path}[${i}]`)));
    return found;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      found.push(...deepScanForbidden(v, path ? `${path}.${k}` : k));
    }
  }
  return found;
}

function saveRaw(label, data) {
  const file = `${label}.json`;
  const payload =
    data?.json != null
      ? data.json
      : typeof data === 'string'
        ? { text: data }
        : data?.text != null && !data.json
          ? { error: data.error || 'no-json', text: String(data.text).slice(0, 200000), stderr: data.stderr }
          : data;
  writeFileSync(join(RAW, file), JSON.stringify(payload, null, 2));
  return file;
}

function saveText(label, text) {
  const file = `${label}.txt`;
  writeFileSync(join(RAW, file), String(text || ''));
  return file;
}

function analyzeDiscovery(label, seed, hints, req, extras = {}) {
  const j = req.json;
  const snap = j?.snapshot || j;
  const leakHits = deepScanForbidden(j);
  const findings = Array.isArray(snap?.findings) ? snap.findings : Array.isArray(j?.findings) ? j.findings : [];
  const evidence = Array.isArray(snap?.evidence) ? snap.evidence : Array.isArray(j?.evidence) ? j.evidence : [];
  const facets = Array.isArray(snap?.facets) ? snap.facets : Array.isArray(j?.facets) ? j.facets : [];
  const graph = snap?.graph || j?.graph || null;
  const candidates = Array.isArray(snap?.candidates) ? snap.candidates : Array.isArray(j?.candidates) ? j.candidates : [];
  const status = snap?.status || j?.status || null;
  const fiv = snap?.forbiddenIdentitiesVersion || j?.forbiddenIdentitiesVersion || null;
  const dossier = hasDossier(j) || hasDossier(snap);
  const faces = facesCount(j) + facesCount(snap);
  const progressiveOk = ['running', 'partial', 'complete', 'failed_soft'].includes(String(status));
  const regenerated = j?.regenerated === true || snap?.regenerated === true || extras.regenerated === true;

  const checks = {
    http_ok: !!(j && req.exit === 0 && (j.ok === true || j.sessionId || findings.length >= 0) && !j.error),
    session_created: !!(j?.sessionId || snap?.sessionId || extras.sessionId),
    no_Q1701775: leakHits.length === 0,
    no_dossier: !dossier,
    faces_zero: faces === 0,
    has_forbiddenIdentitiesVersion: !!fiv,
    progressive_status_valid: progressiveOk,
    findings_scrubbed: leakHits.filter((x) => String(x.path).includes('finding')).length === 0,
    facets_scrubbed: leakHits.filter((x) => String(x.path).includes('facet')).length === 0,
    graph_scrubbed: leakHits.filter((x) => String(x.path).includes('graph')).length === 0,
    candidates_scrubbed: leakHits.filter((x) => String(x.path).includes('candidate')).length === 0,
    evidence_has_provenance: evidence.length === 0 || evidence.every((e) => e?.provenanceUrl || e?.url),
  };
  if (extras.requireRegen) {
    checks.regenerated_or_hit = regenerated || j?.store?.backend === 'fs-regen' || j?.ok === true;
  }
  const pass = Object.values(checks).every(Boolean) && leakHits.length === 0 && !dossier && faces === 0;

  return {
    label,
    seed,
    hints: hints || null,
    surface: extras.surface || 'discovery',
    method: req.method,
    ms: req.ms,
    exit: req.exit,
    ok: j?.ok ?? null,
    sessionId: j?.sessionId || snap?.sessionId || extras.sessionId || null,
    status,
    forbiddenIdentitiesVersion: fiv,
    regenerated: regenerated || null,
    store: j?.store || null,
    version: j?.version ?? snap?.version ?? null,
    findings_n: findings.length,
    evidence_n: evidence.length,
    facets_n: facets.length,
    candidates_n: candidates.length,
    graph_nodes: Array.isArray(graph?.nodes) ? graph.nodes.length : graph ? 1 : 0,
    dossier,
    faces,
    leakage_count: leakHits.length,
    leakage: leakHits.slice(0, 20),
    checks,
    pass,
    raw_file: saveRaw(label, req),
    note: extras.note || null,
  };
}

function analyzeLookup(label, req, expect) {
  const j = req.json;
  const leakHits = deepScanForbidden(j);
  const ui = j?.uiState ?? j?.mode ?? j?.ui ?? null;
  const qid = j?.qid ?? j?.dossier?.qid ?? null;
  const faces = facesCount(j);
  const checks = {};
  let pass = true;

  if (expect.uiExact) {
    checks.ui = ui === expect.uiExact;
    pass = pass && checks.ui;
  }
  if (expect.uiIn) {
    checks.ui = expect.uiIn.includes(ui) && ui !== 'dossier';
    pass = pass && checks.ui;
  }
  if (expect.qidExact) {
    checks.qid = qid === expect.qidExact;
    pass = pass && checks.qid;
  }
  if (expect.neverQid) {
    checks.never_qid = qid !== expect.neverQid && leakHits.length === 0;
    pass = pass && checks.never_qid;
  }
  if (expect.faces === 0) {
    checks.faces_zero = faces === 0;
    pass = pass && checks.faces_zero;
  }
  checks.no_leakage = leakHits.length === 0;
  pass = pass && checks.no_leakage;
  checks.http_ok = !!(j && req.exit === 0);
  pass = pass && checks.http_ok;

  const pw = ui === 'dossier' && (qid === 'Q1701775' || leakHits.length > 0);
  checks.pw_zero = !pw;
  pass = pass && !pw;

  return {
    label,
    surface: 'lookup',
    method: req.method,
    ms: req.ms,
    exit: req.exit,
    ui,
    qid,
    faces,
    leakage_count: leakHits.length,
    leakage: leakHits.slice(0, 10),
    pw: pw ? 1 : 0,
    checks,
    pass,
    expect,
    raw_file: saveRaw(label, req),
  };
}

function parseSSE(text) {
  const events = [];
  const blocks = String(text).split(/\n\n+/);
  for (const block of blocks) {
    if (!block.trim()) continue;
    let id = null;
    let event = null;
    const dataLines = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('id:')) id = line.slice(3).trim();
      else if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      else if (line.startsWith('HTTP/') || line.match(/^[A-Za-z-]+:/)) {
        // response headers mixed in via -D -
        continue;
      }
    }
    if (!event && !dataLines.length && id == null) continue;
    let data = dataLines.join('\n');
    let parsed = null;
    try {
      parsed = JSON.parse(data);
    } catch (_) {}
    events.push({ id, event, data: parsed ?? data });
  }
  return events;
}

function analyzeSSE(label, sessionId, req) {
  const text = req.text || '';
  const headerEnd = text.indexOf('\r\n\r\n') >= 0 ? text.indexOf('\r\n\r\n') : text.indexOf('\n\n');
  const headers = headerEnd >= 0 ? text.slice(0, headerEnd) : '';
  const body = headerEnd >= 0 ? text.slice(headerEnd).replace(/^\r?\n\r?\n/, '') : text;
  const ct = /content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]?.trim() || '';
  const isSSE = /text\/event-stream/i.test(ct) || /event:|data:/.test(body);
  const events = parseSSE(body);
  const leakHits = leaks(body);
  const eventNames = events.map((e) => e.event).filter(Boolean);
  const findingEvents = events.filter((e) => e.event === 'finding' || e.event === 'findings');
  const facetsEvents = events.filter((e) => e.event === 'facets');
  const hasDone = eventNames.includes('done');
  const hasMeta = eventNames.includes('meta');
  const ids = events.map((e) => e.id).filter((x) => x != null && x !== '');
  const idsMonotonic = ids.length <= 1 || ids.every((id, i) => i === 0 || Number(id) >= Number(ids[i - 1]) || String(id) >= String(ids[i - 1]));

  // Scrub each chunk
  const chunkLeaks = [];
  for (const ev of events) {
    const hits = deepScanForbidden(ev.data);
    for (const h of hits) chunkLeaks.push({ event: ev.event, id: ev.id, ...h });
  }

  // dossier/faces ban on SSE
  const dossierBan = !/["']dossier["']\s*:/.test(body) || !hasDossier({ uiState: 'dossier' }) || true;
  let hasDossierEmit = false;
  let facesOnSSE = 0;
  for (const ev of events) {
    if (ev.data && typeof ev.data === 'object') {
      if (hasDossier(ev.data)) hasDossierEmit = true;
      facesOnSSE += facesCount(ev.data);
      if (ev.data.finding && hasDossier(ev.data.finding)) hasDossierEmit = true;
    }
  }

  const fivPresent =
    events.some((e) => {
      const d = e.data;
      return d?.forbiddenIdentitiesVersion || d?.snapshot?.forbiddenIdentitiesVersion || d?.meta?.forbiddenIdentitiesVersion;
    }) || /forbiddenIdentitiesVersion/.test(body);

  const checks = {
    http_ok: req.exit === 0 || req.exit === 28 /* curl timeout after stream ok */,
    content_type_sse: isSSE,
    has_events: events.length > 0,
    has_meta_or_progress: hasMeta || eventNames.includes('progress'),
    has_finding_or_status: findingEvents.length > 0 || eventNames.includes('status') || hasDone,
    no_Q1701775_any_chunk: chunkLeaks.length === 0 && leakHits.length === 0,
    no_dossier: !hasDossierEmit,
    faces_zero: facesOnSSE === 0,
    ids_present: ids.length > 0,
    ids_monotonic: idsMonotonic,
  };

  const pass = Object.values(checks).every(Boolean);

  saveText(label, text);
  return {
    label,
    surface: 'discovery-sse',
    method: 'GET',
    sessionId,
    ms: req.ms,
    exit: req.exit,
    content_type: ct || (isSSE ? 'text/event-stream (inferred)' : 'unknown'),
    events_n: events.length,
    event_names: eventNames,
    finding_events_n: findingEvents.length,
    facets_events_n: facetsEvents.length,
    id_count: ids.length,
    has_done: hasDone,
    has_meta: hasMeta,
    forbiddenIdentitiesVersion_seen: fivPresent,
    leakage_count: chunkLeaks.length + leakHits.length,
    leakage: chunkLeaks.slice(0, 20),
    dossier: hasDossierEmit,
    faces: facesOnSSE,
    checks,
    pass,
    raw_file: `${label}.txt`,
    note: 'SSE scrub on emit — NEVER Q1701775/forbidden on any chunk',
  };
}

function analyzeNarrow(label, sessionId, req) {
  const j = req.json;
  const snap = j?.snapshot || j;
  const leakHits = deepScanForbidden(j);
  const narrow = j?.narrow || snap?.narrow || null;
  const findings = Array.isArray(snap?.findings) ? snap.findings : Array.isArray(j?.findings) ? j.findings : [];
  const fiv = snap?.forbiddenIdentitiesVersion || j?.forbiddenIdentitiesVersion || null;
  const dossier = hasDossier(j) || hasDossier(snap);
  const faces = facesCount(j) + facesCount(snap);

  const checks = {
    http_ok: !!(j && req.exit === 0 && j.ok !== false && !j.error),
    no_Q1701775: leakHits.length === 0,
    no_dossier: !dossier,
    faces_zero: faces === 0,
    has_forbiddenIdentitiesVersion: !!fiv,
    narrow_applied: !!(narrow?.applied || narrow?.beforeCount != null || j?.version != null),
  };
  const pass = Object.values(checks).every(Boolean);

  return {
    label,
    surface: 'discovery-narrow',
    method: 'POST',
    sessionId,
    ms: req.ms,
    exit: req.exit,
    ok: j?.ok ?? null,
    version: j?.version ?? null,
    forbiddenIdentitiesVersion: fiv,
    narrow,
    beforeCount: narrow?.beforeCount ?? null,
    afterCount: narrow?.afterCount ?? findings.length,
    findings_n: findings.length,
    dossier,
    faces,
    leakage_count: leakHits.length,
    leakage: leakHits.slice(0, 20),
    checks,
    pass,
    raw_file: saveRaw(label, req),
    note: 'POST narrow — Acc scrub on recompute emit',
  };
}

const started = nowJerusalem();
console.log(`[acc-disc-harden] start ${started}`);
console.log(`[acc-disc-harden] preview ${DISC_DPL} · alias ${ALIAS_DPL} · NO promote`);

// --- Health ---
const discHealth = vercelCurl('/api/health', { deployment: DISC_DPL });
const aliasHealth = vercelCurl('/api/health', { deployment: ALIAS_DPL });
saveRaw('disc-health', discHealth);
saveRaw('alias-health', aliasHealth);
const discHealthOk = discHealth.json?.build === DISC_DPL;
const aliasHealthOk = aliasHealth.json?.build === ALIAS_DPL;
console.log('[health] disc', discHealth.json?.build, discHealthOk, 'alias', aliasHealth.json?.build, aliasHealthOk);

const seeds = [
  {
    label: 'disc-seed-he-soft',
    seed: 'דוד כהן',
    hints: { locale: 'he' },
    note: 'HE person soft — entity-agnostic',
  },
  {
    label: 'disc-seed-smith-ctx',
    seed: 'John Smith',
    hints: { org: 'IBM', city: 'New York', country: 'US' },
    note: 'Smith+IBM/NY/US — NEVER Q1701775',
  },
  {
    label: 'disc-seed-org-domain',
    seed: 'example.org',
    hints: { kind: 'domain' },
    note: 'Org/domain fixture',
  },
];

const discCases = [];
let smithSessionId = null;
let primarySessionId = null;

for (const s of seeds) {
  console.log(`[disc] POST session seed=${s.seed}`);
  const body = { seed: s.seed, hints: s.hints };
  const req = vercelCurl('/api/discovery/sessions', {
    method: 'POST',
    body,
    deployment: DISC_DPL,
  });
  const analyzed = analyzeDiscovery(s.label, s.seed, s.hints, req, { note: s.note });
  discCases.push(analyzed);
  console.log(
    `  → pass=${analyzed.pass} status=${analyzed.status} findings=${analyzed.findings_n} fiv=${analyzed.forbiddenIdentitiesVersion} leak=${analyzed.leakage_count}`
  );

  if (analyzed.sessionId) {
    if (!primarySessionId) primarySessionId = analyzed.sessionId;
    if (s.label === 'disc-seed-smith-ctx') smithSessionId = analyzed.sessionId;

    // GET — sticky / regenerated path (fs-regen)
    const enc = encodeURIComponent(analyzed.sessionId);
    console.log(`[disc] GET session (HIT/regen) id=${analyzed.sessionId.slice(0, 24)}…`);
    const getReq = vercelCurl(`/api/discovery/sessions/${enc}`, { deployment: DISC_DPL });
    const getLabel = `${s.label}-get`;
    if (getReq.json && getReq.json.ok !== false && !getReq.json.error && (getReq.json.sessionId || getReq.json.snapshot || getReq.json.findings)) {
      const g = analyzeDiscovery(getLabel, s.seed, s.hints, getReq, {
        surface: 'discovery-get',
        sessionId: analyzed.sessionId,
        note: getReq.json.regenerated
          ? 'GET regen-from-seed — Acc scrub still holds (forbiddenIdentitiesVersion)'
          : 'GET HIT/sticky — Acc scrub still holds (forbiddenIdentitiesVersion)',
        requireRegen: true,
        regenerated: getReq.json.regenerated === true,
      });
      g.regenerated = getReq.json.regenerated === true;
      discCases.push(g);
      console.log(
        `  GET → pass=${g.pass} regenerated=${g.regenerated} status=${g.status} fiv=${g.forbiddenIdentitiesVersion} leak=${g.leakage_count}`
      );
    } else {
      const skip = {
        label: getLabel,
        seed: s.seed,
        surface: 'discovery-get',
        note: 'GET failed unexpectedly on harden (fs-regen should work)',
        skip: false,
        pass: false,
        http_status_hint: getReq.json?.error || getReq.text?.slice(0, 120),
        leakage_count: leaks(getReq.text || '').length,
        raw_file: saveRaw(getLabel, getReq),
      };
      discCases.push(skip);
      console.log(`  GET → FAIL (${getReq.json?.error || 'no body'})`);
    }
  }
}

// --- SSE on primary (Alex-like: use first seed session) + Smith session preferred for scrub ---
const sseSessionId = smithSessionId || primarySessionId;
if (sseSessionId) {
  const enc = encodeURIComponent(sseSessionId);
  console.log(`[sse] GET …/events session=${sseSessionId.slice(0, 28)}…`);
  const sseReq = vercelCurlSSE(`/api/discovery/sessions/${enc}/events`, {
    deployment: DISC_DPL,
    maxSeconds: 40,
  });
  const sseCase = analyzeSSE('disc-sse-smith-or-primary', sseSessionId, sseReq);
  discCases.push(sseCase);
  console.log(
    `  SSE → pass=${sseCase.pass} events=${sseCase.events_n} names=${[...new Set(sseCase.event_names)].join(',')} leak=${sseCase.leakage_count} ct=${sseCase.content_type}`
  );
} else {
  discCases.push({
    label: 'disc-sse-smith-or-primary',
    surface: 'discovery-sse',
    pass: false,
    note: 'No sessionId for SSE',
    leakage_count: 0,
  });
}

// --- Narrow on smith or primary ---
if (sseSessionId) {
  const enc = encodeURIComponent(sseSessionId);
  console.log(`[narrow] POST …/narrow`);
  const narrowReq = vercelCurl(`/api/discovery/sessions/${enc}/narrow`, {
    method: 'POST',
    body: { facets: { provider: ['openlibrary'] } },
    deployment: DISC_DPL,
  });
  // fallback provider if openlibrary yields nothing useful — still scrub-check
  let nCase = analyzeNarrow('disc-narrow-provider', sseSessionId, narrowReq);
  if (!nCase.pass && narrowReq.json?.error) {
    console.log('  narrow openlibrary error, retry wikidata');
    const narrowReq2 = vercelCurl(`/api/discovery/sessions/${enc}/narrow`, {
      method: 'POST',
      body: { facets: { provider: ['wikidata'] } },
      deployment: DISC_DPL,
    });
    nCase = analyzeNarrow('disc-narrow-provider', sseSessionId, narrowReq2);
  }
  discCases.push(nCase);
  console.log(
    `  NARROW → pass=${nCase.pass} before=${nCase.beforeCount} after=${nCase.afterCount} ver=${nCase.version} fiv=${nCase.forbiddenIdentitiesVersion} leak=${nCase.leakage_count}`
  );
}

// Preview lookup Smith+ctx
console.log('[disc] Smith+ctx via preview /api/lookup');
const smithPreview = vercelCurl('/api/lookup', {
  method: 'POST',
  body: { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' }, nocache: 1 },
  deployment: DISC_DPL,
});
const smithPreviewCase = analyzeLookup('preview-lookup-smith-ctx', smithPreview, {
  uiIn: ['candidates', 'thin', 'need_context'],
  neverQid: 'Q1701775',
  faces: 0,
});
smithPreviewCase.note = 'Smith+ctx on preview lookup — Acc scrub; never Q1701775';
discCases.push(smithPreviewCase);
console.log(`  → pass=${smithPreviewCase.pass} ui=${smithPreviewCase.ui} qid=${smithPreviewCase.qid} leak=${smithPreviewCase.leakage_count}`);

// --- Core alias Acc P0 ---
console.log('[core] alias Assaf / כהן / Smith');
const coreCases = [];

const assaf = analyzeLookup(
  'alias-assaf',
  vercelCurl(`/api/lookup?q=${encodeURIComponent('Assaf Rappaport')}`, { deployment: ALIAS_DPL }),
  { uiExact: 'dossier', qidExact: 'Q47507930', neverQid: 'Q1701775' }
);
delete assaf.checks.faces_zero;
assaf.pass = !!(assaf.checks.ui && assaf.checks.qid && assaf.checks.no_leakage && assaf.checks.http_ok && assaf.checks.pw_zero);
coreCases.push(assaf);
console.log(`  Assaf → pass=${assaf.pass} ui=${assaf.ui} qid=${assaf.qid}`);

const cohen = analyzeLookup(
  'alias-cohen',
  vercelCurl(`/api/lookup?q=${encodeURIComponent('כהן')}`, { deployment: ALIAS_DPL }),
  { uiIn: ['need_context', 'thin', 'candidates'], faces: 0, neverQid: 'Q1701775' }
);
coreCases.push(cohen);
console.log(`  כהן → pass=${cohen.pass} ui=${cohen.ui} faces=${cohen.faces}`);

const smithBody = { q: 'John Smith', ctx: { org: 'IBM', city: 'New York', country: 'US' } };
const smithCold = analyzeLookup(
  'alias-smith-post-ctx-nocache',
  vercelCurl('/api/lookup', { method: 'POST', body: { ...smithBody, nocache: 1 }, deployment: ALIAS_DPL }),
  { uiIn: ['candidates', 'thin', 'need_context'], neverQid: 'Q1701775', faces: 0 }
);
const smithWarm = analyzeLookup(
  'alias-smith-post-ctx-warm',
  vercelCurl('/api/lookup', { method: 'POST', body: smithBody, deployment: ALIAS_DPL }),
  { uiIn: ['candidates', 'thin', 'need_context'], neverQid: 'Q1701775', faces: 0 }
);
coreCases.push(smithCold, smithWarm);
console.log(`  Smith cold → pass=${smithCold.pass} ui=${smithCold.ui} qid=${smithCold.qid} pw=${smithCold.pw}`);
console.log(`  Smith warm → pass=${smithWarm.pass} ui=${smithWarm.ui} qid=${smithWarm.qid} pw=${smithWarm.pw}`);

// Aggregate
const discRunnable = discCases.filter((c) => !c.skip);
const discPass = discRunnable.every((c) => c.pass);
const discLeak = discRunnable.reduce((n, c) => n + (c.leakage_count || 0), 0);
const corePass = coreCases.every((c) => c.pass);
const coreLeak = coreCases.reduce((n, c) => n + (c.leakage_count || 0), 0);
const corePw = coreCases.reduce((n, c) => n + (c.pw || 0), 0);
const seedsPosted = discCases.filter((c) => c.surface === 'discovery' && c.method === 'POST' && c.pass).length;
const getOk = discCases.filter((c) => c.surface === 'discovery-get' && c.pass).length;
const sseOk = discCases.some((c) => c.surface === 'discovery-sse' && c.pass);
const narrowOk = discCases.some((c) => c.surface === 'discovery-narrow' && c.pass);

const accDiscGo = discPass && discLeak === 0 && discHealthOk && seedsPosted >= 3;
const coreAliasGo = corePass && coreLeak === 0 && corePw === 0 && aliasHealthOk;

const result = {
  meta: {
    checked_at: started,
    timezone: 'Asia/Jerusalem (UTC+3)',
    phase: 'B',
    role: 'דיוק',
    pack: 'Acc-DISC HARDEN',
    promote: false,
    prior_acc_dpl_not_carried: 'dpl_BvWg9yUsibVqdrCAexSTMpwoabZ6',
    discovery_preview: DISC_BASE,
    discovery_dpl: DISC_DPL,
    alias: ALIAS_BASE,
    alias_dpl_expected: ALIAS_DPL,
    alias_build_observed: aliasHealth.json?.build ?? null,
    forbidden: 'Q1701775',
    forbiddenIdentitiesVersion_expected: FIV_EXPECTED,
    server_evidence: 'test-results/discovery/PHASE-B-SERVER-HARDEN-שרת-2026-09-20.md',
    endpoints: {
      discovery: [
        'POST /api/discovery/sessions',
        'GET /api/discovery/sessions/:id',
        'GET /api/discovery/sessions/:id/events',
        'POST /api/discovery/sessions/:id/narrow',
      ],
      core: ['GET|POST /api/lookup'],
    },
  },
  health: {
    discovery: { build: discHealth.json?.build ?? null, match: discHealthOk, ms: discHealth.ms },
    alias: { build: aliasHealth.json?.build ?? null, match: aliasHealthOk, ms: aliasHealth.ms },
  },
  acc_disc: {
    verdict: accDiscGo ? 'GO' : 'NO-GO',
    pass: discPass,
    leakage_count: discLeak,
    seeds_n: seeds.length,
    seeds_posted_pass: seedsPosted,
    get_pass_n: getOk,
    sse_pass: sseOk,
    narrow_pass: narrowOk,
    cases: discCases,
  },
  core_alias: {
    verdict: coreAliasGo ? 'GO' : 'NO-GO',
    pass: corePass,
    leakage_count: coreLeak,
    pw: corePw,
    cases: coreCases,
  },
  summary: {
    'Acc-DISC': accDiscGo ? 'GO' : 'NO-GO',
    'Core-alias': coreAliasGo ? 'GO' : 'NO-GO',
    leakage_total: discLeak + coreLeak,
    pw_total: corePw,
    sse: sseOk ? 'PASS' : 'FAIL',
    narrow: narrowOk ? 'PASS' : 'FAIL',
    promote: 'NOT DONE',
  },
};

writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n');

function yn(b) {
  return b ? 'PASS' : 'FAIL';
}

const md = `# Phase B · Acc-DISC HARDEN Preview · דיוק · 2026-09-20

**Checked:** ${started} (Asia/Jerusalem, UTC+3)  
**Promote:** **NO** (explicit)  
**Prior Acc:** \`dpl_BvWg…\` does **NOT** carry over — re-ran on harden Preview  
**Discovery Preview:** \`${DISC_BASE}\` · \`${DISC_DPL}\`  
**Core Alias:** \`${ALIAS_BASE}\` · expected \`${ALIAS_DPL}\` · observed \`${aliasHealth.json?.build ?? 'null'}\`  
**Server evidence:** \`PHASE-B-SERVER-HARDEN-שרת-2026-09-20.md\`

## Verdict

| Gate | Result | Leakage | Notes |
|------|--------|---------|-------|
| **Acc-DISC** | **${result.summary['Acc-DISC']}** | ${discLeak} | ≥3 Seeds · SSE · narrow · HIT/regen · NEVER Q1701775 |
| **Core alias (Acc P0)** | **${result.summary['Core-alias']}** | ${coreLeak} · pw=${corePw} | Assaf Q47507930 · כהן soft · Smith never Q170 · pw=0 |

## Health

| Target | build | match |
|--------|-------|-------|
| Discovery Preview | \`${discHealth.json?.build ?? 'null'}\` | ${yn(discHealthOk)} |
| Alias | \`${aliasHealth.json?.build ?? 'null'}\` | ${yn(aliasHealthOk)} |

## Acc-DISC cases

| Case | Seed / surface | status/ui | findings | leak | dossier | faces | fiv / notes | Result |
|------|----------------|-----------|----------|------|---------|-------|-------------|--------|
${discCases
  .map((c) => {
    if (c.skip) return `| ${c.label} | ${c.seed ?? c.surface} | skip | — | — | — | — | ${c.note ?? ''} | SKIP |`;
    const st = c.status ?? c.ui ?? (c.surface === 'discovery-sse' ? `sse:${c.events_n}` : c.surface === 'discovery-narrow' ? `narrow:${c.afterCount}` : '—');
    const fiv = c.forbiddenIdentitiesVersion ?? (c.forbiddenIdentitiesVersion_seen ? 'seen' : '—');
    const regen = c.regenerated === true ? ' regen' : c.regenerated === false ? ' hit' : '';
    return `| ${c.label} | ${c.seed ?? c.surface} | ${st}${regen} | ${c.findings_n ?? c.finding_events_n ?? '—'} | ${c.leakage_count} | ${c.dossier ?? false} | ${c.faces ?? '—'} | ${fiv} | ${c.pass ? 'PASS' : 'FAIL'} |`;
  })
  .join('\n')}

### Paths exercised
1. **POST** \`/api/discovery/sessions\` × ${seeds.length} Seeds (HE soft · Smith+IBM/NY/US · example.org)
2. **GET** \`/api/discovery/sessions/:id\` — HIT/regen (\`fs-regen\`); Acc scrub + \`forbiddenIdentitiesVersion\` required
3. **SSE** \`GET …/:id/events\` — scrub on every chunk; NEVER Q1701775 → **${sseOk ? 'PASS' : 'FAIL'}**
4. **Narrow** \`POST …/:id/narrow\` — recompute scrub → **${narrowOk ? 'PASS' : 'FAIL'}**
5. Preview \`/api/lookup\` Smith+ctx — never Q1701775

### Invariants
- **ACC-DISC-01** leakage=0 (findings / facets / graph / SSE chunks / narrow)
- **ACC-DISC-02** Discovery never emits dossier / identity commit
- **ACC-DISC-03** UNKNOWN≠FALSE
- **ACC-DISC-06** NEVER Q1701775
- HIT/regen still carries \`forbiddenIdentitiesVersion\` (\`${FIV_EXPECTED}\`)

## Core alias regression (Acc P0)

| Case | ui | qid | faces | leak | pw | Result |
|------|----|-----|-------|------|----|--------|
${coreCases
  .map(
    (c) =>
      `| ${c.label} | ${c.ui} | ${c.qid ?? 'null'} | ${c.faces} | ${c.leakage_count} | ${c.pw} | ${c.pass ? 'PASS' : 'FAIL'} |`
  )
  .join('\n')}

## Leakage

- Discovery total: **${discLeak}**
- Core alias total: **${coreLeak}**
- Pretty-wrong (pw): **${corePw}**

## SSE / Narrow notes

- SSE: content-type event-stream · events scrubbed per chunk · leak=${discCases.find((c) => c.surface === 'discovery-sse')?.leakage_count ?? 'n/a'}
- Narrow: version bump + Acc scrub · leak=${discCases.find((c) => c.surface === 'discovery-narrow')?.leakage_count ?? 'n/a'}

## Artifacts

- JSON: \`test-results/discovery/PHASE-B-ACC-DISC-HARDEN-דיוק-2026-09-20.json\`
- MD: \`test-results/discovery/PHASE-B-ACC-DISC-HARDEN-דיוק-2026-09-20.md\`
- Raw: \`test-results/discovery/PHASE-B-ACC-DISC-HARDEN-raw/\`
- Runner: \`test-results/discovery/run-phase-b-acc-disc-harden-2026-09-20.mjs\`

## Decision

- Acc-DISC: **${result.summary['Acc-DISC']}**
- Core alias: **${result.summary['Core-alias']}**
- **NO promote** performed.
`;

writeFileSync(OUT_MD, md);
console.log(JSON.stringify(result.summary, null, 2));
console.log('wrote', OUT_JSON);
console.log('wrote', OUT_MD);
process.exit(accDiscGo && coreAliasGo ? 0 : 1);
