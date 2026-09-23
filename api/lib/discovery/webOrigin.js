/**
 * EXP-C1 WEB-ORIGIN — Preview-flagged origin metadata resolver.
 * Fetches ORIGIN METADATA ONLY (title / og:site_name / short description).
 * No crawl · no recursive link follow · URL/domain NEVER implies SAME-ENTITY.
 * Reuses urlSafety.assertSafePublicHttpsUrl / isBlockedDiscoveryHost.
 */
import { createHash } from 'crypto';
import { assertSafePublicHttpsUrl, isBlockedDiscoveryHost } from './urlSafety.js';

export const WEB_ORIGIN_HOST_FAMILY = 'web_origin';
export const WEB_ORIGIN_PROVIDER_ID = 'web_origin';

export const MIN_SNIPPET_CHARS = 40;
export const MAX_FETCH_BODY_BYTES = 256_000;
export const MAX_REDIRECTS = 3;
export const DEFAULT_FETCH_TIMEOUT_MS = 4_000;
export const MAX_ONE_HOP_URLS = 5;

/** Relationship vocabulary (INFORMATION ≠ IDENTITY). Never domain→SAME-ENTITY. */
export const RELATIONSHIP_LABELS = Object.freeze([
  'SAME-ENTITY',
  'SAME-REFERENCE',
  'RELATED-ENTITY',
  'POSSIBLE-MATCH',
  'UNKNOWN',
  'CONTRADICTORY',
]);

const FETCH_UA = 'akvot-discovery/0.1 (web_origin; public research; metadata-only)';

/**
 * Cheap registrable-domain approx (eTLD+1 heuristic — NOT PSL; discovery only).
 * @param {string} hostname
 */
