/**
 * Checkpoint E / Phase 4 start — relationship + candidate state.
 * Provenance edges · no graph laundering · Acc · C1 Bound.
 * Run: node api/lib/discovery/relationship.test.mjs
 */
import {
  RELATIONSHIP_VOCAB,
  FORBIDDEN_EMIT_RELATIONSHIPS,
  CANDIDATE_STATES,
  normalizeRelationship,
  canTransitionRelationship,
  emitSafeRelationship,
  candidateStateFor,
  buildProvenancedEdge,
  sanitizeRelationshipGraph,
  explainEdge,
  RELATIONSHIP_MODULE_VERSION,
} from './relationship.js';
import { scrubGraphPayload, scrubGraphChunk } from './emit.js';
import { buildEvidenceGraph } from './evidenceGraph.js';
import { sanitizeDiscoveryPayload } from './emit.js';

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) {
    passed++;
    console.log('PASS', name);
  } else {
    failed++;
    console.error('FAIL', name);
  }
}

assert('vocab has unknown', RELATIONSHIP_VOCAB.includes('unknown'));
assert('forbidden includes same-entity', FORBIDDEN_EMIT_RELATIONSHIPS.some((x) => /same-entity/i.test(x)));
assert('candidate states lack fact', !CANDIDATE_STATES.includes('fact'));
assert('module version', !!RELATIONSHIP_MODULE_VERSION);

assert('normalize SAME_ENTITY', normalizeRelationship('SAME_ENTITY') === 'same-entity');

// --- no laundering ---
assert(
  'cannot upgrade unknown→same-reference without typed',
  canTransitionRelationship('unknown', 'same-reference', { hasTypedSoftRef: false }).ok === false,
);
assert(
  'can set same-reference with typed',
  canTransitionRelationship('unknown', 'same-reference', { hasTypedSoftRef: true }).ok === true,
);
assert(
  'urlAlone cannot authorize SAME-REFERENCE',
  canTransitionRelationship('unknown', 'same-reference', { urlAlone: true }).ok === false,
);
assert(
  'titleBridge cannot authorize SAME-ENTITY',
  canTransitionRelationship('unknown', 'same-entity', { titleBridge: true }).ok === false,
);
assert(
  'same-entity always blocked',
  canTransitionRelationship('same-reference', 'same-entity', { hasTypedSoftRef: true }).ok === false,
);

// --- emitSafe ---
assert(
  'emitSafe same-entity→same-reference typed',
  emitSafeRelationship('same-entity', { hasTypedSoftRef: true }) === 'same-reference',
);
assert(
  'emitSafe same-entity→unknown untyped',
  emitSafeRelationship('SAME-ENTITY', { hasTypedSoftRef: false }) === 'unknown',
);
assert(
  'emitSafe web_origin URL-alone → unknown',
  emitSafeRelationship('SAME-REFERENCE', { urlAlone: true, hostFamily: 'web_origin' }) === 'unknown',
);

// --- candidate state ---
assert('fact demoted', candidateStateFor({ epistemicState: 'fact' }) === 'candidate');
assert(
  'corroborated when multi-family typed',
  candidateStateFor(
    { entityRefs: ['viaf:1'] },
    { independentFamilies: 2, hasTypedSoftRef: true },
  ) === 'corroborated_candidate',
);

// --- build edge ---
const okEdge = buildProvenancedEdge({
  from: 'f1',
  to: 'f2',
  relationship: 'supports',
  planId: 'qp-1',
  familyId: 'knowledge_graph',
  providerId: 'wikidata',
  evidenceIds: ['e1'],
  signalSummary: 'registry supports finding',
});
assert('build supports edge ok', okEdge.ok === true);
assert('edge has provenance planId', okEdge.edge.provenance.planId === 'qp-1');
assert('edge candidateState', !!okEdge.edge.candidateState);

const badEntity = buildProvenancedEdge({
  from: 'a',
  to: 'b',
  relationship: 'same-entity',
  hasTypedSoftRef: true,
  planId: 'qp-1',
});
assert(
  'same-entity not on wire (clamped or blocked)',
  !badEntity.ok || badEntity.edge.relationship !== 'same-entity',
);

