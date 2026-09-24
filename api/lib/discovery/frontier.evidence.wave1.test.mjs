/**
 * Wave1 Frontier priority + Evidence Graph from orch Record.
 * No Core · no promote · C1 / no same-entity.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createFrontier,
  frontierPriority,
  sortFrontierItems,
} from './frontier.js';
import {
  graphFromOrchestrationResult,
  assertNoSameEntity,
  clampGraphRelationship,
} from './evidenceGraph.js';

describe('frontier priority', () => {
  it('typedRef outranks bare url', () => {
    assert.ok(
      frontierPriority({ typedRef: 'qid:Q1', evaluateOk: true }) >
        frontierPriority({ url: 'https://example.com', evaluateOk: true }),
    );
  });

  it('takeNext returns typed first after reprioritize', () => {
    const f = createFrontier();
    f.add({ url: 'https://z.example/a', evaluateOk: true, wave: 1 });
    f.add({ typedRef: 'viaf:123', url: 'https://a.example/b', evaluateOk: true, wave: 1 });
    const next = f.takeNext(1);
    assert.equal(next[0].typedRef, 'viaf:123');
  });

  it('sortFrontierItems stable by key', () => {
    const s = sortFrontierItems([
      { url: 'https://b.example', evaluateOk: true },
      { url: 'https://a.example', evaluateOk: true },
    ]);
    assert.equal(s.length, 2);
  });
});

describe('evidence graph from orch', () => {
  it('builds nodes family-agnostic and strips same-entity', () => {
    const graph = graphFromOrchestrationResult({
      planId: 'plan-1',
      policyId: 'policy.b0.default',
      wave: 1,
      findings: [
        {
          id: 'f1',
          familyId: 'encyclopedia',
          url: 'https://en.wikipedia.org/wiki/X',
          entityRefs: ['qid:Q9'],
          evidenceIds: ['e1'],
        },
      ],
      evidence: [{ id: 'e1', familyId: 'encyclopedia', url: 'https://en.wikipedia.org/wiki/X' }],
      frontier: {
        size: 1,
        items: [
          {
            url: 'https://en.wikipedia.org/wiki/X',
            typedRef: 'qid:Q9',
            familyId: 'encyclopedia',
            evaluateOk: true,
          },
        ],
      },
    });
    assert.ok(graph.nodes.some((n) => n.kind === 'finding'));
    assert.ok(graph.meta.frontierSize >= 1);
    assert.equal(assertNoSameEntity(graph).ok, true);
    assert.equal(clampGraphRelationship('same-entity', {}), 'unknown');
  });

  it('urlAlone-shaped finding stays non-identity', () => {
    const graph = graphFromOrchestrationResult({
      planId: 'p',
      findings: [
        {
          id: 'f-url',
          familyId: 'web_origin',
          hostFamily: 'web_origin',
          url: 'https://example.com',
          relationship: 'same-entity',
        },
      ],
      evidence: [],
      frontier: { size: 0, items: [] },
    });
    const node = graph.nodes.find((n) => n.id === 'f-url');
    assert.ok(node);
    assert.notEqual(String(node.relationship || '').toLowerCase(), 'same-entity');
    assert.equal(assertNoSameEntity(graph).ok, true);
  });
});
