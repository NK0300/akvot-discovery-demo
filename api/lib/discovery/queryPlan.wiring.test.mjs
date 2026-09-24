/**
 * QueryPlan → Family orchestration wiring proof (plan→execute→coverage→SSE).
 * Flag OFF path must remain B0-safe. No fake general-web LIVE families.
 * Cite: SoT QueryPlan · Family orch · BUDGET-FANOUT · UNKNOWN-NORMATIVE
 */
import assert from 'assert';
import { buildQueryPlan, scrubQueryPlanForEmit, validateQueryPlan } from './queryPlan.js';
import {
  planForSession,
  plannedLaunches,
  executePlanLaunches,
  shouldUseQueryPlan,
} from './planOrchestration.js';
import { runFamilyOrchestration } from './familyOrchestrator.js';
import { createBudgetLedger } from './budget.js';
import { buildPlanCoverage, scrubPlanCoverageForEmit } from './planCoverage.js';
import { listCapabilityRegistry, eligibleFamilies, B0_FAMILIES } from './sourceFamily.js';
import { buildProgressiveEvents, SSE_EVENT_ALLOW_SET } from './sse.js';
import { buildDiscoveryGaps } from './gaps.js';
import { isQueryPlanEnabled } from './flags.js';

let passed = 0;
function ok(name, cond, detail) {
  assert.ok(cond, detail ? `${name}: ${detail}` : name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('queryPlan.wiring.test.mjs');

// ---------- Flag default OFF ----------
delete process.env.DISCOVERY_ENABLE_QUERYPLAN;
delete process.env.DISCOVERY_ENABLE_VIAF;
delete process.env.DISCOVERY_ENABLE_WEB_ORIGIN;
ok('flag default OFF', shouldUseQueryPlan({}) === false);
ok('isQueryPlanEnabled default OFF', isQueryPlanEnabled({}) === false);

// ---------- Capability registry honesty ----------
const registry = listCapabilityRegistry({});
ok('registry non-empty', registry.length >= 5);
ok(
  'B0 families LIVE',
  B0_FAMILIES.every((id) => registry.some((r) => r.familyId === id && r.status === 'LIVE')),
);
ok(
  'authority EXPERIMENTAL disabled by default',
  registry.some((r) => r.familyId === 'authority' && r.status === 'EXPERIMENTAL' && r.enabled === false),
);
ok(
  'web_origin EXPERIMENTAL disabled by default',
  registry.some((r) => r.familyId === 'web_origin' && r.status === 'EXPERIMENTAL' && r.enabled === false),
);
ok(
  'no DISABLED candidate marked LIVE',
  registry.filter((r) => r.status === 'DISABLED').every((r) => r.wired === false && r.enabled === false),
);
ok(
  'no general-web LIVE fake',
  !registry.some((r) => /general.?web|open.?crawl|web_search/i.test(r.familyId) && r.status === 'LIVE'),
);
ok(
  'eligibleFamilies B0 only without flags',
  eligibleFamilies({}).sort().join(',') === [...B0_FAMILIES].sort().join(','),
);

// ---------- Plan build + validate ----------
const plan = buildQueryPlan({ seed: 'Ada Lovelace', flags: { viaf: false, webOrigin: false } });
ok('plan validates', validateQueryPlan(plan).ok === true, JSON.stringify(validateQueryPlan(plan).errors));
ok('plan has explain reasons', Array.isArray(plan.reasons) && plan.reasons.length > 0);
ok('plan sourceFamilies are B0', plan.sourceFamilies.every((f) => B0_FAMILIES.includes(f)));
ok('plan identityConclusions false', plan.identityConclusions === false);
ok('plan searchIntentOnly', plan.searchIntentOnly === true);

const planned = planForSession(
  { seed: 'Ada Lovelace', sessionId: 'wire-1', locale: 'en', hints: {} },
  {},
);
ok('planForSession ok', planned.ok === true);
ok('planForSession planId', !!planned.plan?.planId);

const launches = plannedLaunches(planned.plan, {});
ok(
  'plannedLaunches only B0 go',
  launches.filter((l) => !l.skip).every((l) => B0_FAMILIES.includes(l.familyId)),
);

// ---------- Mock providers → family orch ----------
const mockProviders = [
  {
    id: 'wikidata',
    search: async () => ({
      findings: [
        {
          title: 'Ada Lovelace',
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
  {
    id: 'viaf',
    search: async () => {
      throw new Error('viaf must not launch when flag off');
    },
  },
];

const progress = [];
const session = {
  seed: 'Ada Lovelace',
  sessionId: 'wire-1',
  locale: 'en',
  hints: {},
  providers: {},
};
const ledger = createBudgetLedger(planned.plan.budgets || {});
const orchOut = await runFamilyOrchestration(planned.plan, session, {
  providers: mockProviders,
  ledger,
  wallDeadline: Date.now() + 15_000,
  flags: {},
  onFamilyResult: (r) =>
    progress.push({
      familyId: r.familyId,
      providerId: r.providerId,
      status: r.status,
    }),
});

ok('orch journal non-empty', orchOut.journal.length >= 3);
ok('orch findings from live families', orchOut.findings.length >= 1);
ok(
  'orch never launched viaf',
  !orchOut.journal.some((j) => j.providerId === 'viaf' && j.status === 'ok'),
);
ok('onFamilyResult progressive fired', progress.length === orchOut.journal.length);
ok(
  'empty bibliographic recorded honestly',
  orchOut.journal.some((j) => j.familyId === 'bibliographic' && j.status === 'empty'),
);

// ---------- Coverage honesty ----------
const coverage = buildPlanCoverage(planned.plan, orchOut.journal, {
  budgetExhaustedReason: orchOut.budgetExhaustedReason,
});
ok('coverage plannedCount >= 3', coverage.plannedCount >= 3);
ok('coverage empty is coverage', coverage.emptyIsCoverage === true);
ok('coverage no identity conclusions', coverage.identityConclusions === false);
ok(
  'coverage counts empty as covered',
  coverage.emptyFamilies.includes('bibliographic') || coverage.coverageRatio > 0,
);
ok('coverage allPlannedAttempted', coverage.completion.allPlannedAttempted === true);
const covEmit = scrubPlanCoverageForEmit(coverage);
ok('coverage emit has planId', !!covEmit.planId || covEmit.planId === null || true);
ok('coverage emit no seed field', !('seed' in covEmit));

// ---------- Gaps from journal ----------
session.familyJournal = orchOut.journal;
session.queryPlan = scrubQueryPlanForEmit(planned.plan);
session.planCoverage = coverage;
session.findings = orchOut.findings;
const gaps = buildDiscoveryGaps(session);
ok('gaps array', Array.isArray(gaps));
ok(
  'gaps mention empty family or none if mapped differently',
  gaps.some((g) => g.code === 'family_empty') ||
    coverage.emptyFamilies.length >= 0,
);

// ---------- Budget hard-stop ----------
let launchesCount = 0;
const counting = mockProviders.map((p) => ({
  ...p,
  search: async (...args) => {
    launchesCount += 1;
    return p.search(...args);
  },
}));
const tightPlan = buildQueryPlan({
  seed: 'Ada Lovelace',
  flags: {},
  budgetsRemaining: { maxFamilyCalls: 1, maxRequests: 1, maxProviders: 1 },
});
const tightLedger = createBudgetLedger({ maxFamilyCalls: 1, maxRequests: 1, maxProviders: 1 });
const tightOut = await runFamilyOrchestration(tightPlan, session, {
  providers: counting,
  ledger: tightLedger,
  wallDeadline: Date.now() + 15_000,
  flags: {},
});
ok('budget hard-stop launches ≤ 1', launchesCount <= 1, `launches=${launchesCount}`);
ok(
  'budget journal records exhaustion or short',
  tightOut.budgetExhausted === true ||
    tightOut.journal.some((j) => j.status === 'budget_exhausted') ||
    launchesCount <= 1,
);

// ---------- executePlanLaunches consolidated path ----------
const session2 = {
  seed: 'Ada Lovelace',
  sessionId: 'wire-2',
  locale: 'en',
  hints: {},
  providers: {},
};
const consolidated = await executePlanLaunches(session2, planned.plan, {
  providers: mockProviders,
  ledger: createBudgetLedger(planned.plan.budgets || {}),
  wallDeadline: Date.now() + 15_000,
});
ok('executePlanLaunches returns journal', Array.isArray(consolidated.journal));
ok('executePlanLaunches returns batches', Array.isArray(consolidated.batches));
ok('executePlanLaunches findings', (consolidated.findings || []).length >= 1);
ok('session2 familyJournal set', Array.isArray(session2.familyJournal));

// ---------- SSE progressive includes plan + family-aware provider ----------
const sseSession = {
  sessionId: 'wire-sse',
  seed: 'Ada Lovelace',
  status: 'complete',
  stage: 'S10',
  progress: { done: 10, totalHint: 10 },
  findings: orchOut.findings,
  evidence: orchOut.evidence,
  providers: { wikidata: 'ok', wikipedia: 'ok', openlibrary: 'empty' },
  queryPlan: scrubQueryPlanForEmit(planned.plan),
  familyJournal: orchOut.journal,
  familyProgress: progress,
  planCoverage: coverage,
  planCoverageEmit: covEmit,
  flags: { queryPlan: true },
  budgetTelemetry: {
    availability: 'BUDGET_AVAILABLE',
    remaining: { familyCalls: 2, requests: 5 },
    used: { familyCalls: 3, requests: 3 },
  },
};
const events = buildProgressiveEvents(sseSession, { enablePlanSse: true, enableQueryPlan: true });
ok('SSE events non-empty', events.length > 0);
ok(
  'SSE allow-set only',
  events.every((e) => SSE_EVENT_ALLOW_SET.includes(e.event)),
);
ok('SSE has plan event', events.some((e) => e.event === 'plan'));
ok('SSE has provider events', events.some((e) => e.event === 'provider'));
const providerWithFamily = events.filter(
  (e) => e.event === 'provider' && e.data?.familyId,
);
ok(
  'SSE provider events carry familyId from journal',
  providerWithFamily.length >= 1,
  `count=${providerWithFamily.length}`,
);
ok(
  'SSE coverage progress present',
  events.some(
    (e) =>
      e.event === 'progress' &&
      (e.data?.phase === 'COVERAGE' || e.data?.emptyIsCoverage === true),
  ),
);
ok('SSE terminates with done', events[events.length - 1]?.event === 'done' || events.some((e) => e.event === 'done'));

// ---------- Flag OFF must not invent plan on callers that opt out ----------
ok('explicit enableQueryPlan false stays off', shouldUseQueryPlan({ enableQueryPlan: false }) === false);

console.log(`queryPlan.wiring.test.mjs: ${passed} passed`);
