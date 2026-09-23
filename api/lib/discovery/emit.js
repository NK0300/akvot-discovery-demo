/**
 * Discovery emit sanitize — Acc scrub on ALL discovery surfaces.
 * Reuses forbiddenIdentities SoT (sanitizeCandidatesPayload + QID primitives).
 * Never emits dossier/faces. Entity-agnostic.
 * Covers: snapshot, SSE chunks, narrow responses.
 */
import {
  FORBIDDEN_IDENTITIES_VERSION,
  isForbiddenQid,
  extractQid,
  normalizeQid,
  sanitizeCandidatesPayload,
} from '../forbiddenIdentities.js';
import { scrubGraphForEmit, clampGraphRelationship, urlAloneCeiling } from './evidenceGraph.js';
import {
  scrubQueryPlanForEmit,
  planSummaryForSse,
} from './queryPlan.js';
import { sanitizeRelationshipGraph } from './relationship.js';
import { scrubProvidersState } from './security.js';
import { scrubGapsForEmit } from './gaps.js';

function valueHasForbidden(val) {
  if (val == null) return false;
  const matches = String(val).match(/\bQ\d+\b/gi);
  if (!matches) return false;
  return matches.some((tok) => isForbiddenQid(tok));
}

function noteStripped(strippedIds, v) {
  const q = extractQid(v) || normalizeQid(v);
  if (q && isForbiddenQid(q) && !strippedIds.includes(q)) strippedIds.push(q);
}

/**
 * @param {object} f
 * @param {string[]} strippedIds
 */
function scrubFinding(f, strippedIds) {
  if (!f || typeof f !== 'object') return null;
  const bad = (v) => {
    if (valueHasForbidden(v) || isForbiddenQid(v)) {
      noteStripped(strippedIds, v);
      return true;
    }
    return false;
  };
  if (bad(f.id) || bad(f.title) || bad(f.summary)) return null;
  // EXP-C1: web_origin typed fields on finding
  if (
    bad(f.hostname) ||
    bad(f.registrableDomain) ||
    bad(f.relationship) ||
    bad(f.hostFamily) ||
    bad(f.originalUrl) ||
    bad(f.normalizedUrl)
  ) {
    return null;
  }
  for (const ref of f.entityRefs || []) {
    if (bad(ref)) return null;
  }
  const entityRefs = (f.entityRefs || []).filter((r) => !valueHasForbidden(r) && !isForbiddenQid(r));
  const facetHints = (f.facetHints || []).filter((h) => {
    if (valueHasForbidden(h) || isForbiddenQid(h)) {
      noteStripped(strippedIds, h);
      return false;
    }
    return true;
  });
  const evidenceIds = (f.evidenceIds || []).filter((id) => {
    if (valueHasForbidden(id) || isForbiddenQid(id)) {
      noteStripped(strippedIds, id);
      return false;
    }
    return true;
  });
  const out = {
    ...f,
    entityRefs,
    facetHints,
    evidenceIds,
  };
  // PRE-GO / C1 Bound: SAME-ENTITY never on wire; URL-alone → UNKNOWN (not SAME-*)
  if (out.relationship) {
    const hasTyped = entityRefs.some((r) => /^(viaf|qid|ol|wd):/i.test(String(r)));
    const ceiling = urlAloneCeiling({
      relationship: out.relationship,
      hostFamily: out.hostFamily,
      providerId: out.providerId,
      familyId: out.familyId,
      entityRefs,
      coalesceKeys: out.coalesceKeys,
    });
    if (ceiling) {
      out.relationship = ceiling;
    } else {
      out.relationship = clampGraphRelationship(out.relationship, { hasTypedSoftRef: hasTyped });
    }
  }
  return out;
}

/**
 * @param {object} e
 * @param {string[]} strippedIds
 */
