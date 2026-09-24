/**
 * General web / search adapter — fill behind stub.1 contract.
 * Default OFF (DISCOVERY_ENABLE_GENERAL_WEB). No uncontrolled crawl · F11 hold.
 *
 * Adapter-1 (Arch LOCK 2026-09-24): Wikipedia OpenSearch → page extlinks (en/he ONLY).
 * Cite: docs/GO-IMPL-500/MD-WAVE/ARCH-SECOND-FLAG-GENERAL-WEB-FILL-ארכיטקט-2026-09-24.md
 *
 * Budgets: ≤1 OpenSearch · ≤2 page fetches · ≤5 emitted URL candidates ·
 * wall ≤ GENERAL_WEB_TIMEOUT_MS · body ≤ GENERAL_WEB_MAX_BODY_BYTES · AbortSignal.
 * C1: relationship UNKNOWN · identityClaim false · URL≠identity · cite-or-drop · SSRF.
 */
import { createHash } from 'crypto';
import { assertSafePublicHttpsUrl } from './urlSafety.js';
import { isGeneralWebSearchEnabled as flagEnabled } from './flags.js';
import {
  assertAdapterFetchUrl,
  safeFetchJson,
  adapterBudgetSignal,
} from './adapterContract.js';

export const GENERAL_WEB_SEARCH_PROVIDER_ID = 'general_web_search';
/** Fill version (stub.1 contract preserved when flag OFF / empty q). */
export const GENERAL_WEB_SEARCH_VERSION = '2026-09-24.fill.1';
/** Locked stub contract id. */
export const GENERAL_WEB_CONTRACT_VERSION = '2026-09-24.stub.1';
export const GENERAL_WEB_SOURCE_ID = 'wp_opensearch_extlinks';

export const MAX_GENERAL_WEB_RESULTS = 5;
export const GENERAL_WEB_TIMEOUT_MS = 4000;
export const GENERAL_WEB_MAX_BODY_BYTES = 64_000;
/** Arch hard caps */
export const MAX_OPENSEARCH_RESULTS = 5;
export const MAX_PAGE_FETCHES = 2;
export const MAX_EXTLINKS_PER_PAGE = 20;

/** Registry / authority hosts — not “unknown public domain” candidates. */
const REGISTRY_HOST_RE =
  /(^|\.)(wikipedia\.org|wikidata\.org|wikimedia\.org|mediawiki\.org|viaf\.org|openlibrary\.org|oclc\.org)$/i;

const STUB_CONTRACT = Object.freeze({
  version: GENERAL_WEB_CONTRACT_VERSION,
  maxResults: MAX_GENERAL_WEB_RESULTS,
  timeoutMs: GENERAL_WEB_TIMEOUT_MS,
  maxBodyBytes: GENERAL_WEB_MAX_BODY_BYTES,
  requiresCiteOrDrop: true,
  urlAloneRelationship: 'UNKNOWN',
  identityClaimForbidden: true,
  ssrf: 'assertSafePublicHttpsUrl',
});

/** @param {object} [opts] */
export function isGeneralWebSearchEnabled(opts = {}) {
  return flagEnabled(opts);
}

/**
 * Validate a prospective search hit URL (cite-or-drop + SSRF).
 * Also drops registry hosts (wiki/wikidata/viaf/OL) — not unknown-domain candidates.
 * @param {string} url
 * @returns {{ ok: boolean, reason?: string, canonical?: string }}
 */
export function gateGeneralWebHitUrl(url) {
  const safety = assertSafePublicHttpsUrl(url);
  if (!safety.ok) return safety;
  let host = '';
  try {
    host = new URL(safety.canonical).hostname.toLowerCase();
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }
  if (REGISTRY_HOST_RE.test(host)) {
    return { ok: false, reason: 'registry_host_skipped' };
  }
  return { ok: true, canonical: safety.canonical };
}

/** @param {string} locale */
export function wikiHostForLocale(locale) {
  const lang = String(locale || 'en')
    .trim()
    .toLowerCase()
    .slice(0, 2);
  return lang === 'he' ? 'he.wikipedia.org' : 'en.wikipedia.org';
}

/** @param {string} locale */
export function wikiLangForLocale(locale) {
  const lang = String(locale || 'en')
    .trim()
    .toLowerCase()
    .slice(0, 2);
  return lang === 'he' ? 'he' : 'en';
}

/**
 * @param {string} host
 * @param {string} pathAndQuery  e.g. /w/api.php?...
 */
