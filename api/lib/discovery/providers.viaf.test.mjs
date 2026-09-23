/**
 * EXP-A VIAF provider units — mock network; Acc scrub regression.
 * Run: node api/lib/discovery/providers.viaf.test.mjs
 */
import {
  viafProvider,
  wikidataProvider,
  openLibraryProvider,
  getDefaultProviders,
  DEFAULT_PROVIDERS,
  buildTypedSoftRefs,
  extractViafWikidataQid,
  viafIdsFromWikidataEntity,
  normalizeAdapterText,
  classifyAdapterError,
} from './providers.js';
import { sanitizeDiscoveryPayload } from './emit.js';
import { normalizeRawHit } from './store.js';
import { normalizeAdapterToEvidence } from './adapterContract.js';
import { FORBIDDEN_IDENTITY_QIDS } from '../forbiddenIdentities.js';

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

const FORBIDDEN_QID = FORBIDDEN_IDENTITY_QIDS[0] || 'Q1701775';

// --- flag gating ---
const prevFlag = process.env.DISCOVERY_ENABLE_VIAF;
delete process.env.DISCOVERY_ENABLE_VIAF;
assert('flag unset → getDefaultProviders excludes viaf', !getDefaultProviders().some((p) => p.id === 'viaf'));
assert('DEFAULT_PROVIDERS base excludes viaf', !DEFAULT_PROVIDERS.some((p) => p.id === 'viaf'));
process.env.DISCOVERY_ENABLE_VIAF = '1';
assert('flag=1 → getDefaultProviders includes viaf', getDefaultProviders().some((p) => p.id === 'viaf'));
assert('viafProvider.id', viafProvider.id === 'viaf');
assert('viaf authMode none', viafProvider.authMode === 'none');

// --- happy path: known public author (mocked AutoSuggest) ---
const realFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  const u = String(url);
  assert('AutoSuggest URL on viaf.org', /https:\/\/viaf\.org\/viaf\/AutoSuggest\?query=/.test(u));
  return {
    ok: true,
    status: 200,
    async json() {
      return {
        query: 'albert einstein',
        result: [
          {
            term: 'Albert Einstein, 1879-1955',
            displayForm: 'Albert Einstein, 1879-1955',
            nametype: 'personal',
            viafid: '75121530',
            recordID: '75121530',
            lc: 'n79022889',
          },
          {
            term: 'Some Uniform Work',
            nametype: 'uniformtitlework',
            viafid: '99999999',
            recordID: '99999999',
          },
          {
            term: 'Albert Einstein College of Medicine',
            nametype: 'corporate',
            viafid: '140050512',
            recordID: '140050512',
          },
        ],
      };
    },
  };
};

