/**
 * Discovery request guards — size caps + light in-memory rate limit.
 * Additive; Preview/demo scoped. No secrets. Does not touch Core /api/lookup.
 */

export const MAX_SEED_CHARS = 500;
export const MAX_HINTS_JSON_CHARS = 4_000;
export const MAX_BODY_JSON_CHARS = 32_000;
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX = 40; // per key per window (Discovery create)

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
 * @param {string} key — typically client IP or 'anon'
 * @param {{ max?: number, windowMs?: number }} [opts]
 * @returns {{ ok: true } | { ok: false, status: 429, error: string, retryAfterSec: number }}
 */
export function checkDiscoveryRateLimit(key, opts = {}) {
  const max = typeof opts.max === 'number' ? opts.max : RATE_LIMIT_MAX;
  const windowMs = typeof opts.windowMs === 'number' ? opts.windowMs : RATE_LIMIT_WINDOW_MS;
  const now = Date.now();
  const k = String(key || 'anon').slice(0, 128);
  let entry = rateMap.get(k);
  if (!entry || now - entry.start >= windowMs) {
    entry = { start: now, count: 0 };
    rateMap.set(k, entry);
  }
  entry.count += 1;
  if (rateMap.size > 4000) {
    for (const [rk, v] of rateMap) {
      if (now - v.start >= windowMs) rateMap.delete(rk);
    }
  }
  if (entry.count > max) {
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - entry.start)) / 1000));
    return {
      ok: false,
      status: 429,
      error: 'rate limit exceeded',
      retryAfterSec,
    };
  }
  return { ok: true };
}

/** Test helper */
export function resetDiscoveryRateLimit() {
  rateMap.clear();
}

/**
 * Best-effort client key from req (no PII beyond IP prefix).
 * @param {import('http').IncomingMessage} [req]
 */
export function clientKeyFromReq(req) {
  const xf = req?.headers?.['x-forwarded-for'];
  const raw = typeof xf === 'string' ? xf.split(',')[0].trim() : req?.socket?.remoteAddress || 'anon';
  return String(raw).slice(0, 64);
}

export default {
  MAX_SEED_CHARS,
  MAX_HINTS_JSON_CHARS,
  MAX_BODY_JSON_CHARS,
  validateDiscoveryCreateBody,
  checkDiscoveryRateLimit,
  resetDiscoveryRateLimit,
  clientKeyFromReq,
};
