/**
 * Relationship + candidate-state abstractions (Checkpoint E / Phase 4 start).
 * Provenance-mandatory edges · candidate ≠ fact · no graph laundering.
 *
 * LOCKS: UNKNOWN≠FALSE · URL≠IDENTITY · CANDIDATE≠FACT · A2-safe typed soft-ref only ·
 * no title-bridge revive · SAME-ENTITY never on Discovery emit wire.
 *
 * Integrates with evidenceGraph.js clamp/scrub — does not replace buildEvidenceGraph.
 * Cite: 07-EVIDENCE-GRAPH · 05-RELATIONSHIP-SEMANTICS · UNKNOWN-NORMATIVE · C1 Bound
 */
import {
  clampGraphRelationship,
  urlAloneCeiling,
  validateEdgeProvenance,
  FORBIDDEN_GRAPH_RELATIONSHIPS,
  GRAPH_RELATIONSHIPS,
} from './evidenceGraph.js';
import { isForbiddenQid, extractQid, redactForbiddenQidsInText, valueHasForbidden } from '../forbiddenIdentities.js';

export const RELATIONSHIP_MODULE_VERSION = '2026-09-22.relationship-e1';

/** Closed relationship vocabulary (emit / reasoning). */
export const RELATIONSHIP_VOCAB = Object.freeze([
  'same-source',
  'same-reference',
  'related-entity',
  'possible-match',
  'unknown',
  'contradicts',
  'supports',
  'derived-from',
]);

/** States that must NEVER appear on Discovery Preview emit wire. */
export const FORBIDDEN_EMIT_RELATIONSHIPS = Object.freeze([
  ...FORBIDDEN_GRAPH_RELATIONSHIPS,
  'SAME-ENTITY',
  'SAME_ENTITY',
  'same-entity',
]);

/** Candidate lifecycle — never auto-promote to fact in Discovery. */
export const CANDIDATE_STATES = Object.freeze([
  'unresolved',
  'candidate',
  'corroborated_candidate',
  // 'confirmed' / 'fact' intentionally absent from Discovery lane
]);

/**
 * Normalize relationship token.
 * @param {unknown} rel
 */

/**
 * Acc: forbidden identity on graph endpoint / label / signal?
 * @param {unknown} v
 */
function hasAccForbidden(v) {
  if (v == null) return false;
  if (isForbiddenQid(v)) return true;
  const q = extractQid(v);
  if (q && isForbiddenQid(q)) return true;
  // deep token scan for bait in free text
  const matches = String(v).match(/\bQ\d+\b/gi) || [];
  return matches.some((tok) => isForbiddenQid(tok));
}

