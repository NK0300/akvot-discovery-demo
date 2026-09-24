/**
 * Night Mission loop — Arch LOOP-SPINE LOCKED 2026-09-24.
 * Phases: discover → evaluate → expand → corroborate → stop
 *
 * Must-Win #1 Hop A: GENERAL_WEB locale 1.2 (en|he|de|fr|es) as expand hop.
 * DDG Instant = optional expand hop; flaky does NOT block Night.
 * OL / ORCID = HOLD.
 *
 * Flags: DISCOVERY_ENABLE_NIGHT (spine) + DISCOVERY_ENABLE_GENERAL_WEB (Hop A)
 * both default OFF. NO PROMOTE · NOT TREATMENT.
 */
import {
  LOOP_PHASES,
  createNightLedger,
  discoverPhase,
  evaluateUrlCandidate,
  corroborateCandidates,
  decideStop,
} from './loopSpine.js';
import {
  isNightEnabled as nightFlagOn,
  isGeneralWebSearchEnabled,
  isDdgInstantEnabled,
} from './flags.js';
import {
  searchGeneralWeb,
  GENERAL_WEB_SEARCH_PROVIDER_ID,
  GENERAL_WEB_TIMEOUT_MS,
  pickWikiLocale,
} from './generalWebSearch.js';
import {
  searchDdgInstantAnswer,
  DDG_INSTANT_PROVIDER_ID,
  DDG_INSTANT_TIMEOUT_MS,
} from './ddgInstantAnswer.js';

export const NIGHT_LOOP_VERSION = '2026-09-24.night.loop.1';

export function isNightEnabled(opts = {}) {
  return nightFlagOn(opts);
}

function findingToEvalRaw(finding, providerId) {
  if (!finding || typeof finding !== 'object') return null;
  const url = finding.url || finding.normalizedUrl || finding.canonicalUrl;
  if (!url) return null;
  const provenanceUrl =
    finding.provenanceUrl ||
    finding.evidenceUrl ||
    finding.apiProvenanceUrl ||
    finding.citeUrl ||
    null;
  return {
    url: String(url),
    provenanceUrl: provenanceUrl ? String(provenanceUrl) : '',
    title: finding.title || undefined,
    snippet: finding.snippet || finding.quote || finding.summary || undefined,
    providerId,
    familyId: finding.familyId || providerId,
    sourceFamily: finding.sourceFamily || 'general_web',
    whyFound:
      finding.whyFound ||
      `expand hop ${providerId} · not identity · C1 UNKNOWN`,
  };
}

async function runExpandHop(hopId, ctx) {
  const { seed, locale, signal, wallDeadline, ledger } = ctx;
  const remainingMs = Math.max(50, wallDeadline - Date.now());
  if (remainingMs <= 50) {
    return { hopId, ok: false, reason: 'wall_exhausted', findings: [] };
  }
  const gate = ledger.canExpandHop({ requests: 1 });
  if (!gate.ok) {
    return { hopId, ok: false, reason: gate.reason || 'budget_exhausted', findings: [] };
  }

  if (hopId === 'general_web') {
    const wikiLocale = pickWikiLocale(seed, locale);
    ledger.recordFetch(GENERAL_WEB_SEARCH_PROVIDER_ID, {
      requests: 1,
      isNewProvider: true,
    });
    ledger.note('expand', 'hop_start', {
      hopId,
      providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
      wikiLocale,
    });
    try {
      const result = await searchGeneralWeb(
        {
          q: seed,
          budgetMs: Math.min(GENERAL_WEB_TIMEOUT_MS, remainingMs),
          locale: wikiLocale,
        },
        { signal, enableGeneralWebSearch: true },
      );
      const findings = Array.isArray(result?.findings) ? result.findings : [];
      ledger.note('expand', 'hop_end', {
        hopId,
        reason: result?.reason || null,
        count: findings.length,
        wikiLocale,
      });
      return {
        hopId,
        providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
        ok: true,
        reason: result?.reason || (findings.length ? 'ok' : 'empty'),
        findings,
        stub: !!result?.stub,
        meta: { wikiLocale },
      };
    } catch (e) {
      ledger.note('expand', 'hop_error', {
        hopId,
        message: String(e?.message || e).slice(0, 200),
      });
      return {
        hopId,
        providerId: GENERAL_WEB_SEARCH_PROVIDER_ID,
        ok: false,
        reason: 'hop_error',
        findings: [],
        error: String(e?.message || e).slice(0, 200),
      };
    }
  }

  if (hopId === 'ddg_instant') {
    ledger.recordFetch(DDG_INSTANT_PROVIDER_ID, {
      requests: 1,
      isNewProvider: true,
    });
    ledger.note('expand', 'hop_start', {
      hopId,
      providerId: DDG_INSTANT_PROVIDER_ID,
      optional: true,
    });
    try {
      const result = await searchDdgInstantAnswer(
        {
          q: seed,
          budgetMs: Math.min(DDG_INSTANT_TIMEOUT_MS, remainingMs),
        },
        { signal, enableDdgInstant: true },
      );
      const findings = Array.isArray(result?.findings) ? result.findings : [];
      ledger.note('expand', 'hop_end', {
        hopId,
        reason: result?.reason || null,
        count: findings.length,
        iaAttempts: result?.iaAttempts ?? result?.meta?.iaAttempts ?? null,
        optional: true,
      });
      return {
        hopId,
        providerId: DDG_INSTANT_PROVIDER_ID,
        ok: true,
        reason: result?.reason || (findings.length ? 'ok' : 'empty'),
        findings,
        stub: !!result?.stub,
        optional: true,
        meta: {
          iaAttempts: result?.iaAttempts ?? result?.meta?.iaAttempts ?? null,
          iaRetried: result?.iaRetried ?? result?.meta?.iaRetried ?? false,
          iaBackoffMs: result?.iaBackoffMs ?? result?.meta?.iaBackoffMs ?? 0,
        },
      };
    } catch (e) {
      ledger.note('expand', 'hop_error', {
        hopId,
        message: String(e?.message || e).slice(0, 200),
        optional: true,
      });
      return {
        hopId,
        providerId: DDG_INSTANT_PROVIDER_ID,
        ok: false,
        reason: 'hop_error',
        findings: [],
        optional: true,
        error: String(e?.message || e).slice(0, 200),
      };
    }
  }

  return { hopId, ok: false, reason: 'unknown_hop', findings: [] };
}

