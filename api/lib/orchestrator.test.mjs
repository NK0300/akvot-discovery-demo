/**
 * Orchestrator regression gates — run: node api/lib/orchestrator.test.mjs
 * Aligned with בודק 12-gate + דיוק B/D recommendations. No network.
 */
import {
  classifyScenario,
  decideStage,
  candidateHasEvidence,
  filterEvidencedCandidates,
  evidenceScore,
  canCommitWithoutFocus,
  mayCommitDossier,
  hasOrgCityEvidenceMatch,
  isCommonLatinAmbiguousName,
  canCommitIdentity,
  attachOrchestratorFields,
  isCommonHeBareName,
  revalidateDomainSafePayload,
  isTrustedWikiSeed,
  sanitizeWikiSeeded,
} from './orchestrator.js';
import { resolveKnownIdentityQid, isSeedAdjacentLatinNearMiss } from './knownIdentities.js';
import {
  FORBIDDEN_IDENTITIES_VERSION,
  payloadContainsForbidden,
  sanitizeCandidatesPayload,
} from './forbiddenIdentities.js';

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) { passed++; console.log('PASS', name); }
  else { failed++; console.error('FAIL', name); }
}

// --- classifyScenario ---
assert('C identifier phone', classifyScenario({ q: '', ctx: { phone: '050', phoneRaw: '050' } }) === 'identifier');
assert('C identifier email', classifyScenario({ q: 'x', ctx: { email: 'a@b.com' } }) === 'identifier');
assert('A known wikiCommitted', classifyScenario({ q: 'ביבי', wikiCommitted: true, rich: true }) === 'known');
assert('D foreign Latin', classifyScenario({ q: 'John Smith', ctx: {} }) === 'foreign');
assert('D foreign country', classifyScenario({ q: 'דוד כהן', ctx: { country: 'US' } }) === 'foreign');
assert('B stranger HE common', classifyScenario({ q: 'דני כהן', softAmbiguous: true }) === 'stranger');

// --- evidence gate ---
assert('no evidence empty', !candidateHasEvidence({ label: 'x', why: [], sourcesPreview: [] }));
assert('no evidence generic why', !candidateHasEvidence({ label: 'x', why: ['התאמה מחיפוש ציבורי'], sourcesPreview: [] }));
assert('evidence https', candidateHasEvidence({ label: 'x', why: [], sourcesPreview: [{ url: 'https://example.com/a', title: 'a' }] }));
assert('evidence specific why', candidateHasEvidence({ label: 'x', why: ['תפקיד: מהנדס Check Point'], sourcesPreview: [] }));
assert('reject http (not https)', !candidateHasEvidence({ sourcesPreview: [{ url: 'http://insecure.example/a' }] }));
assert('filter keeps 1 of 2', filterEvidencedCandidates([
  { label: 'a', why: ['התאמה מחיפוש ציבורי'], sourcesPreview: [] },
  { label: 'b', why: ['IBM Research'], sourcesPreview: [{ url: 'https://research.ibm.com/x' }] },
]).length === 1);

// --- decideStage product gates ---
const bareCohen = decideStage({
  q: 'דני כהן',
  ctx: {},
  softAmbiguous: true,
  candidates: [
    { label: 'דני כהן (מדען)', why: ['התאמה מחיפוש ציבורי'], sourcesPreview: [{ url: 'https://he.wikipedia.org/wiki/x' }] },
    { label: 'דני כהן (זמר)', why: ['תפקיד: זמר'], sourcesPreview: [{ url: 'https://he.wikipedia.org/wiki/y' }] },
  ],
});
assert('B bare → need_context (not celebrity list)', bareCohen.uiState === 'need_context' && bareCohen.candidates.length === 0);

const celeb = decideStage({
  q: 'בנימין נתניהו',
  ctx: {},
  wiki: { found: true, qid: 'Q58219', extract: 'ראש ממשלה...' },
  wikiCommitted: true,
  rich: true,
  softAmbiguous: false,
  sources: [{ url: 'https://he.wikipedia.org/wiki/x' }, { url: 'https://www.wikidata.org/wiki/Q58219' }],
  candidates: [],
});
assert('A celeb → dossier', celeb.uiState === 'dossier' && celeb.scenario === 'known');

const johnIbm = decideStage({
  q: 'John Smith',
  ctx: { org: 'IBM', city: 'New York', any: true },
  softAmbiguous: true,
  returnCandidates: true,
  candidates: [
    { label: 'John R. Smith IBM', why: ['IBM Research'], score: 0.95, sourcesPreview: [
      { url: 'https://research.ibm.com/a', title: 'IBM New York' },
      { url: 'https://scholar.google.com/b', title: 'Scholar' },
    ]},
    { label: 'John Smith (mayor)', why: ['role: mayor'], sourcesPreview: [{ url: 'https://en.wikipedia.org/wiki/John_Smith' }] },
  ],
});
assert('D + ctx evidenced → candidates', johnIbm.uiState === 'candidates' && johnIbm.candidates.length === 2 && johnIbm.scenario === 'foreign');

