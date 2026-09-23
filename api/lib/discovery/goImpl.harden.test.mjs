/**
 * GO-IMPL harden suite — AbortSignal cancel≠timeout · budget hard-stop ·
 * Acc journal scrub · EMPTY≠FALSE · URL≠IDENTITY · CANDIDATE≠FACT · obs lite.
 * Cite: BUDGET-FANOUT · UNKNOWN-NORMATIVE · ACC-EMIT · F11 hold
 * NO promote · Core/B0/A2/C1 frozen
 */
import assert from 'assert';
import {
  adapterBudgetSignal,
  classifyAdapterAbort,
  adapterSoftFailCode,
  scrubFamilyJournal,
  scrubAdapterRawFinding,
  normalizeAdapterToEvidence,
  typedEvidenceDefaults,
  ADAPTER_CONTRACT_VERSION,
  WIRED_PUBLIC_PROVIDER_IDS,
  ADAPTER_SOFT_FAIL_CODE_FAMILIES,
  isHttpSoftFailCode,
  softFailCodesArePairwiseDistinct,
} from './adapterContract.js';
import { classifyAdapterError, stampRegistryFinding } from './providers.js';
import {
  createBudgetLedger,
  BUDGET_EXHAUSTED,
  outcomeClassForStatus,
  normalizeFamilyStatus,
} from './budget.js';
import {
  runFamilyOrchestration,
  executeFamilyCall,
  normalizeFamilyBatch,
} from './familyOrchestrator.js';
import { buildQueryPlan } from './queryPlan.js';
import {
  structuredLog,
  buildStructuredLog,
  resetMetrics,
  getMetricsSnapshot,
  scrubObsFields,
  OBS_DENIED_FIELD_KEYS,
} from './obs.js';
import { FORBIDDEN_IDENTITY_QIDS } from '../forbiddenIdentities.js';
import {
  checkDiscoveryRateLimit,
  resetDiscoveryRateLimit,
  getDiscoveryRateLimitInfo,
} from './requestGuards.js';
import {
  runTreatmentComposeProbe,
  DUAL_RUN_HARNESS_VERSION,
} from './dualRunHarness.js';
import {
  sanitizeDiscoveryPayload,
  scrubErrorChunk,
  scrubGraphPayload,
  scrubGraphChunk,
  scrubSoftErForEmit,
} from './emit.js';
import { scrubSseError } from './sse.js';
import {
  FAILURE_KINDS,
  softFailCodeForFailureKind,
  injectErrorForKind,
  failureKindsCoverSoftFailFamilies,
  assertInjectedSoftFailCode,
} from './failureInject.js';

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

console.log('goImpl.harden.test.mjs');
ok('adapter contract version softfail3', /softfail|harden/i.test(ADAPTER_CONTRACT_VERSION));
ok(
  'wired public surface only (F11)',
  WIRED_PUBLIC_PROVIDER_IDS.length === 5 &&
    WIRED_PUBLIC_PROVIDER_IDS.includes('wikidata') &&
    WIRED_PUBLIC_PROVIDER_IDS.includes('web_origin'),
);

// ---------- AbortSignal: timeout vs cancelled ----------
{
  const b = adapterBudgetSignal(60);
  await new Promise((r) => setTimeout(r, 100));
  ok('budget signal aborts on timeout', b.signal.aborted === true);
  ok('budget abortKind timeout', b.abortKind === 'timeout');
  ok('budget signal.reason timeout', b.signal.reason === 'timeout');
  b.dispose();
}

{
  const parent = new AbortController();
  const b = adapterBudgetSignal(5_000, parent.signal);
  parent.abort('user_cancel');
  ok('parent abort propagates', b.signal.aborted === true);
  ok('abortKind cancelled (not timeout)', b.abortKind === 'cancelled');
  ok('signal.reason cancelled', b.signal.reason === 'cancelled');
  b.dispose();
}

{
  const parent = new AbortController();
  parent.abort();
  const b = adapterBudgetSignal(5_000, parent.signal);
  ok('already-aborted parent → cancelled', b.signal.aborted && b.abortKind === 'cancelled');
  b.dispose();
}

ok(
  'classifyAdapterAbort parent wins',
  classifyAdapterAbort(Object.assign(new Error('aborted'), { name: 'AbortError' }), {
    aborted: true,
  }) === 'cancelled',
);
ok(
  'classifyAdapterAbort timeout reason',
  classifyAdapterAbort(Object.assign(new Error('aborted'), { name: 'AbortError', reason: 'timeout' })) ===
    'timeout',
);
ok(
  'classifyAdapterAbort cancelled reason',
  classifyAdapterAbort(Object.assign(new Error('aborted'), { name: 'AbortError', reason: 'cancelled' })) ===
    'cancelled',
);
ok(
  'classifyAdapterAbort plain error',
  classifyAdapterAbort(new Error('HTTP 500')) === 'error',
);
ok(
  'softFailCode cancelled',
  adapterSoftFailCode(Object.assign(new Error('aborted'), { name: 'AbortError', reason: 'cancelled' }), {
    aborted: true,
  }) === 'cancelled',
);
ok(
  'softFailCode http status',
  adapterSoftFailCode(Object.assign(new Error('x'), { status: 429 })) === 'http_429',
);

