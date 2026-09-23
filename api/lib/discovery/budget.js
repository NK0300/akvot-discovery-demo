/**
 * DiscoveryBudget engine — BUDGET-FANOUT-CONTRACT hard-stop taxonomy.
 * Exhaustion ⇒ NO MORE FANOUT. No silent expansion. No identity conclusions.
 */

/** Closed family/outcome status taxonomy (BUDGET-FANOUT-CONTRACT §3.2). */
export const FAMILY_STATUS = Object.freeze([
  'ok',
  'empty',
  'error',
  'skipped',
  'timeout',
  'rate_limited',
  'blocked_url',
  'unsafe_url',
  'unsupported',
  'budget_exhausted',
  'unavailable',
  'cancelled',
  'system_failure',
]);

/** Budget availability codes. */
export const BUDGET_AVAILABLE = 'BUDGET_AVAILABLE';
export const BUDGET_EXHAUSTED = 'BUDGET_EXHAUSTED';

/** Design-default bands (architecture targets — not newly measured KPIs). */
export const DEFAULT_DISCOVERY_BUDGET = Object.freeze({
  maxProviders: 3,
  maxFamilyCalls: 8,
  maxRequests: 24,
  maxUrls: 10,
  maxRedirects: 3,
  maxResponseBytes: 512_000,
  maxWallMs: 12_000,
  maxProviderMs: 3_500,
  maxFindings: 50,
  maxEvidence: 100,
  maxGraphNodes: 64,
  maxGraphEdges: 128,
  maxRetries: 0,
  maxPlanRevisions: 2,
  maxParallelFamilies: 3,
  maxSseLifetimeMs: 30_000,
  silentExpansionForbidden: true,
});

/**
 * @param {Partial<typeof DEFAULT_DISCOVERY_BUDGET>} [overrides]
 */
export function createBudgetCaps(overrides = {}) {
  return {
    ...DEFAULT_DISCOVERY_BUDGET,
    ...(overrides && typeof overrides === 'object' ? overrides : {}),
    silentExpansionForbidden: true,
  };
}

/**
 * Mutable budget ledger for a session/plan execution.
 * @param {object} [caps]
 * @param {{ startedAt?: number }} [meta]
 */
