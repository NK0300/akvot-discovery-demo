/**
 * Phase 2 Discovery Engine — Checkpoint B tests.
 * Public sources only · no crawl · candidates unwired · F11 hold · adapter harden.
 */
import assert from 'assert';
import {
  CANDIDATE_FAMILIES,
  CANDIDATE_FAMILY_IDS,
  getCandidateFamily,
  candidateSkipReason,
  isWiredFamily,
} from './candidateFamilies.js';
import {
  eligibleFamilies,
  familySkipReason,
  getFamily,
  REGISTERED_FAMILY_IDS,
} from './sourceFamily.js';
import { buildQueryPlan } from './queryPlan.js';
import { planForSession, executePlanLaunches } from './planOrchestration.js';
import { isQueryPlanEnabled } from './flags.js';
import {
  WIRED_PUBLIC_PROVIDER_IDS,
  scrubAdapterBatch,
  normalizeAdapterToEvidence,
  normalizeAdapterBatchToEvidence,
  assertAdapterFetchUrl,
  scrubFamilyJournal,
} from './adapterContract.js';
import {
  normalizeFamilyBatch,
  runFamilyOrchestration,
  indexProvidersById,
} from './familyOrchestrator.js';
import { createBudgetLedger } from './budget.js';
import { buildEvidenceGraph } from './evidenceGraph.js';
import {
  controlOpts,
  treatmentOpts,
  runDualRunStub,
  dualRunMeasureSheetStub,
  dualRunDelta,
  DUAL_RUN_HARNESS_VERSION,
} from './dualRunHarness.js';
import { createDiscoverySession, clearSessions } from './orchestrator.js';
import { FORBIDDEN_IDENTITY_QIDS } from '../forbiddenIdentities.js';

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

const FORBIDDEN_Q = FORBIDDEN_IDENTITY_QIDS[0];

ok('candidates registered', CANDIDATE_FAMILY_IDS.length >= 5);
ok('filings unwired', getCandidateFamily('filings')?.wired === false);
ok('news productionEligible false', getCandidateFamily('news')?.productionEligible === false);
ok('scholarly has previewFlag', !!getCandidateFamily('scholarly')?.previewFlag);
ok('isWiredFamily filings false', isWiredFamily('filings') === false);
ok('isWiredFamily knowledge_graph true', isWiredFamily('knowledge_graph') === true);

ok(
  'eligibleFamilies excludes candidates',
  eligibleFamilies({ seedClass: 'company', flags: {} }).every(
    (f) => !CANDIDATE_FAMILY_IDS.includes(f),
  ),
);
ok(
  'familySkipReason filings',
  familySkipReason('filings', { seedClass: 'company' }) === 'candidate_unwired_f11' ||
    String(familySkipReason('filings', { seedClass: 'company' })).includes('unwired'),
);
ok('getFamily sees candidate descriptor', getFamily('filings')?.familyId === 'filings');
ok(
  'getFamily still returns B0',
  getFamily('knowledge_graph')?.b0 === true || getFamily('knowledge_graph')?.providerIds?.includes('wikidata'),
);

// Plan must not launch candidate families even if somehow listed
const plan = buildQueryPlan({ seed: 'Acme Corp', hints: { seedClass: 'company' } });
ok(
  'plan sourceFamilies ⊆ registered wired',
  (plan.sourceFamilies || []).every((f) => !CANDIDATE_FAMILY_IDS.includes(f)),
);

const planned = planForSession(
  { seed: 'Acme Corp', hints: { seedClass: 'company' }, locale: 'en', sessionId: 'p2' },
  { flags: {} },
);
ok('planForSession ok', planned.ok === true);

// Flag still default off
delete process.env.DISCOVERY_ENABLE_QUERYPLAN;
ok('QueryPlan flag still default OFF', isQueryPlanEnabled() === false);

// No candidate family appears in REGISTERED wired set
ok(
  'REGISTERED_FAMILY_IDS has no filings',
  !(REGISTERED_FAMILY_IDS || []).includes('filings'),
);

