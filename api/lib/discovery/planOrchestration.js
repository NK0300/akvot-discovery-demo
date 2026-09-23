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
import { candidateSkipReason, CANDIDATE_FAMILY_IDS } from './candidateFamilies.js';

/**
 * Build + validate plan for a session. Returns { ok, plan, errors, fallbackReason }.
 * @param {object} session
 * @param {{ flags?: object, budgetsRemaining?: object }} [opts]
 */
export function planForSession(session, opts = {}) {
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
  const flags = {
    viaf: process.env.DISCOVERY_ENABLE_VIAF === '1',
    webOrigin: process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1',
  };
  const launches = plannedLaunches(plan, flags);
  const providerById = new Map((ctx.providers || []).map((p) => [p.id, p]));
  const seenProviders = new Set();
  /** @type {object[]} */
  const batches = [];
  /** @type {object[]} */
  const journal = [];
  let stoppedReason = null;

  for (const launch of launches) {
    // Wall / cancel
    if (ctx.sessionSignal?.aborted) {
      stoppedReason = 'cancelled';
      journal.push({
        at: Date.now(),
        familyId: launch.familyId,
        providerId: launch.providerId,
        intentId: launch.intentId,
        status: 'cancelled',
        skipReason: 'cancelled',
      });
      break;
    }
    if (Date.now() > ctx.wallDeadline) {
      ctx.ledger.markExhausted('maxWallMs');
      stoppedReason = 'budget_exhausted';
      journal.push({
        at: Date.now(),
        familyId: launch.familyId,
        providerId: launch.providerId,
        intentId: launch.intentId,
        status: 'budget_exhausted',
        skipReason: 'maxWallMs',
      });
      break;
    }

    // Unwired / flag skip — no fanout invite
    if (launch.skip) {
      const status = launch.skipReason?.startsWith('preview_flag')
        || launch.skipReason?.includes('preview_flag')
        || launch.skipReason?.includes('flag_off')
        ? 'skipped'
        : launch.skipReason === 'unsupported'
          || launch.skipReason?.includes('unwired')
          || launch.skipReason?.includes('candidate_unwired')
          || launch.statusHint === 'unsupported'
          ? 'unsupported'
          : 'skipped';
      journal.push({
        at: Date.now(),
        familyId: launch.familyId,
        providerId: launch.providerId,
        intentId: launch.intentId,
        status: normalizeFamilyStatus(status),
        skipReason: launch.skipReason,
      });
      if (launch.providerId) {
        session.providers[launch.providerId] =
          session.providers[launch.providerId] || 'skipped';
      }
      continue;
    }

    // Budget gate — NO MORE FANOUT when exhausted
    const isNew = launch.providerId && !seenProviders.has(launch.providerId);
    const gate = ctx.ledger.reserve({
      providerId: launch.providerId,
      requests: 1,
      urls: launch.familyId === 'web_origin' ? 1 : 0,
      isNewProvider: !!isNew,
    });
    if (!gate.ok) {
      stoppedReason = 'budget_exhausted';
      journal.push({
        at: Date.now(),
        familyId: launch.familyId,
        providerId: launch.providerId,
        intentId: launch.intentId,
        status: 'budget_exhausted',
        skipReason: gate.reason || 'budget_exhausted',
        budgetCode: gate.code || BUDGET_EXHAUSTED,
      });
      if (launch.providerId) {
        session.providers[launch.providerId] = 'budget_exhausted';
      }
      // STOP FANOUT — do not continue other launches
      break;
    }
    if (launch.providerId) seenProviders.add(launch.providerId);

    const provider = providerById.get(launch.providerId);
    if (!provider || typeof provider.search !== 'function') {
      journal.push({
        at: Date.now(),
        familyId: launch.familyId,
        providerId: launch.providerId,
        intentId: launch.intentId,
        status: 'unavailable',
        skipReason: 'provider_missing',
      });
      session.providers[launch.providerId] = 'unavailable';
      continue;
    }

    try {
      if (ctx.fault === 'provider_timeout' && typeof ctx.maybeProviderTimeout === 'function') {
        await ctx.maybeProviderTimeout(ctx.fault);
      }
      const batch = await provider.search(
        {
          q: session.seed,
          sessionId: session.sessionId,
          budgetMs: plan.budgets?.maxProviderMs || 3500,
          locale: session.locale,
          hints: session.hints,
          planId: plan.planId,
          intentId: launch.intentId,
          familyId: launch.familyId,
        },
        { signal: ctx.sessionSignal || new AbortController().signal },
      );

      const findings = (batch.findings || []).map((raw) => ({
        ...raw,
        planId: plan.planId,
        intentId: launch.intentId,
        familyId: launch.familyId,
      }));

      let status;
      if ((batch.errors || []).length > 0 && !findings.length) {
        status = 'error';
      } else if (!findings.length) {
        status = 'empty';
        // U7: empty MUST NOT invite unplanned fanout
        ctx.ledger.denyUnplannedFanout('empty_no_fanout');
      } else if (batch.partial) {
        status = 'ok';
      } else {
        status = 'ok';
      }

      // Annotate rate_limited from errors
      if ((batch.errors || []).some((e) => /rate.?limit/i.test(String(e?.code || e?.message || '')))) {
        status = 'rate_limited';
        const retry = ctx.ledger.mayRetry({ status: 'rate_limited' });
        if (retry.ok) {
          journal.push({
            at: Date.now(),
            familyId: launch.familyId,
            providerId: launch.providerId,
            intentId: launch.intentId,
            status: 'rate_limited',
            skipReason: 'retry_scheduled',
          });
          // Single retry — still under budget
          try {
            const batch2 = await provider.search(
              {
                q: session.seed,
                sessionId: session.sessionId,
                budgetMs: plan.budgets?.maxProviderMs || 3500,
                locale: session.locale,
                hints: session.hints,
                planId: plan.planId,
                intentId: launch.intentId,
                familyId: launch.familyId,
                retry: 1,
              },
              { signal: ctx.sessionSignal || new AbortController().signal },
            );
            const findings2 = (batch2.findings || []).map((raw) => ({
              ...raw,
              planId: plan.planId,
              intentId: launch.intentId,
              familyId: launch.familyId,
            }));
            ctx.ledger.recordUsage({ findings: findings2.length });
            batches.push({
              providerId: launch.providerId,
              familyId: launch.familyId,
              intentId: launch.intentId,
              planId: plan.planId,
              findings: findings2,
              partial: !!batch2.partial,
              errors: batch2.errors,
            });
            status = findings2.length ? 'ok' : 'empty';
            if (status === 'empty') ctx.ledger.denyUnplannedFanout('empty_no_fanout');
            session.providers[launch.providerId] = status === 'ok' ? 'ok' : 'empty';
            journal.push({
              at: Date.now(),
              familyId: launch.familyId,
              providerId: launch.providerId,
              intentId: launch.intentId,
              status,
              skipReason: null,
              retry: 1,
            });
            continue;
          } catch {
            status = 'error';
          }
        }
      }

      ctx.ledger.recordUsage({ findings: findings.length });
      batches.push({
        providerId: launch.providerId,
        familyId: launch.familyId,
        intentId: launch.intentId,
        planId: plan.planId,
        findings,
        partial: !!batch.partial,
        errors: batch.errors,
        _webOriginTelemetry: batch._webOriginTelemetry,
      });
      session.providers[launch.providerId] =
        status === 'ok' ? (batch.partial ? 'partial' : 'ok') : status;
      journal.push({
        at: Date.now(),
        familyId: launch.familyId,
        providerId: launch.providerId,
        intentId: launch.intentId,
        status: normalizeFamilyStatus(status),
        skipReason: status === 'empty' ? 'empty_no_fanout' : null,
        findingCount: findings.length,
      });
    } catch (e) {
      const msg = String(e?.message || e);
      let status = 'error';
      if (/timeout|aborted/i.test(msg)) status = 'timeout';
      if (/unsafe|ssrf/i.test(msg)) status = 'unsafe_url';
      if (/blocked/i.test(msg)) status = 'blocked_url';
      session.providers[launch.providerId] = status;
      journal.push({
        at: Date.now(),
        familyId: launch.familyId,
        providerId: launch.providerId,
        intentId: launch.intentId,
        status: normalizeFamilyStatus(status),
        skipReason: null,
        errorClass: status,
        // Acc: scrub message — codes only on journal emit path later
      });
      batches.push({
        providerId: launch.providerId,
        familyId: launch.familyId,
        intentId: launch.intentId,
        planId: plan.planId,
        findings: [],
        partial: true,
        errors: [{ code: status, message: msg.slice(0, 200) }],
      });
    }
  }

  session.familyJournal = journal;
  const snap = ctx.ledger.snapshot();
  session.budgetTelemetry = {
    availability: snap.availability,
    budgetExhaustedReason: snap.budgetExhaustedReason,
    used: snap.used,
    remaining: snap.remaining,
    limits: {
      maxProviders: snap.limits.maxProviders,
      maxFamilyCalls: snap.limits.maxFamilyCalls,
      maxRequests: snap.limits.maxRequests,
      maxWallMs: snap.limits.maxWallMs,
      maxRetries: snap.limits.maxRetries,
    },
  };
  if (snap.budgetExhaustedReason) {
    session.budgetExhaustedReason = snap.budgetExhaustedReason;
    stoppedReason = stoppedReason || 'budget_exhausted';
  }

  return {
    batches,
    stoppedReason,
    budgetSnapshot: snap,
    journal,
  };
}

/**
 * Should this session use QueryPlan path?
 * @param {object} [opts]
 */
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
