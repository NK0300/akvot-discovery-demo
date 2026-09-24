/**
 * Adapter-2 — DuckDuckGo Instant Answer JSON (Arch FILL-SPEC 2026-09-24).
 * Default OFF (DISCOVERY_ENABLE_DDG_INSTANT). No HTML SERP · no crawl · F11 hold.
 *
 * Endpoint: https://api.duckduckgo.com/?q=…&format=json&no_redirect=1&no_html=1&skip_disambig=1
 * Extract: AbstractURL + RelatedTopics[].FirstURL + nested Topics[].FirstURL
 * Emit: Track-C url_candidate · C1 UNKNOWN · cite-or-drop · SSRF via gateGeneralWebHitUrl
 *
 * Cite: docs/GO-IMPL-500/MD-WAVE/ARCH-ADAPTER-2-DDG-IA-FILL-ארכיטקט-2026-09-24.md
 */
import { createHash } from 'crypto';
import { assertSafePublicHttpsUrl } from './urlSafety.js';
import { isDdgInstantEnabled as flagEnabled } from './flags.js';
import {
  assertAdapterFetchUrl,
  safeFetchJson,
  adapterBudgetSignal,
} from './adapterContract.js';
import { gateGeneralWebHitUrl } from './generalWebSearch.js';

export const DDG_INSTANT_PROVIDER_ID = 'ddg_instant_answer';
export const DDG_INSTANT_VERSION = '2026-09-24.adapter2.fill.1';
export const DDG_INSTANT_SOURCE_ID = 'ddg_instant_answer';
export const DDG_INSTANT_HOST = 'api.duckduckgo.com';

export const MAX_DDG_INSTANT_RESULTS = 5;
export const DDG_INSTANT_TIMEOUT_MS = 4000;
export const DDG_INSTANT_MAX_BODY_BYTES = 64_000;
/** ≤1 IA HTTP call per session seed (retry of same call allowed once). */
export const MAX_DDG_IA_CALLS = 1;

const STUB_CONTRACT = Object.freeze({
  version: DDG_INSTANT_VERSION,
  maxResults: MAX_DDG_INSTANT_RESULTS,
  timeoutMs: DDG_INSTANT_TIMEOUT_MS,
  maxBodyBytes: DDG_INSTANT_MAX_BODY_BYTES,
  requiresCiteOrDrop: true,
  urlAloneRelationship: 'UNKNOWN',
  identityClaimForbidden: true,
  ssrf: 'gateGeneralWebHitUrl',
  maxIaCalls: MAX_DDG_IA_CALLS,
});

/** @param {object} [opts] */
export function isDdgInstantEnabled(opts = {}) {
  return flagEnabled(opts);
}

/**
 * Build canonical IA request URL (also used as provenance / cite-or-drop).
 * @param {string} q
 */
