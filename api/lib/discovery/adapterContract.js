/**
 * Adapter contract harden — public providers only (wikidata/openlibrary/wikipedia/viaf/web_origin).
 * normalize → typed evidence · Acc scrub on emit/journal · timeouts · size limits · AbortSignal · SSRF.
 * LOCKS: F11 (no new HTTP) · URL≠identity · CANDIDATE≠FACT · no Core /api/lookup leakage.
 */
import { assertSafePublicHttpsUrl } from './urlSafety.js';
import { isForbiddenQid, extractQid, FORBIDDEN_IDENTITIES_VERSION } from '../forbiddenIdentities.js';
import { normalizeRawHit } from './store.js';

export const ADAPTER_CONTRACT_VERSION = '2026-09-23.adapter-softfail3';

/** Per-response body cap for JSON adapter fetches (bytes). */
export const MAX_ADAPTER_RESPONSE_BYTES = 512_000;

/** Max findings retained per provider batch after normalize. */
export const MAX_ADAPTER_FINDINGS = 12;

/** Default per-call budget when caller omits budgetMs. */
export const DEFAULT_ADAPTER_BUDGET_MS = 3_000;

/** Absolute floor / ceiling for AbortSignal timeout. */
export const MIN_ADAPTER_BUDGET_MS = 50;
export const MAX_ADAPTER_BUDGET_MS = 8_000;

/**
 * Host allowlists for wired public adapters (SSRF defense-in-depth beyond urlSafety).
 * web_origin uses its own hop-validated fetch — not listed here for open hostnames.
 */
export const ADAPTER_HOST_ALLOWLIST = Object.freeze({
  wikidata: Object.freeze(['www.wikidata.org', 'wikidata.org']),
  openlibrary: Object.freeze(['openlibrary.org', 'www.openlibrary.org']),
  wikipedia: Object.freeze([
    'en.wikipedia.org',
    'he.wikipedia.org',
    'www.wikipedia.org',
  ]),
  viaf: Object.freeze(['viaf.org', 'www.viaf.org']),
});

export const WIRED_PUBLIC_PROVIDER_IDS = Object.freeze([
  'wikidata',
  'openlibrary',
  'wikipedia',
  'viaf',
  'web_origin',
]);

/**
 * @param {string} providerId
 * @param {string} hostname
 */
export function isAdapterHostAllowed(providerId, hostname) {
  const pid = String(providerId || '');
  const host = String(hostname || '')
    .toLowerCase()
    .replace(/\.$/, '');
  if (!host) return false;
  // web_origin: any public https host already gated by urlSafety at fetch time
  if (pid === 'web_origin') return true;
  const list = ADAPTER_HOST_ALLOWLIST[pid];
  if (!list) return false;
  if (list.includes(host)) return true;
  // wikipedia language subdomains (xx.wikipedia.org) — still public MediaWiki
  if (pid === 'wikipedia' && /^[a-z]{2,3}\.wikipedia\.org$/.test(host)) return true;
  return false;
}

/**
 * SSRF + allowlist gate for adapter fetch URLs.
 * @param {string} url
 * @param {string} [providerId]
 * @returns {{ ok: boolean, reason?: string, canonical?: string }}
 */
export function assertAdapterFetchUrl(url, providerId) {
  const safety = assertSafePublicHttpsUrl(url);
  if (!safety.ok) return safety;
  let host = '';
  try {
    host = new URL(safety.canonical).hostname;
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }
  if (providerId && !isAdapterHostAllowed(providerId, host)) {
    return { ok: false, reason: 'host_not_allowlisted' };
  }
  return { ok: true, canonical: safety.canonical };
}

/**
 * Compose AbortSignal from budgetMs + optional parent.
 * Abort reason is 'timeout' (budget) or 'cancelled' (parent) so callers can
 * distinguish EMPTY/soft-fail honesty: cancelled ≠ timeout ≠ error.
 * @param {number} budgetMs
 * @param {AbortSignal} [parent]
 */
