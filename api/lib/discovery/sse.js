/**
 * SSE progressive discovery events — Acc scrub on EVERY chunk before emit.
 * Normative event set (SSE-UNTRUSTED-SURFACE-CONTRACT):
 *   meta | plan* | progress | provider | finding | graph* | facets | status | error | done
 * (* plan/graph additive — only when DISCOVERY_ENABLE_PLAN_SSE / QueryPlan path)
 *
 * Ordering: meta → plan? → (provider|finding|progress)* → graph? → facets → status → done
 * Always terminates with `done`. Reconnect via Last-Event-ID. Finite lifetime.
 *
 * @see SSE_RECONNECT_DOCS · SSE-UNTRUSTED-SURFACE-CONTRACT · ACC-EMIT-SURFACE-MATRIX
 */
import { sanitizeDiscoveryPayload, scrubFindingChunk, scrubFacetsChunk, scrubGraphChunk } from './emit.js';
import { scrubGraphForEmit } from './evidenceGraph.js';
import { planSummaryForSse, scrubQueryPlanForEmit } from './queryPlan.js';
import { isPlanSseEnabled } from './flags.js';
import { recordSseLifecycle } from './obs.js';
import { isForbiddenQid, redactForbiddenQidsInText } from '../forbiddenIdentities.js';

export const SSE_SCHEMA_VERSION = 1;

/** Allow-set of event types (producers MUST NOT emit outside without version bump). */
export const SSE_EVENT_ALLOW_SET = Object.freeze([
  'meta',
  'plan',
  'progress',
  'provider',
  'finding',
  'graph',
  'facets',
  'status',
  'error',
  'done',
]);

/** Machine + human reconnect contract (surfaced in health/docs evidence). */

/** Ordered progressive lifecycle phases (Phase 5 progressive SSE). */
export const SSE_LIFECYCLE_PHASES = Object.freeze([
  'START',
  'PLANNING',
  'DISCOVERY',
  'FINDINGS',
  'EVIDENCE',
  'RELATIONSHIPS',
  'GRAPH',
  'COMPLETE',
]);

export const SSE_RECONNECT_DOCS = {
  lastEventIdHeader: 'Last-Event-ID',
  lastEventIdQuery: ['lastEventId', 'cursor'],
  replay: 'skip events with id <= Last-Event-ID; remaining frames Acc-scrubbed',
  terminalEvents: ['done', 'error'],
  hangPolicy: 'finite event list — always ends; no long-poll hang',
  reconnectSafe: true,
  sseSchemaVersion: SSE_SCHEMA_VERSION,
  maxSseLifetimeMsDefault: 30_000,
};

/**
 * Format one SSE frame with optional event id (cursor).
 * @param {string} event
 * @param {object} data
 * @param {number|string} [id]
 */

/**
 * Acc-safe budget UX fields for SSE (no secrets / seed).
 * @param {object} session
 */
function budgetUxFromSession(session) {
  const tel = session.budgetTelemetry || {};
  const rem = tel.remaining || {};
  const used = tel.used || {};
  const out = {};
  if (session.budgetExhaustedReason || tel.budgetExhaustedReason) {
    out.budgetExhaustedReason = String(
      session.budgetExhaustedReason || tel.budgetExhaustedReason,
    ).slice(0, 64);
  }
  if (tel.availability) out.budgetAvailability = String(tel.availability).slice(0, 32);
  const remaining = {};
  for (const k of ['familyCalls', 'requests', 'wallMs', 'findings', 'evidence']) {
    if (typeof rem[k] === 'number') remaining[k] = rem[k];
  }
  if (Object.keys(remaining).length) out.budgetRemaining = remaining;
  const usedOut = {};
  for (const k of ['familyCalls', 'requests', 'findings', 'evidence']) {
    if (typeof used[k] === 'number') usedOut[k] = used[k];
  }
  if (Object.keys(usedOut).length) out.budgetUsed = usedOut;
  return out;
}

export function formatSseEvent(event, data, id) {
  const payload = JSON.stringify(data ?? {});
  const idLine = id != null ? `id: ${id}\n` : '';
  return `${idLine}event: ${event}\ndata: ${payload}\n\n`;
}

/**
 * Scrub SSE error payload — no stacks, credentials, Acc ids.
 * @param {object} err
 */
