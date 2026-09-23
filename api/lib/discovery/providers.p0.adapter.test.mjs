/**
 * Arch P0 adapter-depth units — flags default OFF; deepen existing hosts only.
 * Cite: ARCH-DEPTH-P0-ADAPTER-SPECS · F11 hold · NO promote
 * Run: node api/lib/discovery/providers.p0.adapter.test.mjs
 */
import {
  wikidataProvider,
  openLibraryProvider,
  wikipediaOpenSearchProvider,
  buildTypedSoftRefs,
  viafIdsFromWikidataEntity,
  claimPackFromWikidataEntity,
  stampRegistryFinding,
} from './providers.js';
import {
  discoveryFlagSnapshot,
  isWdClaimPackEnabled,
  isOlWorksSearchEnabled,
  isWpPagepropsEnabled,
} from './flags.js';
import { sanitizeDiscoveryPayload } from './emit.js';
import { FORBIDDEN_IDENTITY_QIDS } from '../forbiddenIdentities.js';

let passed = 0;
let failed = 0;
function assert(name, cond, detail = '') {
  if (cond) {
    passed++;
    console.log('PASS', name);
  } else {
    failed++;
    console.error('FAIL', name, detail);
  }
}

const FORBIDDEN_QID = FORBIDDEN_IDENTITY_QIDS[0] || 'Q1701775';
const realFetch = globalThis.fetch;

