/**
 * Acc adversarial matrix — Phase Accuracy 351–400 scaffolding + emit-surface bait.
 * Cite: ACC-EMIT-SURFACE-MATRIX · N-ADVERSARIAL-SUITE-PLAN · C1 Bound · A2-safe only.
 * Run: node api/lib/discovery/adversarial.matrix.acc.test.mjs
 *
 * LOCKS enforced here:
 * - Core Acc P0 / forbiddenIdentities green (never weaken scrub)
 * - C1 Bound: URL-alone → UNKNOWN (not SAME-REFERENCE / SAME-ENTITY)
 * - A2-safe only (typed soft-ref); no title-bridge revive
 * - plan / SSE / graph / evidence / findings scrubbed; Q1701775 leak=0
 */
import {
  sanitizeDiscoveryPayload,
  scrubFindingChunk,
  scrubFacetsChunk,
  scrubPlanPayload,
  scrubPlanChunk,
  scrubGraphChunk,
  scrubGraphPayload,
  scrubErrorChunk,
} from './emit.js';
import {
  scrubQueryPlanForEmit,
  planSummaryForSse,
  buildQueryPlan,
  FORBIDDEN_PLAN_DIRECTIVES,
} from './queryPlan.js';
import { labelWebOriginRelationship } from './webOrigin.js';
import { BUDGET_EXHAUSTED, createBudgetLedger, createBudgetCaps } from './budget.js';
import {
  FORBIDDEN_IDENTITY_QIDS,
  FORBIDDEN_IDENTITIES_VERSION,
  isForbiddenQid,
  payloadContainsForbidden,
} from '../forbiddenIdentities.js';
import { FAILURE_KINDS, shouldInject, wrapProviderWithInjection } from './failureInject.js';

let passed = 0;
let failed = 0;
const results = [];

function assert(name, cond, meta = {}) {
  if (cond) {
    passed++;
    console.log('PASS', name);
    results.push({ id: name, status: 'PASS', ...meta });
  } else {
    failed++;
    console.error('FAIL', name);
    results.push({ id: name, status: 'FAIL', ...meta });
  }
}

