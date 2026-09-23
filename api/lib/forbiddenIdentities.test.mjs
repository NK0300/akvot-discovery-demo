/**
 * Acc P0 forbidden identities — strip / invariant / version
 * Run: node api/lib/forbiddenIdentities.test.mjs
 */
import {
  FORBIDDEN_IDENTITY_QIDS,
  FORBIDDEN_IDENTITIES_VERSION,
  normalizeQid,
  extractQid,
  isForbiddenQid,
  valueHasForbidden,
  redactForbiddenQidsInText,
  payloadContainsForbidden,
  stripForbiddenFromPayload,
  sanitizeCandidatesPayload,
  extractPayloadQids,
} from './forbiddenIdentities.js';
import {
  attachOrchestratorFields,
  revalidateDomainSafePayload,
  mayCommitDossier,
  decideStage,
  isTrustedWikiSeed,
} from './orchestrator.js';

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) { passed++; console.log('PASS', name); }
  else { failed++; console.error('FAIL', name); }
}

// --- version / SoT ---
assert('version is 2026-09-19.1', FORBIDDEN_IDENTITIES_VERSION === '2026-09-19.1');
assert('denylist non-empty (fail-closed test)', FORBIDDEN_IDENTITY_QIDS.length >= 1);
assert('denylist includes Q1701775', FORBIDDEN_IDENTITY_QIDS.includes('Q1701775'));
assert('units list each QID: Q1701775 only for v1', FORBIDDEN_IDENTITY_QIDS.join(',') === 'Q1701775');

// --- normalize / extract ---
assert('normalize Q1701775', normalizeQid('Q1701775') === 'Q1701775');
assert('normalize q1701775', normalizeQid('q1701775') === 'Q1701775');
assert('extract wd-Q1701775', extractQid('wd-Q1701775') === 'Q1701775');
assert('extract wiki URL', extractQid('https://www.wikidata.org/wiki/Q1701775') === 'Q1701775');
assert('extract entity URL', extractQid('https://www.wikidata.org/entity/Q1701775') === 'Q1701775');
assert('isForbidden Q1701775', isForbiddenQid('Q1701775') === true);
assert('isForbidden wd-Q1701775', isForbiddenQid('wd-Q1701775') === true);
assert('not forbidden Q6258357', isForbiddenQid('Q6258357') === false);
assert('not forbidden Assaf Q47507930', isForbiddenQid('Q47507930') === false);

// --- strip candidate wd-Q1701775 ---
const poisoned = {
  uiState: 'candidates',
  qid: null,
  candidates: [
    {
      id: 'wd-Q1701775',
      label: 'John Smith (American politician from New York)',
      score: 0.9,
      why: ['Wikidata registry', 'match: New York'],
      sourcesPreview: [
        { url: 'https://www.wikidata.org/wiki/Q1701775', title: 'Q1701775' },
        { url: 'https://www.wikidata.org/w/index.php?search=John%20Smith', title: 'search' },
      ],
    },
    {
      id: 'wd-Q6258357',
      label: 'John Smith (patriarch)',
      score: 0.9,
      sourcesPreview: [{ url: 'https://www.wikidata.org/wiki/Q6258357', title: 'Q6258357' }],
    },
    {
      id: 'viaf-4952029',
      label: 'John Smith, 1580-1631',
      score: 0.77,
      sourcesPreview: [{ url: 'https://viaf.org/viaf/4952029/', title: 'VIAF' }],
    },
  ],
  sources: [
    { url: 'https://www.wikidata.org/wiki/Q1701775', title: 'John Smith — politician', kind: 'Wikidata', group: 'identity' },
    { url: 'https://www.wikidata.org/wiki/Q6258357', title: 'patriarch', kind: 'Wikidata', group: 'identity' },
    { url: 'https://viaf.org/viaf/4952029/', title: 'VIAF', kind: 'VIAF', group: 'identity' },
  ],
};

assert('before strip payloadContainsForbidden', payloadContainsForbidden(poisoned) === true);

const { payload: stripped, strippedCount, strippedIds } = stripForbiddenFromPayload(poisoned);
assert('strip removes wd-Q1701775 candidate', !stripped.candidates.some((c) => /Q1701775/i.test(String(c.id))));
assert('strip removes sources URL Q1701775', !stripped.sources.some((s) => /Q1701775/i.test(String(s.url))));
assert('strip preserves non-forbidden WD Q6258357', stripped.candidates.some((c) => c.id === 'wd-Q6258357'));
assert('strip preserves VIAF', stripped.candidates.some((c) => c.id === 'viaf-4952029'));
assert('strip preserves Q6258357 source', stripped.sources.some((s) => /Q6258357/.test(String(s.url))));
assert('strippedIds includes Q1701775', strippedIds.includes('Q1701775'));
assert('strippedCount >= 1', strippedCount >= 1);
assert('after strip invariant holds', payloadContainsForbidden(stripped) === false);
assert('extractPayloadQids has no forbidden', !extractPayloadQids(stripped).includes('Q1701775'));

