/**
 * Observability trust helpers — cache HIT timing reset + per-request wiki upstream counters.
 * Pure helpers used by lookup.js. No network.
 */

/** Build timings object for a cache HIT — never echo stale COLD stage totals. */
export function buildCacheHitTimings(wallMs = 0) {
  const total = Math.max(0, Number(wallMs) || 0);
  return {
    wiki: 0,
    gemini: 0,
    enrich: 0,
    stageB: 0,
    total,
    cacheHit: true,
  };
}

/** Fresh per-request wiki upstream counters. */
export function createWikiReqCounters() {
  return { wiki429: 0, wikiTimeout: 0, wikiRetries: 0 };
}

/**
 * Compact bump used from wikiBump / jfetch / pageSummary.
 * - status 429|503 → wiki429++ and wikiRetries++
 * - timeout-ish err → wikiTimeout++ and wikiRetries++
 * - other with attempt>=0 on retry path → wikiRetries++ only when `retry: true`
 */
export function wikiCounterBump(counters, { status = 0, err = null, retry = false } = {}) {
  if (!counters) return counters;
  const st = Number(status) || 0;
  const msg = String(err?.message || err?.name || err || '');
  if (st === 429 || st === 503) {
    counters.wiki429 += 1;
    counters.wikiRetries += 1;
    return counters;
  }
  if (/TimeoutError|timeout|aborted|AbortError|wiki_budget/i.test(msg)) {
    counters.wikiTimeout += 1;
    counters.wikiRetries += 1;
    return counters;
  }
  if (retry) counters.wikiRetries += 1;
  return counters;
}

/** Snapshot for JSON response. */
export function snapshotWikiMeta(counters) {
  const c = counters || createWikiReqCounters();
  return {
    wiki429: c.wiki429 | 0,
    wikiTimeout: c.wikiTimeout | 0,
    wikiRetries: c.wikiRetries | 0,
  };
}

/** Attach wikiMeta onto body + timings.wikiMeta; optionally set requestId. */
export function attachWikiMeta(body, counters, { requestId } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return body;
  const wikiMeta = snapshotWikiMeta(counters);
  const out = { ...body, wikiMeta };
  if (requestId) out.requestId = requestId;
  if (out.timings && typeof out.timings === 'object') {
    out.timings = { ...out.timings, wikiMeta };
  }
  return out;
}

/** Apply HIT timing reset onto a cached payload. */
export function applyCacheHitObs(payload, wallMs, counters, { requestId } = {}) {
  const timings = buildCacheHitTimings(wallMs);
  const wikiMeta = snapshotWikiMeta(counters);
  timings.wikiMeta = wikiMeta;
  const out = {
    ...payload,
    cached: true,
    timings,
    wikiMeta,
  };
  if (requestId) out.requestId = requestId;
  return out;
}
