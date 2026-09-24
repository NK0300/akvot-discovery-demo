import { CANDIDATE_FAMILIES, candidateSkipReason, getCandidateFamily } from './candidateFamilies.js';

/**
 * Source Family registry — SoT for B0 + Preview families (incl. GW/DDG rows).
 * Family ↔ provider map · independence tags.
 * Cite: SoT 03-SOURCE-FAMILY · ARCHIVE family orch · PRE-GO UNKNOWN/BUDGET
 * NO private sources. NO open crawl. A2/C1 remain FROZEN experimental.
 */

/** Closed independence class vocabulary. */
export const INDEPENDENCE_CLASSES = Object.freeze([
  'independent',
  'shared_host_family',
  'dependent',
  'untrusted_web',
  'unknown',
]);

/**
 * Closed capability enum (Track B · §04 §2 "intent.capabilities_needed ⊆ family.capabilities").
 * Registry rows declare ONLY capabilities[] + entityTypes[] (+ optional displayLabel).
 * No scoring / priority / execution logic in the Registry — ordering, priority and
 * fallback stay in queryPlan/Policy.
 * C1: NO capability may grant identity or bypass C1 (no identity-claim / same-entity /
 * verified-type values). A row declaring any value outside this enum is rejected
 * fail-closed (never matched into a plan).
 */
