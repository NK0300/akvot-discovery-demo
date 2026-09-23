/**
 * EXP-A2 Option A Bound #1 — strong soft-ref coalesce (never title-only).
 * Run: node api/lib/discovery/corroboration.viaf.test.mjs
 */
import {
  normalizeRawHit,
  dedupeByEvidenceFingerprint,
  coalesceBySoftEntity,
  corroborateBySoftLabel,
  hostFamily,
  softLabel,
  softEntityKey,
  coalesceTitleKey,
  coalesceKeysForFinding,
  labelRelationship,
} from './store.js';

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

function familyCount(f, evidence) {
  const fams = new Set(
    (f.evidenceIds || []).map((id) => hostFamily(evidence.find((e) => e.id === id)?.domain)),
  );
  fams.delete('unknown');
  fams.delete(undefined);
  return fams.size;
}

assert('softLabel strips dates', softLabel('Tim Berners-Lee, 1955-') === 'tim berners lee');
assert('coalesceTitleKey TBL', coalesceTitleKey('Tim Berners-Lee') === 'tim berners lee');
assert('softEntityKey strong', softEntityKey('Tim Berners-Lee') === 'tim berners lee');
assert('softEntityKey refuses single-token', softEntityKey('Stripe') === null);
assert('coalesceTitleKey Stripe≠Stripe John', coalesceTitleKey('Stripe') !== coalesceTitleKey('Stripe, John, 1643-1737'));
assert('hostFamily viaf', hostFamily('viaf.org') === 'viaf');
assert('hostFamily wikidata → wikimedia', hostFamily('www.wikidata.org') === 'wikimedia');
assert('hostFamily wikipedia → wikimedia', hostFamily('en.wikipedia.org') === 'wikimedia');
assert('hostFamily openlibrary', hostFamily('openlibrary.org') === 'openlibrary');

assert('labelRelationship same-source', labelRelationship({ sameFingerprint: true }) === 'same-source');
assert('labelRelationship unknown', labelRelationship({}) === 'unknown');
assert('labelRelationship possible-match', labelRelationship({ similarityOnly: true }) === 'possible-match');
assert(
  'labelRelationship same-entity',
  labelRelationship({ sharedTypedKeys: ['viaf:1'], titleSecondary: 'agree', familyCount: 2 }) === 'same-entity',
);
assert(
  'labelRelationship related-entity',
  labelRelationship({ sharedTypedKeys: ['qid:Q1'], titleSecondary: 'disagree', familyCount: 2 }) === 'related-entity',
);
assert(
  'labelRelationship same-reference',
  labelRelationship({ sharedTypedKeys: ['ol:OL1'], titleSecondary: 'absent', familyCount: 1 }) === 'same-reference',
);

// Bound #1: coalesceKeysForFinding must NOT emit title: keys
{
  const pair = normalizeRawHit(
    { title: 'John Smith', provenanceUrl: 'https://viaf.org/viaf/111/', kind: 'registry', quote: 'a', entityRefs: ['viaf:111'] },
    'viaf',
  );
  const keys = coalesceKeysForFinding(pair.finding, new Map([[pair.evidence.id, pair.evidence]]));
  assert('coalesceKeysForFinding has viaf', keys.some((k) => k === 'viaf:111'));
  assert('coalesceKeysForFinding never emits title:', keys.every((k) => !k.startsWith('title:')));
}

// Title-only peers (shared display name, no shared typed soft-ref) must NOT cross-attach
const titleOnlyPairs = [
  normalizeRawHit(
    { title: 'Tim Berners-Lee', provenanceUrl: 'https://www.wikidata.org/wiki/Q80', kind: 'registry', quote: 'inventor', entityRefs: ['wd-Q80'] },
    'wikidata',
  ),
  normalizeRawHit(
    { title: 'Tim Berners-Lee', provenanceUrl: 'https://en.wikipedia.org/wiki/Tim_Berners-Lee', kind: 'page', quote: 'scientist' },
    'wikipedia',
  ),
  normalizeRawHit(
    { title: 'Tim Berners-Lee', provenanceUrl: 'https://viaf.org/viaf/85312226/', kind: 'registry', quote: 'Tim Berners-Lee', entityRefs: ['viaf:85312226'] },
    'viaf',
  ),
].filter(Boolean);