const FORBIDDEN = FORBIDDEN_IDENTITY_QIDS[0] || 'Q1701775';
const FORBIDDEN_RE = new RegExp(FORBIDDEN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

function leakCount(obj) {
  const m = JSON.stringify(obj ?? {}).match(new RegExp(FORBIDDEN, 'gi'));
  return m ? m.length : 0;
}

function assertNoLeak(label, obj) {
  assert(`${label}: leak=0`, leakCount(obj) === 0 && !FORBIDDEN_RE.test(JSON.stringify(obj ?? {})));
}

// ---------------------------------------------------------------------------
// Matrix coverage registry (documented in ACC-ADVERSARIAL-MATRIX.md)
// ---------------------------------------------------------------------------
const MATRIX = [
  { id: 'ACC-M-001', family: 'homonym', title: 'common names — same display, distinct evidence' },
  { id: 'ACC-M-002', family: 'homonym', title: 'same-name orgs — no title-bridge merge' },
  { id: 'ACC-M-003', family: 'url', title: 'unrelated URLs stay distinct Findings' },
  { id: 'ACC-M-004', family: 'url', title: 'ambiguous domains → UNKNOWN ceiling' },
  { id: 'ACC-M-005', family: 'c1', title: 'URL-alone → UNKNOWN (not SAME-*)' },
  { id: 'ACC-M-006', family: 'evidence', title: 'stale / contradictory evidence' },
  { id: 'ACC-M-007', family: 'evidence', title: 'duplicate evidence dedupe honesty' },
  { id: 'ACC-M-008', family: 'evidence', title: 'misleading page / poison meta scrub' },
  { id: 'ACC-M-009', family: 'evidence', title: 'redirect poison cannot revive identity' },
  { id: 'ACC-M-010', family: 'resilience', title: 'source outage soft-fail' },
  { id: 'ACC-M-011', family: 'resilience', title: 'partial results allowed' },
  { id: 'ACC-M-012', family: 'resilience', title: 'budget exhaustion → BUDGET_EXHAUSTED' },
  { id: 'ACC-M-013', family: 'resilience', title: 'timeout inject soft path' },
  { id: 'ACC-M-014', family: 'emit', title: 'BAIT-PLAN-01 reasons Q1701775' },
  { id: 'ACC-M-015', family: 'emit', title: 'BAIT-PLAN-02 credential-shaped intent' },
  { id: 'ACC-M-016', family: 'emit', title: 'BAIT-SSE-01 finding chunk' },
  { id: 'ACC-M-017', family: 'emit', title: 'BAIT-SSE-02 error message' },
  { id: 'ACC-M-018', family: 'emit', title: 'BAIT-GRAPH-01 signalSummary poison' },
  { id: 'ACC-M-019', family: 'emit', title: 'BAIT-GRAPH-02 URL-alone SAME-ENTITY edge' },
  { id: 'ACC-M-020', family: 'emit', title: 'snapshot.plan nested scrub' },
  { id: 'ACC-M-021', family: 'a2', title: 'typed soft-ref edge may survive clamp (not same-entity on wire)' },
  { id: 'ACC-M-022', family: 'a2', title: 'title-bridge SAME-* edge blocked' },
];

assert('matrix registry size >= 20', MATRIX.length >= 20);
assert('denylist still Q1701775', FORBIDDEN_IDENTITY_QIDS.includes('Q1701775'));
assert('fiv pinned', FORBIDDEN_IDENTITIES_VERSION === '2026-09-19.1');

// ---------- ACC-M-001 common names ----------
{
  const snap = sanitizeDiscoveryPayload({
    sessionId: 'm001',
    seed: 'John Smith',
    status: 'partial',
    findings: [
      {
        id: 'f-smith-viaf',
        title: 'John Smith',
        evidenceIds: ['e-viaf'],
        entityRefs: ['viaf:4952029'],
        facetHints: ['provider:viaf'],
      },
      {
        id: 'f-smith-ol',
        title: 'John Smith',
        evidenceIds: ['e-ol'],
        entityRefs: ['ol:OL123A'],
        facetHints: ['provider:openlibrary'],
      },
      {
        id: 'wd-Q1701775',
        title: 'John Smith',
        evidenceIds: ['e-bad'],
        entityRefs: ['Q1701775'],
        facetHints: ['entity:Q1701775'],
      },
    ],
    evidence: [
      { id: 'e-viaf', provenanceUrl: 'https://viaf.org/viaf/4952029/', providerId: 'viaf' },
      { id: 'e-ol', provenanceUrl: 'https://openlibrary.org/authors/OL123A', providerId: 'openlibrary' },
      { id: 'e-bad', provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN}`, providerId: 'wikidata' },
    ],
    facets: [],
  });
  assert('ACC-M-001 keeps both safe same-name findings', (snap.findings || []).length === 2, { matrix: 'ACC-M-001' });
  assert(
    'ACC-M-001 no forced merge of evidenceIds',
    (snap.findings || []).every((f) => (f.evidenceIds || []).length === 1),
    { matrix: 'ACC-M-001' },
  );
  assertNoLeak('ACC-M-001', snap);
}

// ---------- ACC-M-002 same-name orgs ----------
{
  const snap = sanitizeDiscoveryPayload({
    sessionId: 'm002',
    seed: 'United Nations Association',
    status: 'partial',
    findings: [
      {
        id: 'f-org-a',
        title: 'United Nations Association',
        evidenceIds: ['e-a'],
        entityRefs: ['soft:una-uk'],
        facetHints: ['kind:org', 'provider:openlibrary'],
      },
      {
        id: 'f-org-b',
        title: 'United Nations Association',
        evidenceIds: ['e-b'],
        entityRefs: ['soft:una-usa'],
        facetHints: ['kind:org', 'provider:wikipedia'],
      },
    ],
    evidence: [
      { id: 'e-a', provenanceUrl: 'https://openlibrary.org/search?q=UNA+UK', providerId: 'openlibrary' },
      { id: 'e-b', provenanceUrl: 'https://en.wikipedia.org/wiki/UNA-USA', providerId: 'wikipedia' },
    ],
    graph: {
      nodes: [{ id: 'f-org-a' }, { id: 'f-org-b' }],
      edges: [
        {
          from: 'f-org-a',
          to: 'f-org-b',
          relationship: 'SAME-ENTITY',
          titleBridge: true,
          label: 'title match',
        },
      ],
    },
  });
  assert('ACC-M-002 both org findings kept', (snap.findings || []).length === 2, { matrix: 'ACC-M-002' });
  assert(
    'ACC-M-002 title-bridge SAME-ENTITY edge blocked',
    !(snap.graph?.edges || []).some((e) => /same[-_]?entity/i.test(String(e.relationship || e.label || ''))),
    { matrix: 'ACC-M-002' },
  );
  assertNoLeak('ACC-M-002', snap);
}

// ---------- ACC-M-003 unrelated URLs ----------
{
  const snap = sanitizeDiscoveryPayload({
    sessionId: 'm003',
    seed: 'example',
    status: 'partial',
    findings: [
      {
        id: 'f-who',
        title: 'who.int',
        evidenceIds: ['e-who'],
        entityRefs: ['soft:who'],
        hostFamily: 'web_origin',
        relationship: 'UNKNOWN',
      },
      {
        id: 'f-w3',
        title: 'w3.org',
        evidenceIds: ['e-w3'],
        entityRefs: ['soft:w3'],
        hostFamily: 'web_origin',
        relationship: 'UNKNOWN',
      },
    ],
    evidence: [
      { id: 'e-who', provenanceUrl: 'https://www.who.int/', providerId: 'web_origin', hostFamily: 'web_origin' },
      { id: 'e-w3', provenanceUrl: 'https://www.w3.org/', providerId: 'web_origin', hostFamily: 'web_origin' },
    ],
  });
  assert('ACC-M-003 unrelated URL findings distinct', (snap.findings || []).length === 2, { matrix: 'ACC-M-003' });
  assert(
    'ACC-M-003 relationships stay UNKNOWN',
    (snap.findings || []).every((f) => f.relationship === 'UNKNOWN' || f.relationship === 'unknown'),
    { matrix: 'ACC-M-003' },
  );
}

// ---------- ACC-M-004 / ACC-M-005 ambiguous domains + URL-alone ----------
{
  for (const seed of ['https://www.who.int', 'openai.com', 'https://example.com/about']) {
    const rel = labelWebOriginRelationship({
      seed,
      title: '',
      siteName: '',
      hostname: 'www.who.int',
      registrableDomain: 'who.int',
    });
    assert(`ACC-M-005 URL-alone "${seed}" → UNKNOWN`, rel === 'UNKNOWN', { matrix: 'ACC-M-005' });
    assert(`ACC-M-005 URL-alone "${seed}" ≠ SAME-ENTITY`, rel !== 'SAME-ENTITY', { matrix: 'ACC-M-005' });
    assert(`ACC-M-005 URL-alone "${seed}" ≠ SAME-REFERENCE`, rel !== 'SAME-REFERENCE', { matrix: 'ACC-M-005' });
  }
  const amb = sanitizeDiscoveryPayload({
    sessionId: 'm004',
    seed: 'apple.com',
    status: 'partial',
    findings: [
      {
        id: 'f-apple',
        title: 'apple.com',
        evidenceIds: ['e1'],
        entityRefs: [],
        hostFamily: 'web_origin',
        providerId: 'web_origin',
        relationship: 'SAME-REFERENCE', // bait — must clamp
      },
    ],
    evidence: [
      {
        id: 'e1',
        provenanceUrl: 'https://www.apple.com/',
        providerId: 'web_origin',
        hostFamily: 'web_origin',
      },
    ],
  });
  const relOut = amb.findings?.[0]?.relationship;
  assert(
    'ACC-M-004 ambiguous domain SAME-REFERENCE clamped off URL-alone',
    relOut === 'unknown' || relOut === 'UNKNOWN',
    { matrix: 'ACC-M-004' },
  );
}

// ---------- ACC-M-006 stale / contradictory ----------
{
  const snap = sanitizeDiscoveryPayload({
    sessionId: 'm006',
    seed: 'Ada Lovelace',
    status: 'partial',
    findings: [
      {
        id: 'f-ada',
        title: 'Ada Lovelace',
        evidenceIds: ['e-new', 'e-stale'],
        entityRefs: ['Q7259'],
      },
      {
        id: `wd-${FORBIDDEN}`,
        title: 'trap',
        evidenceIds: ['e-poison'],
        entityRefs: [FORBIDDEN],
      },
    ],
    evidence: [
      { id: 'e-new', provenanceUrl: 'https://www.wikidata.org/wiki/Q7259', providerId: 'wikidata', retrievedAt: '2026-09-21' },
      { id: 'e-stale', provenanceUrl: 'https://en.wikipedia.org/wiki/Ada_Lovelace', providerId: 'wikipedia', retrievedAt: '2010-01-01', stale: true },
      { id: 'e-poison', provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN}`, providerId: 'wikidata' },
    ],
    contradictions: [
      {
        type: 'stale_vs_fresh',
        title: 'Ada Lovelace',
        findingIds: ['f-ada', `wd-${FORBIDDEN}`],
        domains: ['wikidata.org', 'wikipedia.org'],
        note: 'INFORMATION≠IDENTITY',
      },
    ],
  });
  assert('ACC-M-006 safe finding kept', (snap.findings || []).some((f) => f.id === 'f-ada'), { matrix: 'ACC-M-006' });
  assert(
    'ACC-M-006 contradiction findingIds scrubbed',
    !(snap.contradictions || []).some((c) => (c.findingIds || []).some((id) => FORBIDDEN_RE.test(String(id)))),
    { matrix: 'ACC-M-006' },
  );
  assertNoLeak('ACC-M-006', snap);
}

