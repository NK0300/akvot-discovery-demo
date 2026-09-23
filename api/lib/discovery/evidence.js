/**
 * Evidence engine — first-class Discovery product capability (Checkpoint C).
 * Provenance · strength · independence · contradiction · grouping · dedup · aging · audit.
 * Explainability: «why did I get this?» — provenance chain only; NEVER identity claims.
 *
 * LOCKS: EVIDENCE≠INFERENCE · CANDIDATE≠FACT · UNKNOWN≠FALSE · URL≠IDENTITY · Acc scrub.
 * Cite: 04-EVIDENCE-CONTRACT · 07-EVIDENCE-GRAPH · ACC-EMIT-SURFACE-MATRIX
 *
 * Integrates with store.js (fingerprint/normalize/contradictions) — does not replace B0 path.
 */
import {
  evidenceFingerprint,
  canonicalizeUrl,
  hostFamily,
  detectContradictions,
  explainRanking,
} from './store.js';
import { familyIdForProvider, independenceTag, areFamiliesIndependent } from './sourceFamily.js';
import { isForbiddenQid, valueHasForbidden } from '../forbiddenIdentities.js';

/** @type {readonly string[]} */
export const EVIDENCE_STRENGTHS = Object.freeze([
  'strong',
  'moderate',
  'weak',
  'metadata_only',
]);

/** Epistemic state — CANDIDATE ≠ FACT (never collapse). */
export const EPISTEMIC_STATES = Object.freeze(['candidate', 'corroborated_candidate', 'fact']);

/** Aging bands (observation freshness — not identity confidence). */
export const AGING_BANDS = Object.freeze(['fresh', 'recent', 'stale', 'unknown']);

export const EVIDENCE_ENGINE_VERSION = '2026-09-23.evidence-acc1';

/**
 * Acc bait probe — SoT denylist (never hardcode a single QID here).
 * @param {unknown} v
 * @returns {boolean}
 */
function hasForbiddenBait(v) {
  if (v == null) return false;
  return valueHasForbidden(v) || isForbiddenQid(v);
}

/**
 * Scrub contradiction row for explainWhy / enrich surfaces.
 * Prefer drop (UNKNOWN) over leaking forbidden identity tokens.
 * @param {object} c
 * @returns {object|null}
 */
function scrubContradictionForWhy(c) {
  if (!c || typeof c !== 'object') return null;
  for (const key of ['title', 'note', 'type', 'kind', 'reason', 'summary']) {
    if (c[key] != null && hasForbiddenBait(c[key])) return null;
  }
  const domains = (Array.isArray(c.domains) ? c.domains : []).filter((d) => !hasForbiddenBait(d));
  const findingIds = (Array.isArray(c.findingIds) ? c.findingIds : [])
    .map((id) => String(id))
    .filter((id) => !hasForbiddenBait(id));
  if (!findingIds.length) return null;
  return {
    type: c.type,
    domains,
    findingIds,
    note: c.note,
  };
}

/**
 * Scrub corroboration edge for explainWhy — coerce identity-ish rel → unknown.
 * @param {object} e
 * @returns {object|null}
 */
function scrubCorroborationForWhy(e) {
  if (!e || typeof e !== 'object') return null;
  if (hasForbiddenBait(e.note) || hasForbiddenBait(e.relationship)) return null;
  const findingIds = (Array.isArray(e.findingIds) ? e.findingIds : [])
    .map((id) => String(id))
    .filter((id) => !hasForbiddenBait(id));
  if (!findingIds.length) return null;
  const coalesceKeys = (Array.isArray(e.coalesceKeys) ? e.coalesceKeys : []).filter(
    (k) => !hasForbiddenBait(k),
  );
  let relationship = e.relationship || 'unknown';
  const rel = String(relationship).toLowerCase().replace(/_/g, '-');
  if (rel === 'same-entity' || rel === 'same_entity') {
    relationship = 'unknown'; // prefer UNKNOWN over wrong identity
  }
  return {
    relationship,
    coalesceKeys,
    families: e.families,
    mode: e.mode,
    note: e.note || 'INFORMATION≠IDENTITY',
  };
}

/**
 * Map provider → familyId (best-effort; B0 providers always resolve).
 * @param {string} providerId
 */
