/**
 * GENERAL_WEB adapter fill.1 — WP OpenSearch → extlinks (en/he).
 * Flag default OFF · C1 UNKNOWN · cite-or-drop · SSRF · caps · AbortSignal.
 */
import {
  searchGeneralWeb,
  isGeneralWebSearchEnabled,
  gateGeneralWebHitUrl,
  tryUpgradeHttpToHttps,
  isTransientOpenSearchFailure,
  buildGeneralWebHit,
  GENERAL_WEB_SEARCH_VERSION,
  GENERAL_WEB_CONTRACT_VERSION,
  GENERAL_WEB_SOURCE_ID,
  MAX_GENERAL_WEB_RESULTS,
  GENERAL_WEB_SEARCH_PROVIDER_ID,
} from './generalWebSearch.js';
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

/** @param {string} url */
function mockFetchFactory(extlinks) {
  return async function fetchJson(url, _signal) {
    const u = String(url);
    if (u.includes('action=opensearch')) {
      return [
        'Q',
        ['World Wide Web Consortium'],
        ['Standards org'],
        ['https://en.wikipedia.org/wiki/World_Wide_Web_Consortium'],
      ];
    }
    if (u.includes('action=query') || u.includes('prop=extlinks')) {
      return {
        query: {
          pages: {
            '42': {
              pageid: 42,
              title: 'World Wide Web Consortium',
              extract: 'International standards organization.',
              fullurl: 'https://en.wikipedia.org/wiki/World_Wide_Web_Consortium',
              extlinks: (extlinks || []).map((x) =>
                typeof x === 'string' ? { '*': x } : x,
              ),
            },
          },
        },
      };
    }
    throw new Error(`unexpected_url:${u}`);
  };
}

console.log('--- version / source lock ---');
ok('gw.locale.1.2 version', GENERAL_WEB_SEARCH_VERSION === '2026-09-24.gw.locale.1.2');
ok('stub.1 contract retained', GENERAL_WEB_CONTRACT_VERSION === '2026-09-24.stub.1');
ok('source wp_opensearch_extlinks', GENERAL_WEB_SOURCE_ID === 'wp_opensearch_extlinks');

console.log('--- flag OFF = noop ---');
restoreEnv();
ok('flag OFF default', isGeneralWebSearchEnabled() === false);
ok(
  'snapshot OFF',
  discoveryFlagSnapshot().DISCOVERY_ENABLE_GENERAL_WEB === false,
);
{
  const r = await searchGeneralWeb({ q: 'World Wide Web Consortium' });
  ok('flag_off reason', r.reason === 'flag_off');
  ok('flag_off stub', r.stub === true);
  ok('flag_off empty findings', r.findings.length === 0);
  ok('flag_off provider id', r.providerId === GENERAL_WEB_SEARCH_PROVIDER_ID);
}

console.log('--- empty query ---');
{
  const r = await searchGeneralWeb(
    { q: '  ' },
    { enableGeneralWebSearch: true },
  );
  ok('empty_query reason', r.reason === 'empty_query');
  ok('empty_query no findings', r.findings.length === 0);
}

console.log('--- SSRF / registry gate ---');
ok('loopback dropped', gateGeneralWebHitUrl('https://127.0.0.1/x').ok === false);
ok('metadata IP dropped', gateGeneralWebHitUrl('https://169.254.169.254/latest').ok === false);
ok(
  'http upgraded to https',
  (() => {
    const g = gateGeneralWebHitUrl('http://example.com/foo');
    return g.ok === true && String(g.canonical || '').startsWith('https://example.com/foo');
  })(),
  JSON.stringify(gateGeneralWebHitUrl('http://example.com/foo')),
);
ok(
  'http upgrade still drops registry',
  gateGeneralWebHitUrl('http://en.wikipedia.org/wiki/X').ok === false,
);
ok(
  'http upgrade still drops private/SSRF',
  gateGeneralWebHitUrl('http://127.0.0.1/x').ok === false &&
    gateGeneralWebHitUrl('http://169.254.169.254/latest').ok === false,
);
ok('wikipedia registry dropped', gateGeneralWebHitUrl('https://en.wikipedia.org/wiki/X').ok === false);
ok('wikidata registry dropped', gateGeneralWebHitUrl('https://www.wikidata.org/wiki/Q42').ok === false);
ok('viaf registry dropped', gateGeneralWebHitUrl('https://viaf.org/viaf/1').ok === false);
ok('openlibrary registry dropped', gateGeneralWebHitUrl('https://openlibrary.org/works/OL1W').ok === false);
ok('public https allowed', gateGeneralWebHitUrl('https://www.w3.org/').ok === true);

