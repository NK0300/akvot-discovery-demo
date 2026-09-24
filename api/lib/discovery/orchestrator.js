/**
 * Discovery Orchestrator — S0–S10 + durable store + narrow + SSE helpers.
 * Session store: KV if env present, else /tmp + regenerate-from-seed (Preview-safe).
 * Soft provider errors. Entity-agnostic Seeds.
 * Does NOT call mayCommitDossier / Core identity commit.
 */
import { getDefaultProviders, softEntityResolve } from './providers.js';
import {
  resolveWebOriginCandidates,
  looksLikeUrlOrHostname,
} from './webOrigin.js';
import {
  isWdOfficialWebsiteBridgeEnabled,
  shouldEmitUrlDomainCandidates,
  buildUrlDomainCandidates,
  collectOfficialWebsiteBridgeTargets,
  mergeUrlDomainCandidatesIntoGraph,
  scrubUrlDomainCandidatesForEmit,
} from './urlDomainCandidates.js';
import { isWdClaimPackEnabled, isGeneralWebSearchEnabled } from './flags.js';
import {
  searchGeneralWeb,
  GENERAL_WEB_SEARCH_PROVIDER_ID,
  GENERAL_WEB_TIMEOUT_MS,
} from './generalWebSearch.js';
import {
  assertSafePublicHttpsUrl,
  selectFetchablePlanUrlTargets,
} from './security.js';
import {
  normalizeRawHit,
  dedupeByEvidenceFingerprint,
  coalesceBySoftEntity,
  rankFindings,
  detectContradictions,
} from './store.js';
import { aggregateFacets } from './facets.js';
import { sanitizeDiscoveryPayload } from './emit.js';
import { FORBIDDEN_IDENTITIES_VERSION } from '../forbiddenIdentities.js';
import {
  sessionStore,
  mintSessionId,
  decodeSessionId,
  getStoreInfo,
  createMemoryMapAdapter,
  ensureSessionVersion,
  healthCheck as storeHealthCheck,
} from './sessionStore.js';
import { mintCorrelationId,
  structuredLog,
  logDiscoveryEvent,
  recordBudgetUsage, incrMetric, recordLatency } from './obs.js';
import { MAX_SEED_CHARS } from './requestGuards.js';
import { applyNarrow } from './narrow.js';
import {
  resolveFault,
  shouldForceStoreMiss,
  maybeProviderTimeout,
  scrubPathInjectFindings,
  maybeStoreLatency,
  faultTelemetry,
} from './faultInject.js';
import { isQueryPlanEnabled } from './flags.js';
import {
  planForSession,
  executePlanLaunches,
  shouldUseQueryPlan,
} from './planOrchestration.js';
import { runFamilyOrchestration } from './familyOrchestrator.js';
import { createBudgetLedger } from './budget.js';
import { buildEvidenceGraph } from './evidenceGraph.js';
import { enrichSessionEvidence } from './evidence.js';
import { buildDiscoveryGaps, scrubGapsForEmit } from './gaps.js';
import { sanitizeRelationshipGraph } from './relationship.js';
import { scrubQueryPlanForEmit } from './queryPlan.js';
import {
  isWdP856UrlBridgeEnabled,
  harvestOfficialWebsiteUrlsFromBatches,
  mergeOfficialWebsiteUrlTargets,
  p856ProvenanceForUrl,
  fetchableUrlTargetsFromPlan,
  MAX_P856_URL_TARGETS,
} from './urlTargetBridge.js';
import { buildPlanCoverage, scrubPlanCoverageForEmit } from './planCoverage.js';


/** Public store telemetry — never expose fsDir / secrets. */
export function publicStoreInfo(info) {
  const i = info || getStoreInfo();
  return {
    backend: i.backend || i.storeBackend,
    storeBackend: i.storeBackend || i.backend,
    durable: i.durable === true,
    fallback: i.fallback === true,
    explicitFallback: i.explicitFallback === true || i.backend === 'fs-regen',
    fsRegenFallback: i.fsRegenFallback === true || i.backend === 'fs-regen',
    promoteEligible: i.promoteEligible === true,
    crossInstance: i.crossInstance,
    durabilityState: i.durabilityState,
    kvReachable: i.kvReachable,
    note: i.note,
    ttlMs: i.ttlMs,
    kvCredsPresent: i.kvCredsPresent === true,
    ...(i.regenerated ? { regenerated: true } : {}),
    ...(i.regenReason ? { regenReason: i.regenReason } : {}),
  };
}

const DEFAULT_BUDGETS = {
  sessionWallMs: 12_000,
  providerMs: 3_500,
  firstPaintMs: 800,
};

/**
 * Resolve store: opts.store (Map for tests) OR durable sessionStore.
 * Map adapter: sync get/set like before for unit tests.
 * @param {object} [opts]
 */
function resolveStore(opts = {}) {
  if (opts.store && typeof opts.store.get === 'function' && typeof opts.store.set === 'function') {
    return {
      kind: 'map',
      async get(id) {
        return opts.store.get(id) || null;
      },
      async set(id, sess) {
        opts.store.set(id, sess);
      },
      clear() {
        if (typeof opts.store.clear === 'function') opts.store.clear();
      },
    };
  }
  return {
    kind: 'durable',
    get: (id) => sessionStore.get(id),
    set: (id, sess) => sessionStore.set(id, sess),
    clear() {
      sessionStore.clearMemory();
    },
  };
}

