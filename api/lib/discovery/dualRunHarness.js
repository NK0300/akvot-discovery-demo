/**
 * Dual-run CONTROL / TREATMENT harness stubs — measure-ready, no live Preview promote.
 * CONTROL  = DISCOVERY_ENABLE_QUERYPLAN OFF (B0 verbatim)
 * TREATMENT = QueryPlan ON (family orch + budget + plan emit)
 * Does NOT touch Core /api/lookup · no promote · F11 candidates stay unwired.
 *
 * Wave-3: TREATMENT compose probe — soft-fail + SSRF urlTargets gate + budget hard-stop
 * must compose correctly under flag-ON (unit/wire only; live Preview OPEN).
 */
import { isQueryPlanEnabled, discoveryFlagSnapshot } from './flags.js';
import { createDiscoverySession, clearSessions, emitSnapshot } from './orchestrator.js';
import { scrubFamilyJournal, adapterSoftFailCode } from './adapterContract.js';
import { buildQueryPlan } from './queryPlan.js';
import { selectFetchablePlanUrlTargets } from './security.js';

export const DUAL_RUN_HARNESS_VERSION = '2026-09-23.dualrun-compose1';

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
  'softFailCodes',
  'urlTargetsBlocked',
  'budgetHardStop',
  'ssrfGatePoison',
]);

export function controlOpts(extra = {}) {
  const { flags: extraFlags, ...rest } = extra || {};
  return {
    arm: 'CONTROL',
    ...rest,
    flags: { viaf: false, webOrigin: false, ...(extraFlags || {}) },
    enableQueryPlan: false,
  };
}

export function treatmentOpts(extra = {}) {
  const { flags: extraFlags, ...rest } = extra || {};
  return {
    arm: 'TREATMENT',
    ...rest,
    flags: { viaf: false, webOrigin: false, ...(extraFlags || {}) },
    enableQueryPlan: true,
  };
}

function collectSoftFailCodes(raw, snap) {
  const codes = new Set();
  for (const j of raw?.familyJournal || []) {
    const st = String(j?.status || '');
    if (st === 'cancelled' || st === 'timeout' || st === 'budget_exhausted' || st === 'error') {
      codes.add(st);
    }
    if (j?.budgetExhaustedReason) codes.add('budget_exhausted');
    for (const r of j?.reasons || []) {
      const s = String(r);
      if (/budget_exhausted/i.test(s)) codes.add('budget_exhausted');
      if (/timeout/i.test(s)) codes.add('timeout');
      if (/\bcancel/i.test(s)) codes.add('cancelled');
    }
  }
  for (const e of snap?.errors || raw?.errors || []) {
    const c = adapterSoftFailCode(e);
    if (c) codes.add(c);
  }
  if (raw?.budgetExhaustedReason || raw?.budgetExhausted) codes.add('budget_exhausted');
  return [...codes].sort();
}

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
  const plan = snap.queryPlan || raw.queryPlan || null;
  const urlTargets = Array.isArray(plan?.urlTargets) ? plan.urlTargets : [];
  const blockedTargets = urlTargets.filter((t) => t && t.safety && t.safety !== 'allowed');
  const softFailCodes = collectSoftFailCodes(raw, snap);
  const budgetHardStop =
    !!raw.budgetExhaustedReason ||
    !!raw.budgetExhausted ||
    journal.some((j) => j.status === 'budget_exhausted') ||
    softFailCodes.includes('budget_exhausted');
  let ssrfGatePoison = false;
  if (plan && typeof plan === 'object') {
    try {
      const gate = selectFetchablePlanUrlTargets(plan);
      ssrfGatePoison = !!(gate.poison || gate.failClosed);
    } catch {
      ssrfGatePoison = false;
    }
  }
  return {
    findingsCount: findings.length,
    evidenceCount: evidence.length,
    hasQueryPlan: !!plan,
    familyJournalLength: journal.length,
    budgetExhausted: budgetHardStop,
    forbiddenStripped: snap.forbiddenStripped || 0,
    providerIds,
    latencyMs: latencyMs || 0,
    accLeakForbiddenQ: forbiddenLeak ? 1 : 0,
    planId: plan?.planId || raw.planId || null,
    sessionId: created?.sessionId || raw.sessionId || null,
    softFailCodes,
    urlTargetsBlocked: blockedTargets.length,
    budgetHardStop,
    ssrfGatePoison,
  };
}

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
    treatmentBudgetHardStop: !!t.budgetHardStop,
    treatmentUrlTargetsBlocked: t.urlTargetsBlocked || 0,
    treatmentSoftFailCodes: t.softFailCodes || [],
  };
}

