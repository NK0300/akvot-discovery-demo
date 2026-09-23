/**
 * Consistent Discovery API error / empty shapes (Checkpoint G polish).
 * Acc-safe messages · no stacks · no secrets · no identity claims.
 */
import { redactSensitiveText } from './security.js';
import { FORBIDDEN_IDENTITIES_VERSION } from '../forbiddenIdentities.js';

/** Closed client-facing failure classes (≠ CONTRADICTORY / ≠ identity). */
export const API_FAILURE_CLASSES = Object.freeze([
  'validation_error',
  'rate_limited',
  'not_found',
  'method_not_allowed',
  'payload_too_large',
  'failed_soft',
  'budget_exhausted',
  'unsafe_url',
  'cancelled',
  'provider_timeout',
  'store_error',
  'internal_error',
]);

/**
 * @param {{
 *   status?: number,
 *   error?: string,
 *   failureClass?: string,
 *   correlationId?: string,
 *   retryAfterSec?: number,
 *   empty?: boolean,
 *   extras?: object,
 * }} input
 */
export function discoveryApiError(input = {}) {
  const status = Number(input.status) || 500;
  let failureClass = String(input.failureClass || '').slice(0, 64);
  if (!failureClass) {
    if (status === 400) failureClass = 'validation_error';
    else if (status === 404) failureClass = 'not_found';
    else if (status === 405) failureClass = 'method_not_allowed';
    else if (status === 413) failureClass = 'payload_too_large';
    else if (status === 429) failureClass = 'rate_limited';
    else if (status >= 500) failureClass = 'internal_error';
    else failureClass = 'failed_soft';
  }
  if (!API_FAILURE_CLASSES.includes(failureClass)) failureClass = 'failed_soft';

  const body = {
    ok: false,
    error: redactSensitiveText(input.error || failureClass, { maxLen: 200 }) || failureClass,
    failureClass,
    empty: input.empty === true,
    // Empty/partial is honest UNKNOWN — not FALSE and not CONTRADICTORY
    note: input.empty ? 'EMPTY≠FALSE' : undefined,
    correlationId: input.correlationId ? String(input.correlationId).slice(0, 64) : undefined,
    forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
  };
  if (input.retryAfterSec != null) body.retryAfterSec = Number(input.retryAfterSec) || undefined;
  if (input.extras && typeof input.extras === 'object') {
    for (const [k, v] of Object.entries(input.extras)) {
      if (k === 'ok' || k === 'error' || k === 'stack') continue;
      if (typeof v === 'string') body[k] = redactSensitiveText(v, { maxLen: 160 });
      else if (v != null && typeof v !== 'function') body[k] = v;
    }
  }
  for (const k of Object.keys(body)) {
    if (body[k] === undefined) delete body[k];
  }
  return { status, body };
}

/** Empty-but-ok discovery snapshot cue (honest empty). */
export function discoveryEmptyOk(extras = {}) {
  return {
    ok: true,
    empty: true,
    status: 'partial',
    note: 'EMPTY≠FALSE',
    failureClass: undefined,
    ...extras,
  };
}

export default { API_FAILURE_CLASSES, discoveryApiError, discoveryEmptyOk };