const johnBare = decideStage({
  q: 'John Smith',
  ctx: {},
  softAmbiguous: true,
  returnCandidates: true,
  candidates: [
    { label: 'John Smith (politician)', why: ['role: politician'], sourcesPreview: [{ url: 'https://en.wikipedia.org/wiki/a' }] },
    { label: 'John Smith (physician)', why: ['role: physician'], sourcesPreview: [{ url: 'https://en.wikipedia.org/wiki/b' }] },
  ],
});
assert('D bare softAmb → need_context', johnBare.uiState === 'need_context');

const phoneThin = decideStage({
  q: '',
  ctx: { phone: '050', phoneRaw: '050', phoneOnly: true },
  phoneSignal: false,
  softAmbiguous: false,
});
assert('C weak phone → thin', phoneThin.uiState === 'thin' && phoneThin.scenario === 'identifier');

const afterCtxNoEvidence = decideStage({
  q: 'דני כהן',
  ctx: { city: 'תל אביב', org: 'Check Point', any: true },
  softAmbiguous: true,
  returnCandidates: true,
  candidates: [
    { label: 'דני כהן (מדען)', why: ['התאמה מחיפוש ציבורי'], sourcesPreview: [] },
    { label: 'דני כהן (זמר)', why: ['התאמה מחיפוש ציבורי'], sourcesPreview: [] },
  ],
});
assert('B + ctx but no evidence → thin', afterCtxNoEvidence.uiState === 'thin');

// --- evidenceScore / commit ---
const es = evidenceScore({
  ctx: { org: 'ibm', city: 'new york' },
  sources: [
    { url: 'https://research.ibm.com/x', title: 'IBM New York' },
    { url: 'https://scholar.google.com/y', title: 'pub' },
  ],
  candidate: { score: 0.9 },
});
assert('evidenceScore strong ≥0.75', es >= 0.75);
assert('commit without focus when strong', canCommitWithoutFocus({
  focus: '',
  wikiCommitted: false,
  sources: [
    { url: 'https://research.ibm.com/x', title: 'IBM New York' },
    { url: 'https://scholar.google.com/y', title: 'pub' },
  ],
  ctx: { org: 'ibm', city: 'new york' },
  topCandidate: { score: 0.9 },
}));
assert('no commit weak evidence', !canCommitWithoutFocus({
  focus: '',
  wikiCommitted: false,
  sources: [{ url: 'https://example.com/only' }],
  ctx: {},
  topCandidate: { score: 0.2 },
}));
assert('commit with focus always', canCommitWithoutFocus({ focus: 'John Smith', wikiCommitted: false, sources: [], ctx: {} }));


// --- HARD: common HE bare never dossiers even with fake wikiExact ---
assert('isCommonHeBareName דני כהן', isCommonHeBareName('דני כהן'));
assert('נתניהו not common-surname heuristic', isCommonHeBareName('בנימין נתניהו') === false);
assert('John Smith not HE common', isCommonHeBareName('John Smith') === false);

const dannyWrongQid = decideStage({
  q: 'דני כהן',
  ctx: {},
  wiki: { found: true, qid: 'Q999', extract: 'someone', ambiguous: false },
  wikiCommitted: true,
  rich: true,
  softAmbiguous: false,
  sources: [{ url: 'https://he.wikipedia.org/wiki/x' }, { url: 'https://www.wikidata.org/wiki/Q999' }],
  candidates: [],
});
assert('דני כהן wikiExact still need_context', dannyWrongQid.uiState === 'need_context' && dannyWrongQid.candidates.length === 0);

const dannyAttached = attachOrchestratorFields(
  { mode: 'wiki', photo: 'https://upload.wikimedia.org/x.jpg', images: [{ url: 'https://x' }], candidates: [{ label: 'x' }] },
  dannyWrongQid,
);
assert('need_context strips photo', dannyAttached.photo == null && (dannyAttached.images || []).length === 0);

// --- attachOrchestratorFields ---
const attached = attachOrchestratorFields(
  { mode: 'ambiguous', candidates: [{ label: 'noise' }], thin: false },
  bareCohen,
);
assert('attach clears candidates on need_context', attached.uiState === 'need_context' && attached.needContext === true && attached.candidates.length === 0);
assert('attach sets messageKey', attached.messageKey === 'common_name');