export function registrableDomain(hostname) {
  const h = String(hostname || '')
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/^\[|\]$/g, '');
  if (!h || isBlockedDiscoveryHost(h)) return '';
  const parts = h.split('.').filter(Boolean);
  if (parts.length < 2) return h;
  // common dual-label public suffixes (approx)
  const dual = new Set(['co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'co.il', 'org.il', 'gov.il', 'ac.il', 'com.au', 'net.au']);
  const last2 = parts.slice(-2).join('.');
  if (parts.length >= 3 && dual.has(last2)) return parts.slice(-3).join('.');
  return last2;
}

/**
 * Detect whether a string looks like a URL or bare public hostname.
 * @param {string} raw
 */
export function looksLikeUrlOrHostname(raw) {
  const s = String(raw || '').trim();
  if (!s || s.length > 500) return false;
  if (/^https?:\/\//i.test(s)) return true;
  // bare hostname: label.label… no spaces, has a dot, no path required
  if (/^\s*[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+\.?\/?/i.test(s) && !/\s/.test(s)) {
    return true;
  }
  return false;
}

/**
 * Extract candidate URLs/hostnames from seed text (one-hop candidates, not crawl).
 * @param {string} seed
 * @returns {string[]}
 */
export function extractUrlCandidatesFromSeed(seed) {
  const s = String(seed || '');
  const out = [];
  const urlRe = /https?:\/\/[^\s<>"'`]+/gi;
  let m;
  while ((m = urlRe.exec(s)) !== null) {
    out.push(m[0].replace(/[),.;]+$/, ''));
  }
  // bare host if entire seed is host-like
  if (looksLikeUrlOrHostname(s) && !/^https?:\/\//i.test(s.trim())) {
    out.push(s.trim().replace(/\/$/, ''));
  }
  return [...new Set(out)].slice(0, MAX_ONE_HOP_URLS);
}

/**
 * Normalize seed/URL/hostname → safe https origin URL (or reject).
 * Upgrades http→https for public hosts; strips userinfo; drops hash.
 * Does NOT follow redirects here — safety on final redirect hop is in fetch.
 *
 * @param {string} raw
 * @returns {{
 *   ok: boolean,
 *   reason?: string,
 *   originalUrl: string,
 *   normalizedUrl?: string,
 *   origin?: string,
 *   hostname?: string,
 *   registrableDomain?: string,
 *   scheme?: string,
 *   path?: string,
 *   safetyDecision: object
 * }}
 */
export function normalizeWebOriginSeed(raw) {
  const originalUrl = String(raw || '').trim();
  const safetyDecision = { stage: 'normalize', ok: false, reason: 'empty' };
  if (!originalUrl) {
    return { ok: false, reason: 'empty', originalUrl, safetyDecision };
  }

  let candidate = originalUrl;
  // bare hostname → https://hostname/
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    if (!looksLikeUrlOrHostname(candidate)) {
      safetyDecision.reason = 'not_url_or_hostname';
      return { ok: false, reason: 'not_url_or_hostname', originalUrl, safetyDecision };
    }
    candidate = `https://${candidate.replace(/^\/*/, '')}`;
  }

  let u;
  try {
    u = new URL(candidate);
  } catch {
    safetyDecision.reason = 'invalid_url';
    return { ok: false, reason: 'invalid_url', originalUrl, safetyDecision };
  }

  const proto = u.protocol.toLowerCase();
  if (proto === 'javascript:' || proto === 'data:' || proto === 'file:' || proto === 'blob:' || proto === 'ftp:') {
    safetyDecision.reason = 'dangerous_scheme';
    return { ok: false, reason: 'dangerous_scheme', originalUrl, safetyDecision };
  }

  // http → try https upgrade (still validated)
  if (proto === 'http:') {
    u.protocol = 'https:';
  } else if (proto !== 'https:') {
    safetyDecision.reason = 'scheme_not_https';
    return { ok: false, reason: 'scheme_not_https', originalUrl, safetyDecision };
  }

  if (u.username || u.password) {
    safetyDecision.reason = 'userinfo_forbidden';
    return { ok: false, reason: 'userinfo_forbidden', originalUrl, safetyDecision };
  }

  u.hash = '';
  const host = u.hostname.toLowerCase();
  if (isBlockedDiscoveryHost(host)) {
    safetyDecision.reason = 'blocked_host';
    return { ok: false, reason: 'blocked_host', originalUrl, safetyDecision };
  }

  const check = assertSafePublicHttpsUrl(u.toString());
  if (!check.ok) {
    safetyDecision.reason = check.reason || 'unsafe';
    return { ok: false, reason: check.reason || 'unsafe', originalUrl, safetyDecision };
  }

  const origin = u.origin;
  const path = u.pathname || '/';
  const reg = registrableDomain(host);
  safetyDecision.ok = true;
  safetyDecision.reason = 'allow';
  return {
    ok: true,
    originalUrl,
    normalizedUrl: check.canonical || u.toString(),
    origin,
    hostname: host,
    registrableDomain: reg,
    scheme: 'https',
    path,
    safetyDecision,
  };
}

/**
 * Parse origin metadata from HTML — title / og:site_name / description only.
 * @param {string} html
 * @returns {{ title?: string, siteName?: string, description?: string, snippet?: string }}
 */
export function parseOriginMetadata(html) {
  const text = String(html || '');
  const pickMeta = (prop) => {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      'i',
    );
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
      'i',
    );
    const m = text.match(re) || text.match(re2);
    return m ? decodeHtmlEntities(m[1]).trim() : '';
  };
  let title = '';
  const tm = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (tm) title = decodeHtmlEntities(tm[1].replace(/\s+/g, ' ')).trim();
  const siteName = pickMeta('og:site_name') || pickMeta('application-name');
  const description =
    pickMeta('og:description') || pickMeta('description') || pickMeta('twitter:description');
  const snippetParts = [title, siteName, description].filter(Boolean);
  let snippet = snippetParts.join(' · ').replace(/\s+/g, ' ').trim();
  if (snippet.length > 500) snippet = snippet.slice(0, 500);
  return {
    title: title ? title.slice(0, 240) : undefined,
    siteName: siteName ? siteName.slice(0, 240) : undefined,
    description: description ? description.slice(0, 400) : undefined,
    snippet: snippet || undefined,
  };
}

function decodeHtmlEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Relationship from web_origin evidence vs seed — NEVER SAME-ENTITY from domain alone.
 * @param {{ seed?: string, hostname?: string, registrableDomain?: string, title?: string, siteName?: string, metadataOk?: boolean }} ctx
 * @returns {typeof RELATIONSHIP_LABELS[number]}
 */
