/**
 * Failure-injection hooks for Discovery tests (timeout / 429 / 5xx / redis-unavailable / SSE disconnect).
 * Activated only when opts.injectFailure or env DISCOVERY_INJECT_FAILURE is set.
 * Never enabled implicitly in production routes.
 */
export const FAILURE_KINDS = Object.freeze([
  'provider_timeout',
  'provider_429',
  'provider_5xx',
  'redis_unavailable',
  'sse_disconnect',
  'malformed_state',
]);

/**
 * @param {string} kind
 * @param {{ enabled?: boolean, injectFailure?: string }} [opts]
 */
export function shouldInject(kind, opts = {}) {
  const flag = opts.injectFailure || process.env.DISCOVERY_INJECT_FAILURE || '';
  if (!flag) return false;
  if (opts.enabled === false) return false;
  return String(flag) === kind || String(flag) === 'all';
}

/**
 * Wrap a provider to optionally fail soft with injected error.
 * @param {object} provider
 * @param {string} kind
 */
export function wrapProviderWithInjection(provider, kind) {
  return {
    ...provider,
    async search(req, ctx) {
      if (shouldInject(kind, { injectFailure: kind }) || shouldInject(kind, req || {})) {
        if (kind === 'provider_timeout') {
          const err = new Error('Injected AbortError');
          err.name = 'AbortError';
          throw err;
        }
        if (kind === 'provider_429') {
          const err = new Error('HTTP 429');
          err.status = 429;
          throw err;
        }
        if (kind === 'provider_5xx') {
          const err = new Error('HTTP 503');
          err.status = 503;
          throw err;
        }
      }
      return provider.search(req, ctx);
    },
  };
}

/**
 * Simulate redis unavailable for health/store tests.
 * @returns {{ ok: false, storeBackend: string, error: string }}
 */
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
  shouldInject,
  wrapProviderWithInjection,
  simulateRedisUnavailable,
};