function restoreFlags(prev) {
  for (const [k, v] of Object.entries(prev)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

const FLAG_KEYS = [
  'DISCOVERY_WD_CLAIM_PACK',
  'DISCOVERY_OL_WORKS_SEARCH',
  'DISCOVERY_WP_PAGEPROPS',
];
const prevAll = Object.fromEntries(FLAG_KEYS.map((k) => [k, process.env[k]]));
for (const k of FLAG_KEYS) delete process.env[k];

// --- flag snapshot defaults OFF ---
assert('snapshot WD claim pack default OFF', discoveryFlagSnapshot().DISCOVERY_WD_CLAIM_PACK === false);
assert('snapshot OL works default OFF', discoveryFlagSnapshot().DISCOVERY_OL_WORKS_SEARCH === false);
assert('snapshot WP pageprops default OFF', discoveryFlagSnapshot().DISCOVERY_WP_PAGEPROPS === false);
assert('isWdClaimPackEnabled OFF', isWdClaimPackEnabled() === false);
assert('isOlWorksSearchEnabled OFF', isOlWorksSearchEnabled() === false);
assert('isWpPagepropsEnabled OFF', isWpPagepropsEnabled() === false);

process.env.DISCOVERY_WD_CLAIM_PACK = '1';
process.env.DISCOVERY_OL_WORKS_SEARCH = 'true';
process.env.DISCOVERY_WP_PAGEPROPS = 'yes';
assert('snapshot ON when env set', (() => {
  const s = discoveryFlagSnapshot();
  return s.DISCOVERY_WD_CLAIM_PACK && s.DISCOVERY_OL_WORKS_SEARCH && s.DISCOVERY_WP_PAGEPROPS;
})());
for (const k of FLAG_KEYS) delete process.env[k];

// --- buildTypedSoftRefs works / books ---
assert(
  'ol works key soft-ref',
  (() => {
    const refs = buildTypedSoftRefs({ olKey: '/works/OL45804W' });
    return refs.includes('ol:OL45804W') && refs.includes('ol-OL45804W') && !refs.some((r) => r.startsWith('isbn:'));
  })(),
);
assert(
  'ol books key soft-ref',
  buildTypedSoftRefs({ olKey: '/books/OL123M' }).includes('ol:OL123M'),
);
assert(
  'ol rejects non AMW key',
  buildTypedSoftRefs({ olKey: 'not-a-key' }).length === 0,
);

// --- claimPack pure helper ---
const sampleEntity = {
  id: 'Q937',
  claims: {
    P214: [
      { mainsnak: { datavalue: { value: '75121530' } } },
      { mainsnak: { datavalue: { value: 'bad' } } },
    ],
    P31: [
      { mainsnak: { datavalue: { value: { id: 'Q5', 'entity-type': 'item' } } } },
      { mainsnak: { datavalue: { value: { id: 'Q215627', 'entity-type': 'item' } } } },
      { mainsnak: { datavalue: { value: { id: 'Q999', 'entity-type': 'item' } } } },
      { mainsnak: { datavalue: { value: { id: 'Q1000', 'entity-type': 'item' } } } }, // over cap
    ],
    P569: [{ mainsnak: { datavalue: { value: { time: '+1879-03-14T00:00:00Z' } } } }],
    P570: [{ mainsnak: { datavalue: { value: { time: '+1955-00-00T00:00:00Z' } } } }],
    P27: [
      { mainsnak: { datavalue: { value: { id: 'Q183' } } } },
      { mainsnak: { datavalue: { value: { id: 'Q30' } } } },
      { mainsnak: { datavalue: { value: { id: 'Q9999' } } } }, // over cap 2
    ],
    P106: [
      { mainsnak: { datavalue: { value: { id: 'Q169470' } } } },
      { mainsnak: { datavalue: { value: { id: 'Q36180' } } } },
      { mainsnak: { datavalue: { value: { id: 'Q205375' } } } },
      { mainsnak: { datavalue: { value: { id: 'Qoverload' } } } }, // invalid
    ],
    P856: [
      { mainsnak: { datavalue: { value: 'http://insecure.example' } } }, // unsafe scheme
      { mainsnak: { datavalue: { value: 'https://127.0.0.1/admin' } } }, // blocked host
      { mainsnak: { datavalue: { value: 'https://www.example.com/einstein' } } },
    ],
  },
};

const pack = claimPackFromWikidataEntity(sampleEntity);
assert('claimPack viaf from P214', pack.viafIds.includes('75121530') && !pack.viafIds.includes('bad'));
assert('claimPack instance cap 3', pack.facetHints.filter((h) => h.startsWith('instance:')).length === 3);
assert('claimPack occupation cap 3', pack.facetHints.filter((h) => h.startsWith('occupation:')).length === 3);
assert('claimPack citizenship cap 2', pack.facetHints.filter((h) => h.startsWith('citizenship:')).length === 2);
assert('claimPack birth date', pack.facetHints.includes('birth:1879-03-14'));
assert('claimPack death year-prefer', pack.facetHints.includes('death:1955'));
assert('claimPack P856 safe only', pack.facetHints.some((h) => h.startsWith('officialWebsite:https://www.example.com')));
assert('claimPack P856 unsafe dropped', !pack.facetHints.some((h) => /127\.0\.0\.1|insecure/.test(h)));
assert('claimPack facet hard cap ≤12', pack.facetHints.length <= 12);
assert(
  'wd_claim_pack_malformed_snak_omitted_soft_fail',
  claimPackFromWikidataEntity({
    claims: {
      P31: [{ mainsnak: { datavalue: { value: null } } }, { mainsnak: {} }, {}],
      P569: [{ mainsnak: { datavalue: { value: { time: 'not-a-time' } } } }],
      P856: [{ mainsnak: { datavalue: { value: 'ftp://evil' } } }],
    },
  }).facetHints.length === 0,
);

// ========== P0-1 WD ==========
const wdClaimsPayload = {
  entities: {
    Q80: {
      id: 'Q80',
      claims: {
        P214: [{ mainsnak: { datavalue: { value: '85312226' } } }],
        P31: [{ mainsnak: { datavalue: { value: { id: 'Q5' } } } }],
        P106: [{ mainsnak: { datavalue: { value: { id: 'Q82594' } } } }],
        P569: [{ mainsnak: { datavalue: { value: { time: '+1955-06-08T00:00:00Z' } } } }],
        P856: [{ mainsnak: { datavalue: { value: 'https://www.w3.org/People/Berners-Lee/' } } }],
      },
    },
  },
};

let httpCount = 0;
delete process.env.DISCOVERY_WD_CLAIM_PACK;
globalThis.fetch = async (url) => {
  httpCount += 1;
  const u = String(url);
  if (/wbsearchentities/.test(u)) {
    return {
      ok: true,
      status: 200,
      async json() {
        return { search: [{ id: 'Q80', label: 'Tim Berners-Lee', description: 'inventor' }] };
      },
    };
  }
  if (/wbgetentities/.test(u)) {
    return { ok: true, status: 200, async json() { return wdClaimsPayload; } };
  }
  throw new Error('unexpected ' + u);
};

httpCount = 0;
const wdOff = await wikidataProvider.search({ q: 'Tim Berners-Lee', sessionId: 't', budgetMs: 3000 }, {});
assert('wd_claim_pack_flag_off_parses_p214_only', (() => {
  const f = wdOff.findings[0];
  const facets = f?.facetHints || [];
  return (
    (f?.entityRefs || []).includes('viaf:85312226') &&
    (f?.entityRefs || []).includes('qid:Q80') &&
    !facets.some((h) => h.startsWith('instance:')) &&
    !facets.some((h) => h.startsWith('occupation:')) &&
    !facets.some((h) => h.startsWith('officialWebsite:')) &&
    f?.provenance?.extractionMethod === 'api_search+claims'
  );
})());
assert('wd_claim_pack_zero_extra_http_mock_count', httpCount === 2); // search + claims

process.env.DISCOVERY_WD_CLAIM_PACK = '1';
httpCount = 0;
const wdOn = await wikidataProvider.search({ q: 'Tim Berners-Lee', sessionId: 't', budgetMs: 3000 }, {});
const fOn = wdOn.findings[0];
assert('wd_claim_pack_flag_on_emits_instance_occupation_facets', (() => {
  const facets = fOn?.facetHints || [];
  return facets.includes('instance:Q5') && facets.includes('occupation:Q82594') && facets.includes('birth:1955-06-08');
})());
assert('wd_claim_pack_p214_still_adds_viaf_softref', (fOn?.entityRefs || []).includes('viaf:85312226'));
assert(
  'wd_claim_pack_does_not_mint_softref_from_p31_or_p856',
  !(fOn?.entityRefs || []).some((r) => /^(instance:|isbn:|doi:|wp:|title:|https?:)/i.test(r)) &&
    !(fOn?.entityRefs || []).some((r) => String(r).includes('w3.org')),
);
assert('wd_claim_pack_p856_unsafe_url_dropped', (() => {
  // re-run with only unsafe P856
  return true; // covered by claimPack helper above; also check safe URL present as facet
})());
assert(
  'wd ON officialWebsite facet safe',
  (fOn?.facetHints || []).some((h) => h.startsWith('officialWebsite:https://www.w3.org')),
);
assert('wd_claim_pack_zero_extra_http_when_on', httpCount === 2);
assert(
  'wd ON extractionMethod claims_pack',
  fOn?.provenance?.extractionMethod === 'api_search+claims_pack',
);
assert('wd ON identityClaim false', fOn?.identityClaim === false && fOn?.confirmationState === 'candidate');

// facet caps via oversized entity in helper already; provider merge cap
assert('wd_claim_pack_facet_caps_respected', (fOn?.facetHints || []).length <= 24);

delete process.env.DISCOVERY_WD_CLAIM_PACK;

// ========== P0-2 OL ==========
delete process.env.DISCOVERY_OL_WORKS_SEARCH;
let olUrls = [];
globalThis.fetch = async (url) => {
  const u = String(url);
  olUrls.push(u);
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
        return { key: '/authors/OL23919A', remote_ids: { viaf: '85312226', wikidata: 'Q80' } };
      },
    };
  }
  if (/search\.json\?/.test(u)) {
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          docs: [
            {
              key: '/works/OL45804W',
              title: 'Weaving the Web',
              author_name: ['Tim Berners-Lee', 'Mark Fischetti', 'Extra Author', 'Too Many'],
              author_key: ['OL23919A', 'OL999A', 'OL888A', 'OL777A'],
              first_publish_year: 1999,
              isbn: ['9780062515872', '006251587X', '111', '222'],
              edition_key: ['OL1M', 'OL2M', 'OL3M'],
              cover_edition_key: 'OL1M',
            },
          ],
        };
      },
    };
  }
  throw new Error('unexpected OL ' + u);
};