export function adapterBudgetSignal(budgetMs, parent) {
  const ms = Math.min(
    MAX_ADAPTER_BUDGET_MS,
    Math.max(MIN_ADAPTER_BUDGET_MS, Number(budgetMs) || DEFAULT_ADAPTER_BUDGET_MS),
  );
  const c = new AbortController();
  /** @type {'timeout'|'cancelled'|null} */
  let abortKind = null;
  const t = setTimeout(() => {
    if (abortKind) return;
    abortKind = 'timeout';
    try {
      c.abort('timeout');
    } catch {
      c.abort();
    }
  }, ms);
  const onParent = () => {
    if (abortKind === 'cancelled') return;
    abortKind = 'cancelled';
    try {
      c.abort('cancelled');
    } catch {
      c.abort();
    }
  };
  if (parent) {
    if (parent.aborted) onParent();
    else parent.addEventListener('abort', onParent, { once: true });
  }
  return {
    signal: c.signal,
    budgetMs: ms,
    get abortKind() {
      if (abortKind) return abortKind;
      if (!c.signal.aborted) return null;
      if (parent?.aborted) return 'cancelled';
      const r = c.signal.reason;
      if (r === 'cancelled' || r === 'timeout') return r;
      return 'timeout';
    },
    dispose() {
      clearTimeout(t);
      if (parent) parent.removeEventListener('abort', onParent);
    },
  };
}

/**
 * Classify adapter abort / thrown error → closed status.
 * Parent abort ⇒ cancelled; budget AbortSignal.reason timeout ⇒ timeout.
 * Never maps empty/cancel/timeout → CONTRADICTORY / FALSE.
 * @param {unknown} err
 * @param {AbortSignal} [parentSignal]
 * @returns {'cancelled'|'timeout'|'error'}
 */
export function classifyAdapterAbort(err, parentSignal) {
  if (parentSignal?.aborted) return 'cancelled';
  const reason =
    err && typeof err === 'object' && 'reason' in /** @type {object} */ (err)
      ? /** @type {{ reason?: unknown }} */ (err).reason
      : undefined;
  const signalReason =
    err && typeof err === 'object' && 'signal' in /** @type {object} */ (err)
      ? /** @type {{ signal?: AbortSignal }} */ (err).signal?.reason
      : undefined;
  const msg = String(
    (err && typeof err === 'object' && 'message' in /** @type {object} */ (err)
      ? /** @type {{ message?: unknown }} */ (err).message
      : err) || '',
  );
  const name =
    err && typeof err === 'object' && 'name' in /** @type {object} */ (err)
      ? String(/** @type {{ name?: unknown }} */ (err).name || '')
      : '';
  const r = reason ?? signalReason;
  if (r === 'cancelled' || /\bcancel(led)?\b/i.test(msg)) return 'cancelled';
  if (r === 'timeout' || name === 'TimeoutError') return 'timeout';
  if (name === 'AbortError' || /abort|timeout/i.test(msg)) {
    // Ambiguous AbortError without parent ⇒ budget timeout (adapters compose budget first)
    return 'timeout';
  }
  return 'error';
}

/**
 * Map classifyAdapterAbort → provider soft-fail error code (never identity).
 * @param {unknown} err
 * @param {AbortSignal} [parentSignal]
 */
/**
 * Closed soft-fail code families — must stay pairwise distinct.
 * cancel ≠ timeout ≠ http_N ≠ budget_exhausted ≠ generic error.
 * http_N is patterned (`http_429`); others are exact tokens.
 */
export const ADAPTER_SOFT_FAIL_CODE_FAMILIES = Object.freeze([
  'cancelled',
  'timeout',
  'http_N',
  'budget_exhausted',
  'error',
]);

/**
 * True when code is an http_N soft-fail (never cancel/timeout/budget).
 * @param {string} code
 */
export function isHttpSoftFailCode(code) {
  return /^http_\d{3}$/.test(String(code || ''));
}

/**
 * Pairwise distinctness probe for soft-fail taxonomy (unit/acc).
 * @param {string[]} codes
 */