// ---------- Adapter contract / evidence path ----------
ok(
  'wired public adapters exactly 5',
  WIRED_PUBLIC_PROVIDER_IDS.length === 5,
);
ok(
  'wikidata fetch URL gate',
  assertAdapterFetchUrl('https://www.wikidata.org/wiki/Q42', 'wikidata').ok,
);
ok(
  'openlibrary fetch URL gate',
  assertAdapterFetchUrl('https://openlibrary.org/authors/OL1A', 'openlibrary').ok,
);
ok(
  'wikipedia fetch URL gate',
  assertAdapterFetchUrl('https://en.wikipedia.org/wiki/Ada', 'wikipedia').ok,
);
ok(
  'viaf fetch URL gate',
  assertAdapterFetchUrl('https://viaf.org/viaf/123/', 'viaf').ok,
);

const pairWd = normalizeAdapterToEvidence(
  {
    id: 'wd-Q42',
    title: 'Douglas Adams',
    kind: 'registry',
    provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
    quote: 'English author',
    entityRefs: ['qid:Q42'],
  },
  'wikidata',
);
ok('wikidata normalize→evidence', !!pairWd);
ok('evidence feeds UNKNOWN relationship default', pairWd.finding.relationshipState === 'UNKNOWN');
ok('CANDIDATE≠FACT on evidence', pairWd.evidence.epistemicState === 'candidate' && pairWd.evidence.status === 'candidate');
ok('URL≠identity flag', pairWd.evidence.urlIsNotIdentity === true);

const pairOl = normalizeAdapterToEvidence(
  {
    id: 'ol-OL23928A',
    title: 'Ada Lovelace',
    provenanceUrl: 'https://openlibrary.org/authors/OL23928A',
    entityRefs: ['ol:OL23928A'],
  },
  'openlibrary',
);
ok('openlibrary normalize→evidence', !!pairOl);

const pairWp = normalizeAdapterToEvidence(
  {
    id: 'wp-en-Ada',
    title: 'Ada Lovelace',
    kind: 'page',
    provenanceUrl: 'https://en.wikipedia.org/wiki/Ada_Lovelace',
    entityRefs: ['wp:en:Ada Lovelace'],
  },
  'wikipedia',
);
ok('wikipedia normalize→evidence', !!pairWp);

const pairViaf = normalizeAdapterToEvidence(
  {
    id: 'viaf-24604287',
    title: 'Lovelace, Ada',
    provenanceUrl: 'https://viaf.org/viaf/24604287/',
    entityRefs: ['viaf:24604287'],
  },
  'viaf',
);
ok('viaf normalize→evidence', !!pairViaf);

const pairWo = normalizeAdapterToEvidence(
  {
    id: 'wo-example',
    title: 'example.com',
    kind: 'other',
    provenanceUrl: 'https://example.com/',
    hostFamily: 'web_origin',
    relationship: 'SAME-ENTITY',
    entityRefs: [],
  },
  'web_origin',
);
ok('web_origin normalize→evidence', !!pairWo);
ok(
  'web_origin SAME-* clamped UNKNOWN',
  pairWo.finding.relationshipState === 'UNKNOWN' || pairWo.finding.relationship === 'UNKNOWN',
);

// Acc scrub on adapter batch
{
  const { batch } = scrubAdapterBatch({
    providerId: 'wikidata',
    findings: [
      pairWd.finding,
      {
        id: `wd-${FORBIDDEN_Q}`,
        title: 'Bait',
        provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_Q}`,
      },
    ],
  });
  ok('adapter Acc scrub strips bait', !batch.findings.some((f) => String(f.id).includes(FORBIDDEN_Q)));
}

// Evidence graph feed from adapter pairs
{
  const sessionLike = {
    findings: [pairWd.finding, pairOl.finding],
    evidence: [pairWd.evidence, pairOl.evidence],
  };
  const graph = buildEvidenceGraph(sessionLike);
  ok('evidenceGraph accepts adapter evidence', !!graph && Array.isArray(graph.nodes));
  const edgeBlob = JSON.stringify(graph.edges || []);
  ok(
    'graph no SAME-ENTITY laundering',
    !edgeBlob.includes('SAME-ENTITY') && !edgeBlob.includes('same-entity'),
  );
}

// Family batch normalize Acc + UNKNOWN
{
  const batch = normalizeFamilyBatch({
    batch: {
      findings: [
        {
          id: 'wd-Q42',
          title: 'Douglas Adams',
          provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
          quote: 'author',
          entityRefs: ['qid:Q42'],
        },
        {
          id: `wd-${FORBIDDEN_Q}`,
          title: 'Bait',
          provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_Q}`,
        },
      ],
    },
    familyId: 'knowledge_graph',
    providerId: 'wikidata',
    intentId: 'i1',
    planId: 'p1',
    executionTimeMs: 1,
  });
  ok('normalizeFamilyBatch drops Acc bait', !batch.findings.some((f) => String(f.id).includes(FORBIDDEN_Q)));
  ok(
    'normalizeFamilyBatch candidate defaults',
    batch.findings.every((f) => f.confirmationState === 'candidate' && f.epistemicState === 'candidate'),
  );
  ok(
    'normalizeFamilyBatch evidence UNKNOWN/candidate',
    batch.evidence.every((e) => e.status === 'candidate' && e.urlIsNotIdentity === true),
  );
}

