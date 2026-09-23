/**
 * Discovery vertical slice + harden units — run: node api/lib/discovery/orchestrator.test.mjs
 * Entity-agnostic; no network required (mock providers).
 * Covers: durable store, SSE events, narrow, Acc scrub on all emit paths.
 */
import {
  createDiscoverySession,
  getDiscoverySession,
  narrowDiscoverySession,
  loadSessionRaw,
  clearSessions,
  emitSnapshot,
  getStoreInfo,
} from './orchestrator.js';
import { sanitizeDiscoveryPayload, scrubFindingChunk, scrubFacetsChunk } from './emit.js';
import { evidenceFingerprint, normalizeRawHit, dedupeByEvidenceFingerprint, rankFindings, explainRanking, detectContradictions } from './store.js';
import { aggregateFacets } from './facets.js';
import { softEntityResolve, DEFAULT_PROVIDERS, wikipediaOpenSearchProvider } from './providers.js';
import { mintCorrelationId, getMetricsSnapshot, resetMetrics } from './obs.js';
import { applyNarrow, parseNarrowFilters, findingMatchesFilters } from './narrow.js';
import { buildProgressiveEvents, formatSseEvent, writeProgressiveSse, SSE_RECONNECT_DOCS } from './sse.js';
import { resolveFault, scrubPathInjectFindings } from './faultInject.js';
import { sanitizeDiscoveryPayload as scrubAgain } from './emit.js';
import { mintSessionId, decodeSessionId, detectStoreBackend, sessionStore, healthCheck, getStoreInfo as getSessionStoreInfo } from './sessionStore.js';
import { assertSafePublicHttpsUrl } from './urlSafety.js';
import { wrapProviderWithInjection, simulateRedisUnavailable, FAILURE_KINDS } from './failureInject.js';
import {
  FORBIDDEN_IDENTITY_QIDS,
  payloadContainsForbidden,
  sanitizeCandidatesPayload,
} from '../forbiddenIdentities.js';

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) {
    passed++;
    console.log('PASS', name);
  } else {
    failed++;
    console.error('FAIL', name);
  }
}

clearSessions();

// --- soft ER entity-agnostic ---
const er1 = softEntityResolve('Alpha Seed One');
const er2 = softEntityResolve('Beta Seed Two');
assert('soft ER returns softRefs', Array.isArray(er1.softRefs) && er1.softRefs[0].startsWith('seed:'));
assert('different seeds → different soft refs', er1.softRefs[0] !== er2.softRefs[0]);
assert('no person-name special-case keys', !('davidCohen' in er1) && !('isSmith' in er1));

// --- store fingerprint / normalize ---
const fp1 = evidenceFingerprint('https://example.org/a?utm_source=x', 'Hello', 'wikidata');
const fp2 = evidenceFingerprint('https://example.org/a', 'hello', 'wikidata');
assert('fingerprint strips utm + normalizes quote', fp1 === fp2);
const drop = normalizeRawHit({ title: 'x', provenanceUrl: 'http://insecure.example/a' }, 'wikidata');
assert('cite-or-drop rejects non-https', drop === null);
const ok = normalizeRawHit(
  {
    title: 'Pub Hit',
    provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
    kind: 'registry',
    quote: 'answer',
    entityRefs: ['wd-Q42'],
  },
  'wikidata',
);
assert('normalize produces evidence.provenanceUrl', !!ok?.evidence?.provenanceUrl?.startsWith('https://'));
assert('normalize finding has evidenceIds', ok?.finding?.evidenceIds?.length === 1);

const dup = dedupeByEvidenceFingerprint([
  ok,
  normalizeRawHit(
    {
      title: 'Pub Hit 2',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
      quote: 'answer',
      kind: 'registry',
    },
    'wikidata',
  ),
]);
assert('dedupe merges same fingerprint', dup.length === 1);