// ---------- executeFamilyCall: cancel ≠ timeout ----------
{
  const ledger = createBudgetLedger({ maxRequests: 10, maxFamilyCalls: 8, maxWallMs: 10_000 });
  const ac = new AbortController();
  const provider = {
    id: 'wikidata',
    search: async (_req, ctx) => {
      // Wait until parent abort
      await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(Object.assign(new Error('too slow'), { name: 'Error' })), 2000);
        if (ctx.signal.aborted) {
          clearTimeout(t);
          const err = new Error('aborted');
          err.name = 'AbortError';
          err.reason = ctx.signal.reason;
          reject(err);
          return;
        }
        ctx.signal.addEventListener(
          'abort',
          () => {
            clearTimeout(t);
            const err = new Error('aborted');
            err.name = 'AbortError';
            err.reason = ctx.signal.reason;
            reject(err);
          },
          { once: true },
        );
      });
    },
  };
  const p = executeFamilyCall({
    familyId: 'knowledge_graph',
    provider,
    providerId: 'wikidata',
    intentId: 'i1',
    planId: 'p1',
    query: 'Ada',
    session: { seed: 'Ada', sessionId: 's1', locale: 'en', hints: {} },
    budgetMs: 3000,
    signal: ac.signal,
    ledger,
  });
  await new Promise((r) => setTimeout(r, 30));
  ac.abort();
  const result = await p;
  ok('executeFamilyCall cancel status', result.status === 'cancelled', `got=${result.status}`);
  ok('executeFamilyCall cancel outcomeClass', result.outcomeClass === 'CANCELLED');
  ok('executeFamilyCall cancel ≠ timeout', result.status !== 'timeout');
  ok('executeFamilyCall cancel empty findings', result.findings.length === 0);
}

{
  const ledger = createBudgetLedger({ maxRequests: 10, maxFamilyCalls: 8, maxWallMs: 10_000 });
  const provider = {
    id: 'wikidata',
    search: async (_req, ctx) => {
      await new Promise((resolve, reject) => {
        const onAbort = () => {
          const err = new Error('aborted');
          err.name = 'AbortError';
          err.reason = ctx.signal.reason;
          reject(err);
        };
        if (ctx.signal.aborted) return onAbort();
        ctx.signal.addEventListener('abort', onAbort, { once: true });
      });
    },
  };
  const result = await executeFamilyCall({
    familyId: 'knowledge_graph',
    provider,
    providerId: 'wikidata',
    intentId: 'i1',
    planId: 'p1',
    query: 'Ada',
    session: { seed: 'Ada', sessionId: 's1', locale: 'en', hints: {} },
    budgetMs: 50, // tight budget → timeout
    signal: undefined,
    ledger,
  });
  ok('executeFamilyCall timeout status', result.status === 'timeout', `got=${result.status}`);
  ok('executeFamilyCall timeout outcomeClass', result.outcomeClass === 'SOURCE_TIMEOUT');
  ok('timeout ≠ cancelled', result.status !== 'cancelled');
}

// ---------- Budget hard-stop: BUDGET_EXHAUSTED stops fanout ----------
{
  let launches = 0;
  const providers = ['wikidata', 'openlibrary', 'wikipedia'].map((id) => ({
    id,
    search: async () => {
      launches++;
      return {
        providerId: id,
        findings:
          id === 'wikidata'
            ? [
                {
                  id: 'wd-Q42',
                  title: 'Douglas Adams',
                  provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
                },
              ]
            : [],
        partial: false,
      };
    },
  }));
  const plan = buildQueryPlan({ seed: 'Budget HardStop', hints: { seedClass: 'person' } });
  plan.budgets = {
    ...(plan.budgets || {}),
    maxRequests: 1,
    maxFamilyCalls: 1,
    maxProviders: 1,
    maxWallMs: 8_000,
    maxProviderMs: 500,
  };
  const ledger = createBudgetLedger(plan.budgets);
  const orch = await runFamilyOrchestration(
    plan,
    { seed: 'Budget HardStop', sessionId: 'bud-hs', locale: 'en', hints: { seedClass: 'person' } },
    { providers, ledger, flags: { viaf: false, webOrigin: false } },
  );
  ok('hard-stop launches ≤ 1', launches <= 1, `launches=${launches}`);
  ok(
    'hard-stop budgetExhausted true',
    orch.budgetExhausted === true || orch.journal.some((j) => j.status === 'budget_exhausted'),
  );
  const exhausted = orch.journal.filter((j) => j.status === 'budget_exhausted');
  ok(
    'hard-stop remaining marked budget_exhausted',
    exhausted.length >= 1 || orch.journal.length <= 1,
    `journal=${orch.journal.map((j) => j.status).join(',')}`,
  );
  // Prove no search after exhaust: launches must equal successful + in-flight only
  ok('hard-stop no silent expansion', launches <= plan.budgets.maxFamilyCalls);
  ok('ledger availability exhausted or short', ledger.isExhausted() || launches <= 1);
}

