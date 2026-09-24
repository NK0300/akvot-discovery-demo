/**
 * QueryPlan builder — deterministic search-intent schedule.
 * SEARCH INTENT ≠ ENTITY TRUTH. No identity conclusions. Acc-scrub before emit.
 * Cite: ARCHIVE-01 QUERYPLAN · UNKNOWN-NORMATIVE · ACC-EMIT-SURFACE-MATRIX
 */
import { createHash } from 'crypto';
import { createBudgetCaps } from './budget.js';
import { looksLikeUrlOrHostname } from './webOrigin.js';
import { assertSafePublicHttpsUrl } from './urlSafety.js';
import { isForbiddenQid } from '../forbiddenIdentities.js';
import {
  B0_FAMILIES,
  PROVIDER_TO_FAMILY,
  FAMILY_TO_PROVIDER,
  SOURCE_FAMILIES,
  familiesForCapabilities,
  familyDeclaresAnyCapability,
  registryRowRejectReason,
} from './sourceFamily.js';

export { B0_FAMILIES, PROVIDER_TO_FAMILY, FAMILY_TO_PROVIDER };

export const PLAN_SCHEMA_VERSION = '1.0.0-impl-ready';
export const PLAN_CONFIG_VERSION = 'queryplan-2026-09-21.1';

export const SEED_CLASSES = Object.freeze([
  'person',
  'company',
  'organization',
  'domain',
  'url',
  'document',
  'ambiguous',
  'unknown',
]);

export const INTENT_IDS = Object.freeze([
  'DISCOVER_IDENTITY_REFERENCES',
  'DISCOVER_OFFICIAL_WEB_ORIGIN',
  'DISCOVER_DOCUMENTS',
  'DISCOVER_ORGANIZATION_PRESENCE',
  'DISCOVER_PUBLICATIONS',
  'DISCOVER_NEWS',
  'DISCOVER_FILINGS',
  'DISCOVER_REGISTRIES',
  'DISCOVER_ALIASES',
  'DISCOVER_RELATED_ENTITIES',
]);

/** Deny-list tokens that MUST never appear as plan directives. */
export const FORBIDDEN_PLAN_DIRECTIVES = Object.freeze([
  'SAME_ENTITY',
  'SAME-ENTITY',
  'TITLE_BRIDGE',
  'IDENTITY_COMMIT',
  'OPEN_CRAWL',
  'DOMAIN_OWNERSHIP',
  'SILENT_BUDGET_EXPAND',
]);

/**
 * Opaque seed hash — soft ER, not identity.
 * @param {string} seed
 */
export function seedHashOf(seed) {
  return createHash('sha256')
    .update(String(seed || '').toLowerCase().trim())
    .digest('hex')
    .slice(0, 16);
}

/**
 * Detect seedClass heuristically. Low confidence → ambiguous/unknown.
 * Never invents identity. Hints.seedClass (if valid enum) wins.
 * @param {string} seed
 * @param {object} [hints]
 */
