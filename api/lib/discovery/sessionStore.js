/**
 * Durable Discovery session store for Vercel serverless Preview.
 *
 * Backend selection (no new secrets required):
 * 1. Vercel KV / Upstash Redis — if KV_REST_API_* or UPSTASH_REDIS_REST_* env present
 * 2. Else: filesystem under /tmp + regenerate-from-seed durable session ids
 *
 * Preview limitation (fs-regen): /tmp is per-instance and ephemeral. Cross-instance
 * GET works because sessionId encodes seed/hints and GET regenerates + Acc-scrubs
 * when the local file miss occurs. Acc/QA can verify: POST then GET on Preview.
 */
import { createHash, randomBytes } from 'crypto';
import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  /* Node <17 */
}
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const FS_DIR = path.join(os.tmpdir(), 'akvot-discovery-sessions');
const TTL_MS = 60 * 60 * 1000; // 1h session TTL
const KEY_PREFIX = 'disc:sess:';

/** B17 — closed outcome / failureClass vocabulary (no secrets). */
export const STORE_OUTCOMES = Object.freeze([
  'success',
  'miss',
  'timeout',
  'unavailable',
  'connection_failure',
  'http_failure',
  'serdeser_failure',
  'malformed',
  'ttl_expiry',
  'fallback',
  'recovery',
  'retry',
  'concurrent',
  'unexpected_exception',
]);

/** B17 mandate failureClass vocabulary (always emitted on failure; no secrets). */
export const FAILURE_CLASSES = Object.freeze([
  'fetch_failed', // network
  'auth',
  'timeout',
  'parse',
  'not_found',
  'conflict',
  'unknown',
]);

/**
 * Map rich outcome / error → mandate failureClass.
 * @param {unknown} outcomeOrErr
 * @param {{ miss?: boolean, concurrent?: boolean, malformed?: boolean, httpStatus?: number }} [hint]
 */
export function toMandateFailureClass(outcomeOrErr, hint = {}) {
  if (hint.miss || outcomeOrErr === 'miss' || outcomeOrErr === 'not_found') return 'not_found';
  if (hint.concurrent || outcomeOrErr === 'concurrent' || outcomeOrErr === 'conflict') return 'conflict';
  if (
    hint.malformed ||
    outcomeOrErr === 'malformed' ||
    outcomeOrErr === 'serdeser_failure' ||
    outcomeOrErr === 'parse'
  ) {
    return 'parse';
  }
  if (outcomeOrErr === 'timeout') return 'timeout';
  if (
    outcomeOrErr === 'connection_failure' ||
    outcomeOrErr === 'fetch_failed' ||
    outcomeOrErr === 'network'
  ) {
    return 'fetch_failed';
  }
  if (outcomeOrErr === 'auth') return 'auth';
  const status = hint.httpStatus || outcomeOrErr?.httpStatus;
  if (status === 401 || status === 403) return 'auth';
  const msg = String(outcomeOrErr?.message || outcomeOrErr || '').toLowerCase();
  const name = String(outcomeOrErr?.name || '');
  if (name === 'AbortError' || name === 'TimeoutError' || /timeout|aborted|abort/.test(msg)) return 'timeout';
  if (/http\s*401|http\s*403|unauthorized|forbidden|auth/.test(msg)) return 'auth';
  if (/econnrefused|econnreset|enotfound|und_err|fetch failed|network|socket/.test(msg)) return 'fetch_failed';
  if (/json|parse|serdes|serializ|deserializ|malformed|corrupt/.test(msg)) return 'parse';
  if (/version conflict|\b409\b|concurrent/.test(msg)) return 'conflict';
  if (/not[_ ]found|miss|enoent/.test(msg)) return 'not_found';
  if (msg || outcomeOrErr) return 'unknown';
  return 'unknown';
}

/** @type {{ ok: boolean|null, at: number|null, failureClass?: string }} */
let lastKvProbe = { ok: null, at: null };

/** B18 — record KV reachability (success or failure). Never logs secrets. */
export function recordKvProbe(ok, failureClass) {
  lastKvProbe = {
    ok: ok === true,
    at: Date.now(),
    ...(ok === true ? {} : { failureClass: failureClass ? String(failureClass).slice(0, 40) : 'unknown' }),
  };
  return { ...lastKvProbe };
}

export function getKvProbeState() {
  return { ...lastKvProbe };
}

/** Test helper — reset probe between cases */
export function resetKvProbeForTests() {
  lastKvProbe = { ok: null, at: null };
  resolvedBackend = null;
}

/**
 * Scrubbed session reference for logs (never full id / seed payload).
 * @param {string} [sessionId]
 */