// dossier without qid must not be scenario=known / wiki vibe
const googleDossier = decideStage({
  q: 'בנימין נתניהו',
  ctx: {},
  wiki: { found: false },
  softAmbiguous: false,
  rich: false,
  sources: [
    { url: 'https://www.reuters.com/a', title: 'Netanyahu' },
    { url: 'https://www.bbc.com/b', title: 'Netanyahu' },
    { url: 'https://www.haaretz.com/c', title: 'ביבי' },
  ],
  candidates: [{ label: 'בנימין נתניהו', score: 0.9, sourcesPreview: [
    { url: 'https://www.reuters.com/a' }, { url: 'https://www.bbc.com/b' },
  ], why: ['prime minister'] }],
});
assert('google recovery not known-without-qid', googleDossier.scenario !== 'known');
assert('google recovery without commitOk is not hollow wiki-known', !(googleDossier.uiState === 'dossier' && googleDossier.scenario === 'known'));

const wikiNoQid = decideStage({
  q: 'בנימין נתניהו',
  ctx: {},
  wiki: { found: true, extract: 'x'.repeat(80) },
  rich: true,
  softAmbiguous: false,
  sources: [{ url: 'https://he.wikipedia.org/wiki/x' }, { url: 'https://www.wikidata.org/wiki/Qx' }],
});
assert('rich without qid is not known', wikiNoQid.scenario !== 'known' || wikiNoQid.uiState !== 'dossier');



// --- P0 commit gate: mayCommitDossier / Smith+email / seeded ---
assert('canCommitIdentity aliases mayCommitDossier', canCommitIdentity === mayCommitDossier);

const smithOrgWiki = decideStage({
  q: 'John Smith',
  ctx: { org: 'Acme', city: 'Boston', any: true },
  wiki: { found: true, qid: 'Q12345', ambiguous: false },
  softAmbiguous: true,
  rich: true,
  wikiCommitted: true,
  sources: [
    { url: 'https://en.wikipedia.org/wiki/John_Smith', title: 'John Smith' },
    { url: 'https://example.com/x', title: 'unrelated' },
  ],
  candidates: [
    { label: 'John Smith (actor)', why: ['role: actor'], sourcesPreview: [{ url: 'https://en.wikipedia.org/wiki/a' }] },
    { label: 'John Smith (mayor)', why: ['role: mayor'], sourcesPreview: [{ url: 'https://en.wikipedia.org/wiki/b' }] },
  ],
});
assert('Smith+org/city+wikiQID softAmb/latin → NOT dossier', smithOrgWiki.uiState !== 'dossier');
assert('Smith+org softAmb → candidates|need_context|thin', ['candidates', 'need_context', 'thin'].includes(smithOrgWiki.uiState));

const smithEmail = decideStage({
  q: 'John Smith',
  ctx: { email: 'jsmith@acme.com', any: true },
  wiki: { found: true, qid: 'Q99999', ambiguous: false },
  softAmbiguous: false,
  rich: true,
  wikiCommitted: true,
  sources: [{ url: 'https://en.wikipedia.org/wiki/John_Smith', title: 'John Smith' }],
  candidates: [],
});
assert('Smith+email+wikiQID → NOT dossier', smithEmail.uiState !== 'dossier');
assert('Smith+email stays identifier scenario', smithEmail.scenario === 'identifier');

const netanyahuSeeded = decideStage({
  q: 'בנימין נתניהו',
  ctx: {},
  wiki: { found: true, qid: 'Q58219', extract: 'ראש ממשלה', seeded: true, ambiguous: false },
  softAmbiguous: false,
  rich: true,
  sources: [{ url: 'https://he.wikipedia.org/wiki/x' }, { url: 'https://www.wikidata.org/wiki/Q58219' }],
  candidates: [],
});
assert('נתניהו seeded → dossier', netanyahuSeeded.uiState === 'dossier' && netanyahuSeeded.scenario === 'known');

const orlySeeded = decideStage({
  q: 'אורלי לוי',
  ctx: {},
  wiki: { found: true, qid: 'Q466537', seeded: true, ambiguous: false, extract: 'חברת כנסת' },
  softAmbiguous: false,
  rich: true,
  sources: [{ url: 'https://he.wikipedia.org/wiki/x' }],
  candidates: [],
});
assert('אורלי לוי seeded → dossier', orlySeeded.uiState === 'dossier');

assert('mayCommit email alone false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q1', ambiguous: false },
  softAmbiguous: false,
  sources: [{ url: 'https://en.wikipedia.org/wiki/x', title: 'x' }],
  ctx: { email: 'a@b.com' },
}).ok === false);

assert('mayCommit phone alone false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q1', ambiguous: false },
  ctx: { phone: '0501234567' },
  sources: [{ url: 'https://en.wikipedia.org/wiki/x' }],
}).ok === false);

assert('mayCommit seeded true', mayCommitDossier({
  q: 'בנימין נתניהו',
  wiki: { found: true, qid: 'Q58219', seeded: true, ambiguous: false },
  softAmbiguous: false,
  sources: [],
  ctx: {},
}).ok === true);

assert('mayCommit HE wiki exact true', mayCommitDossier({
  q: 'בנימין נתניהו',
  wiki: { found: true, qid: 'Q58219', ambiguous: false },
  softAmbiguous: false,
  sources: [],
  ctx: {},
}).ok === true);