const titleOnlyOut = coalesceBySoftEntity(dedupeByEvidenceFingerprint(titleOnlyPairs));
assert('title-only peers: coverage preserved', titleOnlyOut.findings.length === 3);
assert('title-only peers: no corroboration edge', (titleOnlyOut.corroborationEdges || []).length === 0);
assert(
  'title-only peers: stay single-family (no cross-attach)',
  titleOnlyOut.findings.every((f) => familyCount(f, titleOnlyOut.evidence) <= 1),
);

// Same VIAF across families → still coalesce (strong soft-ref)
const sameViafPairs = [
  normalizeRawHit(
    {
      title: 'Tim Berners-Lee',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q80',
      kind: 'registry',
      quote: 'inventor',
      entityRefs: ['wd-Q80', 'viaf:85312226'],
    },
    'wikidata',
  ),
  normalizeRawHit(
    {
      title: 'Tim Berners-Lee',
      provenanceUrl: 'https://viaf.org/viaf/85312226/',
      kind: 'registry',
      quote: 'Tim Berners-Lee',
      entityRefs: ['viaf:85312226'],
    },
    'viaf',
  ),
].filter(Boolean);

const sameViafOut = coalesceBySoftEntity(dedupeByEvidenceFingerprint(sameViafPairs));
const sameViafMulti = sameViafOut.findings.filter((f) => familyCount(f, sameViafOut.evidence) >= 2);
assert('same VIAF: yields multi-family attach', sameViafMulti.length >= 1);
assert('same VIAF: coverage preserved (attach_keep)', sameViafOut.findings.length === 2);
assert('same VIAF: all peers become multi', sameViafMulti.length === 2);
assert('same VIAF: corroboration edge recorded', (sameViafOut.corroborationEdges || []).length >= 1);
assert(
  'same VIAF: attached providers include viaf and wikidata',
  sameViafMulti.some((f) => (f.providers || []).includes('viaf') && (f.providers || []).includes('wikidata')),
);
assert(
  'same VIAF: titleSecondary agree on edge',
  (sameViafOut.corroborationEdges || []).some((e) => e.titleSecondary === 'agree'),
);
assert(
  'same VIAF: edge relationship same-entity',
  (sameViafOut.corroborationEdges || []).some((e) => e.relationship === 'same-entity'),
);

assert(
  'alias corroborateBySoftLabel delegates',
  corroborateBySoftLabel(dedupeByEvidenceFingerprint(sameViafPairs)).findings.length === 2,
);

// Same QID across families → still coalesce
const sameQidPairs = [
  normalizeRawHit(
    {
      title: 'Tim Berners-Lee',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q80',
      kind: 'registry',
      quote: 'wd',
      entityRefs: ['wd-Q80'],
    },
    'wikidata',
  ),
  normalizeRawHit(
    {
      title: 'Tim Berners-Lee',
      provenanceUrl: 'https://openlibrary.org/authors/OL23919A',
      kind: 'registry',
      quote: 'ol',
      entityRefs: ['ol-OL23919A', 'wd-Q80'],
    },
    'openlibrary',
  ),
].filter(Boolean);
const sameQidOut = coalesceBySoftEntity(dedupeByEvidenceFingerprint(sameQidPairs));
assert(
  'same QID: multi-family attach',
  sameQidOut.findings.every((f) => familyCount(f, sameQidOut.evidence) >= 2),
);
assert('same QID: attach_keep', sameQidOut.findings.length === 2);