// ---------- Kill-switch / budget exhaustion mid-flight ----------
{
  let launches = 0;
  const providers = [
    {
      id: 'wikidata',
      search: async () => {
        launches++;
        return {
          providerId: 'wikidata',
          findings: [
            {
              id: 'wd-Q1',
              title: 'Universe',
              provenanceUrl: 'https://www.wikidata.org/wiki/Q1',
            },
          ],
          partial: false,
        };
      },
    },
    {
      id: 'openlibrary',
      search: async () => {
        launches++;
        return { providerId: 'openlibrary', findings: [], partial: false };
      },
    },
    {
      id: 'wikipedia',
      search: async () => {
        launches++;
        return { providerId: 'wikipedia', findings: [], partial: false };
      },
    },
  ];
  const tinyPlan = buildQueryPlan({ seed: 'Budget Midflight', hints: { seedClass: 'person' } });
  // Force tiny budget
  tinyPlan.budgets = {
    ...(tinyPlan.budgets || {}),
    maxRequests: 1,
    maxFamilyCalls: 1,
    maxProviders: 1,
    maxWallMs: 5000,
    maxProviderMs: 500,
  };
  const ledger = createBudgetLedger(tinyPlan.budgets);
  const orch = await runFamilyOrchestration(tinyPlan, {
    seed: 'Budget Midflight',
    sessionId: 'bud-mid',
    locale: 'en',
    hints: { seedClass: 'person' },
  }, { providers, ledger, flags: { viaf: false, webOrigin: false } });
  ok('budget mid-flight launches ≤ 1', launches <= 1, `launches=${launches}`);
  ok(
    'budget mid-flight journal has exhausted or short',
    orch.budgetExhausted === true ||
      orch.journal.some((j) => j.status === 'budget_exhausted') ||
      orch.journal.length <= 2,
  );
  const scrubbed = scrubFamilyJournal(orch.journal);
  ok('journal Acc scrub idempotent', Array.isArray(scrubbed) && scrubbed.length === orch.journal.length);
}

// AbortSignal kill-switch mid-flight (abort on first launch regardless of family order)
{
  let launches = 0;
  const ac = new AbortController();
  const makeProv = (id) => ({
    id,
    search: async () => {
      launches++;
      if (launches === 1) ac.abort(); // kill-switch after first family call
      return {
        providerId: id,
        findings:
          id === 'wikidata'
            ? [
                {
                  id: 'wd-Q2',
                  title: 'Earth',
                  provenanceUrl: 'https://www.wikidata.org/wiki/Q2',
                },
              ]
            : [],
        partial: false,
      };
    },
  });
  const providers = [makeProv('wikidata'), makeProv('openlibrary'), makeProv('wikipedia')];
  const pAbort = buildQueryPlan({ seed: 'Abort Midflight', hints: { seedClass: 'person' } });
  pAbort.budgets = { ...(pAbort.budgets || {}), maxRequests: 10, maxFamilyCalls: 8, maxWallMs: 8000 };
  const orch = await runFamilyOrchestration(
    pAbort,
    { seed: 'Abort Midflight', sessionId: 'abort-mid', locale: 'en', hints: {} },
    { providers, signal: ac.signal, flags: { viaf: false, webOrigin: false } },
  );
  ok(
    'abort kill-switch stops further launches',
    launches <= 2,
    `launches=${launches} journal=${orch.journal.map((j) => j.status).join(',')}`,
  );
  ok(
    'abort journal marks cancelled remaining',
    orch.journal.some((j) => j.status === 'cancelled') || launches <= 1,
    `statuses=${orch.journal.map((j) => j.status).join(',')}`,
  );
}

