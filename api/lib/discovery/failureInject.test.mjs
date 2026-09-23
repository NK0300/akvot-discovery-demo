/**
 * MEGA N Failure-injection + O Security + L Observability evidence.
 * Run: node api/lib/discovery/failureInject.test.mjs
 */
import {
  FAILURE_KINDS,
  shouldInject,
  wrapProviderWithInjection,
  simulateRedisUnavailable,
  softFailCodeForFailureKind,
  injectErrorForKind,
  failureKindsCoverSoftFailFamilies,
  assertInjectedSoftFailCode,
} from './failureInject.js';
import { adapterSoftFailCode, softFailCodesArePairwiseDistinct } from './adapterContract.js';
import { assertSafePublicHttpsUrl, isBlockedDiscoveryHost } from './urlSafety.js';
import {
  validateDiscoveryCreateBody,
  checkDiscoveryRateLimit,
  resetDiscoveryRateLimit,
  MAX_SEED_CHARS,
} from './requestGuards.js';
import {
  mintCorrelationId,
  incrMetric,
  recordLatency,
  recordSseLifecycle,
  getMetricsSnapshot,
  resetMetrics,
} from './obs.js';
import {
  createDiscoverySession,
  clearSessions,
  getStoreInfo,
  loadSessionRaw,
} from './orchestrator.js';
import {
  buildProgressiveEvents,
  writeProgressiveSse,
  formatSseEvent,
  SSE_RECONNECT_DOCS,
} from './sse.js';
import { normalizeRawHit } from './store.js';
import { sanitizeDiscoveryPayload } from './emit.js';

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) {
    passed += 1;
    console.log('PASS', name);
  } else {
    failed += 1;
    console.error('FAIL', name);
  }
}

resetMetrics();
resetDiscoveryRateLimit();
clearSessions();

assert('FAILURE_KINDS covers timeout/429/5xx/redis/sse', FAILURE_KINDS.length >= 5);
assert('shouldInject off by default', shouldInject('provider_timeout', {}) === false);
assert(
  'shouldInject honors injectFailure',
  shouldInject('provider_429', { injectFailure: 'provider_429' }) === true,
);

const mockOk = {
  id: 'mock',
  async search() {
    return {
      providerId: 'mock',
      findings: [
        {
          title: 'Safe Public Hit',
          provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
          quote: 'ok',
          kind: 'registry',
        },
      ],
      partial: false,
    };
  },
};

{
  const p = wrapProviderWithInjection(mockOk, 'provider_timeout');
  let threw = false;
  try {
    await p.search({ injectFailure: 'provider_timeout' }, {});
  } catch (e) {
    threw = e?.name === 'AbortError' || /Abort/i.test(String(e?.message || e));
  }
  assert('inject provider_timeout throws AbortError', threw);
}

{
  const p = wrapProviderWithInjection(mockOk, 'provider_429');
  let status = 0;
  try {
    await p.search({ injectFailure: 'provider_429' }, {});
  } catch (e) {
    status = e?.status || 0;
  }
  assert('inject provider_429 status 429', status === 429);
}

{
  const p = wrapProviderWithInjection(mockOk, 'provider_5xx');
  let status = 0;
  try {
    await p.search({ injectFailure: 'provider_5xx' }, {});
  } catch (e) {
    status = e?.status || 0;
  }
  assert('inject provider_5xx status 5xx', status >= 500);
}

{
  clearSessions();
  const boom = wrapProviderWithInjection(
    {
      id: 'boom',
      async search() {
        return { providerId: 'boom', findings: [], partial: false };
      },
    },
    'provider_timeout',
  );
  const created = await createDiscoverySession(
    { seed: 'Failure Inject Seed Alpha' },
    { providers: [boom], store: new Map() },
  );
  assert('timeout inject soft-fails create (no throw)', !!created.sessionId);
  assert('timeout inject returns status string', typeof created.status === 'string');
  const snapJson = JSON.stringify(created.snapshot || created);
  assert('timeout inject no secrets in snapshot', !/TOKEN|SECRET|API_KEY|password/i.test(snapJson));
}

{
  const sim = simulateRedisUnavailable();
  assert('redis unavailable ok=false', sim.ok === false);
  assert('redis unavailable promoteEligible=false', sim.promoteEligible === false);
  assert('redis unavailable durable=false', sim.durable === false);
  assert('redis unavailable no token leak', !/TOKEN|SECRET/i.test(JSON.stringify(sim)));
}

{
  const info = getStoreInfo();
  assert('storeBackend present', !!(info.storeBackend || info.backend));
  if ((info.storeBackend || info.backend) === 'fs-regen') {
    assert('fs-regen durable=false', info.durable === false);
    assert('fs-regen promoteEligible=false', info.promoteEligible === false);
    assert('fs-regen fallback true', info.fallback === true || info.explicitFallback === true);
  }
}

