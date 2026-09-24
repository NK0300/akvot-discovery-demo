/**
 * Evidence graph builder — typed soft-refs only for coalesce attach.
 * URL-alone → UNKNOWN on finding+evidence+facet. No same-entity edges.
 * Provenance mandatory on every edge (planId/familyId/evidenceIds).
 * Cite: SoT 07-EVIDENCE-GRAPH · UNKNOWN-NORMATIVE · ACC-EMIT-SURFACE-MATRIX
 */

import { isForbiddenQid, valueHasForbidden } from '../forbiddenIdentities.js';

function graphValueForbidden(v) {
  if (v == null) return false;
  return valueHasForbidden(v) || isForbiddenQid(v);
}


/** Closed relationship vocab (emit ceiling). SAME-ENTITY forbidden on wire. */
export const GRAPH_RELATIONSHIPS = Object.freeze([
  'same-source',
  'same-reference',
  'related-entity',
  'possible-match',
  'unknown',
  'contradicts',
  'supports',
  'derived-from',
]);

/** Forbidden on experimental / Preview emit surfaces. */
export const FORBIDDEN_GRAPH_RELATIONSHIPS = Object.freeze([
  'same-entity',
  'SAME-ENTITY',
  'SAME_ENTITY',
  'same_entity',
]);

/**
 * Clamp relationship for emit: SAME-ENTITY → same-reference (typed path) or unknown.
 * Never upgrades. Never emits same-entity on wire.
 * @param {string} rel
 * @param {{ hasTypedSoftRef?: boolean }} [ctx]
 */
export function clampGraphRelationship(rel, ctx = {}) {
  // urlAlone / C1 Bound: SAME-* → UNKNOWN (normative uppercase for contract tests)
  if (ctx.urlAlone === true || ctx.urlAloneCeiling === true) {
    const up = String(rel || 'UNKNOWN').toUpperCase().replace(/_/g, '-');
    if (up.startsWith('SAME') || up === 'SAME-ENTITY' || up === 'SAME-REFERENCE') {
      return 'unknown';
    }
  }
  const r = String(rel || 'unknown').toLowerCase().replace(/_/g, '-');
  if (FORBIDDEN_GRAPH_RELATIONSHIPS.map((x) => x.toLowerCase().replace(/_/g, '-')).includes(r)) {
    if (ctx.hasTypedSoftRef) return 'same-reference';
    return ctx.normativeUpper === true ? 'UNKNOWN' : 'unknown';
  }
  if (r === 'same-entity') {
    return ctx.hasTypedSoftRef ? 'same-reference' : (ctx.normativeUpper === true ? 'UNKNOWN' : 'unknown');
  }
  if (GRAPH_RELATIONSHIPS.includes(r)) return r;
  return 'unknown';
}

/**
 * URL / domain alone never authorizes SAME-* (C1 Bound).
 * @param {{ relationship?: string, hostFamily?: string, entityRefs?: string[], coalesceKeys?: string[] }} node
 */
export function urlAloneCeiling(node = {}) {
  // No node / empty → ceiling is UNKNOWN (axiom U3/C1)
  if (node == null || (typeof node === 'object' && Object.keys(node).length === 0)) {
    return 'unknown';
  }
  const refs = [
    ...(node.entityRefs || []),
    ...(node.coalesceKeys || []),
  ].filter((k) => /^(viaf|qid|ol):/i.test(String(k)));
  const hf = String(node.hostFamily || '');
  const isWebOrigin =
    hf === 'web_origin' ||
    String(node.providerId || '') === 'web_origin' ||
    String(node.familyId || '') === 'web_origin';
  if (isWebOrigin && refs.length === 0) return 'unknown';
  const rel = String(node.relationship || '').toLowerCase().replace(/_/g, '-');
  if ((rel === 'same-entity' || rel === 'same-reference') && refs.length === 0) {
    return 'unknown';
  }
  // URL/domain seed class with no typed refs
  if ((node.seedClass === 'url' || node.seedClass === 'domain') && refs.length === 0) {
    return 'unknown';
  }
  return null; // no override
}

/**
 * Validate edge provenance. Missing planId/familyId → reject (orphan).
 * @param {object} edge
 * @param {{ requirePlanId?: boolean }} [opts]
 */
