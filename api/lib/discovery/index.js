/** Discovery lib barrel — additive exports only. */
export { DEFAULT_PROVIDERS, getDefaultProviders, wikidataProvider, openLibraryProvider, wikipediaOpenSearchProvider, viafProvider, webOriginProvider, softEntityResolve } from './providers.js';
export {
  createDiscoverySession,
  getDiscoverySession,
  narrowDiscoverySession,
  loadSessionRaw,
  emitSnapshot,
  runPipeline,
  clearSessions,
  getStoreInfo,
  publicStoreInfo,
  healthCheck,
} from './orchestrator.js';
export { sanitizeDiscoveryPayload, scrubFindingChunk, scrubFacetsChunk, scrubPlanPayload, scrubPlanChunk, scrubGraphPayload, scrubGraphChunk, scrubErrorChunk } from './emit.js';
export { aggregateFacets } from './facets.js';
export { applyNarrow, parseNarrowFilters, findingMatchesFilters } from './narrow.js';
export {
  buildProgressiveEvents,
  formatSseEvent,
  writeProgressiveSse,
  SSE_RECONNECT_DOCS,
} from './sse.js';
export {
  sessionStore,
  mintSessionId,
  decodeSessionId,
  detectStoreBackend,
  getStoreInfo as getSessionStoreInfo,
  healthCheck as sessionStoreHealthCheck,
  logStoreOp,
  classifyStoreFailure,
  toMandateFailureClass,
  FAILURE_CLASSES,
  STORE_OUTCOMES,
  recordKvProbe,
  getKvProbeState,
  resetKvProbeForTests,
  durabilityStateFor,
} from './sessionStore.js';
export {
  evidenceFingerprint,
  canonicalizeUrl,
  normalizeRawHit,
  dedupeByEvidenceFingerprint,
  corroborateBySoftLabel,
  coalesceBySoftEntity,
  softEntityKey,
  coalesceTitleKey,
  coalesceKeysForFinding,
  hostFamily,
  softLabel,
  rankFindings,
  explainRanking,
  detectContradictions,
} from './store.js';

export { assertSafePublicHttpsUrl, isBlockedDiscoveryHost } from './urlSafety.js';
export {
  FAILURE_KINDS,
  shouldInject,
  wrapProviderWithInjection,
  simulateRedisUnavailable,
} from './failureInject.js';
export {
  faultInjectEnabled,
  resolveFault,
  scrubPathInjectFindings,
  faultTelemetry,
} from './faultInject.js';
export {
  mintCorrelationId,
  incrMetric,
  recordLatency,
  recordSseLifecycle,
  getMetricsSnapshot,
  resetMetrics,
} from './obs.js';
export {
  MAX_SEED_CHARS,
  RATE_LIMIT_BACKEND,
  validateDiscoveryCreateBody,
  checkDiscoveryRateLimit,
  resetDiscoveryRateLimit,
  getDiscoveryRateLimitInfo,
  clientKeyFromReq,
} from './requestGuards.js';

export {
  WEB_ORIGIN_HOST_FAMILY,
  WEB_ORIGIN_PROVIDER_ID,
  RELATIONSHIP_LABELS,
  normalizeWebOriginSeed,
  labelWebOriginRelationship,
  looksLikeUrlOrHostname,
  extractUrlCandidatesFromSeed,
  resolveWebOriginCandidates,
} from './webOrigin.js';

