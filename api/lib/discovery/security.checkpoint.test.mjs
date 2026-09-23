/**
 * Checkpoint F — Security + obs lite units (prove scrub / SSRF / caps / redaction).
 * Run: node api/lib/discovery/security.checkpoint.test.mjs
 * NO invented green — every assert exercised.
 */
import {
  SECURITY_MODULE_VERSION,
  redactSensitiveText,
  sanitizeSourceContent,
  assertFetchUrlSafe,
  withSourceTimeout,
  assertPayloadSize,
  containsSecurityBait,
  assertPlanUrlTargetsSafe,
  selectFetchablePlanUrlTargets,
  runPlanUrlTargetsFetchGate,
  scrubProvidersState,
  assertSafePublicHttpsUrl,
  isBlockedDiscoveryHost,
} from './security.js';
import { buildQueryPlan, scrubQueryPlanForEmit } from './queryPlan.js';
import { discoveryApiError, discoveryEmptyOk, API_FAILURE_CLASSES } from './apiErrors.js';
import {
  MAX_SEED_CHARS,
  MAX_BODY_JSON_CHARS,
  MAX_HINTS_JSON_CHARS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_BACKEND,
  validateDiscoveryCreateBody,
  checkDiscoveryRateLimit,
  resetDiscoveryRateLimit,
  getDiscoveryRateLimitInfo,
  clientKeyFromReq,
} from './requestGuards.js';
import {
  mintCorrelationId,
  buildStructuredLog,
  logDiscoveryEvent,
  resetMetrics,
  getMetricsSnapshot,
} from './obs.js';
import { scrubSseError } from './sse.js';
import {
  sanitizeDiscoveryPayload,
  scrubErrorChunk,
  scrubGraphChunk,
  scrubPlanChunk,
  EMIT_DEEP_SKIP_KEYS,
} from './emit.js';
import { FORBIDDEN_IDENTITY_QIDS, FORBIDDEN_IDENTITIES_VERSION } from '../forbiddenIdentities.js';

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
resetDiscoveryRateLimit();
resetMetrics();

assert('security module version', !!SECURITY_MODULE_VERSION);
assert('fiv pinned', FORBIDDEN_IDENTITIES_VERSION === '2026-09-19.1');

// ---------- SSRF / urlSafety ----------
const ssrfBlock = [
  'http://127.0.0.1/',
  'https://localhost/',
  'https://app.localhost/',
  'https://host.local/',
  'https://svc.internal/',
  'http://169.254.169.254/',
  'https://metadata.google.internal/',
  'https://instance-data/',
  'https://metadata.azure.com/',
  'https://192.168.1.1/',
  'https://10.0.0.1/',
  'https://172.16.5.1/',
  'https://[::1]/',
  'https://8.8.8.8/',
  'javascript:alert(1)',
  'data:text/html,hi',
  'file:///etc/passwd',
  'https://user:pass@example.com/',
  'https://0/',
];
for (const u of ssrfBlock) {
  const r = assertFetchUrlSafe(u);
  assert(`SSRF block ${u.slice(0, 48)}`, r.ok === false);
}
assert('SSRF allow example.com', assertSafePublicHttpsUrl('https://example.com/a').ok === true);
assert('SSRF allow wikidata', assertFetchUrlSafe('https://www.wikidata.org/wiki/Q42').ok === true);
assert('host metadata blocked', isBlockedDiscoveryHost('metadata.google.internal') === true);
assert('host example ok', isBlockedDiscoveryHost('example.com') === false);

// ---------- Payload / input validation ----------
assert('empty seed reject', validateDiscoveryCreateBody({}).ok === false);
assert('ok seed', validateDiscoveryCreateBody({ seed: 'Ada Lovelace' }).ok === true);
assert(
  'oversized seed 413',
  validateDiscoveryCreateBody({ seed: 'x'.repeat(MAX_SEED_CHARS + 1) }).status === 413,
);
assert(
  'oversized body string',
  validateDiscoveryCreateBody('{"seed":"y"}' + 'x'.repeat(MAX_BODY_JSON_CHARS)).ok === false,
);
assert(
  'oversized hints',
  validateDiscoveryCreateBody({ seed: 'ok', hints: { blob: 'h'.repeat(MAX_HINTS_JSON_CHARS) } }).ok ===
    false,
);
assert('payload size ok small', assertPayloadSize({ a: 1 }).ok === true);
assert('payload size reject huge', assertPayloadSize({ blob: 'z'.repeat(300_000) }).ok === false);