export function labelWebOriginRelationship(ctx = {}) {
  const seed = String(ctx.seed || '').trim().toLowerCase();
  const host = String(ctx.hostname || '').toLowerCase();
  const reg = String(ctx.registrableDomain || '').toLowerCase();
  const title = String(ctx.title || '').toLowerCase();
  const site = String(ctx.siteName || '').toLowerCase();
  const metadataOk = !!ctx.metadataOk;

  // ARCH/CHIEF BOUND: URL/domain alone NEVER implies SAME-ENTITY or SAME-REFERENCE.
  // Max for URL-alone seed = UNKNOWN. RELATED-ENTITY only with typed evidence beyond URL.
  const seedIsUrl = looksLikeUrlOrHostname(seed) || /^https?:\/\//i.test(seed);
  if (seedIsUrl) {
    return 'UNKNOWN';
  }

  if (!metadataOk) return 'UNKNOWN';

  // Typed evidence beyond URL: lexical overlap of non-URL seed tokens vs title/siteName only
  // (host/reg alone is still URL-derived — do not count as additional typed evidence)
  const seedTokens = seed
    .replace(/[^a-z0-9\u0590-\u05ff\s]/gi, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  const typedHay = `${title} ${site}`.trim();
  if (!typedHay) return 'UNKNOWN';
  const overlap = seedTokens.filter((t) => typedHay.includes(t));
  if (overlap.length >= 2) return 'POSSIBLE-MATCH';
  if (overlap.length === 1) return 'RELATED-ENTITY';
  // Host/reg match without title/site overlap = still URL-derived → UNKNOWN
  return 'UNKNOWN';
}

/**
 * Cap-read response body.
 * @param {Response} res
 * @param {number} maxBytes
 */
async function readBodyCapped(res, maxBytes = MAX_FETCH_BODY_BYTES) {
  const cl = res.headers?.get?.('content-length');
  if (cl != null && cl !== '' && Number(cl) > maxBytes) {
    return { ok: false, reason: 'body_too_large', text: null };
  }
  const buf = await res.arrayBuffer();
  if (buf.byteLength > maxBytes) {
    return { ok: false, reason: 'body_too_large', text: null };
  }
  const text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  return { ok: true, text };
}

function fetchSignal(timeoutMs, external) {
  const t = AbortSignal.timeout(timeoutMs);
  if (!external) return t;
  if (external.aborted) return external;
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([t, external]);
  return t;
}

/**
 * Safe HTTPS fetch with manual redirects; re-validate every hop (SSRF).
 * @param {string} startUrl
 * @param {{ timeoutMs?: number, maxRedirects?: number, signal?: AbortSignal }} [opts]
 */
export async function safeFetchOriginMetadata(startUrl, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const maxRedirects = opts.maxRedirects ?? MAX_REDIRECTS;
  const t0 = Date.now();
  let current = startUrl;
  /** @type {string[]} */
  const hopChain = [];

  for (let hop = 0; hop <= maxRedirects; hop++) {
    if (opts.signal?.aborted) {
      return {
        ok: false,
        failureClass: 'aborted',
        resultClass: 'aborted',
        latencyMs: Date.now() - t0,
        hopChain,
      };
    }
    const safe = assertSafePublicHttpsUrl(current);
    if (!safe.ok) {
      return {
        ok: false,
        failureClass: safe.reason === 'blocked_host' ? 'redirect_to_blocked' : 'unsafe_url',
        resultClass: 'blocked',
        safetyReason: safe.reason,
        latencyMs: Date.now() - t0,
        hopChain,
        finalUrl: current,
      };
    }
    current = safe.canonical;
    hopChain.push(current);

    let res;
    try {
      res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
          'User-Agent': FETCH_UA,
        },
        signal: fetchSignal(timeoutMs, opts.signal),
      });
    } catch (e) {
      const isTimeout = e?.name === 'AbortError' || /abort|timeout/i.test(String(e?.message || e));
      return {
        ok: false,
        failureClass: isTimeout ? 'timeout' : 'network_error',
        resultClass: isTimeout ? 'timeout' : 'error',
        message: String(e?.message || e).slice(0, 200),
        latencyMs: Date.now() - t0,
        hopChain,
        finalUrl: current,
      };
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers?.get?.('location');
      if (!loc) {
        return {
          ok: false,
          failureClass: 'redirect_missing_location',
          resultClass: 'error',
          httpStatus: res.status,
          latencyMs: Date.now() - t0,
          hopChain,
          finalUrl: current,
        };
      }
      try {
        current = new URL(loc, current).href;
      } catch {
        return {
          ok: false,
          failureClass: 'redirect_invalid_location',
          resultClass: 'error',
          httpStatus: res.status,
          latencyMs: Date.now() - t0,
          hopChain,
          finalUrl: current,
        };
      }
      continue;
    }

    if (!res.ok) {
      return {
        ok: false,
        failureClass: `http_${res.status}`,
        resultClass: 'http_error',
        httpStatus: res.status,
        latencyMs: Date.now() - t0,
        hopChain,
        finalUrl: current,
      };
    }

    const body = await readBodyCapped(res);
    if (!body.ok) {
      return {
        ok: false,
        failureClass: body.reason || 'body_too_large',
        resultClass: 'oversized',
        httpStatus: res.status,
        latencyMs: Date.now() - t0,
        hopChain,
        finalUrl: current,
      };
    }

    const meta = parseOriginMetadata(body.text || '');
    return {
      ok: true,
      resultClass: 'ok',
      httpStatus: res.status,
      finalUrl: current,
      latencyMs: Date.now() - t0,
      hopChain,
      meta,
    };
  }

  return {
    ok: false,
    failureClass: 'too_many_redirects',
    resultClass: 'redirect_limit',
    latencyMs: Date.now() - t0,
    hopChain,
    finalUrl: current,
  };
}

