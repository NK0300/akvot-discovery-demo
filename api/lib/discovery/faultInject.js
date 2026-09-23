/**
 * Discovery failure-injection hooks — Preview/dev ONLY.
 * Gated by env DISCOVERY_FAULT_INJECT=1 OR query/body fault flag when env is set.
 * Never active in production promote path (env must be absent).
 * No secrets logged.
 */

const FAULTS = new Set([
  'store_miss',
  'provider_timeout',
  'scrub_path',
  'store_latency',
]);

/**
 * @returns {boolean}
 */
export function faultInjectEnabled() {
  return process.env.DISCOVERY_FAULT_INJECT === '1';
}

/**
 * Resolve fault name from opts/query/body. Only honored when env gate is on.
 * @param {{ fault?: string, query?: object, body?: object }} [opts]
 * @returns {string|null}
 */
export function resolveFault(opts = {}) {
  if (!faultInjectEnabled()) return null;
  const raw =
    opts.fault ||
    opts.query?.fault ||
    opts.query?.injectFault ||
    opts.body?.fault ||
    opts.body?.injectFault ||
    process.env.DISCOVERY_FAULT_NAME ||
    null;
  if (!raw) return null;
  const name = String(raw).trim().toLowerCase();
  return FAULTS.has(name) ? name : null;
}

/**
 * Apply store-miss: force get to behave as miss (caller clears / skips).
 * @param {string|null} fault
 */
export function shouldForceStoreMiss(fault) {
  return fault === 'store_miss';
}

/**
 * Provider timeout: throw / soft-fail after delay.
 * @param {string|null} fault
 * @param {number} [ms]
 */
export async function maybeProviderTimeout(fault, ms = 50) {
  if (fault !== 'provider_timeout') return;
  await new Promise((r) => setTimeout(r, Math.min(ms, 200)));
  const err = new Error('DISCOVERY_FAULT: provider_timeout');
  err.code = 'provider_timeout';
  err.faultInjected = true;
  throw err;
}

/**
 * Scrub-path probe: inject a forbidden QID finding so Acc scrub must strip it.
 * Caller merges into injectFindings; response must not leak the QID.
 * @param {string|null} fault
 * @returns {object[]|null}
 */
export function scrubPathInjectFindings(fault) {
  if (fault !== 'scrub_path') return null;
  return [
    {
      id: 'Q1701775',
      title: 'FORBIDDEN_INJECT',
      summary: 'fault inject scrub path',
      providers: ['inject'],
      kind: 'registry',
      entityRefs: ['Q1701775'],
      evidenceIds: ['ev-fault-scrub'],
      provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775',
      quote: 'scrub-path-fault',
    },
  ];
}

/**
 * Artificial store latency (bounded).
 * @param {string|null} fault
 * @param {number} [ms]
 */
export async function maybeStoreLatency(fault, ms = 30) {
  if (fault !== 'store_latency') return;
  await new Promise((r) => setTimeout(r, Math.min(ms, 100)));
}

/**
 * Public telemetry describing active fault (no secrets).
 * @param {string|null} fault
 */
export function faultTelemetry(fault) {
  if (!fault) return undefined;
  return {
    faultInject: true,
    fault,
    gatedBy: 'DISCOVERY_FAULT_INJECT=1',
  };
}

export default {
  faultInjectEnabled,
  resolveFault,
  shouldForceStoreMiss,
  maybeProviderTimeout,
  scrubPathInjectFindings,
  maybeStoreLatency,
  faultTelemetry,
  FAULTS: [...FAULTS],
};
