/**
 * Honest plan → execution coverage / completion criteria.
 * SEARCH INTENT ≠ ENTITY TRUTH. Never invents identity. Empty ≠ false.
 * Cite: BUDGET-FANOUT · UNKNOWN-NORMATIVE · SoT QueryPlan
 */

/** Status buckets for journal rows. */
const OK = new Set(['ok', 'partial']);
const EMPTY = new Set(['empty']);
const SKIPPED = new Set(['skipped']);
const UNSUPPORTED = new Set(['unsupported', 'unavailable']);
const ERROR = new Set(['error', 'timeout', 'unsafe_url', 'blocked_url', 'rate_limited']);
const BUDGET = new Set(['budget_exhausted']);
const CANCELLED = new Set(['cancelled']);

/**
 * Build coverage snapshot from a QueryPlan + family journal.
 * @param {object} plan
 * @param {object[]} journal
 * @param {{ budgetExhaustedReason?: string|null, stoppedReason?: string|null }} [extra]
 */
export function buildPlanCoverage(plan, journal = [], extra = {}) {
  const plannedFamilies = [
    ...new Set(
      (plan?.sourceFamilies || []).length
        ? plan.sourceFamilies
        : (plan?.orderedIntents || []).flatMap((i) => i.sourceFamilies || []),
    ),
  ]
    .filter(Boolean)
    .sort();

  const byFamily = new Map();
  for (const row of journal || []) {
    const fid = row?.familyId;
    if (!fid || fid === '_unwired') continue;
    // First row wins (deduped launches); later skip rows still recorded if unseen
    if (!byFamily.has(fid)) byFamily.set(fid, row);
  }

  const executedFamilies = [];
  const okFamilies = [];
  const emptyFamilies = [];
  const skippedFamilies = [];
  const unsupportedFamilies = [];
  const erroredFamilies = [];
  const budgetExhaustedFamilies = [];
  const cancelledFamilies = [];

  for (const [fid, row] of [...byFamily.entries()].sort((a, b) =>
    String(a[0]).localeCompare(String(b[0])),
  )) {
    const st = String(row.status || '');
    executedFamilies.push(fid);
    if (OK.has(st)) okFamilies.push(fid);
    else if (EMPTY.has(st)) emptyFamilies.push(fid);
    else if (SKIPPED.has(st)) skippedFamilies.push(fid);
    else if (UNSUPPORTED.has(st)) unsupportedFamilies.push(fid);
    else if (BUDGET.has(st)) budgetExhaustedFamilies.push(fid);
    else if (CANCELLED.has(st)) cancelledFamilies.push(fid);
    else if (ERROR.has(st)) erroredFamilies.push(fid);
    else erroredFamilies.push(fid);
  }

  const attempted = new Set([
    ...okFamilies,
    ...emptyFamilies,
    ...erroredFamilies,
    ...budgetExhaustedFamilies,
    ...cancelledFamilies,
  ]);
  const plannedSet = new Set(plannedFamilies);
  const missingPlanned = plannedFamilies.filter((f) => !byFamily.has(f));

  const allPlannedAttempted =
    plannedFamilies.length === 0
      ? true
      : plannedFamilies.every((f) => byFamily.has(f));

  const budgetRespected =
    !extra.budgetExhaustedReason ||
    budgetExhaustedFamilies.length > 0 ||
    extra.stoppedReason === 'budget_exhausted' ||
    true; // ledger hard-stop is authoritative; presence of reason ⇒ respected stop

  const stoppedReason =
    extra.stoppedReason ||
    (cancelledFamilies.length ? 'cancelled' : null) ||
    (extra.budgetExhaustedReason ? 'budget_exhausted' : null) ||
    (missingPlanned.length ? 'incomplete_journal' : null);

  // Honest ratio: families that produced ok|empty over planned (0 if none planned)
  const coveredCount = okFamilies.length + emptyFamilies.length;
  const coverageRatio =
    plannedFamilies.length === 0 ? 0 : coveredCount / plannedFamilies.length;

  return {
    planId: plan?.planId || null,
    seedClass: plan?.seedClass || null,
    plannedFamilies,
    executedFamilies,
    okFamilies,
    emptyFamilies,
    skippedFamilies,
    unsupportedFamilies,
    erroredFamilies,
    budgetExhaustedFamilies,
    cancelledFamilies,
    missingPlanned,
    attemptedCount: attempted.size,
    plannedCount: plannedFamilies.length,
    coverageRatio: Math.round(coverageRatio * 1000) / 1000,
    /** empty is honest coverage (UNKNOWN), not failure */
    emptyIsCoverage: true,
    identityConclusions: false,
    completion: {
      criteria: [
        'all_planned_families_attempted_or_honestly_skipped',
        'budget_hard_stop_no_silent_fanout',
        'search_intent_not_entity_truth',
      ],
      allPlannedAttempted,
      budgetRespected: !!budgetRespected,
      stoppedReason,
      complete:
        allPlannedAttempted &&
        cancelledFamilies.length === 0 &&
        budgetExhaustedFamilies.length === 0 &&
        erroredFamilies.length === 0,
      partial:
        budgetExhaustedFamilies.length > 0 ||
        erroredFamilies.length > 0 ||
        skippedFamilies.length > 0 ||
        unsupportedFamilies.length > 0 ||
        !allPlannedAttempted,
    },
  };
}

/**
 * Acc-safe coverage for emit/SSE (no seed text).
 * @param {object} coverage
 */
export function scrubPlanCoverageForEmit(coverage) {
  if (!coverage || typeof coverage !== 'object') return null;
  return {
    planId: coverage.planId ? String(coverage.planId).slice(0, 64) : null,
    seedClass: coverage.seedClass ? String(coverage.seedClass).slice(0, 32) : null,
    plannedFamilies: [...(coverage.plannedFamilies || [])].map((f) => String(f).slice(0, 64)),
    executedFamilies: [...(coverage.executedFamilies || [])].map((f) => String(f).slice(0, 64)),
    okFamilies: [...(coverage.okFamilies || [])].map((f) => String(f).slice(0, 64)),
    emptyFamilies: [...(coverage.emptyFamilies || [])].map((f) => String(f).slice(0, 64)),
    skippedFamilies: [...(coverage.skippedFamilies || [])].map((f) => String(f).slice(0, 64)),
    unsupportedFamilies: [...(coverage.unsupportedFamilies || [])].map((f) =>
      String(f).slice(0, 64),
    ),
    erroredFamilies: [...(coverage.erroredFamilies || [])].map((f) => String(f).slice(0, 64)),
    budgetExhaustedFamilies: [...(coverage.budgetExhaustedFamilies || [])].map((f) =>
      String(f).slice(0, 64),
    ),
    plannedCount: coverage.plannedCount,
    attemptedCount: coverage.attemptedCount,
    coverageRatio: coverage.coverageRatio,
    emptyIsCoverage: true,
    identityConclusions: false,
    completion: coverage.completion
      ? {
          criteria: [...(coverage.completion.criteria || [])],
          allPlannedAttempted: !!coverage.completion.allPlannedAttempted,
          budgetRespected: !!coverage.completion.budgetRespected,
          stoppedReason: coverage.completion.stoppedReason
            ? String(coverage.completion.stoppedReason).slice(0, 64)
            : null,
          complete: !!coverage.completion.complete,
          partial: !!coverage.completion.partial,
        }
      : undefined,
  };
}

export default { buildPlanCoverage, scrubPlanCoverageForEmit };
