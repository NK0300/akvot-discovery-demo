/**
 * MEGA Acc adversarial cases — fixtures-first + scrub/ER unit asserts.
 * Sacred: leakage=0 · pw=0 · never Q1701775 · Discovery never dossier/faces.
 * Run: node api/lib/discovery/adversarial.acc.test.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  sanitizeDiscoveryPayload,
  scrubFindingChunk,
  scrubFacetsChunk,
} from './emit.js';
import { softEntityResolve } from './providers.js';
import {
  FORBIDDEN_IDENTITY_QIDS,
  isForbiddenQid,
  payloadContainsForbidden,
} from '../forbiddenIdentities.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADV = join(__dirname, '../../../test-results/discovery/MEGA/adversarial');

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) {
    console.log('PASS', name);
    passed++;
  } else {
    console.error('FAIL', name);
    failed++;
  }
}

function load(name) {
  return JSON.parse(readFileSync(join(ADV, name), 'utf8'));
}

const adv01 = load('ADV-01-same-name-different-person.json');
const adv02 = load('ADV-02-ambiguous-he-en.json');
const adv03 = load('ADV-03-entity-collision.json');
const adv04 = load('ADV-04-pretty-wrong-guards.json');

assert('ADV-01 fixture loads', adv01.fixtureId === 'ADV-01-same-name-different-person');
assert('ADV-01 two same-name findings', adv01.findings.length === 2);
assert(
  'ADV-01 same title different evidenceIds',
  adv01.findings[0].title === adv01.findings[1].title &&
    adv01.findings[0].evidenceIds[0] !== adv01.findings[1].evidenceIds[0],
);
assert('ADV-01 expect no forced merge', adv01.expect.forcedMerge === false);
assert('ADV-01 expect no dossier', adv01.expect.dossier === false);

// Soft ER: different soft refs for same display name tracks
const softA = softEntityResolve
  ? softEntityResolve({ seed: adv01.seed, finding: adv01.findings[0] })
  : { softRefs: [`seed:${adv01.findings[0].id}`] };
const softB = softEntityResolve
  ? softEntityResolve({ seed: adv01.seed, finding: adv01.findings[1] })
  : { softRefs: [`seed:${adv01.findings[1].id}`] };
// softEntityResolve may take (seed, hints) — probe orchestrator export shape
let erOk = true;
try {
  const { softEntityResolve: ser } = await import('./orchestrator.js');
  // If API is seed-based only, still assert findings stay distinct after scrub
  const scrubbedPair = sanitizeDiscoveryPayload({
    sessionId: 'adv01',
    seed: adv01.seed,
    q: adv01.seed,
    status: 'partial',
    findings: adv01.findings,
    evidence: adv01.evidence,
    facets: [],
    forbiddenIdentitiesVersion: adv01.forbiddenIdentitiesVersion,
  });
  assert('ADV-01 scrub keeps both Findings', (scrubbedPair.findings || []).length === 2);
  assert(
    'ADV-01 scrub no leakage',
    !payloadContainsForbidden(scrubbedPair) &&
      !JSON.stringify(scrubbedPair).match(/Q1701775/i),
  );
  assert('ADV-01 scrub no dossier field', scrubbedPair.dossier === undefined);
  assert('ADV-01 scrub no faces field', scrubbedPair.faces === undefined);
  void ser;
} catch (e) {
  erOk = false;
  assert('ADV-01 scrub path threw', false);
  console.error(e);
}
void softA;
void softB;
void erOk;

assert('ADV-02 fixture loads', !!adv02.seeds?.length);
assert('ADV-02 has HE+EN seeds', adv02.seeds.some((s) => s.locale === 'he') && adv02.seeds.some((s) => s.locale === 'en'));
assert('ADV-02 denylist includes Q1701775', FORBIDDEN_IDENTITY_QIDS.includes('Q1701775'));
const poisonInject = sanitizeDiscoveryPayload({
  sessionId: 'adv02',
  seed: 'Cohen',
  q: 'Cohen',
  status: 'partial',
  findings: [
    {
      id: 'wd-Q1701775',
      title: 'trap',
      entityRefs: ['Q1701775'],
      evidenceIds: ['e1'],
    },
    {
      id: 'f-cohen-ok',
      title: 'Cohen public mention',
      entityRefs: ['soft:cohen'],
      evidenceIds: ['e2'],
    },
  ],
  evidence: [
    { id: 'e1', provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775', providerId: 'wikidata' },
    { id: 'e2', provenanceUrl: 'https://openlibrary.org/search/authors?q=Cohen', providerId: 'openlibrary' },
  ],
  facets: [{ key: 'entity', buckets: [{ value: 'Q1701775', count: 1 }, { value: 'soft:cohen', count: 1 }] }],
  candidates: adv02.poisonCandidates,
  forbiddenIdentitiesVersion: '2026-09-19.1',
});
assert('ADV-02 forbidden finding stripped', !(poisonInject.findings || []).some((f) => /Q1701775/i.test(JSON.stringify(f))));
assert('ADV-02 ok finding kept', (poisonInject.findings || []).some((f) => f.id === 'f-cohen-ok'));
assert('ADV-02 leakage=0', !payloadContainsForbidden(poisonInject));
assert('ADV-02 no dossier', poisonInject.dossier === undefined);

const poison = adv03.sessionPoison;
const cleaned = sanitizeDiscoveryPayload(poison);
assert('ADV-03 fixture loads', adv03.fixtureId === 'ADV-03-entity-collision');
assert('ADV-03 forbidden finding stripped', !(cleaned.findings || []).some((f) => String(f.id).includes('Q1701775')));
assert('ADV-03 ok finding kept', (cleaned.findings || []).some((f) => f.id === 'wd-Q42'));
assert(
  'ADV-03 evidence poison stripped',
  !(cleaned.evidence || []).some((e) => /Q1701775/i.test(e.provenanceUrl || '')),
);
assert(
  'ADV-03 facet forbidden bucket stripped',
  !(cleaned.facets || []).some((f) => (f.buckets || []).some((b) => /Q1701775/i.test(String(b.value)))),
);
assert(
  'ADV-03 graph node stripped',
  !(cleaned.graph?.nodes || []).some((n) => /Q1701775/i.test(String(n.id))),
);
assert('ADV-03 forbiddenStripped > 0', (cleaned.forbiddenStripped || 0) > 0);
assert('ADV-03 isForbiddenQid Q1701775', isForbiddenQid('Q1701775'));

const badChunk = scrubFindingChunk({
  finding: { id: 'wd-Q1701775', title: 'x', entityRefs: ['Q1701775'], evidenceIds: [] },
  evidence: [],
});
assert('ADV-03 SSE scrubFindingChunk strips', badChunk === null);
const facetScrub = scrubFacetsChunk([
  { key: 'entity', buckets: [{ value: 'Q1701775', count: 2 }, { value: 'Q42', count: 1 }] },
]);
assert(
  'ADV-03 SSE scrubFacetsChunk strips bucket',
  !(facetScrub || []).some((f) => (f.buckets || []).some((b) => /Q1701775/i.test(String(b.value)))),
);

assert('ADV-04 fixture loads', !!adv04.coreCases?.length);
assert('ADV-04 discovery neverFields includes dossier', adv04.discoveryGuards.neverFields.includes('dossier'));
assert('ADV-04 discovery neverFields includes faces', adv04.discoveryGuards.neverFields.includes('faces'));
assert('ADV-04 neverMayCommit', adv04.discoveryGuards.neverMayCommit === true);
assert(
  'ADV-04 smith-ctx expect never Q1701775',
  adv04.coreCases.find((c) => c.id === 'smith-ctx-p0')?.expect?.neverQid === 'Q1701775',
);
assert(
  'ADV-04 assaf keep Q47507930',
  adv04.coreCases.find((c) => c.id === 'assaf-keep')?.expect?.qid === 'Q47507930',
);

// Pretty-wrong guard on Discovery emit shape
const pwGuard = sanitizeDiscoveryPayload({
  sessionId: 'adv04',
  seed: 'John Smith',
  q: 'John Smith',
  status: 'partial',
  findings: [{ id: 'f1', title: 'John Smith', evidenceIds: ['e1'], entityRefs: [] }],
  evidence: [{ id: 'e1', provenanceUrl: 'https://viaf.org/viaf/4952029/', providerId: 'viaf' }],
  facets: [],
  dossier: { qid: 'Q1701775', faces: true }, // must not pass through
  faces: true,
  photoUrl: 'https://example.com/x.jpg',
  forbiddenIdentitiesVersion: '2026-09-19.1',
});
assert('ADV-04 emit drops dossier', pwGuard.dossier === undefined);
assert('ADV-04 emit drops faces', pwGuard.faces === undefined);
assert('ADV-04 emit drops photoUrl', pwGuard.photoUrl === undefined);
assert('ADV-04 emit leakage=0', !JSON.stringify(pwGuard).match(/Q1701775/i));


// --- B23: contradictions[].findingIds must not leak forbidden QIDs ---
const smithContradictionPoison = {
  sessionId: 'b23-smith',
  seed: 'John Smith',
  q: 'John Smith',
  status: 'partial',
  findings: [
    {
      id: 'wd-Q1701775',
      title: 'John Smith (NY politician)',
      entityRefs: ['Q1701775'],
      evidenceIds: ['e-bad'],
      facetHints: ['entity:Q1701775', 'provider:wikidata'],
    },
    {
      id: 'f-smith-viaf',
      title: 'John Smith, explorer',
      entityRefs: ['viaf:4952029'],
      evidenceIds: ['e-ok'],
      facetHints: ['provider:viaf'],
    },
    {
      id: 'f-smith-ol',
      title: 'John Smith mention',
      entityRefs: ['soft:john-smith'],
      evidenceIds: ['e-ok2'],
      facetHints: ['provider:openlibrary'],
    },
  ],
  evidence: [
    { id: 'e-bad', provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775', providerId: 'wikidata' },
    { id: 'e-ok', provenanceUrl: 'https://viaf.org/viaf/4952029/', providerId: 'viaf' },
    { id: 'e-ok2', provenanceUrl: 'https://openlibrary.org/search?q=John+Smith', providerId: 'openlibrary' },
  ],
  facets: [{ key: 'entity', buckets: [{ value: 'Q1701775', count: 1 }, { value: 'soft:john-smith', count: 1 }] }],
  contradictions: [
    {
      type: 'same_title_diff_domain',
      title: 'John Smith',
      domains: ['wikidata.org', 'viaf.org', 'openlibrary.org'],
      findingIds: ['wd-Q1701775', 'f-smith-viaf', 'f-smith-ol'],
      note: 'INFORMATION≠IDENTITY',
    },
    {
      type: 'all_poison',
      title: 'trap',
      domains: ['wikidata.org'],
      findingIds: ['wd-Q1701775'],
    },
  ],
  graph: {
    nodes: [{ id: 'wd-Q1701775' }, { id: 'f-smith-viaf' }, { id: 'f-smith-ol' }],
    edges: [
      { from: 'wd-Q1701775', to: 'f-smith-viaf' },
      { from: 'f-smith-viaf', to: 'f-smith-ol' },
    ],
  },
  forbiddenIdentitiesVersion: '2026-09-19.1',
};

const b23 = sanitizeDiscoveryPayload(smithContradictionPoison);
assert('B23 forbidden finding stripped', !(b23.findings || []).some((f) => /Q1701775/i.test(String(f.id))));
assert('B23 safe findings kept', (b23.findings || []).some((f) => f.id === 'f-smith-viaf'));
assert(
  'B23 contradictions findingIds no forbidden',
  !(b23.contradictions || []).some((c) => (c.findingIds || []).some((id) => /Q1701775/i.test(String(id)))),
);
assert(
  'B23 contradictions keep safe ids',
  (b23.contradictions || []).some((c) => (c.findingIds || []).includes('f-smith-viaf')),
);
assert(
  'B23 all-poison contradiction dropped',
  !(b23.contradictions || []).some((c) => c.type === 'all_poison'),
);
assert(
  'B23 facetHints no forbidden',
  !(b23.findings || []).some((f) => (f.facetHints || []).some((h) => /Q1701775/i.test(String(h)))),
);
assert(
  'B23 graph no forbidden node',
  !(b23.graph?.nodes || []).some((n) => /Q1701775/i.test(String(n.id))),
);
assert(
  'B23 graph edges no dangling forbidden',
  !(b23.graph?.edges || []).some((e) => /Q1701775/i.test(JSON.stringify(e))),
);
assert('B23 full JSON leakage=0', !JSON.stringify(b23).match(/Q1701775/i));
assert('B23 forbiddenStripped > 0', (b23.forbiddenStripped || 0) > 0);


// --- PR-CLOSEOUT full-surface Acc units (emit scrub) ---
const urlAliasPoison = sanitizeDiscoveryPayload({
  sessionId: 'acc-url-alias',
  seed: 'safe seed',
  status: 'partial',
  findings: [
    {
      id: 'f-url-poison',
      title: 'Poisoned via url alias',
      evidenceIds: ['e-url-only'],
      entityRefs: ['soft:ok'],
      facetHints: ['provider:test'],
    },
    {
      id: 'f-url-safe',
      title: 'Safe finding',
      evidenceIds: ['e-safe'],
      entityRefs: ['soft:ok'],
      facetHints: ['provider:test'],
    },
  ],
  evidence: [
    {
      id: 'e-url-only',
      url: 'https://www.wikidata.org/wiki/Q1701775',
      provenanceUrl: 'https://example.org/page',
      quote: 'ok quote',
    },
    {
      id: 'e-safe',
      url: 'https://example.org/safe',
      provenanceUrl: 'https://example.org/safe',
      quote: 'safe',
    },
  ],
  facets: [],
  contradictions: [],
});
assert(
  'ACC-url-alias: poisoned evidence dropped',
  !(urlAliasPoison.evidence || []).some((e) => e.id === 'e-url-only'),
);
assert(
  'ACC-url-alias: orphan finding dropped',
  !(urlAliasPoison.findings || []).some((f) => f.id === 'f-url-poison'),
);
assert('ACC-url-alias: safe finding kept', (urlAliasPoison.findings || []).some((f) => f.id === 'f-url-safe'));
assert('ACC-url-alias: leakage=0', !JSON.stringify(urlAliasPoison).match(/Q1701775/i));

const wdPrefixPoison = sanitizeDiscoveryPayload({
  sessionId: 'acc-wd-prefix',
  seed: 'wd-Q1701775',
  q: 'wd-Q1701775',
  status: 'partial',
  findings: [
    {
      id: 'f-wd',
      title: 'wd-Q1701775 label',
      evidenceIds: ['e1'],
      entityRefs: ['wd-Q1701775'],
      facetHints: ['entity:wd-Q1701775'],
    },
    {
      id: 'f-ok',
      title: 'Safe',
      evidenceIds: ['e2'],
      entityRefs: ['Q42'],
      facetHints: ['entity:Q42'],
    },
  ],
  evidence: [
    { id: 'e1', provenanceUrl: 'https://example.org/a', quote: 'x' },
    { id: 'e2', provenanceUrl: 'https://example.org/b', quote: 'y' },
  ],
  facets: [{ key: 'entity', buckets: [{ value: 'wd-Q1701775', count: 1 }, { value: 'Q42', count: 1 }] }],
  contradictions: [
    { type: 't', title: 'x', findingIds: ['f-wd', 'f-ok'], domains: ['example.org'], note: 'INFORMATION≠IDENTITY' },
  ],
  candidates: [{ id: 'wd-Q1701775', qid: 'Q1701775', label: 'trap' }],
  dossier: { qid: 'Q1701775' },
  faces: [{ url: 'https://example.org/f.jpg' }],
  photoUrl: 'https://example.org/f.jpg',
  nested: { deep: { ref: 'Q1701775', ok: 'Q42' } },
  errors: [{ code: 'soft', message: 'mention Q1701775 in error' }],
});
assert('ACC-wd-prefix: no Q1701775 in JSON', !JSON.stringify(wdPrefixPoison).match(/Q1701775/i));
assert('ACC-wd-prefix: candidates absent', wdPrefixPoison.candidates === undefined);
assert('ACC-wd-prefix: dossier absent', wdPrefixPoison.dossier === undefined);
assert('ACC-wd-prefix: faces absent', wdPrefixPoison.faces === undefined);
assert('ACC-wd-prefix: photoUrl absent', wdPrefixPoison.photoUrl === undefined);
assert('ACC-wd-prefix: safe finding kept', (wdPrefixPoison.findings || []).some((f) => f.id === 'f-ok'));
assert(
  'ACC-wd-prefix: contradictions findingIds scrubbed',
  !(wdPrefixPoison.contradictions || []).some((c) => (c.findingIds || []).some((id) => /Q1701775/i.test(String(id)))),
);

const sseChunkPoison = scrubFindingChunk({
  finding: {
    id: 'f-sse',
    title: 'Poison SSE',
    evidenceIds: ['e-sse'],
    entityRefs: ['Q1701775'],
    facetHints: ['entity:Q1701775'],
  },
  evidence: [{ id: 'e-sse', provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775' }],
});
assert('ACC-SSE-chunk: poisoned chunk null', sseChunkPoison === null);

const sseFacets = scrubFacetsChunk([
  { key: 'entity', buckets: [{ value: 'Q1701775', count: 2 }, { value: 'Q42', count: 1 }] },
]);
assert(
  'ACC-SSE-facets: forbidden bucket stripped',
  !(sseFacets || []).some((f) => (f.buckets || []).some((b) => /Q1701775/i.test(String(b.value)))),
);
assert(
  'ACC-SSE-facets: safe bucket kept',
  (sseFacets || []).some((f) => (f.buckets || []).some((b) => b.value === 'Q42')),
);

const snapshotFields = sanitizeDiscoveryPayload({
  sessionId: 'acc-snap',
  seed: 'Ada Lovelace',
  status: 'partial',
  findings: [
    {
      id: 'f1',
      title: 'Ada Lovelace',
      summary: 'mathematician',
      evidenceIds: ['e1'],
      entityRefs: ['Q7259'],
      facetHints: ['person', 'provider:wikidata'],
    },
  ],
  evidence: [
    {
      id: 'e1',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q7259',
      url: 'https://www.wikidata.org/wiki/Q7259',
      quote: 'Ada Lovelace',
      providerId: 'wikidata',
    },
  ],
  facets: [{ key: 'kind', buckets: [{ value: 'person', count: 1 }] }],
  contradictions: [],
  providers: [{ id: 'wikidata', status: 'ok' }],
  errors: [],
});
assert('ACC-snap: findings present', (snapshotFields.findings || []).length === 1);
assert('ACC-snap: evidence present', (snapshotFields.evidence || []).length === 1);
assert('ACC-snap: facets present', (snapshotFields.facets || []).length === 1);
assert('ACC-snap: fiv present', !!snapshotFields.forbiddenIdentitiesVersion);
assert('ACC-snap: safe Q7259 kept', JSON.stringify(snapshotFields).includes('Q7259'));



// --- LOCAL-WAVE-ACC: contradiction allowlist — extra fields must not Acc-leak ---
{
  const FORBIDDEN = 'Q1701775';
  const allowSnap = sanitizeDiscoveryPayload({
    findings: [
      { id: 'f-safe', title: 'Safe', evidenceIds: ['e-safe'], entityRefs: ['qid:Q42'] },
    ],
    evidence: [
      { id: 'e-safe', url: 'https://example.com/safe', provenanceUrl: 'https://example.com/safe', quote: 'ok' },
    ],
    contradictions: [
      {
        type: 'title_conflict',
        note: 'INFORMATION≠IDENTITY',
        findingIds: ['f-safe'],
        domains: ['example.com'],
        message: `also saw ${FORBIDDEN}`,
        detail: `wd:${FORBIDDEN}`,
        qid: FORBIDDEN,
        urls: [`https://www.wikidata.org/wiki/${FORBIDDEN}`],
      },
    ],
  });
  assert('ACC-contradiction-allowlist: message field cannot leak', !JSON.stringify(allowSnap).includes(FORBIDDEN));
  assert(
    'ACC-contradiction-allowlist: no qid/message keys retained when baited',
    !(allowSnap.contradictions || []).some((c) => c.qid || c.message || c.detail || c.urls),
  );
}

console.log(`\n--- MEGA adversarial Acc tests ---\npassed=${passed} failed=${failed}`);
process.exit(failed ? 1 : 0);
