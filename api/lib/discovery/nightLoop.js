/**
 * Night Mission loop — Arch LOOP-SPINE LOCKED 2026-09-24 · Must-Win #2 wave≥2.
 * Phases: discover → evaluate → expand → corroborate → stop
 *
 * Must-Win #1 Hop A: GENERAL_WEB locale 1.2 (en|he|de|fr|es) as expand hop.
 * Must-Win #2: multi-wave beginWave loop · wave-2 web_origin enrich (flag OFF default).
 * DDG Instant = optional expand hop; flaky does NOT block Night.
 * OL / ORCID = HOLD.
 *
 * Flags: DISCOVERY_ENABLE_NIGHT + DISCOVERY_ENABLE_GENERAL_WEB + DISCOVERY_ENABLE_WEB_ORIGIN
 * all default OFF. NO PROMOTE · NOT TREATMENT.
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
  isWebOriginEnabled,
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
import {
  safeFetchOriginMetadata,
  WEB_ORIGIN_PROVIDER_ID,
  DEFAULT_FETCH_TIMEOUT_MS,
} from './webOrigin.js';

export const NIGHT_LOOP_VERSION = '2026-09-24.night.loop.2';

/** Cap origin enrich fetches per wave-2 (Arch LOCK). */
export const WEB_ORIGIN_WAVE2_MAX_URLS = 2;

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

/**
 * Eligible hops for a given wave (Arch MW2 §1.2–1.3).
 * Wave-1: general_web then optional ddg_instant.
 * Wave-2: web_origin when flag ON and ≥1 evaluate-ok url candidate.
 * Wave-3+: empty unless a remaining eligible hop exists (none today → stop).
 */
export function pickEligibleHopsForWave(waveNum, ctx = {}) {
  const n = Number(waveNum) || 0;
  /** @type {string[]} */
  const hops = [];
  if (n === 1) {
    if (ctx.wantGeneralWeb) hops.push('general_web');
    if (ctx.wantDdgInstant) hops.push('ddg_instant');
    return hops;
  }
  if (n === 2) {
    const frontier = Array.isArray(ctx.candidates) ? ctx.candidates : [];
    if (ctx.wantWebOrigin && frontier.length >= 1) {
      hops.push('web_origin');
    }
    return hops;
  }
  // Wave-3+: no further hops wired (no open-ended crawl).
  return hops;
}

/** ≤2 wave-1 evaluate-ok URLs, stable sort by url. */
export function pickWebOriginInputUrls(candidates, max = WEB_ORIGIN_WAVE2_MAX_URLS) {
  const list = (Array.isArray(candidates) ? candidates : [])
    .filter((c) => c && c.url)
    .slice()
    .sort((a, b) => String(a.url).localeCompare(String(b.url)));
  return list.slice(0, Math.max(0, Number(max) || WEB_ORIGIN_WAVE2_MAX_URLS));
}

async function runExpandHop(hopId, ctx) {
  const { seed, locale, signal, wallDeadline, ledger, candidates } = ctx;
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

  if (hopId === 'web_origin') {
    return runWebOriginEnrichHop(ctx);
  }

  return { hopId, ok: false, reason: 'unknown_hop', findings: [] };
}

/**
 * Wave-2 web_origin: hop-validated public fetch · enrich title/snippet/whyFound only.
 * Still UNKNOWN · identityClaim=false · no SAME-ENTITY · cite-or-drop.
 * Cap ≤2 · honor wall/AbortSignal · count toward night ledger fetches.
 */
