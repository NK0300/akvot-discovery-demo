/**
 * URL/domain candidate pipeline + L1 P856 bridge gates.
 * C1: URL-alone → UNKNOWN · never identity · SSRF fail-closed · cite-or-drop.
 */
import {
  gateCandidateUrl,
  extractOfficialWebsiteRefsFromFinding,
  buildUrlDomainCandidates,
  collectOfficialWebsiteBridgeTargets,
  mergeUrlDomainCandidatesIntoGraph,
  scrubUrlDomainCandidatesForEmit,
  isWdOfficialWebsiteBridgeEnabled,
  shouldEmitUrlDomainCandidates,
  URL_DOMAIN_CANDIDATE_KIND,
} from './urlDomainCandidates.js';
import { claimPackFromWikidataEntity } from './providers.js';
import { isWdP856UrlBridgeEnabled } from './urlTargetBridge.js';
import { discoveryFlagSnapshot } from './flags.js';

let passed = 0;
let failed = 0;
function ok(name, cond, detail = '') {
  if (cond) {
    passed += 1;
    console.log('  ok ', name);
  } else {
    failed += 1;
    console.error('  FAIL', name, detail);
  }
}

const saved = { ...process.env };
function restoreEnv() {
  for (const k of Object.keys(process.env)) {
    if (k.startsWith('DISCOVERY_')) delete process.env[k];
  }
  for (const [k, v] of Object.entries(saved)) {
    if (k.startsWith('DISCOVERY_') && v !== undefined) process.env[k] = v;
  }
}

console.log('--- flags default OFF ---');
restoreEnv();
ok(
  'urlDomainCandidates flag OFF',
  discoveryFlagSnapshot().DISCOVERY_ENABLE_URL_DOMAIN_CANDIDATES === false,
);
ok('bridge OFF by default', isWdOfficialWebsiteBridgeEnabled() === false);
ok('urlTargetBridge OFF by default', isWdP856UrlBridgeEnabled() === false);
ok('shouldEmit OFF by default', shouldEmitUrlDomainCandidates() === false);

console.log('--- bridge requires BOTH flags ---');
process.env.DISCOVERY_WD_CLAIM_PACK = '1';
ok('claim alone → bridge OFF', isWdOfficialWebsiteBridgeEnabled() === false);
delete process.env.DISCOVERY_WD_CLAIM_PACK;
process.env.DISCOVERY_ENABLE_WEB_ORIGIN = '1';
ok('web_origin alone → bridge OFF', isWdOfficialWebsiteBridgeEnabled() === false);
process.env.DISCOVERY_WD_CLAIM_PACK = '1';
ok('both ON → bridge ON', isWdOfficialWebsiteBridgeEnabled() === true);
ok('both ON → urlTargetBridge ON', isWdP856UrlBridgeEnabled() === true);
ok('both ON → shouldEmit ON', shouldEmitUrlDomainCandidates() === true);
restoreEnv();

console.log('--- SSRF / registry gate ---');
ok('https example allowed', gateCandidateUrl('https://www.example.org/about').ok === true);
ok('http rejected', gateCandidateUrl('http://example.org/').ok === false);
ok('loopback rejected', gateCandidateUrl('https://127.0.0.1/').ok === false);
ok('metadata IP rejected', gateCandidateUrl('https://169.254.169.254/latest').ok === false);
ok('wikidata host skipped', gateCandidateUrl('https://www.wikidata.org/wiki/Q42').ok === false);
ok('wikipedia host skipped', gateCandidateUrl('https://en.wikipedia.org/wiki/X').ok === false);

console.log('--- extract P856 from finding (array + facet) ---');
const finding = {
  id: 'wd-Q42',
  title: 'Douglas Adams',
  provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
  providers: ['wikidata'],
  officialWebsiteUrls: ['https://douglasadams.com/', 'http://127.0.0.1/x'],
  facetHints: ['officialWebsite:https://douglasadams.com/', 'provider:wikidata'],
};
const refs = extractOfficialWebsiteRefsFromFinding(finding);
ok(
  'extracts array URL',
  refs.some((r) => r.url.includes('douglasadams.com') && r.method === 'wd_p856_official_website'),
);
ok('extracts facet URL', refs.some((r) => r.method === 'wd_p856_facet'));
ok(
  'keeps unsafe in extract list (gate later)',
  refs.some((r) => /127\.0\.0\.1/.test(r.url)),
);

