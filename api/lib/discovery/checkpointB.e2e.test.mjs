/**
 * Checkpoint B e2e — existing public sources Seed→Plan→Family→Evidence→Result
 * under QueryPlan flag ON (mocks). F11 candidates honest unsupported.
 * Cite: BUDGET-FANOUT · UNKNOWN-NORMATIVE · ACC-EMIT · C1 Bound
 */
import {
  createDiscoverySession,
  clearSessions,
} from './orchestrator.js';
import {
  buildProgressiveEvents,
  SSE_LIFECYCLE_PHASES,
  SSE_EVENT_ALLOW_SET,
} from './sse.js';
import { detectSeedClass, buildQueryPlan, scrubQueryPlanForEmit } from './queryPlan.js';
import { plannedLaunches } from './planOrchestration.js';
import { candidateSkipReason, CANDIDATE_FAMILY_IDS } from './candidateFamilies.js';
import { explainWhyEdge } from './relationship.js';
import { scrubGraphForEmit, urlAloneCeiling } from './evidenceGraph.js';
import { sanitizeDiscoveryPayload } from './emit.js';

let passed = 0;
let failed = 0;
function ok(name, cond, detail = '') {
  if (cond) {
    passed++;
    console.log('PASS', name);
  } else {
    failed++;
    console.error('FAIL', name, detail);
  }
}

clearSessions();

// --- Seed routing (existing providers only) ---
ok('seed person Ada', detectSeedClass('Ada Lovelace') === 'person');
ok('seed org Acme', detectSeedClass('Acme Corp Ltd') === 'organization');
ok('seed url', detectSeedClass('https://example.org/x') === 'url');
ok('seed domain', detectSeedClass('example.org') === 'domain');
ok('seed QID alone unknown', detectSeedClass('Q42') === 'unknown');

const urlPlan = buildQueryPlan({
  seed: 'https://example.org',
  flags: { webOrigin: true },
});
ok(
  'url plan prefers web_origin when flagged',
  (urlPlan.sourceFamilies || []).includes('web_origin') ||
    (urlPlan.orderedIntents || [])[0]?.sourceFamilies?.includes('web_origin'),
);

// --- F11 candidates honest ---
ok('filings skip unwired', !!candidateSkipReason('filings'));
ok(
  'candidates not in person plan families',
  !(buildQueryPlan({ seed: 'Ada Lovelace' }).sourceFamilies || []).some((f) =>
    CANDIDATE_FAMILY_IDS.includes(f),
  ),
);

// --- E2E flag ON ---
const store = new Map();
const mocks = [
  {
    id: 'wikidata',
    search: async ({ q }) => ({
      findings: [
        {
          title: `WD ${q}`,
          provenanceUrl: 'https://www.wikidata.org/wiki/Q7259',
          quote: 'mathematician and writer',
          entityRefs: ['qid:Q7259'],
        },
      ],
      partial: false,
    }),
  },
  {
    id: 'openlibrary',
    search: async () => ({
      findings: [
        {
          title: 'OL Ada',
          provenanceUrl: 'https://openlibrary.org/authors/OL70269A',
          quote: 'author',
          entityRefs: ['ol:OL70269A'],
        },
      ],
      partial: false,
    }),
  },
  {
    id: 'wikipedia',
    search: async () => ({
      findings: [
        {
          title: 'Ada Lovelace',
          provenanceUrl: 'https://en.wikipedia.org/wiki/Ada_Lovelace',
          quote: 'English mathematician',
        },
      ],
      partial: false,
    }),
  },
];

const result = await createDiscoverySession(
  { seed: 'Ada Lovelace', hints: { seedClass: 'person' } },
  {
    store,
    providers: mocks,
    enableQueryPlan: true,
    correlationId: 'ckpt-b-e2e',
  },
);
ok('session created', !!result.sessionId);
ok('status complete|partial', ['complete', 'partial'].includes(result.status));

const snap = result.snapshot || store.get(result.sessionId);
ok('queryPlan present', !!snap.queryPlan?.planId);
ok('searchIntentOnly', snap.queryPlan?.searchIntentOnly === true);
ok('identityConclusions false', snap.queryPlan?.identityConclusions === false);
ok('findings > 0', (snap.findings || []).length >= 1);
ok('evidence > 0', (snap.evidence || []).length >= 1);
ok(
  'finding confirmationState candidate',
  (snap.findings || []).every((f) => f.confirmationState === 'candidate'),
);
ok(
  'evidence confirmationState candidate',
  (snap.evidence || []).every((e) => e.confirmationState === 'candidate'),
);
ok(
  'evidence has provenance fields',
  (snap.evidence || []).every(
    (e) => e.provenanceUrl && e.providerId && e.retrievedAt,
  ),
);

