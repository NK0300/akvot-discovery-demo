/**
 * General web / search adapter — CONTRACT + STUB only.
 * Default OFF (DISCOVERY_ENABLE_GENERAL_WEB). No uncontrolled crawl.
 * Server may later fill a real bounded search provider behind this contract.
 *
 * Hard locks: SSRF · cite-or-drop · C1 URL≠identity · budgets/timeouts/caps · F11 hold.
 */
import { assertSafePublicHttpsUrl } from './urlSafety.js';

export const GENERAL_WEB_SEARCH_PROVIDER_ID = 'general_web_search';
export const GENERAL_WEB_SEARCH_VERSION = '2026-09-24.stub.1';
export const MAX_GENERAL_WEB_RESULTS = 5;
export const GENERAL_WEB_TIMEOUT_MS = 4000;
export const GENERAL_WEB_MAX_BODY_BYTES = 64_000;

/** @param {object} [opts] */
export function isGeneralWebSearchEnabled(opts = {}) {
  if (opts.enableGeneralWebSearch === true) return true;
  if (opts.enableGeneralWebSearch === false) return false;
  const v = process.env.DISCOVERY_ENABLE_GENERAL_WEB;
  return v === '1' || v === 'true' || v === 'TRUE' || v === 'yes';
}

/**
 * Adapter contract shape (for Server fill). Stub returns empty + reason.
 * @typedef {{
 *   id: string,
 *   title: string,
 *   url: string,
 *   snippet?: string,
 *   epistemicState: 'candidate',
 *   relationship: 'UNKNOWN',
 *   identityClaim: false,
 *   provenance: object,
 * }} GeneralWebHit
 */

/**
 * @param {{ q: string, budgetMs?: number, locale?: string }} req
 * @param {{ signal?: AbortSignal }} [ctx]
 * @returns {Promise<{ providerId: string, findings: object[], partial: boolean, stub: true, reason: string }>}
 */
export async function searchGeneralWeb(req, ctx = {}) {
  void ctx;
  if (!isGeneralWebSearchEnabled()) {
    return {
      providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
      findings: [],
      partial: false,
      stub: true,
      reason: 'flag_off',
    };
  }
  const q = String(req?.q || '').trim().slice(0, 200);
  if (!q) {
    return {
      providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
      findings: [],
      partial: false,
      stub: true,
      reason: 'empty_query',
    };
  }
  // Stub: no network. Server fills behind same contract with SSRF + cite-or-drop.
  return {
    providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
    findings: [],
    partial: true,
    stub: true,
    reason: 'not_implemented_awaiting_server_fill',
    contract: {
      version: GENERAL_WEB_SEARCH_VERSION,
      maxResults: MAX_GENERAL_WEB_RESULTS,
      timeoutMs: GENERAL_WEB_TIMEOUT_MS,
      maxBodyBytes: GENERAL_WEB_MAX_BODY_BYTES,
      requiresCiteOrDrop: true,
      urlAloneRelationship: 'UNKNOWN',
      identityClaimForbidden: true,
      ssrf: 'assertSafePublicHttpsUrl',
    },
  };
}

/**
 * Validate a prospective search hit URL (Server fill helper).
 * @param {string} url
 */
export function gateGeneralWebHitUrl(url) {
  return assertSafePublicHttpsUrl(url);
}

export default {
  GENERAL_WEB_SEARCH_PROVIDER_ID,
  GENERAL_WEB_SEARCH_VERSION,
  isGeneralWebSearchEnabled,
  searchGeneralWeb,
  gateGeneralWebHitUrl,
};