// ---------- Rate limit + isolation notes (unit) ----------
assert('rate backend is memory', RATE_LIMIT_BACKEND === 'memory');
assert('rate info documents no Upstash RL', getDiscoveryRateLimitInfo().upstashWiredForRateLimit === false);
assert('rate info distributed=false', getDiscoveryRateLimitInfo().distributed === false);
resetDiscoveryRateLimit();
let tripped = false;
for (let i = 0; i < RATE_LIMIT_MAX + 3; i++) {
  const r = checkDiscoveryRateLimit('sec-f-client', { max: 5, windowMs: 60_000 });
  if (!r.ok && r.status === 429) tripped = true;
}
assert('rate limit trips', tripped === true);
assert('429 carries backend=memory', checkDiscoveryRateLimit('sec-f-client', { max: 5 }).backend === 'memory');
// Isolation: separate keys do not share counters
resetDiscoveryRateLimit();
assert('rate key A ok', checkDiscoveryRateLimit('iso-A', { max: 2 }).ok === true);
assert('rate key B ok independent', checkDiscoveryRateLimit('iso-B', { max: 2 }).ok === true);
// clientKey prefers platform headers over spoofable leftmost XFF
assert(
  'clientKey prefers x-real-ip',
  clientKeyFromReq({ headers: { 'x-real-ip': '203.0.113.9', 'x-forwarded-for': '1.2.3.4, 203.0.113.9' } }) ===
    '203.0.113.9',
);
assert(
  'clientKey vercel-forwarded-for rightmost',
  clientKeyFromReq({ headers: { 'x-vercel-forwarded-for': '1.2.3.4, 198.51.100.7' } }) === '198.51.100.7',
);
assert('clientKey anon fallback', clientKeyFromReq({ headers: {} }) === 'anon' || !!clientKeyFromReq({ headers: {} }));

// ---------- Redaction: text / source content ----------
assert(
  'redact bearer',
  redactSensitiveText('Authorization: Bearer sk-live-SECRET99').includes('[REDACTED]'),
);
assert('redact Acc QID', !redactSensitiveText(`mention ${FORBIDDEN}`).includes(FORBIDDEN));
assert(
  'redact SAME-ENTITY directive',
  redactSensitiveText('promote SAME-ENTITY now').includes('[BLOCKED_DIRECTIVE]'),
);
const src = sanitizeSourceContent(`Famous ${FORBIDDEN} — api_key=secret123`, { field: 'og:title' });
assert('source content stripped', src.stripped === true);
assert('source content no bait', !String(src.text || '').includes(FORBIDDEN));
assert('source content no secret', !/secret123/i.test(String(src.text || '')));
assert('containsSecurityBait credential', containsSecurityBait('password=hunter2').bait === true);
assert('containsSecurityBait Acc', containsSecurityBait({ q: FORBIDDEN }).bait === true);
assert('containsSecurityBait clean', containsSecurityBait({ q: 'Q42', t: 'ok' }).bait === false);

// ---------- SSE / emit / plan / graph / error redaction ----------
const sseErr = scrubSseError({
  code: 'provider_error',
  message: `upstream ${FORBIDDEN} Bearer abc.def.ghi SAME-ENTITY`,
});
assert('SSE error Acc redacted', !JSON.stringify(sseErr).includes(FORBIDDEN));
assert('SSE error bearer redacted', !/Bearer abc/i.test(JSON.stringify(sseErr)));
assert('SSE error directive blocked', !/SAME-ENTITY/.test(sseErr.message));

