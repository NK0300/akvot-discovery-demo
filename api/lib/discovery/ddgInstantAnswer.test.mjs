/**
 * Adapter-2 DDG Instant Answer — unit tests.
 * Flag default OFF · C1 UNKNOWN · cite-or-drop · SSRF · caps · AbortSignal · retry.
 */
import {
  searchDdgInstantAnswer,
  isDdgInstantEnabled,
  buildDdgIaRequestUrl,
  collectRelatedFirstUrls,
  extractDdgIaUrlRows,
  buildDdgInstantHit,
  isTransientDdgIaFailure,
  DDG_INSTANT_PROVIDER_ID,
  DDG_INSTANT_VERSION,
  DDG_INSTANT_SOURCE_ID,
  MAX_DDG_INSTANT_RESULTS,
} from './ddgInstantAnswer.js';
import { gateGeneralWebHitUrl } from './generalWebSearch.js';
import { discoveryFlagSnapshot } from './flags.js';
import { isAdapterHostAllowed, ADAPTER_HOST_ALLOWLIST } from './adapterContract.js';

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

function mockIaPayload(overrides = {}) {
  return {
    AbstractURL: 'https://www.w3.org/',
    Abstract: 'World Wide Web Consortium',
    RelatedTopics: [
      { FirstURL: 'https://example.org/a', Text: 'Example A' },
      { FirstURL: 'https://127.0.0.1/evil', Text: 'SSRF' },
      { FirstURL: 'https://en.wikipedia.org/wiki/X', Text: 'Registry' },
      {
        Name: 'See also',
        Topics: [
          { FirstURL: 'https://example.org/nested', Text: 'Nested topic' },
          { FirstURL: 'http://example.com/http-upgrade', Text: 'HTTP row' },
        ],
      },
      { FirstURL: 'https://example.org/b', Text: 'Example B' },
      { FirstURL: 'https://example.org/c', Text: 'Example C' },
      { FirstURL: 'https://example.org/d', Text: 'Example D' },
      { FirstURL: 'https://example.org/e', Text: 'Example E' },
    ],
    ...overrides,
  };
}

console.log('--- version / allowlist lock ---');
ok('fill.1 version', DDG_INSTANT_VERSION === '2026-09-24.adapter2.fill.1');
ok('provider id', DDG_INSTANT_PROVIDER_ID === 'ddg_instant_answer');
ok('source id', DDG_INSTANT_SOURCE_ID === 'ddg_instant_answer');
ok(
  'allowlist has api.duckduckgo.com only',
  Array.isArray(ADAPTER_HOST_ALLOWLIST.ddg_instant_answer) &&
    ADAPTER_HOST_ALLOWLIST.ddg_instant_answer.length === 1 &&
    ADAPTER_HOST_ALLOWLIST.ddg_instant_answer[0] === 'api.duckduckgo.com',
);
ok(
  'host allowed api.duckduckgo.com',
  isAdapterHostAllowed('ddg_instant_answer', 'api.duckduckgo.com') === true,
);
ok(
  'host rejects duckduckgo.com root',
  isAdapterHostAllowed('ddg_instant_answer', 'duckduckgo.com') === false,
);
ok(
  'host rejects html.duckduckgo.com',
  isAdapterHostAllowed('ddg_instant_answer', 'html.duckduckgo.com') === false,
);

console.log('--- flag OFF = noop ---');
restoreEnv();
ok('flag OFF default', isDdgInstantEnabled() === false);
ok(
  'snapshot OFF',
  discoveryFlagSnapshot().DISCOVERY_ENABLE_DDG_INSTANT === false,
);
{
  const r = await searchDdgInstantAnswer({ q: 'World Wide Web Consortium' });
  ok('flag_off reason', r.reason === 'flag_off');
  ok('flag_off stub', r.stub === true);
  ok('flag_off empty findings', r.findings.length === 0);
  ok('flag_off provider id', r.providerId === DDG_INSTANT_PROVIDER_ID);
}

console.log('--- empty query ---');
{
  const r = await searchDdgInstantAnswer(
    { q: '  ' },
    { enableDdgInstant: true },
  );
  ok('empty_query reason', r.reason === 'empty_query');
  ok('empty_query no findings', r.findings.length === 0);
}

console.log('--- parse AbstractURL + RelatedTopics + nested Topics ---');
{
  const rows = extractDdgIaUrlRows(mockIaPayload());
  ok('has AbstractURL row', rows.some((r) => r.from === 'AbstractURL' && /w3\.org/.test(r.url)));
  ok('has RelatedTopics rows', rows.filter((r) => r.from === 'RelatedTopics').length >= 2);
  ok(
    'nested Topics collected',
    rows.some((r) => /example\.org\/nested/.test(r.url)),
    rows.map((r) => r.url).join(','),
  );
  const nested = [];
  collectRelatedFirstUrls(
    [{ Name: 'g', Topics: [{ FirstURL: 'https://nested.example/x', Text: 'n' }] }],
    nested,
  );
  ok('collectRelatedFirstUrls nested', nested.some((r) => /nested\.example/.test(r.url)));
}

