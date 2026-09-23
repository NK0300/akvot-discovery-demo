/**
 * Acc P0 forbidden identities denylist (Domain sanitize).
 *
 * SoT: this module — static FORBIDDEN_IDENTITY_QIDS.
 * Acc NEVER-QID-in-payload: strip (drop) from candidates + identity sources + top qid.
 * NOT score downgrade. NOT ranking/mayCommit/H1/cache.
 *
 * RCA: F-L2-ACC-001 · Acc lock 2026-09 · Arch DESIGN BOUND 2026-09-19
 * Spec: test-results/wp3/F-L2-ACC-001-DENYLIST-SPEC-שרת-2026-09-19.md
 */

/** @type {string} */
export const FORBIDDEN_IDENTITIES_VERSION = '2026-09-19.1';

/**
 * Acc-banned Wikidata QIDs (canonical Q####).
 * Q1701775 — historic NY politician (Smith Acc pretty-wrong / NEVER rule).
 * Update: PR + Acc Gate only · bump FORBIDDEN_IDENTITIES_VERSION · units list each QID.
 * @type {readonly string[]}
 */
export const FORBIDDEN_IDENTITY_QIDS = Object.freeze(['Q1701775']);

const FORBIDDEN_SET = new Set(FORBIDDEN_IDENTITY_QIDS);

/**
 * Normalize to canonical Q####, or null.
 * @param {unknown} q
 * @returns {string|null}
 */
export function normalizeQid(q) {
  if (q == null) return null;
  const m = String(q).trim().match(/Q(\d+)/i);
  return m ? `Q${m[1]}` : null;
}

/**
 * Extract a Wikidata QID from id, wd-Q…, or URL (/wiki/Q…|/entity/Q…).
 * @param {unknown} idOrUrl
 * @returns {string|null}
 */
export function extractQid(idOrUrl) {
  if (idOrUrl == null) return null;
  const s = String(idOrUrl).trim();
  if (!s) return null;
  const m =
    s.match(/wikidata\.org\/(?:wiki|entity)\/(Q\d+)/i) ||
    s.match(/(?:^|[^A-Za-z0-9])wd[_-]?(Q\d+)\b/i) ||
    s.match(/^(?:wd[_-]?)?(Q\d+)$/i) ||
    s.match(/\b(Q\d+)\b/i);
  return m ? normalizeQid(m[1]) : null;
}

/** @param {unknown} q */
export function isForbiddenQid(q) {
  const n = normalizeQid(q) || extractQid(q);
  return !!(n && FORBIDDEN_SET.has(n));
}

/** @param {unknown} val */
function valueHasForbidden(val) {
  if (val == null) return false;
  const matches = String(val).match(/\bQ\d+\b/gi);
  if (!matches) return false;
  return matches.some((tok) => FORBIDDEN_SET.has(normalizeQid(tok)));
}

/**
 * Collect all QIDs visible to Acc from a payload (top qid, candidates id/qid, WD URLs in sources).
 * @param {object} payload
 * @returns {string[]}
 */
export function extractPayloadQids(payload) {
  const out = [];
  const add = (v) => {
    const q = extractQid(v) || normalizeQid(v);
    if (q && !out.includes(q)) out.push(q);
  };
  if (!payload || typeof payload !== 'object') return out;
  if (payload.qid) add(payload.qid);
  for (const c of payload.candidates || []) {
    if (!c) continue;
    add(c.id);
    add(c.qid);
    for (const s of c.sourcesPreview || []) {
      add(s?.url);
      add(s?.title);
      add(s?.id);
      add(s?.qid);
    }
  }
  for (const s of payload.sources || []) {
    add(s?.url);
    add(s?.title);
    add(s?.id);
    add(s?.qid);
  }
  return out;
}

/**
 * Acc invariant probe: forbidden ∩ extractQids(payload) ≠ ∅
 * @param {object} payload
 * @returns {boolean}
 */
export function payloadContainsForbidden(payload) {
  const qids = extractPayloadQids(payload);
  return qids.some((q) => FORBIDDEN_SET.has(q));
}

/**
 * @param {object} s
 * @param {string[]} strippedIds
 * @returns {object|null}
 */
function scrubSourceEntry(s, strippedIds) {
  if (!s || typeof s !== 'object') return null;
  if (
    valueHasForbidden(s.url) ||
    valueHasForbidden(s.title) ||
    valueHasForbidden(s.id) ||
    (s.qid && isForbiddenQid(s.qid))
  ) {
    const q = extractQid(s.url) || extractQid(s.title) || extractQid(s.id) || normalizeQid(s.qid);
    if (q && FORBIDDEN_SET.has(q) && !strippedIds.includes(q)) strippedIds.push(q);
    return null;
  }
  return s;
}

