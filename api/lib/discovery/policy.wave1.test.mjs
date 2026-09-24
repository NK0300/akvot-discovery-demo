/**
 * Wave 1 Policy / Universal Seed / Frontier / Mission Memory contract tests.
 * No Core · no promote · pure modules.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  selectLaunches,
  evaluateBatch,
  nextOrStop,
  getPolicy,
  listPolicies,
  POLICY_STOP_REASONS,
  policyHold,
  policyB0Default,
} from './policy.js';
import { normalizeUniversalSeed, scrubUniversalSeedForEmit } from './universalSeed.js';
import {
  createMissionMemory,
  recordWave,
  recordDecision,
  snapshotMissionMemory,
} from './missionMemory.js';
import { createFrontier } from './frontier.js';

describe('policy interface', () => {
  it('lists presets and hold always stops', () => {
    assert.ok(listPolicies().includes('policy.b0.default'));
    assert.equal(policyHold.nextOrStop({}).action, 'stop');
    assert.equal(policyHold.nextOrStop({}).reason, 'POLICY_HOLD');
    assert.ok(POLICY_STOP_REASONS.includes('NO_PROGRESS'));
  });

  it('select skips unknown family without throwing', () => {
    const { launches, skipped } = selectLaunches({
      plan: {
        launches: [
          { intentId: 'DISCOVER_IDENTITY_REFERENCES', familyId: 'wikipedia_opensearch' },
          { intentId: 'X', familyId: 'no_such_family_xyz' },
        ],
      },
      flags: {},
    });
    assert.ok(Array.isArray(launches));
    assert.ok(skipped.some((s) => s.familyId === 'no_such_family_xyz'));
  });

  it('evaluate urlAlone admits no frontier', () => {
    const r = evaluateBatch({}, { urlAlone: true, findings: [{ url: 'https://example.com' }] });
    assert.equal(r.frontierAdds.length, 0);
    assert.equal(r.dropReason, 'url_alone_ceiling');
  });

  it('b0 nextOrStop stops on budget', () => {
    const p = getPolicy('policy.b0.default');
    const r = p.nextOrStop({ budget: { exhausted: true }, wave: 1 });
    assert.equal(r.action, 'stop');
    assert.equal(r.reason, 'BUDGET');
  });

  it('b0 expand refuses past maxWaves 1', () => {
    const r = policyB0Default.expand({
      wave: 1,
      frontier: { items: [{ evaluateOk: true, url: 'https://a.example' }], isEmpty: false },
    });
    assert.equal(r.expand, false);
  });
});

describe('universal seed', () => {
  it('normalizes person-shaped seed without identity fields', () => {
    const s = normalizeUniversalSeed({ raw: 'Ada Lovelace', softRefs: ['qid:Q7259', 'Ada'] });
    assert.equal(s.seedClass, 'person');
    assert.ok(s.seedHash);
    assert.deepEqual(s.softRefs, ['qid:Q7259']);
    assert.equal(scrubUniversalSeedForEmit(s).seedHash, s.seedHash);
    assert.equal(scrubUniversalSeedForEmit(s).raw, undefined);
  });

  it('empty → unknown', () => {
    assert.equal(normalizeUniversalSeed('').seedClass, 'unknown');
  });
});

describe('frontier', () => {
  it('dedupes and requires evaluateOk', () => {
    const f = createFrontier();
    assert.equal(f.add({ url: 'https://Example.com/x', evaluateOk: false }), false);
    assert.equal(f.add({ url: 'https://Example.com/x', evaluateOk: true }), true);
    assert.equal(f.add({ url: 'https://example.com/x', evaluateOk: true }), false);
    assert.equal(f.size(), 1);
    assert.equal(f.takeNext(1)[0].url, 'https://Example.com/x');
    assert.ok(f.isEmpty());
  });
});

describe('mission memory', () => {
  it('snapshots without raw seed', () => {
    const m = createMissionMemory({ missionId: 'm1', seedHash: 'abcd', policyId: 'policy.b0.default' });
    recordWave(m, { wave: 1, familyIds: ['wikipedia_opensearch'] });
    recordDecision(m, { action: 'stop', reason: 'NO_PROGRESS' });
    const snap = snapshotMissionMemory(m);
    assert.equal(snap.missionId, 'm1');
    assert.equal(snap.lastDecision.reason, 'NO_PROGRESS');
    assert.equal(snap.raw, undefined);
  });
});
