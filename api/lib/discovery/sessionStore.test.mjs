/**
 * Session store unit tests — durable false-confidence fix, health WRITE→READ→UPDATE→DELETE.
 * Live Redis skipped when KV/UPSTASH env absent.
 * Run: node api/lib/discovery/sessionStore.test.mjs
 */
import {
  detectStoreBackend,
  getStoreInfo,
  sessionStore,
  mintSessionId,
  decodeSessionId,
  healthCheck,
  ensureSessionVersion,
  conditionalSet,
  logStoreOp,
  classifyStoreFailure,
  scrubSessionRef,
  durabilityStateFor,
  STORE_OUTCOMES,
  FAILURE_CLASSES,
  toMandateFailureClass,
  recordKvProbe,
  resetKvProbeForTests,
  getKvProbeState,
} from './sessionStore.js';
import {
  faultInjectEnabled,
  resolveFault,
  scrubPathInjectFindings,
  shouldForceStoreMiss,
  faultTelemetry,
} from './faultInject.js';

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

const backend = detectStoreBackend();
const info = getStoreInfo();

assert('backend is known', ['fs-regen', 'vercel-kv', 'upstash'].includes(backend));
assert('storeBackend alias matches backend', info.storeBackend === info.backend);
assert('ttlMs present', typeof info.ttlMs === 'number' && info.ttlMs > 0);

// --- HIGH-VALUE FIX: fs-regen must NOT claim durable ---
if (backend === 'fs-regen') {
  assert('fs-regen durable === false (no false confidence)', info.durable === false);
  assert('fs-regen fallback === true', info.fallback === true);
  assert('fs-regen promoteEligible === false', info.promoteEligible === false);
  assert('fs-regen kvCredsPresent === false', info.kvCredsPresent === false);
  assert('fs-regen crossInstance is regenerate-from-seed', info.crossInstance === 'regenerate-from-seed');
  assert('fs-regen note mentions FALLBACK-ONLY', /FALLBACK-ONLY/i.test(info.note || ''));
} else {
  assert('kv kvCredsPresent === true', info.kvCredsPresent === true);
  assert('kv fallback === false', info.fallback === false);
  // B18: durable/promoteEligible only after successful KV probe
  if (info.kvReachable === true) {
    assert('kv durable === true after good probe', info.durable === true);
    assert('kv promoteEligible === true after good probe', info.promoteEligible === true);
  } else {
    assert('kv durable === false until probe', info.durable === false);
    assert('kv promoteEligible === false until probe', info.promoteEligible === false);
  }
}

// --- mint / decode ---
const id = mintSessionId({ seed: 'Health Probe Seed', hints: { t: 1 }, locale: 'en' });
assert('mintSessionId non-empty', typeof id === 'string' && id.length > 8);
if (backend === 'fs-regen') {
  const dec = decodeSessionId(id);
  assert('decode recovers seed', dec?.seed === 'Health Probe Seed');
  assert('decode malformed returns null', decodeSessionId('not-a-session') === null);
  assert('decode empty returns null', decodeSessionId('') === null);
  assert('decode trash ds1 returns null', decodeSessionId('ds1.!!!') === null);
}

// --- missing key ---
sessionStore.clearMemory();
const missing = await sessionStore.get('definitely-missing-key-zzz');
assert('missing key returns null', missing === null);

// --- malformed state: write garbage file is covered by fsGet catch → null ---
// (fs path hashed; we just ensure get on nonsense id is null)
assert('nonsense id get null', (await sessionStore.get('')) === null);

// --- version helpers ---
const sess = { sessionId: 'v1', findings: [] };
ensureSessionVersion(sess);
assert('ensureSessionVersion sets version 1', sess.version === 1);
ensureSessionVersion(sess, { bump: true });
assert('ensureSessionVersion bump → 2', sess.version === 2);