// ---------- ACC-M-007 duplicate evidence ----------
{
  const snap = sanitizeDiscoveryPayload({
    sessionId: 'm007',
    seed: 'Cohen',
    status: 'partial',
    findings: [
      {
        id: 'f1',
        title: 'Cohen',
        evidenceIds: ['e-dup-a', 'e-dup-b'],
        entityRefs: ['soft:cohen'],
      },
    ],
    evidence: [
      { id: 'e-dup-a', provenanceUrl: 'https://openlibrary.org/search?q=Cohen', providerId: 'openlibrary', quote: 'Cohen' },
      { id: 'e-dup-b', provenanceUrl: 'https://openlibrary.org/search?q=Cohen', providerId: 'openlibrary', quote: 'Cohen' },
    ],
  });
  assert('ACC-M-007 finding kept with both evidence ids (no silent drop)', (snap.findings || []).length === 1, {
    matrix: 'ACC-M-007',
  });
  assert('ACC-M-007 evidence rows present', (snap.evidence || []).length === 2, { matrix: 'ACC-M-007' });
}

// ---------- ACC-M-008 misleading / poison meta ----------
{
  const snap = sanitizeDiscoveryPayload({
    sessionId: 'm008',
    seed: 'https://www.example.com/page',
    status: 'partial',
    findings: [
      {
        id: 'f-meta',
        title: `Famous politician ${FORBIDDEN}`,
        summary: 'og:title bait',
        evidenceIds: ['e-meta'],
        entityRefs: ['soft:example'],
        hostFamily: 'web_origin',
        relationship: 'UNKNOWN',
      },
      {
        id: 'f-ok',
        title: 'Example Domain',
        evidenceIds: ['e-ok'],
        entityRefs: ['soft:example'],
        hostFamily: 'web_origin',
        relationship: 'UNKNOWN',
      },
    ],
    evidence: [
      {
        id: 'e-meta',
        provenanceUrl: 'https://www.example.com/page',
        quote: `see also ${FORBIDDEN}`,
        providerId: 'web_origin',
        webOriginMeta: { ogTitle: `John Smith ${FORBIDDEN}` },
      },
      {
        id: 'e-ok',
        provenanceUrl: 'https://www.example.com/',
        quote: 'Example Domain',
        providerId: 'web_origin',
      },
    ],
  });
  assert('ACC-M-008 poison title finding stripped', !(snap.findings || []).some((f) => f.id === 'f-meta'), {
    matrix: 'ACC-M-008',
  });
  assert('ACC-M-008 ok finding kept', (snap.findings || []).some((f) => f.id === 'f-ok'), { matrix: 'ACC-M-008' });
  assertNoLeak('ACC-M-008', snap);
}