export function resolveFamilyId(providerId) {
  return familyIdForProvider(providerId) || String(providerId || 'unknown');
}

/**
 * Evidence strength enum — NOT identity confidence.
 * @param {object} evidence
 * @param {object} [finding]
 * @returns {'strong'|'moderate'|'weak'|'metadata_only'}
 */
export function classifyEvidenceStrength(evidence, finding = null) {
  if (!evidence || typeof evidence !== 'object') return 'weak';
  const hf = evidence.hostFamily || hostFamily(evidence.domain || evidence.provenanceUrl || '');
  if (hf === 'web_origin' || evidence.providerId === 'web_origin') {
    return 'metadata_only'; // C1 ceiling — never upgrades identity
  }
  const typedRefs = [
    ...(finding?.entityRefs || []),
    ...(evidence.typedRefs || []),
  ].filter((r) => /^(viaf|qid|ol|wd):/i.test(String(r)) || /^Q\d+$/i.test(String(r)));
  const quoteLen = String(evidence.quote || evidence.summary || '').trim().length;
  const hasUrl = !!(evidence.provenanceUrl || evidence.url);
  if (typedRefs.length && quoteLen >= 40 && hasUrl) return 'strong';
  if (typedRefs.length && hasUrl) return 'moderate';
  if (hasUrl && quoteLen >= 20) return 'moderate';
  if (hasUrl) return 'weak';
  return 'weak';
}

/**
 * Aging band from retrievedAt / observedAt.
 * @param {object} evidence
 * @param {number} [now]
 */
export function classifyEvidenceAging(evidence, now = Date.now()) {
  const raw = evidence?.retrievedAt || evidence?.observedAt || evidence?.createdAt;
  if (!raw) return { band: 'unknown', ageMs: null, retrievedAt: null };
  const t = Date.parse(String(raw));
  if (!Number.isFinite(t)) return { band: 'unknown', ageMs: null, retrievedAt: String(raw) };
  const ageMs = Math.max(0, now - t);
  const DAY = 86_400_000;
  let band = 'stale';
  if (ageMs < DAY) band = 'fresh';
  else if (ageMs < 30 * DAY) band = 'recent';
  else band = 'stale';
  return { band, ageMs, retrievedAt: new Date(t).toISOString() };
}

/**
 * Source independence descriptor for an evidence row.
 * @param {object} evidence
 * @param {object[]} [siblingEvidence]
 */
export function describeSourceIndependence(evidence, siblingEvidence = []) {
  const providerId = String(evidence?.providerId || '');
  const familyId = evidence?.familyId || resolveFamilyId(providerId);
  const hf = evidence?.hostFamily || hostFamily(evidence?.domain || evidence?.provenanceUrl || '');
  const tag = independenceTag(familyId) || hf || 'unknown';
  const siblings = (siblingEvidence || []).filter((e) => e && e.id !== evidence?.id);
  const independentOf = [];
  const dependentWith = [];
  for (const s of siblings) {
    const sFam = s.familyId || resolveFamilyId(s.providerId);
    const sHf = s.hostFamily || hostFamily(s.domain || s.provenanceUrl || '');
    if (areFamiliesIndependent(familyId, sFam) && hf !== sHf) {
      independentOf.push(s.id);
    } else if (hf === sHf || familyId === sFam) {
      dependentWith.push(s.id);
    }
  }
  return {
    providerId,
    familyId,
    hostFamily: hf,
    independenceTag: tag,
    independentOf: independentOf.slice(0, 32),
    dependentWith: dependentWith.slice(0, 32),
    independentPeerCount: independentOf.length,
  };
}

/**
 * Build mandatory provenance block (Acc-scrub signalSummary).
 * @param {object} evidence
 * @param {object} [ctx]
 */
