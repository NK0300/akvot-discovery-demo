/**
 * Discovery Policy interface — decision layer (what next), not HTTP.
 * Registry stays declarative; Orchestrator executes; Policy selects/evaluates/stops.
 * Flags / prod path: callers must keep experimental wiring OFF by default.
 * Cite: EVOLUTION-PACK §19 · NO PROMOTE · C1 · cite-or-drop
 */

import { getFamily, familySkipReason, eligibleFamilies } from './sourceFamily.js';

export const POLICY_SCHEMA_VERSION = '1.0.0-wave1';

/** Closed stop reasons for nextOrStop. */
export const POLICY_STOP_REASONS = Object.freeze([
  'BUDGET',
  'MAX_WAVES',
  'NO_PROGRESS',
  'ALL_HOPS_SETTLED',
  'POLICY_HOLD',
  'SAFETY',
  'EMPTY_PLAN',
]);

export const POLICY_ACTIONS = Object.freeze(['next', 'stop']);

/**
 * @typedef {{ intentId: string, familyId: string, priority?: number, reason?: string }} PolicyLaunch
 * @typedef {{
 *   plan?: { launches?: PolicyLaunch[], planId?: string },
 *   flags?: object,
 *   budget?: { exhausted?: boolean, remaining?: object },
 *   frontier?: { isEmpty?: boolean, size?: number, items?: object[] },
 *   wave?: number,
 *   maxWaves?: number,
 *   mission?: { lastProgress?: boolean },
 *   registryView?: object,
 * }} PolicyContext
 */

/**
 * Select launches from plan via registry eligibility — no provider host switches.
 * @param {PolicyContext} ctx
 * @returns {{ launches: PolicyLaunch[], skipped: object[] }}
 */

/**
 * Flatten QueryPlan.orderedIntents → Policy launch rows (familyId-first).
 * Dedupes by familyId (first intent wins). Does not HTTP.
 * @param {object} plan
 * @returns {{ intentId: string, familyId: string, priority: number, reason: string, query?: string }[]}
 */
export function launchesFromQueryPlan(plan = {}) {
  if (Array.isArray(plan?.launches) && plan.launches.length) {
    return plan.launches.map((row) => ({
      intentId: String(row?.intentId || ''),
      familyId: String(row?.familyId || ''),
      priority: Number.isFinite(row?.priority) ? row.priority : 100,
      reason: row?.reason || 'plan_launch',
      query: row?.query,
    }));
  }
  const out = [];
  const seen = new Set();
  const intents = Array.isArray(plan?.orderedIntents) ? plan.orderedIntents : [];
  for (const intent of intents) {
    const intentId = String(intent?.intentId || '');
    const priority = Number.isFinite(intent?.priority) ? intent.priority : 100;
    const reason = intent?.reason || 'plan_intent';
    const families = Array.isArray(intent?.sourceFamilies) ? intent.sourceFamilies : [];
    const queries = Array.isArray(intent?.queries) ? intent.queries : [];
    for (const familyIdRaw of families) {
      const familyId = String(familyIdRaw || '');
      if (!familyId || seen.has(familyId)) continue;
      seen.add(familyId);
      const q = queries.find((x) => x && x.familyId === familyId);
      out.push({
        intentId,
        familyId,
        priority,
        reason,
        query: q?.q,
      });
    }
  }
  return out;
}

export function selectLaunches(ctx = {}) {
  const launchesIn =
    Array.isArray(ctx.plan?.launches) && ctx.plan.launches.length
      ? ctx.plan.launches
      : launchesFromQueryPlan(ctx.plan || {});
  const flags = ctx.flags || {};
  const launches = [];
  const skipped = [];

  for (const row of launchesIn) {
    const familyId = String(row?.familyId || '');
    if (!familyId) {
      skipped.push({ ...row, skipReason: 'missing_familyId' });
      continue;
    }
    const fam = typeof getFamily === 'function' ? getFamily(familyId) : null;
    if (!fam) {
      skipped.push({ familyId, intentId: row.intentId, skipReason: 'unknown_family' });
      continue;
    }
    const skip =
      typeof familySkipReason === 'function' ? familySkipReason(familyId, flags) : null;
    if (skip) {
      skipped.push({ familyId, intentId: row.intentId, skipReason: skip });
      continue;
    }
    launches.push({
      intentId: String(row.intentId || ''),
      familyId,
      priority: Number.isFinite(row.priority) ? row.priority : 100,
      reason: row.reason || 'plan_launch',
      ...(row.query != null ? { query: row.query } : {}),
    });
  }

  launches.sort((a, b) => a.priority - b.priority || a.familyId.localeCompare(b.familyId));
  return { launches, skipped };
}

