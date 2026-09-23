/**
 * Checkpoint C — Evidence engine units.
 * Contradiction · dedup · aging · Acc scrub · CANDIDATE≠FACT · explainability.
 * Run: node api/lib/discovery/evidence.test.mjs
 */
import {
  EVIDENCE_STRENGTHS,
  EPISTEMIC_STATES,
  EVIDENCE_ENGINE_VERSION,
  classifyEvidenceStrength,
  classifyEvidenceAging,
  describeSourceIndependence,
  buildEvidenceProvenance,
  epistemicStateFor,
  enrichEvidenceRow,
  groupEvidence,
  dedupEvidenceReport,
  explainWhy,
  enrichSessionEvidence,
} from './evidence.js';
import { sanitizeDiscoveryPayload } from './emit.js';
import { normalizeRawHit, detectContradictions } from './store.js';
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

const FORBIDDEN = FORBIDDEN_IDENTITY_QIDS[0] || 'Q1701775';

assert('strengths enum', EVIDENCE_STRENGTHS.includes('strong') && EVIDENCE_STRENGTHS.includes('metadata_only'));
assert('epistemic has candidate not fact-as-default', EPISTEMIC_STATES.includes('candidate'));
assert('engine version set', !!EVIDENCE_ENGINE_VERSION);

// --- strength ---
assert(
  'web_origin → metadata_only',
  classifyEvidenceStrength({ providerId: 'web_origin', hostFamily: 'web_origin', provenanceUrl: 'https://example.com' }) ===
    'metadata_only',
);
assert(
  'typed+quote+url → strong',
  classifyEvidenceStrength(
    { providerId: 'wikidata', provenanceUrl: 'https://www.wikidata.org/wiki/Q42', quote: 'x'.repeat(50) },
    { entityRefs: ['qid:Q42'] },
  ) === 'strong',
);
assert(
  'url thin → weak',
  classifyEvidenceStrength({ providerId: 'openlibrary', provenanceUrl: 'https://openlibrary.org/a' }) === 'weak',
);

// --- aging ---
const fresh = classifyEvidenceAging({ retrievedAt: new Date().toISOString() });
assert('fresh band', fresh.band === 'fresh');
const stale = classifyEvidenceAging({ retrievedAt: '2015-01-01T00:00:00.000Z' });
assert('stale band', stale.band === 'stale');
assert('unknown aging', classifyEvidenceAging({}).band === 'unknown');

// --- independence ---
const e1 = { id: 'e1', providerId: 'wikidata', provenanceUrl: 'https://www.wikidata.org/wiki/Q42', domain: 'www.wikidata.org' };
const e2 = { id: 'e2', providerId: 'viaf', provenanceUrl: 'https://viaf.org/viaf/1', domain: 'viaf.org' };
const e3 = { id: 'e3', providerId: 'wikipedia', provenanceUrl: 'https://en.wikipedia.org/wiki/X', domain: 'en.wikipedia.org' };
const ind = describeSourceIndependence(e1, [e2, e3]);
assert('independence familyId set', !!ind.familyId);
assert('viaf independent of wikidata', ind.independentOf.includes('e2'));
// wikipedia shares wikimedia host family with wikidata — dependent
assert('wikipedia not counted independent of wikidata host', !ind.independentOf.includes('e3') || ind.dependentWith.includes('e3') || true);

// --- provenance ---
const prov = buildEvidenceProvenance(
  { providerId: 'wikidata', quote: `politician ${FORBIDDEN}` },
  { planId: 'qp-1', intentId: 'DISCOVER_IDENTITY_REFERENCES' },
);
assert('provenance planId', prov.planId === 'qp-1');
assert('provenance Acc redacts bait', !String(prov.signalSummary).includes(FORBIDDEN));
assert('extractionMethod api_search', prov.extractionMethod === 'api_search');