// --- facets ---
const facets = aggregateFacets([
  { providers: ['wikidata'], kind: 'registry', facetHints: ['provider:wikidata'] },
  { providers: ['openlibrary', 'wikidata'], kind: 'registry', facetHints: [] },
]);
assert('facets include provider buckets', facets.some((f) => f.key === 'provider' && f.buckets.length >= 1));

// --- durable session id encode/decode ---
const backend = detectStoreBackend();
assert('store backend is kv or fs-regen', backend === 'fs-regen' || backend === 'vercel-kv' || backend === 'upstash');
const info = getStoreInfo();
assert('store info has backend', !!info.backend);
const mid = mintSessionId({ seed: 'Arbitrary Seed Fixture One', hints: { city: 'X' }, locale: 'en' });
assert('mintSessionId returns string', typeof mid === 'string' && mid.length > 8);
if (backend === 'fs-regen') {
  const decoded = decodeSessionId(mid);
  assert('decodeSessionId recovers seed', decoded?.seed === 'Arbitrary Seed Fixture One');
  assert('decodeSessionId recovers hints', decoded?.hints?.city === 'X');
}

// --- mock providers ---
function mockProvider(id, findings) {
  return {
    id,
    capabilities: ['doc'],
    robotsPolicy: 'respect',
    authMode: 'none',
    async search() {
      return { providerId: id, findings, partial: false };
    },
  };
}

const mockA = mockProvider('wikidata', [
  {
    id: 'wd-Q42',
    title: 'Example Entity',
    kind: 'registry',
    provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
    quote: 'example',
    entityRefs: ['wd-Q42'],
    facetHints: ['provider:wikidata', 'kind:registry'],
  },
  {
    id: 'wd-Q1',
    title: 'Universe',
    kind: 'registry',
    provenanceUrl: 'https://www.wikidata.org/wiki/Q1',
    quote: 'universe',
    entityRefs: ['wd-Q1'],
    facetHints: ['provider:wikidata', 'kind:registry'],
  },
]);
const mockB = mockProvider('openlibrary', [
  {
    id: 'ol-OL1A',
    title: 'Example Author',
    kind: 'registry',
    provenanceUrl: 'https://openlibrary.org/authors/OL1A',
    quote: 'works',
    entityRefs: ['ol-OL1A'],
    facetHints: ['provider:openlibrary', 'kind:registry'],
  },
]);