export function scrubSessionRef(sessionId) {
  const id = String(sessionId || '');
  if (!id) return undefined;
  const kind = id.startsWith('kv1.') ? 'kv1' : id.startsWith('ds1.') ? 'ds1' : 'other';
  const prefix = id.slice(0, 12);
  return `${kind}:${prefix}`;
}

/**
 * Classify store failure from error/message (no secrets).
 * @param {unknown} err
 * @param {{ miss?: boolean, expired?: boolean, fallback?: boolean, recovery?: boolean, concurrent?: boolean, malformed?: boolean }} [hint]
 */
export function classifyStoreFailure(err, hint = {}) {
  if (hint.miss) return 'miss';
  if (hint.expired) return 'ttl_expiry';
  if (hint.fallback) return 'fallback';
  if (hint.recovery) return 'recovery';
  if (hint.concurrent) return 'concurrent';
  if (hint.malformed) return 'malformed';
  if (err == null && !hint.miss) return undefined;
  const msg = String(err?.message || err || '').toLowerCase();
  const name = String(err?.name || '');
  if (name === 'AbortError' || name === 'TimeoutError' || /timeout|aborted|abort/.test(msg)) return 'timeout';
  if (/econnrefused|econnreset|enotfound|und_err|fetch failed|network|socket/.test(msg)) return 'connection_failure';
  if (/http\s*[45]\d\d|status\s*[45]\d\d/.test(msg)) return 'http_failure';
  if (/json|parse|serdes|serializ|deserializ/.test(msg)) return 'serdeser_failure';
  if (/malformed|invalid json|corrupt/.test(msg)) return 'malformed';
  if (/unavailable|creds missing|kv url not https|503/.test(msg)) return 'unavailable';
  if (/version conflict|409|concurrent/.test(msg)) return 'concurrent';
  if (msg) return 'unexpected_exception';
  return undefined;
}

/**
 * Durability truth for telemetry — never claim durable when backend is fallback.
 * @param {string} [backend]
 */
export function durabilityStateFor(backend) {
  const b = backend || detectStoreBackend();
  if (b !== 'vercel-kv' && b !== 'upstash') return 'fallback-fs-regen';
  if (lastKvProbe.ok === true) return 'durable-kv';
  if (lastKvProbe.ok === false) return 'durable-degraded';
  return 'durable-pending-probe';
}


/** @type {'vercel-kv'|'upstash'|'fs-regen'|null} */
let resolvedBackend = null;

function b64urlEncode(bufOrStr) {
  const b = Buffer.isBuffer(bufOrStr) ? bufOrStr : Buffer.from(String(bufOrStr), 'utf8');
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64urlDecode(s) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = String(s).replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(b64, 'base64').toString('utf8');
}

export function detectStoreBackend() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) return 'vercel-kv';
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) return 'upstash';
  return 'fs-regen';
}