function candidatesToBatchFindings(accepted) {
  return accepted.map((c) => ({
    id: `night-${c.providerId || 'x'}-${String(c.url).slice(0, 48)}`,
    kind: 'url_candidate',
    title: c.title,
    summary: c.whyFound,
    url: c.url,
    normalizedUrl: c.normalizedUrl,
    provenanceUrl: c.provenanceUrl,
    snippet: c.snippet,
    urlAlone: true,
    urlCandidate: true,
    urlIsNotIdentity: true,
    identityClaim: false,
    epistemicState: 'candidate',
    relationship: 'UNKNOWN',
    relationshipState: 'UNKNOWN',
    confirmationState: 'candidate',
    whyFound: c.whyFound,
    sourceFamily: c.sourceFamily,
    familyId: c.familyId || c.providerId,
    hostFamily: 'web_search',
    providerId: c.providerId,
    scoreFinding: 0.34,
    facetHints: [
      `provider:${c.providerId}`,
      'kind:url_candidate',
      'family:general_web',
      `urlCandidate:${c.url}`,
      'relationship:UNKNOWN',
      'spine:night',
    ],
    provenance: {
      method: 'night_loop_evaluate',
      providerId: c.providerId,
      apiProvenanceUrl: c.provenanceUrl,
      extractionMethod: 'night_spine_evaluate',
      signalSummary: String(c.whyFound || '').slice(0, 160),
    },
  }));
}

/**
 * @param {{
 *   seed: string,
 *   locale?: string,
 *   signal?: AbortSignal,
 *   wallDeadline?: number,
 *   enableNight?: boolean,
 *   enableGeneralWeb?: boolean,
 *   enableDdgInstant?: boolean,
 *   budgetCaps?: object,
 * }} input
 */