function scrubEvidence(e, strippedIds) {
  if (!e || typeof e !== 'object') return null;
  // Acc P1: provenanceUrl/url/id/quote/qid + EXP-C1 web_origin typed URL fields
  const webOriginFields = [
    e.originalUrl,
    e.normalizedUrl,
    e.origin,
    e.hostname,
    e.registrableDomain,
    e.path,
    e.sourceFinding,
    e.relationship,
    e.hostFamily,
    e.resultClass,
    e.webOriginMeta && JSON.stringify(e.webOriginMeta),
  ];
  if (
    valueHasForbidden(e.provenanceUrl) ||
    valueHasForbidden(e.url) ||
    valueHasForbidden(e.id) ||
    valueHasForbidden(e.quote) ||
    (e.qid && isForbiddenQid(e.qid)) ||
    webOriginFields.some((v) => valueHasForbidden(v))
  ) {
    noteStripped(strippedIds, e.provenanceUrl);
    noteStripped(strippedIds, e.url);
    noteStripped(strippedIds, e.id);
    noteStripped(strippedIds, e.quote);
    if (e.qid) noteStripped(strippedIds, e.qid);
    for (const v of webOriginFields) noteStripped(strippedIds, v);
    return null;
  }
  return e;
}

/**
 * @param {object} facet
 * @param {string[]} strippedIds
 */
function scrubFacet(facet, strippedIds) {
  if (!facet || typeof facet !== 'object') return facet;
  const buckets = [];
  for (const b of facet.buckets || []) {
    if (valueHasForbidden(b?.value) || isForbiddenQid(b?.value)) {
      noteStripped(strippedIds, b.value);
      continue;
    }
    buckets.push(b);
  }
  const next = { ...facet, buckets };
  if (!buckets.length && !next.emptyReason) next.emptyReason = 'no_evidence';
  return next;
}


/**
 * Reconcile contradictions after final findings are known (B23).
 * Filter findingIds to survivors + drop forbidden QID tokens in ids/scalars.
 * @param {object} c
 * @param {Set<string>} survivingFindingIds
 * @param {string[]} strippedIds
 * @returns {object|null}
 */
function scrubContradiction(c, survivingFindingIds, strippedIds) {
  if (!c || typeof c !== 'object') return null;
  const scalarFields = ['title', 'note', 'type', 'kind', 'reason', 'summary'];
  for (const key of scalarFields) {
    if (c[key] != null && (valueHasForbidden(c[key]) || isForbiddenQid(c[key]))) {
      noteStripped(strippedIds, c[key]);
      return null;
    }
  }
  const domainsIn = Array.isArray(c.domains) ? c.domains : [];
  const domains = [];
  for (const d of domainsIn) {
    if (valueHasForbidden(d) || isForbiddenQid(d)) {
      noteStripped(strippedIds, d);
      continue;
    }
    domains.push(d);
  }
  const idsIn = Array.isArray(c.findingIds) ? c.findingIds : [];
  const findingIds = [];
  for (const id of idsIn) {
    const sid = String(id);
    if (valueHasForbidden(sid) || isForbiddenQid(sid)) {
      noteStripped(strippedIds, sid);
      continue;
    }
    if (!survivingFindingIds.has(sid)) continue;
    findingIds.push(sid);
  }
  if (!findingIds.length) return null;
  // Allowlist only — never spread raw `c` (message/detail/qid/urls can Acc-leak before deepStrip).
  const out = { findingIds, domains };
  for (const key of ['type', 'kind', 'title', 'note', 'reason', 'summary']) {
    if (c[key] != null) out[key] = c[key];
  }
  return out;
}

/**
 * Acc-scrub corroboration edge for snapshot emit.
 * Prefer UNKNOWN over same-entity laundering; drop baited rows.
 * @param {object} e
 * @param {Set<string>} survivingFindingIds
 * @param {string[]} strippedIds
 * @returns {object|null}
 */