export function getStoreInfo() {
  const backend = detectStoreBackend();
  const kvBackend = backend === 'vercel-kv' || backend === 'upstash';
  const fallback = backend === 'fs-regen';
  // B18: never emit durable/promoteEligible unless KV backend AND last-known-good probe
  const probeOk = lastKvProbe.ok === true;
  const probeFailed = lastKvProbe.ok === false;
  const durable = kvBackend && probeOk;
  const promoteEligible = durable === true;
  const explicitFallback = fallback || (kvBackend && probeFailed);
  const durabilityState = durabilityStateFor(backend);
  return {
    backend,
    storeBackend: backend, // explicit telemetry alias (never silent)
    durable,
    fallback,
    explicitFallback,
    fsRegenFallback: fallback, // alias for health/API contract — only true for fs-regen backend
    promoteEligible,
    crossInstance: durable ? 'shared-kv' : fallback ? 'regenerate-from-seed' : 'kv-degraded',
    durabilityState,
    kvReachable: lastKvProbe.ok,
    kvProbeAt: lastKvProbe.at,
    note: fallback
      ? 'FALLBACK-ONLY: No KV/UPSTASH env — /tmp + seed-encoded sessionId. NOT durable across instances; NOT promote-eligible. Cross-instance GET regenerates from seed.'
      : probeFailed
        ? 'KV backend selected but last probe FAILED — durable=false, promoteEligible=false (B18).'
        : probeOk
          ? 'Using Redis/KV REST for shared session persistence (promote-eligible when health GREEN).'
          : 'KV creds present but reachability not yet confirmed by probe — durable=false until successful probe (B18).',
    fsDir: fallback ? FS_DIR : undefined,
    ttlMs: TTL_MS,
    kvCredsPresent: Boolean(
      (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
        (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    ),
  };
}

/**
 * Structured store op telemetry (no secrets).
 * @param {string} op
 * @param {{ backend?: string, latencyMs?: number, ok?: boolean, error?: string, correlationId?: string, sessionIdPrefix?: string }} fields
 */
export function logStoreOp(op, fields = {}) {
  const backend = fields.backendType || fields.backend || detectStoreBackend();
  const durableBackend = backend === 'vercel-kv' || backend === 'upstash';
  const outcome =
    fields.outcome ||
    (fields.ok === false
      ? classifyStoreFailure(fields.error || fields.failureClass, {
          miss: fields.miss,
          expired: fields.expired,
          fallback: fields.fallback || backend === 'fs-regen',
          recovery: fields.recovery,
          concurrent: fields.concurrent,
          malformed: fields.malformed,
        }) || 'unexpected_exception'
      : fields.miss
        ? 'miss'
        : fields.expired
          ? 'ttl_expiry'
          : fields.fallback && !durableBackend
            ? 'fallback'
            : 'success');
  const richFailure =
    outcome === 'success'
      ? undefined
      : fields.failureClass ||
        classifyStoreFailure(fields.error, {
          miss: outcome === 'miss' || fields.miss,
          expired: outcome === 'ttl_expiry' || fields.expired,
          fallback: outcome === 'fallback' || fields.fallback,
          recovery: outcome === 'recovery' || fields.recovery,
          concurrent: outcome === 'concurrent' || fields.concurrent,
          malformed: outcome === 'malformed' || fields.malformed,
        }) ||
        outcome;
  // B17: always emit mandate failureClass on non-success
  const failureClass =
    outcome === 'success'
      ? undefined
      : toMandateFailureClass(richFailure || fields.error, {
          miss: outcome === 'miss' || fields.miss,
          concurrent: outcome === 'concurrent' || fields.concurrent,
          malformed: outcome === 'malformed' || fields.malformed,
          httpStatus: fields.httpStatus,
        });
  const durabilityState =
    fields.durabilityState ||
    (durableBackend && lastKvProbe.ok === true && outcome === 'success'
      ? 'durable-kv'
      : durableBackend
        ? 'durable-degraded'
        : 'fallback-fs-regen');
  // B18: never advertise promoteEligible unless KV backend + success + last-known-good probe
  const probeOk = lastKvProbe.ok === true;
  const promoteEligible =
    fields.promoteEligible != null
      ? fields.promoteEligible === true && durableBackend && outcome === 'success' && probeOk
      : durableBackend && outcome === 'success' && probeOk;

  const payload = {
    operation: String(op || 'unknown').slice(0, 40),
    op: String(op || 'unknown').slice(0, 40), // alias
    backend, // mandate field
    correlationId: fields.correlationId ? String(fields.correlationId).slice(0, 64) : undefined,
    scrubbedSessionRef:
      fields.scrubbedSessionRef ||
      scrubSessionRef(fields.sessionId || fields.sessionIdPrefix) ||
      undefined,
    sessionIdPrefix: fields.sessionIdPrefix
      ? String(fields.sessionIdPrefix).slice(0, 12)
      : undefined,
    duration: typeof fields.duration === 'number' ? fields.duration : fields.latencyMs,
    latencyMs: typeof fields.latencyMs === 'number' ? fields.latencyMs : fields.duration,
    outcome,
    failureClass,
    retryCount: typeof fields.retryCount === 'number' ? fields.retryCount : 0,
    backendType: backend,
    storeBackend: backend,
    durabilityState,
    ok: outcome === 'success',
    promoteEligible,
    explicitFallback: backend === 'fs-regen' || durabilityState === 'fallback-fs-regen',
    ...(fields.error ? { error: String(fields.error).slice(0, 160) } : {}),
  };
  for (const k of Object.keys(payload)) {
    if (payload[k] === undefined) delete payload[k];
  }
  // Defense: never log token-like strings
  const serialized = JSON.stringify(payload);
  if (/Bearer\s|eyJ[A-Za-z0-9_-]{20,}|UPSTASH_REDIS_REST_TOKEN|KV_REST_API_TOKEN/i.test(serialized)) {
    console.warn('[discovery.store.telemetry]', {
      operation: payload.operation,
      outcome: 'unexpected_exception',
      failureClass: 'unexpected_exception',
      error: 'telemetry_scrub_triggered',
      ok: false,
      promoteEligible: false,
    });
    return { operation: payload.operation, outcome: 'unexpected_exception', ok: false, promoteEligible: false };
  }
  if (payload.ok === false) console.warn('[discovery.store.telemetry]', payload);
  else console.info('[discovery.store.telemetry]', payload);
  return payload;
}

export function mintSessionId(meta) {
  const backend = detectStoreBackend();
  const nonce = randomBytes(6).toString('hex');
  const createdAt = new Date().toISOString();
  if (backend === 'fs-regen') {
    const payload = {
      v: 1,
      s: String(meta.seed || '').slice(0, 500),
      h: meta.hints && typeof meta.hints === 'object' ? meta.hints : {},
      l: meta.locale || 'en',
      t: createdAt,
      n: nonce,
    };
    return `ds1.${b64urlEncode(JSON.stringify(payload))}`;
  }
  // KV backends: opaque id; seed lives in stored value
  const raw = createHash('sha256').update(`${meta.seed}|${nonce}|${createdAt}`).digest('hex').slice(0, 32);
  return `kv1.${raw}`;
}

/**
 * Decode seed metadata from a durable fs-regen session id.
 * @param {string} sessionId
 * @returns {{ seed: string, hints: object, locale: string, createdAt: string, nonce: string } | null}
 */
export function decodeSessionId(sessionId) {
  const id = String(sessionId || '');
  if (!id.startsWith('ds1.')) return null;
  try {
    const json = b64urlDecode(id.slice(4));
    const p = JSON.parse(json);
    if (!p?.s) return null;
    return {
      seed: String(p.s),
      hints: p.h && typeof p.h === 'object' ? p.h : {},
      locale: p.l || 'en',
      createdAt: p.t || new Date().toISOString(),
      nonce: p.n || '',
    };
  } catch {
    return null;
  }
}

async function ensureFsDir() {
  await fs.mkdir(FS_DIR, { recursive: true });
}

function fsPathFor(sessionId) {
  const safe = createHash('sha256').update(String(sessionId)).digest('hex');
  return path.join(FS_DIR, `${safe}.json`);
}

function normalizeKvCreds() {
  const backend = detectStoreBackend();
  const rawUrl =
    backend === 'vercel-kv' ? process.env.KV_REST_API_URL : process.env.UPSTASH_REDIS_REST_URL;
  const rawToken =
    backend === 'vercel-kv' ? process.env.KV_REST_API_TOKEN : process.env.UPSTASH_REDIS_REST_TOKEN;
  const url = String(rawUrl || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/\/$/, '');
  const token = String(rawToken || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '');
  return { url, token };
}

function formatKvError(op, err) {
  const cause = err?.cause;
  const parts = [`kv ${op} failed`, err?.message || String(err)];
  if (cause?.code) parts.push(String(cause.code));
  if (err?.name === 'AbortError' || err?.name === 'TimeoutError') parts.push('timeout');
  return parts.join(' ').slice(0, 160);
}

/**
 * Upstash / Vercel KV REST: body-style POST of a Redis command array.
 * Path-style /get|/set is a fallback only. Never logs URL or token.
 */
async function redisCommand(command, { timeoutMs = 4000 } = {}) {
  const { url, token } = normalizeKvCreds();
  if (!url || !token) {
    const err = new Error('kv creds missing');
    err.failureClass = 'unavailable';
    err.retryCount = 0;
    throw err;
  }
  if (!/^https:\/\//i.test(url)) {
    const err = new Error('kv url not https');
    err.failureClass = 'unavailable';
    err.retryCount = 0;
    throw err;
  }
  let retryCount = 0;
  const run = async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
        signal: ctrl.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        const err = new Error(`http ${res.status}`);
        err.httpStatus = res.status;
        err.failureClass = res.status === 401 || res.status === 403 ? 'auth' : 'http_failure';
        throw err;
      }
      try {
        return JSON.parse(text);
      } catch {
        // non-JSON body treated as raw result (Upstash sometimes returns plain)
        return { result: text };
      }
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    const result = await run();
    if (result && typeof result === 'object') result.__retryCount = retryCount;
    recordKvProbe(true);
    return result;
  } catch (err) {
    const msg = String(err?.message || err);
    const retryable = /fetch failed|aborted|timeout|ECONNRESET|UND_ERR|http 5/i.test(msg);
    if (retryable) {
      retryCount = 1;
      logStoreOp(String(command[0] || 'redis').toLowerCase(), {
        outcome: 'retry',
        failureClass: 'fetch_failed',
        retryCount,
        backend: detectStoreBackend(),
        error: formatKvError(command[0], err),
        ok: false,
        promoteEligible: false,
      });
      try {
        const result = await run();
        if (result && typeof result === 'object') result.__retryCount = retryCount;
        recordKvProbe(true);
        return result;
      } catch (err2) {
        const wrapped = new Error(formatKvError(command[0], err2));
        wrapped.failureClass = err2.failureClass || classifyStoreFailure(err2) || 'unexpected_exception';
        wrapped.httpStatus = err2.httpStatus;
        wrapped.retryCount = retryCount;
        recordKvProbe(false, toMandateFailureClass(wrapped.failureClass || wrapped, { httpStatus: wrapped.httpStatus }));
        throw wrapped;
      }
    }
    const wrapped = new Error(formatKvError(command[0], err));
    wrapped.failureClass = err.failureClass || classifyStoreFailure(err) || 'unexpected_exception';
    wrapped.httpStatus = err.httpStatus;
    wrapped.retryCount = retryCount;
    recordKvProbe(false, toMandateFailureClass(wrapped.failureClass || wrapped, { httpStatus: wrapped.httpStatus }));
    throw wrapped;
  }
}