/** @deprecated sync helper kept for tests that inject Map */
export function getSessionStore(opts = {}) {
  if (opts.store instanceof Map) return opts.store;
  return createMemoryMapAdapter();
}

/**
 * Create session (S0) and run pipeline (S1–S10).
 * @param {{ seed?: string, q?: string, hints?: object, locale?: string }} body
 * @param {{ providers?: object[], budgets?: object, store?: Map, injectFindings?: object[] }} [opts]
 */
export async function createDiscoverySession(body = {}, opts = {}) {
  const seed = String(body.seed ?? body.q ?? '').trim();
  if (!seed) {
    const err = new Error('seed required');
    err.status = 400;
    throw err;
  }
  if (seed.length > MAX_SEED_CHARS) {
    const err = new Error(`seed exceeds ${MAX_SEED_CHARS} chars`);
    err.status = 413;
    throw err;
  }

  const store = resolveStore(opts);
  const hints = body.hints && typeof body.hints === 'object' ? body.hints : {};
  const locale = body.locale || 'en';
  const sessionId =
    opts.sessionId ||
    mintSessionId({ seed, hints, locale });
  const budgets = { ...DEFAULT_BUDGETS, ...(opts.budgets || {}) };
  const providers = opts.providers || getDefaultProviders();
  const storeInfo = getStoreInfo();
  const fault = resolveFault({ fault: opts.fault, body, query: opts.query });
  const correlationId = opts.correlationId || body.correlationId || mintCorrelationId('sess');
  const _t0 = Date.now();
  incrMetric('discovery.create');
  await maybeStoreLatency(fault);
  const scrubInject = scrubPathInjectFindings(fault);
  const injectFindings = [
    ...(Array.isArray(opts.injectFindings) ? opts.injectFindings : []),
    ...(scrubInject || []),
  ];

  /** @type {object} */
  const session = {
    sessionId,
    seed,
    q: seed,
    hints,
    locale,
    createdAt: decodeSessionId(sessionId)?.createdAt || new Date().toISOString(),
    status: 'running',
    providers: Object.fromEntries(providers.map((p) => [p.id, 'pending'])),
    findings: [],
    evidence: [],
    facets: [],
    progress: { done: 0, totalHint: providers.length + 3 },
    budgets: { ...budgets, startedAt: Date.now() },
    softEr: null,
    forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
    stage: 'S0',
    version: 1,
    eventCursor: 0,
    _storeInfo: storeInfo,
  };
  await store.set(sessionId, session);
  // B18: after durable write, probe state is recorded — refresh flags for response
  session._storeInfo = getStoreInfo();

  await runPipeline(sessionId, {
    store: opts.store,
    _resolved: store,
    providers,
    budgets,
    injectFindings: injectFindings.length ? injectFindings : undefined,
    fault,
    correlationId,
    // QueryPlan dual-run: forward flag + budget caps (default OFF → B0 identical)
    enableQueryPlan: opts.enableQueryPlan,
    enablePlanSse: opts.enablePlanSse,
    flags: opts.flags,
    budgetCaps: opts.budgetCaps || opts.discoveryBudget,
    discoveryBudget: opts.discoveryBudget || opts.budgetCaps,
  });

  const final = await store.get(sessionId);
  const liveStoreInfo = getStoreInfo();
  if (final) final._storeInfo = liveStoreInfo;
  const snap = final ? emitSnapshot(final) : null;
  recordLatency('discovery.create', Date.now() - _t0, true);
  return {
    sessionId,
    status: final?.status || 'running',
    pollAfterMs: 300,
    store: publicStoreInfo(liveStoreInfo),
    correlationId: correlationId || undefined,
    ...(fault ? { fault: faultTelemetry(fault) } : {}),
    snapshot: snap,
  };
}

/**
 * Get Acc-scrubbed snapshot. On durable miss: regenerate-from-seed if id encodes seed.
 * @param {string} sessionId
 * @param {{ store?: Map, providers?: object[], budgets?: object, allowRegen?: boolean }} [opts]
 */
export async function getDiscoverySession(sessionId, opts = {}) {
  const store = resolveStore(opts);
  const fault = resolveFault({ fault: opts.fault, query: opts.query, body: opts.body });
  await maybeStoreLatency(fault);
  if (shouldForceStoreMiss(fault)) {
    return null;
  }
  let raw = await store.get(sessionId);
  if (!raw && opts.allowRegen !== false) {
    raw = await maybeRegenerate(sessionId, opts);
  }
  if (!raw) return null;
  // Acc scrub on every rehydrate (HIT path)
  const snap = emitSnapshot(raw);
  if (fault) snap.fault = faultTelemetry(fault);
  return snap;
}

/**
 * Regenerate session from seed embedded in durable session id (fs-regen backend).
 */
