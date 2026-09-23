/**
 * Discovery security helpers — Checkpoint F.
 * Redaction · source-content sanitize · SSRF re-exports · perf timeout wrapper.
 * NEVER bypass urlSafety. No secrets. Acc SoT for forbidden QIDs.
 *
 * Cite: ACC-EMIT-SURFACE-MATRIX · urlSafety · requestGuards · UNKNOWN-NORMATIVE
 */
import { assertSafePublicHttpsUrl, isBlockedDiscoveryHost } from './urlSafety.js';
import { isForbiddenQid, extractQid, FORBIDDEN_IDENTITIES_VERSION } from '../forbiddenIdentities.js';

export const SECURITY_MODULE_VERSION = '2026-09-23.security-f-wave';

/** Credential / secret shaped patterns (emit + logs). */
const CREDENTIAL_RE =
  /(api[_-]?key|secret|password|passwd|token|authorization|bearer\s+[a-z0-9._\-+=\/]+|sk-[a-z0-9]{8,}|AKIA[0-9A-Z]{8,})/gi;

const PRIVATE_IP_HINT_RE =
  /\b(127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|169\.254\.\d{1,3}\.\d{1,3}|::1)\b/g;

/**
 * Redact credentials, private IP literals, and Acc-forbidden QIDs from free text.
 * @param {unknown} text
 * @param {{ maxLen?: number }} [opts]
 * @returns {string}
 */
export function redactSensitiveText(text, opts = {}) {
  const maxLen = typeof opts.maxLen === 'number' ? opts.maxLen : 500;
  if (text == null) return '';
  let s = String(text);
  s = s.replace(CREDENTIAL_RE, '[REDACTED]');
  s = s.replace(PRIVATE_IP_HINT_RE, '[REDACTED_HOST]');
  const matches = s.match(/\bQ\d+\b/gi) || [];
  for (const tok of matches) {
    if (isForbiddenQid(tok)) {
      s = s.replace(new RegExp(`\\b${tok}\\b`, 'gi'), '[REDACTED_QID]');
    }
  }
  // Block identity directives in free-text logs
  for (const tok of ['SAME-ENTITY', 'SAME_ENTITY', 'IDENTITY_COMMIT', 'TITLE_BRIDGE', 'OPEN_CRAWL']) {
    if (s.includes(tok)) s = s.split(tok).join('[BLOCKED_DIRECTIVE]');
  }
  return s.slice(0, maxLen);
}

/**
 * Sanitize untrusted source/page content (og:title, snippets, quotes) before store/emit.
 * Does not claim identity. Drops Acc bait spans.
 * @param {unknown} content
 * @param {{ maxLen?: number, field?: string }} [opts]
 */
export function sanitizeSourceContent(content, opts = {}) {
  const maxLen = typeof opts.maxLen === 'number' ? opts.maxLen : 500;
  if (content == null) return { ok: true, text: undefined, stripped: false };
  const raw = String(content);
  const text = redactSensitiveText(raw, { maxLen });
  const stripped =
    text.includes('[REDACTED') ||
    text.includes('[BLOCKED') ||
    text.length < raw.slice(0, maxLen).length;
  // If entire content was only Acc bait / empty after redact → drop
  const emptied = !text.trim() || /^(\[REDACTED_QID\]|\s)*$/.test(text);
  return {
    ok: true,
    text: emptied ? undefined : text,
    stripped: stripped || emptied,
    field: opts.field || undefined,
    forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
  };
}

/**
 * Validate a provenance / fetch URL — thin wrapper so call sites cannot skip SSRF.
 * @param {string} url
 */
export function assertFetchUrlSafe(url) {
  return assertSafePublicHttpsUrl(url);
}

/**
 * Source timeout wrapper — cancels work; NEVER used to skip urlSafety.
 * Caller MUST assertFetchUrlSafe before fetch.
 * @param {() => Promise<T>} fn
 * @param {{ timeoutMs?: number, label?: string, signal?: AbortSignal }} [opts]
 * @returns {Promise<{ ok: true, value: T } | { ok: false, failureClass: string, message: string }>}
 * @template T
 */
