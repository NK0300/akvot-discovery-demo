/**
 * QueryPlan orchestration path — Preview flag gated (default OFF).
 * BUDGET EXHAUSTED → STOP FANOUT. empty → empty_no_fanout. Acc scrub on plan emit.
 * Does NOT unfreeze A2/C1. Does NOT touch Core. Flag OFF callers never enter here.
 *
 * Cite: BUDGET-FANOUT-CONTRACT · UNKNOWN-NORMATIVE · SoT 02/03/04
 */
import {
  buildQueryPlan,
  validateQueryPlan,
  scrubQueryPlanForEmit,
  isBlankSeed,
  EMPTY_SEED_REASON,
  FAMILY_TO_PROVIDER,
  PROVIDER_TO_FAMILY,
} from './queryPlan.js';
import {
  createBudgetLedger,
  normalizeFamilyStatus,
  BUDGET_EXHAUSTED,
} from './budget.js';
import {
  eligibleFamilies,
  familyIdForProvider,
  familySkipReason,
  isUnwiredIntent,
  getFamily,
} from './sourceFamily.js';
import { isQueryPlanEnabled } from './flags.js';
import { runFamilyOrchestration } from './familyOrchestrator.js';
import { candidateSkipReason, CANDIDATE_FAMILY_IDS } from './candidateFamilies.js';

/**
 * Build + validate plan for a session. Returns { ok, plan, errors, fallbackReason }.
 * @param {object} session
 * @param {{ flags?: object, budgetsRemaining?: object }} [opts]
 */
export function planForSession(session, opts = {}) {
  // Slice A · fail-closed: blank seed (''/whitespace/tab/NBSP/zero-width) ⇒ no plan,
  // 0 launches, never an empty query to any family/provider. Additive fields only.
  if (isBlankSeed(session?.seed)) {
    return {
      ok: false,
      plan: null,
      errors: [EMPTY_SEED_REASON],
      fallbackReason: EMPTY_SEED_REASON,
      reason: EMPTY_SEED_REASON,
      launches: [],
    };
  }
  const flags = {
    viaf:
      opts.flags?.viaf === true ||
      process.env.DISCOVERY_ENABLE_VIAF === '1',
    webOrigin:
      opts.flags?.webOrigin === true ||
      process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1',
    queryPlan: true,
  };
  const plan = buildQueryPlan({
    seed: session.seed,
    hints: session.hints,
    locale: session.locale,
    sessionId: session.sessionId,
    knownRefs: session.softEr?.softRefs || session.hints?.knownRefs,
    urls: session.hints?.urls || session.hints?.webOriginUrls,
    budgetsRemaining: opts.budgetsRemaining || opts.budgetCaps,
    flags,
    discoveryState: 'PLAN',
  });
  const v = validateQueryPlan(plan);
  if (!v.ok) {
    return {
      ok: false,
      plan: null,
      errors: v.errors,
      fallbackReason: 'plan_invalid',
    };
  }
  return { ok: true, plan, errors: [], fallbackReason: null };
}

/**
 * Ordered list of { intentId, familyId, providerId, reason, phase } launches from plan.
 * Deterministic: intents by priority, families sorted.
 * @param {object} plan
 * @param {{ viaf?: boolean, webOrigin?: boolean }} flags
 */
export function plannedLaunches(plan, flags = {}) {
  /** @type {{ intentId: string, familyId: string, providerId: string, reason: string, phase: string }[]} */
  const launches = [];
  for (const intent of plan.orderedIntents || []) {
    if (isUnwiredIntent(intent.intentId)) {
      launches.push({
        intentId: intent.intentId,
        familyId: '_unwired',
        providerId: null,
        reason: 'intent_unwired_skip',
        phase: intent.phase || 'DISCOVER',
        skip: true,
        skipReason: 'unsupported',
      });
      continue;
    }
    for (const familyId of [...(intent.sourceFamilies || [])].sort()) {
      const skip = familySkipReason(familyId, flags);
      const providerId = FAMILY_TO_PROVIDER[familyId] || null;
      launches.push({
        intentId: intent.intentId,
        familyId,
        providerId,
        reason: intent.reason,
        phase: intent.phase || 'DISCOVER',
        skip: !!skip || !providerId,
        skipReason: skip || (!providerId ? 'provider_unmapped' : null),
      });
    }
  }
  // Dedupe GO launches by familyId (first intent wins). Keep all skip/unsupported rows.
  const seenGo = new Set();
  const out = [];
  for (const L of launches) {
    if (L.skip) {
      out.push(L);
      continue;
    }
    // Candidate / F11 families → honest unsupported (never fake ok)
    const candSkip = candidateSkipReason(L.familyId);
    if (candSkip || CANDIDATE_FAMILY_IDS.includes(L.familyId)) {
      out.push({
        ...L,
        skip: true,
        skipReason: candSkip || 'candidate_unwired_f11',
        statusHint: 'unsupported',
      });
      continue;
    }
    if (seenGo.has(L.familyId)) continue;
    seenGo.add(L.familyId);
    out.push(L);
  }
  return out;
}