export const ACCESS_CAPABILITIES = Object.freeze([
  'search',
  'lookup_by_id',
  'url_candidate',
]);
/** Intent-serving capabilities (what QueryPlan intents may require). */
export const INTENT_CAPABILITIES = Object.freeze([
  'reference_search', // search public reference records for a seed (SEARCH INTENT ≠ ENTITY TRUTH)
  'open_knowledge_search', // open knowledge bases (Wikimedia / OpenLibrary); authority intentionally absent
  'bibliographic_records', // bibliographic / publication records
  'document_records', // document-oriented records (bibliographic + encyclopedic)
  'origin_metadata', // public web-origin metadata for a URL/domain (URL-alone → UNKNOWN)
]);
export const FAMILY_CAPABILITY_ENUM = Object.freeze([
  ...ACCESS_CAPABILITIES,
  ...INTENT_CAPABILITIES,
]);
/** Closed entityTypes enum — mirrors queryPlan SEED_CLASSES (asserted in tests). */
export const ENTITY_TYPE_ENUM = Object.freeze([
  'person',
  'company',
  'organization',
  'domain',
  'url',
  'document',
  'ambiguous',
  'unknown',
]);
/** Identity-ish tokens that must never appear as a capability or display label. */
const IDENTITY_DENY_RE = /identity|same|verif|claim|merge|commit|truth|confirm/i;
const DISPLAY_LABEL_DENY_RE = /verified|same|identical|confirmed|מאומת|זהה|אומת|ודאי/i;

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
    capabilities: Object.freeze(['search', 'lookup_by_id', 'reference_search', 'open_knowledge_search']),
    entityTypes: Object.freeze(['person', 'organization', 'company', 'ambiguous', 'unknown', 'url', 'domain', 'document']),
    displayLabel: Object.freeze({ en: 'Knowledge graph', he: 'גרף ידע' }),
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
    wired: true,
  }),
  encyclopedia: Object.freeze({
    familyId: 'encyclopedia',
    displayName: 'Encyclopedia',
    authorityClass: 'encyclopedia',
    independenceClass: 'shared_host_family',
    hostFamily: 'wikimedia',
    safetyClass: 'trusted_api',
    capabilities: Object.freeze(['search', 'reference_search', 'open_knowledge_search', 'document_records']),
    entityTypes: Object.freeze(['person', 'organization', 'company', 'ambiguous', 'unknown', 'url', 'domain', 'document']),
    displayLabel: Object.freeze({ en: 'Encyclopedia', he: 'אנציקלופדיה' }),
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
    wired: true,
  }),
  bibliographic: Object.freeze({
    familyId: 'bibliographic',
    displayName: 'Bibliographic',
    authorityClass: 'bibliographic',
    independenceClass: 'independent',
    hostFamily: 'openlibrary',
    safetyClass: 'trusted_api',
    capabilities: Object.freeze(['search', 'lookup_by_id', 'reference_search', 'open_knowledge_search', 'bibliographic_records', 'document_records']),
    entityTypes: Object.freeze(['person', 'document', 'organization', 'ambiguous', 'unknown', 'url', 'domain', 'company']),
    displayLabel: Object.freeze({ en: 'Bibliographic', he: 'ביבליוגרפיה' }),
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
    wired: true,
  }),
  authority: Object.freeze({
    familyId: 'authority',
    displayName: 'Authority (VIAF)',
    authorityClass: 'registry',
    independenceClass: 'independent',
    hostFamily: 'viaf',
    safetyClass: 'trusted_api',
    capabilities: Object.freeze(['search', 'lookup_by_id', 'reference_search']),
    entityTypes: Object.freeze(['person', 'organization', 'company', 'ambiguous', 'url', 'domain', 'document']),
    displayLabel: Object.freeze({ en: 'Authority (VIAF)', he: 'רשומות סמכות (VIAF)' }),
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
    wired: true,
  }),
  web_origin: Object.freeze({
    familyId: 'web_origin',
    displayName: 'Web origin metadata',
    authorityClass: 'web_origin',
    independenceClass: 'untrusted_web',
    hostFamily: 'web_origin',
    safetyClass: 'untrusted_web',
    capabilities: Object.freeze(['origin_metadata']),
    entityTypes: Object.freeze(['url', 'domain', 'company', 'organization']),
    displayLabel: Object.freeze({ en: 'Web origin metadata', he: 'מטא-נתוני אתר' }),
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
    wired: true,
  }),
  general_web: Object.freeze({
    familyId: 'general_web',
    displayName: 'General web (Wikipedia OpenSearch → extlinks)',
    authorityClass: 'web_search',
    independenceClass: 'untrusted_web',
    hostFamily: 'general_web',
    safetyClass: 'untrusted_web',
    capabilities: Object.freeze(['search', 'url_candidate']),
    entityTypes: Object.freeze(['person', 'organization', 'company', 'ambiguous', 'unknown']),
    displayLabel: Object.freeze({ en: 'General web', he: 'חיפוש רשת כללי' }),
    inputRequirements: Object.freeze(['raw_seed', 'locale']),
    outputTypes: Object.freeze(['finding', 'url_candidate']),
    costClass: 'medium',
    latencyClass: 'medium',
    rateLimitClass: 'wikimedia',
    failureModes: Object.freeze([
      'timeout',
      'error',
      'empty',
      'opensearch_error',
      'extlinks_error',
      'unavailable',
      'skipped',
    ]),
    previewFlag: 'DISCOVERY_ENABLE_GENERAL_WEB',
    b0: false,
    productionEligible: false,
    wired: true,
    frozenExperimental: true,
    mintsTypedSoftRefs: false,
    providerIds: Object.freeze(['general_web_search']),
  }),
  ddg_instant: Object.freeze({
    familyId: 'ddg_instant',
    displayName: 'DuckDuckGo Instant Answer (JSON)',
    authorityClass: 'web_search',
    independenceClass: 'untrusted_web',
    hostFamily: 'ddg_instant',
    safetyClass: 'untrusted_web',
    capabilities: Object.freeze(['search', 'url_candidate']),
    entityTypes: Object.freeze(['person', 'organization', 'company', 'ambiguous', 'unknown']),
    displayLabel: Object.freeze({ en: 'DuckDuckGo Instant Answer', he: 'תשובה מיידית DuckDuckGo' }),
    inputRequirements: Object.freeze(['raw_seed']),
    outputTypes: Object.freeze(['finding', 'url_candidate']),
    costClass: 'low',
    latencyClass: 'fast',
    rateLimitClass: 'ddg',
    failureModes: Object.freeze([
      'timeout',
      'error',
      'empty',
      'ia_error',
      'unavailable',
      'skipped',
    ]),
    previewFlag: 'DISCOVERY_ENABLE_DDG_INSTANT',
    b0: false,
    productionEligible: false,
    wired: true,
    frozenExperimental: true,
    mintsTypedSoftRefs: false,
    providerIds: Object.freeze(['ddg_instant_answer']),
  }),
});