async function kvGet(sessionId) {
  const key = KEY_PREFIX + sessionId;
  const data = await redisCommand(['GET', key]);
  const retryCount = data?.__retryCount || 0;
  const raw = data?.result;
  if (raw == null) return { session: null, miss: true, retryCount };
  try {
    const session = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (session && typeof session === 'object' && session._expiresAt && Date.now() > session._expiresAt) {
      return { session: null, expired: true, retryCount };
    }
    return { session: session || null, miss: !session, retryCount };
  } catch (e) {
    const err = new Error('serdeser_failure');
    err.failureClass = 'serdeser_failure';
    err.retryCount = retryCount;
    throw err;
  }
}

async function kvSet(sessionId, session) {
  const key = KEY_PREFIX + sessionId;
  let body;
  try {
    body = JSON.stringify(session);
  } catch (e) {
    const err = new Error('serdeser_failure');
    err.failureClass = 'serdeser_failure';
    err.retryCount = 0;
    throw err;
  }
  const data = await redisCommand(['SET', key, body, 'EX', Math.floor(TTL_MS / 1000)]);
  return { retryCount: data?.__retryCount || 0 };
}

async function kvDelete(sessionId) {
  const key = KEY_PREFIX + sessionId;
  const data = await redisCommand(['DEL', key]);
  return { retryCount: data?.__retryCount || 0 };
}