export async function withSourceTimeout(fn, opts = {}) {
  const timeoutMs = Math.max(1, Math.min(Number(opts.timeoutMs) || 8_000, 60_000));
  const label = String(opts.label || 'source').slice(0, 64);
  const parent = opts.signal;
  if (typeof fn !== 'function') {
    return { ok: false, failureClass: 'invalid_args', message: 'fn required' };
  }
  let timer;
  const ac = new AbortController();
  const onAbort = () => ac.abort();
  if (parent) {
    if (parent.aborted) {
      return {
        ok: false,
        failureClass: 'cancelled',
        message: redactSensitiveText(`${label} cancelled`),
      };
    }
    parent.addEventListener('abort', onAbort, { once: true });
  }
  try {
    const result = await Promise.race([
      Promise.resolve().then(() => fn({ signal: ac.signal })),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          ac.abort();
          const err = new Error(`${label} timeout after ${timeoutMs}ms`);
          err.name = 'AbortError';
          err.failureClass = 'provider_timeout';
          reject(err);
        }, timeoutMs);
      }),
    ]);
    return { ok: true, value: result };
  } catch (e) {
    const failureClass =
      e?.failureClass ||
      (e?.name === 'AbortError' ? (parent?.aborted ? 'cancelled' : 'provider_timeout') : 'provider_error');
    return {
      ok: false,
      failureClass,
      message: redactSensitiveText(e?.message || String(e), { maxLen: 200 }),
    };
  } finally {
    if (timer) clearTimeout(timer);
    if (parent) parent.removeEventListener('abort', onAbort);
  }
}

/**
 * Payload size gate for arbitrary JSON-ish objects (evidence batches, etc.).
 * @param {unknown} value
 * @param {{ maxChars?: number }} [opts]
 */
export function assertPayloadSize(value, opts = {}) {
  const maxChars = typeof opts.maxChars === 'number' ? opts.maxChars : 256_000;
  let len = 0;
  try {
    len = JSON.stringify(value ?? null).length;
  } catch {
    return { ok: false, reason: 'not_serializable', length: -1, maxChars };
  }
  if (len > maxChars) return { ok: false, reason: 'payload_too_large', length: len, maxChars };
  return { ok: true, length: len, maxChars };
}

/**
 * Probe whether a string/object still contains Acc-forbidden or credential bait.
 * @param {unknown} value
 */
export function containsSecurityBait(value) {
  const s = typeof value === 'string' ? value : JSON.stringify(value ?? {});
  if (CREDENTIAL_RE.test(s)) {
    CREDENTIAL_RE.lastIndex = 0;
    return { bait: true, kind: 'credential_shaped' };
  }
  CREDENTIAL_RE.lastIndex = 0;
  const matches = s.match(/\bQ\d+\b/gi) || [];
  if (matches.some((tok) => isForbiddenQid(tok))) {
    return { bait: true, kind: 'acc_forbidden_qid' };
  }
  if (/\b(SAME-ENTITY|IDENTITY_COMMIT)\b/.test(s)) {
    return { bait: true, kind: 'identity_directive' };
  }
  return { bait: false, kind: null };
}

export {
  assertSafePublicHttpsUrl,
  isBlockedDiscoveryHost,
  isForbiddenQid,
  extractQid,
  FORBIDDEN_IDENTITIES_VERSION,
};


/**
 * Re-validate QueryPlan urlTargets at emit/orch boundary (does not edit queryPlan.js).
 * Unsafe targets must never be labeled allowed; private URLs must not fetch.
 * @param {object} plan
 * @returns {{ ok: boolean, allowed: object[], unsafe: object[], reasons: string[] }}
 */
export function assertPlanUrlTargetsSafe(plan) {
  const targets = Array.isArray(plan?.urlTargets) ? plan.urlTargets : [];
  const allowed = [];
  const unsafe = [];
  const reasons = [];
  for (const t of targets) {
    if (!t || typeof t !== 'object') continue;
    const url = String(t.url || '');
    // Scrubbed placeholders like [blocked] are already non-fetchable
    if (/^\[/i.test(url) && /\]$/.test(url)) {
      unsafe.push({ url, safety: t.safety || 'blocked', reason: 'placeholder' });
      continue;
    }
    const check = assertSafePublicHttpsUrl(url);
    const declared = String(t.safety || '');
    if (check.ok) {
      if (declared && declared !== 'allowed') {
        reasons.push(`declared_${declared}_but_url_safe:${url.slice(0, 60)}`);
      }
      allowed.push({ url: check.canonical || url, safety: 'allowed' });
    } else {
      if (declared === 'allowed') {
        reasons.push(`UNSAFE_MARKED_ALLOWED:${url.slice(0, 80)}:${check.reason}`);
      }
      unsafe.push({ url: url.slice(0, 120), safety: declared || 'unsafe', reason: check.reason });
    }
  }
  // ok iff no target is both unsafe AND marked allowed
  const leak = reasons.some((r) => r.startsWith('UNSAFE_MARKED_ALLOWED'));
  return { ok: !leak, allowed, unsafe, reasons, leakAllowedUnsafe: leak };
}

/**
 * Acc-safe scrub of session.providers map/array before emit (closes DEEP_SKIP residual).
 * @param {unknown} providers
 * @returns {unknown}
 */