// ---------- EMPTY≠FALSE · soft-fail honesty ----------
{
  const batch = normalizeFamilyBatch({
    batch: { providerId: 'wikipedia', findings: [], errors: [], partial: false },
    familyId: 'encyclopedia',
    providerId: 'wikipedia',
    intentId: 'i1',
    planId: 'p1',
    executionTimeMs: 12,
  });
  ok('empty status', batch.status === 'empty');
  ok('empty outcome EVIDENCE_UNAVAILABLE', batch.outcomeClass === 'EVIDENCE_UNAVAILABLE');
  ok('empty reasons empty_no_fanout', batch.reasons.includes('empty_no_fanout'));
  ok('empty ≠ false string', !JSON.stringify(batch).toLowerCase().includes('"false"'));
  ok('empty ≠ CONTRADICTORY', batch.outcomeClass !== 'CONTRADICTORY');
  ok('normalizeFamilyStatus empty', normalizeFamilyStatus('empty') === 'empty');
  ok('outcomeClass empty not FALSE', outcomeClassForStatus('empty') === 'EVIDENCE_UNAVAILABLE');
}

{
  const ledger = createBudgetLedger({ maxRequests: 5, maxFamilyCalls: 5 });
  const deny = ledger.denyUnplannedFanout('empty_no_fanout');
  ok('empty_no_fanout blocks fanout', deny.ok === false && deny.code === 'fanout_guard_block');
}

// ---------- URL≠IDENTITY · CANDIDATE≠FACT + provenance ----------
{
  const pair = normalizeAdapterToEvidence(
    {
      id: 'wd-Q42',
      title: 'Douglas Adams',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
      quote: 'writer',
      relationship: 'SAME-ENTITY',
      entityRefs: ['qid:Q42'],
    },
    'wikidata',
  );
  ok('normalize clamps SAME-ENTITY', pair.finding.relationshipState === 'UNKNOWN');
  ok('CANDIDATE≠FACT confirmation', pair.finding.confirmationState === 'candidate');
  ok('CANDIDATE≠FACT evidence status', pair.evidence.status === 'candidate');
  ok('URL≠IDENTITY flag', pair.evidence.urlIsNotIdentity === true);
  ok('candidateIsNotFact flag', pair.evidence.candidateIsNotFact === true);
  ok('identityClaim false', pair.finding.identityClaim === false);
  ok('never fact epistemic', pair.evidence.epistemicState !== 'fact');
}

{
  const d = typedEvidenceDefaults('viaf');
  ok('viaf defaults UNKNOWN rel', d.relationshipState === 'UNKNOWN');
  ok('viaf defaults candidate', d.confirmationState === 'candidate');
  ok('viaf urlIsNotIdentity', d.urlIsNotIdentity === true);
}

{
  const batch = normalizeFamilyBatch({
    batch: {
      providerId: 'web_origin',
      findings: [
        {
          id: 'wo-1',
          title: 'Example',
          provenanceUrl: 'https://example.com/',
          relationship: 'SAME-ENTITY',
        },
      ],
      partial: false,
    },
    familyId: 'web_origin',
    providerId: 'web_origin',
    intentId: 'i1',
    planId: 'p1',
    executionTimeMs: 5,
  });
  ok('web_origin finding UNKNOWN', batch.findings[0]?.relationshipState === 'UNKNOWN');
  ok('web_origin evidence provenance present', !!batch.evidence[0]?.provenance?.providerId);
  ok('web_origin evidence status candidate', batch.evidence[0]?.status === 'candidate');
  ok('web_origin extractionMethod origin_metadata', batch.evidence[0]?.provenance?.extractionMethod === 'origin_metadata');
  ok('web_origin strength metadata_only', batch.evidence[0]?.strength === 'metadata_only');
}

// ---------- Acc scrub on journal (allowlist · no spread leak) ----------
{
  const journal = scrubFamilyJournal([
    {
      familyId: 'knowledge_graph',
      providerId: 'wikidata',
      status: 'ok',
      intentId: 'i1',
      planId: 'p1',
      findings: [
        {
          id: `wd-${FORBIDDEN_Q}`,
          title: 'Bait',
          provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_Q}`,
        },
        {
          id: 'wd-Q42',
          title: 'Safe',
          provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
        },
      ],
      evidence: [
        {
          id: `ev-${FORBIDDEN_Q}`,
          provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_Q}`,
          quote: 'bait',
        },
      ],
      reasons: [`error: hit ${FORBIDDEN_Q}`],
      skipReason: `skip ${FORBIDDEN_Q}`,
      budgetExhaustedReason: `dim ${FORBIDDEN_Q}`,
      seed: 'MUST_NOT_LEAK_SEED',
      rawSecret: 'tok_live_xxx',
      executionTimeMs: 9,
      requestsUsed: 1,
    },
  ]);
  const row = journal[0];
  ok('journal drops forbidden finding', row.findings.length === 1 && row.findings[0].id === 'wd-Q42');
  ok('journal drops forbidden evidence', row.evidence.length === 0);
  ok('journal redacts reason QID', !String(row.reasons[0]).includes(FORBIDDEN_Q));
  ok('journal redacts skipReason', !String(row.skipReason).includes(FORBIDDEN_Q));
  ok('journal redacts budgetExhaustedReason', !String(row.budgetExhaustedReason).includes(FORBIDDEN_Q));
  ok('journal allowlist drops seed', row.seed === undefined);
  ok('journal allowlist drops rawSecret', row.rawSecret === undefined);
  ok('journal keeps status', row.status === 'ok');
  ok('journal keeps Acc version', !!row.forbiddenIdentitiesVersion);
}

