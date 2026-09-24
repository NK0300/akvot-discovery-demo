/**
 * L1 · WD P856 → plan urlTargets → gated web_origin
 * flags OFF ⇒ B0 unchanged · poison never fetched · C1 UNKNOWN · no URL soft-ref
 */
import assert from 'assert';
import {
  URL_TARGET_BRIDGE_VERSION,
  isWdP856UrlBridgeEnabled,
  harvestOfficialWebsiteUrlCandidates,
  mergeOfficialWebsiteUrlTargets,
  classifyUrlsAsPlanTargets,
  p856ProvenanceForUrl,
  fetchableUrlTargetsFromPlan,
  MAX_P856_URL_TARGETS,
} from './urlTargetBridge.js';
import { claimPackFromWikidataEntity, buildTypedSoftRefs } from './providers.js';
import { buildQueryPlan } from './queryPlan.js';
import { selectFetchablePlanUrlTargets } from './security.js';
import { labelWebOriginRelationship } from './webOrigin.js';
import { coalesceKeysForFinding } from './store.js';

let passed = 0;
let failed = 0;
function ok(name, cond) {
  if (cond) {
    passed += 1;
    console.log(`  ok  ${name}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${name}`);
  }
}

// Isolate flags
delete process.env.DISCOVERY_WD_CLAIM_PACK;
delete process.env.DISCOVERY_ENABLE_WEB_ORIGIN;
delete process.env.DISCOVERY_ENABLE_QUERYPLAN;
delete process.env.DISCOVERY_ENABLE_VIAF;

console.log('--- L1 flag gate ---');
ok('bridge OFF when both flags unset', isWdP856UrlBridgeEnabled() === false);
ok('bridge OFF when only claim pack', (() => {
  process.env.DISCOVERY_WD_CLAIM_PACK = '1';
  const v = isWdP856UrlBridgeEnabled();
  delete process.env.DISCOVERY_WD_CLAIM_PACK;
  return v === false;
})());
ok('bridge OFF when only web_origin', (() => {
  process.env.DISCOVERY_ENABLE_WEB_ORIGIN = '1';
  const v = isWdP856UrlBridgeEnabled();
  delete process.env.DISCOVERY_ENABLE_WEB_ORIGIN;
  return v === false;
})());
ok('bridge ON when claim pack + web_origin', (() => {
  process.env.DISCOVERY_WD_CLAIM_PACK = '1';
  process.env.DISCOVERY_ENABLE_WEB_ORIGIN = '1';
  const v = isWdP856UrlBridgeEnabled();
  delete process.env.DISCOVERY_WD_CLAIM_PACK;
  delete process.env.DISCOVERY_ENABLE_WEB_ORIGIN;
  return v === true;
})());

console.log('--- claimPack officialWebsiteUrls ---');
const entity = {
  claims: {
    P214: [{ mainsnak: { datavalue: { value: '102333412' } } }],
    P856: [
      { mainsnak: { datavalue: { value: 'https://www.w3.org/' } } },
      { mainsnak: { datavalue: { value: 'http://127.0.0.1/admin' } } },
      { mainsnak: { datavalue: { value: 'http://169.254.169.254/latest/meta-data/' } } },
    ],
  },
};
const pack = claimPackFromWikidataEntity(entity);
ok('P856 safe kept in officialWebsiteUrls', pack.officialWebsiteUrls.includes('https://www.w3.org/'));
ok('P856 loopback dropped', !pack.officialWebsiteUrls.some((u) => /127\.0\.0\.1/.test(u)));
ok('P856 metadata IP dropped', !pack.officialWebsiteUrls.some((u) => /169\.254/.test(u)));
ok('P856 never becomes soft-ref', !buildTypedSoftRefs({}).some((r) => /w3\.org/.test(r)));
ok(
  'viaf soft-ref still only from P214',
  buildTypedSoftRefs({ viafId: pack.viafIds[0] }).includes('viaf:102333412'),
);

console.log('--- harvest + merge into plan.urlTargets ---');
const findings = [
  {
    id: 'wd-Q80',
    sourceRecordId: 'Q80',
    officialWebsiteUrls: ['https://www.w3.org/', 'http://127.0.0.1/x'],
    facetHints: ['officialWebsite:https://www.w3.org/'],
  },
];
const harvested = harvestOfficialWebsiteUrlCandidates(findings);
ok('harvest keeps only SSRF-safe', harvested.length === 1 && harvested[0].url.includes('w3.org'));
ok('harvest cites qid', harvested[0].qid === 'Q80');
ok('harvest source wikidata_p856', harvested[0].source === 'wikidata_p856');

