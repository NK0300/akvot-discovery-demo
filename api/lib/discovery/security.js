/**
 * Discovery security helpers — Checkpoint F.
 * Redaction · source-content sanitize · SSRF re-exports · perf timeout wrapper.
 * NEVER bypass urlSafety. No secrets. Acc SoT for forbidden QIDs.
 *
 * Cite: ACC-EMIT-SURFACE-MATRIX · urlSafety · requestGuards · UNKNOWN-NORMATIVE
 */
import { assertSafePublicHttpsUrl, isBlockedDiscoveryHost } from './urlSafety.js';
import { isForbiddenQid, extractQid, FORBIDDEN_IDENTITIES_VERSION } from '../forbiddenIdentities.js';

export const SECURITY_MODULE_VERSION = '2026-09-23.security-ssrf-pack2';

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


/**
 * Local Preview-oriented urlTargets SSRF pack (no live Vercel Preview required).
 * Exercises poison / metadata / DNS-rebinding / userinfo / scheme traps via the
 * same fail-closed gate wired into providers + familyOrchestrator + orch.
 * LIVE Preview flag-ON e2e remains OPEN if box cannot reach a real Preview deploy.
 * @param {{ fetchFn?: (url: string) => Promise<unknown> }} [opts]
 * @returns {Promise<{
 *   ok: boolean,
 *   cases: object[],
 *   passed: number,
 *   failed: number,
 *   livePreviewRequired: true,
 *   livePreviewStatus: 'OPEN',
 * }>}
 */
/**
 * Local Preview-oriented urlTargets SSRF pack (no live Vercel Preview required).
 * Exercises poison / metadata / DNS-rebinding / userinfo / scheme / decimal-IP /
 * CGNAT / k8s traps via the same fail-closed gate wired into providers +
 * familyOrchestrator + orch. LIVE Preview flag-ON e2e remains OPEN if box cannot
 * reach a real Preview deploy (or Vercel scope re-auth is required).
 * @param {{ fetchFn?: (url: string) => Promise<unknown> }} [opts]
 * @returns {Promise<{
 *   ok: boolean,
 *   cases: object[],
 *   passed: number,
 *   failed: number,
 *   fixtureCount: number,
 *   livePreviewRequired: true,
 *   livePreviewStatus: 'OPEN',
 * }>}
 */