/**
 * Execute planned family launches under DiscoveryBudget.
 * Mutates session: familyJournal, budgetTelemetry, providers, queryPlan.
 * Returns { batches, stoppedReason, budgetSnapshot }.
 *
 * @param {object} session
 * @param {object} plan
 * @param {{
 *   providers: object[],
 *   ledger: ReturnType<typeof createBudgetLedger>,
 *   wallDeadline: number,
 *   sessionSignal?: AbortSignal,
 *   fault?: string,
 *   correlationId?: string,
 *   maybeProviderTimeout?: Function,
 * }} ctx
 */
export async function executePlanLaunches(session, plan, ctx) {
  // CONSOLIDATED_TO_FAMILY_ORCH — single execution path (no parallel launcher).
  // Maps familyOrchestrator output into the legacy { batches, journal, ... } shape
  // so unit tests / secondary callers stay stable.
  const flags = {
    viaf:
      ctx.flags?.viaf === true || process.env.DISCOVERY_ENABLE_VIAF === '1',
    webOrigin:
      ctx.flags?.webOrigin === true ||
      process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1',
  };
  const orchOut = await runFamilyOrchestration(plan, session, {
    providers: ctx.providers || [],
    ledger: ctx.ledger,
    wallDeadline: ctx.wallDeadline,
    signal: ctx.sessionSignal || ctx.signal,
    flags,
    correlationId: ctx.correlationId,
    onFamilyResult: ctx.onFamilyResult,
  });

  session.familyJournal = orchOut.journal;
  const snap = orchOut.budgetSnapshot;
  if (snap) {
    session.budgetTelemetry = {
      availability: snap.availability,
      budgetExhaustedReason: snap.budgetExhaustedReason,
      used: snap.used,
      remaining: snap.remaining,
      limits: snap.limits
        ? {
            maxProviders: snap.limits.maxProviders,
            maxFamilyCalls: snap.limits.maxFamilyCalls,
            maxRequests: snap.limits.maxRequests,
            maxWallMs: snap.limits.maxWallMs,
            maxRetries: snap.limits.maxRetries,
          }
        : undefined,
    };
  }
  if (orchOut.budgetExhausted) {
    session.budgetExhaustedReason =
      orchOut.budgetExhaustedReason || 'budget_exhausted';
  }
  for (const [pid, st] of Object.entries(orchOut.providerStates || {})) {
    session.providers = session.providers || {};
    session.providers[pid] = st;
  }

  /** @type {object[]} */
  const batches = [];
  const byProv = new Map();
  for (const f of orchOut.findings || []) {
    const pid = (f.providers && f.providers[0]) || f.providerId || 'unknown';
    if (!byProv.has(pid)) byProv.set(pid, []);
    byProv.get(pid).push(f);
  }
  for (const j of orchOut.journal || []) {
    if (j.providerId && !byProv.has(j.providerId)) byProv.set(j.providerId, []);
  }
  for (const [providerId, findings] of byProv.entries()) {
    batches.push({
      providerId,
      familyId: findings[0]?.familyId,
      intentId: findings[0]?.intentId,
      planId: plan.planId,
      findings,
      partial: false,
    });
  }

  let stoppedReason = null;
  if (ctx.sessionSignal?.aborted || ctx.signal?.aborted) stoppedReason = 'cancelled';
  else if (orchOut.budgetExhausted) stoppedReason = 'budget_exhausted';

  return {
    batches,
    stoppedReason,
    budgetSnapshot: snap,
    journal: orchOut.journal,
    findings: orchOut.findings,
    evidence: orchOut.evidence,
    providerStates: orchOut.providerStates,
    planId: plan.planId,
  };
}

export function shouldUseQueryPlan(opts = {}) {
  return isQueryPlanEnabled(opts);
}

export default {
  planForSession,
  plannedLaunches,
  executePlanLaunches,
  shouldUseQueryPlan,
  createBudgetLedger,
  scrubQueryPlanForEmit,
  eligibleFamilies,
  familyIdForProvider,
  getFamily,
  PROVIDER_TO_FAMILY,
};
