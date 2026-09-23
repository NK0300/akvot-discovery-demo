/**
 * Candidate SourceFamily descriptors — NOT WIRED (no HTTP adapters).
 * Phase 2 registry expansion: descriptors only until separate Chief GO (F11).
 * productionEligible=false · wired=false · DO NOT call from orchestrator launches.
 * Cite: SoT 03 · F11 DO-NOT-IMPLEMENT · B-SOURCE-FAMILY-READINESS
 */

/** @type {Record<string, object>} */
export const CANDIDATE_FAMILIES = Object.freeze({
  filings: {
    familyId: 'filings',
    displayName: 'Regulatory filings',
    authorityClass: 'registry',
    independenceClass: 'independent',
    hostFamily: 'filings',
    safetyClass: 'public_metadata',
    capabilities: ['search'],
    entityTypes: ['company', 'organization'],
    inputRequirements: ['raw_seed'],
    outputTypes: ['finding', 'evidence'],
    costClass: 'medium',
    latencyClass: 'medium',
    rateLimitClass: 'external',
    failureModes: ['timeout', 'error', 'empty', 'unsupported', 'unavailable'],
    previewFlag: 'DISCOVERY_ENABLE_FILINGS',
    b0: false,
    productionEligible: false,
    wired: false,
    providerIds: [],
    skipReason: 'candidate_unwired_f11',
  },
  news: {
    familyId: 'news',
    displayName: 'Public news headlines',
    authorityClass: 'media',
    independenceClass: 'independent',
    hostFamily: 'news',
    safetyClass: 'untrusted_web',
    capabilities: ['search'],
    entityTypes: ['person', 'organization', 'company', 'ambiguous'],
    inputRequirements: ['raw_seed'],
    outputTypes: ['finding', 'evidence'],
    costClass: 'medium',
    latencyClass: 'medium',
    rateLimitClass: 'external',
    failureModes: ['timeout', 'error', 'empty', 'rate_limited', 'unavailable'],
    previewFlag: 'DISCOVERY_ENABLE_NEWS',
    b0: false,
    productionEligible: false,
    wired: false,
    providerIds: [],
    skipReason: 'candidate_unwired_f11',
  },
  registries: {
    familyId: 'registries',
    displayName: 'Public company registries',
    authorityClass: 'registry',
    independenceClass: 'independent',
    hostFamily: 'registries',
    safetyClass: 'public_metadata',
    capabilities: ['search', 'lookup_by_id'],
    entityTypes: ['company', 'organization'],
    inputRequirements: ['raw_seed'],
    outputTypes: ['finding', 'evidence'],
    costClass: 'medium',
    latencyClass: 'high',
    rateLimitClass: 'external',
    failureModes: ['timeout', 'error', 'empty', 'unsupported', 'unavailable'],
    previewFlag: 'DISCOVERY_ENABLE_REGISTRIES',
    b0: false,
    productionEligible: false,
    wired: false,
    providerIds: [],
    skipReason: 'candidate_unwired_f11',
  },
  scholarly: {
    familyId: 'scholarly',
    displayName: 'Scholarly / Crossref-class public metadata',
    authorityClass: 'bibliographic',
    independenceClass: 'independent',
    hostFamily: 'scholarly',
    safetyClass: 'trusted_api',
    capabilities: ['search'],
    entityTypes: ['person', 'document', 'organization'],
    inputRequirements: ['raw_seed'],
    outputTypes: ['finding', 'evidence'],
    costClass: 'low',
    latencyClass: 'medium',
    rateLimitClass: 'external',
    failureModes: ['timeout', 'error', 'empty', 'rate_limited', 'unavailable'],
    previewFlag: 'DISCOVERY_ENABLE_SCHOLARLY',
    b0: false,
    productionEligible: false,
    wired: false,
    providerIds: [],
    skipReason: 'candidate_unwired_f11',
  },
  government: {
    familyId: 'government',
    displayName: 'Government open data',
    authorityClass: 'government',
    independenceClass: 'independent',
    hostFamily: 'government',
    safetyClass: 'public_metadata',
    capabilities: ['search'],
    entityTypes: ['organization', 'company', 'person'],
    inputRequirements: ['raw_seed'],
    outputTypes: ['finding', 'evidence'],
    costClass: 'medium',
    latencyClass: 'high',
    rateLimitClass: 'external',
    failureModes: ['timeout', 'error', 'empty', 'unavailable'],
    previewFlag: 'DISCOVERY_ENABLE_GOVERNMENT',
    b0: false,
    productionEligible: false,
    wired: false,
    providerIds: [],
    skipReason: 'candidate_unwired_f11',
  },
  archives: {
    familyId: 'archives',
    displayName: 'Digital archives',
    authorityClass: 'archive',
    independenceClass: 'independent',
    hostFamily: 'archives',
    safetyClass: 'public_metadata',
    capabilities: ['search'],
    entityTypes: ['person', 'organization', 'document'],
    inputRequirements: ['raw_seed'],
    outputTypes: ['finding', 'evidence'],
    costClass: 'medium',
    latencyClass: 'high',
    rateLimitClass: 'external',
    failureModes: ['timeout', 'error', 'empty', 'unavailable'],
    previewFlag: 'DISCOVERY_ENABLE_ARCHIVES',
    b0: false,
    productionEligible: false,
    wired: false,
    providerIds: [],
    skipReason: 'candidate_unwired_f11',
  },
});

export const CANDIDATE_FAMILY_IDS = Object.freeze(Object.keys(CANDIDATE_FAMILIES));

/**
 * @param {string} familyId
 * @returns {object|null}
 */
export function getCandidateFamily(familyId) {
  return CANDIDATE_FAMILIES[familyId] || null;
}

/**
 * Always skip — never launch HTTP for candidate families this pass.
 * @param {string} familyId
 */
export function candidateSkipReason(familyId) {
  const f = CANDIDATE_FAMILIES[familyId];
  if (!f) return null;
  return f.skipReason || 'candidate_unwired_f11';
}

/**
 * Guard: orchestrator must not launch unwired candidates even if plan lists them.
 * @param {string} familyId
 */
export function isWiredFamily(familyId) {
  if (CANDIDATE_FAMILIES[familyId]) return false;
  return true; // defer to SOURCE_FAMILIES for registered wired set
}

export default {
  CANDIDATE_FAMILIES,
  CANDIDATE_FAMILY_IDS,
  getCandidateFamily,
  candidateSkipReason,
  isWiredFamily,
};