{
  const scrubbed = scrubAdapterRawFinding(
    {
      id: 'f1',
      title: 'X',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q1',
      relationship: 'SAME-REFERENCE',
    },
    'wikidata',
  );
  ok('raw scrub clamps SAME-REFERENCE', scrubbed.relationship === 'UNKNOWN');
}

// ---------- Obs lite: no seed / Acc / secrets ----------
{
  resetMetrics();
  ok('OBS_DENIED includes seed', OBS_DENIED_FIELD_KEYS.includes('seed'));
  ok('OBS_DENIED includes token', OBS_DENIED_FIELD_KEYS.includes('token'));
  ok('OBS_DENIED includes hints', OBS_DENIED_FIELD_KEYS.includes('hints'));
  ok('OBS_DENIED includes provenanceUrl', OBS_DENIED_FIELD_KEYS.includes('provenanceUrl'));
  ok('OBS_DENIED includes entityRef', OBS_DENIED_FIELD_KEYS.includes('entityRef'));
  ok('OBS_DENIED includes qid', OBS_DENIED_FIELD_KEYS.includes('qid'));
  ok('OBS_DENIED includes seedText', OBS_DENIED_FIELD_KEYS.includes('seedText'));
  const stripped = scrubObsFields({
    seed: 'Secret Person',
    q: 'Secret Person',
    url: 'https://evil.example',
    token: 'abc',
    hints: { bait: true },
    provenanceUrl: 'https://evil.example/p',
    entityRef: 'Q999',
    snippet: 'secret snippet',
    planId: 'plan-1',
    familyId: 'knowledge_graph',
    status: 'budget_exhausted',
  });
  ok('scrubObs drops seed', stripped.seed === undefined);
  ok('scrubObs drops q', stripped.q === undefined);
  ok('scrubObs drops url', stripped.url === undefined);
  ok('scrubObs drops token', stripped.token === undefined);
  ok('scrubObs drops hints', stripped.hints === undefined);
  ok('scrubObs drops provenanceUrl', stripped.provenanceUrl === undefined);
  ok('scrubObs drops entityRef', stripped.entityRef === undefined);
  ok('scrubObs drops snippet', stripped.snippet === undefined);
  ok('scrubObs keeps planId', stripped.planId === 'plan-1');

  const line = structuredLog('info', 'family.fanout_hard_stop', {
    seed: 'MUST_NOT_APPEAR',
    q: 'MUST_NOT_APPEAR',
    authorization: 'Bearer xyz',
    planId: 'p-obs',
    budgetExhaustedReason: `maxRequests ${FORBIDDEN_Q}`,
    budgetRemaining: { familyCalls: 0, requests: 0, wallMs: 100 },
  });
  const dumped = JSON.stringify(line);
  ok('structuredLog no seed', !dumped.includes('MUST_NOT_APPEAR'));
  ok('structuredLog no bearer', !dumped.includes('Bearer'));
  ok('structuredLog has planId', line.planId === 'p-obs');
  ok('structuredLog Acc-redacts QID in reason', !String(line.budgetExhaustedReason || '').includes(FORBIDDEN_Q));

  const rich = buildStructuredLog({
    event: 'test',
    seed: 'NOPE',
    password: 'NOPE',
    message: `hit ${FORBIDDEN_Q} token=secret`,
    planId: 'p2',
    counts: { findings: 1, evidence: 1 },
  });
  const richDump = JSON.stringify(rich);
  ok('buildStructuredLog no seed key', !('seed' in rich));
  ok('buildStructuredLog no password key', !('password' in rich));
  ok('buildStructuredLog redacts QID in message', !richDump.includes(FORBIDDEN_Q));
  ok('buildStructuredLog keeps counts', rich.counts?.findings === 1);
  const snap = getMetricsSnapshot();
  ok('metrics counters recorded', typeof snap.counters === 'object');
}

// ---------- Abort mid-flight remaining cancelled (orchestration) ----------
{
  let launches = 0;
  const ac = new AbortController();
  const providers = ['wikidata', 'openlibrary', 'wikipedia'].map((id) => ({
    id,
    search: async () => {
      launches++;
      if (launches === 1) ac.abort();
      return { providerId: id, findings: [], partial: false };
    },
  }));
  const plan = buildQueryPlan({ seed: 'Abort Soft', hints: { seedClass: 'person' } });
  plan.budgets = { ...(plan.budgets || {}), maxRequests: 10, maxFamilyCalls: 8, maxWallMs: 8000 };
  const orch = await runFamilyOrchestration(
    plan,
    { seed: 'Abort Soft', sessionId: 'ab-soft', locale: 'en', hints: {} },
    { providers, signal: ac.signal, flags: { viaf: false, webOrigin: false } },
  );
  ok('abort orch launches bounded', launches <= 2, `launches=${launches}`);
  ok(
    'abort orch has cancelled remaining',
    orch.journal.some((j) => j.status === 'cancelled') || launches <= 1,
    `statuses=${orch.journal.map((j) => j.status).join(',')}`,
  );
  const scrubbed = scrubFamilyJournal(orch.journal);
  ok('abort journal Acc-scrub length stable', scrubbed.length === orch.journal.length);
}


