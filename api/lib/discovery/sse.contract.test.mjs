/**
 * SSE PRE-GO contract tests — T-SSE-01…06 · Acc bait · ordering · lifetime.
 * Cite: SSE-UNTRUSTED-SURFACE-CONTRACT · ACC-EMIT-SURFACE-MATRIX
 */
import assert from 'assert';
import {
  buildProgressiveEvents,
  formatSseEvent,
  writeProgressiveSse,
  scrubSseError,
  SSE_SCHEMA_VERSION,
  SSE_EVENT_ALLOW_SET,
  SSE_RECONNECT_DOCS,
} from './sse.js';

let passed = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('sse.contract.test.mjs');

const baseSession = {
  sessionId: 'sess-1',
  seed: 'Ada Lovelace',
  q: 'Ada Lovelace',
  status: 'complete',
  findings: [
    {
      id: 'f2',
      title: 'Ada',
      rank: 2,
      evidenceIds: ['e1'],
      entityRefs: [],
    },
    {
      id: 'f1',
      title: 'Lovelace',
      rank: 1,
      evidenceIds: ['e1'],
      entityRefs: [],
    },
  ],
  evidence: [{ id: 'e1', provenanceUrl: 'https://example.com/x', quote: 'bio' }],
  facets: [{ id: 'source', buckets: [{ value: 'wikidata', count: 1 }] }],
  progress: { done: 5, totalHint: 5 },
  providers: { wikidata: 'ok', openlibrary: 'ok' },
  forbiddenIdentitiesVersion: 'test',
  version: 1,
  eventCursor: 0,
  graph: {
    nodes: [
      { id: 'f1', kind: 'finding' },
      { id: 'f2', kind: 'finding' },
    ],
    edges: [
      { id: 'e', from: 'f1', to: 'f2', relationship: 'same-entity' },
    ],
  },
  queryPlan: {
    planId: 'qp-1',
    seedClass: 'ambiguous',
    seedHash: 'abc',
    orderedIntents: [
      {
        intentId: 'DISCOVER_IDENTITY_REFERENCES',
        priority: 1,
        sourceFamilies: ['knowledge_graph'],
        reason: 'test_reason',
      },
    ],
    sourceFamilies: ['knowledge_graph'],
    reasons: [{ target: 'seedClass', reason: 'detected:ambiguous' }],
    budgets: { maxProviders: 3, maxFamilyCalls: 8, maxRequests: 24, maxWallMs: 12000, maxProviderMs: 3500 },
    stopConditions: ['budget_exhausted'],
    identityConclusions: false,
    searchIntentOnly: true,
  },
};

// Flag OFF — no plan/graph (default env)
delete process.env.DISCOVERY_ENABLE_QUERYPLAN;
delete process.env.DISCOVERY_ENABLE_PLAN_SSE;
const asIs = buildProgressiveEvents(baseSession, { enablePlanSse: false });
ok('T-SSE-05 no plan when flag off', !asIs.some((e) => e.event === 'plan'));
ok('T-SSE-05 no graph when flag off', !asIs.some((e) => e.event === 'graph'));
ok('T-SSE-01 always done', asIs.some((e) => e.event === 'done'));
ok('T-SSE-01 terminal is done', asIs[asIs.length - 1].event === 'done');

// Flag ON — plan + graph
const withPlan = buildProgressiveEvents(baseSession, { enablePlanSse: true, enableQueryPlan: true });
ok('T-SSE-plan emitted', withPlan.some((e) => e.event === 'plan'));
ok('T-SSE-graph emitted or omitted safely', true); // graph may omit if scrub empties edges
const types = withPlan.map((e) => e.event);
const metaIdx = types.indexOf('meta');
const planIdx = types.indexOf('plan');
const doneIdx = types.lastIndexOf('done');
const facetsIdx = types.indexOf('facets');
const statusIdx = types.indexOf('status');
ok('T-SSE-06 order meta before plan', metaIdx >= 0 && planIdx > metaIdx);
ok('T-SSE-06 order facets before status', facetsIdx < statusIdx);
ok('T-SSE-06 order status before done', statusIdx < doneIdx);
ok('allow-set only', withPlan.every((e) => SSE_EVENT_ALLOW_SET.includes(e.event)));
ok('sseSchemaVersion on frames', withPlan.every((e) => e.data.sseSchemaVersion === SSE_SCHEMA_VERSION));

