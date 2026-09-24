/**
 * Source-family orchestration — Preview path (DISCOVERY_ENABLE_QUERYPLAN=1).
 * Wraps existing providers as families; isolation; cancel; timeouts;
 * normalize → evidence with provenance. Flag OFF → orchestrator uses legacy path.
 * Cite: ARCHIVE-02 · BUDGET-FANOUT · UNKNOWN-NORMATIVE
 */
import {
  createBudgetLedger,
  normalizeFamilyStatus,
  outcomeClassForStatus,
  BUDGET_EXHAUSTED,
} from './budget.js';
import {
  resolveFamilyProvider as primaryProviderIdForFamily,
  FAMILY_TO_PROVIDER,
} from './sourceFamily.js';
import {
  selectLaunches,
  launchesFromQueryPlan,
  gateFamilyExecute,
  policyB0Default,
  getPolicy,
  evaluateBatch,
  expandDecision,
  nextOrStop,
  digestFinding,
  buildPolicyContext,
} from './policy.js';
import { createFrontier } from './frontier.js';
import {
  buildEvidenceGraph,
  scrubGraphForEmit,
} from './evidenceGraph.js';
import { graphFromOrchestrationResult, assertNoSameEntity } from './evidenceGraph.js';
import {
  recordWave,
  recordFrontierKeys,
  recordFindingDigests,
  recordDecision,
  recordEvidenceEdgeCount,
  snapshotMissionMemory,
} from './missionMemory.js';
import { selectFetchablePlanUrlTargets } from './security.js';
import { candidateSkipReason, CANDIDATE_FAMILY_IDS } from './candidateFamilies.js';
import { normalizeRawHit } from './store.js';
import { isBlankSeed, EMPTY_SEED_REASON } from './queryPlan.js';
import {
  scrubAdapterRawFinding,
  scrubFamilyJournal,
  typedEvidenceDefaults,
  normalizeAdapterToEvidence,
  classifyAdapterAbort,
  adapterBudgetSignal,
} from './adapterContract.js';
import { structuredLog } from './obs.js';
import {
  isWdP856UrlBridgeEnabled,
  harvestOfficialWebsiteUrlCandidates,
  mergeOfficialWebsiteUrlTargets,
} from './urlTargetBridge.js';

/**
 * @param {object[]} providers
 * @returns {Map<string, object>}
 */
export function indexProvidersById(providers) {
  const map = new Map();
  for (const p of providers || []) {
    if (p?.id) map.set(String(p.id), p);
  }
  return map;
}

/**
 * @param {string} familyId
 * @param {Map<string, object>} byId
 * @param {{ viaf?: boolean, webOrigin?: boolean }} flags
 */
export function resolveFamilyProvider(familyId, byId, flags = {}) {
  const providerId = primaryProviderIdForFamily(familyId) || FAMILY_TO_PROVIDER[familyId];
  if (!providerId) {
    return { ok: false, status: 'unsupported', reason: `family_unregistered:${familyId}` };
  }
  if (familyId === 'authority' && !flags.viaf) {
    return { ok: false, status: 'skipped', reason: 'viaf_flag_off' };
  }
  if (familyId === 'web_origin' && !flags.webOrigin) {
    return { ok: false, status: 'skipped', reason: 'web_origin_flag_off' };
  }
  if (
    familyId === 'general_web' &&
    !(flags.generalWeb || process.env.DISCOVERY_ENABLE_GENERAL_WEB === '1')
  ) {
    return { ok: false, status: 'skipped', reason: 'general_web_flag_off' };
  }
  if (
    familyId === 'ddg_instant' &&
    !(flags.ddgInstant || process.env.DISCOVERY_ENABLE_DDG_INSTANT === '1')
  ) {
    return { ok: false, status: 'skipped', reason: 'ddg_instant_flag_off' };
  }
  const provider = byId.get(providerId);
  if (!provider || typeof provider.search !== 'function') {
    return { ok: false, status: 'unavailable', reason: `provider_missing:${providerId}` };
  }
  return { ok: true, providerId, provider, status: 'ok' };
}

/**
 * Normalize provider batch → FamilyExecutionResult with provenance.
 */