export async function simulatePreviewUrlTargetsSsrfPack(opts = {}) {
  const cases = [];
  const record = (name, cond, detail = {}) => {
    cases.push({ name, ok: !!cond, ...detail });
  };

  /** Adversarial urlTargets fixtures — unit-safe (no network). */
  const ADVERSARIAL_URLS = [
    // localhost / loopback
    'https://localhost/',
    'https://app.localhost/x',
    'http://127.0.0.1/admin',
    'https://127.0.0.1/',
    'https://[::1]/',
    'https://[::ffff:127.0.0.1]/',
    // decimal / hex / short IP forms (URL API normalizes → blocked)
    'https://2130706433/',
    'https://0x7f000001/',
    'https://0177.0.0.1/',
    'https://127.1/',
    // metadata / cloud
    'https://169.254.169.254/latest/meta-data',
    'http://169.254.169.254/',
    'https://metadata.google.internal/',
    'https://metadata.azure.com/',
    'https://metadata/',
    'https://instance-data/latest/meta-data',
    'https://kubernetes.default/',
    'https://kubernetes.default.svc/',
    // private / CGNAT / multicast / raw public IP
    'https://10.0.0.1/',
    'https://192.168.1.1/',
    'https://172.16.5.1/',
    'https://100.64.0.1/',
    'https://224.0.0.1/',
    'https://8.8.8.8/',
    'https://0/',
    'https://broadcasthost/',
    // DNS rebinding / local-dev wildcards (unit-safe host suffix traps)
    'https://127.0.0.1.nip.io/',
    'https://10.0.0.1.sslip.io/x',
    'https://1.2.3.4.xip.io/',
    'https://localtest.me/',
    'https://foo.localtest.me/',
    'https://evil.nip.io/',
    // schemes
    'file:///etc/passwd',
    'ftp://example.com/',
    'blob:https://example.com/uuid',
    'javascript:alert(1)',
    'data:text/html,hi',
    'http://example.com/',
    // userinfo
    'https://user:pass@example.com/',
    'https://user@example.com/',
    // suffix traps
    'https://host.local/',
    'https://svc.internal/',
    'https://foo.internal/x',
  ];

  // 1) Poison mixed plan → failClosed + zero fetch
  const poisonPlan = {
    urlTargets: [
      { url: 'https://example.com/page', safety: 'allowed' },
      { url: 'http://127.0.0.1/admin', safety: 'allowed' },
      { url: 'https://169.254.169.254/latest/meta-data', safety: 'blocked' },
      { url: 'https://metadata.google.internal/', safety: 'allowed' },
      { url: 'https://metadata.azure.com/', safety: 'allowed' },
      { url: 'https://instance-data/latest/meta-data', safety: 'allowed' },
      { url: 'https://127.0.0.1.nip.io/', safety: 'allowed' },
      { url: 'https://user:pass@example.com/', safety: 'allowed' },
      { url: 'file:///etc/passwd', safety: 'allowed' },
      { url: 'https://2130706433/', safety: 'allowed' },
    ],
  };
  const poisonGate = selectFetchablePlanUrlTargets(poisonPlan);
  record('poison_failClosed', poisonGate.ok === false && poisonGate.failClosed === true && poisonGate.urls.length === 0, {
    urls: poisonGate.urls.length,
    poison: poisonGate.poison,
  });

  const fetchedPoison = [];
  const poisonRun = await runPlanUrlTargetsFetchGate(poisonPlan, {
    fetchFn: async (url) => {
      fetchedPoison.push(url);
      return { ok: true };
    },
  });
  record('poison_never_fetches', poisonRun.ok === false && fetchedPoison.length === 0 && poisonRun.poison === true, {
    fetched: fetchedPoison.length,
  });

  // 2) Clean public plan → only allowlisted https fetched
  const cleanPlan = {
    urlTargets: [
      { url: 'https://example.com/a', safety: 'allowed' },
      { url: 'https://www.wikidata.org/wiki/Q42', safety: 'allowed' },
      { url: 'https://localhost/', safety: 'blocked' },
      { url: 'http://10.0.0.1/', safety: 'unsafe' },
      { url: 'https://10.0.0.1.sslip.io/x', safety: 'blocked' },
      { url: 'file:///etc/passwd', safety: 'blocked' },
    ],
  };
  const cleanGate = selectFetchablePlanUrlTargets(cleanPlan);
  const cleanOk =
    cleanGate.ok === true &&
    cleanGate.poison === false &&
    cleanGate.urls.every((u) => assertSafePublicHttpsUrl(u).ok) &&
    !cleanGate.urls.some((u) => /localhost|10\.0\.0|sslip\.io|file:/i.test(u)) &&
    cleanGate.urls.some((u) => /example\.com/.test(u)) &&
    cleanGate.urls.some((u) => /wikidata\.org/.test(u));
  record('clean_public_only', cleanOk, { urls: cleanGate.urls });

  const fetchedClean = [];
  const cleanRun = await runPlanUrlTargetsFetchGate(cleanPlan, {
    fetchFn:
      typeof opts.fetchFn === 'function'
        ? async (url) => {
            fetchedClean.push(url);
            return opts.fetchFn(url);
          }
        : async (url) => {
            fetchedClean.push(url);
            return { ok: true };
          },
  });
  record(
    'clean_fetch_allowlist',
    cleanRun.ok === true &&
      fetchedClean.length === cleanGate.urls.length &&
      fetchedClean.every((u) => assertSafePublicHttpsUrl(u).ok),
    { fetched: fetchedClean },
  );

  // Declaring a DNS-rebinding host as allowed is poison → failClosed
  const rebindPoison = selectFetchablePlanUrlTargets({
    urlTargets: [
      { url: 'https://example.org/ok', safety: 'allowed' },
      { url: 'https://127.0.0.1.nip.io/', safety: 'allowed' },
    ],
  });
  record(
    'dns_rebind_marked_allowed_is_poison',
    rebindPoison.failClosed === true && rebindPoison.urls.length === 0,
    { poison: rebindPoison.poison },
  );

  // file:// marked allowed is poison
  const filePoison = selectFetchablePlanUrlTargets({
    urlTargets: [
      { url: 'https://example.org/ok', safety: 'allowed' },
      { url: 'file:///etc/passwd', safety: 'allowed' },
    ],
  });
  record(
    'file_scheme_marked_allowed_is_poison',
    filePoison.failClosed === true && filePoison.urls.length === 0,
  );

  // userinfo-only (user, no password) marked allowed is poison
  const userinfoPoison = selectFetchablePlanUrlTargets({
    urlTargets: [{ url: 'https://user@example.com/', safety: 'allowed' }],
  });
  record(
    'userinfo_marked_allowed_is_poison',
    userinfoPoison.failClosed === true && userinfoPoison.urls.length === 0,
  );

  // decimal loopback marked allowed is poison
  const decimalPoison = selectFetchablePlanUrlTargets({
    urlTargets: [{ url: 'https://2130706433/', safety: 'allowed' }],
  });
  record(
    'decimal_ip_marked_allowed_is_poison',
    decimalPoison.failClosed === true && decimalPoison.urls.length === 0,
  );

  // http scheme marked allowed is poison
  const httpPoison = selectFetchablePlanUrlTargets({
    urlTargets: [{ url: 'http://example.com/', safety: 'allowed' }],
  });
  record(
    'http_marked_allowed_is_poison',
    httpPoison.failClosed === true && httpPoison.urls.length === 0,
  );

  // 3) Host trap battery (Preview aliases + DNS rebinding + schemes)
  let trapsBlocked = 0;
  const trapDetails = [];
  for (const u of ADVERSARIAL_URLS) {
    const check = assertSafePublicHttpsUrl(u);
    if (!check.ok) trapsBlocked += 1;
    else trapDetails.push(u);
  }
  record('preview_host_traps_blocked', trapsBlocked === ADVERSARIAL_URLS.length, {
    trapsBlocked,
    trapsTotal: ADVERSARIAL_URLS.length,
    leaked: trapDetails,
  });

  // 4) Safe public still allowed
  record(
    'safe_public_https_allowed',
    assertSafePublicHttpsUrl('https://example.com/ok').ok === true &&
      assertSafePublicHttpsUrl('https://www.wikidata.org/wiki/Q42').ok === true,
  );

  const passed = cases.filter((c) => c.ok).length;
  const failed = cases.length - passed;
  return {
    ok: failed === 0,
    cases,
    passed,
    failed,
    fixtureCount: ADVERSARIAL_URLS.length,
    livePreviewRequired: true,
    livePreviewStatus: 'OPEN',
    note: 'Unit+local simulate PASS does not claim live Vercel Preview flag-ON SSRF pack',
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
  simulatePreviewUrlTargetsSsrfPack,
  scrubProvidersState,
  assertSafePublicHttpsUrl,
  isBlockedDiscoveryHost,
};