const urlAlone = buildProvenancedEdge({
  from: 'u1',
  to: 'u2',
  relationship: 'SAME-REFERENCE',
  urlAlone: true,
  hostFamily: 'web_origin',
  planId: 'qp-1',
});
assert(
  'URL-alone SAME-REFERENCE → unknown or reject',
  !urlAlone.ok || urlAlone.edge.relationship === 'unknown',
);

const titleBridge = buildProvenancedEdge({
  from: 't1',
  to: 't2',
  relationship: 'same-reference',
  titleBridge: true,
  planId: 'qp-1',
});
assert(
  'title-bridge blocked or unknown',
  !titleBridge.ok || titleBridge.edge.relationship === 'unknown',
);

const accEdge = buildProvenancedEdge({
  from: 'wd-Q1701775',
  to: 'f-ok',
  relationship: 'related-entity',
  planId: 'qp-1',
});
assert('Acc forbidden endpoint rejected', accEdge.ok === false);

// --- sanitize graph ---
const g = sanitizeRelationshipGraph({
  nodes: [
    { id: 'f1', entityRefs: ['viaf:1'] },
    { id: 'f2', entityRefs: ['viaf:1'] },
    { id: 'wd-Q1701775', label: 'trap' },
    { id: 'wo', hostFamily: 'web_origin', relationship: 'SAME-ENTITY' },
  ],
  edges: [
    {
      from: 'f1',
      to: 'f2',
      relationship: 'same-entity',
      coalesceKeys: ['viaf:1'],
      planId: 'qp-1',
      evidenceIds: ['e1'],
    },
    {
      from: 'wo',
      to: 'f1',
      relationship: 'SAME-REFERENCE',
      urlAlone: true,
      hostFamily: 'web_origin',
      planId: 'qp-1',
    },
    {
      from: 'wd-Q1701775',
      to: 'f1',
      relationship: 'related-entity',
      planId: 'qp-1',
    },
  ],
});
assert('forbidden node stripped', !(g.nodes || []).some((n) => /Q1701775/i.test(String(n.id))));
assert(
  'no same-entity on wire',
  !(g.edges || []).some((e) => String(e.relationship).toLowerCase() === 'same-entity'),
);
assert('wo node relationship unknown', (g.nodes || []).find((n) => n.id === 'wo')?.relationship === 'unknown');
assert('meta sameEntityEmitted 0', g.meta?.sameEntityEmitted === 0);

// Acc on snapshot with relationship graph
const scrubbed = sanitizeDiscoveryPayload({
  sessionId: 'rel-1',
  seed: 'x',
  status: 'partial',
  findings: [
    { id: 'f1', title: 'Safe', evidenceIds: ['e1'], entityRefs: ['viaf:1'], candidateState: 'candidate' },
  ],
  evidence: [{ id: 'e1', provenanceUrl: 'https://viaf.org/viaf/1', providerId: 'viaf' }],
  graph: g,
});
assert('Acc graph leak=0', !JSON.stringify(scrubbed).match(/Q1701775/i));


// --- explainEdge (edge-click) ---
{
  const built = buildProvenancedEdge({
    id: 'edge-1',
    from: 'f1',
    to: 'f2',
    relationship: 'supports',
    planId: 'qp-1',
    familyId: 'knowledge_graph',
    providerId: 'wikidata',
    evidenceIds: ['e1', 'e2'],
    sharedTypedKeys: ['viaf:4952029'],
    signalSummary: 'typed soft-ref supports attach',
  });
  assert('explainEdge source edge ok', built.ok);
  const why = explainEdge(built.edge, {
    planId: 'qp-1',
    evidence: [
      { id: 'e1', providerId: 'wikidata', provenanceUrl: 'https://www.wikidata.org/wiki/Q42', evidenceStrength: 'strong', epistemicState: 'candidate' },
      { id: 'e2', providerId: 'viaf', provenanceUrl: 'https://viaf.org/viaf/4952029/', evidenceStrength: 'moderate', epistemicState: 'candidate' },
    ],
  });
  assert('explainEdge ok', why.ok === true);
  assert('explainEdge identityClaim false', why.identityClaim === false);
  assert('explainEdge epistemicCeiling candidate', why.epistemicCeiling === 'candidate');
  assert('explainEdge has evidenceIds', why.evidenceIds.includes('e1') && why.evidenceIds.includes('e2'));
  assert('explainEdge evidence rows', why.evidence.length === 2);
  assert('explainEdge provenance planId', why.provenance.planId === 'qp-1');
  assert('explainEdge no identityScore field meaning fact', why.identityScore == null);
}