/**
 * Build a RawFinding + telemetry for one normalized origin.
 * Drops when snippet < MIN_SNIPPET_CHARS (cite-or-drop quality).
 *
 * @param {object} norm — result of normalizeWebOriginSeed
 * @param {object} fetchResult — result of safeFetchOriginMetadata
 * @param {{ seed?: string, sourceFinding?: string, sessionId?: string, correlationId?: string }} ctx
 */
export function buildWebOriginFinding(norm, fetchResult, ctx = {}) {
  const retrievedAt = new Date().toISOString();
  const relationship = labelWebOriginRelationship({
    seed: ctx.seed,
    hostname: norm.hostname,
    registrableDomain: norm.registrableDomain,
    title: fetchResult?.meta?.title,
    siteName: fetchResult?.meta?.siteName,
    metadataOk: !!(fetchResult?.ok && fetchResult?.meta),
  });

  const telemetry = scrubTelemetry({
    correlationId: ctx.correlationId,
    sessionId: ctx.sessionId,
    seed: ctx.seed ? String(ctx.seed).slice(0, 120) : undefined,
    family: WEB_ORIGIN_HOST_FAMILY,
    safetyResult: norm.safetyDecision?.reason || (norm.ok ? 'allow' : 'reject'),
    fetchResult: fetchResult?.resultClass || 'skipped',
    failureClass: fetchResult?.failureClass,
    latencyMs: fetchResult?.latencyMs,
    relationship,
    hostname: norm.hostname,
    registrableDomain: norm.registrableDomain,
  });

  if (!norm.ok) {
    return { finding: null, telemetry, blocked: true };
  }
  if (!fetchResult?.ok) {
    return { finding: null, telemetry, blocked: false, fetchFailed: true };
  }

  const meta = fetchResult.meta || {};
  const snippet = meta.snippet || '';
  if (snippet.length < MIN_SNIPPET_CHARS) {
    telemetry.failureClass = 'weak_snippet';
    telemetry.fetchResult = 'weak_snippet';
    return { finding: null, telemetry, blocked: false, weakSnippet: true };
  }

  const finalNorm = normalizeWebOriginSeed(fetchResult.finalUrl || norm.normalizedUrl);
  const provenanceUrl = (finalNorm.ok ? finalNorm.normalizedUrl : norm.normalizedUrl) || norm.normalizedUrl;
  const host = finalNorm.hostname || norm.hostname;
  const reg = finalNorm.registrableDomain || norm.registrableDomain;
  const idHash = createHash('sha256')
    .update(`web_origin|${reg}|${provenanceUrl}`)
    .digest('hex')
    .slice(0, 16);

  const title = meta.siteName || meta.title || host;
  const summary = [meta.title, meta.description].filter(Boolean).join(' — ').slice(0, 500);

  /** @type {import('./providers.js').RawFinding & object} */
  const finding = {
    id: `wo-${idHash}`,
    title: String(title).slice(0, 240),
    summary: summary || snippet.slice(0, 500),
    kind: 'page',
    evidenceType: 'page',
    provenanceUrl,
    quote: snippet.slice(0, 500),
    facetHints: [
      'provider:web_origin',
      'kind:page',
      `hostFamily:${WEB_ORIGIN_HOST_FAMILY}`,
      `relationship:${relationship}`,
    ],
    entityRefs: [`web_origin:${reg || host}`],
    contentType: 'text/html',
    robotsOk: true,
    _retrievedAt: retrievedAt,
    // typed web_origin evidence fields (passthrough via normalizeRawHit)
    originalUrl: norm.originalUrl,
    normalizedUrl: provenanceUrl,
    origin: finalNorm.origin || norm.origin,
    hostname: host,
    registrableDomain: reg,
    scheme: 'https',
    path: finalNorm.path || norm.path || '/',
    sourceFinding: ctx.sourceFinding || null,
    hostFamily: WEB_ORIGIN_HOST_FAMILY,
    safetyDecision: norm.safetyDecision,
    httpStatus: fetchResult.httpStatus,
    resultClass: fetchResult.resultClass,
    relationship,
    webOriginMeta: {
      title: meta.title,
      siteName: meta.siteName,
      description: meta.description,
    },
  };

  return { finding, telemetry, blocked: false };
}

