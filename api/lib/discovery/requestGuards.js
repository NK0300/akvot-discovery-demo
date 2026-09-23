/**
 * Discovery request guards — size caps + light in-memory rate limit.
 * Additive; Preview/demo scoped. No secrets. Does not touch Core /api/lookup.
 *
 * RATE LIMIT (Checkpoint F residual close):
 * - Backend: **in-memory only** (`RATE_LIMIT_BACKEND = 'memory'`).
 * - Upstash / Vercel KV is wired for **sessionStore**, NOT for Discovery rate limit.
 *   Do not invent a distributed RL path here unless a dedicated safe wire exists.
 * - Multi-instance Preview: counters do not share across isolates (honest residual).
 * - Suitable for demo / single-instance Preview; not a production distributed gate.
 */

export const MAX_SEED_CHARS = 500;
export const MAX_HINTS_JSON_CHARS = 4_000;
export const MAX_BODY_JSON_CHARS = 32_000;
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX = 40; // per key per window (Discovery create)
/** Honest: memory Map only — not Upstash, not cross-instance. */
export const RATE_LIMIT_BACKEND = 'memory';
/** Soft cap on tracked keys; oldest/expired pruned when exceeded. */
export const RATE_LIMIT_MAX_KEYS = 2_000;

/** @type {Map<string, { start: number, count: number }>} */
const rateMap = new Map();

/**
 * @param {unknown} body
 * @returns {{ ok: true, seed: string, hints: object, locale: string } | { ok: false, status: number, error: string }}
 */
export function validateDiscoveryCreateBody(body = {}) {
  let raw = body;
  if (typeof raw === 'string') {
    if (raw.length > MAX_BODY_JSON_CHARS) {
      return { ok: false, status: 413, error: 'request body too large' };
    }
    try {
      raw = JSON.parse(raw);
    } catch {
      return { ok: false, status: 400, error: 'invalid json body' };
    }
  }
  if (!raw || typeof raw !== 'object') {
    return { ok: false, status: 400, error: 'body required' };
  }
  try {
    const approx = JSON.stringify(raw).length;
    if (approx > MAX_BODY_JSON_CHARS) {
      return { ok: false, status: 413, error: 'request body too large' };
    }
  } catch {
    return { ok: false, status: 400, error: 'body not serializable' };
  }

  const seed = String(raw.seed ?? raw.q ?? '').trim();
  if (!seed) return { ok: false, status: 400, error: 'seed required' };
  if (seed.length > MAX_SEED_CHARS) {
    return { ok: false, status: 413, error: `seed exceeds ${MAX_SEED_CHARS} chars` };
  }

  const hints = raw.hints && typeof raw.hints === 'object' ? raw.hints : {};
  try {
    if (JSON.stringify(hints).length > MAX_HINTS_JSON_CHARS) {
      return { ok: false, status: 413, error: 'hints too large' };
    }
  } catch {
    return { ok: false, status: 400, error: 'hints not serializable' };
  }

  const locale = String(raw.locale || 'en').slice(0, 16);
  return { ok: true, seed, hints, locale, correlationId: raw.correlationId };
}

/**
 * Prune expired entries; if still over maxKeys, drop oldest by start time.
 * @param {number} now
 * @param {number} windowMs
 */
function pruneRateMap(now, windowMs) {
  for (const [rk, v] of rateMap) {
    if (now - v.start >= windowMs) rateMap.delete(rk);
  }
  if (rateMap.size <= RATE_LIMIT_MAX_KEYS) return;
  const ranked = [...rateMap.entries()].sort((a, b) => a[1].start - b[1].start);
  const drop = rateMap.size - RATE_LIMIT_MAX_KEYS;
  for (let i = 0; i < drop; i++) rateMap.delete(ranked[i][0]);
}

/**
 * @param {string} key — typically client IP or 'anon'
 * @param {{ max?: number, windowMs?: number }} [opts]
 * @returns {{ ok: true, backend: string, remaining?: number } | { ok: false, status: 429, error: string, retryAfterSec: number, backend: string }}
 */
export function checkDiscoveryRateLimit(key, opts = {}) {
  const max = typeof opts.max === 'number' ? opts.max : RATE_LIMIT_MAX;
  const windowMs = typeof opts.windowMs === 'number' ? opts.windowMs : RATE_LIMIT_WINDOW_MS;
  const now = Date.now();
  const k = String(key || 'anon').slice(0, 128) || 'anon';
  let entry = rateMap.get(k);
  if (!entry || now - entry.start >= windowMs) {
    entry = { start: now, count: 0 };
    rateMap.set(k, entry);
  }
  entry.count += 1;
  // Prune opportunistically: every trip over soft size, or when map grows large
  if (rateMap.size > 500 || rateMap.size > RATE_LIMIT_MAX_KEYS) {
    pruneRateMap(now, windowMs);
  }
  if (entry.count > max) {
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - entry.start)) / 1000));
    return {
      ok: false,
      status: 429,
      error: 'rate limit exceeded',
      retryAfterSec,
      backend: RATE_LIMIT_BACKEND,
    };
  }
  return {
    ok: true,
    backend: RATE_LIMIT_BACKEND,
    remaining: Math.max(0, max - entry.count),
  };
}

/** Test helper */
export function resetDiscoveryRateLimit() {
  rateMap.clear();
}

/**
 * Introspection for docs/tests — never secrets.
 * @returns {{ backend: string, keys: number, windowMs: number, max: number, distributed: false, upstashWiredForRateLimit: false }}
 */
export function getDiscoveryRateLimitInfo() {
  return {
    backend: RATE_LIMIT_BACKEND,
    keys: rateMap.size,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    maxKeys: RATE_LIMIT_MAX_KEYS,
    distributed: false,
    /** sessionStore may use Upstash; Discovery RL does not. */
    upstashWiredForRateLimit: false,
  };
}

/**
 * Best-effort client key from req (no PII beyond IP prefix).
 * Prefer platform-set headers over spoofable leftmost XFF hop.
 * @param {import('http').IncomingMessage} [req]
 */
export function clientKeyFromReq(req) {
  const h = req?.headers || {};
  const realIp = typeof h['x-real-ip'] === 'string' ? h['x-real-ip'].trim() : '';
  const vercelFwd =
    typeof h['x-vercel-forwarded-for'] === 'string' ? h['x-vercel-forwarded-for'].trim() : '';
  if (realIp) return String(realIp).slice(0, 64);
  if (vercelFwd) {
    // Vercel appends; take the rightmost (platform-added) hop when present
    const parts = vercelFwd.split(',').map((s) => s.trim()).filter(Boolean);
    const hop = parts[parts.length - 1] || parts[0] || '';
    if (hop) return String(hop).slice(0, 64);
  }
  const xf = h['x-forwarded-for'];
  const raw =
    typeof xf === 'string'
      ? xf.split(',')[0].trim()
      : req?.socket?.remoteAddress || 'anon';
  return String(raw || 'anon').slice(0, 64);
}

export default {
  MAX_SEED_CHARS,
  MAX_HINTS_JSON_CHARS,
  MAX_BODY_JSON_CHARS,
  RATE_LIMIT_BACKEND,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_KEYS,
  validateDiscoveryCreateBody,
  checkDiscoveryRateLimit,
  resetDiscoveryRateLimit,
  getDiscoveryRateLimitInfo,
  clientKeyFromReq,
};
