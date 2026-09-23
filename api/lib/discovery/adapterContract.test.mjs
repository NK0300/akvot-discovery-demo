/**
 * Adapter contract tests — public adapters only · Acc · SSRF · UNKNOWN defaults.
 */
import assert from 'assert';
import {
  ADAPTER_CONTRACT_VERSION,
  WIRED_PUBLIC_PROVIDER_IDS,
  ADAPTER_HOST_ALLOWLIST,
  isAdapterHostAllowed,
  assertAdapterFetchUrl,
  adapterBudgetSignal,
  scrubAdapterRawFinding,
  scrubAdapterBatch,
  typedEvidenceDefaults,
  normalizeAdapterToEvidence,
  normalizeAdapterBatchToEvidence,
  scrubFamilyJournal,
  MAX_ADAPTER_FINDINGS,
  MAX_ADAPTER_RESPONSE_BYTES,
  classifyAdapterAbort,
  adapterSoftFailCode,
  softFailCodesArePairwiseDistinct,
  ADAPTER_SOFT_FAIL_CODE_FAMILIES,
  isHttpSoftFailCode,
  resolveAdapterRedirectUrl,
  MAX_ADAPTER_REDIRECTS,
  safeFetchJson,
} from './adapterContract.js';
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

ok('contract version set', !!ADAPTER_CONTRACT_VERSION);
ok('wired providers include B0 trio', ['wikidata', 'openlibrary', 'wikipedia'].every((p) => WIRED_PUBLIC_PROVIDER_IDS.includes(p)));
ok('wired includes viaf+web_origin', WIRED_PUBLIC_PROVIDER_IDS.includes('viaf') && WIRED_PUBLIC_PROVIDER_IDS.includes('web_origin'));
ok('max findings capped', MAX_ADAPTER_FINDINGS >= 8 && MAX_ADAPTER_FINDINGS <= 24);
ok('max response bytes', MAX_ADAPTER_RESPONSE_BYTES >= 100_000);

// Host allowlist
ok('wikidata host allowed', isAdapterHostAllowed('wikidata', 'www.wikidata.org'));
ok('wikidata blocks evil', !isAdapterHostAllowed('wikidata', 'evil.example'));
ok('wikipedia lang subdomain', isAdapterHostAllowed('wikipedia', 'fr.wikipedia.org'));
ok('viaf host', isAdapterHostAllowed('viaf', 'viaf.org'));
ok('openlibrary host', isAdapterHostAllowed('openlibrary', 'openlibrary.org'));
ok('web_origin any host gate deferred', isAdapterHostAllowed('web_origin', 'example.com'));

ok(
  'assertAdapterFetchUrl https ok',
  assertAdapterFetchUrl('https://www.wikidata.org/w/api.php', 'wikidata').ok === true,
);
ok(
  'assertAdapterFetchUrl blocks localhost',
  assertAdapterFetchUrl('https://localhost/x', 'wikidata').ok === false,
);
ok(
  'assertAdapterFetchUrl blocks http',
  assertAdapterFetchUrl('http://www.wikidata.org/x', 'wikidata').ok === false,
);
ok(
  'assertAdapterFetchUrl blocks wrong host for provider',
  assertAdapterFetchUrl('https://evil.example/x', 'wikidata').ok === false,
);
ok(
  'assertAdapterFetchUrl blocks metadata',
  assertAdapterFetchUrl('https://169.254.169.254/latest', 'wikidata').ok === false,
);

// Budget signal abort
{
  const b = adapterBudgetSignal(80);
  ok('budget signal present', !!b.signal);
  await new Promise((r) => setTimeout(r, 120));
  ok('budget signal aborts', b.signal.aborted === true);
  b.dispose();
}