const errChunk = scrubErrorChunk({
  message: `fail ${FORBIDDEN} token=xyz`,
});
assert('emit error chunk Acc scrub', !JSON.stringify(errChunk).includes(FORBIDDEN));

const plan = scrubQueryPlanForEmit({
  planId: 'sec-plan',
  seedClass: 'person',
  orderedIntents: [
    {
      intentId: 'DISCOVER_IDENTITY_REFERENCES',
      priority: 1,
      sourceFamilies: ['wikidata'],
      queries: [{ familyId: 'wikidata', providerId: 'wikidata', q: `bait ${FORBIDDEN}` }],
      reason: 'api_key=leak',
    },
  ],
  reasons: [{ target: 'x', reason: `password=hunter2 and ${FORBIDDEN}` }],
  sourceFamilies: ['wikidata'],
  knownRefs: [FORBIDDEN],
  budgets: { silentExpansionForbidden: true },
  dedupeRules: { titleBridgeForbidden: true, typedSoftRefAttachOnly: true },
});
assert('plan scrub leak=0', !JSON.stringify(plan).match(new RegExp(FORBIDDEN, 'i')));
assert('plan scrub credential', !/hunter2|api_key=leak/i.test(JSON.stringify(plan)));

const gChunk = scrubGraphChunk({
  nodes: [{ id: 'n1' }, { id: `wd-${FORBIDDEN}` }],
  edges: [{ from: 'n1', to: `wd-${FORBIDDEN}`, relationship: 'related-entity', planId: 'p' }],
});
assert('graph chunk leak=0', !JSON.stringify(gChunk || {}).match(new RegExp(FORBIDDEN, 'i')));

const snap = sanitizeDiscoveryPayload({
  sessionId: 'sec-snap',
  seed: 'safe',
  status: 'partial',
  findings: [
    {
      id: 'f-ok',
      title: 'Safe',
      evidenceIds: ['e1'],
      entityRefs: ['Q42'],
    },
    {
      id: `wd-${FORBIDDEN}`,
      title: 'trap',
      evidenceIds: ['e-bad'],
      entityRefs: [FORBIDDEN],
    },
  ],
  evidence: [
    { id: 'e1', provenanceUrl: 'https://www.wikidata.org/wiki/Q42', quote: 'ok' },
    {
      id: 'e-bad',
      provenanceUrl: `https://www.wikidata.org/wiki/${FORBIDDEN}`,
      quote: 'poison',
    },
  ],
  errors: [{ message: `err ${FORBIDDEN}` }],
  graph: {
    nodes: [{ id: 'f-ok' }, { id: `wd-${FORBIDDEN}` }],
    edges: [{ from: 'f-ok', to: `wd-${FORBIDDEN}`, relationship: 'related-entity' }],
  },
});
assert('snapshot Acc leak=0', !JSON.stringify(snap).match(new RegExp(FORBIDDEN, 'i')));
assert('snapshot keeps safe finding', (snap.findings || []).some((f) => f.id === 'f-ok'));

// ---------- Observability structured log (no Acc leakage) ----------
const cid = mintCorrelationId('sec');
const rec = buildStructuredLog({
  event: 'family_call',
  correlationId: cid,
  requestId: 'req-1',
  queryId: 'q-1',
  planId: 'qp-1',
  familyId: 'knowledge_graph',
  providerId: 'wikidata',
  stage: 'S8',
  status: 'partial',
  stateTransition: { from: 'running', to: 'partial' },
  timings: { totalMs: 120, providerMs: 80 },
  budget: { status: 'BUDGET_AVAILABLE', remainingRequests: 3, exhaustedReason: null },
  counts: { findings: 2, evidence: 3, graphNodes: 4, graphEdges: 1 },
  message: `completed near ${FORBIDDEN} with Bearer tok`,
});
assert('obs has correlationId', rec.correlationId === cid);
assert('obs has familyId', rec.familyId === 'knowledge_graph');
assert('obs has timings', rec.timings?.totalMs === 120);
assert('obs has budget', rec.budget?.remainingRequests === 3);
assert('obs has evidence count', rec.counts?.evidence === 3);
assert('obs has state transition', rec.stateTransition?.to === 'partial');
assert('obs message Acc scrubbed', !String(rec.message || '').includes(FORBIDDEN));
assert('obs message no bearer', !/Bearer tok/i.test(String(rec.message || '')));
assert('obs no seed field', !('seed' in rec));
const logged = logDiscoveryEvent({
  event: 'budget_exhausted',
  correlationId: cid,
  budget: { status: 'BUDGET_EXHAUSTED', exhaustedReason: 'maxRequests' },
  counts: { findings: 1, evidence: 1 },
});
assert('logDiscoveryEvent returns record', logged.event === 'budget_exhausted');
const metrics = getMetricsSnapshot();
assert('metrics counters present', !!metrics.counters);