assert('canCommitWithoutFocus email alone false', !canCommitWithoutFocus({
  focus: '',
  wikiCommitted: true,
  sources: [{ url: 'https://en.wikipedia.org/wiki/x' }],
  ctx: { email: 'a@b.com' },
  q: 'John Smith',
  wiki: { found: true, qid: 'Q1', ambiguous: false },
}));

assert('canCommitWithoutFocus seeded true', canCommitWithoutFocus({
  focus: '',
  wikiCommitted: true,
  sources: [],
  ctx: {},
  q: 'נתניהו',
  wiki: { found: true, qid: 'Q58219', seeded: true, ambiguous: false },
}));

// --- P1: Latin wikiExact parity + softAmb / Smith safety ---
assert('mayCommit Latin wikiExact !softAmb → ok', mayCommitDossier({
  q: 'Angela Merkel',
  wiki: { found: true, qid: 'Q567', ambiguous: false },
  softAmbiguous: false,
  sources: [],
  ctx: {},
}).ok === true);

assert('mayCommit Latin softAmb → false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q42', ambiguous: false },
  softAmbiguous: true,
  sources: [],
  ctx: {},
}).ok === false);

assert('mayCommit Latin wikiExact email alone false', mayCommitDossier({
  q: 'Angela Merkel',
  wiki: { found: true, qid: 'Q567', ambiguous: false },
  softAmbiguous: false,
  sources: [{ url: 'https://en.wikipedia.org/wiki/Angela_Merkel' }],
  ctx: { email: 'a@b.com' },
}).ok === false);

assert('mayCommit Latin seeded true', mayCommitDossier({
  q: 'Zehava Galon',
  wiki: { found: true, qid: 'Q2630062', seeded: true, ambiguous: false },
  softAmbiguous: false,
  sources: [],
  ctx: {},
}).ok === true);

const merkelExact = decideStage({
  q: 'Angela Merkel',
  ctx: {},
  wiki: { found: true, qid: 'Q567', ambiguous: false },
  softAmbiguous: false,
  rich: true,
  wikiCommitted: true,
  sources: [{ url: 'https://en.wikipedia.org/wiki/Angela_Merkel' }],
  candidates: [],
});
assert('Latin wikiExact Merkel → dossier', merkelExact.uiState === 'dossier' && merkelExact.scenario === 'known');

const smithSoft = decideStage({
  q: 'John Smith',
  ctx: {},
  wiki: { found: true, qid: 'Q42', ambiguous: false },
  softAmbiguous: true,
  rich: true,
  wikiCommitted: false,
  sources: [{ url: 'https://en.wikipedia.org/wiki/John_Smith' }],
  candidates: [],
});
assert('Latin Smith softAmb + QID → NOT dossier', smithSoft.uiState !== 'dossier');

const smithCtxNoEv = decideStage({
  q: 'John Smith',
  ctx: { org: 'Acme', city: 'Boston', any: true },
  wiki: { found: false },
  softAmbiguous: true,
  returnCandidates: true,
  sources: [{ url: 'https://example.com/only' }],
  candidates: [
    { label: 'John Smith', why: ['התאמה מחיפוש ציבורי'], sourcesPreview: [] },
  ],
});
assert('Smith+ctx still NOT dossier without evidence', smithCtxNoEv.uiState !== 'dossier');