console.log('--- build hit C1 ---');
{
  const hit = buildGeneralWebHit({
    url: 'https://www.w3.org/',
    title: 'w3.org',
    snippet: 'W3C',
    query: 'W3C',
    pageTitle: 'World Wide Web Consortium',
    wikiLang: 'en',
    wikiPageUrl: 'https://en.wikipedia.org/wiki/World_Wide_Web_Consortium',
    apiProvenanceUrl: 'https://en.wikipedia.org/w/api.php?action=query',
  });
  ok('build hit', !!hit);
  ok('relationship UNKNOWN', hit.relationship === 'UNKNOWN');
  ok('identityClaim false', hit.identityClaim === false);
  ok('epistemic candidate', hit.epistemicState === 'candidate');
  ok('kind url_candidate', hit.kind === 'url_candidate');
  ok('no SAME-ENTITY', !/SAME-ENTITY/i.test(JSON.stringify(hit)));
  ok('provenance cites wiki', /wikipedia\.org/i.test(hit.provenanceUrl));
  ok('url is candidate', hit.url === 'https://www.w3.org/');
}
ok(
  'poison build null',
  buildGeneralWebHit({
    url: 'https://127.0.0.1/x',
    pageTitle: 'X',
    wikiLang: 'en',
    wikiPageUrl: 'https://en.wikipedia.org/wiki/X',
    apiProvenanceUrl: 'https://en.wikipedia.org/w/api.php',
  }) === null,
);

console.log('--- flag ON adapter · mock WP · C1 + cap + drop ---');
{
  const fetchJson = mockFetchFactory([
    'https://www.w3.org/',
    'https://127.0.0.1/evil',
    'https://en.wikipedia.org/wiki/HTML',
    'http://127.0.0.1/insecure',
    'https://www.w3.org/TR/',
    'https://example.org/a',
    'https://example.org/b',
    'https://example.org/c',
    'https://example.org/d',
    'https://example.org/e',
  ]);
  const r = await searchGeneralWeb(
    { q: 'World Wide Web Consortium', budgetMs: 2000, locale: 'en' },
    { enableGeneralWebSearch: true, fetchJson },
  );
  ok('reason ok', r.reason === 'ok', r.reason);
  ok('not stub', r.stub === false);
  ok('source id', r.source === 'wp_opensearch_extlinks');
  ok('cap ≤5', r.findings.length <= MAX_GENERAL_WEB_RESULTS, `n=${r.findings.length}`);
  ok('at least one finding', r.findings.length >= 1);
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
  ok('dropped count > 0', (r.dropped || 0) >= 1, `dropped=${r.dropped}`);
  ok(
    'Track-C-ish shape',
    r.findings.every(
      (f) =>
        f.kind === 'url_candidate' &&
        f.urlCandidate === true &&
        f.providerId === 'general_web_search' &&
        f.sourceFamily === 'general_web',
    ),
  );
}

console.log('--- AbortSignal / timeout ---');
{
  const ac = new AbortController();
  ac.abort();
  const r = await searchGeneralWeb(
    { q: 'W3C' },
    {
      enableGeneralWebSearch: true,
      signal: ac.signal,
      fetchJson: mockFetchFactory(['https://example.org/']),
    },
  );
  ok('pre-aborted', r.reason === 'aborted' || r.reason === 'timeout', r.reason);
  ok('pre-aborted partial', r.partial === true);
  ok('pre-aborted empty', r.findings.length === 0);
}
{
  const r = await searchGeneralWeb(
    { q: 'W3C', budgetMs: 60 },
    {
      enableGeneralWebSearch: true,
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
        return [];
      },
    },
  );
  ok('timeout reason', r.reason === 'timeout', r.reason);
  ok('timeout partial', r.partial === true);
}