export async function runNightLoop(input = {}) {
  if (!isNightEnabled(input)) {
    return {
      enabled: false,
      version: NIGHT_LOOP_VERSION,
      phases: LOOP_PHASES.slice(),
      stopReason: 'FLAG_OFF',
      candidates: [],
      hopJournal: [],
      spineJournal: [],
      batches: [],
      providerStatuses: {},
    };
  }

  const seed = String(input.seed || '').trim();
  const locale = String(input.locale || 'en').trim().slice(0, 8) || 'en';
  const signal = input.signal;
  const wallDeadline =
    typeof input.wallDeadline === 'number' ? input.wallDeadline : Date.now() + 12_000;
  const ledger = createNightLedger(input.budgetCaps || {}, {
    startedAt: Date.now(),
    signal,
  });

  /** @type {object[]} */
  const candidates = [];
  /** @type {object[]} */
  const hopJournal = [];
  /** @type {object[]} */
  const batches = [];
  /** @type {Record<string, string>} */
  const providerStatuses = {};
  const seenUrls = new Set();

  ledger.note('discover', 'begin', { seed: seed.slice(0, 80) });
  const wantGw =
    input.enableGeneralWeb === true ||
    (input.enableGeneralWeb !== false && isGeneralWebSearchEnabled(input));
  const wantDdg =
    input.enableDdgInstant === true ||
    (input.enableDdgInstant !== false && isDdgInstantEnabled(input));

  const discovered = discoverPhase({
    seed,
    locale,
    flags: {
      generalWeb: wantGw,
      ddgInstant: wantDdg,
      webOrigin: false,
    },
  });
  ledger.note('discover', 'end', {
    seedClass: discovered.seedClass,
    eligibleHops: discovered.eligibleHops,
  });

  if (!discovered.ok) {
    ledger.markStop(discovered.reason === 'EMPTY_SEED' ? 'EMPTY_SEED' : 'EMPTY_FRONTIER');
    return pack(ledger, {
      enabled: true,
      discovered,
      candidates,
      hopJournal,
      batches,
      providerStatuses,
      corroboration: { notes: [] },
    });
  }

  if (!discovered.eligibleHops.length) {
    ledger.markStop('EMPTY_FRONTIER');
    return pack(ledger, {
      enabled: true,
      discovered,
      candidates,
      hopJournal,
      batches,
      providerStatuses,
      corroboration: { notes: [] },
    });
  }

  const wave = ledger.beginWave();
  if (!wave.ok) {
    return pack(ledger, {
      enabled: true,
      discovered,
      candidates,
      hopJournal,
      batches,
      providerStatuses,
      corroboration: { notes: [] },
    });
  }

  const hopOrder = discovered.eligibleHops.slice().sort((a, b) => {
    if (a === 'general_web') return -1;
    if (b === 'general_web') return 1;
    return 0;
  });

  for (const hopId of hopOrder) {
    if (signal?.aborted) {
      ledger.markStop('ABORTED');
      break;
    }
    if (Date.now() >= wallDeadline) {
      ledger.markStop('BUDGET_EXHAUSTED');
      break;
    }

    const hopResult = await runExpandHop(hopId, {
      seed,
      locale,
      signal,
      wallDeadline,
      ledger,
    });
    hopJournal.push({
      hopId,
      providerId: hopResult.providerId || hopId,
      reason: hopResult.reason,
      count: (hopResult.findings || []).length,
      optional: !!hopResult.optional,
      meta: hopResult.meta || null,
      error: hopResult.error || null,
    });
    if (hopResult.providerId) {
      providerStatuses[hopResult.providerId] = hopResult.ok
        ? hopResult.findings?.length
          ? 'ok'
          : hopResult.reason || 'empty'
        : hopResult.reason || 'error';
    }

    ledger.note('evaluate', 'begin', { hopId });
    /** @type {object[]} */
    const accepted = [];
    for (const f of hopResult.findings || []) {
      const raw = findingToEvalRaw(f, hopResult.providerId || hopId);
      if (!raw) continue;
      const ev = evaluateUrlCandidate(raw);
      if (!ev.ok || !ev.candidate) {
        ledger.note('evaluate', 'drop', { reason: ev.reason, hopId });
        continue;
      }
      if (seenUrls.has(ev.candidate.url)) continue;
      seenUrls.add(ev.candidate.url);
      accepted.push(ev.candidate);
      candidates.push(ev.candidate);
    }
    ledger.note('evaluate', 'end', { hopId, accepted: accepted.length });

    if (accepted.length) {
      batches.push({
        providerId: hopResult.providerId || hopId,
        findings: candidatesToBatchFindings(accepted),
        partial: false,
        _nightSpine: true,
      });
    }

    if (hopId === 'ddg_instant' && (!hopResult.ok || !(hopResult.findings || []).length)) {
      ledger.note('expand', 'optional_hop_fail_closed', {
        hopId,
        reason: hopResult.reason,
      });
    }
  }

  const progressDelta = ledger.recordProgress(candidates.length);

  ledger.note('corroborate', 'begin', { candidateCount: candidates.length });
  const corroboration = corroborateCandidates(candidates);
  ledger.note('corroborate', 'end', { notes: (corroboration.notes || []).length });

  decideStop(ledger, {
    aborted: !!signal?.aborted,
    frontierEmpty: candidates.length === 0 && hopJournal.length > 0,
    progressDelta,
    allHopsSettled: true,
    hopsRemaining: 0,
  });
  if (!ledger.stopReason) {
    ledger.markStop(candidates.length ? 'ALL_HOPS_SETTLED' : 'EMPTY_FRONTIER');
  }

  return pack(ledger, {
    enabled: true,
    discovered,
    candidates,
    hopJournal,
    batches,
    providerStatuses,
    corroboration,
  });
}

function pack(ledger, parts) {
  return {
    enabled: parts.enabled,
    version: NIGHT_LOOP_VERSION,
    phases: LOOP_PHASES.slice(),
    stopReason: ledger.stopReason,
    seedClass: parts.discovered?.seedClass || null,
    eligibleHops: parts.discovered?.eligibleHops || [],
    candidates: parts.candidates,
    hopJournal: parts.hopJournal,
    spineJournal: ledger.journal.slice(),
    batches: parts.batches,
    providerStatuses: parts.providerStatuses,
    corroboration: parts.corroboration,
    budget: ledger.snapshot(),
    wave: ledger.wave,
    fetches: ledger.fetches,
  };
}

export default {
  NIGHT_LOOP_VERSION,
  isNightEnabled,
  runNightLoop,
};