export function detectSeedClass(seed, hints = {}) {
  const hinted = hints?.seedClass || hints?.entityType || hints?.type;
  if (hinted && SEED_CLASSES.includes(String(hinted).toLowerCase())) {
    return String(hinted).toLowerCase();
  }
  const s = String(seed || '').trim();
  if (!s) return 'unknown';

  if (/^https?:\/\//i.test(s)) return 'url';
  if (looksLikeUrlOrHostname(s) && !/\s/.test(s)) return 'domain';
  if (/\.(pdf|docx?|txt|html?)$/i.test(s) || /\b(isbn|doi:)/i.test(s)) return 'document';
  if (/\b(inc|llc|ltd|corp|gmbh|oy|ab|foundation|university|ministry)\b/i.test(s)) {
    return 'organization';
  }
  if (/\b(ltd|corp|inc|gmbh|oy)\.?$/i.test(s)) return 'company';

  const tokens = s.split(/\s+/).filter(Boolean);
  if (tokens.length === 1 && tokens[0].length < 3) return 'unknown';
  // QID-shaped alone is not a person name
  if (/^Q\d+$/i.test(s)) return 'unknown';
  // 2–3 alphabetic tokens → person routing (SEARCH INTENT, not identity truth)
  if (
    tokens.length >= 2 &&
    tokens.length <= 3 &&
    /^[\p{L}\p{M}\s.'’-]+$/u.test(s) &&
    tokens.every((tok) => /^[\p{L}\p{M}.'’-]+$/u.test(tok) && tok.length >= 2)
  ) {
    return 'person';
  }
  if (tokens.length >= 2 && tokens.length <= 4 && /^[\p{L}\p{M}\s.'’-]+$/u.test(s)) {
    return 'ambiguous';
  }
  if (tokens.length >= 5) return 'ambiguous';
  return 'unknown';
}

/**
 * Intent schedule per seedClass — intentId · priority · reason · capabilitiesNeeded.
 * Family MEMBERSHIP is never hardcoded here (§04 §2 "+20 families rule"): it comes from
 * Registry capability match (familiesForCapabilities: capabilitiesNeeded ⊆ capabilities
 * AND seedClass ∈ entityTypes AND eligible(flags)). Ordering / priority / fallback live here.
 * fallbackCapabilitiesNeeded is used ONLY when the primary match is empty.
 * Parity with pre-Track-B hardcoded maps: queryPlan.registryIntents.parity.test.mjs.
 */
const INTENT_SCHEDULE = Object.freeze({
  url: Object.freeze([
    {
      intentId: 'DISCOVER_OFFICIAL_WEB_ORIGIN',
      priority: 1,
      capabilitiesNeeded: ['origin_metadata'],
      fallbackCapabilitiesNeeded: ['open_knowledge_search'],
      reason: 'url_or_domain_seed_prefer_origin_metadata',
      fallbackReason: 'url_seed_web_origin_flag_off_fallback_b0',
    },
    { intentId: 'DISCOVER_IDENTITY_REFERENCES', priority: 2, capabilitiesNeeded: ['reference_search'], reason: 'secondary_b0_refs_after_origin' },
  ]),
  document: Object.freeze([
    { intentId: 'DISCOVER_DOCUMENTS', priority: 1, capabilitiesNeeded: ['bibliographic_records'], reason: 'document_seed_bibliographic_first' },
    { intentId: 'DISCOVER_PUBLICATIONS', priority: 2, capabilitiesNeeded: ['reference_search'], reason: 'publications_and_identity_refs' },
  ]),
  company: Object.freeze([
    { intentId: 'DISCOVER_ORGANIZATION_PRESENCE', priority: 1, capabilitiesNeeded: ['reference_search'], reason: 'org_presence_via_b0_authority' },
    { intentId: 'DISCOVER_IDENTITY_REFERENCES', priority: 2, capabilitiesNeeded: ['reference_search'], reason: 'identity_refs_not_identity_truth' },
    { intentId: 'DISCOVER_OFFICIAL_WEB_ORIGIN', priority: 3, capabilitiesNeeded: ['origin_metadata'], reason: 'optional_web_origin_if_flag' },
  ]),
  person: Object.freeze([
    { intentId: 'DISCOVER_IDENTITY_REFERENCES', priority: 1, capabilitiesNeeded: ['reference_search'], reason: 'person_seed_identity_refs_schedule' },
    { intentId: 'DISCOVER_PUBLICATIONS', priority: 2, capabilitiesNeeded: ['bibliographic_records'], reason: 'publications_secondary' },
    { intentId: 'DISCOVER_DOCUMENTS', priority: 3, capabilitiesNeeded: ['document_records'], reason: 'documents_tertiary' },
  ]),
  ambiguous: Object.freeze([
    { intentId: 'DISCOVER_ALIASES', priority: 1, capabilitiesNeeded: ['reference_search'], reason: 'ambiguous_tight_alias_search_not_merge' },
    { intentId: 'DISCOVER_IDENTITY_REFERENCES', priority: 2, capabilitiesNeeded: ['reference_search'], reason: 'ambiguous_identity_refs' },
  ]),
  unknown: Object.freeze([
    { intentId: 'DISCOVER_IDENTITY_REFERENCES', priority: 1, capabilitiesNeeded: ['reference_search'], reason: 'unknown_minimal_b0_only' },
  ]),
});
/** seedClass aliases sharing a schedule (routing only — not membership). */
const SCHEDULE_ALIAS = Object.freeze({ domain: 'url', organization: 'company' });

function scheduleFor(seedClass) {
  const sc = SEED_CLASSES.includes(seedClass) ? seedClass : 'unknown';
  return { matchClass: sc, rows: INTENT_SCHEDULE[SCHEDULE_ALIAS[sc] || sc] || INTENT_SCHEDULE.unknown };
}

/**
 * Capabilities an intent may legitimately require (union over the schedule) — used by
 * validateQueryPlan's additive capability check. Unwired intents map to [] (none).
 */
export const INTENT_CAPABILITY_NEEDS = Object.freeze(
  Object.fromEntries(
    INTENT_IDS.map((intentId) => {
      const caps = new Set();
      for (const rows of Object.values(INTENT_SCHEDULE)) {
        for (const r of rows) {
          if (r.intentId !== intentId) continue;
          (r.capabilitiesNeeded || []).forEach((c) => caps.add(c));
          (r.fallbackCapabilitiesNeeded || []).forEach((c) => caps.add(c));
        }
      }
      return [intentId, Object.freeze([...caps].sort())];
    }),
  ),
);

/**
 * Resolve one schedule row → { sourceFamilies, reason } via registry capability match.
 * @param {object} row
 * @param {string} matchClass
 * @param {{ viaf?: boolean, webOrigin?: boolean }} flags
 * @param {Record<string, object>} [registry]
 */
function resolveScheduleRow(row, matchClass, flags, registry) {
  const opts = { seedClass: matchClass, flags: { viaf: flags.viaf === true, webOrigin: flags.webOrigin === true }, registry };
  const primary = familiesForCapabilities(row.capabilitiesNeeded, opts);
  if (primary.length || !row.fallbackCapabilitiesNeeded) {
    return { sourceFamilies: primary, reason: row.reason };
  }
  return {
    sourceFamilies: familiesForCapabilities(row.fallbackCapabilitiesNeeded, opts),
    reason: row.fallbackReason || row.reason,
  };
}

/**
 * Registry-derived family list for one intent under a seedClass (pure helper).
 * [] when the seedClass schedule has no such intent or no eligible capable family.
 * @param {string} intentId
 * @param {{ seedClass?: string, flags?: object, registry?: Record<string, object> }} [opts]
 * @returns {string[]}
 */
export function familiesForIntent(intentId, opts = {}) {
  const { matchClass, rows } = scheduleFor(String(opts.seedClass || 'unknown'));
  const row = rows.find((r) => r.intentId === intentId);
  if (!row) return [];
  return resolveScheduleRow(row, matchClass, opts.flags || {}, opts.registry).sourceFamilies;
}

/**
 * Primary intents by seedClass. Rows with no eligible capable family are dropped
 * (e.g. company WEB_ORIGIN with the web-origin flag OFF).
 * @param {string} seedClass
 * @param {{ viaf?: boolean, webOrigin?: boolean }} flags
 * @param {Record<string, object>} [registry]
 */
function intentsForSeedClass(seedClass, flags, registry) {
  const { matchClass, rows } = scheduleFor(seedClass);
  return rows
    .map((row) => {
      const { sourceFamilies, reason } = resolveScheduleRow(row, matchClass, flags, registry);
      return { intentId: row.intentId, priority: row.priority, sourceFamilies, reason };
    })
    .filter((r) => r.sourceFamilies.length > 0);
}

/**
 * @param {string[]} knownRefs
 */
function scrubKnownRefs(knownRefs) {
  const out = [];
  for (const r of knownRefs || []) {
    const s = String(r || '').trim();
    if (!s) continue;
    if (!/^(qid|viaf|ol):/i.test(s)) continue;
    if (/^qid:/i.test(s)) {
      const q = s.replace(/^qid:/i, '');
      if (isForbiddenQid(q) || isForbiddenQid(s)) continue;
    }
    out.push(s);
  }
  return [...new Set(out)].sort();
}

/**
 * Classify urlTargets with urlSafety — never fetch here.
 * @param {string[]} urls
 */
function classifyUrlTargets(urls) {
  const out = [];
  for (const raw of [...new Set((urls || []).map(String))].sort()) {
    let candidate = raw.trim();
    if (!candidate) continue;
    if (!/^https?:\/\//i.test(candidate) && looksLikeUrlOrHostname(candidate)) {
      candidate = `https://${candidate.replace(/\/$/, '')}/`;
    }
    const safety = assertSafePublicHttpsUrl(candidate);
    let safetyLabel = 'unsafe';
    if (safety.ok) safetyLabel = 'allowed';
    else if (safety.reason === 'blocked_host') safetyLabel = 'blocked';
    out.push({
      url: candidate.slice(0, 500),
      safety: safetyLabel,
    });
  }
  return out;
}

/**
 * Stable hash of plan inputs for determinism/replay.
 * @param {object} parts
 */
function inputSnapshotHash(parts) {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0, 24);
}

/**
 * Build a deterministic QueryPlan from seed + context.
 * @param {{
 *   seed: string,
 *   hints?: object,
 *   locale?: string,
 *   sessionId?: string,
 *   knownRefs?: string[],
 *   urls?: string[],
 *   budgetsRemaining?: object,
 *   flags?: { viaf?: boolean, webOrigin?: boolean },
 *   discoveryState?: string,
 * }} input
 * @param {{ registry?: Record<string, object> }} [opts] — test/DI seam only (never from
 *   request input); default = shipped SOURCE_FAMILIES registry.
 */
export function buildQueryPlan(input = {}, opts = {}) {
  const registry = opts && opts.registry && typeof opts.registry === 'object' ? opts.registry : undefined;
  const providerFor = (familyId) =>
    registry
      ? registry[familyId]?.providerIds?.[0] || familyId
      : FAMILY_TO_PROVIDER[familyId] || familyId;
  const seed = String(input.seed || '').trim();
  const hints = input.hints && typeof input.hints === 'object' ? input.hints : {};
  const locale = input.locale || 'en';
  const flags = {
    viaf: input.flags?.viaf === true || process.env.DISCOVERY_ENABLE_VIAF === '1',
    webOrigin:
      input.flags?.webOrigin === true || process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1',
  };

  const seedClass = detectSeedClass(seed, hints);
  const seedHash = seedHashOf(seed);
  const knownRefs = scrubKnownRefs(input.knownRefs || hints.knownRefs || []);
  const urlHints = [
    ...(Array.isArray(input.urls) ? input.urls : []),
    ...(Array.isArray(hints.urls) ? hints.urls : []),
    ...(Array.isArray(hints.webOriginUrls) ? hints.webOriginUrls : []),
  ];
  if (seedClass === 'url' || seedClass === 'domain') urlHints.unshift(seed);
  const urlTargets = classifyUrlTargets(urlHints);

  const caps = createBudgetCaps(input.budgetsRemaining || {});
  const intentRows = intentsForSeedClass(seedClass, flags, registry);

  const orderedIntents = intentRows
    .map((row, idx) => {
      const queries = row.sourceFamilies.map((familyId) => ({
        familyId,
        providerId: providerFor(familyId),
        q: seed,
        lookup: knownRefs.length ? { typedRefs: knownRefs.slice() } : undefined,
      }));
      queries.sort((a, b) => String(a.familyId).localeCompare(String(b.familyId)));
      return {
        intentId: row.intentId,
        intentKey: `${row.intentId}:${idx}`,
        priority: row.priority,
        sourceFamilies: [...row.sourceFamilies].sort(),
        queries,
        budgets: {
          maxFamilyCalls: Math.min(caps.maxFamilyCalls, row.sourceFamilies.length),
          maxProviderMs: caps.maxProviderMs,
        },
        reason: row.reason,
        phase: row.priority === 1 ? 'DISCOVER' : 'ENRICH',
      };
    })
    .sort((a, b) => a.priority - b.priority || a.intentId.localeCompare(b.intentId));

  const sourceFamilies = [
    ...new Set(orderedIntents.flatMap((i) => i.sourceFamilies)),
  ].sort();

  const reasons = [
    { target: 'seedClass', reason: `detected:${seedClass}` },
    ...orderedIntents.map((i) => ({ target: i.intentId, reason: i.reason })),
    ...sourceFamilies.map((f) => ({
      target: `family:${f}`,
      reason: B0_FAMILIES.includes(f)
        ? 'b0_eligible'
        : f === 'authority'
          ? 'preview_viaf_flag'
          : f === 'web_origin'
            ? 'preview_web_origin_flag'
            : 'registered_family',
    })),
  ];

  const stopConditions = [
    'budget_exhausted',
    'max_wall_ms',
    'empty_acceptable',
    'unsafe_url_only',
    'cancelled',
  ];
  if (urlTargets.length && urlTargets.every((u) => u.safety !== 'allowed')) {
    stopConditions.push('all_url_targets_unsafe');
  }

  const planInputSnapshotHash = inputSnapshotHash({
    seedHash,
    seedClass,
    knownRefs,
    urls: urlTargets.map((u) => u.url),
    flags: { viaf: flags.viaf, webOrigin: flags.webOrigin },
    configVersion: PLAN_CONFIG_VERSION,
    locale,
    budgets: {
      maxProviders: caps.maxProviders,
      maxFamilyCalls: caps.maxFamilyCalls,
      maxRequests: caps.maxRequests,
      maxWallMs: caps.maxWallMs,
      maxProviderMs: caps.maxProviderMs,
    },
  });

  const planId = `qp-${planInputSnapshotHash.slice(0, 12)}`;

  return {
    planSchemaVersion: PLAN_SCHEMA_VERSION,
    planId,
    planInputSnapshotHash,
    configVersion: PLAN_CONFIG_VERSION,
    sessionId: input.sessionId || undefined,
    seedHash,
    seedClass,
    orderedIntents,
    sourceFamilies,
    urlTargets,
    knownRefs,
    budgets: {
      maxProviders: caps.maxProviders,
      maxFamilyCalls: caps.maxFamilyCalls,
      maxRequests: caps.maxRequests,
      maxUrls: caps.maxUrls,
      maxRedirects: caps.maxRedirects,
      maxResponseBytes: caps.maxResponseBytes,
      maxWallMs: caps.maxWallMs,
      maxProviderMs: caps.maxProviderMs,
      maxFindings: caps.maxFindings,
      maxEvidence: caps.maxEvidence,
      maxGraphNodes: caps.maxGraphNodes,
      maxGraphEdges: caps.maxGraphEdges,
      maxRetries: caps.maxRetries,
      maxPlanRevisions: caps.maxPlanRevisions,
      maxParallelFamilies: caps.maxParallelFamilies,
      maxSseLifetimeMs: caps.maxSseLifetimeMs,
      silentExpansionForbidden: true,
    },
    stopConditions,
    dedupeRules: {
      byEvidenceFingerprint: true,
      byCanonicalUrl: true,
      titleBridgeForbidden: true,
      typedSoftRefAttachOnly: true,
    },
    provenanceRequirements: {
      requirePlanId: true,
      requireFamilyId: true,
      requireProviderId: true,
      requireProvenanceUrlOrRegistry: true,
      minQuoteChars: 0,
    },
    reasons,
    forbiddenDirectives: [...FORBIDDEN_PLAN_DIRECTIVES],
    discoveryState: input.discoveryState || 'PLAN',
    locale,
    identityConclusions: false,
    searchIntentOnly: true,
  };
}

/**
 * Validate plan before DISCOVER.
 * @param {object} plan
 * Registry capability check (Track B · additive): an intent listing a registered family
 * that declares none of the capabilities that intent may require →
 * error `intent_family_capability_missing:<intent>:<family>` (fail-closed). Family whose
 * entityTypes omit plan.seedClass → warning only (`warnings`; ok unaffected).
 * @param {object} plan
 * @param {{ registry?: Record<string, object> }} [opts] — test/DI seam; default shipped registry
 * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
 */
export function validateQueryPlan(plan, opts = {}) {
  const errors = [];
  /** @type {string[]} */
  const warnings = [];
  if (!plan || typeof plan !== 'object') {
    return { ok: false, errors: ['plan_missing'], warnings };
  }
  const registry =
    opts && opts.registry && typeof opts.registry === 'object' ? opts.registry : SOURCE_FAMILIES;
  const isRegistered = (familyId) => {
    if (registry === SOURCE_FAMILIES) return !!FAMILY_TO_PROVIDER[familyId];
    const row = registry[familyId];
    return !!(row && row.familyId === familyId && !registryRowRejectReason(row) && row.providerIds?.[0]);
  };
  if (!plan.planId) errors.push('planId_missing');
  if (!SEED_CLASSES.includes(plan.seedClass)) errors.push('seedClass_invalid');
  if (!Array.isArray(plan.orderedIntents) || !plan.orderedIntents.length) {
    errors.push('orderedIntents_empty');
  }
  if (!Array.isArray(plan.reasons) || !plan.reasons.length) errors.push('reasons_empty');
  for (const intent of plan.orderedIntents || []) {
    if (!INTENT_IDS.includes(intent.intentId)) {
      errors.push(`intent_unknown:${intent.intentId}`);
    }
    if (!intent.reason || !String(intent.reason).trim()) {
      errors.push(`intent_reason_empty:${intent.intentId}`);
    }
    for (const f of intent.sourceFamilies || []) {
      if (!isRegistered(f)) {
        errors.push(`family_unregistered:${f}`);
        continue;
      }
      if (!INTENT_IDS.includes(intent.intentId)) continue;
      const needs = INTENT_CAPABILITY_NEEDS[intent.intentId] || [];
      if (!familyDeclaresAnyCapability(f, needs, registry)) {
        errors.push(`intent_family_capability_missing:${intent.intentId}:${f}`);
      } else if (
        SEED_CLASSES.includes(plan.seedClass) &&
        !(registry[f]?.entityTypes || []).includes(plan.seedClass)
      ) {
        warnings.push(`intent_family_entity_type_mismatch:${intent.intentId}:${f}:${plan.seedClass}`);
      }
    }
  }
  if (!plan.dedupeRules?.titleBridgeForbidden) {
    errors.push('titleBridgeForbidden_required');
  }
  if (!plan.dedupeRules?.typedSoftRefAttachOnly) {
    errors.push('typedSoftRefAttachOnly_required');
  }
  if (plan.identityConclusions === true) errors.push('identity_conclusions_forbidden');
  for (const r of plan.reasons || []) {
    const text = `${r.target || ''} ${r.reason || ''}`;
    for (const tok of [
      'SAME-ENTITY',
      'SAME_ENTITY',
      'TITLE_BRIDGE',
      'OPEN_CRAWL',
      'IDENTITY_COMMIT',
    ]) {
      if (text.includes(tok)) errors.push(`deny_token_in_reasons:${tok}`);
    }
  }
  if (plan.budgets && plan.budgets.silentExpansionForbidden !== true) {
    errors.push('silentExpansionForbidden_required');
  }
  // Align with Policy.select: launches rows must carry registered familyIds (no invent)
  // Defense-in-depth: each launch.familyId must also appear in orderedIntents.sourceFamilies
  if (Array.isArray(plan.launches)) {
    const intentFamilies = new Set();
    for (const intent of plan.orderedIntents || []) {
      for (const f of intent.sourceFamilies || []) {
        const id = String(f || '').trim();
        if (id) intentFamilies.add(id);
      }
    }
    plan.launches.forEach((row, i) => {
      const familyId = String(row?.familyId || '').trim();
      if (!familyId) {
        errors.push(`launch_missing_familyId:${i}`);
        return;
      }
      if (!isRegistered(familyId)) {
        errors.push(`family_unregistered:${familyId}`);
      }
      if (!intentFamilies.has(familyId)) {
        errors.push(`launch_not_in_intents:${familyId}`);
      }
    });
  }
  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Acc-scrub plan for emit/SSE/HIT.
 * @param {object} plan
 * @returns {object|null}
 */
export function scrubQueryPlanForEmit(plan) {
  if (!plan || typeof plan !== 'object') return null;
  const stripped = [];

  const scrubText = (t) => {
    if (t == null) return t;
    let s = String(t);
    if (/(api[_-]?key|secret|password|token|bearer\s+[a-z0-9._-]+|sk-[a-z0-9_-]+|sk_live_[a-z0-9]+)/i.test(s)) {
      stripped.push('credential_shaped');
      return '[REDACTED]';
    }
    const matches = s.match(/\bQ\d+\b/gi) || [];
    for (const tok of matches) {
      if (isForbiddenQid(tok)) {
        stripped.push(tok);
        s = s.replace(new RegExp(`\\b${tok}\\b`, 'gi'), '[REDACTED_QID]');
      }
    }
    for (const tok of [
      'SAME-ENTITY',
      'SAME_ENTITY',
      'TITLE_BRIDGE',
      'IDENTITY_COMMIT',
      'OPEN_CRAWL',
    ]) {
      if (s.includes(tok)) {
        stripped.push(tok);
        s = s.split(tok).join('[BLOCKED_DIRECTIVE]');
      }
    }
    return s.slice(0, 500);
  };

  // Keep [REDACTED] / [BLOCKED_DIRECTIVE] reasons so Acc scrub is observable on wire
  const reasons = (plan.reasons || [])
    .map((r) => ({
      target: scrubText(r.target),
      reason: scrubText(r.reason),
    }))
    .filter((r) => r.reason != null && String(r.reason).length > 0);

  const orderedIntents = (plan.orderedIntents || []).map((intent) => ({
    intentId: intent.intentId,
    intentKey: intent.intentKey,
    priority: intent.priority,
    sourceFamilies: [...(intent.sourceFamilies || [])],
    queries: (intent.queries || []).map((q) => ({
      familyId: q.familyId,
      providerId: q.providerId,
      q: scrubText(q.q),
      lookup: q.lookup
        ? {
            typedRefs: (q.lookup.typedRefs || []).filter((ref) => {
              if (isForbiddenQid(ref)) {
                stripped.push(ref);
                return false;
              }
              return true;
            }),
          }
        : undefined,
    })),
    budgets: intent.budgets ? { ...intent.budgets } : undefined,
    reason: scrubText(intent.reason),
    phase: intent.phase,
  }));

  const urlTargets = (plan.urlTargets || []).map((u) => ({
    url: u.safety === 'allowed' ? scrubText(u.url) : `[${u.safety}]`,
    safety: u.safety,
  }));

  const out = {
    planSchemaVersion: plan.planSchemaVersion,
    planId: plan.planId,
    planInputSnapshotHash: plan.planInputSnapshotHash,
    configVersion: plan.configVersion,
    seedHash: plan.seedHash,
    seedClass: plan.seedClass,
    orderedIntents,
    sourceFamilies: [...(plan.sourceFamilies || [])],
    urlTargets,
    knownRefs: (plan.knownRefs || []).filter((r) => {
      if (isForbiddenQid(r)) {
        stripped.push(r);
        return false;
      }
      return true;
    }),
    budgets: plan.budgets ? { ...plan.budgets } : undefined,
    stopConditions: [...(plan.stopConditions || [])],
    dedupeRules: plan.dedupeRules ? { ...plan.dedupeRules } : undefined,
    provenanceRequirements: plan.provenanceRequirements
      ? { ...plan.provenanceRequirements }
      : undefined,
    reasons,
    forbiddenDirectives: [...(plan.forbiddenDirectives || FORBIDDEN_PLAN_DIRECTIVES)],
    searchIntentOnly: true,
    identityConclusions: false,
  };
  if (stripped.length) out.forbiddenStripped = stripped.length;
  return out;
}

/**
 * Compact SSE plan summary (⊆ API allow-set).
 * @param {object} plan
 */
export function planSummaryForSse(plan) {
  const scrubbed = scrubQueryPlanForEmit(plan);
  if (!scrubbed) return null;
  return {
    planId: scrubbed.planId,
    seedClass: scrubbed.seedClass,
    seedHash: scrubbed.seedHash,
    intents: (scrubbed.orderedIntents || []).map((i) => ({
      intentId: i.intentId,
      priority: i.priority,
      sourceFamilies: i.sourceFamilies,
      reason: i.reason,
    })),
    families: scrubbed.sourceFamilies,
    budgets: scrubbed.budgets
      ? {
          maxProviders: scrubbed.budgets.maxProviders,
          maxFamilyCalls: scrubbed.budgets.maxFamilyCalls,
          maxRequests: scrubbed.budgets.maxRequests,
          maxWallMs: scrubbed.budgets.maxWallMs,
          maxProviderMs: scrubbed.budgets.maxProviderMs,
        }
      : undefined,
    reasons: scrubbed.reasons,
    stopConditions: scrubbed.stopConditions,
    searchIntentOnly: true,
    ...(scrubbed.forbiddenStripped
      ? { forbiddenStripped: scrubbed.forbiddenStripped }
      : {}),
  };
}

export default {
  PLAN_SCHEMA_VERSION,
  PLAN_CONFIG_VERSION,
  SEED_CLASSES,
  INTENT_IDS,
  FORBIDDEN_PLAN_DIRECTIVES,
  B0_FAMILIES,
  PROVIDER_TO_FAMILY,
  FAMILY_TO_PROVIDER,
  seedHashOf,
  detectSeedClass,
  buildQueryPlan,
  validateQueryPlan,
  familiesForIntent,
  INTENT_CAPABILITY_NEEDS,
  scrubQueryPlanForEmit,
  planSummaryForSse,
};