console.log('--- SSRF / registry / http upgrade (reuse gate) ---');
ok('loopback dropped', gateGeneralWebHitUrl('https://127.0.0.1/x').ok === false);
ok('wikipedia registry dropped', gateGeneralWebHitUrl('https://en.wikipedia.org/wiki/X').ok === false);
ok(
  'http upgraded to https',
  (() => {
    const g = gateGeneralWebHitUrl('http://example.com/foo');
    return g.ok === true && String(g.canonical || '').startsWith('https://example.com/foo');
  })(),
);

console.log('--- build hit C1 · cite-or-drop ---');
{
  const apiUrl = buildDdgIaRequestUrl('W3C');
  ok('apiUrl host', /api\.duckduckgo\.com/.test(apiUrl), apiUrl);
  const hit = buildDdgInstantHit({
    url: 'https://www.w3.org/',
    title: 'w3.org',
    snippet: 'W3C abstract text',
    query: 'W3C',
    from: 'AbstractURL',
    apiProvenanceUrl: apiUrl,
  });
  ok('build hit', !!hit);
  ok('relationship UNKNOWN', hit.relationship === 'UNKNOWN');
  ok('identityClaim false', hit.identityClaim === false);
  ok('epistemic candidate', hit.epistemicState === 'candidate');
  ok('kind url_candidate', hit.kind === 'url_candidate');
  ok('urlAlone', hit.urlAlone === true);
  ok('urlCandidate', hit.urlCandidate === true);
  ok('urlIsNotIdentity', hit.urlIsNotIdentity === true);
  ok('no SAME-ENTITY', !/SAME-ENTITY/i.test(JSON.stringify(hit)));
  ok('providerId', hit.providerId === 'ddg_instant_answer');
  ok('sourceFamily general_web', hit.sourceFamily === 'general_web');
  ok('familyId ddg_instant_answer', hit.familyId === 'ddg_instant_answer');
  ok('hostFamily web_search', hit.hostFamily === 'web_search');
  ok('provenance cites IA url', /api\.duckduckgo\.com/.test(hit.provenanceUrl), hit.provenanceUrl);
  ok('whyFound mentions DDG', /DDG Instant Answer/i.test(hit.whyFound));
  ok(
    'poison build null',
    buildDdgInstantHit({
      url: 'https://127.0.0.1/x',
      apiProvenanceUrl: apiUrl,
    }) === null,
  );
  ok(
    'missing provenance drops',
    buildDdgInstantHit({
      url: 'https://www.w3.org/',
      apiProvenanceUrl: '',
    }) === null,
  );
}

console.log('--- flag ON adapter · mock IA · C1 + cap5 + drop ---');
{
  const fetchJson = async (url) => {
    ok('fetch hits allowlisted host', /api\.duckduckgo\.com/.test(String(url)));
    return mockIaPayload();
  };
  const r = await searchDdgInstantAnswer(
    { q: 'World Wide Web Consortium', budgetMs: 2000 },
    { enableDdgInstant: true, fetchJson },
  );
  ok('reason ok', r.reason === 'ok', r.reason);
  ok('not stub', r.stub === false);
  ok('source id', r.source === 'ddg_instant_answer');
  ok('cap ≤5', r.findings.length <= MAX_DDG_INSTANT_RESULTS, `n=${r.findings.length}`);
  ok('at least one finding', r.findings.length >= 1);
  ok('exactly capped when many', r.findings.length === 5, `n=${r.findings.length}`);
  ok(
    'all UNKNOWN',
    r.findings.every((f) => f.relationship === 'UNKNOWN'),
  );
  ok(
    'no identityClaim',
    r.findings.every((f) => f.identityClaim === false),
  );
  ok(
    'all candidate',
    r.findings.every((f) => f.epistemicState === 'candidate'),
  );
  ok(
    'no SAME-ENTITY anywhere',
    !/SAME-ENTITY/i.test(JSON.stringify(r.findings)),
  );
  ok(
    'SSRF/registry poison dropped',
    !r.findings.some((f) => /127\.0\.0\.1|wikipedia\.org/i.test(f.url)),
    r.findings.map((f) => f.url).join(','),
  );
  ok(
    'http upgraded emitted',
    r.findings.some((f) => /^https:\/\/example\.com\/http-upgrade/.test(f.url)),
    r.findings.map((f) => f.url).join(','),
  );
  ok('dropped count > 0', (r.dropped || 0) >= 1, `dropped=${r.dropped}`);
  ok(
    'Track-C shape',
    r.findings.every(
      (f) =>
        f.kind === 'url_candidate' &&
        f.urlCandidate === true &&
        f.providerId === 'ddg_instant_answer' &&
        f.sourceFamily === 'general_web' &&
        f.familyId === 'ddg_instant_answer' &&
        f.hostFamily === 'web_search' &&
        /api\.duckduckgo\.com/.test(f.provenanceUrl),
    ),
  );
  ok(
    'snippets are why-found only (no identity claim fields)',
    r.findings.every((f) => f.identityClaim === false && f.relationship === 'UNKNOWN'),
  );
}

