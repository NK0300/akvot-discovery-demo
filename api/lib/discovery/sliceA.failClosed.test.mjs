/**
 * Track B slice A — two fail-closed fixes (defense layers; validate/orch checks stay):
 *  1. Policy.selectLaunches ∩ plan.orderedIntents families (empty intents ⇒ []).
 *  2. Blank seed ('', whitespace, tab, NBSP, zero-width) ⇒ planForSession ok=false
 *     reason empty_seed · 0 launches · provider.search never called with empty query.
 * Flags default OFF · no Core · no promote · C1: no identity claims (UNKNOWN stays UNKNOWN).
 */
import assert from 'node:assert/strict';
import {
  selectLaunches,
  launchesFromQueryPlan,
  intentFamilyAllowSet,
  policyB0Default,
  policyNightCaps,
} from './policy.js';
import {
  buildQueryPlan,
  validateQueryPlan,
  isBlankSeed,
  EMPTY_SEED_REASON,
} from './queryPlan.js';
import { planForSession, executePlanLaunches } from './planOrchestration.js';
import { runFamilyOrchestration, executeFamilyCall } from './familyOrchestrator.js';
import { createBudgetLedger } from './budget.js';
import { FAMILY_TO_PROVIDER } from './sourceFamily.js';
import { createMemoryMapAdapter } from './sessionStore.js';
import { runPipeline, createDiscoverySession } from './orchestrator.js';

for (const k of Object.keys(process.env)) {
  if (k.startsWith('DISCOVERY_ENABLE_')) delete process.env[k];
}