export async function runDualRunStub(body, opts = {}) {
  const seed = body?.seed || 'DualRun Stub Seed';
  const hints = body?.hints || {};
  const providers = opts.providers || [];
  const makeStore = opts.storeFactory || (() => new Map());

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
      { store: storeC, providers, ...controlOpts(opts.control || {}) },
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
      { store: storeT, providers, ...treatmentOpts(opts.treatment || {}) },
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
 * TREATMENT compose probe: soft-fail + SSRF urlTargets gate + budget hard-stop under flag-ON.
 */
export async function runTreatmentComposeProbe(opts = {}) {
  const seed = opts.seed || 'Compose Probe Seed';
  const poisonUrls = opts.poisonUrls || [
    'http://127.0.0.1/admin',
    'https://169.254.169.254/latest/meta-data/',
    'https://localhost/secret',
    'file:///etc/passwd',
  ];
  const budgetCaps = opts.budgetCaps || {
    maxFamilyCalls: 1,
    maxRequests: 1,
    maxWallMs: 80,
    maxFindings: 2,
    maxEvidence: 2,
  };

  const softFailProvider = {
    id: 'wikidata',
    async search(_req, ctx) {
      const err = new Error('Injected AbortError compose probe');
      err.name = 'AbortError';
      err.reason = 'timeout';
      if (ctx?.signal?.aborted) {
        const c = new Error('cancelled');
        c.name = 'AbortError';
        c.reason = 'cancelled';
        throw c;
      }
      throw err;
    },
  };
  const budgetDrainProvider = {
    id: 'openlibrary',
    async search() {
      const err = new Error('budget ledger stop');
      err.code = 'budget_exhausted';
      throw err;
    },
  };
  const okProvider = {
    id: 'wikipedia',
    async search() {
      return {
        providerId: 'wikipedia',
        findings: [
          {
            id: 'wp-compose',
            title: 'Compose Safe',
            provenanceUrl: 'https://en.wikipedia.org/wiki/Ada_Lovelace',
            quote: 'ok',
            entityRefs: ['qid:Q7259'],
          },
        ],
        partial: false,
      };
    },
  };

  const providers = opts.providers || [softFailProvider, budgetDrainProvider, okProvider];

  const plan = buildQueryPlan({
    seed,
    hints: { urls: poisonUrls, seedClass: 'person' },
    urls: poisonUrls,
    budgetsRemaining: budgetCaps,
    flags: { viaf: false, webOrigin: false },
  });
  const gate = selectFetchablePlanUrlTargets(plan);
  const blockedInPlan = (plan.urlTargets || []).filter((t) => t.safety !== 'allowed').length;

  const prev = process.env.DISCOVERY_ENABLE_QUERYPLAN;
  delete process.env.DISCOVERY_ENABLE_QUERYPLAN;
  try {
    clearSessions();
    const store = new Map();
    const t0 = Date.now();
    const created = await createDiscoverySession(
      { seed, hints: { urls: poisonUrls, seedClass: 'person' } },
      {
        store,
        providers,
        ...treatmentOpts({ budgetCaps, discoveryBudget: budgetCaps }),
      },
    );
    const raw = store.get(created.sessionId);
    const metrics = extractDualRunMetrics(created, raw, Date.now() - t0);
    const snapBlob = JSON.stringify(created.snapshot || {});
    return {
      harnessVersion: DUAL_RUN_HARNESS_VERSION,
      arm: 'TREATMENT',
      flagOnConfirmed: isQueryPlanEnabled({ enableQueryPlan: true }) === true,
      livePreviewPromote: false,
      compose: {
        softFailPresent:
          metrics.softFailCodes.length > 0 ||
          (raw?.familyJournal || []).some((j) =>
            ['timeout', 'cancelled', 'budget_exhausted', 'error'].includes(j.status),
          ),
        softFailCodes: metrics.softFailCodes,
        ssrfGate: {
          poison: !!(gate.poison || gate.failClosed),
          fetchableCount: (gate.urls || []).length,
          blockedCount: (gate.blocked || []).length + blockedInPlan,
          planBlockedLabels: blockedInPlan,
        },
        budgetHardStop: metrics.budgetHardStop,
        hasQueryPlan: metrics.hasQueryPlan,
        accLeakForbiddenQ: metrics.accLeakForbiddenQ,
        // Credential-shaped + raw poison URLs must not survive emit (softEr scrub)
        noCredentialLeak: !/(api[_-]?key\s*[=:]|password\s*[=:]|token\s*[=:]|Bearer\s+[A-Za-z0-9._-]+)/i.test(
          snapBlob,
        ),
        noRawPoisonUrl:
          !/https?:\/\/127\.0\.0\.1|https?:\/\/localhost\/|169\.254\.169\.254|file:\/\//i.test(snapBlob),
      },
      metrics,
      measureReady: true,
    };
  } finally {
    if (prev === undefined) delete process.env.DISCOVERY_ENABLE_QUERYPLAN;
    else process.env.DISCOVERY_ENABLE_QUERYPLAN = prev;
  }
}

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
  runTreatmentComposeProbe,
  dualRunMeasureSheetStub,
};