export function buildEvidenceProvenance(evidence, ctx = {}) {
  const providerId = String(evidence?.providerId || ctx.providerId || '');
  const familyId = evidence?.familyId || ctx.familyId || resolveFamilyId(providerId);
  let signal = String(
    evidence?.signalSummary ||
      evidence?.quote ||
      evidence?.summary ||
      ctx.signalSummary ||
      '',
  ).slice(0, 240);
  if (hasForbiddenBait(signal)) {
    signal = signal.replace(/\bQ1701775\b/gi, '[REDACTED_QID]');
  }
  const extractionMethod =
    evidence?.extractionMethod ||
    ctx.extractionMethod ||
    (providerId === 'web_origin'
      ? 'origin_metadata'
      : providerId === 'viaf'
        ? 'registry_lookup'
        : providerId
          ? 'api_search'
          : 'unknown');
  return {
    planId: evidence?.planId || ctx.planId || null,
    intentId: evidence?.intentId || ctx.intentId || null,
    familyId,
    providerId: providerId || null,
    extractionMethod,
    signalSummary: signal || undefined,
    createdAt: evidence?.createdAt || evidence?.retrievedAt || ctx.createdAt || new Date().toISOString(),
  };
}

/**
 * Epistemic state on evidence/finding — never auto-upgrade to fact.
 * @param {object} row
 * @param {{ corroborated?: boolean }} [opts]
 */
export function epistemicStateFor(row, opts = {}) {
  const existing = String(row?.epistemicState || row?.claimState || '').toLowerCase();
  if (existing === 'fact') {
    // Defense: Discovery layer must not emit FACT — demote to candidate
    return 'candidate';
  }
  if (opts.corroborated || existing === 'corroborated_candidate') return 'corroborated_candidate';
  return 'candidate';
}

/**
 * Enrich a single evidence row (additive fields).
 * @param {object} evidence
 * @param {{ finding?: object, siblings?: object[], planId?: string, intentId?: string, now?: number }} [ctx]
 */
export function enrichEvidenceRow(evidence, ctx = {}) {
  if (!evidence || typeof evidence !== 'object') return evidence;
  const finding = ctx.finding || null;
  const siblings = ctx.siblings || [];
  const provenance = buildEvidenceProvenance(evidence, ctx);
  const strength = classifyEvidenceStrength(evidence, finding);
  const aging = classifyEvidenceAging(evidence, ctx.now);
  const independence = describeSourceIndependence(
    { ...evidence, familyId: provenance.familyId },
    siblings,
  );
  const fingerprint =
    evidence.fingerprint ||
    evidence._fingerprint ||
    evidenceFingerprint(
      evidence.provenanceUrl || evidence.url || '',
      evidence.quote,
      evidence.providerId,
    );
  const epistemicState = epistemicStateFor(evidence, {
    corroborated: (independence.independentPeerCount || 0) >= 1 && strength !== 'metadata_only',
  });

  const audit = {
    engineVersion: EVIDENCE_ENGINE_VERSION,
    enrichedAt: new Date().toISOString(),
    ops: [
      'provenance',
      'strength',
      'aging',
      'independence',
      'epistemic_candidate',
    ],
    ...(evidence.audit && typeof evidence.audit === 'object' ? { prior: evidence.audit } : {}),
  };

  const out = {
    ...evidence,
    provenanceUrl: evidence.provenanceUrl
      ? canonicalizeUrl(evidence.provenanceUrl)
      : evidence.provenanceUrl,
    fingerprint,
    familyId: provenance.familyId,
    hostFamily: independence.hostFamily,
    evidenceStrength: strength,
    agingBand: aging.band,
    ageMs: aging.ageMs,
    retrievedAt: aging.retrievedAt || evidence.retrievedAt || provenance.createdAt,
    observedAt: evidence.observedAt || aging.retrievedAt || evidence.retrievedAt,
    provenance,
    source: {
      providerId: independence.providerId,
      familyId: independence.familyId,
      hostFamily: independence.hostFamily,
      independenceTag: independence.independenceTag,
      safetyClass:
        independence.hostFamily === 'web_origin'
          ? 'public_metadata'
          : independence.providerId
            ? 'trusted_api'
            : 'untrusted_web',
    },
    independence,
    epistemicState, // candidate | corroborated_candidate — NEVER fact
    claimKind: 'evidence', // EVIDENCE≠INFERENCE
    inference: false,
    identityClaim: false,
    audit,
  };
  // Acc: drop bait fields rather than emit
  if (hasForbiddenBait(out.quote)) out.quote = undefined;
  if (hasForbiddenBait(out.summary)) out.summary = undefined;
  return out;
}

/**
 * Soft-group evidence by hostFamily / domain / fingerprint (for UX grouping).
 * Does NOT merge identities.
 * @param {object[]} evidenceList
 */