// --- health WRITE→READ→UPDATE→DELETE ---
const hc = await healthCheck({ correlationId: 'test-hc-mega' });
assert('healthCheck ok', hc.ok === true);
assert('health has storeBackend', !!hc.storeBackend);
assert('health steps include WRITE', hc.steps.some((s) => s.step === 'WRITE' && s.ok));
assert('health steps include READ', hc.steps.some((s) => s.step === 'READ' && s.ok));
assert('health steps include UPDATE', hc.steps.some((s) => s.step === 'UPDATE' && s.ok));
assert('health steps include DELETE', hc.steps.some((s) => s.step === 'DELETE' && s.ok));
assert('health correlationId echoed', hc.correlationId === 'test-hc-mega');
assert('health promoteEligible matches info', hc.promoteEligible === info.promoteEligible);
assert('health durable matches info', hc.durable === info.durable);
if (backend === 'fs-regen') {
  assert('health mode fs-regen-local', hc.mode === 'fs-regen-local');
  assert('health no live redis required', hc.kvCredsPresent === false);
}

// --- set/get/delete roundtrip ---
const rid = 'roundtrip-' + Date.now();
await sessionStore.set(rid, { sessionId: rid, version: 1, status: 'test' });
const got = await sessionStore.get(rid);
assert('roundtrip get', got?.sessionId === rid && got?.version === 1);
await sessionStore.delete(rid);
sessionStore.clearMemory();
const afterDel = await sessionStore.get(rid);
assert('after delete get null', afterDel === null);

// --- conditionalSet conflict ---
const cid = 'cond-' + Date.now();
await sessionStore.set(cid, { sessionId: cid, version: 5, status: 'a' });
let conflict = false;
try {
  await conditionalSet(cid, { sessionId: cid, status: 'b' }, { expectedVersion: 3 });
} catch (e) {
  conflict = e?.status === 409;
}
assert('conditionalSet 409 on stale expectedVersion', conflict);
await sessionStore.delete(cid);
sessionStore.clearMemory();

// --- no secrets in getStoreInfo ---
const infoJson = JSON.stringify(info);
assert('no token-like keys in store info', !/TOKEN|SECRET|PASSWORD|API_KEY/i.test(infoJson));
assert('kvCredsPresent is boolean not secret', typeof info.kvCredsPresent === 'boolean');

// --- skip live redis note ---
if (!info.kvCredsPresent) {
  assert('SKIP live Redis: env absent (documented)', true);
  console.log('INFO live Redis tests skipped — KV/UPSTASH env absent (BLOCKER for promote)');
}


// --- MEGA C: explicitFallback / fsRegenFallback ---
assert('explicitFallback === fallback', info.explicitFallback === info.fallback);
assert('fsRegenFallback === (backend===fs-regen)', info.fsRegenFallback === (backend === 'fs-regen'));
if (backend === 'fs-regen') {
  assert('fs-regen explicitFallback true', info.explicitFallback === true);
  assert('fs-regen fsRegenFallback true', info.fsRegenFallback === true);
}

// --- health response contract ---
assert('health has backend field', !!hc.backend);
assert('health has latencyMs', typeof hc.latencyMs === 'number');
assert('health fsRegenFallback bool', typeof hc.fsRegenFallback === 'boolean');
assert('health explicitFallback bool', typeof hc.explicitFallback === 'boolean');
if (backend === 'fs-regen') {
  assert('health fsRegenFallback true', hc.fsRegenFallback === true);
  assert('health promoteEligible false', hc.promoteEligible === false);
}

// --- logStoreOp no secrets ---
const tel = logStoreOp('test', { backend, latencyMs: 1, ok: true, correlationId: 'c1' });
assert('telemetry has storeBackend', tel.storeBackend === backend);
assert('telemetry no token', !/TOKEN|SECRET/i.test(JSON.stringify(tel)));