/**
 * Acc-scrub telemetry — strip forbidden Q-ids / oversized seed text.
 * @param {object} t
 */
export function scrubTelemetry(t = {}) {
  const scrub = (v) => {
    if (v == null) return v;
    return String(v)
      .replace(/\bQ1701775\b/gi, '[scrubbed]')
      .replace(/\bQ\d{4,}\b/g, (m) => (m.toUpperCase() === 'Q1701775' ? '[scrubbed]' : m));
  };
  const out = {};
  for (const [k, v] of Object.entries(t)) {
    if (v == null) continue;
    if (typeof v === 'string') out[k] = scrub(v).slice(0, 200);
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
    else out[k] = scrub(JSON.stringify(v)).slice(0, 200);
  }
  return out;
}

/**
 * Resolve one or more seeds/URLs into RawFindings (metadata only).
 * @param {string[]} candidates
 * @param {{ seed?: string, sessionId?: string, correlationId?: string, budgetMs?: number, signal?: AbortSignal, sourceFinding?: string }} ctx
 */
export async function resolveWebOriginCandidates(candidates, ctx = {}) {
  const findings = [];
  const telemetries = [];
  const errors = [];
  const seen = new Set();
  const budgetMs = ctx.budgetMs || DEFAULT_FETCH_TIMEOUT_MS;
  const list = (candidates || []).slice(0, MAX_ONE_HOP_URLS);

  for (const raw of list) {
    const norm = normalizeWebOriginSeed(raw);
    const key = (norm.registrableDomain || norm.hostname || raw).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    if (!norm.ok) {
      const built = buildWebOriginFinding(norm, null, ctx);
      telemetries.push(built.telemetry);
      errors.push({ code: `safety_${norm.reason}`, message: `blocked: ${norm.reason}` });
      continue;
    }

    const fetchResult = await safeFetchOriginMetadata(norm.normalizedUrl, {
      timeoutMs: Math.min(budgetMs, DEFAULT_FETCH_TIMEOUT_MS),
      signal: ctx.signal,
    });
    // Re-check final URL host after redirects
    if (fetchResult.ok && fetchResult.finalUrl) {
      const finalCheck = assertSafePublicHttpsUrl(fetchResult.finalUrl);
      if (!finalCheck.ok) {
        fetchResult.ok = false;
        fetchResult.failureClass = 'redirect_to_blocked';
        fetchResult.resultClass = 'blocked';
      }
    }

    const built = buildWebOriginFinding(norm, fetchResult, ctx);
    telemetries.push(built.telemetry);
    if (built.finding) findings.push(built.finding);
    else if (built.fetchFailed) {
      errors.push({
        code: fetchResult.failureClass || 'fetch_failed',
        message: String(fetchResult.message || fetchResult.failureClass || 'fetch_failed').slice(0, 160),
      });
    } else if (built.weakSnippet) {
      errors.push({ code: 'weak_snippet', message: 'snippet below min chars' });
    }
  }

  return { findings, telemetries, errors };
}

export default {
  WEB_ORIGIN_HOST_FAMILY,
  WEB_ORIGIN_PROVIDER_ID,
  MIN_SNIPPET_CHARS,
  RELATIONSHIP_LABELS,
  registrableDomain,
  looksLikeUrlOrHostname,
  extractUrlCandidatesFromSeed,
  normalizeWebOriginSeed,
  parseOriginMetadata,
  labelWebOriginRelationship,
  safeFetchOriginMetadata,
  buildWebOriginFinding,
  scrubTelemetry,
  resolveWebOriginCandidates,
};