// Title-homonym: same display title, distinct VIAF/QID → must NOT cross-attach
const homonymPairs = [
  normalizeRawHit(
    {
      title: 'John Smith',
      provenanceUrl: 'https://viaf.org/viaf/111/',
      kind: 'registry',
      quote: 'a',
      entityRefs: ['viaf:111'],
    },
    'viaf',
  ),
  normalizeRawHit(
    {
      title: 'John Smith',
      provenanceUrl: 'https://viaf.org/viaf/222/',
      kind: 'registry',
      quote: 'b',
      entityRefs: ['viaf:222'],
    },
    'viaf',
  ),
  normalizeRawHit(
    {
      title: 'John Smith',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q999',
      kind: 'registry',
      quote: 'c',
      entityRefs: ['wd-Q999'],
    },
    'wikidata',
  ),
].filter(Boolean);
const homonymOut = coalesceBySoftEntity(dedupeByEvidenceFingerprint(homonymPairs));
assert('title-homonym: 3 findings kept', homonymOut.findings.length === 3);
assert('title-homonym: no corroboration edge', (homonymOut.corroborationEdges || []).length === 0);
assert(
  'title-homonym: no Evidence/entityRefs cross-contam',
  homonymOut.findings.every((f) => {
    const refs = f.entityRefs || [];
    const viafs = refs.filter((r) => /^viaf/i.test(r));
    // each finding keeps only its own refs — never both viaf:111 and viaf:222
    return viafs.length <= 1 && familyCount(f, homonymOut.evidence) <= 1;
  }),
);
assert(
  'title-homonym: providers not unioned across ids',
  homonymOut.findings.every((f) => (f.providers || []).length === 1),
);

// Wikimedia-only (same family) stays single-family even with shared QID path
const wikiOnly = coalesceBySoftEntity(
  dedupeByEvidenceFingerprint([
    normalizeRawHit(
      { title: 'Tim Berners-Lee', provenanceUrl: 'https://www.wikidata.org/wiki/Q80', kind: 'registry', quote: 'inventor', entityRefs: ['wd-Q80'] },
      'wikidata',
    ),
    normalizeRawHit(
      { title: 'Tim Berners-Lee', provenanceUrl: 'https://en.wikipedia.org/wiki/Tim_Berners-Lee', kind: 'page', quote: 'scientist' },
      'wikipedia',
    ),
  ].filter(Boolean)),
);
assert(
  'wikimedia-only stays single-family',
  wikiOnly.findings.every((f) => familyCount(f, wikiOnly.evidence) <= 1),
);
assert('wikimedia-only preserves coverage', wikiOnly.findings.length === 2);

// TED-style descriptive title stays outside person coalesce (no shared strong key)
const withTed = [
  ...sameViafPairs,
  normalizeRawHit(
    {
      title: 'Tim Berners-Lee: The next web',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q22980417',
      kind: 'registry',
      quote: 'TED talk',
      entityRefs: ['wd-Q22980417'],
    },
    'wikidata',
  ),
].filter(Boolean);
const tedOut = coalesceBySoftEntity(dedupeByEvidenceFingerprint(withTed));
const tedRow = tedOut.findings.find((f) => /next web/i.test(f.title || ''));
assert('TED-style row survives as separate finding', !!tedRow);
assert('TED-style row stays single-family', tedRow && familyCount(tedRow, tedOut.evidence) <= 1);
assert('coverage ≥3 with TED row', tedOut.findings.length >= 3);