console.log('--- AbortSignal / timeout ---');
{
  const ac = new AbortController();
  ac.abort();
  const r = await searchDdgInstantAnswer(
    { q: 'W3C' },
    {
      enableDdgInstant: true,
      signal: ac.signal,
      fetchJson: async () => mockIaPayload(),
    },
  );
  ok('pre-aborted', r.reason === 'aborted' || r.reason === 'timeout', r.reason);
  ok('pre-aborted partial', r.partial === true);
  ok('pre-aborted empty', r.findings.length === 0);
}
{
  const r = await searchDdgInstantAnswer(
    { q: 'W3C', budgetMs: 60 },
    {
      enableDdgInstant: true,
      fetchJson: async (_url, signal) => {
        await new Promise((resolve, reject) => {
          const t = setTimeout(resolve, 400);
          signal.addEventListener(
            'abort',
            () => {
              clearTimeout(t);
              const e = new Error('aborted');
              e.name = 'AbortError';
              reject(e);
            },
            { once: true },
          );
        });
        return mockIaPayload();
      },
    },
  );
  ok('timeout reason', r.reason === 'timeout', r.reason);
  ok('timeout partial', r.partial === true);
  ok('timeout empty', r.findings.length === 0);
}

console.log('--- IA retry / error path ---');
{
  let calls = 0;
  const r = await searchDdgInstantAnswer(
    { q: 'W3C', budgetMs: 2000 },
    {
      enableDdgInstant: true,
      fetchJson: async () => {
        calls += 1;
        if (calls === 1) {
          const e = new Error('HTTP 503');
          e.status = 503;
          throw e;
        }
        return {
          AbstractURL: 'https://www.w3.org/',
          Abstract: 'ok',
          RelatedTopics: [],
        };
      },
    },
  );
  ok('retried once', calls === 2, `calls=${calls}`);
  ok('retry then ok', r.reason === 'ok', r.reason);
  ok('retry finding', r.findings.length === 1);
  ok('iaAttempts=2', r.meta?.iaAttempts === 2, JSON.stringify(r.meta));
}
{
  let calls = 0;
  const r = await searchDdgInstantAnswer(
    { q: 'W3C', budgetMs: 2000 },
    {
      enableDdgInstant: true,
      fetchJson: async () => {
        calls += 1;
        const e = new Error('HTTP 503');
        e.status = 503;
        throw e;
      },
    },
  );
  ok('persistent 5xx attempts≤2', calls === 2, `calls=${calls}`);
  ok('ia_error reason', r.reason === 'ia_error', r.reason);
  ok('errorCode http_503', r.errorCode === 'http_503', r.errorCode);
  ok('honest empty', r.findings.length === 0);
  ok('partial', r.partial === true);
}
ok(
  'transient helper 503',
  isTransientDdgIaFailure({ status: 503, message: 'x' }, undefined, undefined, undefined) ===
    true,
);
ok(
  'non-transient 404',
  isTransientDdgIaFailure({ status: 404, message: 'x' }, undefined, undefined, undefined) ===
    false,
);
{
  const parent = new AbortController();
  parent.abort();
  ok(
    'parent abort not transient',
    isTransientDdgIaFailure(
      { name: 'AbortError', message: 'aborted' },
      undefined,
      parent.signal,
      'cancelled',
    ) === false,
  );
}

console.log('--- C1 UNKNOWN / no SAME-ENTITY lock ---');
{
  const r = await searchDdgInstantAnswer(
    { q: 'Ada Lovelace', budgetMs: 1000 },
    {
      enableDdgInstant: true,
      fetchJson: async () => ({
        AbstractURL: 'https://example.org/ada',
        Abstract: 'Mathematician',
        RelatedTopics: [{ FirstURL: 'https://example.org/bio', Text: 'Bio page' }],
      }),
    },
  );
  ok('ada findings', r.findings.length >= 1);
  ok(
    'never SAME-ENTITY',
    !/SAME[-_ ]?ENTITY/i.test(JSON.stringify(r)),
  );
  ok(
    'never identityClaim true',
    !r.findings.some((f) => f.identityClaim === true),
  );
  ok(
    'relationship never soft-ref/same',
    r.findings.every((f) => f.relationship === 'UNKNOWN'),
  );
}

restoreEnv();

console.log(`\nAdapter-2 DDG IA tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
