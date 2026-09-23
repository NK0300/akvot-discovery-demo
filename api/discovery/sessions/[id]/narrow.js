/**
 * POST /api/discovery/sessions/:id/narrow
 * body: { facets?: { provider?: string[], kind?: string[], hint?: string[] }, selected?: [...] }
 * → Acc-scrubbed filtered findings + recomputed facets. No identity chrome.
 */
import { narrowDiscoverySession, getStoreInfo, publicStoreInfo } from '../../../lib/discovery/orchestrator.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }

  const id = req.query?.id;
  const sessionId = Array.isArray(id) ? id[0] : id;
  if (!sessionId) {
    return res.status(400).json({ ok: false, error: 'session id required' });
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

  try {
    const result = await narrowDiscoverySession(String(sessionId), body);
    return res.status(200).json(result);
  } catch (e) {
    const status = e?.status || 500;
    return res.status(status).json({
      ok: false,
      error: String(e?.message || e),
      store: publicStoreInfo(getStoreInfo()),
    });
  }
}
