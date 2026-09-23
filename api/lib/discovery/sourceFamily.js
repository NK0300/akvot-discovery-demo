import { CANDIDATE_FAMILIES, candidateSkipReason, getCandidateFamily } from './candidateFamilies.js';

/**
 * Source Family registry — B0 families + Preview viaf/web_origin wiring.
 * Family ↔ provider map · independence tags.
 * Cite: SoT 03-SOURCE-FAMILY · ARCHIVE family orch · PRE-GO UNKNOWN/BUDGET
 * NO private sources. NO open crawl. A2/C1 remain FROZEN experimental.
 */

import {
  B0_FAMILIES,
  FAMILY_TO_PROVIDER,
  PROVIDER_TO_FAMILY,
} from './queryPlan.js';

/** Closed independence class vocabulary. */
export const INDEPENDENCE_CLASSES = Object.freeze([
  'independent',
  'shared_host_family',
  'dependent',
  'untrusted_web',
  'unknown',
]);

/**
 * Canonical family descriptors (wired adapters only for productionEligible=false Preview).
 * productionEligible always false until Chief promote GO.
 */
export const SOURCE_FAMILIES = Object.freeze({
  knowledge_graph: Object.freeze({
    familyId: 'knowledge_graph',
    displayName: 'Knowledge graph',
    authorityClass: 'registry',
    independenceClass: 'shared_host_family',
    hostFamily: 'wikimedia',
    safetyClass: 'trusted_api',
    capabilities: Object.freeze(['search', 'lookup_by_id']),
    entityTypes: Object.freeze(['person', 'organization', 'company', 'ambiguous', 'unknown']),
    inputRequirements: Object.freeze(['raw_seed', 'typed_ref', 'locale']),
    outputTypes: Object.freeze(['finding', 'evidence', 'typed_soft_ref']),
    costClass: 'low',
    latencyClass: 'medium',
    rateLimitClass: 'wikimedia',
    failureModes: Object.freeze(['timeout', 'error', 'rate_limited', 'empty', 'unavailable']),
    previewFlag: null,
    b0: true,
    productionEligible: false,
    providerIds: Object.freeze(['wikidata']),
  }),
  encyclopedia: Object.freeze({
    familyId: 'encyclopedia',
    displayName: 'Encyclopedia',
    authorityClass: 'encyclopedia',
    independenceClass: 'shared_host_family',
    hostFamily: 'wikimedia',
    safetyClass: 'trusted_api',
    capabilities: Object.freeze(['search']),
    entityTypes: Object.freeze(['person', 'organization', 'company', 'ambiguous', 'unknown']),
    inputRequirements: Object.freeze(['raw_seed', 'locale']),
    outputTypes: Object.freeze(['finding', 'evidence']),
    costClass: 'low',
    latencyClass: 'medium',
    rateLimitClass: 'wikimedia',
    failureModes: Object.freeze(['timeout', 'error', 'rate_limited', 'empty', 'unavailable']),
    previewFlag: null,
    b0: true,
    productionEligible: false,
    providerIds: Object.freeze(['wikipedia']),
  }),
  bibliographic: Object.freeze({
    familyId: 'bibliographic',
    displayName: 'Bibliographic',
    authorityClass: 'bibliographic',
    independenceClass: 'independent',
    hostFamily: 'openlibrary',
    safetyClass: 'trusted_api',
    capabilities: Object.freeze(['search', 'lookup_by_id']),
    entityTypes: Object.freeze(['person', 'document', 'organization', 'ambiguous', 'unknown']),
    inputRequirements: Object.freeze(['raw_seed', 'typed_ref', 'locale']),
    outputTypes: Object.freeze(['finding', 'evidence', 'typed_soft_ref', 'document_meta']),
    costClass: 'low',
    latencyClass: 'medium',
    rateLimitClass: 'openlibrary',
    failureModes: Object.freeze(['timeout', 'error', 'empty', 'unavailable']),
    previewFlag: null,
    b0: true,
    productionEligible: false,
    providerIds: Object.freeze(['openlibrary']),
  }),
  authority: Object.freeze({
    familyId: 'authority',
    displayName: 'Authority (VIAF)',
    authorityClass: 'registry',
    independenceClass: 'independent',
    hostFamily: 'viaf',
    safetyClass: 'trusted_api',
    capabilities: Object.freeze(['search', 'lookup_by_id']),
    entityTypes: Object.freeze(['person', 'organization', 'company', 'ambiguous']),
    inputRequirements: Object.freeze(['raw_seed', 'typed_ref', 'locale']),
    outputTypes: Object.freeze(['finding', 'evidence', 'typed_soft_ref']),
    costClass: 'low',
    latencyClass: 'medium',
    rateLimitClass: 'viaf',
    failureModes: Object.freeze(['timeout', 'error', 'rate_limited', 'empty', 'unavailable', 'skipped']),
    previewFlag: 'DISCOVERY_ENABLE_VIAF',
    b0: false,
    productionEligible: false,
    frozenExperimental: true,
    providerIds: Object.freeze(['viaf']),
  }),
  web_origin: Object.freeze({
    familyId: 'web_origin',
    displayName: 'Web origin metadata',
    authorityClass: 'web_origin',
    independenceClass: 'untrusted_web',
    hostFamily: 'web_origin',
    safetyClass: 'untrusted_web',
    capabilities: Object.freeze(['origin_metadata']),
    entityTypes: Object.freeze(['url', 'domain']),
    inputRequirements: Object.freeze(['url', 'domain']),
    outputTypes: Object.freeze(['finding', 'evidence', 'url_candidate']),
    costClass: 'medium',
    latencyClass: 'medium',
    rateLimitClass: 'http_fetch',
    failureModes: Object.freeze([
      'timeout',
      'error',
      'blocked_url',
      'unsafe_url',
      'empty',
      'unavailable',
      'skipped',
    ]),
    previewFlag: 'DISCOVERY_ENABLE_WEB_ORIGIN',
    b0: false,
    productionEligible: false,
    frozenExperimental: true,
    /** C1 Bound: never mints typed soft-refs for coalesce attach */
    mintsTypedSoftRefs: false,
    providerIds: Object.freeze(['web_origin']),
  }),
});

