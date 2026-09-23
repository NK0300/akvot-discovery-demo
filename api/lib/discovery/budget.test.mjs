/**
 * Budget / fanout PRE-GO contract tests — T-BUD-01…08.
 * Cite: BUDGET-FANOUT-CONTRACT
 */
import assert from 'assert';
import {
  createBudgetLedger,
  createBudgetCaps,
  normalizeFamilyStatus,
  outcomeClassForStatus,
  FAMILY_STATUS,
  BUDGET_AVAILABLE,
  BUDGET_EXHAUSTED,
  DEFAULT_DISCOVERY_BUDGET,
} from './budget.js';

let passed = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('budget.test.mjs');

ok('defaults silentExpansionForbidden', DEFAULT_DISCOVERY_BUDGET.silentExpansionForbidden === true);
ok('maxRetries default 0', DEFAULT_DISCOVERY_BUDGET.maxRetries === 0);
ok('family status taxonomy closed', FAMILY_STATUS.includes('budget_exhausted'));
ok('family status has empty', FAMILY_STATUS.includes('empty'));

// T-BUD-01: maxRequests=0 → no launch
{
  const ledger = createBudgetLedger({ maxRequests: 0, maxFamilyCalls: 8 });
  const gate = ledger.reserve({ requests: 1 });
  ok('T-BUD-01 reserve denied', gate.ok === false);
  ok('T-BUD-01 code BUDGET_EXHAUSTED', gate.code === BUDGET_EXHAUSTED);
  ok('T-BUD-01 reason maxRequests', gate.reason === 'maxRequests');
  ok('T-BUD-01 isExhausted', ledger.isExhausted() === true);
}

// T-BUD-02: empty → denyUnplannedFanout
{
  const ledger = createBudgetLedger({ maxRequests: 10 });
  const deny = ledger.denyUnplannedFanout('empty_no_fanout');
  ok('T-BUD-02 deny ok false', deny.ok === false);
  ok('T-BUD-02 fanout_guard_block', deny.code === 'fanout_guard_block');
  const snap = ledger.snapshot();
  ok(
    'T-BUD-02 journal empty_no_fanout',
    snap.journal.some((j) => j.event === 'fanout_guard_block' && j.reason === 'empty_no_fanout'),
  );
}

// T-BUD-04: maxRetries default 0 — soft-fail no retry
{
  const ledger = createBudgetLedger({ maxRetries: 0, maxRequests: 10 });
  ledger.reserve({ requests: 1 });
  const r = ledger.mayRetry({ status: 'error' });
  ok('T-BUD-04 error no retry', r.ok === false);
  const r2 = ledger.mayRetry({ status: 'rate_limited' });
  ok('T-BUD-04 rate_limited blocked by maxRetries=0', r2.ok === false);
}

// rate_limited retry when maxRetries=1 and budget remains
{
  const ledger = createBudgetLedger({ maxRetries: 1, maxRequests: 10, maxFamilyCalls: 8 });
  ledger.reserve({ requests: 1 });
  const r = ledger.mayRetry({ status: 'rate_limited' });
  ok('T-BUD-04b rate_limited retry allowed once', r.ok === true);
  const r2 = ledger.mayRetry({ status: 'rate_limited' });
  ok('T-BUD-04b second retry denied', r2.ok === false);
}

// T-BUD-06: maxPlanRevisions
{
  const ledger = createBudgetLedger({ maxPlanRevisions: 2 });
  ok('T-BUD-06 rev1', ledger.mayRevisePlan().ok === true);
  ok('T-BUD-06 rev2', ledger.mayRevisePlan().ok === true);
  ok('T-BUD-06 rev3 denied', ledger.mayRevisePlan().ok === false);
}

// T-BUD-08: distinct budget_exhausted status
ok('T-BUD-08 normalize budget_exhausted', normalizeFamilyStatus('budget_exhausted') === 'budget_exhausted');
ok('T-BUD-08 outcome class', outcomeClassForStatus('budget_exhausted') === 'BUDGET_EXHAUSTED');
ok('T-BUD-08 empty → EVIDENCE_UNAVAILABLE', outcomeClassForStatus('empty') === 'EVIDENCE_UNAVAILABLE');
ok('T-UNK-04 timeout ≠ CONTRADICTORY', outcomeClassForStatus('timeout') === 'SOURCE_TIMEOUT');

// Honest telemetry snapshot
{
  const ledger = createBudgetLedger({ maxRequests: 5, maxFamilyCalls: 3 });
  ledger.reserve({ providerId: 'wikidata', requests: 1, isNewProvider: true });
  const snap = ledger.snapshot();
  ok('telemetry availability', snap.availability === BUDGET_AVAILABLE);
  ok('telemetry used.requests', snap.used.requests === 1);
  ok('telemetry remaining.requests', snap.remaining.requests === 4);
  ok('caps force silentExpansionForbidden', createBudgetCaps({ silentExpansionForbidden: false }).silentExpansionForbidden === true);
}

// T-BUD-01 variant: familyCalls exhausted stops fanout
{
  const ledger = createBudgetLedger({ maxFamilyCalls: 1, maxRequests: 100 });
  ok('launch1', ledger.reserve({ requests: 1 }).ok === true);
  const g2 = ledger.reserve({ requests: 1 });
  ok('T-BUD-01b second launch denied', g2.ok === false);
  ok('T-BUD-01b reason maxFamilyCalls', g2.reason === 'maxFamilyCalls');
}

console.log(`budget.test.mjs: ${passed} passed`);