async function maybeRegenerate(sessionId, opts = {}) {
  const meta = decodeSessionId(sessionId);
  if (!meta?.seed) return null;
  // Re-run create with fixed sessionId so Acc/QA GET after POST works cross-instance
  const result = await createDiscoverySession(
    { seed: meta.seed, hints: meta.hints, locale: meta.locale },
    {
      ...opts,
      sessionId,
      providers: opts.providers,
      budgets: opts.budgets || { sessionWallMs: 12_000, providerMs: 3_500 },
    },
  );
  const store = resolveStore(opts);
  const sess = await store.get(result.sessionId);
  if (sess) {
    const info = getStoreInfo();
    sess._regenerated = true;
    sess._regeneratedAt = new Date().toISOString();
    sess._regenReason = 'fs-miss-seed-decode';
    sess._storeInfo = {
      ...info,
      storeBackend: info.storeBackend || info.backend,
      fallback: true,
      explicitFallback: true,
      fsRegenFallback: true,
      durable: false,
      promoteEligible: false,
      regenerated: true,
    };
    // Explicit telemetry — never silent false confidence
    console.info('[discovery.store] fs-regen fallback', {
      storeBackend: info.storeBackend || info.backend,
      durable: false,
      fallback: true,
      promoteEligible: false,
      regenerated: true,
      sessionIdPrefix: String(sessionId).slice(0, 8),
    });
    await store.set(sessionId, sess);
  }
  return sess;
}

/**
 * Progressive snapshot with Acc scrub (S9/S10).
 * @param {object} session
 */
export function emitSnapshot(session) {
  const cached = session._storeInfo || {};
  const live = getStoreInfo();
  // B18: prefer live probe-gated durability flags over stale create-time snapshot
  const storeInfo = {
    ...cached,
    ...live,
    regenerated: session._regenerated || cached.regenerated || live.regenerated,
    regenReason: session._regenReason || cached.regenReason || live.regenReason,
  };
  const scrubbed = sanitizeDiscoveryPayload({
    sessionId: session.sessionId,
    seed: session.seed,
    q: session.q,
    status: session.status,
    findings: session.findings,
    evidence: session.evidence,
    facets: session.facets,
    progress: session.progress,
    providers: session.providers,
    softEr: session.softEr,
    stage: session.stage,
    createdAt: session.createdAt,
    forbiddenIdentitiesVersion: session.forbiddenIdentitiesVersion,
    graph: session.graph,
    narrow: session.narrow,
    contradictions: session.contradictions,
    queryPlan: session.queryPlan,
    budgetTelemetry: session.budgetTelemetry,
    familyJournal: session.familyJournal,
    budgetExhaustedReason: session.budgetExhaustedReason,
    gaps: session.gaps,
    urlDomainCandidates: session.urlDomainCandidates,
    p856Bridge: session.p856Bridge,
    evidenceEngineVersion: session.evidenceEngineVersion,
    evidenceGroups: session.evidenceGroups,
    evidenceDedup: session.evidenceDedup,
    corroborationEdges: session.corroborationEdges,
    store: publicStoreInfo(storeInfo),
    regenerated: session._regenerated || undefined,
    regenReason: session._regenReason || undefined,
  });
  return scrubbed;
}

/**
 * Narrow facets/filters — Acc scrub on response.
 * @param {string} sessionId
 * @param {object} body
 * @param {{ store?: Map, allowRegen?: boolean }} [opts]
 */
export async function narrowDiscoverySession(sessionId, body = {}, opts = {}) {
  const store = resolveStore(opts);
  let raw = await store.get(sessionId);
  if (!raw && opts.allowRegen !== false) {
    raw = await maybeRegenerate(sessionId, opts);
  }
  if (!raw) {
    const err = new Error('session not found');
    err.status = 404;
    throw err;
  }

  const narrowed = applyNarrow(raw, body);
  // Scrub before persist (canonical scrubbed representation)
  const snap = emitSnapshot({
    ...raw,
    findings: narrowed.findings,
    evidence: narrowed.evidence,
    facets: narrowed.facets,
    narrow: narrowed.narrow,
  });

  // Durable update: store lastNarrow view + bump version (BOUNDARIES §2.2 / §5)
  raw.lastNarrow = {
    ...narrowed.narrow,
    findings: snap.findings,
    evidence: snap.evidence,
    facets: snap.facets,
    appliedAt: new Date().toISOString(),
  };
  raw.narrowActive = true;
  ensureSessionVersion(raw, { bump: true });
  await store.set(sessionId, raw);

  return {
    ok: true,
    sessionId,
    status: snap.status,
    findings: snap.findings,
    evidence: snap.evidence,
    facets: snap.facets,
    narrow: snap.narrow || narrowed.narrow,
    version: raw.version,
    forbiddenIdentitiesVersion: snap.forbiddenIdentitiesVersion,
    forbiddenStripped: snap.forbiddenStripped,
    progress: snap.progress,
    providers: snap.providers,
    store: publicStoreInfo(raw._storeInfo || getStoreInfo()),
  };
}

/**
 * Load raw session for SSE (with regen). Caller must Acc-scrub events.
 */
export async function loadSessionRaw(sessionId, opts = {}) {
  const store = resolveStore(opts);
  let raw = await store.get(sessionId);
  if (!raw && opts.allowRegen !== false) {
    raw = await maybeRegenerate(sessionId, opts);
  }
  return raw;
}

/**
 * @param {string} sessionId
 * @param {{ store?: Map, _resolved?: object, providers?: object[], budgets?: object, injectFindings?: object[] }} opts
 */

/**
 * L1 · After WD claim-pack findings: merge P856 URLs into plan.urlTargets and
 * gated web_origin fetch (C1 UNKNOWN · never soft-ref from URL · SSRF fail-closed).
 * No-op when flags OFF or budget exhausted.
 */
