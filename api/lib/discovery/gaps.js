/**
 * Unknown / Gaps emission — honest partial discovery surface.
 * UNKNOWN ≠ FALSE · empty ≠ license to fanout · budget stop ≠ error-as-contradiction.
 * Cite: UNKNOWN-NORMATIVE · BUDGET-FANOUT · SoT 10
 */

/** @typedef {{ code: string, severity: 'info'|'warn', familyId?: string, providerId?: string, message: string, relatedIntentId?: string }} DiscoveryGap */

export const GAP_CODES = Object.freeze([
  'family_empty',
  'family_unsupported',
  'family_skipped_flag',
  'family_timeout',
  'family_error',
  'family_unavailable',
  'budget_exhausted',
  'no_findings',
  'url_alone_unknown',
  'seed_ambiguous',
  'homonym_risk',
  'partial_coverage',
]);

/**
 * Build gaps[] from session journal + outcome — never invents identity claims.
 * @param {object} session
 * @returns {DiscoveryGap[]}
 */
export function buildDiscoveryGaps(session = {}) {
  /** @type {DiscoveryGap[]} */
  const gaps = [];
  const journal = session.familyJournal || session.familyJournal || [];
  const seedClass = session.queryPlan?.seedClass || session.seedClass;

  for (const j of journal) {
    const st = String(j.status || '');
    if (st === 'empty') {
      gaps.push({
        code: 'family_empty',
        severity: 'info',
        familyId: j.familyId,
        providerId: j.providerId,
        relatedIntentId: j.intentId,
        message: 'family_returned_zero_hits',
      });
    } else if (st === 'unsupported') {
      gaps.push({
        code: 'family_unsupported',
        severity: 'info',
        familyId: j.familyId,
        providerId: j.providerId,
        relatedIntentId: j.intentId,
        message: j.skipReason || j.reasons?.[0] || 'unsupported',
      });
    } else if (st === 'skipped') {
      gaps.push({
        code: 'family_skipped_flag',
        severity: 'info',
        familyId: j.familyId,
        providerId: j.providerId,
        message: j.skipReason || 'skipped',
      });
    } else if (st === 'timeout') {
      gaps.push({
        code: 'family_timeout',
        severity: 'warn',
        familyId: j.familyId,
        providerId: j.providerId,
        message: 'provider_timeout',
      });
    } else if (st === 'error') {
      gaps.push({
        code: 'family_error',
        severity: 'warn',
        familyId: j.familyId,
        providerId: j.providerId,
        message: 'provider_error_soft',
      });
    } else if (st === 'unavailable') {
      gaps.push({
        code: 'family_unavailable',
        severity: 'warn',
        familyId: j.familyId,
        providerId: j.providerId,
        message: 'provider_unavailable',
      });
    } else if (st === 'budget_exhausted') {
      gaps.push({
        code: 'budget_exhausted',
        severity: 'warn',
        familyId: j.familyId,
        providerId: j.providerId,
        message: j.skipReason || session.budgetExhaustedReason || 'budget_exhausted',
      });
    }
  }

  if (session.budgetExhaustedReason && !gaps.some((g) => g.code === 'budget_exhausted')) {
    gaps.push({
      code: 'budget_exhausted',
      severity: 'warn',
      message: String(session.budgetExhaustedReason).slice(0, 64),
    });
  }

  if (!(session.findings || []).length) {
    gaps.push({
      code: 'no_findings',
      severity: 'info',
      message: 'session_zero_findings_unknown_not_false',
    });
  }

  if (seedClass === 'url' || seedClass === 'domain') {
    gaps.push({
      code: 'url_alone_unknown',
      severity: 'info',
      message: 'url_or_domain_alone_ceiling_unknown',
    });
  }

  if (seedClass === 'ambiguous') {
    gaps.push({
      code: 'seed_ambiguous',
      severity: 'info',
      message: 'seed_class_ambiguous_tight_routing',
    });
  }

  // Homonym risk: multiple findings with distinct typed soft-refs of same family kind
  const qids = new Set();
  for (const f of session.findings || []) {
    for (const r of f.entityRefs || []) {
      const m = String(r).match(/^(?:qid:|wd-)?(Q\d+)$/i);
      if (m) qids.add(m[1].toUpperCase());
    }
  }
  if (qids.size >= 2) {
    gaps.push({
      code: 'homonym_risk',
      severity: 'info',
      message: `distinct_typed_refs:${qids.size}`,
    });
  }

  const okFamilies = new Set(
    journal.filter((j) => j.status === 'ok').map((j) => j.familyId),
  );
  const planned = new Set(
    (session.queryPlan?.sourceFamilies || journal.map((j) => j.familyId)).filter(Boolean),
  );
  if (planned.size > 0 && okFamilies.size > 0 && okFamilies.size < planned.size) {
    gaps.push({
      code: 'partial_coverage',
      severity: 'info',
      message: `families_ok:${okFamilies.size}_of_${planned.size}`,
    });
  }

  // Stable sort for determinism
  gaps.sort(
    (a, b) =>
      String(a.code).localeCompare(String(b.code)) ||
      String(a.familyId || '').localeCompare(String(b.familyId || '')),
  );
  return gaps;
}

/**
 * Acc-safe gaps for emit (no seed text, no secrets).
 * @param {DiscoveryGap[]} gaps
 */
export function scrubGapsForEmit(gaps) {
  return (gaps || []).map((g) => ({
    code: String(g.code || '').slice(0, 64),
    severity: g.severity === 'warn' ? 'warn' : 'info',
    ...(g.familyId ? { familyId: String(g.familyId).slice(0, 64) } : {}),
    ...(g.providerId ? { providerId: String(g.providerId).slice(0, 64) } : {}),
    ...(g.relatedIntentId ? { relatedIntentId: String(g.relatedIntentId).slice(0, 80) } : {}),
    message: String(g.message || '')
      .replace(/(api[_-]?key|secret|password|token|bearer\s+\S+)/gi, '[REDACTED]')
      .replace(/\bQ1701775\b/gi, '[REDACTED_QID]')
      .slice(0, 120),
  }));
}

export default { GAP_CODES, buildDiscoveryGaps, scrubGapsForEmit };
