/**
 * LOOP-SPINE — Arch LOCKED 2026-09-24
 * Charter: discover → evaluate → expand → corroborate → stop
 * Adapters = expand hops only. Must-Win #1 name→web under expand→evaluate.
 * Cite: docs/GO-IMPL-500/MD-WAVE/ARCH-LOOP-SPINE-ארכיטקט-2026-09-24.md
 * Flag: DISCOVERY_ENABLE_NIGHT default OFF. NO PROMOTE.
 */
import {
  createBudgetLedger,
  createBudgetCaps,
  BUDGET_EXHAUSTED,
  BUDGET_AVAILABLE,
} from './budget.js';
import { gateGeneralWebHitUrl } from './generalWebSearch.js';
import { assertSafePublicHttpsUrl } from './urlSafety.js';

export const LOOP_PHASES = Object.freeze([
  'discover',
  'evaluate',
  'expand',
  'corroborate',
  'stop',
]);

export const STOP_REASONS = Object.freeze([
  'BUDGET_EXHAUSTED',
  'ALL_HOPS_SETTLED',
  'ABORTED',
  'EMPTY_FRONTIER',
  'MAX_WAVES',
  'NO_PROGRESS',
  'FLAG_OFF',
  'EMPTY_SEED',
]);

export const NIGHT_BUDGET_DEFAULTS = Object.freeze({
  maxProviders: 4,
  maxFamilyCalls: 6,
  maxRequests: 12,
  maxUrls: 10,
  maxWallMs: 12_000,
  maxRetries: 1,
  maxWaves: 3,
  maxFetches: 12,
  maxUrlCandidates: 10,
  silentExpansionForbidden: true,
});

export function createNightBudgetCaps(overrides = {}) {
  return createBudgetCaps({
    ...NIGHT_BUDGET_DEFAULTS,
    ...(overrides && typeof overrides === 'object' ? overrides : {}),
    silentExpansionForbidden: true,
  });
}

export function createNightLedger(caps = {}, meta = {}) {
  const limits = createNightBudgetCaps(caps);
  const inner = createBudgetLedger(limits, { startedAt: meta.startedAt });
  let wave = 0;
  let fetches = 0;
  let lastProgressCount = 0;
  let stopReason = null;
  /** @type {{ at: number, phase: string, event: string, detail?: object }[]} */
  const journal = [];

  function note(phase, event, detail) {
    journal.push({
      at: Date.now(),
      phase: String(phase),
      event: String(event),
      ...(detail && typeof detail === 'object' ? { detail } : {}),
    });
  }

  function markStop(reason) {
    if (stopReason) return stopReason;
    stopReason = String(reason || 'BUDGET_EXHAUSTED');
    note('stop', 'stop', { reason: stopReason });
    return stopReason;
  }

  function canExpandHop(need = {}) {
    if (stopReason) {
      return { ok: false, code: BUDGET_EXHAUSTED, reason: stopReason };
    }
    if (meta.signal?.aborted) {
      return { ok: false, code: 'ABORTED', reason: markStop('ABORTED') };
    }
    if (wave > limits.maxWaves) {
      return { ok: false, code: 'MAX_WAVES', reason: markStop('MAX_WAVES') };
    }
    if (fetches >= limits.maxFetches) {
      return { ok: false, code: 'BUDGET_EXHAUSTED', reason: markStop('BUDGET_EXHAUSTED') };
    }
    const gate = inner.canLaunch({
      requests: typeof need.requests === 'number' ? need.requests : 1,
      urls: typeof need.urls === 'number' ? need.urls : 0,
    });
    if (!gate.ok) {
      markStop('BUDGET_EXHAUSTED');
      return gate;
    }
    return {
      ok: true,
      code: BUDGET_AVAILABLE,
      reason: null,
      remaining: gate.remaining,
    };
  }

  function beginWave() {
    wave += 1;
    note('expand', 'wave_begin', { wave });
    if (wave > limits.maxWaves) {
      markStop('MAX_WAVES');
      return { ok: false, wave, reason: 'MAX_WAVES' };
    }
    return { ok: true, wave };
  }

  function recordFetch(providerId, cost = {}) {
    fetches += 1;
    const reserved = inner.reserve({
      providerId,
      requests: typeof cost.requests === 'number' ? cost.requests : 1,
      urls: typeof cost.urls === 'number' ? cost.urls : 0,
      isNewProvider: cost.isNewProvider === true,
    });
    note('expand', 'hop_fetch', {
      providerId,
      fetches,
      ok: !!reserved.ok,
      reason: reserved.reason || null,
    });
    if (!reserved.ok) markStop('BUDGET_EXHAUSTED');
    return reserved;
  }

  function recordProgress(candidateCount) {
    const n = Number(candidateCount) || 0;
    const delta = n - lastProgressCount;
    lastProgressCount = n;
    note('evaluate', 'progress', { candidateCount: n, delta });
    return delta;
  }

  function snapshot() {
    const base = inner.snapshot();
    return {
      ...base,
      wave,
      fetches,
      maxWaves: limits.maxWaves,
      maxFetches: limits.maxFetches,
      stopReason,
      availability: stopReason ? BUDGET_EXHAUSTED : base.availability,
      spineJournal: journal.slice(),
    };
  }

  return {
    limits,
    canExpandHop,
    beginWave,
    recordFetch,
    recordProgress,
    markStop,
    note,
    snapshot,
    get stopReason() {
      return stopReason;
    },
    get wave() {
      return wave;
    },
    get fetches() {
      return fetches;
    },
    get journal() {
      return journal;
    },
    inner,
  };
}