export function groupEvidence(evidenceList) {
  /** @type {Map<string, object>} */
  const groups = new Map();
  for (const e of evidenceList || []) {
    if (!e) continue;
    const hf = e.hostFamily || hostFamily(e.domain || e.provenanceUrl || '');
    const key = `hf:${hf}`;
    if (!groups.has(key)) {
      groups.set(key, {
        groupId: key,
        hostFamily: hf,
        evidenceIds: [],
        providerIds: new Set(),
        domains: new Set(),
      });
    }
    const g = groups.get(key);
    g.evidenceIds.push(e.id);
    if (e.providerId) g.providerIds.add(e.providerId);
    if (e.domain) g.domains.add(e.domain);
  }
  return [...groups.values()].map((g) => ({
    groupId: g.groupId,
    hostFamily: g.hostFamily,
    evidenceIds: g.evidenceIds,
    providerIds: [...g.providerIds],
    domains: [...g.domains],
    note: 'INFORMATION≠IDENTITY: grouping is source-family UX only',
  }));
}

/**
 * Dedup report — fingerprint collisions vs distinct URLs (honesty).
 * @param {object[]} evidenceList
 */
export function dedupEvidenceReport(evidenceList) {
  const byFp = new Map();
  const duplicates = [];
  for (const e of evidenceList || []) {
    if (!e?.id) continue;
    const fp =
      e.fingerprint ||
      evidenceFingerprint(e.provenanceUrl || e.url || '', e.quote, e.providerId);
    if (!byFp.has(fp)) {
      byFp.set(fp, e.id);
      continue;
    }
    duplicates.push({
      fingerprint: fp,
      keepId: byFp.get(fp),
      dropId: e.id,
      note: 'same fingerprint — content-addressed duplicate',
    });
  }
  return {
    uniqueCount: byFp.size,
    inputCount: (evidenceList || []).length,
    duplicates,
  };
}

/**
 * Explain «why did I get this finding / evidence?» — provenance chain only.
 * @param {{ findingId?: string, evidenceId?: string }} query
 * @param {{ findings?: object[], evidence?: object[], contradictions?: object[], corroborationEdges?: object[], planId?: string, queryPlan?: object }} session
 */
export function explainWhy(query = {}, session = {}) {
  const findings = session.findings || [];
  const evidence = session.evidence || [];
  const evidenceById = new Map(evidence.map((e) => [e.id, e]));
  const finding =
    (query.findingId && findings.find((f) => f.id === query.findingId)) ||
    (query.evidenceId &&
      findings.find((f) => (f.evidenceIds || []).includes(query.evidenceId))) ||
    null;
  const focusEvidence =
    (query.evidenceId && evidenceById.get(query.evidenceId)) ||
    (finding && (finding.evidenceIds || []).map((id) => evidenceById.get(id)).filter(Boolean)) ||
    [];

  const evList = Array.isArray(focusEvidence) ? focusEvidence : focusEvidence ? [focusEvidence] : [];

  const chain = evList.map((e) => {
    const enriched = e.provenance ? e : enrichEvidenceRow(e, { finding, siblings: evidence });
    return {
      evidenceId: enriched.id,
      provenanceUrl: enriched.provenanceUrl || enriched.url,
      providerId: enriched.providerId || enriched.source?.providerId,
      familyId: enriched.familyId || enriched.provenance?.familyId,
      hostFamily: enriched.hostFamily || enriched.source?.hostFamily,
      extractionMethod: enriched.provenance?.extractionMethod,
      evidenceStrength: enriched.evidenceStrength || classifyEvidenceStrength(enriched, finding),
      agingBand: enriched.agingBand || classifyEvidenceAging(enriched).band,
      epistemicState: enriched.epistemicState || 'candidate',
      planId: enriched.provenance?.planId || session.planId || session.queryPlan?.planId || null,
      signalSummary: hasForbiddenBait(enriched.provenance?.signalSummary)
        ? undefined
        : enriched.provenance?.signalSummary,
    };
  });

  const ranking = finding
    ? explainRanking(finding, (id) => evidenceById.get(id))
    : null;

  const relatedContradictions = (session.contradictions || []).filter((c) => {
    if (!finding) return false;
    return (c.findingIds || []).includes(finding.id);
  });

  return {
    question: 'why_did_i_get_this',
    findingId: finding?.id || null,
    evidenceId: query.evidenceId || null,
    // Explicit non-claims
    identityClaim: false,
    inferenceClaim: false,
    epistemicCeiling: 'candidate', // CANDIDATE≠FACT
    discoveryScore: ranking?.discoveryScore ?? null,
    identityScore: null, // NEVER
    rationale: ranking?.rationale || 'provenance chain only — discovery≠identity',
    factors: ranking?.factors || null,
    provenanceChain: chain,
    contradictions: relatedContradictions
      .map((c) => scrubContradictionForWhy(c))
      .filter(Boolean),
    corroboration: (session.corroborationEdges || [])
      .filter((e) => finding && (e.findingIds || []).includes(finding.id))
      .map((e) => scrubCorroborationForWhy(e))
      .filter(Boolean),
    engineVersion: EVIDENCE_ENGINE_VERSION,
  };
}