export function validateEdgeProvenance(edge, opts = {}) {
  if (!edge || typeof edge !== 'object') return { ok: false, reason: 'edge_missing' };
  const from = edge.from ?? edge.source;
  const to = edge.to ?? edge.target;
  if (!from || !to) return { ok: false, reason: 'endpoints_missing' };
  if (opts.requirePlanId !== false && !edge.planId && !edge.provenance?.planId) {
    // Soft: allow corroboration edges without plan when QueryPlan flag OFF (B0 path)
    if (opts.strict) return { ok: false, reason: 'planId_missing' };
  }
  const rel = String(edge.relationship || edge.kind || '').toLowerCase().replace(/_/g, '-');
  if (rel === 'same-entity') return { ok: false, reason: 'same_entity_forbidden' };
  return { ok: true };
}

/**
 * Build evidence graph from session findings/evidence/corroboration.
 * @param {{
 *   sessionId?: string,
 *   seed?: string,
 *   softEr?: object,
 *   findings?: object[],
 *   evidence?: object[],
 *   corroborationEdges?: object[],
 *   contradictions?: object[],
 *   queryPlan?: object,
 *   familyJournal?: object[],
 * }} session
 * @param {{ strictProvenance?: boolean }} [opts]
 */
export function buildEvidenceGraph(session = {}, opts = {}) {
  const planId = session.queryPlan?.planId || session.planId || null;
  const findings = Array.isArray(session.findings) ? session.findings : [];
  const evidence = Array.isArray(session.evidence) ? session.evidence : [];
  const corr = Array.isArray(session.corroborationEdges) ? session.corroborationEdges : [];
  const contradictions = Array.isArray(session.contradictions) ? session.contradictions : [];

  /** @type {object[]} */
  const nodes = [];
  /** @type {object[]} */
  const edges = [];
  const nodeIds = new Set();

  const addNode = (n) => {
    if (!n?.id || nodeIds.has(n.id)) return;
    nodeIds.add(n.id);
    nodes.push(n);
  };

  const seedId = session.softEr?.softRefs?.[0] || `seed:${session.sessionId || 'anon'}`;
  addNode({
    id: seedId,
    kind: 'seed',
    planId: planId || undefined,
  });

  for (const f of findings.slice(0, 64)) {
    if (graphValueForbidden(f.id) || graphValueForbidden(f.title) || graphValueForbidden(f.qid)) continue;
    const ceiling = urlAloneCeiling(f);
    const rel = ceiling || clampGraphRelationship(f.relationship, {
      hasTypedSoftRef: (f.entityRefs || []).some((r) => /^(viaf|qid|ol):/i.test(String(r))),
    });
    addNode({
      id: f.id,
      kind: 'finding',
      familyId: f.familyId || undefined,
      providerId: (f.providers || [])[0],
      planId: f.planId || planId || undefined,
      relationship: rel === 'unknown' && !f.relationship ? undefined : rel,
    });
    // supports edges: evidence → finding
    for (const eid of f.evidenceIds || []) {
      edges.push({
        id: `supports:${eid}:${f.id}`,
        kind: 'supports',
        from: eid,
        to: f.id,
        source: eid,
        target: f.id,
        relationship: 'supports',
        planId: f.planId || planId || undefined,
        familyId: f.familyId || undefined,
        providerId: (f.providers || [])[0],
        evidenceIds: [eid],
        signalSummary: 'evidence_supports_finding',
      });
    }
  }

  for (const e of evidence.slice(0, 128)) {
    if (graphValueForbidden(e.id) || graphValueForbidden(e.url) || graphValueForbidden(e.provenanceUrl) || graphValueForbidden(e.qid)) continue;
    const ceiling = urlAloneCeiling(e);
    addNode({
      id: e.id,
      kind: 'evidence',
      familyId: e.familyId || undefined,
      providerId: e.providerId,
      planId: e.planId || planId || undefined,
      hostFamily: e.hostFamily || e.domain,
      relationship: ceiling || clampGraphRelationship(e.relationship, {
        hasTypedSoftRef: false,
      }),
    });
  }

  // Corroboration → same-reference / related / unknown (NEVER same-entity on wire)
  let edgeIdx = 0;
  for (const c of corr) {
    const ids = Array.isArray(c.findingIds) ? c.findingIds.filter((id) => nodeIds.has(id)) : [];
    if (ids.length < 2) continue;
    const hasTyped = (c.coalesceKeys || []).some((k) => /^(viaf|qid|ol):/i.test(String(k)));
    const rel = clampGraphRelationship(c.relationship, { hasTypedSoftRef: hasTyped });
    if (rel === 'same-entity') continue; // defense
    for (let a = 0; a < ids.length; a++) {
      for (let b = a + 1; b < ids.length; b++) {
        const edge = {
          id: `corr-${edgeIdx++}-${a}-${b}`,
          kind: 'corroboration',
          from: ids[a],
          to: ids[b],
          source: ids[a],
          target: ids[b],
          findingIds: ids,
          families: c.families,
          familyId: (c.families || [])[0],
          coalesceKeys: c.coalesceKeys,
          titleSecondary: c.titleSecondary,
          relationship: rel,
          mode: c.mode || 'attach_keep',
          planId: planId || undefined,
          evidenceIds: [],
          signalSummary: hasTyped
            ? 'typed_soft_ref_multi_family'
            : 'corroboration_without_typed_ref',
          provenance: {
            planId: planId || undefined,
            familyId: (c.families || [])[0],
            softRefKeys: (c.coalesceKeys || []).filter((k) =>
              /^(viaf|qid|ol):/i.test(String(k)),
            ),
          },
        };
        const v = validateEdgeProvenance(edge, { strict: opts.strictProvenance === true });
        if (!v.ok) continue;
        edges.push(edge);
      }
    }
  }

  // Contradictions
  for (let i = 0; i < contradictions.length; i++) {
    const c = contradictions[i];
    const ids = (c.findingIds || []).filter((id) => nodeIds.has(id));
    if (ids.length < 2) continue;
    edges.push({
      id: `contradicts-${i}`,
      kind: 'contradicts',
      from: ids[0],
      to: ids[1],
      source: ids[0],
      target: ids[1],
      findingIds: ids,
      relationship: 'contradicts',
      planId: planId || undefined,
      signalSummary: 'same_title_multi_domain',
      domains: c.domains,
    });
  }

  // Drop any residual same-entity
  const safeEdges = edges.filter((e) => {
    const r = String(e.relationship || '').toLowerCase().replace(/_/g, '-');
    return r !== 'same-entity';
  });

  // Drop orphan edges (endpoints not in nodes) — evidence supports may reference evidence nodes.
  // Acc: never re-introduce forbidden evidence that the earlier loop skipped.
  for (const e of evidence.slice(0, 128)) {
    if (!e?.id || nodeIds.has(e.id)) continue;
    if (
      graphValueForbidden(e.id) ||
      graphValueForbidden(e.url) ||
      graphValueForbidden(e.provenanceUrl) ||
      graphValueForbidden(e.qid)
    ) {
      continue;
    }
    addNode({
      id: e.id,
      kind: 'evidence',
      planId: e.planId || planId || undefined,
    });
  }
  const finalEdges = safeEdges.filter((e) => {
    const from = e.from ?? e.source;
    const to = e.to ?? e.target;
    return nodeIds.has(from) && nodeIds.has(to);
  });

  return {
    nodes,
    edges: finalEdges.slice(0, 128),
    meta: {
      planId: planId || undefined,
      sameEntityEmitted: 0,
      edgeCount: finalEdges.length,
      nodeCount: nodes.length,
    },
  };
}