export function classifySeed(seed) {
  const s = String(seed || '').trim();
  if (!s) return 'empty';
  if (/^https?:\/\//i.test(s)) return 'url';
  if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/.*)?$/i.test(s) && !/\s/.test(s)) return 'domain';
  if (
    /\b(inc|llc|ltd|corp|gmbh|oy|ab|foundation|university|ministry|company|construction|group|agency)\b/i.test(
      s,
    )
  ) {
    return 'organization';
  }
  if (/\b(ltd|corp|inc|gmbh)\.?$/i.test(s)) return 'organization';
  const tokens = s.split(/\s+/).filter(Boolean);
  if (
    tokens.length >= 2 &&
    tokens.length <= 4 &&
    /^[\p{L}\p{M}\s.'’-]+$/u.test(s)
  ) {
    return 'person';
  }
  return 'name';
}

/**
 * Discover — seed routing + eligible expand hops (flag-gated).
 * SEARCH INTENT ≠ IDENTITY.
 */
export function discoverPhase(input = {}) {
  const seed = String(input.seed || '').trim();
  const locale = String(input.locale || 'en').trim().slice(0, 8) || 'en';
  const flags = input.flags && typeof input.flags === 'object' ? input.flags : {};

  if (!seed) {
    return {
      phase: 'discover',
      ok: false,
      reason: 'EMPTY_SEED',
      seedClass: 'empty',
      eligibleHops: [],
      launchSet: [],
    };
  }

  const seedClass = classifySeed(seed);
  /** @type {string[]} */
  const eligibleHops = [];
  // Hop A: GENERAL_WEB (Adapter-1.2) — Must-Win #1 name→web
  if (flags.generalWeb === true) eligibleHops.push('general_web');
  // Adapter-2 DDG — optional expand hop; flaky must not block Night
  if (flags.ddgInstant === true) eligibleHops.push('ddg_instant');
  // web_origin — only useful when frontier already has URLs
  if (flags.webOrigin === true) eligibleHops.push('web_origin');

  return {
    phase: 'discover',
    ok: true,
    reason: null,
    seed,
    seedClass,
    locale,
    eligibleHops: eligibleHops.slice(),
    launchSet: eligibleHops.slice(),
    identityClaim: false,
    searchIntentNotIdentity: true,
  };
}

/**
 * Evaluate gates (spine §1.2) — all required before candidate graph.
 * SSRF · http→https re-gate · C1 UNKNOWN · cite-or-drop · epistemic.
 */