function wikiApiUrl(host, pathAndQuery) {
  const url = `https://${host}${pathAndQuery.startsWith('/') ? '' : '/'}${pathAndQuery}`;
  const gate = assertAdapterFetchUrl(url, 'wikipedia');
  if (!gate.ok) {
    const err = new Error(`unsafe_wiki_api:${gate.reason}`);
    err.code = gate.reason || 'unsafe_url';
    throw err;
  }
  return gate.canonical;
}

/**
 * Build one C1-safe URL-candidate finding, or null if URL fails gate.
 * @param {{
 *   title?: string,
 *   url: string,
 *   snippet?: string,
 *   query?: string,
 *   pageTitle: string,
 *   wikiLang: string,
 *   wikiPageUrl: string,
 *   apiProvenanceUrl: string,
 * }} raw
 */
export function buildGeneralWebHit(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const gate = gateGeneralWebHitUrl(raw.url);
  if (!gate.ok) return null;
  const canonical = gate.canonical;
  const pageTitle = String(raw.pageTitle || '').slice(0, 240);
  const wikiLang = String(raw.wikiLang || 'en').slice(0, 8);
  const wikiPageUrl = String(raw.wikiPageUrl || '').slice(0, 500);
  // Cite-or-drop: evidence must point at the wiki page/API that justified the extlink
  const evidenceUrlGate = assertSafePublicHttpsUrl(wikiPageUrl || raw.apiProvenanceUrl);
  if (!evidenceUrlGate.ok) return null;
  const evidenceUrl = evidenceUrlGate.canonical;
  const title =
    String(raw.title || '').trim().slice(0, 240) ||
    (() => {
      try {
        return new URL(canonical).hostname;
      } catch {
        return canonical;
      }
    })();
  const snippet = raw.snippet != null ? String(raw.snippet).slice(0, 500) : undefined;
  const query = String(raw.query || '').slice(0, 200);
  const whyFound = query
    ? `WP OpenSearch→extlinks candidate for “${query}” via 「${pageTitle}」 · not identity · C1 UNKNOWN`
    : `WP OpenSearch→extlinks candidate via 「${pageTitle}」 · not identity · C1 UNKNOWN`;
  const fp = createHash('sha256')
    .update(`gw|${canonical}|${wikiLang}|${pageTitle}`)
    .digest('hex')
    .slice(0, 16);

  return {
    id: `gw-${fp}`,
    kind: 'url_candidate',
    title: `${title} — search/extlink candidate`,
    summary: snippet
      ? `Search-sourced URL candidate · ${snippet.slice(0, 160)}`
      : 'Search-sourced URL candidate · C1 UNKNOWN · not identity',
    url: canonical,
    normalizedUrl: canonical,
    // Evidence cites the wiki page that listed this extlink (Arch cite-or-drop)
    provenanceUrl: evidenceUrl,
    snippet,
    quote: snippet || whyFound.slice(0, 240),
    urlAlone: true,
    urlCandidate: true,
    urlIsNotIdentity: true,
    searchHit: true,
    identityClaim: false,
    epistemicState: 'candidate',
    relationship: 'UNKNOWN',
    relationshipState: 'UNKNOWN',
    confirmationState: 'candidate',
    whyFound,
    sourceFamily: 'general_web',
    familyId: 'general_web_search',
    hostFamily: 'web_search',
    providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
    scoreFinding: 0.34,
    facetHints: [
      `provider:${GENERAL_WEB_SEARCH_PROVIDER_ID}`,
      'kind:url_candidate',
      'family:general_web',
      `urlCandidate:${canonical}`,
      'relationship:UNKNOWN',
      'confidence_band:low',
      `source:${GENERAL_WEB_SOURCE_ID}`,
      `wikiLang:${wikiLang}`,
    ],
    provenance: {
      method: 'wp_opensearch_extlinks',
      providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
      familyId: 'general_web_search',
      pageTitle,
      wikiLang,
      wikiPageUrl: evidenceUrl,
      apiProvenanceUrl: String(raw.apiProvenanceUrl || '').slice(0, 500),
      extractionMethod: 'wp_opensearch_extlinks',
      signalSummary: whyFound.slice(0, 160),
      source: GENERAL_WEB_SOURCE_ID,
    },
  };
}

function emptyResult(reason, extra = {}) {
  return {
    providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
    findings: [],
    partial: !!extra.partial,
    stub: !!extra.stub,
    reason,
    source: GENERAL_WEB_SOURCE_ID,
    contract: {
      ...STUB_CONTRACT,
      adapterVersion: GENERAL_WEB_SEARCH_VERSION,
      source: GENERAL_WEB_SOURCE_ID,
    },
    ...extra,
  };
}