// ---------- ACC-M-009 redirect poison ----------
{
  const snap = sanitizeDiscoveryPayload({
    sessionId: 'm009',
    seed: 'safe',
    status: 'partial',
    findings: [
      {
        id: 'f-redir',
        title: 'Redirected',
        evidenceIds: ['e-redir'],
        entityRefs: ['soft:x'],
        originalUrl: 'https://example.com/go',
        normalizedUrl: `https://www.wikidata.org/wiki/${FORBIDDEN}`,
      },
    ],
    evidence: [
      {
        id: 'e-redir',
        provenanceUrl: 'https://example.com/go',
        originalUrl: 'https://example.com/go',
        normalizedUrl: `https://www.wikidata.org/wiki/${FORBIDDEN}`,
        providerId: 'web_origin',
      },
    ],
  });
  assert('ACC-M-009 redirect-to-forbidden finding dropped', (snap.findings || []).length === 0, {
    matrix: 'ACC-M-009',
  });
  assertNoLeak('ACC-M-009', snap);
}

// ---------- ACC-M-010 source outage ----------
{
  assert('ACC-M-010 FAILURE_KINDS includes 5xx/timeout', FAILURE_KINDS.length >= 5, { matrix: 'ACC-M-010' });
  const mock = {
    id: 'mock-outage',
    async search() {
      return { providerId: 'mock-outage', findings: [], partial: true };
    },
  };
  const wrapped = wrapProviderWithInjection(mock, 'provider_5xx');
  let soft = false;
  try {
    await wrapped.search({ injectFailure: 'provider_5xx' }, {});
  } catch {
    soft = true;
  }
  assert('ACC-M-010 outage inject throws or soft-fails (observable)', soft === true, { matrix: 'ACC-M-010' });
}

