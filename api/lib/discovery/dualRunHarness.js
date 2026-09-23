/**
 * Dual-run CONTROL / TREATMENT harness stubs — measure-ready, no live Preview promote.
 * CONTROL  = DISCOVERY_ENABLE_QUERYPLAN OFF (B0 verbatim)
 * TREATMENT = QueryPlan ON (family orch + budget + plan emit)
 * Does NOT touch Core /api/lookup · no promote · F11 candidates stay unwired.
 */
import { isQueryPlanEnabled, discoveryFlagSnapshot } from './flags.js';
import { createDiscoverySession, clearSessions, emitSnapshot } from './orchestrator.js';
import { scrubFamilyJournal } from './adapterContract.js';

export const DUAL_RUN_HARNESS_VERSION = '2026-09-22.dualrun-b1';

/** Metric template for GO-MEASURE (fill live later — stubs only). */
export const DUAL_RUN_METRIC_KEYS = Object.freeze([
  'findingsCount',
  'evidenceCount',
  'hasQueryPlan',
  'familyJournalLength',
  'budgetExhausted',
  'forbiddenStripped',
  'providerIds',
  'latencyMs',
  'accLeakForbiddenQ',
]);

/**
 * @returns {{ arm: 'CONTROL', enableQueryPlan: false, flags: object }}
 */
export function controlOpts(extra = {}) {
  const { flags: extraFlags, ...rest } = extra || {};
  return {
    arm: 'CONTROL',
    ...rest,
    flags: { viaf: false, webOrigin: false, ...(extraFlags || {}) },
    enableQueryPlan: false, // force CONTROL
  };
}

/**
 * @returns {{ arm: 'TREATMENT', enableQueryPlan: true, flags: object }}
 */
export function treatmentOpts(extra = {}) {
  const { flags: extraFlags, ...rest } = extra || {};
  return {
    arm: 'TREATMENT',
    ...rest,
    flags: { viaf: false, webOrigin: false, ...(extraFlags || {}) },
    enableQueryPlan: true, // force TREATMENT
  };
}

/**
 * Snapshot metrics from a createDiscoverySession result (Acc-safe).
 * @param {object} created
 * @param {object} [rawSession]
 * @param {number} [latencyMs]
 */
export function extractDualRunMetrics(created, rawSession = null, latencyMs = 0) {
  const snap = created?.snapshot || (rawSession ? emitSnapshot(rawSession) : null) || {};
  const raw = rawSession || {};
  const findings = snap.findings || raw.findings || [];
  const evidence = snap.evidence || raw.evidence || [];
  const journal = scrubFamilyJournal(raw.familyJournal || []);
  const blob = JSON.stringify(snap);
  const forbiddenLeak = /\bQ1701775\b/i.test(blob);
  const providerIds = [
    ...new Set(
      findings.flatMap((f) => f.providers || []).concat(
        evidence.map((e) => e.providerId).filter(Boolean),
      ),
    ),
  ].sort();
  return {
    findingsCount: findings.length,
    evidenceCount: evidence.length,
    hasQueryPlan: !!(snap.queryPlan || raw.queryPlan),
    familyJournalLength: journal.length,
    budgetExhausted: !!(raw.budgetExhaustedReason || raw.budgetExhausted),
    forbiddenStripped: snap.forbiddenStripped || 0,
    providerIds,
    latencyMs: latencyMs || 0,
    accLeakForbiddenQ: forbiddenLeak ? 1 : 0,
    planId: snap.queryPlan?.planId || raw.planId || null,
    sessionId: created?.sessionId || raw.sessionId || null,
  };
}

/**
 * Delta row CONTROL → TREATMENT (measure-ready).
 * @param {object} controlMetrics
 * @param {object} treatmentMetrics
 */
