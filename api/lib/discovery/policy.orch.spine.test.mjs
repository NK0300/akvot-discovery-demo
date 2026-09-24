/**
 * Track B Step 2b — Policy Evaluate → Record → Expand → Next/Stop on familyOrchestrator.
 * Flags OFF · no Core · no promote · no nightLoop unify.
 */
import assert from 'node:assert/strict';
import { runFamilyOrchestration } from './familyOrchestrator.js';
import {
  getPolicy,
  policyB0Default,
  policyNightCaps,
  policyHold,
  digestFinding,
  buildPolicyContext,
  evaluateBatch,
  selectLaunches,
} from './policy.js';
import { createFrontier } from './frontier.js';
import {
  createMissionMemory,
  recordWave,
  recordEvidenceEdgeCount,
  familiesTriedAtWave,
  missionHasProgress,
  snapshotMissionMemory,
} from './missionMemory.js';
import { buildQueryPlan } from './queryPlan.js';
import { FAMILY_TO_PROVIDER } from './sourceFamily.js';

let passed = 0;
function ok(name, cond, detail) {
  assert.ok(cond, detail ? `${name}: ${detail}` : name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('policy.orch.spine.test.mjs');

ok('digestFinding opaque', digestFinding({ familyId: 'encyclopedia', id: 'f1', url: 'https://a.example' }).startsWith('fd:'));
ok(
  'digestFinding stable',
  digestFinding({ familyId: 'encyclopedia', id: 'f1', url: 'https://a.example' }) ===
    digestFinding({ familyId: 'encyclopedia', id: 'f1', url: 'https://a.example' }),
);

const ctx = buildPolicyContext({
  wave: 1,
  frontier: createFrontier(),
  budget: { exhausted: false },
  mission: { lastProgress: true },
});
ok('buildPolicyContext empty frontier', ctx.frontier.isEmpty === true && ctx.frontier.size === 0);

const stubProviders = [
  {
    id: FAMILY_TO_PROVIDER.knowledge_graph || 'wikidata',
    search: async () => ({
      findings: [
        {
          id: 'wd1',
          url: 'https://www.wikidata.org/wiki/Q7259',
          title: 'Ada Lovelace',
          entityRefs: ['qid:Q7259'],
          summary: 'mathematician',
        },
      ],
    }),
  },
  {
    id: FAMILY_TO_PROVIDER.encyclopedia || 'wikipedia_opensearch',
    search: async () => ({
      findings: [
        {
          id: 'wp1',
          url: 'https://en.wikipedia.org/wiki/Ada_Lovelace',
          title: 'Ada Lovelace',
          summary: 'English mathematician',
        },
      ],
    }),
  },
  {
    id: FAMILY_TO_PROVIDER.bibliographic || 'openlibrary',
    search: async () => ({ findings: [] }),
  },
];

const plan = buildQueryPlan({ seed: 'Ada Lovelace' });
const session = {
  sessionId: 'spine-test-1',
  seed: 'Ada Lovelace',
  locale: 'en',
  hints: {},
};

const out = await runFamilyOrchestration(plan, session, {
  providers: stubProviders,
  flags: {},
  policy: policyB0Default,
});

ok('policyId b0', out.policyId === 'policy.b0.default');
ok('wave 1', out.wave === 1);
ok('evaluate present', out.evaluate && typeof out.evaluate.ok === 'boolean');
ok('expand present', out.expand && out.expand.expand === false);
ok('b0 expand reason MAX_WAVES or NO_PROGRESS', ['MAX_WAVES', 'NO_PROGRESS'].includes(out.expand.reason));
ok('decision stop', out.decision?.action === 'stop');
ok('decision reason closed', ['MAX_WAVES', 'NO_PROGRESS', 'BUDGET', 'ALL_HOPS_SETTLED'].includes(out.decision.reason));
ok('frontier snapshot', out.frontier && typeof out.frontier.size === 'number');
ok('no missionMemory unless opted in', out.missionMemory === undefined);
ok('journal still array', Array.isArray(out.journal));

// Mission memory opt-in
const mem = createMissionMemory({
  missionId: 'm-spine',
  seedHash: 'hashdeadbeef',
  policyId: 'policy.b0.default',
  planId: plan.planId,
});
const frontier = createFrontier();
const outMem = await runFamilyOrchestration(plan, session, {
  providers: stubProviders,
  flags: {},
  policyId: 'policy.b0.default',
  frontier,
  missionMemory: mem,
});
ok('missionMemory snapshot', outMem.missionMemory?.missionId === 'm-spine');
ok('mission lastDecision set', outMem.missionMemory?.lastDecision?.action === 'stop');
ok('mission wave recorded', outMem.missionMemory?.wave >= 1);
ok('live frontier mutated', typeof frontier.size === 'function');

// urlAlone ceiling — no frontier admits
const urlAlone = await runFamilyOrchestration(plan, session, {
  providers: stubProviders,
  flags: {},
  policy: policyB0Default,
  urlAlone: true,
});
ok('urlAlone dropReason', urlAlone.evaluate?.dropReason === 'url_alone_ceiling');
ok('urlAlone no frontier adds', urlAlone.evaluate?.frontierAdded === 0);

// Hold preset always stops POLICY_HOLD
const holdOut = await runFamilyOrchestration(plan, session, {
  providers: stubProviders,
  flags: {},
  policy: policyHold,
});
ok('hold decision POLICY_HOLD', holdOut.decision?.reason === 'POLICY_HOLD');
ok('hold expand false', holdOut.expand?.expand === false);

// Night caps preset: with maxWaves=2 and frontier items, expand may be true when wave=1
const nightFrontier = createFrontier();
nightFrontier.add({
  url: 'https://example.org/ada',
  evaluateOk: true,
  familyId: 'encyclopedia',
  intentId: 'x',
  wave: 1,
});
const nightCtx = buildPolicyContext({
  wave: 1,
  maxWaves: 2,
  frontier: nightFrontier,
  budget: { exhausted: false },
  mission: { lastProgress: true },
});
const nightExpand = policyNightCaps.expand(nightCtx);
ok('night.caps expand true at wave1', nightExpand.expand === true);
const nightDec = policyNightCaps.nextOrStop(nightCtx);
ok('night.caps next when frontier', nightDec.action === 'next');

// evaluateBatch helper still cite-or-drop
const ev = evaluateBatch({}, {
  findings: [
    { url: 'https://en.wikipedia.org/wiki/X', familyId: 'encyclopedia', entityRefs: ['qid:Q1'] },
    { familyId: 'knowledge_graph' }, // no url/ref → drop
  ],
});
ok('evaluate admits typed+url', ev.frontierAdds.length === 1);

// getPolicy night exists but orch default remains b0
ok('getPolicy night', getPolicy('policy.night.caps')?.id === 'policy.night.caps');

// §21 Mission Memory deepen — evidenceEdgeCount + repeat SELECT gate + policyObs
ok('evidenceEdgeCount on mission snap', (outMem.missionMemory?.evidenceEdgeCount ?? 0) >= 0);
ok('policyObs present', outMem.policyObs && outMem.policyObs.policyId === 'policy.b0.default');
ok('policyObs select counts', typeof outMem.policyObs.selectLaunchCount === 'number');
ok('journal keeps policyId after scrub', outMem.journal.some((j) => j.policyId === 'policy.b0.default'));
ok('journal keeps wave after scrub', outMem.journal.some((j) => j.wave === 1));

const emptyMem = createMissionMemory({
  missionId: 'm-repeat',
  seedHash: 'hashcafe',
  policyId: 'policy.b0.default',
});
recordWave(emptyMem, { wave: 1, familyIds: ['encyclopedia', 'knowledge_graph'] });
ok('familiesTriedAtWave', familiesTriedAtWave(emptyMem, 1).has('encyclopedia'));
ok('no progress yet', missionHasProgress(emptyMem) === false);
const spineIntents = [
  {
    intentId: 'DISCOVER_IDENTITY_REFERENCES',
    priority: 1,
    sourceFamilies: ['bibliographic', 'encyclopedia', 'knowledge_graph'],
  },
];
const blocked = selectLaunches({
  plan: {
    orderedIntents: spineIntents, // slice A: select ∩ orderedIntents
    launches: [
      { intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'encyclopedia', priority: 1 },
      { intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'bibliographic', priority: 2 },
    ],
  },
  flags: {},
  wave: 1,
  missionMemory: emptyMem,
});
ok(
  'repeat SELECT blocked without progress',
  blocked.skipped.some((s) => s.skipReason === 'mission_memory_repeat_no_progress' && s.familyId === 'encyclopedia'),
);
ok('untried family still launches', blocked.launches.some((l) => l.familyId === 'bibliographic'));
ok('memoryRepeatSkips counted', blocked.memoryRepeatSkips >= 1);

// With progress digests, repeat is allowed
recordEvidenceEdgeCount(emptyMem, 2);
ok('missionHasProgress after edges', missionHasProgress(emptyMem) === true);
const allowed = selectLaunches({
  plan: {
    orderedIntents: spineIntents,
    launches: [{ intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'encyclopedia', priority: 1 }],
  },
  flags: {},
  wave: 1,
  missionMemory: emptyMem,
});
ok('repeat SELECT allowed after progress', allowed.launches.some((l) => l.familyId === 'encyclopedia'));

console.log(`policy.orch.spine.test.mjs: ${passed} passed`);
