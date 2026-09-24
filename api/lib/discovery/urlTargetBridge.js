/**
 * L1 · WD P856 officialWebsiteUrls → QueryPlan urlTargets → gated web_origin.
 * C1-safe: URL-alone ≠ identity · never soft-ref from URL · SSRF fail-closed.
 * Flags: DISCOVERY_WD_CLAIM_PACK + DISCOVERY_ENABLE_WEB_ORIGIN (default OFF).
 * Cite: MD-WAVE L1 · ARCH P856 plan-visible urlTargets · Checkpoint F SSRF.
 */
import { assertSafePublicHttpsUrl } from './urlSafety.js';
import { isWdClaimPackEnabled } from './flags.js';
import { selectFetchablePlanUrlTargets } from './security.js';

export const URL_TARGET_BRIDGE_VERSION = '2026-09-24.l1-p856-urltargets1';
export const MAX_P856_URL_TARGETS = 5;
export const P856_CLAIM = 'P856';
export const P856_SOURCE = 'wikidata_p856';

/**
 * Bridge enabled only when claim-pack + web_origin Preview flags are ON.
 * QueryPlan flag is orthogonal (plan merge when plan present; B0 one-hop otherwise).
 * @param {object} [opts]
 */
export function isWdP856UrlBridgeEnabled(opts = {}) {
  const claim =
    opts.enableWdClaimPack === true ||
    (opts.enableWdClaimPack !== false && isWdClaimPackEnabled(opts));
  const web =
    opts.enableWebOrigin === true ||
    (opts.enableWebOrigin !== false &&
      (process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1' ||
        process.env.DISCOVERY_ENABLE_WEB_ORIGIN === 'true'));
  return !!(claim && web);
}

/**
 * Harvest official website URL candidates from WD (or any) findings.
 * Prefers `officialWebsiteUrls` array; falls back to facet `officialWebsite:https://…`.
 * Never treats URL as soft-ref / identity.
 *
 * @param {object[]} findings
 * @returns {{ url: string, qid?: string, source: string, claim: string }[]}
 */
export function harvestOfficialWebsiteUrlCandidates(findings = []) {
  /** @type {Map<string, { url: string, qid?: string, source: string, claim: string }>} */
  const byUrl = new Map();
  for (const f of findings || []) {
    if (!f || typeof f !== 'object') continue;
    const qid =
      (typeof f.sourceRecordId === 'string' && /^Q\d+$/i.test(f.sourceRecordId)
        ? f.sourceRecordId.toUpperCase()
        : null) ||
      (typeof f.id === 'string' && String(f.id).replace(/^wd-/i, '').match(/^Q\d+$/i)
        ? String(f.id).replace(/^wd-/i, '').toUpperCase()
        : null) ||
      undefined;

    const fromArray = Array.isArray(f.officialWebsiteUrls) ? f.officialWebsiteUrls : [];
    for (const raw of fromArray) {
      const check = assertSafePublicHttpsUrl(String(raw || '').trim());
      if (!check.ok) continue;
      const url = check.canonical || String(raw).trim();
      if (!byUrl.has(url)) {
        byUrl.set(url, { url, qid, source: P856_SOURCE, claim: P856_CLAIM });
      }
    }

    for (const h of Array.isArray(f.facetHints) ? f.facetHints : []) {
      const m = String(h || '').match(/^officialWebsite:(https:\/\/\S+)$/i);
      if (!m) continue;
      const check = assertSafePublicHttpsUrl(m[1]);
      if (!check.ok) continue;
      const url = check.canonical || m[1];
      if (!byUrl.has(url)) {
        byUrl.set(url, { url, qid, source: P856_SOURCE, claim: P856_CLAIM });
      }
    }
  }
  return [...byUrl.values()].slice(0, MAX_P856_URL_TARGETS);
}

/**
 * Classify raw URL strings into plan urlTargets rows (allowed | blocked | unsafe).
 * Poison / private / http / userinfo → not allowed. Never fetch here.
 *
 * @param {string[]} urls
 * @returns {{ url: string, safety: 'allowed'|'blocked'|'unsafe', reason?: string, source?: string, claim?: string }[]}
 */
export function classifyUrlsAsPlanTargets(urls = [], metaByUrl = new Map()) {
  const out = [];
  const seen = new Set();
  for (const raw of urls || []) {
    const s = String(raw || '').trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    const check = assertSafePublicHttpsUrl(s);
    const meta = metaByUrl.get(s) || metaByUrl.get(check.canonical) || {};
    if (check.ok) {
      out.push({
        url: (check.canonical || s).slice(0, 500),
        safety: 'allowed',
        source: meta.source || P856_SOURCE,
        claim: meta.claim || P856_CLAIM,
        ...(meta.qid ? { citedQid: meta.qid } : {}),
      });
    } else {
      const safety = check.reason === 'blocked_host' ? 'blocked' : 'unsafe';
      out.push({
        url: s.slice(0, 500),
        safety,
        reason: check.reason || 'unsafe',
        source: meta.source || P856_SOURCE,
        claim: meta.claim || P856_CLAIM,
      });
    }
  }
  return out;
}