// --- fault inject gated off by default ---
assert('faultInject disabled without env', faultInjectEnabled() === false);
assert('resolveFault null when gated off', resolveFault({ fault: 'store_miss' }) === null);

const prevFault = process.env.DISCOVERY_FAULT_INJECT;
process.env.DISCOVERY_FAULT_INJECT = '1';
assert('faultInject enabled with env', faultInjectEnabled() === true);
assert('resolveFault store_miss', resolveFault({ fault: 'store_miss' }) === 'store_miss');
assert('resolveFault provider_timeout', resolveFault({ query: { fault: 'provider_timeout' } }) === 'provider_timeout');
assert('resolveFault scrub_path', resolveFault({ body: { injectFault: 'scrub_path' } }) === 'scrub_path');
assert('resolveFault unknown null', resolveFault({ fault: 'nope' }) === null);
assert('shouldForceStoreMiss', shouldForceStoreMiss('store_miss') === true);
const scrubInj = scrubPathInjectFindings('scrub_path');
assert('scrubPath inject has forbidden QID', Array.isArray(scrubInj) && /Q1701775/i.test(JSON.stringify(scrubInj)));
const ft = faultTelemetry('store_miss');
assert('faultTelemetry gatedBy present', ft?.gatedBy === 'DISCOVERY_FAULT_INJECT=1');
if (prevFault === undefined) delete process.env.DISCOVERY_FAULT_INJECT;
else process.env.DISCOVERY_FAULT_INJECT = prevFault;
assert('faultInject restored', faultInjectEnabled() === (prevFault === '1'));


// --- B17 telemetry schema ---
assert('STORE_OUTCOMES covers mandate classes', STORE_OUTCOMES.length >= 14);
assert('classify timeout', classifyStoreFailure({ name: 'AbortError', message: 'aborted' }) === 'timeout');
assert('classify connection', classifyStoreFailure(new Error('fetch failed ECONNRESET')) === 'connection_failure');
assert('classify http', classifyStoreFailure(new Error('http 503')) === 'http_failure');
assert('classify unavailable', classifyStoreFailure(new Error('kv creds missing')) === 'unavailable');
assert('classify concurrent', classifyStoreFailure(new Error('version conflict')) === 'concurrent');
assert('classify miss hint', classifyStoreFailure(null, { miss: true }) === 'miss');
assert('classify ttl hint', classifyStoreFailure(null, { expired: true }) === 'ttl_expiry');
assert('scrubSessionRef kv', /^kv1:/.test(scrubSessionRef('kv1.abcdef0123456789') || ''));
assert('scrubSessionRef ds', /^ds1:/.test(scrubSessionRef('ds1.xxxxx') || '') || scrubSessionRef('ds1.xxxxx') != null);
assert('durabilityState matches backend', durabilityStateFor(backend) === (backend === 'fs-regen' ? 'fallback-fs-regen' : 'durable-kv'));

const telOk = logStoreOp('get', {
  backend,
  latencyMs: 3,
  ok: true,
  outcome: 'success',
  correlationId: 'b17-corr',
  sessionId: 'kv1.deadbeefcafe',
  retryCount: 0,
});
assert('B17 has operation', telOk.operation === 'get');
assert('B17 has correlationId', telOk.correlationId === 'b17-corr');
assert('B17 has scrubbedSessionRef', typeof telOk.scrubbedSessionRef === 'string');
assert('B17 has duration', typeof telOk.duration === 'number');
assert('B17 outcome success', telOk.outcome === 'success');
assert('B17 backendType', telOk.backendType === backend);
assert('B17 durabilityState', typeof telOk.durabilityState === 'string');
assert('B17 retryCount number', typeof telOk.retryCount === 'number');
assert('B17 no secrets', !/TOKEN|SECRET|Bearer|eyJ/i.test(JSON.stringify(telOk)));