// ---------- Soft-fail taxonomy completeness (wired adapters) ----------
{
  ok(
    'soft-fail families closed',
    ADAPTER_SOFT_FAIL_CODE_FAMILIES.includes('cancelled') &&
      ADAPTER_SOFT_FAIL_CODE_FAMILIES.includes('timeout') &&
      ADAPTER_SOFT_FAIL_CODE_FAMILIES.includes('http_N') &&
      ADAPTER_SOFT_FAIL_CODE_FAMILIES.includes('budget_exhausted'),
  );
  const codes = [
    adapterSoftFailCode(Object.assign(new Error('aborted'), { name: 'AbortError', reason: 'cancelled' }), {
      aborted: true,
    }),
    adapterSoftFailCode(Object.assign(new Error('aborted'), { name: 'AbortError', reason: 'timeout' })),
    adapterSoftFailCode(Object.assign(new Error('rate'), { status: 429 })),
    adapterSoftFailCode(Object.assign(new Error('budget'), { code: 'budget_exhausted' })),
    adapterSoftFailCode(new Error('boom')),
  ];
  ok('softFail codes cancel', codes[0] === 'cancelled');
  ok('softFail codes timeout', codes[1] === 'timeout');
  ok('softFail codes http_429', codes[2] === 'http_429' && isHttpSoftFailCode(codes[2]));
  ok('softFail codes budget_exhausted', codes[3] === 'budget_exhausted');
  ok('softFail codes generic error', codes[4] === 'error');
  ok(
    'softFail pairwise distinct cancel≠timeout≠http≠budget',
    softFailCodesArePairwiseDistinct(['cancelled', 'timeout', 'http_429', 'budget_exhausted']),
  );
  ok(
    'softFail not distinct if collide',
    softFailCodesArePairwiseDistinct(['cancelled', 'cancelled']) === false,
  );

  // Wired provider ids still B0+flag surface (F11 — no new HTTP)
  for (const id of WIRED_PUBLIC_PROVIDER_IDS) {
    ok(`wired provider id present:${id}`, typeof id === 'string' && id.length > 0);
  }

  const taxCancel = classifyAdapterError(
    Object.assign(new Error('aborted'), { name: 'AbortError', reason: 'cancelled' }),
    { aborted: true },
  );
  const taxTimeout = classifyAdapterError(
    Object.assign(new Error('aborted'), { name: 'AbortError', reason: 'timeout' }),
  );
  const taxHttp = classifyAdapterError(Object.assign(new Error('x'), { status: 503 }));
  const taxBudget = classifyAdapterError(Object.assign(new Error('x'), { code: 'budget_exhausted' }));
  ok('taxonomy cancel category', taxCancel.category === 'cancelled' && taxCancel.retryable === false);
  ok('taxonomy timeout category', taxTimeout.category === 'timeout' && taxTimeout.retryable === true);
  ok('taxonomy http_503 category', taxHttp.code === 'http_503' && taxHttp.category === 'upstream_5xx');
  ok(
    'taxonomy budget_exhausted category',
    taxBudget.code === 'budget_exhausted' &&
      taxBudget.category === 'budget_exhausted' &&
      taxBudget.retryable === false,
  );
  ok(
    'taxonomy cancel≠timeout≠http≠budget',
    new Set([taxCancel.code, taxTimeout.code, taxHttp.code, taxBudget.code]).size === 4,
  );

  // Family status outcome classes stay distinct (EMPTY≠FALSE)
  ok('family empty → EVIDENCE_UNAVAILABLE', outcomeClassForStatus('empty') === 'EVIDENCE_UNAVAILABLE');
  ok('family empty ≠ FALSE string', outcomeClassForStatus('empty') !== 'FALSE');
  ok('family budget → BUDGET_EXHAUSTED', outcomeClassForStatus('budget_exhausted') === 'BUDGET_EXHAUSTED');
  ok('normalize http-ish unknown → error not cancel', normalizeFamilyStatus('http_500') === 'error');
}