/**
 * Evaluate a family batch for frontier admission (cite-or-drop / C1 ceiling).
 * Does not assert identity.
 * @param {PolicyContext} _ctx
 * @param {{ findings?: object[], evaluateOk?: boolean, urlAlone?: boolean }} batch
 */
export function evaluateBatch(_ctx = {}, batch = {}) {
  if (batch.evaluateOk === false) {
    return { ok: false, frontierAdds: [], dropReason: batch.dropReason || 'evaluate_failed' };
  }
  if (batch.urlAlone === true) {
    return { ok: true, frontierAdds: [], dropReason: 'url_alone_ceiling' };
  }
  const findings = Array.isArray(batch.findings) ? batch.findings : [];
  const frontierAdds = [];
  for (const f of findings) {
    const url = f?.url || f?.canonicalUrl;
    const typedRef = (f?.entityRefs || f?.softRefs || []).find((k) =>
      /^(viaf|qid|ol):/i.test(String(k)),
    );
    if (!url && !typedRef) continue;
    if (f?.evaluateOk === false) continue;
    frontierAdds.push({
      url: url || undefined,
      typedRef: typedRef || undefined,
      familyId: f.familyId,
      intentId: f.intentId,
      wave: f.wave,
      reason: 'evaluate_ok',
      evaluateOk: true,
    });
  }
  return { ok: true, frontierAdds, dropReason: frontierAdds.length ? undefined : 'no_frontier_adds' };
}

/**
 * Frontier expand gate.
 * @param {PolicyContext} ctx
 */
export function expandDecision(ctx = {}) {
  const wave = Number(ctx.wave) || 1;
  const maxWaves = Number(ctx.maxWaves) > 0 ? Number(ctx.maxWaves) : 1;
  if (ctx.budget?.exhausted) {
    return { expand: false, items: [], reason: 'BUDGET' };
  }
  if (wave >= maxWaves) {
    return { expand: false, items: [], reason: 'MAX_WAVES' };
  }
  const items = Array.isArray(ctx.frontier?.items) ? ctx.frontier.items.filter((i) => i?.evaluateOk) : [];
  if (!items.length || ctx.frontier?.isEmpty) {
    return { expand: false, items: [], reason: 'NO_PROGRESS' };
  }
  return { expand: true, items, reason: 'frontier_available' };
}

/**
 * @param {PolicyContext} ctx
 * @returns {{ action: 'next'|'stop', reason: string }}
 */
export function nextOrStop(ctx = {}) {
  if (ctx.budget?.exhausted) return { action: 'stop', reason: 'BUDGET' };
  const wave = Number(ctx.wave) || 1;
  const maxWaves = Number(ctx.maxWaves) > 0 ? Number(ctx.maxWaves) : 1;
  if (wave >= maxWaves) return { action: 'stop', reason: 'MAX_WAVES' };
  const planLaunches = ctx.plan?.launches;
  if (Array.isArray(planLaunches) && planLaunches.length === 0 && wave <= 1) {
    return { action: 'stop', reason: 'EMPTY_PLAN' };
  }
  if (ctx.mission?.lastProgress === false && (ctx.frontier?.isEmpty || ctx.frontier?.size === 0)) {
    return { action: 'stop', reason: 'NO_PROGRESS' };
  }
  const exp = expandDecision(ctx);
  if (!exp.expand && wave > 1) {
    return { action: 'stop', reason: exp.reason === 'frontier_available' ? 'NO_PROGRESS' : exp.reason };
  }
  if (!exp.expand && wave === 1 && ctx.mission?.lastProgress === false) {
    return { action: 'stop', reason: 'ALL_HOPS_SETTLED' };
  }
  return { action: 'next', reason: exp.expand ? 'expand' : 'continue_wave' };
}

/** @type {import('./policy.js').DiscoveryPolicy} */
export const policyHold = Object.freeze({
  id: 'policy.hold',
  version: POLICY_SCHEMA_VERSION,
  select() {
    return { launches: [], skipped: [{ skipReason: 'POLICY_HOLD' }] };
  },
  evaluate(_ctx, batch) {
    return evaluateBatch(_ctx, batch);
  },
  expand() {
    return { expand: false, items: [], reason: 'POLICY_HOLD' };
  },
  nextOrStop() {
    return { action: 'stop', reason: 'POLICY_HOLD' };
  },
});