/**
 * Merge harvested P856 URLs into plan.urlTargets (dedupe by URL).
 * Mutates plan when provided; returns summary. Unsafe never marked allowed.
 *
 * @param {object|null|undefined} plan
 * @param {{ url: string, qid?: string, source?: string, claim?: string }[]} candidates
 * @returns {{ plan: object|null, added: string[], dropped: object[], urlTargets: object[] }}
 */
export function mergeOfficialWebsiteUrlTargets(plan, candidates = []) {
  const metaByUrl = new Map();
  const urlList = [];
  for (const c of candidates || []) {
    if (!c?.url) continue;
    urlList.push(c.url);
    metaByUrl.set(c.url, c);
  }
  const classified = classifyUrlsAsPlanTargets(urlList, metaByUrl);
  const dropped = classified.filter((t) => t.safety !== 'allowed');
  const allowed = classified.filter((t) => t.safety === 'allowed');

  if (!plan || typeof plan !== 'object') {
    return {
      plan: null,
      added: allowed.map((t) => t.url),
      dropped,
      urlTargets: classified.slice(0, MAX_P856_URL_TARGETS),
    };
  }

  const existing = Array.isArray(plan.urlTargets) ? [...plan.urlTargets] : [];
  const seen = new Set(
    existing.map((t) => String(t?.url || '').toLowerCase()).filter(Boolean),
  );
  /** @type {string[]} */
  const added = [];
  for (const t of allowed) {
    const key = String(t.url).toLowerCase();
    if (seen.has(key)) continue;
    if (existing.filter((x) => x.safety === 'allowed').length >= MAX_P856_URL_TARGETS) break;
    existing.push({
      url: t.url,
      safety: 'allowed',
      source: t.source,
      claim: t.claim,
      ...(t.citedQid ? { citedQid: t.citedQid } : {}),
    });
    seen.add(key);
    added.push(t.url);
  }
  // Keep unsafe/blocked rows visible for audit (not fetchable)
  for (const t of dropped) {
    const key = String(t.url).toLowerCase();
    if (seen.has(key)) continue;
    existing.push({
      url: t.url,
      safety: t.safety,
      reason: t.reason,
      source: t.source,
      claim: t.claim,
    });
    seen.add(key);
  }
  plan.urlTargets = existing;
  return { plan, added, dropped, urlTargets: existing };
}

/**
 * Collect P856 candidates from provider batches (pre- or post-normalize).
 * @param {object[]} batches
 */
export function harvestOfficialWebsiteUrlsFromBatches(batches = []) {
  const findings = [];
  for (const b of batches || []) {
    if (b?.providerId && b.providerId !== 'wikidata' && b.providerId !== 'knowledge_graph') {
      // Still scan — officialWebsiteUrls only minted by WD claim pack today
    }
    for (const f of b?.findings || []) findings.push(f);
  }
  return harvestOfficialWebsiteUrlCandidates(findings);
}

/**
 * Build sourceFinding / facet provenance for web_origin findings from P856.
 * @param {{ url: string, qid?: string }[]} candidates
 * @param {string} url
 */
export function p856ProvenanceForUrl(candidates, url) {
  const hit = (candidates || []).find((c) => c.url === url) || candidates?.[0];
  const qid = hit?.qid;
  const sourceFinding = qid
    ? `${P856_SOURCE}:${qid}`
    : P856_SOURCE;
  const facetHints = [
    `sourceClaim:${P856_CLAIM}`,
    `citedProvider:wikidata`,
    ...(qid ? [`citedQid:${qid}`] : []),
    `bridge:${URL_TARGET_BRIDGE_VERSION}`,
  ];
  return { sourceFinding, facetHints, extractionMethod: 'origin_metadata_from_wd_p856' };
}

/**
 * Fail-closed fetchable URL list from a plan after P856 merge.
 * Poison ⇒ [].
 * @param {object} plan
 */
export function fetchableUrlTargetsFromPlan(plan) {
  const gate = selectFetchablePlanUrlTargets(plan || { urlTargets: [] });
  if (gate.poison || gate.failClosed) {
    return { urls: [], poison: true, blocked: gate.blocked || [], gate };
  }
  return {
    urls: (gate.urls || []).slice(0, MAX_P856_URL_TARGETS),
    poison: false,
    blocked: gate.blocked || [],
    gate,
  };
}

export default {
  URL_TARGET_BRIDGE_VERSION,
  MAX_P856_URL_TARGETS,
  P856_CLAIM,
  P856_SOURCE,
  isWdP856UrlBridgeEnabled,
  harvestOfficialWebsiteUrlCandidates,
  harvestOfficialWebsiteUrlsFromBatches,
  classifyUrlsAsPlanTargets,
  mergeOfficialWebsiteUrlTargets,
  p856ProvenanceForUrl,
  fetchableUrlTargetsFromPlan,
};