export function dualRunDelta(controlMetrics, treatmentMetrics) {
  const c = controlMetrics || {};
  const t = treatmentMetrics || {};
  return {
    findingsDelta: (t.findingsCount || 0) - (c.findingsCount || 0),
    evidenceDelta: (t.evidenceCount || 0) - (c.evidenceCount || 0),
    queryPlanAppeared: !c.hasQueryPlan && !!t.hasQueryPlan,
    journalGrew: (t.familyJournalLength || 0) > (c.familyJournalLength || 0),
    accLeakEither: (c.accLeakForbiddenQ || 0) + (t.accLeakForbiddenQ || 0) > 0,
    controlProviders: c.providerIds || [],
    treatmentProviders: t.providerIds || [],
  };
}

/**
 * In-process dual-run stub (mock providers OK). No network promote.
 * @param {{ seed: string, hints?: object }} body
 * @param {{ providers?: object[], storeFactory?: function, control?: object, treatment?: object }} opts
 */
export async function runDualRunStub(body, opts = {}) {
  const seed = body?.seed || 'DualRun Stub Seed';
  const hints = body?.hints || {};
  const providers = opts.providers || [];
  const makeStore = opts.storeFactory || (() => new Map());

  // Ensure env flag does not bleed — opts.enableQueryPlan is authoritative
  const prev = process.env.DISCOVERY_ENABLE_QUERYPLAN;
  delete process.env.DISCOVERY_ENABLE_QUERYPLAN;

  const out = {
    harnessVersion: DUAL_RUN_HARNESS_VERSION,
    flagSnapshot: discoveryFlagSnapshot({}),
    control: null,
    treatment: null,
    delta: null,
    measureReady: true,
    livePreviewPromote: false,
  };

  try {
    clearSessions();
    const storeC = makeStore();
    const t0 = Date.now();
    const createdC = await createDiscoverySession(
      { seed, hints },
      {
        store: storeC,
        providers,
        ...controlOpts(opts.control || {}),
      },
    );
    const rawC = storeC.get(createdC.sessionId);
    out.control = {
      arm: 'CONTROL',
      metrics: extractDualRunMetrics(createdC, rawC, Date.now() - t0),
      flagOffConfirmed: isQueryPlanEnabled({ enableQueryPlan: false }) === false,
    };

    clearSessions();
    const storeT = makeStore();
    const t1 = Date.now();
    const createdT = await createDiscoverySession(
      { seed, hints },
      {
        store: storeT,
        providers,
        ...treatmentOpts(opts.treatment || {}),
      },
    );
    const rawT = storeT.get(createdT.sessionId);
    out.treatment = {
      arm: 'TREATMENT',
      metrics: extractDualRunMetrics(createdT, rawT, Date.now() - t1),
      flagOnConfirmed: isQueryPlanEnabled({ enableQueryPlan: true }) === true,
    };

    out.delta = dualRunDelta(out.control.metrics, out.treatment.metrics);
    return out;
  } finally {
    if (prev === undefined) delete process.env.DISCOVERY_ENABLE_QUERYPLAN;
    else process.env.DISCOVERY_ENABLE_QUERYPLAN = prev;
  }
}

/**
 * Empty measure sheet for Chief / GO-MEASURE to fill after Preview.
 */
export function dualRunMeasureSheetStub(meta = {}) {
  return {
    version: DUAL_RUN_HARNESS_VERSION,
    status: 'STUB_MEASURE_READY',
    livePreviewRequired: true,
    promoteForbidden: true,
    metricKeys: [...DUAL_RUN_METRIC_KEYS],
    control: { arm: 'CONTROL', dpl: null, url: null, flag: 'OFF', rows: [] },
    treatment: { arm: 'TREATMENT', dpl: null, url: null, flag: 'ON', rows: [] },
    notes: meta.notes || 'Fill after GO-MEASURE Preview; do not invent dpl_*',
    stampedAt: new Date().toISOString(),
  };
}

export default {
  DUAL_RUN_HARNESS_VERSION,
  DUAL_RUN_METRIC_KEYS,
  controlOpts,
  treatmentOpts,
  extractDualRunMetrics,
  dualRunDelta,
  runDualRunStub,
  dualRunMeasureSheetStub,
};