export function scrubSseError(err = {}) {
  const msg = String(err.message || err.error || 'error').slice(0, 200);
  // Strip credential-shaped / Acc-forbidden QIDs / identity directives (SoT depth)
  let safe = msg.replace(/(api[_-]?key|secret|password|token|bearer\s+\S+)/gi, '[REDACTED]');
  for (const tok of ['SAME-ENTITY', 'SAME_ENTITY', 'IDENTITY_COMMIT', 'TITLE_BRIDGE']) {
    if (safe.includes(tok)) safe = safe.split(tok).join('[BLOCKED]');
  }
  safe = redactForbiddenQidsInText(safe);
  safe = safe.replace(/\bQ\d+\b/gi, (tok) => (isForbiddenQid(tok) ? '[REDACTED_QID]' : tok));
  return {
    failureClass: err.failureClass || err.code || 'error',
    message: safe.slice(0, 200),
    status: err.status || 'failed_soft',
    ...(err.forbiddenIdentitiesVersion
      ? { forbiddenIdentitiesVersion: err.forbiddenIdentitiesVersion }
      : {}),
  };
}

/**
 * Build Acc-scrubbed progressive event list from a (possibly complete) session.
 * Used for replay on GET /events and for unit tests.
 *
 * @param {object} session
 * @param {{ enablePlanSse?: boolean, includeGraph?: boolean }} [opts]
 * @returns {{ event: string, data: object, id: number }[]}
 */