export function softFailCodesArePairwiseDistinct(codes) {
  const list = (Array.isArray(codes) ? codes : []).map((c) => String(c || ''));
  if (list.length < 2) return false;
  const set = new Set(list);
  if (set.size !== list.length) return false;
  // Explicit contract: these four must never collide when present together
  const need = ['cancelled', 'timeout', 'budget_exhausted'];
  for (const n of need) {
    if (list.includes(n) && list.filter((c) => c === n).length !== 1) return false;
  }
  const https = list.filter(isHttpSoftFailCode);
  if (https.some((h) => need.includes(h) || h === 'error')) return false;
  return true;
}

export function adapterSoftFailCode(err, parentSignal) {
  // Preserve explicit budget_exhausted before abort classification (ledger path)
  const earlyCode =
    err && typeof err === 'object' && 'code' in /** @type {object} */ (err)
      ? /** @type {{ code?: unknown }} */ (err).code
      : undefined;
  if (earlyCode === 'budget_exhausted' || earlyCode === 'BUDGET_EXHAUSTED') {
    return 'budget_exhausted';
  }
  const kind = classifyAdapterAbort(err, parentSignal);
  if (kind === 'cancelled') return 'cancelled';
  if (kind === 'timeout') return 'timeout';
  const status =
    err && typeof err === 'object' && 'status' in /** @type {object} */ (err)
      ? /** @type {{ status?: number }} */ (err).status
      : undefined;
  if (typeof status === 'number' && status > 0) return `http_${status}`;
  if (earlyCode) {
    const c = String(earlyCode).slice(0, 40);
    if (c === 'budget_exhausted') return 'budget_exhausted';
    return c;
  }
  return 'error';
}

/**
 * Cap-read response body (mirrors webOrigin pattern).
 * @param {Response} res
 * @param {number} maxBytes
 */
async function readBodyCapped(res, maxBytes = MAX_ADAPTER_RESPONSE_BYTES) {
  const cl = res.headers?.get?.('content-length');
  if (cl != null && cl !== '' && Number(cl) > maxBytes) {
    return { ok: false, reason: 'body_too_large', text: null, bytes: Number(cl) };
  }
  // Prefer arrayBuffer (real fetch). Fall back to text()/json() for unit mocks.
  if (typeof res.arrayBuffer === 'function') {
    const buf = await res.arrayBuffer();
    if (buf.byteLength > maxBytes) {
      return { ok: false, reason: 'body_too_large', text: null, bytes: buf.byteLength };
    }
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
    return { ok: true, text, bytes: buf.byteLength };
  }
  if (typeof res.text === 'function') {
    const text = await res.text();
    const bytes = Buffer.byteLength(text, 'utf8');
    if (bytes > maxBytes) {
      return { ok: false, reason: 'body_too_large', text: null, bytes };
    }
    return { ok: true, text, bytes };
  }
  if (typeof res.json === 'function') {
    const obj = await res.json();
    const text = JSON.stringify(obj);
    const bytes = Buffer.byteLength(text, 'utf8');
    if (bytes > maxBytes) {
      return { ok: false, reason: 'body_too_large', text: null, bytes };
    }
    return { ok: true, text, bytes };
  }
  return { ok: false, reason: 'unreadable_body', text: null, bytes: 0 };
}

/**
 * Safe JSON fetch for public adapters — https + SSRF + host allowlist + size + AbortSignal.
 * @param {string} url
 * @param {AbortSignal} signal
 * @param {{ providerId?: string, headers?: object, maxBytes?: number }} [opts]
 * @returns {Promise<object>}
 */
/** Max manual redirect hops for adapter JSON fetch (SSRF re-check each hop). */
export const MAX_ADAPTER_REDIRECTS = 3;

/**
 * Resolve redirect Location against current URL; re-gate every hop (SSRF).
 * @param {string} current
 * @param {string} location
 * @param {string} [providerId]
 */