/**
 * Drop candidate if id/qid/sourcesPreview references a forbidden QID.
 * @param {object} c
 * @param {string[]} strippedIds
 * @returns {object|null}
 */
function scrubCandidate(c, strippedIds) {
  if (!c || typeof c !== 'object') return null;
  const idQ = extractQid(c.id) || normalizeQid(c.qid);
  if (idQ && FORBIDDEN_SET.has(idQ)) {
    if (!strippedIds.includes(idQ)) strippedIds.push(idQ);
    return null;
  }
  if (valueHasForbidden(c.id) || (c.qid && isForbiddenQid(c.qid))) {
    const q = extractQid(c.id) || normalizeQid(c.qid);
    if (q && !strippedIds.includes(q)) strippedIds.push(q);
    return null;
  }
  for (const s of c.sourcesPreview || []) {
    if (
      valueHasForbidden(s?.url) ||
      valueHasForbidden(s?.title) ||
      valueHasForbidden(s?.id) ||
      (s?.qid && isForbiddenQid(s.qid))
    ) {
      const q = extractQid(s?.url) || extractQid(s?.title) || extractQid(s?.id) || normalizeQid(s?.qid);
      if (q && !strippedIds.includes(q)) strippedIds.push(q);
      return null; // drop whole candidate — Acc treats any Q in blob
    }
  }
  return {
    ...c,
    sourcesPreview: (c.sourcesPreview || [])
      .map((s) => scrubSourceEntry(s, strippedIds))
      .filter(Boolean),
  };
}

/**
 * Strip (drop) forbidden QIDs from candidates[], identity sources[], top qid.
 * @param {object} payload
 * @returns {{ payload: object, strippedCount: number, strippedIds: string[] }}
 */
export function stripForbiddenFromPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { payload, strippedCount: 0, strippedIds: [] };
  }

  // Fail-closed in test spirit: empty denylist is a unit bug; prod still no-ops inventing QIDs
  if (!FORBIDDEN_IDENTITY_QIDS.length) {
    return { payload, strippedCount: 0, strippedIds: [] };
  }

  const strippedIds = [];
  const next = { ...payload };

  if (Array.isArray(payload.candidates)) {
    const out = [];
    for (const c of payload.candidates) {
      const scrubbed = scrubCandidate(c, strippedIds);
      if (scrubbed) out.push(scrubbed);
    }
    next.candidates = out;
  }

  if (Array.isArray(payload.sources)) {
    next.sources = payload.sources
      .map((s) => scrubSourceEntry(s, strippedIds))
      .filter(Boolean);
  }

  if (payload.qid && isForbiddenQid(payload.qid)) {
    const q = normalizeQid(payload.qid);
    if (q && !strippedIds.includes(q)) strippedIds.push(q);
    next.qid = null;
  }

  return {
    payload: next,
    strippedCount: strippedIds.length,
    strippedIds,
  };
}

/**
 * Domain emit sanitize — single scrub entry for Application call sites.
 * Fail-safe: if scrub throws → candidates=[] (never emit raw forbidden).
 *
 * @param {object} payload
 * @param {{ q?: string, ctx?: object }} [_opts] reserved for future class context
 * @returns {object}
 */
export function sanitizeCandidatesPayload(payload, _opts = {}) {
  if (!payload || typeof payload !== 'object') return payload;
  try {
    const { payload: scrubbed, strippedCount, strippedIds } = stripForbiddenFromPayload(payload);
    if (strippedCount > 0) {
      scrubbed.forbiddenStripped = strippedCount;
      scrubbed.forbiddenIdentitiesVersion = FORBIDDEN_IDENTITIES_VERSION;
      // Keep uiState unchanged; additive obs only
      if (Array.isArray(scrubbed.timings) === false && scrubbed.timings && typeof scrubbed.timings === 'object') {
        scrubbed.timings = { ...scrubbed.timings, forbiddenStripped: strippedCount };
      }
      void strippedIds;
    } else {
      scrubbed.forbiddenIdentitiesVersion = FORBIDDEN_IDENTITIES_VERSION;
    }
    return scrubbed;
  } catch {
    // Fail-safe: drop candidates rather than emit raw (Arch DESIGN BOUND)
    return {
      ...payload,
      candidates: [],
      qid: payload.qid && isForbiddenQid(payload.qid) ? null : payload.qid,
      forbiddenStripped: -1,
      forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
    };
  }
}

export default {
  FORBIDDEN_IDENTITIES_VERSION,
  FORBIDDEN_IDENTITY_QIDS,
  normalizeQid,
  extractQid,
  isForbiddenQid,
  extractPayloadQids,
  payloadContainsForbidden,
  stripForbiddenFromPayload,
  sanitizeCandidatesPayload,
};