export function normalizeFamilyBatch({
  batch,
  familyId,
  providerId,
  intentId,
  planId,
  executionTimeMs,
  statusHint,
}) {
  const findings = [];
  const evidence = [];
  const retrievedAt = new Date().toISOString();
  const rawFindings = batch?.findings || [];

  const defaults = typedEvidenceDefaults(providerId);
  for (const raw of rawFindings) {
    // Acc scrub at journal ingress before normalize
    const scrubbed = scrubAdapterRawFinding(
      {
        ...raw,
        provenanceUrl: raw.provenanceUrl || raw.url,
      },
      providerId,
    );
    if (!scrubbed) continue;
    // Prefer adapter contract normalize (UNKNOWN defaults + cite-or-drop)
    const pair = normalizeAdapterToEvidence(scrubbed, providerId);
    if (!pair) continue;

    const ev = {
      ...pair.evidence,
      familyId,
      planId,
      intentId,
      source: providerId,
      origin: pair.evidence?.origin || pair.evidence?.domain || providerId,
      timestamp: pair.evidence?.retrievedAt || retrievedAt,
      strength:
        familyId === 'web_origin'
          ? 'metadata_only'
          : pair.evidence?.quote
            ? 'moderate'
            : 'weak',
      status: 'candidate', // candidate ≠ confirmed · CANDIDATE≠FACT
      confirmationState: defaults.confirmationState,
      epistemicState: defaults.epistemicState,
      identityClaim: false,
      urlIsNotIdentity: true,
      candidateIsNotFact: true,
      provenance: {
        planId,
        intentId,
        familyId,
        providerId,
        extractionMethod: familyId === 'web_origin' ? 'origin_metadata' : 'api_search',
        signalSummary: String(scrubbed.summary || scrubbed.quote || scrubbed.title || '').slice(0, 160),
        createdAt: retrievedAt,
        retrievalContext: { planId, intentId, familyId },
      },
    };

    const finding = {
      ...pair.finding,
      familyId,
      planId,
      intentId,
      hostFamily: pair.finding.hostFamily || familyId,
      relationshipState:
        pair.finding.relationship ||
        pair.finding.relationshipState ||
        defaults.relationshipState,
      confirmationState: defaults.confirmationState,
      epistemicState: defaults.epistemicState,
      identityClaim: false,
      identityScore: null,
      createdAt: retrievedAt,
    };
    // C1 Bound: URL-alone / web_origin never SAME-*
    if (familyId === 'web_origin' || finding.hostFamily === 'web_origin') {
      const rel = String(finding.relationshipState || '').toUpperCase().replace(/_/g, '-');
      if (rel === 'SAME-ENTITY' || rel === 'SAME-REFERENCE' || rel === 'SAME-SOURCE') {
        finding.relationshipState = 'UNKNOWN';
        finding.relationship = 'UNKNOWN';
      }
    }
    findings.push(finding);
    evidence.push(ev);
  }

  let status = statusHint;
  if (!status) {
    if ((batch?.errors || []).length && !findings.length) status = 'error';
    else if (!findings.length) status = 'empty';
    else status = 'ok';
  }
  status = normalizeFamilyStatus(status);

  return {
    familyId,
    providerId,
    intentId,
    planId,
    status,
    outcomeClass: outcomeClassForStatus(status),
    findings,
    evidence,
    executionTimeMs: executionTimeMs ?? 0,
    requestsUsed: 1,
    reasons: findings.length
      ? [`family_${status}`]
      : status === 'empty'
        ? ['empty_no_fanout']
        : [`family_${status}`],
  };
}

/**
 * Execute one family call under budget + timeout isolation.
 */