/** Derive B0 + provider maps from SOURCE_FAMILIES — registry is SoT (Track B / §05 / §16). */
function deriveFamilyMaps(families) {
  const b0 = [];
  /** @type {Record<string, string>} */
  const familyToProvider = {};
  /** @type {Record<string, string>} */
  const providerToFamily = {};
  for (const fam of Object.values(families)) {
    if (!fam || !fam.familyId) continue;
    if (fam.b0) b0.push(fam.familyId);
    const pid = Array.isArray(fam.providerIds) && fam.providerIds[0] ? fam.providerIds[0] : null;
    if (pid) {
      familyToProvider[fam.familyId] = pid;
      providerToFamily[pid] = fam.familyId;
    }
  }
  return {
    B0_FAMILIES: Object.freeze(b0),
    FAMILY_TO_PROVIDER: Object.freeze(familyToProvider),
    PROVIDER_TO_FAMILY: Object.freeze(providerToFamily),
  };
}

const _maps = deriveFamilyMaps(SOURCE_FAMILIES);
/** @type {readonly string[]} */
export const B0_FAMILIES = _maps.B0_FAMILIES;
/** @type {Readonly<Record<string, string>>} */
export const FAMILY_TO_PROVIDER = _maps.FAMILY_TO_PROVIDER;
/** @type {Readonly<Record<string, string>>} */
export const PROVIDER_TO_FAMILY = _maps.PROVIDER_TO_FAMILY;

/**
 * Resolve primary provider id for a family (orch / plan).
 * @param {string} familyId
 */
export function resolveFamilyProvider(familyId) {
  return FAMILY_TO_PROVIDER[String(familyId || '')] || null;
}

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
  if (flags.generalWeb === true || process.env.DISCOVERY_ENABLE_GENERAL_WEB === '1') {
    out.push('general_web');
  }
  if (flags.ddgInstant === true || process.env.DISCOVERY_ENABLE_DDG_INSTANT === '1') {
    out.push('ddg_instant');
  }
  return [...new Set(out)].sort();
}

/** previewFlag env name → flags key (same mapping eligibleFamilies uses). */
const PREVIEW_FLAG_KEYS = Object.freeze({
  DISCOVERY_ENABLE_VIAF: 'viaf',
  DISCOVERY_ENABLE_WEB_ORIGIN: 'webOrigin',
  DISCOVERY_ENABLE_GENERAL_WEB: 'generalWeb',
  DISCOVERY_ENABLE_DDG_INSTANT: 'ddgInstant',
});

/**
 * Fail-closed registry row check (declarations only). Returns reject reason or null.
 * @param {object} row
 */
export function registryRowRejectReason(row) {
  if (!row || typeof row !== 'object' || !row.familyId) return 'family_id_missing';
  if (!Array.isArray(row.capabilities)) return 'capabilities_missing';
  for (const c of row.capabilities) {
    if (IDENTITY_DENY_RE.test(String(c))) return `capability_identity_forbidden:${c}`;
    if (!FAMILY_CAPABILITY_ENUM.includes(c)) return `capability_not_in_enum:${c}`;
  }
  if (!Array.isArray(row.entityTypes)) return 'entity_types_missing';
  for (const t of row.entityTypes) {
    if (!ENTITY_TYPE_ENUM.includes(t)) return `entity_type_not_in_enum:${t}`;
  }
  if (row.displayLabel != null) {
    const dl = row.displayLabel;
    if (typeof dl !== 'object' || typeof dl.en !== 'string' || typeof dl.he !== 'string') {
      return 'display_label_invalid';
    }
    if (DISPLAY_LABEL_DENY_RE.test(dl.en) || DISPLAY_LABEL_DENY_RE.test(dl.he)) {
      return 'display_label_forbidden_word';
    }
  }
  return null;
}

