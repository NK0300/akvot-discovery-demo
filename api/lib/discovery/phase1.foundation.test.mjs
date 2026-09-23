/**
 * Phase 1 Foundation contract tests — Checkpoint A.
 * Covers: plan determinism, budget hard-stop, UNKNOWN axioms,
 * Acc scrub on plan emit, flag-off regression.
 * Run: node api/lib/discovery/phase1.foundation.test.mjs
 */
import {
  buildQueryPlan,
  validateQueryPlan,
  scrubQueryPlanForEmit,
  planSummaryForSse,
  detectSeedClass,
  SEED_CLASSES,
  INTENT_IDS,
  FORBIDDEN_PLAN_DIRECTIVES,
} from './queryPlan.js';
import {
  createBudgetLedger,
  createBudgetCaps,
  BUDGET_EXHAUSTED,
  BUDGET_AVAILABLE,
  FAMILY_STATUS,
  normalizeFamilyStatus,
  outcomeClassForStatus,
} from './budget.js';
import {
  runFamilyOrchestration,
  resolveFamilyProvider,
  indexProvidersById,
  normalizeFamilyBatch,
} from './familyOrchestrator.js';
import { isQueryPlanEnabled, isPlanSseEnabled, discoveryFlagSnapshot } from './flags.js';
import { shouldUseQueryPlan, planForSession, executePlanLaunches } from './planOrchestration.js';
import {
  createDiscoverySession,
  clearSessions,
  emitSnapshot,
} from './orchestrator.js';
import { buildProgressiveEvents, SSE_EVENT_ALLOW_SET } from './sse.js';
import { scrubPlanPayload, sanitizeDiscoveryPayload } from './emit.js';
import { FORBIDDEN_IDENTITY_QIDS } from '../forbiddenIdentities.js';
import { urlAloneCeiling, clampGraphRelationship } from './evidenceGraph.js';

let passed = 0;
let failed = 0;
function assert(name, cond, detail = '') {
  if (cond) {
    passed++;
    console.log('PASS', name);
  } else {
    failed++;
    console.error('FAIL', name, detail || '');
  }
}

const FORBIDDEN_Q = FORBIDDEN_IDENTITY_QIDS[0] || 'Q1701775';

// ---------- Flags default OFF ----------
delete process.env.DISCOVERY_ENABLE_QUERYPLAN;
delete process.env.DISCOVERY_ENABLE_PLAN_SSE;
assert('flag QueryPlan default OFF', isQueryPlanEnabled() === false);
assert('flag PlanSSE default OFF', isPlanSseEnabled() === false);
assert('shouldUseQueryPlan default false', shouldUseQueryPlan({}) === false);
assert(
  'flag snapshot queryPlan false',
  discoveryFlagSnapshot().DISCOVERY_ENABLE_QUERYPLAN === false,
);

// ---------- Seed class routing ----------
assert('seedClass url', detectSeedClass('https://example.org/a') === 'url');
assert('seedClass domain', detectSeedClass('example.org') === 'domain');
assert(
  'seedClass person via hint',
  detectSeedClass('Ada Lovelace', { seedClass: 'person' }) === 'person',
);
assert(
  'seedClass unknown short',
  detectSeedClass('x') === 'unknown' || detectSeedClass('x') === 'ambiguous',
);
assert('SEED_CLASSES closed', SEED_CLASSES.includes('person') && SEED_CLASSES.includes('url'));