export async function executeFamilyCall({
  familyId,
  provider,
  providerId,
  intentId,
  planId,
  query,
  session,
  budgetMs,
  signal,
  ledger,
  plan,
}) {
  // Slice A · fail-closed: never call provider.search with a blank query (no budget spend).
  if (isBlankSeed(query || session?.seed)) {
    return {
      familyId,
      providerId,
      intentId,
      planId,
      status: 'skipped',
      outcomeClass: outcomeClassForStatus('skipped'),
      findings: [],
      evidence: [],
      executionTimeMs: 0,
      requestsUsed: 0,
      reasons: [EMPTY_SEED_REASON],
      skipReason: EMPTY_SEED_REASON,
    };
  }
  if (!ledger._seenProviders) ledger._seenProviders = new Set();
  const isNew = !ledger._seenProviders.has(providerId);
  const gate = ledger.reserve({
    providerId,
    requests: 1,
    isNewProvider: isNew,
  });
  if (gate.ok) ledger._seenProviders.add(providerId);

  if (!gate.ok) {
    return {
      familyId,
      providerId,
      intentId,
      planId,
      status: 'budget_exhausted',
      outcomeClass: 'BUDGET_EXHAUSTED',
      findings: [],
      evidence: [],
      executionTimeMs: 0,
      requestsUsed: 0,
      reasons: [`budget_exhausted:${gate.reason || gate.code}`],
      budgetExhaustedReason: gate.reason || gate.code,
    };
  }

  const t0 = Date.now();
  // Compose call-level AbortSignal: parent cancel ≠ provider budget timeout
  const callBudget = adapterBudgetSignal(budgetMs, signal);
  try {
    // Checkpoint F: for web_origin, inject fail-closed plan urlTargets into provider hints
    let hints = session.hints && typeof session.hints === 'object' ? { ...session.hints } : {};
    if (familyId === 'web_origin' && plan && typeof plan === 'object') {
      const urlGate = selectFetchablePlanUrlTargets(plan);
      hints = {
        ...hints,
        queryPlan: plan,
        planUrlTargets: Array.isArray(plan.urlTargets) ? plan.urlTargets : hints.planUrlTargets,
        urlTargets: Array.isArray(plan.urlTargets) ? plan.urlTargets : hints.urlTargets,
      };
      if (urlGate.poison || urlGate.failClosed) {
        // Fail-closed: zero plan urls; provider may still resolve a safe seed alone
        hints.webOriginUrls = [];
        hints.oneHopUrls = [];
        hints.urls = [];
      } else {
        hints.webOriginUrls = [...(urlGate.urls || [])];
      }
    }
    const batch = await provider.search(
      {
        q: query || session.seed,
        sessionId: session.sessionId,
        budgetMs: callBudget.budgetMs,
        locale: session.locale,
        hints,
      },
      { signal: callBudget.signal },
    );
    // L1: WD P856 officialWebsiteUrls → plan.urlTargets (SSRF-classified; not soft-refs)
    if (
      plan &&
      providerId === 'wikidata' &&
      isWdP856UrlBridgeEnabled() &&
      Array.isArray(batch?.findings)
    ) {
      const candidates = harvestOfficialWebsiteUrlCandidates(batch.findings);
      if (candidates.length) {
        mergeOfficialWebsiteUrlTargets(plan, candidates);
        if (session && typeof session === 'object') {
          session._p856UrlCandidates = [
            ...(Array.isArray(session._p856UrlCandidates) ? session._p856UrlCandidates : []),
            ...candidates,
          ];
        }
      }
    }
    const result = normalizeFamilyBatch({
      batch,
      familyId,
      providerId,
      intentId,
      planId,
      executionTimeMs: Date.now() - t0,
    });
    ledger.recordUsage({
      findings: result.findings.length,
      evidence: result.evidence.length,
    });
    // U7: empty must NOT invite fanout · EMPTY≠FALSE
    if (result.status === 'empty' && typeof ledger.denyUnplannedFanout === 'function') {
      ledger.denyUnplannedFanout('empty_no_fanout');
    }
    return result;
  } catch (e) {
    const msg = String(e?.message || e);
    const kind = classifyAdapterAbort(e, signal);
    const status = kind === 'cancelled' ? 'cancelled' : kind === 'timeout' ? 'timeout' : 'error';
    return {
      familyId,
      providerId,
      intentId,
      planId,
      status,
      outcomeClass: outcomeClassForStatus(status),
      findings: [],
      evidence: [],
      executionTimeMs: Date.now() - t0,
      requestsUsed: 1,
      reasons: [
        status === 'error' ? `error:${msg.slice(0, 120)}` : status,
      ],
    };
  } finally {
    callBudget.dispose();
  }
}

/**
 * Run plan intents → families under budget. No unplanned fanout.
 */