/**
 * Eligibility from registry declarations: wired && (b0 || previewFlag on).
 * Same env/flag rules as eligibleFamilies (parity-asserted in tests).
 * @param {object} row
 * @param {{ viaf?: boolean, webOrigin?: boolean, generalWeb?: boolean, ddgInstant?: boolean }} flags
 */
export function isFamilyRowEligible(row, flags = {}) {
  if (!row || row.wired === false) return false;
  if (row.b0 === true) return true;
  const pf = row.previewFlag ? String(row.previewFlag) : '';
  if (!pf) return false;
  const key = PREVIEW_FLAG_KEYS[pf];
  return (key ? flags[key] === true : false) || process.env[pf] === '1';
}

/**
 * Capability match (§04 §2): capabilitiesNeeded ⊆ family.capabilities
 *   AND seedClass ∈ family.entityTypes AND family eligible(flags).
 * Invalid rows (capability/entityType outside closed enums, identity-ish values) are
 * skipped fail-closed. Output sorted. Pure w.r.t. the registry passed in.
 * @param {string[]} capabilitiesNeeded
 * @param {{ seedClass?: string, flags?: object, registry?: Record<string, object> }} [opts]
 * @returns {string[]}
 */
export function familiesForCapabilities(capabilitiesNeeded, opts = {}) {
  const need = Array.isArray(capabilitiesNeeded) ? capabilitiesNeeded.map(String) : [];
  if (!need.length || !need.every((c) => INTENT_CAPABILITIES.includes(c))) return [];
  const seedClass = String(opts.seedClass || 'unknown');
  const registry = opts.registry && typeof opts.registry === 'object' ? opts.registry : SOURCE_FAMILIES;
  const flags = opts.flags || {};
  const out = [];
  for (const [key, row] of Object.entries(registry)) {
    if (!row || row.familyId !== key) continue;
    if (registryRowRejectReason(row)) continue;
    if (!isFamilyRowEligible(row, flags)) continue;
    if (!row.entityTypes.includes(seedClass)) continue;
    if (!need.every((c) => row.capabilities.includes(c))) continue;
    out.push(row.familyId);
  }
  return out.sort();
}

/**
 * Does the (valid) registry row declare at least one of the given capabilities?
 * @param {string} familyId
 * @param {string[]} capabilities
 * @param {Record<string, object>} [registry]
 */