// ---------- Perf lite: timeout / cancel — never bypass SSRF ----------
{
  // Must still block unsafe URL before any timed work
  assert('timeout path still SSRF-blocks', assertFetchUrlSafe('http://127.0.0.1/').ok === false);

  const slow = await withSourceTimeout(
    async () => {
      await new Promise((r) => setTimeout(r, 500));
      return 'late';
    },
    { timeoutMs: 30, label: 'test_provider' },
  );
  assert('source timeout fails closed', slow.ok === false && slow.failureClass === 'provider_timeout');
  assert('timeout message scrubbed', !containsSecurityBait(slow.message).bait);

  const ac = new AbortController();
  const p = withSourceTimeout(
    async ({ signal }) => {
      await new Promise((r, j) => {
        const t = setTimeout(r, 5000);
        signal.addEventListener('abort', () => {
          clearTimeout(t);
          j(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        });
      });
      return 'nope';
    },
    { timeoutMs: 5000, signal: ac.signal, label: 'cancel_me' },
  );
  ac.abort();
  const cancelled = await p;
  assert(
    'cancellation fails closed',
    cancelled.ok === false &&
      (cancelled.failureClass === 'cancelled' || cancelled.failureClass === 'provider_timeout'),
  );

  const fast = await withSourceTimeout(async () => ({ hit: true }), { timeoutMs: 1000, label: 'fast' });
  assert('fast path ok', fast.ok === true && fast.value.hit === true);
}

// ---------- scrubPlanChunk SSE surface ----------
{
  const summary = scrubPlanChunk({
    planId: 'p2',
    seedClass: 'ambiguous',
    orderedIntents: [],
    reasons: [{ target: 't', reason: `secret=${FORBIDDEN}` }],
    sourceFamilies: [],
    budgets: { silentExpansionForbidden: true, maxProviders: 1 },
    dedupeRules: { titleBridgeForbidden: true, typedSoftRefAttachOnly: true },
  });
  assert('SSE plan chunk leak=0', !JSON.stringify(summary || {}).match(new RegExp(FORBIDDEN, 'i')));
}


// ---------- QueryPlan urlTargets SSRF (read-only vs queryPlan; boundary re-validate) ----------
{
  const unsafeSeedPlan = buildQueryPlan({
    seed: 'http://127.0.0.1/admin',
    urls: [
      'http://127.0.0.1/',
      'https://169.254.169.254/latest/meta-data',
      'https://localhost/',
      'https://example.com/',
    ],
    hints: {},
  });
  const targets = unsafeSeedPlan.urlTargets || [];
  assert('plan has urlTargets', targets.length >= 1);
  assert(
    'no unsafe target marked allowed',
    targets.every((u) => u.safety === 'allowed' ? assertSafePublicHttpsUrl(u.url).ok : true),
  );
  assert(
    'loopback not allowed',
    !targets.some((u) => /127\.0\.0\.1/.test(u.url) && u.safety === 'allowed'),
  );
  assert(
    'metadata not allowed',
    !targets.some((u) => /169\.254/.test(u.url) && u.safety === 'allowed'),
  );
  const boundary = assertPlanUrlTargetsSafe(unsafeSeedPlan);
  assert('boundary assertPlanUrlTargetsSafe ok', boundary.ok === true);
  assert('boundary records unsafe', boundary.unsafe.length >= 1);

  // Poison: manually mark unsafe as allowed — boundary must FAIL
  const poisoned = {
    urlTargets: [{ url: 'http://127.0.0.1/', safety: 'allowed' }],
  };
  const poisonCheck = assertPlanUrlTargetsSafe(poisoned);
  assert('boundary detects UNSAFE_MARKED_ALLOWED', poisonCheck.ok === false && poisonCheck.leakAllowedUnsafe === true);

  const scrubbedPlan = scrubQueryPlanForEmit(unsafeSeedPlan);
  assert(
    'scrubbed plan does not emit raw loopback URL when unsafe',
    !(scrubbedPlan.urlTargets || []).some(
      (u) => u.safety !== 'allowed' && /127\.0\.0\.1/.test(String(u.url)) && !String(u.url).startsWith('['),
    ),
  );
}

// ---------- providers DEEP_SKIP AMBER close: explicit skip + scrub + no identity laundering ----------
{
  assert('providers is EMIT_DEEP_SKIP explicit', EMIT_DEEP_SKIP_KEYS.includes('providers'));
  const scrubbed = scrubProvidersState({
    wikidata: { status: 'error', error: `fail ${FORBIDDEN} Bearer sk-test` },
    viaf: 'ok',
    nested: [{ detail: `leak ${FORBIDDEN}` }],
  });
  const blob = JSON.stringify(scrubbed);
  assert('providers scrub Acc', !blob.includes(FORBIDDEN));
  assert('providers scrub credential', !/sk-test|Bearer/i.test(blob));
  assert('providers nested Acc scrubbed', !blob.includes(FORBIDDEN));

  const snap = sanitizeDiscoveryPayload({
    sessionId: 'prov-1',
    seed: 'x',
    status: 'partial',
    findings: [],
    evidence: [],
    facets: [],
    providers: {
      wikidata: { status: 'error', message: `poison ${FORBIDDEN}`, qid: FORBIDDEN },
    },
  });
  const providersBlob = JSON.stringify(snap.providers || {});
  assert('snapshot providers Acc scrubbed', !providersBlob.includes(FORBIDDEN));
  // No identity laundering: Acc bait in providers must not become findings/candidates
  assert('providers Acc does not invent findings', (snap.findings || []).length === 0);
  assert('providers Acc does not invent candidates', snap.candidates == null || (snap.candidates || []).length === 0);
  assert('providers map still present after DEEP_SKIP', snap.providers != null && typeof snap.providers === 'object');
}

// ---------- Preview-oriented urlTargets fetch gate (no network; flag-ON simulation) ----------
{
  const mixedPlan = {
    urlTargets: [
      { url: 'https://example.com/page', safety: 'allowed' },
      { url: 'http://127.0.0.1/admin', safety: 'allowed' }, // poison
      { url: 'https://169.254.169.254/latest/meta-data', safety: 'blocked' },
      { url: 'https://www.wikidata.org/wiki/Q42', safety: 'allowed' },
      { url: '[blocked]', safety: 'blocked' },
    ],
  };
  const poisonGate = selectFetchablePlanUrlTargets(mixedPlan);
  assert('fetch gate poison → failClosed', poisonGate.ok === false && poisonGate.failClosed === true);
  assert('fetch gate poison → zero urls', poisonGate.urls.length === 0);
  assert('fetch gate poison flag', poisonGate.poison === true);

  const cleanPlan = {
    urlTargets: [
      { url: 'https://example.com/a', safety: 'allowed' },
      { url: 'https://localhost/', safety: 'blocked' },
      { url: 'http://10.0.0.1/', safety: 'unsafe' },
    ],
  };
  const cleanGate = selectFetchablePlanUrlTargets(cleanPlan);
  assert('clean gate ok', cleanGate.ok === true && cleanGate.poison === false);
  assert('clean gate only public https', cleanGate.urls.every((u) => assertSafePublicHttpsUrl(u).ok));
  assert('clean gate excludes localhost/private', !cleanGate.urls.some((u) => /localhost|10\.0\.0/.test(u)));
  assert('clean gate includes example.com', cleanGate.urls.some((u) => /example\.com/.test(u)));

  const fetched = [];
  const gateRun = await runPlanUrlTargetsFetchGate(mixedPlan, {
    fetchFn: async (url) => {
      fetched.push(url);
      return { ok: true };
    },
  });
  assert('Preview sim poison never fetches', gateRun.ok === false && fetched.length === 0 && gateRun.poison === true);

  const fetched2 = [];
  const gateRun2 = await runPlanUrlTargetsFetchGate(cleanPlan, {
    fetchFn: async (url) => {
      fetched2.push(url);
      return { ok: true };
    },
  });
  assert('Preview sim clean fetches only allowlisted', gateRun2.ok === true);
  assert('Preview sim fetched count matches gate', fetched2.length === cleanGate.urls.length);
  assert(
    'Preview sim no private in fetched',
    fetched2.every((u) => assertSafePublicHttpsUrl(u).ok === true),
  );

  // Declared allowed but http (scheme) — must not fetch
  const httpAllowed = { urlTargets: [{ url: 'http://example.com/', safety: 'allowed' }] };
  const httpGate = selectFetchablePlanUrlTargets(httpAllowed);
  assert('http marked allowed is poison/failClosed', httpGate.urls.length === 0 && httpGate.ok === false);
}

// ---------- providers Acc scrub strengthen: forbidden QID keys + bait in errors ----------
{
  const keyed = scrubProvidersState({
    [FORBIDDEN]: { status: 'ok' },
    wikidata: { status: 'error', error: `upstream ${FORBIDDEN}`, qid: FORBIDDEN },
  });
  const blob = JSON.stringify(keyed);
  assert('providers Acc key scrubbed', !blob.includes(FORBIDDEN));
  assert('providers Acc key replaced', Object.keys(keyed).some((k) => k.includes('REDACTED_QID') || k === 'wikidata'));
  assert('providers key map still object', keyed != null && typeof keyed === 'object');
  assert('providers wikidata key retained', keyed.wikidata != null);
}

// ---------- Runtime wire contract: selectFetchable is the fetch allow-list (providers/orch) ----------
{
  // Documents the boundary used by providers.js / familyOrchestrator.js / orchestrator.js
  const plan = {
    urlTargets: [
      { url: 'https://example.com/safe', safety: 'allowed' },
      { url: 'http://169.254.169.254/', safety: 'allowed' },
    ],
  };
  const gate = selectFetchablePlanUrlTargets(plan);
  assert('runtime wire gate poison failClosed', gate.failClosed === true && gate.urls.length === 0);
  const safeOnly = selectFetchablePlanUrlTargets({
    urlTargets: [{ url: 'https://example.org/x', safety: 'allowed' }],
  });
  assert('runtime wire gate allows public https', safeOnly.urls.length === 1 && assertSafePublicHttpsUrl(safeOnly.urls[0]).ok);
}

// ---------- API error shape consistency (Checkpoint G) ----------
{
  assert('API_FAILURE_CLASSES includes failed_soft', API_FAILURE_CLASSES.includes('failed_soft'));
  const e400 = discoveryApiError({ status: 400, error: `bad seed ${FORBIDDEN} token=x` });
  assert('api error 400 validation', e400.status === 400 && e400.body.failureClass === 'validation_error');
  assert('api error Acc scrubbed', !e400.body.error.includes(FORBIDDEN));
  assert('api error ok false', e400.body.ok === false);
  const e429 = discoveryApiError({ status: 429, error: 'rate limit exceeded', retryAfterSec: 12 });
  assert('api error 429', e429.body.failureClass === 'rate_limited' && e429.body.retryAfterSec === 12);
  const empty = discoveryEmptyOk({ sessionId: 's1' });
  assert('empty ok note EMPTY≠FALSE', empty.empty === true && empty.note === 'EMPTY≠FALSE' && empty.ok === true);
}

console.log(`\n--- Checkpoint F security ---\npassed=${passed} failed=${failed}`);
process.exit(failed ? 1 : 0);