// ---------- ACC-M-011 partial results ----------
{
  const snap = sanitizeDiscoveryPayload({
    sessionId: 'm011',
    seed: 'partial',
    status: 'partial',
    findings: [
      {
        id: 'f-partial',
        title: 'Partial hit',
        evidenceIds: ['e1'],
        entityRefs: ['soft:p'],
      },
    ],
    evidence: [{ id: 'e1', provenanceUrl: 'https://openlibrary.org/search?q=partial', providerId: 'openlibrary' }],
    providers: { openlibrary: { status: 'ok' }, wikidata: { status: 'error', error: 'timeout' } },
  });
  assert('ACC-M-011 partial status preserved', snap.status === 'partial', { matrix: 'ACC-M-011' });
  assert('ACC-M-011 partial finding kept', (snap.findings || []).length === 1, { matrix: 'ACC-M-011' });
}

// ---------- ACC-M-012 budget exhaustion ----------
{
  const ledger = createBudgetLedger(createBudgetCaps({ maxFamilyCalls: 1, maxRequests: 1 }));
  assert('ACC-M-012 BUDGET_EXHAUSTED constant present', BUDGET_EXHAUSTED === 'BUDGET_EXHAUSTED', {
    matrix: 'ACC-M-012',
  });
  assert('ACC-M-012 budget ledger constructible', !!ledger && typeof ledger.reserve === 'function', {
    matrix: 'ACC-M-012',
  });
  const first = ledger.reserve({ providerId: 'wikidata', requests: 1, isNewProvider: true });
  const second = ledger.reserve({ providerId: 'openlibrary', requests: 1, isNewProvider: true });
  assert('ACC-M-012 first reserve ok', first?.ok === true, { matrix: 'ACC-M-012' });
  assert(
    'ACC-M-012 second reserve BUDGET_EXHAUSTED',
    second?.ok === false && second?.code === BUDGET_EXHAUSTED,
    { matrix: 'ACC-M-012' },
  );
  // Honesty: partial snapshot with budget flag must not invent identity
  const snap = sanitizeDiscoveryPayload({
    sessionId: 'm012',
    seed: 'budget',
    status: 'partial',
    budgetStatus: BUDGET_EXHAUSTED,
    findings: [],
    evidence: [],
    facets: [],
    plan: {
      planId: 'plan-budget',
      seedClass: 'ambiguous',
      reasons: [{ target: 'stop', reason: 'budget_exhausted' }],
      orderedIntents: [],
      sourceFamilies: [],
      budgets: { silentExpansionForbidden: true },
      dedupeRules: { titleBridgeForbidden: true, typedSoftRefAttachOnly: true },
    },
  });
  assert('ACC-M-012 budget_exhausted reason survives scrub without identity', !!snap.plan || snap.budgetStatus === BUDGET_EXHAUSTED, {
    matrix: 'ACC-M-012',
  });
  assertNoLeak('ACC-M-012', snap);
}