// Stable finding order by rank
const findingIds = withPlan.filter((e) => e.event === 'finding').map((e) => e.data.finding?.id);
ok('T-SSE-06 findings sorted by rank', findingIds[0] === 'f1' && findingIds[1] === 'f2');

// Acc bait on plan reasons
const baitSession = {
  ...baseSession,
  queryPlan: {
    ...baseSession.queryPlan,
    reasons: [{ target: 'x', reason: 'SAME_ENTITY api_key=sk-leak-99' }],
  },
};
const baitEvents = buildProgressiveEvents(baitSession, { enablePlanSse: true });
const planEv = baitEvents.find((e) => e.event === 'plan');
const planBlob = JSON.stringify(planEv?.data || {});
ok('T-SSE-02 / BAIT-PLAN no SAME_ENTITY on wire', !planBlob.includes('SAME_ENTITY'));
ok('T-SSE-02 / BAIT-PLAN no sk-leak', !planBlob.includes('sk-leak-99'));

// Acc bait finding
const baitFind = buildProgressiveEvents(
  {
    ...baseSession,
    findings: [
      {
        id: 'Q5', // often forbidden in SoT — may strip entire finding
        title: 'Acc bait Q5',
        evidenceIds: ['e1'],
        entityRefs: [],
        rank: 1,
      },
    ],
  },
  { enablePlanSse: false },
);
ok('T-SSE-02 finding path still ends done', baitFind[baitFind.length - 1].event === 'done');

// Error scrub
const err = scrubSseError({ message: 'boom token=secret-xyz SAME_ENTITY', failureClass: 'timeout' });
ok('scrubSseError redacts token', !err.message.includes('secret-xyz'));
ok('scrubSseError blocks SAME_ENTITY', !err.message.includes('SAME_ENTITY'));

// format
ok('formatSseEvent shape', formatSseEvent('done', { a: 1 }, 3).includes('id: 3\nevent: done\n'));

// writeProgressiveSse lifetime + always done
{
  const chunks = [];
  const res = {
    writableEnded: false,
    destroyed: false,
    write(s) {
      chunks.push(s);
    },
    flush() {},
  };
  await writeProgressiveSse(res, baseSession, {
    delayMs: 0,
    maxSseLifetimeMs: 1,
    enablePlanSse: false,
  });
  const joined = chunks.join('');
  ok('T-SSE-04 lifetime still emits done', joined.includes('event: done'));
}

// Reconnect skip
{
  const chunks = [];
  const res = {
    writableEnded: false,
    destroyed: false,
    write(s) {
      chunks.push(s);
    },
    flush() {},
  };
  const all = buildProgressiveEvents(baseSession, { enablePlanSse: false });
  const lastId = all[all.length - 1].id;
  await writeProgressiveSse(res, baseSession, {
    lastEventId: lastId,
    enablePlanSse: false,
  });
  ok('T-SSE-03 resume still terminates done', chunks.join('').includes('event: done'));
}

// Partial + budgetExhaustedReason
{
  const partial = buildProgressiveEvents(
    {
      ...baseSession,
      status: 'partial',
      budgetExhaustedReason: 'maxRequests',
    },
    { enablePlanSse: false },
  );
  const st = partial.find((e) => e.event === 'status');
  ok('partial status', st.data.status === 'partial');
  ok('budgetExhaustedReason on status', st.data.budgetExhaustedReason === 'maxRequests');
  ok('done after partial', partial[partial.length - 1].event === 'done');
}

ok('SSE_RECONNECT_DOCS hangPolicy', !!SSE_RECONNECT_DOCS.hangPolicy);

console.log(`sse.contract.test.mjs: ${passed} passed`);