// --- P1 GATE: resolveKnownIdentityQid SPEC IDs (דיוק P1-CASES) ---
// N01–N07 → Q43723
assert('N01 resolve בנימין נתניהו → Q43723', resolveKnownIdentityQid('בנימין נתניהו') === 'Q43723');
assert('N02 resolve נתניהו → Q43723', resolveKnownIdentityQid('נתניהו') === 'Q43723');
assert('N03 resolve ביבי נתניהו → Q43723', resolveKnownIdentityQid('ביבי נתניהו') === 'Q43723');
assert('N04 resolve ביבי alone → Q43723', resolveKnownIdentityQid('ביבי') === 'Q43723');
assert('N05 resolve Benjamin Netanyahu → Q43723', resolveKnownIdentityQid('Benjamin Netanyahu') === 'Q43723');
assert('N06 resolve Bibi Netanyahu → Q43723', resolveKnownIdentityQid('Bibi Netanyahu') === 'Q43723');
assert('N07 resolve Netanyahu alone → Q43723', resolveKnownIdentityQid('Netanyahu') === 'Q43723');
// G01–G03 → Q2630062
assert('G01 resolve זהבה גלאון → Q2630062', resolveKnownIdentityQid('זהבה גלאון') === 'Q2630062');
assert('G02 resolve Zehava Galon → Q2630062', resolveKnownIdentityQid('Zehava Galon') === 'Q2630062');
assert('G03 resolve Zahava Gal-On fold → Q2630062', resolveKnownIdentityQid('Zahava Gal-On') === 'Q2630062');
// M01–M02 → Q567 (M02 Merkel alone uniquely seeded — documented policy)
assert('M01 resolve Angela Merkel → Q567', resolveKnownIdentityQid('Angela Merkel') === 'Q567');
assert('M02 resolve Merkel alone → Q567', resolveKnownIdentityQid('Merkel') === 'Q567');
// P01–P02 Lapid → Q1396120
assert('P01 resolve יאיר לפיד → Q1396120', resolveKnownIdentityQid('יאיר לפיד') === 'Q1396120');
assert('P02 resolve לפיד alone → Q1396120', resolveKnownIdentityQid('לפיד') === 'Q1396120');
// S01-class / P03: NEVER bare common / softAmb Latin
assert('S01-class resolve דני כהן → null', resolveKnownIdentityQid('דני כהן') === null);
assert('S01-class resolve John Smith → null', resolveKnownIdentityQid('John Smith') === null);
assert('P03 resolve לוי alone → null', resolveKnownIdentityQid('לוי') === null);
assert('P03 resolve כהן alone → null', resolveKnownIdentityQid('כהן') === null);
// KEEP peers / extras
assert('resolve Barack Obama peer', resolveKnownIdentityQid('Barack Obama') === 'Q76');
assert('N08 resolve אורלי לוי → Q466537', resolveKnownIdentityQid('אורלי לוי') === 'Q466537');
assert('resolve parenthetical strip', resolveKnownIdentityQid('בנימין נתניהו (פוליטיקאי)') === 'Q43723');
// P2: Assaf class-level seed (full unique name) — NOT Assaf-only if
assert('P2-A01 resolve Assaf Rappaport → Q47507930', resolveKnownIdentityQid('Assaf Rappaport') === 'Q47507930');
assert('P2-A01 resolve Asaf Rappaport → Q47507930', resolveKnownIdentityQid('Asaf Rappaport') === 'Q47507930');
assert('P2-A02 fold Assaf Rapaport → Q47507930', resolveKnownIdentityQid('Assaf Rapaport') === 'Q47507930');
assert('P2-A03 resolve אסף רפפורט → Q47507930', resolveKnownIdentityQid('אסף רפפורט') === 'Q47507930');
assert('P2-A04 peer Matti Friedman → Q18389499', resolveKnownIdentityQid('Matti Friedman') === 'Q18389499');
assert('P2-A05 Assaf Smith → null (precision)', resolveKnownIdentityQid('Assaf Smith') === null);
assert('P2-A06 Rappaport alone → null (no surname bleed)', resolveKnownIdentityQid('Rappaport') === null);
assert('P2-A06 John Rappaport → null', resolveKnownIdentityQid('John Rappaport') === null);

// P2 entity-match: URL-noise short org token must NOT match
assert('P2-E01 URL-noise org ib → false', hasOrgCityEvidenceMatch(
  [{ url: 'https://example.com/path/ib/noise', title: 'Unrelated', note: '' }],
  { org: 'ib', city: '' },
) === false);
assert('P2-E01 title token IBM → true', hasOrgCityEvidenceMatch(
  [{ url: 'https://example.com/x', title: 'Works at IBM Research', note: '' }],
  { org: 'IBM', city: '' },
) === true);
assert('P2-E01 URL-only long token boston in path → true (len≥4 boundary)', hasOrgCityEvidenceMatch(
  [{ url: 'https://example.com/jobs/boston/role', title: '', note: '' }],
  { org: '', city: 'boston' },
) === true);


// --- P1 GATE: mayCommit SPEC safety (threshold 0.75 / softAmb / email / seeded) ---
assert('mayCommit Smith softAmb → false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q42', ambiguous: false },
  softAmbiguous: true,
  sources: [],
  ctx: {},
  threshold: 0.75,
}).ok === false);
assert('mayCommit email alone → false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q1', ambiguous: false },
  softAmbiguous: false,
  sources: [{ url: 'https://en.wikipedia.org/wiki/x' }],
  ctx: { email: 'a@b.com' },
}).ok === false);
assert('mayCommit seeded Netanyahu → true', mayCommitDossier({
  q: 'בנימין נתניהו',
  wiki: { found: true, qid: 'Q43723', seeded: true, ambiguous: false },
  softAmbiguous: false,
  sources: [],
  ctx: {},
  threshold: 0.75,
}).ok === true);
assert('mayCommit bare junk → false (threshold intact)', mayCommitDossier({
  q: 'x',
  wiki: {},
  softAmbiguous: false,
  sources: [],
  ctx: {},
  threshold: 0.75,
}).ok === false);