console.log('--- build candidates · cite-or-drop · C1 UNKNOWN ---');
const cands = buildUrlDomainCandidates({ seed: 'Douglas Adams', findings: [finding] });
ok('one registrable domain candidate', cands.length === 1, `len=${cands.length}`);
ok('kind url_domain_candidate', cands[0]?.kind === URL_DOMAIN_CANDIDATE_KIND);
ok('relationship UNKNOWN', cands[0]?.relationship === 'UNKNOWN');
ok('identityClaim false', cands[0]?.identityClaim === false);
ok('urlIsNotIdentity', cands[0]?.urlIsNotIdentity === true);
ok('has provenance', (cands[0]?.provenance || []).length >= 1);
ok('provenance cites finding', cands[0]?.provenance?.[0]?.sourceFindingId === 'wd-Q42');
ok('SSRF URL dropped from candidates', !cands.some((c) => /127\.0\.0\.1/.test(c.url)));
ok(
  'whyFound includes p856',
  (cands[0]?.whyFound || []).includes('wd_p856_official_website'),
);

console.log('--- claimPack → officialWebsiteUrls field (providers) ---');
const pack = claimPackFromWikidataEntity({
  claims: {
    P856: [
      { mainsnak: { datavalue: { value: 'https://www.w3.org/' } } },
      { mainsnak: { datavalue: { value: 'http://127.0.0.1/steal' } } },
    ],
  },
});
ok('pack exposes officialWebsiteUrls', Array.isArray(pack.officialWebsiteUrls));
ok('pack keeps safe P856', pack.officialWebsiteUrls.includes('https://www.w3.org/'));
ok('pack drops loopback', !pack.officialWebsiteUrls.some((u) => /127\.0\.0\.1/.test(u)));
ok(
  'pack also facets officialWebsite',
  pack.facetHints.some((h) => h.startsWith('officialWebsite:https://www.w3.org')),
);

console.log('--- bridge targets ---');
const targets = collectOfficialWebsiteBridgeTargets({ findings: [finding] });
ok(
  'bridge target is safe URL only',
  targets.length === 1 && targets[0].url.startsWith('https://douglasadams.com'),
);
ok('bridge cites sourceFindingId', targets[0].sourceFindingId === 'wd-Q42');

console.log('--- graph merge · no SAME-* ---');
const graph = mergeUrlDomainCandidatesIntoGraph(
  {
    nodes: [{ id: 'wd-Q42', kind: 'finding' }],
    edges: [],
    meta: {},
  },
  cands,
);
ok('graph adds candidate node', graph.nodes.some((n) => n.kind === URL_DOMAIN_CANDIDATE_KIND));
ok(
  'candidate node relationship UNKNOWN',
  graph.nodes.find((n) => n.kind === URL_DOMAIN_CANDIDATE_KIND)?.relationship === 'UNKNOWN',
);
ok(
  'no SAME-ENTITY edge',
  !(graph.edges || []).some((e) => /same-entity/i.test(String(e.relationship || e.kind))),
);
ok(
  'derived-from edge present',
  (graph.edges || []).some(
    (e) => e.kind === 'derived_from' || e.relationship === 'derived-from',
  ),
);

console.log('--- scrub emit ---');
const scrubbed = scrubUrlDomainCandidatesForEmit(cands);
ok('scrub keeps candidate', scrubbed.length === 1);
ok(
  'scrub forces UNKNOWN',
  scrubbed[0].relationship === 'UNKNOWN' && scrubbed[0].identityClaim === false,
);
ok('scrub keeps provenance', scrubbed[0].provenance.length >= 1);

console.log('--- seed URL candidate ---');
const seedCands = buildUrlDomainCandidates({ seed: 'https://example.org/page' });
ok(
  'seed URL yields candidate',
  seedCands.some((c) => c.registrableDomain === 'example.org'),
);
ok(
  'seed method recorded',
  (seedCands[0]?.whyFound || []).includes('seed_url_or_hostname'),
);
ok('seed alone still UNKNOWN', seedCands[0]?.relationship === 'UNKNOWN');

console.log(`\nurlDomainCandidates: ${passed} passed / ${failed} failed`);
process.exit(failed ? 1 : 0);