function scrubCorroborationEdge(e, survivingFindingIds, strippedIds) {
  if (!e || typeof e !== 'object') return null;
  for (const key of ['note', 'relationship', 'mode', 'summary', 'title']) {
    if (e[key] != null && (valueHasForbidden(e[key]) || isForbiddenQid(e[key]))) {
      noteStripped(strippedIds, e[key]);
      return null;
    }
  }
  const findingIds = [];
  for (const id of e.findingIds || []) {
    const sid = String(id);
    if (valueHasForbidden(sid) || isForbiddenQid(sid)) {
      noteStripped(strippedIds, sid);
      continue;
    }
    if (survivingFindingIds.size && !survivingFindingIds.has(sid)) continue;
    findingIds.push(sid);
  }
  if (!findingIds.length) return null;
  const coalesceKeys = (Array.isArray(e.coalesceKeys) ? e.coalesceKeys : []).filter((k) => {
    if (valueHasForbidden(k) || isForbiddenQid(k)) {
      noteStripped(strippedIds, k);
      return false;
    }
    return true;
  });
  let relationship = e.relationship || 'unknown';
  const rel = String(relationship).toLowerCase().replace(/_/g, '-');
  if (rel === 'same-entity' || rel === 'same_entity' || rel === 'same-identity') {
    relationship = 'unknown'; // INFORMATION≠IDENTITY — prefer UNKNOWN
  }
  return {
    relationship,
    findingIds,
    coalesceKeys,
    ...(Array.isArray(e.families)
      ? { families: e.families.filter((f) => !valueHasForbidden(f) && !isForbiddenQid(f)).slice(0, 8) }
      : {}),
    ...(e.mode != null ? { mode: e.mode } : {}),
    note: e.note && !valueHasForbidden(e.note) ? String(e.note).slice(0, 160) : 'INFORMATION≠IDENTITY',
  };
}


/**
 * Root keys skipped by deepStripForbidden.
 * `providers` is EXPLICITLY skipped (operational status map) — Acc deep-walk must
 * NOT treat provider error strings as identity surfaces (no identity laundering).
 * Mandatory pre-scrub: sanitizeDiscoveryPayload calls scrubProvidersState BEFORE
 * deepStrip so Acc bait / credentials never emit raw.
 */
const DEEP_SKIP_KEYS = new Set([
  'store',
  'forbiddenIdentitiesVersion',
  'createdAt',
  'updatedAt',
  'status',
  'stage',
  'pollAfterMs',
  'progress',
  'ttlMs',
  'version',
  'eventCursor',
  'evidenceEngineVersion',
  'providers', // explicit DEEP_SKIP — scrub via scrubProvidersState only
]);

/** Frozen list for tests / docs — do not mutate. */
export const EMIT_DEEP_SKIP_KEYS = Object.freeze([...DEEP_SKIP_KEYS]);

/**
 * Final nested sweep: forbidden QIDs cannot survive in any leftover surface
 * (contradictions, findingIds, evidence ids, facets, graph, extra snapshot keys).
 */
function deepStripForbidden(node, strippedIds, { isRoot = false } = {}) {
  if (node == null) return node;
  if (typeof node === 'string') {
    if (valueHasForbidden(node) || isForbiddenQid(node)) {
      noteStripped(strippedIds, node);
      return null;
    }
    return node;
  }
  if (typeof node !== 'object') return node;
  if (Array.isArray(node)) {
    return node
      .map((item) => deepStripForbidden(item, strippedIds))
      .filter((item) => item !== null && item !== undefined);
  }
  if (
    !isRoot &&
    (valueHasForbidden(node.id) ||
      isForbiddenQid(node.id) ||
      isForbiddenQid(node.qid) ||
      valueHasForbidden(node.qid))
  ) {
    noteStripped(strippedIds, node.id || node.qid);
    return null;
  }
  const next = {};
  for (const [k, v] of Object.entries(node)) {
    if (isRoot && DEEP_SKIP_KEYS.has(k)) {
      next[k] = v;
      continue;
    }
    const sv = deepStripForbidden(v, strippedIds);
    if (sv !== null) next[k] = sv;
  }
  return next;
}