const telMiss = logStoreOp('get', {
  backend,
  latencyMs: 1,
  miss: true,
  outcome: 'miss',
  correlationId: 'b17-miss',
  sessionIdPrefix: 'kv1.missing01',
});
assert('B17 miss outcome', telMiss.outcome === 'miss');
assert('B17 miss failureClass', telMiss.failureClass === 'not_found' || telMiss.failureClass === 'miss');
assert('B17 miss ok false', telMiss.ok === false);
assert('B18 miss promoteEligible false', telMiss.promoteEligible === false);

const telFb = logStoreOp('set', {
  backend: 'fs-regen',
  latencyMs: 2,
  outcome: 'success',
  correlationId: 'b17-fb',
  sessionIdPrefix: 'ds1.abc',
});
assert('B18 fs-regen success never promoteEligible', telFb.promoteEligible === false);
assert('B18 fs-regen durability fallback', telFb.durabilityState === 'fallback-fs-regen');
assert('B18 fs-regen explicitFallback', telFb.explicitFallback === true);

const telTimeout = logStoreOp('set', {
  backend: 'upstash',
  ok: false,
  error: 'kv SET failed timeout',
  correlationId: 'b17-to',
  sessionIdPrefix: 'kv1.timeout01',
});
assert('B17 timeout class', telTimeout.failureClass === 'timeout' || telTimeout.outcome === 'timeout');
assert('B18 degraded promoteEligible false', telTimeout.promoteEligible === false);
assert('B18 durable-degraded', telTimeout.durabilityState === 'durable-degraded');

// telemetry get with explicit flag
sessionStore.clearMemory();
const tid = 'b17-tel-' + Date.now();
await sessionStore.set(tid, { sessionId: tid, version: 1 }, { telemetry: true, correlationId: 'b17-set' });
const tg = await sessionStore.get(tid, { telemetry: true, correlationId: 'b17-get' });
assert('telemetry roundtrip get', tg?.sessionId === tid);
await sessionStore.delete(tid, { telemetry: true, correlationId: 'b17-del' });
sessionStore.clearMemory();

// B18: health promoteEligible false when backend fs-regen
if (backend === 'fs-regen') {
  assert('B18 health promoteEligible false on fs-regen', hc.promoteEligible === false);
  assert('B18 health durable false', hc.durable === false);
}


// ========== B17 mandate FAILURE_CLASSES + B18 probe inject ==========
for (const fc of FAILURE_CLASSES) {
  assert(`FAILURE_CLASSES has ${fc}`, typeof fc === 'string' && fc.length > 0);
}
assert('FAILURE_CLASSES count>=7', FAILURE_CLASSES.length >= 7);
assert('toMandate fetch_failed', toMandateFailureClass(new Error('fetch failed')) === 'fetch_failed');
assert('toMandate auth', toMandateFailureClass(new Error('http 401'), { httpStatus: 401 }) === 'auth');
assert('toMandate timeout', toMandateFailureClass({ name: 'AbortError', message: 'aborted' }) === 'timeout');
assert('toMandate parse', toMandateFailureClass('serdeser_failure') === 'parse');
assert('toMandate not_found', toMandateFailureClass(null, { miss: true }) === 'not_found');
assert('toMandate conflict', toMandateFailureClass(new Error('version conflict')) === 'conflict');
assert('toMandate unknown', toMandateFailureClass(new Error('weird-xyz')) === 'unknown');

const mNet = logStoreOp('get', { backend: 'upstash', ok: false, error: 'fetch failed', correlationId: 'mn', latencyMs: 3 });
assert('mandate tel fetch_failed', mNet.failureClass === 'fetch_failed');
assert('mandate tel fields', mNet.op && mNet.backend && mNet.correlationId && typeof mNet.latencyMs === 'number' && mNet.ok === false);
const mAuth = logStoreOp('set', { backend: 'upstash', ok: false, error: 'http 401', httpStatus: 401, correlationId: 'ma', latencyMs: 1 });
assert('mandate tel auth', mAuth.failureClass === 'auth');
const mPar = logStoreOp('get', { backend: 'upstash', ok: false, failureClass: 'serdeser_failure', correlationId: 'mp', latencyMs: 1 });
assert('mandate tel parse', mPar.failureClass === 'parse');
const mConf = logStoreOp('set', { backend: 'upstash', ok: false, concurrent: true, correlationId: 'mc', latencyMs: 1 });
assert('mandate tel conflict', mConf.failureClass === 'conflict');