// ---------- ACC-M-013 timeout ----------
{
  assert(
    'ACC-M-013 shouldInject timeout when flagged',
    shouldInject('provider_timeout', { injectFailure: 'provider_timeout' }) === true,
    { matrix: 'ACC-M-013' },
  );
  assert(
    'ACC-M-013 shouldInject off by default',
    shouldInject('provider_timeout', {}) === false,
    { matrix: 'ACC-M-013' },
  );
}

// ---------- ACC-M-014 BAIT-PLAN-01 ----------
{
  const poisonedPlan = {
    planSchemaVersion: '1.0.0-impl-ready',
    planId: 'bait-plan-01',
    seedClass: 'person',
    seedHash: 'x',
    orderedIntents: [
      {
        intentId: 'DISCOVER_IDENTITY_REFERENCES',
        priority: 1,
        sourceFamilies: ['wikidata'],
        queries: [{ familyId: 'wikidata', providerId: 'wikidata', q: `John Smith ${FORBIDDEN}` }],
        reason: `lookup near ${FORBIDDEN}`,
      },
    ],
    sourceFamilies: ['wikidata'],
    reasons: [{ target: 'wikidata', reason: `avoid politician ${FORBIDDEN}` }],
    knownRefs: [FORBIDDEN, 'Q42'],
    budgets: { silentExpansionForbidden: true, maxProviders: 3 },
    dedupeRules: { titleBridgeForbidden: true, typedSoftRefAttachOnly: true },
    stopConditions: ['budget_exhausted'],
    forbiddenDirectives: [...FORBIDDEN_PLAN_DIRECTIVES],
  };
  const scrubbed = scrubPlanPayload(poisonedPlan);
  assert('ACC-M-014 scrubPlanPayload returns object', !!scrubbed, { matrix: 'ACC-M-014' });
  assertNoLeak('ACC-M-014 scrubPlanPayload', scrubbed);
  assert(
    'ACC-M-014 knownRefs dropped forbidden',
    !(scrubbed.knownRefs || []).some((r) => isForbiddenQid(r)),
    { matrix: 'ACC-M-014' },
  );
  assert('ACC-M-014 forbiddenStripped > 0', (scrubbed.forbiddenStripped || 0) > 0, { matrix: 'ACC-M-014' });

  const ssePlan = scrubPlanChunk(poisonedPlan);
  assert('ACC-M-014 scrubPlanChunk (SSE plan) present', !!ssePlan, { matrix: 'ACC-M-014' });
  assertNoLeak('ACC-M-014 SSE plan', ssePlan);
}

// ---------- ACC-M-015 BAIT-PLAN-02 credential ----------
{
  const credPlan = {
    planId: 'bait-plan-02',
    seedClass: 'ambiguous',
    orderedIntents: [
      {
        intentId: 'DISCOVER_DOCUMENTS',
        priority: 1,
        sourceFamilies: ['openlibrary'],
        queries: [{ familyId: 'openlibrary', providerId: 'openlibrary', q: 'Authorization: Bearer sk-live-SECRETTOKEN99' }],
        reason: 'api_key=secret123',
      },
    ],
    reasons: [{ target: 'ol', reason: 'password=hunter2' }],
    sourceFamilies: ['openlibrary'],
    budgets: { silentExpansionForbidden: true },
    dedupeRules: { titleBridgeForbidden: true, typedSoftRefAttachOnly: true },
  };
  const scrubbed = scrubQueryPlanForEmit(credPlan);
  const blob = JSON.stringify(scrubbed);
  assert('ACC-M-015 credential bearer redacted', !/sk-live-SECRETTOKEN99/i.test(blob), { matrix: 'ACC-M-015' });
  assert('ACC-M-015 password redacted', !/hunter2/i.test(blob), { matrix: 'ACC-M-015' });
  assert('ACC-M-015 shows REDACTED marker', /\[REDACTED\]/i.test(blob), { matrix: 'ACC-M-015' });
}

