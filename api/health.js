/**
 * Minimal health — no secrets / no PII.
 * P2 observability: GET /api/health → 200 + ok + phase/build id.
 * Additive: discovery storeBackend telemetry (fs-regen = fallback-only).
 * B18: when KV creds present, runs lightweight PING so durable flags are truthful.
 */
import { getStoreInfo, pingKvReachability, detectStoreBackend } from './lib/discovery/sessionStore.js';

const PHASE = 'orchestrator-v0-b';
const BUILD = process.env.VERCEL_GIT_COMMIT_SHA
  || process.env.VERCEL_DEPLOYMENT_ID
  || 'local';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }
  let discoveryStore = null;
  let kvPing = undefined;
  try {
    const backend = detectStoreBackend();
    if (backend === 'vercel-kv' || backend === 'upstash') {
      kvPing = await pingKvReachability();
    }
    const info = getStoreInfo();
    discoveryStore = {
      storeBackend: info.storeBackend || info.backend,
      durable: info.durable === true,
      fallback: info.fallback === true,
      explicitFallback: info.explicitFallback === true,
      fsRegenFallback: info.fsRegenFallback === true,
      promoteEligible: info.promoteEligible === true,
      kvCredsPresent: info.kvCredsPresent === true,
      crossInstance: info.crossInstance,
      durabilityState: info.durabilityState,
      kvReachable: info.kvReachable,
    };
  } catch {
    discoveryStore = { storeBackend: 'unknown', durable: false, fallback: true, explicitFallback: true, fsRegenFallback: true, promoteEligible: false };
  }
  return res.status(200).json({
    ok: true,
    phase: PHASE,
    build: String(BUILD).slice(0, 40),
    baselineHint: 'dpl_DNfPZ9',
    discoveryStore,
    ...(kvPing ? { kvPing: { ok: kvPing.ok === true, latencyMs: kvPing.latencyMs, ...(kvPing.failureClass ? { failureClass: kvPing.failureClass } : {}) } } : {}),
  });
}