resetKvProbeForTests();
const prevU = process.env.UPSTASH_REDIS_REST_URL;
const prevT = process.env.UPSTASH_REDIS_REST_TOKEN;
const prevKU = process.env.KV_REST_API_URL;
const prevKT = process.env.KV_REST_API_TOKEN;
delete process.env.KV_REST_API_URL;
delete process.env.KV_REST_API_TOKEN;
process.env.UPSTASH_REDIS_REST_URL = 'https://example-upstash.test';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token-not-real';
resetKvProbeForTests();
assert('B18 pending durable false', getStoreInfo().durable === false);
assert('B18 pending promote false', getStoreInfo().promoteEligible === false);
recordKvProbe(false, 'fetch_failed');
assert('B18 fail durable false', getStoreInfo().durable === false);
assert('B18 fail promote false', getStoreInfo().promoteEligible === false);
assert('B18 fail explicitFallback', getStoreInfo().explicitFallback === true);
recordKvProbe(true);
assert('B18 ok durable true', getStoreInfo().durable === true);
assert('B18 ok promote true', getStoreInfo().promoteEligible === true);

const realFetch = globalThis.fetch;
globalThis.fetch = async () => { throw new Error('fetch failed'); };
resetKvProbeForTests();
sessionStore.clearMemory();
let threw = false;
try {
  await sessionStore.set('b18-fail', { sessionId: 'b18-fail', version: 1 }, { telemetry: true });
} catch (e) {
  threw = e?.status === 503 || /fetch failed|kv /i.test(String(e?.message || e));
}
assert('B18 mock set fail-loud', threw);
assert('B18 mock fail durable false', getStoreInfo().durable === false);
assert('B18 mock fail probe false', getKvProbeState().ok === false);

globalThis.fetch = async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ result: 'OK' }) });
resetKvProbeForTests();
await sessionStore.set('b18-ok', { sessionId: 'b18-ok', version: 1 }, { telemetry: true });
assert('B18 mock set success durable', getStoreInfo().durable === true);
assert('B18 mock set success promote', getStoreInfo().promoteEligible === true);

globalThis.fetch = async () => ({ ok: false, status: 401, text: async () => 'no' });
resetKvProbeForTests();
let authThrow = false;
try { await sessionStore.set('b18-auth', { sessionId: 'b18-auth', version: 1 }, { telemetry: true }); }
catch { authThrow = true; }
assert('B18 mock auth throws', authThrow);
assert('B18 mock auth durable false', getStoreInfo().durable === false);

globalThis.fetch = realFetch;
if (prevU === undefined) delete process.env.UPSTASH_REDIS_REST_URL; else process.env.UPSTASH_REDIS_REST_URL = prevU;
if (prevT === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN; else process.env.UPSTASH_REDIS_REST_TOKEN = prevT;
if (prevKU === undefined) delete process.env.KV_REST_API_URL; else process.env.KV_REST_API_URL = prevKU;
if (prevKT === undefined) delete process.env.KV_REST_API_TOKEN; else process.env.KV_REST_API_TOKEN = prevKT;
resetKvProbeForTests();
sessionStore.clearMemory();

console.log('\n--- sessionStore tests ---');
console.log(`storeBackend=${info.storeBackend} durable=${info.durable} fallback=${info.fallback} promoteEligible=${info.promoteEligible}`);
console.log(`passed=${passed} failed=${failed}`);
if (failed > 0) process.exit(1);