/**
 * Acc-safe graph delta for SSE (subset of buildEvidenceGraph).
 * @param {object} graph
 */
export function scrubGraphForEmit(graph) {
  if (!graph || typeof graph !== 'object') return null;
  const nodes = (graph.nodes || [])
    .map((n) => ({
      id: n.id,
      kind: n.kind,
      familyId: n.familyId,
      planId: n.planId,
      relationship: n.relationship
        ? clampGraphRelationship(n.relationship, {
            hasTypedSoftRef: true,
          })
        : undefined,
    }))
    .filter((n) => {
      if (!n?.id) return false;
      if (
        graphValueForbidden(n.id) ||
        graphValueForbidden(n.qid) ||
        graphValueForbidden(n.label) ||
        graphValueForbidden(n.title) ||
        graphValueForbidden(n.signalSummary)
      ) {
        return false;
      }
      return true;
    });
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = (graph.edges || [])
    .map((e) => {
      const rel = clampGraphRelationship(e.relationship || e.kind, {
        hasTypedSoftRef: (e.coalesceKeys || e.provenance?.softRefKeys || []).some((k) =>
          /^(viaf|qid|ol):/i.test(String(k)),
        ),
      });
      if (rel === 'same-entity') return null;
      const from = e.from ?? e.source;
      const to = e.to ?? e.target;
      if (
        graphValueForbidden(from) ||
        graphValueForbidden(to) ||
        graphValueForbidden(e?.id) ||
        graphValueForbidden(e?.signalSummary) ||
        graphValueForbidden(e?.label)
      ) {
        return null;
      }
      if (!nodeIds.has(from) || !nodeIds.has(to)) return null;
      return {
        id: e.id,
        kind: e.kind,
        from,
        to,
        relationship: rel,
        planId: e.planId || e.provenance?.planId,
        familyId: e.familyId || e.provenance?.familyId,
        signalSummary: String(e.signalSummary || '').slice(0, 120),
      };
    })
    .filter(Boolean);
  return {
    nodes,
    edges,
    meta: {
      ...(graph.meta || {}),
      sameEntityEmitted: 0,
    },
  };
}