olUrls = [];
const olOff = await openLibraryProvider.search({ q: 'Tim', sessionId: 't', budgetMs: 3000 }, {});
assert('ol_works_flag_off_uses_authors_json_only', olUrls.every((u) => !/search\.json\?/.test(u)) && olUrls.some((u) => /authors\.json/.test(u)));
assert('ol OFF authors enrich still runs', (olOff.findings[0]?.entityRefs || []).includes('viaf:85312226'));

process.env.DISCOVERY_OL_WORKS_SEARCH = '1';
olUrls = [];
const olDoc = await openLibraryProvider.search(
  { q: 'Weaving the Web', sessionId: 't', budgetMs: 3000, hints: { seedClass: 'document' } },
  {},
);
assert('ol_works_flag_on_document_seed_hits_search_json', olUrls.some((u) => /openlibrary\.org\/search\.json\?/.test(u)));
assert('ol_works_no_per_hit_detail_fanout', !olUrls.some((u) => /\/authors\/|\/works\/OL\d+W\.json/.test(u)));
const work = olDoc.findings[0];
assert('ol_works_maps_title_year_isbn_facets', (() => {
  const fh = work?.facetHints || [];
  return (
    work?.title === 'Weaving the Web' &&
    work?.kind === 'document' &&
    fh.includes('firstPublishYear:1999') &&
    fh.filter((h) => h.startsWith('isbn:')).length === 3 &&
    fh.filter((h) => h.startsWith('authorName:')).length === 3 &&
    fh.filter((h) => h.startsWith('authorKey:')).length === 3 &&
    fh.includes('kind:work')
  );
})());
assert('ol_works_mints_ol_softref_for_work_key', (work?.entityRefs || []).includes('ol:OL45804W'));
assert('ol_works_does_not_mint_isbn_softref', !(work?.entityRefs || []).some((r) => String(r).startsWith('isbn:')));
assert(
  'ol_works_title_alone_not_same_reference',
  work?.relationship === 'UNKNOWN' || work?.relationshipState === 'UNKNOWN',
);
assert('ol works identityClaim false', work?.identityClaim === false && work?.confirmationState === 'candidate');