// Acc scrub drops forbidden
{
  const raw = {
    id: `wd-${FORBIDDEN_Q}`,
    title: 'Bait',
    provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_Q}`,
    entityRefs: [`qid:${FORBIDDEN_Q}`],
  };
  const stripped = [];
  ok('scrub drops forbidden finding', scrubAdapterRawFinding(raw, 'wikidata', stripped) === null);
  ok('scrub notes forbidden id', stripped.includes(FORBIDDEN_Q));
}

// Acc scrub clamps SAME-*
{
  const raw = {
    id: 'f-1',
    title: 'Example',
    provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
    relationship: 'SAME-ENTITY',
    entityRefs: ['qid:Q42'],
  };
  const scrubbed = scrubAdapterRawFinding(raw, 'wikidata');
  ok('scrub keeps safe finding', !!scrubbed);
  ok('scrub clamps SAME-ENTITY → UNKNOWN', scrubbed.relationship === 'UNKNOWN');
  ok('scrub epistemic candidate', scrubbed.epistemicState === 'candidate');
  ok('scrub identityClaim false', scrubbed.identityClaim === false);
}

// Batch scrub
{
  const { batch, forbiddenStripped } = scrubAdapterBatch({
    providerId: 'wikidata',
    findings: [
      {
        id: 'wd-Q42',
        title: 'Ada',
        provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
        entityRefs: ['qid:Q42'],
      },
      {
        id: `wd-${FORBIDDEN_Q}`,
        title: 'Bait',
        provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_Q}`,
      },
    ],
  });
  ok('batch keeps safe only', batch.findings.length === 1 && batch.findings[0].id === 'wd-Q42');
  ok('batch forbiddenStripped > 0', forbiddenStripped >= 1);
  ok('batch has Acc version', !!batch.forbiddenIdentitiesVersion);
}

// Normalize → evidence UNKNOWN defaults
{
  const pair = normalizeAdapterToEvidence(
    {
      id: 'wd-Q42',
      title: 'Douglas Adams',
      kind: 'registry',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
      quote: 'writer',
      entityRefs: ['qid:Q42'],
      relationship: 'SAME-ENTITY',
    },
    'wikidata',
  );
  ok('normalize pair ok', !!pair);
  ok('finding relationshipState UNKNOWN', pair.finding.relationshipState === 'UNKNOWN');
  ok('finding confirmation candidate', pair.finding.confirmationState === 'candidate');
  ok('finding epistemic candidate', pair.finding.epistemicState === 'candidate');
  ok('finding identityClaim false', pair.finding.identityClaim === false);
  ok('evidence urlIsNotIdentity', pair.evidence.urlIsNotIdentity === true);
  ok('evidence candidateIsNotFact', pair.evidence.candidateIsNotFact === true);
  ok('evidence status candidate', pair.evidence.status === 'candidate');
  ok('evidence never fact', pair.evidence.epistemicState !== 'fact');
}

// Cite-or-drop unsafe URL
{
  const pair = normalizeAdapterToEvidence(
    {
      id: 'bad',
      title: 'x',
      provenanceUrl: 'http://evil.local/x',
    },
    'wikidata',
  );
  ok('unsafe url cite-or-drop', pair === null);
}

// Batch to evidence
{
  const out = normalizeAdapterBatchToEvidence({
    providerId: 'openlibrary',
    findings: [
      {
        id: 'ol-OL1A',
        title: 'Author',
        provenanceUrl: 'https://openlibrary.org/authors/OL1A',
        entityRefs: ['ol:OL1A'],
      },
    ],
  });
  ok('batch evidence rows', out.evidence.length === 1 && out.findings.length === 1);
  ok('batch defaults', out.findings[0].epistemicState === 'candidate');
}

