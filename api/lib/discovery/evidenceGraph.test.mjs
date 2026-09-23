/**
 * Evidence graph PRE-GO tests — T-UNK-01 · T-ACC-04 · provenance · URL-alone UNKNOWN.
 * Cite: UNKNOWN-NORMATIVE · SoT 07 · ACC-EMIT-SURFACE-MATRIX
 */
import assert from 'assert';
import {
  clampGraphRelationship,
  urlAloneCeiling,
  validateEdgeProvenance,
  buildEvidenceGraph,
  scrubGraphForEmit,
  FORBIDDEN_GRAPH_RELATIONSHIPS,
} from './evidenceGraph.js';
import { sanitizeDiscoveryPayload } from './emit.js';

let passed = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('evidenceGraph.test.mjs');

ok('clamp same-entity → same-reference with typed', clampGraphRelationship('same-entity', { hasTypedSoftRef: true }) === 'same-reference');
ok('clamp same-entity → unknown without typed', clampGraphRelationship('SAME_ENTITY', { hasTypedSoftRef: false }) === 'unknown');
ok('forbidden list has same-entity', FORBIDDEN_GRAPH_RELATIONSHIPS.some((x) => x.toLowerCase().includes('same-entity') || x.includes('SAME')));

ok('urlAlone web_origin → unknown', urlAloneCeiling({ hostFamily: 'web_origin', relationship: 'SAME-REFERENCE' }) === 'unknown');
ok('urlAlone finding with viaf keeps', urlAloneCeiling({ entityRefs: ['viaf:123'], relationship: 'same-reference' }) === null);

ok('validate rejects same-entity', validateEdgeProvenance({ from: 'a', to: 'b', relationship: 'same-entity' }).ok === false);
ok('validate ok supports', validateEdgeProvenance({ from: 'a', to: 'b', relationship: 'supports', planId: 'qp-1' }).ok === true);

const graph = buildEvidenceGraph({
  sessionId: 's1',
  softEr: { softRefs: ['seed:s1'] },
  queryPlan: { planId: 'qp-test' },
  findings: [
    {
      id: 'f1',
      evidenceIds: ['e1'],
      providers: ['wikidata'],
      familyId: 'knowledge_graph',
      planId: 'qp-test',
      entityRefs: ['qid:Q42'],
    },
    {
      id: 'f2',
      evidenceIds: ['e2'],
      providers: ['viaf'],
      familyId: 'authority',
      planId: 'qp-test',
      entityRefs: ['viaf:1'],
    },
    {
      id: 'f-wo',
      evidenceIds: ['e-wo'],
      providers: ['web_origin'],
      familyId: 'web_origin',
      hostFamily: 'web_origin',
      relationship: 'SAME-ENTITY',
      planId: 'qp-test',
    },
  ],
  evidence: [
    { id: 'e1', providerId: 'wikidata', planId: 'qp-test', familyId: 'knowledge_graph' },
    { id: 'e2', providerId: 'viaf', planId: 'qp-test', familyId: 'authority' },
    {
      id: 'e-wo',
      providerId: 'web_origin',
      hostFamily: 'web_origin',
      relationship: 'SAME-REFERENCE',
      planId: 'qp-test',
    },
  ],
  corroborationEdges: [
    {
      findingIds: ['f1', 'f2'],
      families: ['knowledge_graph', 'authority'],
      coalesceKeys: ['qid:Q42'],
      relationship: 'same-entity', // bait — must not appear on wire
      mode: 'attach_keep',
    },
  ],
});

ok('T-ACC-04 sameEntityEmitted=0', graph.meta.sameEntityEmitted === 0);
ok(
  'T-ACC-04 no same-entity edges',
  graph.edges.every((e) => String(e.relationship).toLowerCase() !== 'same-entity'),
);
ok(
  'corr edge clamped to same-reference',
  graph.edges.some((e) => e.kind === 'corroboration' && e.relationship === 'same-reference'),
);
ok(
  'T-UNK-01 web_origin finding relationship unknown',
  (graph.nodes.find((n) => n.id === 'f-wo')?.relationship || 'unknown') === 'unknown',
);
ok(
  'supports edges have planId',
  graph.edges.filter((e) => e.kind === 'supports').every((e) => e.planId === 'qp-test'),
);

const scrubbed = scrubGraphForEmit(graph);
ok('scrubGraph no same-entity', scrubbed.edges.every((e) => e.relationship !== 'same-entity'));
ok('scrubGraph meta sameEntityEmitted 0', scrubbed.meta.sameEntityEmitted === 0);

// Emit sanitize also blocks same-entity
const snap = sanitizeDiscoveryPayload({
  findings: [
    {
      id: 'f1',
      title: 'Ada',
      evidenceIds: ['e1'],
      entityRefs: [],
      relationship: 'same-entity',
    },
  ],
  evidence: [{ id: 'e1', provenanceUrl: 'https://example.com/a', quote: 'x' }],
  facets: [],
  graph: {
    nodes: [
      { id: 'f1', kind: 'finding' },
      { id: 'f2', kind: 'finding' },
    ],
    edges: [
      { id: 'bad', from: 'f1', to: 'f2', relationship: 'same-entity' },
      { id: 'ok', from: 'f1', to: 'f2', relationship: 'same-reference', coalesceKeys: ['viaf:1'] },
    ],
  },
});
ok(
  'emit blocks same-entity edge',
  !(snap.graph?.edges || []).some((e) => String(e.relationship).toLowerCase() === 'same-entity'),
);
ok(
  'emit finding relationship clamped',
  !snap.findings?.length ||
    snap.findings.every((f) => String(f.relationship || '').toLowerCase() !== 'same-entity'),
);

console.log(`evidenceGraph.test.mjs: ${passed} passed`);
