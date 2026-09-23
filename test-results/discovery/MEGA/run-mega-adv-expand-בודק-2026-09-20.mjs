#!/usr/bin/env node
/**
 * MEGA adversarial RUNNOW expand L5–L12 · בודק · 2026-09-20
 * Preview dpl_BMh… only · HOLD promote · no secrets
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEGA = __dirname;
const ROOT = join(__dirname, '../../..');
const RAW_ADV = join(MEGA, 'raw', 'adversarial');
mkdirSync(RAW_ADV, { recursive: true });

const DISC_DPL = 'dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB';
const ALIAS_BASE = 'https://akvot-simple-demo.vercel.app';
const SCOPE = 'k-akvot';
const FORBIDDEN_RE = /Q1701775|wd-Q1701775|wd_Q1701775/gi;
const ENTITY_LEAK_RE = /wd-Q1701775|"qid"\s*:\s*"Q1701775"|wd_Q1701775/gi;

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

function vercelCurl(urlOrPath, {
  method = 'GET',
  body = null,
  deployment = DISC_DPL,
  timeout = 180000,
  accept = 'application/json',
} = {}) {
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const bodyFile = join(RAW_ADV, `_curl-body-${stamp}`);
  const hdrFile = join(RAW_ADV, `_curl-hdr-${stamp}`);
  const args = ['curl'];
  if (deployment) {
    const path = urlOrPath.startsWith('http')
      ? new URL(urlOrPath).pathname + new URL(urlOrPath).search
      : urlOrPath;
    args.push(path, '--deployment', deployment, '--scope', SCOPE, '--');
  } else {
    args.push(urlOrPath, '--scope', SCOPE, '--');
  }
  args.push(
    '-sS', '-o', bodyFile, '-D', hdrFile, '-w', '%{http_code}',
    '-H', `Accept: ${accept}`,
    '-H', `Origin: ${ALIAS_BASE}`,
  );
  if (method === 'POST') {
    args.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data', JSON.stringify(body));
  }
  const t0 = Date.now();
  const r = spawnSync('vercel', args, {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout, cwd: ROOT,
  });
  const ms = Date.now() - t0;
  let headers = '', textBody = '';
  try { headers = readFileSync(hdrFile, 'utf8'); } catch (_) {}
  try { textBody = readFileSync(bodyFile, 'utf8'); } catch (_) {}
  try { unlinkSync(bodyFile); } catch (_) {}
  try { unlinkSync(hdrFile); } catch (_) {}
  const stdoutCode = (r.stdout || '').trim().split('\n').filter(Boolean).pop() || '';
  let httpStatus = Number(stdoutCode);
  if (!httpStatus) {
    const m = headers.match(/HTTP\/[\d.]+ (\d+)/);
    httpStatus = m ? Number(m[1]) : null;
  }
  const contentType = (headers.match(/content-type:\s*([^\r\n]+)/i) || [])[1] || null;
  let json = null;
  try { json = JSON.parse(textBody); } catch (_) {}
  return { ms, httpStatus, contentType, json, text: textBody, headers, exit: r.status };
}

function leaks(t) { return (String(t || '').match(FORBIDDEN_RE) || []).length; }
function entityLeak(t) { return (String(t || '').match(ENTITY_LEAK_RE) || []).length; }
function snap(resp) {
  const j = resp?.json;
  if (!j) return null;
  if (j.snapshot) return j.snapshot;
  if (j.findings || j.sessionId) return j;
  return j;
}
function bans(obj, text) {
  const t = String(text || JSON.stringify(obj || {}));
  const out = [];
  if (/\b"dossier"\s*:/.test(t) && obj?.dossier) out.push('dossier');
  if (Array.isArray(obj?.faces) && obj.faces.length) out.push('faces');
  const s = obj?.snapshot || obj;
  if (s?.dossier) out.push('snapshot.dossier');
  if (Array.isArray(s?.faces) && s.faces.length) out.push('snapshot.faces');
  return [...new Set(out)];
}
function save(name, content) {
  const p = join(RAW_ADV, name);
  writeFileSync(p, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  return `MEGA/raw/adversarial/${name}`;
}
function parseSSE(text) {
  const events = [];
  for (const block of String(text || '').split(/\n\n+/)) {
    const lines = block.split(/\n/);
    let id = null, event = null;
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith('id:')) id = line.slice(3).trim();
      else if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length || event || id) {
      let parsed = null;
      try { parsed = JSON.parse(dataLines.join('\n')); } catch (_) {}
      events.push({ id, event: event || parsed?.type || null, data: parsed });
    }
  }
  return events;
}

const checkedAt = nowJerusalem();
console.log(`[adv-expand] ${checkedAt} dpl=${DISC_DPL}`);
const results = [];

function push(id, name, status, evidence, detail, notes = '') {
  results.push({ id, name, status, evidence, detail, notes, runnow: true });
  console.log(`[${id}] ${status} ${detail}`);
}

// ADV-L5: empty seed — expect soft fail / 4xx, no leak, no dossier
{
  const post = vercelCurl('/api/discovery/sessions', { method: 'POST', body: { seed: '' } });
  const s = snap(post);
  const el = entityLeak(post.text);
  const b = bans(post.json, post.text);
  const softFail = post.httpStatus >= 400 || post.json?.ok === false || !s?.sessionId;
  const ok = softFail && el === 0 && b.length === 0 && leaks(post.text) === 0;
  save('ADV-L5-empty-seed.json', {
    httpStatus: post.httpStatus, ms: post.ms,
    summary: { softFail, sessionId: s?.sessionId || post.json?.sessionId || null, entityLeak: el, bans: b, error: post.json?.error || post.json?.message || null },
  });
  push('ADV-L5', 'empty-seed-soft-fail', ok ? 'PASS' : 'FAIL',
    'MEGA/raw/adversarial/ADV-L5-empty-seed.json',
    `http=${post.httpStatus} softFail=${softFail} entityLeak=${el}`);
}

// ADV-L6: whitespace-only seed
{
  const post = vercelCurl('/api/discovery/sessions', { method: 'POST', body: { seed: '   \t  ' } });
  const s = snap(post);
  const el = entityLeak(post.text);
  const softFail = post.httpStatus >= 400 || post.json?.ok === false || !s?.sessionId;
  const ok = softFail && el === 0;
  save('ADV-L6-whitespace-seed.json', {
    httpStatus: post.httpStatus, ms: post.ms,
    summary: { softFail, sessionId: s?.sessionId || null, entityLeak: el, bans: bans(post.json, post.text) },
  });
  push('ADV-L6', 'whitespace-seed-soft-fail', ok ? 'PASS' : 'FAIL',
    'MEGA/raw/adversarial/ADV-L6-whitespace-seed.json',
    `http=${post.httpStatus} softFail=${softFail} entityLeak=${el}`);
}

// ADV-L7: ambiguous HE bare כהן on Discovery
{
  const post = vercelCurl('/api/discovery/sessions', { method: 'POST', body: { seed: 'כהן' } });
  const s = snap(post);
  const el = entityLeak(post.text);
  const b = bans(post.json, post.text);
  const ok = (post.httpStatus === 200 || post.httpStatus === 201) && el === 0 && b.length === 0 && !s?.dossier;
  save('ADV-L7-bare-cohen-he.json', {
    httpStatus: post.httpStatus, ms: post.ms,
    summary: {
      sessionId: s?.sessionId || post.json?.sessionId,
      findings: (s?.findings || []).length,
      status: s?.status,
      store: s?.store?.backend || post.json?.store?.backend,
      forbiddenIdentitiesVersion: s?.forbiddenIdentitiesVersion,
      entityLeak: el, bans: b,
    },
  });
  push('ADV-L7', 'bare-cohen-he-discovery', ok ? 'PASS' : 'FAIL',
    'MEGA/raw/adversarial/ADV-L7-bare-cohen-he.json',
    `http=${post.httpStatus} findings=${(s?.findings||[]).length} entityLeak=${el} bans=${b.join(',')||'none'}`);
}

// ADV-L8: John Smith bare Discovery (pretty-wrong adjacent)
{
  const post = vercelCurl('/api/discovery/sessions', { method: 'POST', body: { seed: 'John Smith' } });
  const s = snap(post);
  const el = entityLeak(post.text);
  const b = bans(post.json, post.text);
  const rawTok = leaks(post.text);
  const ok = (post.httpStatus === 200 || post.httpStatus === 201) && el === 0 && b.length === 0;
  save('ADV-L8-john-smith-bare.json', {
    httpStatus: post.httpStatus, ms: post.ms,
    summary: {
      sessionId: s?.sessionId || post.json?.sessionId,
      findings: (s?.findings || []).length,
      status: s?.status,
      entityLeak: el, rawForbiddenTokens: rawTok, bans: b,
      forbiddenIdentitiesVersion: s?.forbiddenIdentitiesVersion,
    },
  });
  push('ADV-L8', 'john-smith-bare-discovery', ok ? 'PASS' : 'FAIL',
    'MEGA/raw/adversarial/ADV-L8-john-smith-bare.json',
    `http=${post.httpStatus} findings=${(s?.findings||[]).length} entityLeak=${el} bans=${b.join(',')||'none'}`);
}

// ADV-L9: double GET regen consistency (same sessionId)
{
  const post = vercelCurl('/api/discovery/sessions', { method: 'POST', body: { seed: 'Alex Morgan' } });
  const s0 = snap(post);
  const sid = s0?.sessionId || post.json?.sessionId;
  let ok = false;
  let detail = 'no sessionId';
  if (sid) {
    const g1 = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sid)}`);
    const g2 = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sid)}`);
    const s1 = snap(g1);
    const s2 = snap(g2);
    const f1 = (s1?.findings || []).length;
    const f2 = (s2?.findings || []).length;
    const el = entityLeak(g1.text) + entityLeak(g2.text);
    const regen = [g1.json?.regenerated ?? s1?.regenerated, g2.json?.regenerated ?? s2?.regenerated];
    ok = g1.httpStatus === 200 && g2.httpStatus === 200 && f1 === f2 && el === 0;
    detail = `sidOk findings=${f1}/${f2} regen=${regen.join(',')} entityLeak=${el}`;
    save('ADV-L9-double-get-regen.json', {
      sessionIdPrefix: String(sid).slice(0, 24),
      g1: { httpStatus: g1.httpStatus, findings: f1, regenerated: regen[0], ms: g1.ms },
      g2: { httpStatus: g2.httpStatus, findings: f2, regenerated: regen[1], ms: g2.ms },
      entityLeak: el,
      store: s1?.store?.backend || g1.json?.store?.backend,
    });
  } else {
    save('ADV-L9-double-get-regen.json', { httpStatus: post.httpStatus, error: 'no sessionId' });
  }
  push('ADV-L9', 'double-get-regen-consistency', ok ? 'PASS' : 'FAIL',
    'MEGA/raw/adversarial/ADV-L9-double-get-regen.json', detail);
}

// ADV-L10: SSE replay / second subscribe (same session) — soft replay check
{
  const post = vercelCurl('/api/discovery/sessions', { method: 'POST', body: { seed: 'example.org' } });
  const s0 = snap(post);
  const sid = s0?.sessionId || post.json?.sessionId;
  let ok = false;
  let detail = 'no sessionId';
  if (sid) {
    const sse1 = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sid)}/events`, {
      accept: 'text/event-stream', timeout: 120000,
    });
    const sse2 = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sid)}/events`, {
      accept: 'text/event-stream', timeout: 120000,
    });
    const e1 = parseSSE(sse1.text);
    const e2 = parseSSE(sse2.text);
    const ctOk = String(sse1.contentType || '').includes('text/event-stream')
      && String(sse2.contentType || '').includes('text/event-stream');
    const el = entityLeak(sse1.text) + entityLeak(sse2.text);
    const types1 = [...new Set(e1.map((e) => e.event).filter(Boolean))];
    const types2 = [...new Set(e2.map((e) => e.event).filter(Boolean))];
    ok = ctOk && e1.length >= 1 && e2.length >= 1 && el === 0;
    detail = `ctOk=${ctOk} ev=${e1.length}/${e2.length} types2=${types2.slice(0,5).join(',')} entityLeak=${el}`;
    save('ADV-L10-sse-second-subscribe.txt', `===SSE1===\n${sse1.text.slice(0, 50000)}\n===SSE2===\n${sse2.text.slice(0, 50000)}`);
    save('ADV-L10-sse-second-subscribe.meta.json', {
      sse1: { httpStatus: sse1.httpStatus, contentType: sse1.contentType, events: e1.length, types: types1, ms: sse1.ms },
      sse2: { httpStatus: sse2.httpStatus, contentType: sse2.contentType, events: e2.length, types: types2, ms: sse2.ms },
      entityLeak: el,
      note: 'Second subscribe on fs-regen — full Last-Event-ID durable replay remains BLOCKED_KV',
    });
  } else {
    save('ADV-L10-sse-second-subscribe.meta.json', { error: 'no sessionId' });
  }
  push('ADV-L10', 'sse-second-subscribe-replay-soft', ok ? 'PASS' : 'FAIL',
    'MEGA/raw/adversarial/ADV-L10-sse-second-subscribe.meta.json', detail,
    'Soft replay only · durable Last-Event-ID across instances = BLOCKED_KV');
}

// ADV-L11: narrow with poison filter value containing forbidden QID
{
  const post = vercelCurl('/api/discovery/sessions', { method: 'POST', body: { seed: 'דוד כהן' } });
  const s0 = snap(post);
  const sid = s0?.sessionId || post.json?.sessionId;
  let ok = false;
  let detail = 'no sessionId';
  if (sid) {
    const narrow = vercelCurl(`/api/discovery/sessions/${encodeURIComponent(sid)}/narrow`, {
      method: 'POST',
      body: { filter: { provider: ['wikidata'], qid: ['Q1701775'] } },
    });
    const sn = snap(narrow);
    const el = entityLeak(narrow.text);
    const b = bans(narrow.json, narrow.text);
    // Accept 200 with scrubbed body OR 4xx rejection — must not emit entity commit
    const httpOk = narrow.httpStatus === 200 || (narrow.httpStatus >= 400 && narrow.httpStatus < 500);
    ok = httpOk && el === 0 && b.length === 0;
    detail = `http=${narrow.httpStatus} findings=${(sn?.findings||[]).length} entityLeak=${el} bans=${b.join(',')||'none'}`;
    save('ADV-L11-narrow-qid-inject.json', {
      httpStatus: narrow.httpStatus, ms: narrow.ms,
      summary: {
        findings: (sn?.findings || []).length,
        entityLeak: el,
        bans: b,
        forbiddenIdentitiesVersion: sn?.forbiddenIdentitiesVersion,
        // do not dump full body with seed noise
      },
    });
  } else {
    save('ADV-L11-narrow-qid-inject.json', { error: 'no sessionId' });
  }
  push('ADV-L11', 'narrow-forbidden-qid-filter-inject', ok ? 'PASS' : 'FAIL',
    'MEGA/raw/adversarial/ADV-L11-narrow-qid-inject.json', detail);
}

// ADV-L12: collision EN "David Cohen" vs HE path (soft — no merge force)
{
  const post = vercelCurl('/api/discovery/sessions', { method: 'POST', body: { seed: 'David Cohen' } });
  const s = snap(post);
  const el = entityLeak(post.text);
  const b = bans(post.json, post.text);
  const ok = (post.httpStatus === 200 || post.httpStatus === 201) && el === 0 && b.length === 0;
  save('ADV-L12-david-cohen-en.json', {
    httpStatus: post.httpStatus, ms: post.ms,
    summary: {
      sessionId: s?.sessionId || post.json?.sessionId,
      findings: (s?.findings || []).length,
      status: s?.status,
      entityLeak: el, bans: b,
      forbiddenIdentitiesVersion: s?.forbiddenIdentitiesVersion,
      store: s?.store?.backend || post.json?.store?.backend,
    },
  });
  push('ADV-L12', 'david-cohen-en-collision-soft', ok ? 'PASS' : 'FAIL',
    'MEGA/raw/adversarial/ADV-L12-david-cohen-en.json',
    `http=${post.httpStatus} findings=${(s?.findings||[]).length} entityLeak=${el}`);
}

const counts = { PASS: 0, FAIL: 0 };
for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;

const out = {
  role: 'בודק',
  suite: 'MEGA-adversarial-expand-L5-L12',
  checkedAt,
  deployment: DISC_DPL,
  promote: 'HOLD',
  counts,
  results,
};
writeFileSync(join(RAW_ADV, 'ADV-EXPAND-L5-L12-SUMMARY.json'), JSON.stringify(out, null, 2));
writeFileSync(join(MEGA, 'adversarial', 'ADV-EXPAND-LIVE-INDEX.json'), JSON.stringify(out, null, 2));

// update adversarial index.json
const idxPath = join(MEGA, 'adversarial', 'index.json');
let idx = {};
try { idx = JSON.parse(readFileSync(idxPath, 'utf8')); } catch (_) {}
idx.updated = checkedAt;
idx.expandLive = results;
idx.fixtures = [
  'ADV-01-same-name-different-person.json',
  'ADV-02-ambiguous-he-en.json',
  'ADV-03-entity-collision.json',
  'ADV-04-pretty-wrong-guards.json',
  'ADV-05-forbidden-qid-inject.json',
  'ADV-06-org-seed.json',
  'ADV-07-kv-rehydrate-poison.json',
];
idx.status = 'fixtures + live RUNNOW L1–L12 · KV paths DEFERRED/BLOCKED_KV';
writeFileSync(idxPath, JSON.stringify(idx, null, 2));

console.log(`\n[adv-expand] PASS=${counts.PASS} FAIL=${counts.FAIL}`);
process.exit(counts.FAIL > 0 ? 1 : 0);