// Journal scrub
{
  const journal = scrubFamilyJournal([
    {
      familyId: 'knowledge_graph',
      providerId: 'wikidata',
      status: 'ok',
      findings: [
        {
          id: `wd-${FORBIDDEN_Q}`,
          title: 'Bait',
          provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_Q}`,
        },
      ],
      evidence: [],
      reasons: [`hit ${FORBIDDEN_Q}`],
    },
  ]);
  ok('journal drops forbidden findings', journal[0].findings.length === 0);
  ok('journal redacts reason', !journal[0].reasons[0].includes(FORBIDDEN_Q));
}

ok('typedEvidenceDefaults', typedEvidenceDefaults('viaf').relationshipState === 'UNKNOWN');
ok('allowlist keys cover public', Object.keys(ADAPTER_HOST_ALLOWLIST).length >= 4);

// Abort classify + journal allowlist (GO-IMPL harden)
ok('classify timeout reason', classifyAdapterAbort({ name: 'AbortError', reason: 'timeout' }) === 'timeout');
ok('classify cancelled reason', classifyAdapterAbort({ name: 'AbortError', reason: 'cancelled' }) === 'cancelled');
ok('classify parent abort', classifyAdapterAbort({ name: 'AbortError' }, { aborted: true }) === 'cancelled');
ok('softFail cancelled code', adapterSoftFailCode({ name: 'AbortError', reason: 'cancelled' }, { aborted: true }) === 'cancelled');

{
  const journal = scrubFamilyJournal([
    {
      familyId: 'knowledge_graph',
      providerId: 'wikidata',
      status: 'error',
      reasons: [`fail ${FORBIDDEN_Q}`],
      seed: 'LEAK',
      raw: { token: 'x' },
      findings: [],
      evidence: [],
    },
  ]);
  ok('journal allowlist no seed', journal[0].seed === undefined);
  ok('journal allowlist no raw', journal[0].raw === undefined);
  ok('journal redacts reason', !journal[0].reasons[0].includes(FORBIDDEN_Q));
}


// Redirect re-gate (adapter harden2)
ok('MAX_ADAPTER_REDIRECTS capped', MAX_ADAPTER_REDIRECTS >= 1 && MAX_ADAPTER_REDIRECTS <= 5);
{
  const bad = resolveAdapterRedirectUrl(
    'https://www.wikidata.org/w/api.php',
    'https://169.254.169.254/latest/meta-data',
    'wikidata',
  );
  ok('redirect metadata blocked', bad.ok === false);
  const nip = resolveAdapterRedirectUrl(
    'https://openlibrary.org/search/authors.json',
    'https://127.0.0.1.nip.io/x',
    'openlibrary',
  );
  ok('redirect nip.io blocked', nip.ok === false);
  const offAllow = resolveAdapterRedirectUrl(
    'https://www.wikidata.org/w/api.php',
    'https://evil.example.com/x',
    'wikidata',
  );
  ok('redirect off-allowlist blocked', offAllow.ok === false);
  const rel = resolveAdapterRedirectUrl(
    'https://viaf.org/viaf/AutoSuggest?query=x',
    '/viaf/AutoSuggest?query=y',
    'viaf',
  );
  ok('redirect relative same-host ok', rel.ok === true && /viaf\.org/.test(rel.canonical || ''));
}

// safeFetchJson mock: redirect to private must throw (no follow)
{
  const orig = globalThis.fetch;
  let sawManual = false;
  globalThis.fetch = async (url, init) => {
    sawManual = init?.redirect === 'manual';
    return {
      status: 302,
      ok: false,
      url: String(url),
      headers: { get: (k) => (String(k).toLowerCase() === 'location' ? 'https://127.0.0.1/secret' : null) },
      arrayBuffer: async () => new ArrayBuffer(0),
    };
  };
  try {
    let threw = false;
    try {
      await safeFetchJson('https://www.wikidata.org/w/api.php?action=wbsearchentities&search=x&format=json', AbortSignal.timeout(500), {
        providerId: 'wikidata',
      });
    } catch (e) {
      threw = /unsafe_adapter_redirect|blocked_host|unsafe/i.test(String(e?.message || e));
    }
    ok('safeFetchJson blocks redirect to private', threw === true);
    ok('safeFetchJson uses redirect=manual', sawManual === true);
  } finally {
    globalThis.fetch = orig;
  }
}


console.log('\n--- adapterContract ---');

// Soft-fail taxonomy completeness (cancel≠timeout≠http_N≠budget_exhausted)
{
  ok('families includes budget_exhausted', ADAPTER_SOFT_FAIL_CODE_FAMILIES.includes('budget_exhausted'));
  ok(
    'softFail budget_exhausted code',
    adapterSoftFailCode({ code: 'budget_exhausted' }) === 'budget_exhausted',
  );
  ok(
    'softFail BUDGET_EXHAUSTED alias',
    adapterSoftFailCode({ code: 'BUDGET_EXHAUSTED' }) === 'budget_exhausted',
  );
  ok('isHttp soft fail 503', isHttpSoftFailCode('http_503') === true);
  ok('isHttp not cancel', isHttpSoftFailCode('cancelled') === false);
  ok(
    'pairwise distinct pack',
    softFailCodesArePairwiseDistinct(['cancelled', 'timeout', 'http_429', 'budget_exhausted']),
  );
}

console.log(`passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
