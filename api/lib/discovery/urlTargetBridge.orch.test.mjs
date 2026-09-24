/**
 * L1 orch-level: flags OFF unchanged · flags ON merges plan urlTargets · poison not fetched
 */
import assert from 'assert';
import { createDiscoverySession, clearSessions } from './orchestrator.js';
import { mergeOfficialWebsiteUrlTargets, isWdP856UrlBridgeEnabled } from './urlTargetBridge.js';
import { buildQueryPlan } from './queryPlan.js';
import { selectFetchablePlanUrlTargets } from './security.js';

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

function resetFlags() {
  delete process.env.DISCOVERY_WD_CLAIM_PACK;
  delete process.env.DISCOVERY_ENABLE_WEB_ORIGIN;
  delete process.env.DISCOVERY_ENABLE_QUERYPLAN;
  delete process.env.DISCOVERY_ENABLE_VIAF;
  delete process.env.DISCOVERY_ENABLE_PLAN_SSE;
}

clearSessions();
resetFlags();

console.log('--- flags OFF · B0 path unchanged (no P856 urlTargets / no web_origin) ---');
{
  const store = new Map();
  const result = await createDiscoverySession(
    { seed: 'Tim Berners-Lee', locale: 'en' },
    {
      store,
      providers: [
        {
          id: 'wikidata',
          async search() {
            return {
              providerId: 'wikidata',
              findings: [
                {
                  id: 'wd-Q80',
                  title: 'Tim Berners-Lee',
                  kind: 'registry',
                  provenanceUrl: 'https://www.wikidata.org/wiki/Q80',
                  quote: 'inventor of the World Wide Web',
                  // Even if somehow present, bridge OFF must not fetch
                  officialWebsiteUrls: ['https://www.w3.org/'],
                  facetHints: ['provider:wikidata', 'officialWebsite:https://www.w3.org/'],
                  entityRefs: ['qid:Q80'],
                },
              ],
              partial: false,
            };
          },
        },
      ],
      budgets: { sessionWallMs: 5000, providerMs: 2000 },
    },
  );
  const snap = result.snapshot || result;
  const wo = (snap.findings || []).filter(
    (f) => f.hostFamily === 'web_origin' || (f.providers || []).includes('web_origin'),
  );
  ok('flags OFF → no web_origin findings from P856', wo.length === 0);
  ok('flags OFF → no p856Bridge telemetry', !snap.p856Bridge);
  ok(
    'flags OFF → queryPlan absent or no w3 urlTargets',
    !snap.queryPlan ||
      !(snap.queryPlan.urlTargets || []).some((t) => /w3\.org/.test(String(t.url || ''))),
  );
}

console.log('--- claim pack + web_origin ON · safe P856 → urlTargets allowed ---');
{
  process.env.DISCOVERY_WD_CLAIM_PACK = '1';
  process.env.DISCOVERY_ENABLE_WEB_ORIGIN = '1';
  process.env.DISCOVERY_ENABLE_QUERYPLAN = '1';
  ok('bridge enabled', isWdP856UrlBridgeEnabled() === true);

  const plan = buildQueryPlan({
    seed: 'Example Org',
    hints: { seedClass: 'organization' },
    flags: { webOrigin: true },
  });
  mergeOfficialWebsiteUrlTargets(plan, [
    { url: 'https://www.example.com/', qid: 'Q42', source: 'wikidata_p856', claim: 'P856' },
    { url: 'http://127.0.0.1/steal', qid: 'Q42', source: 'wikidata_p856', claim: 'P856' },
  ]);
  ok(
    'allowed example.com in plan',
    (plan.urlTargets || []).some((t) => t.safety === 'allowed' && /example\.com/.test(t.url)),
  );
  ok(
    '127.0.0.1 not allowed',
    !(plan.urlTargets || []).some((t) => t.safety === 'allowed' && /127\.0\.0\.1/.test(t.url)),
  );
  const gate = selectFetchablePlanUrlTargets(plan);
  ok('gate fetchable is example only', gate.urls.length === 1 && /example\.com/.test(gate.urls[0]));
  ok('gate not poison', gate.poison === false);

  // Orch path with stub providers — web_origin stub records requested URLs (no real HTTP)
  /** @type {string[]} */
  const fetched = [];
  const store = new Map();
  const result = await createDiscoverySession(
    { seed: 'Example Org', locale: 'en', hints: { seedClass: 'organization' } },
    {
      store,
      enableQueryPlan: true,
      providers: [
        {
          id: 'wikidata',
          async search() {
            return {
              providerId: 'wikidata',
              findings: [
                {
                  id: 'wd-Q42',
                  title: 'Example Org',
                  kind: 'registry',
                  provenanceUrl: 'https://www.wikidata.org/wiki/Q42',
                  quote: 'example organization for discovery tests',
                  officialWebsiteUrls: [
                    'https://www.example.com/',
                    'http://127.0.0.1/steal',
                    'http://169.254.169.254/latest/meta-data/',
                  ],
                  facetHints: [
                    'provider:wikidata',
                    'officialWebsite:https://www.example.com/',
                  ],
                  entityRefs: ['qid:Q42'],
                  sourceRecordId: 'Q42',
                },
              ],
              partial: false,
            };
          },
        },
        {
          id: 'openlibrary',
          async search() {
            return { providerId: 'openlibrary', findings: [], partial: false };
          },
        },
        {
          id: 'wikipedia',
          async search() {
            return { providerId: 'wikipedia', findings: [], partial: false };
          },
        },
        {
          id: 'web_origin',
          async search(req) {
            const hints = req.hints || {};
            const planUrls = hints.webOriginUrls || hints.urlTargets || [];
            for (const u of planUrls) fetched.push(String(u));
            // Also record seed-path candidates if any
            return {
              providerId: 'web_origin',
              findings: [],
              partial: false,
            };
          },
        },
      ],
      budgets: { sessionWallMs: 8000, providerMs: 3000 },
    },
  );
  const snap = result.snapshot || result;
  const targets = snap.queryPlan?.urlTargets || [];
  ok(
    'session plan urlTargets includes allowed example',
    targets.some((t) => t.safety === 'allowed' && /example\.com/.test(String(t.url))),
  );
  ok(
    'session plan urlTargets does not allow loopback',
    !targets.some((t) => t.safety === 'allowed' && /127\.0\.0\.1|169\.254/.test(String(t.url))),
  );
  // Bridge may call resolveWebOriginCandidates directly (not provider.search) —
  // assert poison never appears in fetched provider hints AND p856Bridge dropped poison
  ok(
    'provider web_origin never received loopback',
    !fetched.some((u) => /127\.0\.0\.1|169\.254/.test(u)),
  );
  ok(
    'p856Bridge recorded or web_origin status set',
    !!(snap.p856Bridge || snap.providers?.web_origin),
  );
  // C1: no SAME-* on any finding
  const rels = (snap.findings || []).map((f) =>
    String(f.relationship || f.relationshipState || '').toUpperCase(),
  );
  ok(
    'no SAME-* identity leap',
    rels.every((r) => !r.includes('SAME-ENTITY') && !r.includes('SAME-REFERENCE')),
  );

  resetFlags();
}

console.log('--- poison plan fail-closed (direct) ---');
{
  const poison = {
    urlTargets: [{ url: 'http://127.0.0.1/', safety: 'allowed' }],
  };
  const gate = selectFetchablePlanUrlTargets(poison);
  ok('poison failClosed', gate.poison === true && gate.urls.length === 0);
}

clearSessions();
resetFlags();
console.log(`\nL1 orch bridge: ${passed} passed / ${failed} failed`);
if (failed) process.exit(1);