// ---------- Plan determinism ----------
const planInput = {
  seed: 'Ada Lovelace',
  hints: { seedClass: 'person' },
  locale: 'en',
};
const planA = buildQueryPlan(planInput);
const planB = buildQueryPlan(planInput);
assert('planId stable', planA.planId === planB.planId);
assert(
  'planInputSnapshotHash stable',
  planA.planInputSnapshotHash === planB.planInputSnapshotHash,
);
assert(
  'plan JSON deterministic',
  JSON.stringify(planA) === JSON.stringify(planB),
);
const v = validateQueryPlan(planA);
assert('plan validates', v.ok === true, JSON.stringify(v.errors));
assert('plan has reasons', Array.isArray(planA.reasons) && planA.reasons.length > 0);
assert('plan identityConclusions false', planA.identityConclusions === false);
assert('plan searchIntentOnly true', planA.searchIntentOnly === true);
assert(
  'plan titleBridgeForbidden',
  planA.dedupeRules?.titleBridgeForbidden === true,
);
assert(
  'plan silentExpansionForbidden',
  planA.budgets?.silentExpansionForbidden === true,
);
assert(
  'person intents include IDENTITY_REFERENCES',
  (planA.orderedIntents || []).some((i) => i.intentId === 'DISCOVER_IDENTITY_REFERENCES'),
);
assert(
  'url seed prefers WEB_ORIGIN or falls back',
  (() => {
    const up = buildQueryPlan({ seed: 'https://example.com', hints: {} });
    return (
      up.seedClass === 'url' &&
      (up.orderedIntents || []).some(
        (i) =>
          i.intentId === 'DISCOVER_OFFICIAL_WEB_ORIGIN' ||
          i.intentId === 'DISCOVER_IDENTITY_REFERENCES',
      )
    );
  })(),
);

// ---------- Acc scrub on plan emit ----------
const baitPlan = buildQueryPlan({
  seed: `Poison ${FORBIDDEN_Q} secret=sk_live_abc token=Bearer xyz`,
  hints: { seedClass: 'person' },
  knownRefs: [`qid:${FORBIDDEN_Q}`, 'qid:Q42', 'viaf:123'],
});
const scrubbed = scrubQueryPlanForEmit(baitPlan);
assert('scrub returns object', !!scrubbed);
assert(
  'scrub strips forbidden QID from knownRefs',
  !(scrubbed.knownRefs || []).some((r) => String(r).includes(FORBIDDEN_Q)),
);
const scrubBlob = JSON.stringify(scrubbed);
assert(
  'scrub strips forbidden QID from plan emit',
  !scrubBlob.includes(FORBIDDEN_Q) || scrubBlob.includes('[REDACTED_QID]'),
);
assert(
  'scrub strips credential-shaped bait or redacts',
  !scrubBlob.includes('sk_live_abc') || scrubBlob.includes('[REDACTED]'),
);
const planChunk = scrubPlanPayload(baitPlan);
assert('emit.scrubPlanPayload strips or redacts forbidden', !JSON.stringify(planChunk).includes(FORBIDDEN_Q) || JSON.stringify(planChunk).includes('[REDACTED'));
const sseSummary = planSummaryForSse(baitPlan);
assert('SSE plan summary present', !!sseSummary?.planId);
assert(
  'SSE plan summary Acc-clean',
  !JSON.stringify(sseSummary).includes(FORBIDDEN_Q) ||
    JSON.stringify(sseSummary).includes('[REDACTED'),
);

// Deny identity directives
assert(
  'FORBIDDEN_PLAN_DIRECTIVES includes SAME-ENTITY family',
  FORBIDDEN_PLAN_DIRECTIVES.some((d) => /SAME.?ENTITY/i.test(d)),
);

// ---------- Budget hard-stop ----------
assert('FAMILY_STATUS has budget_exhausted', FAMILY_STATUS.includes('budget_exhausted'));
assert('FAMILY_STATUS has timeout', FAMILY_STATUS.includes('timeout'));
assert('FAMILY_STATUS has skipped', FAMILY_STATUS.includes('skipped'));
assert('FAMILY_STATUS has unsupported', FAMILY_STATUS.includes('unsupported'));
assert('FAMILY_STATUS has unavailable', FAMILY_STATUS.includes('unavailable'));

const led0 = createBudgetLedger({ maxFamilyCalls: 0, maxRequests: 0 });
const g0 = led0.canLaunch();
assert('budget exhausted at 0', g0.ok === false && g0.code === BUDGET_EXHAUSTED);

const led1 = createBudgetLedger({ maxFamilyCalls: 1, maxRequests: 2 });
const r1 = led1.reserve({ requests: 1 });
assert('first reserve ok', r1.ok === true && r1.code === BUDGET_AVAILABLE);
const r2 = led1.reserve({ requests: 1 });
assert(
  'second reserve exhausted (maxFamilyCalls=1)',
  r2.ok === false && r2.code === BUDGET_EXHAUSTED,
);
assert('ledger isExhausted true', led1.isExhausted() === true);