/** B0: plan launches only · no frontier expand (maxWaves=1). */
export const policyB0Default = Object.freeze({
  id: 'policy.b0.default',
  version: POLICY_SCHEMA_VERSION,
  select(ctx) {
    return selectLaunches(ctx);
  },
  evaluate(ctx, batch) {
    return evaluateBatch(ctx, batch);
  },
  expand(ctx) {
    return expandDecision({ ...ctx, maxWaves: 1 });
  },
  nextOrStop(ctx) {
    return nextOrStop({ ...ctx, maxWaves: ctx.maxWaves ?? 1 });
  },
});

/**
 * Night/MW2-shaped caps preset — stub only; nightLoop unify needs separate Chief GO.
 * Default maxWaves=2 when caller does not override.
 */
export const policyNightCaps = Object.freeze({
  id: 'policy.night.caps',
  version: POLICY_SCHEMA_VERSION,
  select(ctx) {
    return selectLaunches(ctx);
  },
  evaluate(ctx, batch) {
    return evaluateBatch(ctx, batch);
  },
  expand(ctx) {
    return expandDecision({ ...ctx, maxWaves: ctx.maxWaves ?? 2 });
  },
  nextOrStop(ctx) {
    return nextOrStop({ ...ctx, maxWaves: ctx.maxWaves ?? 2 });
  },
});

const PRESETS = Object.freeze({
  [policyHold.id]: policyHold,
  [policyB0Default.id]: policyB0Default,
  [policyNightCaps.id]: policyNightCaps,
});

/**
 * @param {string} id
 */

/**
 * Execute gate — registry + flags only (no HTTP). Orch still calls provider.search.
 * Fail-closed: unknown / flag-off / missing provider ⇒ not ok.
 * @param {string} familyId
 * @param {object} flags
 * @param {Map<string, object>|null} byId
 * @param {{ providerIdForFamily?: Function }} [registry]
 */
export function gateFamilyExecute(familyId, flags = {}, byId = null, registry = {}) {
  const id = String(familyId || '');
  if (!id) return { ok: false, status: 'unsupported', reason: 'missing_familyId' };
  const fam = typeof getFamily === 'function' ? getFamily(id) : null;
  if (!fam) return { ok: false, status: 'unsupported', reason: 'unknown_family' };
  const skip = typeof familySkipReason === 'function' ? familySkipReason(id, flags) : null;
  if (skip) return { ok: false, status: 'skipped', reason: skip };
  let providerId = null;
  if (typeof registry.providerIdForFamily === 'function') {
    providerId = registry.providerIdForFamily(id);
  } else if (Array.isArray(fam.providerIds) && fam.providerIds[0]) {
    providerId = fam.providerIds[0];
  }
  if (!providerId) return { ok: false, status: 'unsupported', reason: `family_unmapped:${id}` };
  if (byId && typeof byId.get === 'function') {
    const provider = byId.get(providerId);
    if (!provider || typeof provider.search !== 'function') {
      return { ok: false, status: 'unavailable', reason: `provider_missing:${providerId}`, providerId };
    }
    return { ok: true, status: 'ok', providerId, provider };
  }
  return { ok: true, status: 'ok', providerId };
}

export function getPolicy(id) {
  return PRESETS[id] || null;
}

export function listPolicies() {
  return Object.keys(PRESETS);
}

/**
 * Eligible family ids helper for orch Select — registry-driven.
 * @param {object} flags
 */
export function listEligibleFamilyIds(flags = {}) {
  if (typeof eligibleFamilies !== 'function') return [];
  const list = eligibleFamilies(flags);
  if (!Array.isArray(list)) return [];
  return list.map((f) => (typeof f === 'string' ? f : f?.id || f?.familyId)).filter(Boolean);
}

export default {
  POLICY_SCHEMA_VERSION,
  POLICY_STOP_REASONS,
  launchesFromQueryPlan,
  selectLaunches,
  gateFamilyExecute,
  evaluateBatch,
  expandDecision,
  nextOrStop,
  getPolicy,
  listPolicies,
  policyB0Default,
  policyNightCaps,
  policyHold,
};