/**
 * Combine timeout with optional external AbortSignal.
 * @param {number} timeoutMs
 * @param {AbortSignal} [external]
 */
export function generalWebBudgetSignal(timeoutMs, external) {
  return adapterBudgetSignal(
    Math.max(50, Math.min(Number(timeoutMs) || GENERAL_WEB_TIMEOUT_MS, GENERAL_WEB_TIMEOUT_MS)),
    external,
  );
}

/**
 * @param {string} host
 * @param {string} q
 * @param {AbortSignal} signal
 * @param {(url: string, signal: AbortSignal, opts?: object) => Promise<object>} fetchJson
 */
async function runOpenSearch(host, q, signal, fetchJson) {
  const path =
    `/w/api.php?action=opensearch` +
    `&search=${encodeURIComponent(q)}` +
    `&limit=${MAX_OPENSEARCH_RESULTS}` +
    `&namespace=0&format=json&origin=*`;
  const url = wikiApiUrl(host, path);
  const data = await fetchJson(url, signal, {
    providerId: 'wikipedia',
    maxBytes: GENERAL_WEB_MAX_BODY_BYTES,
  });
  const titles = Array.isArray(data?.[1]) ? data[1] : [];
  const descs = Array.isArray(data?.[2]) ? data[2] : [];
  const urls = Array.isArray(data?.[3]) ? data[3] : [];
  /** @type {{ title: string, desc: string, pageUrl: string }[]} */
  const rows = [];
  for (let i = 0; i < titles.length && rows.length < MAX_OPENSEARCH_RESULTS; i++) {
    const title = String(titles[i] || '').trim();
    if (!title) continue;
    const pageUrl = String(urls[i] || `https://${host}/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`);
    rows.push({
      title,
      desc: String(descs[i] || '').slice(0, 400),
      pageUrl,
    });
  }
  return { rows, apiUrl: url };
}

/**
 * ≤1 query fetch covering ≤2 titles (counts as ≤2 page fetches budget).
 * @param {string} host
 * @param {string[]} titles
 * @param {AbortSignal} signal
 * @param {Function} fetchJson
 */
async function runExtlinksQuery(host, titles, signal, fetchJson) {
  const slice = titles.slice(0, MAX_PAGE_FETCHES).filter(Boolean);
  if (!slice.length) return { pages: [], apiUrl: '' };
  const path =
    `/w/api.php?action=query` +
    `&prop=extlinks|info|extracts` +
    `&exintro=1&explaintext=1&exchars=240` +
    `&ellimit=${MAX_EXTLINKS_PER_PAGE}` +
    `&inprop=url` +
    `&titles=${slice.map((t) => encodeURIComponent(t)).join('|')}` +
    `&format=json&origin=*`;
  const url = wikiApiUrl(host, path);
  const data = await fetchJson(url, signal, {
    providerId: 'wikipedia',
    maxBytes: GENERAL_WEB_MAX_BODY_BYTES,
  });
  const pageMap = data?.query?.pages && typeof data.query.pages === 'object' ? data.query.pages : {};
  const pages = Object.values(pageMap).filter(
    (p) => p && p.missing == null && p.invalid == null,
  );
  return { pages, apiUrl: url };
}

/**
 * @param {{ q: string, budgetMs?: number, locale?: string }} req
 * @param {{
 *   signal?: AbortSignal,
 *   enableGeneralWebSearch?: boolean,
 *   fetchJson?: Function,
 * }} [ctx]
 */