// --- P2 STOP: Smith+ctx+US must NOT wikiExact to dossier (pretty-wrong Q1701775) ---
assert('Smith-class detector', isCommonLatinAmbiguousName('John Smith') === true);
assert('Assaf not Smith-class', isCommonLatinAmbiguousName('Assaf Rappaport') === false);
assert('mayCommit Smith wikiExact alone → false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q1701775', ambiguous: false },
  softAmbiguous: false,
  sources: [
    { url: 'https://en.wikipedia.org/wiki/John_Smith', title: 'John Smith' },
    { url: 'https://www.wikidata.org/wiki/Q1701775', title: 'Q1701775' },
  ],
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
  threshold: 0.75,
}).ok === false);
assert('mayCommit Smith softAmb + ctx → false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q1701775', ambiguous: true },
  softAmbiguous: true,
  sources: [
    { url: 'https://example.com/ibm/us/ny', title: 'noise' },
    { url: 'https://example.com/other', title: 'more' },
  ],
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
  threshold: 0.75,
}).ok === false);
assert('mayCommit country=us does not unlock latin via https noise', mayCommitDossier({
  q: 'John Smith',
  wiki: {},
  softAmbiguous: false,
  sources: [
    { url: 'https://example.com/a', title: 'x' },
    { url: 'https://example.com/b', title: 'y' },
  ],
  ctx: { country: 'US', any: true },
  threshold: 0.75,
}).ok === false);


assert('mayCommit Smith strongEvidence still false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q1701775', ambiguous: false },
  softAmbiguous: false,
  sources: [
    { url: 'https://ibm.com/a', title: 'John Smith at IBM New York' },
    { url: 'https://news.example/b', title: 'IBM New York hire John Smith' },
    { url: 'https://wiki.example/c', title: 'Profile' },
  ],
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
  threshold: 0.75,
}).ok === false);


assert('T-C6 near-miss detector John Rappaport', isSeedAdjacentLatinNearMiss('John Rappaport') === true);
assert('Assaf full name not near-miss', isSeedAdjacentLatinNearMiss('Assaf Rappaport') === false);
assert('mayCommit John Rappaport wikiExact → false', mayCommitDossier({
  q: 'John Rappaport',
  wiki: { found: true, qid: 'Q105094696', ambiguous: false },
  softAmbiguous: false,
  sources: [
    { url: 'https://www.wikidata.org/wiki/Q105094696', title: 'John Rappaport' },
    { url: 'https://en.wikipedia.org/wiki/x', title: 'x' },
  ],
  ctx: {},
  threshold: 0.75,
}).ok === false);
assert('mayCommit Assaf seeded still true', mayCommitDossier({
  q: 'Assaf Rappaport',
  wiki: { found: true, qid: 'Q47507930', seeded: true, ambiguous: false },
  softAmbiguous: false,
  sources: [],
  ctx: {},
  threshold: 0.75,
}).ok === true);



// --- P3: cache revalidate + Smith-class SoT (WARM pretty-wrong amplifier) ---
const poisonedSmith = {
  uiState: 'dossier',
  scenario: 'known',
  mode: 'wiki',
  label: 'John Smith',
  qid: 'Q1701775',
  photo: 'https://example.com/senator.jpg',
  images: [{ url: 'https://example.com/senator.jpg' }],
  sources: [
    { url: 'https://en.wikipedia.org/wiki/John_Smith', title: 'John Smith' },
    { url: 'https://www.wikidata.org/wiki/Q1701775', title: 'Q1701775' },
  ],
  candidates: [
    {
      label: 'John Smith (IBM)',
      why: ['org: IBM'],
      sourcesPreview: [{ url: 'https://example.com/ibm/john', title: 'IBM' }],
    },
    {
      label: 'John Smith (NY)',
      why: ['city: New York'],
      sourcesPreview: [{ url: 'https://example.com/ny/john', title: 'NY' }],
    },
  ],
  ambiguous: false,
  confidence: 'high',
  messageKey: 'dossier_ready',
};

const smithCtx = { org: 'IBM', city: 'New York', country: 'US', any: true };
const revalSmith = revalidateDomainSafePayload(poisonedSmith, {
  q: 'John Smith',
  ctx: smithCtx,
  focus: '',
});
assert('P3 revalidate demotes poisoned Smith dossier', revalSmith.demoted === true);
assert('P3 revalidate Smith+IBM → NOT dossier', revalSmith.payload.uiState !== 'dossier');
assert('P3 revalidate clears Smith qid', revalSmith.payload.qid == null);
assert('P3 revalidate clears Smith photo/faces', !revalSmith.payload.photo && !(revalSmith.payload.images || []).length);
assert('P3 revalidate faces not true', revalSmith.payload.faces !== true);
assert('P3 revalidate photoUrl cleared', !revalSmith.payload.photoUrl);
assert('P3 revalidate faces falsy', !revalSmith.payload.faces);
assert('P3 revalidate Smith+ctx → candidates|thin|need_context',
  ['candidates', 'thin', 'need_context'].includes(revalSmith.payload.uiState));

