/**
 * Failure-injection hooks for Discovery tests (timeout / 429 / 5xx / cancel /
 * budget_exhausted / redis-unavailable / SSE disconnect).
 * Activated only when opts.injectFailure or env DISCOVERY_INJECT_FAILURE is set.
 * Never enabled implicitly in production routes.
 *
 * Soft-fail consistency: injected errors map onto ADAPTER_SOFT_FAIL_CODE_FAMILIES
 * (cancel ≠ timeout ≠ http_N ≠ budget_exhausted ≠ error).
 */
import { adapterSoftFailCode, ADAPTER_SOFT_FAIL_CODE_FAMILIES } from './adapterContract.js';

export const FAILURE_KINDS = Object.freeze([
  'provider_timeout',
  'provider_429',
  'provider_5xx',
  'provider_cancelled',
  'provider_budget_exhausted',
  'redis_unavailable',
  'sse_disconnect',
  'malformed_state',
]);

export function softFailCodeForFailureKind(kind) {
  switch (String(kind || '')) {
    case 'provider_timeout':
      return 'timeout';
    case 'provider_cancelled':
      return 'cancelled';
    case 'provider_budget_exhausted':
      return 'budget_exhausted';
    case 'provider_429':
      return 'http_429';
    case 'provider_5xx':
      return 'http_503';
    default:
      return null;
  }
}

export function injectErrorForKind(kind) {
  const k = String(kind || '');
  if (k === 'provider_timeout') {
    const err = new Error('Injected AbortError');
    err.name = 'AbortError';
    err.reason = 'timeout';
    err.code = 'timeout';
    return err;
  }
  if (k === 'provider_cancelled') {
    const err = new Error('Injected cancelled');
    err.name = 'AbortError';
    err.reason = 'cancelled';
    err.code = 'cancelled';
    return err;
  }
  if (k === 'provider_budget_exhausted') {
    const err = new Error('Injected budget_exhausted');
    err.code = 'budget_exhausted';
    return err;
  }
  if (k === 'provider_429') {
    const err = new Error('HTTP 429');
    err.status = 429;
    err.code = 'http_429';
    return err;
  }
  if (k === 'provider_5xx') {
    const err = new Error('HTTP 503');
    err.status = 503;
    err.code = 'http_503';
    return err;
  }
  const err = new Error(`Injected ${k || 'error'}`);
  err.code = 'error';
  return err;
}

export function failureKindsCoverSoftFailFamilies() {
  const mapped = FAILURE_KINDS.map(softFailCodeForFailureKind).filter(Boolean);
  const need = ['cancelled', 'timeout', 'budget_exhausted'];
  for (const n of need) {
    if (!mapped.includes(n)) return false;
  }
  if (!mapped.some((c) => /^http_\d{3}$/.test(c))) return false;
  return true;
}

export function shouldInject(kind, opts = {}) {
  const flag = opts.injectFailure || process.env.DISCOVERY_INJECT_FAILURE || '';
  if (!flag) return false;
  if (opts.enabled === false) return false;
  return String(flag) === kind || String(flag) === 'all';
}

export function wrapProviderWithInjection(provider, kind) {
  return {
    ...provider,
    async search(req, ctx) {
      if (shouldInject(kind, { injectFailure: kind }) || shouldInject(kind, req || {})) {
        throw injectErrorForKind(kind);
      }
      return provider.search(req, ctx);
    },
  };
}

export function assertInjectedSoftFailCode(kind, parentSignal) {
  const expected = softFailCodeForFailureKind(kind);
  if (!expected) return { ok: false, reason: 'non_provider_kind' };
  const err = injectErrorForKind(kind);
  const signal = kind === 'provider_cancelled' ? parentSignal || { aborted: true } : parentSignal;
  const got = adapterSoftFailCode(err, signal);
  return {
    ok: got === expected,
    expected,
    got,
    families: ADAPTER_SOFT_FAIL_CODE_FAMILIES,
  };
}

export function simulateRedisUnavailable() {
  return {
    ok: false,
    storeBackend: 'upstash',
    durable: false,
    fallback: true,
    promoteEligible: false,
    mode: 'injected-redis-unavailable',
    steps: [{ step: 'WRITE', ok: false, error: 'injected redis unavailable' }],
    error: 'injected redis unavailable',
  };
}

export default {
  FAILURE_KINDS,
  softFailCodeForFailureKind,
  injectErrorForKind,
  failureKindsCoverSoftFailFamilies,
  shouldInject,
  wrapProviderWithInjection,
  assertInjectedSoftFailCode,
  simulateRedisUnavailable,
};