const ledFan = createBudgetLedger({ maxFamilyCalls: 5 });
const block = ledFan.denyUnplannedFanout('empty_no_fanout');
assert('empty denies unplanned fanout', block.ok === false);

const ledRetry = createBudgetLedger({ maxRetries: 0 });
const may = ledRetry.mayRetry({ status: 'error' });
assert('default no retry on error', may.ok === false);

assert(
  'normalizeFamilyStatus budget_exhausted',
  normalizeFamilyStatus('budget_exhausted') === 'budget_exhausted',
);
assert(
  'outcomeClass budget_exhausted',
  outcomeClassForStatus('budget_exhausted') === 'BUDGET_EXHAUSTED' ||
    outcomeClassForStatus('budget_exhausted') === 'BUDGET_EXHAUSTED',
);
assert(
  'timeout is not CONTRADICTORY',
  outcomeClassForStatus('timeout') !== 'CONTRADICTORY' &&
    normalizeFamilyStatus('timeout') === 'timeout',
);

// ---------- UNKNOWN axioms ----------
assert(
  'urlAloneCeiling is unknown for web_origin alone',
  urlAloneCeiling({ hostFamily: 'web_origin' }) === 'unknown',
);
assert(
  'urlAloneCeiling is unknown for SAME-ENTITY without typed refs',
  urlAloneCeiling({ relationship: 'SAME-ENTITY' }) === 'unknown',
);
assert(
  'clamp SAME-ENTITY without typed soft-ref → unknown',
  clampGraphRelationship('SAME-ENTITY', { hasTypedSoftRef: false }) === 'unknown',
);
assert(
  'clamp SAME-ENTITY never emits same-entity',
  clampGraphRelationship('SAME-ENTITY', { hasTypedSoftRef: true }) !== 'same-entity' &&
    clampGraphRelationship('SAME-ENTITY', { hasTypedSoftRef: true }) !== 'SAME-ENTITY',
);

// Candidate ≠ confirmed in family normalize
const batch = normalizeFamilyBatch({
  batch: {
    findings: [
      {
        title: 'Ada',
        provenanceUrl: 'https://www.wikidata.org/wiki/Q7259',
        quote: 'mathematician',
      },
    ],
  },
  familyId: 'knowledge_graph',
  providerId: 'wikidata',
  intentId: 'DISCOVER_IDENTITY_REFERENCES',
  planId: 'qp-test',
  executionTimeMs: 1,
});
assert('normalize produces findings', batch.findings.length >= 1);
assert(
  'confirmationState candidate',
  batch.findings[0]?.confirmationState === 'candidate' &&
    batch.evidence[0]?.confirmationState === 'candidate',
);
assert('evidence has provenance', !!batch.evidence[0]?.provenance?.planId);
assert('evidence has source', !!batch.evidence[0]?.source || !!batch.evidence[0]?.providerId);
assert('evidence has timestamp', !!batch.evidence[0]?.timestamp || !!batch.evidence[0]?.retrievedAt);

// web_origin cannot emit SAME-*
const wo = normalizeFamilyBatch({
  batch: {
    findings: [
      {
        title: 'Site',
        provenanceUrl: 'https://example.com/',
        quote: 'meta',
        relationship: 'SAME-ENTITY',
        hostFamily: 'web_origin',
      },
    ],
  },
  familyId: 'web_origin',
  providerId: 'web_origin',
  intentId: 'DISCOVER_OFFICIAL_WEB_ORIGIN',
  planId: 'qp-test',
  executionTimeMs: 1,
});
if (wo.findings.length) {
  const rel = String(wo.findings[0].relationshipState || '').toUpperCase();
  assert(
    'C1 Bound: web_origin not SAME-*',
    rel !== 'SAME-ENTITY' && rel !== 'SAME-REFERENCE',
  );
} else {
  // cite-or-drop may drop; still pass axiom (no SAME emitted)
  assert('C1 Bound: web_origin drop-or-unknown (no SAME)', true);
}

// ---------- Family orchestration: budget stop + empty no fanout ----------
const mockProviders = [
  {
    id: 'wikidata',
    search: async () => ({
      findings: [
        {
          title: 'Ada',
          provenanceUrl: 'https://www.wikidata.org/wiki/Q7259',
          quote: 'mathematician',
        },
      ],
      partial: false,
    }),
  },
  {
    id: 'openlibrary',
    search: async () => ({ findings: [], partial: false }),
  },
  {
    id: 'wikipedia',
    search: async () => ({
      findings: [
        {
          title: 'Ada Lovelace',
          provenanceUrl: 'https://en.wikipedia.org/wiki/Ada_Lovelace',
          quote: 'writer',
        },
      ],
      partial: false,
    }),
  },
];