export function resolveAdapterRedirectUrl(current, location, providerId) {
  const loc = String(location || '').trim();
  if (!loc) return { ok: false, reason: 'redirect_missing_location' };
  let next;
  try {
    next = new URL(loc, current).toString();
  } catch {
    return { ok: false, reason: 'redirect_invalid_location' };
  }
  return assertAdapterFetchUrl(next, providerId || undefined);
}

export async function safeFetchJson(url, signal, opts = {}) {
  const providerId = opts.providerId || '';
  const maxRedirects =
    typeof opts.maxRedirects === 'number' ? opts.maxRedirects : MAX_ADAPTER_REDIRECTS;
  let currentUrl = url;
  let hops = 0;
  while (true) {
    const gate = assertAdapterFetchUrl(currentUrl, providerId || undefined);
    if (!gate.ok) {
      const err = new Error(`unsafe_adapter_url:${gate.reason}`);
      err.code = gate.reason || 'unsafe_url';
      err.status = 0;
      throw err;
    }
    if (signal?.aborted) {
      const err = new Error('aborted');
      err.name = 'AbortError';
      throw err;
    }
    const res = await fetch(gate.canonical, {
      signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'akvot-discovery/0.1 (public research; adapter-contract)',
        ...(opts.headers || {}),
      },
      redirect: 'manual',
    });
    // Manual redirect: re-validate Location host/allowlist before following
    if (res.status >= 300 && res.status < 400) {
      if (hops >= maxRedirects) {
        const err = new Error('too_many_redirects');
        err.code = 'too_many_redirects';
        err.status = res.status;
        throw err;
      }
      const loc = res.headers?.get?.('location') || res.headers?.get?.('Location');
      const next = resolveAdapterRedirectUrl(gate.canonical, loc, providerId);
      if (!next.ok) {
        const err = new Error(`unsafe_adapter_redirect:${next.reason}`);
        err.code = next.reason || 'unsafe_redirect';
        err.status = 0;
        throw err;
      }
      currentUrl = next.canonical;
      hops += 1;
      continue;
    }
    // Defense: if runtime exposed final URL, re-gate (follow mocks may set res.url)
    if (res.url && typeof res.url === 'string' && res.url !== gate.canonical) {
      const finalGate = assertAdapterFetchUrl(res.url, providerId || undefined);
      if (!finalGate.ok) {
        const err = new Error(`unsafe_adapter_final_url:${finalGate.reason}`);
        err.code = finalGate.reason || 'unsafe_final_url';
        err.status = 0;
        throw err;
      }
    }
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const body = await readBodyCapped(res, opts.maxBytes ?? MAX_ADAPTER_RESPONSE_BYTES);
    if (!body.ok) {
      const err = new Error(`body_too_large:${body.bytes || '?'}`);
      err.code = 'body_too_large';
      err.status = 413;
      throw err;
    }
    try {
      return JSON.parse(body.text);
    } catch (e) {
      const err = new Error(`json_parse:${String(e?.message || e)}`);
      err.code = 'json_parse';
      throw err;
    }
  }
}

function valueHasForbidden(val) {
  if (val == null) return false;
  const matches = String(val).match(/\bQ\d+\b/gi);
  if (!matches) return false;
  return matches.some((tok) => isForbiddenQid(tok));
}

/**
 * Acc scrub a single raw finding before it leaves an adapter / enters journal.
 * Returns null if the finding must be dropped (forbidden identity bait).
 * @param {object} raw
 * @param {string} [providerId]
 * @param {string[]} [strippedIds]
 * @returns {object|null}
 */
