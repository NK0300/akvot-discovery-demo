/**
 * Track B · QueryPlan → family execution honesty (fail-closed).
 * plan.launches / orderedIntents drive Execute; empty plan invents nothing;
 * off-plan familyId from Policy.select cannot bypass plan allow-list.
 * Flags OFF · no Core · no promote · no nightLoop.
 */
import assert from 'node:assert/strict';
import { runFamilyOrchestration } from './familyOrchestrator.js';
import { buildQueryPlan, validateQueryPlan } from './queryPlan.js';
import { FAMILY_TO_PROVIDER } from './sourceFamily.js';
import { policyB0Default, launchesFromQueryPlan } from './policy.js';

let passed = 0;
function ok(name, cond, detail) {
  assert.ok(cond, detail ? `${name}: ${detail}` : name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('policy.orch.planExec.test.mjs');

function stubProviders(searchLog) {
  return Object.entries(FAMILY_TO_PROVIDER)
    .filter(([fid]) => ['knowledge_graph', 'encyclopedia', 'bibliographic'].includes(fid))
    .map(([fid, pid]) => ({
      id: pid,
      search: async () => {
        searchLog.push(fid);
        return { findings: [] };
      },
    }));
}

const session = { sessionId: 'plan-exec-1', seed: 'Ada Lovelace', locale: 'en', hints: {} };

// --- empty plan invents no work ---
{
  const searchLog = [];
  const emptyPlan = {
    planId: 'qp-empty',
    orderedIntents: [],
    launches: [],
    budgets: { maxFamilyCalls: 5, maxProviderMs: 1000, maxWallMs: 3000, silentExpansionForbidden: true },
  };
  const inventingPolicy = {
    id: 'policy.test.invent',
    select() {
      return {
        launches: [
          {
            intentId: 'DISCOVER_IDENTITY_REFERENCES',
            familyId: 'encyclopedia',
            priority: 1,
            reason: 'invented_off_plan',
          },
        ],
        skipped: [],
        memoryRepeatSkips: 0,
      };
    },
    evaluate: policyB0Default.evaluate,
    expand: policyB0Default.expand,
    nextOrStop: policyB0Default.nextOrStop,
  };
  const out = await runFamilyOrchestration(emptyPlan, session, {
    providers: stubProviders(searchLog),
    flags: {},
    policy: inventingPolicy,
  });
  ok('empty plan → zero provider.search', searchLog.length === 0);
  ok(
    'empty plan skips carry empty_plan',
    (out.journal || []).some((j) => j.skipReason === 'empty_plan'),
  );
  ok('empty plan policyObs selectLaunchCount 0', out.policyObs?.selectLaunchCount === 0);
  ok('empty plan planAllowSkips ≥ 1', (out.policyObs?.planAllowSkips || 0) >= 1);
}

// --- off-plan familyId cannot bypass plan allow-list ---
{
  const searchLog = [];
  const plan = buildQueryPlan({ seed: 'Ada Lovelace' });
  const planFamilies = new Set(launchesFromQueryPlan(plan).map((r) => r.familyId));
  ok('fixture plan has B0 families', planFamilies.has('encyclopedia'));

  const sneakyPolicy = {
    id: 'policy.test.sneaky',
    select() {
      return {
        launches: [
          {
            intentId: 'DISCOVER_IDENTITY_REFERENCES',
            familyId: 'encyclopedia',
            priority: 1,
            reason: 'in_plan',
          },
          {
            intentId: 'DISCOVER_IDENTITY_REFERENCES',
            familyId: 'authority', // viaf — not in this plan's orderedIntents when viaf flag OFF
            priority: 2,
            reason: 'off_plan_inject',
          },
        ],
        skipped: [],
        memoryRepeatSkips: 0,
      };
    },
    evaluate: policyB0Default.evaluate,
    expand: policyB0Default.expand,
    nextOrStop: policyB0Default.nextOrStop,
  };
  const out = await runFamilyOrchestration(plan, session, {
    providers: [
      ...stubProviders(searchLog),
      {
        id: FAMILY_TO_PROVIDER.authority,
        search: async () => {
          searchLog.push('authority');
          return { findings: [] };
        },
      },
    ],
    flags: { viaf: true },
    policy: sneakyPolicy,
  });
  ok('off-plan authority never searched', !searchLog.includes('authority'));
  ok(
    'off-plan skipped not_in_plan',
    (out.journal || []).some(
      (j) => j.familyId === 'authority' && j.skipReason === 'not_in_plan',
    ),
  );
  ok('in-plan encyclopedia still searched', searchLog.includes('encyclopedia'));
  ok(
    'execute ⊆ plan families',
    searchLog.every((fid) => planFamilies.has(fid)),
  );
}

// --- happy path: plan families drive Execute via Registry+Policy ---
{
  const searchLog = [];
  const plan = buildQueryPlan({ seed: 'Ada Lovelace' });
  const v = validateQueryPlan(plan);
  ok('plan validates', v.ok === true, JSON.stringify(v.errors));
  const out = await runFamilyOrchestration(plan, session, {
    providers: stubProviders(searchLog),
    flags: {},
    policy: policyB0Default,
  });
  const planFamilies = launchesFromQueryPlan(plan).map((r) => r.familyId).sort();
  ok('B0 select launches searched', searchLog.length >= 1);
  ok(
    'searched families ⊆ plan',
    searchLog.every((fid) => planFamilies.includes(fid)),
  );
  ok('policyObs planAllowSkips 0', out.policyObs?.planAllowSkips === 0);
  ok(
    'journal execute rows only plan families',
    (out.journal || [])
      .filter((j) => j.status !== 'skipped' && j.status !== 'unsupported')
      .every((j) => planFamilies.includes(j.familyId)),
  );
}

// --- plan.launches allow-set honored when present ---
{
  const searchLog = [];
  const base = buildQueryPlan({ seed: 'Ada Lovelace' });
  const narrow = {
    ...base,
    launches: [
      {
        intentId: 'DISCOVER_IDENTITY_REFERENCES',
        familyId: 'bibliographic',
        priority: 1,
        reason: 'narrow_launch',
        query: 'Ada Lovelace',
      },
    ],
  };
  ok('narrow launches validate', validateQueryPlan(narrow).ok === true);
  const out = await runFamilyOrchestration(narrow, session, {
    providers: stubProviders(searchLog),
    flags: {},
    policy: policyB0Default,
  });
  ok('only bibliographic searched', searchLog.length === 1 && searchLog[0] === 'bibliographic');
  ok('policyObs selectLaunchCount 1', out.policyObs?.selectLaunchCount === 1);
}


// --- plan.launches inject registered family NOT in orderedIntents → ∩ drops it ---
{
  const searchLog = [];
  const base = buildQueryPlan({ seed: 'Ada Lovelace' });
  const intentAllow = new Set(launchesFromQueryPlan(base).map((r) => r.familyId));
  ok('authority not in Ada intents (viaf OFF)', !intentAllow.has('authority'));
  ok('authority is registered', !!FAMILY_TO_PROVIDER.authority);

  const injected = {
    ...base,
    launches: [
      {
        intentId: 'DISCOVER_IDENTITY_REFERENCES',
        familyId: 'encyclopedia',
        priority: 1,
        reason: 'in_intents',
        query: 'Ada Lovelace',
      },
      {
        intentId: 'DISCOVER_IDENTITY_REFERENCES',
        familyId: 'authority', // registered but NOT in orderedIntents.sourceFamilies
        priority: 2,
        reason: 'off_intent_inject',
        query: 'Ada Lovelace',
      },
    ],
  };

  const allowRows = launchesFromQueryPlan(injected);
  ok(
    'allow-set excludes off-intent authority',
    !allowRows.some((r) => r.familyId === 'authority'),
  );
  ok(
    'allow-set keeps in-intent encyclopedia',
    allowRows.some((r) => r.familyId === 'encyclopedia'),
  );

  const v = validateQueryPlan(injected);
  ok('validate rejects off-intent launch', v.ok === false);
  ok(
    'validate error launch_not_in_intents:authority',
    (v.errors || []).some((e) => e === 'launch_not_in_intents:authority'),
  );

  const out = await runFamilyOrchestration(injected, session, {
    providers: [
      ...stubProviders(searchLog),
      {
        id: FAMILY_TO_PROVIDER.authority,
        search: async () => {
          searchLog.push('authority');
          return { findings: [] };
        },
      },
    ],
    flags: { viaf: true },
    policy: policyB0Default,
  });
  ok('off-intent authority never searched', !searchLog.includes('authority'));
  ok(
    'off-intent skipped not_in_plan or absent from execute',
    !searchLog.includes('authority') &&
      ((out.journal || []).some(
        (j) => j.familyId === 'authority' && j.skipReason === 'not_in_plan',
      ) ||
        !(out.journal || []).some((j) => j.familyId === 'authority' && j.status !== 'skipped')),
  );
  ok('in-intent encyclopedia still searched', searchLog.includes('encyclopedia'));
  ok(
    'execute ⊆ intent allow-set',
    searchLog.every((fid) => intentAllow.has(fid)),
  );
}

// --- launches-only (no orderedIntents) ⇒ empty allow-set (fail-closed) ---
{
  const rows = launchesFromQueryPlan({
    launches: [
      {
        intentId: 'DISCOVER_IDENTITY_REFERENCES',
        familyId: 'encyclopedia',
        priority: 1,
      },
    ],
  });
  ok('launches alone without intents → []', rows.length === 0);
}

console.log(`policy.orch.planExec.test.mjs: ${passed} passed`);