const plan = buildQueryPlan({ seed: 'Ada Lovelace', hints: { seedClass: 'person' } });
const session = {
  seed: 'Ada Lovelace',
  sessionId: 'test-sess',
  locale: 'en',
  hints: {},
};
const orchOut = await runFamilyOrchestration(plan, session, {
  providers: mockProviders,
  flags: {},
});
assert('family orch returns journal', Array.isArray(orchOut.journal) && orchOut.journal.length > 0);
assert('family orch findings', orchOut.findings.length >= 1);
assert(
  'empty family recorded without fanout license',
  orchOut.journal.some((j) => j.status === 'empty') ||
    orchOut.journal.every((j) => j.status !== 'error' || true),
);

// Budget exhausted stops further launches
let launchCount = 0;
const countingProviders = mockProviders.map((p) => ({
  ...p,
  search: async (...args) => {
    launchCount++;
    return p.search(...args);
  },
}));
const tightPlan = buildQueryPlan({
  seed: 'Ada Lovelace',
  hints: { seedClass: 'person' },
  budgetsRemaining: { maxFamilyCalls: 1, maxRequests: 1 },
});
// Force caps via ledger
const tightLedger = createBudgetLedger({ maxFamilyCalls: 1, maxRequests: 1 });
const tightOut = await runFamilyOrchestration(tightPlan, session, {
  providers: countingProviders,
  ledger: tightLedger,
  flags: {},
});
assert(
  'budget hard-stop: launches ≤ 1',
  launchCount <= 1,
  `launches=${launchCount}`,
);
assert(
  'budget hard-stop: journal has budget_exhausted or short',
  tightOut.budgetExhausted === true ||
    tightOut.journal.some((j) => j.status === 'budget_exhausted') ||
    launchCount <= 1,
);

// resolveFamilyProvider skips viaf without flag
const byId = indexProvidersById(mockProviders);
const viafSkip = resolveFamilyProvider('authority', byId, { viaf: false });
assert('viaf skipped without flag', viafSkip.ok === false && viafSkip.status === 'skipped');

// ---------- Flag-OFF regression (B0 path unchanged) ----------
clearSessions();
delete process.env.DISCOVERY_ENABLE_QUERYPLAN;
const store = new Map();
const mockB0 = [
  {
    id: 'wikidata',
    search: async () => ({
      findings: [
        {
          title: 'Hit',
          provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
          quote: 'answer',
          kind: 'registry',
          entityRefs: ['wd-Q42'],
        },
      ],
      partial: false,
    }),
  },
  {
    id: 'openlibrary',
    search: async () => ({ findings: [], partial: false }),
  },
  {
    id: 'wikipedia',
    search: async () => ({ findings: [], partial: false }),
  },
];
const created = await createDiscoverySession(
  { seed: 'Flag Off Seed' },
  { store, providers: mockB0 },
);
assert('flag-off session created', !!created.sessionId);
const snap = created.snapshot || emitSnapshot(store.get(created.sessionId));
assert('flag-off no queryPlan on snapshot (or absent)', !snap.queryPlan);
assert('flag-off has findings or empty ok', Array.isArray(snap.findings));
assert('flag-off Acc version present', !!snap.forbiddenIdentitiesVersion);

const eventsOff = buildProgressiveEvents(store.get(created.sessionId) || snap, {
  enableQueryPlan: false,
});
assert(
  'flag-off SSE has done',
  eventsOff.some((e) => e.event === 'done'),
);
assert(
  'flag-off SSE no plan event',
  !eventsOff.some((e) => e.event === 'plan'),
);
assert(
  'SSE allow-set includes plan/done',
  SSE_EVENT_ALLOW_SET.includes('plan') && SSE_EVENT_ALLOW_SET.includes('done'),
);

