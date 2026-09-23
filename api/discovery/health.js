/**
 * GET /api/discovery/health
 * Storage health probe: WRITE → READ → UPDATE → DELETE against active backend.
 * Returns { backend, ok, latencyMs, correlationId, fsRegenFallback, … }.
 * No secrets. KV absent → fs-regen probe still runs locally (ok=true, promoteEligible=false).
 */
import { healthCheck, getStoreInfo } from '../lib/discovery/sessionStore.js';
import { faultInjectEnabled, resolveFault, faultTelemetry } from '../lib/discovery/faultInject.js';
import { randomBytes } from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Correlation-Id');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }

  const correlationId =
    (typeof req.headers['x-correlation-id'] === 'string' && req.headers['x-correlation-id'].slice(0, 64)) ||
    (typeof req.query?.correlationId === 'string' && req.query.correlationId.slice(0, 64)) ||
    `hc-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;

  const info = getStoreInfo();
  const fault = resolveFault({ query: req.query || {} });

  // Fault: store_miss → report synthetic miss without corrupting real store
  if (fault === 'store_miss') {
    const body = {
      ok: false,
      backend: info.storeBackend || info.backend,
      storeBackend: info.storeBackend || info.backend,
      latencyMs: 0,
      correlationId,
      fsRegenFallback: info.fsRegenFallback === true,
      explicitFallback: info.explicitFallback === true,
      promoteEligible: false,
      durable: info.durable === true,
      fallback: info.fallback === true,
      kvCredsPresent: info.kvCredsPresent === true,
      mode: info.fallback ? 'fs-regen-local' : 'kv-shared',
      error: 'DISCOVERY_FAULT: store_miss',
      fault: faultTelemetry(fault),
      steps: [{ step: 'WRITE', ok: false, ms: 0, error: 'fault store_miss' }],
    };
    if (req.method === 'HEAD') return res.status(503).end();
    return res.status(503).json(body);
  }

  try {
    const result = await healthCheck({ correlationId });
    const body = {
      ok: result.ok === true,
      backend: result.storeBackend || info.storeBackend || info.backend,
      storeBackend: result.storeBackend || info.storeBackend || info.backend,
      latencyMs: typeof result.elapsedMs === 'number' ? result.elapsedMs : result.latencyMs || 0,
      correlationId: result.correlationId || correlationId,
      fsRegenFallback: result.fsRegenFallback === true || (result.storeBackend || info.backend) === 'fs-regen',
      explicitFallback: result.explicitFallback === true || (result.storeBackend || info.backend) === 'fs-regen',
      promoteEligible: result.promoteEligible === true,
      durable: result.durable === true,
      fallback: result.fallback === true,
      kvCredsPresent: result.kvCredsPresent === true,
      durabilityState: result.durabilityState,
      kvReachable: result.kvReachable,
      mode: result.mode,
      steps: result.steps,
      ttlMs: result.ttlMs,
      ...(result.failureClass ? { failureClass: result.failureClass } : {}),
      ...(result.error ? { error: result.error } : {}),
      ...(fault ? { fault: faultTelemetry(fault) } : {}),
      faultInjectAvailable: faultInjectEnabled(),
    };
    if (req.method === 'HEAD') return res.status(result.ok ? 200 : 503).end();
    return res.status(result.ok ? 200 : 503).json(body);
  } catch (e) {
    return res.status(500).json({
      ok: false,
      backend: info.storeBackend || info.backend,
      storeBackend: info.storeBackend || info.backend,
      latencyMs: 0,
      correlationId,
      fsRegenFallback: info.fsRegenFallback === true,
      explicitFallback: info.explicitFallback === true,
      promoteEligible: false,
      error: String(e?.message || e).slice(0, 200),
    });
  }
}