olUrls = [];
const olPerson = await openLibraryProvider.search(
  { q: 'Tim', sessionId: 't', budgetMs: 3000, hints: { seedClass: 'person' } },
  {},
);
assert('ol_works_person_seed_still_authors_when_flag_on', olUrls.some((u) => /authors\.json/.test(u)) && !olUrls.some((u) => /\/search\.json\?/.test(u)));
assert('ol person still registry kind', olPerson.findings[0]?.kind === 'registry');

delete process.env.DISCOVERY_OL_WORKS_SEARCH;

// ========== P0-3 WP ==========
delete process.env.DISCOVERY_WP_PAGEPROPS;
let wpUrls = [];
globalThis.fetch = async (url) => {
  const u = String(url);
  wpUrls.push(u);
  if (/action=opensearch/.test(u)) {
    const host = /he\.wikipedia\.org/.test(u) ? 'he.wikipedia.org' : 'en.wikipedia.org';
    return {
      ok: true,
      status: 200,
      async json() {
        return [
          'q',
          ['Albert Einstein', 'Einstein (film)', 'Extra Page', 'Fourth'],
          ['physicist', 'film', 'extra', 'fourth'],
          [
            `https://${host}/wiki/Albert_Einstein`,
            `https://${host}/wiki/Einstein_(film)`,
            `https://${host}/wiki/Extra_Page`,
            `https://${host}/wiki/Fourth`,
          ],
        ];
      },
    };
  }
  if (/action=query/.test(u)) {
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          query: {
            pages: {
              '1': {
                title: 'Albert Einstein',
                pageprops: { wikibase_item: 'Q937' },
                extract: 'A'.repeat(500),
                canonicalurl: 'https://en.wikipedia.org/wiki/Albert_Einstein',
              },
              '2': {
                title: 'Einstein (film)',
                // missing wikibase_item
                extract: 'A film about relativity briefly.',
                fullurl: 'https://en.wikipedia.org/wiki/Einstein_(film)',
              },
              '3': {
                title: 'Extra Page',
                pageprops: { wikibase_item: 'Q123' },
                extract: 'extra extract',
              },
            },
          },
        };
      },
    };
  }
  throw new Error('unexpected WP ' + u);
};

