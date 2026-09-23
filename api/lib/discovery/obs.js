/**
 * Discovery observability hooks — correlation IDs + lightweight metrics (no PII/secrets).
 * Additive SSE lifecycle counters for reconnect / terminal / disconnect.
 */
import { randomBytes } from 'crypto';
import { redactForbiddenQidsInText } from '../forbiddenIdentities.js';

/** @type {Map<string, number>} */
const counters = new Map();
/** @type {{ name: string, ms: number, ok: boolean, at: string }[]} */
const recent = [];
const RECENT_MAX = 50;

/** Keys that must never appear in discovery obs (seed / Acc / secrets). */
const OBS_DENIED_FIELD_KEYS = Object.freeze([
  'seed',
  'seedText',
  'q',
  'query',
  'url',
  'urls',
  'authorization',
  'cookie',
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'bearer',
  'raw',
  'body',
  'headers',
  // GO-IMPL-500 soft-fail/obs harden — never log these accidentally
  'hints',
  'provenanceUrl',
  'content',
  'html',
  'snippet',
  'entityRef',
  'entityRefs',
  // Acc / identity bait — never structured-log QIDs as fields
  'qid',
  'qids',
  'forbiddenQid',
  'identityClaim',
]);

/**
 * Drop denied keys from a flat fields object (defense-in-depth vs accidental seed log).
 * @param {object} fields
 */
export { OBS_DENIED_FIELD_KEYS };
/** @private exported for tests via scrubObsFields */
export function scrubObsFields(fields) {
  return stripDeniedObsFields(fields);
}

function stripDeniedObsFields(fields) {
  if (!fields || typeof fields !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    const key = String(k);
    if (OBS_DENIED_FIELD_KEYS.includes(key)) continue;
    if (/seed|secret|password|token|authorization|cookie|api[_-]?key/i.test(key)) continue;
    out[key] = v;
  }
  return out;
}


