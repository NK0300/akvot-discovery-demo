/**
 * Track B Step 2 — QueryPlan → Policy.select → Execute gate.
 * Flags default OFF. No Core. No promote.
 */
import assert from 'node:assert/strict';
import {
  selectLaunches,
  launchesFromQueryPlan,
  gateFamilyExecute,
  getPolicy,
  policyB0Default,
  POLICY_STOP_REASONS,
} from './policy.js';
import { buildQueryPlan } from './queryPlan.js';
import { FAMILY_TO_PROVIDER } from './sourceFamily.js';

let passed = 0;
function ok(name, cond, detail) {
  assert.ok(cond, detail ? `${name}: ${detail}` : name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('policy.queryPlan.select.test.mjs');

const plan = buildQueryPlan({ seed: 'Ada Lovelace' });
ok('query plan builds', !!plan?.planId && Array.isArray(plan.orderedIntents));

const rows = launchesFromQueryPlan(plan);
ok('launchesFromQueryPlan non-empty', rows.length >= 3);
ok(
  'launches are B0 family ids',
  rows.every((r) => ['knowledge_graph', 'encyclopedia', 'bibliographic'].includes(r.familyId)),
);
ok('deduped by familyId', new Set(rows.map((r) => r.familyId)).size === rows.length);

const selected = selectLaunches({ plan, flags: {} });
ok('selectLaunches from QueryPlan', selected.launches.length >= 3);
ok('select no skips for B0', selected.skipped.length === 0);

const viafPlan = {
  launches: [{ intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'authority', priority: 1 }],
};
const viafOff = selectLaunches({ plan: viafPlan, flags: { viaf: false } });
ok('viaf flag OFF → skipped', viafOff.launches.length === 0 && viafOff.skipped.length === 1);
ok(
  'viaf skip reason mentions VIAF',
  String(viafOff.skipped[0].skipReason || '').includes('VIAF'),
);

const viafOn = selectLaunches({ plan: viafPlan, flags: { viaf: true } });
ok('viaf flag ON → launch', viafOn.launches.some((l) => l.familyId === 'authority'));

const unknown = selectLaunches({
  plan: { launches: [{ intentId: 'x', familyId: 'nope_family' }] },
  flags: {},
});
ok('unknown family skipped', unknown.skipped.some((s) => s.familyId === 'nope_family'));

const gateMissing = gateFamilyExecute('knowledge_graph', {}, new Map());
ok('gate fail-closed without provider', gateMissing.ok === false);

const byId = new Map([
  [
    FAMILY_TO_PROVIDER.knowledge_graph,
    { id: FAMILY_TO_PROVIDER.knowledge_graph, search: async () => ({ findings: [] }) },
  ],
]);
const gateOk = gateFamilyExecute('knowledge_graph', {}, byId, {
  providerIdForFamily: (fid) => FAMILY_TO_PROVIDER[fid],
});
ok('gate ok with provider', gateOk.ok === true && gateOk.providerId === FAMILY_TO_PROVIDER.knowledge_graph);

ok('b0 preset id', policyB0Default.id === 'policy.b0.default');
ok('getPolicy returns b0', getPolicy('policy.b0.default')?.id === 'policy.b0.default');
ok('stop reasons closed set', POLICY_STOP_REASONS.includes('BUDGET'));

const hold = getPolicy('policy.hold');
const stop = hold.nextOrStop({});
ok('hold preset stops', stop.action === 'stop');

console.log(`policy.queryPlan.select.test.mjs: ${passed} passed`);