async function fsGet(sessionId) {
  try {
    await ensureFsDir();
    const p = fsPathFor(sessionId);
    const raw = await fs.readFile(p, 'utf8');
    let obj;
    try {
      obj = JSON.parse(raw);
    } catch {
      return { session: null, malformed: true };
    }
    if (obj?._expiresAt && Date.now() > obj._expiresAt) {
      await fs.unlink(p).catch(() => {});
      return { session: null, expired: true };
    }
    return { session: obj?.session || null, miss: !obj?.session };
  } catch (e) {
    if (e?.code === 'ENOENT') return { session: null, miss: true };
    return { session: null, miss: true };
  }
}

async function fsSet(sessionId, session) {
  await ensureFsDir();
  const p = fsPathFor(sessionId);
  const payload = {
    _expiresAt: Date.now() + TTL_MS,
    _savedAt: new Date().toISOString(),
    session,
  };
  await fs.writeFile(p, JSON.stringify(payload), 'utf8');
}

/**
 * Delete session from active backend (+ memory). No secrets in logs.
 * @param {string} sessionId
 * @param {{ correlationId?: string }} [opts]
 */
async function fsDelete(sessionId) {
  try {
    const p = fsPathFor(sessionId);
    await fs.unlink(p);
  } catch (e) {
    if (e?.code !== 'ENOENT') throw e;
  }
}

/**
 * Health probe: WRITE → READ → UPDATE → DELETE.
 * Skips live Redis when KV/UPSTASH env absent (reports ok=true, mode=fs-regen-local).
 * Never logs tokens/URLs with credentials.
 * @param {{ correlationId?: string }} [opts]
 */
/**
 * Lightweight KV reachability probe (PING). Updates lastKvProbe. No secrets.
 * @returns {Promise<{ ok: boolean, failureClass?: string, latencyMs: number }>}
 */
export async function pingKvReachability() {
  const backend = detectStoreBackend();
  const started = Date.now();
  if (backend !== 'vercel-kv' && backend !== 'upstash') {
    return { ok: false, failureClass: 'not_found', latencyMs: 0, skipped: true };
  }
  try {
    await redisCommand(['PING']);
    recordKvProbe(true);
    return { ok: true, latencyMs: Date.now() - started };
  } catch (e) {
    const fc = toMandateFailureClass(e?.failureClass || e, { httpStatus: e?.httpStatus });
    recordKvProbe(false, fc);
    return { ok: false, failureClass: fc, latencyMs: Date.now() - started };
  }
}