export function buildDdgIaRequestUrl(q) {
  const query = String(q || '').trim().slice(0, 200);
  const url =
    `https://${DDG_INSTANT_HOST}/?q=${encodeURIComponent(query)}` +
    `&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
  const gate = assertAdapterFetchUrl(url, DDG_INSTANT_PROVIDER_ID);
  if (!gate.ok) {
    const err = new Error(`unsafe_ddg_ia:${gate.reason}`);
    err.code = gate.reason || 'unsafe_url';
    throw err;
  }
  return gate.canonical;
}

/**
 * Walk RelatedTopics (and nested Topics) collecting FirstURL + Text.
 * @param {unknown} node
 * @param {{ url: string, text: string }[]} out
 * @param {number} depth
 */
export function collectRelatedFirstUrls(node, out = [], depth = 0) {
  if (depth > 6 || !node) return out;
  if (Array.isArray(node)) {
    for (const item of node) collectRelatedFirstUrls(item, out, depth + 1);
    return out;
  }
  if (typeof node !== 'object') return out;
  const obj = /** @type {Record<string, unknown>} */ (node);
  const first = obj.FirstURL != null ? String(obj.FirstURL).trim() : '';
  if (first) {
    out.push({
      url: first,
      text: obj.Text != null ? String(obj.Text).slice(0, 400) : '',
    });
  }
  if (Array.isArray(obj.Topics)) {
    collectRelatedFirstUrls(obj.Topics, out, depth + 1);
  }
  // Some payloads nest RelatedTopics again
  if (Array.isArray(obj.RelatedTopics)) {
    collectRelatedFirstUrls(obj.RelatedTopics, out, depth + 1);
  }
  return out;
}

/**
 * Extract candidate URL rows from IA JSON (AbstractURL + RelatedTopics tree).
 * @param {object} data
 * @returns {{ url: string, text: string, from: string }[]}
 */
export function extractDdgIaUrlRows(data) {
  /** @type {{ url: string, text: string, from: string }[]} */
  const rows = [];
  if (!data || typeof data !== 'object') return rows;
  const abs = data.AbstractURL != null ? String(data.AbstractURL).trim() : '';
  if (abs) {
    rows.push({
      url: abs,
      text: data.Abstract != null ? String(data.Abstract).slice(0, 400) : '',
      from: 'AbstractURL',
    });
  }
  const related = collectRelatedFirstUrls(data.RelatedTopics || []);
  for (const r of related) {
    rows.push({ url: r.url, text: r.text, from: 'RelatedTopics' });
  }
  return rows;
}

/**
 * Build one C1-safe URL-candidate finding, or null if URL/provenance fails gate.
 * @param {{
 *   title?: string,
 *   url: string,
 *   snippet?: string,
 *   query?: string,
 *   from?: string,
 *   apiProvenanceUrl: string,
 * }} raw
 */
export function buildDdgInstantHit(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const gate = gateGeneralWebHitUrl(raw.url);
  if (!gate.ok) return null;
  const canonical = gate.canonical;
  // Cite-or-drop: provenance MUST be the IA request URL
  const evidenceUrlGate = assertSafePublicHttpsUrl(raw.apiProvenanceUrl);
  if (!evidenceUrlGate.ok) return null;
  const evidenceUrl = evidenceUrlGate.canonical;
  let hostHint = '';
  try {
    hostHint = new URL(canonical).hostname;
  } catch {
    hostHint = canonical;
  }
  const title =
    String(raw.title || '').trim().slice(0, 240) || hostHint;
  // Snippets = why-found only, never identity
  const snippet =
    raw.snippet != null ? String(raw.snippet).slice(0, 500) : undefined;
  const query = String(raw.query || '').slice(0, 200);
  const from = String(raw.from || 'IA').slice(0, 40);
  const whyFound = query
    ? `DDG Instant Answer (${from}) candidate for “${query}” · not identity · C1 UNKNOWN`
    : `DDG Instant Answer (${from}) candidate · not identity · C1 UNKNOWN`;
  const fp = createHash('sha256')
    .update(`ddgia|${canonical}|${evidenceUrl}`)
    .digest('hex')
    .slice(0, 16);

  return {
    id: `ddgia-${fp}`,
    kind: 'url_candidate',
    title: `${title} — DDG IA candidate`,
    summary: snippet
      ? `DDG IA URL candidate · ${snippet.slice(0, 160)}`
      : 'DDG IA URL candidate · C1 UNKNOWN · not identity',
    url: canonical,
    normalizedUrl: canonical,
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
    familyId: 'ddg_instant_answer',
    hostFamily: 'web_search',
    providerId: DDG_INSTANT_PROVIDER_ID,
    scoreFinding: 0.33,
    facetHints: [
      `provider:${DDG_INSTANT_PROVIDER_ID}`,
      'kind:url_candidate',
      'family:general_web',
      `urlCandidate:${canonical}`,
      'relationship:UNKNOWN',
      'confidence_band:low',
      `source:${DDG_INSTANT_SOURCE_ID}`,
      `from:${from}`,
    ],
    provenance: {
      method: 'ddg_instant_answer',
      providerId: DDG_INSTANT_PROVIDER_ID,
      familyId: 'ddg_instant_answer',
      apiUrl: evidenceUrl,
      apiProvenanceUrl: evidenceUrl,
      extractionMethod: 'ddg_instant_answer',
      signalSummary: whyFound.slice(0, 160),
      source: DDG_INSTANT_SOURCE_ID,
      from,
    },
  };
}

function emptyResult(reason, extra = {}) {
  return {
    providerId: DDG_INSTANT_PROVIDER_ID,
    findings: [],
    partial: !!extra.partial,
    stub: !!extra.stub,
    reason,
    source: DDG_INSTANT_SOURCE_ID,
    contract: {
      ...STUB_CONTRACT,
      adapterVersion: DDG_INSTANT_VERSION,
      source: DDG_INSTANT_SOURCE_ID,
    },
    ...extra,
  };
}

/**
 * @param {number} timeoutMs
 * @param {AbortSignal} [external]
 */
export function ddgInstantBudgetSignal(timeoutMs, external) {
  return adapterBudgetSignal(
    Math.max(50, Math.min(Number(timeoutMs) || DDG_INSTANT_TIMEOUT_MS, DDG_INSTANT_TIMEOUT_MS)),
    external,
  );
}

/**
 * Transient IA failures worth one retry (network/5xx). Parent abort / own timeout → no retry.
 * @param {unknown} err
 * @param {AbortSignal} [ownSignal]
 * @param {AbortSignal} [parentSignal]
 * @param {string|null|undefined} [abortKind]
 */
export function isTransientDdgIaFailure(err, ownSignal, parentSignal, abortKind) {
  if (parentSignal?.aborted || abortKind === 'cancelled') return false;
  if (abortKind === 'timeout') return false;
  if (ownSignal?.aborted) return false;
  const status =
    err && typeof err === 'object' && 'status' in /** @type {object} */ (err)
      ? /** @type {{ status?: number }} */ (err).status
      : undefined;
  if (typeof status === 'number') {
    if (status >= 500 || status === 429 || status === 0) return true;
    if (status > 0 && status < 500) return false;
  }
  const name =
    err && typeof err === 'object' && 'name' in /** @type {object} */ (err)
      ? String(/** @type {{ name?: unknown }} */ (err).name || '')
      : '';
  const msg = String(
    (err && typeof err === 'object' && 'message' in /** @type {object} */ (err)
      ? /** @type {{ message?: unknown }} */ (err).message
      : err) || '',
  );
  if (name === 'AbortError' || /\babort\b|timeout/i.test(msg)) return true;
  if (/network|fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN/i.test(msg)) return true;
  return false;
}

/**
 * @param {unknown} err
 * @param {AbortSignal} [parentSignal]
 * @param {string|null|undefined} [abortKind]
 */
function iaFailureMeta(err, parentSignal, abortKind) {
  if (parentSignal?.aborted || abortKind === 'cancelled') {
    return { reason: 'aborted', errorCode: 'cancelled' };
  }
  if (abortKind === 'timeout') {
    return { reason: 'timeout', errorCode: 'timeout' };
  }
  const status =
    err && typeof err === 'object' && 'status' in /** @type {object} */ (err)
      ? /** @type {{ status?: number }} */ (err).status
      : undefined;
  const name =
    err && typeof err === 'object' && 'name' in /** @type {object} */ (err)
      ? String(/** @type {{ name?: unknown }} */ (err).name || '')
      : '';
  const msg = String(
    (err && typeof err === 'object' && 'message' in /** @type {object} */ (err)
      ? /** @type {{ message?: unknown }} */ (err).message
      : err) || '',
  ).slice(0, 200);
  if (name === 'AbortError' || /\babort\b|timeout/i.test(msg)) {
    return { reason: 'timeout', errorCode: 'timeout', message: msg };
  }
  let errorCode = 'error';
  if (typeof status === 'number' && status > 0) errorCode = `http_${status}`;
  else if (status === 0) errorCode = 'network';
  else if (err && typeof err === 'object' && 'code' in /** @type {object} */ (err)) {
    errorCode = String(/** @type {{ code?: unknown }} */ (err).code || 'error').slice(0, 40);
  }
  return { reason: 'ia_error', errorCode, message: msg };
}

/**
 * @param {{ q: string, budgetMs?: number }} req
 * @param {{
 *   signal?: AbortSignal,
 *   enableDdgInstant?: boolean,
 *   fetchJson?: Function,
 * }} [ctx]
 */
export async function searchDdgInstantAnswer(req, ctx = {}) {
  if (!isDdgInstantEnabled(ctx)) {
    return {
      providerId: DDG_INSTANT_PROVIDER_ID,
      findings: [],
      partial: false,
      stub: true,
      reason: 'flag_off',
      source: DDG_INSTANT_SOURCE_ID,
    };
  }

  const q = String(req?.q || '').trim().slice(0, 200);
  if (!q) {
    return emptyResult('empty_query', { stub: false });
  }

  const budgetMs = Math.min(
    Math.max(50, Number(req?.budgetMs) || DDG_INSTANT_TIMEOUT_MS),
    DDG_INSTANT_TIMEOUT_MS,
  );
  const parentSignal = ctx.signal;
  const budget = ddgInstantBudgetSignal(budgetMs, parentSignal);
  const { signal, dispose } = budget;
  const abortKind = () =>
    typeof budget.abortKind === 'function' ? budget.abortKind() : budget.abortKind;

  try {
    if (signal.aborted) {
      const reason =
        parentSignal?.aborted || abortKind() === 'cancelled' ? 'aborted' : 'timeout';
      return emptyResult(reason, {
        partial: true,
        errorCode: reason === 'aborted' ? 'cancelled' : 'timeout',
      });
    }

    let apiUrl;
    try {
      apiUrl = buildDdgIaRequestUrl(q);
    } catch (e) {
      return emptyResult('unsafe_api_url', {
        partial: true,
        errorCode: e?.code || 'unsafe_url',
        message: String(e?.message || e).slice(0, 200),
      });
    }

    const fetchJson = typeof ctx.fetchJson === 'function' ? ctx.fetchJson : safeFetchJson;

    let data;
    let iaAttempts = 0;
    try {
      let lastErr;
      // ≤1 logical IA call · one transient retry max (same URL)
      for (let attempt = 0; attempt < 2; attempt++) {
        iaAttempts = attempt + 1;
        if (parentSignal?.aborted) {
          return emptyResult('aborted', {
            partial: true,
            errorCode: 'cancelled',
            iaAttempts,
            apiUrl,
          });
        }
        if (signal.aborted) {
          return emptyResult('timeout', {
            partial: true,
            errorCode: 'timeout',
            iaAttempts,
            apiUrl,
          });
        }
        try {
          data = await fetchJson(apiUrl, signal, {
            providerId: DDG_INSTANT_PROVIDER_ID,
            maxBytes: DDG_INSTANT_MAX_BODY_BYTES,
          });
          lastErr = undefined;
          break;
        } catch (e) {
          lastErr = e;
          const transient = isTransientDdgIaFailure(
            e,
            signal,
            parentSignal,
            abortKind(),
          );
          if (!transient || attempt === 1) throw e;
        }
      }
      if (data === undefined && lastErr) throw lastErr;
    } catch (e) {
      const meta = iaFailureMeta(e, parentSignal, abortKind());
      return emptyResult(meta.reason, {
        partial: true,
        message: meta.message || String(e?.message || e).slice(0, 200),
        errorCode: meta.errorCode,
        iaAttempts,
        apiUrl,
      });
    }

    if (signal.aborted) {
      const reason =
        parentSignal?.aborted || abortKind() === 'cancelled' ? 'aborted' : 'timeout';
      return emptyResult(reason, {
        partial: true,
        errorCode: reason === 'aborted' ? 'cancelled' : 'timeout',
        iaAttempts,
        apiUrl,
      });
    }

    const rows = extractDdgIaUrlRows(data || {});
    if (!rows.length) {
      return emptyResult('empty_ia', { stub: false, iaAttempts, apiUrl });
    }

    /** @type {object[]} */
    const findings = [];
    let dropped = 0;

    for (const row of rows) {
      if (findings.length >= MAX_DDG_INSTANT_RESULTS) break;
      const built = buildDdgInstantHit({
        url: row.url,
        title: (() => {
          try {
            return new URL(row.url).hostname;
          } catch {
            return row.url;
          }
        })(),
        snippet: row.text || undefined,
        query: q,
        from: row.from,
        apiProvenanceUrl: apiUrl,
      });
      if (!built) {
        dropped += 1;
        continue;
      }
      if (findings.some((f) => f.url === built.url)) continue;
      findings.push(built);
    }

    return {
      providerId: DDG_INSTANT_PROVIDER_ID,
      findings,
      partial: false,
      stub: false,
      reason: findings.length
        ? 'ok'
        : dropped
          ? 'all_dropped_ssrf_or_registry'
          : 'empty_ia',
      source: DDG_INSTANT_SOURCE_ID,
      dropped,
      apiUrl,
      meta: {
        iaAttempts,
        iaCalls: 1,
        rowCount: rows.length,
      },
      contract: {
        ...STUB_CONTRACT,
        adapterVersion: DDG_INSTANT_VERSION,
        source: DDG_INSTANT_SOURCE_ID,
      },
    };
  } finally {
    try {
      dispose?.();
    } catch {
      /* ignore */
    }
  }
}

export default {
  DDG_INSTANT_PROVIDER_ID,
  DDG_INSTANT_VERSION,
  DDG_INSTANT_SOURCE_ID,
  DDG_INSTANT_HOST,
  MAX_DDG_INSTANT_RESULTS,
  DDG_INSTANT_TIMEOUT_MS,
  DDG_INSTANT_MAX_BODY_BYTES,
  isDdgInstantEnabled,
  searchDdgInstantAnswer,
  buildDdgIaRequestUrl,
  collectRelatedFirstUrls,
  extractDdgIaUrlRows,
  buildDdgInstantHit,
  ddgInstantBudgetSignal,
  isTransientDdgIaFailure,
  gateGeneralWebHitUrl,
};