/**
 * Sanitize discovery session snapshot before return.
 * Also runs sanitizeCandidatesPayload on a candidates-equivalent projection.
 *
 * @param {object} snapshot
 * @returns {object}
 */
export function sanitizeDiscoveryPayload(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return snapshot;
  const strippedIds = [];

  const findingsIn = Array.isArray(snapshot.findings) ? snapshot.findings : [];
  const evidenceIn = Array.isArray(snapshot.evidence) ? snapshot.evidence : [];
  const facetsIn = Array.isArray(snapshot.facets) ? snapshot.facets : [];

  let findings = findingsIn.map((f) => scrubFinding(f, strippedIds)).filter(Boolean);
  let evidence = evidenceIn.map((e) => scrubEvidence(e, strippedIds)).filter(Boolean);

  const evIds = new Set(evidence.map((e) => e.id));
  findings = findings.filter((f) => (f.evidenceIds || []).some((id) => evIds.has(id)));

  const facets = facetsIn.map((fc) => scrubFacet(fc, strippedIds));

  // Candidates-equivalent for Acc sanitizeCandidatesPayload reuse
  const candidates = findings.map((f) => ({
    id: f.id,
    qid: extractQid(f.id) || (f.entityRefs || []).map(extractQid).find(Boolean) || undefined,
    label: f.title,
    sourcesPreview: (f.evidenceIds || [])
      .map((id) => evidence.find((e) => e.id === id))
      .filter(Boolean)
      .map((e) => ({ url: e.provenanceUrl, title: f.title, id: e.id })),
  }));

  const projected = {
    candidates,
    sources: evidence.map((e) => ({ url: e.provenanceUrl, title: e.id, id: e.id })),
    qid: null,
  };
  const scrubbedProj = sanitizeCandidatesPayload(projected);
  const allowed = new Set((scrubbedProj.candidates || []).map((c) => c.id));

  const finalFindings = findings.filter((f) => allowed.has(f.id));
  for (const c of candidates) {
    if (!allowed.has(c.id)) {
      noteStripped(strippedIds, c.id);
      noteStripped(strippedIds, c.qid);
    }
  }

  const finalEvIds = new Set(finalFindings.flatMap((f) => f.evidenceIds || []));
  const finalEvidence = evidence.filter((e) => finalEvIds.has(e.id));
  const survivingFindingIds = new Set(finalFindings.map((f) => f.id));

  const contradictionsIn = Array.isArray(snapshot.contradictions) ? snapshot.contradictions : [];
  const contradictions = contradictionsIn
    .map((c) => scrubContradiction(c, survivingFindingIds, strippedIds))
    .filter(Boolean);

  const corroborationIn = Array.isArray(snapshot.corroborationEdges)
    ? snapshot.corroborationEdges
    : Array.isArray(snapshot.corroborations)
      ? snapshot.corroborations
      : [];
  const corroborationEdges = corroborationIn
    .map((e) => scrubCorroborationEdge(e, survivingFindingIds, strippedIds))
    .filter(Boolean);

  let gaps = snapshot.gaps;
  if (Array.isArray(gaps)) {
    gaps = scrubGapsForEmit(gaps);
  }

  let graph = snapshot.graph;
  if (graph && typeof graph === 'object') {
    graph = scrubGraphPayload(graph, strippedIds);
  }

  let plan = snapshot.plan;
  if (plan && typeof plan === 'object') {
    plan = scrubQueryPlanForEmit(plan);
    if (plan?.forbiddenStripped) {
      // count already on plan; mirror into strippedIds length for totals
      for (let i = 0; i < (plan.forbiddenStripped || 0); i++) {
        if (!strippedIds.includes('plan')) strippedIds.push('plan');
      }
    }
  }

  // SSE / snapshot errors[] — Acc ids must not leak in messages
  let errors = snapshot.errors;
  if (Array.isArray(errors)) {
    errors = errors.map((e) => scrubErrorChunk(e)).filter(Boolean);
  }

  const out = {
    ...snapshot,
    findings: finalFindings,
    evidence: finalEvidence,
    facets,
    contradictions,
    corroborationEdges,
    forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
  };
  if (Array.isArray(gaps)) out.gaps = gaps;
  if (graph) out.graph = graph;
  if (out.providers != null) out.providers = scrubProvidersState(out.providers);
  if (plan) out.plan = plan;
  if (snapshot.queryPlan && typeof snapshot.queryPlan === 'object') {
    out.queryPlan = scrubQueryPlanForEmit(snapshot.queryPlan);
  }
  if (Array.isArray(errors)) out.errors = errors;
  delete out.dossier;
  delete out.faces;
  delete out.photoUrl;
  // Discovery never emits Core candidates chrome; if present, Acc-scrub then drop identity list
  if (Array.isArray(out.candidates)) {
    const cScrub = sanitizeCandidatesPayload({ candidates: out.candidates, sources: [], qid: null });
    const kept = cScrub.candidates || [];
    if ((cScrub.forbiddenStripped || 0) > 0) {
      for (const c of out.candidates) {
        if (isForbiddenQid(c?.id) || isForbiddenQid(c?.qid) || valueHasForbidden(c?.id)) {
          noteStripped(strippedIds, c?.id || c?.qid);
        }
      }
    }
    // Drop candidates field entirely from Discovery emit (findings-only surface)
    delete out.candidates;
    void kept;
  }

  const accStrip =
    typeof scrubbedProj.forbiddenStripped === 'number' && scrubbedProj.forbiddenStripped > 0
      ? scrubbedProj.forbiddenStripped
      : 0;
  const totalStripped = Math.max(strippedIds.length, accStrip);
  if (totalStripped > 0) out.forbiddenStripped = totalStripped;

  const swept = deepStripForbidden(out, strippedIds, { isRoot: true }) || out;
  if (totalStripped > 0 || strippedIds.length > 0) {
    swept.forbiddenStripped = Math.max(swept.forbiddenStripped || 0, strippedIds.length, totalStripped);
  }
  return swept;
}