export async function healthCheck(opts = {}) {
  const correlationId = opts.correlationId || `hc-${Date.now().toString(36)}`;
  const info = getStoreInfo();
  const probeId = `health-probe-${correlationId}`;
  const started = Date.now();
  /** @type {{ step: string, ok: boolean, ms?: number, error?: string }[]} */
  const steps = [];
  const mark = (step, ok, error) => {
    steps.push({
      step,
      ok,
      ms: Date.now() - started,
      ...(error ? { error: String(error).slice(0, 160) } : {}),
    });
  };

  try {
    const payload = {
      sessionId: probeId,
      _healthProbe: true,
      correlationId,
      createdAt: new Date().toISOString(),
      version: 1,
      status: 'health',
      findings: [],
      evidence: [],
    };

    // WRITE
    await sessionStore.set(probeId, payload);
    mark('WRITE', true);

    // READ
    const got = await sessionStore.get(probeId);
    if (!got || got.sessionId !== probeId || got.correlationId !== correlationId) {
      mark('READ', false, 'missing or mismatch');
      throw new Error('health READ mismatch');
    }
    mark('READ', true);

    // UPDATE
    got.version = 2;
    got.updatedAt = new Date().toISOString();
    await sessionStore.set(probeId, got);
    const got2 = await sessionStore.get(probeId);
    if (!got2 || got2.version !== 2) {
      mark('UPDATE', false, 'version not persisted');
      throw new Error('health UPDATE mismatch');
    }
    mark('UPDATE', true);

    // DELETE
    await sessionStore.delete(probeId);
    // clear memory so subsequent get does not hit warm cache
    memory.delete(probeId);
    const gone = await sessionStore.get(probeId);
    if (gone) {
      mark('DELETE', false, 'key still present');
      throw new Error('health DELETE failed');
    }
    mark('DELETE', true);

    const elapsedMs = Date.now() - started;
    // Re-read after probe — B18 flags follow last-known-good
    const after = getStoreInfo();
    logStoreOp('health', {
      backend: after.storeBackend,
      latencyMs: elapsedMs,
      ok: true,
      outcome: 'success',
      correlationId,
      durabilityState: after.durabilityState,
      promoteEligible: after.promoteEligible === true,
    });
    return {
      ok: true,
      backend: after.storeBackend,
      correlationId,
      storeBackend: after.storeBackend,
      durable: after.durable === true,
      fallback: after.fallback === true,
      explicitFallback: after.explicitFallback === true,
      fsRegenFallback: after.fsRegenFallback === true,
      promoteEligible: after.promoteEligible === true,
      kvCredsPresent: after.kvCredsPresent === true,
      durabilityState: after.durabilityState,
      kvReachable: after.kvReachable,
      mode: after.fallback ? 'fs-regen-local' : after.durable ? 'kv-shared' : 'kv-degraded',
      steps,
      elapsedMs,
      latencyMs: elapsedMs,
      ttlMs: TTL_MS,
    };
  } catch (e) {
    // best-effort cleanup
    try {
      await sessionStore.delete(probeId);
      memory.delete(probeId);
    } catch {
      /* ignore */
    }
    if (!steps.length || steps[steps.length - 1]?.ok) {
      mark('ERROR', false, e?.message || e);
    }
    const elapsedMs = Date.now() - started;
    const fc = toMandateFailureClass(e?.failureClass || e);
    if (info.storeBackend === 'vercel-kv' || info.storeBackend === 'upstash') {
      recordKvProbe(false, fc);
    }
    const after = getStoreInfo();
    logStoreOp('health', {
      backend: after.storeBackend,
      latencyMs: elapsedMs,
      ok: false,
      outcome: e?.failureClass || 'unexpected_exception',
      failureClass: fc,
      correlationId,
      error: e?.message || e,
      durabilityState: after.durabilityState,
      promoteEligible: false,
    });
    return {
      ok: false,
      backend: after.storeBackend,
      correlationId,
      storeBackend: after.storeBackend,
      // B18: never claim durable when health/probe failed
      durable: false,
      fallback: after.fallback === true,
      explicitFallback: true,
      fsRegenFallback: after.fsRegenFallback === true,
      promoteEligible: false,
      kvCredsPresent: after.kvCredsPresent === true,
      durabilityState: after.durabilityState || 'durable-degraded',
      kvReachable: false,
      failureClass: fc,
      mode: after.fallback ? 'fs-regen-local' : 'kv-degraded',
      steps,
      elapsedMs,
      latencyMs: elapsedMs,
      error: String(e?.message || e).slice(0, 200),
    };
  }
}

/** In-process Map for warm reuse + unit tests */
const memory = new Map();

/**
 * Async session store facade.
 */

/**
 * Ensure session has monotonic version + eventCursor for SSE/narrow concurrency.
 * @param {object} session
 * @param {{ bump?: boolean }} [opts]
 */
export function ensureSessionVersion(session, opts = {}) {
  if (!session || typeof session !== 'object') return session;
  if (typeof session.version !== 'number') session.version = 1;
  else if (opts.bump) session.version += 1;
  if (typeof session.eventCursor !== 'number') session.eventCursor = 0;
  session.updatedAt = new Date().toISOString();
  return session;
}

/**
 * Conditional write: reject if expectedVersion provided and stored version is newer.
 * @param {string} sessionId
 * @param {object} session
 * @param {{ expectedVersion?: number }} [opts]
 */