export function scrubAdapterRawFinding(raw, providerId = '', strippedIds = []) {
  if (!raw || typeof raw !== 'object') return null;
  const note = (v) => {
    const q = extractQid(v);
    if (q && isForbiddenQid(q) && !strippedIds.includes(q)) strippedIds.push(q);
  };
  const bad = (v) => {
    if (valueHasForbidden(v) || isForbiddenQid(v)) {
      note(v);
      return true;
    }
    return false;
  };
  if (bad(raw.id) || bad(raw.title) || bad(raw.summary) || bad(raw.quote)) return null;
  if (bad(raw.provenanceUrl) || bad(raw.url)) return null;
  for (const ref of raw.entityRefs || []) {
    if (bad(ref)) return null;
  }
  // Drop SAME-* relationship claims at adapter boundary (URL≠identity)
  let relationship = raw.relationship || raw.relationshipState;
  if (relationship) {
    const up = String(relationship).toUpperCase().replace(/_/g, '-');
    if (up === 'SAME-ENTITY' || up === 'SAME-REFERENCE' || up === 'SAME-SOURCE') {
      relationship = 'UNKNOWN';
    }
  }
  const entityRefs = (raw.entityRefs || [])
    .map(String)
    .filter((r) => !valueHasForbidden(r) && !isForbiddenQid(r))
    .slice(0, 32);
  const facetHints = (raw.facetHints || [])
    .map(String)
    .filter((h) => {
      if (valueHasForbidden(h) || isForbiddenQid(h)) {
        note(h);
        return false;
      }
      // Clamp relationship:* facet bait
      if (/^relationship:(SAME-ENTITY|SAME-REFERENCE|same-entity|same-reference)$/i.test(h)) {
        return false;
      }
      return true;
    })
    .slice(0, 24);
  if (
    providerId === 'web_origin' ||
    raw.hostFamily === 'web_origin'
  ) {
    // ensure UNKNOWN facet present when relationship was clamped
    if (relationship === 'UNKNOWN' && !facetHints.some((h) => /^relationship:/i.test(h))) {
      facetHints.push('relationship:UNKNOWN');
    }
  }

  const out = {
    ...raw,
    entityRefs,
    facetHints:
      facetHints.length > 0
        ? facetHints
        : providerId
          ? [`provider:${providerId}`]
          : [],
  };
  if (relationship) {
    out.relationship = relationship;
    out.relationshipState = relationship;
  }
  // Explicit epistemic defaults — CANDIDATE≠FACT · never FACT at adapter emit
  out.confirmationState = 'candidate';
  out.epistemicState = 'candidate';
  out.identityClaim = false;
  return out;
}

/**
 * Acc-scrub an entire provider batch (findings + error messages).
 * @param {{ providerId: string, findings?: object[], errors?: object[], partial?: boolean }} batch
 * @returns {{ batch: object, strippedIds: string[], forbiddenStripped: number }}
 */
export function scrubAdapterBatch(batch) {
  const strippedIds = [];
  const providerId = String(batch?.providerId || '');
  const findingsIn = Array.isArray(batch?.findings) ? batch.findings : [];
  const findings = [];
  for (const raw of findingsIn.slice(0, MAX_ADAPTER_FINDINGS * 2)) {
    const scrubbed = scrubAdapterRawFinding(raw, providerId, strippedIds);
    if (scrubbed) findings.push(scrubbed);
    if (findings.length >= MAX_ADAPTER_FINDINGS) break;
  }
  const errors = (batch?.errors || []).map((e) => {
    if (!e || typeof e !== 'object') return e;
    let message = String(e.message || '');
    if (valueHasForbidden(message)) {
      message = message.replace(/\bQ\d+\b/gi, (tok) => {
        if (isForbiddenQid(tok)) {
          const q = extractQid(tok);
          if (q && !strippedIds.includes(q)) strippedIds.push(q);
          return '[REDACTED]';
        }
        return tok;
      });
    }
    return { ...e, message: message.slice(0, 240) };
  });
  const out = {
    ...batch,
    providerId,
    findings,
    partial: batch?.partial === true || findings.length < findingsIn.length,
    errors: errors.length ? errors : undefined,
    forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
  };
  if (strippedIds.length) out.forbiddenStripped = strippedIds.length;
  // Never leak internal telemetry keys that might carry seed bait
  delete out._webOriginTelemetry;
  return { batch: out, strippedIds, forbiddenStripped: strippedIds.length };
}