export function evaluateUrlCandidate(raw = {}) {
  const url = String(raw.url || '').trim();
  if (!url) {
    return { ok: false, reason: 'empty_url', candidate: null };
  }

  const gate = gateGeneralWebHitUrl(url);
  if (!gate.ok) {
    return { ok: false, reason: gate.reason || 'ssrf_or_gate', candidate: null };
  }

  const provRaw = String(raw.provenanceUrl || '').trim();
  if (!provRaw) {
    return { ok: false, reason: 'cite_or_drop_missing_provenance', candidate: null };
  }
  const provGate = assertSafePublicHttpsUrl(provRaw);
  if (!provGate.ok) {
    return { ok: false, reason: 'cite_or_drop_unsafe_provenance', candidate: null };
  }

  let host = '';
  try {
    host = new URL(gate.canonical).hostname;
  } catch {
    return { ok: false, reason: 'invalid_canonical', candidate: null };
  }

  const whyFound =
    String(raw.whyFound || '').trim().slice(0, 400) ||
    `public-web URL candidate for host ${host} · not identity · C1 UNKNOWN`;

  const candidate = {
    kind: 'url_candidate',
    url: gate.canonical,
    normalizedUrl: gate.canonical,
    provenanceUrl: provGate.canonical,
    title: String(raw.title || host).trim().slice(0, 240),
    snippet: raw.snippet != null ? String(raw.snippet).slice(0, 500) : undefined,
    relationship: 'UNKNOWN',
    relationshipState: 'UNKNOWN',
    identityClaim: false,
    urlAlone: true,
    urlCandidate: true,
    urlIsNotIdentity: true,
    epistemicState: 'candidate',
    confirmationState: 'candidate',
    candidateIsNotFact: true,
    whyFound,
    providerId: raw.providerId || null,
    familyId: raw.familyId || null,
    sourceFamily: raw.sourceFamily || 'general_web',
    hostFamily: 'web_search',
    spinePhase: 'evaluate',
    upgradedFromHttp: !!gate.upgradedFromHttp,
  };

  return { ok: true, reason: 'ok', candidate };
}

/** Soft corroborate — never identity merge from URL/title. */
export function corroborateCandidates(candidates = []) {
  const list = Array.isArray(candidates) ? candidates : [];
  const byHost = new Map();
  for (const c of list) {
    let host = '';
    try {
      host = new URL(c.url).hostname.toLowerCase();
    } catch {
      continue;
    }
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push(c);
  }
  /** @type {object[]} */
  const notes = [];
  for (const [host, rows] of byHost) {
    const providers = [...new Set(rows.map((r) => r.providerId).filter(Boolean))];
    if (providers.length >= 2) {
      notes.push({
        kind: 'corroboration_note',
        host,
        providers,
        strength: 'weak_multi_hop',
        identityClaim: false,
        relationship: 'UNKNOWN',
        note: `soft cross-hop overlap on ${host} · not identity · CORRELATION≠PROOF`,
      });
    }
  }
  return {
    phase: 'corroborate',
    notes,
    identityMerge: false,
    relationshipCeiling: 'UNKNOWN',
  };
}

export function decideStop(ledger, state = {}) {
  if (ledger.stopReason) {
    return { stop: true, reason: ledger.stopReason };
  }
  if (state.aborted) {
    return { stop: true, reason: ledger.markStop('ABORTED') };
  }
  if (ledger.wave >= ledger.limits.maxWaves) {
    return { stop: true, reason: ledger.markStop('MAX_WAVES') };
  }
  if (state.frontierEmpty) {
    return { stop: true, reason: ledger.markStop('EMPTY_FRONTIER') };
  }
  if (state.progressDelta === 0 && ledger.wave >= 1) {
    return { stop: true, reason: ledger.markStop('NO_PROGRESS') };
  }
  if (state.allHopsSettled && (!state.hopsRemaining || state.hopsRemaining <= 0)) {
    return { stop: true, reason: ledger.markStop('ALL_HOPS_SETTLED') };
  }
  const gate = ledger.canExpandHop({ requests: 1 });
  if (!gate.ok) {
    return { stop: true, reason: ledger.stopReason || 'BUDGET_EXHAUSTED' };
  }
  return { stop: false, reason: null };
}

export default {
  LOOP_PHASES,
  STOP_REASONS,
  NIGHT_BUDGET_DEFAULTS,
  createNightBudgetCaps,
  createNightLedger,
  discoverPhase,
  classifySeed,
  evaluateUrlCandidate,
  corroborateCandidates,
  decideStop,
};