// Pretty-Wrong Stripe
const stripe = [
  normalizeRawHit(
    { title: 'Stripe', provenanceUrl: 'https://www.wikidata.org/wiki/Q20031851', kind: 'registry', quote: 'company', entityRefs: ['wd-Q20031851'] },
    'wikidata',
  ),
  normalizeRawHit(
    { title: 'Stripe, John, 1643-1737', provenanceUrl: 'https://viaf.org/viaf/30463651/', kind: 'registry', quote: 'person', entityRefs: ['viaf:30463651'] },
    'viaf',
  ),
].filter(Boolean);
const stripeOut = coalesceBySoftEntity(dedupeByEvidenceFingerprint(stripe));
assert('Stripe≠Stripe John — no false merge', stripeOut.findings.length === 2);
assert('no corroboration edge for Stripe false friend', (stripeOut.corroborationEdges || []).length === 0);
assert(
  'Stripe stays single-family',
  stripeOut.findings.every((f) => familyCount(f, stripeOut.evidence) <= 1),
);


// Typed soft-ref enrichment: WD P214 viaf + VIAF same id → cross-family attach
const enrichedCross = [
  normalizeRawHit(
    {
      title: 'Tim Berners-Lee',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q80',
      kind: 'registry',
      quote: 'inventor',
      entityRefs: ['qid:Q80', 'wd-Q80', 'viaf:85312226'],
    },
    'wikidata',
  ),
  normalizeRawHit(
    {
      title: 'Berners-Lee, Tim',
      provenanceUrl: 'https://viaf.org/viaf/85312226/',
      kind: 'registry',
      quote: 'Tim Berners-Lee',
      entityRefs: ['viaf:85312226'],
    },
    'viaf',
  ),
  normalizeRawHit(
    {
      title: 'Tim Berners-Lee',
      provenanceUrl: 'https://openlibrary.org/authors/OL23919A',
      kind: 'registry',
      quote: 'Weaving',
      entityRefs: ['ol:OL23919A', 'ol-OL23919A', 'viaf:85312226', 'qid:Q80'],
    },
    'openlibrary',
  ),
].filter(Boolean);
const enrichedOut = coalesceBySoftEntity(dedupeByEvidenceFingerprint(enrichedCross));
assert('enriched typed refs: attach_keep findings', enrichedOut.findings.length === 3);
assert(
  'enriched typed refs: multi-family attach',
  enrichedOut.findings.every((f) => familyCount(f, enrichedOut.evidence) >= 2),
);
assert(
  'enriched typed refs: corroboration edge present',
  (enrichedOut.corroborationEdges || []).length >= 1,
);

// Homonym still no merge even if one side has qid form without shared viaf
const homonymTyped = [
  normalizeRawHit(
    {
      title: 'John Smith',
      provenanceUrl: 'https://viaf.org/viaf/111/',
      kind: 'registry',
      quote: 'a',
      entityRefs: ['viaf:111'],
    },
    'viaf',
  ),
  normalizeRawHit(
    {
      title: 'John Smith',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q999',
      kind: 'registry',
      quote: 'c',
      entityRefs: ['qid:Q999', 'wd-Q999'],
    },
    'wikidata',
  ),
].filter(Boolean);
const homonymTypedOut = coalesceBySoftEntity(dedupeByEvidenceFingerprint(homonymTyped));
assert('homonym typed forms: no merge', homonymTypedOut.findings.length === 2);
assert('homonym typed forms: no edges', (homonymTypedOut.corroborationEdges || []).length === 0);
assert(
  'homonym typed forms: single-family each',
  homonymTypedOut.findings.every((f) => familyCount(f, homonymTypedOut.evidence) <= 1),
);

// coalesceKeysForFinding accepts qid: form
{
  const pair = normalizeRawHit(
    {
      title: 'X',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q80',
      kind: 'registry',
      quote: 'q',
      entityRefs: ['qid:Q80'],
    },
    'wikidata',
  );
  const keys = coalesceKeysForFinding(pair.finding, new Map([[pair.evidence.id, pair.evidence]]));
  assert('coalesceKeys accepts qid: entityRef', keys.includes('qid:Q80'));
  assert('coalesceKeys still never title:', keys.every((k) => !k.startsWith('title:')));
}

console.log(`\ncorroboration viaf units (EXP-A2 typed softref enrich): passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
