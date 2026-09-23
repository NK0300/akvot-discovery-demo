/**
 * QueryPlan PRE-GO contract tests — T-UNK / DOR QueryPlan rows / Acc plan scrub.
 * Cite: UNKNOWN-NORMATIVE · ACC-EMIT-SURFACE-MATRIX · SoT 02
 */
import assert from 'assert';
import {
  buildQueryPlan,
  validateQueryPlan,
  scrubQueryPlanForEmit,
  planSummaryForSse,
  detectSeedClass,
  seedHashOf,
  FORBIDDEN_PLAN_DIRECTIVES,
  SEED_CLASSES,
  INTENT_IDS,
} from './queryPlan.js';

let passed = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('queryPlan.test.mjs');

// Determinism: same inputs → same planId / hash
const a = buildQueryPlan({ seed: 'Ada Lovelace', flags: { viaf: false, webOrigin: false } });
const b = buildQueryPlan({ seed: 'Ada Lovelace', flags: { viaf: false, webOrigin: false } });
ok('T-QP-DET-01 same planId', a.planId === b.planId);
ok('T-QP-DET-02 same inputSnapshotHash', a.planInputSnapshotHash === b.planInputSnapshotHash);
ok('T-QP-DET-03 orderedIntents stable', JSON.stringify(a.orderedIntents) === JSON.stringify(b.orderedIntents));

// reasons non-empty
ok('T-QP-REASON-01 reasons non-empty', Array.isArray(a.reasons) && a.reasons.length > 0);
ok('T-QP-REASON-02 each intent has reason', a.orderedIntents.every((i) => i.reason && i.reason.trim()));

// validate
const v = validateQueryPlan(a);
ok('T-QP-VAL-01 valid plan ok', v.ok === true);

// Forbidden identity directives
ok('T-QP-ID-01 forbiddenDirectives listed', FORBIDDEN_PLAN_DIRECTIVES.includes('SAME_ENTITY'));
ok('T-QP-ID-02 identityConclusions false', a.identityConclusions === false);
ok('T-QP-ID-03 searchIntentOnly', a.searchIntentOnly === true);
ok('T-QP-ID-04 titleBridgeForbidden', a.dedupeRules.titleBridgeForbidden === true);
ok('T-QP-ID-05 no SAME_ENTITY from URL seed', (() => {
  const p = buildQueryPlan({ seed: 'https://example.com/x', flags: { webOrigin: true } });
  const blob = JSON.stringify(p.reasons) + JSON.stringify(p.orderedIntents.map((i) => i.reason));
  return !blob.includes('SAME_ENTITY') && !blob.includes('SAME-ENTITY');
})());

// seedClass
ok('T-QP-SEED-01 url class', detectSeedClass('https://example.org') === 'url');
ok('T-QP-SEED-02 domain class', detectSeedClass('example.org') === 'domain');
ok('T-QP-SEED-03 org class', detectSeedClass('Acme Foundation') === 'organization');
ok('T-QP-SEED-04 person-ish routes as person (intent not identity)', detectSeedClass('Ada Lovelace') === 'person');
ok('T-QP-SEED-05 hint wins', detectSeedClass('Ada Lovelace', { seedClass: 'person' }) === 'person');
ok('T-QP-SEED-06 enum closed', SEED_CLASSES.every((c) => typeof c === 'string'));

// URL targets classified — never SAME from url
const urlPlan = buildQueryPlan({
  seed: 'https://example.com',
  flags: { webOrigin: true },
});
ok('T-QP-URL-01 seedClass url', urlPlan.seedClass === 'url');
ok('T-QP-URL-02 has web_origin family when flagged', urlPlan.sourceFamilies.includes('web_origin'));
ok('T-UNK-05 no identity in plan', urlPlan.identityConclusions === false);

// SSRF-ish urlTargets marked unsafe/blocked — no fetch here
const badPlan = buildQueryPlan({
  seed: 'https://169.254.169.254/latest/meta-data/',
  flags: { webOrigin: true },
});
ok(
  'T-ACC-03 urlTarget not allowed for link-local',
  badPlan.urlTargets.length === 0 || badPlan.urlTargets.every((u) => u.safety !== 'allowed'),
);

// Acc scrub — bait in reasons
const bait = buildQueryPlan({ seed: 'Test Entity', flags: {} });
bait.reasons.push({ target: 'bait', reason: 'SAME_ENTITY commit Q999999999 api_key=sk-secret-abc' });
const scrubbed = scrubQueryPlanForEmit(bait);
ok('BAIT-PLAN-01 SAME_ENTITY scrubbed', !JSON.stringify(scrubbed.reasons).includes('SAME_ENTITY'));
ok('BAIT-PLAN-02 credential scrubbed', !JSON.stringify(scrubbed).includes('sk-secret-abc'));
ok('BAIT-PLAN-02 redacted marker', JSON.stringify(scrubbed).includes('[REDACTED]') || JSON.stringify(scrubbed).includes('[BLOCKED_DIRECTIVE]'));

// SSE summary ⊆ allow-set
const summary = planSummaryForSse(a);
ok('T-SSE-plan summary has planId', !!summary.planId);
ok('T-SSE-plan summary has seedClass', !!summary.seedClass);
ok('T-SSE-plan no credentials field', !('credentials' in summary));

// Intent ids closed
ok('T-QP-INTENT closed set', a.orderedIntents.every((i) => INTENT_IDS.includes(i.intentId)));

// seedHash opaque
ok('T-QP-HASH opaque length', seedHashOf('x').length === 16);

// silentExpansionForbidden
ok('T-BUD-plan silentExpansionForbidden', a.budgets.silentExpansionForbidden === true);

// validate rejects identity conclusions
const bad = { ...a, identityConclusions: true };
ok('T-QP-VAL-02 reject identityConclusions', validateQueryPlan(bad).ok === false);

// validate rejects empty reasons
const bad2 = { ...a, reasons: [] };
ok('T-QP-VAL-03 reject empty reasons', validateQueryPlan(bad2).ok === false);

console.log(`queryPlan.test.mjs: ${passed} passed`);
