/**
 * Evidence graph builder — typed soft-refs only for coalesce attach.
 * URL-alone → UNKNOWN on finding+evidence+facet. No same-entity edges.
 * Provenance mandatory on every edge (planId/familyId/evidenceIds).
 * Cite: SoT 07-EVIDENCE-GRAPH · UNKNOWN-NORMATIVE · ACC-EMIT-SURFACE-MATRIX
 */

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

  // Drop orphan edges (endpoints not in nodes) — evidence supports may reference evidence nodes
  for (const e of evidence.slice(0, 128)) {
    if (!nodeIds.has(e.id)) {
      addNode({
        id: e.id,
        kind: 'evidence',
        planId: e.planId || planId || undefined,
      });
    }
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
    .filter((n) => n.id);
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

export default {
  GRAPH_RELATIONSHIPS,
  FORBIDDEN_GRAPH_RELATIONSHIPS,
  clampGraphRelationship,
  urlAloneCeiling,
  validateEdgeProvenance,
  buildEvidenceGraph,
  scrubGraphForEmit,
};