/**
 * Acc-scrub a single SSE finding chunk. Returns null if stripped.
 * @param {{ finding: object, evidence?: object[] }} chunk
 */
export function scrubFindingChunk(chunk) {
  if (!chunk?.finding) return null;
  const snap = sanitizeDiscoveryPayload({
    findings: [chunk.finding],
    evidence: chunk.evidence || [],
    facets: [],
  });
  if (!(snap.findings || []).length) return null;
  return {
    finding: snap.findings[0],
    evidence: snap.evidence || [],
    forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
    ...(snap.forbiddenStripped ? { forbiddenStripped: snap.forbiddenStripped } : {}),
  };
}

/**
 * Acc-scrub facets array for SSE facets event.
 * @param {object[]} facets
 */
export function scrubFacetsChunk(facets) {
  const snap = sanitizeDiscoveryPayload({
    findings: [],
    evidence: [],
    facets: Array.isArray(facets) ? facets : [],
  });
  return snap.facets || [];
}


// --- Acc emit-surface helpers (QueryPlan / SSE plan / graph / error) ---
// Cite: ACC-EMIT-SURFACE-MATRIX · BAIT-PLAN-* · BAIT-SSE-* · BAIT-GRAPH-*

const IDENTITY_EDGE_RE = /^(SAME[-_]?ENTITY|SAME[-_]?REFERENCE|same[-_]?entity|same[-_]?reference)$/i;
const TYPED_SOFT_REF_RE = /^(viaf|qid|wd|ol):/i;

/**
 * A2-safe typed soft-ref present on edge? URL-alone / title-bridge do NOT qualify.
 * @param {object} e
 */