export function buildProgressiveEvents(session, opts = {}) {
  const planSse = isPlanSseEnabled({
    enablePlanSse: opts.enablePlanSse,
    enableQueryPlan: opts.enableQueryPlan ?? session?.flags?.queryPlan,
  });
  // Flag OFF → AS-IS event set only (no plan/graph)
  const emitPlan = planSse === true && !!(session.queryPlan || session.plan);
  const emitGraph =
    planSse === true &&
    opts.includeGraph !== false &&
    session.graph &&
    typeof session.graph === 'object';

  const scrubbed = sanitizeDiscoveryPayload({
    sessionId: session.sessionId,
    seed: session.seed,
    q: session.q || session.seed,
    status: session.status,
    findings: session.findings || [],
    evidence: session.evidence || [],
    facets: session.facets || [],
    progress: session.progress,
    providers: session.providers,
    softEr: session.softEr,
    stage: session.stage,
    createdAt: session.createdAt,
    forbiddenIdentitiesVersion: session.forbiddenIdentitiesVersion,
    graph: session.graph,
    version: session.version,
    narrow: session.lastNarrow || session.narrow,
    queryPlan: session.queryPlan || session.plan,
    budgetTelemetry: session.budgetTelemetry,
    familyJournal: session.familyJournal,
  });

  /** @type {{ event: string, data: object, id: number }[]} */
  const events = [];
  let cursor = typeof session.eventCursor === 'number' ? session.eventCursor : 0;

  const push = (event, data) => {
    if (!SSE_EVENT_ALLOW_SET.includes(event)) return; // allow-set discipline
    cursor += 1;
    events.push({
      event,
      data: { ...data, cursor, sseSchemaVersion: SSE_SCHEMA_VERSION },
      id: cursor,
    });
  };

  // 1. meta = START
  push('meta', {
    sessionId: scrubbed.sessionId,
    seed: scrubbed.seed || scrubbed.q,
    q: scrubbed.q || scrubbed.seed,
    version: session.version || 1,
    forbiddenIdentitiesVersion: scrubbed.forbiddenIdentitiesVersion,
    sseSchemaVersion: SSE_SCHEMA_VERSION,
    lifecyclePhase: 'START',
    store: session._storeInfo || undefined,
    ...(session.correlationId ? { correlationId: String(session.correlationId).slice(0, 64) } : {}),
  });
  push('progress', {
    lifecyclePhase: 'START',
    phase: 'START',
    progress: scrubbed.progress || { done: 0, totalHint: 1 },
    stage: scrubbed.stage || session.stage || 'S0',
  });

  // 2. PLANNING — plan event (additive — flag gated)
  push('progress', {
    lifecyclePhase: 'PLANNING',
    phase: 'PLANNING',
    progress: scrubbed.progress,
    stage: 'PLAN',
  });
  if (emitPlan) {
    const rawPlan = session.queryPlan || session.plan;
    const summary = planSummaryForSse(rawPlan);
    if (summary) {
      push('plan', { plan: summary, lifecyclePhase: 'PLANNING' });
    }
  }

  // 3. DISCOVERY
  push('progress', {
    lifecyclePhase: 'DISCOVERY',
    phase: 'DISCOVERY',
    progress: scrubbed.progress,
    stage: scrubbed.stage || session.stage || 'DISCOVER',
    ...budgetUxFromSession(session),
  });

  // 4. provider
  if (scrubbed.providers && typeof scrubbed.providers === 'object') {
    for (const [pid, state] of Object.entries(scrubbed.providers)) {
      push('provider', { providerId: pid, state });
    }
  }

  // 5. FINDINGS + EVIDENCE phases
  push('progress', {
    lifecyclePhase: 'FINDINGS',
    phase: 'FINDINGS',
    progress: scrubbed.progress,
    findingCount: (scrubbed.findings || []).length,
  });
  const evidenceById = new Map((scrubbed.evidence || []).map((e) => [e.id, e]));
  const findingsSorted = [...(scrubbed.findings || [])].sort((a, b) => {
    const ra = typeof a.rank === 'number' ? a.rank : 9999;
    const rb = typeof b.rank === 'number' ? b.rank : 9999;
    if (ra !== rb) return ra - rb;
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
  for (const f of findingsSorted) {
    const evs = (f.evidenceIds || []).map((eid) => evidenceById.get(eid)).filter(Boolean);
    const chunk = scrubFindingChunk({ finding: f, evidence: evs });
    if (chunk) {
      push('finding', chunk);
    }
  }

  push('progress', {
    lifecyclePhase: 'EVIDENCE',
    phase: 'EVIDENCE',
    evidenceCount: (scrubbed.evidence || []).length,
  });
  push('progress', {
    lifecyclePhase: 'RELATIONSHIPS',
    phase: 'RELATIONSHIPS',
  });

  // 6. GRAPH phase (additive — flag gated; Acc scrub; no same-entity)
  push('progress', { lifecyclePhase: 'GRAPH', phase: 'GRAPH' });
  if (emitGraph) {
    // Acc + relationship sanitize (scrubGraphChunk → scrubGraphPayload → sanitizeRelationshipGraph)
    const chunk = scrubGraphChunk(scrubbed.graph || session.graph);
    const g = chunk?.graph || scrubGraphForEmit(scrubbed.graph || session.graph);
    if (g && ((g.nodes || []).length || (g.edges || []).length)) {
      push('graph', {
        graph: g,
        ...(chunk?.forbiddenIdentitiesVersion
          ? { forbiddenIdentitiesVersion: chunk.forbiddenIdentitiesVersion }
          : {}),
      });
    }
  }


  // 7. facets
  const facets = scrubFacetsChunk(scrubbed.facets || []);
  push('facets', { facets });

  // 8. status
  const terminal = ['partial', 'complete', 'failed_soft', 'cancelled'].includes(scrubbed.status)
    ? scrubbed.status
    : scrubbed.status || 'partial';

  const statusPayload = {
    status: terminal,
    findingCount: (scrubbed.findings || []).length,
    forbiddenStripped: scrubbed.forbiddenStripped || 0,
    forbiddenIdentitiesVersion: scrubbed.forbiddenIdentitiesVersion,
    version: session.version || 1,
  };
  Object.assign(statusPayload, budgetUxFromSession(session));
  if (Array.isArray(session.gaps) && session.gaps.length) {
    statusPayload.gapCount = session.gaps.length;
    statusPayload.gapCodes = [...new Set(session.gaps.map((g) => g.code))].slice(0, 12);
  }
  push('status', statusPayload);

  // 9. COMPLETE + done — ALWAYS
  push('progress', {
    lifecyclePhase: 'COMPLETE',
    phase: 'COMPLETE',
    status: terminal,
  });
  push('done', {
    lifecyclePhase: 'COMPLETE',
    status: terminal,
    sessionId: scrubbed.sessionId,
    findingCount: (scrubbed.findings || []).length,
    forbiddenIdentitiesVersion: scrubbed.forbiddenIdentitiesVersion,
    version: session.version || 1,
    ...(Array.isArray(session.gaps) && session.gaps.length
      ? { gapCount: session.gaps.length }
      : {}),
    ...budgetUxFromSession(session),
  });

  return events;
}

/**
 * Write progressive SSE frames. Supports Last-Event-ID resume (skip already-sent).
 * Honors maxSseLifetimeMs — emits done and stops (no hang).
 * @param {import('http').ServerResponse} res
 * @param {object} session
 * @param {{ delayMs?: number, lastEventId?: number, maxSseLifetimeMs?: number, signal?: AbortSignal, enablePlanSse?: boolean, includeGraph?: boolean, correlationId?: string }} [opts]
 */
export async function writeProgressiveSse(res, session, opts = {}) {
  const delayMs = typeof opts.delayMs === 'number' ? opts.delayMs : 0;
  const lastEventId = Number(opts.lastEventId || 0) || 0;
  const correlationId = opts.correlationId;
  const maxLifetime =
    typeof opts.maxSseLifetimeMs === 'number'
      ? opts.maxSseLifetimeMs
      : session?.queryPlan?.budgets?.maxSseLifetimeMs ||
        session?.budgets?.maxSseLifetimeMs ||
        SSE_RECONNECT_DOCS.maxSseLifetimeMsDefault;
  const startedAt = Date.now();
  const events = buildProgressiveEvents(session, opts);
  let wroteTerminal = false;
  let maxId = lastEventId;
  let frames = 0;
  const isResume = lastEventId > 0;
  recordSseLifecycle(isResume ? 'resume' : 'open', { correlationId });

  const aborted = () =>
    (opts.signal && opts.signal.aborted) ||
    (res.writableEnded === true) ||
    (typeof res.destroyed === 'boolean' && res.destroyed);

  try {
    for (const ev of events) {
      if (aborted()) break;
      if (Date.now() - startedAt > maxLifetime) {
        // Lifetime budget — emit done and stop
        break;
      }
      if (ev.id <= lastEventId) continue; // reconnect resume / safe replay skip
      res.write(formatSseEvent(ev.event, ev.data, ev.id));
      frames += 1;
      recordSseLifecycle('frame', { correlationId, frames: 1 });
      if (typeof res.flush === 'function') res.flush();
      if (ev.id > maxId) maxId = ev.id;
      if (ev.event === 'done' || ev.event === 'error') wroteTerminal = true;
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    }
    // If resume skipped everything including done, OR lifetime cut mid-stream — emit done
    if (!wroteTerminal) {
      const doneId = maxId + 1;
      res.write(
        formatSseEvent(
          'done',
          {
            status: session.status || 'complete',
            sessionId: session.sessionId,
            resumed: isResume,
            lastEventId,
            sseSchemaVersion: SSE_SCHEMA_VERSION,
            message:
              Date.now() - startedAt > maxLifetime
                ? 'sse_lifetime_budget'
                : 'replay complete — no new events',
            ...(Date.now() - startedAt > maxLifetime
              ? { budgetExhaustedReason: 'maxSseLifetimeMs' }
              : {}),
          },
          doneId,
        ),
      );
      frames += 1;
      recordSseLifecycle('hang_guard', { correlationId, frames });
      if (typeof res.flush === 'function') res.flush();
    }
    recordSseLifecycle('terminal_done', { correlationId, frames });
  } catch (e) {
    recordSseLifecycle('disconnect', { correlationId, frames });
    const errId = maxId + 1;
    try {
      const scrubbedErr = scrubSseError({
        message: String(e?.message || e),
        status: 'failed_soft',
        failureClass: 'system_failure',
        forbiddenIdentitiesVersion: session.forbiddenIdentitiesVersion,
      });
      res.write(formatSseEvent('error', scrubbedErr, errId));
      res.write(
        formatSseEvent(
          'done',
          {
            status: 'failed_soft',
            sessionId: session.sessionId,
            afterError: true,
            sseSchemaVersion: SSE_SCHEMA_VERSION,
          },
          errId + 1,
        ),
      );
      if (typeof res.flush === 'function') res.flush();
      recordSseLifecycle('terminal_error', { correlationId });
    } catch {
      // client already gone
    }
  }
}

export default {
  formatSseEvent,
  buildProgressiveEvents,
  writeProgressiveSse,
  scrubSseError,
  SSE_RECONNECT_DOCS,
  SSE_SCHEMA_VERSION,
  SSE_EVENT_ALLOW_SET,
  SSE_LIFECYCLE_PHASES,
};