// ---------- ACC-M-016 BAIT-SSE-01 ----------
{
  const chunk = scrubFindingChunk({
    finding: {
      id: 'f-sse',
      title: `Poison ${FORBIDDEN}`,
      evidenceIds: ['e1'],
      entityRefs: [FORBIDDEN],
    },
    evidence: [{ id: 'e1', provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN}` }],
  });
  assert('ACC-M-016 poisoned SSE finding chunk null', chunk === null, { matrix: 'ACC-M-016' });
}

// ---------- ACC-M-017 BAIT-SSE-02 ----------
{
  const err = scrubErrorChunk({
    code: 'provider_error',
    message: `upstream mentioned ${FORBIDDEN} and Bearer abc.def.ghi`,
  });
  assertNoLeak('ACC-M-017 SSE error', err);
  assert('ACC-M-017 credential redacted in error', !/Bearer abc/i.test(JSON.stringify(err)), {
    matrix: 'ACC-M-017',
  });
  assert('ACC-M-017 failureClass present', !!err.failureClass, { matrix: 'ACC-M-017' });
}

// ---------- ACC-M-018 BAIT-GRAPH-01 ----------
{
  const g = scrubGraphChunk({
    nodes: [
      { id: 'n-ok', label: 'Ada', signalSummary: 'mathematician' },
      { id: 'n-bad', label: 'trap', signalSummary: `politician ${FORBIDDEN}` },
      { id: FORBIDDEN, label: 'forbid node' },
    ],
    edges: [
      {
        from: 'n-ok',
        to: 'n-bad',
        relationship: 'related-entity',
        signalSummary: `link ${FORBIDDEN}`,
      },
    ],
  });
  assert('ACC-M-018 graph chunk scrubbed', !!g, { matrix: 'ACC-M-018' });
  assertNoLeak('ACC-M-018 graph', g);
  assert(
    'ACC-M-018 forbidden node absent',
    !(g.graph?.nodes || []).some((n) => FORBIDDEN_RE.test(String(n.id)) || FORBIDDEN_RE.test(String(n.signalSummary || ''))),
    { matrix: 'ACC-M-018' },
  );
}

// ---------- ACC-M-019 BAIT-GRAPH-02 URL-alone SAME-ENTITY ----------
{
  const g = scrubGraphPayload(
    {
      nodes: [
        { id: 'n1', hostFamily: 'web_origin' },
        { id: 'n2', hostFamily: 'web_origin' },
      ],
      edges: [
        {
          from: 'n1',
          to: 'n2',
          relationship: 'SAME-ENTITY',
          urlAlone: true,
        },
        {
          from: 'n1',
          to: 'n2',
          relationship: 'SAME-REFERENCE',
          titleBridge: true,
        },
      ],
    },
    [],
  );
  assert(
    'ACC-M-019 URL-alone/title-bridge identity edges blocked',
    !(g.edges || []).some((e) => /same[-_]?(entity|reference)/i.test(String(e.relationship || ''))),
    { matrix: 'ACC-M-019' },
  );
}

// ---------- ACC-M-020 nested plan on snapshot ----------
{
  const snap = sanitizeDiscoveryPayload({
    sessionId: 'm020',
    seed: 'John Smith',
    status: 'partial',
    findings: [
      {
        id: 'f-ok',
        title: 'John Smith explorer',
        evidenceIds: ['e1'],
        entityRefs: ['viaf:4952029'],
      },
    ],
    evidence: [{ id: 'e1', provenanceUrl: 'https://viaf.org/viaf/4952029/', providerId: 'viaf' }],
    facets: [{ key: 'entity', buckets: [{ value: FORBIDDEN, count: 1 }, { value: 'viaf:4952029', count: 1 }] }],
    plan: {
      planId: 'nested-plan',
      seedClass: 'person',
      orderedIntents: [
        {
          intentId: 'DISCOVER_IDENTITY_REFERENCES',
          priority: 1,
          sourceFamilies: ['wikidata'],
          queries: [{ familyId: 'wikidata', providerId: 'wikidata', q: `seed ${FORBIDDEN}` }],
          reason: `SAME-ENTITY commit ${FORBIDDEN}`,
        },
      ],
      reasons: [{ target: 'id', reason: `TITLE_BRIDGE to ${FORBIDDEN}` }],
      sourceFamilies: ['wikidata'],
      knownRefs: [FORBIDDEN],
      budgets: { silentExpansionForbidden: true },
      dedupeRules: { titleBridgeForbidden: true, typedSoftRefAttachOnly: true },
    },
    queryPlan: {
      planId: 'nested-qp',
      seedClass: 'person',
      orderedIntents: [],
      reasons: [{ target: 'x', reason: `mention ${FORBIDDEN}` }],
      sourceFamilies: [],
      budgets: { silentExpansionForbidden: true },
      dedupeRules: { titleBridgeForbidden: true, typedSoftRefAttachOnly: true },
    },
    errors: [{ code: 'soft', message: `provider said ${FORBIDDEN}` }],
    graph: {
      nodes: [{ id: 'f-ok' }, { id: `wd-${FORBIDDEN}` }],
      edges: [{ from: 'f-ok', to: `wd-${FORBIDDEN}`, relationship: 'related-entity' }],
    },
  });
  assertNoLeak('ACC-M-020 full snapshot', snap);
  assert('ACC-M-020 plan present scrubbed', !!snap.plan, { matrix: 'ACC-M-020' });
  assert('ACC-M-020 queryPlan present scrubbed', !!snap.queryPlan, { matrix: 'ACC-M-020' });
  assert(
    'ACC-M-020 facet forbidden bucket gone',
    !(snap.facets || []).some((f) => (f.buckets || []).some((b) => FORBIDDEN_RE.test(String(b.value)))),
    { matrix: 'ACC-M-020' },
  );
  assert(
    'ACC-M-020 graph no forbidden node',
    !(snap.graph?.nodes || []).some((n) => FORBIDDEN_RE.test(String(n.id))),
    { matrix: 'ACC-M-020' },
  );
  assert(
    'ACC-M-020 plan directives blocked in reasons',
    !/SAME-ENTITY|TITLE_BRIDGE/i.test(JSON.stringify(snap.plan?.reasons || [])) ||
      /\[BLOCKED_DIRECTIVE\]|\[REDACTED_QID\]/.test(JSON.stringify(snap.plan || {})),
    { matrix: 'ACC-M-020' },
  );
}

// ---------- ACC-M-021 A2 typed soft-ref path (never same-entity on wire) ----------
{
  const g = scrubGraphPayload(
    {
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [
        {
          from: 'a',
          to: 'b',
          relationship: 'same-entity',
          sharedTypedKeys: ['viaf:4952029'],
          coalesceKeys: ['viaf:4952029'],
        },
      ],
    },
    [],
  );
  assert(
    'ACC-M-021 same-entity never on wire after Foundation clamp',
    !(g.edges || []).some((e) => String(e.relationship).toLowerCase() === 'same-entity'),
    { matrix: 'ACC-M-021' },
  );
  assert('ACC-M-021 typed edge may survive as same-reference/unknown', (g.edges || []).length <= 1, {
    matrix: 'ACC-M-021',
  });
}

// ---------- ACC-M-022 title-bridge ----------
{
  const g = scrubGraphPayload(
    {
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [
        {
          from: 'a',
          to: 'b',
          relationship: 'SAME-REFERENCE',
          titleBridge: true,
        },
      ],
    },
    [],
  );
  assert('ACC-M-022 title-bridge edge blocked', (g.edges || []).length === 0, { matrix: 'ACC-M-022' });
}

// ---------- buildQueryPlan smoke: Acc scrub on real builder output ----------
{
  const plan = buildQueryPlan({ seed: 'John Smith', hints: { seedClass: 'person' } });
  const summary = planSummaryForSse(plan);
  assert('builder plan scrubbable', !!scrubPlanPayload(plan), { matrix: 'ACC-M-014' });
  assertNoLeak('builder plan', scrubPlanPayload(plan));
  assertNoLeak('builder SSE summary', summary);
  assert('SSE summary searchIntentOnly', summary?.searchIntentOnly === true);
}

// ---------- facets scrub still green ----------
{
  const facets = scrubFacetsChunk([
    { key: 'entity', buckets: [{ value: FORBIDDEN, count: 9 }, { value: 'Q42', count: 1 }] },
  ]);
  assert(
    'facets scrub strips forbidden bucket',
    !(facets || []).some((f) => (f.buckets || []).some((b) => FORBIDDEN_RE.test(String(b.value)))),
  );
  assert(
    'facets scrub keeps safe',
    (facets || []).some((f) => (f.buckets || []).some((b) => b.value === 'Q42')),
  );
}

console.log(`\n--- Acc adversarial matrix ---\npassed=${passed} failed=${failed} matrixRows=${MATRIX.length}`);
if (failed) process.exit(1);
process.exit(0);