export async function runFamilyOrchestration(plan, session, opts = {}) {
  const providers = opts.providers || [];
  const byId = indexProvidersById(providers);
  const flags = {
    viaf: opts.flags?.viaf === true || process.env.DISCOVERY_ENABLE_VIAF === '1',
    webOrigin:
      opts.flags?.webOrigin === true || process.env.DISCOVERY_ENABLE_WEB_ORIGIN === '1',
    generalWeb:
      opts.flags?.generalWeb === true || process.env.DISCOVERY_ENABLE_GENERAL_WEB === '1',
    ddgInstant:
      opts.flags?.ddgInstant === true || process.env.DISCOVERY_ENABLE_DDG_INSTANT === '1',
  };
  const policy =
    opts.policy ||
    (opts.policyId ? getPolicy(opts.policyId) : null) ||
    policyB0Default;
  const ledger =
    opts.ledger ||
    createBudgetLedger(plan.budgets || plan.budgets || {}, {
      startedAt: session.budgets?.startedAt,
    });
  const wallDeadline =
    typeof opts.wallDeadline === 'number'
      ? opts.wallDeadline
      : Date.now() + (plan.budgets?.maxWallMs || plan.budgets?.maxWallMs || 12_000);

  const journal = [];
  const allFindings = [];
  const allEvidence = [];
  const providerStates = {};

  // SELECT — Policy over QueryPlan (registry eligibility). No Core. Flags default OFF.
  const wave = Number(opts.wave) > 0 ? Number(opts.wave) : 1;
  const missionMemoryEarly = opts.missionMemory || null;
  const selectCtx = {
    plan,
    flags,
    wave,
    missionMemory: missionMemoryEarly || undefined,
  };
  const selectOut =
    typeof policy.select === 'function'
      ? policy.select(selectCtx)
      : selectLaunches(selectCtx);
  const selectedLaunches = Array.isArray(selectOut?.launches) ? selectOut.launches : [];
  const selectSkipped = Array.isArray(selectOut?.skipped) ? selectOut.skipped : [];
  const memoryRepeatSkips = Number(selectOut?.memoryRepeatSkips) || 0;
  // Select-layer ∩ orderedIntents cuts (already in selectSkipped) — obs only.
  const selectPlanAllowSkips = Number(selectOut?.planAllowSkips) || 0;

  const planLaunchRows = launchesFromQueryPlan(plan);
  const planFamilyAllow = new Set(
    planLaunchRows.map((r) => String(r.familyId || '')).filter(Boolean),
  );
  const queryByFamily = new Map(
    planLaunchRows.filter((r) => r.query != null).map((r) => [r.familyId, r.query]),
  );

  // Fail-closed: Execute ⊆ plan families only (Registry+Policy gate still applies).
  // Empty plan ⇒ zero work (no invent). Off-plan select familyId ⇒ skipped.
  const selectedInPlan = [];
  let planAllowSkips = 0;
  for (const row of selectedLaunches) {
    const familyId = String(row?.familyId || '');
    if (!familyId || !planFamilyAllow.has(familyId)) {
      planAllowSkips += 1;
      const skipReason = !planFamilyAllow.size
        ? 'empty_plan'
        : !familyId
          ? 'missing_familyId'
          : 'not_in_plan';
      const providerId =
        primaryProviderIdForFamily(familyId) ||
        FAMILY_TO_PROVIDER[familyId] ||
        familyId ||
        '_unknown';
      const result = {
        familyId: familyId || '_unknown',
        providerId,
        intentId: row?.intentId,
        planId: plan.planId,
        status: 'skipped',
        outcomeClass: outcomeClassForStatus('skipped'),
        findings: [],
        evidence: [],
        executionTimeMs: 0,
        requestsUsed: 0,
        reasons: [skipReason],
        skipReason,
        policyId: policy.id,
        wave,
      };
      journal.push(result);
      providerStates[providerId || familyId || '_unknown'] = 'skipped';
      if (typeof opts.onFamilyResult === 'function') opts.onFamilyResult(result);
      continue;
    }
    selectedInPlan.push(row);
  }

  const plannedCalls = selectedInPlan.map((row) => ({
    familyId: row.familyId,
    providerId:
      primaryProviderIdForFamily(row.familyId) ||
      FAMILY_TO_PROVIDER[row.familyId] ||
      row.familyId,
    intentId: row.intentId,
    query: row.query != null ? row.query : queryByFamily.get(row.familyId) || session.seed,
    selectReason: row.reason,
  }));

  for (const sk of selectSkipped) {
    const familyId = sk.familyId || '_unknown';
    const providerId =
      primaryProviderIdForFamily(familyId) || FAMILY_TO_PROVIDER[familyId] || familyId;
    const status =
      sk.skipReason && String(sk.skipReason).includes('unknown') ? 'unsupported' : 'skipped';
    const result = {
      familyId,
      providerId,
      intentId: sk.intentId,
      planId: plan.planId,
      status,
      outcomeClass: outcomeClassForStatus(status),
      findings: [],
      evidence: [],
      executionTimeMs: 0,
      requestsUsed: 0,
      reasons: [sk.skipReason || 'policy_select_skip'],
      skipReason: sk.skipReason || 'policy_select_skip',
      policyId: policy.id,
      wave,
    };
    journal.push(result);
    providerStates[providerId || familyId] = status;
    if (typeof opts.onFamilyResult === 'function') opts.onFamilyResult(result);
  }

  let cursor = 0;
  while (cursor < plannedCalls.length) {
    if (ledger.isExhausted() || Date.now() > wallDeadline || opts.signal?.aborted) {
      // Hard-stop: NO MORE FANOUT. Latch wall exhaust if wall hit and not yet exhausted.
      if (!opts.signal?.aborted && Date.now() > wallDeadline && !ledger.isExhausted()) {
        if (typeof ledger.markExhausted === 'function') ledger.markExhausted('maxWallMs');
      }
      // isExhausted() now latches dimension (maxFamilyCalls/maxRequests/maxWallMs)
      const stopReason = opts.signal?.aborted
        ? 'cancelled'
        : ledger.exhaustedReason || (Date.now() > wallDeadline ? 'maxWallMs' : 'budget_exhausted');
      if (stopReason !== 'cancelled') {
        try {
          structuredLog('info', 'family.fanout_hard_stop', {
            correlationId: opts.correlationId,
            planId: plan.planId,
            budgetExhaustedReason: stopReason,
            budgetRemaining: typeof ledger.remaining === 'function' ? ledger.remaining() : undefined,
          });
        } catch {
          /* obs must never break orchestration */
        }
      }
      while (cursor < plannedCalls.length) {
        const call = plannedCalls[cursor++];
        const status = opts.signal?.aborted
          ? 'cancelled'
          : ledger.isExhausted()
            ? 'budget_exhausted'
            : 'timeout';
        const result = {
          familyId: call.familyId,
          providerId: call.providerId,
          intentId: call.intentId,
          planId: plan.planId,
          status,
          outcomeClass: outcomeClassForStatus(status),
          findings: [],
          evidence: [],
          executionTimeMs: 0,
          requestsUsed: 0,
          reasons: [
            status === 'budget_exhausted'
              ? `budget_exhausted:${ledger.exhaustedReason}`
              : status,
          ],
          ...(status === 'budget_exhausted'
            ? { budgetExhaustedReason: ledger.exhaustedReason }
            : {}),
        };
        journal.push(result);
        providerStates[call.providerId] = status;
        if (typeof opts.onFamilyResult === 'function') opts.onFamilyResult(result);
      }
      break;
    }

    const call = plannedCalls[cursor++];
    // F11 candidates — honest unsupported, never launch
    const candSkip = candidateSkipReason(call.familyId);
    if (candSkip || CANDIDATE_FAMILY_IDS.includes(call.familyId)) {
      const result = {
        familyId: call.familyId,
        providerId: call.providerId,
        intentId: call.intentId,
        planId: plan.planId,
        status: 'unsupported',
        outcomeClass: outcomeClassForStatus('unsupported'),
        findings: [],
        evidence: [],
        executionTimeMs: 0,
        requestsUsed: 0,
        reasons: [candSkip || 'candidate_unwired_f11'],
        skipReason: candSkip || 'candidate_unwired_f11',
      };
      journal.push(result);
      providerStates[call.providerId || call.familyId] = 'unsupported';
      if (typeof opts.onFamilyResult === 'function') opts.onFamilyResult(result);
      continue;
    }
    // EXECUTE gate — Policy (registry+flags) then orch resolve for provider handle
    const gated = gateFamilyExecute(call.familyId, flags, byId, {
      providerIdForFamily: (fid) =>
        primaryProviderIdForFamily(fid) || FAMILY_TO_PROVIDER[fid] || null,
    });
    if (!gated.ok) {
      const result = {
        familyId: call.familyId,
        providerId: call.providerId,
        intentId: call.intentId,
        planId: plan.planId,
        status: gated.status,
        outcomeClass: outcomeClassForStatus(gated.status),
        findings: [],
        evidence: [],
        executionTimeMs: 0,
        requestsUsed: 0,
        reasons: [gated.reason],
        skipReason: gated.reason,
        policyId: policy.id,
      };
      journal.push(result);
      providerStates[call.providerId] = gated.status;
      if (typeof opts.onFamilyResult === 'function') opts.onFamilyResult(result);
      continue;
    }
    const resolved = resolveFamilyProvider(call.familyId, byId, flags);
    if (!resolved.ok) {
      const result = {
        familyId: call.familyId,
        providerId: call.providerId,
        intentId: call.intentId,
        planId: plan.planId,
        status: resolved.status,
        outcomeClass: outcomeClassForStatus(resolved.status),
        findings: [],
        evidence: [],
        executionTimeMs: 0,
        requestsUsed: 0,
        reasons: [resolved.reason],
        skipReason: resolved.reason,
      };
      journal.push(result);
      providerStates[call.providerId] = resolved.status;
      if (typeof opts.onFamilyResult === 'function') opts.onFamilyResult(result);
      continue;
    }

    const budgetMs = Math.min(
      plan.budgets?.maxProviderMs || plan.budgets?.maxProviderMs || 3500,
      Math.max(50, wallDeadline - Date.now()),
    );
    const result = await executeFamilyCall({
      familyId: call.familyId,
      provider: resolved.provider,
      providerId: resolved.providerId,
      intentId: call.intentId,
      planId: plan.planId,
      query: call.query,
      session,
      budgetMs,
      signal: opts.signal,
      ledger,
      plan,
    });
    result.policyId = policy.id;
    result.wave = wave;
    journal.push(result);
    providerStates[result.providerId] = result.status;
    allFindings.push(...(result.findings || []));
    allEvidence.push(...(result.evidence || []));
    if (typeof opts.onFamilyResult === 'function') opts.onFamilyResult(result);
    // BUDGET_EXHAUSTED from reserve ⇒ stop remaining fanout immediately (no silent expansion)
    if (result.status === 'budget_exhausted') {
      if (typeof ledger.markExhausted === 'function' && !ledger.isExhausted()) {
        ledger.markExhausted(result.budgetExhaustedReason || 'reserve_denied');
      }
      continue; // loop head will drain remaining as budget_exhausted
    }
  }

  const maxFindings = plan.budgets?.maxFindings || plan.budgets?.maxFindings || 50;
  const maxEvidence = plan.budgets?.maxEvidence || plan.budgets?.maxEvidence || 100;
  const truncatedFindings = allFindings.slice(0, maxFindings);
  const keptEvIds = new Set(truncatedFindings.flatMap((f) => f.evidenceIds || []));
  const truncatedEvidence = allEvidence
    .filter((e) => keptEvIds.has(e.id))
    .slice(0, maxEvidence);

  truncatedFindings.sort(
    (a, b) =>
      String(a.familyId || '').localeCompare(String(b.familyId || '')) ||
      String(a.id || '').localeCompare(String(b.id || '')),
  );
  truncatedEvidence.sort(
    (a, b) =>
      String(a.familyId || '').localeCompare(String(b.familyId || '')) ||
      String(a.id || '').localeCompare(String(b.id || '')),
  );

  const budgetSnap = ledger.snapshot();
  const anyExhausted = journal.some((j) => j.status === 'budget_exhausted');

  // Acc scrub on every journal / emit path
  const scrubbedJournal = scrubFamilyJournal(journal);

  // EVALUATE → RECORD → EXPAND → NEXT|STOP (Policy spine · no auto wave-2 loop)
  const frontier =
    opts.frontier && typeof opts.frontier.add === 'function'
      ? opts.frontier
      : createFrontier();
  const budgetExhausted =
    anyExhausted || budgetSnap.availability === BUDGET_EXHAUSTED || ledger.isExhausted();
  const evalFindings = truncatedFindings.map((f) => ({
    id: f.id,
    url: f.url || f.canonicalUrl,
    canonicalUrl: f.canonicalUrl,
    entityRefs: f.entityRefs || f.softRefs,
    softRefs: f.softRefs,
    familyId: f.familyId,
    intentId: f.intentId,
    hostFamily: f.hostFamily,
    providerId: f.providerId || (f.providers || [])[0],
    providers: f.providers,
    relationship: f.relationship,
    seedClass: f.seedClass,
    coalesceKeys: f.coalesceKeys,
    evidenceIds: f.evidenceIds,
    wave,
    evaluateOk: f.evaluateOk,
  }));
  const evalBatch = {
    findings: evalFindings,
    evaluateOk: opts.evaluateOk,
    urlAlone: opts.urlAlone === true,
    dropReason: opts.dropReason,
  };
  const policyCtxBase = buildPolicyContext({
    plan,
    flags,
    budget: { exhausted: budgetExhausted },
    frontier,
    wave,
    maxWaves: opts.maxWaves,
    missionMemory: opts.missionMemory || undefined,
    mission: {
      lastProgress:
        opts.mission?.lastProgress != null
          ? opts.mission.lastProgress
          : truncatedFindings.length > 0,
    },
  });
  const evaluateOut =
    typeof policy.evaluate === 'function'
      ? policy.evaluate(policyCtxBase, evalBatch)
      : evaluateBatch(policyCtxBase, evalBatch);

  let frontierAdded = 0;
  for (const item of evaluateOut?.frontierAdds || []) {
    if (
      frontier.add({
        ...item,
        wave: item.wave != null ? item.wave : wave,
        evaluateOk: true,
      })
    ) {
      frontierAdded += 1;
    }
  }

  // RECORD · Evidence Graph (existing APIs · cite-or-drop / C1 / UNKNOWN≠FALSE / INFORMATION≠IDENTITY)
  // No parallel store — buildEvidenceGraph + scrubGraphForEmit only. Soft≠Acc · no Core/SSE.
  const rawGraph = buildEvidenceGraph(
    {
      sessionId: session?.sessionId,
      seed: session?.seed,
      softEr: session?.softEr,
      findings: truncatedFindings,
      evidence: truncatedEvidence,
      corroborationEdges: opts.corroborationEdges || session?.corroborationEdges || [],
      contradictions: opts.contradictions || session?.contradictions || [],
      queryPlan: plan,
      planId: plan?.planId,
      familyJournal: scrubbedJournal,
    },
    { strictProvenance: false },
  );
  const graph = scrubGraphForEmit(rawGraph) || {
    nodes: [],
    edges: [],
    meta: { sameEntityEmitted: 0, edgeCount: 0, nodeCount: 0 },
  };
  // Defense: never leave same-entity on Record surface
  if (graph.meta) graph.meta.sameEntityEmitted = 0;

  const missionMemory = opts.missionMemory || null;
  if (missionMemory) {
    const familyIds = [
      ...new Set(
        scrubbedJournal.map((j) => j.familyId).filter((id) => id && id !== '_unknown'),
      ),
    ];
    recordWave(missionMemory, { wave, familyIds });
    const snapKeys =
      typeof frontier.snapshot === 'function' ? frontier.snapshot().keys || [] : [];
    recordFrontierKeys(missionMemory, snapKeys);
    recordFindingDigests(
      missionMemory,
      truncatedFindings.map((f) => digestFinding(f)),
    );
  }

  const policyCtxAfter = buildPolicyContext({
    plan,
    flags,
    budget: { exhausted: budgetExhausted },
    frontier,
    wave,
    maxWaves: opts.maxWaves,
    missionMemory: opts.missionMemory || undefined,
    mission: {
      lastProgress:
        opts.mission?.lastProgress != null
          ? opts.mission.lastProgress
          : truncatedFindings.length > 0 || frontierAdded > 0,
    },
  });
  const expandOut =
    typeof policy.expand === 'function'
      ? policy.expand(policyCtxAfter)
      : expandDecision(policyCtxAfter);
  const decision =
    typeof policy.nextOrStop === 'function'
      ? policy.nextOrStop(policyCtxAfter)
      : nextOrStop(policyCtxAfter);

  if (missionMemory) {
    recordDecision(missionMemory, decision);
  }

  const frontierSnap =
    typeof frontier.snapshot === 'function'
      ? frontier.snapshot()
      : { size: frontierAdded, items: [], keys: [] };

  // Evidence Graph from Record (Arch §08 · family-agnostic · no same-entity)
  const evidenceGraph = graphFromOrchestrationResult(
    {
      findings: truncatedFindings,
      evidence: truncatedEvidence,
      planId: plan.planId,
      policyId: policy.id,
      wave,
      frontier: frontierSnap,
    },
    { sessionId: session?.sessionId, strictProvenance: opts.strictProvenance === true },
  );
  const graphGate = assertNoSameEntity(evidenceGraph);
  if (!graphGate.ok) {
    evidenceGraph.edges = (evidenceGraph.edges || []).filter((e) => {
      const r = String(e.relationship || '').toLowerCase().replace(/_/g, '-');
      return r !== 'same-entity';
    });
    evidenceGraph.meta = { ...(evidenceGraph.meta || {}), sameEntityEmitted: 0, stripped: true };
  }

  const edgeCount =
    Number(evidenceGraph?.meta?.edgeCount) ||
    (Array.isArray(evidenceGraph?.edges) ? evidenceGraph.edges.length : 0);
  if (missionMemory) {
    recordEvidenceEdgeCount(missionMemory, edgeCount);
  }

  // Light Policy orch observability — Acc/QA counts only (no SSE/Core/PII)
  const missionSnap = missionMemory ? snapshotMissionMemory(missionMemory) : null;
  const policyObs = {
    policyId: policy.id,
    wave,
    selectLaunchCount: selectedInPlan.length,
    selectSkipCount: selectSkipped.length + planAllowSkips,
    planAllowSkips: planAllowSkips + selectPlanAllowSkips,
    memoryRepeatSkips,
    evaluateOk: evaluateOut?.ok !== false,
    frontierAdded,
    c1Ceilinged: evaluateOut?.c1Ceilinged || 0,
    citeDropped: evaluateOut?.citeDropped || 0,
    expand: !!expandOut?.expand,
    decisionAction: decision?.action === 'next' ? 'next' : 'stop',
    decisionReason: decision?.reason || 'unknown',
    evidenceEdgeCount: edgeCount,
    missionWave: missionSnap?.wave ?? null,
    missionFrontierKeyCount: missionSnap?.frontierKeyCount ?? null,
    missionFindingDigestCount: missionSnap?.findingDigestCount ?? null,
    missionEvidenceEdgeCount: missionSnap?.evidenceEdgeCount ?? null,
  };
  try {
    structuredLog('info', 'policy.orch.obs', {
      correlationId: opts.correlationId,
      planId: plan.planId,
      ...policyObs,
    });
  } catch {
    /* obs must never break orchestration */
  }

  return {
    journal: scrubbedJournal,
    findings: truncatedFindings,
    evidence: truncatedEvidence,
    providerStates,
    budgetSnapshot: budgetSnap,
    budgetExhausted,
    budgetExhaustedReason: budgetSnap.budgetExhaustedReason || null,
    planId: plan.planId,
    policyId: policy.id,
    wave,
    evaluate: {
      ok: evaluateOut?.ok !== false,
      frontierAdds: Array.isArray(evaluateOut?.frontierAdds)
        ? evaluateOut.frontierAdds.length
        : 0,
      frontierAdded,
      dropReason: evaluateOut?.dropReason,
      c1Ceilinged: evaluateOut?.c1Ceilinged || 0,
      citeDropped: evaluateOut?.citeDropped || 0,
    },
    graph,
    expand: {
      expand: !!expandOut?.expand,
      itemCount: Array.isArray(expandOut?.items) ? expandOut.items.length : 0,
      reason: expandOut?.reason || 'unknown',
    },
    decision: {
      action: decision?.action === 'next' ? 'next' : 'stop',
      reason: decision?.reason || 'unknown',
    },
    frontier: frontierSnap,
    evidenceGraph,
    missionMemory: missionMemory ? snapshotMissionMemory(missionMemory) : undefined,
    policyObs,
  };
}

export default {
  indexProvidersById,
  resolveFamilyProvider,
  normalizeFamilyBatch,
  executeFamilyCall,
  runFamilyOrchestration,
};