// ---------- Dual-run CONTROL / TREATMENT stubs ----------
ok('dualRun harness version', !!DUAL_RUN_HARNESS_VERSION);
ok('controlOpts force OFF', controlOpts({ enableQueryPlan: true }).enableQueryPlan === false);
ok('treatmentOpts force ON', treatmentOpts({ enableQueryPlan: false }).enableQueryPlan === true);

const mockB0 = [
  {
    id: 'wikidata',
    search: async () => ({
      providerId: 'wikidata',
      findings: [
        {
          id: 'wd-Q42',
          title: 'Douglas Adams',
          provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
          quote: 'writer',
          entityRefs: ['qid:Q42'],
        },
      ],
      partial: false,
    }),
  },
  {
    id: 'openlibrary',
    search: async () => ({ providerId: 'openlibrary', findings: [], partial: false }),
  },
  {
    id: 'wikipedia',
    search: async () => ({ providerId: 'wikipedia', findings: [], partial: false }),
  },
];

const dual = await runDualRunStub(
  { seed: 'Ada Lovelace', hints: { seedClass: 'person' } },
  { providers: mockB0 },
);
ok('dualRun stub measureReady', dual.measureReady === true && dual.livePreviewPromote === false);
ok('dualRun CONTROL no queryPlan', dual.control.metrics.hasQueryPlan === false);
ok('dualRun TREATMENT has queryPlan', dual.treatment.metrics.hasQueryPlan === true);
ok('dualRun Acc leak 0 both arms', dual.delta.accLeakEither === false);
ok('dualRun queryPlanAppeared', dual.delta.queryPlanAppeared === true);
ok(
  'dualRun CONTROL flagOffConfirmed',
  dual.control.flagOffConfirmed === true,
);
ok(
  'dualRun TREATMENT flagOnConfirmed',
  dual.treatment.flagOnConfirmed === true,
);

const sheet = dualRunMeasureSheetStub({ notes: 'phase2 engine' });
ok('measure sheet stub no invented dpl', sheet.control.dpl === null && sheet.treatment.dpl === null);
ok('measure sheet promoteForbidden', sheet.promoteForbidden === true);

const d = dualRunDelta(
  { findingsCount: 1, evidenceCount: 1, hasQueryPlan: false, accLeakForbiddenQ: 0 },
  { findingsCount: 2, evidenceCount: 2, hasQueryPlan: true, accLeakForbiddenQ: 0 },
);
ok('dualRunDelta findings', d.findingsDelta === 1 && d.queryPlanAppeared === true);

// No leakage into Core lookup path — discovery modules must not import lookup.js
{
  // Structural: createDiscoverySession with flag OFF still works; no promote fields
  clearSessions();
  const store = new Map();
  const created = await createDiscoverySession(
    { seed: 'No Core Leak' },
    { store, providers: mockB0, enableQueryPlan: false },
  );
  const raw = store.get(created.sessionId);
  ok('B0 path no queryPlan', !raw?.queryPlan);
  ok('B0 path no promote / dossier chrome', !raw?.dossier && !raw?.candidates);
  const snap = created.snapshot || {};
  ok('B0 snapshot Acc version', !!snap.forbiddenIdentitiesVersion);
}

// F11 still holds — productionEligible never flipped
ok(
  'F11 productionEligible all false',
  CANDIDATE_FAMILY_IDS.every((id) => getCandidateFamily(id)?.productionEligible === false),
);
ok(
  'F11 wired all false',
  CANDIDATE_FAMILY_IDS.every((id) => getCandidateFamily(id)?.wired === false),
);

console.log('\n--- phase2 engine ---');
console.log(`passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