export function createBudgetLedger(caps = {}, meta = {}) {
  const limits = createBudgetCaps(caps);
  const used = {
    providers: 0,
    familyCalls: 0,
    requests: 0,
    urls: 0,
    redirects: 0,
    responseBytes: 0,
    findings: 0,
    evidence: 0,
    graphNodes: 0,
    graphEdges: 0,
    retries: 0,
    planRevisions: 0,
  };
  const startedAt = typeof meta.startedAt === 'number' ? meta.startedAt : Date.now();
  /** @type {string|null} */
  let exhaustedReason = null;
  /** @type {string[]} */
  const journal = [];

  function remaining() {
    const wallElapsed = Date.now() - startedAt;
    return {
      providers: Math.max(0, limits.maxProviders - used.providers),
      familyCalls: Math.max(0, limits.maxFamilyCalls - used.familyCalls),
      requests: Math.max(0, limits.maxRequests - used.requests),
      urls: Math.max(0, limits.maxUrls - used.urls),
      redirects: Math.max(0, limits.maxRedirects - used.redirects),
      responseBytes: Math.max(0, limits.maxResponseBytes - used.responseBytes),
      wallMs: Math.max(0, limits.maxWallMs - wallElapsed),
      findings: Math.max(0, limits.maxFindings - used.findings),
      evidence: Math.max(0, limits.maxEvidence - used.evidence),
      graphNodes: Math.max(0, limits.maxGraphNodes - used.graphNodes),
      graphEdges: Math.max(0, limits.maxGraphEdges - used.graphEdges),
      retries: Math.max(0, limits.maxRetries - used.retries),
      planRevisions: Math.max(0, limits.maxPlanRevisions - used.planRevisions),
      parallelFamilies: limits.maxParallelFamilies,
    };
  }

  /**
   * Can we launch another planned family call?
   * @param {{ requests?: number, urls?: number }} [need]
   */
  function canLaunch(need = {}) {
    if (exhaustedReason) {
      return { ok: false, code: BUDGET_EXHAUSTED, reason: exhaustedReason };
    }
    const rem = remaining();
    if (rem.wallMs <= 0) {
      return markExhausted('maxWallMs');
    }
    if (rem.familyCalls <= 0) {
      return markExhausted('maxFamilyCalls');
    }
    if (rem.providers <= 0 && used.providers >= limits.maxProviders) {
      // providers counted at first use of each provider id — check requests instead for launch
    }
    const needReq = typeof need.requests === 'number' ? need.requests : 1;
    if (rem.requests < needReq) {
      return markExhausted('maxRequests');
    }
    const needUrls = typeof need.urls === 'number' ? need.urls : 0;
    if (needUrls > 0 && rem.urls < needUrls) {
      return markExhausted('maxUrls');
    }
    return { ok: true, code: BUDGET_AVAILABLE, reason: null, remaining: rem };
  }

  function markExhausted(dim) {
    exhaustedReason = exhaustedReason || String(dim);
    journal.push({ at: Date.now(), event: 'budget_exhausted', dimension: exhaustedReason });
    return {
      ok: false,
      code: BUDGET_EXHAUSTED,
      reason: exhaustedReason,
      remaining: remaining(),
    };
  }

  /**
   * Atomically reserve capacity before launch. On failure → budget_exhausted, NO FANOUT.
   * @param {{ providerId?: string, requests?: number, urls?: number, isNewProvider?: boolean }} cost
   */
  function reserve(cost = {}) {
    const gate = canLaunch(cost);
    if (!gate.ok) return gate;
    const req = typeof cost.requests === 'number' ? cost.requests : 1;
    const urls = typeof cost.urls === 'number' ? cost.urls : 0;
    used.familyCalls += 1;
    used.requests += req;
    used.urls += urls;
    if (cost.isNewProvider) used.providers += 1;
    journal.push({
      at: Date.now(),
      event: 'reserve',
      providerId: cost.providerId || null,
      requests: req,
      urls,
    });
    return { ok: true, code: BUDGET_AVAILABLE, reason: null, remaining: remaining() };
  }

  /** @param {{ findings?: number, evidence?: number, responseBytes?: number, redirects?: number }} delta */
  function recordUsage(delta = {}) {
    if (typeof delta.findings === 'number') used.findings += delta.findings;
    if (typeof delta.evidence === 'number') used.evidence += delta.evidence;
    if (typeof delta.responseBytes === 'number') used.responseBytes += delta.responseBytes;
    if (typeof delta.redirects === 'number') used.redirects += delta.redirects;
    // Cap vanity — truncate signal only; never launch extra providers
    if (used.findings > limits.maxFindings) {
      journal.push({ at: Date.now(), event: 'truncate_findings', used: used.findings });
    }
    if (used.evidence > limits.maxEvidence) {
      journal.push({ at: Date.now(), event: 'truncate_evidence', used: used.evidence });
    }
  }

  /**
   * Retry policy: default 0; ≤1 if rate_limited AND budget remains.
   * @param {{ status: string }} outcome
   */
  function mayRetry(outcome) {
    if (exhaustedReason) return { ok: false, reason: 'budget_exhausted' };
    if (outcome?.status !== 'rate_limited') return { ok: false, reason: 'retry_not_allowed' };
    if (used.retries >= limits.maxRetries) return { ok: false, reason: 'maxRetries' };
    const gate = canLaunch({ requests: 1 });
    if (!gate.ok) return { ok: false, reason: gate.reason || 'budget_exhausted' };
    used.retries += 1;
    return { ok: true, reason: 'rate_limited_retry' };
  }

  function mayRevisePlan() {
    if (used.planRevisions >= limits.maxPlanRevisions) {
      return { ok: false, reason: 'maxPlanRevisions' };
    }
    used.planRevisions += 1;
    return { ok: true };
  }

  /** Empty / UNKNOWN must NOT invite unplanned fanout (U7). */
  function denyUnplannedFanout(reason = 'empty_no_fanout') {
    journal.push({ at: Date.now(), event: 'fanout_guard_block', reason: String(reason) });
    return { ok: false, code: 'fanout_guard_block', reason: String(reason) };
  }

  function snapshot() {
    return {
      limits: { ...limits },
      used: { ...used },
      remaining: remaining(),
      availability: exhaustedReason ? BUDGET_EXHAUSTED : BUDGET_AVAILABLE,
      budgetExhaustedReason: exhaustedReason,
      startedAt,
      journal: journal.slice(),
    };
  }

  function isExhausted() {
    if (exhaustedReason) return true;
    const rem = remaining();
    if (rem.wallMs <= 0) {
      markExhausted('maxWallMs');
      return true;
    }
    if (rem.familyCalls <= 0) {
      markExhausted('maxFamilyCalls');
      return true;
    }
    if (rem.requests <= 0) {
      markExhausted('maxRequests');
      return true;
    }
    return false;
  }

  return {
    limits,
    used,
    remaining,
    canLaunch,
    reserve,
    recordUsage,
    mayRetry,
    mayRevisePlan,
    denyUnplannedFanout,
    markExhausted,
    snapshot,
    isExhausted,
    get exhaustedReason() {
      return exhaustedReason;
    },
  };
}

/**
 * Map outcome to closed status taxonomy. Never maps failure → CONTRADICTORY.
 * @param {string} status
 */
export function normalizeFamilyStatus(status) {
  const s = String(status || '').toLowerCase();
  if (FAMILY_STATUS.includes(s)) return s;
  if (s === 'partial') return 'ok';
  if (s === 'failed' || s === 'fail') return 'error';
  return 'error';
}

/**
 * Cross-cutting outcome class helpers (BUDGET-FANOUT §3.3).
 * @param {string} status
 */
export function outcomeClassForStatus(status) {
  const s = normalizeFamilyStatus(status);
  switch (s) {
    case 'timeout':
      return 'SOURCE_TIMEOUT';
    case 'error':
    case 'system_failure':
      return 'SOURCE_FAILURE';
    case 'skipped':
      return 'SOURCE_SKIPPED';
    case 'unsupported':
      return 'SOURCE_UNSUPPORTED';
    case 'empty':
    case 'unavailable':
      return 'EVIDENCE_UNAVAILABLE';
    case 'cancelled':
      return 'CANCELLED';
    case 'budget_exhausted':
      return 'BUDGET_EXHAUSTED';
    default:
      return null;
  }
}

export default {
  FAMILY_STATUS,
  BUDGET_AVAILABLE,
  BUDGET_EXHAUSTED,
  DEFAULT_DISCOVERY_BUDGET,
  createBudgetCaps,
  createBudgetLedger,
  normalizeFamilyStatus,
  outcomeClassForStatus,
};