console.log('--- he locale host ---');
{
  let seen = '';
  const r = await searchGeneralWeb(
    { q: 'ויקיפדיה', budgetMs: 500, locale: 'he' },
    {
      enableGeneralWebSearch: true,
      fetchJson: async (url) => {
        seen = String(url);
        if (url.includes('action=opensearch')) {
          return ['q', [], [], []];
        }
        return { query: { pages: {} } };
      },
    },
  );
  ok('he host used', /he\.wikipedia\.org/.test(seen), seen);
  ok('empty opensearch handled', r.findings.length === 0);
}


console.log('--- http→https upgrade helper ---');
{
  const up = tryUpgradeHttpToHttps('http://example.com/foo?x=1');
  ok('upgrade helper ok', up.ok === true);
  ok('upgrade helper https', up.ok && /^https:\/\/example\.com\/foo\?x=1$/.test(up.httpsUrl), up.httpsUrl);
  ok('upgrade helper rejects https input', tryUpgradeHttpToHttps('https://example.com/').ok === false);
  const hit = buildGeneralWebHit({
    url: 'http://www.w3.org/',
    title: 'w3.org',
    snippet: 'W3C',
    query: 'W3C',
    pageTitle: 'World Wide Web Consortium',
    wikiLang: 'en',
    wikiPageUrl: 'https://en.wikipedia.org/wiki/World_Wide_Web_Consortium',
    apiProvenanceUrl: 'https://en.wikipedia.org/w/api.php?action=query',
  });
  ok('build upgrades http hit', !!hit && String(hit.url).startsWith('https://'), hit && hit.url);
}

console.log('--- OpenSearch retry / error path ---');
{
  let calls = 0;
  const r = await searchGeneralWeb(
    { q: 'W3C', budgetMs: 2000, locale: 'en' },
    {
      enableGeneralWebSearch: true,
      fetchJson: async (url) => {
        if (String(url).includes('action=opensearch')) {
          calls += 1;
          if (calls === 1) {
            const e = new Error('HTTP 503');
            e.status = 503;
            throw e;
          }
          return [
            'Q',
            ['World Wide Web Consortium'],
            ['Standards org'],
            ['https://en.wikipedia.org/wiki/World_Wide_Web_Consortium'],
          ];
        }
        return {
          query: {
            pages: {
              '42': {
                pageid: 42,
                title: 'World Wide Web Consortium',
                extract: 'Standards.',
                fullurl: 'https://en.wikipedia.org/wiki/World_Wide_Web_Consortium',
                extlinks: [{ '*': 'https://www.w3.org/' }],
              },
            },
          },
        };
      },
    },
  );
  ok('opensearch retried once', calls === 2, `calls=${calls}`);
  ok('retry then ok', r.reason === 'ok', r.reason);
  ok('retry yielded finding', r.findings.length >= 1);
  ok('meta attempts=2', (r.meta?.openSearchAttempts || r.openSearchAttempts) === 2, JSON.stringify(r.meta));
}
{
  const r = await searchGeneralWeb(
    { q: 'W3C', budgetMs: 2000, locale: 'en' },
    {
      enableGeneralWebSearch: true,
      fetchJson: async (url) => {
        if (String(url).includes('action=opensearch')) {
          const e = new Error('HTTP 500');
          e.status = 500;
          throw e;
        }
        return { query: { pages: {} } };
      },
    },
  );
  ok('persistent 5xx → opensearch_error', r.reason === 'opensearch_error', r.reason);
  ok('error has message', typeof r.message === 'string' && r.message.length > 0, r.message);
  ok('error has errorCode', r.errorCode === 'http_500', r.errorCode);
  ok('error partial', r.partial === true);
  ok('error empty findings', r.findings.length === 0);
  ok('attempts=2 on fail', (r.openSearchAttempts || r.meta?.openSearchAttempts) === 2, String(r.openSearchAttempts));
}
{
  ok(
    '4xx not transient',
    isTransientOpenSearchFailure({ status: 404, message: 'HTTP 404' }, undefined, undefined, null) === false,
  );
  ok(
    '5xx is transient',
    isTransientOpenSearchFailure({ status: 503, message: 'HTTP 503' }, undefined, undefined, null) === true,
  );
  const parent = new AbortController();
  parent.abort();
  ok(
    'parent abort not transient',
    isTransientOpenSearchFailure(
      { name: 'AbortError', message: 'aborted' },
      undefined,
      parent.signal,
      'cancelled',
    ) === false,
  );
}

restoreEnv();
console.log(`\ngeneralWebSearch.test.mjs ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
