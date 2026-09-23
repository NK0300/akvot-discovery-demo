/**
 * Checkpoint D — Progressive SSE matrix
 * Terminal done always · lifecycle · budget/cancel · Acc graph bait · flag OFF
 */
import { buildProgressiveEvents, SSE_LIFECYCLE_PHASES, SSE_EVENT_ALLOW_SET } from './sse.js';
import { scrubGraphForEmit } from './evidenceGraph.js';
import { scrubQueryPlanForEmit } from './queryPlan.js';

let passed = 0;
let failed = 0;
function ok(name, cond) {
  if (cond) {
    passed++;
    console.log('PASS', name);
  } else {
    failed++;
    console.error('FAIL', name);
  }
}

function baseSession(over = {}) {
  return {
    sessionId: 'sse-d-1',
    seed: 'Ada Lovelace',
    status: 'complete',
    stage: 'S10',
    version: 1,
    progress: { done: 3, totalHint: 3 },
    providers: { wikidata: 'ok', wikipedia: 'ok' },
    findings: [
      {
        id: 'f1',
        title: 'Ada',
        evidenceIds: ['ev1'],
        confirmationState: 'candidate',
        rank: 1,
      },
    ],
    evidence: [
      {
        id: 'ev1',
        provenanceUrl: 'https://www.wikidata.org/wiki/Q7259',
        providerId: 'wikidata',
        confirmationState: 'candidate',
        retrievedAt: new Date().toISOString(),
      },
    ],
    facets: [],
    queryPlan: {
      planId: 'qp-test',
      seedClass: 'person',
      sourceFamilies: ['knowledge_graph'],
      orderedIntents: [],
      reasons: [{ target: 'seed', reason: 'person_route' }],
      searchIntentOnly: true,
      identityConclusions: false,
      budgets: { maxFamilyCalls: 3 },
    },
    graph: {
      nodes: [{ id: 'f1', kind: 'finding' }],
      edges: [
        {
          from: 'seed',
          to: 'f1',
          relationship: 'supports',
          planId: 'qp-test',
          familyId: 'knowledge_graph',
          candidateState: 'candidate',
        },
      ],
    },
    ...over,
  };
}

// Lifecycle
const ev = buildProgressiveEvents(baseSession(), {
  enableQueryPlan: true,
  enablePlanSse: true,
});
ok('terminal done', ev.at(-1)?.event === 'done');
ok('allow-set', ev.every((e) => SSE_EVENT_ALLOW_SET.includes(e.event)));
const phases = ev
  .filter((e) => e.event === 'progress')
  .map((e) => e.data.lifecyclePhase || e.data.phase);
ok(
  'all lifecycle phases',
  SSE_LIFECYCLE_PHASES.every((p) => phases.includes(p)),
);
ok('has plan', ev.some((e) => e.event === 'plan'));
ok('has finding', ev.some((e) => e.event === 'finding'));
ok('has graph', ev.some((e) => e.event === 'graph'));

// Flag OFF — no plan/graph
const off = buildProgressiveEvents(baseSession(), { enableQueryPlan: false, enablePlanSse: false });
ok('flag OFF no plan', !off.some((e) => e.event === 'plan'));
ok('flag OFF no graph', !off.some((e) => e.event === 'graph'));
ok('flag OFF still done', off.at(-1)?.event === 'done');

// Budget exhausted → partial + done
const bud = buildProgressiveEvents(
  baseSession({
    status: 'partial',
    budgetExhaustedReason: 'max_family_calls',
    budgetTelemetry: { budgetExhaustedReason: 'max_family_calls' },
  }),
  { enableQueryPlan: true, enablePlanSse: true },
);
ok('budget path done', bud.at(-1)?.event === 'done');
ok(
  'budget reason on status or done',
  bud.some(
    (e) =>
      (e.event === 'status' || e.event === 'done') &&
      e.data.budgetExhaustedReason === 'max_family_calls',
  ),
);

// Cancelled → done
const can = buildProgressiveEvents(baseSession({ status: 'cancelled' }), {
  enableQueryPlan: true,
});
ok('cancel done', can.at(-1)?.event === 'done');
ok('cancel status', can.some((e) => e.event === 'status' && e.data.status === 'cancelled'));

// Acc graph bait — same-entity blocked
const scrubbed = scrubGraphForEmit({
  nodes: [{ id: 'a' }, { id: 'b' }],
  edges: [{ from: 'a', to: 'b', relationship: 'same-entity', planId: 'qp' }],
});
ok(
  'graph Acc blocks same-entity',
  !(scrubbed.edges || []).some((e) =>
    String(e.relationship || '').toLowerCase().includes('same-entity'),
  ),
);

// Acc plan bait
const planScrub = scrubQueryPlanForEmit({
  planId: 'qp',
  seedClass: 'person',
  orderedIntents: [],
  sourceFamilies: [],
  reasons: [{ target: 'x', reason: 'SAME_ENTITY password=sekrit' }],
  forbiddenDirectives: ['SAME_ENTITY'],
  searchIntentOnly: true,
  identityConclusions: false,
  dedupeRules: { titleBridgeForbidden: true, typedSoftRefAttachOnly: true },
  budgets: { silentExpansionForbidden: true },
});
ok(
  'plan Acc redacts bait reason',
  !JSON.stringify(planScrub.reasons || []).includes('SAME_ENTITY') &&
    !JSON.stringify(planScrub).includes('sekrit'),
);

// Resume cursor monotonic
ok(
  'ids monotonic',
  ev.every((e, i) => i === 0 || e.id > ev[i - 1].id),
);

console.log('\n--- checkpoint D sse ---');
console.log(`passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