export function mintCorrelationId(prefix = 'disc') {
  return `${prefix}-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
}

/**
 * @param {string} name
 * @param {number} [delta]
 */
export function incrMetric(name, delta = 1) {
  const k = String(name || 'unknown').slice(0, 80);
  counters.set(k, (counters.get(k) || 0) + delta);
}

/** Alias used by some call sites */
export const incrMetricAlias = incrMetric;

/**
 * @param {string} name
 * @param {number} ms
 * @param {boolean} [ok]
 */
export function recordLatency(name, ms, ok = true) {
  incrMetric(`${name}.${ok ? 'ok' : 'err'}`);
  recent.push({
    name: String(name).slice(0, 80),
    ms: Math.max(0, Number(ms) || 0),
    ok: !!ok,
    at: new Date().toISOString(),
  });
  while (recent.length > RECENT_MAX) recent.shift();
}

/**
 * SSE lifecycle telemetry (no session payloads / secrets).
 * @param {'open'|'frame'|'terminal_done'|'terminal_error'|'resume'|'disconnect'|'hang_guard'} event
 * @param {{ correlationId?: string, frames?: number }} [meta]
 */
export function recordSseLifecycle(event, meta = {}) {
  incrMetric(`sse.${event}`);
  if (meta.frames != null) {
    recent.push({
      name: `sse.${event}`,
      ms: Number(meta.frames) || 0,
      ok: event !== 'terminal_error' && event !== 'disconnect',
      at: new Date().toISOString(),
    });
    while (recent.length > RECENT_MAX) recent.shift();
  }
  return {
    event: `sse.${event}`,
    correlationId: meta.correlationId ? String(meta.correlationId).slice(0, 64) : undefined,
  };
}

export function getMetricsSnapshot() {
  return {
    counters: Object.fromEntries(counters),
    recent: recent.slice(-20),
  };
}

/** Test helper */
export function resetMetrics() {
  counters.clear();
  recent.length = 0;
}


/** Compat aliases for concurrent MEGA naming */

export default {
  mintCorrelationId,
  incrMetric,
  recordLatency,
  recordSseLifecycle,
  getMetricsSnapshot,
  resetMetrics,
  structuredLog,
  recordBudgetUsage,
  buildStructuredLog,
  logDiscoveryEvent,
};

/**
 * Structured log line — Acc-safe (no seed text, no tokens, no Acc QIDs).
 * @param {string} level
 * @param {string} event
 * @param {object} [fields]
 */
export function structuredLog(level, event, fields = {}) {
  const f = stripDeniedObsFields(fields);
  const safe = {
    ts: new Date().toISOString(),
    level: String(level || 'info').slice(0, 16),
    event: String(event || 'discovery').slice(0, 80),
  };
  if (f.correlationId) safe.correlationId = String(f.correlationId).slice(0, 64);
  if (f.sessionIdPrefix) safe.sessionIdPrefix = String(f.sessionIdPrefix).slice(0, 12);
  if (f.planId) safe.planId = String(f.planId).slice(0, 40);
  if (f.familyId) safe.familyId = String(f.familyId).slice(0, 40);
  if (f.providerId) safe.providerId = String(f.providerId).slice(0, 40);
  if (f.status) safe.status = String(f.status).slice(0, 40);
  if (f.budgetExhaustedReason) {
    // Acc-scrub via SoT (no hardcoded QID — residual denylist grow-safe)
    safe.budgetExhaustedReason = redactForbiddenQidsInText(
      String(f.budgetExhaustedReason),
    ).slice(0, 64);
  }
  if (f.budgetRemaining && typeof f.budgetRemaining === 'object') {
    safe.budgetRemaining = {
      familyCalls: f.budgetRemaining.familyCalls,
      requests: f.budgetRemaining.requests,
      wallMs: f.budgetRemaining.wallMs,
    };
  }
  if (typeof f.ms === 'number') safe.ms = Math.max(0, f.ms);
  // Never log seed / URLs / credentials / Acc QIDs — allowlist only above
  try {
    console.info('[discovery]', JSON.stringify(safe));
  } catch {
    /* ignore */
  }
  incrMetric(`log.${safe.event}`);
  return safe;
}

/**
 * Record budget snapshot into metrics + optional structured log.
 * @param {object} snap
 * @param {{ correlationId?: string, planId?: string }} [meta]
 */
export function recordBudgetUsage(snap, meta = {}) {
  if (!snap) return;
  const rem = snap.remaining || {};
  incrMetric('budget.snapshot');
  if (snap.availability === 'BUDGET_EXHAUSTED' || snap.budgetExhaustedReason) {
    incrMetric('budget.exhausted');
  }
  return structuredLog('info', 'budget.usage', {
    correlationId: meta.correlationId,
    planId: meta.planId,
    budgetExhaustedReason: snap.budgetExhaustedReason || undefined,
    budgetRemaining: rem,
  });
}

/**
 * Rich structured obs record (Checkpoint F) — timings/budget/counts/state.
 * Acc-safe: redacts forbidden QIDs / credentials from message fields.
 * @param {object} input
 */
export function buildStructuredLog(input = {}) {
  input = stripDeniedObsFields(input);
  const redact = (v) => {
    if (v == null) return undefined;
    let s = String(v).slice(0, 240);
    s = s.replace(/(api[_-]?key|secret|password|token|bearer\s+\S+)/gi, '[REDACTED]');
    s = redactForbiddenQidsInText(s);
    for (const tok of ['SAME-ENTITY', 'SAME_ENTITY', 'IDENTITY_COMMIT']) {
      if (s.includes(tok)) s = s.split(tok).join('[BLOCKED]');
    }
    return s;
  };
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const rec = {
    ts: new Date().toISOString(),
    level: String(input.level || 'info').slice(0, 16),
    event: String(input.event || 'discovery').slice(0, 80),
    requestId: input.requestId ? String(input.requestId).slice(0, 64) : undefined,
    correlationId: input.correlationId ? String(input.correlationId).slice(0, 64) : undefined,
    queryId: input.queryId ? String(input.queryId).slice(0, 64) : undefined,
    sessionId: input.sessionId ? String(input.sessionId).slice(0, 64) : undefined,
    planId: input.planId ? String(input.planId).slice(0, 64) : undefined,
    familyId: input.familyId ? String(input.familyId).slice(0, 64) : undefined,
    providerId: input.providerId ? String(input.providerId).slice(0, 64) : undefined,
    stage: input.stage ? String(input.stage).slice(0, 32) : undefined,
    status: input.status ? String(input.status).slice(0, 32) : undefined,
    stateTransition: input.stateTransition
      ? {
          from: String(input.stateTransition.from || '').slice(0, 32),
          to: String(input.stateTransition.to || '').slice(0, 32),
        }
      : undefined,
    timings:
      input.timings && typeof input.timings === 'object'
        ? {
            totalMs: num(input.timings.totalMs),
            providerMs: num(input.timings.providerMs),
            planMs: num(input.timings.planMs),
            emitMs: num(input.timings.emitMs),
          }
        : undefined,
    budget:
      input.budget && typeof input.budget === 'object'
        ? {
            status: input.budget.status ? String(input.budget.status).slice(0, 32) : undefined,
            remainingRequests: num(input.budget.remainingRequests),
            remainingFamilyCalls: num(input.budget.remainingFamilyCalls),
            exhaustedReason: input.budget.exhaustedReason
              ? redact(input.budget.exhaustedReason).slice(0, 64)
              : undefined,
          }
        : undefined,
    counts:
      input.counts && typeof input.counts === 'object'
        ? {
            findings: num(input.counts.findings),
            evidence: num(input.counts.evidence),
            contradictions: num(input.counts.contradictions),
            graphNodes: num(input.counts.graphNodes),
            graphEdges: num(input.counts.graphEdges),
            providers: num(input.counts.providers),
          }
        : undefined,
    failureClass: input.failureClass ? redact(input.failureClass).slice(0, 64) : undefined,
    message: input.message ? redact(input.message) : undefined,
  };
  for (const k of Object.keys(rec)) {
    if (rec[k] === undefined) delete rec[k];
  }
  return rec;
}

/** @param {object} input */
export function logDiscoveryEvent(input = {}) {
  const rec = buildStructuredLog(input);
  try {
    console.info(JSON.stringify({ channel: 'discovery.obs', ...rec }));
  } catch {
    /* ignore */
  }
  incrMetric(`log.${rec.event || 'event'}`);
  return rec;
}