export function scrubProvidersState(providers) {
  if (providers == null) return providers;
  const scrubKey = (k) => {
    const s = String(k);
    // Never emit Acc-forbidden QID as a providers map key
    if (isForbiddenQid(s) || (extractQid(s) && isForbiddenQid(extractQid(s)))) {
      return '[REDACTED_QID]';
    }
    return redactSensitiveText(s, { maxLen: 64 }) || s;
  };
  const scrubVal = (v) => {
    if (v == null) return v;
    if (typeof v === 'string') return redactSensitiveText(v, { maxLen: 120 });
    if (typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(scrubVal);
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      const safeKey = scrubKey(k);
      if (/^(error|message|msg|reason|detail|qid|entityRef|entityRefs)$/i.test(k)) {
        out[safeKey] =
          typeof val === 'string' || typeof val === 'number'
            ? redactSensitiveText(val, { maxLen: 160 })
            : scrubVal(val);
      } else if (typeof val === 'string') {
        out[safeKey] = redactSensitiveText(val, { maxLen: 120 });
      } else if (val && typeof val === 'object') {
        out[safeKey] = scrubVal(val);
      } else {
        out[safeKey] = val;
      }
    }
    return out;
  };
  // Keep providers key present (caller responsibility); never drop to undefined here.
  return scrubVal(providers);
}



/**
 * Fail-closed fetch allow-list from QueryPlan.urlTargets.
 * ONLY returns URLs that pass assertSafePublicHttpsUrl right now.
 * Declared safety=allowed that fails re-check is DROPPED (poison defense).
 * Never returns private/metadata/userinfo/http/raw-IP.
 * Prefer this over plan.safety labels at fetch time.
 * @param {object} plan
 * @returns {{ ok: boolean, urls: string[], blocked: object[], poison: boolean, reasons: string[] }}
 */
export function selectFetchablePlanUrlTargets(plan) {
  const boundary = assertPlanUrlTargetsSafe(plan);
  const urls = [];
  const blocked = [];
  const reasons = [...(boundary.reasons || [])];
  for (const t of boundary.allowed || []) {
    const check = assertSafePublicHttpsUrl(t.url);
    if (!check.ok) {
      blocked.push({ url: String(t.url).slice(0, 120), reason: check.reason || 'recheck_failed' });
      reasons.push(`FETCH_GATE_DROP:${check.reason}:${String(t.url).slice(0, 60)}`);
      continue;
    }
    urls.push(check.canonical || t.url);
  }
  for (const u of boundary.unsafe || []) {
    blocked.push(u);
  }
  // Fail-closed: poison (unsafe marked allowed) → zero fetchable URLs
  if (boundary.leakAllowedUnsafe) {
    return {
      ok: false,
      urls: [],
      blocked,
      poison: true,
      reasons,
      failClosed: true,
    };
  }
  return {
    ok: true,
    urls: [...new Set(urls)],
    blocked,
    poison: false,
    reasons,
    failClosed: false,
  };
}

/**
 * Simulate Preview flag-ON plan fetch gate without network.
 * Inject plan urlTargets → assert every candidate must pass gate before "fetch".
 * @param {object} plan
 * @param {{ fetchFn?: (url: string) => Promise<unknown> }} [opts]
 * @returns {Promise<{ ok: boolean, fetched: string[], blocked: object[], poison: boolean }>}
 */
export async function runPlanUrlTargetsFetchGate(plan, opts = {}) {
  const gate = selectFetchablePlanUrlTargets(plan);
  const fetched = [];
  if (gate.poison || gate.failClosed) {
    return { ok: false, fetched: [], blocked: gate.blocked, poison: true, reasons: gate.reasons };
  }
  const fetchFn = typeof opts.fetchFn === 'function' ? opts.fetchFn : async () => ({ ok: true });
  for (const url of gate.urls) {
    // Defense in depth: re-assert immediately before each fetch
    const check = assertSafePublicHttpsUrl(url);
    if (!check.ok) {
      gate.blocked.push({ url, reason: check.reason || 'pre_fetch_reject' });
      continue;
    }
    await fetchFn(check.canonical || url);
    fetched.push(check.canonical || url);
  }
  return {
    ok: true,
    fetched,
    blocked: gate.blocked,
    poison: false,
    reasons: gate.reasons,
  };
}

export default {
  SECURITY_MODULE_VERSION,
  redactSensitiveText,
  sanitizeSourceContent,
  assertFetchUrlSafe,
  withSourceTimeout,
  assertPayloadSize,
  containsSecurityBait,
  assertPlanUrlTargetsSafe,
  selectFetchablePlanUrlTargets,
  runPlanUrlTargetsFetchGate,
  scrubProvidersState,
  assertSafePublicHttpsUrl,
  isBlockedDiscoveryHost,
};