// --- top qid belt ---
const withTop = stripForbiddenFromPayload({
  uiState: 'dossier',
  qid: 'Q1701775',
  candidates: [],
  sources: [{ url: 'https://www.wikidata.org/wiki/Q1701775' }],
});
assert('top qid belt clears forbidden', withTop.payload.qid == null);
assert('top qid belt strips source', !(withTop.payload.sources || []).some((s) => /Q1701775/.test(String(s.url || ''))));

// --- sanitizeCandidatesPayload / attach ---
const sanitized = sanitizeCandidatesPayload(poisoned);
assert('sanitize drops forbidden', payloadContainsForbidden(sanitized) === false);
assert('sanitize sets version', sanitized.forbiddenIdentitiesVersion === '2026-09-19.1');

const stage = {
  uiState: 'candidates',
  scenario: 'foreign',
  confidence: 'low',
  needContextFields: ['country', 'city', 'org', 'role'],
  messageKey: 'pick_one',
  candidates: poisoned.candidates,
};
const attached = attachOrchestratorFields({
  mode: 'candidates',
  label: 'John Smith',
  qid: null,
  sources: poisoned.sources,
  candidates: poisoned.candidates,
  photo: null,
  images: [],
}, stage);
assert('attach scrub: no Q1701775 in candidates', !(attached.candidates || []).some((c) => /Q1701775/i.test(String(c.id || ''))));
assert('attach scrub: no Q1701775 in sources', !(attached.sources || []).some((s) => /Q1701775/i.test(String(s.url || ''))));
assert('attach scrub invariant', payloadContainsForbidden(attached) === false);
assert('attach preserves VIAF/other WD', (attached.candidates || []).some((c) => c.id === 'viaf-4952029' || c.id === 'wd-Q6258357'));

// --- revalidate cache HIT path with poisoned candidates ---
const reval = revalidateDomainSafePayload({
  uiState: 'candidates',
  scenario: 'foreign',
  mode: 'candidates',
  label: 'John Smith',
  qid: null,
  faces: false,
  photo: null,
  images: [],
  sources: poisoned.sources,
  candidates: poisoned.candidates,
  ambiguous: true,
  needCandidatePick: true,
  confidence: 'low',
  messageKey: 'pick_one',
}, {
  q: 'John Smith',
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
  softAmbiguous: true,
});
assert('revalidate scrub invariant', payloadContainsForbidden(reval.payload) === false);
assert('revalidate no wd-Q1701775 candidate', !(reval.payload.candidates || []).some((c) => /Q1701775/i.test(String(c.id || ''))));

// --- existing P0 commit guards still hold (dossier path) ---
assert('P0 mayCommit Smith+Q1701775 still false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q1701775', ambiguous: false, seeded: false },
  softAmbiguous: false,
  sources: [
    { url: 'https://en.wikipedia.org/wiki/John_Smith', title: 'John Smith IBM New York' },
    { url: 'https://ibm.com/people/john', title: 'IBM New York' },
  ],
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
}).ok === false);
assert('P0 isTrustedWikiSeed Smith+Q1701775 fake → false', isTrustedWikiSeed('John Smith', {
  seeded: true, qid: 'Q1701775', ambiguous: false,
}) === false);
assert('Assaf trusted seed still true', isTrustedWikiSeed('Assaf Rappaport', {
  seeded: true, qid: 'Q47507930', ambiguous: false,
}) === true);
assert('mayCommit Assaf seeded still true', mayCommitDossier({
  q: 'Assaf Rappaport',
  wiki: { found: true, qid: 'Q47507930', seeded: true, ambiguous: false },
  softAmbiguous: false,
  sources: [],
  ctx: {},
}).ok === true);

const smithStage = decideStage({
  q: 'John Smith',
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
  wiki: { found: true, qid: 'Q1701775', ambiguous: false, seeded: true },
  softAmbiguous: false,
  rich: true,
  wikiCommitted: true,
  sources: [{ url: 'https://ibm.com/a', title: 'IBM' }, { url: 'https://ny.example/b', title: 'NY' }],
  candidates: [
    { label: 'IBM', why: ['IBM'], sourcesPreview: [{ url: 'https://ibm.com/a' }] },
    { label: 'NY', why: ['NY'], sourcesPreview: [{ url: 'https://ny.example/b' }] },
  ],
});
assert('P0 decideStage FAKE seed NOT dossier', smithStage.uiState !== 'dossier');

// --- fail-safe: sanitize never throws raw ---
const safeEmpty = sanitizeCandidatesPayload(null);
assert('sanitize null passthrough', safeEmpty == null);


// --- SoT redactForbiddenQidsInText (LOCAL-WAVE-FF-ACC) ---
{
  const q = FORBIDDEN_IDENTITY_QIDS[0];
  const red = redactForbiddenQidsInText(`see ${q} and https://www.wikidata.org/wiki/${q}`);
  assert('redact removes denylist QID token', !valueHasForbidden(red) && !red.includes(q));
  assert('redact keeps marker', /REDACTED_QID/i.test(red));
  assert('redact leaves safe Q42', redactForbiddenQidsInText('Q42 ok').includes('Q42'));
  assert('redact null-safe', redactForbiddenQidsInText(null) === '');
}

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