const batch = await viafProvider.search(
  { q: 'Albert Einstein', sessionId: 't', budgetMs: 2000 },
  { signal: undefined },
);
assert('providerId viaf', batch.providerId === 'viaf');
assert('findings non-empty', batch.findings.length >= 1);
assert('skips uniformtitlework', !batch.findings.some((f) => f.id === 'viaf-99999999'));
const hit = batch.findings[0];
assert('provenance on viaf.org', /^https:\/\/viaf\.org\/viaf\/\d+\//.test(hit.provenanceUrl));
assert('kind registry', hit.kind === 'registry');
assert('facetHints provider:viaf', (hit.facetHints || []).includes('provider:viaf'));
assert('facetHints kind:registry', (hit.facetHints || []).includes('kind:registry'));
assert('entityRefs viaf:', (hit.entityRefs || []).some((r) => String(r).startsWith('viaf:')));
assert('no throw / partial false or ok', batch.partial === false || batch.findings.length > 0);

const norm = normalizeRawHit(hit, 'viaf');
assert('normalize keeps viaf evidence', !!norm?.evidence?.provenanceUrl?.includes('viaf.org'));
assert('normalize providerId viaf', norm?.evidence?.providerId === 'viaf');
const adapterPair = normalizeAdapterToEvidence(hit, 'viaf');
assert('adapter evidence sourceRecordId', adapterPair?.evidence?.sourceRecordId === '75121530');
assert('adapter evidence typedRefs', adapterPair?.evidence?.typedRefs?.includes('viaf:75121530'));
assert('evidence retrievedAt', !!adapterPair?.evidence?.retrievedAt);
assert('finding provenance extraction method', hit?.provenance?.extractionMethod === 'registry_lookup');
assert('text normalization is bounded and whitespace-safe', normalizeAdapterText('  A\n\t B  ', 20) === 'A B');
assert('429 taxonomy is retryable rate limit', classifyAdapterError({ status: 429 }).category === 'rate_limited' && classifyAdapterError({ status: 429 }).retryable === true);
assert('timeout taxonomy is retryable timeout', classifyAdapterError({ name: 'AbortError', reason: 'timeout' }).category === 'timeout');

// --- soft-fail: HTTP error ---
globalThis.fetch = async () => {
  const err = new Error('HTTP 503');
  err.status = 503;
  throw err;
};
const soft = await viafProvider.search({ q: 'Tolstoy', sessionId: 't', budgetMs: 500 }, {});
assert('soft-fail returns batch', soft.providerId === 'viaf' && Array.isArray(soft.findings));
assert('soft-fail partial true', soft.partial === true);
assert('soft-fail has errors', Array.isArray(soft.errors) && soft.errors.length >= 1);
assert('soft-fail taxonomy + phase', soft.errors?.[0]?.category === 'upstream_5xx' && soft.errors?.[0]?.phase === 'search');
assert('soft-fail empty findings', soft.findings.length === 0);

// --- soft-fail: timeout / AbortError ---
globalThis.fetch = async (_url, opts) => {
  const err = new Error('aborted');
  err.name = 'AbortError';
  // honor signal if already aborted
  if (opts?.signal?.aborted) throw err;
  throw err;
};
const timed = await viafProvider.search({ q: 'x', sessionId: 't', budgetMs: 50 }, {});
assert('timeout soft-fail', timed.partial === true && timed.errors?.[0]?.code === 'timeout');

// --- empty query ---
const empty = await viafProvider.search({ q: '  ', sessionId: 't', budgetMs: 500 }, {});
assert('empty q → no findings', empty.findings.length === 0 && empty.partial === false);

globalThis.fetch = realFetch;

// --- Acc scrub still strips forbidden QIDs (no regression with viaf present) ---
const scrubbed = sanitizeDiscoveryPayload({
  sessionId: 'acc-viaf',
  status: 'complete',
  findings: [
    {
      id: `wd-${FORBIDDEN_QID}`,
      title: 'Forbidden',
      kind: 'registry',
      providers: ['wikidata'],
      entityRefs: [`wd-${FORBIDDEN_QID}`],
      facetHints: ['provider:wikidata'],
      evidenceIds: ['e-bad'],
    },
    {
      id: 'viaf-4952029',
      title: 'Safe VIAF',
      kind: 'registry',
      providers: ['viaf'],
      entityRefs: ['viaf:4952029'],
      facetHints: ['provider:viaf', 'kind:registry'],
      evidenceIds: ['e-viaf'],
    },
  ],
  evidence: [
    {
      id: 'e-bad',
      provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_QID}`,
      providerId: 'wikidata',
    },
    {
      id: 'e-viaf',
      provenanceUrl: 'https://viaf.org/viaf/4952029/',
      providerId: 'viaf',
    },
  ],
  facets: [
    {
      key: 'provider',
      label: 'Provider',
      buckets: [
        { value: 'wikidata', count: 1, findingIds: [`wd-${FORBIDDEN_QID}`] },
        { value: 'viaf', count: 1, findingIds: ['viaf-4952029'] },
      ],
    },
  ],
});
assert(
  'Acc strips forbidden QID finding',
  !(scrubbed.findings || []).some((f) => String(f.id).includes(FORBIDDEN_QID)),
);
assert(
  'Acc keeps safe viaf finding',
  (scrubbed.findings || []).some((f) => f.id === 'viaf-4952029'),
);
assert(
  'Acc keeps viaf evidence',
  (scrubbed.evidence || []).some((e) => e.id === 'e-viaf'),
);
assert(
  'payload has no forbidden QID token',
  !JSON.stringify(scrubbed).includes(FORBIDDEN_QID),
);


// --- typed soft-ref helpers ---
assert(
  'buildTypedSoftRefs viaf+qid+ol',
  (() => {
    const refs = buildTypedSoftRefs({ viafId: '85312226', qid: 'Q80', olKey: 'OL23919A' });
    return (
      refs.includes('viaf:85312226') &&
      refs.includes('qid:Q80') &&
      refs.includes('wd-Q80') &&
      refs.includes('ol:OL23919A') &&
      refs.includes('ol-OL23919A') &&
      !refs.some((r) => String(r).startsWith('title:'))
    );
  })(),
);
assert('extractViafWikidataQid from wkp', extractViafWikidataQid({ wkp: 'Q937' }) === 'Q937');
assert('extractViafWikidataQid from URL', extractViafWikidataQid({ WKP: 'https://www.wikidata.org/wiki/Q80' }) === 'Q80');
assert('extractViafWikidataQid absent → null', extractViafWikidataQid({ viafid: '1' }) == null);
assert(
  'viafIdsFromWikidataEntity P214',
  viafIdsFromWikidataEntity({
    claims: { P214: [{ mainsnak: { datavalue: { value: '75121530' } } }] },
  }).includes('75121530'),
);

// --- VIAF AutoSuggest with WKP enrichment ---
globalThis.fetch = async (url) => {
  const u = String(url);
  assert('WKP mock hits AutoSuggest', /AutoSuggest/.test(u));
  return {
    ok: true,
    status: 200,
    async json() {
      return {
        query: 'einstein',
        result: [
          {
            term: 'Albert Einstein, 1879-1955',
            displayForm: 'Albert Einstein, 1879-1955',
            nametype: 'personal',
            viafid: '75121530',
            wkp: 'Q937',
          },
        ],
      };
    },
  };
};
const viafWkp = await viafProvider.search({ q: 'Einstein', sessionId: 't', budgetMs: 2000 }, {});
assert('VIAF WKP → qid on entityRefs', (viafWkp.findings[0]?.entityRefs || []).includes('qid:Q937'));
assert('VIAF WKP keeps viaf:', (viafWkp.findings[0]?.entityRefs || []).includes('viaf:75121530'));
assert('VIAF WKP → wd-Q form', (viafWkp.findings[0]?.entityRefs || []).includes('wd-Q937'));

// --- Wikidata P214 enrich (mocked search + claims) ---
globalThis.fetch = async (url) => {
  const u = String(url);
  if (/wbsearchentities/.test(u)) {
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          search: [{ id: 'Q80', label: 'Tim Berners-Lee', description: 'inventor' }],
        };
      },
    };
  }
  if (/wbgetentities/.test(u) && /P214|props=claims/.test(u)) {
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          entities: {
            Q80: {
              id: 'Q80',
              claims: {
                P214: [{ mainsnak: { datavalue: { value: '85312226' } } }],
              },
            },
          },
        };
      },
    };
  }
  throw new Error('unexpected URL ' + u);
};
const wdBatch = await wikidataProvider.search({ q: 'Tim Berners-Lee', sessionId: 't', budgetMs: 3000 }, {});
assert('WD findings non-empty', wdBatch.findings.length >= 1);
assert('WD emits qid typed ref', (wdBatch.findings[0].entityRefs || []).includes('qid:Q80'));
assert('WD P214 → viaf soft-ref', (wdBatch.findings[0].entityRefs || []).includes('viaf:85312226'));

// --- OpenLibrary remote_ids enrich ---
globalThis.fetch = async (url) => {
  const u = String(url);
  if (/search\/authors\.json/.test(u)) {
    return {
      ok: true,
      status: 200,
      async json() {
        return { docs: [{ key: 'OL23919A', name: 'Tim Berners-Lee', top_work: 'Weaving the Web' }] };
      },
    };
  }
  if (/\/authors\/OL23919A\.json/.test(u)) {
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          key: '/authors/OL23919A',
          name: 'Tim Berners-Lee',
          remote_ids: { viaf: '85312226', wikidata: 'Q80' },
        };
      },
    };
  }
  throw new Error('unexpected URL ' + u);
};
const olBatch = await openLibraryProvider.search({ q: 'Tim Berners-Lee', sessionId: 't', budgetMs: 3000 }, {});
assert('OL findings non-empty', olBatch.findings.length >= 1);
assert('OL emits ol: key', (olBatch.findings[0].entityRefs || []).includes('ol:OL23919A'));
assert('OL remote viaf', (olBatch.findings[0].entityRefs || []).includes('viaf:85312226'));
assert('OL remote qid', (olBatch.findings[0].entityRefs || []).includes('qid:Q80'));
assert('OL no title: ref', !(olBatch.findings[0].entityRefs || []).some((r) => String(r).startsWith('title:')));

globalThis.fetch = realFetch;

// restore flag
if (prevFlag === undefined) delete process.env.DISCOVERY_ENABLE_VIAF;
else process.env.DISCOVERY_ENABLE_VIAF = prevFlag;

console.log(`\nviaf provider units: passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