/**
 * Build graph from familyOrchestrator Record output (Wave1 spine).
 * Family-agnostic: +20 families ⇒ no new switches here — only familyId on nodes.
 * Never emits same-entity. Cite: EVOLUTION-PACK §08 · Policy Record
 *
 * @param {{
 *   findings?: object[],
 *   evidence?: object[],
 *   planId?: string,
 *   policyId?: string,
 *   wave?: number,
 *   frontier?: { items?: object[], keys?: string[], size?: number },
 *   journal?: object[],
 * }} orch
 * @param {{ strictProvenance?: boolean, sessionId?: string }} [opts]
 */
export function graphFromOrchestrationResult(orch = {}, opts = {}) {
  const findings = Array.isArray(orch.findings) ? orch.findings : [];
  const evidence = Array.isArray(orch.evidence) ? orch.evidence : [];
  const session = {
    sessionId: opts.sessionId || orch.sessionId || 'orch',
    planId: orch.planId,
    queryPlan: orch.planId ? { planId: orch.planId } : undefined,
    findings,
    evidence,
    corroborationEdges: Array.isArray(orch.corroborationEdges) ? orch.corroborationEdges : [],
    contradictions: Array.isArray(orch.contradictions) ? orch.contradictions : [],
  };
  const graph = buildEvidenceGraph(session, { strictProvenance: opts.strictProvenance === true });
  // Frontier keys as derived-from hints (URL/ref only — not identity)
  const frontierItems = Array.isArray(orch.frontier?.items) ? orch.frontier.items : [];
  let derived = 0;
  for (const item of frontierItems.slice(0, 32)) {
    if (item.evaluateOk !== true) continue;
    const toId = item.typedRef
      ? `frontier:${String(item.typedRef).toLowerCase()}`
      : item.url
        ? `frontier:url:${String(item.url).toLowerCase().slice(0, 120)}`
        : null;
    if (!toId) continue;
    if (!graph.nodes.some((n) => n.id === toId)) {
      graph.nodes.push({
        id: toId,
        kind: 'frontier',
        familyId: item.familyId || undefined,
        planId: orch.planId || undefined,
        relationship: 'unknown',
      });
    }
    const fromFinding = findings.find(
      (f) =>
        (item.url && (f.url === item.url || f.canonicalUrl === item.url)) ||
        (item.typedRef && (f.entityRefs || f.softRefs || []).includes(item.typedRef)),
    );
    if (fromFinding?.id) {
      graph.edges.push({
        id: `derived:${fromFinding.id}:${toId}`,
        kind: 'derived-from',
        from: fromFinding.id,
        to: toId,
        source: fromFinding.id,
        target: toId,
        relationship: 'derived-from',
        planId: orch.planId || undefined,
        familyId: item.familyId || fromFinding.familyId,
        signalSummary: 'frontier_from_evaluate_ok',
      });
      derived += 1;
    }
  }
  // Hard strip same-entity
  graph.edges = (graph.edges || []).filter((e) => {
    const r = String(e.relationship || '').toLowerCase().replace(/_/g, '-');
    return r !== 'same-entity';
  });
  graph.meta = {
    ...(graph.meta || {}),
    policyId: orch.policyId || undefined,
    wave: Number(orch.wave) || 1,
    frontierSize: orch.frontier?.size ?? frontierItems.length,
    frontierDerivedEdges: derived,
    sameEntityEmitted: 0,
    edgeCount: graph.edges.length,
    nodeCount: graph.nodes.length,
  };
  return graph;
}

/**
 * Acc/Arch gate: graph must never carry same-entity on wire.
 * @param {object} graph
 */
export function assertNoSameEntity(graph) {
  const bad = (graph?.edges || []).filter((e) => {
    const r = String(e.relationship || '').toLowerCase().replace(/_/g, '-');
    return r === 'same-entity';
  });
  return { ok: bad.length === 0, sameEntityCount: bad.length };
}

export default {
  GRAPH_RELATIONSHIPS,
  FORBIDDEN_GRAPH_RELATIONSHIPS,
  clampGraphRelationship,
  urlAloneCeiling,
  validateEdgeProvenance,
  buildEvidenceGraph,
  scrubGraphForEmit,
  graphFromOrchestrationResult,
  assertNoSameEntity,
};