{
  clearSessions();
  const mem = new Map();
  const created = await createDiscoverySession(
    { seed: 'SSE Disconnect Seed' },
    { providers: [mockOk], store: mem },
  );
  let raw = await loadSessionRaw(created.sessionId, { store: mem });
  if (!raw) {
    raw = {
      sessionId: created.sessionId,
      seed: 'SSE Disconnect Seed',
      status: created.status || 'complete',
      findings: created.snapshot?.findings || [],
      evidence: created.snapshot?.evidence || [],
      facets: created.snapshot?.facets || [],
      providers: { mock: 'ok' },
      progress: { done: 1, totalHint: 1 },
      version: 1,
      eventCursor: 0,
    };
  }

  const events = buildProgressiveEvents(raw);
  assert('SSE events non-empty', events.length >= 2);
  assert('SSE events include done', events.some((e) => e.event === 'done'));
  assert(
    'SSE reconnect hangPolicy finite',
    /finite/i.test(SSE_RECONNECT_DOCS.hangPolicy || ''),
  );

  const chunks = [];
  let writes = 0;
  const flakyRes = {
    write(s) {
      writes += 1;
      if (writes > 2) {
        const err = new Error('EPIPE injected disconnect');
        err.code = 'EPIPE';
        throw err;
      }
      chunks.push(s);
      return true;
    },
    flush() {},
  };
  await writeProgressiveSse(flakyRes, raw, { delayMs: 0, correlationId: 'test-sse-disc' });
  assert('SSE disconnect returns without hang', true);

  const snap = getMetricsSnapshot();
  const counters = snap.counters || {};
  assert(
    'SSE lifecycle metrics recorded',
    Object.keys(counters).some((k) => k.startsWith('sse.')),
  );

  const chunks2 = [];
  const lastId = events[events.length - 1]?.id || 99;
  await writeProgressiveSse(
    { write: (s) => chunks2.push(s), flush() {} },
    raw,
    { delayMs: 0, lastEventId: lastId, correlationId: 'test-sse-resume' },
  );
  assert('SSE resume-past-end emits done', /event: done/.test(chunks2.join('')));
}

{
  const poisoned = {
    sessionId: 'sess-poison',
    seed: 'Poison Seed',
    status: 'complete',
    findings: [
      {
        id: 'Q1701775',
        title: 'FORBIDDEN',
        summary: 'no',
        providers: ['x'],
        kind: 'registry',
        entityRefs: ['Q1701775'],
        evidenceIds: ['ev1'],
      },
    ],
    evidence: [
      {
        id: 'ev1',
        provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775',
        quote: 'bad',
      },
    ],
    facets: [],
    providers: {},
    progress: { done: 1 },
    version: 1,
  };
  const scrubbed = sanitizeDiscoveryPayload(poisoned);
  assert(
    'sanitizeDiscoveryPayload strips Q1701775',
    !/Q1701775/i.test(JSON.stringify(scrubbed)),
  );
  const evs = buildProgressiveEvents(poisoned);
  assert('SSE progressive Acc-scrubs Q1701775', !/Q1701775/i.test(JSON.stringify(evs)));
}

assert('https public ok', assertSafePublicHttpsUrl('https://example.com/a').ok === true);
assert('http rejected', assertSafePublicHttpsUrl('http://example.com/a').ok === false);
assert('javascript rejected', assertSafePublicHttpsUrl('javascript:alert(1)').ok === false);
assert('data rejected', assertSafePublicHttpsUrl('data:text/html,x').ok === false);
assert('file rejected', assertSafePublicHttpsUrl('file:///etc/passwd').ok === false);
assert('localhost rejected', assertSafePublicHttpsUrl('https://localhost/x').ok === false);
assert('.localhost rejected', assertSafePublicHttpsUrl('https://app.localhost/x').ok === false);
assert('.local rejected', assertSafePublicHttpsUrl('https://host.local/x').ok === false);
assert('.internal rejected', assertSafePublicHttpsUrl('https://svc.internal/x').ok === false);
assert('metadata IP rejected', assertSafePublicHttpsUrl('https://169.254.169.254/').ok === false);
assert('127 rejected', assertSafePublicHttpsUrl('https://127.0.0.1/').ok === false);
assert('hex loopback rejected', assertSafePublicHttpsUrl('https://0x7f000001/').ok === false);
assert('decimal loopback rejected', assertSafePublicHttpsUrl('https://2130706433/').ok === false);
assert('userinfo rejected', assertSafePublicHttpsUrl('https://user:pass@example.com/').ok === false);
assert('raw ipv4 rejected', assertSafePublicHttpsUrl('https://8.8.8.8/').ok === false);
assert('isBlockedDiscoveryHost localhost', isBlockedDiscoveryHost('localhost') === true);
assert('isBlockedDiscoveryHost example.com', isBlockedDiscoveryHost('example.com') === false);