/**
 * Typed evidence defaults — URL≠identity · CANDIDATE≠FACT · UNKNOWN relationship.
 * Applied when normalizing adapter output into store/graph rows.
 */
export function typedEvidenceDefaults(providerId = '') {
  return {
    confirmationState: 'candidate',
    epistemicState: 'candidate',
    relationshipState: 'UNKNOWN',
    identityClaim: false,
    identityScore: null,
    urlIsNotIdentity: true,
    candidateIsNotFact: true,
    providerId: String(providerId || ''),
  };
}

/**
 * Normalize a scrubbed raw finding → { finding, evidence } with UNKNOWN defaults.
 * Cite-or-drop via normalizeRawHit (https + public host).
 * @param {object} raw
 * @param {string} providerId
 * @returns {{ finding: object, evidence: object } | null}
 */
export function normalizeAdapterToEvidence(raw, providerId) {
  const scrubbed = scrubAdapterRawFinding(raw, providerId);
  if (!scrubbed) return null;
  const pair = normalizeRawHit(scrubbed, providerId);
  if (!pair) return null;
  const defaults = typedEvidenceDefaults(providerId);
  const finding = {
    ...pair.finding,
    confirmationState: defaults.confirmationState,
    epistemicState: defaults.epistemicState,
    relationshipState:
      pair.finding.relationship ||
      pair.finding.relationshipState ||
      defaults.relationshipState,
    identityClaim: false,
    identityScore: null,
  };
  // URL-alone / web_origin never SAME-*
  const rel = String(finding.relationshipState || '').toUpperCase().replace(/_/g, '-');
  if (
    rel === 'SAME-ENTITY' ||
    rel === 'SAME-REFERENCE' ||
    rel === 'SAME-SOURCE' ||
    providerId === 'web_origin' ||
    finding.hostFamily === 'web_origin'
  ) {
    if (rel === 'SAME-ENTITY' || rel === 'SAME-REFERENCE' || rel === 'SAME-SOURCE') {
      finding.relationshipState = 'UNKNOWN';
      finding.relationship = 'UNKNOWN';
    }
  }
  const evidence = {
    ...pair.evidence,
    confirmationState: defaults.confirmationState,
    epistemicState: defaults.epistemicState,
    status: 'candidate',
    identityClaim: false,
    urlIsNotIdentity: true,
    candidateIsNotFact: true,
  };
  // Existing adapter path only: retain normalized registry provenance without changing B0 store semantics.
  if (raw.sourceRecordId) evidence.sourceRecordId = String(raw.sourceRecordId).slice(0, 160);
  if (Array.isArray(raw.entityRefs)) {
    evidence.typedRefs = raw.entityRefs
      .map(String)
      .filter((r) => /^(viaf|qid|ol|wd):/i.test(r) || /^Q\d+$/i.test(r))
      .slice(0, 32);
  }
  return { finding, evidence };
}

/**
 * Normalize + Acc-scrub a full adapter batch into evidence rows (journal/store path).
 * @param {{ providerId: string, findings?: object[] }} batch
 */
export function normalizeAdapterBatchToEvidence(batch) {
  const { batch: scrubbed, strippedIds, forbiddenStripped } = scrubAdapterBatch(batch);
  const pairs = [];
  for (const raw of scrubbed.findings || []) {
    const pair = normalizeAdapterToEvidence(raw, scrubbed.providerId);
    if (pair) pairs.push(pair);
  }
  return {
    providerId: scrubbed.providerId,
    pairs,
    findings: pairs.map((p) => p.finding),
    evidence: pairs.map((p) => p.evidence),
    strippedIds,
    forbiddenStripped,
    forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
  };
}

/**
 * Scrub family journal entries (Acc on every journal path).
 * @param {object[]} journal
 */
function scrubReasonToken(r, strippedIds = []) {
  const s = String(r ?? '');
  if (!valueHasForbidden(s)) return s.slice(0, 160);
  return s
    .replace(/\bQ\d+\b/gi, (tok) => {
      if (isForbiddenQid(tok)) {
        const q = extractQid(tok);
        if (q && !strippedIds.includes(q)) strippedIds.push(q);
        return '[REDACTED]';
      }
      return tok;
    })
    .slice(0, 160);
}