function edgeHasTypedSoftRef(e) {
  if (!e || typeof e !== 'object') return false;
  const candidates = [
    e.typedSoftRef,
    e.softRef,
    e.sharedTypedKey,
    e.sharedKey,
    e.ref,
    ...(Array.isArray(e.sharedTypedKeys) ? e.sharedTypedKeys : []),
    ...(Array.isArray(e.typedRefs) ? e.typedRefs : []),
  ];
  return candidates.some((r) => r != null && TYPED_SOFT_REF_RE.test(String(r)));
}

/**
 * Acc graph edge gate: BLOCK same-entity / same-reference unless A2 typed soft-ref.
 * URL-alone / title-bridge → drop (C1 Bound · A2-safe only).
 * @param {object} e
 * @param {string[]} strippedIds
 */
function scrubGraphEdge(e, strippedIds) {
  if (!e || typeof e !== 'object') return null;
  const from = e.from ?? e.source;
  const to = e.to ?? e.target;
  if (valueHasForbidden(from) || valueHasForbidden(to) || valueHasForbidden(e?.label)) {
    noteStripped(strippedIds, from || to || e?.label);
    return null;
  }
  if (valueHasForbidden(e.signalSummary) || valueHasForbidden(e.relationship) || valueHasForbidden(e.type)) {
    noteStripped(strippedIds, e.signalSummary || e.relationship || e.type);
    return null;
  }
  const rel = String(e.relationship || e.label || e.type || '');
  if (IDENTITY_EDGE_RE.test(rel)) {
    if (e.urlAlone === true || e.titleBridge === true || !edgeHasTypedSoftRef(e)) {
      // C1 Bound: URL-alone must not survive as SAME-*; title-bridge revive forbidden
      noteStripped(strippedIds, rel);
      return null;
    }
  }
  let signalSummary = e.signalSummary;
  if (typeof signalSummary === 'string' && (valueHasForbidden(signalSummary) || isForbiddenQid(signalSummary))) {
    noteStripped(strippedIds, signalSummary);
    signalSummary = undefined;
  }
  const next = { ...e };
  if (signalSummary === undefined) delete next.signalSummary;
  else next.signalSummary = signalSummary;
  return next;
}

/**
 * Acc-scrub graph payload (HIT / SSE graph). Orphan edges dropped.
 * @param {object} graph
 * @param {string[]} [strippedIds]
 */
