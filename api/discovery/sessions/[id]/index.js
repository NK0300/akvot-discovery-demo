/**
 * GET /api/discovery/sessions/:id
 * → Acc-scrubbed snapshot. Durable store (KV or /tmp+regen-from-seed).
 */
import { getDiscoverySession, getStoreInfo, publicStoreInfo } from '../../../lib/discovery/orchestrator.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }

  const id =
    req.query?.id ||
    (typeof req.query === 'object' && Object.values(req.query || {})[0]) ||
    null;

  const sessionId = Array.isArray(id) ? id[0] : id;
  if (!sessionId) {
    return res.status(400).json({ ok: false, error: 'session id required' });
  }

  try {
    const snap = await getDiscoverySession(String(sessionId), {
      fault: req.query?.fault || req.query?.injectFault,
      query: req.query || {},
    });
    if (!snap) {
      return res.status(404).json({
        ok: false,
        error: 'session not found',
        store: publicStoreInfo(getStoreInfo()),
      });
    }

    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).json({
      ok: true,
      ...snap,
      store: publicStoreInfo(snap.store || getStoreInfo()),
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: String(e?.message || e),
      store: publicStoreInfo(getStoreInfo()),
    });
  }
}