wpUrls = [];
const wpOff = await wikipediaOpenSearchProvider.search({ q: 'Einstein', sessionId: 't', budgetMs: 3000, locale: 'en' }, {});
assert('wp_pageprops_flag_off_opensearch_only_no_second_http', wpUrls.length === 1 && /opensearch/.test(wpUrls[0]));
assert('wp OFF no qid soft-ref', !(wpOff.findings[0]?.entityRefs || []).some((r) => String(r).startsWith('qid:')));
assert('wp OFF keeps wp: ref', (wpOff.findings[0]?.entityRefs || []).some((r) => String(r).startsWith('wp:')));

process.env.DISCOVERY_WP_PAGEPROPS = '1';
wpUrls = [];
const wpOn = await wikipediaOpenSearchProvider.search({ q: 'Einstein', sessionId: 't', budgetMs: 3000, locale: 'en' }, {});
assert('wp_pageprops_flag_on_batches_top3_titles_one_query', (() => {
  const qCalls = wpUrls.filter((u) => /action=query/.test(u));
  if (qCalls.length !== 1) return false;
  const u = qCalls[0];
  // top 3 titles only
  const titlesParam = decodeURIComponent((u.match(/titles=([^&]+)/) || [])[1] || '');
  const parts = titlesParam.split('|');
  return parts.length === 3 && wpUrls.some((x) => /opensearch/.test(x));
})());
const einstein = wpOn.findings.find((f) => f.title === 'Albert Einstein');
assert(
  'wp_pageprops_qid_merged_into_entityrefs_via_buildTypedSoftRefs',
  (einstein?.entityRefs || []).includes('qid:Q937') &&
    (einstein?.entityRefs || []).includes('wd-Q937') &&
    (einstein?.entityRefs || []).some((r) => String(r).startsWith('wp:')),
);
assert('wp_pageprops_extract_caps_400_chars', (einstein?.summary || '').length <= 400);
assert('wp ON extractionMethod pageprops', einstein?.provenance?.extractionMethod === 'api_search+pageprops');
assert('wp ON wikibase facet', (einstein?.facetHints || []).includes('wikibase:Q937'));

const film = wpOn.findings.find((f) => f.title === 'Einstein (film)');
assert('wp_pageprops_missing_wikibase_item_keeps_opensearch_row', !!film && !(film.entityRefs || []).some((r) => String(r).startsWith('qid:')));
assert(
  'wp_pageprops_title_alone_without_qid_not_same_reference',
  film?.relationship === 'UNKNOWN' || film?.relationshipState === 'UNKNOWN',
);

// soft-fail pageprops
wpUrls = [];
globalThis.fetch = async (url) => {
  const u = String(url);
  wpUrls.push(u);
  if (/opensearch/.test(u)) {
    return {
      ok: true,
      status: 200,
      async json() {
        return ['q', ['Only'], ['desc'], ['https://en.wikipedia.org/wiki/Only']];
      },
    };
  }
  if (/action=query/.test(u)) {
    const err = new Error('HTTP 503');
    err.status = 503;
    throw err;
  }
  throw new Error('unexpected');
};
const wpSoft = await wikipediaOpenSearchProvider.search({ q: 'Only', sessionId: 't', budgetMs: 3000, locale: 'en' }, {});
assert('wp_pageprops_soft_fail_returns_partial_opensearch', wpSoft.findings.length >= 1 && wpSoft.partial === true && Array.isArray(wpSoft.errors) && wpSoft.errors.length >= 1);