/**
 * Enrich full session evidence/findings additively. Safe on B0 (flag-off) path.
 * Mutates session in place; returns session.
 * @param {object} session
 */
export function enrichSessionEvidence(session) {
  if (!session || typeof session !== 'object') return session;
  const findings = Array.isArray(session.findings) ? session.findings : [];
  const evidenceIn = Array.isArray(session.evidence) ? session.evidence : [];
  const planId = session.planId || session.queryPlan?.planId || null;

  const findingByEv = new Map();
  for (const f of findings) {
    for (const eid of f.evidenceIds || []) {
      if (!findingByEv.has(eid)) findingByEv.set(eid, f);
    }
  }

  const enrichedEvidence = evidenceIn.map((e) =>
    enrichEvidenceRow(e, {
      finding: findingByEv.get(e.id),
      siblings: evidenceIn,
      planId,
    }),
  );

  const evidenceById = new Map(enrichedEvidence.map((e) => [e.id, e]));

  const enrichedFindings = findings.map((f) => {
    const evs = (f.evidenceIds || []).map((id) => evidenceById.get(id)).filter(Boolean);
    const strengths = evs.map((e) => e.evidenceStrength);
    const best =
      strengths.includes('strong')
        ? 'strong'
        : strengths.includes('moderate')
          ? 'moderate'
          : strengths.includes('metadata_only') && strengths.every((s) => s === 'metadata_only')
            ? 'metadata_only'
            : strengths.includes('weak')
              ? 'weak'
              : undefined;
    const hostFamilies = new Set(evs.map((e) => e.hostFamily).filter(Boolean));
    const explanation = explainWhy({ findingId: f.id }, {
      findings: [f],
      evidence: enrichedEvidence,
      contradictions: session.contradictions,
      corroborationEdges: session.corroborationEdges,
      planId,
      queryPlan: session.queryPlan,
    });
    return {
      ...f,
      epistemicState: epistemicStateFor(f, {
        corroborated: hostFamilies.size >= 2,
      }),
      claimKind: 'finding_candidate',
      identityClaim: false,
      evidenceStrengthBest: best,
      evidenceHostFamilies: [...hostFamilies],
      why: {
        discoveryScore: explanation.discoveryScore,
        identityScore: null,
        rationale: explanation.rationale,
        provenanceCount: explanation.provenanceChain.length,
        engineVersion: EVIDENCE_ENGINE_VERSION,
      },
    };
  });

  // Recompute contradictions if missing (idempotent)
  if (!Array.isArray(session.contradictions) || !session.contradictions.length) {
    session.contradictions = detectContradictions(enrichedFindings, evidenceById);
  }

  session.evidence = enrichedEvidence;
  session.findings = enrichedFindings;
  session.evidenceGroups = groupEvidence(enrichedEvidence);
  session.evidenceDedup = dedupEvidenceReport(enrichedEvidence);
  session.evidenceEngineVersion = EVIDENCE_ENGINE_VERSION;
  return session;
}

export default {
  EVIDENCE_STRENGTHS,
  EPISTEMIC_STATES,
  AGING_BANDS,
  EVIDENCE_ENGINE_VERSION,
  resolveFamilyId,
  classifyEvidenceStrength,
  classifyEvidenceAging,
  describeSourceIndependence,
  buildEvidenceProvenance,
  epistemicStateFor,
  enrichEvidenceRow,
  groupEvidence,
  dedupEvidenceReport,
  explainWhy,
  enrichSessionEvidence,
};