let passed = 0;
function ok(name, cond, detail) {
  assert.ok(cond, detail ? `${name}: ${detail}` : name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('sliceA.failClosed.test.mjs');

/** Spy providers for every registered family provider; records every search call. */
function spyProviders(log) {
  const ids = [...new Set(Object.values(FAMILY_TO_PROVIDER).filter(Boolean))];
  return ids.map((id) => ({
    id,
    search: async (req) => {
      log.push({ id, q: req?.q });
      return { providerId: id, findings: [], partial: false, errors: [] };
    },
  }));
}

// ---------------------------------------------------------------------------
// 1. Select ∩ orderedIntents
// ---------------------------------------------------------------------------
const ada = buildQueryPlan({ seed: 'Ada Lovelace' });
const adaAllow = intentFamilyAllowSet(ada);
ok('Ada intents exclude authority (viaf OFF plan)', !adaAllow.has('authority'));
ok('Ada intents include encyclopedia', adaAllow.has('encyclopedia'));

{
  // derived path (no plan.launches) unchanged: select == launchesFromQueryPlan families
  const sel = selectLaunches({ plan: ada, flags: {} });
  const fromPlan = launchesFromQueryPlan(ada).map((r) => r.familyId).sort();
  ok(
    'derived select families == launchesFromQueryPlan',
    JSON.stringify(sel.launches.map((l) => l.familyId).sort()) === JSON.stringify(fromPlan),
  );
  ok('derived select no plan-allow skips', sel.planAllowSkips === 0 && sel.skipped.length === 0);
}

{
  // VIAF flag ON + authority off-intent ⇒ cut (was: launched)
  const plan = {
    ...ada,
    launches: [{ intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'authority', priority: 1 }],
  };
  const sel = selectLaunches({ plan, flags: { viaf: true } });
  ok('VIAF ON off-intent authority → 0 launches', sel.launches.length === 0);
  ok(
    'VIAF ON off-intent authority skipReason not_in_plan',
    sel.skipped.some((s) => s.familyId === 'authority' && s.skipReason === 'not_in_plan'),
  );
  ok('planAllowSkips counted', sel.planAllowSkips === 1);
  // flag OFF keeps the registry reason (unchanged behavior)
  const off = selectLaunches({ plan, flags: { viaf: false } });
  ok(
    'VIAF OFF off-intent authority keeps flag skip reason',
    off.launches.length === 0 && /VIAF/.test(String(off.skipped[0]?.skipReason || '')),
  );
}

{
  // mixed: in-intent kept, off-intent cut
  const plan = {
    ...ada,
    launches: [
      { intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'encyclopedia', priority: 1 },
      { intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'authority', priority: 2 },
      { intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'web_origin', priority: 3 },
    ],
  };
  const sel = selectLaunches({ plan, flags: { viaf: true, webOrigin: true } });
  ok(
    'mixed: only in-intent encyclopedia launches',
    sel.launches.length === 1 && sel.launches[0].familyId === 'encyclopedia',
  );
  ok(
    'mixed: authority + web_origin cut not_in_plan',
    ['authority', 'web_origin'].every((f) =>
      sel.skipped.some((s) => s.familyId === f && s.skipReason === 'not_in_plan'),
    ),
  );
  ok('mixed: every launch ∈ orderedIntents', sel.launches.every((l) => adaAllow.has(l.familyId)));
}

{
  // in-intent authority (viaf ON plan) still launches — not over-cut
  const viafPlan = buildQueryPlan({ seed: 'Ada Lovelace', flags: { viaf: true } });
  if (intentFamilyAllowSet(viafPlan).has('authority')) {
    const sel = selectLaunches({ plan: viafPlan, flags: { viaf: true } });
    ok('in-intent authority launches with VIAF ON', sel.launches.some((l) => l.familyId === 'authority'));
  } else {
    ok('viaf plan has no authority intent (nothing to launch)', true);
  }
}

for (const [label, plan] of [
  ['empty orderedIntents + launches', { ...ada, orderedIntents: [], launches: [{ intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'encyclopedia', priority: 1 }] }],
  ['empty orderedIntents no launches', { ...ada, orderedIntents: [] }],
  ['missing orderedIntents + launches', { launches: [{ intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'encyclopedia', priority: 1 }] }],
  ['empty orderedIntents + VIAF authority', { orderedIntents: [], launches: [{ intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'authority', priority: 1 }] }],
]) {
  for (const pol of [null, policyB0Default, policyNightCaps]) {
    const sel = pol ? pol.select({ plan, flags: { viaf: true } }) : selectLaunches({ plan, flags: { viaf: true } });
    ok(`${label} ⇒ [] (${pol ? pol.id : 'selectLaunches'})`, sel.launches.length === 0);
  }
  const sel = selectLaunches({ plan, flags: { viaf: true } });
  if (Array.isArray(plan.launches) && plan.launches.length) {
    ok(`${label} skip reason empty_plan`, sel.skipped.every((s) => s.skipReason === 'empty_plan'));
  }
}

{
  // Orchestrator with default policy: off-intent authority never searched (select layer cuts first)
  const log = [];
  const plan = {
    ...ada,
    launches: [
      { intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'encyclopedia', priority: 1, query: 'Ada Lovelace' },
      { intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'authority', priority: 2, query: 'Ada Lovelace' },
    ],
  };
  const out = await runFamilyOrchestration(plan, { sessionId: 'sa-1', seed: 'Ada Lovelace', hints: {} }, {
    providers: spyProviders(log),
    flags: { viaf: true },
  });
  ok('orch: authority provider never searched', !log.some((c) => c.id === FAMILY_TO_PROVIDER.authority));
  ok('orch: encyclopedia searched', log.some((c) => c.id === FAMILY_TO_PROVIDER.encyclopedia));
  ok(
    'orch: journal authority skipped not_in_plan',
    out.journal.some((j) => j.familyId === 'authority' && j.skipReason === 'not_in_plan'),
  );
  ok('orch: policyObs planAllowSkips includes select cut', out.policyObs.planAllowSkips >= 1);
  ok('orch: C1 no identityClaim true in findings', out.findings.every((f) => f.identityClaim !== true));
}

// ---------------------------------------------------------------------------
// 2. Blank seed ⇒ empty_seed fail-closed
// ---------------------------------------------------------------------------
const BLANKS = [
  ['empty', ''],
  ['spaces', '   '],
  ['tab', '\t'],
  ['nbsp', '\u00A0'],
  ['mixed ws', ' \t\u00A0\n\r '],
  ['ideographic space', '\u3000'],
  ['zero-width', '\u200B\u200D'],
  ['null', null],
  ['undefined', undefined],
];
ok('isBlankSeed false for "Ada"', isBlankSeed('Ada') === false);
ok('isBlankSeed false for "x"', isBlankSeed('x') === false);
ok('isBlankSeed false for " Q42 "', isBlankSeed(' Q42 ') === false);

for (const [label, seed] of BLANKS) {
  ok(`isBlankSeed(${label})`, isBlankSeed(seed) === true);
  for (const flags of [{}, { viaf: true, webOrigin: true }]) {
    const tag = `${label}${flags.viaf ? ' flags ON' : ''}`;
    const pfs = planForSession(
      { sessionId: 'sa-blank', seed, locale: 'en', hints: { urls: ['https://example.org/'] } },
      { flags },
    );
    ok(`planForSession(${tag}) ok=false`, pfs.ok === false);
    ok(`planForSession(${tag}) reason empty_seed`, pfs.reason === EMPTY_SEED_REASON && pfs.fallbackReason === 'empty_seed');
    ok(`planForSession(${tag}) errors [empty_seed]`, JSON.stringify(pfs.errors) === '["empty_seed"]');
    ok(`planForSession(${tag}) 0 launches, plan null`, Array.isArray(pfs.launches) && pfs.launches.length === 0 && pfs.plan === null);
  }
  const direct = buildQueryPlan({ seed });
  ok(`buildQueryPlan(${label}) zero intents`, direct.orderedIntents.length === 0 && direct.sourceFamilies.length === 0);
  ok(`buildQueryPlan(${label}) seedEmpty flag`, direct.seedEmpty === true);
  const v = validateQueryPlan(direct);
  ok(`validateQueryPlan(${label}) rejects empty_seed`, v.ok === false && v.errors.includes('empty_seed'));
  ok(`buildQueryPlan(${label}) select []`, selectLaunches({ plan: direct, flags: { viaf: true } }).launches.length === 0);
}
ok('non-blank plan has no seedEmpty key (shape unchanged)', !('seedEmpty' in ada));
ok('non-blank planForSession shape unchanged', !('reason' in planForSession({ sessionId: 's', seed: 'Ada Lovelace', hints: {} })));

{
  // validate defense: hand-built plan whose query q is blank
  const bad = {
    ...ada,
    orderedIntents: ada.orderedIntents.map((it, i) =>
      i === 0 ? { ...it, queries: it.queries.map((q) => ({ ...q, q: ' \u00A0' })) } : it,
    ),
  };
  const v = validateQueryPlan(bad);
  ok('validate rejects blank intent query (query_empty:*)', v.ok === false && v.errors.some((e) => e.startsWith('query_empty:')));
}

{
  // Family orch: blank query + blank session seed ⇒ provider.search never called
  const log = [];
  const planWithBlankQueries = {
    ...ada,
    orderedIntents: ada.orderedIntents.map((it) => ({
      ...it,
      queries: (it.queries || []).map((q) => ({ ...q, q: '' })),
    })),
  };
  for (const [label, seed] of BLANKS) {
    const out = await runFamilyOrchestration(planWithBlankQueries, { sessionId: 'sa-orch', seed, hints: {} }, {
      providers: spyProviders(log),
      flags: { viaf: true, webOrigin: true },
    });
    ok(`orch blank (${label}): 0 provider.search`, log.length === 0, JSON.stringify(log));
    ok(
      `orch blank (${label}): journal empty_seed skips`,
      out.journal.filter((j) => j.status !== 'skipped' || j.skipReason !== 'empty_seed').every((j) => j.status === 'skipped' || j.status === 'unsupported'),
    );
  }
  const exec = await executePlanLaunches({ sessionId: 'sa-exec', seed: '\t', hints: {} }, planWithBlankQueries, {
    providers: spyProviders(log),
    ledger: createBudgetLedger(ada.budgets),
    wallDeadline: Date.now() + 3000,
  });
  ok('executePlanLaunches blank: 0 provider.search', log.length === 0);
  ok('executePlanLaunches blank: journal empty_seed', exec.journal.some((j) => j.skipReason === 'empty_seed'));

  const ledger = createBudgetLedger(ada.budgets);
  const r = await executeFamilyCall({
    familyId: 'encyclopedia',
    provider: spyProviders(log).find((p) => p.id === FAMILY_TO_PROVIDER.encyclopedia),
    providerId: FAMILY_TO_PROVIDER.encyclopedia,
    intentId: 'DISCOVER_IDENTITY_REFERENCES',
    planId: ada.planId,
    query: '\u00A0',
    session: { sessionId: 'sa-call', seed: '  ', hints: {} },
    budgetMs: 500,
    ledger,
    plan: ada,
  });
  ok('executeFamilyCall blank: skipped empty_seed', r.status === 'skipped' && r.skipReason === 'empty_seed');
  ok('executeFamilyCall blank: 0 requests / no search', r.requestsUsed === 0 && log.length === 0);
}

{
  // runPipeline (QueryPlan ON): blank seed never falls back to flat provider fanout
  for (const [label, seed] of BLANKS.filter(([, s]) => typeof s === 'string')) {
    const log = [];
    const providers = spyProviders(log);
    const store = createMemoryMapAdapter();
    const sessionId = `sa-pipe-${label.replace(/\W+/g, '-')}`;
    await store.set(sessionId, {
      sessionId,
      seed,
      q: seed,
      hints: {},
      locale: 'en',
      status: 'running',
      providers: Object.fromEntries(providers.map((p) => [p.id, 'pending'])),
      findings: [],
      evidence: [],
      facets: [],
      progress: { done: 0, totalHint: providers.length + 3 },
      budgets: { startedAt: Date.now() },
      stage: 'S0',
      version: 1,
      eventCursor: 0,
    });
    await runPipeline(sessionId, {
      _resolved: store,
      providers,
      enableQueryPlan: true,
      flags: { viaf: true, webOrigin: true },
    });
    const final = await store.get(sessionId);
    ok(`runPipeline blank (${label}): 0 provider.search`, log.length === 0, JSON.stringify(log));
    ok(`runPipeline blank (${label}): planFallbackReason empty_seed`, final?.planFallbackReason === 'empty_seed');
    ok(`runPipeline blank (${label}): no findings`, (final?.findings || []).length === 0);
  }
  // createDiscoverySession: zero-width seed passes the HTTP trim guard → still 0 searches
  const log = [];
  const snap = await createDiscoverySession(
    { seed: '\u200B' },
    { providers: spyProviders(log), store: new Map(), enableQueryPlan: true },
  );
  ok('createDiscoverySession zero-width seed (QueryPlan ON): 0 provider.search', log.length === 0, JSON.stringify(log));
  ok('createDiscoverySession zero-width seed: returns snapshot', !!snap);
}

console.log(`sliceA.failClosed.test.mjs: ${passed} passed`);