async function bridgeWdP856ToWebOrigin(session, batches, ctx = {}) {
  if (!isWdP856UrlBridgeEnabled()) return batches;
  if (session?.budgetExhaustedReason) return batches;
  if (Date.now() >= (ctx.wallDeadline || 0)) return batches;

  const fromBatches = harvestOfficialWebsiteUrlsFromBatches(batches);
  const fromSession = Array.isArray(session._p856UrlCandidates)
    ? session._p856UrlCandidates
    : [];
  const byUrl = new Map();
  for (const c of [...fromSession, ...fromBatches]) {
    if (c?.url && !byUrl.has(c.url)) byUrl.set(c.url, c);
  }
  const candidates = [...byUrl.values()].slice(0, MAX_P856_URL_TARGETS);
  if (!candidates.length) return batches;

  const livePlan = ctx.livePlan || null;
  const planForMerge =
    livePlan ||
    (session.queryPlan && typeof session.queryPlan === 'object'
      ? session.queryPlan
      : { urlTargets: [] });
  const merged = mergeOfficialWebsiteUrlTargets(planForMerge, candidates);
  if (livePlan) {
    session.queryPlan = scrubQueryPlanForEmit(livePlan);
  } else if (session.queryPlan && typeof session.queryPlan === 'object') {
    session.queryPlan.urlTargets = merged.urlTargets;
  }

  const { urls: fetchable, poison } = fetchableUrlTargetsFromPlan(planForMerge);
  if (poison) {
    session.providers = session.providers || {};
    session.providers.web_origin = session.providers.web_origin || 'blocked_url';
    session.p856Bridge = {
      added: merged.added,
      dropped: (merged.dropped || []).length,
      poison: true,
      fetched: 0,
    };
    return batches;
  }
  if (!fetchable.length) {
    session.p856Bridge = {
      added: merged.added,
      dropped: (merged.dropped || []).length,
      poison: false,
      fetched: 0,
    };
    return batches;
  }

  const have = new Set();
  for (const b of batches) {
    if (b?.providerId !== 'web_origin') continue;
    for (const f of b.findings || []) {
      const u = String(f.provenanceUrl || f.normalizedUrl || '').trim();
      if (u) have.add(u);
      try {
        if (u) have.add(new URL(u).origin + '/');
      } catch { /* ignore */ }
    }
  }
  const need = fetchable.filter((u) => {
    if (have.has(u)) return false;
    try {
      if (have.has(new URL(u).origin + '/')) return false;
    } catch { /* ignore */ }
    return true;
  });
  if (!need.length) {
    session.p856Bridge = {
      added: merged.added,
      dropped: (merged.dropped || []).length,
      poison: false,
      fetched: 0,
      alreadyPresent: true,
    };
    return batches;
  }

  const hasProvider = (ctx.providerList || []).some((p) => p.id === 'web_origin');
  if (!hasProvider && process.env.DISCOVERY_ENABLE_WEB_ORIGIN !== '1') {
    return batches;
  }

  const first = candidates.find((c) => need.includes(c.url)) || candidates[0];
  const prov = p856ProvenanceForUrl(candidates, need[0]);
  try {
    const resolved = await resolveWebOriginCandidates(need.slice(0, MAX_P856_URL_TARGETS), {
      seed: session.seed,
      sessionId: ctx.sessionId,
      correlationId: ctx.correlationId,
      budgetMs: Math.min(3500, Math.max(50, (ctx.wallDeadline || Date.now()) - Date.now())),
      signal: ctx.sessionSignal,
      sourceFinding: prov.sourceFinding,
    });
    for (const f of resolved.findings || []) {
      const facets = new Set(f.facetHints || []);
      for (const h of prov.facetHints) facets.add(h);
      f.facetHints = [...facets].slice(0, 24);
      f.sourceFinding = f.sourceFinding || prov.sourceFinding;
      f.extractionMethod = prov.extractionMethod;
      f.hostFamily = f.hostFamily || 'web_origin';
      if (Array.isArray(f.entityRefs)) {
        f.entityRefs = f.entityRefs.filter((r) => !/^(viaf|qid|ol):/i.test(String(r)));
      }
    }
    if (resolved.findings?.length) {
      batches.push({
        providerId: 'web_origin',
        findings: resolved.findings,
        partial: false,
        _webOriginTelemetry: resolved.telemetries,
        _p856Bridge: true,
      });
      session.providers = session.providers || {};
      session.providers.web_origin = session.providers.web_origin || 'ok';
    } else if (resolved.errors?.length) {
      session.providers = session.providers || {};
      session.providers.web_origin = session.providers.web_origin || 'partial';
    }
    if (resolved.telemetries?.length) {
      session.webOriginTelemetry = (session.webOriginTelemetry || []).concat(resolved.telemetries);
    }
    session.p856Bridge = {
      added: merged.added,
      dropped: (merged.dropped || []).length,
      poison: false,
      fetched: (resolved.findings || []).length,
      sourceFinding: prov.sourceFinding,
      citedQid: first?.qid,
    };
  } catch {
    session.providers = session.providers || {};
    session.providers.web_origin = session.providers.web_origin || 'error';
  }
  return batches;
}