// ---------- Obs/journal leak probes (seed/QID/token never emit) ----------
{
  const FORBIDDEN_Q = FORBIDDEN_IDENTITY_QIDS[0];
  ok('FORBIDDEN_Q present for probe', !!FORBIDDEN_Q && /^Q\d+$/.test(FORBIDDEN_Q));

  const line = structuredLog('warn', 'family.soft_fail', {
    seed: 'LEAK_SEED_PERSON',
    seedText: 'LEAK_SEED_PERSON',
    qid: FORBIDDEN_Q,
    qids: [FORBIDDEN_Q],
    token: 'tok_live_secret',
    identityClaim: true,
    message: `should-not-pass ${FORBIDDEN_Q}`,
    planId: 'leak-plan',
    status: 'timeout',
    budgetExhaustedReason: `maxWallMs bait ${FORBIDDEN_Q}`,
  });
  const dump = JSON.stringify(line);
  ok('obs leak probe no seed', !dump.includes('LEAK_SEED_PERSON'));
  ok('obs leak probe no token', !dump.includes('tok_live_secret'));
  ok('obs leak probe no QID', !dump.includes(FORBIDDEN_Q));
  ok('obs leak probe drops qid field', !('qid' in line) && !('qids' in line) && !('seedText' in line));
  ok('obs leak probe keeps planId/status', line.planId === 'leak-plan' && line.status === 'timeout');
  ok(
    'obs SoT-redacts budget reason QID',
    !String(line.budgetExhaustedReason || '').includes(FORBIDDEN_Q),
  );

  const rich = buildStructuredLog({
    event: 'journal.emit',
    seed: 'NO',
    qid: FORBIDDEN_Q,
    token: 'secret-token',
    message: `family fail ${FORBIDDEN_Q} token=abc`,
    failureClass: 'timeout',
  });
  const richDump = JSON.stringify(rich);
  ok('buildStructuredLog leak probe no QID', !richDump.includes(FORBIDDEN_Q));
  ok('buildStructuredLog leak probe no seed/qid keys', !('seed' in rich) && !('qid' in rich));
  ok('buildStructuredLog redacts token in message', !/token=abc/i.test(richDump));

  const journal = scrubFamilyJournal([
    {
      familyId: 'knowledge_graph',
      providerId: 'wikidata',
      status: 'timeout',
      outcomeClass: 'SOURCE_TIMEOUT',
      seed: 'LEAK_SEED',
      token: 'tok',
      qid: FORBIDDEN_Q,
      reasons: [`timeout bait ${FORBIDDEN_Q}`],
      findings: [{ id: `wd-${FORBIDDEN_Q}`, title: 'bait', provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN_Q}` }],
      evidence: [],
      executionTimeMs: 12,
      requestsUsed: 1,
    },
  ]);
  const jDump = JSON.stringify(journal);
  ok('journal emit path no seed', !jDump.includes('LEAK_SEED') && journal[0].seed === undefined);
  ok('journal emit path no token', !jDump.includes('"token"') && journal[0].token === undefined);
  ok('journal emit path no QID', !jDump.includes(FORBIDDEN_Q));
  ok('journal emit path drops qid field', journal[0].qid === undefined);
  ok('journal keeps timeout status (≠cancel≠budget)', journal[0].status === 'timeout');
}

// ---------- Budget hard-stop dimensions + URL≠IDENTITY regression ----------
{
  // maxRequests latch distinct from maxFamilyCalls
  const reqLedger = createBudgetLedger({ maxFamilyCalls: 100, maxRequests: 2, maxWallMs: 60_000 });
  ok('req hard-stop r1', reqLedger.reserve({ requests: 2 }).ok === true);
  ok('req hard-stop exhausted', reqLedger.isExhausted() === true);
  ok('req hard-stop reason maxRequests', reqLedger.exhaustedReason === 'maxRequests');
  ok('req hard-stop second denied', reqLedger.reserve({ requests: 1 }).ok === false);

  // maxWallMs latch via canLaunch after wall elapses
  const wallLedger = createBudgetLedger({ maxFamilyCalls: 100, maxRequests: 100, maxWallMs: 1 });
  const start = Date.now();
  while (Date.now() - start < 5) {
    /* spin past 1ms wall */
  }
  const wallGate = wallLedger.canLaunch();
  ok('wall hard-stop denies', wallGate.ok === false);
  ok('wall hard-stop reason maxWallMs', wallLedger.exhaustedReason === 'maxWallMs' || wallGate.reason === 'maxWallMs');
  // Explicit markExhausted path
  const markLedger = createBudgetLedger({ maxFamilyCalls: 10, maxRequests: 10, maxWallMs: 60_000 });
  markLedger.markExhausted('maxWallMs');
  ok('markExhausted latches wall', markLedger.isExhausted() && markLedger.exhaustedReason === 'maxWallMs');
  ok('markExhausted blocks reserve', markLedger.reserve({ requests: 1 }).ok === false);

  // EMPTY≠FALSE: empty batch normalize
  const emptyBatch = normalizeFamilyBatch({
    batch: { providerId: 'wikidata', findings: [], partial: false },
    familyId: 'knowledge_graph',
    providerId: 'wikidata',
    intentId: 'i-empty',
    planId: 'p-empty',
    executionTimeMs: 5,
  });
  ok('empty batch status empty', emptyBatch.status === 'empty');
  ok('empty batch outcome not FALSE', emptyBatch.outcomeClass === 'EVIDENCE_UNAVAILABLE');
  ok('empty ≠ cancelled', emptyBatch.status !== 'cancelled');
  ok('empty ≠ timeout', emptyBatch.status !== 'timeout');
  ok('empty ≠ budget_exhausted', emptyBatch.status !== 'budget_exhausted');

  // URL≠IDENTITY stamp regression
  const stamped = stampRegistryFinding(
    {
      id: 'wd-Q42',
      title: 'Douglas Adams',
      provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
      kind: 'registry',
      relationship: 'SAME-ENTITY',
    },
    'wikidata',
  );
  ok('stamp keeps finding', !!stamped);
  ok('URL≠IDENTITY stamp flag', stamped.urlIsNotIdentity === true);
  ok('stamp identityClaim false', stamped.identityClaim === false);
  ok('SAME-ENTITY clamped to UNKNOWN', stamped.relationship === 'UNKNOWN');
}

// ---------- Memory RL edge: isolation / prune / overflow ----------
{
  resetDiscoveryRateLimit();
  const t0 = 1_000_000;
  // Fill to cap
  const cap = 5;
  for (let i = 0; i < cap; i++) {
    const r = checkDiscoveryRateLimit(`rl-fill-${i}`, { max: 10, windowMs: 1_000, maxKeys: cap, now: t0 });
    ok(`rl fill ${i}`, r.ok === true);
  }
  const blocked = checkDiscoveryRateLimit('rl-new', { max: 10, windowMs: 1_000, maxKeys: cap, now: t0 });
  ok('rl overflow at cap', blocked.ok === false && blocked.overflow === true);

  // Prune expired frees capacity — advance past window
  const after = t0 + 1_500;
  const freed = checkDiscoveryRateLimit('rl-after-prune', {
    max: 10,
    windowMs: 1_000,
    maxKeys: cap,
    now: after,
  });
  ok('rl prune frees new key', freed.ok === true && freed.overflow === false);

  // Isolation under near-capacity: A trip ≠ B
  resetDiscoveryRateLimit();
  for (let i = 0; i < 4; i++) checkDiscoveryRateLimit('rl-iso-A', { max: 3, windowMs: 60_000, now: t0 });
  const aLast = checkDiscoveryRateLimit('rl-iso-A', { max: 3, windowMs: 60_000, now: t0 });
  ok('rl iso A tripped', aLast.ok === false && aLast.overflow === false);
  const b = checkDiscoveryRateLimit('rl-iso-B', { max: 3, windowMs: 60_000, now: t0 });
  ok('rl iso B independent', b.ok === true && b.remaining === 2);

  // Window renew does not bleed prior count
  resetDiscoveryRateLimit();
  checkDiscoveryRateLimit('rl-win', { max: 2, windowMs: 100, now: t0 });
  checkDiscoveryRateLimit('rl-win', { max: 2, windowMs: 100, now: t0 });
  const trip = checkDiscoveryRateLimit('rl-win', { max: 2, windowMs: 100, now: t0 });
  ok('rl window trips', trip.ok === false);
  const renewed = checkDiscoveryRateLimit('rl-win', { max: 2, windowMs: 100, now: t0 + 200 });
  ok('rl window renew fresh count', renewed.ok === true && renewed.remaining === 1);

  ok('rl info still memory honesty', getDiscoveryRateLimitInfo().distributed === false);
  ok('rl info no Upstash invent', getDiscoveryRateLimitInfo().upstashWiredForRateLimit === false);
}


// ---------- Wave-3: TREATMENT compose soft-fail + SSRF + budget hard-stop ----------
{
  const probe = await runTreatmentComposeProbe({});
  ok('compose harness version stamped', /dualrun-compose/.test(DUAL_RUN_HARNESS_VERSION));
  ok('compose flagOnConfirmed', probe.flagOnConfirmed === true);
  ok('compose no live promote claim', probe.livePreviewPromote === false);
  ok('compose hasQueryPlan TREATMENT', probe.compose.hasQueryPlan === true);
  ok(
    'compose soft-fail present (timeout/budget/error)',
    probe.compose.softFailPresent === true ||
      (probe.compose.softFailCodes || []).length > 0 ||
      probe.compose.budgetHardStop === true,
  );
  ok(
    'compose SSRF gate blocks poison / zero fetchable',
    probe.compose.ssrfGate.fetchableCount === 0 ||
      probe.compose.ssrfGate.blockedCount > 0 ||
      probe.compose.ssrfGate.poison === true,
  );
  ok(
    'compose budget hard-stop OR soft-fail budget code',
    probe.compose.budgetHardStop === true ||
      (probe.compose.softFailCodes || []).includes('budget_exhausted') ||
      (probe.compose.softFailCodes || []).includes('timeout'),
  );
  ok('compose Acc leak 0', probe.compose.accLeakForbiddenQ === 0);
  ok('compose no credential leak', probe.compose.noCredentialLeak === true);
  ok('compose no raw poison URL in snapshot', probe.compose.noRawPoisonUrl === true);
}

// ---------- Wave-3: Emit Acc scrub depth (SSE error + graph edges + softEr) ----------
{
  const FORBIDDEN = [...FORBIDDEN_IDENTITY_QIDS][0] || 'Q1701775';
  const err = scrubErrorChunk({
    code: 'timeout',
    message: `upstream ${FORBIDDEN} token=supersecret SAME-ENTITY`,
    stack: `Error: leak ${FORBIDDEN}\n    at x`,
    detail: { seed: 'bait', apiKey: 'sk-live-XXX' },
    seed: 'should-not-emit',
  });
  const errBlob = JSON.stringify(err);
  ok('emit error SoT QID scrub', !errBlob.includes(FORBIDDEN));
  ok('emit error credential scrub', !/supersecret|sk-live/i.test(errBlob));
  ok('emit error directive blocked', !/SAME-ENTITY/.test(err.message || ''));
  ok('emit error no stack leak', !('stack' in err) && !/at x/.test(errBlob));
  ok('emit error no seed/detail leak', !('seed' in err) && !('detail' in err));
  ok('emit error failureClass', err.failureClass === 'timeout' || err.failureClass === 'error');

  const sse = scrubSseError({
    message: `sse ${FORBIDDEN} Bearer abc.def SAME_ENTITY`,
    code: 'provider_error',
  });
  ok('sse error SoT QID scrub', !JSON.stringify(sse).includes(FORBIDDEN));
  ok('sse error bearer scrub', !/Bearer abc/i.test(JSON.stringify(sse)));
  ok('sse error directive blocked', !/SAME_ENTITY/.test(sse.message || ''));

  const g = scrubGraphPayload(
    {
      nodes: [
        { id: 'n1', label: 'Ada' },
        { id: 'n2', label: 'Safe' },
      ],
      edges: [
        {
          from: 'n1',
          to: 'n2',
          relationship: 'related-entity',
          signalSummary: 'ok',
          why: `because ${FORBIDDEN} and token=edgeSecret`,
          reason: `api_key=leak-${FORBIDDEN}`,
          note: 'TITLE_BRIDGE revive attempt',
          stack: 'should-drop',
          detail: { password: 'hunter2' },
        },
      ],
    },
    [],
  );
  const gBlob = JSON.stringify(g || {});
  ok('graph edge Acc QID scrub depth', !gBlob.includes(FORBIDDEN));
  ok('graph edge credential scrub depth', !/edgeSecret|api_key=leak|hunter2/i.test(gBlob));
  ok('graph edge no stack/detail spread', !/"stack"/i.test(gBlob) && !/hunter2/i.test(gBlob));
  ok('graph edge directive blocked in note', !/TITLE_BRIDGE/.test(gBlob));
  const chunk = scrubGraphChunk({
    nodes: [{ id: 'n1' }, { id: 'n2' }],
    edges: [
      {
        from: 'n1',
        to: 'n2',
        relationship: 'related-entity',
        why: `mention ${FORBIDDEN}`,
      },
    ],
  });
  ok('graph chunk why Acc scrub', !JSON.stringify(chunk || {}).includes(FORBIDDEN));

  const soft = scrubSoftErForEmit({
    softRefs: ['seed:abc'],
    status: 'candidate',
    displayHint: 'Ada',
    hints: {
      seedClass: 'person',
      urls: ['https://localhost/secret', 'http://127.0.0.1/admin', 'https://en.wikipedia.org/wiki/Ada_Lovelace'],
    },
  });
  const softBlob = JSON.stringify(soft);
  ok('softEr no raw localhost poison', !/localhost\/secret|127\.0\.0\.1/i.test(softBlob));
  ok('softEr classifies urls', Array.isArray(soft.hints?.urls) && soft.hints.urls.every((u) => u.safety));

  const snap = sanitizeDiscoveryPayload({
    sessionId: 'emit-depth',
    seed: 'safe',
    status: 'partial',
    findings: [],
    evidence: [],
    softEr: {
      softRefs: ['seed:x'],
      status: 'candidate',
      hints: { urls: ['https://169.254.169.254/latest/meta-data/', 'file:///etc/passwd'] },
    },
    errors: [
      {
        code: 'timeout',
        message: `fail ${FORBIDDEN} password=x`,
        stack: 'STACK',
        seed: 'seed-leak',
      },
    ],
    graph: {
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [{ from: 'a', to: 'b', relationship: 'related-entity', note: `token=abc ${FORBIDDEN}` }],
    },
  });
  const sBlob = JSON.stringify(snap);
  ok('snapshot errors Acc scrub depth', !sBlob.includes(FORBIDDEN));
  ok('snapshot errors no stack/seed', !/STACK|seed-leak|password=x/i.test(sBlob));
  ok('snapshot graph edge note scrub', !/token=abc/i.test(sBlob));
  ok('snapshot softEr no metadata IP raw', !/169\.254\.169\.254|file:\/\//i.test(sBlob));
}

// ---------- Wave-3: FailureInject soft-fail family consistency ----------
{
  ok('failure kinds cover soft-fail families', failureKindsCoverSoftFailFamilies() === true);
  ok('FAILURE_KINDS has cancelled', FAILURE_KINDS.includes('provider_cancelled'));
  ok('FAILURE_KINDS has budget_exhausted', FAILURE_KINDS.includes('provider_budget_exhausted'));
  ok('map timeout→timeout', softFailCodeForFailureKind('provider_timeout') === 'timeout');
  ok('map cancelled→cancelled', softFailCodeForFailureKind('provider_cancelled') === 'cancelled');
  ok(
    'map budget→budget_exhausted',
    softFailCodeForFailureKind('provider_budget_exhausted') === 'budget_exhausted',
  );
  ok('map 429→http_429', softFailCodeForFailureKind('provider_429') === 'http_429');
  ok('map 5xx→http_503', softFailCodeForFailureKind('provider_5xx') === 'http_503');

  const codes = [
    softFailCodeForFailureKind('provider_cancelled'),
    softFailCodeForFailureKind('provider_timeout'),
    softFailCodeForFailureKind('provider_429'),
    softFailCodeForFailureKind('provider_budget_exhausted'),
  ];
  ok('inject soft-fail codes pairwise distinct', softFailCodesArePairwiseDistinct(codes));

  for (const kind of [
    'provider_timeout',
    'provider_cancelled',
    'provider_budget_exhausted',
    'provider_429',
    'provider_5xx',
  ]) {
    const chk = assertInjectedSoftFailCode(kind);
    ok(`inject ${kind} → softFail ${chk.expected}`, chk.ok === true && chk.got === chk.expected);
  }

  ok(
    'injectError timeout code',
    adapterSoftFailCode(injectErrorForKind('provider_timeout')) === 'timeout',
  );
  ok(
    'injectError budget code',
    adapterSoftFailCode(injectErrorForKind('provider_budget_exhausted')) === 'budget_exhausted',
  );
  ok(
    'injectError 429 code',
    adapterSoftFailCode(injectErrorForKind('provider_429')) === 'http_429',
  );
}


console.log(`\n--- goImpl.harden ---`);
console.log(`passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