// Safe celeb dossier must NOT demote
const safeCeleb = {
  uiState: 'dossier',
  scenario: 'known',
  mode: 'wiki',
  label: 'בנימין נתניהו',
  qid: 'Q43723',
  seeded: true,
  photo: 'https://example.com/bib.jpg',
  images: [],
  sources: [{ url: 'https://he.wikipedia.org/wiki/x' }],
  candidates: [],
  ambiguous: false,
};
const revalCeleb = revalidateDomainSafePayload(safeCeleb, {
  q: 'בנימין נתניהו',
  ctx: {},
  wiki: { found: true, qid: 'Q43723', seeded: true, ambiguous: false },
  softAmbiguous: false,
});
assert('P3 revalidate seeded celeb stays dossier', revalCeleb.demoted === false && revalCeleb.payload.uiState === 'dossier');

// decideStage / attach: Smith-class without seed cannot yield dossier (even softAmb false + rich wiki)
const smithRichNoSoft = decideStage({
  q: 'John Smith',
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
  wiki: { found: true, qid: 'Q1701775', ambiguous: false },
  softAmbiguous: false,
  rich: true,
  wikiCommitted: true,
  sources: [
    { url: 'https://en.wikipedia.org/wiki/John_Smith', title: 'John Smith at IBM New York' },
    { url: 'https://ibm.com/people/john', title: 'IBM New York' },
  ],
  candidates: [
    { label: 'John Smith IBM', why: ['IBM'], sourcesPreview: [{ url: 'https://ibm.com/a' }] },
    { label: 'John Smith NY', why: ['NY'], sourcesPreview: [{ url: 'https://ny.example/b' }] },
  ],
});

assert('P3 decideStage Smith rich !softAmb → NOT dossier', smithRichNoSoft.uiState !== 'dossier');

const attachedSmith = attachOrchestratorFields({
  mode: 'wiki',
  label: 'John Smith',
  qid: 'Q1701775',
  photo: 'https://example.com/x.jpg',
  images: [{ url: 'https://example.com/x.jpg' }],
  sources: [{ url: 'https://en.wikipedia.org/wiki/John_Smith' }],
  candidates: smithRichNoSoft.candidates,
}, smithRichNoSoft);
assert('P3 attach Smith path uiState NOT dossier', attachedSmith.uiState !== 'dossier');
if (attachedSmith.uiState === 'candidates') {
  assert('P3 attach candidates clears primary qid/faces',
    attachedSmith.qid == null && attachedSmith.photo == null);
}

const postAttachReval = revalidateDomainSafePayload(attachedSmith, {
  q: 'John Smith',
  ctx: smithCtx,
});
assert('P3 post-attach revalidate still non-dossier', postAttachReval.payload.uiState !== 'dossier');

// --- P0 COLD: fake seeded / softAmb cleared must NOT dossier Smith+IBM+NY ---
assert('P0 isTrustedWikiSeed Assaf real', isTrustedWikiSeed('Assaf Rappaport', {
  seeded: true, qid: 'Q47507930', ambiguous: false,
}) === true);
assert('P0 isTrustedWikiSeed Smith+Q1701775 fake → false', isTrustedWikiSeed('John Smith', {
  seeded: true, qid: 'Q1701775', ambiguous: false,
}) === false);
assert('P0 sanitize strips fake Smith seed', sanitizeWikiSeeded('John Smith', {
  found: true, qid: 'Q1701775', seeded: true, ambiguous: false,
}).seeded === false);

assert('P0 mayCommit Smith+IBM+NY softF wikiExact → false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q1701775', ambiguous: false, seeded: false },
  softAmbiguous: false,
  sources: [
    { url: 'https://en.wikipedia.org/wiki/John_Smith', title: 'John Smith IBM New York' },
    { url: 'https://ibm.com/people/john', title: 'IBM New York' },
  ],
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
}).ok === false);

assert('P0 mayCommit Smith FAKE seeded Q1701775 → false', mayCommitDossier({
  q: 'John Smith',
  wiki: { found: true, qid: 'Q1701775', ambiguous: false, seeded: true },
  softAmbiguous: false,
  sources: [
    { url: 'https://en.wikipedia.org/wiki/John_Smith', title: 'John Smith' },
    { url: 'https://ibm.com/x', title: 'IBM New York' },
  ],
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
}).ok === false);

const smithFakeSeedStage = decideStage({
  q: 'John Smith',
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
  wiki: { found: true, qid: 'Q1701775', ambiguous: false, seeded: true },
  softAmbiguous: false,
  rich: true,
  wikiCommitted: true,
  sources: [
    { url: 'https://en.wikipedia.org/wiki/John_Smith', title: 'John Smith at IBM New York' },
    { url: 'https://ibm.com/people/john', title: 'IBM New York' },
  ],
  candidates: [
    { label: 'John Smith IBM', why: ['IBM'], sourcesPreview: [{ url: 'https://ibm.com/a' }] },
    { label: 'John Smith NY', why: ['NY'], sourcesPreview: [{ url: 'https://ny.example/b' }] },
  ],
});
assert('P0 decideStage Smith FAKE seeded → NOT dossier', smithFakeSeedStage.uiState !== 'dossier');

