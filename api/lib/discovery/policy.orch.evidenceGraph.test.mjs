/**
 * Track B · Frontier + Evidence Graph wire on Policy orch Record.
 * cite-or-drop · UNKNOWN≠FALSE · INFORMATION≠IDENTITY · C1 urlAlone ceiling.
 * Flags OFF · no Core/session/SSE · no nightLoop unify · NO PROMOTE.
 */
import assert from 'node:assert/strict';
import { runFamilyOrchestration } from './familyOrchestrator.js';
import {
  policyB0Default,
  evaluateBatch,
} from './policy.js';
import { createFrontier } from './frontier.js';
import { buildQueryPlan } from './queryPlan.js';
import { FAMILY_TO_PROVIDER } from './sourceFamily.js';
import {
  urlAloneCeiling,
  clampGraphRelationship,
} from './evidenceGraph.js';

let passed = 0;
function ok(name, cond, detail) {
  assert.ok(cond, detail ? `${name}: ${detail}` : name);
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log('policy.orch.evidenceGraph.test.mjs');

const typedOk = evaluateBatch({}, {
  findings: [
    {
      url: 'https://www.wikidata.org/wiki/Q7259',
      familyId: 'knowledge_graph',
      entityRefs: ['qid:Q7259'],
      relationship: 'same-entity',
    },
  ],
});
ok('typed bait clamped off same-entity', typedOk.frontierAdds.length === 1);
ok(
  'INFORMATION≠IDENTITY clamp',
  typedOk.frontierAdds[0].relationship !== 'same-entity' &&
    typedOk.frontierAdds[0].relationship === 'same-reference',
);

const noCite = evaluateBatch({}, {
  findings: [{ familyId: 'encyclopedia', title: 'Ada' }],
});
ok('cite-or-drop no url/ref', noCite.frontierAdds.length === 0);
ok('citeDropped counted', (noCite.citeDropped || 0) >= 1);
ok('dropReason cite_or_drop', noCite.dropReason === 'cite_or_drop');

const webOrigin = evaluateBatch({}, {
  findings: [
    {
      url: 'https://example.org/ada',
      familyId: 'web_origin',
      hostFamily: 'web_origin',
      relationship: 'SAME-ENTITY',
    },
  ],
});
ok('web_origin still frontier-admissible (expand)', webOrigin.frontierAdds.length === 1);
ok(
  'C1 web_origin relationship unknown',
  webOrigin.frontierAdds[0].relationship === 'unknown',
);
ok('C1 reason stamped', webOrigin.frontierAdds[0].reason === 'c1_url_alone_unknown');
ok('UNKNOWN≠FALSE — ok true', webOrigin.ok === true);
ok('c1Ceilinged > 0', (webOrigin.c1Ceilinged || 0) >= 1);

const batchCeiling = evaluateBatch({}, { findings: [{ url: 'https://a.example' }], urlAlone: true });
ok('batch urlAlone drops all', batchCeiling.frontierAdds.length === 0);
ok('batch dropReason', batchCeiling.dropReason === 'url_alone_ceiling');

ok(
  'urlAloneCeiling API web_origin',
  urlAloneCeiling({ hostFamily: 'web_origin', relationship: 'same-reference' }) === 'unknown',
);
ok(
  'clamp never same-entity without typed',
  clampGraphRelationship('same-entity', { hasTypedSoftRef: false }) === 'unknown',
);

const stubProviders = [
  {
    id: FAMILY_TO_PROVIDER.knowledge_graph || 'wikidata',
    search: async () => ({
      findings: [
        {
          id: 'wd1',
          url: 'https://www.wikidata.org/wiki/Q7259',
          title: 'Ada Lovelace',
          entityRefs: ['qid:Q7259'],
          summary: 'mathematician',
        },
      ],
    }),
  },
  {
    id: FAMILY_TO_PROVIDER.encyclopedia || 'wikipedia_opensearch',
    search: async () => ({
      findings: [
        {
          id: 'wp1',
          url: 'https://en.wikipedia.org/wiki/Ada_Lovelace',
          title: 'Ada Lovelace',
          summary: 'English mathematician',
        },
      ],
    }),
  },
  {
    id: FAMILY_TO_PROVIDER.bibliographic || 'openlibrary',
    search: async () => ({ findings: [] }),
  },
];

const plan = buildQueryPlan({ seed: 'Ada Lovelace' });
const session = {
  sessionId: 'eg-wire-1',
  seed: 'Ada Lovelace',
  locale: 'en',
  hints: {},
};

const out = await runFamilyOrchestration(plan, session, {
  providers: stubProviders,
  flags: {},
  policy: policyB0Default,
});

ok('graph present', !!(out.graph || out.evidenceGraph));
const g = out.graph || out.evidenceGraph;
ok('graph nodes array', Array.isArray(g.nodes));
ok('graph edges array', Array.isArray(g.edges));
ok(
  'sameEntityEmitted 0',
  (g.meta?.sameEntityEmitted ?? g.meta?.sameEntityEmitted ?? 0) === 0,
);
ok(
  'no same-entity on graph edges',
  (g.edges || []).every(
    (e) => String(e.relationship || '').toLowerCase().replace(/_/g, '-') !== 'same-entity',
  ),
);
ok(
  'no same-entity on graph nodes',
  (g.nodes || []).every(
    (n) => String(n.relationship || '').toLowerCase().replace(/_/g, '-') !== 'same-entity',
  ),
);
ok('evaluate c1Ceilinged field', typeof (out.evaluate?.c1Ceilinged) === 'number');
ok('evaluate citeDropped field', typeof (out.evaluate?.citeDropped) === 'number');
ok('frontier still snapshot', out.frontier && typeof out.frontier.size === 'number');
ok('decision stop b0', out.decision?.action === 'stop');

const frontier = createFrontier();
const out2 = await runFamilyOrchestration(plan, session, {
  providers: stubProviders,
  flags: {},
  policy: policyB0Default,
  frontier,
});
ok('live frontier size fn', typeof frontier.size === 'function');
ok('graph with live frontier', Array.isArray((out2.graph || out2.evidenceGraph)?.nodes));

const urlAlone = await runFamilyOrchestration(plan, session, {
  providers: stubProviders,
  flags: {},
  policy: policyB0Default,
  urlAlone: true,
});
ok('urlAlone dropReason', urlAlone.evaluate?.dropReason === 'url_alone_ceiling');
ok('urlAlone no frontier adds', urlAlone.evaluate?.frontierAdded === 0);
ok('urlAlone still builds graph', Array.isArray((urlAlone.graph || urlAlone.evidenceGraph)?.nodes));

console.log(`policy.orch.evidenceGraph.test.mjs: ${passed} passed`);