/** Registered family ids (wired). */
export const REGISTERED_FAMILY_IDS = Object.freeze(Object.keys(SOURCE_FAMILIES).sort());

/**
 * @param {string} familyId
 */
export function getFamily(familyId) {
  const id = String(familyId || '');
  return SOURCE_FAMILIES[id] || getCandidateFamily(id) || null;
}

/**
 * @param {string} providerId
 */
export function familyIdForProvider(providerId) {
  return PROVIDER_TO_FAMILY[providerId] || null;
}

/**
 * @param {string} familyId
 */
export function providerIdForFamily(familyId) {
  return FAMILY_TO_PROVIDER[familyId] || null;
}

/**
 * Independence tag for corroboration counting.
 * knowledge_graph + encyclopedia share wikimedia → NOT independent of each other.
 * @param {string} familyId
 */
export function independenceTag(familyId) {
  const fam = getFamily(familyId);
  if (!fam) return 'unknown';
  return fam.hostFamily || fam.independenceClass || 'unknown';
}

/**
 * Two families count as independent corroboration iff distinct independence tags
 * and neither is untrusted_web-only without typed refs.
 * @param {string} a
 * @param {string} b
 */
export function areFamiliesIndependent(a, b) {
  if (!a || !b || a === b) return false;
  const ta = independenceTag(a);
  const tb = independenceTag(b);
  if (ta === 'unknown' || tb === 'unknown') return false;
  return ta !== tb;
}

/**
 * Families eligible for a session given Preview flags.
 * B0 always included. viaf/web_origin only when flagged.
 * @param {{ viaf?: boolean, webOrigin?: boolean }} flags
 */
export function eligibleFamilies(flags = {}) {
  const out = [...B0_FAMILIES];
  if (flags.viaf === true || process.env.DISCOVERY_ENABLE_VIAF === '1') {
    out.push('authority');
  }
  if (flags.webOrigin === true || process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1') {
    out.push('web_origin');
  }
  return [...new Set(out)].sort();
}

/**
 * Resolve provider adapters that match planned family ids.
 * @param {object[]} providers — provider objects with .id
 * @param {string[]} familyIds
 */
export function providersForFamilies(providers, familyIds) {
  const want = new Set(familyIds || []);
  const providerIds = new Set(
    [...want].map((f) => FAMILY_TO_PROVIDER[f]).filter(Boolean),
  );
  return (providers || []).filter((p) => providerIds.has(p.id));
}

/**
 * Skip reason when family requested but not eligible / unwired.
 * @param {string} familyId
 * @param {{ viaf?: boolean, webOrigin?: boolean }} flags
 */
export function familySkipReason(familyId, flags = {}) {
  const fam = getFamily(familyId);
  if (!fam) return 'family_unregistered';
  if (fam.b0) return null;
  if (fam.familyId === 'authority' && !(flags.viaf || process.env.DISCOVERY_ENABLE_VIAF === '1')) {
    return 'preview_flag_off:DISCOVERY_ENABLE_VIAF';
  }
  if (
    fam.familyId === 'web_origin' &&
    !(flags.webOrigin || process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1')
  ) {
    return 'preview_flag_off:DISCOVERY_ENABLE_WEB_ORIGIN';
  }
  // Candidate families (filings/news/…) — descriptors only, never launch
  const cand = candidateSkipReason(familyId);
  if (cand) return cand;
  // Unwired conceptual families — not in SOURCE_FAMILIES
  return null;
}

/**
 * Filings / news / registries etc. are conceptual-only — always skipped if planned.
 * @param {string} intentId
 */
export function isUnwiredIntent(intentId) {
  return ['DISCOVER_FILINGS', 'DISCOVER_NEWS', 'DISCOVER_REGISTRIES'].includes(
    String(intentId || ''),
  );
}

export {
  B0_FAMILIES,
  FAMILY_TO_PROVIDER,
  PROVIDER_TO_FAMILY,
};
export { CANDIDATE_FAMILIES, getCandidateFamily, candidateSkipReason } from './candidateFamilies.js';

export default {
  INDEPENDENCE_CLASSES,
  SOURCE_FAMILIES,
  REGISTERED_FAMILY_IDS,
  getFamily,
  familyIdForProvider,
  providerIdForFamily,
  independenceTag,
  areFamiliesIndependent,
  eligibleFamilies,
  providersForFamilies,
  familySkipReason,
  isUnwiredIntent,
  B0_FAMILIES,
  FAMILY_TO_PROVIDER,
  PROVIDER_TO_FAMILY,
};
