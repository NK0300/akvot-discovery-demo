/**
 * Discovery Preview feature flags — default OFF.
 * Flag OFF MUST preserve B0 verbatim path (no QueryPlan / family orchestration / plan SSE).
 * Does NOT change Core Acc P0, B0 promote, A2-safe, or C1 Bound.
 *
 * Arch P0 adapter-depth flags (DISCOVERY_WD_CLAIM_PACK / OL_WORKS_SEARCH / WP_PAGEPROPS)
 * deepen existing hosts only; OFF ⇒ current emit surface unchanged.
 */

/** @param {string} name */
function envOn(name) {
  const v = process.env[name];
  return v === '1' || v === 'true' || v === 'TRUE' || v === 'yes';
}

/** QueryPlan + budget + family orchestration Preview path. Default OFF. */
export function isQueryPlanEnabled(opts = {}) {
  if (opts.enableQueryPlan === true) return true;
  if (opts.enableQueryPlan === false) return false;
  return envOn('DISCOVERY_ENABLE_QUERYPLAN');
}

/** Emit SSE `plan` / optional `graph` additive events. Default OFF; implies QueryPlan emit when plan path runs. */
export function isPlanSseEnabled(opts = {}) {
  if (opts.enablePlanSse === true) return true;
  if (opts.enablePlanSse === false) return false;
  // When QueryPlan path is on, plan SSE is on unless explicitly disabled
  if (envOn('DISCOVERY_ENABLE_PLAN_SSE')) return true;
  return isQueryPlanEnabled(opts);
}

/** P0-1 Wikidata bounded claim pack beyond P214. Default OFF. */
export function isWdClaimPackEnabled(opts = {}) {
  if (opts.enableWdClaimPack === true) return true;
  if (opts.enableWdClaimPack === false) return false;
  return envOn('DISCOVERY_WD_CLAIM_PACK');
}

/** P0-2 Open Library /search.json works path (document seed). Default OFF. */
export function isOlWorksSearchEnabled(opts = {}) {
  if (opts.enableOlWorksSearch === true) return true;
  if (opts.enableOlWorksSearch === false) return false;
  return envOn('DISCOVERY_OL_WORKS_SEARCH');
}

/** P0-3 Wikipedia pageprops→qid + short extract. Default OFF. */
export function isWpPagepropsEnabled(opts = {}) {
  if (opts.enableWpPageprops === true) return true;
  if (opts.enableWpPageprops === false) return false;
  return envOn('DISCOVERY_WP_PAGEPROPS');
}

/** General web search adapter (stub/contract). Default OFF. No uncontrolled crawl. */
export function isGeneralWebSearchEnabled(opts = {}) {
  if (opts.enableGeneralWebSearch === true) return true;
  if (opts.enableGeneralWebSearch === false) return false;
  return envOn('DISCOVERY_ENABLE_GENERAL_WEB');
}


/** DuckDuckGo Instant Answer adapter (Adapter-2). Default OFF. No HTML SERP. */
export function isDdgInstantEnabled(opts = {}) {
  if (opts.enableDdgInstant === true) return true;
  if (opts.enableDdgInstant === false) return false;
  return envOn('DISCOVERY_ENABLE_DDG_INSTANT');
}

/** Emit URL/domain CANDIDATE surface (provenance + why-found). Default OFF. */
export function isUrlDomainCandidatesEnabled(opts = {}) {
  if (opts.enableUrlDomainCandidates === true) return true;
  if (opts.enableUrlDomainCandidates === false) return false;
  return envOn('DISCOVERY_ENABLE_URL_DOMAIN_CANDIDATES');
}


/** WEB_ORIGIN origin-metadata enrich hop. Default OFF. Existing flag. */
export function isWebOriginEnabled(opts = {}) {
  if (opts.enableWebOrigin === true) return true;
  if (opts.enableWebOrigin === false) return false;
  return envOn('DISCOVERY_ENABLE_WEB_ORIGIN');
}

/** Night LOOP-SPINE path (discover→evaluate→expand→corroborate→stop). Default OFF. */
export function isNightEnabled(opts = {}) {
  if (opts.enableNight === true) return true;
  if (opts.enableNight === false) return false;
  return envOn('DISCOVERY_ENABLE_NIGHT');
}

export function discoveryFlagSnapshot(opts = {}) {
  return {
    DISCOVERY_ENABLE_QUERYPLAN: isQueryPlanEnabled(opts),
    DISCOVERY_ENABLE_PLAN_SSE: isPlanSseEnabled(opts),
    DISCOVERY_ENABLE_VIAF: envOn('DISCOVERY_ENABLE_VIAF'),
    DISCOVERY_ENABLE_WEB_ORIGIN: isWebOriginEnabled(opts),
    DISCOVERY_WD_CLAIM_PACK: isWdClaimPackEnabled(opts),
    DISCOVERY_OL_WORKS_SEARCH: isOlWorksSearchEnabled(opts),
    DISCOVERY_WP_PAGEPROPS: isWpPagepropsEnabled(opts),
    DISCOVERY_ENABLE_URL_DOMAIN_CANDIDATES: isUrlDomainCandidatesEnabled(opts),
    DISCOVERY_ENABLE_GENERAL_WEB: isGeneralWebSearchEnabled(opts),
    DISCOVERY_ENABLE_DDG_INSTANT: isDdgInstantEnabled(opts),
    DISCOVERY_ENABLE_NIGHT: isNightEnabled(opts),
  };
}

export default {
  isQueryPlanEnabled,
  isPlanSseEnabled,
  isWdClaimPackEnabled,
  isOlWorksSearchEnabled,
  isWpPagepropsEnabled,
  isUrlDomainCandidatesEnabled,
  isGeneralWebSearchEnabled,
  isDdgInstantEnabled,
  isWebOriginEnabled,
  isNightEnabled,
  discoveryFlagSnapshot,
};