export function familyDeclaresAnyCapability(familyId, capabilities, registry = SOURCE_FAMILIES) {
  const row = registry?.[String(familyId || '')];
  if (!row || registryRowRejectReason(row)) return false;
  return (capabilities || []).some((c) => row.capabilities.includes(c));
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
  if (
    fam.familyId === 'general_web' &&
    !(flags.generalWeb || process.env.DISCOVERY_ENABLE_GENERAL_WEB === '1')
  ) {
    return 'preview_flag_off:DISCOVERY_ENABLE_GENERAL_WEB';
  }
  if (
    fam.familyId === 'ddg_instant' &&
    !(flags.ddgInstant || process.env.DISCOVERY_ENABLE_DDG_INSTANT === '1')
  ) {
    return 'preview_flag_off:DISCOVERY_ENABLE_DDG_INSTANT';
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


/**
 * Capability registry snapshot — LIVE / EXPERIMENTAL / DISABLED.
 * Do NOT fake general-web families as live. Candidates stay DISABLED.
 * @param {{ viaf?: boolean, webOrigin?: boolean }} [flags]
 */
export function listCapabilityRegistry(flags = {}) {
  const viafOn = flags.viaf === true || process.env.DISCOVERY_ENABLE_VIAF === '1';
  const webOn =
    flags.webOrigin === true || process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1';
  /** @type {object[]} */
  const rows = [];
  for (const id of REGISTERED_FAMILY_IDS) {
    const fam = SOURCE_FAMILIES[id];
    if (!fam) continue;
    let status = 'LIVE';
    let enabled = true;
    let note = 'b0_wired_adapter';
    if (fam.b0) {
      status = 'LIVE';
      enabled = true;
      note = 'b0_live_preview_not_production';
    } else if (fam.previewFlag) {
      status = 'EXPERIMENTAL';
      const flagName = String(fam.previewFlag);
      const envOn = process.env[flagName] === '1';
      const flagKeyOn =
        (flagName === 'DISCOVERY_ENABLE_VIAF' && (flags.viaf === true || viafOn)) ||
        (flagName === 'DISCOVERY_ENABLE_WEB_ORIGIN' && (flags.webOrigin === true || webOn)) ||
        (flagName === 'DISCOVERY_ENABLE_GENERAL_WEB' &&
          (flags.generalWeb === true || process.env.DISCOVERY_ENABLE_GENERAL_WEB === '1')) ||
        (flagName === 'DISCOVERY_ENABLE_DDG_INSTANT' &&
          (flags.ddgInstant === true || process.env.DISCOVERY_ENABLE_DDG_INSTANT === '1'));
      enabled = envOn || flagKeyOn;
      note = enabled ? `preview_flag_on:${flagName}` : `preview_flag_off:${flagName}`;
    } else if (fam.frozenExperimental) {
      status = 'EXPERIMENTAL';
      enabled = false;
      note = 'frozen_experimental';
    }
    rows.push({
      familyId: fam.familyId,
      displayName: fam.displayName,
      status,
      enabled,
      wired: fam.wired !== false,
      b0: !!fam.b0,
      productionEligible: false,
      providerIds: [...(fam.providerIds || [])],
      capabilities: [...(fam.capabilities || [])],
      previewFlag: fam.previewFlag || null,
      independenceClass: fam.independenceClass,
      hostFamily: fam.hostFamily,
      note,
    });
  }
  // Candidate / general-web style families — DISABLED, never live
  for (const id of Object.keys(CANDIDATE_FAMILIES || {}).sort()) {
    const fam = CANDIDATE_FAMILIES[id];
    rows.push({
      familyId: fam.familyId,
      displayName: fam.displayName,
      status: 'DISABLED',
      enabled: false,
      wired: false,
      b0: false,
      productionEligible: false,
      providerIds: [...(fam.providerIds || [])],
      capabilities: [...(fam.capabilities || [])],
      previewFlag: fam.previewFlag || null,
      independenceClass: fam.independenceClass,
      hostFamily: fam.hostFamily,
      note: fam.skipReason || 'candidate_unwired_disabled',
    });
  }
  rows.sort(
    (a, b) =>
      String(a.status).localeCompare(String(b.status)) ||
      String(a.familyId).localeCompare(String(b.familyId)),
  );
  return rows;
}

export { CANDIDATE_FAMILIES, getCandidateFamily, candidateSkipReason } from './candidateFamilies.js';

export default {
  INDEPENDENCE_CLASSES,
  SOURCE_FAMILIES,
  REGISTERED_FAMILY_IDS,
  getFamily,
  familyIdForProvider,
  providerIdForFamily,
  resolveFamilyProvider,
  independenceTag,
  areFamiliesIndependent,
  eligibleFamilies,
  providersForFamilies,
  familySkipReason,
  isUnwiredIntent,
  listCapabilityRegistry,
  FAMILY_CAPABILITY_ENUM,
  INTENT_CAPABILITIES,
  ENTITY_TYPE_ENUM,
  registryRowRejectReason,
  isFamilyRowEligible,
  familiesForCapabilities,
  familyDeclaresAnyCapability,
  B0_FAMILIES,
  FAMILY_TO_PROVIDER,
  PROVIDER_TO_FAMILY,
};
