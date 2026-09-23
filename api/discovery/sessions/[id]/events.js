/**
 * GET /api/discovery/sessions/:id/events
 * SSE progressive discovery chunks — Acc scrub on every event (BOUNDARIES §2.1/§2.6).
 */
import { loadSessionRaw, getStoreInfo, publicStoreInfo } from '../../../lib/discovery/orchestrator.js';
import { writeProgressiveSse, formatSseEvent, SSE_RECONNECT_DOCS } from '../../../lib/discovery/sse.js';
import { resolveFault, shouldForceStoreMiss, faultTelemetry } from '../../../lib/discovery/faultInject.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Last-Event-ID');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }

  const id = req.query?.id;
  const sessionId = Array.isArray(id) ? id[0] : id;
  if (!sessionId) {
    return res.status(400).json({ ok: false, error: 'session id required' });
  }

  const fault = resolveFault({ query: req.query || {} });
  if (shouldForceStoreMiss(fault)) {
    return res.status(404).json({
      ok: false,
      error: 'session not found',
      store: publicStoreInfo(getStoreInfo()),
      fault: faultTelemetry(fault),
    });
  }

  const session = await loadSessionRaw(String(sessionId));
  if (!session) {
    return res.status(404).json({
      ok: false,
      error: 'session not found',
      store: publicStoreInfo(getStoreInfo()),
    });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('X-SSE-Reconnect', 'Last-Event-ID');
  res.setHeader('X-SSE-Terminal', SSE_RECONNECT_DOCS.terminalEvents.join(','));
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const lastEventId =
    req.headers['last-event-id'] ||
    req.query?.lastEventId ||
    req.query?.cursor ||
    0;

  try {
    session._storeInfo = session._storeInfo || getStoreInfo();
    // Ensure store flags explicit on meta
    session._storeInfo = publicStoreInfo(session._storeInfo || getStoreInfo());
    await writeProgressiveSse(res, session, {
      delayMs: 15,
      lastEventId: Number(lastEventId) || 0,
    });
  } catch (e) {
    res.write(
      formatSseEvent('error', {
        message: String(e?.message || e),
        status: 'failed_soft',
        forbiddenIdentitiesVersion: session.forbiddenIdentitiesVersion,
      }),
    );
    res.write(
      formatSseEvent('done', {
        status: 'failed_soft',
        sessionId: session.sessionId,
        afterError: true,
      }),
    );
  }
  res.end();
}