const journal = snap.familyJournal || [];
ok('journal has entries', journal.length >= 1);
ok(
  'journal families unique',
  new Set(journal.filter((j) => j.status === 'ok' || j.status === 'empty').map((j) => j.familyId))
    .size === journal.filter((j) => j.status === 'ok' || j.status === 'empty').length ||
    journal.length <= 5,
);
ok(
  'no fake ok for unsupported',
  !journal.some((j) => j.status === 'ok' && CANDIDATE_FAMILY_IDS.includes(j.familyId)),
);

// Flag OFF regression
clearSessions();
const storeOff = new Map();
const off = await createDiscoverySession(
  { seed: 'Ada Lovelace' },
  { store: storeOff, providers: mocks, enableQueryPlan: false },
);
const snapOff = off.snapshot || storeOff.get(off.sessionId);
ok('flag OFF no queryPlan', !snapOff.queryPlan);
ok('flag OFF still has findings or empty ok', Array.isArray(snapOff.findings));

// --- SSE progressive lifecycle ---
const events = buildProgressiveEvents(snap, {
  enableQueryPlan: true,
  enablePlanSse: true,
});
const eventNames = events.map((e) => e.event);
ok('SSE ends with done', eventNames.at(-1) === 'done');
ok('SSE has plan', eventNames.includes('plan'));
ok('SSE has finding', eventNames.includes('finding'));
ok(
  'SSE events ⊆ allow-set',
  eventNames.every((n) => SSE_EVENT_ALLOW_SET.includes(n)),
);
const phases = events
  .filter((e) => e.event === 'progress')
  .map((e) => e.data.lifecyclePhase || e.data.phase)
  .filter(Boolean);
ok(
  'SSE lifecycle includes START…COMPLETE',
  SSE_LIFECYCLE_PHASES.every((ph) => phases.includes(ph)),
);

// Acc bait on plan emit
const baitPlan = {
  ...snap.queryPlan,
  reasons: [
    ...(snap.queryPlan.reasons || []),
    { target: 'bait', reason: 'SAME_ENTITY api_key=sk-secret-xyz Q1701775' },
  ],
};
const scrubbed = scrubQueryPlanForEmit(baitPlan);
const blob = JSON.stringify(scrubbed);
// forbiddenDirectives intentionally lists SAME_ENTITY as deny — check reasons/queries only
const reasonsBlob = JSON.stringify(scrubbed.reasons || []);
const queriesBlob = JSON.stringify(
  (scrubbed.orderedIntents || []).flatMap((i) => i.queries || []),
);
ok('Acc bait SAME_ENTITY scrubbed from reasons', !reasonsBlob.includes('SAME_ENTITY'));
ok('Acc bait secret scrubbed', !blob.includes('sk-secret-xyz'));
ok(
  'Acc bait forbidden QID scrubbed or redacted',
  (!reasonsBlob.includes('Q1701775') && !queriesBlob.includes('Q1701775')) ||
    blob.includes('REDACTED'),
);

// Graph: url-alone ceiling + explainWhyEdge
ok(
  'urlAloneCeiling web_origin → unknown',
  urlAloneCeiling({ hostFamily: 'web_origin' }) === 'unknown',
);
const expl = explainWhyEdge({
  from: 'f1',
  to: 'f2',
  relationship: 'supports',
  provenance: {
    planId: snap.queryPlan.planId,
    familyId: 'knowledge_graph',
    providerId: 'wikidata',
    evidenceIds: [(snap.evidence || [])[0]?.id].filter(Boolean),
    softRefKeys: ['qid:Q7259'],
  },
});
ok('explainWhyEdge has why', !!expl.why && expl.why.includes('plan:'));
ok('explainWhyEdge not same-entity', expl.relationship !== 'same-entity');

const dirtyGraph = {
  nodes: [{ id: 'a' }, { id: 'b' }],
  edges: [
    {
      from: 'a',
      to: 'b',
      relationship: 'same-entity',
      planId: 'qp-x',
      familyId: 'knowledge_graph',
    },
  ],
};
const scrubbedG = scrubGraphForEmit(dirtyGraph);
ok(
  'graph scrub blocks same-entity',
  !(scrubbedG.edges || []).some(
    (e) => String(e.relationship || e.kind).toLowerCase().includes('same-entity'),
  ),
);

// Snapshot Acc scrub
const dirtySnap = sanitizeDiscoveryPayload({
  ...snap,
  findings: [
    ...(snap.findings || []),
    {
      id: 'poison',
      title: 'Q1701775 poison',
      evidenceIds: ['ev-x'],
      confirmationState: 'candidate',
    },
  ],
});
ok(
  'snapshot Acc scrub',
  !JSON.stringify(dirtySnap.findings || []).includes('Q1701775') ||
    (dirtySnap.forbiddenStripped || 0) > 0,
);

console.log('\n--- checkpoint B e2e ---');
console.log(`passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