const poisonedFakeSeed = {
  uiState: 'dossier',
  scenario: 'known',
  mode: 'wiki+google',
  label: 'John Smith',
  qid: 'Q1701775',
  seeded: true,
  photo: 'https://example.com/senator.jpg',
  photoUrl: 'https://example.com/senator.jpg',
  faces: true,
  images: [{ url: 'https://example.com/senator.jpg' }],
  sources: [
    { url: 'https://en.wikipedia.org/wiki/John_Smith', title: 'John Smith' },
    { url: 'https://www.wikidata.org/wiki/Q1701775', title: 'Q1701775' },
  ],
  candidates: [
    { label: 'John Smith (IBM)', why: ['org: IBM'], sourcesPreview: [{ url: 'https://example.com/ibm/john', title: 'IBM' }] },
    { label: 'John Smith (NY)', why: ['city: New York'], sourcesPreview: [{ url: 'https://example.com/ny/john', title: 'NY' }] },
  ],
  ambiguous: false,
  confidence: 'high',
  messageKey: 'dossier_ready',
};
const revalFake = revalidateDomainSafePayload(poisonedFakeSeed, {
  q: 'John Smith',
  ctx: { org: 'IBM', city: 'New York', country: 'US', any: true },
  wiki: { found: true, qid: 'Q1701775', seeded: true, ambiguous: false },
  softAmbiguous: false,
});
assert('P0 revalidate demotes FAKE-seeded Smith dossier', revalFake.demoted === true);
assert('P0 revalidate FAKE-seed Smith NOT dossier', revalFake.payload.uiState !== 'dossier');
assert('P0 revalidate FAKE-seed clears qid/faces/photoUrl',
  revalFake.payload.qid == null
  && !revalFake.payload.faces
  && !revalFake.payload.photo
  && !revalFake.payload.photoUrl);

const attachFake = attachOrchestratorFields({
  mode: 'wiki+google',
  label: 'John Smith',
  qid: 'Q1701775',
  photo: 'https://example.com/x.jpg',
  faces: true,
  photoUrl: 'https://example.com/x.jpg',
  images: [{ url: 'https://example.com/x.jpg' }],
  sources: poisonedFakeSeed.sources,
  candidates: smithFakeSeedStage.candidates,
  seeded: true,
}, smithFakeSeedStage);
assert('P0 attach FAKE-seed path NOT dossier', attachFake.uiState !== 'dossier');
assert('P0 attach FAKE-seed no primary faces', attachFake.faces !== true && attachFake.qid == null);



// --- Acc P0 FIX: forbidden QID scrub on candidates/sources emit ---
assert('Acc P0 denylist version', FORBIDDEN_IDENTITIES_VERSION === '2026-09-19.1');
const accPoisonCand = {
  mode: 'candidates',
  label: 'John Smith',
  qid: null,
  sources: [
    { url: 'https://www.wikidata.org/wiki/Q1701775', title: 'politician', kind: 'Wikidata' },
    { url: 'https://viaf.org/viaf/4952029/', title: 'VIAF', kind: 'VIAF' },
  ],
  candidates: [
    {
      id: 'wd-Q1701775',
      label: 'John Smith politician',
      score: 0.9,
      why: ['match: New York'],
      sourcesPreview: [{ url: 'https://www.wikidata.org/wiki/Q1701775', title: 'Q1701775' }],
    },
    {
      id: 'viaf-4952029',
      label: 'John Smith VIAF',
      score: 0.77,
      why: ['VIAF registry'],
      sourcesPreview: [{ url: 'https://viaf.org/viaf/4952029/', title: 'VIAF' }],
    },
  ],
  photo: null,
  images: [],
};
const accStage = {
  uiState: 'candidates',
  scenario: 'foreign',
  confidence: 'low',
  needContextFields: ['country', 'city', 'org', 'role'],
  messageKey: 'pick_one',
  candidates: accPoisonCand.candidates,
};
const accAttached = attachOrchestratorFields(accPoisonCand, accStage);
assert('Acc P0 attach strips wd-Q1701775 candidate',
  !(accAttached.candidates || []).some((c) => /Q1701775/i.test(String(c.id || ''))));
assert('Acc P0 attach strips Q1701775 source URL',
  !(accAttached.sources || []).some((s) => /Q1701775/i.test(String(s.url || ''))));
assert('Acc P0 attach preserves VIAF',
  (accAttached.candidates || []).some((c) => c.id === 'viaf-4952029'));
assert('Acc P0 attach invariant no forbidden', payloadContainsForbidden(accAttached) === false);
assert('Acc P0 sanitizeCandidatesPayload strips',
  payloadContainsForbidden(sanitizeCandidatesPayload(accPoisonCand)) === false);

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
