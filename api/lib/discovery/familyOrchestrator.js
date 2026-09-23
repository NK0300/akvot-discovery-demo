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
import { FAMILY_TO_PROVIDER } from './queryPlan.js';
import { candidateSkipReason, CANDIDATE_FAMILY_IDS } from './candidateFamilies.js';
import { normalizeRawHit } from './store.js';
import {
  scrubAdapterRawFinding,
  scrubFamilyJournal,
  typedEvidenceDefaults,
  normalizeAdapterToEvidence,
} from './adapterContract.js';

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
  const providerId = FAMILY_TO_PROVIDER[familyId];
  if (!providerId) {
    return { ok: false, status: 'unsupported', reason: `family_unregistered:${familyId}` };
  }
  if (familyId === 'authority' && !flags.viaf) {
    return { ok: false, status: 'skipped', reason: 'viaf_flag_off' };
  }
  if (familyId === 'web_origin' && !flags.webOrigin) {
    return { ok: false, status: 'skipped', reason: 'web_origin_flag_off' };
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
}) {
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
  try {
    const batch = await provider.search(
      {
        q: query || session.seed,
        sessionId: session.sessionId,
        budgetMs,
        locale: session.locale,
        hints: session.hints,
      },
      { signal },
    );
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
    // U7: empty must NOT invite fanout
    if (result.status === 'empty' && typeof ledger.denyUnplannedFanout === 'function') {
      ledger.denyUnplannedFanout('empty_no_fanout');
    }
    return result;
  } catch (e) {
    const msg = String(e?.message || e);
    const isTimeout =
      e?.name === 'AbortError' ||
      e?.name === 'TimeoutError' ||
      /timeout|aborted/i.test(msg);
    const status = isTimeout ? 'timeout' : 'error';
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
      reasons: [isTimeout ? 'timeout' : `error:${msg.slice(0, 120)}`],
    };
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
  };
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

  // Flatten planned calls — support both orderedIntents and orderedIntents shapes
  const intents = plan.orderedIntents || plan.orderedIntents || [];
  const plannedCalls = [];
  for (const intent of intents) {
    const families = intent.sourceFamilies || intent.sourceFamilies || [];
    for (const familyId of families) {
      const queries = intent.queries || [];
      const q =
        queries.find((x) => x.familyId === familyId)?.q ||
        queries.find((x) => x.familyId === familyId)?.q ||
        session.seed;
      plannedCalls.push({
        familyId,
        providerId: FAMILY_TO_PROVIDER[familyId] || familyId,
        intentId: intent.intentId || intent.intentId,
        query: q,
      });
    }
  }
  plannedCalls.sort(
    (a, b) =>
      String(a.intentId).localeCompare(String(b.intentId)) ||
      String(a.familyId).localeCompare(String(b.familyId)),
  );

  // Dedupe by familyId — first (highest-priority intent) wins; no double-fetch vanity
  const seenFamilies = new Set();
  const dedupedCalls = [];
  for (const call of plannedCalls) {
    if (seenFamilies.has(call.familyId)) continue;
    seenFamilies.add(call.familyId);
    dedupedCalls.push(call);
  }
  plannedCalls.length = 0;
  plannedCalls.push(...dedupedCalls);

  let cursor = 0;
  while (cursor < plannedCalls.length) {
    if (ledger.isExhausted() || Date.now() > wallDeadline || opts.signal?.aborted) {
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
    });
    journal.push(result);
    providerStates[result.providerId] = result.status;
    allFindings.push(...(result.findings || []));
    allEvidence.push(...(result.evidence || []));
    if (typeof opts.onFamilyResult === 'function') opts.onFamilyResult(result);
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
  return {
    journal: scrubbedJournal,
    findings: truncatedFindings,
    evidence: truncatedEvidence,
    providerStates,
    budgetSnapshot: budgetSnap,
    budgetExhausted: anyExhausted || budgetSnap.availability === BUDGET_EXHAUSTED,
    budgetExhaustedReason: budgetSnap.budgetExhaustedReason || null,
    planId: plan.planId,
  };
}

export default {
  indexProvidersById,
  resolveFamilyProvider,
  normalizeFamilyBatch,
  executeFamilyCall,
  runFamilyOrchestration,
};
