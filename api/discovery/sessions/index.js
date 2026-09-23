/**
 * POST /api/discovery/sessions
 * body: { seed: string, hints?: object, locale?: string }
 * Also accepts `q` as alias for seed (Phase A schema).
 * → { sessionId, status, pollAfterMs, store, snapshot }
 *
 * Additive Discovery Layer — does not touch Core /api/lookup.
 */
import { createDiscoverySession, getStoreInfo, publicStoreInfo } from '../../lib/discovery/orchestrator.js';
import {
  validateDiscoveryCreateBody,
  checkDiscoveryRateLimit,
  clientKeyFromReq,
} from '../../lib/discovery/requestGuards.js';
import { discoveryApiError } from '../../lib/discovery/apiErrors.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Correlation-Id');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    const err = discoveryApiError({ status: 405, error: 'method not allowed', failureClass: 'method_not_allowed' });
    return res.status(err.status).json(err.body);
  }

  try {
    const rl = checkDiscoveryRateLimit(clientKeyFromReq(req));
    if (!rl.ok) {
      res.setHeader('Retry-After', String(rl.retryAfterSec || 60));
      const err = discoveryApiError({
        status: 429,
        error: rl.error,
        failureClass: 'rate_limited',
        retryAfterSec: rl.retryAfterSec,
        extras: {
          rateLimit: {
            backend: rl.backend || 'memory',
            distributed: false,
            upstashWiredForRateLimit: false,
          },
        },
      });
      return res.status(err.status).json(err.body);
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body && typeof body === 'object' ? body : {};

    const validated = validateDiscoveryCreateBody(body);
    if (!validated.ok) {
      const err = discoveryApiError({
        status: validated.status,
        error: validated.error,
        failureClass: validated.status === 413 ? 'payload_too_large' : 'validation_error',
      });
      return res.status(err.status).json(err.body);
    }
    // Prefer validated seed/hints/locale (size-capped); keep other fields for fault flags
    body = { ...body, seed: validated.seed, hints: validated.hints, locale: validated.locale };

    const correlationId =
      (typeof req.headers['x-correlation-id'] === 'string' && req.headers['x-correlation-id'].slice(0, 64)) ||
      body.correlationId ||
      undefined;
    const result = await createDiscoverySession(body, {
      fault: body.fault || body.injectFault || req.query?.fault,
      query: req.query || {},
      correlationId,
    });
    const store = result.store || getStoreInfo();
    return res.status(201).json({
      ok: true,
      sessionId: result.sessionId,
      status: result.status,
      pollAfterMs: result.pollAfterMs,
      store: publicStoreInfo(store),
      correlationId: result.correlationId || correlationId || undefined,
      ...(result.fault ? { fault: result.fault } : {}),
      snapshot: result.snapshot || null,
    });
  } catch (e) {
    const status = e?.status || 500;
    const err = discoveryApiError({
      status,
      error: e?.message || e,
      failureClass: status >= 500 ? 'internal_error' : 'failed_soft',
      extras: { store: publicStoreInfo(getStoreInfo()) },
    });
    return res.status(err.status).json(err.body);
  }
}