export function scrubGraphPayload(graph, strippedIds = []) {
  if (!graph || typeof graph !== 'object') return graph;
  // Acc P0: drop forbidden-identity nodes/edges/signalSummary bait first
  const nodesAcc = (graph.nodes || []).filter((n) => {
    if (
      valueHasForbidden(n?.id) ||
      isForbiddenQid(n?.id) ||
      valueHasForbidden(n?.qid) ||
      isForbiddenQid(n?.qid) ||
      valueHasForbidden(n?.label) ||
      valueHasForbidden(n?.title) ||
      valueHasForbidden(n?.name) ||
      valueHasForbidden(n?.signalSummary)
    ) {
      noteStripped(strippedIds, n?.id || n?.qid || n?.label || n?.signalSummary);
      return false;
    }
    return true;
  }).map((n) => {
    if (n && n.signalSummary && (valueHasForbidden(n.signalSummary) || isForbiddenQid(n.signalSummary))) {
      noteStripped(strippedIds, n.signalSummary);
      const { signalSummary: _drop, ...rest } = n;
      void _drop;
      return rest;
    }
    return n;
  });
  const nodeIds = new Set(nodesAcc.map((n) => n.id));
  const edgesAcc = (graph.edges || [])
    .map((e) => scrubGraphEdge(e, strippedIds))
    .filter(Boolean)
    .filter((e) => {
      const from = e.from ?? e.source;
      const to = e.to ?? e.target;
      return nodeIds.has(from) && nodeIds.has(to);
    })
    .map((e) => {
      // Acc: never leave forbidden QID bait in signalSummary even if Foundation slices it
      if (e.signalSummary && (valueHasForbidden(e.signalSummary) || isForbiddenQid(e.signalSummary))) {
        noteStripped(strippedIds, e.signalSummary);
        const { signalSummary: _s, ...rest } = e;
        void _s;
        return rest;
      }
      return e;
    });
  const accGraph = { ...graph, nodes: nodesAcc, edges: edgesAcc };
  // Foundation clamp: SAME-ENTITY → never on wire; orphan/provenance gates
  const foundation = scrubGraphForEmit(accGraph);
  if (!foundation) return { nodes: [], edges: [], meta: { sameEntityEmitted: 0 } };
  // Final Acc sweep on Foundation signalSummary (slice alone is not Acc scrub)
  const edgesFinal = (foundation.edges || []).map((e) => {
    if (e?.signalSummary && (valueHasForbidden(e.signalSummary) || isForbiddenQid(e.signalSummary))) {
      noteStripped(strippedIds, e.signalSummary);
      const { signalSummary: _s, ...rest } = e;
      void _s;
      return rest;
    }
    return e;
  });
  const afterFoundation = { ...foundation, edges: edgesFinal, meta: { ...(foundation.meta || {}), sameEntityEmitted: 0 } };
  // Checkpoint E: relationship-layer sanitize (candidate state, Acc endpoints, no laundering)
  const relSafe = sanitizeRelationshipGraph(afterFoundation);
  return {
    ...relSafe,
    meta: { ...(relSafe.meta || {}), sameEntityEmitted: 0 },
  };
}

/**
 * Acc-scrub QueryPlan for API / persist / HIT (ACC-EMIT-SURFACE-MATRIX).
 * @param {object} plan
 */
export function scrubPlanPayload(plan) {
  return scrubQueryPlanForEmit(plan);
}

/**
 * Acc-scrub SSE `plan` event payload.
 * @param {object} plan
 */
export function scrubPlanChunk(plan) {
  return planSummaryForSse(plan);
}

/**
 * Acc-scrub SSE `graph` event payload. Returns null if empty after scrub.
 * @param {object} graph
 */
export function scrubGraphChunk(graph) {
  const scrubbed = scrubGraphPayload(graph, []);
  if (!scrubbed) return null;
  if (!(scrubbed.nodes || []).length && !(scrubbed.edges || []).length) return null;
  return {
    graph: scrubbed,
    forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
  };
}

/**
 * Acc-scrub SSE `error` / errors[] message surfaces — Acc ids + credentials.
 * @param {object} err
 */
export function scrubErrorChunk(err) {
  if (!err || typeof err !== 'object') return err;
  const scrubMsg = (t) => {
    if (t == null) return t;
    let s = String(t);
    if (/(api[_-]?key|secret|password|token|bearer\s+[a-z0-9._-]+)/i.test(s)) {
      return '[REDACTED]';
    }
    const matches = s.match(/\bQ\d+\b/gi) || [];
    for (const tok of matches) {
      if (isForbiddenQid(tok)) {
        s = s.replace(new RegExp(`\\b${tok}\\b`, 'gi'), '[REDACTED_QID]');
      }
    }
    return s.slice(0, 500);
  };
  return {
    failureClass: err.failureClass || err.code || 'error',
    message: scrubMsg(err.message || err.error || err.msg),
    ...(err.retryable != null ? { retryable: !!err.retryable } : {}),
    forbiddenIdentitiesVersion: FORBIDDEN_IDENTITIES_VERSION,
  };
}

export default {
  sanitizeDiscoveryPayload,
  scrubFindingChunk,
  scrubFacetsChunk,
  scrubGraphPayload,
  scrubPlanPayload,
  scrubPlanChunk,
  scrubGraphChunk,
  scrubErrorChunk,
  EMIT_DEEP_SKIP_KEYS,
};
