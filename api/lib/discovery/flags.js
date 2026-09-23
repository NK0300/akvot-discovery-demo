/**
 * Discovery Preview feature flags — default OFF.
 * Flag OFF MUST preserve B0 verbatim path (no QueryPlan / family orchestration / plan SSE).
 * Does NOT change Core Acc P0, B0 promote, A2-safe, or C1 Bound.
 */

/** @param {string} name */
function envOn(name) {
  const v = process.env[name];
  return v === '1' || v === 'true' || v === 'TRUE' || v === 'yes';
}

/** QueryPlan + budget + family orchestration Preview path. Default OFF. */
export function isQueryPlanEnabled(opts = {}) {
  if (opts.enableQueryPlan === true) return true;
  if (opts.enableQueryPlan === false) return false;
  return envOn('DISCOVERY_ENABLE_QUERYPLAN');
}

/** Emit SSE `plan` / optional `graph` additive events. Default OFF; implies QueryPlan emit when plan path runs. */
export function isPlanSseEnabled(opts = {}) {
  if (opts.enablePlanSse === true) return true;
  if (opts.enablePlanSse === false) return false;
  // When QueryPlan path is on, plan SSE is on unless explicitly disabled
  if (envOn('DISCOVERY_ENABLE_PLAN_SSE')) return true;
  return isQueryPlanEnabled(opts);
}

export function discoveryFlagSnapshot(opts = {}) {
  return {
    DISCOVERY_ENABLE_QUERYPLAN: isQueryPlanEnabled(opts),
    DISCOVERY_ENABLE_PLAN_SSE: isPlanSseEnabled(opts),
    DISCOVERY_ENABLE_VIAF: envOn('DISCOVERY_ENABLE_VIAF'),
    DISCOVERY_ENABLE_WEB_ORIGIN: envOn('DISCOVERY_ENABLE_WEB_ORIGIN'),
  };
}

export default {
  isQueryPlanEnabled,
  isPlanSseEnabled,
  discoveryFlagSnapshot,
};