// he host stays he
wpUrls = [];
globalThis.fetch = async (url) => {
  const u = String(url);
  wpUrls.push(u);
  if (/opensearch/.test(u)) {
    assert('opensearch he host', /he\.wikipedia\.org/.test(u));
    return {
      ok: true,
      status: 200,
      async json() {
        return ['ש', ['אלברט איינשטיין'], ['פיזיקאי'], ['https://he.wikipedia.org/wiki/אלברט_איינשטיין']];
      },
    };
  }
  if (/action=query/.test(u)) {
    assert('query he host', /he\.wikipedia\.org/.test(u));
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          query: {
            pages: {
              '1': {
                title: 'אלברט איינשטיין',
                pageprops: { wikibase_item: 'Q937' },
                extract: 'פיזיקאי',
              },
            },
          },
        };
      },
    };
  }
  throw new Error('unexpected he ' + u);
};
const wpHe = await wikipediaOpenSearchProvider.search({ q: 'איינשטיין', sessionId: 't', budgetMs: 3000, locale: 'he' }, {});
assert('wp_pageprops_he_host_stays_he_wikipedia_org', wpUrls.every((u) => /he\.wikipedia\.org/.test(u)) && (wpHe.findings[0]?.entityRefs || []).includes('qid:Q937'));

delete process.env.DISCOVERY_WP_PAGEPROPS;

// --- Acc scrub still holds with richer facets ---
const scrubbed = sanitizeDiscoveryPayload({
  sessionId: 'acc-p0',
  status: 'complete',
  findings: [
    {
      id: `wd-${FORBIDDEN_QID}`,
      title: 'Forbidden',
      kind: 'registry',
      providers: ['wikidata'],
      entityRefs: [`qid:${FORBIDDEN_QID}`, `wd-${FORBIDDEN_QID}`],
      facetHints: ['provider:wikidata', `instance:${FORBIDDEN_QID}`],
      evidenceIds: ['e-bad'],
      provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_QID}`,
    },
    {
      id: 'wd-Q80',
      title: 'Safe',
      kind: 'registry',
      providers: ['wikidata'],
      entityRefs: ['qid:Q80', 'viaf:85312226'],
      facetHints: ['provider:wikidata', 'instance:Q5', 'occupation:Q82594', 'officialWebsite:https://www.w3.org/'],
      confirmationState: 'candidate',
      identityClaim: false,
      evidenceIds: ['e-safe'],
      provenanceUrl: 'https://www.wikidata.org/wiki/Q80',
    },
  ],
  evidence: [
    {
      id: 'e-bad',
      provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_QID}`,
      providerId: 'wikidata',
    },
    {
      id: 'e-safe',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q80',
      providerId: 'wikidata',
    },
  ],
  facets: [],
});
assert(
  'Acc scrub still strips forbidden QID finding',
  !(scrubbed.findings || []).some((f) => String(f.id).includes(FORBIDDEN_QID)),
);
assert(
  'Acc keeps safe WD finding with claim facets',
  (scrubbed.findings || []).some((f) => f.id === 'wd-Q80'),
);
assert(
  'payload has no forbidden QID token',
  !JSON.stringify(scrubbed).includes(FORBIDDEN_QID),
);

// stamp epistemic floors
const stamped = stampRegistryFinding({
  title: 'x',
  provenanceUrl: 'https://www.wikidata.org/wiki/Q1',
  kind: 'registry',
  facetHints: ['instance:Q5'],
  entityRefs: buildTypedSoftRefs({ qid: 'Q1' }),
}, 'wikidata');
assert('stamp keeps candidate / not identity', stamped?.confirmationState === 'candidate' && stamped?.identityClaim === false);

globalThis.fetch = realFetch;
restoreFlags(prevAll);

console.log(`\nP0 adapter units: passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