export async function searchGeneralWeb(req, ctx = {}) {
  if (!isGeneralWebSearchEnabled(ctx)) {
    return {
      providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
      findings: [],
      partial: false,
      stub: true,
      reason: 'flag_off',
      source: GENERAL_WEB_SOURCE_ID,
    };
  }

  const q = String(req?.q || '').trim().slice(0, 200);
  if (!q) {
    return emptyResult('empty_query', { stub: false });
  }

  const budgetMs = Math.min(
    Math.max(50, Number(req?.budgetMs) || GENERAL_WEB_TIMEOUT_MS),
    GENERAL_WEB_TIMEOUT_MS,
  );
  const { signal } = generalWebBudgetSignal(budgetMs, ctx.signal);
  if (signal.aborted) {
    return emptyResult('aborted', { partial: true });
  }

  const fetchJson = typeof ctx.fetchJson === 'function' ? ctx.fetchJson : safeFetchJson;
  const host = wikiHostForLocale(req?.locale);
  const wikiLang = wikiLangForLocale(req?.locale);

  let open;
  try {
    open = await runOpenSearch(host, q, signal, fetchJson);
  } catch (e) {
    const isAbort =
      signal.aborted ||
      e?.name === 'AbortError' ||
      /abort|timeout/i.test(String(e?.message || e));
    return emptyResult(isAbort ? 'timeout' : 'opensearch_error', {
      partial: true,
      message: String(e?.message || e).slice(0, 200),
    });
  }

  if (signal.aborted) {
    return emptyResult('timeout', { partial: true });
  }

  const topTitles = open.rows.slice(0, MAX_PAGE_FETCHES).map((r) => r.title);
  if (!topTitles.length) {
    return emptyResult('empty_opensearch', { stub: false });
  }

  let ext;
  try {
    ext = await runExtlinksQuery(host, topTitles, signal, fetchJson);
  } catch (e) {
    const isAbort =
      signal.aborted ||
      e?.name === 'AbortError' ||
      /abort|timeout/i.test(String(e?.message || e));
    return emptyResult(isAbort ? 'timeout' : 'extlinks_error', {
      partial: true,
      message: String(e?.message || e).slice(0, 200),
    });
  }

  if (signal.aborted) {
    return emptyResult('timeout', { partial: true });
  }

  const pageByTitle = new Map();
  for (const p of ext.pages || []) {
    const t = String(p.title || '').trim();
    if (t) pageByTitle.set(t.toLowerCase(), p);
  }

  /** @type {object[]} */
  const findings = [];
  let dropped = 0;

  for (const row of open.rows.slice(0, MAX_PAGE_FETCHES)) {
    if (findings.length >= MAX_GENERAL_WEB_RESULTS) break;
    const page = pageByTitle.get(row.title.toLowerCase());
    const extract = page?.extract ? String(page.extract).slice(0, 400) : row.desc;
    const wikiPageUrl =
      page?.canonicalurl ||
      page?.fullurl ||
      row.pageUrl ||
      `https://${host}/wiki/${encodeURIComponent(row.title.replace(/ /g, '_'))}`;
    const extlinks = Array.isArray(page?.extlinks) ? page.extlinks : [];
    for (const el of extlinks) {
      if (findings.length >= MAX_GENERAL_WEB_RESULTS) break;
      const rawUrl = String(el?.['*'] || el?.url || '').trim();
      if (!rawUrl) continue;
      const built = buildGeneralWebHit({
        url: rawUrl,
        title: (() => {
          try {
            return new URL(rawUrl).hostname;
          } catch {
            return rawUrl;
          }
        })(),
        snippet: extract || undefined,
        query: q,
        pageTitle: row.title,
        wikiLang,
        wikiPageUrl,
        apiProvenanceUrl: ext.apiUrl || open.apiUrl,
      });
      if (!built) {
        dropped += 1;
        continue;
      }
      if (findings.some((f) => f.url === built.url)) continue;
      findings.push(built);
    }
  }

  return {
    providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
    findings,
    partial: false,
    stub: false,
    reason: findings.length
      ? 'ok'
      : dropped
        ? 'all_dropped_ssrf_or_registry'
        : 'empty_extlinks',
    source: GENERAL_WEB_SOURCE_ID,
    dropped,
    meta: {
      wikiLang,
      host,
      openSearchTitles: topTitles,
      pageFetches: topTitles.length ? 1 : 0,
      openSearchCalls: 1,
    },
    contract: {
      ...STUB_CONTRACT,
      adapterVersion: GENERAL_WEB_SEARCH_VERSION,
      source: GENERAL_WEB_SOURCE_ID,
    },
  };
}

export default {
  GENERAL_WEB_SEARCH_PROVIDER_ID,
  GENERAL_WEB_SEARCH_VERSION,
  GENERAL_WEB_CONTRACT_VERSION,
  GENERAL_WEB_SOURCE_ID,
  MAX_GENERAL_WEB_RESULTS,
  GENERAL_WEB_TIMEOUT_MS,
  GENERAL_WEB_MAX_BODY_BYTES,
  isGeneralWebSearchEnabled,
  searchGeneralWeb,
  gateGeneralWebHitUrl,
  buildGeneralWebHit,
  wikiHostForLocale,
  wikiLangForLocale,
  generalWebBudgetSignal,
};