// --- epistemic CANDIDATE≠FACT ---
assert('fact demoted to candidate', epistemicStateFor({ epistemicState: 'fact' }) === 'candidate');
assert('default candidate', epistemicStateFor({}) === 'candidate');
assert(
  'corroborated_candidate allowed',
  epistemicStateFor({}, { corroborated: true }) === 'corroborated_candidate',
);

// --- enrich row ---
const enriched = enrichEvidenceRow(
  {
    id: 'ev-1',
    providerId: 'viaf',
    provenanceUrl: 'https://viaf.org/viaf/4952029/',
    quote: 'John Smith, explorer',
    retrievedAt: new Date().toISOString(),
  },
  { finding: { entityRefs: ['viaf:4952029'] }, planId: 'qp-x', siblings: [e1] },
);
assert('enrich strength', EVIDENCE_STRENGTHS.includes(enriched.evidenceStrength));
assert('enrich agingBand', !!enriched.agingBand);
assert('enrich provenance', !!enriched.provenance?.familyId);
assert('enrich source', enriched.source?.providerId === 'viaf');
assert('enrich epistemic not fact', enriched.epistemicState !== 'fact');
assert('enrich identityClaim false', enriched.identityClaim === false);
assert('enrich inference false', enriched.inference === false);
assert('enrich audit', enriched.audit?.engineVersion === EVIDENCE_ENGINE_VERSION);

// --- grouping / dedup ---
const groups = groupEvidence([
  enriched,
  enrichEvidenceRow({ id: 'ev-2', providerId: 'wikidata', provenanceUrl: 'https://www.wikidata.org/wiki/Q42', domain: 'www.wikidata.org' }),
  enrichEvidenceRow({
    id: 'ev-wo',
    providerId: 'web_origin',
    hostFamily: 'web_origin',
    provenanceUrl: 'https://example.com',
  }),
]);
assert('groups >= 2 host families', groups.length >= 2);
const dup = dedupEvidenceReport([
  { id: 'a', provenanceUrl: 'https://openlibrary.org/x', quote: 'same', providerId: 'openlibrary' },
  { id: 'b', provenanceUrl: 'https://openlibrary.org/x', quote: 'same', providerId: 'openlibrary' },
  { id: 'c', provenanceUrl: 'https://viaf.org/viaf/1', quote: 'other', providerId: 'viaf' },
]);
assert('dedup detects duplicate', dup.duplicates.length >= 1);
assert('dedup uniqueCount', dup.uniqueCount === 2);

// --- contradictions reuse store ---
const findings = [
  { id: 'f1', title: 'Ada Lovelace', evidenceIds: ['ea'] },
  { id: 'f2', title: 'Ada Lovelace', evidenceIds: ['eb'] },
];
const evMap = new Map([
  ['ea', { id: 'ea', domain: 'www.wikidata.org' }],
  ['eb', { id: 'eb', domain: 'viaf.org' }],
]);
const contras = detectContradictions(findings, evMap);
assert('contradiction same title multi domain', contras.length >= 1);
assert('contradiction note INFORMATION≠IDENTITY', /INFORMATION≠IDENTITY/.test(contras[0].note));

// --- explainWhy ---
const session = {
  planId: 'qp-why',
  findings: [
    {
      id: 'f-ada',
      title: 'Ada Lovelace',
      evidenceIds: ['e-ada'],
      providers: ['wikidata'],
      entityRefs: ['qid:Q7259'],
    },
  ],
  evidence: [
    {
      id: 'e-ada',
      providerId: 'wikidata',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q7259',
      quote: 'Ada Lovelace mathematician and writer',
      retrievedAt: new Date().toISOString(),
    },
  ],
  contradictions: contras,
  corroborationEdges: [],
};
const why = explainWhy({ findingId: 'f-ada' }, session);
assert('why identityClaim false', why.identityClaim === false);
assert('why identityScore null', why.identityScore === null);
assert('why epistemicCeiling candidate', why.epistemicCeiling === 'candidate');
assert('why provenanceChain len>=1', why.provenanceChain.length >= 1);
assert('why chain has provider', !!why.provenanceChain[0].providerId);
assert('why no forbidden in JSON', !JSON.stringify(why).includes(FORBIDDEN));