export function normalizeRelationship(rel) {
  return String(rel || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');
}

/**
 * No graph laundering: cannot upgrade a weaker label to a stronger one without typed path.
 * Strength order (low → high): unknown < possible-match < related-entity < same-reference < same-source
 * same-entity is always forbidden on emit (clamped).
 * @param {string} fromRel
 * @param {string} toRel
 * @param {{ hasTypedSoftRef?: boolean, urlAlone?: boolean, titleBridge?: boolean }} [ctx]
 */
export function canTransitionRelationship(fromRel, toRel, ctx = {}) {
  if (ctx.urlAlone || ctx.titleBridge) {
    // C1 / A2-bound: URL-alone and title-bridge cannot authorize SAME-*
    const t = normalizeRelationship(toRel);
    if (t === 'same-entity' || t === 'same-reference' || t === 'same-source') {
      return { ok: false, reason: 'url_or_title_cannot_authorize_same', ceiling: 'unknown' };
    }
  }
  const order = {
    unknown: 0,
    'possible-match': 1,
    'related-entity': 2,
    contradicts: 2,
    supports: 2,
    'derived-from': 2,
    'same-reference': 3,
    'same-source': 4,
    'same-entity': 99, // forbidden
  };
  const a = normalizeRelationship(fromRel);
  const b = normalizeRelationship(toRel);
  if (b === 'same-entity') {
    return {
      ok: false,
      reason: 'same_entity_forbidden_on_discovery_wire',
      ceiling: ctx.hasTypedSoftRef ? 'same-reference' : 'unknown',
    };
  }
  const ia = order[a] ?? 0;
  const ib = order[b] ?? 0;
  if (ib > ia && ib >= 3 && !ctx.hasTypedSoftRef) {
    return { ok: false, reason: 'upgrade_requires_typed_soft_ref', ceiling: a || 'unknown' };
  }
  return { ok: true, reason: null, ceiling: b };
}

/**
 * Apply ceiling + clamp for emit. Never returns same-entity.
 * @param {string} rel
 * @param {object} [ctx]
 */
export function emitSafeRelationship(rel, ctx = {}) {
  if (ctx.urlAlone || ctx.hostFamily === 'web_origin') {
    const ceiling = urlAloneCeiling({
      relationship: rel,
      hostFamily: ctx.hostFamily || (ctx.urlAlone ? 'web_origin' : undefined),
      entityRefs: ctx.entityRefs || ctx.typedRefs || [],
      coalesceKeys: ctx.coalesceKeys || ctx.sharedTypedKeys || [],
      providerId: ctx.providerId,
      familyId: ctx.familyId,
    });
    if (ceiling) return ceiling;
  }
  const clamped = clampGraphRelationship(rel, {
    hasTypedSoftRef: !!ctx.hasTypedSoftRef,
  });
  if (normalizeRelationship(clamped) === 'same-entity') {
    return ctx.hasTypedSoftRef ? 'same-reference' : 'unknown';
  }
  return clamped;
}

/**
 * Candidate state for a finding/node — Discovery never emits fact/confirmed.
 * @param {object} node
 * @param {{ independentFamilies?: number, hasTypedSoftRef?: boolean }} [ctx]
 */
export function candidateStateFor(node, ctx = {}) {
  const raw = String(node?.candidateState || node?.epistemicState || '').toLowerCase();
  if (raw === 'fact' || raw === 'confirmed' || raw === 'identity') {
    return 'candidate'; // demote — CANDIDATE≠FACT
  }
  const families = ctx.independentFamilies ?? node?.evidenceHostFamilies?.length ?? 0;
  const typed =
    ctx.hasTypedSoftRef ||
    (node?.entityRefs || []).some((r) => /^(viaf|qid|ol):/i.test(String(r)));
  if (families >= 2 && typed) return 'corroborated_candidate';
  if (raw === 'corroborated_candidate') return 'corroborated_candidate';
  if (raw === 'unresolved') return 'unresolved';
  return 'candidate';
}

/**
 * Build an edge with mandatory provenance. Rejects laundering / same-entity / orphans.
 * @param {object} input
 * @returns {{ ok: true, edge: object } | { ok: false, reason: string }}
 */
export function buildProvenancedEdge(input = {}) {
  const from = input.from ?? input.source;
  const to = input.to ?? input.target;
  if (!from || !to) return { ok: false, reason: 'endpoints_missing' };

  const hasTypedSoftRef = !!(
    input.hasTypedSoftRef ||
    (input.sharedTypedKeys || input.coalesceKeys || input.typedRefs || []).some((k) =>
      /^(viaf|qid|ol):/i.test(String(k)),
    )
  );
  const urlAlone = input.urlAlone === true || input.hostFamily === 'web_origin';
  const titleBridge = input.titleBridge === true;

  const transition = canTransitionRelationship(input.fromRelationship || 'unknown', input.relationship || 'unknown', {
    hasTypedSoftRef,
    urlAlone,
    titleBridge,
  });
  const relationship = emitSafeRelationship(transition.ok ? input.relationship : transition.ceiling, {
    hasTypedSoftRef,
    urlAlone,
    hostFamily: input.hostFamily,
    entityRefs: input.entityRefs,
    coalesceKeys: input.coalesceKeys || input.sharedTypedKeys,
    providerId: input.providerId,
    familyId: input.familyId,
  });

  if (normalizeRelationship(relationship) === 'same-entity') {
    return { ok: false, reason: 'same_entity_blocked' };
  }

  const provenance = {
    planId: input.planId || input.provenance?.planId || null,
    intentId: input.intentId || input.provenance?.intentId || null,
    familyId: input.familyId || input.provenance?.familyId || null,
    providerId: input.providerId || input.provenance?.providerId || null,
    evidenceIds: [...(input.evidenceIds || input.provenance?.evidenceIds || [])].slice(0, 32),
    softRefKeys: [...(input.sharedTypedKeys || input.coalesceKeys || input.provenance?.softRefKeys || [])]
      .filter((k) => /^(viaf|qid|ol):/i.test(String(k)))
      .slice(0, 16),
    signalSummary: redactForbiddenQidsInText(String(input.signalSummary || input.provenance?.signalSummary || '')).slice(0, 120),
    createdAt: input.createdAt || input.provenance?.createdAt || new Date().toISOString(),
  };

  const edge = {
    id: input.id || `edge-${from}-${to}-${relationship}`,
    from,
    to,
    relationship,
    kind: input.kind || relationship,
    candidateState: candidateStateFor(
      { entityRefs: provenance.softRefKeys },
      { hasTypedSoftRef, independentFamilies: provenance.softRefKeys.length ? 2 : 0 },
    ),
    provenance,
    planId: provenance.planId,
    familyId: provenance.familyId,
    signalSummary: provenance.signalSummary || undefined,
    moduleVersion: RELATIONSHIP_MODULE_VERSION,
  };

  const v = validateEdgeProvenance(edge, { requirePlanId: false, strict: !!input.strict });
  if (!v.ok && input.strict) return { ok: false, reason: v.reason || 'provenance_invalid' };

  // Acc: forbidden QIDs on endpoints / signal / soft-ref keys
  if (
    hasAccForbidden(from) ||
    hasAccForbidden(to) ||
    hasAccForbidden(provenance.signalSummary) ||
    (provenance.softRefKeys || []).some((k) => hasAccForbidden(k)) ||
    (provenance.evidenceIds || []).some((k) => hasAccForbidden(k))
  ) {
    return { ok: false, reason: 'acc_forbidden_endpoint' };
  }

  return { ok: true, edge };
}

/**
 * Strip / clamp graph for honesty: no laundering, no same-entity, Acc endpoints.
 * @param {object} graph
 */
export function sanitizeRelationshipGraph(graph) {
  if (!graph || typeof graph !== 'object') return { nodes: [], edges: [], meta: { sameEntityEmitted: 0 } };
  const nodes = (graph.nodes || [])
    .filter((n) => n?.id && !hasAccForbidden(n.id) && !hasAccForbidden(n.qid) && !hasAccForbidden(n.label) && !hasAccForbidden(n.signalSummary))
    .map((n) => ({
      ...n,
      relationship: n.relationship
        ? emitSafeRelationship(n.relationship, {
            hasTypedSoftRef: (n.entityRefs || []).some((r) => /^(viaf|qid|ol):/i.test(String(r))),
            hostFamily: n.hostFamily,
            entityRefs: n.entityRefs,
            urlAlone: n.hostFamily === 'web_origin',
          })
        : undefined,
      candidateState: candidateStateFor(n),
    }));
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = [];
  for (const raw of graph.edges || []) {
    const built = buildProvenancedEdge({
      ...raw,
      from: raw.from ?? raw.source,
      to: raw.to ?? raw.target,
      strict: false,
    });
    if (!built.ok) continue;
    if (!nodeIds.has(built.edge.from) || !nodeIds.has(built.edge.to)) continue;
    edges.push(built.edge);
  }
  return {
    nodes,
    edges,
    meta: {
      ...(graph.meta || {}),
      sameEntityEmitted: 0,
      relationshipModuleVersion: RELATIONSHIP_MODULE_VERSION,
    },
  };
}


/**
 * Edge-click explainability: why does this relationship exist?
 * Provenance + evidence ids only — NEVER identity claims / FACT.
 * @param {object} edge
 * @param {{ findings?: object[], evidence?: object[], planId?: string }} [session]
 */
export function explainEdge(edge, session = {}) {
  if (!edge || typeof edge !== 'object') {
    return {
      question: 'why_this_relationship',
      ok: false,
      reason: 'edge_missing',
      identityClaim: false,
      epistemicCeiling: 'candidate',
    };
  }
  const from = edge.from ?? edge.source;
  const to = edge.to ?? edge.target;
  if (hasAccForbidden(from) || hasAccForbidden(to) || hasAccForbidden(edge.signalSummary)) {
    return {
      question: 'why_this_relationship',
      ok: false,
      reason: 'acc_forbidden',
      identityClaim: false,
      epistemicCeiling: 'candidate',
    };
  }
  const prov = edge.provenance && typeof edge.provenance === 'object' ? edge.provenance : {};
  const evidenceIds = [
    ...(edge.evidenceIds || []),
    ...(prov.evidenceIds || []),
  ].filter((id) => id && !hasAccForbidden(id));
  const evidenceById = new Map((session.evidence || []).map((e) => [e.id, e]));
  const evidenceRows = evidenceIds
    .map((id) => evidenceById.get(id))
    .filter(Boolean)
    .map((e) => ({
      evidenceId: e.id,
      providerId: e.providerId || e.source?.providerId,
      familyId: e.familyId || e.provenance?.familyId,
      provenanceUrl: e.provenanceUrl || e.url,
      evidenceStrength: e.evidenceStrength,
      epistemicState: e.epistemicState || 'candidate',
    }));
  const rel = emitSafeRelationship(edge.relationship || edge.kind || 'unknown', {
    hasTypedSoftRef: (prov.softRefKeys || edge.coalesceKeys || []).some((k) =>
      /^(viaf|qid|ol):/i.test(String(k)),
    ),
    hostFamily: edge.hostFamily,
    urlAlone: edge.urlAlone === true,
  });
  return {
    question: 'why_this_relationship',
    ok: true,
    edgeId: edge.id || null,
    from,
    to,
    relationship: rel,
    candidateState: edge.candidateState || candidateStateFor({ entityRefs: prov.softRefKeys }),
    identityClaim: false,
    inferenceClaim: false,
    epistemicCeiling: 'candidate', // CANDIDATE≠FACT
    rationale:
      rel === 'unknown'
        ? 'insufficient typed provenance — relationship ceiling UNKNOWN (not identity)'
        : `relationship=${rel} cited by evidenceIds=[${evidenceIds.join(',') || 'none'}] (discovery≠identity)`,
    provenance: {
      planId: prov.planId || edge.planId || session.planId || null,
      intentId: prov.intentId || null,
      familyId: prov.familyId || edge.familyId || null,
      providerId: prov.providerId || null,
      softRefKeys: [...(prov.softRefKeys || [])].slice(0, 16),
      signalSummary: prov.signalSummary || edge.signalSummary || undefined,
      createdAt: prov.createdAt || null,
    },
    evidenceIds,
    evidence: evidenceRows,
    moduleVersion: RELATIONSHIP_MODULE_VERSION,
  };
}


/**
 * Explain why an edge exists — provenance-only, never identity certainty.
 * @param {object} edge
 * @returns {{ why: string, relationship: string, candidateState: string, provenance: object, blocked?: string }}
 */
export function explainWhyEdge(edge) {
  if (!edge || typeof edge !== 'object') {
    return { why: 'edge_missing', relationship: 'unknown', candidateState: 'candidate', provenance: {} };
  }
  const rel = normalizeRelationship(edge.relationship || edge.kind || 'unknown');
  if (rel === 'same-entity' || FORBIDDEN_EMIT_RELATIONSHIPS.map((x) => String(x).toLowerCase().replace(/_/g, '-')).includes(rel)) {
    return {
      why: 'blocked_same_entity_or_forbidden',
      relationship: 'unknown',
      candidateState: 'candidate',
      provenance: edge.provenance || {},
      blocked: 'same_entity_forbidden',
    };
  }
  const prov = edge.provenance || {
    planId: edge.planId,
    familyId: edge.familyId,
    providerId: edge.providerId,
    evidenceIds: edge.evidenceIds,
  };
  const parts = [];
  if (prov.planId) parts.push(`plan:${prov.planId}`);
  if (prov.familyId) parts.push(`family:${prov.familyId}`);
  if (prov.providerId) parts.push(`provider:${prov.providerId}`);
  const soft = (prov.softRefKeys || []).filter((k) => /^(viaf|qid|ol):/i.test(String(k)));
  if (soft.length) parts.push(`typed_refs:${soft.length}`);
  if ((prov.evidenceIds || []).length) parts.push(`evidence:${(prov.evidenceIds || []).length}`);
  if (edge.signalSummary || prov.signalSummary) {
    parts.push(`signal:${String(edge.signalSummary || prov.signalSummary).slice(0, 80)}`);
  }
  const why = parts.length
    ? `edge_from_provenance:${parts.join('|')}`
    : 'edge_insufficient_provenance';
  return {
    why,
    relationship: rel === 'same-entity' ? 'unknown' : rel,
    candidateState: edge.candidateState || candidateStateFor(edge, {
      hasTypedSoftRef: soft.length > 0,
    }),
    provenance: {
      planId: prov.planId || null,
      familyId: prov.familyId || null,
      providerId: prov.providerId || null,
      evidenceIds: [...(prov.evidenceIds || [])].slice(0, 16),
      softRefKeys: soft.slice(0, 8),
    },
  };
}

export default {
  RELATIONSHIP_MODULE_VERSION,
  RELATIONSHIP_VOCAB,
  FORBIDDEN_EMIT_RELATIONSHIPS,
  CANDIDATE_STATES,
  GRAPH_RELATIONSHIPS,
  normalizeRelationship,
  canTransitionRelationship,
  emitSafeRelationship,
  candidateStateFor,
  buildProvenancedEdge,
  sanitizeRelationshipGraph,
  explainWhyEdge,
  explainEdge,
};