export async function conditionalSet(sessionId, session, opts = {}) {
  const expected = opts.expectedVersion;
  if (typeof expected === 'number') {
    const cur = await sessionStore.get(sessionId);
    if (cur && typeof cur.version === 'number' && cur.version > expected) {
      const err = new Error('version conflict');
      err.status = 409;
      err.currentVersion = cur.version;
      err.failureClass = 'concurrent';
      logStoreOp('conditionalSet', {
        outcome: 'concurrent',
        failureClass: 'concurrent',
        ok: false,
        sessionIdPrefix: sessionId,
        scrubbedSessionRef: scrubSessionRef(sessionId),
        correlationId: opts.correlationId,
        promoteEligible: false,
        durabilityState: durabilityStateFor(),
      });
      throw err;
    }
  }
  ensureSessionVersion(session, { bump: true });
  await sessionStore.set(sessionId, session, { telemetry: opts.telemetry, correlationId: opts.correlationId });
  return session;
}

export const sessionStore = {
  getBackend() {
    if (!resolvedBackend) resolvedBackend = detectStoreBackend();
    return resolvedBackend;
  },

  info() {
    return getStoreInfo();
  },

  /**
   * @param {string} sessionId
   * @returns {Promise<object|null>}
   */
  async get(sessionId, opts = {}) {
    if (!sessionId) return null;
    const started = Date.now();
    const cid = opts.correlationId ? String(opts.correlationId).slice(0, 64) : undefined;
    const backend = this.getBackend();
    if (memory.has(sessionId)) {
      const hit = memory.get(sessionId);
      if (opts.telemetry) {
        logStoreOp('get', {
          backend,
          latencyMs: Date.now() - started,
          ok: true,
          outcome: 'success',
          correlationId: cid,
          sessionIdPrefix: sessionId,
          scrubbedSessionRef: scrubSessionRef(sessionId),
          retryCount: 0,
          durabilityState: durabilityStateFor(backend),
        });
      }
      return hit;
    }
    let session = null;
    let errMsg = null;
    let failureClass = undefined;
    let outcome = 'success';
    let retryCount = 0;
    let expired = false;
    let malformed = false;
    if (backend === 'vercel-kv' || backend === 'upstash') {
      try {
        const got = await kvGet(sessionId);
        retryCount = got?.retryCount || 0;
        if (got?.expired) {
          expired = true;
          outcome = 'ttl_expiry';
          failureClass = 'ttl_expiry';
          session = null;
        } else if (got?.miss || got?.session == null) {
          outcome = 'miss';
          failureClass = 'miss';
          session = null;
        } else {
          session = got.session;
        }
      } catch (e) {
        errMsg = String(e?.message || e).slice(0, 160);
        failureClass = e?.failureClass || classifyStoreFailure(e) || 'unexpected_exception';
        retryCount = e?.retryCount || 0;
        outcome = failureClass;
        console.warn('[discovery.store] kv get failed', {
          storeBackend: backend,
          correlationId: cid,
          failureClass,
          error: errMsg,
        });
      }
    } else {
      const got = await fsGet(sessionId);
      if (got?.malformed) {
        malformed = true;
        outcome = 'malformed';
        failureClass = 'malformed';
        session = null;
      } else if (got?.expired) {
        expired = true;
        outcome = 'ttl_expiry';
        failureClass = 'ttl_expiry';
        session = null;
      } else if (got?.miss || got?.session == null) {
        outcome = 'miss';
        failureClass = 'miss';
        session = null;
      } else {
        session = got.session;
        // explicit fallback backend
        outcome = 'success';
      }
    }
    if (session) memory.set(sessionId, session);
    if (opts.telemetry || errMsg || outcome !== 'success') {
      logStoreOp('get', {
        backend,
        latencyMs: Date.now() - started,
        ok: outcome === 'success',
        outcome,
        failureClass: outcome === 'success' ? undefined : failureClass,
        correlationId: cid,
        sessionIdPrefix: sessionId,
        scrubbedSessionRef: scrubSessionRef(sessionId),
        error: errMsg || undefined,
        retryCount,
        miss: outcome === 'miss',
        expired,
        malformed,
        fallback: backend === 'fs-regen',
        durabilityState:
          backend === 'fs-regen'
            ? 'fallback-fs-regen'
            : outcome === 'success'
              ? 'durable-kv'
              : 'durable-degraded',
        promoteEligible: backend !== 'fs-regen' && outcome === 'success',
      });
    }
    return session || null;
  },

  async set(sessionId, session, opts = {}) {
    const started = Date.now();
    const cid = opts.correlationId ? String(opts.correlationId).slice(0, 64) : undefined;
    memory.set(sessionId, session);
    const backend = this.getBackend();
    let errMsg = null;
    let failureClass = undefined;
    let retryCount = 0;
    if (backend === 'vercel-kv' || backend === 'upstash') {
      try {
        const res = await kvSet(sessionId, session);
        retryCount = res?.retryCount || 0;
      } catch (e) {
        errMsg = String(e?.message || e).slice(0, 160);
        failureClass = e?.failureClass || classifyStoreFailure(e) || 'unexpected_exception';
        retryCount = e?.retryCount || 0;
        console.warn('[discovery.store] kv set failed', {
          storeBackend: backend,
          correlationId: cid,
          failureClass,
          error: errMsg,
        });
        // B18: Durable backend selected — do not pretend success via in-process memory only.
        memory.delete(sessionId);
        logStoreOp('set', {
          backend,
          latencyMs: Date.now() - started,
          ok: false,
          outcome: failureClass,
          failureClass,
          correlationId: cid,
          sessionIdPrefix: sessionId,
          scrubbedSessionRef: scrubSessionRef(sessionId),
          error: errMsg,
          retryCount,
          durabilityState: 'durable-degraded',
          promoteEligible: false,
        });
        const err = new Error(errMsg || 'kv set failed');
        err.status = 503;
        err.code = 'KV_SET_FAILED';
        err.failureClass = failureClass;
        err.retryCount = retryCount;
        throw err;
      }
    } else {
      try {
        await fsSet(sessionId, session);
      } catch (e) {
        errMsg = String(e?.message || e).slice(0, 160);
        failureClass = classifyStoreFailure(e) || 'unexpected_exception';
        console.warn('[discovery.store] fs set failed', {
          storeBackend: backend,
          correlationId: cid,
          failureClass,
          error: errMsg,
        });
      }
    }
    if (opts.telemetry || errMsg) {
      logStoreOp('set', {
        backend,
        latencyMs: Date.now() - started,
        ok: !errMsg,
        outcome: errMsg ? failureClass || 'unexpected_exception' : 'success',
        failureClass: errMsg ? failureClass : undefined,
        correlationId: cid,
        sessionIdPrefix: sessionId,
        scrubbedSessionRef: scrubSessionRef(sessionId),
        error: errMsg || undefined,
        retryCount,
        fallback: backend === 'fs-regen',
        durabilityState: durabilityStateFor(backend),
        promoteEligible: backend !== 'fs-regen' && !errMsg,
      });
    }
  },

  async delete(sessionId, opts = {}) {
    if (!sessionId) return;
    const started = Date.now();
    memory.delete(sessionId);
    const backend = this.getBackend();
    const cid = opts.correlationId ? String(opts.correlationId).slice(0, 64) : undefined;
    let retryCount = 0;
    try {
      if (backend === 'vercel-kv' || backend === 'upstash') {
        const res = await kvDelete(sessionId);
        retryCount = res?.retryCount || 0;
      } else {
        await fsDelete(sessionId);
      }
      if (opts.telemetry || cid) {
        logStoreOp('delete', {
          backend,
          latencyMs: Date.now() - started,
          ok: true,
          outcome: 'success',
          failureClass: undefined,
          correlationId: cid,
          sessionIdPrefix: sessionId,
          scrubbedSessionRef: scrubSessionRef(sessionId),
          retryCount,
          fallback: backend === 'fs-regen',
          durabilityState: durabilityStateFor(backend),
          promoteEligible: backend !== 'fs-regen',
        });
      }
    } catch (e) {
      const failureClass = e?.failureClass || classifyStoreFailure(e) || 'unexpected_exception';
      logStoreOp('delete', {
        backend,
        latencyMs: Date.now() - started,
        ok: false,
        outcome: failureClass,
        failureClass,
        correlationId: cid,
        sessionIdPrefix: sessionId,
        scrubbedSessionRef: scrubSessionRef(sessionId),
        error: String(e?.message || e).slice(0, 160),
        retryCount: e?.retryCount || 0,
        durabilityState: backend === 'fs-regen' ? 'fallback-fs-regen' : 'durable-degraded',
        promoteEligible: false,
      });
      console.warn('[discovery.store] delete failed', {
        storeBackend: backend,
        correlationId: cid,
        failureClass,
        error: String(e?.message || e).slice(0, 160),
      });
    }
  },

  /** Test helper */
  clearMemory() {
    memory.clear();
  },

  /** Sync peek for tests that inject a Map-compat store */
  _memoryHas(id) {
    return memory.has(id);
  },
};

/**
 * Map-compatible adapter used by orchestrator when opts.store is not provided.
 * get/set are sync wrappers around memory only; persist() flushes async.
 * For production routes we use async sessionStore directly.
 */
export function createMemoryMapAdapter() {
  return memory;
}

export default sessionStore;