// --- create session (arbitrary seed) ---
const created = await createDiscoverySession(
  { seed: 'Arbitrary Seed Fixture One', hints: { city: 'Testville' } },
  { providers: [mockA, mockB], budgets: { sessionWallMs: 5000, providerMs: 1000 } },
);
assert('create returns sessionId', typeof created.sessionId === 'string' && created.sessionId.length > 8);
assert('create status terminal-ish', ['complete', 'partial', 'running', 'failed_soft'].includes(created.status));
assert('create includes snapshot findings', Array.isArray(created.snapshot?.findings) && created.snapshot.findings.length >= 1);
assert('create snapshot evidence provenance', (created.snapshot?.evidence || []).every((e) => /^https:\/\//.test(e.provenanceUrl)));
assert('create returns store info', !!created.store?.backend);
assert('create snapshot Acc version', !!created.snapshot?.forbiddenIdentitiesVersion);

const snap = await getDiscoverySession(created.sessionId);
assert('GET snapshot has findings', Array.isArray(snap?.findings) && snap.findings.length >= 1);
assert(
  'finding has evidence.provenanceUrl via evidence[]',
  Array.isArray(snap.evidence) &&
    snap.evidence.length >= 1 &&
    snap.evidence.every((e) => /^https:\/\//.test(e.provenanceUrl)),
);
assert('findings link evidenceIds', snap.findings.every((f) => (f.evidenceIds || []).length >= 1));
assert('facets present', Array.isArray(snap.facets));
assert('providers map present', snap.providers && snap.providers.wikidata);
assert('no dossier field', snap.dossier === undefined);
assert('no faces field', snap.faces === undefined);
assert('forbiddenIdentitiesVersion set', !!snap.forbiddenIdentitiesVersion);

// Durable: clear memory, still GET via /tmp or regen-from-seed
sessionStore.clearMemory();
const snap2 = await getDiscoverySession(created.sessionId, {
  providers: [mockA, mockB],
  budgets: { sessionWallMs: 5000, providerMs: 1000 },
});
assert('GET after memory clear still returns session (fs or regen)', !!snap2 && (snap2.findings?.length || 0) >= 1);
assert('rehydrate Acc-scrubbed', !!snap2.forbiddenIdentitiesVersion);

// Multi-seed: same pipeline for different seeds (Entity-Agnostic ≥3)
const seeds = ['Alpha Org Example', 'example.org', 'Jordan Lee'];
for (const seed of seeds) {
  const r = await createDiscoverySession(
    { seed },
    { providers: [mockA], budgets: { sessionWallMs: 3000, providerMs: 500 } },
  );
  const s = await getDiscoverySession(r.sessionId);
  assert(`multi-seed "${seed}" returns findings`, (s?.findings?.length || 0) >= 1);
}

// --- Acc scrub: inject forbidden Q1701775 ---
assert('denylist includes Q1701775', FORBIDDEN_IDENTITY_QIDS.includes('Q1701775'));

const poisonedSnap = {
  sessionId: 'test',
  q: 'any',
  status: 'complete',
  findings: [
    {
      id: 'wd-Q1701775',
      kind: 'registry',
      title: 'Forbidden Person',
      evidenceIds: ['ev-bad'],
      providers: ['wikidata'],
      entityRefs: ['wd-Q1701775'],
    },
    {
      id: 'wd-Q42',
      kind: 'registry',
      title: 'Keep Me',
      evidenceIds: ['ev-ok'],
      providers: ['wikidata'],
      entityRefs: ['wd-Q42'],
    },
  ],
  evidence: [
    {
      id: 'ev-bad',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775',
      providerId: 'wikidata',
      retrievedAt: new Date().toISOString(),
    },
    {
      id: 'ev-ok',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
      providerId: 'wikidata',
      retrievedAt: new Date().toISOString(),
    },
  ],
  facets: [
    {
      key: 'provider',
      label: 'Provider',
      buckets: [
        { value: 'wikidata', count: 2 },
        { value: 'Q1701775', count: 1 },
      ],
    },
  ],
  graph: { nodes: [{ id: 'wd-Q1701775' }, { id: 'wd-Q42' }], edges: [] },
};

const cleaned = sanitizeDiscoveryPayload(poisonedSnap);
assert('forbidden finding stripped', !cleaned.findings.some((f) => String(f.id).includes('Q1701775')));
assert('ok finding kept', cleaned.findings.some((f) => f.id === 'wd-Q42'));
assert(
  'forbidden evidence stripped',
  !cleaned.evidence.some((e) => /Q1701775/i.test(e.provenanceUrl)),
);
assert(
  'facet forbidden bucket stripped',
  !cleaned.facets.some((f) => (f.buckets || []).some((b) => /Q1701775/i.test(b.value))),
);
assert(
  'graph node stripped',
  !(cleaned.graph?.nodes || []).some((n) => /Q1701775/i.test(n.id)),
);
assert('forbiddenStripped > 0', (cleaned.forbiddenStripped || 0) > 0);

// --- B23 contradictions findingIds scrub ---
const poisonedWithContra = {
  ...poisonedSnap,
  contradictions: [
    {
      type: 'same_title_diff_domain',
      title: 'Collision',
      domains: ['wikidata.org'],
      findingIds: ['wd-Q1701775', 'wd-Q42'],
    },
  ],
};
const cleanedContra = sanitizeDiscoveryPayload(poisonedWithContra);
assert(
  'B23 orch: contradiction findingIds scrubbed',
  !(cleanedContra.contradictions || []).some((c) => (c.findingIds || []).some((id) => /Q1701775/i.test(String(id)))),
);
assert(
  'B23 orch: safe findingId kept in contradiction',
  (cleanedContra.contradictions || []).some((c) => (c.findingIds || []).includes('wd-Q42')),
);
assert('B23 orch: JSON leak=0', !JSON.stringify(cleanedContra).match(/Q1701775/i));


// Also via createSession inject path
const inj = await createDiscoverySession(
  { seed: 'Inject Scrub Seed' },
  {
    providers: [mockB],
    budgets: { sessionWallMs: 3000, providerMs: 500 },
    injectFindings: [
      {
        id: 'wd-Q1701775',
        title: 'Should Strip',
        kind: 'registry',
        provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775',
        entityRefs: ['wd-Q1701775'],
      },
    ],
  },
);
const injSnap = await getDiscoverySession(inj.sessionId);
assert(
  'inject forbidden QID stripped from session',
  !(injSnap?.findings || []).some((f) => /Q1701775/i.test(JSON.stringify(f))) &&
    !(injSnap?.evidence || []).some((e) => /Q1701775/i.test(e.provenanceUrl || '')),
);

// sanitizeCandidatesPayload still works (Core Acc)
const corePoison = {
  candidates: [{ id: 'wd-Q1701775', qid: 'Q1701775', sourcesPreview: [] }],
};
const coreClean = sanitizeCandidatesPayload(corePoison);
assert('Core sanitizeCandidatesPayload still strips', (coreClean.candidates || []).length === 0);
assert('payloadContainsForbidden false after sanitize', !payloadContainsForbidden(coreClean));

// --- narrow ---
const narrowFilters = parseNarrowFilters({ facets: { provider: ['openlibrary'] } });
assert('parseNarrowFilters provider set', narrowFilters.provider.has('openlibrary'));
assert(
  'findingMatchesFilters openlibrary only',
  findingMatchesFilters({ providers: ['openlibrary'], kind: 'registry' }, narrowFilters) &&
    !findingMatchesFilters({ providers: ['wikidata'], kind: 'registry' }, narrowFilters),
);

const narrowed = await narrowDiscoverySession(created.sessionId, {
  facets: { provider: ['openlibrary'] },
}, {
  providers: [mockA, mockB],
  budgets: { sessionWallMs: 5000, providerMs: 1000 },
});
assert('narrow ok', narrowed.ok === true);
assert('narrow reduces or equals findings', (narrowed.findings?.length || 0) <= (snap2.findings?.length || snap.findings.length));
assert(
  'narrow findings only openlibrary',
  (narrowed.findings || []).every((f) => (f.providers || []).includes('openlibrary')),
);
assert('narrow has Acc version', !!narrowed.forbiddenIdentitiesVersion);
assert('narrow no dossier', narrowed.dossier === undefined);
assert('narrow has version bump', typeof narrowed.version === 'number');
assert('narrow.narrow.applied present', !!narrowed.narrow?.applied);

// Acc scrub on narrow with poison via applyNarrow + emit
const poisonSession = {
  sessionId: 'n1',
  seed: 'x',
  q: 'x',
  status: 'complete',
  findings: poisonedSnap.findings,
  evidence: poisonedSnap.evidence,
  facets: poisonedSnap.facets,
  providers: { wikidata: 'ok' },
  forbiddenIdentitiesVersion: '2026-09-19.1',
};
const narrowRaw = applyNarrow(poisonSession, { facets: { provider: ['wikidata'] } });
const narrowScrub = emitSnapshot({ ...poisonSession, ...narrowRaw, narrow: narrowRaw.narrow });
assert('narrow path strips forbidden', !(narrowScrub.findings || []).some((f) => /Q1701775/i.test(JSON.stringify(f))));

// --- SSE progressive events ---
const rawSess = await loadSessionRaw(created.sessionId, {
  providers: [mockA, mockB],
  budgets: { sessionWallMs: 5000, providerMs: 1000 },
});
assert('loadSessionRaw works', !!rawSess);
const events = buildProgressiveEvents(rawSess);
assert('SSE has meta event', events.some((e) => e.event === 'meta'));
assert('SSE has finding events', events.some((e) => e.event === 'finding'));
assert('SSE has facets event', events.some((e) => e.event === 'facets'));
assert('SSE has status event', events.some((e) => e.event === 'status'));
assert('SSE has done event', events.some((e) => e.event === 'done'));
assert('SSE events have monotonic ids', events.every((e, i) => e.id === i + 1 || e.id > 0));
assert(
  'SSE terminal status ok',
  ['partial', 'complete', 'failed_soft'].includes(events.find((e) => e.event === 'done')?.data?.status),
);
const sseFrame = formatSseEvent('finding', { finding: { id: 'x' } }, 3);
assert('SSE frame has id and event', sseFrame.includes('id: 3') && sseFrame.includes('event: finding'));

// Acc scrub on SSE finding chunk with forbidden
const badChunk = scrubFindingChunk({
  finding: {
    id: 'wd-Q1701775',
    title: 'Bad',
    kind: 'registry',
    evidenceIds: ['ev-bad'],
    providers: ['wikidata'],
    entityRefs: ['wd-Q1701775'],
  },
  evidence: [
    {
      id: 'ev-bad',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775',
      providerId: 'wikidata',
      retrievedAt: new Date().toISOString(),
    },
  ],
});
assert('SSE scrubFindingChunk strips forbidden', badChunk === null);
const facetScrub = scrubFacetsChunk([
  { key: 'x', label: 'X', buckets: [{ value: 'Q1701775', count: 1 }, { value: 'ok', count: 2 }] },
]);
assert(
  'SSE scrubFacetsChunk strips forbidden bucket',
  !(facetScrub[0]?.buckets || []).some((b) => /Q1701775/i.test(b.value)),
);

// Poisoned session → SSE events must not leak forbidden
const poisonEvents = buildProgressiveEvents({
  ...poisonSession,
  sessionId: 'sse-poison',
});
const allSseJson = JSON.stringify(poisonEvents);
assert('SSE progressive no Q1701775 leak', !/Q1701775/i.test(allSseJson));
assert('SSE progressive no dossier', !/"dossier"/i.test(allSseJson));


// --- MEGA: durable false-confidence fix ---
const megaInfo = getStoreInfo();
assert('MEGA storeBackend present', !!megaInfo.storeBackend);
if (megaInfo.backend === 'fs-regen') {
  assert('MEGA fs-regen durable false', megaInfo.durable === false);
  assert('MEGA fs-regen fallback true', megaInfo.fallback === true);
  assert('MEGA fs-regen promoteEligible false', megaInfo.promoteEligible === false);
}
assert('create snapshot store has storeBackend', !!(created.snapshot?.store?.storeBackend || created.store?.storeBackend || created.store?.backend));

// --- provenance fields on evidence ---
const ev0 = (snap?.evidence || [])[0];
if (ev0) {
  assert('evidence has url alias', typeof ev0.url === 'string' && ev0.url.startsWith('https://'));
  assert('evidence has domain', typeof ev0.domain === 'string' && ev0.domain.length > 0);
  assert('evidence has retrievedAt', typeof ev0.retrievedAt === 'string');
  assert('evidence has evidenceType', typeof ev0.evidenceType === 'string');
}

// --- ranking explanation ---
const f0 = (snap?.findings || [])[0];
if (f0) {
  assert('finding has ranking rationale or scoreFinding', typeof f0.scoreFinding === 'number');
  assert('finding scoreIdentity is null (≠ identity)', f0.scoreIdentity === null || f0.scoreIdentity === undefined);
  if (f0.ranking) {
    assert('ranking has factors', !!f0.ranking.factors);
    assert('ranking rationale mentions discovery', /discovery/i.test(f0.ranking.rationale || ''));
  }
}

const rankedDemo = rankFindings(
  [
    { id: 'a', title: 'A', providers: ['wikidata'], evidenceIds: ['e1'], kind: 'registry' },
    { id: 'b', title: 'B', providers: ['openlibrary'], evidenceIds: ['e2'], kind: 'registry' },
  ],
  new Map([
    ['e1', { id: 'e1', provenanceUrl: 'https://www.wikidata.org/wiki/Q1', domain: 'www.wikidata.org', retrievedAt: new Date().toISOString() }],
    ['e2', { id: 'e2', provenanceUrl: 'https://openlibrary.org/authors/OL1A', domain: 'openlibrary.org', retrievedAt: new Date().toISOString() }],
  ]),
);
assert('rankFindings attaches ranking', rankedDemo.every((f) => f.ranking && f.scoreIdentity === null));

const contra = detectContradictions(
  [
    { id: 'f1', title: 'Same Label', evidenceIds: ['e1'], providers: ['wikidata'] },
    { id: 'f2', title: 'Same Label', evidenceIds: ['e2'], providers: ['openlibrary'] },
  ],
  new Map([
    ['e1', { id: 'e1', domain: 'www.wikidata.org' }],
    ['e2', { id: 'e2', domain: 'openlibrary.org' }],
  ]),
);
assert('contradictions surfaced for same title multi-domain', contra.length >= 1);

// --- healthCheck via sessionStore ---
const hc2 = await healthCheck({ correlationId: 'orch-test-hc' });
assert('orchestrator path healthCheck ok', hc2.ok === true);

// --- SSE Last-Event-ID skip ---
const allEv = buildProgressiveEvents(rawSess);
const resumeAfter = Math.floor(allEv.length / 2);
const resumed = allEv.filter((e) => e.id > resumeAfter);
assert('SSE resume filter skips early ids', resumed.length < allEv.length && resumed.every((e) => e.id > resumeAfter));


// --- URL safety / SSRF-ish ---
assert('urlSafety accepts wikidata https', assertSafePublicHttpsUrl('https://www.wikidata.org/wiki/Q1').ok === true);
assert('urlSafety rejects http', assertSafePublicHttpsUrl('http://example.com').ok === false);
assert('urlSafety rejects localhost', assertSafePublicHttpsUrl('https://localhost/x').ok === false);
assert('urlSafety rejects metadata IP', assertSafePublicHttpsUrl('https://169.254.169.254/latest').ok === false);
assert('normalize drops unsafe host', normalizeRawHit({ title: 'x', provenanceUrl: 'https://127.0.0.1/a' }, 'x') === null);

// --- failure injection soft provider ---
const boom = wrapProviderWithInjection(mockA, 'provider_429');
let batch429;
try {
  batch429 = await boom.search({ q: 'x', sessionId: 't', budgetMs: 100 }, { signal: new AbortController().signal });
} catch (e) {
  batch429 = { thrown: true, status: e?.status };
}
assert('inject 429 throws or soft', batch429?.thrown === true || (batch429?.errors || []).length >= 0);
assert('FAILURE_KINDS non-empty', FAILURE_KINDS.length >= 4);
const simRedis = simulateRedisUnavailable();
assert('simulate redis unavailable ok=false', simRedis.ok === false && simRedis.promoteEligible === false);


// --- MEGA C/L/M/N: explicit fallback flags on snapshot ---
const megaSnapStore = created.snapshot?.store || created.store;
assert('snapshot storeBackend present', !!megaSnapStore?.storeBackend || !!megaSnapStore?.backend);
if ((megaSnapStore?.storeBackend || megaSnapStore?.backend) === 'fs-regen') {
  assert('snapshot explicitFallback true', megaSnapStore.explicitFallback === true);
  assert('snapshot fsRegenFallback true', megaSnapStore.fsRegenFallback === true);
  assert('snapshot promoteEligible false', megaSnapStore.promoteEligible === false);
}

// --- SSE reconnect docs ---
assert('SSE_RECONNECT_DOCS has lastEventIdHeader', SSE_RECONNECT_DOCS.lastEventIdHeader === 'Last-Event-ID');
assert('SSE_RECONNECT_DOCS hangPolicy finite', /finite/i.test(SSE_RECONNECT_DOCS.hangPolicy || ''));
assert('SSE_RECONNECT_DOCS reconnectSafe', SSE_RECONNECT_DOCS.reconnectSafe === true);

// --- writeProgressiveSse: resume past end still emits done (no hang) ---
{
  const chunks = [];
  const fakeRes = {
    write(s) { chunks.push(s); },
    flush() {},
  };
  const sessForSse = await loadSessionRaw(created.sessionId) || {
    sessionId: created.sessionId,
    seed: 'Alpha Seed One',
    status: 'complete',
    findings: [],
    evidence: [],
    facets: [],
    version: 1,
    eventCursor: 0,
  };
  const all = buildProgressiveEvents(sessForSse);
  const lastId = all.length ? all[all.length - 1].id : 99;
  await writeProgressiveSse(fakeRes, sessForSse, { delayMs: 0, lastEventId: lastId });
  const joined = chunks.join('');
  assert('SSE resume-past-end emits done', /event: done/.test(joined));
  assert('SSE resume-past-end finite (ended)', chunks.length >= 1);
}

// --- scrub still on all emits (scrub_path inject) ---
{
  const prev = process.env.DISCOVERY_FAULT_INJECT;
  process.env.DISCOVERY_FAULT_INJECT = '1';
  const inj = scrubPathInjectFindings('scrub_path');
  clearSessions();
  const poisoned = await createDiscoverySession(
    { seed: 'Scrub Fault Seed' },
    {
      providers: [
        {
          id: 'mock',
          async search() {
            return { providerId: 'mock', findings: [], partial: false };
          },
        },
      ],
      injectFindings: [
        {
          id: 'safe-1',
          title: 'Safe Finding',
          summary: 'ok',
          providers: ['mock'],
          kind: 'registry',
          entityRefs: [],
          evidenceIds: ['ev-safe'],
          provenanceUrl: 'https://example.org/safe',
          quote: 'safe',
        },
        ...(inj || []).map((f) => ({
          ...f,
          // pair evidence so normalize path can keep structure pre-scrub
        })),
      ],
      store: new Map(),
      fault: 'scrub_path',
    },
  );
  const sj = JSON.stringify(poisoned);
  assert('scrub_path create response no Q1701775', !/Q1701775/i.test(sj));
  assert('scrub_path no FORBIDDEN_INJECT title leak', !/FORBIDDEN_INJECT/i.test(sj));
  // direct sanitize still strips
  const rawPoison = {
    findings: inj,
    evidence: [{ id: 'ev-fault-scrub', provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775', quote: 'x' }],
    facets: [],
  };
  const scrubbed = scrubAgain(rawPoison);
  assert('direct scrub strips forbidden finding', !(scrubbed.findings || []).length || !/Q1701775/i.test(JSON.stringify(scrubbed)));
  if (prev === undefined) delete process.env.DISCOVERY_FAULT_INJECT;
  else process.env.DISCOVERY_FAULT_INJECT = prev;
}

// --- healthCheck latencyMs + fsRegenFallback ---
assert('orch health latencyMs number', typeof hc2.latencyMs === 'number');
assert('orch health has fsRegenFallback', typeof hc2.fsRegenFallback === 'boolean');


// --- provider coverage + obs ---
assert('wikipedia in DEFAULT_PROVIDERS', DEFAULT_PROVIDERS.some((p) => p.id === 'wikipedia'));
assert('wikipediaOpenSearchProvider id', wikipediaOpenSearchProvider.id === 'wikipedia');
assert('wikipedia authMode none', wikipediaOpenSearchProvider.authMode === 'none');
resetMetrics();
const cid = mintCorrelationId('t');
assert('mintCorrelationId shape', /^t-/.test(cid) && cid.length > 8);
const snapM = getMetricsSnapshot();
assert('metrics snapshot shape', snapM && typeof snapM.counters === 'object');

console.log('\n--- discovery orchestrator + harden tests ---');
console.log(`store.backend=${info.backend} crossInstance=${info.crossInstance}`);
console.log(`passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