export async function runPipeline(sessionId, opts = {}) {
  const store = opts._resolved || resolveStore(opts);
  const session = await store.get(sessionId);
  if (!session) return;

  const budgets = { ...DEFAULT_BUDGETS, ...(opts.budgets || {}) };
  const providers = opts.providers || getDefaultProviders();
  const wallDeadline = Date.now() + budgets.sessionWallMs;
  const sessionSignal = AbortSignal.timeout
    ? AbortSignal.timeout(budgets.sessionWallMs)
    : undefined;

  try {
    session.stage = 'S1';
    session.progress = { ...session.progress, done: 1 };

    session.softEr = softEntityResolve(session.seed, session.hints);
    session.progress = { ...session.progress, done: 2 };

    session.stage = 'S2';
    const providerList = providers;
    const useQueryPlan = shouldUseQueryPlan(opts);
    /** @type {object[]} */
    let batches;

    if (useQueryPlan) {
      // --- QueryPlan Preview path (flag ON) ---
      session.stage = 'PLAN';
      const planned = planForSession(session, {
        flags: opts.flags,
        budgetCaps: opts.budgetCaps || opts.discoveryBudget,
      });
      if (!planned.ok) {
        // Kill-switch style: plan_invalid → fall back to B0 flat path once (not adaptive expand)
        session.planFallbackReason = planned.fallbackReason || 'plan_invalid';
        session.planErrors = planned.errors;
        batches = await Promise.all(
          providerList.map(async (p) => {
            if (Date.now() > wallDeadline) {
              session.providers[p.id] = 'skipped';
              return { providerId: p.id, findings: [], partial: true, errors: [{ code: 'session_budget', message: 'wall' }] };
            }
            try {
              if (opts.fault === 'provider_timeout') {
                await maybeProviderTimeout(opts.fault);
              }
              const batch = await p.search(
                {
                  q: session.seed,
                  sessionId,
                  budgetMs: budgets.providerMs,
                  locale: session.locale,
                  hints: session.hints,
                },
                { signal: sessionSignal || new AbortController().signal },
              );
              const hasErr = (batch.errors || []).length > 0;
              session.providers[p.id] = hasErr && !batch.findings?.length
                ? 'error'
                : batch.partial
                  ? 'partial'
                  : 'ok';
              return batch;
            } catch (e) {
              session.providers[p.id] = 'error';
              return {
                providerId: p.id,
                findings: [],
                partial: true,
                errors: [{ code: 'provider_throw', message: String(e?.message || e) }],
              };
            }
          }),
        );
      } else {
        session.queryPlan = scrubQueryPlanForEmit(planned.plan);
        session.planId = planned.plan.planId;
        const ledger = createBudgetLedger(planned.plan.budgets || opts.budgetCaps || {}, {
          startedAt: session.budgets?.startedAt || Date.now(),
        });
        session.stage = 'DISCOVER';
        // Canonical family orch (planned-only fanout · budget hard-stop · empty≠fanout)
                session.familyProgress = [];
        const orchOut = await runFamilyOrchestration(planned.plan, session, {
          providers: providerList,
          ledger,
          wallDeadline,
          signal: sessionSignal,
          flags: opts.flags || {},
          onFamilyResult: (result) => {
            // Progressive family/provider status for SSE hooks (Acc-safe codes only)
            const row = {
              familyId: result.familyId,
              providerId: result.providerId,
              intentId: result.intentId,
              status: result.status,
              outcomeClass: result.outcomeClass,
              at: Date.now(),
            };
            session.familyProgress.push(row);
            if (result.providerId) {
              session.providers = session.providers || {};
              session.providers[result.providerId] = result.status;
            }
            if (typeof opts.onFamilyResult === 'function') {
              try { opts.onFamilyResult(row); } catch { /* caller hook must not break orch */ }
            }
          },
        });
        // L1: re-scrub plan after mid-orch P856→urlTargets merges
        session.queryPlan = scrubQueryPlanForEmit(planned.plan);
        session._liveQueryPlan = planned.plan;
        session.familyJournal = orchOut.journal;
        session.planCoverage = buildPlanCoverage(planned.plan, orchOut.journal, {
          budgetExhaustedReason: orchOut.budgetExhaustedReason,
          stoppedReason: orchOut.budgetExhausted
            ? 'budget_exhausted'
            : sessionSignal?.aborted
              ? 'cancelled'
              : null,
        });
        // Emit-safe copy (no seed text)
        session.planCoverageEmit = scrubPlanCoverageForEmit(session.planCoverage);
        structuredLog('info', 'family_orch.complete', {
          correlationId: opts.correlationId || session.correlationId,
          planId: planned.plan.planId,
          status: orchOut.budgetExhausted ? 'partial' : 'ok',
          budgetExhaustedReason: orchOut.budgetExhaustedReason || undefined,
        });
        logDiscoveryEvent({
          event: 'family_orch.complete',
          correlationId: opts.correlationId || session.correlationId,
          requestId: opts.requestId || session.requestId,
          planId: planned.plan.planId,
          stage: session.stage,
          status: orchOut.budgetExhausted ? 'partial' : 'ok',
          budget: {
            status: orchOut.budgetExhausted ? 'BUDGET_EXHAUSTED' : 'BUDGET_AVAILABLE',
            exhaustedReason: orchOut.budgetExhaustedReason || undefined,
            remainingRequests: orchOut.budgetSnapshot?.remaining?.requests,
            remainingFamilyCalls: orchOut.budgetSnapshot?.remaining?.familyCalls,
          },
          counts: {
            findings: (session.findings || []).length,
            evidence: (session.evidence || []).length,
            providers: Array.isArray(providerList) ? providerList.length : undefined,
          },
          stateTransition: { from: 'DISCOVER', to: orchOut.budgetExhausted ? 'partial' : 'continue' },
        });
        recordBudgetUsage(orchOut.budgetSnapshot, {
          correlationId: opts.correlationId || session.correlationId,
          planId: planned.plan.planId,
        });
        session.budgetTelemetry = {
          availability: orchOut.budgetSnapshot?.availability,
          budgetExhaustedReason: orchOut.budgetExhaustedReason,
          used: orchOut.budgetSnapshot?.used,
          remaining: orchOut.budgetSnapshot?.remaining,
          limits: orchOut.budgetSnapshot?.limits
            ? {
                maxProviders: orchOut.budgetSnapshot.limits.maxProviders,
                maxFamilyCalls: orchOut.budgetSnapshot.limits.maxFamilyCalls,
                maxRequests: orchOut.budgetSnapshot.limits.maxRequests,
                maxWallMs: orchOut.budgetSnapshot.limits.maxWallMs,
                maxRetries: orchOut.budgetSnapshot.limits.maxRetries,
              }
            : undefined,
        };
        if (orchOut.budgetExhausted) {
          session.statusHint = 'partial';
          session.budgetExhaustedReason =
            orchOut.budgetExhaustedReason || 'budget_exhausted';
        }
        // Merge provider states from journal
        for (const [pid, st] of Object.entries(orchOut.providerStates || {})) {
          session.providers[pid] = st;
        }
        // Convert orch findings → provider batches for existing S3+ normalize/dedupe path.
        // Findings already carry planId/familyId/confirmationState=candidate.
        const byProv = new Map();
        for (const f of orchOut.findings || []) {
          const pid = (f.providers && f.providers[0]) || f.providerId || 'unknown';
          if (!byProv.has(pid)) byProv.set(pid, []);
          // Re-shape to raw-ish for normalizeRawHit (idempotent enough via provenanceUrl)
          byProv.get(pid).push({
            ...f,
            provenanceUrl:
              f.provenanceUrl ||
              (orchOut.evidence || []).find((e) => (f.evidenceIds || []).includes(e.id))
                ?.provenanceUrl,
            quote:
              f.quote ||
              (orchOut.evidence || []).find((e) => (f.evidenceIds || []).includes(e.id))
                ?.quote,
            planId: planned.plan.planId,
            familyId: f.familyId,
            intentId: f.intentId,
          });
        }
        // Also record empty/error journal entries as empty batches for provider map completeness
        for (const j of orchOut.journal || []) {
          if (!byProv.has(j.providerId)) byProv.set(j.providerId, []);
        }
        batches = [...byProv.entries()].map(([providerId, findings]) => ({
          providerId,
          findings,
          partial: false,
          planId: planned.plan.planId,
        }));
        // Keep executePlanLaunches available as secondary path for unit tests (no-op here)
        void executePlanLaunches;
      }
    } else {
      // --- B0 verbatim path (flag OFF) ---
      batches = await Promise.all(

      providerList.map(async (p) => {
        if (Date.now() > wallDeadline) {
          session.providers[p.id] = 'skipped';
          return { providerId: p.id, findings: [], partial: true, errors: [{ code: 'session_budget', message: 'wall' }] };
        }
        try {
          if (opts.fault === 'provider_timeout') {
            await maybeProviderTimeout(opts.fault);
          }
          const batch = await p.search(
            {
              q: session.seed,
              sessionId,
              budgetMs: budgets.providerMs,
              locale: session.locale,
              hints: session.hints,
            },
            { signal: sessionSignal || new AbortController().signal },
          );
          const hasErr = (batch.errors || []).length > 0;
          session.providers[p.id] = hasErr && !batch.findings?.length
            ? 'error'
            : batch.partial
              ? 'partial'
              : 'ok';
          return batch;
        } catch (e) {
          session.providers[p.id] = 'error';
          return {
            providerId: p.id,
            findings: [],
            partial: true,
            errors: [{ code: 'provider_throw', message: String(e?.message || e) }],
          };
        }
      }),
    );
    }

    if (Array.isArray(opts.injectFindings) && opts.injectFindings.length) {
      batches.push({
        providerId: 'inject',
        findings: opts.injectFindings,
        partial: false,
      });
      session.providers.inject = 'ok';
    }

    // EXP-C1: one-hop web_origin from URLs already present on findings (no recursive crawl).
    // Only when Preview flag on AND web_origin not already producing from seed URL/hostname.
    // QueryPlan path: skip ad-hoc one-hop (plan schedules web_origin; no silent expand / U7).
    // Budget exhausted: STOP FANOUT — no one-hop.
    if (
      !useQueryPlan &&
      !session.budgetExhaustedReason &&
      process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1' &&
      providerList.some((p) => p.id === 'web_origin') &&
      Date.now() < wallDeadline
    ) {
      try {
        const skipHost = /(wikidata|wikipedia|wikimedia|viaf\.org|openlibrary\.org)/i;
        const hopUrls = [];
        for (const batch of batches) {
          if (batch.providerId === 'web_origin') continue;
          for (const raw of batch.findings || []) {
            const u = String(raw.provenanceUrl || '').trim();
            if (/^https:\/\//i.test(u)) {
              try {
                const h = new URL(u).hostname;
                if (!skipHost.test(h)) hopUrls.push(u);
              } catch { /* skip */ }
            }
            // L1 (B0 path): WD P856 officialWebsiteUrls — not registry hosts; eligible one-hop
            if (isWdP856UrlBridgeEnabled() && Array.isArray(raw.officialWebsiteUrls)) {
              for (const ow of raw.officialWebsiteUrls) {
                const s = String(ow || '').trim();
                if (s) hopUrls.push(s);
              }
            }
          }
        }
        // Also honor explicit hints
        const hintHop = session.hints?.webOriginUrls || session.hints?.oneHopUrls;
        if (Array.isArray(hintHop)) hopUrls.push(...hintHop.map(String));
        // Checkpoint F: SSRF filter hop URLs (fail-closed). F11 hold — no crawl expand.
        // QueryPlan path already skips this block (!useQueryPlan); if a plan is still
        // attached, poison/failClosed gates zero hops.
        let uniq = [...new Set(hopUrls)];
        const planForGate = session.queryPlan || session.hints?.queryPlan;
        if (planForGate && typeof planForGate === 'object') {
          const gate = selectFetchablePlanUrlTargets(planForGate);
          if (gate.poison || gate.failClosed) {
            uniq = [];
          }
        }
        uniq = uniq
          .map((u) => {
            const check = assertSafePublicHttpsUrl(String(u));
            return check.ok ? (check.canonical || String(u)) : null;
          })
          .filter(Boolean);
        uniq = [...new Set(uniq)].slice(0, 3);
        // Skip one-hop if seed itself was already a URL/hostname (provider handled it)
        const seedIsUrl = looksLikeUrlOrHostname(session.seed);
        if (uniq.length && !seedIsUrl) {
          const resolved = await resolveWebOriginCandidates(uniq, {
            seed: session.seed,
            sessionId,
            correlationId: opts.correlationId,
            budgetMs: Math.min(3500, wallDeadline - Date.now()),
            signal: sessionSignal,
            sourceFinding: 'one_hop_from_finding',
          });
          if (resolved.findings?.length) {
            batches.push({
              providerId: 'web_origin',
              findings: resolved.findings,
              partial: false,
              _webOriginTelemetry: resolved.telemetries,
            });
            session.providers.web_origin = session.providers.web_origin || 'ok';
          } else if (resolved.errors?.length && !session.providers.web_origin) {
            session.providers.web_origin = 'partial';
          }
          if (resolved.telemetries?.length) {
            session.webOriginTelemetry = (session.webOriginTelemetry || []).concat(resolved.telemetries);
          }
        }
      } catch (e) {
        session.providers.web_origin = session.providers.web_origin || 'error';
      }
    }

    // L1 · WD P856 → plan urlTargets → gated web_origin (flag-gated · C1-safe)
    batches = await bridgeWdP856ToWebOrigin(session, batches, {
      sessionId,
      wallDeadline,
      sessionSignal,
      correlationId: opts.correlationId,
      livePlan: session._liveQueryPlan || null,
      providerList,
    });
    if (session._liveQueryPlan) {
      session.queryPlan = scrubQueryPlanForEmit(session._liveQueryPlan);
      delete session._liveQueryPlan;
    }
    delete session._p856UrlCandidates;

    // L2 · GENERAL_WEB (Arch fill.1) · WP OpenSearch→extlinks · flag default OFF · outside TREATMENT
    if (isGeneralWebSearchEnabled() && Date.now() < wallDeadline) {
      try {
        const gw = await searchGeneralWeb(
          {
            q: session.seed,
            budgetMs: Math.min(
              GENERAL_WEB_TIMEOUT_MS,
              Math.max(50, wallDeadline - Date.now()),
            ),
            locale: session.locale,
          },
          { signal: sessionSignal },
        );
        session.generalWebSearch = {
          reason: gw.reason,
          stub: !!gw.stub,
          source: gw.source || null,
          count: (gw.findings || []).length,
          dropped: gw.dropped || 0,
        };
        if (gw.findings?.length) {
          batches.push({
            providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
            findings: gw.findings,
            partial: !!gw.partial,
          });
          session.providers[GENERAL_WEB_SEARCH_PROVIDER_ID] = 'ok';
        } else if (!gw.stub) {
          session.providers[GENERAL_WEB_SEARCH_PROVIDER_ID] = gw.reason || 'empty';
        }
      } catch {
        session.providers[GENERAL_WEB_SEARCH_PROVIDER_ID] = 'error';
      }
    }

    // Capture telemetry from web_origin provider batch if present
    for (const batch of batches) {
      if (batch.providerId === 'web_origin' && Array.isArray(batch._webOriginTelemetry)) {
        session.webOriginTelemetry = (session.webOriginTelemetry || []).concat(batch._webOriginTelemetry);
      }
    }

    session.progress = { ...session.progress, done: 2 + providerList.length };

    session.stage = 'S3';
    const pairs = [];
    for (const batch of batches) {
      for (const raw of batch.findings || []) {
        const pair = normalizeRawHit(raw, batch.providerId);
        if (pair) pairs.push(pair);
      }
    }

    session.stage = 'S5';
    const deduped = dedupeByEvidenceFingerprint(pairs);
    // EXP-A2 Option A: Acc-constrained soft-entity coalesce + multi-provider Evidence attach
    // (S5 fingerprint is URL-scoped — cannot cross-family merge; this step attaches Evidence[])
    // Acc scrub runs via emitSnapshot after rank — never dossier.
    const corroborated = coalesceBySoftEntity(deduped);
    session.corroborationEdges = corroborated.corroborationEdges || [];

    session.stage = 'S6';
    // Evidence graph: provenance-aware; NEVER emits same-entity on wire
    session.graph = buildEvidenceGraph({
      sessionId: session.sessionId,
      seed: session.seed,
      softEr: session.softEr,
      findings: corroborated.findings,
      evidence: corroborated.evidence,
      corroborationEdges: session.corroborationEdges,
      contradictions: [],
      queryPlan: session.queryPlan,
      planId: session.planId,
    });

    session.stage = 'S7';

    session.stage = 'S8';
    const evidenceList = corroborated.evidence;
    const evidenceById = new Map(evidenceList.map((e) => [e.id, e]));
    const ranked = rankFindings(
      corroborated.findings,
      evidenceById,
    );

    session.findings = ranked;
    session.evidence = evidenceList.filter((e) =>
      ranked.some((f) => (f.evidenceIds || []).includes(e.id)),
    );
    session.facets = aggregateFacets(session.findings);
    session.contradictions = detectContradictions(session.findings, evidenceById);
    // Checkpoint C: enrich evidence (provenance/strength/aging/independence/why) — additive; B0-safe
    enrichSessionEvidence(session);
    // Unknown/Gaps — honest partial surface (UNKNOWN≠FALSE; never identity)
    session.gaps = scrubGapsForEmit(buildDiscoveryGaps(session));
    // URL/domain CANDIDATES surface (flag or L1 bridge) — never identity
    if (shouldEmitUrlDomainCandidates()) {
      const udc = buildUrlDomainCandidates({
        seed: session.seed,
        findings: session.findings,
        max: 8,
      });
      session.urlDomainCandidates = scrubUrlDomainCandidatesForEmit(udc);
      if (session.graph && session.urlDomainCandidates.length) {
        session.graph = mergeUrlDomainCandidatesIntoGraph(
          session.graph,
          session.urlDomainCandidates,
          { planId: session.queryPlan?.planId || session.planId },
        );
      }
    }
    // Payload trim by budget caps (vanity control; no refill fanout)
    const maxF = session.queryPlan?.budgets?.maxFindings || session.budgets?.maxFindings || 50;
    const maxE = session.queryPlan?.budgets?.maxEvidence || session.budgets?.maxEvidence || 100;
    if ((session.findings || []).length > maxF) {
      session.findings = session.findings.slice(0, maxF);
      session.gaps = scrubGapsForEmit([
        ...(session.gaps || []),
        { code: 'partial_coverage', severity: 'info', message: 'findings_trimmed_to_budget' },
      ]);
    }
    if ((session.evidence || []).length > maxE) {
      const keep = new Set(session.findings.flatMap((f) => f.evidenceIds || []));
      session.evidence = session.evidence.filter((e) => keep.has(e.id)).slice(0, maxE);
    }


    // Checkpoint E: rebuild graph with contradictions + relationship sanitize (no laundering / Acc endpoints)
    // Always on — honesty clamp; not gated (flag OFF B0 still must not emit same-entity / forbidden QIDs)
    session.graph = sanitizeRelationshipGraph(
      buildEvidenceGraph({
        sessionId: session.sessionId,
        seed: session.seed,
        softEr: session.softEr,
        findings: session.findings,
        evidence: session.evidence,
        corroborationEdges: session.corroborationEdges,
        contradictions: session.contradictions || [],
        queryPlan: session.queryPlan,
        planId: session.planId,
      }),
    );

    session.stage = 'S9';

    const providerStates = Object.values(session.providers);
    const anyError = providerStates.some((s) => s === 'error');
    const anyPartial = providerStates.some((s) => s === 'partial' || s === 'skipped' || s === 'budget_exhausted');
    const allTerminal = providerStates.every((s) => s !== 'pending');
    if (session.budgetExhaustedReason || session.statusHint === 'partial') {
      session.status = 'partial';
    } else if (!allTerminal) session.status = 'running';
    else if (session.findings.length === 0 && anyError) session.status = 'failed_soft';
    else if (anyPartial || anyError) session.status = 'partial';
    else session.status = 'complete';

    session.stage = 'S10';
    session.progress = {
      done: session.progress.totalHint,
      totalHint: session.progress.totalHint,
    };

    const scrubbed = emitSnapshot(session);
    session.findings = scrubbed.findings;
    session.evidence = scrubbed.evidence;
    session.facets = scrubbed.facets;
    session.forbiddenIdentitiesVersion = scrubbed.forbiddenIdentitiesVersion;
    if (scrubbed.forbiddenStripped) session.forbiddenStripped = scrubbed.forbiddenStripped;
    if (scrubbed.graph) session.graph = scrubbed.graph;
    ensureSessionVersion(session, { bump: true });

    await store.set(sessionId, session);
  } catch (e) {
    session.status = 'failed_soft';
    session.stage = 'error';
    session.error = String(e?.message || e);
    await store.set(sessionId, session);
  }
}

/** Test helper — clear default memory store */
export { getStoreInfo, storeHealthCheck as healthCheck };

export function clearSessions() {
  sessionStore.clearMemory();
}

export default {
  createDiscoverySession,
  getDiscoverySession,
  narrowDiscoverySession,
  loadSessionRaw,
  emitSnapshot,
  runPipeline,
  clearSessions,
  getSessionStore,
  getStoreInfo,
  publicStoreInfo,
  healthCheck: storeHealthCheck,
};