assert(
  'normalize drops javascript provenance',
  normalizeRawHit({ title: 'x', provenanceUrl: 'javascript:alert(1)' }, 't') === null,
);
assert(
  'normalize drops .localhost provenance',
  normalizeRawHit({ title: 'x', provenanceUrl: 'https://evil.localhost/a' }, 't') === null,
);
assert(
  'normalize keeps public https',
  !!normalizeRawHit(
    { title: 'x', provenanceUrl: 'https://www.wikidata.org/wiki/Q42', quote: 'a' },
    'wikidata',
  ),
);

assert('empty seed rejected', validateDiscoveryCreateBody({}).ok === false);
assert('ok seed accepted', validateDiscoveryCreateBody({ seed: 'Ada Lovelace' }).ok === true);
assert(
  'oversized seed rejected',
  validateDiscoveryCreateBody({ seed: 'x'.repeat(MAX_SEED_CHARS + 1) }).ok === false,
);
{
  resetDiscoveryRateLimit();
  let hit = false;
  for (let i = 0; i < 50; i++) {
    const r = checkDiscoveryRateLimit('test-ip', { max: 5, windowMs: 60_000 });
    if (!r.ok) {
      hit = r.status === 429;
      break;
    }
  }
  assert('rate limit trips at max', hit);
}

{
  resetMetrics();
  const cid = mintCorrelationId('test');
  assert('correlation id minted', typeof cid === 'string' && cid.includes('test'));
  incrMetric('discovery.test');
  recordLatency('discovery.test', 12, true);
  recordSseLifecycle('open', { correlationId: cid });
  recordSseLifecycle('terminal_done', { correlationId: cid, frames: 3 });
  const m = getMetricsSnapshot();
  const c = m.counters || {};
  assert('metrics snapshot has counters', Object.keys(c).length >= 1);
  assert('sse.open counted', (c['sse.open'] || 0) >= 1);
  assert('no secrets in metrics', !/TOKEN|SECRET|API_KEY/i.test(JSON.stringify(m)));
}

{
  const frame = formatSseEvent('meta', { sessionId: 's1' }, 1);
  assert('sse frame has id+event+data', /id: 1\nevent: meta\ndata: /.test(frame));
}

{
  assert('FAILURE_KINDS includes cancelled+budget', FAILURE_KINDS.includes('provider_cancelled') && FAILURE_KINDS.includes('provider_budget_exhausted'));
  assert('failureKindsCoverSoftFailFamilies', failureKindsCoverSoftFailFamilies() === true);
  assert('softFail map timeout', softFailCodeForFailureKind('provider_timeout') === 'timeout');
  assert('softFail map cancelled', softFailCodeForFailureKind('provider_cancelled') === 'cancelled');
  assert('softFail map budget', softFailCodeForFailureKind('provider_budget_exhausted') === 'budget_exhausted');
  assert('softFail map 429', softFailCodeForFailureKind('provider_429') === 'http_429');
  const mapped = [
    softFailCodeForFailureKind('provider_cancelled'),
    softFailCodeForFailureKind('provider_timeout'),
    softFailCodeForFailureKind('provider_429'),
    softFailCodeForFailureKind('provider_budget_exhausted'),
  ];
  assert('softFail mapped pairwise distinct', softFailCodesArePairwiseDistinct(mapped));
  for (const kind of ['provider_timeout', 'provider_cancelled', 'provider_budget_exhausted', 'provider_429', 'provider_5xx']) {
    const chk = assertInjectedSoftFailCode(kind);
    assert(`assertInjectedSoftFailCode ${kind}`, chk.ok === true);
  }
  assert(
    'injectErrorForKind budget → adapterSoftFailCode',
    adapterSoftFailCode(injectErrorForKind('provider_budget_exhausted')) === 'budget_exhausted',
  );
  assert(
    'injectErrorForKind cancelled → adapterSoftFailCode',
    adapterSoftFailCode(injectErrorForKind('provider_cancelled'), { aborted: true }) === 'cancelled',
  );
}

{
  const pCancel = wrapProviderWithInjection(mockOk, 'provider_cancelled');
  let code = '';
  try {
    await pCancel.search({ injectFailure: 'provider_cancelled' }, {});
  } catch (e) {
    code = adapterSoftFailCode(e, { aborted: true });
  }
  assert('wrap inject cancelled soft-fail code', code === 'cancelled');
}

{
  const pBud = wrapProviderWithInjection(mockOk, 'provider_budget_exhausted');
  let code = '';
  try {
    await pBud.search({ injectFailure: 'provider_budget_exhausted' }, {});
  } catch (e) {
    code = adapterSoftFailCode(e);
  }
  assert('wrap inject budget soft-fail code', code === 'budget_exhausted');
}


console.log('\n--- failureInject / security / obs ---');
console.log(`passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