export {
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
  scrubQueryPlanForEmit,
  planSummaryForSse,
} from './queryPlan.js';
export {
  FAMILY_STATUS,
  BUDGET_AVAILABLE,
  BUDGET_EXHAUSTED,
  DEFAULT_DISCOVERY_BUDGET,
  createBudgetCaps,
  createBudgetLedger,
  normalizeFamilyStatus,
  outcomeClassForStatus,
} from './budget.js';
export {
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
} from './sourceFamily.js';
export {
  GRAPH_RELATIONSHIPS,
  FORBIDDEN_GRAPH_RELATIONSHIPS,
  clampGraphRelationship,
  urlAloneCeiling,
  validateEdgeProvenance,
  buildEvidenceGraph,
  scrubGraphForEmit,
} from './evidenceGraph.js';
export {
  isQueryPlanEnabled,
  isPlanSseEnabled,
  discoveryFlagSnapshot,
} from './flags.js';
export {
  planForSession,
  plannedLaunches,
  executePlanLaunches,
  shouldUseQueryPlan,
} from './planOrchestration.js';
export {
  SSE_SCHEMA_VERSION,
  SSE_EVENT_ALLOW_SET,
  scrubSseError,
} from './sse.js';

export {
  EVIDENCE_STRENGTHS,
  EPISTEMIC_STATES,
  EVIDENCE_ENGINE_VERSION,
  enrichEvidenceRow,
  enrichSessionEvidence,
  explainWhy,
  classifyEvidenceStrength,
  classifyEvidenceAging,
  groupEvidence,
  dedupEvidenceReport,
} from './evidence.js';
export {
  RELATIONSHIP_MODULE_VERSION,
  RELATIONSHIP_VOCAB,
  emitSafeRelationship,
  candidateStateFor,
  buildProvenancedEdge,
  sanitizeRelationshipGraph,
  canTransitionRelationship,
  explainEdge,
} from './relationship.js';

export {
  CANDIDATE_FAMILIES,
  CANDIDATE_FAMILY_IDS,
  getCandidateFamily,
  candidateSkipReason,
  isWiredFamily,
} from './candidateFamilies.js';

export {
  SECURITY_MODULE_VERSION,
  redactSensitiveText,
  sanitizeSourceContent,
  assertFetchUrlSafe,
  withSourceTimeout,
  assertPayloadSize,
  containsSecurityBait,
  assertPlanUrlTargetsSafe,
  selectFetchablePlanUrlTargets,
  runPlanUrlTargetsFetchGate,
  scrubProvidersState,
} from './security.js';
export { buildStructuredLog, logDiscoveryEvent, structuredLog, recordBudgetUsage } from './obs.js';

export {
  ADAPTER_CONTRACT_VERSION,
  WIRED_PUBLIC_PROVIDER_IDS,
  MAX_ADAPTER_RESPONSE_BYTES,
  MAX_ADAPTER_FINDINGS,
  ADAPTER_HOST_ALLOWLIST,
  isAdapterHostAllowed,
  assertAdapterFetchUrl,
  adapterBudgetSignal,
  safeFetchJson,
  scrubAdapterRawFinding,
  scrubAdapterBatch,
  typedEvidenceDefaults,
  normalizeAdapterToEvidence,
  normalizeAdapterBatchToEvidence,
  scrubFamilyJournal,
} from './adapterContract.js';
export {
  DUAL_RUN_HARNESS_VERSION,
  DUAL_RUN_METRIC_KEYS,
  controlOpts,
  treatmentOpts,
  extractDualRunMetrics,
  dualRunDelta,
  runDualRunStub,
  dualRunMeasureSheetStub,
} from './dualRunHarness.js';

export {
  URL_TARGET_BRIDGE_VERSION,
  MAX_P856_URL_TARGETS,
  P856_SOURCE,
  isWdP856UrlBridgeEnabled,
  harvestOfficialWebsiteUrlCandidates,
  harvestOfficialWebsiteUrlsFromBatches,
  mergeOfficialWebsiteUrlTargets,
  classifyUrlsAsPlanTargets,
  p856ProvenanceForUrl,
  fetchableUrlTargetsFromPlan,
} from './urlTargetBridge.js';

export {
  searchDdgInstantAnswer,
  isDdgInstantEnabled,
  DDG_INSTANT_PROVIDER_ID,
  DDG_INSTANT_VERSION,
} from './ddgInstantAnswer.js';