/**
 * Acc-scrub family journal entries on every journal / emit path.
 * Allowlisted fields only — no raw spread (seed / skipReason bait / Acc QIDs).
 * @param {object[]} journal
 */
export function scrubFamilyJournal(journal) {
  if (!Array.isArray(journal)) return [];
  return journal.map((entry) => {
    if (!entry || typeof entry !== 'object') return entry;
    const strippedIds = [];
    const providerId = entry.providerId != null ? String(entry.providerId).slice(0, 40) : undefined;
    const findings = (entry.findings || [])
      .map((f) => scrubAdapterRawFinding(f, providerId || '', strippedIds))
      .filter(Boolean);
    const evidence = (entry.evidence || []).filter((e) => {
      if (!e) return false;
      if (
        valueHasForbidden(e.id) ||
        valueHasForbidden(e.provenanceUrl) ||
        valueHasForbidden(e.quote) ||
        valueHasForbidden(e.signalSummary)
      ) {
        const q =
          extractQid(e.id) ||
          extractQid(e.provenanceUrl) ||
          extractQid(e.quote) ||
          extractQid(e.signalSummary);
        if (q && isForbiddenQid(q) && !strippedIds.includes(q)) strippedIds.push(q);
        return false;
      }
      return true;
    });
    const reasons = (entry.reasons || []).map((r) => scrubReasonToken(r, strippedIds));
    /** @type {Record<string, unknown>} */
    const out = {
      familyId: entry.familyId != null ? String(entry.familyId).slice(0, 40) : undefined,
      providerId,
      intentId: entry.intentId != null ? String(entry.intentId).slice(0, 40) : undefined,
      planId: entry.planId != null ? String(entry.planId).slice(0, 40) : undefined,
      status: entry.status != null ? String(entry.status).slice(0, 40) : undefined,
      outcomeClass: entry.outcomeClass != null ? String(entry.outcomeClass).slice(0, 64) : undefined,
      findings,
      evidence,
      executionTimeMs:
        typeof entry.executionTimeMs === 'number' ? Math.max(0, entry.executionTimeMs) : 0,
      requestsUsed: typeof entry.requestsUsed === 'number' ? Math.max(0, entry.requestsUsed) : 0,
      reasons,
      forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
    };
    if (entry.skipReason != null) {
      out.skipReason = scrubReasonToken(entry.skipReason, strippedIds);
    }
    if (entry.budgetExhaustedReason != null) {
      out.budgetExhaustedReason = scrubReasonToken(entry.budgetExhaustedReason, strippedIds);
    }
    if (strippedIds.length) out.forbiddenStripped = strippedIds.length;
    for (const k of Object.keys(out)) {
      if (out[k] === undefined) delete out[k];
    }
    return out;
  });
}

export default {
  ADAPTER_CONTRACT_VERSION,
  MAX_ADAPTER_RESPONSE_BYTES,
  MAX_ADAPTER_FINDINGS,
  DEFAULT_ADAPTER_BUDGET_MS,
  ADAPTER_HOST_ALLOWLIST,
  WIRED_PUBLIC_PROVIDER_IDS,
  isAdapterHostAllowed,
  assertAdapterFetchUrl,
  resolveAdapterRedirectUrl,
  MAX_ADAPTER_REDIRECTS,
  adapterBudgetSignal,
  classifyAdapterAbort,
  adapterSoftFailCode,
  ADAPTER_SOFT_FAIL_CODE_FAMILIES,
  isHttpSoftFailCode,
  softFailCodesArePairwiseDistinct,
  safeFetchJson,
  scrubAdapterRawFinding,
  scrubAdapterBatch,
  typedEvidenceDefaults,
  normalizeAdapterToEvidence,
  normalizeAdapterBatchToEvidence,
  scrubFamilyJournal,
};