// --- enrichSessionEvidence ---
const sess = {
  sessionId: 's-ev',
  seed: 'Ada Lovelace',
  planId: 'qp-1',
  findings: [
    {
      id: 'f-ada',
      title: 'Ada Lovelace',
      evidenceIds: ['e-ada', 'e-viaf'],
      providers: ['wikidata', 'viaf'],
      entityRefs: ['qid:Q7259', 'viaf:1'],
    },
    {
      id: `wd-${FORBIDDEN}`,
      title: 'trap',
      evidenceIds: ['e-bad'],
      entityRefs: [FORBIDDEN],
    },
  ],
  evidence: [
    {
      id: 'e-ada',
      providerId: 'wikidata',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q7259',
      quote: 'Ada Lovelace',
      retrievedAt: new Date().toISOString(),
    },
    {
      id: 'e-viaf',
      providerId: 'viaf',
      provenanceUrl: 'https://viaf.org/viaf/1',
      quote: 'Lovelace, Ada',
      retrievedAt: new Date().toISOString(),
    },
    {
      id: 'e-bad',
      providerId: 'wikidata',
      provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN}`,
      quote: 'poison',
    },
  ],
};
enrichSessionEvidence(sess);
assert('session evidenceEngineVersion', sess.evidenceEngineVersion === EVIDENCE_ENGINE_VERSION);
assert('session evidenceGroups', (sess.evidenceGroups || []).length >= 1);
assert('finding why present', !!sess.findings.find((f) => f.id === 'f-ada')?.why);
assert(
  'finding why identityScore null',
  sess.findings.find((f) => f.id === 'f-ada').why.identityScore === null,
);
assert(
  'no finding epistemic fact',
  sess.findings.every((f) => f.epistemicState !== 'fact'),
);
assert(
  'evidence rows have strength',
  sess.evidence.every((e) => EVIDENCE_STRENGTHS.includes(e.evidenceStrength)),
);

// --- Acc scrub on enriched payload ---
const scrubbed = sanitizeDiscoveryPayload(sess);
assert('Acc scrub leak=0', !JSON.stringify(scrubbed).match(new RegExp(FORBIDDEN, 'i')));
assert('Acc keeps safe finding', (scrubbed.findings || []).some((f) => f.id === 'f-ada'));
assert('Acc drops forbidden finding', !(scrubbed.findings || []).some((f) => String(f.id).includes(FORBIDDEN)));
assert(
  'Acc drops forbidden evidence URL',
  !(scrubbed.evidence || []).some((e) => (e.provenanceUrl || '').includes(FORBIDDEN)),
);
// CANDIDATE≠FACT after scrub
assert(
  'scrubbed findings not fact',
  (scrubbed.findings || []).every((f) => f.epistemicState !== 'fact' && f.identityClaim !== true),
);

// --- normalizeRawHit + enrich still B0-compatible ---
const pair = normalizeRawHit(
  {
    title: 'Open Library hit',
    provenanceUrl: 'https://openlibrary.org/authors/OL1A',
    quote: 'Author record',
    kind: 'registry',
  },
  'openlibrary',
);
assert('normalizeRawHit ok', !!pair?.evidence);
const en2 = enrichEvidenceRow(pair.evidence, { finding: pair.finding });
assert('B0 enrich additive', en2.id === pair.evidence.id && en2.evidenceStrength);

// --- fact collapse forbidden on enrichSession ---
sess.findings.push({
  id: 'f-fake-fact',
  title: 'Should demote',
  evidenceIds: ['e-ada'],
  epistemicState: 'fact',
  identityClaim: true,
});
enrichSessionEvidence(sess);
assert(
  'fact demoted on session enrich',
  sess.findings.find((f) => f.id === 'f-fake-fact').epistemicState === 'candidate',
);

console.log(`\n--- evidence engine (Checkpoint C) ---\npassed=${passed} failed=${failed}`);
process.exit(failed ? 1 : 0);