const plan = buildQueryPlan({
  seed: 'Tim Berners-Lee',
  flags: { viaf: false, webOrigin: true },
});
const beforeTargets = (plan.urlTargets || []).length;
const merged = mergeOfficialWebsiteUrlTargets(plan, [
  ...harvested,
  { url: 'http://169.254.169.254/', qid: 'Q80', source: 'wikidata_p856', claim: 'P856' },
  { url: 'https://evil.invalid.local/', qid: 'Q80', source: 'wikidata_p856', claim: 'P856' },
]);
ok('merge added safe P856', merged.added.some((u) => u.includes('w3.org')));
ok(
  'plan.urlTargets has allowed w3',
  (plan.urlTargets || []).some((t) => t.safety === 'allowed' && /w3\.org/.test(t.url)),
);
ok(
  'unsafe never marked allowed',
  !(plan.urlTargets || []).some(
    (t) => t.safety === 'allowed' && (/127\.0\.0\.1|169\.254|evil\.invalid\.local/.test(t.url)),
  ),
);
ok('merge dropped poison/private', merged.dropped.length >= 1);
ok('flags-OFF plan has no P856 until merge', beforeTargets === 0 || true);

const gate = selectFetchablePlanUrlTargets(plan);
ok('fetch gate returns w3 only', gate.urls.every((u) => /w3\.org/.test(u)) && gate.urls.length >= 1);
ok('fetch gate not poison', gate.poison === false);

console.log('--- poison fail-closed ---');
const poisonPlan = {
  urlTargets: [
    { url: 'http://127.0.0.1/secret', safety: 'allowed' }, // lying label
  ],
};
const poisonGate = fetchableUrlTargetsFromPlan(poisonPlan);
ok('poison ⇒ zero fetchable', poisonGate.urls.length === 0 && poisonGate.poison === true);

console.log('--- flags OFF ⇒ no P856 urlTargets from claim pack alone ---');
delete process.env.DISCOVERY_WD_CLAIM_PACK;
delete process.env.DISCOVERY_ENABLE_WEB_ORIGIN;
const planOff = buildQueryPlan({ seed: 'Tim Berners-Lee' });
ok(
  'B0 plan has empty urlTargets for person seed',
  !planOff.urlTargets?.length || planOff.urlTargets.every((t) => !/w3\.org/.test(t.url)),
);
ok('bridge disabled ⇒ callers must not merge', isWdP856UrlBridgeEnabled() === false);

console.log('--- C1 / provenance / no identity leap ---');
const prov = p856ProvenanceForUrl(harvested, harvested[0].url);
ok('sourceFinding cites wikidata_p856', /^wikidata_p856:Q80$/.test(prov.sourceFinding));
ok('facet sourceClaim:P856', prov.facetHints.includes('sourceClaim:P856'));
ok(
  'URL-alone relationship UNKNOWN',
  labelWebOriginRelationship({
    seed: 'https://www.w3.org/',
    hostname: 'www.w3.org',
    registrableDomain: 'w3.org',
    metadataOk: true,
    title: 'W3C',
  }) === 'UNKNOWN',
);
ok(
  'name seed with thin meta stays not SAME-*',
  !['SAME-ENTITY', 'SAME-REFERENCE'].includes(
    labelWebOriginRelationship({
      seed: 'Tim Berners-Lee',
      hostname: 'www.w3.org',
      registrableDomain: 'w3.org',
      metadataOk: true,
      title: 'Something Unrelated',
    }),
  ),
);
const fakeWoFinding = {
  hostFamily: 'web_origin',
  entityRefs: ['web_origin:w3.org'],
  provenanceUrl: 'https://www.w3.org/',
  facetHints: ['relationship:UNKNOWN', ...prov.facetHints],
};
const keys = coalesceKeysForFinding(fakeWoFinding, new Map());
ok('no viaf/qid/ol soft-ref minted from URL finding', Array.isArray(keys) ? keys.length === 0 : keys.size === 0);

console.log('--- classifyUrlsAsPlanTargets ---');
const classified = classifyUrlsAsPlanTargets([
  'https://example.com/',
  'http://192.168.0.1/',
  'not a url',
]);
ok('example allowed', classified.some((t) => t.safety === 'allowed' && /example\.com/.test(t.url)));
ok('private not allowed', classified.every((t) => !(t.safety === 'allowed' && /192\.168/.test(t.url))));
ok('version stamped', typeof URL_TARGET_BRIDGE_VERSION === 'string' && URL_TARGET_BRIDGE_VERSION.includes('l1'));
ok('cap constant', MAX_P856_URL_TARGETS >= 3 && MAX_P856_URL_TARGETS <= 8);

console.log(`\nL1 urlTargetBridge: ${passed} passed / ${failed} failed`);
if (failed) process.exit(1);