async function runWebOriginEnrichHop(ctx) {
  const { signal, wallDeadline, ledger, candidates } = ctx;
  const inputs = pickWebOriginInputUrls(candidates, WEB_ORIGIN_WAVE2_MAX_URLS);
  ledger.note('expand', 'hop_start', {
    hopId: 'web_origin',
    providerId: WEB_ORIGIN_PROVIDER_ID,
    inputCount: inputs.length,
  });

  /** @type {object[]} */
  const findings = [];
  let firstProvider = true;

  for (const c of inputs) {
    if (signal?.aborted) break;
    if (Date.now() >= wallDeadline) break;
    const remainingMs = Math.max(50, wallDeadline - Date.now());
    if (remainingMs <= 50) break;

    const gate = ledger.canExpandHop({ requests: 1 });
    if (!gate.ok) break;

    ledger.recordFetch(WEB_ORIGIN_PROVIDER_ID, {
      requests: 1,
      isNewProvider: firstProvider,
    });
    firstProvider = false;

    try {
      const fetchResult = await safeFetchOriginMetadata(c.url, {
        timeoutMs: Math.min(DEFAULT_FETCH_TIMEOUT_MS, remainingMs),
        signal,
      });
      if (!fetchResult?.ok) {
        ledger.note('expand', 'origin_fetch_fail', {
          url: String(c.url).slice(0, 120),
          reason: fetchResult?.failureClass || fetchResult?.resultClass || 'fetch_failed',
        });
        continue;
      }
      const meta = fetchResult.meta || {};
      const title = meta.title || meta.siteName || c.title;
      const snippet = meta.snippet || meta.description || c.snippet;
      const whyFound =
        `web_origin enrich · host metadata for ${String(c.url).slice(0, 80)} · not identity · C1 UNKNOWN`;
      findings.push({
        url: c.url,
        normalizedUrl: c.normalizedUrl || c.url,
        provenanceUrl: c.provenanceUrl || fetchResult.finalUrl || c.url,
        title,
        snippet,
        whyFound,
        familyId: WEB_ORIGIN_PROVIDER_ID,
        sourceFamily: c.sourceFamily || 'general_web',
        // Force C1 — never promote web_origin relationship labels to identity.
        relationship: 'UNKNOWN',
        identityClaim: false,
      });
    } catch (e) {
      ledger.note('expand', 'origin_fetch_error', {
        message: String(e?.message || e).slice(0, 200),
      });
    }
  }

  ledger.note('expand', 'hop_end', {
    hopId: 'web_origin',
    count: findings.length,
    inputCount: inputs.length,
  });
  return {
    hopId: 'web_origin',
    providerId: WEB_ORIGIN_PROVIDER_ID,
    ok: true,
    reason: findings.length ? 'ok' : 'empty_enrich',
    findings,
    enrichOnly: true,
    meta: { inputCount: inputs.length, enriched: findings.length },
  };
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
 * Merge evaluate-ok candidate: URL-dedupe for new hops; enrich-in-place for web_origin.
 * @returns {{ added: number, enriched: number, accepted: object[] }}
 */
function mergeEvaluatedCandidates(evCandidates, state, { enrichOnly = false } = {}) {
  /** @type {object[]} */
  const accepted = [];
  let added = 0;
  let enriched = 0;
  for (const cand of evCandidates) {
    if (!cand?.url) continue;
    // Always force C1 ceiling on night path.
    cand.relationship = 'UNKNOWN';
    cand.relationshipState = 'UNKNOWN';
    cand.identityClaim = false;
    cand.urlAlone = true;
    cand.urlIsNotIdentity = true;

    if (state.seenUrls.has(cand.url)) {
      if (enrichOnly) {
        const idx = state.candidates.findIndex((c) => c.url === cand.url);
        if (idx >= 0) {
          const prev = state.candidates[idx];
          state.candidates[idx] = {
            ...prev,
            title: cand.title || prev.title,
            snippet: cand.snippet != null ? cand.snippet : prev.snippet,
            whyFound: cand.whyFound || prev.whyFound,
            relationship: 'UNKNOWN',
            relationshipState: 'UNKNOWN',
            identityClaim: false,
          };
          accepted.push(state.candidates[idx]);
          enriched += 1;
        }
      }
      continue;
    }
    state.seenUrls.add(cand.url);
    state.candidates.push(cand);
    accepted.push(cand);
    added += 1;
  }
  return { added, enriched, accepted };
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
 *   enableWebOrigin?: boolean,
 *   budgetCaps?: object,
 *   expandHop?: Function, // test-only hop override
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
  const mergeState = { candidates, seenUrls };

  ledger.note('discover', 'begin', { seed: seed.slice(0, 80) });
  const wantGw =
    input.enableGeneralWeb === true ||
    (input.enableGeneralWeb !== false && isGeneralWebSearchEnabled(input));
  const wantDdg =
    input.enableDdgInstant === true ||
    (input.enableDdgInstant !== false && isDdgInstantEnabled(input));
  const wantWo =
    input.enableWebOrigin === true ||
    (input.enableWebOrigin !== false && isWebOriginEnabled(input));

  // Discover reports wave-1 hop set (web_origin is wave-2 only — not in initial discover list).
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
    wantWebOrigin: wantWo,
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

  /** @type {object} */
  let lastCorroboration = { notes: [] };

  // Multi-wave driver (Must-Win #2): loop beginWave while ok up to maxWaves.
  while (!ledger.stopReason) {
    if (signal?.aborted) {
      ledger.markStop('ABORTED');
      break;
    }
    if (Date.now() >= wallDeadline) {
      ledger.markStop('BUDGET_EXHAUSTED');
      break;
    }

    const waveResult = ledger.beginWave();
    if (!waveResult.ok) break;
    const waveNum = waveResult.wave;

    const hopOrder = pickEligibleHopsForWave(waveNum, {
      wantGeneralWeb: wantGw,
      wantDdgInstant: wantDdg,
      wantWebOrigin: wantWo,
      candidates,
    });

    // Wave-2 with flag OFF (or no frontier): still began — honest NO_PROGRESS.
    if (waveNum === 2 && hopOrder.length === 0) {
      ledger.note('expand', 'wave2_no_eligible_hop', {
        wave: 2,
        wantWebOrigin: wantWo,
        frontierUrls: candidates.length,
      });
      hopJournal.push({
        hopId: 'wave2_no_eligible_hop',
        providerId: null,
        reason: wantWo ? 'no_frontier_urls' : 'web_origin_flag_off',
        count: 0,
        wave: 2,
      });
      decideStop(ledger, {
        aborted: !!signal?.aborted,
        frontierEmpty: false,
        progressDelta: 0,
        allHopsSettled: false,
        hopsRemaining: 0,
      });
      if (!ledger.stopReason) ledger.markStop('NO_PROGRESS');
      break;
    }

    if (hopOrder.length === 0) {
      // Wave-3+ with nothing wired, or unexpected empty.
      decideStop(ledger, {
        aborted: !!signal?.aborted,
        frontierEmpty: candidates.length === 0,
        progressDelta: 0,
        allHopsSettled: true,
        hopsRemaining: 0,
      });
      if (!ledger.stopReason) {
        ledger.markStop(candidates.length ? 'ALL_HOPS_SETTLED' : 'EMPTY_FRONTIER');
      }
      break;
    }

    const countBeforeWave = candidates.length;

    for (const hopId of hopOrder) {
      if (signal?.aborted) {
        ledger.markStop('ABORTED');
        break;
      }
      if (Date.now() >= wallDeadline) {
        ledger.markStop('BUDGET_EXHAUSTED');
        break;
      }

      const expandFn =
        typeof input.expandHop === 'function' ? input.expandHop : runExpandHop;
      const hopResult = await expandFn(hopId, {
        seed,
        locale,
        signal,
        wallDeadline,
        ledger,
        candidates,
      });
      hopJournal.push({
        hopId,
        providerId: hopResult.providerId || hopId,
        reason: hopResult.reason,
        count: (hopResult.findings || []).length,
        optional: !!hopResult.optional,
        enrichOnly: !!hopResult.enrichOnly,
        wave: waveNum,
        meta: hopResult.meta || null,
        error: hopResult.error || null,
      });
      if (hopResult.providerId) {
        providerStatuses[hopResult.providerId] = hopResult.ok
          ? hopResult.findings?.length
            ? hopResult.enrichOnly
              ? 'enriched'
              : 'ok'
            : hopResult.reason || 'empty'
          : hopResult.reason || 'error';
      }

      ledger.note('evaluate', 'begin', { hopId, wave: waveNum });
      /** @type {object[]} */
      const evaluated = [];
      for (const f of hopResult.findings || []) {
        const raw = findingToEvalRaw(f, hopResult.providerId || hopId);
        if (!raw) continue;
        const ev = evaluateUrlCandidate(raw);
        if (!ev.ok || !ev.candidate) {
          ledger.note('evaluate', 'drop', { reason: ev.reason, hopId, wave: waveNum });
          continue;
        }
        evaluated.push(ev.candidate);
      }
      const merged = mergeEvaluatedCandidates(evaluated, mergeState, {
        enrichOnly: !!hopResult.enrichOnly,
      });
      ledger.note('evaluate', 'end', {
        hopId,
        wave: waveNum,
        accepted: merged.accepted.length,
        added: merged.added,
        enriched: merged.enriched,
      });

      if (merged.accepted.length) {
        batches.push({
          providerId: hopResult.providerId || hopId,
          findings: candidatesToBatchFindings(merged.accepted),
          partial: false,
          _nightSpine: true,
          _wave: waveNum,
          _enrichOnly: !!hopResult.enrichOnly,
        });
      }

      if (hopId === 'ddg_instant' && (!hopResult.ok || !(hopResult.findings || []).length)) {
        ledger.note('expand', 'optional_hop_fail_closed', {
          hopId,
          reason: hopResult.reason,
        });
      }
    }

    if (ledger.stopReason) break;

    const progressDelta = ledger.recordProgress(candidates.length);
    const newUrlsThisWave = candidates.length - countBeforeWave;

    ledger.note('corroborate', 'begin', {
      candidateCount: candidates.length,
      wave: waveNum,
    });
    lastCorroboration = corroborateCandidates(candidates);
    ledger.note('corroborate', 'end', {
      notes: (lastCorroboration.notes || []).length,
      wave: waveNum,
    });

    // More waves possible? Do NOT ALL_HOPS_SETTLED after wave-1 alone while
    // maxWaves>1 and candidates+budget remain (Arch §2 Hop-shaped PARTIAL fix).
    const budgetOk = ledger.canExpandHop({ requests: 1 }).ok && !ledger.stopReason;
    const underMaxWaves = waveNum < ledger.limits.maxWaves;
    const hasFrontier = candidates.length > 0;
    const moreWavesWorthTrying =
      underMaxWaves &&
      hasFrontier &&
      budgetOk &&
      !signal?.aborted &&
      Date.now() < wallDeadline &&
      (waveNum === 1 || (waveNum >= 2 && newUrlsThisWave > 0));

    const stop = decideStop(ledger, {
      aborted: !!signal?.aborted,
      frontierEmpty: candidates.length === 0 && hopJournal.length > 0,
      progressDelta: moreWavesWorthTrying ? Math.max(progressDelta, 1) : progressDelta,
      allHopsSettled: !moreWavesWorthTrying,
      hopsRemaining: moreWavesWorthTrying ? 1 : 0,
    });

    if (stop.stop) break;
    // else continue → next beginWave
  }

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
    corroboration: lastCorroboration,
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
  WEB_ORIGIN_WAVE2_MAX_URLS,
  isNightEnabled,
  pickEligibleHopsForWave,
  pickWebOriginInputUrls,
  runNightLoop,
};