{
  const bait = explainEdge(
    { from: 'wd-Q1701775', to: 'f1', relationship: 'related-entity' },
    {},
  );
  assert('explainEdge Acc forbidden endpoint rejected', bait.ok === false && bait.reason === 'acc_forbidden');
}

// --- Acc forbidden on softRef / signal in buildProvenancedEdge ---
{
  const softPoison = buildProvenancedEdge({
    from: 'a',
    to: 'b',
    relationship: 'supports',
    planId: 'qp-1',
    sharedTypedKeys: ['qid:Q1701775'],
  });
  assert('Acc reject forbidden softRef key on edge', softPoison.ok === false);

  const sigPoison = buildProvenancedEdge({
    from: 'a',
    to: 'b',
    relationship: 'supports',
    planId: 'qp-1',
    signalSummary: 'see Q1701775 politician',
  });
  // signalSummary is redacted in provenance then checked — after redact may pass; require leak=0 on success
  if (sigPoison.ok) {
    assert('Acc signalSummary redacted if edge kept', !JSON.stringify(sigPoison.edge).match(/Q1701775/i));
  } else {
    assert('Acc signalSummary poison rejected', sigPoison.reason === 'acc_forbidden_endpoint');
  }
}

// --- orch-equivalent: buildEvidenceGraph → sanitizeRelationshipGraph → scrub ---
{
  const raw = buildEvidenceGraph({
    sessionId: 's-e',
    queryPlan: { planId: 'qp-e' },
    findings: [
      { id: 'f1', evidenceIds: ['e1'], providers: ['wikidata'], entityRefs: ['qid:Q42'], planId: 'qp-e' },
      { id: 'f-bad', evidenceIds: ['e-bad'], providers: ['wikidata'], entityRefs: ['Q1701775'], planId: 'qp-e' },
    ],
    evidence: [
      { id: 'e1', providerId: 'wikidata', planId: 'qp-e', familyId: 'knowledge_graph' },
      { id: 'e-bad', providerId: 'wikidata', planId: 'qp-e', provenanceUrl: 'https://www.wikidata.org/wiki/Q1701775' },
    ],
    contradictions: [
      { type: 'same_title_multi_domain', findingIds: ['f1', 'f-bad'], domains: ['wikidata.org', 'viaf.org'] },
    ],
  });
  const sanitized = sanitizeRelationshipGraph(raw);
  assert('wire sanitize drops forbidden node ids', !(sanitized.nodes || []).some((n) => /Q1701775/i.test(String(n.id))));
  assert('wire sanitize sameEntityEmitted 0', sanitized.meta?.sameEntityEmitted === 0);

  const scrubbed = scrubGraphPayload(sanitized, []);
  assert('emit scrubGraphPayload leak=0', !JSON.stringify(scrubbed).match(/Q1701775/i));
  assert('emit scrub no same-entity', !(scrubbed.edges || []).some((e) => String(e.relationship).toLowerCase() === 'same-entity'));

  const chunk = scrubGraphChunk({
    nodes: [
      { id: 'n1' },
      { id: 'wd-Q1701775' },
    ],
    edges: [
      { from: 'n1', to: 'wd-Q1701775', relationship: 'related-entity', planId: 'qp-1' },
    ],
  });
  assert('SSE scrubGraphChunk leak=0', !JSON.stringify(chunk || {}).match(/Q1701775/i));
}

console.log(`\n--- relationship (Checkpoint E) ---\npassed=${passed} failed=${failed}`);
process.exit(failed ? 1 : 0);