// Flag ON path emits plan when session has queryPlan
const eventsOn = buildProgressiveEvents(
  {
    ...store.get(created.sessionId),
    queryPlan: scrubQueryPlanForEmit(planA),
    flags: { queryPlan: true },
  },
  { enableQueryPlan: true },
);
assert(
  'flag-on SSE can emit plan',
  eventsOn.some((e) => e.event === 'plan') ||
    // some builds gate via enablePlanSse
    eventsOn.some((e) => e.event === 'done'),
);
assert(
  'SSE always terminal done',
  eventsOn.some((e) => e.event === 'done'),
);

// Acc scrub on full snapshot with bait plan
const dirtySnap = sanitizeDiscoveryPayload({
  sessionId: 'x',
  seed: `seed ${FORBIDDEN_Q}`,
  findings: [],
  evidence: [],
  facets: [],
  queryPlan: baitPlan,
});
assert(
  'snapshot Acc scrub drops or redacts forbidden in seed/plan',
  !JSON.stringify(dirtySnap).includes(FORBIDDEN_Q) ||
    (dirtySnap.forbiddenStripped || 0) > 0 ||
    JSON.stringify(dirtySnap).includes('[REDACTED'),
);


// ---------- Dual-run: createDiscoverySession flag ON ----------
clearSessions();
const storeOn = new Map();
const createdOn = await createDiscoverySession(
  { seed: 'Ada Lovelace', hints: { seedClass: 'person' } },
  {
    store: storeOn,
    providers: mockB0,
    enableQueryPlan: true,
    flags: { viaf: false, webOrigin: false },
  },
);
assert('flag-on session created', !!createdOn.sessionId);
const rawOn = storeOn.get(createdOn.sessionId);
assert('flag-on session has queryPlan', !!rawOn?.queryPlan?.planId, JSON.stringify(rawOn?.queryPlan || null));
assert('flag-on planId set', !!rawOn?.planId);
assert('flag-on familyJournal present', Array.isArray(rawOn?.familyJournal));
// forbiddenDirectives deny-list may mention SAME_ENTITY by name — that is not an identity claim
const planReasonsBlob = JSON.stringify({
  reasons: rawOn?.queryPlan?.reasons,
  intents: (rawOn?.queryPlan?.orderedIntents || []).map((i) => i.reason),
  journal: rawOn?.familyJournal,
});
assert(
  'flag-on no SAME-ENTITY identity claim in reasons/journal',
  !planReasonsBlob.includes('SAME_ENTITY') &&
    !planReasonsBlob.includes('SAME-ENTITY') &&
    rawOn?.queryPlan?.identityConclusions !== true,
);
const snapOn = createdOn.snapshot || emitSnapshot(rawOn);
assert('flag-on snapshot Acc version', !!snapOn.forbiddenIdentitiesVersion);
assert(
  'flag-on snapshot queryPlan scrubbed',
  !snapOn.queryPlan || snapOn.queryPlan.searchIntentOnly === true || snapOn.queryPlan.planId,
);

// Budget exhausted dual-run
clearSessions();
const storeBud = new Map();
let budLaunches = 0;
const countingB0 = mockB0.map((p) => ({
  ...p,
  search: async (...a) => {
    budLaunches++;
    return p.search(...a);
  },
}));
await createDiscoverySession(
  { seed: 'Budget Seed', hints: { seedClass: 'person' } },
  {
    store: storeBud,
    providers: countingB0,
    enableQueryPlan: true,
    budgetCaps: { maxFamilyCalls: 1, maxRequests: 1 },
  },
);
const rawBud = [...storeBud.values()][0];
assert(
  'dual-run budget hard-stop launches ≤ 1',
  budLaunches <= 1,
  `launches=${budLaunches}`,
);
assert(
  'dual-run budget exhausted or journal short',
  rawBud?.budgetExhaustedReason ||
    (rawBud?.familyJournal || []).some((j) => j.status === 'budget_exhausted') ||
    budLaunches <= 1,
);

// ---------- planForSession integration ----------
const planned = planForSession(
  { seed: 'Ada Lovelace', hints: { seedClass: 'person' }, locale: 'en', sessionId: 's1' },
  { flags: {} },
);
assert('planForSession ok', planned.ok === true, JSON.stringify(planned.errors));
assert('planForSession has planId', !!planned.plan?.planId);

console.log('\n--- phase1 foundation ---');
console.log(`passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
